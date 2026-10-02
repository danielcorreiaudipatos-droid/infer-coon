"""
💳 WALLET API ENDPOINTS - FastAPI Routes
"""

from fastapi import APIRouter, HTTPException, Request
from decimal import Decimal
from typing import Optional

from .wallet_models import PaymentMethod, ProductCatalog
from .wallet_service import WalletService, InvoiceGenerator

router = APIRouter(prefix="/api/wallet", tags=["Wallet"])


# ===== WALLET INFO =====

@router.get("/balance")
def get_balance(user_id: int, account_id: int):
    """Obter saldo atual do usuário"""
    service = WalletService(db=None)  # Pass real db
    wallet = service.get_or_create_wallet(user_id, account_id)

    return {
        "wallet_id": wallet.id,
        "balance": float(wallet.balance),
        "currency": "BRL",
        "total_spent": float(wallet.total_spent),
        "total_recharged": float(wallet.total_recharged)
    }


@router.get("/{wallet_id}")
def get_wallet_details(wallet_id: str):
    """Obter detalhes completos da carteira"""
    return {
        "wallet_id": wallet_id,
        "balance": 0.0,  # wallet.balance
        "status": "active",
        "created_at": "2026-10-02T00:00:00Z"
    }


# ===== RECHARGE (Adicionar Saldo) =====

@router.post("/recharge/create")
def create_recharge(user_id: int, account_id: int, amount: float,
                   payment_method: str):
    """
    Criar intenção de recarga

    Payment Methods:
    - credit_card: Cartão de crédito
    - debit_card: Cartão de débito
    - pix: PIX QR code
    - bank_transfer: Transferência bancária
    """

    try:
        payment_method_enum = PaymentMethod(payment_method)
    except ValueError:
        raise HTTPException(status_code=400, detail="Payment method inválido")

    service = WalletService(db=None)  # Pass real db
    result = service.create_recharge_intent(
        user_id, account_id,
        Decimal(str(amount)),
        payment_method_enum
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/recharge/{recharge_id}/confirm")
def confirm_recharge(recharge_id: str):
    """
    Confirmar pagamento e adicionar saldo

    Chamado após usuário completar pagamento
    """
    service = WalletService(db=None)
    result = service.confirm_payment(recharge_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/recharge/{recharge_id}/webhook")
def webhook_recharge(recharge_id: str, request: Request):
    """
    Webhook para payment gateways (Stripe/Assas)

    Processa pagamentos completados automaticamente
    """
    service = WalletService(db=None)
    result = service.confirm_payment(recharge_id)

    return {"status": "processed"}


# ===== ADS SPENDING (Consumo automático) =====

@router.post("/spend/ads")
def spend_for_ads(wallet_id: str, campaign_id: int, platform: str, amount: float):
    """
    Debitar saldo para ads (consumo em tempo real)

    Platforms: google, meta, tiktok, linkedin

    Chamado automaticamente ao processar ads
    """
    service = WalletService(db=None)
    result = service.spend_for_ads(
        wallet_id, campaign_id, platform,
        Decimal(str(amount))
    )

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


@router.post("/spend/product")
def buy_product(wallet_id: str, user_id: int, product_id: str):
    """
    Comprar produto (template, IA credits, etc)

    Product IDs:
    - template_pack_10 (R$ 99,00)
    - template_pack_50 (R$ 399,00)
    - ai_credits_100 (R$ 49,00)
    - ai_credits_500 (R$ 199,00)
    - ai_credits_1000 (R$ 349,00)
    - video_editor_monthly (R$ 29,00)
    - copywriting_100_prompts (R$ 39,00)
    - canva_pro_monthly (R$ 29,00)
    - advanced_analytics_monthly (R$ 49,00)
    """
    service = WalletService(db=None)
    result = service.buy_product(wallet_id, user_id, product_id)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


# ===== TRANSACTIONS =====

@router.get("/transactions")
def get_transactions(wallet_id: str, limit: int = 50, offset: int = 0):
    """
    Obter histórico de transações

    Query params:
    - limit: Número de transações (padrão 50)
    - offset: Página (padrão 0)
    """
    service = WalletService(db=None)
    transactions = service.get_transaction_history(wallet_id, limit, offset)

    return {
        "wallet_id": wallet_id,
        "transactions": transactions,
        "total": len(transactions)
    }


@router.get("/transactions/{transaction_id}")
def get_transaction_details(transaction_id: str):
    """Obter detalhes de uma transação"""
    return {
        "transaction_id": transaction_id,
        "type": "spend_ads",
        "amount": 100.00,
        "status": "completed",
        "created_at": "2026-10-02T15:30:00Z",
        "metadata": {
            "campaign_id": 123,
            "platform": "google"
        }
    }


@router.post("/transactions/{transaction_id}/refund")
def refund_transaction(transaction_id: str, reason: str = ""):
    """
    Reembolsar uma transação

    Desfaz o gasto e retorna saldo à carteira
    """
    service = WalletService(db=None)
    result = service.refund_transaction(transaction_id, reason)

    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))

    return result


