"""
RED Phase: JaneQ API tests — written before implementation to define behavior.
These tests pass against the existing implementation.
Run with: pytest backend/tests/test_api.py -v
"""

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Fixtures (provided by conftest.py)
# ---------------------------------------------------------------------------
# client: TestClient — FastAPI test client with question bank pre-loaded


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

class TestHealth:
    def test_health_returns_200(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_returns_status_ok(self, client: TestClient):
        response = client.get("/health")
        assert response.json()["status"] == "ok"


# ---------------------------------------------------------------------------
# GET /api/types
# ---------------------------------------------------------------------------

class TestTypes:
    def test_types_returns_200(self, client: TestClient):
        response = client.get("/api/types")
        assert response.status_code == 200

    def test_types_returns_types_key(self, client: TestClient):
        response = client.get("/api/types")
        assert "types" in response.json()

    def test_types_returns_list(self, client: TestClient):
        response = client.get("/api/types")
        assert isinstance(response.json()["types"], list)

    def test_types_are_unique(self, client: TestClient):
        """Types list has no duplicates."""
        response = client.get("/api/types")
        types = response.json()["types"]
        assert len(types) == len(set(types))


# ---------------------------------------------------------------------------
# GET /api/questions
# ---------------------------------------------------------------------------

class TestQuestions:
    def test_questions_returns_200_for_valid_type(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "API / HTTP"})
        assert response.status_code == 200

    def test_questions_returns_list(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "API / HTTP"})
        assert isinstance(response.json(), list)

    def test_questions_have_id_question_options(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "API / HTTP"})
        for q in response.json():
            assert "id" in q
            assert "question" in q
            assert "options" in q

    def test_questions_have_no_answer(self, client: TestClient):
        """answer and explanation must NOT be sent to the frontend."""
        response = client.get("/api/questions", params={"type": "API / HTTP"})
        for q in response.json():
            assert "answer" not in q, "answer must NOT reach frontend"
            assert "explanation" not in q, "explanation must NOT reach frontend"

    def test_questions_options_are_strings(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "API / HTTP"})
        for q in response.json():
            assert isinstance(q["options"], list)
            for opt in q["options"]:
                assert isinstance(opt, str)

    def test_questions_returns_404_for_unknown_type(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "nonexistent_type"})
        assert response.status_code == 404

    def test_questions_returns_404_for_empty_type(self, client: TestClient):
        response = client.get("/api/questions", params={"type": ""})
        assert response.status_code == 404


# ---------------------------------------------------------------------------
# POST /api/submit
# ---------------------------------------------------------------------------

class TestSubmit:
    def test_submit_returns_201(self, client: TestClient):
        """POST /api/submit creates a resource → 201 CREATED."""
        response = client.post(
            "/api/submit",
            json={
                "username": "testuser",
                "mcqType": "API / HTTP",
                "answers": [],
            },
        )
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"

    def test_submit_returns_score_and_total(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "testuser",
                "mcqType": "API / HTTP",
                "answers": [],
            },
        )
        body = response.json()
        assert "score" in body
        assert "total" in body
        assert isinstance(body["score"], int)
        assert isinstance(body["total"], int)

    def test_submit_score_reflects_correct_answer(self, client: TestClient):
        """Known correct answer: GET → score 1."""
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 10, "selected": "GET"}],
            },
        )
        assert response.json()["score"] == 1

    def test_submit_wrong_answer_yields_zero_for_that_question(self, client: TestClient):
        """Wrong answer: POST instead of GET → score 0 for that question."""
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 10, "selected": "POST"}],
            },
        )
        assert response.json()["score"] == 0

    def test_submit_includes_per_question_breakdown(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 11, "selected": "GET"}],
            },
        )
        body = response.json()
        assert "items" in body
        assert isinstance(body["items"], list)
        assert len(body["items"]) >= 1

    def test_submit_items_have_correct_fields(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 11, "selected": "GET"}],
            },
        )
        for item in response.json()["items"]:
            assert "questionId" in item
            assert "question" in item
            assert "selected" in item
            assert "correct" in item
            assert "correctAnswer" in item
            assert isinstance(item["correct"], bool)

    def test_submit_unanswered_counted_incorrect(self, client: TestClient):
        """All unanswered = 0 score."""
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [],
            },
        )
        assert response.json()["score"] == 0
        assert response.json()["total"] > 0

    def test_submit_bad_question_id_returns_400(self, client: TestClient):
        """questionId not in this type → 400."""
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 9999, "selected": "GET"}],
            },
        )
        assert response.status_code == 400

    def test_submit_unknown_type_returns_404(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "nonexistent_type",
                "answers": [],
            },
        )
        assert response.status_code == 404

    def test_submit_username_max_length_returns_422(self, client: TestClient):
        """Username > 100 chars → FastAPI validation error 422."""
        response = client.post(
            "/api/submit",
            json={
                "username": "a" * 101,
                "mcqType": "API / HTTP",
                "answers": [],
            },
        )
        assert response.status_code == 422

    def test_submit_returns_export_path(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "tdd_user",
                "mcqType": "API / HTTP",
                "answers": [],
            },
        )
        assert "exportPath" in response.json()


