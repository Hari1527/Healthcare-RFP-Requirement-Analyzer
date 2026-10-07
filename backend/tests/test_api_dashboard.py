import pytest
from unittest.mock import patch

def test_dashboard_summary_empty(test_client):
    response = test_client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_documents"] == 0
    assert data["total_requirements"] == 0
    assert data["critical_requirements"] == 0
    assert data["missing_requirements"] == 0
    assert data["draft_responses"] == 0

def test_requirements_by_category(test_client):
    response = test_client.get("/api/dashboard/requirements-by-category")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_requirements_by_priority(test_client):
    response = test_client.get("/api/dashboard/requirements-by-priority")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_compliance_overview_empty(test_client):
    response = test_client.get("/api/dashboard/compliance-overview")
    assert response.status_code == 200
    data = response.json()
    assert data["compliant"] == 0
    assert data["partially_compliant"] == 0
    assert data["missing"] == 0
    assert data["needs_review"] == 0
    assert data["compliance_score"] is None
