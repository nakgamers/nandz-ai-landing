import Link from "next/link";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata = {
  title: "Nandz Store — Teman Digital Terpercaya",
  description: "Platform PPOB, Game Top Up & Produk Digital terlengkap. Beli pulsa, token PLN, voucher game, akun premium — mudah, cepat & harga bersahabat.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-[#0b1120]">
        <Navbar />

        {children}

        <footer className="border-t border-[#E2E8F0] bg-[#0F172A] py-12 text-white dark:border-slate-800">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="gradient-bg flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white">N</span>
                <span className="font-bold">NandzStore</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Penyedia layanan produk digital dan akun premium terpercaya di Indonesia dengan sistem otomatis 24 jam.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Layanan Kami</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/products?type=ppob" className="transition-colors hover:text-white">PPOB</Link></li>
                <li><Link href="/products?type=game_topup" className="transition-colors hover:text-white">Game Top Up</Link></li>
                <li><Link href="/products?type=digital" className="transition-colors hover:text-white">Produk Digital</Link></li>
                <li><Link href="/ai-api" className="transition-colors hover:text-white">AI API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold text-white">Bantuan</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/cek-invoice" className="transition-colors hover:text-white">Cek Invoice</Link></li>
                <li><Link href="/ai-api" className="transition-colors hover:text-white">Dokumentasi API</Link></li>
                <li><Link href="/admin" className="transition-colors hover:text-white">Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-center text-xs text-slate-500">
            © 2026 Nandz Store. Semua Hak Dilindungi. Dibuat dengan 💜 di Indonesia.
          </div>
        </footer>
      </body>
    </html>
  );
}