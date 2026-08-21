"""
Pashto Ghag ASR Service
------------------------
Wraps the Nasimbahar/pashto-ghag-whisper-medium-asr Hugging Face model.

Public interface:
    transcribe_audio(audio_path: str) -> str

The model and processor are loaded once at module import time (or lazily on
first call) and reused for every subsequent request.
"""

import logging
import os
import subprocess
import tempfile
from functools import lru_cache
from pathlib import Path

import numpy as np
import torch

logger = logging.getLogger(__name__)

MODEL_ID = "Nasimbahar/pashto-ghag-whisper-medium-asr"
SAMPLE_RATE = 16_000  # Whisper expects 16 kHz mono


@lru_cache(maxsize=1)
def _load_model():
    """Load processor + model once; cached for the lifetime of the process.

    The repo (Nasimbahar/pashto-ghag-whisper-medium-asr) ships only
    processor_config.json + model weights — no tokenizer vocab files.
    We therefore load the feature extractor from the fine-tuned repo and
    borrow the tokenizer from the base openai/whisper-medium checkpoint.
    """
    try:
        from transformers import (
            WhisperFeatureExtractor,
            WhisperForConditionalGeneration,
            WhisperProcessor,
            WhisperTokenizer,
        )
    except ImportError as e:
        raise RuntimeError(
            "transformers is not installed. Run: pip install transformers"
        ) from e

    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info("Loading Pashto Ghag ASR model on %s …", device)

    try:
        feature_extractor = WhisperFeatureExtractor.from_pretrained(MODEL_ID)
        tokenizer = WhisperTokenizer.from_pretrained(
            "openai/whisper-medium", language="pashto", task="transcribe"
        )
        processor = WhisperProcessor(
            feature_extractor=feature_extractor, tokenizer=tokenizer
        )
        model = WhisperForConditionalGeneration.from_pretrained(MODEL_ID).to(device)
        model.eval()
    except Exception as e:
        raise RuntimeError(f"Unable to load Pashto Ghag model: {e}") from e

    logger.info("Pashto Ghag ASR model ready.")
    return processor, model, device


def _load_audio(audio_path: str) -> np.ndarray:
    """
    Load audio from *any* format (WAV, WebM, Ogg, MP4 …) and return a
    float32 numpy array resampled to 16 kHz mono.

    Uses soundfile for WAV/FLAC and falls back to ffmpeg for everything else.
    """
    import soundfile as sf

    path = Path(audio_path)
    if not path.exists():
        raise ValueError("Audio file not found.")

    # Try soundfile first (fast, no subprocess).
    try:
        audio, sr = sf.read(str(path), dtype="float32", always_2d=False)
        if audio.ndim > 1:
            audio = audio.mean(axis=1)  # stereo → mono
        if sr != SAMPLE_RATE:
            audio = _resample(audio, sr, SAMPLE_RATE)
        return audio
    except Exception:
        pass  # fall through to ffmpeg

    # ffmpeg fallback for WebM/Ogg/MP4 etc.
    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    tmp.close()
    try:
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", str(path),
                "-ar", str(SAMPLE_RATE), "-ac", "1",
                "-f", "wav", tmp.name,
            ],
            capture_output=True,
            timeout=30,
        )
        if result.returncode != 0:
            raise ValueError(
                f"Audio processing failed: {result.stderr.decode(errors='replace')}"
            )
        audio, _ = sf.read(tmp.name, dtype="float32", always_2d=False)
        return audio
    finally:
        if os.path.exists(tmp.name):
            os.remove(tmp.name)


def _resample(audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    """Simple linear resampling; avoids a hard librosa dependency."""
    try:
        import librosa
        return librosa.resample(audio, orig_sr=orig_sr, target_sr=target_sr)
    except ImportError:
        pass
    # Fallback: scipy
    try:
        from scipy.signal import resample_poly
        from math import gcd
        g = gcd(orig_sr, target_sr)
        return resample_poly(audio, target_sr // g, orig_sr // g).astype(np.float32)
    except ImportError:
        pass
    # Last resort: numpy linear interpolation
    duration = len(audio) / orig_sr
    new_len = int(duration * target_sr)
    return np.interp(
        np.linspace(0, len(audio) - 1, new_len),
        np.arange(len(audio)),
        audio,
    ).astype(np.float32)


def transcribe_audio(audio_path: str) -> str:
    """
    Transcribe a Pashto audio file and return the recognised Pashto text.

    Args:
        audio_path: Path to the audio file (WAV, WebM, Ogg, MP4 …).

    Returns:
        Recognised Pashto text string.

    Raises:
        RuntimeError: Model could not be loaded.
        ValueError: Audio is invalid or empty.
    """
    processor, model, device = _load_model()

    audio = _load_audio(audio_path)

    if audio.size == 0:
        raise ValueError("No speech detected — audio is empty.")

    inputs = processor(
        audio,
        sampling_rate=SAMPLE_RATE,
        return_tensors="pt",
    ).input_features.to(device)

    forced_ids = processor.get_decoder_prompt_ids(language="pashto", task="transcribe")

    with torch.no_grad():
        predicted_ids = model.generate(inputs, forced_decoder_ids=forced_ids)

    text = processor.batch_decode(predicted_ids, skip_special_tokens=True)[0].strip()
    if not text:
        raise ValueError("No speech detected.")
    return text
