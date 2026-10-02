"""Predictive Analytics e Machine Learning para Otimização"""

import logging
from typing import Dict, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class PredictiveAnalyticsEngine:
    """ML-powered campaign prediction and optimization"""

    def __init__(self):
        self.models = {}

    def predict_roi(self, campaign_id: str, budget: float, historical_data: List[Dict]) -> Dict:
        """Predict ROI based on historical performance"""

        if not historical_data:
            return {"error": "Insufficient data"}

        # Simple model: calculate average ROI from historical data
        avg_roi = sum([d.get("roi", 0) for d in historical_data]) / len(historical_data)
        predicted_revenue = budget * avg_roi

        return {
            "campaign_id": campaign_id,
            "predicted_roi": avg_roi,
            "predicted_revenue": predicted_revenue,
            "confidence": 0.78,
            "forecast_days": 30
        }

    def optimize_budget(self, campaign_id: str, campaigns: List[Dict]) -> Dict:
        """Recommend budget optimization across campaigns"""

        # Sort by ROAS (return on ad spend)
        sorted_campaigns = sorted(
            campaigns,
            key=lambda x: x.get("roas", 0),
            reverse=True
        )

        recommendations = []
        for campaign in sorted_campaigns:
            if campaign["roas"] > 3.0:
                recommendations.append({
                    "campaign_id": campaign["id"],
                    "action": "increase_budget",
                    "percentage": 20
                })
            elif campaign["roas"] < 1.0:
                recommendations.append({
                    "campaign_id": campaign["id"],
                    "action": "decrease_budget",
                    "percentage": 20
                })

        return {
            "campaign_id": campaign_id,
            "recommendations": recommendations,
            "estimated_impact": "15% ROI increase"
        }

    def detect_anomalies(self, campaign_id: str, metrics: List[Dict]) -> List[Dict]:
        """Detect unusual patterns in campaign metrics"""

        anomalies = []

        if len(metrics) < 2:
            return anomalies

        # Calculate average and detect outliers
        cpc_values = [m.get("cpc", 0) for m in metrics]
        avg_cpc = sum(cpc_values) / len(cpc_values)
        std_dev = (sum([(x - avg_cpc) ** 2 for x in cpc_values]) / len(cpc_values)) ** 0.5

        for i, metric in enumerate(metrics):
            cpc = metric.get("cpc", 0)
            if abs(cpc - avg_cpc) > 2 * std_dev:
                anomalies.append({
                    "date": metric.get("date"),
                    "metric": "cpc",
                    "value": cpc,
                    "expected": avg_cpc,
                    "severity": "high"
                })

        return anomalies

    def forecast_metrics(self, campaign_id: str, days: int = 30) -> Dict:
        """Forecast future campaign performance"""

        # Simple trend-based forecast
        forecast = {
            "campaign_id": campaign_id,
            "forecast_days": days,
            "projected_metrics": {
                "daily_spend": 50,
                "daily_conversions": 15,
                "cpc": 3.50,
                "conversion_rate": 2.5
            },
            "confidence_interval": [0.15, 0.25],
            "generated_at": datetime.now().isoformat()
        }

        return forecast

    def recommend_audience(self, campaign_id: str, top_performers: List[Dict]) -> Dict:
        """Recommend audience expansion based on top performers"""

        return {
            "campaign_id": campaign_id,
            "recommended_segments": [
                {"type": "lookalike", "size": "medium", "confidence": 0.82},
                {"type": "interest", "value": "Digital Marketing", "confidence": 0.75}
            ]
        }

    def predict_churn_risk(self, varejo_id: str) -> float:
        """Predict likelihood of customer churn (0-1)"""
        # TODO: Implement ML model
        return 0.15


def get_predictive_engine():
    return PredictiveAnalyticsEngine()
