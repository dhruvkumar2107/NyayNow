import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import os

# Set dummy environment variable before importing ml_api
os.environ["GEMINI_API_KEY"] = "mock_key"

# We mock configure_genai in llm module before importing ml_api
import llm
llm.configure_genai = MagicMock()

from ml_api import app

client = TestClient(app)

@patch("llm.call_gemini")
def test_analyze_endpoint(mock_call_gemini):
    # Mock LLM output
    mock_call_gemini.return_value = '{"answer": "Test Legal Answer", "related_questions": ["q1", "q2"], "intent": "labor_law"}'
    
    response = client.post(
        "/analyze",
        json={"user_text": "I was fired without notice.", "ui_lang": "English", "anon": True, "location": "India"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["answer"] == "Test Legal Answer"
    assert data["related_questions"] == ["q1", "q2"]
    assert data["intent"] == "labor_law"
    mock_call_gemini.assert_called_once()

@patch("llm.call_gemini")
def test_analyze_endpoint_invalid_json(mock_call_gemini):
    # Mock LLM output with invalid json (fallback scenario)
    mock_call_gemini.return_value = "This is a raw text response"
    
    response = client.post(
        "/analyze",
        json={"user_text": "Simple test query"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "This is a raw text response" in data["answer"]
    assert data["related_questions"] == []
    assert data["intent"] == "unknown"

@patch("llm.call_gemini")
def test_agreement_endpoint(mock_call_gemini):
    mock_call_gemini.return_value = '{"risks": ["high interest rate"], "clauses": ["Section 4"], "redFlags": ["unfair termination"]}'
    
    response = client.post(
        "/agreement",
        json={"details": "Rental agreement terms...", "ui_lang": "English"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "risks" in data
    assert "high interest rate" in data["risks"]
    assert "redFlags" in data
    assert "unfair termination" in data["redFlags"]

@patch("llm.call_gemini")
def test_case_analysis_endpoint(mock_call_gemini):
    mock_call_gemini.return_value = '{"summary": "A contract dispute", "laws": ["Indian Contract Act Section 10"], "advice": "Consult a lawyer"}'
    
    response = client.post(
        "/case-analysis",
        json={"user_text": "I paid for goods but didn't receive them.", "ui_lang": "Hindi"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["summary"] == "A contract dispute"
    assert "Indian Contract Act Section 10" in data["laws"]
    assert data["advice"] == "Consult a lawyer"

def test_nearby_search_with_coordinates():
    response = client.get("/nearby?q=delhi&lat=28.6139&lon=77.2090")
    assert response.status_code == 200
    data = response.json()
    assert "hits" in data
    assert len(data["hits"]) > 0
    assert data["hits"][0]["type"] in ["court", "legal_aid", "police"]

def test_nearby_geocode_only():
    response = client.get("/nearby?q=Mumbai")
    assert response.status_code == 200
    data = response.json()
    assert "geo" in data
    assert data["geo"]["name"] == "Mumbai"
    assert "lat" in data["geo"]

def test_nearby_error_missing_params():
    response = client.get("/nearby")
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
    assert data["error"] == "Provide q or q+lat+lon"
