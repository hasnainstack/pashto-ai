"""
Pashto ASR Service
-------------------
Transcribes Pashto audio using Groq's whisper-large-v3 API.
Replaces the local HuggingFace pipeline which has a transformers
version incompatibility ('list' object has no attribute 'keys').

Public interface (unchanged):
    transcribe_audio(audio_path: str) -> str
    _load_pipeline() -> None  (no-op kept for startup compatibility)
"""

import logging
import os

logger = logging.getLogger(__name__)


def _load_pipeline():
    """No-op — kept so main.py startup hook doesn't break."""
    logger.info("ASR: using Groq whisper-large-v3 (no local model to load)")


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe a Pashto audio file via Groq whisper-large-v3.
    Accepts any format Groq supports (webm, wav, mp3, mp4, ogg, m4a).
    """
    from groq import Groq

    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("GROQ_API_KEY is not set.")

    client = Groq(api_key=api_key)

    with open(audio_path, "rb") as f:
        transcript = client.audio.transcriptions.create(
            model="whisper-large-v3",
            file=f,
            language="ps",
            response_format="text",
        )

    text = (transcript if isinstance(transcript, str) else transcript.text).strip()
    if not text:
        raise ValueError("No speech detected.")
    return text