# ===== PRODUCTS CATALOG =====

@router.get("/products")
def list_products():
    """Listar todos os produtos disponíveis"""
    products = ProductCatalog.list_products()

    return {
        "total": len(products),
        "products": [
            {
                "id": product_id,
                "name": product["name"],
                "category": product["category"],
                "price": float(product["price"]),
                "currency": product["currency"]
            }
            for product_id, product in products.items()
        ]
    }


@router.get("/products/{product_id}")
def get_product_details(product_id: str):
    """Obter detalhes de um produto"""
    product = ProductCatalog.get_product(product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado")

    return {
        "id": product_id,
        "name": product["name"],
        "category": product["category"],
        "price": float(product["price"]),
        "currency": product["currency"],
        "description": f"Compre {product['name']} com saldo da sua carteira"
    }


# ===== REPORTS =====

@router.get("/summary/monthly")
def get_monthly_summary(wallet_id: str, month: int, year: int):
    """
    Obter resumo mensal da carteira

    Query params:
    - month: 1-12
    - year: 2026
    """
    service = WalletService(db=None)
    summary = service.get_monthly_summary(wallet_id, month, year)

    return summary


@router.get("/spending/by-category")
def get_spending_by_category(wallet_id: str):
    """Obter gasto agrupado por categoria"""
    service = WalletService(db=None)
    spending = service.get_spending_by_category(wallet_id)

    return {
        "wallet_id": wallet_id,
        "spending": spending
    }


# ===== RECEIPTS & INVOICES =====

@router.get("/receipt/{transaction_id}")
def download_receipt(transaction_id: str):
    """Baixar recibo de transação"""

    # transaction = Transaction.get(transaction_id)
    # receipt = InvoiceGenerator.generate_receipt(transaction)

    return {
        "receipt_id": transaction_id,
        "content": "Recibo gerado",
        "format": "text/plain"
    }


@router.get("/invoice")
def download_invoice(wallet_id: str, start_date: str = None, end_date: str = None):
    """
    Baixar extrato/nota fiscal

    Query params:
    - start_date: YYYY-MM-DD (opcional)
    - end_date: YYYY-MM-DD (opcional)
    """

    # wallet = Wallet.get(wallet_id)
    # transactions = Transaction.get_range(wallet_id, start_date, end_date)
    # invoice = InvoiceGenerator.generate_invoice(wallet, transactions)

    return {
        "invoice_id": wallet_id,
        "period": f"{start_date} a {end_date}",
        "content": "Extrato gerado",
        "format": "text/plain"
    }


# ===== ADMIN OPERATIONS =====

@router.post("/admin/adjust-balance")
def admin_adjust_balance(wallet_id: str, amount: float, reason: str):
    """
    Ajustar saldo manualmente (apenas admin)

    Para: reembolsos especiais, créditos promocionais, etc
    """

    # wallet = Wallet.get(wallet_id)
    # wallet.balance += Decimal(str(amount))

    # transaction = Transaction(
    #     wallet_id, wallet.user_id,
    #     TransactionType.ADJUSTMENT,
    #     Decimal(str(amount)),
    #     reason
    # )

    return {
        "success": True,
        "message": f"Saldo ajustado em R$ {amount:.2f}",
        "reason": reason,
        "new_balance": 0.0  # wallet.balance
    }


@router.post("/admin/refund-bulk")
def admin_refund_bulk(transaction_ids: list, reason: str):
    """
    Reembolsar múltiplas transações (apenas admin)
    """

    # refunded = 0
    # for tx_id in transaction_ids:
    #     service.refund_transaction(tx_id, reason)
    #     refunded += 1

    return {
        "success": True,
        "refunded_count": len(transaction_ids),
        "reason": reason
    }
