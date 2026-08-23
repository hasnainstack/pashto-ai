"use client";

import { useState } from "react";
import { VOCABULARY, VocabWord } from "@/lib/vocabulary";

export default function VocabInput() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VocabWord[] | null>(null);

  const search = (text: string) => {
    const q = text.trim().toLowerCase();
    if (!q) { setResults(null); return; }
    setResults(
      VOCABULARY.filter(
        (w) =>
          w.pashto.includes(text.trim()) ||
          w.english.toLowerCase().includes(q) ||
          w.transliteration.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <div className="w-full">
      {/* Search input */}
      <div className="flex items-center gap-3 glass-card rounded-2xl px-4 py-3 focus-within:border-brand-500/50 transition-colors">
        <svg className="w-4 h-4 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          dir="auto"
          lang="ps"
          value={query}
          onChange={handleChange}
          placeholder="Search in Pashto, English, or transliteration…"
          className="flex-1 bg-transparent text-slate-200 placeholder:text-slate-500 outline-none text-sm"
          aria-label="Vocabulary search"
        />
        {query && (
          <button onClick={() => { setQuery(""); setResults(null); }} className="text-slate-500 hover:text-slate-300 transition-colors">
            ✕
          </button>
        )}
      </div>

      {/* Results */}
      {results !== null && (
        <div className="mt-2 glass-card rounded-2xl overflow-hidden">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No matches found.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {results.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between px-4 py-3 hover:bg-white/5 cursor-pointer transition-colors"
                  onClick={() => { setQuery(w.pashto); setResults(null); }}
                >
                  <span className="text-lg font-bold text-white" dir="rtl" lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
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
        </div>
      )}
    </div>
  );
}
