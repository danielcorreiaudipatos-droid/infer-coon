"""API endpoint tests"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch


@pytest.fixture
def client():
    """Create test client"""
    from main import app
    return TestClient(app)


class TestAPIEndpoints:
    """Test main API endpoints"""

    def test_health_check(self, client):
        """Test /health endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

    def test_list_campaigns(self, client):
        """Test GET /campaigns"""
        with patch('integrations.get_ads_coordinator') as mock_get_coord:
            mock_coord = MagicMock()
            mock_get_coord.return_value = mock_coord
            mock_coord.get_campaigns_all_platforms.return_value = {
                "google": [{"id": "g1", "name": "Campaign 1"}],
                "meta": [{"id": "m1", "name": "Campaign 2"}]
            }

            response = client.get("/campaigns")
            assert response.status_code == 200

    def test_campaign_performance(self, client):
        """Test GET /campaigns/{id}/performance"""
        with patch('integrations.get_ads_coordinator') as mock_get_coord:
            mock_coord = MagicMock()
            mock_get_coord.return_value = mock_coord
            mock_coord.get_performance_all_platforms.return_value = {
                "google": {"spend": 250.0, "conversions": 50, "roi": 2.5},
                "meta": {"spend": 500.0, "conversions": 200, "roi": 3.0}
            }

            response = client.get("/campaigns/123456/performance")
            assert response.status_code == 200

    def test_optimization_suggestions(self, client):
        """Test GET /optimize/suggestions"""
        response = client.get("/optimize/suggestions?campaign_id=123456")
        assert response.status_code in [200, 400]  # Depends on campaign existence

    def test_update_campaign_budget(self, client):
        """Test POST /campaigns/{id}/budget"""
        payload = {"new_budget": 150.0}

        with patch('integrations.get_ads_coordinator') as mock_get_coord:
            mock_coord = MagicMock()
            mock_get_coord.return_value = mock_coord
            mock_coord.update_budgets.return_value = {
                "google": True,
                "meta": True
            }

            response = client.post("/campaigns/123456/budget", json=payload)
            assert response.status_code in [200, 400]

    def test_pause_campaign(self, client):
        """Test POST /campaigns/{id}/pause"""
        with patch('integrations.get_ads_coordinator') as mock_get_coord:
            mock_coord = MagicMock()
            mock_get_coord.return_value = mock_coord
            mock_coord.pause_campaigns.return_value = {"google": True}

            response = client.post("/campaigns/123456/pause")
            assert response.status_code in [200, 400]


class TestAuthEndpoints:
    """Test authentication endpoints"""

    def test_google_oauth(self, client):
        """Test POST /auth/google"""
        payload = {"code": "authorization_code_here"}
        response = client.post("/auth/google", json=payload)
        # Should handle OAuth flow
        assert response.status_code in [200, 400, 401]

    def test_meta_oauth(self, client):
        """Test POST /auth/meta"""
        payload = {"code": "authorization_code_here"}
        response = client.post("/auth/meta", json=payload)
        assert response.status_code in [200, 400, 401]

    def test_linkedin_oauth(self, client):
        """Test POST /auth/linkedin"""
        payload = {"code": "authorization_code_here"}
        response = client.post("/auth/linkedin", json=payload)
        assert response.status_code in [200, 400, 401]
