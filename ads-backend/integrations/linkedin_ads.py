"""
LinkedIn Ads API Integration
Gerenciar campanhas B2B no LinkedIn
"""

import os
import logging
import requests
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class LinkedInAdsIntegration:
    """Integração com LinkedIn Ads API"""

    def __init__(self):
        """Inicializar cliente LinkedIn Ads"""
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN")
        self.account_id = os.getenv("LINKEDIN_AD_ACCOUNT_ID")
        self.api_version = "202310"
        self.base_url = f"https://api.linkedin.com/v2"

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Fazer requisição para LinkedIn API"""
        url = f"{self.base_url}/{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "LinkedIn-Version": self.api_version,
            "Content-Type": "application/json"
        }

        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=kwargs)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=kwargs)
            else:
                raise ValueError(f"Unsupported method: {method}")

            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            logger.error(f"LinkedIn API error: {e}")
            raise

    def get_campaigns(self) -> List[Dict]:
        """
        Buscar todas as campanhas

        Returns:
            List[Dict]: Lista de campanhas
        """
        try:
            response = self._make_request(
                "GET",
                "adCampaignsV2",
                q="search",
                search={"account": f"urn:li:sponsoredAccount:{self.account_id}"}
            )

            campaigns = []
            for campaign in response.get("elements", []):
                campaigns.append({
                    "id": campaign["id"],
                    "name": campaign.get("name", "Unnamed"),
                    "status": campaign.get("status", "UNKNOWN"),
                    "budget": campaign.get("dailyBudget", {}).get("amount", 0),
                    "currency": campaign.get("dailyBudget", {}).get("currencyCode", "USD"),
                })

            logger.info(f"Fetched {len(campaigns)} campaigns from LinkedIn Ads")
            return campaigns

        except Exception as e:
            logger.error(f"Error fetching LinkedIn campaigns: {e}")
            raise

    def get_campaign_analytics(self, campaign_id: str) -> Dict:
        """
        Buscar analytics de campanha

        Args:
            campaign_id: ID da campanha LinkedIn

        Returns:
            Dict: Métricas de performance
        """
        try:
            response = self._make_request(
                "GET",
                "adAnalyticsV2",
                q="analytics",
                pivot="CAMPAIGN",
                pivotValues=[f"urn:li:sponsoredCampaign:{campaign_id}"],
                dateRange={"start": 1693526400, "end": 1701302399},  # 90 dias atrás
                timeGranularity="DAILY"
            )

            total_spend = 0
            total_impressions = 0
            total_clicks = 0

            for element in response.get("elements", []):
                analytics = element.get("pivotedValues", [{}])[0].get("pivotValues", {})
                total_spend += analytics.get("spend", 0)
                total_impressions += analytics.get("impressions", 0)
                total_clicks += analytics.get("clicks", 0)

            return {
                "campaign_id": campaign_id,
                "spend": total_spend / 100,  # LinkedIn retorna em centavos
                "impressions": total_impressions,
                "clicks": total_clicks,
                "cpc": (total_spend / 100 / total_clicks) if total_clicks > 0 else 0,
                "ctr": (total_clicks / total_impressions * 100) if total_impressions > 0 else 0,
            }

        except Exception as e:
            logger.error(f"Error fetching LinkedIn campaign analytics: {e}")
            raise

    def update_campaign_budget(self, campaign_id: str, new_budget_cents: int) -> bool:
        """
        Atualizar orçamento diário

        Args:
            campaign_id: ID da campanha
            new_budget_cents: Novo orçamento em centavos

        Returns:
            bool: Success
        """
        try:
            campaign_urn = f"urn:li:sponsoredCampaign:{campaign_id}"

            response = self._make_request(
                "POST",
                "adCampaignsV2",
                patch={
                    "$set": {
                        campaign_urn: {
                            "dailyBudget": {
                                "amount": new_budget_cents,
                                "currencyCode": "USD"
                            }
                        }
                    }
                }
            )

            logger.info(f"Updated LinkedIn campaign {campaign_id} budget to {new_budget_cents} cents")
            return True

        except Exception as e:
            logger.error(f"Error updating LinkedIn campaign budget: {e}")
            raise

    def pause_campaign(self, campaign_id: str) -> bool:
        """Pausar campanha"""
        try:
            campaign_urn = f"urn:li:sponsoredCampaign:{campaign_id}"

            response = self._make_request(
                "POST",
                "adCampaignsV2",
                patch={
                    "$set": {
                        campaign_urn: {
                            "status": "PAUSED"
                        }
                    }
                }
            )

            logger.info(f"Paused LinkedIn campaign {campaign_id}")
            return True

        except Exception as e:
            logger.error(f"Error pausing LinkedIn campaign: {e}")
            raise

# Instância global
_linkedin_ads_client = None

def get_linkedin_ads_client() -> LinkedInAdsIntegration:
    """Get or create LinkedIn Ads client"""
    global _linkedin_ads_client
    if _linkedin_ads_client is None:
        _linkedin_ads_client = LinkedInAdsIntegration()
    return _linkedin_ads_client
