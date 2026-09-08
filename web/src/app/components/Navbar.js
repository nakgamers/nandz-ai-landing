"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-[#E2E8F0] bg-white/90 shadow-[0_4px_6px_-1px_rgb(0_0_0/0.06)] backdrop-blur-xl"
          : "border-transparent bg-white/60 backdrop-blur"
      } dark:border-[#1E293B] dark:bg-[#0B1120]/90`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="gradient-bg flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md transition-transform duration-300 group-hover:scale-105">
              N
            </span>
            <span className="text-lg font-bold tracking-tight text-[#0F172A] dark:text-slate-100">
              Nandz<span className="text-[#4F46E5] dark:text-indigo-300">Store</span>
            </span>
          </Link>
          <nav className="flex items-center gap-0.5 text-sm font-medium text-[#334155] dark:text-slate-300">
            <Link href="/" className="rounded-lg px-3 py-2 text-[#475569] transition-colors hover:bg-[#F5F3FF] hover:text-[#4F46E5] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300">Beranda</Link>
            <Link href="/products" className="rounded-lg px-3 py-2 text-[#475569] transition-colors hover:bg-[#F5F3FF] hover:text-[#4F46E5] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300">Produk</Link>
            <Link href="/ai-api" className="rounded-lg px-3 py-2 text-[#4F46E5] transition-colors hover:bg-[#F5F3FF] dark:text-indigo-300">AI API</Link>
            <Link href="/cek-invoice" className="rounded-lg px-3 py-2 text-[#475569] transition-colors hover:bg-[#F5F3FF] hover:text-[#4F46E5] dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300">Cek Invoice</Link>
            {user && (
              <Link href="/admin" className="ml-1 rounded-lg border border-[#E0E7FF] px-3 py-1.5 text-[#4F46E5] transition-colors hover:bg-[#F5F3FF] dark:border-indigo-800 dark:text-indigo-300">
                Admin
              </Link>
            )}
            <button onClick={() => setAuthOpen(true)} className="btn-primary ml-2 !px-4 !py-1.5 text-xs">
              {user ? user.name || user.phone : "Masuk"}
            </button>
          </nav>
        </div>
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); setAuthOpen(false); }} />}
    </>
  );
}