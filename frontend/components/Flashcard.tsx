"use client";

import { VocabWord } from "@/lib/vocabulary";

interface FlashcardProps {
  word: VocabWord;
  wordIndex: number;
  total: number;
  onNext: () => void;
}

export default function Flashcard({ word, wordIndex, total, onNext }: FlashcardProps) {
  const progress = ((wordIndex + 1) / total) * 100;

  return (
    <div className="glass-card glass-card-hover rounded-3xl p-8 w-full fade-up">
      {/* Label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 mb-6 text-center">
        Learn this word
      </p>

      {/* Pashto word */}
      <div className="text-center mb-6">
        <h2
          className="text-6xl font-bold text-white pashto-glow leading-tight mb-3"
          dir="rtl"
          lang="ps"
          style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
        >
          {word.pashto}
        </h2>
        <p className="text-brand-400 text-lg italic tracking-wide">{word.transliteration}</p>
        <p className="text-slate-300 text-xl mt-2 font-medium">{word.english}</p>
      </div>

      {/* Divider */}
      <div className="border-t border-white/10 my-6" />

      {/* Next button */}
      <button type="button" onClick={onNext} className="btn-primary w-full text-base">
        Next word →
      </button>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Word {wordIndex + 1}</span>
          <span>{total} total</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
