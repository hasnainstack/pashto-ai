# ژبه

A gamified, AI-powered language learning app for Pashto — a low-resource language. Built with Next.js 14, FastAPI, and Groq AI.

## Project layout

```
pashtopro/
├── ARCHITECTURE.md
├── frontend/          # Next.js 14 (App Router) + TypeScript + Tailwind CSS
└── backend/           # FastAPI + Groq (Whisper + Qwen)
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- A Groq API key — free at [console.groq.com](https://console.groq.com)

## 1. Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set GROQ_API_KEY=gsk_...

uvicorn main:app --reload --port 8000
```

API live at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

## 2. Frontend setup

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000 (already correct for local dev)

npm run dev
```

Visit `http://localhost:3000`.

## Sections

### Learn
Flashcard-based vocabulary learning. Cycles through 720 built-in Pashto words (or AI-generated words). Each card shows the Pashto script, Roman transliteration, and English meaning. Advancing a card marks it as learned and increments the daily goal counter.

### Practice
Five game modes that test your vocabulary and earn XP:

| Mode | Description | XP |
|---|---|---|
| Quick Quiz | Multiple-choice — pick the correct English meaning | +10 per correct |
| Type the Answer | Recall the Pashto word from memory | +15 per correct |
| Listening Challenge | Listen and identify the word *(coming soon)* | — |
| Match Words | Match Pashto words to their English meanings | +20 total |
| Speed Round | Answer as many as possible in 60 seconds | Variable |

After each session: results screen with score, XP earned, streak update, and a mistake review option.

### Roman → Pashto
Translate Roman/Latin-script Pashto into Pashto script (Perso-Arabic). Powered by Groq `qwen/qwen3.6-27b`. Supports multi-word and sentence input. Keeps a session history of the last 10 translations.

### Pashto → English
Translate Pashto script, Roman Pashto, or a mix of both into English. Same AI backend. Supports `Ctrl+Enter` to submit.

### Search (embedded in Learn)
The `VocabInput` component provides instant search across all 720 words (Pashto script, Roman, or English). If no local match is found, it automatically falls back to the AI transliteration API after a 600 ms debounce.

## Gamification

- **XP** — earned by correct answers in Practice. 100 XP = 1 level up. Persisted in `localStorage`.
- **Streak** — increments each day you practice. Best streak also tracked.
- **Levels** — `Math.floor(totalXP / 100) + 1`.
- **Mistake tracking** — wrong answers are stored and prioritised in future practice sessions.

## API endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/vocabulary/generate` | Generate vocab for a topic via AI |
| POST | `/api/transliterate` | Roman Pashto → Pashto script |
| POST | `/api/translate-to-english` | Pashto (script or Roman) → English |
| POST | `/api/transcribe` | Transcribe Pashto audio (Whisper) |
| POST | `/api/score-pronunciation` | Transcribe + score pronunciation |

## Environment variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Required. Your Groq API key. |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins. Default: `http://localhost:3000` |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend URL. Default: `http://localhost:8000` |

## Deployment

- **Frontend** — Vercel. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend** — Render / Railway (Docker + Uvicorn). Set `GROQ_API_KEY` and `ALLOWED_ORIGINS` (your Vercel domain) as environment variables.
