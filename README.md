# JaneQ — Online MCQ

React frontend + FastAPI backend. Users authenticate, pick an MCQ category, answer questions, and get a scored review with explanations. Each submission is exported as JSON.

Demo user: **emilys** / **emilyspass** (DummyJSON)

---

## Stack

| Layer | Tech |
|---|---|
| Backend | FastAPI — async REST API |
| Frontend | React + TypeScript + Vite |
| Auth | DummyJSON (`localStorage` token) |
| Data | Local JSON — no database |

---

## Run

```bash
# Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

Frontend: `http://localhost:5173`
API docs: `http://localhost:8000/docs`

### Docker

```bash
docker compose up --build
# API: http://localhost:8000
# Web:  http://localhost:8080
```

---

## API — JaneQ

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Liveness |
| GET | `/api/types` | MCQ categories |
| GET | `/api/questions?type=...` | Questions (no correct answers) |
| POST | `/api/submit` | Score + breakdown + export file |
| GET | `/api/history` | Past attempts from `exports/` |

---

## Features

- DummyJSON login → protected routes
- One question per page, Next locked until answered
- Per-question 60-second countdown timer
- Server-side scoring — answers never sent to frontend
- Score + per-question breakdown + explanations on results
- Each submission exported to `exports/` (committed)
- Past attempts list on home screen
- Docker Compose: FastAPI + nginx serving static build

---

## Files

```
backend/app/     FastAPI: routes, store, schemas, config
frontend/src/    React: pages, api, components
data/            questions_en.json (50 questions, 8 categories)
exports/         submission_*.json (per-attempt, committed)
docker/          nginx.conf
CLAUDE.md        project rules
AI_USAGE.md      AI/LLM disclosure
XPATH_ANSWERS.md theoretical XPath part
```
