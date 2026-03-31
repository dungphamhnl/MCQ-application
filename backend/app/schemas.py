"""Pydantic models for API payloads."""

from pydantic import BaseModel, Field


class QuestionPublic(BaseModel):
    """Question without correct answer (client-facing)."""

    id: int
    question: str
    options: list[str]


class AnswerItem(BaseModel):
    """One user answer keyed by global question id."""

    question_id: int = Field(alias="questionId")
    selected: str | None = None

    model_config = {"populate_by_name": True}


class SubmitRequest(BaseModel):
    """Payload to grade a completed MCQ attempt."""

    username: str
    mcq_type: str = Field(alias="mcqType")

    answers: list[AnswerItem]

    model_config = {"populate_by_name": True}


class ResultItem(BaseModel):
    """Per-question grading detail."""

    question_id: int = Field(serialization_alias="questionId")
    question: str
    selected: str | None
    correct: bool
    correct_answer: str = Field(serialization_alias="correctAnswer")
    explanation: str = ""

    model_config = {"populate_by_name": True, "by_alias": True}


class SubmitResponse(BaseModel):
    """Score summary and export path."""

    score: int
    total: int
    items: list[ResultItem]
    export_path: str = Field(serialization_alias="exportPath")

    model_config = {"populate_by_name": True, "by_alias": True}
