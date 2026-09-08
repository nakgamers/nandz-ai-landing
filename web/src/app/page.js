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

  const catLabel = {
    ppob: "PPOB", game_topup: "Game TopUp", digital: "Produk Digital", ai: "AI API",
  };

  return (
    <main>
      {/* Hero — Stripe-style: light weight, purple gradient accent */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6f9fc] px-4 py-1 text-xs font-normal text-[#273951] dark:bg-slate-800 dark:text-slate-300">
            <span className="h-2 w-2 rounded-full bg-[#15be53]"></span>
            Nandz Store Online 24 Jam
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-light leading-tight tracking-tight text-[#061b31] sm:text-5xl lg:text-6xl dark:text-slate-100">
            Teman Digital{" "}
            <span className="bg-gradient-to-r from-[#533afd] to-[#f96bee] bg-clip-text text-transparent">
              Terpercaya
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-lg font-light leading-relaxed text-[#64748d] dark:text-slate-400">
            Platform PPOB, Game Top Up & Produk Digital terlengkap. Beli pulsa, token PLN, voucher game, akun premium —
            mudah, cepat & harga bersahabat.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary">
              Lihat Semua Produk
            </Link>
            <Link href="/ai-api" className="btn-ghost">
              AI API untuk Developer
            </Link>
          </div>
        </div>
        {/* Decorative gradient blob */}
        <div className="pointer-events-none absolute -right-40 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#533afd]/5 to-[#f96bee]/5 blur-3xl"></div>
      </section>

      {/* Features — 3-pillars ala Stripe dark section */}
      <section className="bg-[#1c1e54] py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { icon: "⚡", title: "Proses Instan", desc: "Otomatis dalam hitungan detik" },
              { icon: "🛡️", title: "100% Aman", desc: "Terverifikasi & garansi penuh" },
              { icon: "🕐", title: "24 Jam Online", desc: "Kapan saja tanpa batas waktu" },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
                <div className="text-2xl">{f.icon}</div>
                <h3 className="mt-2 text-lg font-light text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-light tracking-tight text-[#061b31] dark:text-slate-100">Paling Populer</h2>
            <p className="text-sm text-[#64748d] dark:text-slate-400">Produk favorit pelanggan</p>
          </div>
          <Link href="/products" className="text-sm font-normal text-[#533afd] hover:underline">
            Tampilkan Semua →
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              className="card card-hover group p-5 transition-all duration-200"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-[#f6f9fc] text-lg font-normal text-[#533afd] dark:bg-slate-800 dark:text-indigo-300">
                {p.name.slice(0, 1)}
              </div>
              <h3 className="text-lg font-light text-[#061b31] group-hover:text-[#533afd] dark:text-slate-100">{p.name}</h3>
              <p className="mt-1 text-xs text-[#64748d]">{catLabel[p.category] || p.category} · {p.variants.length} paket</p>
              <p className="mt-2 text-sm font-normal text-[#533afd]">{formatRp(p.min_price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Category Tabs */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-light tracking-tight text-[#061b31] dark:text-slate-100">Pilih Layanan Digital</h2>
          <p className="text-sm text-[#64748d] dark:text-slate-400">Temukan berbagai produk digital yang kamu butuhkan</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          {[
            { title: "Produk Digital", desc: "ChatGPT, Netflix, Spotify, Canva & lainnya", slug: "digital", icon: "💎" },
            { title: "Game TopUp", desc: "Mobile Legends, Free Fire, PUBG & lainnya", slug: "game_topup", icon: "🎮" },
            { title: "PPOB", desc: "Pulsa, PLN Token, Paket Data & lainnya", slug: "ppob", icon: "📱" },
          ].map((c) => (
            <Link
              key={c.slug}
              href={`/products?type=${c.slug}`}
              className="card card-hover group p-6 transition-all duration-200"
            >
              <div className="text-2xl">{c.icon}</div>
              <h3 className="mt-3 text-lg font-light text-[#061b31] dark:text-slate-100">{c.title}</h3>
              <p className="mt-1 text-sm text-[#64748d] dark:text-slate-400">{c.desc}</p>
              <span className="mt-3 inline-block text-sm font-normal text-[#533afd]">Lihat Produk →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI API Showcase */}
      <section className="border-y border-[#e5edf5] bg-[#f8fafc] py-16 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d6d9fc] px-4 py-1 text-xs font-normal text-[#2e2b8c] dark:bg-indigo-950 dark:text-indigo-300">
            <span className="h-1.5 w-1.5 rounded-full bg-[#533afd]"></span>
            AI API — untuk Developer
          </span>
          <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-light tracking-tight text-[#061b31] dark:text-slate-100">
            Pasang AI ke Produkmu
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[#64748d] dark:text-slate-300">
            Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
            <strong className="text-[#273951] dark:text-slate-200">Bayar sesuai pemakaian — dihitung per token</strong>.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-5">
            {[
              { name: "Claude", model: "gk/claude-sonnet-5" },
              { name: "GPT", model: "gk/gpt-5.6-terra" },
              { name: "DeepSeek", model: "gk/deepseek-v4" },
              { name: "Qwen", model: "gk/qwen-max" },
              { name: "GLM", model: "gk/glm-5.2" },
            ].map((m) => (
              <div key={m.name} className="card p-4">
                <h4 className="font-normal text-[#061b31] dark:text-slate-100">{m.name}</h4>
                <code className="mt-2 inline-block rounded bg-[#f6f9fc] px-1.5 py-0.5 text-[10px] text-[#64748d] dark:bg-slate-800 dark:text-slate-300">{m.model}</code>
              </div>
            ))}
          </div>
          <Link href="/ai-api" className="btn-primary mt-8">
            Lihat & Beli API
          </Link>
        </div>
      </section>
    </main>
  );
}