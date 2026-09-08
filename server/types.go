package main

// InputField describes one form input the buyer must fill for a product
// (userId + zoneId for MLBB, phone for pulsa, meter no for PLN token...).
type InputField struct {
	Key         string `json:"key"`
	Type        string `json:"type"`
	Label       string `json:"label"`
	Placeholder string `json:"placeholder"`
	Pattern     string `json:"pattern,omitempty"`
	Required    bool   `json:"required"`
}

// Variant is one purchasable SKU of a product.
type Variant struct {
	ID           int64   `json:"id"`
	ProductID    int64   `json:"-"`
	Name         string  `json:"name"`
	SKU          string  `json:"sku"`
	SellPrice    float64 `json:"sell_price"`
	PromoPrice   float64 `json:"promo_price,omitempty"`
	DisplayPrice float64 `json:"display_price,omitempty"` // coret-coret "harga normal"
	Stock        int     `json:"stock"`                   // 0 = unlimited
	SoldCount    int     `json:"sold_count"`
	Region       string  `json:"region,omitempty"`
	Subcategory  string  `json:"subcategory,omitempty"`
	Status       string  `json:"status"`
	// CostPrice is internal (harga dari supplier). Never serialized.
	CostPrice float64 `json:"-"`
}

// Product is a brand-level item (e.g. "Mobile Legends").
type Product struct {
	ID           int64       `json:"id"`
	Slug         string      `json:"slug"`
	Name         string      `json:"name"`
	Category     string      `json:"category"` // game_topup | ppob | digital | ai
	Brand        string      `json:"brand"`
	Image        string      `json:"image"`
	Description  string      `json:"description"`
	WarrantyDays int         `json:"warranty_days"`
	InputFields  []InputField `json:"input_fields"`
	Variants     []Variant   `json:"variants,omitempty"`
	MinPrice     float64     `json:"min_price,omitempty"`
}

type Order struct {
	ID            int64             `json:"id"`
	Invoice       string            `json:"invoice"` // GK-XXXXXXXXXXXXX
	UserID        int64             `json:"user_id,omitempty"`
	ProductID     int64             `json:"product_id"`
	ProductName   string            `json:"product_name"`
	VariantName   string            `json:"variant_name"`
	CustomerInput map[string]string `json:"customer_input"`
	Amount        float64           `json:"amount"`
	Status        string            `json:"status"` // pending_payment | processing | success | failed
	ProviderRef   string            `json:"provider_ref,omitempty"`
	SN            string            `json:"sn,omitempty"` // serial number / akun
	CreatedAt     string            `json:"created_at"`
	UpdatedAt     string            `json:"updated_at"`
}

type Payment struct {
	ID        int64   `json:"id"`
	OrderID   int64   `json:"order_id"`
	Invoice   string  `json:"invoice"`
	Method    string  `json:"method"`
	Amount    float64 `json:"amount"`
	Status    string  `json:"status"` // pending | paid
	VANumber  string  `json:"va_number,omitempty"`
	QRText    string  `json:"qr_text,omitempty"`
	CreatedAt string  `json:"created_at"`
}

type User struct {
	ID        int64  `json:"id"`
	Phone     string `json:"phone"`
	Email     string `json:"email,omitempty"`
	Name      string `json:"name,omitempty"`
	CreatedAt string `json:"created_at"`
}

type AIKey struct {
	ID        int64   `json:"id"`
	Key       string  `json:"key"`
	UserID    int64   `json:"user_id"`
	Balance   float64 `json:"balance"` // rupiah saldo
	Plan      string  `json:"plan"`    // "metered" | "free_tokens:7d" ...
	RPM       int     `json:"rpm"`
	ExpiresAt string  `json:"expires_at,omitempty"`
	CreatedAt string  `json:"created_at"`
}

type AIModel struct {
	ID          string  `json:"id"`
	Provider    string  `json:"provider"`
	Name        string  `json:"name"`
	InputPrice  float64 `json:"input_price_per_1m"`  // harga jual per 1M token
	OutputPrice float64 `json:"output_price_per_1m"`
	CostIn      float64 `json:"-"` // cost internal
	CostOut     float64 `json:"-"`
}
