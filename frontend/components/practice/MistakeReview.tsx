"use client";

import { VOCABULARY } from "@/lib/vocabulary";
import { getMistakeIds } from "@/lib/xp";

interface Props {
  mistakeIds: string[];
  onPracticeAgain: () => void;
  onBack: () => void;
}

export default function MistakeReview({ mistakeIds, onPracticeAgain, onBack }: Props) {
  const allMistakes = mistakeIds.length > 0 ? mistakeIds : getMistakeIds();
  const words = VOCABULARY.filter((w) => allMistakes.includes(w.id));

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 fade-up">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
        <h2 className="text-white font-bold">WORDS TO REVIEW</h2>
        <div />
      </div>

      {words.length === 0 ? (
        <div className="glass-card rounded-3xl p-10 text-center">
          <p className="text-white font-bold text-lg">No mistakes to review!</p>
          <p className="text-slate-400 text-sm mt-1">You&apos;re doing great.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {words.map((word) => (
            <div key={word.id} className="glass-card rounded-2xl p-5 border border-orange-500/20 bg-orange-500/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3
                    className="text-3xl font-bold text-white pashto-glow"
                    dir="rtl"
                    lang="ps"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    {word.pashto}
                  </h3>
                  <p className="text-brand-400 italic text-sm mt-1">{word.transliteration}</p>
                  <p className="text-slate-300 font-semibold mt-1">{word.english}</p>
                </div>
                <span className="text-orange-400 text-xs bg-orange-500/10 px-2 py-1 rounded-full whitespace-nowrap">
                  You missed this
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={onPracticeAgain} className="btn-primary w-full">
        Practice Again
      </button>
    </div>
  );
}
