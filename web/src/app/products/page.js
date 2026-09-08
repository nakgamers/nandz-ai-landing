import Link from "next/link";
import { productImage } from "../lib/images";

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

const catLabel = { ppob: "PPOB", game_topup: "Game TopUp", digital: "Produk Digital", ai: "AI API" };
const catIcons = { ppob: "📱", game_topup: "🎮", digital: "💎", ai: "🤖" };

function ProductImg({ slug, name, className }) {
  const src = productImage(slug);
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-[#EEF2FF] text-lg font-bold text-[#4F46E5] dark:bg-indigo-950 dark:text-indigo-300 ${className || ""}`}>
        {name.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={name} className={className} loading="lazy" />;
}

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const type = params?.type;
  const products = await getProducts();
  const filtered = type ? products.filter((p) => p.category === type) : products;

  const pill = (active) =>
    `rounded-xl px-4 py-2 text-sm font-semibold transition-all ${active
      ? "bg-[#4F46E5] text-white shadow-md"
      : "border border-[#E2E8F0] bg-white text-[#334155] hover:border-[#4F46E5] hover:text-[#4F46E5] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"}`;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">Semua Produk</div>
      <h1 className="text-3xl font-bold text-[#0F172A] dark:text-slate-50">Temukan Produk Digital</h1>
      <p className="mt-1 text-[#475569] dark:text-slate-400">Dari pulsa sampai AI API, semua ada di sini — {products.length} produk tersedia</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href="/products" className={pill(!type)}>📋 Semua</Link>
        {Object.entries(catLabel).map(([k, v]) => (
          <Link key={k} href={`/products?type=${k}`} className={pill(type === k)}>
            {catIcons[k]} {v}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Link key={p.slug} href={`/products/${p.slug}`} className="card group flex flex-col overflow-hidden">
            <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] p-4 dark:from-slate-800 dark:to-slate-900">
              <ProductImg slug={p.slug} name={p.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
              <span className="absolute right-2 top-2 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-[#475569] shadow-sm dark:bg-slate-900/90 dark:text-slate-300">
                {catLabel[p.category] || p.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-slate-50 dark:group-hover:text-indigo-300">{p.name}</h3>
              <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">{p.brand} · {p.variants.length} paket</p>
              <p className="mt-auto pt-2.5 text-lg font-bold text-[#4F46E5] dark:text-indigo-400">{formatRp(p.min_price)}</p>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-16 text-center text-[#64748B] dark:text-slate-400">Belum ada produk di kategori ini.</p>
        )}
      </div>
    </main>
  );
}
