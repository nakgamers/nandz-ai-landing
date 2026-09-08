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

const aiLogos = {
  Claude: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/claude-color.svg",
  GPT: "https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/openai.svg",
  DeepSeek: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/deepseek-color.svg",
  Qwen: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/qwen-color.svg",
  GLM: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/chatglm-color.svg",
};

const catLabel = { ppob: "PPOB", game_topup: "Game TopUp", digital: "Produk Digital", ai: "AI API" };

export default async function Home() {
  const products = await getProducts();
  const digital = products.filter((p) => p.category === "digital").slice(0, 4);
  const games = products.filter((p) => p.category === "game_topup").slice(0, 4);
  const ppob = products.filter((p) => p.category === "ppob").slice(0, 3);
  const featured = ["mobile-legends", "free-fire", "spotify-premium", "netflix-premium"]
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  const aiModels = [
    { name: "Claude", model: "gk/claude-sonnet-5", logo: aiLogos.Claude },
    { name: "GPT", model: "gk/gpt-5.6-terra", logo: aiLogos.GPT },
    { name: "DeepSeek", model: "gk/deepseek-v4", logo: aiLogos.DeepSeek },
    { name: "Qwen", model: "gk/qwen-max", logo: aiLogos.Qwen },
    { name: "GLM", model: "gk/glm-5.2", logo: aiLogos.GLM },
  ];

  const trustItems = [
    "✓ Proses Instan", "✓ 100% Aman", "✓ Garansi Penuh", "✓ 24 Jam Online",
    "✓ Proses Instan", "✓ 100% Aman", "✓ Garansi Penuh", "✓ 24 Jam Online",
  ];

  return (
    <main>
      {/* ── Hero ── */}
      <section className="gradient-hero relative overflow-hidden border-b border-[#E2E8F0]">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#4F46E5]/10 via-[#818CF8]/10 to-transparent blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#10B981]/10 via-[#059669]/10 to-transparent blur-3xl"></div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#4F46E5] shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-slate-900/80">
              <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
              Nandz Store Online 24 Jam
            </span>
            <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-[-0.03em] text-[#0F172A] sm:text-5xl lg:text-6xl dark:text-white">
              Teman Digital{" "}
              <span className="bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#A78BFA] bg-clip-text text-transparent">
                Terpercaya
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#475569] dark:text-slate-400">
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
          </div>
        </div>
      </section>

      {/* ── Marquee Trust Bar ── */}
      <section className="border-b border-[#E2E8F0] bg-[#1E293B] py-4 dark:border-slate-700">
        <div className="marquee-container overflow-hidden">
          <div className="marquee-track">
            {[...trustItems, ...trustItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-white">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bento Grid ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Layanan Kami</span>
          <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Pilih Layanan Digital</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
          {/* ── Produk Digital ── span 2x2 ── */}
          <div className="card col-span-2 row-span-2 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-xl dark:from-indigo-950 dark:to-indigo-900">💎</div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Produk Digital</h3>
                <p className="text-xs text-[#475569] dark:text-slate-400">ChatGPT, Netflix, Spotify, Canva</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {digital.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2 rounded-lg bg-[#FAFAFA] px-3 py-2.5 transition hover:bg-[#F5F3FF] dark:bg-slate-800 dark:hover:bg-indigo-950">
                  <img src={brandLogo[p.slug]} alt="" className="h-5 w-5 shrink-0" loading="lazy" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</div>
                    <div className="text-xs font-semibold text-[#4F46E5]">{formatRp(p.min_price)}</div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/products?type=digital" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline">
              Lihat semua → <span className="text-xs text-[#64748B]">({products.filter(p => p.category === "digital").length})</span>
            </Link>
          </div>

          {/* ── Game TopUp ── span 1 ── */}
          <div className="card row-span-2 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-base dark:from-amber-950 dark:to-amber-900">🎮</div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Game TopUp</h3>
            </div>
            <div className="space-y-1.5">
              {games.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition hover:bg-[#F5F3FF] dark:hover:bg-indigo-950">
                  <img src={brandLogo[p.slug]} alt="" className="h-4 w-4 shrink-0" loading="lazy" />
                  <span className="flex-1 truncate font-medium text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5]">{formatRp(p.min_price)}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=game_topup" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline">
              Lihat semua →
            </Link>
          </div>

          {/* ── PPOB ── span 1 ── */}
          <div className="card row-span-2 p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] text-base dark:from-emerald-950 dark:to-emerald-900">📱</div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-white">PPOB</h3>
            </div>
            <div className="space-y-1.5">
              {ppob.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition hover:bg-[#F5F3FF] dark:hover:bg-indigo-950">
                  <img src={brandLogo[p.slug]} alt="" className="h-4 w-4 shrink-0" loading="lazy" />
                  <span className="flex-1 truncate font-medium text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5]">{formatRp(p.min_price)}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=ppob" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5] hover:underline">
              Lihat semua →
            </Link>
          </div>

          {/* ── AI API ── span 1 ── */}
          <Link href="/ai-api" className="card col-span-1 row-span-1 p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-base dark:from-indigo-950 dark:to-indigo-800">🤖</div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A] dark:text-white">AI API</h3>
                <p className="text-xs text-[#475569] dark:text-slate-400">Claude, GPT, DS, Qwen + GLM</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Produk Populer ── */}
      <section className="bg-[#FAFAFA] py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Paling Laris</span>
              <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Produk Favorit</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#4F46E5] hover:underline">Tampilkan Semua →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link key={p.slug} href={`/products/${p.slug}`}
                className="card group p-5 transition-all">
                <img src={brandLogo[p.slug] || ""} alt="" className="mb-3 h-9 w-9 rounded-lg object-contain p-1 dark:brightness-200 dark:invert" loading="lazy" />
                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</h3>
                <p className="mt-0.5 text-xs text-[#64748B]">{catLabel[p.category] || p.category} · {p.variants.length} paket</p>
                <p className="mt-2.5 text-lg font-bold text-[#4F46E5]">{formatRp(p.min_price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI API ── dark section compact ── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)" }}>
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#312E81] bg-[#1E1B4B] px-4 py-1.5 text-xs font-semibold text-[#A78BFA]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#A78BFA]"></span>
            AI API — untuk Developer
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold text-white">Pasang AI ke Produkmu</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
            <strong className="text-white">Bayar sesuai pemakaian — dihitung per token</strong>.
          </p>
          {/* ── Model cards compact simetris ── */}
          <div className="mt-8 grid grid-cols-5 gap-3">
            {aiModels.map((m) => (
              <div key={m.name} className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10 hover:-translate-y-0.5">
                <img src={m.logo} alt={m.name} className="h-8 w-8" loading="lazy" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{m.name}</h4>
                  <code className="mt-1 block truncate rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-slate-400">{m.model}</code>
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
          <span className="text-xs font-bold uppercase tracking-wider text-[#4F46E5]">Langkah Mudah</span>
          <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Cara Belanja</h2>
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
              <span className="text-sm font-bold text-[#4F46E5]">{s.step}</span>
              <h3 className="mt-1 text-sm font-bold text-[#0F172A] dark:text-white">{s.title}</h3>
              <p className="mt-0.5 text-xs text-[#475569] dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}