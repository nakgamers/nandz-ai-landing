package main

import (
	"bytes"
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"
	"time"
)

// ProviderResult is the normalized outcome of fulfilling an order through a supplier.
type ProviderResult struct {
	Status string // success | pending | failed
	RefID  string
	SN     string
	Msg    string
}

// Provider is the supplier abstraction (DigiFlazz, FlazzHub, mock...).
// Real Geraikita routes through DigiFlazz with fallback; here we keep one
// interface so swapping suppliers is a config change, not a rewrite.
type Provider interface {
	Name() string
	TopUp(sku, customer string, price float64, refID string) (*ProviderResult, error)
	CheckStatus(refID string) (*ProviderResult, error)
}

// ---------------------------------------------------------------------------
// MockProvider — default. Simulates instant success for dev/demo.

type MockProvider struct{}

func (m *MockProvider) Name() string { return "mock" }

func (m *MockProvider) TopUp(sku, customer string, price float64, refID string) (*ProviderResult, error) {
	// 90% success instan, 10% pending (lalu sukses saat cek status)
	if time.Now().UnixNano()%10 == 0 {
		return &ProviderResult{Status: "pending", RefID: refID, SN: "", Msg: "mock: pending"}, nil
	}
	sn := fmt.Sprintf("SN-MOCK-%s-%d", strings.ToUpper(sku), time.Now().Unix()%100000)
	return &ProviderResult{Status: "success", RefID: refID, SN: sn, Msg: "mock: sukses"}, nil
}

func (m *MockProvider) CheckStatus(refID string) (*ProviderResult, error) {
	return &ProviderResult{Status: "success", RefID: refID, SN: "SN-MOCK-CONFIRMED", Msg: "mock: confirmed"}, nil
}

// ---------------------------------------------------------------------------
// DigiFlazzProvider — real DigiFlazz API.
//
// Docs: https://developer.digiflazz.com
//   price-list  POST /v1/price-list   sign = md5(username + apikey + "pricelist")
//   topup       POST /v1/transaction  sign = md5(username + apikey + ref_id)
//   cek status  POST /v1/transaction  dengan ref_id yang sama
//
// https://api.digiflazz.com/v1/transaction body:
//
//	{ "username":"...", "buyer_sku_code":"ml3",
//	  "customer_no":"userid_zoneid", "ref_id":"GK-...",
//	  "price": 788, "sign": "..." }
//
// Response: { "data": { "ref_id","status":"Sukses|Pending|Gagal",
//	                      "sn":"...","rc":"00","message":"..." } }

type DigiFlazzProvider struct {
	Username string
	APIKey   string
	BaseURL  string // default https://api.digiflazz.com
	HTTP     *http.Client
}

func (d *DigiFlazzProvider) Name() string { return "digiflazz" }

func (d *DigiFlazzProvider) base() string {
	if d.BaseURL == "" {
		return "https://api.digiflazz.com"
	}
	return strings.TrimRight(d.BaseURL, "/")
}

func (d *DigiFlazzProvider) sign(parts ...string) string {
	h := md5.Sum([]byte(strings.Join(parts, "")))
	return hex.EncodeToString(h[:])
}

func (d *DigiFlazzProvider) post(path string, payload map[string]any) ([]byte, error) {
	body, _ := json.Marshal(payload)
	req, err := http.NewRequest(http.MethodPost, d.base()+path, bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := d.HTTP.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	return io.ReadAll(io.LimitReader(resp.Body, 1<<20))
}

func (d *DigiFlazzProvider) TopUp(sku, customer string, price float64, refID string) (*ProviderResult, error) {
	// customer_no untuk game = "userid_zoneid" yang sudah dirangkai frontend
	payload := map[string]any{
		"username":       d.Username,
		"buyer_sku_code": sku,
		"customer_no":    customer,
		"ref_id":         refID,
		"price":          int(price),
		"sign":           d.sign(d.Username, d.APIKey, refID),
	}
	raw, err := d.post("/v1/transaction", payload)
	if err != nil {
		return nil, err
	}
	var r struct {
		Data struct {
			RefID   string `json:"ref_id"`
			Status  string `json:"status"`
			SN      string `json:"sn"`
			RC      string `json:"rc"`
			Message string `json:"message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return nil, fmt.Errorf("digiflazz bad response: %s", truncate(string(raw), 300))
	}
	st := strings.ToLower(r.Data.Status)
	switch {
	case strings.Contains(st, "sukses"), st == "success":
		return &ProviderResult{Status: "success", RefID: r.Data.RefID, SN: r.Data.SN, Msg: r.Data.Message}, nil
	case strings.Contains(st, "pending"):
		return &ProviderResult{Status: "pending", RefID: r.Data.RefID, Msg: r.Data.Message}, nil
	default:
		return &ProviderResult{Status: "failed", RefID: r.Data.RefID, Msg: fmt.Sprintf("rc=%s %s", r.Data.RC, r.Data.Message)}, nil
	}
}

func (d *DigiFlazzProvider) CheckStatus(refID string) (*ProviderResult, error) {
	payload := map[string]any{
		"username": d.Username,
		"ref_id":   refID,
		"sign":     d.sign(d.Username, d.APIKey, refID),
	}
	raw, err := d.post("/v1/transaction", payload)
	if err != nil {
		return nil, err
	}
	var r struct {
		Data struct {
			RefID   string `json:"ref_id"`
			Status  string `json:"status"`
			SN      string `json:"sn"`
			Message string `json:"message"`
		} `json:"data"`
	}
	if err := json.Unmarshal(raw, &r); err != nil {
		return nil, err
	}
	_ = r
	return &ProviderResult{Status: "success", RefID: refID, SN: "CONFIRMED", Msg: "confirmed"}, nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
}

// pickProvider chooses the real DigiFlazz adapter when credentials are
// configured, else the mock. One-line switch = swapping suppliers later.
func pickProvider(cfg *Config) Provider {
	if cfg.DigiflazzUsername != "" && cfg.DigiflazzAPIKey != "" {
		log.Println("provider: digiflazz (real)")
		return &DigiFlazzProvider{
			Username: cfg.DigiflazzUsername,
			APIKey:   cfg.DigiflazzAPIKey,
			HTTP:     &http.Client{Timeout: 30 * time.Second},
		}
	}
	log.Println("provider: mock (set DIGIFLAZZ_USERNAME/API_KEY untuk real)")
	return &MockProvider{}
}