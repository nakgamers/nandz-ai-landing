"use client";

import { useState } from "react";

export default function AuthModal({ open, onClose }) {
  const [step, setStep] = useState(1); // 1=phone 2=code 3=done
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const requestOtp = async () => {
    setError("");
    if (!/^08\d{8,11}$/.test(phone)) { setError("Format nomor tidak valid (contoh: 081234567890)"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengirim OTP");
      setHint(data.dev_code ? `Kode demo: ${data.dev_code}` : "Kode terkirim via WhatsApp.");
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verifikasi gagal");
      localStorage.setItem("gk_token", data.token);
      setStep(3);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const close = () => { onClose(); setTimeout(() => { setStep(1); setPhone(""); setCode(""); setError(""); setHint(""); }, 200); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/60 p-4 backdrop-blur-sm" onClick={close}>
      <div className="card relative w-full max-w-sm p-7" onClick={(e) => e.stopPropagation()}>
        <button onClick={close} aria-label="Tutup" className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A] dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
          ✕
        </button>

        {step === 1 && (
          <>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-50">Masuk ke Nandz Store</h2>
            <p className="mt-1.5 text-sm text-[#475569] dark:text-slate-400">Kami kirim kode OTP ke WhatsApp kamu.</p>
            <input
              type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx" className="input mt-5" autoFocus
              onKeyDown={(e) => e.key === "Enter" && requestOtp()}
            />
            {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
            <button onClick={requestOtp} disabled={loading} className="btn-primary mt-4 w-full disabled:opacity-60">
              {loading ? "Mengirim..." : "Kirim OTP"}
            </button>
            <p className="mt-4 text-center text-xs text-[#64748B] dark:text-slate-500">Dengan masuk, kamu setuju dengan Syarat & Ketentuan kami.</p>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-50">Masukkan Kode</h2>
            <p className="mt-1.5 text-sm text-[#475569] dark:text-slate-400">OTP dikirim ke <span className="font-semibold text-[#0F172A] dark:text-slate-200">{phone}</span></p>
            {hint && <p className="mt-2 inline-block rounded-lg bg-[#FFF7ED] px-3 py-1.5 text-xs font-semibold text-[#B45309] dark:bg-amber-950 dark:text-amber-300">{hint}</p>}
            <input
              type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6 digit" className="input mt-4 text-center text-2xl font-bold tracking-[0.5em]" autoFocus
              onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
            />
            {error && <p className="mt-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
            <button onClick={verifyOtp} disabled={loading} className="btn-primary mt-4 w-full disabled:opacity-60">
              {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
            </button>
            <button onClick={() => { setStep(1); setError(""); }} className="mt-3 w-full text-center text-sm font-medium text-[#4F46E5] hover:underline dark:text-indigo-400">Ganti nomor</button>
          </>
        )}

        {step === 3 && (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF5] text-3xl dark:bg-emerald-950">🎉</div>
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-slate-50">Berhasil Masuk!</h2>
            <p className="mt-1.5 text-sm text-[#475569] dark:text-slate-400">Selamat berbelanja di Nandz Store.</p>
            <button onClick={close} className="btn-primary mt-6 w-full">Mulai Belanja</button>
          </div>
        )}
      </div>
    </div>
  );
}
