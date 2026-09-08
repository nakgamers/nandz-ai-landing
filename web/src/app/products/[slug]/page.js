"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { productImage } from "../../lib/images";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function ProductImg({ slug, name, className }) {
  const src = productImage(slug);
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-xl bg-[#EEF2FF] font-bold text-[#4F46E5] dark:bg-indigo-950 dark:text-indigo-300 ${className || ""}`}>
        {name.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={name} className={className} loading="lazy" />;
}

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

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-24 text-center text-[#64748B] dark:text-slate-400">Memuat...</div>;
  if (!product) return (
    <div className="mx-auto max-w-4xl px-4 py-24 text-center">
      <div className="mb-4 text-4xl">😕</div>
      <h1 className="text-2xl font-bold text-[#0F172A] dark:text-slate-50">Produk tidak ditemukan</h1>
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
        <p className="mt-2 text-[#475569] dark:text-slate-300">Invoice: <span className="font-mono font-semibold text-[#4F46E5]">{orderResult.order.invoice}</span></p>
        <div className="card mt-6 p-6 text-left">
          <div className="space-y-3 text-sm">
            {[
              ["Produk", orderResult.order.product_name],
              ["Varian", orderResult.order.variant_name],
              ["Total", formatRp(orderResult.order.amount)],
              ["Metode", orderResult.payment.method?.toUpperCase()],
              ["VA Number", orderResult.payment.va_number],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-[#64748B] dark:text-slate-400">{k}</span><span className="font-semibold text-[#0F172A] dark:text-slate-50">{v}</span></div>
            ))}
          </div>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-[#E0E7FF] bg-[#F5F3FF] p-5 dark:border-indigo-800 dark:bg-indigo-950">
          <p className="text-sm font-semibold text-[#4F46E5]">🔍 Simulasi Pembayaran</p>
          <p className="mt-1 text-xs text-[#4F46E5] dark:text-indigo-300">Klik untuk simulasi bayar (mock)</p>
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
      <nav className="mb-8 text-sm text-[#64748B] dark:text-slate-400">
        <Link href="/" className="hover:text-[#4F46E5]">Beranda</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-[#4F46E5]">Produk</Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-[#0F172A] dark:text-slate-50">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            <ProductImg slug={product.slug} name={product.name} className="h-16 w-16 rounded-xl object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F172A] dark:text-slate-50">{product.name}</h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-slate-400">{product.brand}</p>
          <p className="mt-3 leading-relaxed text-[#475569] dark:text-slate-300">{product.description}</p>
          {product.warranty_days > 0 && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-[#ECFDF5] px-3 py-1.5 text-sm font-medium text-[#059669] dark:bg-emerald-950 dark:text-emerald-300">
              <span>🛡️</span> Garansi {product.warranty_days} hari
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="card p-6">
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-50">Pilih Varian</h3>
            <div className="mt-3 max-h-72 space-y-1 overflow-y-auto">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm transition-all ${
                    selected?.id === v.id
                      ? "bg-gradient-to-r from-[#F5F3FF] to-[#EDE9FE] text-[#4F46E5] ring-2 ring-[#6366F1] dark:from-indigo-950 dark:to-indigo-900 dark:text-indigo-300"
                      : "text-[#334155] hover:bg-[#FAFAFA] dark:text-slate-300 dark:hover:bg-slate-800"
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