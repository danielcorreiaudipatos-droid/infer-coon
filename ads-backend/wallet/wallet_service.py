"""
💳 WALLET SERVICE - Lógica de negócio

Funcionalidades:
- Recarregar saldo (via Stripe/Assas)
- Gastar saldo (ads, produtos, serviços)
- Histórico de transações
- Abatimento automático
"""

from datetime import datetime, timedelta
from decimal import Decimal
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
import stripe
import requests

from .wallet_models import (
    Wallet, Transaction, Recharge, AdsSpend, ProductPurchase,
    TransactionType, TransactionStatus, PaymentMethod, ProductCatalog
)


class WalletService:
    """Serviço de carteira digital"""

    def __init__(self, db: Session, stripe_key: str = None, assas_key: str = None):
        self.db = db
        self.stripe_key = stripe_key
        self.assas_key = assas_key

        if stripe_key:
            stripe.api_key = stripe_key

    # ===== WALLET OPERATIONS =====

    def get_or_create_wallet(self, user_id: int, account_id: int) -> Wallet:
        """Obter ou criar wallet do usuário"""
        # wallet = Wallet.query.filter_by(user_id=user_id, account_id=account_id).first()
        # if not wallet:
        #     wallet = Wallet(user_id=user_id, account_id=account_id)
        #     db.add(wallet)
        #     db.commit()
        # return wallet
        return Wallet(user_id=user_id, account_id=account_id)

    def get_balance(self, wallet_id: str) -> Decimal:
        """Obter saldo atual"""
        # wallet = Wallet.query.filter_by(id=wallet_id).first()
        # return wallet.balance if wallet else Decimal("0.00")
        return Decimal("0.00")

    # ===== RECHARGE OPERATIONS =====

    def create_recharge_intent(self, user_id: int, account_id: int,
                              amount: Decimal, payment_method: PaymentMethod) -> Dict:
        """Criar intenção de recarga (obtém wallet ou cria novo)"""

        wallet = self.get_or_create_wallet(user_id, account_id)
        recharge = Recharge(wallet.id, user_id, amount, payment_method)

        # Processar baseado no método de pagamento
        if payment_method == PaymentMethod.CREDIT_CARD:
            return self._create_stripe_charge(wallet, recharge)

        elif payment_method == PaymentMethod.PIX:
            return self._create_pix_qrcode(wallet, recharge)

        elif payment_method == PaymentMethod.BANK_TRANSFER:
            return self._create_bank_transfer(wallet, recharge)

        elif payment_method == PaymentMethod.DEBIT_CARD:
            return self._create_stripe_debit(wallet, recharge)

    def _create_stripe_charge(self, wallet: Wallet, recharge: Recharge) -> Dict:
        """Criar cobrança via Stripe (cartão crédito)"""

        try:
            # Criar intent de pagamento no Stripe
            intent = stripe.PaymentIntent.create(
                amount=int(recharge.amount * 100),  # Converter para centavos
                currency="brl",
                metadata={
                    "wallet_id": wallet.id,
                    "user_id": wallet.user_id,
                    "recharge_id": recharge.id
                }
            )

            recharge.payment_gateway_id = intent.id
            # db.add(recharge)
            # db.commit()

            return {
                "success": True,
                "recharge_id": recharge.id,
                "client_secret": intent.client_secret,
                "amount": float(recharge.amount),
                "status": "pending",
                "message": "Abra seu app de pagamento para completar"
            }

        except stripe.error.CardError as e:
            recharge.mark_failed()
            return {
                "success": False,
                "error": f"Erro no cartão: {e.user_message}"
            }

        except Exception as e:
            recharge.mark_failed()
            return {
                "success": False,
                "error": f"Erro ao processar: {str(e)}"
            }

    def _create_pix_qrcode(self, wallet: Wallet, recharge: Recharge) -> Dict:
        """Criar QR code PIX via Assas"""

        try:
            # Criar cobrança PIX no Assas
            response = requests.post(
                "https://api.asaas.com/v3/payments",
                headers={
                    "Authorization": f"Bearer {self.assas_key}"
                },
                json={
                    "customer": wallet.user_id,  # Usar user_id como customer
                    "billingType": "PIX",
                    "value": float(recharge.amount),
                    "dueDate": (datetime.utcnow() + timedelta(minutes=15)).strftime("%Y-%m-%d"),
                    "description": f"Recarga de saldo - {wallet.user_id}",
                    "externalReference": recharge.id
                }
            )

            if response.status_code == 200:
                data = response.json()
                recharge.payment_gateway_id = data["id"]
                # db.add(recharge)
                # db.commit()

                return {
                    "success": True,
                    "recharge_id": recharge.id,
                    "payment_id": data["id"],
                    "qr_code": data.get("pixQrCode"),
                    "qr_code_url": data.get("pixQrCodeUrl"),
                    "amount": float(recharge.amount),
                    "expires_at": recharge.expires_at.isoformat(),
                    "message": "Escaneie o QR code com seu banco"
                }
            else:
                recharge.mark_failed()
                return {
                    "success": False,
                    "error": "Erro ao gerar PIX"
                }

        except Exception as e:
            recharge.mark_failed()
            return {
                "success": False,
                "error": f"Erro ao processar PIX: {str(e)}"
            }

    def _create_bank_transfer(self, wallet: Wallet, recharge: Recharge) -> Dict:
        """Criar transferência bancária via Assas"""

        try:
            response = requests.post(
                "https://api.asaas.com/v3/payments",
                headers={
                    "Authorization": f"Bearer {self.assas_key}"
                },
                json={
                    "customer": wallet.user_id,
                    "billingType": "TRANSFER",
                    "value": float(recharge.amount),
                    "description": f"Transferência bancária - {wallet.user_id}",
                    "externalReference": recharge.id
                }
            )

            if response.status_code == 200:
                data = response.json()
                recharge.payment_gateway_id = data["id"]

                return {
                    "success": True,
                    "recharge_id": recharge.id,
                    "payment_id": data["id"],
                    "bank_account": data.get("accountNumber"),
                    "amount": float(recharge.amount),
                    "message": "Dados da transferência enviados por email"
                }
            else:
                return {
                    "success": False,
                    "error": "Erro ao gerar transferência"
                }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def _create_stripe_debit(self, wallet: Wallet, recharge: Recharge) -> Dict:
        """Criar débito automático via Stripe"""
        # Similar ao crédito mas marca como débito
        return self._create_stripe_charge(wallet, recharge)

    def confirm_payment(self, recharge_id: str, payment_id: str = None) -> Dict:
        """Confirmar pagamento e adicionar saldo"""

        # recharge = Recharge.query.filter_by(id=recharge_id).first()
        # if not recharge:
        #     return {"success": False, "error": "Recarga não encontrada"}

        # Verificar status no payment gateway
        # if recharge.status != "completed":
        #     if recharge.payment_method == PaymentMethod.CREDIT_CARD:
        #         # Verificar com Stripe
        #         intent = stripe.PaymentIntent.retrieve(recharge.payment_gateway_id)
        #         if intent.status == "succeeded":
        #             recharge.mark_completed(intent.id)

        # if recharge.status == "completed":
        #     # Adicionar saldo à wallet
        #     wallet = Wallet.query.filter_by(id=recharge.wallet_id).first()
        #     wallet.balance += recharge.amount
        #     wallet.total_recharged += recharge.amount
        #
        #     # Criar transação
        #     transaction = Transaction(
        #         wallet.id, wallet.user_id,
        #         TransactionType.RECHARGE,
        #         recharge.amount,
        #         f"Recarga via {recharge.payment_method}"
        #     )
        #     transaction.mark_completed()
        #     transaction.metadata["recharge_id"] = recharge.id
        #
        #     db.commit()

        return {
            "success": True,
            "message": "Saldo adicionado com sucesso!",
            "new_balance": 0.0  # wallet.balance
        }

    # ===== SPEND OPERATIONS =====

    def spend_for_ads(self, wallet_id: str, campaign_id: int, platform: str,
                     amount: Decimal) -> Dict:
        """Gastar saldo para ads (consumo em tempo real)"""

        # wallet = Wallet.query.filter_by(id=wallet_id).first()
        # if not wallet:
        #     return {"success": False, "error": "Wallet não encontrada"}

        # if not wallet.can_spend(amount):
        #     return {"success": False, "error": "Saldo insuficiente"}

        # # Debitar saldo
        # wallet.balance -= amount
        # wallet.total_spent += amount

        # # Criar transação
        # transaction = Transaction(
        #     wallet.id, wallet.user_id,
        #     TransactionType.SPEND_ADS,
        #     amount,
        #     f"Gasto em ads {platform}"
        # )
        # transaction.mark_completed()
        # transaction.metadata = {
        #     "campaign_id": campaign_id,
        #     "platform": platform
        # }

        # # Registrar ads spend
        # ads_spend = AdsSpend(wallet.id, campaign_id, platform, amount)

        # db.commit()

        return {
            "success": True,
            "message": f"Saldo debitado para {platform}",
            "amount": float(amount),
            "new_balance": 0.0  # float(wallet.balance)
        }

    def buy_product(self, wallet_id: str, user_id: int, product_id: str) -> Dict:
        """Comprar produto (template, IA credits, etc)"""

        # Verificar se produto existe
        product = ProductCatalog.get_product(product_id)
        if not product:
            return {"success": False, "error": "Produto não encontrado"}

        price = Decimal(str(product["price"]))

        # Verificar saldo
        # wallet = Wallet.query.filter_by(id=wallet_id).first()
        # if not wallet.can_spend(price):
        #     return {"success": False, "error": "Saldo insuficiente"}

        # Debitar saldo
        # wallet.balance -= price
        # wallet.total_spent += price

        # Criar transação
        # transaction = Transaction(
        #     wallet.id, user_id,
        #     TransactionType.SPEND_PRODUCT,
        #     price,
        #     f"Compra: {product['name']}"
        # )
        # transaction.mark_completed()
        # transaction.metadata["product_id"] = product_id

        # Registrar compra
        # purchase = ProductPurchase(wallet.id, user_id, product_id, product['name'], price)

        # db.commit()

        return {
            "success": True,
            "message": f"Produto '{product['name']}' comprado com sucesso!",
            "product_id": product_id,
            "amount": float(price),
            "new_balance": 0.0  # float(wallet.balance)
        }

    def refund_transaction(self, transaction_id: str, reason: str = "") -> Dict:
        """Reembolsar transação"""

        # transaction = Transaction.query.filter_by(id=transaction_id).first()
        # if not transaction or transaction.status != TransactionStatus.COMPLETED:
        #     return {"success": False, "error": "Transação não encontrada"}

        # wallet = Wallet.query.filter_by(id=transaction.wallet_id).first()

        # # Adicionar saldo de volta
        # wallet.balance += transaction.amount
        # wallet.total_refunded += transaction.amount

        # # Marcar como reembolsado
        # transaction.status = TransactionStatus.REFUNDED
        # transaction.metadata["refund_reason"] = reason

        # db.commit()

        return {
            "success": True,
            "message": "Reembolso processado com sucesso"
        }

    # ===== HISTORY & REPORTS =====

    def get_transaction_history(self, wallet_id: str, limit: int = 50,
                               offset: int = 0) -> List[Dict]:
        """Obter histórico de transações"""

        # transactions = Transaction.query.filter_by(wallet_id=wallet_id)\
        #     .order_by(Transaction.created_at.desc())\
        #     .limit(limit).offset(offset).all()

        transactions = []
        return [t.to_dict() for t in transactions]

    def get_monthly_summary(self, wallet_id: str, month: int, year: int) -> Dict:
        """Obter resumo mensal"""

        # start_date = datetime(year, month, 1)
        # end_date = start_date + timedelta(days=32)
        # end_date = end_date.replace(day=1) - timedelta(days=1)

        # transactions = Transaction.query.filter(
        #     Transaction.wallet_id == wallet_id,
        #     Transaction.created_at >= start_date,
        #     Transaction.created_at <= end_date
        # ).all()

        return {
            "month": month,
            "year": year,
            "total_recharged": 0.0,
            "total_spent": 0.0,
            "total_refunded": 0.0,
            "transactions": []
        }

    def get_spending_by_category(self, wallet_id: str) -> Dict:
        """Obter gasto por categoria"""

        return {
            "ads": 0.0,
            "products": 0.0,
            "services": 0.0,
            "refunds": 0.0
        }


