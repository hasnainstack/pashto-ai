"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { generateQuizQuestions, QuizQuestion } from "@/lib/practice";
import { addXP, recordMistake, recordPracticed } from "@/lib/xp";

const TIME_LIMIT = 60;
const BASE_POINTS = 10;

interface Props {
  onBack: () => void;
}

type Phase = "ready" | "playing" | "done";

export default function SpeedRound({ onBack }: Props) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("done");
    const xp = Math.floor(score / 10);
    addXP(xp);
    setXpEarned(xp);
  }, [score]);

  useEffect(() => {
    if (phase === "playing") {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { endGame(); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, endGame]);

  function startGame() {
    const qs = generateQuizQuestions(100);
    setQuestions(qs);
    setQIndex(0);
    setTimeLeft(TIME_LIMIT);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    setXpEarned(0);
    setFlash(null);
    setPhase("playing");
  }

  function handleAnswer(idx: number) {
    if (phase !== "playing") return;
    const q = questions[qIndex];
    if (!q) return;

    if (idx === q.correctIndex) {
      const newCombo = combo + 1;
      const multiplier = Math.min(newCombo, 5);
      const pts = BASE_POINTS * multiplier;
      setScore((s) => s + pts);
      setCombo(newCombo);
      setBestCombo((b) => Math.max(b, newCombo));
      setCorrectCount((c) => c + 1);
      recordPracticed(q.word.id);
      setFlash("correct");
    } else {
      setCombo(0);
      setWrongCount((w) => w + 1);
      recordMistake(q.word.id);
      setFlash("wrong");
    }
    setTimeout(() => setFlash(null), 200);
    setQIndex((i) => i + 1);
  }

  const timerPct = (timeLeft / TIME_LIMIT) * 100;
  const timerColor = timeLeft > 20 ? "from-brand-500 to-brand-400" : timeLeft > 10 ? "from-orange-500 to-yellow-400" : "from-red-500 to-red-400";

  if (phase === "ready") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-6 fade-up">
        <button onClick={onBack} className="self-start text-slate-400 hover:text-white text-sm">← Back</button>
        <div className="glass-card rounded-3xl p-10 text-center flex flex-col gap-5">
          <h2 className="text-3xl font-bold text-white">SPEED ROUND</h2>
          <p className="text-slate-400">Answer as many questions as possible in 60 seconds. Build combos for bonus points!</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="glass-card rounded-xl p-3"><p className="text-orange-400 font-bold">x2</p><p className="text-xs text-slate-500">2 combo</p></div>
            <div className="glass-card rounded-xl p-3"><p className="text-orange-400 font-bold">x3</p><p className="text-xs text-slate-500">3 combo</p></div>
            <div className="glass-card rounded-xl p-3"><p className="text-orange-400 font-bold">x5</p><p className="text-xs text-slate-500">5+ combo</p></div>
          </div>
          <button onClick={startGame} className="btn-primary text-lg py-4">Start!</button>
        </div>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-6 fade-up">
        <div className="glass-card rounded-3xl p-8 text-center flex flex-col gap-4 w-full">
          <h2 className="text-3xl font-bold text-white">TIME&apos;S UP!</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Score" value={String(score)} accent="text-yellow-400" />
            <StatBox label="XP Earned" value={`+${xpEarned}`} accent="text-brand-400" />
            <StatBox label="Correct" value={String(correctCount)} accent="text-green-400" />
            <StatBox label="Wrong" value={String(wrongCount)} accent="text-red-400" />
            <StatBox label="Best Combo" value={`x${bestCombo}`} accent="text-orange-400" />
            <StatBox label="Accuracy" value={correctCount + wrongCount > 0 ? `${Math.round((correctCount / (correctCount + wrongCount)) * 100)}%` : "0%"} accent="text-blue-400" />
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={startGame} className="btn-primary flex-1">Try Again</button>
            <button onClick={onBack} className="flex-1 glass-card rounded-2xl px-4 py-3 text-slate-300 hover:text-white transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[qIndex];
  if (!q) return null;

  return (
    <div className={`max-w-lg mx-auto flex flex-col gap-4 fade-up transition-colors duration-150 ${flash === "correct" ? "correct-flash" : flash === "wrong" ? "wrong-flash" : ""}`}>
      {/* HUD */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">TIME</p>
          <p className={`text-2xl font-bold tabular-nums ${timeLeft <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}>
            {String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">COMBO</p>
          <p className={`text-2xl font-bold ${combo > 0 ? "text-orange-400" : "text-slate-600"}`}>
            x{combo}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-3 text-center">
          <p className="text-xs text-slate-500 mb-1">SCORE</p>
          <p className="text-2xl font-bold text-yellow-400 tabular-nums">{score}</p>
        </div>
      </div>

      {/* Timer bar */}
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${timerColor} transition-all duration-1000`}
          style={{ width: `${timerPct}%` }}
        />
      </div>

      {/* Question */}
      <div className="glass-card rounded-3xl p-6 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 text-center">SPEED ROUND</p>
        <p className="text-slate-300 text-center text-sm">What does this mean?</p>
        <div className="text-center">
          <h2
            className="text-5xl font-bold text-white pashto-glow"
            dir="rtl"
            lang="ps"
            style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
          >
            {q.word.pashto}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {q.choices.map((choice, idx) => (
            <button key={idx} className="answer-option" onClick={() => handleAnswer(idx)}>
              {choice}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass-card rounded-xl p-3 text-center">
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
