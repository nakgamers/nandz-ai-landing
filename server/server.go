package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"
)

// Server bundles store, provider, config, and HTTP handlers.
type Server struct {
	store   *Store
	prov    Provider
	cfg     Config
	aiHTTP  *http.Client
	rateMap map[string]int // ponytail: per-key counter, reset per menit
	rateMu  sync.Mutex
}

func NewServer(store *Store, prov Provider, cfg Config) *Server {
	return &Server{
		store:   store,
		prov:    prov,
		cfg:     cfg,
		aiHTTP:  &http.Client{Timeout: 60 * time.Second},
		rateMap: make(map[string]int),
	}
}

// Routes registers all HTTP handlers on the mux.
//
// Ponytail: Go 1.22+ mux supports method+path params natively.
// No need for chi/gin when stdlib is this capable.
func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	// Health
	mux.HandleFunc("GET /api/health", s.handleHealth)

	// Products (public)
	mux.HandleFunc("GET /api/products", s.handleProducts)
	mux.HandleFunc("GET /api/products/{slug}", s.handleProductDetail)

	// Auth (OTP-based, like Geraikita)
	mux.HandleFunc("POST /api/auth/otp/request", s.handleOTPRequest)
	mux.HandleFunc("POST /api/auth/otp/verify", s.handleOTPVerify)
	mux.HandleFunc("GET /api/auth/me", s.handleAuthMe)

	// Orders
	mux.HandleFunc("POST /api/orders", s.handleCreateOrder)
	mux.HandleFunc("GET /api/orders/{invoice}", s.handleGetOrder)

	// Payments
	mux.HandleFunc("POST /api/payments/charge", s.handleCharge)
	mux.HandleFunc("GET /api/payments/pending", s.handlePendingPayments)
	mux.HandleFunc("POST /api/payments/mock-callback", s.handleMockCallback)

	// Invoice (public)
	mux.HandleFunc("GET /api/check-invoice/{invoice}", s.handleCheckInvoice)

	// AI API
	mux.HandleFunc("GET /api/v1/ai/models", s.handleAIModels)
	mux.HandleFunc("POST /api/v1/chat/completions", s.handleAIProxy)
	mux.HandleFunc("POST /api/v1/messages", s.handleAIProxy)

	// Frontend static & SPA fallback (paling akhir)
	mux.HandleFunc("GET /", s.handleSPA)

	return s.corsMiddleware(s.logMiddleware(mux))
}

// ── Middleware ──────────────────────────────────────────────────────────────

func (s *Server) logMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lw := &logWriter{ResponseWriter: w, status: 200}
		next.ServeHTTP(lw, r)
		dur := time.Since(start).Round(time.Millisecond)
		log.Printf("%s %s %d %s", r.Method, r.URL.Path, lw.status, dur)
	})
}

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if r.Method == "OPTIONS" {
			w.WriteHeader(204)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type logWriter struct {
	http.ResponseWriter
	status int
}

func (lw *logWriter) WriteHeader(code int) { lw.status = code; lw.ResponseWriter.WriteHeader(code) }

// ── Auth helper (ponytail: HMAC-based token, no JWT library needed) ─────────

func (s *Server) signToken(userID int64, phone string) string {
	msg := fmt.Sprintf("%d:%s:%d", userID, phone, time.Now().Unix())
	mac := hmac.New(sha256.New, []byte(s.cfg.JWTSecret))
	mac.Write([]byte(msg))
	return hex.EncodeToString(mac.Sum(nil)) + ":" + msg
}

func (s *Server) verifyToken(raw string) (int64, bool) {
	parts := strings.SplitN(raw, ":", 4)
	if len(parts) < 4 {
		return 0, false
	}
	sig, userID, phone, ts := parts[0], parts[1], parts[2], parts[3]
	// Re-hitung signature
	mac := hmac.New(sha256.New, []byte(s.cfg.JWTSecret))
	mac.Write([]byte(fmt.Sprintf("%s:%s:%s", userID, phone, ts)))
	expected := hex.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(sig), []byte(expected)) {
		return 0, false
	}
	// Check expiry (30 hari)
	sec, err := parseUnix(ts)
	if err != nil || time.Now().Unix()-sec > 86400*30 {
		return 0, false
	}
	var id int64
	fmt.Sscanf(userID, "%d", &id)
	return id, true
}

func parseUnix(s string) (int64, error) {
	var n int64
	_, err := fmt.Sscanf(s, "%d", &n)
	return n, err
}

func (s *Server) getUserID(r *http.Request) int64 {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return 0
	}
	id, ok := s.verifyToken(strings.TrimPrefix(auth, "Bearer "))
	if !ok {
		return 0
	}
	return id
}

// ── Rate limit ─────────────────────────────────────────────────────────────

func (s *Server) aiRateLimit(key string) bool {
	s.rateMu.Lock()
	defer s.rateMu.Unlock()
	// Reset setiap menit (ponytail: map sederhana, upgrade ke sliding window saat perlu)
	if s.rateMap[key] > 60 {
		return false
	}
	s.rateMap[key]++
	// Reset map setiap 60 detik (ponytail: goroutine kasar, OK untuk dev)
	go func() {
		time.Sleep(60 * time.Second)
		s.rateMu.Lock()
		delete(s.rateMap, key)
		s.rateMu.Unlock()
	}()
	return true
}

// ── Handlers ───────────────────────────────────────────────────────────────

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, 200, map[string]string{"status": "ok", "service": "geraikita-gateway", "instance": "local"})
}

func (s *Server) handleProducts(w http.ResponseWriter, r *http.Request) {
	products, err := s.store.ListProducts()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"products": products})
}

