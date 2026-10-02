"""Revenue Share Tracking - Rastreamento de vendas e comissões"""

import os
import logging
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from enum import Enum

logger = logging.getLogger(__name__)


class SaleSource(str, Enum):
    """Fonte de venda"""
    SHOPIFY = "shopify"
    WOOCOMMERCE = "woocommerce"
    PIXEL_CONVERSION = "pixel"
    WEBHOOK = "webhook"
    MANUAL = "manual"
    STRIPE = "stripe"
    MERCADO_LIVRE = "mercado_livre"


class RevenueTracker:
    """Rastreia vendas e calcula comissões automaticamente"""

    def __init__(self):
        """Inicializar tracker"""
        self.commission_rate = 0.15  # 15%
        self.chargebackperiod_days = 30

    def track_sale(
        self,
        varejo_id: str,
        campaign_id: str,
        sale_amount: float,
        profit_margin: float,
        source: SaleSource = SaleSource.PIXEL_CONVERSION,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """
        Rastrear venda e calcular comissão

        Args:
            varejo_id: ID do varejo
            campaign_id: ID da campanha
            sale_amount: Valor total da venda
            profit_margin: Margem de lucro (0.3 = 30%)
            source: Fonte da venda
            metadata: Dados adicionais (order_id, customer, etc)

        Returns:
            Dict: Informações da venda rastreada
        """
        try:
            # Calcular lucro
            profit = sale_amount * profit_margin
            commission = profit * self.commission_rate
            varejo_earnings = profit - commission

            sale_record = {
                "sale_id": f"sale_{varejo_id}_{datetime.now().timestamp()}",
                "varejo_id": varejo_id,
                "campaign_id": campaign_id,
                "timestamp": datetime.now().isoformat(),
                "source": source.value,
                "sale_amount": sale_amount,
                "profit_margin": profit_margin,
                "profit": profit,
                "commission_rate": self.commission_rate,
                "commission": commission,
                "varejo_earnings": varejo_earnings,
                "status": "pending",  # pending -> confirmed -> chargedback
                "chargebackdeadline": (datetime.now() + timedelta(days=30)).isoformat(),
                "metadata": metadata or {}
            }

            logger.info(f"Sale tracked: {varejo_id} | Profit: R${profit:.2f} | Commission: R${commission:.2f}")
            return sale_record

        except Exception as e:
            logger.error(f"Error tracking sale: {e}")
            raise

    def calculate_commission(
        self,
        profit: float
    ) -> Dict:
        """
        Calcular comissão sobre lucro

        Args:
            profit: Lucro da venda

        Returns:
            Dict: Breakdown de comissão
        """
        commission = profit * self.commission_rate
        varejo_keeps = profit - commission

        return {
            "profit": profit,
            "commission_rate": self.commission_rate,
            "commission_amount": commission,
            "varejo_receives": varejo_keeps,
            "breakdown": {
                "varejo_percentage": (1 - self.commission_rate) * 100,
                "ads_percentage": self.commission_rate * 100
            }
        }

    def get_varejo_balance(
        self,
        varejo_id: str,
        sales_records: List[Dict]
    ) -> Dict:
        """
        Calcular saldo do varejo

        Args:
            varejo_id: ID do varejo
            sales_records: Lista de vendas

        Returns:
            Dict: Saldo consolidado
        """
        confirmed_earnings = 0
        pending_earnings = 0
        chargedback_losses = 0
        total_commissions = 0

        for sale in sales_records:
            if sale.get("varejo_id") != varejo_id:
                continue

            if sale.get("status") == "confirmed":
                confirmed_earnings += sale.get("varejo_earnings", 0)
                total_commissions += sale.get("commission", 0)
            elif sale.get("status") == "pending":
                pending_earnings += sale.get("varejo_earnings", 0)
                total_commissions += sale.get("commission", 0)
            elif sale.get("status") == "chargedback":
                chargedback_losses += sale.get("varejo_earnings", 0)

        return {
            "varejo_id": varejo_id,
            "confirmed_balance": confirmed_earnings,
            "pending_balance": pending_earnings,
            "total_available": confirmed_earnings + pending_earnings,
            "chargedback_losses": chargedback_losses,
            "total_commissions_to_ads": total_commissions,
            "net_balance": confirmed_earnings + pending_earnings - chargedback_losses,
            "can_withdraw": confirmed_earnings >= 50  # Mínimo R$ 50 para sacar
        }

    def confirm_sale(
        self,
        sale_id: str,
        sales_records: List[Dict]
    ) -> Dict:
        """
        Confirmar venda após período de charge-back

        Args:
            sale_id: ID da venda
            sales_records: Lista de vendas

        Returns:
            Dict: Venda confirmada
        """
        for sale in sales_records:
            if sale.get("sale_id") == sale_id:
                if sale.get("status") == "pending":
                    # Verificar se passou 30 dias
                    chargebackdeadline = datetime.fromisoformat(sale.get("chargebackdeadline"))
                    if datetime.now() > chargebackdeadline:
                        sale["status"] = "confirmed"
                        logger.info(f"Sale confirmed: {sale_id}")
                        return sale

        return {"error": "Sale not found or not pending"}

    def handle_chargeback(
        self,
        sale_id: str,
        sales_records: List[Dict]
    ) -> Dict:
        """
        Processar charge-back de venda

        Args:
            sale_id: ID da venda
            sales_records: Lista de vendas

        Returns:
            Dict: Venda marcada como charge-back
        """
        for sale in sales_records:
            if sale.get("sale_id") == sale_id:
                sale["status"] = "chargedback"
                logger.warning(f"Chargeback processed: {sale_id}")
                return sale

        return {"error": "Sale not found"}

    def get_varejo_stats(
        self,
        varejo_id: str,
        sales_records: List[Dict]
    ) -> Dict:
        """
        Estatísticas do varejo

        Args:
            varejo_id: ID do varejo
            sales_records: Lista de vendas

        Returns:
            Dict: Estatísticas consolidadas
        """
        varejo_sales = [s for s in sales_records if s.get("varejo_id") == varejo_id]

        total_sales = len(varejo_sales)
        total_revenue = sum(s.get("sale_amount", 0) for s in varejo_sales)
        total_profit = sum(s.get("profit", 0) for s in varejo_sales)
        total_earned = sum(s.get("varejo_earnings", 0) for s in varejo_sales if s.get("status") != "chargedback")
        total_commissions = sum(s.get("commission", 0) for s in varejo_sales)

        return {
            "varejo_id": varejo_id,
            "total_sales": total_sales,
            "total_revenue": total_revenue,
            "total_profit": total_profit,
            "total_earned": total_earned,
            "total_commissions_to_ads": total_commissions,
            "average_sale": total_revenue / total_sales if total_sales > 0 else 0,
            "average_profit_margin": (total_profit / total_revenue * 100) if total_revenue > 0 else 0,
            "conversion_efficiency": f"{(total_earned / total_revenue * 100) if total_revenue > 0 else 0:.2f}%"
        }

    def project_earnings(
        self,
        varejo_id: str,
        sales_records: List[Dict],
        days_ahead: int = 30
    ) -> Dict:
        """
        Projetar ganhos futuros

        Args:
            varejo_id: ID do varejo
            sales_records: Lista de vendas
            days_ahead: Dias para projetar

        Returns:
            Dict: Projeção de ganhos
        """
        stats = self.get_varejo_stats(varejo_id, sales_records)

        if stats["total_sales"] == 0:
            return {"error": "Sem dados de vendas para projetar"}

        # Calcular média diária
        avg_daily_sales = stats["total_sales"] / 30  # Assumir 30 dias de histórico
        avg_daily_earnings = stats["total_earned"] / 30

        projected_sales = avg_daily_sales * days_ahead
        projected_earnings = avg_daily_earnings * days_ahead
        projected_commissions = projected_earnings * self.commission_rate

        return {
            "varejo_id": varejo_id,
            "projection_days": days_ahead,
            "avg_daily_sales": avg_daily_sales,
            "avg_daily_earnings": avg_daily_earnings,
            "projected_total_sales": projected_sales,
            "projected_total_earnings": projected_earnings,
            "projected_ads_commissions": projected_commissions,
            "confidence": "Medium" if stats["total_sales"] >= 10 else "Low"
        }


# Global instance
_revenue_tracker = None


def get_revenue_tracker() -> RevenueTracker:
    """Get or create revenue tracker"""
    global _revenue_tracker
    if _revenue_tracker is None:
        _revenue_tracker = RevenueTracker()
    return _revenue_tracker
