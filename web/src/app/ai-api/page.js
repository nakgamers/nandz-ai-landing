"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

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
    } catch { /* server build: skip */ }
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
        <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
          AI API — untuk Developer
        </span>
        <h1 className="mt-4 text-3xl font-bold sm:text-4xl">Pasang AI ke Produkmu</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Satu API key untuk Claude, GPT, DeepSeek, Qwen, dan GLM.{" "}
          <strong>Bayar sesuai pemakaian — dihitung per token</strong>, tanpa langganan dan tanpa kuota hangus.
        </p>
      </div>

      {/* API Key demo */}
      <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900">
        <label className="text-sm font-medium">API Key (demo)</label>
        <div className="mt-2 flex gap-2">
          <input value={key} onChange={(e) => setKey(e.target.value)} className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-800" />
          <button onClick={copy} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-medium hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">
            {copied ? "✓ Tersalin" : "Salin"}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">Key gk-... dikirim otomatis setelah pembelian produk AI API. Di sini pakai key demo dengan saldo Rp 100.000.</p>
      </div>

      {/* Model list */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {models.map((m) => (
          <div key={m.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{m.name}</h3>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500 dark:bg-slate-800">{m.provider}</span>
            </div>
            <code className="mt-2 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">{m.id}</code>
            <div className="mt-3 text-xs text-slate-500">
              <p>Input: <strong className="text-slate-700 dark:text-slate-200">${m.input_price_per_1m}/1M token</strong></p>
              <p>Output: <strong className="text-slate-700 dark:text-slate-200">${m.output_price_per_1m}/1M token</strong></p>
            </div>
            <button onClick={() => test(m)} className="mt-4 w-full rounded-xl gradient-bg py-2 text-xs font-semibold text-white transition hover:opacity-90">
              Tes Langsung
            </button>
          </div>
        ))}
      </div>

      {/* Response */}
      <textarea value={resp} readOnly rows={6} placeholder="Respons API akan muncul di sini..."
        className="mt-6 w-full rounded-2xl border border-slate-300 bg-slate-950 p-4 font-mono text-xs text-emerald-300 focus:outline-none dark:border-slate-700" />

      {/* Docs singkat */}
      <div className="mt-10 rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
        <h2 className="text-lg font-bold">Cara Pakai</h2>
        <div className="mt-4 space-y-3 text-sm">
          <div>
            <h4 className="font-semibold">1. Base URL (OpenAI-compatible)</h4>
            <code className="mt-1 block rounded bg-slate-100 px-3 py-2 font-mono text-xs dark:bg-slate-800">http://localhost:3000/api/v1</code>
          </div>
          <div>
            <h4 className="font-semibold">2. Endpoint</h4>
            <code className="mt-1 block rounded bg-slate-100 px-3 py-2 font-mono text-xs dark:bg-slate-800">POST /api/v1/chat/completions (OpenAI) · /api/v1/messages (Anthropic)</code>
          </div>
          <div>
            <h4 className="font-semibold">3. Header</h4>
            <code className="mt-1 block rounded bg-slate-100 px-3 py-2 font-mono text-xs dark:bg-slate-800">Authorization: Bearer gk-...</code>
          </div>
          <div>
            <h4 className="font-semibold">4. Contoh (curl)</h4>
            <pre className="overflow-x-auto rounded bg-slate-950 p-3 text-xs text-emerald-300">{`curl http://localhost:3000/api/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer gk-demo-...03e" \\
  -d '{"model":"gk/claude-sonnet-5","messages":[{"role":"user","content":"Halo"}]}'`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/products?type=ai" className="inline-block rounded-xl gradient-bg px-8 py-3 text-sm font-semibold text-white shadow-lg hover:opacity-90">
          Beli API Key
        </Link>
      </div>
    </main>
  );
}