import pytest
from unittest.mock import patch, MagicMock
from app.models.document import Document
from app.models.requirement import Requirement
from app.schemas.search import SearchResponse, SearchResult
from app.api.dependencies import get_embedding_service


def test_search_empty_db(test_client):
    mock_emb = MagicMock()
    mock_emb.search_requirements.return_value = []

    def override_emb():
        return mock_emb

    from app.main import app
    app.dependency_overrides[get_embedding_service] = override_emb

    with patch("app.services.retrieval_service.RetrievalService.search") as mock_search:
        mock_search.return_value = SearchResponse(results=[], query="test", total=0)
        response = test_client.post("/api/search/", json={"query": "test"})
        assert response.status_code == 200
        assert response.json()["total"] == 0

    app.dependency_overrides.pop(get_embedding_service, None)


def test_search_with_results(test_client, test_db):
    doc = Document(id="doc-1", filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()

    req = Requirement(id="req-1", document_id="doc-1", requirement_text="Test requirement", category="General", priority="Medium", requirement_type="Mandatory")
    test_db.add(req)
    test_db.commit()

    mock_emb = MagicMock()

    def override_emb():
        return mock_emb

    from app.main import app
    app.dependency_overrides[get_embedding_service] = override_emb

    with patch("app.services.retrieval_service.RetrievalService.search") as mock_search:
        mock_search.return_value = SearchResponse(
            results=[
                SearchResult(
                    requirement_id="req-1",
                    requirement_text="Test requirement",
                    document_id="doc-1",
                    similarity_score=0.9,
                    category="General",
                    priority="Medium"
                )
            ],
            query="test",
            total=1
        )

        response = test_client.post("/api/search/", json={"query": "test"})
        assert response.status_code == 200
        assert response.json()["total"] == 1
        assert response.json()["results"][0]["requirement_id"] == "req-1"

    app.dependency_overrides.pop(get_embedding_service, None)
