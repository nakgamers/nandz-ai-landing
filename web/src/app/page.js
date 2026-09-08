import Link from "next/link";

// Server component: fetch langsung dari backend Go (via rewrite /api/*)
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
  const featured = ["mobile-legends", "pulsa-telkomsel", "netflix-premium", "ai-api-deepseek"]
    .map((slug) => products.find((p) => p.slug === slug))
    .filter(Boolean);

  return (
    <main>
      {/* Hero */}
      <section className="gradient-bg relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 text-center text-white sm:py-24">
          <span className="inline-block rounded-full bg-white/15 px-4 py-1 text-xs font-medium backdrop-blur">
            GeraikitaClone Online 24 Jam
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Teman Digital{" "}
            <span className="bg-gradient-to-r from-amber-300 to-pink-400 bg-clip-text text-transparent">
              Terpercaya
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/85 sm:text-lg">
            Platform PPOB, Game Top Up & Produk Digital terlengkap. Beli pulsa, token PLN, voucher game, akun premium —
            mudah, cepat & harga bersahabat.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/products" className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-indigo-600 shadow-lg transition hover:bg-slate-100">
              Lihat Semua Produk
            </Link>
            <Link href="/ai-api" className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20">
              AI API untuk Developer
            </Link>
          </div>
        </div>
      </section>

      {/* Fitur */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: "⚡", title: "Proses Instan", desc: "Otomatis dalam hitungan detik" },
            { icon: "🛡️", title: "100% Aman", desc: "Terverifikasi & garansi penuh" },
            { icon: "🕐", title: "24 Jam Online", desc: "Kapan saja tanpa batas waktu" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="mt-2 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Produk Populer */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold">Paling Populer</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Produk favorit pelanggan</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Tampilkan Semua →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <Link key={p.slug} href={`/products/${p.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-xl font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                {p.name.slice(0, 1)}
              </div>
              <h3 className="font-semibold group-hover:text-indigo-600">{p.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{p.variants.length} paket tersedia</p>
              <p className="mt-2 text-sm font-bold text-indigo-600">Mulai dari {formatRp(p.min_price)}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Layanan */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Pilih Layanan Digital</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Temukan berbagai produk digital yang kamu butuhkan</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Produk Digital", desc: "ChatGPT, Netflix, Spotify, Canva & lainnya", slug: "digital", icon: "💎" },
            { title: "Game TopUp", desc: "Mobile Legends, Free Fire, PUBG & lainnya", slug: "game_topup", icon: "🎮" },
            { title: "PPOB", desc: "Pulsa, PLN Token, Paket Data & lainnya", slug: "ppob", icon: "📱" },
          ].map((c) => (
            <Link key={c.slug} href={`/products?type=${c.slug}`} className="rounded-2xl border border-slate-200 p-6 transition hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-700">
              <div className="text-3xl">{c.icon}</div>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
              <span className="mt-3 inline-block text-sm font-medium text-indigo-600 dark:text-indigo-400">Lihat Produk →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* AI API Showcase */}
      <section className="border-y border-slate-200 bg-slate-50 py-14 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            AI API — untuk Developer
          </span>
          <h2 className="mt-4 text-3xl font-bold">Pasang AI ke Produkmu</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
            <strong>Bayar sesuai pemakaian — dihitung per token</strong>, tanpa langganan dan tanpa kuota hangus.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { name: "Claude", desc: "Penalaran & coding kelas atas", model: "gk/claude-sonnet-5" },
              { name: "GPT", desc: "Serbaguna untuk chat & tool-use", model: "gk/gpt-5.6-terra" },
              { name: "DeepSeek", desc: "Hemat, kuat reasoning", model: "gk/deepseek-v4" },
              { name: "Qwen", desc: "Konteks panjang, kuat bahasa Asia", model: "gk/qwen-max" },
              { name: "GLM", desc: "Multibahasa, harga irit", model: "gk/glm-5.2" },
            ].map((m) => (
              <div key={m.name} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
                <h4 className="font-bold">{m.name}</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{m.desc}</p>
                <code className="mt-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-900 dark:text-slate-300">{m.model}</code>
              </div>
            ))}
          </div>
          <Link href="/ai-api" className="mt-8 inline-block rounded-xl gradient-bg px-8 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90">
            Lihat & Beli API
          </Link>
        </div>
      </section>
    </main>
  );
}