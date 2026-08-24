"use client";

import { useState, useEffect, useRef } from "react";
import { VOCABULARY, VocabWord } from "@/lib/vocabulary";
import { transliterateRoman } from "@/lib/api";

type AIResult = { pashto: string } | null;

export default function VocabInput() {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<VocabWord[]>([]);
  const [aiResult, setAiResult] = useState<AIResult>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function searchLocal(text: string): VocabWord[] {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return VOCABULARY.filter(
      (w) =>
        w.pashto.includes(text.trim()) ||
        w.english.toLowerCase().includes(q) ||
        w.transliteration.toLowerCase().includes(q)
    ).slice(0, 8);
  }

  useEffect(() => {
    const q = query.trim();

    // Reset AI state on every keystroke
    setAiResult(null);
    setAiError("");

    if (!q) {
      setLocalResults([]);
      return;
    }

    const local = searchLocal(query);
    setLocalResults(local);

    // If no local matches, debounce an AI call
    if (local.length === 0) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setAiLoading(true);
        try {
          const pashto = await transliterateRoman(q);
          setAiResult({ pashto });
        } catch {
          setAiError("AI translation unavailable");
        } finally {
          setAiLoading(false);
        }
      }, 600);
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    }

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const showResults = query.trim().length > 0;

  return (
    <div className="w-full flex flex-col gap-3">

      {/* Single search input */}
      <div className="flex items-center gap-3 glass-card rounded-2xl px-4 py-3 focus-within:border-brand-500/50 border border-white/10 transition-colors">
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          dir="auto"
          lang="ps"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Pashto, English, Roman… or type anything for AI"
          className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 outline-none text-sm"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setLocalResults([]); setAiResult(null); setAiError(""); }}
            className="text-slate-500 hover:text-slate-300 transition-colors text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Results panel */}
      {showResults && (
        <div className="glass-card rounded-2xl overflow-hidden">

          {/* Local vocabulary matches */}
          {localResults.length > 0 && (
            <ul className="divide-y divide-white/5">
              {localResults.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => { setQuery(w.pashto); setLocalResults([]); }}
                >
                  <span
                    className="text-lg font-bold text-white"
                    dir="rtl" lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {w.pashto}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-slate-300">{w.english}</p>
                    <p className="text-xs text-slate-500 italic">{w.transliteration}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {/* AI fallback — only shown when no local results */}
          {localResults.length === 0 && (
            <div className="px-4 py-3">
              {aiLoading && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <span className="animate-spin inline-block">&#8635;</span>
                  <span>Asking AI…</span>
                </div>
              )}

              {aiError && !aiLoading && (
                <p className="text-red-400 text-xs">{aiError}</p>
              )}

              {aiResult && !aiLoading && (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-400 font-semibold uppercase tracking-wider">
                      AI Translation
                    </span>
                    <button
                      onClick={() => navigator.clipboard?.writeText(aiResult.pashto)}
                      className="text-xs text-slate-500 hover:text-brand-400 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <p
                    className="text-2xl font-bold text-white pashto-glow text-right leading-relaxed"
                    dir="rtl" lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {aiResult.pashto}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Not in the 720-word vocabulary — translated by AI
                  </p>
                </div>
              )}

              {!aiLoading && !aiResult && !aiError && (
                <p className="text-slate-500 text-sm">No matches — searching AI…</p>
              )}
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-slate-600">
        Searches 720 words instantly · AI translates anything not found
      </p>
    </div>
  );
}
