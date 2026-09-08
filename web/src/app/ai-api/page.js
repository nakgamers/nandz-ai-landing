"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const aiLogos = {
  Claude: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/claude-color.svg",
  GPT: "/products/chatgpt-plus.png",
  DeepSeek: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/deepseek-color.svg",
  Qwen: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/qwen-color.svg",
  GLM: "https://cdn.jsdelivr.net/npm/@lobehub/icons-static-svg/icons/chatglm-color.svg",
};

export default function AiApiPage() {
  const [models, setModels] = useState([]);
  const [key, setKey] = useState("gk-demo-00000000000000000000003e");
  const [msg, setMsg] = useState("Halo, siapa kamu?");
  const [resp, setResp] = useState("");
  const [copied, setCopied] = useState(false);

  const loadModels = async () => {
    try {
      const res = await fetch("/api/v1/ai/models");
      const data = await res.json();
      setModels(data.models || []);
    } catch { /* skip */ }
  };
  useEffect(() => { loadModels(); }, []);

  const test = async (m) => {
    setResp("...");
    try {
      const res = await fetch("/api/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model: m.id, messages: [{ role: "user", content: msg }] }),
      });
      const data = await res.json();
      setResp(JSON.stringify(data, null, 2));
    } catch (e) {
      setResp("Error: " + e.message);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E0E7FF] bg-[#F5F3FF] px-4 py-1.5 text-xs font-semibold text-[#4F46E5] dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5]"></span>
          AI API — untuk Developer
        </span>
        <h1 className="mt-4 text-3xl font-bold text-[#0F172A] dark:text-white sm:text-4xl">Pasang AI ke Produkmu</h1>
        <p className="mx-auto mt-3 max-w-2xl text-[#475569] dark:text-slate-300">
          Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
          <strong className="text-[#0F172A] dark:text-white">Bayar sesuai pemakaian — dihitung per token</strong>.
        </p>
      </div>

      {/* API Key */}
      <div className="card mt-8 p-6">
        <label className="text-sm font-semibold text-[#0F172A] dark:text-white">API Key (demo)</label>
        <div className="mt-2 flex gap-2">
          <input value={key} onChange={(e) => setKey(e.target.value)}
            className="input flex-1 font-mono text-xs" />
          <button onClick={copy}
            className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-xs font-semibold text-[#334155] transition hover:bg-[#F5F3FF] hover:text-[#4F46E5] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {copied ? "✓ Tersalin" : "Salin"}
          </button>
        </div>
        <p className="mt-2 text-xs text-[#64748B] dark:text-slate-400">Key dengan saldo Rp 100.000 untuk demo. Key asli setelah pembelian.</p>
      </div>

      {/* Model grid */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {models.map((m) => (
          <div key={m.id} className="card p-4">
            <div className="mb-2 flex items-center justify-between">
              {aiLogos[m.name] ? (
                <img src={aiLogos[m.name]} alt={m.name} className="h-7 w-7 rounded object-contain" loading="lazy" />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-[#F5F3FF] text-xs font-bold text-[#4F46E5] dark:bg-indigo-950 dark:text-indigo-300">{m.name.slice(0, 1)}</div>
              )}
              <span className="rounded bg-[#F1F5F9] px-2 py-0.5 text-[10px] font-semibold text-[#475569] dark:bg-slate-700 dark:text-slate-300">{m.provider}</span>
            </div>
            <h3 className="text-sm font-bold text-[#0F172A] dark:text-slate-50">{m.name}</h3>
            <code className="mt-1 block truncate rounded bg-[#FAFAFA] px-1.5 py-0.5 text-[10px] text-[#64748B] dark:bg-slate-800 dark:text-slate-400">{m.id}</code>
            <div className="mt-2 text-[11px] text-[#64748B] dark:text-slate-400">
              <p>Input: <span className="font-semibold text-[#0F172A] dark:text-slate-100">${m.input_price_per_1m}/1M</span></p>
              <p>Output: <span className="font-semibold text-[#0F172A] dark:text-slate-100">${m.output_price_per_1m}/1M</span></p>
            </div>
            <button onClick={() => test(m)}
              className="btn-primary mt-3 w-full !py-2 text-xs">Tes Langsung</button>
          </div>
        ))}
      </div>

      {/* Response */}
      <textarea value={resp} readOnly rows={5}
        placeholder="Respons API akan muncul di sini..."
        className="mt-6 w-full rounded-xl border border-[#E2E8F0] bg-[#0F172A] p-4 font-mono text-xs text-emerald-400 focus:outline-none dark:border-slate-700" />

      {/* Docs */}
      <div className="card mt-10 p-6">
        <h2 className="text-lg font-bold text-[#0F172A] dark:text-white">Cara Pakai</h2>
        <div className="mt-4 space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-[#0F172A] dark:text-slate-200">1. Base URL</h4>
            <code className="mt-1 block rounded-lg bg-[#FAFAFA] px-3 py-2 font-mono text-xs text-[#475569] dark:bg-slate-800">http://localhost:3000/api/v1</code>
          </div>
          <div>
            <h4 className="font-semibold text-[#0F172A] dark:text-slate-200">2. Endpoint</h4>
            <code className="mt-1 block rounded-lg bg-[#FAFAFA] px-3 py-2 font-mono text-xs text-[#475569] dark:bg-slate-800">
POST /api/v1/chat/completions (OpenAI) · /api/v1/messages (Anthropic)
            </code>
          </div>
          <div>
            <h4 className="font-semibold text-[#0F172A] dark:text-slate-200">3. Header</h4>
            <code className="mt-1 block rounded-lg bg-[#FAFAFA] px-3 py-2 font-mono text-xs text-[#475569] dark:bg-slate-800">Authorization: Bearer gk-...</code>
          </div>
          <div>
            <h4 className="font-semibold text-[#0F172A] dark:text-slate-200">4. Contoh (curl)</h4>
            <pre className="overflow-x-auto rounded-lg bg-[#0F172A] p-3 text-xs text-emerald-400">{`curl http://localhost:3000/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer gk-..." \\
  -d '{"model":"gk/claude-sonnet-5","messages":[{"role":"user","content":"Halo"}]}'`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/products?type=ai" className="btn-primary shadow-[0_4px_14px_rgb(79_70_229/0.4)]">
          Beli API Key
        </Link>
      </div>
    </main>
  );
}