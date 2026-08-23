"use client";

import { useState, useEffect, useCallback } from "react";
import { generateQuizQuestions, QuizQuestion } from "@/lib/practice";
import { addXP, recordMistake, recordPracticed, clearMistake } from "@/lib/xp";
import { incrementStreak } from "@/lib/streak";
import { VOCABULARY } from "@/lib/vocabulary";

const TOTAL = 10;
const XP_PER = 15;

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

export default function ListeningChallenge({ onComplete, onBack }: Props) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    setQuestions(generateQuizQuestions(TOTAL));
  }, []);

  const q = questions[current];

  const speak = useCallback(() => {
    if (!q || speaking) return;
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(q.word.pashto);
    utt.lang = "ps";
    utt.rate = 0.85;
    utt.onstart = () => setSpeaking(true);
    utt.onend = () => { setSpeaking(false); setHasPlayed(true); };
    utt.onerror = () => { setSpeaking(false); setHasPlayed(true); };
    window.speechSynthesis.speak(utt);
  }, [q, speaking]);

  // Auto-play when question changes
  useEffect(() => {
    if (q) {
      setHasPlayed(false);
      setTimeout(speak, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, questions.length]);

  if (!questions.length || !q) return null;

  const isAnswered = selected !== null;
  const isCorrect = selected === q.correctIndex;
  const progress = (current / TOTAL) * 100;

  function handleSelect(idx: number) {
    if (isAnswered) return;
    setSelected(idx);
    if (idx === q.correctIndex) {
      addXP(XP_PER);
      setCorrect((c) => c + 1);
      setXpEarned((x) => x + XP_PER);
      clearMistake(q.word.id);
      recordPracticed(q.word.id);
      incrementStreak();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
    } else {
      recordMistake(q.word.id);
      setMistakes((m) => [...m, q.word.id]);
    }
  }

  function handleContinue() {
    if (current + 1 >= TOTAL) {
      onComplete({ correct, incorrect: TOTAL - correct, xpEarned, mistakes });
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-5 fade-up">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
        <p className="text-xs text-slate-400">Question {current + 1} / {TOTAL}</p>
        <div className="glass-card rounded-full px-3 py-1">
          <span className="text-yellow-400 text-sm font-bold">⭐ {xpEarned} XP</span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glass-card rounded-3xl p-7 flex flex-col gap-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 text-center">
          LISTENING CHALLENGE
        </p>

        {/* Play button */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={speak}
            disabled={speaking}
            className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl transition-all duration-200 ${
              speaking
                ? "bg-teal-500/40 scale-95 animate-pulse"
                : "bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40"
            }`}
          >
            🔊
          </button>
          <p className="text-slate-400 text-sm">
            {speaking ? "Playing..." : hasPlayed ? "Tap to replay" : "Tap to play"}
          </p>
          <p className="text-slate-300 text-sm font-medium">What word did you hear?</p>
        </div>

        {showXP && <div className="text-center text-green-400 font-bold text-lg xp-pop">+{XP_PER} XP!</div>}

        {/* Choices — show Pashto options */}
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, idx) => {
            const match = VOCABULARY.find((w) => w.english === choice);
            const pashtoLabel = match?.pashto || choice;

            let cls = "answer-option";
            if (isAnswered) {
              if (idx === q.correctIndex) cls += " correct";
              else if (idx === selected) cls += " incorrect";
              else cls += " dimmed";
            }
            return (
              <button key={idx} className={cls} onClick={() => handleSelect(idx)}>
                <span dir="rtl" lang="ps" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: "1.1rem" }}>
                  {pashtoLabel}
                </span>
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`rounded-2xl p-3 text-center text-sm font-semibold ${isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {isCorrect
              ? "🎉 Correct!"
              : <span>Correct: <span dir="rtl" lang="ps" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>{q.word.pashto}</span> — {q.word.english}</span>}
          </div>
        )}

        {isAnswered && (
          <button onClick={handleContinue} className="btn-primary w-full">
            {current + 1 >= TOTAL ? "See Results" : "Continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
