"""Generate Pashto vocabulary via Gemini Flash."""

import json
import os
import re

from google import genai
from google.genai import types

_PROMPT = (
    "You are a Pashto language expert. Return ONLY a valid JSON array, no markdown, "
    "no explanation. Each element: {{\"pashto\": \"<Pashto script>\", "
    "\"transliteration\": \"<Latin>\", \"english\": \"<English meaning>\"}}. "
    "Generate {count} Pashto vocabulary words about the topic: \"{topic}\". "
    "Ensure all Pashto text uses proper Pashto/Arabic Unicode script."
)


def generate_vocab(topic: str, count: int) -> list[dict]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY not set")

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=_PROMPT.format(count=count, topic=topic),
        config=types.GenerateContentConfig(response_mime_type="application/json"),
    )

    raw = response.text.strip()
    raw = re.sub(r"^```[a-z]*\n?", "", raw)
    raw = re.sub(r"\n?```$", "", raw)

    return json.loads(raw)
