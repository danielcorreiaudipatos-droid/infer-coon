"""
💳 WALLET SYSTEM - ADS Inteligente

Funcionalidades:
- Adicionar saldo (recarga via cartão/PIX)
- Comprar produtos (templates, IA credits, etc)
- Comprar ads (Google, Meta, TikTok, LinkedIn)
- Comprar outros serviços
- Abatimento em tempo real
- Histórico de transações
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, List
from enum import Enum
from sqlalchemy import Column, Integer, Float, String, DateTime, Boolean, ForeignKey, JSON
from decimal import Decimal
import uuid


class TransactionType(str, Enum):
    RECHARGE = "recharge"              # Adição de saldo (entrada)
    SPEND_ADS = "spend_ads"            # Gasto em ads
    SPEND_PRODUCT = "spend_product"    # Compra de produto
    SPEND_SERVICE = "spend_service"    # Outro serviço
    REFUND = "refund"                  # Reembolso
    ADJUSTMENT = "adjustment"          # Ajuste manual (admin)


class TransactionStatus(str, Enum):
    PENDING = "pending"                # Aguardando processamento
    COMPLETED = "completed"            # Concluído com sucesso
    FAILED = "failed"                  # Falha
    REFUNDED = "refunded"              # Reembolsado


class PaymentMethod(str, Enum):
    CREDIT_CARD = "credit_card"
    DEBIT_CARD = "debit_card"
    PIX = "pix"
    BANK_TRANSFER = "bank_transfer"


class Wallet:
    """Carteira digital do usuário"""

    def __init__(self, user_id: int, account_id: int):
        self.id = str(uuid.uuid4())
        self.user_id = user_id
        self.account_id = account_id
        self.balance = Decimal("0.00")        # Saldo atual
        self.total_recharged = Decimal("0.00") # Total carregado
        self.total_spent = Decimal("0.00")     # Total gasto
        self.total_refunded = Decimal("0.00")  # Total reembolsado
        self.currency = "BRL"
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True

    def get_balance(self) -> Decimal:
        """Obter saldo atual"""
        return self.balance

    def can_spend(self, amount: Decimal) -> bool:
        """Verificar se tem saldo suficiente"""
        return self.balance >= amount

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "balance": float(self.balance),
            "total_recharged": float(self.total_recharged),
            "total_spent": float(self.total_spent),
            "currency": self.currency,
            "created_at": self.created_at.isoformat(),
            "is_active": self.is_active
        }


class Transaction:
    """Transação (recarga, gasto, reembolso)"""

    def __init__(self, wallet_id: str, user_id: int, transaction_type: TransactionType,
                 amount: Decimal, description: str = ""):
        self.id = str(uuid.uuid4())
        self.wallet_id = wallet_id
        self.user_id = user_id
        self.transaction_type = transaction_type
        self.amount = amount
        self.description = description
        self.status = TransactionStatus.PENDING
        self.metadata = {}  # campaign_id, product_id, etc
        self.created_at = datetime.utcnow()
        self.completed_at = None

    def mark_completed(self):
        """Marcar transação como concluída"""
        self.status = TransactionStatus.COMPLETED
        self.completed_at = datetime.utcnow()

    def mark_failed(self, reason: str = ""):
        """Marcar transação como falha"""
        self.status = TransactionStatus.FAILED
        self.metadata["failure_reason"] = reason

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "type": self.transaction_type,
            "amount": float(self.amount),
            "description": self.description,
            "status": self.status,
            "metadata": self.metadata,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }


class Recharge:
    """Recarga de saldo (pagamento)"""

    def __init__(self, wallet_id: str, user_id: int, amount: Decimal,
                 payment_method: PaymentMethod):
        self.id = str(uuid.uuid4())
        self.wallet_id = wallet_id
        self.user_id = user_id
        self.amount = amount
        self.payment_method = payment_method
        self.status = "pending"  # pending, processing, completed, failed
        self.payment_gateway_id = None  # ID do Stripe/Assas
        self.receipt = None
        self.created_at = datetime.utcnow()
        self.completed_at = None
        self.expires_at = datetime.utcnow() + timedelta(minutes=15)

    def is_expired(self) -> bool:
        """Verificar se expirou (para PIX/transferência)"""
        if self.status != "pending":
            return False
        return datetime.utcnow() > self.expires_at

    def mark_completed(self, receipt: str = ""):
        """Marcar como concluído"""
        self.status = "completed"
        self.completed_at = datetime.utcnow()
        self.receipt = receipt

    def mark_failed(self):
        """Marcar como falha"""
        self.status = "failed"

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "wallet_id": self.wallet_id,
            "amount": float(self.amount),
            "payment_method": self.payment_method,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "expires_at": self.expires_at.isoformat()
        }


class AdsSpend:
    """Gasto em ads (consumido em tempo real)"""

    def __init__(self, wallet_id: str, campaign_id: int, platform: str,
                 amount: Decimal):
        self.id = str(uuid.uuid4())
        self.wallet_id = wallet_id
        self.campaign_id = campaign_id
        self.platform = platform  # google, meta, tiktok, linkedin
        self.amount = amount
        self.status = "active"  # active, paused, stopped
        self.daily_budget = Decimal("0.00")
        self.daily_spent = Decimal("0.00")
        self.created_at = datetime.utcnow()
        self.last_charged_at = datetime.utcnow()

    def should_charge_today(self) -> bool:
        """Verificar se deve cobrar hoje"""
        last_charge_date = self.last_charged_at.date()
        today = datetime.utcnow().date()
        return last_charge_date < today

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "campaign_id": self.campaign_id,
            "platform": self.platform,
            "amount": float(self.amount),
            "daily_budget": float(self.daily_budget),
            "daily_spent": float(self.daily_spent),
            "status": self.status
        }


class ProductPurchase:
    """Compra de produto (template, IA credits, etc)"""

    def __init__(self, wallet_id: str, user_id: int, product_id: str,
                 product_name: str, amount: Decimal):
        self.id = str(uuid.uuid4())
        self.wallet_id = wallet_id
        self.user_id = user_id
        self.product_id = product_id
        self.product_name = product_name
        self.amount = amount
        self.quantity = 1
        self.status = "completed"
        self.created_at = datetime.utcnow()

    def to_dict(self) -> Dict:
        return {
            "id": self.id,
            "product_id": self.product_id,
            "product_name": self.product_name,
            "amount": float(self.amount),
            "quantity": self.quantity,
            "created_at": self.created_at.isoformat()
        }


# Product Catalog

class ProductCatalog:
    """Catálogo de produtos disponíveis"""

    PRODUCTS = {
        # Templates
        "template_pack_10": {
            "name": "Template Pack - 10 Templates",
            "category": "templates",
            "price": Decimal("99.00"),
            "currency": "BRL"
        },
        "template_pack_50": {
            "name": "Template Pack - 50 Templates",
            "category": "templates",
            "price": Decimal("399.00"),
            "currency": "BRL"
        },

        # IA Credits
        "ai_credits_100": {
            "name": "IA Credits - 100",
            "category": "ai",
            "price": Decimal("49.00"),
            "currency": "BRL"
        },
        "ai_credits_500": {
            "name": "IA Credits - 500",
            "category": "ai",
            "price": Decimal("199.00"),
            "currency": "BRL"
        },
        "ai_credits_1000": {
            "name": "IA Credits - 1000",
            "category": "ai",
            "price": Decimal("349.00"),
            "currency": "BRL"
        },

        # Video Editing
        "video_editor_monthly": {
            "name": "Video Editor - Monthly",
            "category": "tools",
            "price": Decimal("29.00"),
            "currency": "BRL"
        },

        # Copywriting AI
        "copywriting_100_prompts": {
            "name": "Copywriting AI - 100 prompts",
            "category": "ai",
            "price": Decimal("39.00"),
            "currency": "BRL"
        },

        # Canva Pro
        "canva_pro_monthly": {
            "name": "Canva Pro - Monthly",
            "category": "design",
            "price": Decimal("29.00"),
            "currency": "BRL"
        },

        # Analytics
        "advanced_analytics_monthly": {
            "name": "Advanced Analytics - Monthly",
            "category": "analytics",
            "price": Decimal("49.00"),
            "currency": "BRL"
        }
    }

    @classmethod
    def get_product(cls, product_id: str) -> Optional[Dict]:
        """Obter detalhes do produto"""
        return cls.PRODUCTS.get(product_id)

    @classmethod
    def list_products(cls) -> Dict:
        """Listar todos os produtos"""
        return cls.PRODUCTS

    @classmethod
    def get_price(cls, product_id: str) -> Optional[Decimal]:
        """Obter preço do produto"""
        product = cls.get_product(product_id)
        return product["price"] if product else None
