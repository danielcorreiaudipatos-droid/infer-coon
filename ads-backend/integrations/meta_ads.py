"""
Meta (Facebook/Instagram) Ads API Integration
Gerenciar campanhas e performance no Meta Ads
"""

import os
import logging
import requests
from typing import List, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class MetaAdsIntegration:
    """Integração com Meta Ads API"""

    def __init__(self):
        """Inicializar cliente Meta Ads"""
        self.access_token = os.getenv("META_ACCESS_TOKEN")
        self.business_account_id = os.getenv("META_BUSINESS_ACCOUNT_ID")
        self.api_version = "v18.0"
        self.base_url = f"https://graph.instagram.com/{self.api_version}"

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Fazer requisição para Meta API"""
        url = f"{self.base_url}/{endpoint}"
        headers = {"Authorization": f"Bearer {self.access_token}"}

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
            logger.error(f"Meta API error: {e}")
            raise

    def get_campaigns(self) -> List[Dict]:
        """
        Buscar todas as campanhas

        Returns:
            List[Dict]: Lista de campanhas
        """
        try:
            campaigns = []

            # Pegar campanhas da conta de negócios
            response = self._make_request(
                "GET",
                f"{self.business_account_id}/campaigns",
                fields="id,name,status,budget_remaining,daily_budget,lifetime_budget,adset_count"
            )

            for campaign in response.get("data", []):
                campaigns.append({
                    "id": campaign["id"],
                    "name": campaign["name"],
                    "status": campaign["status"],
                    "budget_remaining": campaign.get("budget_remaining", 0),
                    "daily_budget": campaign.get("daily_budget", 0),
                    "lifetime_budget": campaign.get("lifetime_budget", 0),
                })

            logger.info(f"Fetched {len(campaigns)} campaigns from Meta Ads")
            return campaigns

        except Exception as e:
            logger.error(f"Error fetching Meta campaigns: {e}")
            raise

    def get_campaign_insights(self, campaign_id: str, date_preset: str = "last_7d") -> Dict:
        """
        Buscar insights de campanha

        Args:
            campaign_id: ID da campanha Meta
            date_preset: Período (last_7d, last_30d, etc)

        Returns:
            Dict: Métricas de performance
        """
        try:
            response = self._make_request(
                "GET",
                f"{campaign_id}/insights",
                date_preset=date_preset,
                fields="impressions,clicks,spend,actions,action_values"
            )

            data = response.get("data", [])[0] if response.get("data") else {}

            # Extrair conversions (actions)
            conversions = 0
            for action in data.get("actions", []):
                if action.get("action_type") == "purchase":
                    conversions += action.get("value", 0)

            return {
                "campaign_id": campaign_id,
                "impressions": data.get("impressions", 0),
                "clicks": data.get("clicks", 0),
                "spend": float(data.get("spend", 0)),
                "conversions": conversions,
                "period": date_preset,
            }

        except Exception as e:
            logger.error(f"Error fetching Meta campaign insights: {e}")
            raise

    def update_campaign_budget(self, campaign_id: str, daily_budget_cents: int) -> bool:
        """
        Atualizar orçamento diário

        Args:
            campaign_id: ID da campanha
            daily_budget_cents: Novo orçamento em centavos

        Returns:
            bool: Success
        """
        try:
            response = self._make_request(
                "POST",
                campaign_id,
                daily_budget=daily_budget_cents
            )

            logger.info(f"Updated campaign {campaign_id} budget to {daily_budget_cents} cents")
            return True

        except Exception as e:
            logger.error(f"Error updating Meta campaign budget: {e}")
            raise

    def pause_campaign(self, campaign_id: str) -> bool:
        """Pausar campanha"""
        try:
            response = self._make_request(
                "POST",
                campaign_id,
                status="PAUSED"
            )

            logger.info(f"Paused campaign {campaign_id}")
            return True

        except Exception as e:
            logger.error(f"Error pausing Meta campaign: {e}")
            raise

    def create_audience(self, name: str, customer_list: List[Dict]) -> str:
        """
        Criar public lookalike (audience)

        Args:
            name: Nome da audience
            customer_list: Lista de emails/phones para criar custom audience

        Returns:
            str: ID da audience criada
        """
        try:
            # Criar custom audience
            hashed_data = [
                {
                    "hashedEmail": hash_email(customer["email"])
                }
                for customer in customer_list
            ]

            response = self._make_request(
                "POST",
                f"{self.business_account_id}/audiences",
                name=name,
                customer_list=hashed_data,
                data_source="CUSTOMER_LIST",
                subtype="HASHED_CUSTOMER_LIST"
            )

            audience_id = response["id"]
            logger.info(f"Created audience {audience_id}: {name}")
            return audience_id

        except Exception as e:
            logger.error(f"Error creating Meta audience: {e}")
            raise

def hash_email(email: str) -> str:
    """Hash email for Meta API"""
    import hashlib
    return hashlib.sha256(email.lower().encode()).hexdigest()

# Instância global
_meta_ads_client = None

def get_meta_ads_client() -> MetaAdsIntegration:
    """Get or create Meta Ads client"""
    global _meta_ads_client
    if _meta_ads_client is None:
        _meta_ads_client = MetaAdsIntegration()
    return _meta_ads_client
