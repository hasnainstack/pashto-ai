"""
Pronunciation Engine
---------------------
Transcribes audio via Groq's whisper-large-v3 endpoint (fast, free tier),
then scores similarity against the target word using difflib.
"""

import difflib
import os

from groq import Groq

PASS_THRESHOLD = 80.0
PERFECT_THRESHOLD = 90.0
RETRY_THRESHOLD = 70.0

_client: Groq | None = None


def get_groq_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. Add it to backend/.env (see .env.example)."
            )
        _client = Groq(api_key=api_key)
    return _client


def transcribe_audio(file_path: str, language: str = "ps") -> str:
    client = get_groq_client()
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=audio_file,
            language=language,
            response_format="text",
        )
    # Groq returns a plain string when response_format="text"
    return (transcript if isinstance(transcript, str) else transcript.text).strip()


def score_similarity(transcribed_text: str, target_word: str) -> float:
    ratio = difflib.SequenceMatcher(None, transcribed_text, target_word).ratio()
    return round(ratio * 100, 1)


def generate_feedback(score: float) -> str:
    if score >= PERFECT_THRESHOLD:
        return "Perfect! 🎉"
    if score >= PASS_THRESHOLD:
        return "Great job! Keep it up."
    if score >= RETRY_THRESHOLD:
        return "Close! Try again."
    return "Try again — listen closely to the pronunciation."


def score_pronunciation(file_path: str, target_word: str) -> dict:
    transcribed_text = transcribe_audio(file_path)
    score = score_similarity(transcribed_text, target_word)
    feedback = generate_feedback(score)
    return {
        "target_word": target_word,
        "transcribed_text": transcribed_text,
        "score": score,
        "feedback": feedback,
        "passed": score >= PASS_THRESHOLD,
    }
