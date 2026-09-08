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

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold">Semua Produk</h1>
      <p className="mt-1 text-slate-500 dark:text-slate-400">
        Temukan berbagai produk digital, game top up & layanan PPOB
      </p>

      {/* Filter kategori */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/products" className={`rounded-full px-4 py-1.5 text-sm font-medium ${!type ? "gradient-bg text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
          Semua
        </Link>
        {Object.entries(catLabel).map(([k, v]) => (
          <Link key={k} href={`/products?type=${k}`} className={`rounded-full px-4 py-1.5 text-sm font-medium ${type === k ? "gradient-bg text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"}`}>
            {v}
          </Link>
        ))}
      </div>

      {/* Grid produk */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {p.name.slice(0, 1)}
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                {catLabel[p.category] || p.category}
              </span>
            </div>
            <h3 className="font-semibold group-hover:text-indigo-600">{p.name}</h3>
            <p className="mt-0.5 text-xs text-slate-400">{p.brand}</p>
            <p className="mt-2 text-sm font-bold text-indigo-600">Mulai dari {formatRp(p.min_price)}</p>
            <p className="mt-1 text-xs text-slate-400">{p.variants.length} paket tersedia</p>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-12 text-center text-slate-400">Belum ada produk di kategori ini.</p>
        )}
      </div>
    </main>
  );
}