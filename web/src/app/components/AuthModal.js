"use client";

import { useState } from "react";

export default function AuthModal({ onClose, onLogin }) {
  const [step, setStep] = useState("phone"); // phone | otp | done
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const requestOTP = async () => {
    if (!phone.match(/^08\d{8,11}$/)) {
      setErr("Nomor HP tidak valid. Format: 08xxxxxxxxxx");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/otp/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal");
      setMsg(`Kode OTP dikirim ke ${phone} (dev: ${data.code})`);
      setStep("otp");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (otp.length < 4) {
      setErr("Masukkan kode OTP");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP salah");
      setMsg("Login berhasil!");
      setStep("done");
      if (onLogin) onLogin(data.user, data.token);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="card mx-4 w-full max-w-sm p-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-light text-[#061b31] dark:text-slate-100">
            {step === "phone" ? "Masuk / Daftar" : step === "otp" ? "Verifikasi OTP" : "Berhasil"}
          </h2>
          <button onClick={onClose} className="text-[#64748d] hover:text-[#061b31]">&times;</button>
        </div>

        {err && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{err}</div>}
        {msg && <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{msg}</div>}

        {step === "phone" && (
          <div className="space-y-4">
            <p className="text-sm text-[#64748d]">Masukkan nomor WhatsApp untuk login. Kode OTP akan dikirim otomatis.</p>
            <input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && requestOTP()}
              className="input"
              autoFocus
            />
            <button onClick={requestOTP} disabled={loading} className="btn-primary w-full">
              {loading ? "Mengirim..." : "Kirim OTP"}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div className="space-y-4">
            <p className="text-sm text-[#64748d]">Masukkan kode 6 digit yang dikirim ke {phone}.</p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => e.key === "Enter" && verifyOTP()}
              className="input text-center text-lg tracking-widest"
              autoFocus
            />
            <button onClick={verifyOTP} disabled={loading} className="btn-primary w-full">
              {loading ? "Verifikasi..." : "Verifikasi"}
            </button>
            <button onClick={() => { setStep("phone"); setOtp(""); setErr(""); }} className="w-full text-center text-sm text-[#533afd] hover:underline">
              Ganti nomor HP
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">✅</div>
            <p className="text-sm text-[#64748d]">Kamu sudah login. Tutup modal untuk lanjut belanja.</p>
            <button onClick={onClose} className="btn-primary w-full">Lanjut Belanja</button>
          </div>
        )}
      </div>
    </div>
  );
}