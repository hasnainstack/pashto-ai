"use client";

import { VocabWord } from "@/lib/vocabulary";

interface FlashcardProps {
  word: VocabWord;
  onNext: () => void;
}

export default function Flashcard({ word, onNext }: FlashcardProps) {
  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-500">
          Learn this word
        </p>
        <h2 className="mb-1 text-5xl font-bold" dir="rtl" lang="ps">
          {word.pashto}
        </h2>
        <p className="text-slate-400 italic">{word.transliteration}</p>
        <p className="mt-1 text-lg text-slate-600">{word.english}</p>
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onNext}
          className="rounded-2xl bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Next word →
        </button>
      </div>
    </div>
  );
}
