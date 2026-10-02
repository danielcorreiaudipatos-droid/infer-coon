"""
ADS Backend - Integrations Package
Módulos para integração com plataformas de ads
"""

from .google_ads import GoogleAdsIntegration, get_google_ads_client
from .meta_ads import MetaAdsIntegration, get_meta_ads_client
from .linkedin_ads import LinkedInAdsIntegration, get_linkedin_ads_client
from .coordinator import AdsCoordinator, get_ads_coordinator, Platform

__all__ = [
    "GoogleAdsIntegration",
    "MetaAdsIntegration",
    "LinkedInAdsIntegration",
    "AdsCoordinator",
    "get_google_ads_client",
    "get_meta_ads_client",
    "get_linkedin_ads_client",
    "get_ads_coordinator",
    "Platform",
]
