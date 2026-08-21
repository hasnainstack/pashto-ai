# PashtoPro

A gamified, AI-powered language learning app for low-resource languages, starting with Pashto. Phase 1 (this MVP) implements flashcards, streak gamification, and AI pronunciation scoring, per `ARCHITECTURE.md`.

## Project layout

```
pashtopro/
├── ARCHITECTURE.md      # Original system architecture doc
├── frontend/            # Next.js 14 (App Router) + TypeScript + Tailwind
└── backend/             # FastAPI + OpenAI Whisper + difflib
```

## Prerequisites

- Node.js 18+
- Python 3.10+
- An OpenAI API key with access to the Whisper API

## 1. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# then edit .env and set OPENAI_API_KEY=sk-...

uvicorn main:app --reload --port 8000
```

The API will be live at `http://localhost:8000`. Visit `http://localhost:8000/docs` for interactive Swagger docs, or `GET /` for a health check.

## 2. Frontend setup

```bash
cd frontend
npm install

cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000 (default is already correct for local dev)

npm run dev
```

Visit `http://localhost:3000`. Your browser will ask for microphone permission — allow it to start practicing.

## How it works (Phase 1)

1. The frontend shows a Pashto flashcard word.
2. Tap the mic button to record yourself saying the word (`MediaRecorder` API → in-memory `Blob`).
3. The blob + target word are POSTed as `multipart/form-data` to `POST /api/score-pronunciation`.
4. The backend saves the audio temporarily, transcribes it with OpenAI Whisper (`language="ps"` for Pashto), scores similarity against the target word with Python's `difflib.SequenceMatcher`, generates feedback, then deletes the temp file.
5. If the score is ≥ 80, the frontend increments the streak (persisted in `localStorage`) and auto-advances to the next word after a short delay.

## Deployment

- **Frontend:** Vercel. Set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend:** Render / Railway (Docker container running Uvicorn). Set `OPENAI_API_KEY` and `ALLOWED_ORIGINS` (your Vercel domain) as environment variables.

## Roadmap

See `ARCHITECTURE.md` §5 for the planned Phase 2 Vapi voice-agent integration (real-time conversational practice with function-calling XP rewards).
