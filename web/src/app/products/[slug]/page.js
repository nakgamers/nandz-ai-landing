"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const brandLogo = {
  "mobile-legends": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/mobilelegends.svg",
  "free-fire": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/garena.svg",
  "spotify-premium": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/spotify.svg",
  "chatgpt-plus": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg",
  "netflix-premium": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/netflix.svg",
  "capcut-pro": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/capcut.svg",
  "youtube-premium": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/youtube.svg",
  "canva-pro": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/canva.svg",
  "disney-hotstar": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/disneyplus.svg",
  "vidio-platinum": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/vidio.svg",
  "genshin-impact": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/genshinimpact.svg",
  "pubg-mobile": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/pubg.svg",
  "valorant": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/valorant.svg",
  "pulsa-telkomsel": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/telkomsel.svg",
  "pulsa-xl": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/xlaxiata.svg",
  "pulsa-axis": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/axis.svg",
  "data-telkomsel": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/telkomsel.svg",
  "token-pln": "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/pln.svg",
  "ai-api-deepseek": "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/deepseek-color.svg",
  "ai-api-qwen": "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/qwen-color.svg",
};

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setProduct(d);
        setLoading(false);
        if (d?.variants?.length > 0) setSelected(d.variants[0]);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-[#94A3B8]">Memuat...</div>;
  if (!product) return (
    <div className="mx-auto max-w-4xl px-4 py-24 text-center">
      <div className="mb-4 text-4xl">😕</div>
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Produk tidak ditemukan</h1>
      <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-[#4F46E5] hover:underline">← Kembali ke Produk</Link>
    </div>
  );

  const handleOrder = async () => {
    setOrderError("");
    for (const f of product.input_fields) {
      if (f.required && !inputValues[f.key]) {
        setOrderError(`Mohon isi ${f.label}`);
        return;
      }
    }
    if (!selected) { setOrderError("Pilih varian terlebih dahulu"); return; }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant_id: selected.id, input: inputValues, method: "qris" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setOrderResult(data);
    } catch (e) {
      setOrderError(e.message);
    }
  };

  if (orderResult) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">Pesanan Dibuat!</h1>
        <p className="mt-2 text-[#475569]">Invoice: <span className="font-mono font-semibold text-[#4F46E5]">{orderResult.order.invoice}</span></p>
        <div className="card mt-6 p-6 text-left">
          <div className="space-y-3 text-sm">
            {[
              ["Produk", orderResult.order.product_name],
              ["Varian", orderResult.order.variant_name],
              ["Total", formatRp(orderResult.order.amount)],
              ["Metode", orderResult.payment.method?.toUpperCase()],
              ["VA Number", orderResult.payment.va_number],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-[#64748B]">{k}</span><span className="font-semibold text-[#0F172A] dark:text-white">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-[#E0E7FF] bg-[#F5F3FF] p-5 dark:border-indigo-800 dark:bg-indigo-950">
          <p className="text-sm font-semibold text-[#4F46E5]">🔍 Simulasi Pembayaran</p>
          <p className="mt-1 text-xs text-[#818CF8]">Klik untuk simulasi bayar (mock)</p>
          <button
            onClick={async () => {
              await fetch("/api/payments/mock-callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_id: orderResult.payment.id }),
              });
              alert("✅ Pembayaran sukses! Order sedang diproses.");
            }}
            className="btn-primary mt-4 w-full"
          >
            Simulasi Bayar
          </button>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-[#4F46E5] hover:underline">← Kembali</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 text-sm text-[#64748B]">
        <Link href="/" className="hover:text-[#4F46E5]">Beranda</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[#4F46E5]">Produk</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[#0F172A] dark:text-white">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            {brandLogo[product.slug] ? (
              <img src={brandLogo[product.slug]} alt="" className="h-10 w-10 rounded-lg object-contain p-0.5 dark:brightness-200 dark:invert" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-lg font-bold text-[#4F46E5] dark:from-indigo-950 dark:to-indigo-800">
                {product.name.slice(0, 1)}
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white">{product.name}</h1>
          <p className="mt-1 text-sm text-[#64748B]">{product.brand}</p>
          <p className="mt-3 leading-relaxed text-[#475569] dark:text-slate-300">{product.description}</p>
          {product.warranty_days > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-sm font-medium text-[#059669]">
              <span>🛡️</span> Garansi {product.warranty_days} hari
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-white">Pilih Varian</h3>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition-all ${
                    selected?.id === v.id
                      ? "bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] text-[#4F46E5] ring-2 ring-[#6366F1] dark:from-indigo-950 dark:to-indigo-900 dark:text-indigo-300"
                      : "hover:bg-[#FAFAFA] dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium">{v.name}</span>
                  <span className="font-bold">{formatRp(v.sell_price)}</span>
                </button>
              ))}
            </div>

            {product.input_fields.length > 0 && (
              <div className="mt-5 space-y-3">
                {product.input_fields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1.5 block text-xs font-semibold text-[#334155] dark:text-slate-300">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      pattern={f.pattern}
                      value={inputValues[f.key] || ""}
                      onChange={(e) => setInputValues({ ...inputValues, [f.key]: e.target.value })}
                      className="input"
                    />
                  </div>
                ))}
              </div>
            )}

            {orderError && <p className="mt-3 text-sm text-red-500">{orderError}</p>}

            <button onClick={handleOrder} className="btn-primary mt-5 w-full text-sm">
              Beli Sekarang — {selected ? formatRp(selected.sell_price) : "—"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}