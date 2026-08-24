"""Pydantic models used to validate and document API responses."""

from pydantic import BaseModel, Field


class TransliterateResponse(BaseModel):
    pashto: str = Field(..., description="Pashto script output")


class TranslateToEnglishResponse(BaseModel):
    english: str = Field(..., description="English translation")


class VocabWord(BaseModel):
    pashto: str
    transliteration: str
    english: str


class VocabGenerateResponse(BaseModel):
    topic: str
    words: list[VocabWord]


class PronunciationScoreResponse(BaseModel):
    """Response returned by POST /api/score-pronunciation"""

    target_word: str = Field(..., description="The word the user was asked to pronounce")
    transcribed_text: str = Field(..., description="What Whisper heard the user say")
    score: float = Field(..., ge=0, le=100, description="Similarity score from 0-100")
    feedback: str = Field(..., description="Human-readable feedback based on the score")
    passed: bool = Field(..., description="True if score >= PASS_THRESHOLD (80)")


class HealthResponse(BaseModel):
    status: str
    whisper_configured: bool


class TranscribeResponse(BaseModel):
    """Response returned by POST /api/transcribe"""

    text: str = Field(..., description="Recognised Pashto text")
