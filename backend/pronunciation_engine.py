"""
Pronunciation Engine
---------------------
Implements the Phase 1 scoring pipeline described in the architecture doc:

1. Transcribe the user's recorded audio with OpenAI Whisper, constrained to
   Pashto (language="ps") to improve accuracy for this low-resource language.
2. Compare the transcription against the target word using difflib's
   SequenceMatcher to produce a 0-100 similarity score.
3. Generate simple heuristic feedback from the score.
"""

import difflib
import os

from openai import OpenAI

# Thresholds used for feedback generation and streak gamification.
PASS_THRESHOLD = 80.0
PERFECT_THRESHOLD = 90.0
RETRY_THRESHOLD = 70.0

_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    """Lazily instantiate the OpenAI client so import-time doesn't require a key."""
    global _client
    if _client is None:
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            raise RuntimeError(
                "OPENAI_API_KEY is not set. Add it to backend/.env (see .env.example)."
            )
        _client = OpenAI(api_key=api_key)
    return _client


def transcribe_audio(file_path: str, language: str = "ps") -> str:
    """
    Send the audio file to OpenAI's Whisper API for transcription.

    language="ps" forces Pashto context, which materially improves
    transcription accuracy for this low-resource language versus letting
    Whisper auto-detect the language.
    """
    client = get_openai_client()
    with open(file_path, "rb") as audio_file:
        transcript = client.audio.transcriptions.create(
            model="whisper-1",
            file=audio_file,
            language=language,
        )
    return transcript.text.strip()


def score_similarity(transcribed_text: str, target_word: str) -> float:
    """
    Compare transcribed text to the target word using difflib's
    SequenceMatcher, returning a percentage (0-100).
    """
    ratio = difflib.SequenceMatcher(None, transcribed_text, target_word).ratio()
    return round(ratio * 100, 1)


def generate_feedback(score: float) -> str:
    """Basic heuristic feedback based on score thresholds."""
    if score >= PERFECT_THRESHOLD:
        return "Perfect! 🎉"
    if score >= PASS_THRESHOLD:
        return "Great job! Keep it up."
    if score >= RETRY_THRESHOLD:
        return "Close! Try again."
    return "Try again — listen closely to the pronunciation."


def score_pronunciation(file_path: str, target_word: str) -> dict:
    """Run the full pipeline: transcribe -> score -> feedback."""
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