func (s *Server) handleProductDetail(w http.ResponseWriter, r *http.Request) {
	slug := r.PathValue("slug")
	p, err := s.store.GetProductBySlug(slug)
	if err != nil {
		writeErr(w, 404, "product not found")
		return
	}
	writeJSON(w, 200, p)
}

// ── Auth ───────────────────────────────────────────────────────────────────

func (s *Server) handleOTPRequest(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Phone string `json:"phone"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Phone == "" {
		writeErr(w, 400, "phone is required")
		return
	}
	code := fmt.Sprintf("%06d", rand.Intn(1000000))
	// ponytail: di real app kirim via WhatsApp; di sini log saja.
	log.Printf("[OTP] %s → code=%s", body.Phone, code)
	if err := s.store.SaveOTP(body.Phone, code, 5*time.Minute); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"message": "OTP sent", "code": code}) // ponytail: expose code di dev
}

func (s *Server) handleOTPVerify(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Phone string `json:"phone"`
		Code  string `json:"code"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, 400, "invalid body")
		return
	}
	ok, err := s.store.VerifyOTP(body.Phone, body.Code)
	if err != nil || !ok {
		writeErr(w, 401, "invalid or expired code")
		return
	}
	// Get or create user
	user, err := s.store.GetUserByPhone(body.Phone)
	if err != nil {
		user, err = s.store.CreateUser(body.Phone)
		if err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	}
	token := s.signToken(user.ID, user.Phone)
	writeJSON(w, 200, map[string]any{"user": user, "token": token})
}

func (s *Server) handleAuthMe(w http.ResponseWriter, r *http.Request) {
	uid := s.getUserID(r)
	if uid == 0 {
		writeErr(w, 401, "unauthorized")
		return
	}
	writeJSON(w, 200, map[string]any{"user_id": uid})
}

// ── Orders ─────────────────────────────────────────────────────────────────

func (s *Server) handleCreateOrder(w http.ResponseWriter, r *http.Request) {
	var body struct {
		VariantID int64             `json:"variant_id"`
		Input     map[string]string `json:"input"`
		Method    string            `json:"method"` // payment method
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, 400, "invalid body")
		return
	}

	variant, err := s.store.GetVariant(body.VariantID)
	if err != nil || variant.Status != "active" {
		writeErr(w, 404, "variant not found")
		return
	}

	// Dapatkan product name
	prod, err := s.store.GetProductByID(variant.ProductID)
	if err != nil {
		writeErr(w, 500, "product missing")
		return
	}

	// Generate invoice
	inv := fmt.Sprintf("GK-%s", randHex(8))
	now := nowRFC()
	o := &Order{
		Invoice:       inv,
		ProductID:     variant.ProductID,
		ProductName:   prod.Name,
		VariantName:   variant.Name,
		CustomerInput: body.Input,
		Amount:        variant.SellPrice,
		Status:        "pending_payment",
		CreatedAt:     now,
		UpdatedAt:     now,
	}
	if err := s.store.CreateOrder(o); err != nil {
		writeErr(w, 500, err.Error())
		return
	}

	// Create payment record
	payment := &Payment{
		OrderID:   o.ID,
		Invoice:   inv,
		Method:    body.Method,
		Amount:    o.Amount,
		Status:    "pending",
		VANumber:  fmt.Sprintf("VA-%s", randHex(8)),
		QRText:    fmt.Sprintf("qr://mock/%s", inv),
		CreatedAt: now,
	}
	if err := s.store.CreatePayment(payment); err != nil {
		writeErr(w, 500, err.Error())
		return
	}

	writeJSON(w, 200, map[string]any{
		"order":   o,
		"payment": payment,
	})
}

func (s *Server) handleGetOrder(w http.ResponseWriter, r *http.Request) {
	inv := r.PathValue("invoice")
	o, err := s.store.GetOrderByInvoice(inv)
	if err != nil {
		writeErr(w, 404, "order not found")
		return
	}
	writeJSON(w, 200, o)
}

// ── Payments ───────────────────────────────────────────────────────────────

func (s *Server) handleCharge(w http.ResponseWriter, r *http.Request) {
	writeErr(w, 400, "frontend direct to payment gateway; server creates order + payment record")
}

func (s *Server) handlePendingPayments(w http.ResponseWriter, r *http.Request) {
	uid := s.getUserID(r)
	_ = uid
	payments, err := s.store.GetPendingPayments()
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]any{"payments": payments})
}

// MockCallback — simulates payment gateway callback. In real app, webhook from Midtrans/Xendit.
func (s *Server) handleMockCallback(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PaymentID int64 `json:"payment_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, 400, "invalid body")
		return
	}
	if err := s.store.MarkPaymentPaid(body.PaymentID); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	// Proses pending orders via provider
	payments, _ := s.store.GetPendingPayments()
	_ = payments
	writeJSON(w, 200, map[string]string{"status": "paid"})
}

// ── Invoice (public) ───────────────────────────────────────────────────────

func (s *Server) handleCheckInvoice(w http.ResponseWriter, r *http.Request) {
	inv := r.PathValue("invoice")
	o, err := s.store.GetOrderByInvoice(inv)
	if err != nil {
		log.Printf("check-invoice %s: %v", inv, err)
		writeErr(w, 404, "invoice not found")
		return
	}
	writeJSON(w, 200, o)
}

// ── SPA fallback ───────────────────────────────────────────────────────────

func (s *Server) handleSPA(w http.ResponseWriter, r *http.Request) {
	http.Error(w, "frontend not built", 404)
}

// ── JSON helpers ───────────────────────────────────────────────────────────

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}