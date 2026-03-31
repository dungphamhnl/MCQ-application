# AI / LLM usage disclosure

Assisted development tools were used in line with the MLX coding-test instructions (document how they were used).

---

## Role

Requirements were read and broken into a concrete plan; architecture and rules were defined first, then implementation was delegated via specific prompts. Generated code was reviewed.

---

## Project rules before implementation

See [`PROJECT_RULES.md`](PROJECT_RULES.md) — stack, security (server-side scoring only), CORS, English-only code and commits.

---

## What was delegated

- FastAPI modules (`main.py`, `store.py`, `schemas.py`, `config.py`)
- React pages and components (login, main, quiz, results, protected routes)
- Docker Compose and nginx config for static frontend
- Initial app shell and CSS

## What was done manually

- Content and structure of `data/questions_en.json`
- Running builds, fixing errors from compiler output, end-to-end testing (login → quiz → export)
- `XPATH_ANSWERS.md` (theoretical part)

---

## Prompts (summary)

Prompts were task-specific (endpoints, routes, timer behavior, Docker layout), not open-ended “build the whole app.” Details were driven by specs and [`PROJECT_RULES.md`](PROJECT_RULES.md).

---

## Time note

Core flow (JaneQ API + UI + DummyJSON + exports) was prioritized first; Docker, history, timer, and polish followed as time allowed.
