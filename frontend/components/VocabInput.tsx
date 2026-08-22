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
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-500">
        <input
          type="text"
          dir="auto"
          lang="ps"
          value={query}
          onChange={handleChange}
          placeholder="Search in Pashto, English, or transliteration…"
          className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-base"
          aria-label="Vocabulary search"
        />
      </div>

      {results !== null && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">No matches found.</li>
          ) : (
            results.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer"
                onClick={() => { setQuery(w.pashto); setResults(null); }}
              >
                <span className="text-xl font-bold" dir="rtl" lang="ps">{w.pashto}</span>
                <span className="text-sm text-slate-500">{w.english}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
