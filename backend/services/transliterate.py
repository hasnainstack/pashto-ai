"""Translate Roman/transliterated Pashto to Pashto script via Groq."""

import os
from groq import Groq

_client: Groq | None = None

_SYSTEM_ROMAN_TO_PASHTO = (
    "You are a Pashto script expert. The user gives you text written in Roman/Latin "
    "transliteration of Pashto. Convert it to proper Pashto script (Perso-Arabic). "
    "Reply with ONLY the Pashto script — no explanation, no transliteration, no punctuation outside the script."
)

_SYSTEM_TO_ENGLISH = (
    "You are a Pashto language expert and translator. "
    "The user gives you text in either Pashto script, Roman transliteration of Pashto, or a mix of both. "
    "Translate it into natural English. "
    "Reply with ONLY the English translation — no explanation, no original text, no notes."
)


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        _client = Groq(api_key=api_key)
    return _client


def roman_to_pashto(roman_text: str) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {"role": "system", "content": _SYSTEM_ROMAN_TO_PASHTO},
            {"role": "user", "content": roman_text.strip()},
        ],
        temperature=0.1,
        reasoning_effort="none",
    )
    return response.choices[0].message.content.strip()


def pashto_to_english(text: str) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {"role": "system", "content": _SYSTEM_TO_ENGLISH},
            {"role": "user", "content": text.strip()},
        ],
        temperature=0.1,
        reasoning_effort="none",
    )
    return response.choices[0].message.content.strip()
