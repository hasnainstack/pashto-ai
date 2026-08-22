"""
PashtoPro Backend - FastAPI
----------------------------
Exposes POST /api/score-pronunciation which accepts an audio recording and
a target word, transcribes the audio via OpenAI Whisper (Pashto-constrained),
and scores pronunciation similarity using difflib.

Run locally:
    uvicorn main:app --reload --port 8000
"""

import os
import tempfile
import uuid

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pronunciation_engine import score_pronunciation
from schemas import HealthResponse, PronunciationScoreResponse, TranscribeResponse
from services.pashto_asr import transcribe_audio as ghag_transcribe, _load_pipeline as _load_asr_model

load_dotenv()

app = FastAPI(
    title="PashtoPro API",
    description="AI-powered pronunciation scoring engine for Pashto language learning.",
    version="0.1.0",
)


@app.on_event("startup")
async def startup_event():
    """Pre-load the Pashto Ghag ASR model so the first request isn't slow."""
    try:
        _load_asr_model()
    except Exception as e:
        # Non-fatal: the endpoint will surface the error on first call.
        import logging
        logging.getLogger(__name__).warning("ASR model pre-load failed: %s", e)

# CORS: only allow the configured frontend origin(s) in production.
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Whisper works best with these container formats.
ALLOWED_AUDIO_TYPES = {
    "audio/webm",
    "audio/wav",
    "audio/mp3",
    "audio/mpeg",
    "audio/mp4",
    "audio/m4a",
    "audio/ogg",
    "audio/x-wav",
}
MAX_AUDIO_BYTES = 10 * 1024 * 1024  # 10MB


@app.get("/", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(
        status="ok",
        whisper_configured=bool(os.environ.get("OPENAI_API_KEY")),
    )


@app.post("/api/transcribe", response_model=TranscribeResponse)
async def transcribe_endpoint(
    audio: UploadFile = File(..., description="Recorded Pashto audio"),
) -> TranscribeResponse:
    """Transcribe Pashto speech using the local Pashto Ghag Whisper model."""
    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"
    tmp_path = os.path.join(tempfile.gettempdir(), f"ghag_{uuid.uuid4().hex}{suffix}")

    try:
        contents = await audio.read()
        if len(contents) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Audio file too large (max 10MB)")
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        with open(tmp_path, "wb") as f:
            f.write(contents)

        text = ghag_transcribe(tmp_path)
        return TranscribeResponse(text=text)

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {e}")
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.post("/api/score-pronunciation", response_model=PronunciationScoreResponse)
async def score_pronunciation_endpoint(
    audio: UploadFile = File(..., description="Recorded audio blob of the spoken word"),
    target_word: str = Form(..., description="The Pashto word the user was asked to say"),
) -> PronunciationScoreResponse:
    if not target_word or not target_word.strip():
        raise HTTPException(status_code=400, detail="target_word must not be empty")

    if audio.content_type and audio.content_type not in ALLOWED_AUDIO_TYPES:
        # Not fatal — browsers send varied mime types for MediaRecorder blobs —
        # but we surface it in case of a genuinely wrong upload.
        pass

    suffix = os.path.splitext(audio.filename or "")[1] or ".webm"
    tmp_path = os.path.join(tempfile.gettempdir(), f"pashtopro_{uuid.uuid4().hex}{suffix}")

    try:
        contents = await audio.read()
        if len(contents) > MAX_AUDIO_BYTES:
            raise HTTPException(status_code=413, detail="Audio file too large (max 10MB)")
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty audio file")

        with open(tmp_path, "wb") as f:
            f.write(contents)

        result = score_pronunciation(tmp_path, target_word.strip())
        return PronunciationScoreResponse(**result)

    except HTTPException:
        raise
    except RuntimeError as e:
        # e.g. missing OPENAI_API_KEY
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Transcription failed: {e}")
    finally:
        # Cleanup: always delete the temp audio file to prevent storage bloat.
        if os.path.exists(tmp_path):
            os.remove(tmp_path)
