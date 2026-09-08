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
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-[#0b1120]">
        <Navbar />

        {children}

        <footer className="border-t border-[#e5edf5] bg-[#1c1e54] py-12 text-white dark:border-slate-800">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm font-semibold">N</span>
                <span className="font-semibold">NandzStore</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Penyedia layanan produk digital dan akun premium terpercaya di Indonesia dengan sistem otomatis 24 jam.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Layanan Kami</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/products?type=ppob" className="hover:text-white">PPOB</Link></li>
                <li><Link href="/products?type=game_topup" className="hover:text-white">Game Top Up</Link></li>
                <li><Link href="/products?type=digital" className="hover:text-white">Produk Digital</Link></li>
                <li><Link href="/ai-api" className="hover:text-white">AI API</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-white">Bantuan</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><Link href="/cek-invoice" className="hover:text-white">Cek Invoice</Link></li>
                <li><Link href="/ai-api" className="hover:text-white">Dokumentasi API</Link></li>
                <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
              </ul>
            </div>
          </div>
          <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-center text-xs text-white/40">
            © 2026 Nandz Store. Semua Hak Dilindungi. Dibuat dengan 💜 di Indonesia.
          </div>
        </footer>
      </body>
    </html>
  );
}