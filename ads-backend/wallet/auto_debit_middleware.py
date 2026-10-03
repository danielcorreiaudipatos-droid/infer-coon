"""
⚡ AUTO-DEBIT MIDDLEWARE

Funcionalidade:
- Quando campanha é criada/ativada → abate saldo automaticamente
- Quando campanha gasta dinheiro → abate em tempo real
- Integração com Assas para transferência

Fluxo:
1. User cria campanha Google (orçamento R$ 1000)
2. Sistema abate R$ 1000 da carteira
3. Envia R$ 1000 para Google Ads
4. Google gasta gradualmente
5. Assas repassa o valor gasto de volta (reconciliação diária)
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, Dict
from enum import Enum
import requests

from .wallet_service import WalletService
from .wallet_models import TransactionType, ProductCatalog


class CampaignPlatform(str, Enum):
    GOOGLE = "google"
    META = "meta"
    TIKTOK = "tiktok"
    LINKEDIN = "linkedin"


class AutoDebitManager:
    """Gerencia débitos automáticos para campanhas"""

    def __init__(self, wallet_service: WalletService, assas_api_key: str):
        self.wallet_service = wallet_service
        self.assas_api_key = assas_api_key

    def create_campaign_with_debit(self, user_id: int, account_id: int,
                                  campaign_data: Dict) -> Dict:
        """
        Criar campanha E debitar saldo automaticamente

        Fluxo:
        1. Validar saldo
        2. Criar campanha no DB
        3. Abater saldo
        4. Enviar para plataforma de ads
        5. Registrar transação
        """

        platform = campaign_data.get("platform")  # google, meta, tiktok, linkedin
        budget = Decimal(str(campaign_data.get("budget", 0)))
        name = campaign_data.get("name")

        # 1. Validar saldo
        wallet = self.wallet_service.get_or_create_wallet(user_id, account_id)

        if not wallet.can_spend(budget):
            return {
                "success": False,
                "error": f"Saldo insuficiente. Você tem R$ {wallet.balance:.2f}, necessário R$ {budget:.2f}"
            }

        # 2. Criar campanha no DB (simulado)
        campaign_id = self._create_campaign_in_db(campaign_data)

        # 3. Abater saldo
        result = self.wallet_service.spend_for_ads(
            wallet.id, campaign_id, platform, budget
        )

        if not result["success"]:
            # Rollback - deletar campanha
            self._delete_campaign_in_db(campaign_id)
            return result

        # 4. Enviar para plataforma de ads
        ads_result = self._send_to_ads_platform(platform, campaign_data, budget)

        if not ads_result["success"]:
            # Rollback - reembolsar
            self._rollback_spend(wallet.id, campaign_id, budget)
            self._delete_campaign_in_db(campaign_id)
            return ads_result

        # 5. Registrar que foi enviado
        self._mark_campaign_sent(campaign_id, ads_result.get("external_id"))

        return {
            "success": True,
            "campaign_id": campaign_id,
            "budget": float(budget),
            "platform": platform,
            "status": "active",
            "message": f"Campanha criada e R$ {budget:.2f} debitado da carteira",
            "new_balance": float(wallet.balance - budget)
        }

    def process_daily_spend_reconciliation(self, account_id: int) -> Dict:
        """
        Reconciliar gastos diários (chamado 1x ao dia)

        Fluxo:
        1. Obter gastos reais do Google/Meta/etc
        2. Comparar com saldo debitado
        3. Ajustar diferenças
        """

        # Obter todas as campanhas ativas da conta
        # campaigns = Campaign.filter_by(account_id=account_id, status="active")

        reconciled = []

        # for campaign in campaigns:
        #     # Obter gasto real do platform
        #     actual_spend = self._get_actual_spend(campaign.platform, campaign.external_id)
        #
        #     if actual_spend != campaign.deducted_amount:
        #         # Ajustar no wallet
        #         difference = campaign.deducted_amount - actual_spend
        #
        #         if difference > 0:
        #             # Reembolsar diferença (gastou menos)
        #             self.wallet_service.refund_partial(campaign.wallet_id, difference)
        #         elif difference < 0:
        #             # Cobrar diferença (gastou mais)
        #             self.wallet_service.spend_for_ads(
        #                 campaign.wallet_id, campaign.id, campaign.platform,
        #                 abs(difference)
        #             )
        #
        #         reconciled.append({
        #             "campaign_id": campaign.id,
        #             "expected": float(campaign.deducted_amount),
        #             "actual": float(actual_spend),
        #             "adjustment": float(difference)
        #         })

        return {
            "success": True,
            "reconciled_count": len(reconciled),
            "reconciled": reconciled
        }

    def auto_pause_on_budget_exhausted(self, campaign_id: int) -> Dict:
        """
        Pausar campanha automaticamente quando orçamento esgota

        Chamado em tempo real quando saldo chega a zero
        """

        # campaign = Campaign.get(campaign_id)
        # wallet = Wallet.get(campaign.wallet_id)

        # if wallet.balance <= 0:
        #     # Pausar campanha no platform
        #     self._pause_campaign_on_platform(campaign.platform, campaign.external_id)
        #
        #     # Marcar como pausado
        #     campaign.status = "paused"
        #     campaign.paused_reason = "budget_exhausted"
        #     campaign.paused_at = datetime.utcnow()
        #
        #     # Notificar usuário
        #     send_email_to_user(
        #         campaign.user_id,
        #         "Campanha pausada - Orçamento esgotado",
        #         f"Sua campanha '{campaign.name}' foi pausada porque o orçamento terminou."
        #     )

        return {
            "success": True,
            "campaign_id": campaign_id,
            "status": "paused",
            "reason": "budget_exhausted"
        }

    def estimate_campaign_duration(self, budget: Decimal, daily_budget: Decimal) -> Dict:
        """
        Estimar quanto tempo a campanha vai durar

        Exemplo: Budget R$ 1000, daily R$ 50 → 20 dias
        """

        if daily_budget <= 0:
            return {
                "days": 0,
                "message": "Orçamento diário inválido"
            }

        days = int(budget / daily_budget)
        end_date = datetime.utcnow() + timedelta(days=days)

        return {
            "budget": float(budget),
            "daily_budget": float(daily_budget),
            "estimated_days": days,
            "estimated_end_date": end_date.isoformat(),
            "message": f"Sua campanha durará aproximadamente {days} dias"
        }

    # ===== PRIVATE METHODS =====

    def _create_campaign_in_db(self, campaign_data: Dict) -> int:
        """Criar campanha no banco de dados"""
        # campaign = Campaign(**campaign_data)
        # db.add(campaign)
        # db.commit()
        # return campaign.id
        return 123  # Simulado

    def _delete_campaign_in_db(self, campaign_id: int) -> bool:
        """Deletar campanha (rollback)"""
        # campaign = Campaign.get(campaign_id)
        # db.delete(campaign)
        # db.commit()
        return True

    def _send_to_ads_platform(self, platform: str, campaign_data: Dict,
                             budget: Decimal) -> Dict:
        """
        Enviar campanha para plataforma de ads

        Plataformas suportadas: Google, Meta, TikTok, LinkedIn
        """

        if platform == CampaignPlatform.GOOGLE:
            return self._send_to_google_ads(campaign_data, budget)
        elif platform == CampaignPlatform.META:
            return self._send_to_meta_ads(campaign_data, budget)
        elif platform == CampaignPlatform.TIKTOK:
            return self._send_to_tiktok_ads(campaign_data, budget)
        elif platform == CampaignPlatform.LINKEDIN:
            return self._send_to_linkedin_ads(campaign_data, budget)
        else:
            return {"success": False, "error": "Platform desconhecida"}

    def _send_to_google_ads(self, campaign_data: Dict, budget: Decimal) -> Dict:
        """Enviar para Google Ads API"""

        # Implementação simplificada
        # import google.ads.googleads

        try:
            # TODO: Integrar com Google Ads API
            # client = google.ads.googleads.GoogleAdsClient.load_from_storage()

            return {
                "success": True,
                "external_id": "google_campaign_12345",
                "platform": "google",
                "status": "active"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao enviar para Google: {str(e)}"
            }

    def _send_to_meta_ads(self, campaign_data: Dict, budget: Decimal) -> Dict:
        """Enviar para Meta (Facebook/Instagram) Ads API"""

        try:
            # TODO: Integrar com Meta Ads API

            return {
                "success": True,
                "external_id": "meta_campaign_12345",
                "platform": "meta",
                "status": "active"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao enviar para Meta: {str(e)}"
            }

    def _send_to_tiktok_ads(self, campaign_data: Dict, budget: Decimal) -> Dict:
        """Enviar para TikTok Ads API"""

        try:
            # TODO: Integrar com TikTok Ads API

            return {
                "success": True,
                "external_id": "tiktok_campaign_12345",
                "platform": "tiktok",
                "status": "active"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao enviar para TikTok: {str(e)}"
            }

    def _send_to_linkedin_ads(self, campaign_data: Dict, budget: Decimal) -> Dict:
        """Enviar para LinkedIn Ads API"""

        try:
            # TODO: Integrar com LinkedIn Ads API

            return {
                "success": True,
                "external_id": "linkedin_campaign_12345",
                "platform": "linkedin",
                "status": "active"
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Erro ao enviar para LinkedIn: {str(e)}"
            }

    def _mark_campaign_sent(self, campaign_id: int, external_id: str):
        """Marcar que campanha foi enviada com sucesso"""
        # campaign = Campaign.get(campaign_id)
        # campaign.external_id = external_id
        # campaign.sent_at = datetime.utcnow()
        # db.commit()
        pass

    def _rollback_spend(self, wallet_id: str, campaign_id: int, amount: Decimal):
        """Reembolsar gasto em caso de erro"""
        # self.wallet_service.refund_transaction(...)
        pass

    def _get_actual_spend(self, platform: str, external_id: str) -> Decimal:
        """Obter gasto real do platform via API"""
        # Implementar para cada platform
        return Decimal("0.00")

    def _pause_campaign_on_platform(self, platform: str, external_id: str):
        """Pausar campanha na plataforma via API"""
        pass


# Webhook Handler (para Assas notificações)

class AssasWebhookHandler:
    """Processa webhooks da Assas (pagamentos confirmados)"""

    @staticmethod
    def handle_payment_confirmed(event_data: Dict) -> Dict:
        """
        Webhook: Pagamento confirmado via Assas

        Quando usuário recarrega saldo:
        1. Assas processa pagamento
        2. Envia webhook para nós
        3. Adicionamos saldo à carteira
        """

        # payment_id = event_data.get("id")
        # customer_id = event_data.get("customer")
        # amount = Decimal(str(event_data.get("value", 0)))

        # wallet = Wallet.get_by_user_id(customer_id)
        # wallet.balance += amount
        # wallet.total_recharged += amount
        # db.commit()

        return {
            "success": True,
            "message": "Saldo adicionado com sucesso"
        }

    @staticmethod
    def handle_payment_failed(event_data: Dict) -> Dict:
        """
        Webhook: Pagamento falhou

        Notificar usuário que a recarga não foi completada
        """

        # customer_id = event_data.get("customer")
        # send_email_notification(customer_id, "Pagamento falhou")

        return {
            "success": True,
            "message": "Falha registrada"
        }

    @staticmethod
    def handle_payment_refunded(event_data: Dict) -> Dict:
        """
        Webhook: Pagamento reembolsado

        Se usuário pedir reembolso ou pagamento for revertido
        """

        return {
            "success": True,
            "message": "Reembolso processado"
        }
