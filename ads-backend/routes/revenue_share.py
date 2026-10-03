"""Revenue Share API - Rastreamento de vendas e comissões"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

from revenue_share.revenue_tracker import get_revenue_tracker, SaleSource

router = APIRouter(prefix="/api/revenue-share", tags=["Revenue Share"])

# ═══════════════════════════════════════════════════════════
# MODELS
# ═══════════════════════════════════════════════════════════


class SaleTrackingRequest(BaseModel):
    """Request para rastrear venda"""
    campaign_id: str
    sale_amount: float
    profit_margin: float
    source: str = "pixel"
    order_id: Optional[str] = None
    customer_email: Optional[str] = None
    product_name: Optional[str] = None


class WithdrawRequest(BaseModel):
    """Request para sacar saldo"""
    amount: float
    bank_account: str
    bank_code: str


# ═══════════════════════════════════════════════════════════
# TRACKING
# ═══════════════════════════════════════════════════════════

@router.post("/track-sale")
async def track_sale(
    varejo_id: str,
    request: SaleTrackingRequest
):
    """Rastrear venda e calcular comissão"""
    tracker = get_revenue_tracker()

    try:
        sale = tracker.track_sale(
            varejo_id=varejo_id,
            campaign_id=request.campaign_id,
            sale_amount=request.sale_amount,
            profit_margin=request.profit_margin,
            source=SaleSource(request.source),
            metadata={
                "order_id": request.order_id,
                "customer_email": request.customer_email,
                "product_name": request.product_name
            }
        )

        return {
            "sale_tracked": True,
            "sale_id": sale["sale_id"],
            "sale_amount": sale["sale_amount"],
            "profit": sale["profit"],
            "commission": sale["commission"],
            "varejo_earnings": sale["varejo_earnings"],
            "message": f"Venda de R${sale['sale_amount']:.2f} rastreada! Você ganhou R${sale['varejo_earnings']:.2f} 🎉"
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ═══════════════════════════════════════════════════════════
# BALANCE
# ═══════════════════════════════════════════════════════════

@router.get("/balance/{varejo_id}")
async def get_balance(varejo_id: str):
    """Obter saldo do varejo"""
    tracker = get_revenue_tracker()

    # TODO: Buscar do banco de dados
    sales_records = []

    balance = tracker.get_varejo_balance(varejo_id, sales_records)

    return {
        "varejo_id": varejo_id,
        "balance": balance,
        "can_withdraw": balance["can_withdraw"],
        "can_spend_as_credit": balance["confirmed_balance"] >= 10
    }


@router.get("/stats/{varejo_id}")
async def get_stats(varejo_id: str):
    """Estatísticas de vendas e ganhos"""
    tracker = get_revenue_tracker()

    # TODO: Buscar do banco de dados
    sales_records = []

    stats = tracker.get_varejo_stats(varejo_id, sales_records)

    return {
        "varejo_id": varejo_id,
        "stats": stats,
        "period": "last_30_days",
        "currency": "BRL"
    }


@router.get("/projection/{varejo_id}")
async def get_projection(
    varejo_id: str,
    days: int = Query(30, ge=7, le=90)
):
    """Projetar ganhos futuros"""
    tracker = get_revenue_tracker()

    # TODO: Buscar do banco de dados
    sales_records = []

    projection = tracker.project_earnings(varejo_id, sales_records, days)

    return {
        "varejo_id": varejo_id,
        "projection": projection,
        "recommendation": "Aumente o orçamento de anúncios! Taxa de conversão está ótima 📈"
    }


@router.get("/history/{varejo_id}")
async def get_sale_history(
    varejo_id: str,
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Histórico de vendas rastreadas"""
    # TODO: Buscar do banco de dados
    sales_records = []

    filtered = [s for s in sales_records if s.get("varejo_id") == varejo_id]
    if status:
        filtered = [s for s in filtered if s.get("status") == status]

    paginated = filtered[offset:offset + limit]

    return {
        "varejo_id": varejo_id,
        "total": len(filtered),
        "limit": limit,
        "offset": offset,
        "sales": [
            {
                "sale_id": s["sale_id"],
                "timestamp": s["timestamp"],
                "amount": s["sale_amount"],
                "profit": s["profit"],
                "commission": s["commission"],
                "earnings": s["varejo_earnings"],
                "status": s["status"],
                "source": s["source"]
            }
            for s in paginated
        ]
    }


# ═══════════════════════════════════════════════════════════
# WITHDRAWALS
# ═══════════════════════════════════════════════════════════

@router.post("/withdraw")
async def request_withdrawal(
    varejo_id: str,
    request: WithdrawRequest
):
    """Solicitar saque de saldo"""
    # TODO: Implementar integração com banco
    # - Validar conta
    # - Processar saque
    # - Registrar transação

    return {
        "withdrawal_id": f"withdraw_{varejo_id}_{datetime.now().timestamp()}",
        "varejo_id": varejo_id,
        "amount": request.amount,
        "status": "processing",
        "estimated_arrival": "2-3 business days",
        "message": f"Saque de R${request.amount:.2f} solicitado! Chegará em 2-3 dias úteis 🏦"
    }


