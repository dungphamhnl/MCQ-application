"""JaneQ FastAPI application: MCQ types, questions, submit, and export."""

import json
import re
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.schemas import AnswerItem, QuestionPublic, ResultItem, SubmitRequest, SubmitResponse
from app.store import list_types, load_questions, questions_by_type


def _safe_filename_part(text: str, max_len: int = 40) -> str:
    """Turn arbitrary string into a filesystem-friendly fragment."""
    slug = re.sub(r"[^a-zA-Z0-9]+", "_", text).strip("_").lower()
    return (slug[:max_len] or "mcq").rstrip("_")


def _grade_submission(mcq_type: str, answers: list[AnswerItem]) -> tuple[list[ResultItem], int, int]:
    """Compare answers to stored questions for the given type. Returns items, score, total."""
    expected = questions_by_type(mcq_type)
    if not expected:
        raise HTTPException(status_code=404, detail=f"No questions for type: {mcq_type}")

    by_id = {q.id: q for q in expected}
    items: list[ResultItem] = []

    for ans in answers:
        q = by_id.get(ans.question_id)
        if q is None:
            # Question id not part of this quiz type
            raise HTTPException(
                status_code=400,
                detail=f"Question id {ans.question_id} is not in type '{mcq_type}'",
            )
        ok = (ans.selected or "").strip() == q.answer.strip()
        items.append(
            ResultItem(
                question_id=q.id,
                question=q.question,
                selected=ans.selected,
                correct=ok,
                correct_answer=q.answer,
                explanation=q.explanation,
            )
        )

    # Include unanswered questions in this type as incorrect (if client omitted them)
    answered_ids = {a.question_id for a in answers}
    for q in expected:
        if q.id not in answered_ids:
            items.append(
                ResultItem(
                    question_id=q.id,
                    question=q.question,
                    selected=None,
                    correct=False,
                    correct_answer=q.answer,
                    explanation=q.explanation,
                )
            )

    total = len(expected)
    items.sort(key=lambda x: x.question_id)
    score = sum(1 for it in items if it.correct)
    return items, score, total


def _write_export(
    username: str,
    mcq_type: str,
    payload: dict,
) -> str:
    """Persist submission JSON under exports/. Returns relative path from repo root."""
    exports_dir: Path = settings.exports_dir
    exports_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(UTC).strftime("%Y%m%dT%H%M%SZ")
    fname = f"submission_{_safe_filename_part(username)}_{ts}_{_safe_filename_part(mcq_type)}.json"
    out = exports_dir / fname
    out.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    # Path relative to repo for display / git
    try:
        rel = out.relative_to(settings.repo_root)
    except ValueError:
        rel = Path(fname)
    return str(rel).replace("\\", "/")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load question bank on startup."""
    path = settings.questions_path
    if not path.is_file():
        raise RuntimeError(f"Questions file not found: {path}")
    load_questions(path)
    yield


app = FastAPI(title="JaneQ", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/types")
def api_types():
    """List all MCQ categories from JaneQ."""
    return {"types": list_types()}


@app.get("/api/questions", response_model=list[QuestionPublic])
def api_questions(type: str = Query(..., alias="type", description="MCQ type label")):
    """Questions for one type; excludes correct answers."""
    qs = questions_by_type(type)
    if not qs:
        raise HTTPException(status_code=404, detail="Unknown or empty MCQ type")
    return [QuestionPublic(id=q.id, question=q.question, options=q.options) for q in qs]


@app.post("/api/submit", response_model=SubmitResponse, response_model_by_alias=True)
def api_submit(body: SubmitRequest):
    """Grade answers, return breakdown, and save export file in repo."""
    items, score, total = _grade_submission(body.mcq_type, body.answers)

    export_payload = {
        "submitted_at": datetime.now(UTC).isoformat(),
        "username": body.username,
        "mcq_type": body.mcq_type,
        "score": score,
        "total": total,
        "answers": [
            {
                "questionId": it.question_id,
                "question": it.question,
                "selected": it.selected,
                "correct": it.correct,
                "correctAnswer": it.correct_answer,
            }
            for it in items
        ],
    }
    rel_path = _write_export(body.username, body.mcq_type, export_payload)

    return SubmitResponse(
        score=score,
        total=total,
        items=items,
        export_path=rel_path,
    )


@app.get("/api/history")
def api_history(limit: int = 30):
    """List recent submissions from export files (bonus: past MCQ attempts)."""
    exports_dir: Path = settings.exports_dir
    if not exports_dir.is_dir():
        return {"attempts": []}
    rows: list[dict] = []
    for path in sorted(exports_dir.glob("submission_*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        if len(rows) >= limit:
            break
        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            rows.append(
                {
                    "file": path.name,
                    "exportPath": str(path.relative_to(settings.repo_root)).replace("\\", "/"),
                    "submittedAt": data.get("submitted_at", ""),
                    "username": data.get("username", ""),
                    "mcqType": data.get("mcq_type", ""),
                    "score": data.get("score", 0),
                    "total": data.get("total", 0),
                }
            )
        except (OSError, json.JSONDecodeError, ValueError):
            continue
    return {"attempts": rows}
