"""
Google Ads API Integration
Gerenciar campanhas, budgets, performance no Google Ads
"""

import os
import logging
from typing import List, Dict, Optional
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException

logger = logging.getLogger(__name__)

class GoogleAdsIntegration:
    """Integração com Google Ads API v17"""

    def __init__(self):
        """Inicializar cliente Google Ads"""
        self.client = GoogleAdsClient.load_from_storage(
            version="v17",
            credentials_file=os.getenv("GOOGLE_ADS_CREDENTIALS_FILE", "credentials.json")
        )
        self.customer_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
        self.developer_token = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")

    def get_campaigns(self, limit: int = 100) -> List[Dict]:
        """
        Buscar todas as campanhas

        Returns:
            List[Dict]: Lista de campanhas com status
        """
        try:
            query = """
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.budget_settings.amount_micros,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros
                FROM campaign
                ORDER BY campaign.id
                LIMIT {limit}
            """.format(limit=limit)

            request = self.client.get_type("SearchGoogleAdsRequest")
            request.customer_id = self.customer_id
            request.query = query

            results = self.client.service.google_ads_service.search(request=request)

            campaigns = []
            for row in results:
                campaign = row.campaign
                metrics = row.metrics

                campaigns.append({
                    "id": campaign.id,
                    "name": campaign.name,
                    "status": campaign.status.name,
                    "budget_daily": metrics.cost_micros / 1_000_000 if metrics.cost_micros else 0,
                    "impressions": metrics.impressions or 0,
                    "clicks": metrics.clicks or 0,
                    "cost": metrics.cost_micros / 1_000_000 if metrics.cost_micros else 0,
                })

            logger.info(f"Fetched {len(campaigns)} campaigns from Google Ads")
            return campaigns

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            raise

    def get_campaign_performance(self, campaign_id: str) -> Dict:
        """
        Buscar performance detalhada de uma campanha

        Args:
            campaign_id: ID da campanha no Google Ads

        Returns:
            Dict: Métricas de performance
        """
        try:
            query = """
                SELECT
                    segments.date,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.conversions,
                    metrics.cost_micros
                FROM campaign
                WHERE campaign.id = {campaign_id}
                ORDER BY segments.date DESC
                LIMIT 30
            """.format(campaign_id=campaign_id)

            request = self.client.get_type("SearchGoogleAdsRequest")
            request.customer_id = self.customer_id
            request.query = query

            results = self.client.service.google_ads_service.search(request=request)

            daily_data = []
            for row in results:
                daily_data.append({
                    "date": row.segments.date,
                    "impressions": row.metrics.impressions or 0,
                    "clicks": row.metrics.clicks or 0,
                    "conversions": row.metrics.conversions or 0,
                    "cost": row.metrics.cost_micros / 1_000_000 if row.metrics.cost_micros else 0,
                })

            return {
                "campaign_id": campaign_id,
                "daily_data": daily_data,
                "total_impressions": sum(d["impressions"] for d in daily_data),
                "total_clicks": sum(d["clicks"] for d in daily_data),
                "total_conversions": sum(d["conversions"] for d in daily_data),
                "total_cost": sum(d["cost"] for d in daily_data),
            }

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            raise

    def update_campaign_budget(self, campaign_id: str, new_budget_micros: int) -> bool:
        """
        Atualizar orçamento diário de campanha

        Args:
            campaign_id: ID da campanha
            new_budget_micros: Novo orçamento em micros (centavos × 10,000)

        Returns:
            bool: Success
        """
        try:
            campaign = self.client.get_type("Campaign")
            campaign.resource_name = self.client.get_service("google_ads_service").campaign_path(
                self.customer_id, campaign_id
            )
            campaign.budget_settings.amount_micros = new_budget_micros

            operation = self.client.get_type("CampaignOperation")
            operation.update.CopyFrom(campaign)
            operation.update_mask.paths.append("budget_settings.amount_micros")

            request = self.client.get_type("MutateCampaignsRequest")
            request.customer_id = self.customer_id
            request.operations.append(operation)

            response = self.client.service.campaign_service.mutate_campaigns(request=request)

            logger.info(f"Updated campaign {campaign_id} budget to {new_budget_micros} micros")
            return True

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            raise

    def pause_campaign(self, campaign_id: str) -> bool:
        """Pausar campanha"""
        try:
            campaign = self.client.get_type("Campaign")
            campaign.resource_name = self.client.get_service("google_ads_service").campaign_path(
                self.customer_id, campaign_id
            )
            campaign.status = self.client.enums.CampaignStatusEnum.PAUSED

            operation = self.client.get_type("CampaignOperation")
            operation.update.CopyFrom(campaign)
            operation.update_mask.paths.append("status")

            request = self.client.get_type("MutateCampaignsRequest")
            request.customer_id = self.customer_id
            request.operations.append(operation)

            response = self.client.service.campaign_service.mutate_campaigns(request=request)

            logger.info(f"Paused campaign {campaign_id}")
            return True

        except GoogleAdsException as ex:
            logger.error(f"Google Ads API error: {ex}")
            raise

# Instância global
_google_ads_client = None

def get_google_ads_client() -> GoogleAdsIntegration:
    """Get or create Google Ads client"""
    global _google_ads_client
    if _google_ads_client is None:
        _google_ads_client = GoogleAdsIntegration()
    return _google_ads_client
