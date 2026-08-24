"use client";

import { useState, useEffect } from "react";
import { generateQuizQuestions, QuizQuestion } from "@/lib/practice";
import { addXP, recordMistake, recordPracticed, clearMistake } from "@/lib/xp";
import { incrementStreak } from "@/lib/streak";

const TOTAL = 10;
const XP_PER = 10;

interface SessionResult {
  correct: number;
  incorrect: number;
  xpEarned: number;
  mistakes: string[];
}

interface Props {
  onComplete: (result: SessionResult) => void;
  onBack: () => void;
}

export default function QuickQuiz({ onComplete, onBack }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [lives, setLives] = useState(3);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    setQuestions(generateQuizQuestions(TOTAL));
  }, []);

  if (!questions.length) return null;

  const q = questions[current];
  const progress = ((current) / TOTAL) * 100;
  const isAnswered = selected !== null;
  const isCorrect = selected === q.correctIndex;

  function handleSelect(idx: number) {
    if (isAnswered) return;
    setSelected(idx);
    if (idx === q.correctIndex) {
      const earned = addXP(XP_PER);
      setCorrect((c) => c + 1);
      setXpEarned((x) => x + XP_PER);
      clearMistake(q.word.id);
      recordPracticed(q.word.id);
      incrementStreak();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
      void earned;
    } else {
      setLives((l) => l - 1);
      recordMistake(q.word.id);
      setMistakes((m) => [...m, q.word.id]);
    }
  }

  function handleContinue() {
    if (current + 1 >= TOTAL || lives <= 0) {
      onComplete({ correct, incorrect: TOTAL - correct, xpEarned, mistakes });
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 fade-up">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className={`text-sm font-bold ${i < lives ? "text-red-400" : "text-slate-700"}`}>&#9829;</span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1">
          <span className="text-yellow-400 text-sm font-bold">{xpEarned} XP</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <div className="glass-card rounded-3xl p-7 flex flex-col gap-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-400 text-center">
          Question {current + 1} / {TOTAL}
        </p>
        <p className="text-slate-300 text-center text-sm">What does this word mean?</p>

        <div className="text-center">
          <h2
            className="text-5xl font-bold text-white pashto-glow leading-tight"
            dir="rtl"
            lang="ps"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
          >
            {q.word.pashto}
          </h2>
          <p className="text-brand-400 italic mt-2">{q.word.transliteration}</p>
        </div>

        {/* XP pop */}
        {showXP && (
          <div className="text-center text-green-400 font-bold text-lg xp-pop">+{XP_PER} XP!</div>
        )}

        {/* Choices */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {q.choices.map((choice, idx) => {
            let cls = "answer-option";
            if (isAnswered) {
              if (idx === q.correctIndex) cls += " correct";
              else if (idx === selected) cls += " incorrect";
              else cls += " dimmed";
            }
            return (
              <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                {choice}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {isAnswered && (
          <div className={`rounded-2xl p-3 text-center text-sm font-semibold ${isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {isCorrect ? "Correct!" : `Correct answer: ${q.word.english}`}
          </div>
        )}

        {isAnswered && (
          <button onClick={handleContinue} className="btn-primary w-full">
            {current + 1 >= TOTAL || lives <= 0 ? "See Results" : "Continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
