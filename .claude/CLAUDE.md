# CLAUDE.md — JaneQ MCQ Project

Project context and rules for AI assistants working in this codebase.

---

## Project Overview

**JaneQ** is an online MCQ (Multiple Choice Questionnaire) web app built for the MLX Tech coding test.

- **Backend:** FastAPI (`backend/app/`) — REST API serving questions, scoring, and history.
- **Frontend:** React + TypeScript + Vite (`frontend/src/`) — single-page app.
- **Auth:** DummyJSON (`POST https://dummyjson.com/auth/login`).
- **Data:** `data/questions_en.json` — single source of truth for all questions.
- **Exports:** `exports/submission_*.json` — per-user, per-attempt, committed to repo.
- **Docker:** `docker-compose.yml` — optional full stack deployment.

---

## Rules

All rules below are **mandatory**. Violations must be flagged, not silently worked around.

### Language

- All **code comments** are in **English only**.
- All **commit messages** are in **English**.
- Variable/function names are English, camelCase or snake_case per language convention.

### Code Delivery

- **Server-side scoring only** — `answer` and `explanation` fields in `questions_en.json` must NEVER be sent to the frontend. The `GET /api/questions` endpoint returns only `{ id, question, options }`.
- **No secrets in code** — URLs, tokens, and credentials go into `.env` / `config.py`. Never hardcode.
- **Input validation** — all FastAPI route parameters and request bodies must use Pydantic schemas.
- **CORS restricted** — only allow `localhost:5173`, `127.0.0.1:5173`, `localhost:8080`, `127.0.0.1:8080` in FastAPI CORS middleware.

### Architecture

- Backend is **stateless** — no session store, no database. History is read from `exports/` files.
- Frontend routes: `/login`, `/` (main), `/quiz/:typeEnc`, `/results`.
- Protected routes require DummyJSON token in `localStorage`.
- No global state management library needed — React `useState` / `useContext` is sufficient.

### Testing & Verification

- Every new feature must be verified manually before committing.
- Minimum verification: `npm run build` (frontend) + `uvicorn app.main:app --reload` (backend) run without errors.
- `curl` or browser test for each new API endpoint.
- Export files in `exports/` must be valid JSON and committed.

### Git Workflow

- Commit meaningful units of work — not "fix" or "update" with no detail.
- Commit message format: `feat|fix|docs|chore: short description`.
- Do NOT commit `node_modules/`, `.venv/`, `dist/`, `__pycache__/`, `*.pyc`, `.env`.
- Include `.gitignore` covering all build artifacts.

### XPATH Theoretical Part

- Written in `XPATH_ANSWERS.md` — no code execution required.
- Answers are based on the XML sample in the PDF only; no external data.
- File is **not** part of the code deliverable — it is a separate written submission.

---

## File Map

```
.
├── backend/
│   └── app/
│       ├── main.py      # FastAPI app, routes
│       ├── store.py     # load & index questions_en.json
│       ├── schemas.py   # Pydantic models
│       └── config.py   # env-based settings
├── frontend/src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── MainPage.tsx
│   │   ├── QuizPage.tsx
│   │   └── ResultsPage.tsx
│   ├── components/
│   │   ├── ProtectedRoute.tsx
│   │   └── ErrorBanner.tsx
│   ├── api/
│   │   ├── janeq.ts     # JaneQ API client
│   │   ├── dummyjson.ts # DummyJSON auth client
│   │   └── types.ts    # shared TS types
│   ├── App.tsx
│   └── main.tsx
├── data/
│   └── questions_en.json
├── exports/                      # generated files — commit these
├── docker-compose.yml
└── CLAUDE.md
```

---

## Local Dev Commands

```bash
# Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev
```

Demo user: `emilys` / `emilyspass`
