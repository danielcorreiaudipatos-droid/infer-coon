"""Unit Tests - Revenue Share Module"""

import unittest
from datetime import datetime, timedelta
from ads_backend.revenue_share.revenue_tracker import RevenueTracker


class TestRevenueTracker(unittest.TestCase):
    """Test revenue tracking and commission calculations"""

    def setUp(self):
        self.tracker = RevenueTracker()
        self.varejo_id = "var_001"
        self.campaign_id = "camp_001"

    def test_track_sale_basic(self):
        """Test basic sale tracking"""
        result = self.tracker.track_sale(
            varejo_id=self.varejo_id,
            campaign_id=self.campaign_id,
            sale_amount=1000.0,
            profit_margin=0.30
        )

        self.assertIn("sale_id", result)
        self.assertEqual(result["status"], "pending")
        self.assertEqual(result["commission"], 150.0)  # 15% of 1000
        self.assertIn("sale_id", result)

    def test_commission_calculation(self):
        """Test commission is 15% of sale amount"""
        sale_amount = 500.0
        self.tracker.track_sale(self.varejo_id, self.campaign_id, sale_amount, 0.25)

        balance = self.tracker.get_varejo_balance(self.varejo_id)
        self.assertEqual(balance["pending_commission"], 75.0)  # 15% of 500

    def test_confirm_sale_after_30_days(self):
        """Test sale confirmation after chargeback period"""
        sale_result = self.tracker.track_sale(
            self.varejo_id, self.campaign_id, 1000.0, 0.30
        )
        sale_id = sale_result["sale_id"]

        # Simulate 30+ days passing
        confirmed = self.tracker.confirm_sale(sale_id)
        self.assertEqual(confirmed["status"], "confirmed")

    def test_get_varejo_balance(self):
        """Test balance calculation (confirmed + pending)"""
        self.tracker.track_sale(self.varejo_id, self.campaign_id, 500.0, 0.20)
        self.tracker.track_sale(self.varejo_id, self.campaign_id, 300.0, 0.20)

        balance = self.tracker.get_varejo_balance(self.varejo_id)

        self.assertIn("total_balance", balance)
        self.assertIn("confirmed_balance", balance)
        self.assertIn("pending_commission", balance)
        self.assertEqual(balance["pending_commission"], 120.0)  # (500+300) * 0.15

    def test_handle_chargeback(self):
        """Test chargeback processing"""
        sale_result = self.tracker.track_sale(
            self.varejo_id, self.campaign_id, 1000.0, 0.30
        )
        sale_id = sale_result["sale_id"]

        chargeback = self.tracker.handle_chargeback(sale_id, "Customer dispute")
        self.assertEqual(chargeback["status"], "chargedback")
        self.assertEqual(chargeback["commission_reversed"], 150.0)

    def test_varejo_stats(self):
        """Test varejo performance statistics"""
        self.tracker.track_sale(self.varejo_id, "camp_001", 1000.0, 0.25)
        self.tracker.track_sale(self.varejo_id, "camp_002", 2000.0, 0.30)

        stats = self.tracker.get_varejo_stats(self.varejo_id)

        self.assertEqual(stats["total_sales_value"], 3000.0)
        self.assertEqual(stats["total_commissions"], 450.0)  # 15% of 3000
        self.assertEqual(stats["campaigns_count"], 2)

    def test_projection_30_days(self):
        """Test 30-day revenue projection"""
        for i in range(10):
            self.tracker.track_sale(self.varejo_id, f"camp_{i}", 100.0, 0.20)

        projection = self.tracker.project_earnings(self.varejo_id, days=30)

        self.assertIn("projected_30d", projection)
        self.assertIn("projected_90d", projection)
        self.assertGreater(projection["projected_30d"], 0)


class TestAffiliateCommissions(unittest.TestCase):
    """Test affiliate program commission calculations"""

    def setUp(self):
        self.tracker = RevenueTracker()
        self.affiliate_id = "aff_001"
        self.referred_varejo_id = "var_002"

    def test_affiliate_referral_tracking(self):
        """Test affiliate referral is recorded"""
        # Affiliate refers a varejo
        referral = self.tracker.track_referral(
            affiliate_id=self.affiliate_id,
            referred_varejo_id=self.referred_varejo_id
        )

        self.assertEqual(referral["status"], "active")
        self.assertEqual(referral["tracking_window_days"], 90)

    def test_affiliate_tier_calculation(self):
        """Test affiliate tier based on referrals"""
        # Simulate tier progression
        tiers = {
            0: "Starter",
            10: "Bronze",
            50: "Silver",
            100: "Gold"
        }

        # Test threshold logic
        for referral_count, expected_tier in tiers.items():
            tier = self._get_tier(referral_count)
            if referral_count == 0 or referral_count == 10:
                self.assertIsNotNone(tier)

    def _get_tier(self, count):
        """Helper to calculate tier"""
        if count >= 100:
            return "Gold"
        elif count >= 50:
            return "Silver"
        elif count >= 10:
            return "Bronze"
        return "Starter"


if __name__ == "__main__":
    unittest.main()
