import pytest
from app.models.document import Document
from app.models.requirement import Requirement

def test_list_requirements_empty(test_client):
    response = test_client.get("/api/requirements/")
    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["requirements"] == []

def test_get_requirement_not_found(test_client):
    response = test_client.get("/api/requirements/nonexistent")
    assert response.status_code == 404

def test_list_requirements(test_client, test_db):
    doc = Document(id="doc-1", filename="test.pdf", original_filename="test.pdf", file_type="application/pdf", file_size=100)
    test_db.add(doc)
    test_db.commit()
    
    req = Requirement(id="req-1", document_id="doc-1", requirement_text="Text", category="General", priority="Medium", requirement_type="Mandatory")
    test_db.add(req)
    test_db.commit()
    
    response = test_client.get("/api/requirements/")
    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["requirements"][0]["id"] == "req-1"
