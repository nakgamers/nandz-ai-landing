"use client";

import { useState } from "react";
import Link from "next/link";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function CekInvoicePage() {
  const [inv, setInv] = useState("");
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const cari = async () => {
    if (!inv.trim()) return;
    setLoading(true);
    setErr("");
    setOrder(null);
    try {
      const res = await fetch(`/api/check-invoice/${inv.trim()}`);
      if (!res.ok) throw new Error("Invoice tidak ditemukan");
      const data = await res.json();
      setOrder(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) => {
    const m = {
      pending_payment: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
      processing: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
      failed: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m[s] || "bg-slate-100 text-slate-600"}`}>
        {s.replace("_", " ")}
      </span>
    );
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-bold">Cek Invoice</h1>
      <p className="mt-1 text-sm text-slate-500">Masukkan nomor invoice untuk melihat status pesanan</p>
      <p className="text-xs text-slate-400">Format: <code>GK-XXXXXXXXXXXXX</code></p>

      <div className="mt-6 flex gap-2">
        <input
          value={inv}
          onChange={(e) => setInv(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && cari()}
          placeholder="GK-XXXXXXXXXXXXX"
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-slate-600 dark:bg-slate-800"
        />
        <button onClick={cari} disabled={loading} className="rounded-xl gradient-bg px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
          {loading ? "..." : "Cari"}
        </button>
      </div>

      {err && <p className="mt-4 text-sm text-red-500">{err}</p>}

      {order && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{order.product_name}</h2>
            {statusBadge(order.status)}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Invoice</span><span className="font-mono">{order.invoice}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Varian</span><span>{order.variant_name}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-bold">{formatRp(order.amount)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tanggal</span><span className="text-xs">{new Date(order.created_at).toLocaleString("id-ID")}</span></div>
            {order.sn && <div className="flex justify-between"><span className="text-slate-500">SN / Akun</span><span className="font-mono text-xs">{order.sn}</span></div>}
          </div>
        </div>
      )}

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-indigo-600 hover:underline">← Kembali ke Beranda</Link>
      </div>
    </main>
  );
}