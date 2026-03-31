"""
conftest.py — pytest fixtures for JaneQ backend tests.
Loads the real questions bank before any test runs.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app, load_questions
from app.config import settings


@pytest.fixture(scope="session", autouse=True)
def load_question_bank():
    """Load real questions on startup, once per test session."""
    if settings.questions_path and settings.questions_path.is_file():
        load_questions(settings.questions_path)


@pytest.fixture
def client(load_question_bank) -> TestClient:
    """FastAPI test client with questions pre-loaded."""
    return TestClient(app)
