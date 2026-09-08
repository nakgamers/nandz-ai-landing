import Link from "next/link";
import "./globals.css";

export const metadata = {
  title: "Geraikita Clone - Teman Digital Terpercaya",
  description: "Platform PPOB, Game Top Up & Produk Digital. Beli pulsa, token PLN, voucher game, akun premium - mudah, cepat & harga bersahabat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        {/* Navbar */}
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">
                G
              </span>
              <span className="text-lg font-bold tracking-tight">Geraikita<span className="text-indigo-500">Clone</span></span>
            </Link>
            <nav className="flex items-center gap-1 text-sm font-medium sm:gap-2">
              <Link href="/" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Beranda</Link>
              <Link href="/products" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Produk</Link>
              <Link href="/ai-api" className="rounded-lg px-3 py-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950">AI API</Link>
              <Link href="/cek-invoice" className="rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">Cek Invoice</Link>
            </nav>
          </div>
        </header>

        {children}

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-slate-50 py-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="gradient-bg flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white">G</span>
                <span className="font-bold">GeraikitaClone</span>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Penyedia layanan produk digital dan akun premium terpercaya di Indonesia dengan sistem otomatis 24 jam.
              </p>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Layanan Kami</h4>
              <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/products?type=ppob" className="hover:text-indigo-500">PPOB</Link></li>
                <li><Link href="/products?type=game_topup" className="hover:text-indigo-500">Game Top Up</Link></li>
                <li><Link href="/products?type=digital" className="hover:text-indigo-500">Produk Digital</Link></li>
                <li><Link href="/ai-api" className="hover:text-indigo-500">AI API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold">Bantuan</h4>
              <ul className="space-y-1 text-sm text-slate-500 dark:text-slate-400">
                <li><Link href="/cek-invoice" className="hover:text-indigo-500">Cek Invoice</Link></li>
                <li><Link href="/ai-api" className="hover:text-indigo-500">Dokumentasi API</Link></li>
                <li><Link href="/faq" className="hover:text-indigo-500">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-8 max-w-6xl border-t border-slate-200 px-4 pt-6 text-center text-xs text-slate-400 dark:border-slate-800">
            © 2026 GeraikitaClone. Semua Hak Dilindungi.
          </div>
        </footer>
      </body>
    </html>
  );
}