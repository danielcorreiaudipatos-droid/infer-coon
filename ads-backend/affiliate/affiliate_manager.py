"""Affiliate Program Manager - Referrals, commissions, tracking"""

import os
import logging
from typing import Dict, Optional, List
from datetime import datetime, timedelta
import secrets

logger = logging.getLogger(__name__)


class AffiliateManager:
    """Gerencia programa de afiliados"""

    def __init__(self):
        """Initialize affiliate manager"""
        self.commission_rate = 0.15  # 15% per referral
        self.referral_tracking_days = 90

    def create_affiliate_link(
        self,
        varejo_id: str,
        varejo_name: str
    ) -> Dict:
        """
        Criar link de afiliado único

        Args:
            varejo_id: ID do varejo
            varejo_name: Nome do varejo

        Returns:
            Dict: Link e código de afiliado
        """
        # Gerar código único de afiliado
        affiliate_code = secrets.token_urlsafe(12)

        affiliate_link = {
            "affiliate_id": varejo_id,
            "affiliate_code": affiliate_code,
            "affiliate_link": f"https://ads-inteligente.com/?ref={affiliate_code}",
            "varejo_name": varejo_name,
            "created_at": datetime.now().isoformat(),
            "total_referrals": 0,
            "total_commissions": 0.0,
            "status": "active"
        }

        logger.info(f"Affiliate link created: {affiliate_code}")
        return affiliate_link

    def track_referral(
        self,
        affiliate_code: str,
        new_varejo_id: str,
        signup_amount: float = 0.0
    ) -> Dict:
        """
        Rastrear nova referência

        Args:
            affiliate_code: Código do afiliado
            new_varejo_id: ID do novo varejo
            signup_amount: Valor inicial gasto

        Returns:
            Dict: Referral tracked
        """
        # Calcular comissão inicial
        initial_commission = signup_amount * self.commission_rate

        referral = {
            "referral_id": f"ref_{affiliate_code}_{new_varejo_id}",
            "affiliate_code": affiliate_code,
            "referred_varejo_id": new_varejo_id,
            "signup_date": datetime.now().isoformat(),
            "expiry_date": (datetime.now() + timedelta(days=self.referral_tracking_days)).isoformat(),
            "initial_commission": initial_commission,
            "monthly_commissions": [],
            "total_commission": initial_commission,
            "status": "active",
            "referred_varejo_lifetime_value": signup_amount
        }

        logger.info(f"Referral tracked: {affiliate_code} → {new_varejo_id}")
        return referral

    def calculate_monthly_commission(
        self,
        affiliate_code: str,
        referred_varejo_id: str,
        monthly_revenue: float
    ) -> Dict:
        """
        Calcular comissão mensal de afiliado

        Args:
            affiliate_code: Código do afiliado
            referred_varejo_id: ID do varejo referenciado
            monthly_revenue: Receita mensal do varejo referenciado

        Returns:
            Dict: Commission for the month
        """
        monthly_commission = monthly_revenue * self.commission_rate

        return {
            "month": datetime.now().strftime("%Y-%m"),
            "affiliate_code": affiliate_code,
            "referred_varejo_id": referred_varejo_id,
            "referred_revenue": monthly_revenue,
            "commission": monthly_commission,
            "date": datetime.now().isoformat()
        }

    def get_affiliate_stats(
        self,
        affiliate_code: str,
        referrals: List[Dict]
    ) -> Dict:
        """
        Estatísticas completas do afiliado

        Args:
            affiliate_code: Código do afiliado
            referrals: Lista de referências

        Returns:
            Dict: Estatísticas do afiliado
        """
        affiliate_referrals = [r for r in referrals if r.get("affiliate_code") == affiliate_code]

        total_referrals = len(affiliate_referrals)
        total_commission = sum(r.get("total_commission", 0) for r in affiliate_referrals)
        active_referrals = len([r for r in affiliate_referrals if r.get("status") == "active"])

        # Calcular LTV (Lifetime Value) das referências
        total_ltv = sum(r.get("referred_varejo_lifetime_value", 0) for r in affiliate_referrals)

        return {
            "affiliate_code": affiliate_code,
            "total_referrals": total_referrals,
            "active_referrals": active_referrals,
            "total_commission_earned": total_commission,
            "total_ltv_generated": total_ltv,
            "average_referral_value": total_ltv / total_referrals if total_referrals > 0 else 0,
            "commission_rate": self.commission_rate * 100,
            "status": "active",
            "tier": self._calculate_tier(total_referrals)
        }

    def _calculate_tier(self, referral_count: int) -> str:
        """Calcular tier do afiliado"""
        if referral_count >= 100:
            return "Gold"
        elif referral_count >= 50:
            return "Silver"
        elif referral_count >= 10:
            return "Bronze"
        else:
            return "Starter"

    def get_top_affiliates(
        self,
        referrals: List[Dict],
        limit: int = 10
    ) -> List[Dict]:
        """
        Top afiliados por comissão

        Args:
            referrals: Lista de referências
            limit: Número de top afiliados

        Returns:
            List: Top affiliates ranked
        """
        # Agrupar por affiliate_code
        affiliate_totals = {}
        for referral in referrals:
            code = referral.get("affiliate_code")
            if code not in affiliate_totals:
                affiliate_totals[code] = 0
            affiliate_totals[code] += referral.get("total_commission", 0)

        # Ordenar e limitar
        sorted_affiliates = sorted(
            affiliate_totals.items(),
            key=lambda x: x[1],
            reverse=True
        )[:limit]

        return [
            {
                "rank": i + 1,
                "affiliate_code": code,
                "total_commission": commission,
                "badge": "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else f"#{i+1}"
            }
            for i, (code, commission) in enumerate(sorted_affiliates)
        ]

    def process_payout(
        self,
        affiliate_code: str,
        payout_amount: float,
        bank_account: str
    ) -> Dict:
        """
        Processar pagamento para afiliado

        Args:
            affiliate_code: Código do afiliado
            payout_amount: Valor a pagar
            bank_account: Conta bancária

        Returns:
            Dict: Payout processed
        """
        payout = {
            "payout_id": f"payout_{affiliate_code}_{datetime.now().timestamp()}",
            "affiliate_code": affiliate_code,
            "amount": payout_amount,
            "bank_account": bank_account,
            "status": "processing",
            "created_at": datetime.now().isoformat(),
            "estimated_arrival": (datetime.now() + timedelta(days=3)).isoformat(),
            "method": "bank_transfer"
        }

        logger.info(f"Payout processed: {affiliate_code} | R${payout_amount:.2f}")
        return payout


# Global instance
_affiliate_manager = None


def get_affiliate_manager() -> AffiliateManager:
    """Get or create affiliate manager"""
    global _affiliate_manager
    if _affiliate_manager is None:
        _affiliate_manager = AffiliateManager()
    return _affiliate_manager
