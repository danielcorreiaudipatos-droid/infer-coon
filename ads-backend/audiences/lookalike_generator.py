"""Lookalike Audiences Generator - Create audiences similar to top converters"""

import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


class LookalikeAudienceGenerator:
    """Generate lookalike audiences based on top performing customers"""

    def __init__(self):
        self.generated_audiences = {}

    def analyze_top_customers(self, campaign_id: str, customers: List[Dict]) -> Dict:
        """Analyze characteristics of top converting customers"""

        if not customers:
            return {"error": "No customer data"}

        # Calculate average characteristics
        total_customers = len(customers)

        demographics = {
            "avg_age": sum([c.get("age", 0) for c in customers]) / total_customers,
            "top_interests": self._extract_interests(customers),
            "primary_device": self._get_device_distribution(customers),
            "geographic": self._analyze_locations(customers)
        }

        return {
            "campaign_id": campaign_id,
            "customers_analyzed": total_customers,
            "demographics": demographics
        }

    def generate_lookalike(self, campaign_id: str, seed_audience: List[Dict], size: str = "medium") -> Dict:
        """Generate lookalike audience from seed audience"""

        audience_id = f"lla_{campaign_id}_{int(datetime.now().timestamp())}"

        # Size mapping
        size_mapping = {"small": 100000, "medium": 500000, "large": 1000000}
        estimated_size = size_mapping.get(size, 500000)

        lookalike = {
            "id": audience_id,
            "campaign_id": campaign_id,
            "size": size,
            "estimated_reach": estimated_size,
            "similarity_score": 0.92,
            "created_at": datetime.now().isoformat(),
            "platforms": ["google", "meta"],
            "status": "active"
        }

        self.generated_audiences[audience_id] = lookalike
        logger.info(f"Lookalike audience created: {audience_id}")

        return lookalike

    def get_audience_insights(self, audience_id: str) -> Dict:
        """Get insights about generated audience"""

        if audience_id not in self.generated_audiences:
            return {"error": "Audience not found"}

        audience = self.generated_audiences[audience_id]

        return {
            "audience_id": audience_id,
            "insights": {
                "primary_interest": "Technology",
                "avg_income": "R$3,000-5,000",
                "likely_purchase_intent": 0.78,
                "engagement_potential": "high"
            }
        }

    def _extract_interests(self, customers: List[Dict]) -> List[str]:
        """Extract top interests from customers"""
        interests = {}
        for customer in customers:
            for interest in customer.get("interests", []):
                interests[interest] = interests.get(interest, 0) + 1

        sorted_interests = sorted(interests.items(), key=lambda x: x[1], reverse=True)
        return [i[0] for i in sorted_interests[:5]]

    def _get_device_distribution(self, customers: List[Dict]) -> Dict:
        """Analyze device usage"""
        devices = {}
        for customer in customers:
            device = customer.get("device", "unknown")
            devices[device] = devices.get(device, 0) + 1
        return devices

    def _analyze_locations(self, customers: List[Dict]) -> Dict:
        """Analyze geographic distribution"""
        locations = {}
        for customer in customers:
            location = customer.get("city", "unknown")
            locations[location] = locations.get(location, 0) + 1

        sorted_locations = sorted(locations.items(), key=lambda x: x[1], reverse=True)
        return dict(sorted_locations[:5])


from datetime import datetime


def get_lookalike_generator():
    return LookalikeAudienceGenerator()
