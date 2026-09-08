package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// Model catalog: harga jual per 1M token + cost internal (margin = selisih).
// Ini replika model bisnis Geraikita: beli murah di provider, jual per token.
var aiModels = []AIModel{
	{ID: "gk/claude-sonnet-5", Provider: "anthropic", Name: "Claude Sonnet 5", InputPrice: 2.5, OutputPrice: 12.5, CostIn: 2.0, CostOut: 10.0},
	{ID: "gk/claude-haiku-5", Provider: "anthropic", Name: "Claude Haiku 5", InputPrice: 1.2, OutputPrice: 6.0, CostIn: 1.0, CostOut: 5.0},
	{ID: "gk/gpt-5.6-terra", Provider: "openai", Name: "GPT 5.6 Terra", InputPrice: 2.5, OutputPrice: 15.0, CostIn: 2.0, CostOut: 12.0},
	{ID: "gk/gpt-5.6-luna", Provider: "openai", Name: "GPT 5.6 Luna", InputPrice: 1.0, OutputPrice: 6.0, CostIn: 0.6, CostOut: 4.0},
	{ID: "gk/deepseek-v4", Provider: "openai", Name: "DeepSeek V4", InputPrice: 0.5, OutputPrice: 1.0, CostIn: 0.28, CostOut: 0.42},
	{ID: "gk/qwen-max", Provider: "openai", Name: "Qwen Max", InputPrice: 0.7, OutputPrice: 1.8, CostIn: 0.5, CostOut: 1.2},
	{ID: "gk/glm-5.2", Provider: "openai", Name: "GLM 5.2", InputPrice: 0.9, OutputPrice: 2.0, CostIn: 0.6, CostOut: 1.4},
}

func modelByID(id string) *AIModel {
	for i := range aiModels {
		if aiModels[i].ID == id {
			return &aiModels[i]
		}
	}
	return nil
}

// handleAIModels — GET /api/v1/ai/models
func (s *Server) handleAIModels(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]any{"models": aiModels})
}

// handleAIProxy — satu endpoint untuk semua provider AI.
// Kompatibel format OpenAI (/chat/completions) & Anthropic (/v1/messages).
// Alur: cek API key gk-* → validasi saldo/plan → forward ke upstream → hitung token → debit saldo.
func (s *Server) handleAIProxy(w http.ResponseWriter, r *http.Request) {
	// 1. Auth: Bearer gk-...
	auth := strings.TrimPrefix(r.Header.Get("Authorization"), "Bearer ")
	if auth == "" {
		writeErr(w, 401, "missing api key")
		return
	}
	key, err := s.store.GetAIKeyByKey(auth)
	if err != nil || key == nil {
		log.Printf("ai key invalid: %q err=%v", auth, err)
		writeErr(w, 401, "invalid api key")
		return
	}

	// 2. Plan "bebas token" = dibatasi waktu + RPM, bukan saldo.
	if key.Plan != "metered" && key.ExpiresAt != "" {
		exp, err := time.Parse(time.RFC3339, key.ExpiresAt)
		if err == nil && time.Now().After(exp) {
			writeErr(w, 403, "plan expired")
			return
		}
	}
	// RPM sederhana (ponytail: map in-memory per key, upgrade ke limiter nyata saat perlu)
	if !s.aiRateLimit(auth) {
		writeErr(w, 429, "rate limit exceeded")
		return
	}

	// 3. Baca request & deteksi model
	body, _ := io.ReadAll(io.LimitReader(r.Body, 2<<20))
	var req map[string]any
	if err := json.Unmarshal(body, &req); err != nil {
		writeErr(w, 400, "invalid json")
		return
	}
	modelID, _ := req["model"].(string)
	model := modelByID(modelID)
	if model == nil {
		writeErr(w, 400, fmt.Sprintf("unknown model %q", modelID))
		return
	}

	// 4. Mode MOCK (tanpa upstream key): gema echo supaya bisa demo end-to-end.
	if s.cfg.AIAPIKey == "" {
		usage := estimateTokens(body)
		cost := (usage["input"]/1e6)*model.InputPrice + (usage["output"]/1e6)*model.OutputPrice
		s.debitAI(key, cost)
		writeJSON(w, 200, map[string]any{
			"id": "gk-mock-" + randHex(8), "object": "chat.completion", "model": modelID,
			"choices": []map[string]any{{
				"index": 0, "message": map[string]any{"role": "assistant", "content": fmt.Sprintf(
					"[MOCK %s] Halo! Ini respons percobaan. Saldo tersisa: Rp %.0f", model.Name, key.Balance)},
				"finish_reason": "stop"}},
			"usage": map[string]any{"prompt_tokens": usage["input"], "completion_tokens": usage["output"], "total_tokens": usage["input"] + usage["output"]},
		})
		return
	}

	// 5. Forward ke upstream sesuai provider
	upstream, path := s.upstreamFor(model.Provider)
	proxyReq, err := http.NewRequest(r.Method, upstream+path, bytes.NewReader(body))
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	proxyReq.Header.Set("Authorization", "Bearer "+s.cfg.AIAPIKey)
	proxyReq.Header.Set("Content-Type", "application/json")
	// OpenAI & Anthropic keduanya menerima model plain (tanpa prefix gk/), biarkan apa adanya.
	resp, err := s.aiHTTP.Do(proxyReq)
	if err != nil {
		writeErr(w, 502, "upstream error: "+err.Error())
		return
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(io.LimitReader(resp.Body, 4<<20))
	// Salin header penting
	for _, h := range []string{"Content-Type"} {
		w.Header().Set(h, resp.Header.Get(h))
	}
	w.WriteHeader(resp.StatusCode)
	w.Write(respBody)
	// Debit berdasarkan estimasi token dari response (ponytail: estimasi, upgrade ke usage resmi saat perlu)
	if resp.StatusCode == 200 {
		usage := estimateTokens(append(body, respBody...))
		cost := (usage["input"]/1e6)*model.InputPrice + (usage["output"]/1e6)*model.OutputPrice
		s.debitAI(key, cost)
	}
}

func (s *Server) upstreamFor(provider string) (string, string) {
	switch provider {
	case "anthropic":
		return strings.TrimRight(s.cfg.AIUpstreamAnthropic, "/"), "/v1/messages"
	default:
		return strings.TrimRight(s.cfg.AIUpstreamOpenAI, "/"), "/chat/completions"
	}
}

// debitAI memotong saldo; jika saldo habis, key tetap ada (bisa topup).
func (s *Server) debitAI(key *AIKey, cost float64) {
	if key.Plan != "metered" || cost <= 0 {
		return
	}
	_ = s.store.DeductAIBalance(key.ID, cost)
	key.Balance -= cost
}

func estimateTokens(b []byte) map[string]float64 {
	// ponytail: perkiraan kasar 1 token ≈ 4 char. Upgrade: parse usage dari upstream.
	in := float64(len(b)) / 4
	return map[string]float64{"input": in, "output": in / 2}
}
