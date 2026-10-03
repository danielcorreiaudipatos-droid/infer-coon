"""TikTok Ads API Integration"""

import os
import logging
from typing import Dict, List
import requests

logger = logging.getLogger(__name__)


class TikTokAdsClient:
    """TikTok Ads API Integration"""

    def __init__(self):
        self.access_token = os.getenv("TIKTOK_ACCESS_TOKEN")
        self.advertiser_id = os.getenv("TIKTOK_ADVERTISER_ID")
        self.base_url = "https://business-api.tiktok.com/v1.3"

    def get_campaigns(self) -> List[Dict]:
        """Fetch all campaigns"""
        try:
            url = f"{self.base_url}/advertiser/campaigns/"
            headers = {"Access-Token": self.access_token}
            params = {"advertiser_id": self.advertiser_id}

            response = requests.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

            return [
                {
                    "id": c.get("campaign_id"),
                    "name": c.get("campaign_name"),
                    "status": c.get("status"),
                    "budget": c.get("budget", 0) / 100
                }
                for c in data.get("data", {}).get("campaigns", [])
            ]

        except Exception as e:
            logger.error(f"TikTok error: {e}")
            raise

    def create_campaign(self, campaign_name: str, budget: float) -> Dict:
        """Create new campaign"""
        url = f"{self.base_url}/campaign/create/"
        headers = {"Access-Token": self.access_token}
        data = {
            "advertiser_id": self.advertiser_id,
            "campaign_name": campaign_name,
            "budget_mode": "BUDGET_MODE_DAY",
            "budget": int(budget * 100),
            "objective": "CONVERSION"
        }

        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()

        campaign_id = response.json().get("data", {}).get("campaign_id")
        logger.info(f"TikTok campaign created: {campaign_id}")

        return {"campaign_id": campaign_id, "budget": budget}

    def get_campaign_analytics(self, campaign_id: str) -> Dict:
        """Get campaign analytics"""
        url = f"{self.base_url}/analytics/"
        headers = {"Access-Token": self.access_token}
        params = {
            "advertiser_id": self.advertiser_id,
            "campaign_id": campaign_id,
            "fields": "spend,impressions,clicks,conversions"
        }

        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()

        metrics = response.json().get("data", {}).get("list", [{}])[0]
        return {
            "spend": metrics.get("spend", 0) / 100,
            "impressions": metrics.get("impressions", 0),
            "clicks": metrics.get("clicks", 0),
            "conversions": metrics.get("conversions", 0)
        }

    def pause_campaign(self, campaign_id: str) -> bool:
        """Pause campaign"""
        url = f"{self.base_url}/campaign/update/"
        headers = {"Access-Token": self.access_token}
        data = {
            "advertiser_id": self.advertiser_id,
            "campaign_id": campaign_id,
            "status": "CAMPAIGN_STATUS_DISABLE"
        }

        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        return True


_client = None


def get_tiktok_client():
    global _client
    if _client is None:
        _client = TikTokAdsClient()
    return _client
