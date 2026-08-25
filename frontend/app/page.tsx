"use client";

import { useEffect, useState } from "react";
import Flashcard from "@/components/Flashcard";
import VocabInput from "@/components/VocabInput";
import PracticePage from "@/components/PracticePage";
import TranslatorPage from "@/components/TranslatorPage";
import PashtoToEnglishPage from "@/components/PashtoToEnglishPage";
import { fetchGeneratedVocab, VOCABULARY } from "@/lib/vocabulary";
import { getBestStreak, getStreak } from "@/lib/streak";
import { getXP, getLevel, markLearned } from "@/lib/xp";

const DAILY_GOAL = 10;
type Section = "learn" | "practice" | "translate" | "pashto-to-english";

const NAV_ITEMS: { label: string; id: Section }[] = [
  { label: "Learn", id: "learn" },
  { label: "Practice", id: "practice" },
  { label: "Roman → Pashto", id: "translate" },
  { label: "Pashto → English", id: "pashto-to-english" },
];

export default function HomePage() {
  const [section, setSection] = useState<Section>("learn");
  const [wordIndex, setWordIndex] = useState(0);
  const [wordList, setWordList] = useState(VOCABULARY);
  const [genTopic, setGenTopic] = useState("");
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [dailyCount, setDailyCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setStreak(getStreak());
    setBest(getBestStreak());
    setXp(getXP());
    setLevel(getLevel());
    const saved = parseInt(sessionStorage.getItem("pp_daily") || "0", 10);
    setDailyCount(saved);
  }, []);

  // Refresh header stats when switching back to learn
  useEffect(() => {
    setStreak(getStreak());
    setXp(getXP());
    setLevel(getLevel());
  }, [section]);

  const currentWord = wordList[wordIndex % wordList.length];

  const handleNext = () => {
    markLearned([currentWord.id]);
    setWordIndex((i) => i + 1);
    setDailyCount((c) => {
      const next = c + 1;
      sessionStorage.setItem("pp_daily", String(next));
      return next;
    });
  };

  const handleGenerate = async () => {
    if (!genTopic.trim()) return;
    setGenLoading(true);
    setGenError("");
    try {
      const words = await fetchGeneratedVocab(genTopic.trim(), 10);
      setWordList((prev) => [...prev, ...words]);
      setGenTopic("");
    } catch (e) {
      setGenError(`Generation failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setGenLoading(false);
    }
  };

  const xpPercent = Math.min((wordIndex % 20) / 20 * 100, 100);
  const dailyPercent = Math.min((dailyCount / DAILY_GOAL) * 100, 100);

  return (
    <div className="min-h-screen flex flex-col">

      {/* ── TOP HEADER ── */}
      <header className="glass-card border-b border-white/10 px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden text-slate-400 hover:text-white p-1"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white font-bold shadow-glow"
              style={{ fontFamily: "'Noto Nastaliq Urdu', serif", fontSize: "1.2rem" }}>
              ژ
            </div>
            <div>
              <h1 className="text-base font-bold text-white leading-none">ژبه</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Learn Pashto, one word at a time</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5 streak-pulse">
            <span className="text-orange-400 font-bold text-sm">{streak}</span>
            <span className="text-slate-500 text-xs hidden sm:inline">streak</span>
          </div>
          <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5">
            <span className="text-yellow-400 font-bold text-sm">{xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 glass-card rounded-full px-3 py-1.5">
            <span className="text-brand-400 font-bold text-sm">Lv.{level}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`
          fixed md:static inset-y-0 left-0 z-20 w-64 flex flex-col gap-4 p-4
          glass-card border-r border-white/10 md:border-0
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          top-[53px] md:top-0
        `}>
          <nav className="flex flex-col gap-1 mt-2">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false); }}
                className={`nav-item ${section === item.id ? "active" : ""}`}
              >
                <span>{item.label}</span>
                {section === item.id && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />
                )}
              </button>
            ))}
          </nav>

          <div className="border-t border-white/10" />

          <div className="glass-card rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Your Progress</span>
              <span className="text-xs text-brand-400 font-bold">Level {level}</span>
            </div>
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>XP</span>
                <span>{xp % 100} / 100</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 xp-bar transition-all duration-500"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-xs font-semibold text-white">Beginner</p>
                <p className="text-xs text-slate-500">Keep going!</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{wordIndex}</p>
            <p className="text-xs text-slate-400 mt-1">words learned</p>
            <p className="text-xs text-brand-400 mt-1">of {wordList.length} total</p>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-10 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── MAIN CONTENT ── */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          {section === "learn" ? (
            <div className="max-w-lg mx-auto flex flex-col gap-6">
              <Flashcard
                key={currentWord.id}
                word={currentWord}
                wordIndex={wordIndex}
                total={wordList.length}
                onNext={handleNext}
              />

              <div className="glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Daily Goal</span>
                  </div>
                  <span className="text-xs text-slate-400">{dailyCount} / {DAILY_GOAL} words</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 transition-all duration-500"
                    style={{ width: `${dailyPercent}%` }}
                  />
                </div>
                {dailyCount >= DAILY_GOAL && (
                  <p className="text-xs text-brand-400 mt-2 text-center font-semibold">
                    Daily goal complete!
                  </p>
                )}
              </div>

              <div className="glass-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Search & Translate
                </p>
                <VocabInput />
              </div>

              {/*
              <div className="glass-card rounded-2xl p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Generate words with AI
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="Topic (e.g. animals, food, travel)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-400"
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={genLoading || !genTopic.trim()}
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {genLoading ? "..." : "Go"}
                  </button>
                </div>
                {genError && <p className="text-xs text-red-400 mt-2">{genError}</p>}
                {!genError && wordList.length > VOCABULARY.length && (
                  <p className="text-xs text-brand-400 mt-2">
                    +{wordList.length - VOCABULARY.length} AI words added to your queue
                  </p>
                )}
              </div>
              */}
            </div>
          ) : section === "translate" ? (
            <TranslatorPage />
          ) : section === "pashto-to-english" ? (
            <PashtoToEnglishPage />
          ) : (
            <PracticePage onBackToLearn={() => setSection("learn")} />
          )}
        </main>
      </div>
    </div>
  );
}
