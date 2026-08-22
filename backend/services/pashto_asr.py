"""
Pashto Ghag ASR Service
------------------------
Uses the official transformers ASR pipeline as documented by the model author:
https://huggingface.co/Nasimbahar/pashto-ghag-whisper-medium-asr

Public interface:
    transcribe_audio(audio_path: str) -> str

The pipeline is loaded once at startup and reused for every request.
"""

import logging
import os
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

import torch

logger = logging.getLogger(__name__)

MODEL_ID = "Nasimbahar/pashto-ghag-whisper-medium-asr"


@lru_cache(maxsize=1)
def _load_pipeline():
    """Load the ASR pipeline once; cached for the lifetime of the process."""
    try:
        from transformers import pipeline
    except ImportError as e:
        raise RuntimeError(
            "transformers is not installed. Run: pip install transformers"
        ) from e

    use_cuda = torch.cuda.is_available()
    device = 0 if use_cuda else -1
    dtype = torch.float16 if use_cuda else torch.float32

    logger.info("Loading Pashto Ghag ASR pipeline on %s …", "cuda" if use_cuda else "cpu")

    try:
        pipe = pipeline(
            "automatic-speech-recognition",
            model=MODEL_ID,
            torch_dtype=dtype,
            device=device,
            chunk_length_s=30,
        )
    except Exception as e:
        raise RuntimeError(f"Unable to load Pashto Ghag model: {e}") from e

    logger.info("Pashto Ghag ASR model ready.")
    return pipe


def _to_wav(audio_path: str) -> tuple[str, bool]:
    """
    If the file is not a WAV, convert it to 16 kHz mono WAV via ffmpeg.
    Returns (path_to_use, should_delete).
    soundfile-readable formats (WAV/FLAC) are passed through unchanged.
    """
    import soundfile as sf

    path = Path(audio_path)
    if not path.exists():
        raise ValueError("Audio file not found.")

    # Try reading directly — works for WAV/FLAC/AIFF.
    try:
        sf.info(str(path))
        return str(path), False
    except Exception:
        pass

    # ffmpeg fallback for WebM/Ogg/MP4/etc.
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(path),
                "-ar", "16000", "-ac", "1",
                "-f", "wav", tmp.name,
            ],
            capture_output=True,
            timeout=30,
        )
    except FileNotFoundError:
        os.remove(tmp.name)
        raise ValueError(
            "ffmpeg is not installed. Install it to support WebM/Ogg audio from the browser."
        )

    if result.returncode != 0:
        os.remove(tmp.name)
        raise ValueError(
            f"Audio processing failed: {result.stderr.decode(errors='replace')}"
        )

    return tmp.name, True


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe a Pashto audio file and return the recognised Pashto text.

    Accepts WAV, WebM, Ogg, MP4, and any format ffmpeg can decode.

    Raises:
        RuntimeError: Model could not be loaded.
        ValueError: Audio is invalid, empty, or ffmpeg is missing.
    """
    pipe = _load_pipeline()

    wav_path, should_delete = _to_wav(audio_path)
    try:
        result = pipe(
            wav_path,
            generate_kwargs={
                "language": "pashto",
                "task": "transcribe",
            },
        )
    except Exception as e:
        raise ValueError(f"Audio processing failed: {e}") from e
    finally:
        if should_delete and os.path.exists(wav_path):
            os.remove(wav_path)

    text = result["text"].strip()
    if not text:
        raise ValueError("No speech detected.")
    return text
