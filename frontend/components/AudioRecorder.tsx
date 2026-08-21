"use client";

import { useRef, useState } from "react";

interface AudioRecorderProps {
  disabled?: boolean;
  onRecordingComplete: (blob: Blob) => void;
}

/**
 * Captures microphone audio using the native MediaRecorder API, per the
 * architecture doc's Phase 1 frontend audio capture flow:
 * getUserMedia -> MediaRecorder -> Blob.
 */
export default function AudioRecorder({
  disabled,
  onRecordingComplete,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    setPermissionError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        onRecordingComplete(blob);
        streamRef.current?.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setPermissionError(
        "Microphone access denied. Please allow microphone permissions to practice pronunciation."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={`relative flex h-20 w-20 items-center justify-center rounded-full text-white text-3xl shadow-lg transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
          isRecording
            ? "bg-red-500 recording-pulse"
            : "bg-brand-500 hover:bg-brand-600"
        }`}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? "■" : "🎤"}
      </button>
      <p className="text-sm text-slate-500">
        {isRecording ? "Recording… tap to stop" : "Tap to record your pronunciation"}
      </p>
      {permissionError && (
        <p className="max-w-xs text-center text-sm text-red-500">{permissionError}</p>
      )}
    </div>
  );
}
