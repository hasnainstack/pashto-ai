"use client";

import { useState, useEffect, useRef } from "react";
import { getPracticePool } from "@/lib/practice";
import { VocabWord } from "@/lib/vocabulary";
import { addXP, recordMistake, recordPracticed, clearMistake } from "@/lib/xp";
import { incrementStreak } from "@/lib/streak";
import { transliterateToPashto } from "@/lib/pashtoTransliteration";
import PashtoKeyboard from "./PashtoKeyboard";

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

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function TypeAnswer({ onComplete, onBack }: Props) {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [mistakes, setMistakes] = useState<string[]>([]);
  const [showXP, setShowXP] = useState(false);
  const [showPashtoKeyboard, setShowPashtoKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setWords(getPracticePool(TOTAL));
  }, []);

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [current, submitted]);

  if (!words.length) return null;

  const word = words[current];
  const progress = (current / TOTAL) * 100;

  function handleCheck() {
    if (!input.trim() || submitted) return;
    const ok = normalize(input) === normalize(word.pashto);
    setIsCorrect(ok);
    setSubmitted(true);
    if (ok) {
      addXP(XP_PER);
      setCorrect((c) => c + 1);
      setXpEarned((x) => x + XP_PER);
      clearMistake(word.id);
      recordPracticed(word.id);
      incrementStreak();
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1000);
    } else {
      recordMistake(word.id);
      setMistakes((m) => [...m, word.id]);
    }
  }

  function handleContinue() {
    if (current + 1 >= TOTAL) {
      onComplete({ correct, incorrect: TOTAL - correct, xpEarned, mistakes });
    } else {
      setCurrent((c) => c + 1);
      setInput("");
      setSubmitted(false);
      setIsCorrect(false);
    }
  }

  function updateInput(value: string, cursor: number) {
    setInput(value);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(cursor, cursor);
    });
  }

  function insertCharacter(character: string) {
    if (submitted) return;

    const start = inputRef.current?.selectionStart ?? input.length;
    const end = inputRef.current?.selectionEnd ?? input.length;
    const nextValue = `${input.slice(0, start)}${character}${input.slice(end)}`;
    updateInput(nextValue, start + character.length);
  }

  function backspaceCharacter() {
    if (submitted) return;

    const start = inputRef.current?.selectionStart ?? input.length;
    const end = inputRef.current?.selectionEnd ?? input.length;
    if (start === 0 && end === 0) return;

    const deleteStart = start === end ? start - 1 : start;
    const nextValue = `${input.slice(0, deleteStart)}${input.slice(end)}`;
    updateInput(nextValue, deleteStart);
  }

  function clearInput() {
    if (!submitted) updateInput("", 0);
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
          className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="glass-card rounded-3xl p-7 flex flex-col gap-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-purple-400 text-center">
          TYPE THE ANSWER
        </p>
        <p className="text-slate-300 text-center text-sm">What is the Pashto word for:</p>

        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">&ldquo;{word.english}&rdquo;</h2>
          <p className="text-slate-500 text-sm mt-1 italic">{word.transliteration}</p>
        </div>

        {showXP && <div className="text-center text-green-400 font-bold text-lg xp-pop">+{XP_PER} XP!</div>}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(transliterateToPashto(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && !submitted && handleCheck()}
          disabled={submitted}
          dir="rtl"
          lang="ps"
          placeholder="Type in Pashto..."
          className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-3 text-white text-xl text-right placeholder:text-slate-600 focus:outline-none focus:border-purple-500/60 transition-colors"
          style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
        />

        <p className="-mt-2 text-center text-xs text-slate-500">
          Latin letters are converted to Pashto as you type.
        </p>

        {!submitted && (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowPashtoKeyboard((show) => !show)}
              className="self-center rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-purple-400/50 hover:bg-purple-500/10"
              aria-expanded={showPashtoKeyboard}
              aria-controls="pashto-keyboard"
            >
              Pashto Keyboard {showPashtoKeyboard ? "Hide" : "Show"}
            </button>

            {showPashtoKeyboard && (
              <div id="pashto-keyboard">
                <PashtoKeyboard
                  onInput={insertCharacter}
                  onBackspace={backspaceCharacter}
                  onClear={clearInput}
                />
              </div>
            )}
          </div>
        )}

        {submitted && (
          <div className={`rounded-2xl p-3 text-center text-sm font-semibold ${isCorrect ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
            {isCorrect
              ? "🎉 Correct!"
              : <span>Not quite! Correct answer: <span dir="rtl" lang="ps" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>{word.pashto}</span></span>}
          </div>
        )}

        {!submitted ? (
          <button onClick={handleCheck} className="btn-primary w-full" disabled={!input.trim()}>
            Check Answer
          </button>
        ) : (
          <button onClick={handleContinue} className="btn-primary w-full">
            {current + 1 >= TOTAL ? "See Results" : "Continue →"}
          </button>
        )}
      </div>
    </div>
  );
}
