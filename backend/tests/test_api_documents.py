import os
import pytest
from unittest.mock import patch, MagicMock
from app.models.document import Document


def test_health_check(test_client):
    response = test_client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@patch("app.api.routes.documents.run_document_analysis")
@patch("app.services.document_service.DocumentService.upload_document")
def test_upload_document(mock_upload, mock_analysis, test_client, tmp_path):
    mock_upload.return_value = Document(
        id="test-doc-id", filename="test.pdf", original_filename="test.pdf",
        file_type="application/pdf", file_size=1024, processing_status="UPLOADED"
    )

    tmp_file = tmp_path / "test.pdf"
    tmp_file.write_bytes(b"%PDF-1.4 dummy")

    with open(tmp_file, "rb") as f:
        response = test_client.post(
            "/api/documents/upload",
            files={"file": ("test.pdf", f, "application/pdf")}
        )

    assert response.status_code == 200
    assert response.json()["id"] == "test-doc-id"


@patch("app.api.routes.documents.run_document_analysis")
@patch("app.services.document_service.DocumentService.upload_document")
def test_upload_invalid_file_type(mock_upload, mock_analysis, test_client, tmp_path):
    from app.utils.exceptions import InvalidFileTypeError
    mock_upload.side_effect = InvalidFileTypeError("application/x-msdownload")

    tmp_file = tmp_path / "test.exe"
    tmp_file.write_bytes(b"dummy")

    with open(tmp_file, "rb") as f:
        response = test_client.post(
            "/api/documents/upload",
            files={"file": ("test.exe", f, "application/x-msdownload")}
        )

    assert response.status_code == 400


def test_list_documents(test_client, test_db):
    doc = Document(id="doc-1", filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()

    response = test_client.get("/api/documents/")
    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["documents"][0]["id"] == "doc-1"


def test_get_document_not_found(test_client):
    response = test_client.get("/api/documents/nonexistent")
    assert response.status_code == 404


@patch("app.services.document_service.EmbeddingService")
def test_delete_document(mock_emb_cls, test_client, test_db, tmp_path):
    mock_instance = MagicMock()
    mock_emb_cls.return_value = mock_instance

    doc = Document(id="doc-del-1", filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()

    with patch("os.path.exists", return_value=False):
        response = test_client.delete("/api/documents/doc-del-1")
    assert response.status_code == 200

    response = test_client.get("/api/documents/doc-del-1")
    assert response.status_code == 404
