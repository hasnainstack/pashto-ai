"""Generate Pashto vocabulary via Groq (qwen/qwen3.6-27b)."""

import json
import os
import re

from groq import Groq

_PROMPT = (
    "Return ONLY a JSON array. No markdown, no explanation. "
    "Each element: {{\"pashto\": \"<Pashto script>\", \"transliteration\": \"<Latin>\", \"english\": \"<English meaning>\"}}. "
    "Generate {count} Pashto vocabulary words about: \"{topic}\"."
)

_client: Groq | None = None


def _get_client() -> Groq:
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            raise RuntimeError("GROQ_API_KEY not set")
        _client = Groq(api_key=api_key)
    return _client


def _extract_json(text: str) -> list[dict]:
    # Strip <think>...</think> blocks (may be very long)
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    # Strip markdown fences
    text = re.sub(r"```[a-z]*", "", text).replace("```", "").strip()

    # Try direct parse
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return parsed
        for v in parsed.values():
            if isinstance(v, list):
                return v
    except json.JSONDecodeError:
        pass

    # Find the outermost [...] array
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start : end + 1])

    raise RuntimeError(f"Could not extract JSON array from response: {text[:300]}")


def generate_vocab(topic: str, count: int) -> list[dict]:
    client = _get_client()
    response = client.chat.completions.create(
        model="qwen/qwen3.6-27b",
        messages=[
            {
                "role": "system",
                "content": "You are a Pashto language expert. Output raw JSON only.",
            },
            {"role": "user", "content": _PROMPT.format(count=count, topic=topic)},
        ],
        temperature=0.4,
        reasoning_effort="none",
    )
    raw = response.choices[0].message.content.strip()
    return _extract_json(raw)
