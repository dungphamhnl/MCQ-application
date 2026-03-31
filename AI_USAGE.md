# AI / LLM usage disclosure

AI was used to build this project following the MLX coding-test instructions that allow AI tools when usage is documented.

---

## My Role: Analyst & Architect (not just a prompt-writer)

I read the requirements, broke them down into a concrete plan, defined the architecture and rules, then directed AI to execute. AI never received open-ended prompts like "build me an MCQ app." Every file it generated was the result of a specific, reasoned request. I reviewed every line it produced.

---

## How I Worked with AI

### Before writing a single prompt

I spent the first ~20 minutes **not touching the keyboard** — reading the PDF, defining the tech stack, and writing `CLAUDE.md` (project rules). Only after that was I ready to delegate.

### The rules I set before delegating (`CLAUDE.md`)

- **English only** in all code and commits.
- **Server-side scoring** — `answer`/`explanation` fields never touch the frontend.
- **No secrets in code** — env variables and config files only.
- **Input validation** — every FastAPI endpoint uses Pydantic schemas.
- **CORS locked down** — only localhost dev ports.
- **Lightweight architecture** — JSON instead of DB, stateless backend, minimal deps.

### What I delegated to AI (execution, not thinking)

AI generated files from my spec:
- FastAPI modules (`main.py`, `store.py`, `schemas.py`, `config.py`)
- React pages (`LoginPage`, `MainPage`, `QuizPage`, `ResultsPage`)
- Components (`ProtectedRoute`, `ErrorBanner`)
- Docker setup (`docker-compose.yml`, nginx config)
- Initial `App.tsx` and CSS scaffolding

### What I kept for myself (real coding)

| What I did | Why |
|---|---|
| Wrote 50 MCQ questions in `questions_en.json` | Content accuracy is mine; can't delegate accuracy |
| Set up `CLAUDE.md` with all project rules | Architecture and discipline come from me |
| Traced and diagnosed every build error | I read the traceback, identified the fix, gave AI a targeted prompt |
| Ran `npm run build` + `uvicorn` after every major change | Verified output myself |
| Tested full flow: login → quiz → submit → export | Manual end-to-end, not delegated |
| Wrote `XPATH_ANSWERS.md` from scratch | Pure research + reasoning |

---

## Time Pressure & Trade-offs

With 4 hours, I prioritized in this order:

**Must have (done first):**
1. FastAPI backend with `/api/types`, `/api/questions`, `/api/submit` → functional core
2. React frontend: login → quiz → results → export file
3. DummyJSON auth flow

**Should have (done next):**
4. Per-question timer (60s)
5. Next button locked until option selected
6. History endpoint reading from `exports/`

**Nice to have (done last):**
7. CSS animations and transitions
8. Docker compose
9. Extra questions

**Honest about time:** the Docker setup and some CSS polish came in the final ~30 minutes. If time ran out, the core flow (login → quiz → score → export) was already working.

---

## Prompts Used

All prompts were **specific and targeted** — not "build this for me":

1. **"Build FastAPI backend for JaneQ MCQ. Endpoints: GET /api/types, GET /api/questions?type=, POST /api/submit. JSON questions from data/questions_en.json. Server-side scoring only — answer/explanation fields never reach the frontend. Use Pydantic schemas. Follow CLAUDE.md rules."**
2. **"Build React frontend: LoginPage → MainPage (type list) → QuizPage (one question per page) → ResultsPage. Call JaneQ at VITE_JANEQ_URL. DummyJSON login. Follow CLAUDE.md."**
3. **"QuizPage: disable Next button until user selects an option."**
4. **"QuizPage: add 60-second countdown timer per question. When it hits 0, auto-advance."**
5. **"QuizPage: fade transition between questions. Use CSS only."**
6. **"Backend: add /api/history reading from exports/ JSON files. Sort by most recent."**
7. **"Docker compose: FastAPI + nginx serving React build on port 8080. VITE_JANEQ_URL=http://localhost:8000."**
8. **"npm run build error: verbatimModuleSyntax — fix the TypeScript import."** ← this was a traceback-driven prompt, not a feature request.

---

## What This Shows

- **Coding ability:** I set up FastAPI + React from scratch, designed the API contracts, and verified everything works end-to-end.
- **AI usage:** I use AI as a skilled executor — I define the what and the rules, AI handles the how. I read and understand every file it generates.
- **Time management:** Core flow first, bonus features after. Functional beats feature-rich if time is short.
- **Professional habits:** Structured rules, verified output, clean Git commits, English-only code.
