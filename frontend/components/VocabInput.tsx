"use client";

import { useRef, useState } from "react";
import { transcribeAudio } from "@/lib/api";
import { VOCABULARY, VocabWord } from "@/lib/vocabulary";

type RecordState = "idle" | "recording" | "transcribing";

export default function VocabInput() {
  const [query, setQuery] = useState("");
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [micError, setMicError] = useState<string | null>(null);
  const [results, setResults] = useState<VocabWord[] | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Search ──────────────────────────────────────────────────────────────────

  const search = (text: string) => {
    const q = text.trim().toLowerCase();
    if (!q) { setResults(null); return; }
    setResults(
      VOCABULARY.filter(
        (w) =>
          w.pashto.includes(text.trim()) ||
          w.english.toLowerCase().includes(q) ||
          w.transliteration.toLowerCase().includes(q)
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    search(e.target.value);
  };

  // ── Microphone ──────────────────────────────────────────────────────────────

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;

      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setRecordState("transcribing");
        try {
          const text = await transcribeAudio(blob);
          setQuery(text);
          search(text);
        } catch (err) {
          setMicError(err instanceof Error ? err.message : "Transcription failed");
        } finally {
          setRecordState("idle");
        }
      };

      mr.start();
      setRecordState("recording");
    } catch {
      setMicError("Microphone access denied.");
      setRecordState("idle");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecordState("idle");
  };

  const handleMicClick = () => {
    if (recordState === "recording") stopRecording();
    else if (recordState === "idle") startRecording();
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  const micLabel =
    recordState === "recording"
      ? "Stop recording"
      : recordState === "transcribing"
      ? "Transcribing…"
      : "Record Pashto speech";

  return (
    <div className="w-full max-w-md">
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-brand-500">
        <input
          type="text"
          dir="auto"
          lang="ps"
          value={query}
          onChange={handleChange}
          placeholder="Search vocabulary… or use 🎤"
          className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 outline-none text-base"
          aria-label="Vocabulary search"
        />
        <button
          type="button"
          onClick={handleMicClick}
          disabled={recordState === "transcribing"}
          aria-label={micLabel}
          title={micLabel}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition-colors disabled:opacity-50 ${
            recordState === "recording"
              ? "bg-red-500 text-white animate-pulse"
              : "bg-brand-500 text-white hover:bg-brand-600"
          }`}
        >
          {recordState === "transcribing" ? "⏳" : recordState === "recording" ? "■" : "🎤"}
        </button>
      </div>

      {micError && (
        <p className="mt-1 text-xs text-red-500">{micError}</p>
      )}

      {results !== null && (
        <ul className="mt-2 divide-y divide-slate-100 rounded-2xl border border-slate-100 bg-white shadow-md overflow-hidden">
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-slate-400">No matches found.</li>
          ) : (
            results.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 cursor-pointer"
                onClick={() => { setQuery(w.pashto); setResults(null); }}
              >
                <span className="text-xl font-bold" dir="rtl" lang="ps">{w.pashto}</span>
                <span className="text-sm text-slate-500">{w.english}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
