import Link from "next/link";

async function getProducts() {
  try {
    const res = await fetch("http://localhost:8080/api/products", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const type = params?.type;
  const products = await getProducts();
  const filtered = type ? products.filter((p) => p.category === type) : products;

  const catLabel = { ppob: "PPOB", game_topup: "Game TopUp", digital: "Produk Digital", ai: "AI API" };
  const catIcons = { ppob: "📱", game_topup: "🎮", digital: "💎", ai: "🤖" };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">Semua Produk</div>
      <h1 className="text-3xl font-bold text-[#0F172A] dark:text-white">Temukan Produk Digital</h1>
      <p className="mt-1 text-[#475569] dark:text-slate-400">Dari pulsa sampai AI API, semua ada di sini</p>

      {/* Filter */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/products" className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${!type ? "bg-[#4F46E5] text-white shadow-md" : "border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
          <span className="mr-1.5">📋</span> Semua
        </Link>
        {Object.entries(catLabel).map(([k, v]) => (
          <Link key={k} href={`/products?type=${k}`} className={`rounded-xl px-4 py-2 text-sm font-semibold transition-all ${type === k ? "bg-[#4F46E5] text-white shadow-md" : "border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
            <span className="mr-1.5">{catIcons[k]}</span> {v}
          </Link>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="card-hover group p-5 transition-all duration-300"
            style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-base font-bold text-[#4F46E5] dark:from-indigo-950 dark:to-indigo-800">
                {p.name.slice(0, 1)}
              </div>
              <span className="rounded-lg bg-[#FAFAFA] px-2.5 py-1 text-[10px] font-semibold text-[#64748B] dark:bg-slate-800 dark:text-slate-400">
                {catLabel[p.category] || p.category}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</h3>
            <p className="mt-0.5 text-xs text-[#64748B]">{p.brand}</p>
            <p className="mt-3 text-lg font-bold text-[#4F46E5]">{formatRp(p.min_price)}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">{p.variants.length} paket tersedia</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-[#94A3B8]">Belum ada produk di kategori ini.</p>
        )}
      </div>
    </main>
  );
}