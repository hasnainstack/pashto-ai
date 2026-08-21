# PashtoPro - System Architecture

## 1. Project Overview

PashtoPro is a gamified, AI-powered language learning application designed specifically for low-resource languages (starting with Pashto). It combines full-stack web development with applied AI to create an interactive pronunciation scoring engine and conversational voice agent.

**Current Phase:** Phase 1 (MVP) - Flashcards, Streak Gamification, and AI Pronunciation Scoring.

## 2. High-Level System Architecture

The system uses a decoupled architecture, separating the Next.js frontend from the Python/AI backend. This allows for independent scaling and clean separation of concerns between UI rendering and heavy AI processing.

```
Client (Next.js 14)
  UI Components <-> Audio Blob / Score <-> API Client
  UI Components <-> Read/Write <-> LocalStorage (Streak State)

Server (FastAPI)
  API Router -> Pronunciation Engine
  Pronunciation Engine -> Audio File -> OpenAI Whisper API
  Pronunciation Engine -> String Comparison -> Python difflib

Client <-> POST /api/score-pronunciation (multipart/form-data) <-> Server
```

## 3. Tech Stack

### Frontend
- Framework: Next.js 14 (App Router) with TypeScript.
- Styling: Tailwind CSS.
- State Management: React Hooks (`useState`, `useEffect`) + browser `localStorage` for streak persistence.
- Media Handling: Native `MediaRecorder` API for browser-based audio capture.

### Backend
- Framework: FastAPI (Python).
- Server: Uvicorn (ASGI).
- Data Validation: Pydantic for strict response schemas.
- File Handling: `python-multipart` for processing `UploadFile` and `Form` data.

### AI & Data
- Speech-to-Text (STT): OpenAI Whisper API (`whisper-1` model, explicitly configured with `language="ps"` for Pashto).
- Pronunciation Scoring Algorithm: Python's built-in `difflib.SequenceMatcher` to calculate the similarity ratio between the target text and the transcribed text.

## 4. Core Components: Phase 1 (Pronunciation Engine)

The Phase 1 MVP focuses on evaluating user pronunciation through a mathematical comparison pipeline.

### 4.1. Frontend Audio Capture
- The UI prompts the user for microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`.
- Audio is recorded using the `MediaRecorder` API and stored as a `Blob` in memory.
- The `Blob` is appended to a `FormData` object along with the `target_word` string and sent via a POST request to the backend.

### 4.2. Backend Pronunciation Pipeline
The `/api/score-pronunciation` endpoint orchestrates the AI scoring logic:

1. **File Ingestion:** FastAPI receives the audio file as an `UploadFile` and the target word as a `Form` string.
2. **STT Transcription:**
   - The audio file is temporarily saved to disk.
   - The file is sent to the OpenAI Whisper API.
   - Constraint Handling: The API is forced to use Pashto context (`language="ps"`) to improve transcription accuracy for a low-resource language.
   - The transcribed text is cleaned (whitespace stripped).
3. **Similarity Scoring:**
   - Uses `difflib.SequenceMatcher(None, transcribed_text, target_word).ratio()`.
   - Returns a float between 0.0 and 1.0, multiplied by 100 to generate a percentage score.
4. **Feedback Generation:** Basic heuristic logic generates feedback based on the score threshold (e.g., <70% = "Try again", >90% = "Perfect").
5. **Cleanup:** The temporary audio file is deleted from the server to prevent storage bloat.

### 4.3. Gamification Logic
- **Streak Counter:** Handled entirely on the frontend.
- If the backend returns a score >= 80, the frontend increments the streak state and saves it to `localStorage`.
- A 2-second delay is triggered before loading the next vocabulary word, allowing the user to see their score.

## 5. Future Architecture: Phase 2 (Vapi Voice AI Integration)

In Phase 2, the app will expand from isolated word pronunciation to full conversational practice using Vapi.

### 5.1. Architecture Changes
- **Pipeline Split:** The app will separate the Flashcard Grader (Phase 1) from the Conversational Agent (Phase 2).
- **Webhooks:** Next.js will expose API routes to receive Vapi webhooks (e.g., `call-started`, `call-ended`, `function-call`).

### 5.2. Vapi Configuration for Low-Resource Languages
Configuring Vapi for Pashto requires overriding default English-centric models:
- **STT:** Deepgram Nova-2 or Whisper-1 (configured with Pashto language code).
- **LLM:** GPT-4o-mini or Gemini 1.5 Flash (requires heavy system-prompting to enforce Pashto-only responses).
- **TTS:** Routed to Azure Cognitive Services or Google Cloud TTS, as default Vapi TTS providers lack robust Pashto neural voices.

### 5.3. Agentic Function Calling
- The Vapi agent will be equipped with a tool: `award_xp(amount: int)`.
- When the user successfully uses a vocabulary word in conversation, the LLM triggers the function call.
- Vapi sends the webhook to the Next.js backend, updating the user's streak/XP in real-time during the active phone call.

## 6. Deployment Strategy
- **Frontend:** Deployed on Vercel. Environment variables configured for the backend API URL.
- **Backend:** Deployed on Render or Railway (Python Docker container).
- **Environment Variables:**
  - `OPENAI_API_KEY`: Stored securely on the backend server.
- **CORS Policy:** Backend is configured to accept requests only from the specific Vercel frontend domain in production.
