# CLAUDE.md — JaneQ MCQ Project

---

## Project

Online MCQ web app for the MLX Tech coding test.
- **Backend:** FastAPI (`backend/app/`) — REST API, JaneQ.
- **Frontend:** React + TypeScript + Vite (`frontend/src/`).
- **Auth:** DummyJSON.
- **Data:** `data/questions_en.json` — single source of truth.
- **Exports:** `exports/submission_*.json` — per-user, committed to repo.
- **Docker:** `docker-compose.yml`.

---

## Rules

### Language
- All code comments and commit messages are **English only**.
- Variable/function names are English (camelCase or snake_case per convention).

### Code Delivery
- **`answer` and `explanation` fields must NEVER reach the frontend.** Scoring is server-side only.
- No secrets, tokens, or credentials in code — use `.env` / `config.py`.
- All FastAPI endpoints validate input with Pydantic schemas.
- CORS restricted to: `localhost:5173`, `127.0.0.1:5173`, `localhost:8080`, `127.0.0.1:8080`.

### Architecture
- Backend is **stateless** — no session store, no database.
- Frontend routes: `/login`, `/` (main), `/quiz/:typeEnc`, `/results`.
- No global state library needed — `useState` / `useContext` is sufficient.

### Testing
- Run `npm run build` (frontend) + `uvicorn app.main:app` (backend) after every change.
- `curl` each new endpoint before committing.
- Export files must be valid JSON.

### Git
- Commit format: `feat|fix|docs|chore: short description`.
- Never commit: `node_modules/`, `.venv/`, `dist/`, `__pycache__/`, `*.pyc`, `.env`.

---

## Quick Start

```bash
# Backend
cd backend && source .venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Frontend
cd frontend && cp .env.example .env && npm install && npm run dev

# Demo login: emilys / emilyspass (DummyJSON)
```
