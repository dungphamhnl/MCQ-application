"""Load and query questions from JSON."""

import json
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class QuestionRecord:
    """Single question with stable id = index in source file."""

    id: int
    question: str
    qtype: str
    options: list[str]
    answer: str
    explanation: str


_store: list[QuestionRecord] | None = None


def load_questions(path: Path) -> None:
    """Parse questions JSON into memory."""
    global _store
    raw = json.loads(path.read_text(encoding="utf-8"))
    items = raw.get("questions", [])
    _store = []
    for i, row in enumerate(items):
        _store.append(
            QuestionRecord(
                id=i,
                question=row["question"],
                qtype=row["type"],
                options=list(row["options"]),
                answer=row["answer"],
                explanation=row.get("explanation", ""),
            )
        )


def get_all() -> list[QuestionRecord]:
    if _store is None:
        raise RuntimeError("Questions not loaded")
    return _store


def list_types() -> list[str]:
    """Unique MCQ types, sorted for stable UI."""
    seen: set[str] = set()
    ordered: list[str] = []
    for q in get_all():
        if q.qtype not in seen:
            seen.add(q.qtype)
            ordered.append(q.qtype)
    return ordered


def questions_by_type(qtype: str) -> list[QuestionRecord]:
    return [q for q in get_all() if q.qtype == qtype]


def get_by_id(qid: int) -> QuestionRecord | None:
    all_q = get_all()
    if 0 <= qid < len(all_q):
        return all_q[qid]
    return None
