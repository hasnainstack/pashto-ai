"use client";

import { useEffect, useState } from "react";
import { getXP, getLevel, getXPProgress, getLearnedIds } from "@/lib/xp";
import { getStreak } from "@/lib/streak";
import { VOCABULARY } from "@/lib/vocabulary";

type GameMode = "quick-quiz" | "type-answer" | "listening" | "match" | "speed";

interface Props {
  onStart: (mode: GameMode) => void;
}

const MODES: {
  id: GameMode;
  icon: string;
  name: string;
  desc: string;
  difficulty: string;
  xp: string;
  color: string;
}[] = [
  {
    id: "quick-quiz",
    icon: "🧠",
    name: "Quick Quiz",
    desc: "Choose the correct meaning",
    difficulty: "Easy",
    xp: "+10 XP per correct",
    color: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  },
  {
    id: "type-answer",
    icon: "✍️",
    name: "Type the Answer",
    desc: "Recall the Pashto word yourself",
    difficulty: "Medium",
    xp: "+15 XP per correct",
    color: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  },
  {
    id: "listening",
    icon: "🎧",
    name: "Listening Challenge",
    desc: "Listen and identify the word",
    difficulty: "Medium",
    xp: "+15 XP per correct",
    color: "from-teal-500/20 to-teal-600/10 border-teal-500/30",
  },
  {
    id: "match",
    icon: "🔗",
    name: "Match Words",
    desc: "Match Pashto words with their meanings",
    difficulty: "Medium",
    xp: "+20 XP total",
    color: "from-green-500/20 to-green-600/10 border-green-500/30",
  },
  {
    id: "speed",
    icon: "⚡",
    name: "Speed Round",
    desc: "Answer as many as possible in 60 seconds",
    difficulty: "Hard",
    xp: "Variable XP",
    color: "from-orange-500/20 to-orange-600/10 border-orange-500/30",
  },
];

export default function PracticeDashboard({ onStart }: Props) {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [xpPct, setXpPct] = useState(0);
  const [streak, setStreak] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    setXp(getXP());
    setLevel(getLevel());
    setXpPct(getXPProgress());
    setStreak(getStreak());
    const ids = getLearnedIds();
    setLearnedCount(ids.length > 0 ? ids.length : VOCABULARY.length);
  }, []);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 fade-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white tracking-tight">PRACTICE</h2>
        <p className="text-slate-400 mt-1">Test your Pashto and earn XP</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon="🔥" label="Streak" value={String(streak)} accent="text-orange-400" />
        <StatCard icon="⭐" label="XP" value={String(xp)} accent="text-yellow-400" />
        <StatCard icon="🏅" label="Level" value={String(level)} accent="text-brand-400" />
        <StatCard icon="📚" label="Words" value={String(learnedCount)} accent="text-blue-400" />
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>Level {level}</span>
          <span>{xpPct} / 100 XP to next level</span>
        </div>
        <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 xp-bar transition-all duration-700"
            style={{ width: `${xpPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODES.map((m) => (
          <div
            key={m.id}
            className={`glass-card rounded-2xl p-5 border bg-gradient-to-br ${m.color} flex flex-col gap-3 glass-card-hover`}
          >
            <div className="flex items-start justify-between">
              <span className="text-3xl">{m.icon}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                {m.difficulty}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-base">{m.name}</h3>
              <p className="text-slate-400 text-sm mt-0.5">{m.desc}</p>
            </div>
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/10">
              <span className="text-brand-400 text-xs font-semibold">{m.xp}</span>
              <button onClick={() => onStart(m.id)} className="btn-primary text-sm px-5 py-2">
                Start →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="glass-card rounded-2xl p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
