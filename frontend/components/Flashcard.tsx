"use client";

import { useState } from "react";
import AudioRecorder from "./AudioRecorder";
import { scorePronunciation, PronunciationScoreResponse } from "@/lib/api";
import { VocabWord } from "@/lib/vocabulary";

interface FlashcardProps {
  word: VocabWord;
  onPassed: () => void;
}

type Status = "idle" | "scoring" | "done" | "error";

export default function Flashcard({ word, onPassed }: FlashcardProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<PronunciationScoreResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRecordingComplete = async (blob: Blob) => {
    setStatus("scoring");
    setError(null);
    setResult(null);
    try {
      const response = await scorePronunciation(blob, word.pashto);
      setResult(response);
      setStatus("done");
      // Streak gamification: only counts if score >= 80 (backend `passed` flag).
      if (response.passed) {
        onPassed();
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const scoreColor =
    result && result.score >= 90
      ? "text-brand-600"
      : result && result.score >= 80
      ? "text-brand-500"
      : result && result.score >= 70
      ? "text-amber-500"
      : "text-red-500";

  return (
    <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-brand-500">
          Say this word
        </p>
        <h2 className="mb-1 text-5xl font-bold" dir="rtl" lang="ps">
          {word.pashto}
        </h2>
        <p className="text-slate-400 italic">{word.transliteration}</p>
        <p className="mt-1 text-lg text-slate-600">{word.english}</p>
      </div>

      <div className="flex justify-center">
        <AudioRecorder
          disabled={status === "scoring"}
          onRecordingComplete={handleRecordingComplete}
        />
      </div>

      <div className="mt-6 min-h-[88px]">
        {status === "scoring" && (
          <p className="text-center text-sm text-slate-400 animate-pulse">
            Scoring your pronunciation…
          </p>
        )}

        {status === "error" && (
          <p className="text-center text-sm text-red-500">{error}</p>
        )}

        {status === "done" && result && (
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className={`text-3xl font-bold ${scoreColor}`}>
              {result.score.toFixed(0)}%
            </p>
            <p className="mt-1 text-sm font-medium text-slate-600">
              {result.feedback}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              We heard: &ldquo;{result.transcribed_text || "…"}&rdquo;
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
