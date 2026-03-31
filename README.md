# JaneQ — Online MCQ (MLX coding test)

React frontend + FastAPI backend (**JaneQ**). Users authenticate with [DummyJSON](https://dummyjson.com/docs/auth), pick an MCQ category served from JaneQ, answer questions, get a scored review, and persist each attempt under `exports/`.

## Requirements

- **Python 3.11+** (3.14+ may lack wheels for some deps; use 3.11 for the venv)
- **Node.js 20+** (for the Vite app)

## Run locally

### 1. Backend (JaneQ)

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Question bank: [`data/questions_en.json`](data/questions_en.json).  
Optional: `JANEQ_REPO_ROOT` = absolute path to this repo root (used in Docker).

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env if JaneQ is not on http://127.0.0.1:8000
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`). Demo login: **emilys** / **emilyspass** (DummyJSON).

## API (JaneQ)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness |
| GET | `/api/types` | MCQ categories |
| GET | `/api/questions?type=...` | Questions for a type (no correct answers) |
| POST | `/api/submit` | Body: `{ "username", "mcqType", "answers": [{ "questionId", "selected" }] }` — score + export file |
| GET | `/api/history` | Recent rows from `exports/submission_*.json` |

## Docker Compose

From repo root:

```bash
docker compose up --build
```

- API: `http://localhost:8000`
- Web (nginx + static build): `http://localhost:8080`  
  The SPA is built with `VITE_JANEQ_URL=http://localhost:8000` so the browser calls JaneQ on your machine.

## Features implemented

- DummyJSON login, protected routes
- Types and questions from JaneQ REST API
- Per-question countdown (60s), **Next** disabled until an option is selected
- Server-side scoring + breakdown with explanations
- **Export** of each submission JSON under `exports/` (tracked in git)
- **Past attempts** list on the home screen (`/api/history`)
- `docker-compose.yml` for API + static frontend

## Project layout

```
backend/app/     # FastAPI JaneQ
data/            # questions_en.json
exports/         # submission_*.json written on submit
frontend/        # Vite + React + TypeScript
```

See [`AI_USAGE.md`](AI_USAGE.md) for LLM / tool disclosure.
