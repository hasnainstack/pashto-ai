"use client";

import { useState, useRef } from "react";
import { transliterateRoman } from "@/lib/api";

interface HistoryEntry {
  roman: string;
  pashto: string;
}

export default function TranslatorPage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleTranslate() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError("");
    setOutput("");
    try {
      const pashto = await transliterateRoman(input.trim());
      setOutput(pashto);
      setHistory((h) => [{ roman: input.trim(), pashto }, ...h].slice(0, 10));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleTranslate();
    }
  }

  function loadHistory(entry: HistoryEntry) {
    setInput(entry.roman);
    setOutput(entry.pashto);
    setError("");
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 fade-up">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">TRANSLATOR</h2>
        <p className="text-slate-400 mt-1">Roman Pashto → Pashto Script</p>
      </div>

      {/* Main translator card */}
      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Roman / Transliteration
          </label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            placeholder={"e.g. sta num tse de?\nze pashto zda kawum\nkitab, obeh, malgari..."}
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors text-sm resize-none leading-relaxed"
          />
          <p className="text-xs text-slate-600 text-right">Ctrl+Enter to translate</p>
        </div>

        {/* Translate button */}
        <button
          onClick={handleTranslate}
          disabled={loading || !input.trim()}
          className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin inline-block">⟳</span> Translating…
            </span>
          ) : (
            "Translate →"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Output */}
        {output && !error && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-widest text-brand-400">
                Pashto Script
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-1"
              >
                {copied ? "✓ Copied!" : "Copy ↗"}
              </button>
            </div>
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-2xl px-5 py-4">
              <p
                className="text-3xl font-bold text-white pashto-glow text-right leading-relaxed"
                dir="rtl"
                lang="ps"
                style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              >
                {output}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Tips card */}
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tips</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
          {[
            ["sta num tse de?", "ستا نوم څه دی؟"],
            ["ze pashto zda kawum", "زه پښتو زده کوم"],
            ["kitab", "کتاب"],
            ["obeh, malgari, kor", "اوبه، ملګری، کور"],
          ].map(([roman, pashto]) => (
            <button
              key={roman}
              onClick={() => { setInput(roman); setOutput(""); setError(""); textareaRef.current?.focus(); }}
              className="flex items-center justify-between glass-card rounded-xl px-3 py-2 hover:border-brand-500/30 transition-colors text-left"
            >
              <span className="text-slate-400">{roman}</span>
              <span dir="rtl" lang="ps" className="text-brand-400" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                {pashto}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Recent</p>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              Clear
            </button>
          </div>
          <ul className="flex flex-col gap-1">
            {history.map((entry, i) => (
              <li key={i}>
                <button
                  onClick={() => loadHistory(entry)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <span className="text-slate-400 text-sm truncate max-w-[45%]">{entry.roman}</span>
                  <span
                    className="text-white text-base truncate max-w-[45%] text-right"
                    dir="rtl" lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {entry.pashto}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
