"""Integration tests for ad platforms"""

import pytest
from unittest.mock import MagicMock, patch
from integrations.coordinator import AdsCoordinator, Platform


@pytest.fixture
def coordinator():
    """Create coordinator instance"""
    return AdsCoordinator()


class TestGoogleAdsIntegration:
    """Test Google Ads integration"""

    def test_get_campaigns(self, coordinator):
        """Test fetching Google campaigns"""
        with patch.object(coordinator.google_ads, 'get_campaigns') as mock_get:
            mock_get.return_value = [
                {
                    "id": "123456",
                    "name": "Campaign 1",
                    "status": "ENABLED",
                    "budget": 1000.0
                }
            ]

            campaigns = coordinator.google_ads.get_campaigns()
            assert len(campaigns) == 1
            assert campaigns[0]['id'] == "123456"
            assert campaigns[0]['name'] == "Campaign 1"

    def test_get_campaign_performance(self, coordinator):
        """Test campaign performance metrics"""
        with patch.object(coordinator.google_ads, 'get_campaign_performance') as mock:
            mock.return_value = {
                "campaign_id": "123456",
                "impressions": 10000,
                "clicks": 500,
                "spend": 250.0,
                "conversions": 50,
                "roi": 2.5
            }

            performance = coordinator.google_ads.get_campaign_performance("123456")
            assert performance['impressions'] == 10000
            assert performance['roi'] == 2.5

    def test_update_campaign_budget(self, coordinator):
        """Test updating campaign budget"""
        with patch.object(coordinator.google_ads, 'update_campaign_budget') as mock:
            mock.return_value = True

            result = coordinator.google_ads.update_campaign_budget("123456", 2000000)
            assert result is True


class TestMetaAdsIntegration:
    """Test Meta Ads integration"""

    def test_get_campaigns(self, coordinator):
        """Test fetching Meta campaigns"""
        with patch.object(coordinator.meta_ads, 'get_campaigns') as mock_get:
            mock_get.return_value = [
                {
                    "id": "654321",
                    "name": "Meta Campaign 1",
                    "status": "ACTIVE",
                    "budget_remaining": 500.0
                }
            ]

            campaigns = coordinator.meta_ads.get_campaigns()
            assert len(campaigns) == 1
            assert campaigns[0]['id'] == "654321"

    def test_get_campaign_insights(self, coordinator):
        """Test Meta campaign insights"""
        with patch.object(coordinator.meta_ads, 'get_campaign_insights') as mock:
            mock.return_value = {
                "campaign_id": "654321",
                "impressions": 50000,
                "clicks": 2000,
                "spend": 500.0,
                "conversions": 200
            }

            insights = coordinator.meta_ads.get_campaign_insights("654321")
            assert insights['conversions'] == 200


class TestCoordinator:
    """Test Coordinator multi-platform operations"""

    def test_get_campaigns_all_platforms(self, coordinator):
        """Test fetching campaigns from all platforms"""
        with patch.object(coordinator.google_ads, 'get_campaigns') as mock_google, \
             patch.object(coordinator.meta_ads, 'get_campaigns') as mock_meta, \
             patch.object(coordinator.linkedin_ads, 'get_campaigns') as mock_linkedin:

            mock_google.return_value = [{"id": "g1", "name": "Google"}]
            mock_meta.return_value = [{"id": "m1", "name": "Meta"}]
            mock_linkedin.return_value = [{"id": "l1", "name": "LinkedIn"}]

            campaigns = coordinator.get_campaigns_all_platforms()

            assert len(campaigns['google']) == 1
            assert len(campaigns['meta']) == 1
            assert len(campaigns['linkedin']) == 1

    def test_update_budgets_multi_platform(self, coordinator):
        """Test updating budgets across platforms"""
        campaign_ids = {
            "google": "123456",
            "meta": "654321",
            "linkedin": "789012"
        }
        new_budgets = {
            "google": 100.0,
            "meta": 150.0,
            "linkedin": 80.0
        }

        with patch.object(coordinator.google_ads, 'update_campaign_budget') as mock_google, \
             patch.object(coordinator.meta_ads, 'update_campaign_budget') as mock_meta, \
             patch.object(coordinator.linkedin_ads, 'update_campaign_budget') as mock_linkedin:

            mock_google.return_value = True
            mock_meta.return_value = True
            mock_linkedin.return_value = True

            results = coordinator.update_budgets(campaign_ids, new_budgets)

            assert results['google'] is True
            assert results['meta'] is True
            assert results['linkedin'] is True

    def test_pause_campaigns(self, coordinator):
        """Test pausing campaigns across platforms"""
        campaign_ids = {
            "google": "123456",
            "meta": "654321"
        }

        with patch.object(coordinator.google_ads, 'pause_campaign') as mock_google, \
             patch.object(coordinator.meta_ads, 'pause_campaign') as mock_meta:

            mock_google.return_value = True
            mock_meta.return_value = True

            results = coordinator.pause_campaigns(campaign_ids)

            assert results['google'] is True
            assert results['meta'] is True
