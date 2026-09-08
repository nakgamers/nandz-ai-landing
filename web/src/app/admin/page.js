"use client";

import { useState, useEffect, useCallback } from "react";

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // product dibuka
  const [newVariant, setNewVariant] = useState({ name: "", sku: "", sell_price: 0, cost_price: 0, stock: 0 });
  const [msg, setMsg] = useState("");

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products", { headers: { "X-Admin-Key": adminKey } });
      if (!res.ok) throw new Error("Gagal load");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  const login = () => {
    if (!adminKey.trim()) return;
    loadProducts().then(() => setAuthed(true));
  };

  const marginOf = (v) => (v.sell_price > 0 ? Math.round(((v.sell_price - v.cost_price) / v.sell_price) * 100) : 0);

  const saveVariant = async (v) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/variants", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": adminKey },
        body: JSON.stringify(v),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal simpan");
      setMsg(`✓ ${v.name} disimpan`);
      await loadProducts();
      // refresh selected
      setSelected(data.variant.product_id || selected);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteVariant = async (id) => {
    if (!confirm("Hapus varian ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/variants/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey },
      });
      if (!res.ok) throw new Error("Gagal hapus");
      setMsg("✓ Varian dihapus");
      await loadProducts();
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Rerender produk setelah edit
  useEffect(() => {
    if (authed) loadProducts();
  }, [authed, loadProducts]);

  if (!authed) {
    return (
      <main className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="card p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#533afd]/10 text-xl">🔐</div>
          <h1 className="text-2xl font-light">Admin Nandz Store</h1>
          <p className="mt-1 text-sm text-[#64748d]">Masukkan admin key untuk akses panel.</p>
          <p className="mt-2 text-xs text-[#94a3b8]">Default: <code>dev-secret-change-me</code></p>
          <input
            type="password"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Admin key"
            className="input mt-4"
          />
          <button onClick={login} className="btn-primary mt-4 w-full">Masuk Admin</button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light">Admin Panel</h1>
          <p className="text-sm text-[#64748d]">Kelola produk, harga, stok & margin</p>
        </div>
        <button onClick={() => { setAuthed(false); setAdminKey(""); }} className="btn-ghost text-sm">Keluar</button>
      </div>

      {msg && <div className="mb-4 rounded-lg border border-[#15be53]/30 bg-[#15be53]/10 p-3 text-sm text-[#108c3d]">{msg}</div>}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List produk */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <h2 className="mb-3 text-lg font-light">Produk ({products.length})</h2>
            <div className="max-h-[70vh] space-y-1 overflow-y-auto">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    selected?.id === p.id ? "bg-[#533afd]/10 text-[#533afd]" : "hover:bg-[#f6f9fc] dark:hover:bg-slate-800"
                  }`}
                >
                  <span>{p.name}</span>
                  <span className="text-xs text-[#64748d]">{p.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail produk */}
        <div className="lg:col-span-2">
          {selected ? (
            <div className="card p-6">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-light">{selected.name}</h2>
                  <p className="text-xs text-[#64748d]">slug: {selected.slug} · {selected.category}</p>
                </div>
                <span className="badge bg-[#d6d9fc] text-[#2e2b8c]">ID {selected.id}</span>
              </div>

              <h3 className="mb-2 text-sm font-semibold text-[#273951]">Varian ({selected.variants?.length || 0})</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#e5edf5] text-left text-xs text-[#64748d]">
                      <th className="pb-2 pr-2">Nama</th>
                      <th className="pb-2 pr-2">Harga Jual</th>
                      <th className="pb-2 pr-2">Modal</th>
                      <th className="pb-2 pr-2">Margin</th>
                      <th className="pb-2 pr-2">Stok</th>
                      <th className="pb-2">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selected.variants?.map((v) => (
                      <tr key={v.id} className="border-b border-[#e5edf5]/50">
                        <td className="py-2 pr-2">{v.name}</td>
                        <td className="py-2 pr-2 tnum font-medium text-[#533afd]">{formatRp(v.sell_price)}</td>
                        <td className="py-2 pr-2 tnum text-[#64748d]">{formatRp(v.cost_price)}</td>
                        <td className="py-2 pr-2">
                          <span className={`badge ${marginOf(v) >= 30 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {marginOf(v)}%
                          </span>
                        </td>
                        <td className="py-2 pr-2">{v.stock === 0 ? "∞" : v.stock}</td>
                        <td className="py-2">
                          <button
                            onClick={() => deleteVariant(v.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tambah varian */}
              <div className="mt-5 rounded-xl border border-dashed border-[#d6d9fc] p-4">
                <h4 className="mb-3 text-sm font-semibold text-[#273951]">＋ Tambah Varian</h4>
                <div className="grid gap-3 sm:grid-cols-5">
                  <input className="input sm:col-span-2" placeholder="Nama (mis: 86 Diamond)" value={newVariant.name} onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })} />
                  <input className="input" placeholder="SKU" value={newVariant.sku} onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })} />
                  <input className="input tnum" type="number" placeholder="Harga" value={newVariant.sell_price} onChange={(e) => setNewVariant({ ...newVariant, sell_price: +e.target.value })} />
                  <input className="input tnum" type="number" placeholder="Modal" value={newVariant.cost_price} onChange={(e) => setNewVariant({ ...newVariant, cost_price: +e.target.value })} />
                </div>
                <button
                  onClick={() => saveVariant({ ...newVariant, product_id: selected.id, status: "active" })}
                  disabled={loading || !newVariant.name}
                  className="btn-primary mt-3 text-sm"
                >
                  {loading ? "Menyimpan..." : "Simpan Varian"}
                </button>
              </div>
            </div>
          ) : (
            <div className="card flex h-64 items-center justify-center p-6 text-center text-[#64748d]">
              <p>Pilih produk di kiri untuk kelola varian & harga.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}