"use client";

import { useState, useRef } from "react";
import { translateToEnglish } from "@/lib/api";

interface HistoryEntry {
  input: string;
  english: string;
}

export default function PashtoToEnglishPage() {
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
      const english = await translateToEnglish(input.trim());
      setOutput(english);
      setHistory((h) => [{ input: input.trim(), english }, ...h].slice(0, 10));
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

  const EXAMPLES = [
    { input: "ستا نوم څه دی؟", label: "Pashto script" },
    { input: "sta num tse de?", label: "Roman Pashto" },
    { input: "ze stargo yum, kor ta dzum", label: "Roman sentence" },
    { input: "کتاب، اوبه، ملګری", label: "Mixed words" },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 fade-up">

      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">PASHTO → ENGLISH</h2>
        <p className="text-slate-400 mt-1">Translate Pashto script or Roman Pashto to English</p>
      </div>

      {/* Input mode badges */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {["Pashto Script ✓", "Roman Pashto ✓", "Mixed ✓"].map((badge) => (
          <span key={badge} className="text-xs px-3 py-1 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-400 font-medium">
            {badge}
          </span>
        ))}
      </div>

      {/* Main card */}
      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">

        {/* Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Pashto Input
          </label>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
            dir="auto"
            lang="ps"
            placeholder={"Type Pashto script: ستا نوم څه دی؟\nOr Roman Pashto: sta num tse de?\nOr mix both freely…"}
            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-brand-500/60 transition-colors text-base resize-none leading-relaxed"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
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
            "Translate to English →"
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
                English Translation
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-slate-400 hover:text-brand-400 transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy ↗"}
              </button>
            </div>
            <div className="bg-brand-500/5 border border-brand-500/20 rounded-2xl px-5 py-4">
              <p className="text-2xl font-semibold text-white leading-relaxed">
                {output}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Examples */}
      <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Try these</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.input}
              onClick={() => { setInput(ex.input); setOutput(""); setError(""); textareaRef.current?.focus(); }}
              className="flex items-center justify-between glass-card rounded-xl px-3 py-2.5 hover:border-brand-500/30 transition-colors text-left gap-3"
            >
              <span
                className="text-white text-sm flex-1"
                dir="auto" lang="ps"
                style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
              >
                {ex.input}
              </span>
              <span className="text-xs text-slate-500 whitespace-nowrap">{ex.label}</span>
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
                  onClick={() => { setInput(entry.input); setOutput(entry.english); setError(""); }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors text-left gap-3"
                >
                  <span
                    className="text-slate-300 text-sm truncate max-w-[45%]"
                    dir="auto" lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {entry.input}
                  </span>
                  <span className="text-brand-400 text-sm truncate max-w-[45%] text-right">
                    {entry.english}
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
