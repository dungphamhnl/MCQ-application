# AI / LLM usage disclosure

This submission was developed with assistance from **Cursor** (agent with GPT-based model), following the MLX coding-test instructions that allow AI tools when usage is described.

**How it was used**

- Interpreted the PDF/spec and existing `questions_en.json` to design JaneQ endpoints and the React flow.
- Generated and iterated on FastAPI modules (`app/main.py`, `app/store.py`, `app/schemas.py`, `app/config.py`), React pages/components, CSS, Docker files, and docs.
- Fixed issues found during local runs (e.g. Pydantic `SubmitResponse` field naming, TypeScript `verbatimModuleSyntax` import, submit scoring logic).

**What was verified manually**

- `npm run build` for the frontend.
- `curl` against JaneQ for `/api/questions` and `/api/submit`; confirmed JSON files appear under `exports/`.

**Prompts (summary)**

- “Implement the attached JaneQ MCQ plan: FastAPI backend, React UI, DummyJSON auth, exports, docker-compose, XPath writeup.”
- Follow-up fixes were driven by compiler/traceback output rather than long natural-language prompts.
