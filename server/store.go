package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"time"

	_ "modernc.org/sqlite"
)

type Store struct{ db *sql.DB }

func OpenStore(path string) (*Store, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	db, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1) // sqlite: tulis serial
	s := &Store{db: db}
	if err := s.migrate(); err != nil {
		return nil, err
	}
	if err := s.seed(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *Store) migrate() error {
	schema := `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  email TEXT, name TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT,
  image TEXT,
  description TEXT,
  warranty_days INTEGER DEFAULT 0,
  input_fields TEXT NOT NULL DEFAULT '[]'
);
CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id),
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  sell_price REAL NOT NULL,
  promo_price REAL DEFAULT 0,
  display_price REAL DEFAULT 0,
  cost_price REAL DEFAULT 0,
  stock INTEGER DEFAULT 0,
  region TEXT DEFAULT 'id',
  subcategory TEXT DEFAULT '',
  status TEXT DEFAULT 'active'
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice TEXT UNIQUE NOT NULL,
  user_id INTEGER,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  customer_input TEXT NOT NULL DEFAULT '{}',
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  provider_ref TEXT,
  sn TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  invoice TEXT NOT NULL,
  method TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  va_number TEXT,
  qr_text TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ai_keys (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  balance REAL DEFAULT 0,
  plan TEXT DEFAULT 'metered',
  rpm INTEGER DEFAULT 60,
  expires_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS otp_codes (
  phone TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  purpose TEXT NOT NULL
);
`
	_, err := s.db.Exec(schema)
	return err
}

