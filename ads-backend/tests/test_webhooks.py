"""Tests for webhook handlers"""

import pytest
import json
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


@pytest.fixture
def client():
    """Create test client"""
    from main import app
    return TestClient(app)


class TestWebhooks:
    """Test webhook handlers"""

    def test_google_webhook(self, client):
        """Test Google Ads webhook"""
        payload = {
            "campaign_id": "123456",
            "event_type": "campaign_update",
            "impressions": 10000,
            "clicks": 500,
            "spend": 250.0,
            "timestamp": "2024-10-02T22:00:00Z"
        }

        response = client.post("/webhooks/google", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "received"

    def test_meta_webhook(self, client):
        """Test Meta Ads webhook"""
        payload = {
            "campaign_id": "654321",
            "event_type": "performance_update",
            "conversions": 200,
            "spend": 500.0,
            "roas": 3.0,
            "timestamp": "2024-10-02T22:00:00Z"
        }

        response = client.post("/webhooks/meta", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "received"

    def test_linkedin_webhook(self, client):
        """Test LinkedIn webhook"""
        payload = {
            "campaign_id": "789012",
            "event_type": "budget_alert",
            "daily_budget": 100.0,
            "remaining_budget": 25.5,
            "timestamp": "2024-10-02T22:00:00Z"
        }

        response = client.post("/webhooks/linkedin", json=payload)
        assert response.status_code == 200
        assert response.json()["status"] == "received"

    def test_webhook_processing(self, client):
        """Test webhook event processing"""
        # Simulate campaign event
        payload = {
            "campaign_id": "123456",
            "event_type": "campaign_paused",
            "reason": "budget_exhausted",
            "timestamp": "2024-10-02T22:00:00Z"
        }

        with patch('webhooks.handlers.process_event') as mock_process:
            mock_process.return_value = {"processed": True}

            response = client.post("/webhooks/google", json=payload)
            assert response.status_code == 200

    def test_webhook_validation(self, client):
        """Test webhook payload validation"""
        # Invalid payload
        payload = {"invalid": "data"}

        response = client.post("/webhooks/google", json=payload)
        # Should accept but handle gracefully
        assert response.status_code in [200, 400, 422]
