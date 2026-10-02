"""Unit Tests - Core Features"""

import unittest
from ads_backend.tiktok.tiktok_client import TikTokAdsClient
from ads_backend.white_label.branding_engine import BrandingEngine
from ads_backend.lgpd.compliance_engine import LGPDComplianceEngine
from ads_backend.marketplace.template_manager import TemplateManager
from ads_backend.analytics.predictive_engine import PredictiveAnalyticsEngine
from ads_backend.audiences.lookalike_generator import LookalikeAudienceGenerator
from ads_backend.community.forum_manager import ForumManager
from ads_backend.mobile.premium_features import MobilePremiumManager


class TestTikTokIntegration(unittest.TestCase):
    """Test TikTok API integration"""

    def setUp(self):
        self.client = TikTokAdsClient()

    def test_client_initialization(self):
        """Test TikTok client initializes with credentials"""
        self.assertIsNotNone(self.client.access_token)
        self.assertIsNotNone(self.client.advertiser_id)
        self.assertEqual(self.client.base_url, "https://business-api.tiktok.com/v1.3")

    def test_campaign_analytics_format(self):
        """Test analytics returns correct metric structure"""
        # Mock data
        analytics = self.client.get_campaign_analytics("camp_123")

        self.assertIn("spend", analytics)
        self.assertIn("impressions", analytics)
        self.assertIn("clicks", analytics)
        self.assertIn("conversions", analytics)


class TestWhiteLabelSystem(unittest.TestCase):
    """Test white-label branding engine"""

    def setUp(self):
        self.engine = BrandingEngine()

    def test_white_label_config_creation(self):
        """Test white-label configuration is created"""
        config = self.engine.create_white_label_config(
            agency_id="agency_001",
            agency_name="Tech Agency",
            custom_domain="tech-agency.ads-inteligente.com",
            logo_url="https://example.com/logo.png"
        )

        self.assertEqual(config["agency_id"], "agency_001")
        self.assertEqual(config["status"], "active")
        self.assertEqual(config["revenue_share"], "60/40")

    def test_subdomain_generation(self):
        """Test unique subdomain generation"""
        subdomain = self.engine.generate_white_label_subdomain("agency_001")
        self.assertIn("agency_001", subdomain)
        self.assertIn("ads-inteligente.com", subdomain)

    def test_reseller_stats_structure(self):
        """Test reseller stats returns correct fields"""
        stats = self.engine.get_reseller_stats("agency_001")

        self.assertIn("total_clients", stats)
        self.assertIn("active_clients", stats)
        self.assertIn("monthly_revenue", stats)
        self.assertIn("agency_share", stats)


class TestLGPDCompliance(unittest.TestCase):
    """Test LGPD compliance engine"""

    def setUp(self):
        self.engine = LGPDComplianceEngine()

    def test_privacy_policy_generation(self):
        """Test LGPD-compliant privacy policy is generated"""
        policy = self.engine.generate_privacy_policy(
            company_name="ADS Inteligente",
            email="privacy@ads-inteligente.com"
        )

        self.assertIn("POLÍTICA DE PRIVACIDADE", policy)
        self.assertIn("COLETA DE DADOS", policy)
        self.assertIn("DIREITOS DO TITULAR", policy)
        self.assertIn("90", policy)  # Retention days

    def test_consent_banner_structure(self):
        """Test consent banner has required elements"""
        banner = self.engine.generate_consent_banner()

        self.assertEqual(banner["title"], "Aviso de Privacidade")
        self.assertEqual(len(banner["buttons"]), 3)
        self.assertTrue(banner["persistent"])

    def test_data_access_logging(self):
        """Test data access is logged for audit"""
        log = self.engine.log_data_access(
            user_id="user_001",
            action="view_campaigns",
            data_type="campaign_data"
        )

        self.assertEqual(log["user_id"], "user_001")
        self.assertEqual(log["action"], "view_campaigns")
        self.assertEqual(log["status"], "logged")

    def test_data_deletion_request(self):
        """Test data deletion request (direito ao esquecimento)"""
        request = self.engine.request_data_deletion(
            user_id="user_001",
            reason="Account closure"
        )

        self.assertEqual(request["status"], "processing")
        self.assertIn("completion_date", request)


class TestMarketplaceTemplates(unittest.TestCase):
    """Test marketplace template system"""

    def setUp(self):
        self.manager = TemplateManager()

    def test_template_creation(self):
        """Test template is created successfully"""
        template = self.manager.create_template(
            creator_id="creator_001",
            name="E-commerce Summer Campaign",
            description="Perfect for retail stores",
            category="ecommerce",
            platforms=["google", "meta"]
        )

        self.assertEqual(template["name"], "E-commerce Summer Campaign")
        self.assertEqual(template["status"], "active")
        self.assertEqual(template["downloads"], 0)

    def test_template_download_tracking(self):
        """Test template downloads are tracked"""
        template = self.manager.create_template(
            "creator_001", "Template", "Desc", "retail", ["google"]
        )

        self.manager.download_template(template["id"], "user_001")

        updated = self.manager.get_template(template["id"])
        self.assertEqual(updated["downloads"], 1)

    def test_template_search(self):
        """Test template search functionality"""
        self.manager.create_template(
            "creator_001", "Summer Sale", "Sale template", "retail", ["google"]
        )
        self.manager.create_template(
            "creator_002", "Winter Promo", "Winter template", "retail", ["meta"]
        )

        results = self.manager.search_templates("Summer")
        self.assertEqual(len(results), 1)


