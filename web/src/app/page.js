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

export default async function Home() {
  const products = await getProducts();

  const featured = ["mobile-legends", "free-fire", "spotify-premium", "chatgpt-plus"]
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  const digital = products.filter((p) => p.category === "digital").slice(0, 4);
  const games = products.filter((p) => p.category === "game_topup").slice(0, 4);
  const ppob = products.filter((p) => p.category === "ppob").slice(0, 4);

  const catLabel = {
    ppob: "PPOB", game_topup: "Game TopUp", digital: "Produk Digital", ai: "AI API",
  };

  return (
    <main>
      {/* ── Hero — Soft UI Evolution ── */}
      <section className="gradient-hero relative overflow-hidden border-b border-[#E2E8F0]">
        {/* Decorative blob */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#4F46E5]/10 via-[#818CF8]/10 to-transparent blur-3xl"></div>
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#10B981]/10 via-[#059669]/10 to-transparent blur-3xl"></div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-white/80 px-4 py-1.5 text-xs font-semibold text-[#4F46E5] shadow-sm backdrop-blur dark:border-indigo-800 dark:bg-slate-900/80">
              <span className="h-2 w-2 rounded-full bg-[#10B981]"></span>
              Nandz Store Online 24 Jam
            </span>
            <h1 className="mt-6 text-[2.75rem] font-bold leading-[1.1] tracking-[-0.03em] text-[#0F172A] sm:text-5xl lg:text-6xl dark:text-white">
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

      {/* ── Stats / Trust Bar ── */}
      <section className="border-b border-[#E2E8F0] bg-white py-6 dark:bg-slate-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-sm text-[#64748B] dark:text-slate-400">
          <span className="flex items-center gap-2"><span className="text-[#10B981]">✓</span> Proses Instan</span>
          <span className="flex items-center gap-2"><span className="text-[#10B981]">✓</span> 100% Aman & Terverifikasi</span>
          <span className="flex items-center gap-2"><span className="text-[#10B981]">✓</span> Garansi Penuh</span>
          <span className="flex items-center gap-2"><span className="text-[#10B981]">✓</span> 24 Jam Online</span>
        </div>
      </section>

      {/* ── Bento Grid — Produk Digital ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">Layanan Kami</span>
            <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Pilih Layanan Digital</h2>
            <p className="mt-1 text-[#475569] dark:text-slate-400">Temukan berbagai produk digital yang kamu butuhkan</p>
          </div>
          <Link href="/products" className="hidden text-sm font-semibold text-[#4F46E5] hover:underline sm:block">
            Semua Produk →
          </Link>
        </div>

        {/* Bento grid — 3 kolom, 2 baris */}
        <div className="grid gap-4 sm:grid-cols-3 sm:grid-rows-2">
          {/* Produk Digital — span 1 kolom, 2 baris */}
          <div className="card row-span-2 overflow-hidden p-6 sm:p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-2xl dark:from-indigo-950 dark:to-indigo-900">💎</div>
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">Produk Digital</h3>
            <p className="mt-1 text-sm text-[#475569] dark:text-slate-400">ChatGPT, Netflix, Spotify, Canva & lainnya</p>
            <div className="mt-4 space-y-2">
              {digital.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="group flex items-center justify-between rounded-lg bg-[#FAFAFA] px-3 py-2.5 transition-colors hover:bg-[#F5F3FF] dark:bg-slate-800 dark:hover:bg-slate-700">
                  <span className="text-sm font-medium text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5]">{formatRp(p.min_price)}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=digital" className="mt-4 inline-block text-sm font-semibold text-[#4F46E5] hover:underline">Lihat Produk →</Link>
          </div>

          {/* Game TopUp — span 1 kolom */}
          <div className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] text-xl dark:from-amber-950 dark:to-amber-900">🎮</div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Game TopUp</h3>
            <p className="mt-1 text-sm text-[#475569] dark:text-slate-400">ML, Free Fire, PUBG & banyak lagi</p>
            <div className="mt-3 space-y-1.5">
              {games.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#F5F3FF] dark:hover:bg-slate-700">
                  <span className="font-medium text-[#0F172A] dark:text-white">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5]">{p.min_price > 0 ? formatRp(p.min_price) : ""}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=game_topup" className="mt-3 inline-block text-sm font-semibold text-[#4F46E5] hover:underline">Lihat Produk →</Link>
          </div>

          {/* PPOB — span 1 kolom */}
          <div className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ECFDF5] to-[#D1FAE5] text-xl dark:from-emerald-950 dark:to-emerald-900">📱</div>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">PPOB</h3>
            <p className="mt-1 text-sm text-[#475569] dark:text-slate-400">Pulsa, PLN Token, Paket Data</p>
            <div className="mt-3 space-y-1.5">
              {ppob.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-[#F5F3FF] dark:hover:bg-slate-700">
                  <span className="font-medium text-[#0F172A] dark:text-white">{p.name}</span>
                  <span className="text-xs font-semibold text-[#4F46E5]">{p.min_price > 0 ? formatRp(p.min_price) : ""}</span>
                </Link>
              ))}
            </div>
            <Link href="/products?type=ppob" className="mt-3 inline-block text-sm font-semibold text-[#4F46E5] hover:underline">Lihat Produk →</Link>
          </div>

          {/* AI API — span 2 kolom */}
          <Link href="/ai-api" className="card group col-span-2 flex items-center justify-between p-5 transition-all">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-xl dark:from-indigo-950 dark:to-indigo-800">🤖</div>
              <div>
                <h3 className="text-lg font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">AI API</h3>
                <p className="text-sm text-[#475569] dark:text-slate-400">Claude, GPT, DeepSeek, Qwen — bayar per token</p>
              </div>
            </div>
            <span className="rounded-full bg-[#4F46E5] px-3 py-1 text-xs font-semibold text-white">Baru</span>
          </Link>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="bg-[#FAFAFA] py-16 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">Paling Populer</span>
              <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Produk Favorit</h2>
            </div>
            <Link href="/products" className="text-sm font-semibold text-[#4F46E5] hover:underline">Tampilkan Semua →</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="card-hover group p-5 transition-all duration-300"
                style={{ background: "var(--surface-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md)" }}
              >
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] text-lg font-bold text-[#4F46E5] dark:from-indigo-950 dark:to-indigo-800">
                  {p.name.slice(0, 1)}
                </div>
                <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#4F46E5] dark:text-white">{p.name}</h3>
                <p className="mt-0.5 text-xs text-[#64748B]">{catLabel[p.category] || p.category} · {p.variants.length} paket</p>
                <p className="mt-2.5 text-lg font-bold text-[#4F46E5]">{formatRp(p.min_price)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI API Showcase — Dark Section ── */}
      <section className="py-20" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)" }}>
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
          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {[
              { name: "Claude", model: "gk/claude-sonnet-5", gradient: "from-amber-500 to-orange-600" },
              { name: "GPT", model: "gk/gpt-5.6-terra", gradient: "from-emerald-500 to-teal-600" },
              { name: "DeepSeek", model: "gk/deepseek-v4", gradient: "from-blue-500 to-indigo-600" },
              { name: "Qwen", model: "gk/qwen-max", gradient: "from-purple-500 to-pink-600" },
              { name: "GLM", model: "gk/glm-5.2", gradient: "from-cyan-500 to-blue-600" },
            ].map((m) => (
              <div key={m.name} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10">
                <div className={`mx-auto mb-2 h-2 w-12 rounded-full bg-gradient-to-r ${m.gradient}`}></div>
                <h4 className="font-semibold text-white">{m.name}</h4>
                <code className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{m.model}</code>
              </div>
            ))}
          </div>
          <Link href="/ai-api" className="btn-primary mt-8">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Lihat & Beli API
          </Link>
        </div>
      </section>

      {/* ── How to Order ── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#4F46E5]">Langkah Mudah</span>
          <h2 className="mt-2 text-3xl font-bold text-[#0F172A] dark:text-white">Cara Belanja</h2>
          <p className="mt-1 text-[#475569] dark:text-slate-400">Hanya 4 langkah, langsung kirim otomatis!</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-4">
          {[
            { step: "01", icon: "🔍", title: "Pilih Produk", desc: "Cari produk dari berbagai kategori" },
            { step: "02", icon: "✏️", title: "Isi Data", desc: "Masukkan ID akun atau nomor tujuan" },
            { step: "03", icon: "💳", title: "Bayar", desc: "QRIS, E-wallet, Transfer Bank" },
            { step: "04", icon: "✅", title: "Selesai!", desc: "Produk langsung terkirim otomatis" },
          ].map((s) => (
            <div key={s.step} className="card p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3FF] text-lg dark:bg-indigo-950">{s.icon}</div>
              <span className="text-xs font-bold text-[#4F46E5]">{s.step}</span>
              <h3 className="mt-1 text-sm font-bold text-[#0F172A] dark:text-white">{s.title}</h3>
              <p className="mt-1 text-xs text-[#475569] dark:text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}