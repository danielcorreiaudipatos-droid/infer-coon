"""
Coordinator - Orquestra todas as integrações de ads
Sincroniza dados entre plataformas e gerencia operações
"""

import logging
from typing import List, Dict, Optional
from enum import Enum

from .google_ads import get_google_ads_client
from .meta_ads import get_meta_ads_client
from .linkedin_ads import get_linkedin_ads_client

logger = logging.getLogger(__name__)

class Platform(str, Enum):
    """Plataformas suportadas"""
    GOOGLE = "google"
    META = "meta"
    LINKEDIN = "linkedin"
    TIKTOK = "tiktok"

class AdsCoordinator:
    """Coordena operações em múltiplas plataformas de ads"""

    def __init__(self):
        """Inicializar coordinator"""
        self.google_ads = get_google_ads_client()
        self.meta_ads = get_meta_ads_client()
        self.linkedin_ads = get_linkedin_ads_client()

    def get_campaigns_all_platforms(self) -> Dict[str, List[Dict]]:
        """
        Buscar campanhas de TODAS as plataformas

        Returns:
            Dict: Campanhas por plataforma
        """
        campaigns = {
            "google": [],
            "meta": [],
            "linkedin": [],
            "tiktok": []
        }

        try:
            logger.info("Fetching campaigns from all platforms...")

            # Google
            try:
                campaigns["google"] = self.google_ads.get_campaigns()
                logger.info(f"✓ Google Ads: {len(campaigns['google'])} campaigns")
            except Exception as e:
                logger.error(f"✗ Google Ads error: {e}")

            # Meta
            try:
                campaigns["meta"] = self.meta_ads.get_campaigns()
                logger.info(f"✓ Meta Ads: {len(campaigns['meta'])} campaigns")
            except Exception as e:
                logger.error(f"✗ Meta Ads error: {e}")

            # LinkedIn
            try:
                campaigns["linkedin"] = self.linkedin_ads.get_campaigns()
                logger.info(f"✓ LinkedIn Ads: {len(campaigns['linkedin'])} campaigns")
            except Exception as e:
                logger.error(f"✗ LinkedIn Ads error: {e}")

            # TikTok (TODO)
            logger.info("✓ TikTok Ads: API integration pending")

            return campaigns

        except Exception as e:
            logger.error(f"Error coordinating campaigns: {e}")
            raise

    def get_performance_all_platforms(self, campaign_ids: Dict[str, str]) -> Dict[str, Dict]:
        """
        Buscar performance de uma campanha em cada plataforma

        Args:
            campaign_ids: Dict com IDs das campanhas por plataforma
                {
                    "google": "123456",
                    "meta": "789012",
                    "linkedin": "345678"
                }

        Returns:
            Dict: Performance por plataforma
        """
        performance = {}

        try:
            # Google
            if campaign_ids.get("google"):
                performance["google"] = self.google_ads.get_campaign_performance(
                    campaign_ids["google"]
                )

            # Meta
            if campaign_ids.get("meta"):
                performance["meta"] = self.meta_ads.get_campaign_insights(
                    campaign_ids["meta"]
                )

            # LinkedIn
            if campaign_ids.get("linkedin"):
                performance["linkedin"] = self.linkedin_ads.get_campaign_analytics(
                    campaign_ids["linkedin"]
                )

            return performance

        except Exception as e:
            logger.error(f"Error getting performance: {e}")
            raise

    def update_budgets(self, campaign_ids: Dict[str, str], new_budgets: Dict[str, float]) -> Dict[str, bool]:
        """
        Atualizar orçamentos em múltiplas plataformas

        Args:
            campaign_ids: IDs das campanhas por plataforma
            new_budgets: Novos orçamentos por plataforma (em dólares/reais)
                {
                    "google": 100.0,
                    "meta": 150.0,
                    "linkedin": 80.0
                }

        Returns:
            Dict: Status das atualizações
        """
        results = {}

        try:
            # Google (converte para micros: centavos × 10,000)
            if campaign_ids.get("google") and new_budgets.get("google"):
                try:
                    budget_micros = int(new_budgets["google"] * 1_000_000)
                    results["google"] = self.google_ads.update_campaign_budget(
                        campaign_ids["google"],
                        budget_micros
                    )
                except Exception as e:
                    logger.error(f"Google budget update failed: {e}")
                    results["google"] = False

            # Meta (converte para centavos)
            if campaign_ids.get("meta") and new_budgets.get("meta"):
                try:
                    budget_cents = int(new_budgets["meta"] * 100)
                    results["meta"] = self.meta_ads.update_campaign_budget(
                        campaign_ids["meta"],
                        budget_cents
                    )
                except Exception as e:
                    logger.error(f"Meta budget update failed: {e}")
                    results["meta"] = False

            # LinkedIn (converte para centavos)
            if campaign_ids.get("linkedin") and new_budgets.get("linkedin"):
                try:
                    budget_cents = int(new_budgets["linkedin"] * 100)
                    results["linkedin"] = self.linkedin_ads.update_campaign_budget(
                        campaign_ids["linkedin"],
                        budget_cents
                    )
                except Exception as e:
                    logger.error(f"LinkedIn budget update failed: {e}")
                    results["linkedin"] = False

            return results

        except Exception as e:
            logger.error(f"Error updating budgets: {e}")
            raise

    def pause_campaigns(self, campaign_ids: Dict[str, str]) -> Dict[str, bool]:
        """
        Pausar campanhas em múltiplas plataformas

        Args:
            campaign_ids: IDs das campanhas por plataforma

        Returns:
            Dict: Status das pausagens
        """
        results = {}

        try:
            if campaign_ids.get("google"):
                results["google"] = self.google_ads.pause_campaign(campaign_ids["google"])

            if campaign_ids.get("meta"):
                results["meta"] = self.meta_ads.pause_campaign(campaign_ids["meta"])

            if campaign_ids.get("linkedin"):
                results["linkedin"] = self.linkedin_ads.pause_campaign(campaign_ids["linkedin"])

            return results

        except Exception as e:
            logger.error(f"Error pausing campaigns: {e}")
            raise

# Instância global
_ads_coordinator = None

def get_ads_coordinator() -> AdsCoordinator:
    """Get or create ads coordinator"""
    global _ads_coordinator
    if _ads_coordinator is None:
        _ads_coordinator = AdsCoordinator()
    return _ads_coordinator
