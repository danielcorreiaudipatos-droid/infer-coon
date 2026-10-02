"""Tests for IA Optimizer"""

import pytest
from unittest.mock import MagicMock, patch
from optimizers.gemini_optimizer import GeminiOptimizer


@pytest.fixture
def optimizer():
    """Create optimizer instance"""
    return GeminiOptimizer()


class TestGeminiOptimizer:
    """Test Gemini-based optimization"""

    def test_analyze_campaign(self, optimizer):
        """Test campaign analysis"""
        campaign_data = {
            "campaign_id": "123456",
            "platform": "google",
            "impressions": 10000,
            "clicks": 500,
            "ctr": 5.0,
            "spend": 250.0,
            "conversions": 50,
            "roi": 2.5
        }

        with patch.object(optimizer, 'analyze_campaign') as mock:
            mock.return_value = [
                {
                    "suggestion": "Increase bid by 15%",
                    "confidence": 0.85,
                    "potential_impact": "15-20% improvement in conversions"
                },
                {
                    "suggestion": "Improve ad copy targeting",
                    "confidence": 0.78,
                    "potential_impact": "10-12% CTR improvement"
                }
            ]

            suggestions = optimizer.analyze_campaign(campaign_data)
            assert len(suggestions) == 2
            assert suggestions[0]['confidence'] == 0.85

    def test_generate_copy(self, optimizer):
        """Test ad copy generation"""
        campaign_data = {
            "campaign_id": "123456",
            "product": "ADS Inteligente",
            "target_audience": "Small businesses",
            "keywords": ["ads", "marketing", "automation"]
        }

        with patch.object(optimizer, 'generate_copy') as mock:
            mock.return_value = [
                "Automate your ads with AI - 50% more conversions",
                "Smart advertising for small businesses",
                "AI-powered ads that actually convert",
                "Marketing automation that scales with you",
                "Stop wasting money on ads - Try ADS Inteligente"
            ]

            copies = optimizer.generate_copy(campaign_data)
            assert len(copies) == 5
            assert "automate" in copies[0].lower()

    def test_optimization_pipeline(self, optimizer):
        """Test complete optimization pipeline"""
        campaign_data = {
            "campaign_id": "123456",
            "platform": "meta",
            "impressions": 50000,
            "clicks": 2000,
            "spend": 500.0,
            "conversions": 200,
            "roi": 3.0
        }

        with patch.object(optimizer, 'analyze_campaign') as mock_analyze, \
             patch.object(optimizer, 'generate_copy') as mock_copy:

            mock_analyze.return_value = [
                {"suggestion": "Optimize audience", "confidence": 0.88}
            ]
            mock_copy.return_value = ["Better ad copy 1", "Better ad copy 2"]

            # Simulate full pipeline
            suggestions = optimizer.analyze_campaign(campaign_data)
            new_copy = optimizer.generate_copy(campaign_data)

            assert len(suggestions) > 0
            assert len(new_copy) > 0
