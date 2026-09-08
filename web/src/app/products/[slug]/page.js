"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ProductDetailPage({ params }) {
  const { slug } = use(params);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [inputValues, setInputValues] = useState({});
  const [orderResult, setOrderResult] = useState(null);
  const [orderError, setOrderError] = useState("");

  // Fetch product on mount
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

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-slate-400">Memuat...</div>;
  if (!product) return <div className="mx-auto max-w-4xl px-4 py-20 text-center"><h1 className="text-2xl font-bold">Produk tidak ditemukan</h1><Link href="/products" className="mt-4 inline-block text-indigo-600">← Kembali</Link></div>;

  const handleOrder = async () => {
    setOrderError("");
    // Validate input
    for (const f of product.input_fields) {
      if (f.required && !inputValues[f.key]) {
        setOrderError(`Mohon isi ${f.label}`);
        return;
      }
    }
    if (!selected) {
      setOrderError("Pilih varian terlebih dahulu");
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variant_id: selected.id,
          input: inputValues,
          method: "qris",
        }),
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
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mb-4 text-5xl">✅</div>
        <h1 className="text-2xl font-bold">Pesanan Dibuat!</h1>
        <p className="mt-2 text-slate-500">Invoice: {orderResult.order.invoice}</p>
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left dark:border-slate-800 dark:bg-slate-900">
          <div className="flex justify-between"><span className="text-slate-500">Produk</span><span className="font-semibold">{orderResult.order.product_name}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold text-indigo-600">{formatRp(orderResult.order.amount)}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-slate-500">Metode</span><span className="font-semibold capitalize">{orderResult.payment.method}</span></div>
          <div className="mt-2 flex justify-between"><span className="text-slate-500">VA</span><span className="font-mono text-sm">{orderResult.payment.va_number}</span></div>
        </div>
        <div className="mt-6 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50 p-4 dark:border-indigo-700 dark:bg-indigo-950">
          <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">🔍 QR Code (Mock)</p>
          <p className="mt-1 text-xs text-indigo-500">Scan untuk bayar — atau klik callback simulasi:</p>
          <button
            onClick={async () => {
              await fetch("/api/payments/mock-callback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ payment_id: orderResult.payment.id }),
              });
              alert("✅ Pembayaran sukses (mock)! Order akan diproses.");
            }}
            className="mt-3 rounded-xl gradient-bg px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Simulasi Bayar
          </button>
        </div>
        <Link href="/" className="mt-6 inline-block text-sm text-indigo-600">← Kembali ke Beranda</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-slate-400">
        <Link href="/" className="hover:text-indigo-500">Beranda</Link>
        <span className="mx-1">/</span>
        <Link href="/products" className="hover:text-indigo-500">Produk</Link>
        <span className="mx-1">/</span>
        <span className="text-slate-600 dark:text-slate-300">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Kiri: info produk */}
        <div className="lg:col-span-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
            {product.name.slice(0, 1)}
          </div>
          <h1 className="mt-4 text-3xl font-bold">{product.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{product.brand}</p>
          <p className="mt-3 text-slate-600 dark:text-slate-300">{product.description}</p>
          {product.warranty_days > 0 && (
            <p className="mt-3 text-sm text-emerald-600">🛡️ Garansi {product.warranty_days} hari</p>
          )}
        </div>

        {/* Kanan: pemilihan varian + input */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="font-semibold">Pilih Varian</h3>
            <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelected(v)}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    selected?.id === v.id
                      ? "bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400 dark:bg-indigo-950 dark:text-indigo-300"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium">{v.name}</span>
                  <span className="font-bold">{formatRp(v.sell_price)}</span>
                </button>
              ))}
            </div>

            {/* Input fields */}
            {product.input_fields.length > 0 && (
              <div className="mt-4 space-y-3">
                {product.input_fields.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{f.label}</label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      pattern={f.pattern}
                      value={inputValues[f.key] || ""}
                      onChange={(e) => setInputValues({ ...inputValues, [f.key]: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800 dark:focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {orderError && <p className="mt-3 text-sm text-red-500">{orderError}</p>}

            <button onClick={handleOrder} className="mt-5 w-full rounded-xl gradient-bg py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90">
              Beli Sekarang — {selected ? formatRp(selected.sell_price) : "—"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}