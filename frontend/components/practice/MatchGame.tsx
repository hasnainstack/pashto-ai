"use client";

import { useState, useEffect } from "react";
import { generateMatchPairs, shuffle } from "@/lib/practice";
import { VocabWord } from "@/lib/vocabulary";
import { addXP, recordPracticed } from "@/lib/xp";

const PAIR_COUNT = 6;
const XP_TOTAL = 20;

interface Props {
  onBack: () => void;
}

type CardState = "idle" | "selected" | "matched" | "wrong";

interface Card {
  id: string;
  wordId: string;
  label: string;
  type: "pashto" | "english";
  state: CardState;
}

export default function MatchGame({ onBack }: Props) {
  const [cards, setCards] = useState<Card[]>([]);
  const [pashtoSelected, setPashtoSelected] = useState<string | null>(null);
  const [englishSelected, setEnglishSelected] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [wrongPair, setWrongPair] = useState(false);

  useEffect(() => {
    init();
  }, []);

  function init() {
    const words: VocabWord[] = generateMatchPairs(PAIR_COUNT);
    const pashtoCards: Card[] = words.map((w) => ({
      id: `p-${w.id}`,
      wordId: w.id,
      label: w.pashto,
      type: "pashto",
      state: "idle",
    }));
    const englishCards: Card[] = words.map((w) => ({
      id: `e-${w.id}`,
      wordId: w.id,
      label: w.english,
      type: "english",
      state: "idle",
    }));
    setCards([...shuffle(pashtoCards), ...shuffle(englishCards)]);
    setPashtoSelected(null);
    setEnglishSelected(null);
    setMatchedCount(0);
    setXpEarned(0);
    setDone(false);
    setWrongPair(false);
  }

  function updateCard(id: string, state: CardState) {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, state } : c)));
  }

  function handleSelect(card: Card) {
    if (card.state === "matched" || card.state === "selected") return;
    if (wrongPair) return;

    if (card.type === "pashto") {
      if (pashtoSelected) updateCard(pashtoSelected, "idle");
      setPashtoSelected(card.id);
      updateCard(card.id, "selected");
    } else {
      if (englishSelected) updateCard(englishSelected, "idle");
      setEnglishSelected(card.id);
      updateCard(card.id, "selected");
    }
  }

  // Check for match whenever both are selected
  useEffect(() => {
    if (!pashtoSelected || !englishSelected) return;
    const p = cards.find((c) => c.id === pashtoSelected);
    const e = cards.find((c) => c.id === englishSelected);
    if (!p || !e) return;

    if (p.wordId === e.wordId) {
      // Correct match
      updateCard(p.id, "matched");
      updateCard(e.id, "matched");
      setPashtoSelected(null);
      setEnglishSelected(null);
      const xpPer = Math.round(XP_TOTAL / PAIR_COUNT);
      addXP(xpPer);
      recordPracticed(p.wordId);
      setXpEarned((x) => x + xpPer);
      setMatchedCount((n) => {
        const next = n + 1;
        if (next >= PAIR_COUNT) setTimeout(() => setDone(true), 400);
        return next;
      });
    } else {
      // Wrong
      setWrongPair(true);
      updateCard(p.id, "wrong");
      updateCard(e.id, "wrong");
      setTimeout(() => {
        updateCard(p.id, "idle");
        updateCard(e.id, "idle");
        setPashtoSelected(null);
        setEnglishSelected(null);
        setWrongPair(false);
      }, 700);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pashtoSelected, englishSelected]);

  const pashtoCards = cards.filter((c) => c.type === "pashto");
  const englishCards = cards.filter((c) => c.type === "english");

  if (done) {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center gap-6 fade-up">
        <div className="glass-card rounded-3xl p-10 text-center flex flex-col gap-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-3xl font-bold text-white">COMPLETE!</h2>
          <p className="text-brand-400 text-xl font-bold">+{xpEarned} XP</p>
          <p className="text-slate-400">All {PAIR_COUNT} pairs matched!</p>
          <div className="flex gap-3 mt-4">
            <button onClick={init} className="btn-primary flex-1">Play Again</button>
            <button onClick={onBack} className="flex-1 glass-card rounded-2xl px-4 py-3 text-slate-300 hover:text-white transition-colors">
              Back to Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 fade-up">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm">← Back</button>
        <p className="text-xs font-semibold uppercase tracking-widest text-green-400">Match Words</p>
        <div className="glass-card rounded-full px-3 py-1">
          <span className="text-yellow-400 text-sm font-bold">⭐ {xpEarned} XP</span>
        </div>
      </div>

      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
          style={{ width: `${(matchedCount / PAIR_COUNT) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pashto column */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center">Pashto</p>
          {pashtoCards.map((card) => (
            <MatchCard key={card.id} card={card} onClick={() => handleSelect(card)} />
          ))}
        </div>
        {/* English column */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 text-center">English</p>
          {englishCards.map((card) => (
            <MatchCard key={card.id} card={card} onClick={() => handleSelect(card)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ card, onClick }: { card: Card; onClick: () => void }) {
  const base = "rounded-2xl p-3 text-center cursor-pointer transition-all duration-200 border text-sm font-medium min-h-[52px] flex items-center justify-center";
  const states: Record<CardState, string> = {
    idle: "glass-card border-white/10 text-slate-300 hover:border-white/25 hover:text-white",
    selected: "bg-brand-500/20 border-brand-500/60 text-white scale-105",
    matched: "bg-green-500/20 border-green-500/40 text-green-400 opacity-60 cursor-default",
    wrong: "bg-red-500/20 border-red-500/40 text-red-400 shake",
  };

  return (
    <button className={`${base} ${states[card.state]}`} onClick={onClick}>
      {card.type === "pashto" ? (
        <span dir="rtl" lang="ps" style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: "1.1rem" }}>
          {card.label}
        </span>
      ) : (
        card.label
      )}
    </button>
  );
}