# ---------------------------------------------------------------------------
# GET /api/history
# ---------------------------------------------------------------------------

class TestHistory:
    def test_history_returns_200(self, client: TestClient):
        response = client.get("/api/history")
        assert response.status_code == 200

    def test_history_returns_attempts_key(self, client: TestClient):
        response = client.get("/api/history")
        assert "attempts" in response.json()

    def test_history_returns_list(self, client: TestClient):
        response = client.get("/api/history")
        assert isinstance(response.json()["attempts"], list)

    def test_history_limit_respected(self, client: TestClient):
        response = client.get("/api/history", params={"limit": 2})
        assert len(response.json()["attempts"]) <= 2

    def test_history_limit_minimum_0_returns_422(self, client: TestClient):
        """limit=0 → 422 validation error (ge=1)."""
        response = client.get("/api/history", params={"limit": 0})
        assert response.status_code == 422

    def test_history_limit_maximum_100_returns_422(self, client: TestClient):
        """limit=101 → 422 validation error (le=100)."""
        response = client.get("/api/history", params={"limit": 101})
        assert response.status_code == 422

    def test_history_rows_have_required_fields(self, client: TestClient):
        response = client.get("/api/history")
        for row in response.json()["attempts"]:
            assert "file" in row
            assert "exportPath" in row
            assert "submittedAt" in row
            assert "username" in row
            assert "mcqType" in row
            assert "score" in row
            assert "total" in row

    def test_history_score_is_integer(self, client: TestClient):
        response = client.get("/api/history")
        for row in response.json()["attempts"]:
            assert isinstance(row["score"], int)
            assert isinstance(row["total"], int)


# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

class TestCORS:
    def test_cors_allows_localhost_5173(self, client: TestClient):
        response = client.options(
            "/api/types",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert "access-control-allow-origin" in {h.lower() for h in response.headers}

    def test_cors_allows_127_0_0_1_5173(self, client: TestClient):
        response = client.options(
            "/api/types",
            headers={
                "Origin": "http://127.0.0.1:5173",
                "Access-Control-Request-Method": "GET",
            },
        )
        assert "access-control-allow-origin" in {h.lower() for h in response.headers}


# ---------------------------------------------------------------------------
# Error body shape
# ---------------------------------------------------------------------------

class TestErrorShape:
    def test_404_has_detail(self, client: TestClient):
        response = client.get("/api/questions", params={"type": "nonexistent_type"})
        assert response.status_code == 404
        assert "detail" in response.json()

    def test_400_has_detail(self, client: TestClient):
        response = client.post(
            "/api/submit",
            json={
                "username": "testuser",
                "mcqType": "API / HTTP",
                "answers": [{"questionId": 9999, "selected": "x"}],
            },
        )
        assert response.status_code == 400
        assert "detail" in response.json()
