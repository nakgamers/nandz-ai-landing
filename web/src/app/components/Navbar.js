"use client";

import { useState } from "react";
import Link from "next/link";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#e5edf5] bg-white/80 backdrop-blur-xl dark:border-[#1e293b] dark:bg-[#0b1120]/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="gradient-bg flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-brand">
              N
            </span>
            <span className="text-lg font-semibold tracking-tight text-[#061b31] dark:text-slate-100">
              Nandz<span className="text-[#533afd]">Store</span>
            </span>
          </Link>
          <nav className="flex items-center gap-1 text-sm font-normal text-[#273951] dark:text-slate-300">
            <Link href="/" className="rounded-md px-3 py-2 hover:bg-[#f6f9fc] dark:hover:bg-slate-800">Beranda</Link>
            <Link href="/products" className="rounded-md px-3 py-2 hover:bg-[#f6f9fc] dark:hover:bg-slate-800">Produk</Link>
            <Link href="/ai-api" className="rounded-md px-3 py-2 text-[#533afd] hover:bg-[#f6f9fc] dark:hover:bg-slate-800">AI API</Link>
            <Link href="/cek-invoice" className="rounded-md px-3 py-2 hover:bg-[#f6f9fc] dark:hover:bg-slate-800">Cek Invoice</Link>
            {user && (
              <Link href="/admin" className="ml-2 rounded-md border border-[#d6d9fc] px-3 py-1.5 text-[#533afd] hover:bg-[#533afd]/5 dark:border-indigo-800 dark:text-indigo-300">
                Admin
              </Link>
            )}
            <button onClick={() => setAuthOpen(true)} className="btn-primary ml-2 px-4 py-1.5 text-xs">
              {user ? user.name || user.phone : "Masuk"}
            </button>
          </nav>
        </div>
      </header>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onLogin={(u) => { setUser(u); setAuthOpen(false); }} />}
    </>
  );
}