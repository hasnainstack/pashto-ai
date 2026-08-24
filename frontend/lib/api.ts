export interface PronunciationScoreResponse {
  target_word: string;
  transcribed_text: string;
  score: number;
  feedback: string;
  passed: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function scorePronunciation(
  audioBlob: Blob,
  targetWord: string
): Promise<PronunciationScoreResponse> {
  const formData = new FormData();
  // The backend infers a file extension from the filename; MediaRecorder
  // typically produces webm in Chrome/Firefox.
  formData.append("audio", audioBlob, "recording.webm");
  formData.append("target_word", targetWord);

  const res = await fetch(`${API_URL}/api/score-pronunciation`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Scoring failed (${res.status})`);
  }

  return res.json();
}

export async function translateToEnglish(text: string): Promise<string> {
  const formData = new FormData();
  formData.append("text", text);
  const res = await fetch(`${API_URL}/api/translate-to-english`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Translation failed (${res.status})`);
  }
  const data = await res.json();
  return data.english as string;
}

export async function transliterateRoman(text: string): Promise<string> {
  const formData = new FormData();
  formData.append("text", text);
  const res = await fetch(`${API_URL}/api/transliterate`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Translation failed (${res.status})`);
  }
  const data = await res.json();
  return data.pashto as string;
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("audio", audioBlob, "recording.webm");

  const res = await fetch(`${API_URL}/api/transcribe`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.detail || `Transcription failed (${res.status})`);
  }

  const data = await res.json();
  return data.text as string;
}
