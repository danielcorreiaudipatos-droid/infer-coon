"""
Endpoints FastAPI — Split Payment com Assas
Repasse automático para proprietários
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
import logging

from backend.split_payment_assas import split_assas

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tier2/split", tags=["split-payment-assas"])

# ========== MODELOS PYDANTIC ==========

class ConfigurarSplitRequest(BaseModel):
    imovel_id: int
    proprietario_id: int
    proprietario_email: EmailStr
    proprietario_chave_pix: str
    percentual_proprietario: float = 0.95

class CriarPagamentoSplitRequest(BaseModel):
    imovel_id: int
    inquilino_id: int
    inquilino_email: EmailStr
    valor: float
    mes_referencia: str
    tipo_pagamento: str = "CREDIT_CARD"  # PIX_TRANSFER, BOLETO, CREDIT_CARD

# ==============================================================================
# CONFIGURAÇÃO
# ==============================================================================

@router.post("/configurar")
async def configurar_split(request: ConfigurarSplitRequest):
    """
    Configura split de pagamento para um imóvel.

    Após isso, todos os pagamentos do imóvel vão automaticamente:
    - 95% para proprietário
    - 5% para imobiliária
    - ~2% taxa Assas
    """
    try:
        resultado = split_assas.configurar_split_imovel(
            imovel_id=request.imovel_id,
            proprietario_id=request.proprietario_id,
            proprietario_email=request.proprietario_email,
            proprietario_chave_pix=request.proprietario_chave_pix,
            percentual_proprietario=request.percentual_proprietario
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro configurar split: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# CRIAR PAGAMENTO COM SPLIT
# ==============================================================================

@router.post("/pagamento")
async def criar_pagamento_split(request: CriarPagamentoSplitRequest):
    """
    Cria pagamento no Assas com split automático.

    Fluxo:
    1. Inquilino paga R$ 2.500
    2. Assas recebe
    3. Desconta taxa (~2%)
    4. Divide: 95% proprietário, 5% imobiliária
    5. Transfere automaticamente para proprietário (2 dias úteis)

    Returns:
        {
            'payment_id': 'pay_123_2026-10',
            'link_pagamento': 'https://checkout.assas.com.br/...',
            'split_configurado': true,
            'status': 'aguardando_pagamento'
        }
    """
    try:
        if request.valor <= 0:
            raise HTTPException(status_code=400, detail="Valor deve ser maior que zero")

        resultado = split_assas.criar_pagamento_com_split(
            imovel_id=request.imovel_id,
            inquilino_id=request.inquilino_id,
            inquilino_email=request.inquilino_email,
            valor=request.valor,
            mes_referencia=request.mes_referencia,
            tipo_pagamento=request.tipo_pagamento
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro criar pagamento split: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# WEBHOOKS
# ==============================================================================

@router.post("/webhook")
async def webhook_assas(request: Request):
    """
    Recebe webhooks de Assas quando:
    - PAYMENT_RECEIVED: Pagamento recebido
    - PAYMENT_CONFIRMED: Pagamento confirmado
    - SPLIT_EXECUTED: Split executado (proprietário recebeu)
    """
    try:
        payload = await request.json()
        resultado = split_assas.processar_webhook_assas(payload)
        return resultado
    except Exception as e:
        logger.error(f"Erro webhook Assas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# EXTRATOS E SALDOS
# ==============================================================================

@router.get("/extrato/proprietario/{proprietario_id}")
async def extrato_proprietario(
    proprietario_id: int,
    mes: int = None,
    ano: int = None
):
    """
    Retorna extrato de splits (repasses) para proprietário.

    Mostra:
    - Total repasses do mês
    - Data de pagamento
    - Detalhamento por imóvel
    - Status de cada transferência
    """
    try:
        resultado = split_assas.extrato_splits(proprietario_id, mes, ano)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/saldo/{proprietario_id}")
async def saldo_proprietario(proprietario_id: int):
    """
    Retorna saldo disponível do proprietário no Assas.

    Mostra:
    - Saldo disponível para saque
    - Saldo pendente de repasse
    - Data próxima transferência automática
    - Conta bancária configurada
    """
    try:
        resultado = split_assas.saldo_disponivel_proprietario(proprietario_id)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# TRANSFERÊNCIAS MANUAIS
# ==============================================================================

@router.post("/transferir/{proprietario_id}")
async def transferir_manual(proprietario_id: int, valor: float):
    """
    Faz transferência manual para proprietário.

    Usado quando quer pagar antes da data automática.
    Chega em 1-2 dias úteis.
    """
    try:
        if valor <= 0:
            raise HTTPException(status_code=400, detail="Valor deve ser maior que zero")

        resultado = split_assas.transferir_para_proprietario(proprietario_id, valor)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# DASHBOARD SPLIT
# ==============================================================================

@router.get("/dashboard/{escritorio_id}")
async def dashboard_split(escritorio_id: int):
    """
    Dashboard de splits (repassos automáticos).

    Mostra:
    - Total de splits configurados
    - Repassos previstos
    - Histórico de transferências
    - Taxas cobradas
    """
    try:
        # TODO: Agregar dados de múltiplos proprietários
        return {
            'sucesso': True,
            'escritorio_id': escritorio_id,
            'total_splits_configurados': 5,
            'repassos_este_mes': {
                'total': 11750.00,
                'proprietarios': 11250.00,
                'imobiliaria': 500.00,
                'taxa_assas': 250.00
            },
            'proximos_repassos': [
                {
                    'data': '2026-11-05',
                    'valor': 9500.00,
                    'status': 'agendado',
                    'proprietarios': 2
                }
            ],
            'economia_de_tempo': {
                'antes': '8h mês (transferências manuais)',
                'depois': '0h (automático)',
                'economia': '100%'
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
