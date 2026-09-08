# Geraikita Clone — PPOB + Game TopUp + AI API

Clone dari model bisnis geraikita.com (analisis mendalam): platform jual produk digital
(pulsa, token PLN, game top-up, akun premium) + layanan AI API proxy (Claude, GPT,
DeepSeek, Qwen, GLM) dengan sistem bayar-per-token.

## Stack

- **Backend**: Go 1.26 (stdlib `net/http`, mux pattern Go 1.22+), SQLite (modernc.org/sqlite, pure-Go, tanpa cgo)
- **Frontend**: Next.js 16 (App Router, Tailwind CSS 4, Turbopack)
- **Provider**: DigiFlazz (real, via env) + MockProvider (default, langsung jalan tanpa kredensial)

## Struktur

```
geraikita-clone/
├── server/          # Go backend :8080
│   ├── main.go      # entry, config, graceful shutdown
│   ├── config.go    # env config
│   ├── types.go     # model Product/Variant/Order/Payment/AIKey
│   ├── store.go     # SQLite store + seed
│   ├── provider.go  # Provider interface: DigiFlazz + Mock
│   ├── server.go    # HTTP handlers + middleware (auth HMAC, CORS, rate limit)
│   └── ai.go        # AI proxy (OpenAI & Anthropic compatible) + model catalog
└── web/             # Next.js frontend :3000
    └── src/app/
        ├── layout.js, page.js      # navbar, footer, landing
        ├── products/               # listing + detail + checkout
        ├── cek-invoice/            # cek status order
        └── ai-api/                 # demo key + tes model + docs
```

## Cara Jalan

### Backend (Go)

```bash
cd server
go run .            # atau build: go build -o server.exe .
# listening on :8080
```

Environtment opsional:

| Env | Fungsi |
|-----|--------|
| `DIGIFLAZZ_USERNAME`, `DIGIFLAZZ_API_KEY` | Aktifkan provider DigiFlazz real |
| `AI_UPSTREAM_OPENAI`, `AI_UPSTREAM_ANTHROPIC`, `AI_UPSTREAM_KEY` | Forward AI ke provider asli |
| `ADDR` (default `:8080`), `DB_PATH` (default `data.db`) | Port & lokasi DB |

Tanpa kredensial, backend pakai **MockProvider** (order langsung success, AI gema echo)
supaya seluruh flow bisa diuji end-to-end.

### Frontend (Next.js)

```bash
cd web
npm install
npm run dev         # http://localhost:3000
```

`next.config.mjs` me-rewrite `/api/*` ke `http://localhost:8080/api/*` — jadi frontend
cukup panggil `/api/...` relatif.

## Alur Order (end-to-end)

```
1. Landing → /products → pilih produk
2. /products/[slug] → pilih varian + isi data (userId/zoneId, no HP, dll)
3. POST /api/orders → buat order (invoice GK-xxxxxxxx) + payment record
4. UI tampilkan invoice + "Simulasi Bayar" (mock callback)
5. POST /api/payments/mock-callback → payment paid → order diproses provider
6. GET /api/check-invoice/GK-... → cek status (pending_payment → processing → success)
```

Di real Geraikita, langkah 4-5 diganti payment gateway (Midtrans/Xendit webhook)
dan langkah 5 memanggil DigiFlazz `topup` API. Semua udah disiapkan di `provider.go`.

## AI API (layanan kedua)

- `POST /api/v1/chat/completions` (format OpenAI) — di-frontend di-rewrite jadi `/api/v1/...`
- `POST /api/v1/messages` (format Anthropic)
- Header: `Authorization: Bearer gk-...`
- Model: prefix `gk/` (contoh `gk/claude-sonnet-5`)
- Saldo key `gk-demo-00000000000000000000003e` = Rp 100.000 (seed, metered)
- Tanpa `AI_UPSTREAM_KEY`: mock echo (untuk demo). Dengan upstream: forward + debit saldo per token

## Catatan Ponytail

- `randHex()` pakai `crypto/rand` (bukan `time.Now().UnixNano()` yang rusak di Windows)
- SQLite `SetMaxOpenConns(1)` — wajib `rows.Close()` sebelum query lanjutan (deadlock)
- `provider_ref`/`sn`/`expires_at` nullable → `COALESCE` saat Scan
- Rate limit AI: map in-memory per key, reset per menit — upgrade ke sliding window saat perlu
- Estimasi token: 1 token ≈ 4 char — upgrade parse `usage` dari upstream saat perlu

## TODO (jalan-jalan berikutnya)

- [ ] Payment gateway beneran (Midtrans/Xendit)
- [ ] Auth OTP WhatsApp (Fonnte/WATI)
- [ ] Reseller/Creator program (kode voucher + komisi)
- [ ] Multi-provider fallback routing
- [ ] Halaman admin (kelola produk, harga, stok, margin)