func (s *Store) seed() error {
	var n int
	if err := s.db.QueryRow(`SELECT COUNT(*) FROM products`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	now := time.Now().UTC().Format(time.RFC3339)

	// Seed data: contoh produk (tanpa cost_price asli di frontend; di sini internal)
	seedProducts := []struct {
		slug, name, cat, brand, desc string
		warranty                     int
		fields                       []InputField
		variants                     []Variant
	}{
		{
			slug: "mobile-legends", name: "Mobile Legends", cat: "game_topup", brand: "Moonton",
			desc: "Top up Diamond Mobile Legends murah & instan", warranty: 0,
			fields: []InputField{
				{Key: "userId", Type: "number", Label: "User ID", Placeholder: "Masukkan User ID", Pattern: `^\d{5,12}$`, Required: true},
				{Key: "zoneId", Type: "number", Label: "Zone ID", Placeholder: "Masukkan Zone ID", Pattern: `^\d{4,5}$`, Required: true},
			},
			variants: []Variant{
				{SKU: "ml3", Name: "3 Diamond", SellPrice: 788, DisplayPrice: 2000, CostPrice: 650},
				{SKU: "ml5", Name: "5 Diamond", SellPrice: 1444, DisplayPrice: 2500, CostPrice: 1200},
				{SKU: "ml12", Name: "12 Diamond", SellPrice: 3571, DisplayPrice: 4500, CostPrice: 3100},
				{SKU: "ml86", Name: "86 Diamond", SellPrice: 20318, DisplayPrice: 25500, CostPrice: 18500},
				{SKU: "ml100", Name: "100 Diamond", SellPrice: 21000, DisplayPrice: 29000, CostPrice: 19500},
				{SKU: "ml500", Name: "500 Diamond", SellPrice: 105000, DisplayPrice: 145000, CostPrice: 97500},
			},
		},
		{
			slug: "pulsa-telkomsel", name: "Pulsa Telkomsel", cat: "ppob", brand: "Telkomsel",
			desc: "Isi ulang pulsa Telkomsel semua nominal", warranty: 0,
			fields: []InputField{
				{Key: "phone", Type: "tel", Label: "No. HP", Placeholder: "08xxxxxxxxxx", Pattern: `^08\d{8,11}$`, Required: true},
			},
			variants: []Variant{
				{SKU: "tsel5", Name: "Pulsa 5.000", SellPrice: 5300, DisplayPrice: 6000, CostPrice: 5100},
				{SKU: "tsel10", Name: "Pulsa 10.000", SellPrice: 10400, DisplayPrice: 11500, CostPrice: 10050},
				{SKU: "tsel25", Name: "Pulsa 25.000", SellPrice: 25000, DisplayPrice: 27000, CostPrice: 24400},
				{SKU: "tsel50", Name: "Pulsa 50.000", SellPrice: 49800, DisplayPrice: 53000, CostPrice: 48800},
			},
		},
		{
			slug: "token-pln", name: "Token PLN", cat: "ppob", brand: "PLN",
			desc: "Token listrik PLN prabayar", warranty: 0,
			fields: []InputField{
				{Key: "meterId", Type: "text", Label: "Nomor Meter", Placeholder: "Contoh: 123456789012", Pattern: `^\d{11,12}$`, Required: true},
			},
			variants: []Variant{
				{SKU: "pln20", Name: "Token 20.000", SellPrice: 21400, DisplayPrice: 22000, CostPrice: 20900},
				{SKU: "pln50", Name: "Token 50.000", SellPrice: 51600, DisplayPrice: 53000, CostPrice: 50800},
				{SKU: "pln100", Name: "Token 100.000", SellPrice: 101800, DisplayPrice: 105000, CostPrice: 100300},
			},
		},
		{
			slug: "netflix-premium", name: "Netflix Premium", cat: "digital", brand: "Netflix",
			desc: "Akun Netflix premium 4K, garansi 30 hari", warranty: 30,
			fields: []InputField{
				{Key: "email", Type: "email", Label: "Email", Placeholder: "email untuk kirim akun", Required: true},
			},
			variants: []Variant{
				{SKU: "nf1m", Name: "1 Bulan (Sharing)", SellPrice: 22000, DisplayPrice: 45000, CostPrice: 12000, Stock: 5},
				{SKU: "nf1m-private", Name: "1 Bulan (Private)", SellPrice: 55000, DisplayPrice: 98000, CostPrice: 38000, Stock: 2},
			},
		},
		{
			slug: "chatgpt-plus", name: "ChatGPT Plus", cat: "digital", brand: "OpenAI",
			desc: "Akun ChatGPT Plus, garansi 7 hari", warranty: 7,
			fields: []InputField{
				{Key: "email", Type: "email", Label: "Email", Placeholder: "email untuk kirim akun", Required: true},
			},
			variants: []Variant{
				{SKU: "gptplus", Name: "ChatGPT Plus 1 Bulan", SellPrice: 25000, DisplayPrice: 40000, CostPrice: 15000, Stock: 3},
			},
		},
		{
			slug: "ai-api-deepseek", name: "DeepSeek API (Bebas Token)", cat: "ai", brand: "DeepSeek",
			desc: "Plan Bebas Token DeepSeek V4 — akses waktu, token tidak dibatasi", warranty: 7,
			fields: []InputField{},
			variants: []Variant{
				{SKU: "ds7", Name: "DeepSeek Plan 7 Hari", SellPrice: 10000, DisplayPrice: 25000, CostPrice: 4000, Stock: 3},
				{SKU: "ds30", Name: "DeepSeek Plan 30 Hari", SellPrice: 25000, DisplayPrice: 60000, CostPrice: 12000, Stock: 2},
			},
		},
	}

	for _, p := range seedProducts {
		fieldsJSON, _ := json.Marshal(p.fields)
		res, err := s.db.Exec(`INSERT INTO products (slug,name,category,brand,image,description,warranty_days,input_fields) VALUES (?,?,?,?,?,?,?,?)`,
			p.slug, p.name, p.cat, p.brand, "", p.desc, p.warranty, string(fieldsJSON))
		if err != nil {
			return err
		}
		pid, _ := res.LastInsertId()
		for i := range p.variants {
			v := p.variants[i]
			sold := (i*7 + 3) % 40
			if _, err := s.db.Exec(`INSERT INTO variants (product_id,sku,name,sell_price,promo_price,display_price,cost_price,stock,region,subcategory,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
				pid, v.SKU, v.Name, v.SellPrice, v.PromoPrice, v.DisplayPrice, v.CostPrice, v.Stock, "id", "", "active"); err != nil {
				return err
			}
			_ = sold
		}
	}

	// Admin user demo + AI key contoh
	if _, err := s.db.Exec(`INSERT INTO users (phone,email,name,created_at) VALUES ('081234567890','demo@geraikita.test','Demo User',?)`, now); err != nil {
		return err
	}
	if _, err := s.db.Exec(`INSERT INTO ai_keys (key,user_id,balance,plan,rpm,created_at) VALUES (?,1,100000,'metered',60,?)`,
		"gk-demo-00000000000000000000003e", now); err != nil {
		return err
	}
	log.Println("seed: produk, user demo, ai key demo dibuat")
	return nil
}

func nowRFC() string { return time.Now().UTC().Format(time.RFC3339) }

func (s *Store) ListProducts() ([]Product, error) {
	rows, err := s.db.Query(`SELECT id,slug,name,category,brand,image,description,warranty_days,input_fields FROM products ORDER BY id`)
	if err != nil {
		return nil, err
	}
	type pr struct {
		p      Product
		fields string
	}
	var list []pr
	for rows.Next() {
		var r pr
		if err := rows.Scan(&r.p.ID, &r.p.Slug, &r.p.Name, &r.p.Category, &r.p.Brand, &r.p.Image, &r.p.Description, &r.p.WarrantyDays, &r.fields); err != nil {
			rows.Close()
			return nil, err
		}
		_ = json.Unmarshal([]byte(r.fields), &r.p.InputFields)
		list = append(list, r)
	}
	rows.Close() // wajib: bebaskan koneksi sebelum query baru (SetMaxOpenConns(1))
	if err := rows.Err(); err != nil {
		return nil, err
	}
	var out []Product
	for _, r := range list {
		p := r.p
		vs, err := s.VariantsFor(p.ID)
		if err != nil {
			return nil, err
		}
		p.Variants = vs
		for _, v := range vs {
			if p.MinPrice == 0 || v.SellPrice < p.MinPrice {
				p.MinPrice = v.SellPrice
			}
		}
		out = append(out, p)
	}
	return out, nil
}

func (s *Store) GetProductByID(id int64) (*Product, error) {
	var p Product
	var fields string
	err := s.db.QueryRow(`SELECT id,slug,name,category,brand,image,description,warranty_days,input_fields FROM products WHERE id=?`, id).
		Scan(&p.ID, &p.Slug, &p.Name, &p.Category, &p.Brand, &p.Image, &p.Description, &p.WarrantyDays, &fields)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal([]byte(fields), &p.InputFields)
	vs, err := s.VariantsFor(p.ID)
	if err != nil {
		return nil, err
	}
	p.Variants = vs
	return &p, nil
}

func (s *Store) GetProductBySlug(slug string) (*Product, error) {
	var p Product
	var fields string
	err := s.db.QueryRow(`SELECT id,slug,name,category,brand,image,description,warranty_days,input_fields FROM products WHERE slug=?`, slug).
		Scan(&p.ID, &p.Slug, &p.Name, &p.Category, &p.Brand, &p.Image, &p.Description, &p.WarrantyDays, &fields)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal([]byte(fields), &p.InputFields)
	vs, err := s.VariantsFor(p.ID)
	if err != nil {
		return nil, err
	}
	p.Variants = vs
	return &p, nil
}

func (s *Store) VariantsFor(productID int64) ([]Variant, error) {
	rows, err := s.db.Query(`SELECT id,product_id,sku,name,sell_price,promo_price,display_price,stock,region,subcategory,status FROM variants WHERE product_id=? AND status='active' ORDER BY sell_price`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Variant
	for rows.Next() {
		var v Variant
		if err := rows.Scan(&v.ID, &v.ProductID, &v.SKU, &v.Name, &v.SellPrice, &v.PromoPrice, &v.DisplayPrice, &v.Stock, &v.Region, &v.Subcategory, &v.Status); err != nil {
			return nil, err
		}
		v.SoldCount = 0
		out = append(out, v)
	}
	return out, rows.Err()
}

func (s *Store) GetVariant(id int64) (*Variant, error) {
	var v Variant
	err := s.db.QueryRow(`SELECT id,product_id,sku,name,sell_price,promo_price,display_price,cost_price,stock,region,subcategory,status FROM variants WHERE id=?`, id).
		Scan(&v.ID, &v.ProductID, &v.SKU, &v.Name, &v.SellPrice, &v.PromoPrice, &v.DisplayPrice, &v.CostPrice, &v.Stock, &v.Region, &v.Subcategory, &v.Status)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

func (s *Store) CreateOrder(o *Order) error {
	res, err := s.db.Exec(`INSERT INTO orders (invoice,user_id,product_id,product_name,variant_name,customer_input,amount,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
		o.Invoice, o.UserID, o.ProductID, o.ProductName, o.VariantName, encodeJSON(o.CustomerInput), o.Amount, o.Status, o.CreatedAt, o.UpdatedAt)
	if err != nil {
		return err
	}
	o.ID, _ = res.LastInsertId()
	return nil
}

func (s *Store) GetOrderByInvoice(inv string) (*Order, error) {
	var o Order
	var input string
	err := s.db.QueryRow(`SELECT id,invoice,user_id,product_id,product_name,variant_name,customer_input,amount,status,COALESCE(provider_ref,''),COALESCE(sn,''),created_at,updated_at FROM orders WHERE invoice=?`, inv).
		Scan(&o.ID, &o.Invoice, &o.UserID, &o.ProductID, &o.ProductName, &o.VariantName, &input, &o.Amount, &o.Status, &o.ProviderRef, &o.SN, &o.CreatedAt, &o.UpdatedAt)
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal([]byte(input), &o.CustomerInput)
	return &o, nil
}

func (s *Store) UpdateOrderStatus(inv, status, sn string) error {
	_, err := s.db.Exec(`UPDATE orders SET status=?, sn=?, updated_at=? WHERE invoice=?`, status, sn, nowRFC(), inv)
	return err
}

func (s *Store) CreatePayment(p *Payment) error {
	res, err := s.db.Exec(`INSERT INTO payments (order_id,invoice,method,amount,status,va_number,qr_text,created_at) VALUES (?,?,?,?,?,?,?,?)`,
		p.OrderID, p.Invoice, p.Method, p.Amount, p.Status, p.VANumber, p.QRText, p.CreatedAt)
	if err != nil {
		return err
	}
	p.ID, _ = res.LastInsertId()
	return nil
}

func (s *Store) GetPendingPayments() ([]Payment, error) {
	rows, err := s.db.Query(`SELECT id,order_id,invoice,method,amount,status,va_number,qr_text,created_at FROM payments WHERE status='pending'`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Payment
	for rows.Next() {
		var p Payment
		if err := rows.Scan(&p.ID, &p.OrderID, &p.Invoice, &p.Method, &p.Amount, &p.Status, &p.VANumber, &p.QRText, &p.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

func (s *Store) MarkPaymentPaid(paymentID int64) error {
	_, err := s.db.Exec(`UPDATE payments SET status='paid' WHERE id=?`, paymentID)
	return err
}

func (s *Store) GetUserByPhone(phone string) (*User, error) {
	var u User
	err := s.db.QueryRow(`SELECT id,phone,email,name,created_at FROM users WHERE phone=?`, phone).Scan(&u.ID, &u.Phone, &u.Email, &u.Name, &u.CreatedAt)
	return &u, err
}

func (s *Store) CreateUser(phone string) (*User, error) {
	now := nowRFC()
	res, err := s.db.Exec(`INSERT INTO users (phone,created_at) VALUES (?,?)`, phone, now)
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return &User{ID: id, Phone: phone, CreatedAt: now}, nil
}

func (s *Store) SaveOTP(phone, code string, ttl time.Duration) error {
	exp := time.Now().Add(ttl).Format(time.RFC3339)
	_, err := s.db.Exec(`INSERT INTO otp_codes (phone,code,expires_at,purpose) VALUES (?,?,?,?) ON CONFLICT(phone) DO UPDATE SET code=excluded.code, expires_at=excluded.expires_at, purpose=excluded.purpose`,
		phone, code, exp, "login")
	return err
}

func (s *Store) VerifyOTP(phone, code string) (bool, error) {
	var exp string
	var stored string
	err := s.db.QueryRow(`SELECT code,expires_at FROM otp_codes WHERE phone=? AND purpose='login'`, phone).Scan(&stored, &exp)
	if err != nil {
		return false, nil
	}
	t, err := time.Parse(time.RFC3339, exp)
	if err != nil || time.Now().After(t) {
		return false, nil
	}
	return stored == code, nil
}

func (s *Store) CreateAIKey(userID int64, plan string, days int, balance float64) (*AIKey, error) {
	k := "gk-" + randHex(16) + "03e"
	exp := ""
	if days > 0 {
		exp = time.Now().AddDate(0, 0, days).Format(time.RFC3339)
	}
	res, err := s.db.Exec(`INSERT INTO ai_keys (key,user_id,balance,plan,rpm,expires_at,created_at) VALUES (?,?,?,?,60,?,?)`,
		k, userID, balance, plan, exp, nowRFC())
	if err != nil {
		return nil, err
	}
	id, _ := res.LastInsertId()
	return &AIKey{ID: id, Key: k, UserID: userID, Balance: balance, Plan: plan, RPM: 60, ExpiresAt: exp, CreatedAt: nowRFC()}, nil
}

func (s *Store) GetAIKeyByKey(k string) (*AIKey, error) {
	var a AIKey
	err := s.db.QueryRow(`SELECT id,key,user_id,balance,plan,rpm,COALESCE(expires_at,''),created_at FROM ai_keys WHERE key=?`, k).Scan(&a.ID, &a.Key, &a.UserID, &a.Balance, &a.Plan, &a.RPM, &a.ExpiresAt, &a.CreatedAt)
	return &a, err
}

func (s *Store) DeductAIBalance(keyID int64, amount float64) error {
	_, err := s.db.Exec(`UPDATE ai_keys SET balance=balance-? WHERE id=?`, amount, keyID)
	return err
}

func encodeJSON(v any) string {
	b, _ := json.Marshal(v)
	return string(b)
}

func randHex(n int) string {
	b := make([]byte, n)
	rand.Read(b)
	return hex.EncodeToString(b)[:n]
}

var _ = fmt.Sprintf