class TestPredictiveAnalytics(unittest.TestCase):
    """Test predictive analytics engine"""

    def setUp(self):
        self.engine = PredictiveAnalyticsEngine()

    def test_roi_prediction(self):
        """Test ROI prediction with historical data"""
        historical = [
            {"roi": 2.5},
            {"roi": 2.8},
            {"roi": 2.3}
        ]

        prediction = self.engine.predict_roi("camp_001", 1000, historical)

        self.assertIn("predicted_roi", prediction)
        self.assertIn("predicted_revenue", prediction)
        self.assertGreater(prediction["confidence"], 0)

    def test_anomaly_detection(self):
        """Test anomaly detection in metrics"""
        metrics = [
            {"date": "2026-10-01", "cpc": 3.50},
            {"date": "2026-10-02", "cpc": 3.60},
            {"date": "2026-10-03", "cpc": 10.00},  # Anomaly
            {"date": "2026-10-04", "cpc": 3.55}
        ]

        anomalies = self.engine.detect_anomalies("camp_001", metrics)

        self.assertGreater(len(anomalies), 0)
        self.assertEqual(anomalies[0]["severity"], "high")


class TestLookalikeAudiences(unittest.TestCase):
    """Test lookalike audience generation"""

    def setUp(self):
        self.generator = LookalikeAudienceGenerator()

    def test_customer_analysis(self):
        """Test customer characteristics analysis"""
        customers = [
            {"age": 28, "interests": ["tech", "marketing"], "device": "mobile"},
            {"age": 32, "interests": ["tech", "finance"], "device": "desktop"},
            {"age": 25, "interests": ["tech", "marketing"], "device": "mobile"}
        ]

        analysis = self.generator.analyze_top_customers("camp_001", customers)

        self.assertEqual(analysis["customers_analyzed"], 3)
        self.assertIn("demographics", analysis)

    def test_lookalike_generation(self):
        """Test lookalike audience generation"""
        seed = [{"id": "cust_001"}, {"id": "cust_002"}]

        audience = self.generator.generate_lookalike("camp_001", seed, size="medium")

        self.assertEqual(audience["size"], "medium")
        self.assertEqual(audience["estimated_reach"], 500000)
        self.assertEqual(audience["status"], "active")


class TestCommunityForum(unittest.TestCase):
    """Test community forum system"""

    def setUp(self):
        self.manager = ForumManager()

    def test_thread_creation(self):
        """Test forum thread creation"""
        thread = self.manager.create_thread(
            author_id="user_001",
            title="How to optimize TikTok campaigns?",
            content="I need help with my TikTok ads",
            category="tips"
        )

        self.assertIn("id", thread)
        self.assertEqual(thread["status"], "active")
        self.assertEqual(thread["replies"], 0)

    def test_thread_reply(self):
        """Test adding reply to thread"""
        thread = self.manager.create_thread(
            "user_001", "Test", "Content", "tips"
        )

        reply = self.manager.reply_to_thread(
            thread["id"], "user_002", "Great tip!"
        )

        self.assertIn("id", reply)
        updated_thread = self.manager.get_thread(thread["id"])
        self.assertEqual(updated_thread["replies"], 1)

    def test_badge_system(self):
        """Test gamification badges"""
        self.manager.create_user_profile("user_001", "John")

        badge = self.manager.award_badge("user_001", "helpful_answer")

        self.assertEqual(badge["badge"], "helpful_answer")


class TestMobilePremium(unittest.TestCase):
    """Test mobile premium features"""

    def setUp(self):
        self.manager = MobilePremiumManager()

    def test_push_device_registration(self):
        """Test device registration for push notifications"""
        sub = self.manager.register_push_device(
            user_id="user_001",
            device_token="token_abc123",
            platform="iOS"
        )

        self.assertEqual(sub["user_id"], "user_001")
        self.assertTrue(sub["enabled"])

    def test_offline_mode(self):
        """Test offline mode configuration"""
        offline = self.manager.enable_offline_mode("user_001")

        self.assertTrue(offline["offline_mode"])
        self.assertTrue(offline["auto_sync_when_online"])

    def test_voice_command_processing(self):
        """Test voice command processing"""
        result = self.manager.process_voice_command(
            "user_001",
            "show me the performance"
        )

        self.assertEqual(result["status"], "processed")
        self.assertIsNotNone(result["action"])


if __name__ == "__main__":
    unittest.main()
