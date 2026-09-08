import Link from "next/link";
import HeroMascot from "./components/HeroMascot";
import { productImage, aiLogos } from "./lib/images";

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

function ProductImg({ slug, name, className }) {
  const src = productImage(slug);
  if (!src) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-[#EEF2FF] text-sm font-bold text-[#4F46E5] dark:bg-indigo-950 dark:text-indigo-300 ${className || ""}`}>
        {name.charAt(0)}
      </div>
    );
  }
  return <img src={src} alt={name} className={className} loading="lazy" />;
}

export default async function Home() {
  const products = await getProducts();
  const digital = products.filter((p) => p.category === "digital").slice(0, 4);
  const games = products.filter((p) => p.category === "game_topup").slice(0, 4);
  const ppob = products.filter((p) => p.category === "ppob").slice(0, 3);
  const featured = ["mobile-legends", "free-fire", "spotify-premium", "netflix-premium"]
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  const aiModels = [
    { name: "Claude", model: "claude-sonnet-5", logo: aiLogos.Claude },
    { name: "GPT", model: "gpt-5.6-terra", logo: aiLogos.GPT },
    { name: "DeepSeek", model: "deepseek-v4", logo: aiLogos.DeepSeek },
    { name: "Qwen", model: "qwen-max", logo: aiLogos.Qwen },
    { name: "GLM", model: "glm-5.2", logo: aiLogos.GLM },
  ];

  const trustItems = ["Proses Instan", "100% Aman & Terverifikasi", "Garansi Penuh", "24 Jam Online"];

  return (
    <main>
      {/* ── Hero: teks kiri + maskot 3D kanan ── */}
      <section className="gradient-hero relative overflow-hidden border-b border-[#E2E8F0] dark:border-slate-800">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#4F46E5]/10 via-[#818CF8]/10 to-transparent blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#10B981]/10 via-[#059669]/10 to-transparent blur-3xl"></div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-4 py-16 sm:py-20 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#4F46E5] shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-slate-900/80 dark:text-indigo-300">
              <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
              Nandz Store Online 24 Jam
            </span>
            <h1 className="mt-6 text-[2.5rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#0F172A] sm:text-5xl lg:text-[3.4rem] dark:text-slate-50">
              Teman Digital{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent">
                Terpercaya
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#475569] dark:text-slate-300">
              Platform PPOB, Game Top Up & Produk Digital terlengkap. Beli pulsa, token PLN, voucher game, akun premium —
              mudah, cepat & harga bersahabat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary shadow-[0_4px_14px_rgb(79_70_229/0.4)]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Lihat Semua Produk
              </Link>
              <Link href="/ai-api" className="btn-ghost">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI API untuk Developer
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-[#475569] dark:text-slate-400">
              <span>⚡ {products.reduce((a, p) => a + p.variants.length, 0)}+ paket tersedia</span>
              <span>🕐 Transaksi otomatis 24 jam</span>
              <span>🛡️ Garansi 100% uang kembali</span>
            </div>
          </div>
          {/* Maskot 3D mengisi ruang kosong kanan */}
          <HeroMascot />
        </div>
      </section>

      {/* ── Marquee Trust Bar ── */}
      <section className="border-b border-[#E2E8F0] bg-[#1E293B] py-3.5 dark:border-slate-700">
        <div className="marquee-container overflow-hidden">
          <div className="marquee-track">
            {[...trustItems, ...trustItems, ...trustItems, ...trustItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-slate-100">
                <svg className="h-4 w-4 text-[#34D399]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">Layanan Kami</span>
          <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-slate-50">Pilih Layanan Digital</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          {/* ── Produk Digital ── span 2x2 ── */}
          <div className="card col-span-2 row-span-2 flex flex-col p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-xl dark:from-indigo-950 dark:to-indigo-900">💎</div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-slate-50">Produk Digital</h3>
                <p className="text-xs text-[#475569] dark:text-slate-400">ChatGPT, Netflix, Spotify, Canva</p>
              </div>
            </div>
            <div className="grid flex-1 grid-cols-2 content-start gap-2">
              {digital.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2.5 rounded-lg bg-[#F8FAFC] px-3 py-3 transition hover:bg-[#F5F3FF] dark:bg-slate-800 dark:hover:bg-indigo-950">
                  <ProductImg slug={p.slug} name={p.name} className="h-8 w-8 shrink-0 rounded-md object-contain" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-slate-100 dark:group-hover:text-indigo-300">{p.name}</div>
                    <div className="text-xs font-semibold text-[#4F46E5] dark:text-indigo-400">{formatRp(p.min_price)}</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/products?type=digital" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline dark:text-indigo-400">
              Lihat semua → <span className="text-xs text-[#64748B] dark:text-slate-500">({products.filter(p => p.category === "digital").length})</span>
            </Link>
          </div>

          {/* ── Game TopUp ── span 1 x 2 rows ── */}
          <div className="card row-span-2 flex flex-col p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-base dark:from-amber-950 dark:to-amber-900">🎮</div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-50">Game TopUp</h3>
            </div>
            <div className="flex-1 space-y-2">
              {games.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-2.5 py-2 transition hover:bg-[#F5F3FF] dark:bg-slate-800 dark:hover:bg-indigo-950">
                  <ProductImg slug={p.slug} name={p.name} className="h-6 w-6 shrink-0 rounded object-contain" />
                  <span className="flex-1 truncate text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-slate-100 dark:group-hover:text-indigo-300">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5] dark:text-indigo-400">{formatRp(p.min_price)}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=game_topup" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline dark:text-indigo-400">
              Lihat semua →
            </Link>
          </div>

          {/* ── PPOB ── span 1 x 2 rows ── */}
          <div className="card row-span-2 flex flex-col p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] text-base dark:from-emerald-950 dark:to-emerald-900">📱</div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-50">PPOB</h3>
            </div>
            <div className="flex-1 space-y-2">
              {ppob.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-2.5 py-2 transition hover:bg-[#F5F3FF] dark:bg-slate-800 dark:hover:bg-indigo-950">
                  <ProductImg slug={p.slug} name={p.name} className="h-6 w-6 shrink-0 rounded object-contain" />
                  <span className="flex-1 truncate text-sm font-semibold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-slate-100 dark:group-hover:text-indigo-300">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5] dark:text-indigo-400">{formatRp(p.min_price)}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=ppob" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline dark:text-indigo-400">
              Lihat semua →
            </Link>
          </div>

          {/* ── AI API ── */}
          <Link href="/ai-api" className="card col-span-2 flex items-center justify-between gap-3 p-5 sm:col-span-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-xl dark:from-indigo-950 dark:to-indigo-800">🤖</div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-slate-50">AI API untuk Developer</h3>
                <p className="text-xs text-[#475569] dark:text-slate-400">Claude, GPT, DeepSeek, Qwen, GLM — satu API key, bayar per token</p>
              </div>
            </div>
            <span className="text-sm font-semibold text-[#4F46E5] dark:text-indigo-400">→</span>
          </Link>
        </div>
      </section>

      {/* ── Produk Populer ── */}
      <section className="bg-[#F8FAFC] py-16 dark:bg-slate-900/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">Paling Laris</span>
              <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-slate-50">Produk Favorit</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#4F46E5] hover:underline dark:text-indigo-400">Tampilkan Semua →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`} className="card group flex flex-col overflow-hidden">
                <div className="flex h-36 items-center justify-center bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] p-4 dark:from-slate-800 dark:to-slate-900">
                  <ProductImg slug={p.slug} name={p.name} className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-slate-50 dark:group-hover:text-indigo-300">{p.name}</h3>
                  <p className="mt-0.5 text-xs text-[#64748B] dark:text-slate-400">{catLabel[p.category] || p.category} · {p.variants.length} paket</p>
                  <p className="mt-auto pt-2.5 text-lg font-bold text-[#4F46E5] dark:text-indigo-400">{formatRp(p.min_price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI API ── dark section ── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#312E81] bg-[#1E1B4B] px-4 py-1.5 text-xs font-semibold text-[#A78BFA]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
            AI API — untuk Developer
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-white">Pasang AI ke Produkmu</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-300">
            Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
            <strong className="text-white">Bayar sesuai pemakaian — dihitung per token</strong>.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {aiModels.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:bg-white/10 hover:-translate-y-0.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 p-2.5 shadow-inner">
                  <img src={m.logo} alt={m.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                  <code className="mt-1 block truncate rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{m.model}</code>
                </div>
              </div>
            ))}
          </div>
          <Link href="/ai-api" className="btn-primary mt-8 shadow-[0_4px_14px_rgb(79_70_229/0.4)]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Lihat & Beli API
          </Link>
        </div>
      </section>

      {/* ── How to Order ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5] dark:text-indigo-400">Langkah Mudah</span>
          <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-slate-50">Cara Belanja</h2>
          <p className="mt-1 text-[#475569] dark:text-slate-400">Hanya 4 langkah, langsung kirim otomatis!</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-4">
          {[
            { step: "01", icon: "🔍", title: "Pilih Produk", desc: "Cari produk dari berbagai kategori" },
            { step: "02", icon: "✏️", title: "Isi Data", desc: "Masukkan ID akun atau nomor tujuan" },
            { step: "03", icon: "💳", title: "Bayar", desc: "QRIS, E-wallet, Transfer Bank" },
            { step: "04", icon: "✅", title: "Selesai!", desc: "Produk langsung terkirim otomatis" },
          ].map((s) => (
            <div key={s.step} className="card p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3FF] dark:bg-indigo-950">{s.icon}</div>
              <span className="text-sm font-bold text-[#4F46E5] dark:text-indigo-400">{s.step}</span>
              <h3 className="mt-1 text-sm font-bold text-[#0F172A] dark:text-slate-50">{s.title}</h3>
              <p className="mt-0.5 text-xs text-[#475569] dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