@router.get("/withdrawal-status/{withdrawal_id}")
async def get_withdrawal_status(withdrawal_id: str):
    """Status do saque"""
    # TODO: Buscar do banco de dados
    return {
        "withdrawal_id": withdrawal_id,
        "status": "processing",
        "amount": 0,
        "created_at": datetime.now().isoformat(),
        "estimated_arrival": "2026-10-05T12:00:00Z"
    }


# ═══════════════════════════════════════════════════════════
# CREDIT SYSTEM
# ═══════════════════════════════════════════════════════════

@router.post("/use-as-credit")
async def use_balance_as_credit(
    varejo_id: str,
    amount: float
):
    """Usar saldo como crédito para anúncios"""
    # TODO: Converter saldo em crédito de ads
    # - Descontar do saldo
    # - Adicionar ao crédito de ads
    # - Registrar transação

    return {
        "varejo_id": varejo_id,
        "action": "converted_to_credit",
        "amount": amount,
        "new_ad_credit": amount,
        "message": f"R${amount:.2f} convertidos em crédito de anúncios! 🚀"
    }


# ═══════════════════════════════════════════════════════════
# COMMISSION BREAKDOWN
# ═══════════════════════════════════════════════════════════

@router.get("/commission-breakdown")
async def get_commission_breakdown(profit: float = Query(100.0)):
    """Ver breakdown de comissão"""
    tracker = get_revenue_tracker()
    breakdown = tracker.calculate_commission(profit)

    return {
        "profit": profit,
        "breakdown": breakdown,
        "example": f"Se você vender R${profit:.2f} de lucro, você recebe R${breakdown['varejo_receives']:.2f} e ADS fica com R${breakdown['commission_amount']:.2f}"
    }


# ═══════════════════════════════════════════════════════════
# WEBHOOKS (Para rastreamento automático)
# ═══════════════════════════════════════════════════════════

@router.post("/webhooks/shopify")
async def shopify_webhook(payload: dict):
    """Webhook de vendas Shopify"""
    # TODO: Processar webhook Shopify
    # - Extrair informações de venda
    # - Rastrear via tracker
    # - Calcular comissão

    return {"status": "received", "processed": True}


@router.post("/webhooks/woocommerce")
async def woocommerce_webhook(payload: dict):
    """Webhook de vendas WooCommerce"""
    # TODO: Processar webhook WooCommerce

    return {"status": "received", "processed": True}


@router.post("/webhooks/stripe")
async def stripe_webhook(payload: dict):
    """Webhook de vendas Stripe"""
    # TODO: Processar webhook Stripe

    return {"status": "received", "processed": True}


@router.post("/webhooks/pixel")
async def pixel_webhook(
    varejo_id: str,
    campaign_id: str,
    event_id: str,
    payload: dict
):
    """Webhook de conversão via pixel"""
    tracker = get_revenue_tracker()

    try:
        # Extrair dados do payload
        sale_amount = payload.get("value", 0)
        profit_margin = payload.get("margin", 0.3)

        sale = tracker.track_sale(
            varejo_id=varejo_id,
            campaign_id=campaign_id,
            sale_amount=sale_amount,
            profit_margin=profit_margin,
            source="pixel",
            metadata=payload
        )

        return {
            "status": "tracked",
            "sale_id": sale["sale_id"],
            "commission": sale["commission"]
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


# ═══════════════════════════════════════════════════════════
# DASHBOARD SUMMARY
# ═══════════════════════════════════════════════════════════

@router.get("/dashboard/{varejo_id}")
async def get_dashboard(varejo_id: str):
    """Dashboard resumido para varejo"""
    tracker = get_revenue_tracker()

    # TODO: Buscar do banco de dados
    sales_records = []

    balance = tracker.get_varejo_balance(varejo_id, sales_records)
    stats = tracker.get_varejo_stats(varejo_id, sales_records)
    projection = tracker.project_earnings(varejo_id, sales_records, 30)

    return {
        "varejo_id": varejo_id,
        "updated_at": datetime.now().isoformat(),
        "summary": {
            "balance": {
                "confirmed": balance["confirmed_balance"],
                "pending": balance["pending_balance"],
                "total": balance["total_available"]
            },
            "stats": {
                "total_sales": stats["total_sales"],
                "total_revenue": stats["total_revenue"],
                "total_earned": stats["total_earned"],
                "avg_sale": stats["average_sale"]
            },
            "projection": {
                "next_30_days_earnings": projection["projected_total_earnings"],
                "trend": "📈 Crescendo!" if projection["projected_total_earnings"] > stats["total_earned"] else "📉 Decaindo"
            }
        },
        "actions": [
            {"action": "Sacar saldo", "button": "WITHDRAW", "min_amount": 50},
            {"action": "Usar como crédito", "button": "USE_CREDIT", "min_amount": 10},
            {"action": "Ver histórico", "button": "HISTORY"},
            {"action": "Aumentar orçamento", "button": "BUDGET_UP"}
        ]
    }