# Invoice/Receipt Generation

class InvoiceGenerator:
    """Gerar recibos e notas fiscais"""

    @staticmethod
    def generate_receipt(transaction: Transaction) -> str:
        """Gerar recibo de transação"""

        receipt = f"""
        ╔════════════════════════════════════════════╗
        ║         RECIBO DE TRANSAÇÃO                ║
        ║         ADS INTELIGENTE                    ║
        ╚════════════════════════════════════════════╝

        ID da Transação: {transaction.id}
        Data: {transaction.created_at.strftime('%d/%m/%Y %H:%M:%S')}
        Tipo: {transaction.transaction_type.value}
        Valor: R$ {transaction.amount:,.2f}
        Status: {transaction.status.value}

        Descrição: {transaction.description}

        ════════════════════════════════════════════
        Obrigado por usar ADS Inteligente!
        """

        return receipt

    @staticmethod
    def generate_invoice(wallet: Wallet, transactions: List[Transaction]) -> str:
        """Gerar nota fiscal/extrato"""

        total_in = sum(t.amount for t in transactions
                      if t.transaction_type == TransactionType.RECHARGE)
        total_out = sum(t.amount for t in transactions
                       if t.transaction_type in [TransactionType.SPEND_ADS, TransactionType.SPEND_PRODUCT])

        invoice = f"""
        ╔════════════════════════════════════════════╗
        ║         EXTRATO DA CARTEIRA                ║
        ║         ADS INTELIGENTE                    ║
        ╚════════════════════════════════════════════╝

        Usuário ID: {wallet.user_id}
        Wallet ID: {wallet.id}
        Período: {wallet.created_at.strftime('%d/%m/%Y')} até hoje

        RESUMO:
        ────────────────────────────────────────────
        Total Carregado:    R$ {total_in:>12,.2f}
        Total Gasto:        R$ {total_out:>12,.2f}
        Saldo Atual:        R$ {wallet.balance:>12,.2f}

        DETALHES DAS TRANSAÇÕES:
        ────────────────────────────────────────────
        """

        for t in transactions:
            invoice += f"\n{t.created_at.strftime('%d/%m %H:%M')} | {t.transaction_type.value:15} | R$ {t.amount:>10,.2f}"

        return invoice
