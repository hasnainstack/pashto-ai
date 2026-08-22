"use client";

import { useEffect, useState } from "react";
import Flashcard from "@/components/Flashcard";
import StreakDisplay from "@/components/StreakDisplay";
import VocabInput from "@/components/VocabInput";
import { VOCABULARY } from "@/lib/vocabulary";
import { getBestStreak, getStreak } from "@/lib/streak";

export default function HomePage() {
  const [wordIndex, setWordIndex] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    setStreak(getStreak());
    setBest(getBestStreak());
  }, []);

  const currentWord = VOCABULARY[wordIndex % VOCABULARY.length];

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <header className="mb-10 flex w-full max-w-md items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PashtoPro</h1>
          <p className="text-sm text-slate-400">Learn Pashto, one word at a time</p>
        </div>
        <StreakDisplay streak={streak} best={best} />
      </header>

      <Flashcard
        key={currentWord.id}
        word={currentWord}
        onNext={() => setWordIndex((i) => i + 1)}
      />

      <p className="mt-6 text-sm text-slate-400">Word {wordIndex + 1}</p>

      <section className="mt-10 flex flex-col items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Look up a word
        </p>
        <VocabInput />
      </section>
    </main>
  );
}
