"""
Endpoints FastAPI — Portal de Pagamento
Tier 2.2 — PIX, Boleto, Cartão de Crédito
"""

from fastapi import APIRouter, HTTPException, Request, Form
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
import logging

from backend.payment_gateway import payment_gateway, TipoPagamento, StatusPagamento

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tier2/pagamento", tags=["pagamento-online"])

# ========== MODELOS PYDANTIC ==========

class PagamentoPixRequest(BaseModel):
    inquilino_id: int
    imovel_id: int
    valor: float
    mes_referencia: str
    chave_pix: Optional[str] = None

class PagamentoBoletoRequest(BaseModel):
    inquilino_id: int
    imovel_id: int
    valor: float
    mes_referencia: str
    vencimento_dias: int = 5

class PagamentoCartaoRequest(BaseModel):
    inquilino_id: int
    imovel_id: int
    valor: float
    numero_cartao: str
    mes_vencimento: str
    ano_vencimento: str
    cvv: str
    nome_titular: str
    email: EmailStr
    mes_referencia: str

# ==============================================================================
# PIX
# ==============================================================================

@router.post("/pix/gerar")
async def gerar_pix(request: PagamentoPixRequest):
    """
    Gera QR Code PIX para pagamento de aluguel.

    Returns:
        {
            'sucesso': bool,
            'pix_copy_paste': 'string_grande',
            'qrcode_url': 'url_para_imagem',
            'valor': float,
            'chave_pix': 'xxx@xxx.com'
        }
    """
    try:
        if request.valor <= 0:
            raise HTTPException(status_code=400, detail="Valor deve ser maior que zero")

        resultado = payment_gateway.gerar_qrcode_pix(
            valor=request.valor,
            inquilino_id=request.inquilino_id,
            imovel_id=request.imovel_id,
            mes_referencia=request.mes_referencia,
            chave_pix=request.chave_pix
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro gerar PIX: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/pix/verificar/{ref_id}")
async def verificar_pix(ref_id: str):
    """
    Verifica se PIX foi recebido.

    Args:
        ref_id: ID de referência do PIX

    Returns:
        {'sucesso': bool, 'status': 'pendente|confirmado', 'valor': float}
    """
    try:
        resultado = payment_gateway.verificar_pagamento_pix(ref_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pix/webhook")
async def webhook_pix(request: Request):
    """
    Recebe notificação de PIX confirmado do banco.

    Chamado pelo banco (Itaú, Bradesco, Santander) via webhook.
    """
    try:
        payload = await request.json()
        resultado = payment_gateway.processar_webhook_pix(payload)
        return resultado
    except Exception as e:
        logger.error(f"Erro webhook PIX: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# BOLETO
# ==============================================================================

@router.post("/boleto/gerar")
async def gerar_boleto(request: PagamentoBoletoRequest):
    """
    Gera boleto bancário para pagamento.

    Returns:
        {
            'sucesso': bool,
            'numero_boleto': 'string',
            'pdf_url': 'url_para_pdf',
            'vencimento': 'data',
            'valor': float
        }
    """
    try:
        if request.valor <= 0:
            raise HTTPException(status_code=400, detail="Valor deve ser maior que zero")

        resultado = payment_gateway.gerar_boleto(
            valor=request.valor,
            inquilino_id=request.inquilino_id,
            imovel_id=request.imovel_id,
            mes_referencia=request.mes_referencia,
            vencimento_dias=request.vencimento_dias
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro gerar boleto: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/boleto/webhook")
async def webhook_boleto(request: Request):
    """Recebe notificação de boleto pago do banco."""
    try:
        payload = await request.json()
        resultado = payment_gateway.processar_webhook_boleto(payload)
        return resultado
    except Exception as e:
        logger.error(f"Erro webhook boleto: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# CARTÃO DE CRÉDITO
# ==============================================================================

@router.post("/cartao/processar")
async def processar_cartao(request: PagamentoCartaoRequest):
    """
    Processa pagamento com cartão de crédito.

    ⚠️ NÃO armazena dados de cartão (PCI-DSS compliance)
    Usar Stripe Tokens em produção.

    Returns:
        {
            'sucesso': bool,
            'transacao_id': 'txn_xxx',
            'status': 'confirmado|falhado',
            'comprovante': {...}
        }
    """
    try:
        if request.valor <= 0:
            raise HTTPException(status_code=400, detail="Valor deve ser maior que zero")

        resultado = payment_gateway.processar_pagamento_cartao(
            valor=request.valor,
            numero_cartao=request.numero_cartao.replace(" ", ""),
            mes_vencimento=request.mes_vencimento,
            ano_vencimento=request.ano_vencimento,
            cvv=request.cvv,
            nome_titular=request.nome_titular,
            email=request.email,
            inquilino_id=request.inquilino_id
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        # Registrar pagamento
        payment_gateway.registrar_pagamento(
            inquilino_id=request.inquilino_id,
            imovel_id=request.imovel_id,
            valor=request.valor,
            tipo_pagamento='cartao',
            mes_referencia=request.mes_referencia,
            transacao_id=resultado.get('transacao_id'),
            comprovante=resultado.get('comprovante')
        )

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro processar cartão: {e}")
        raise HTTPException(status_code=500, detail="Falha ao processar pagamento")

# ==============================================================================
# GESTÃO DE PAGAMENTOS
# ==============================================================================

@router.get("/listar")
async def listar_pagamentos(
    inquilino_id: Optional[int] = None,
    imovel_id: Optional[int] = None,
    mes: Optional[str] = None
):
    """
    Lista pagamentos com filtros opcionais.

    Returns:
        [
            {
                'pagamento_id': 1,
                'inquilino_id': 10,
                'imovel_id': 5,
                'valor': 2500.00,
                'tipo': 'pix',
                'mes': '2026-10',
                'data_pagamento': '2026-10-02',
                'status': 'confirmado'
            }
        ]
    """
    try:
        pagamentos = payment_gateway.listar_pagamentos(
            inquilino_id=inquilino_id,
            imovel_id=imovel_id,
            mes=mes
        )

        return {
            'sucesso': True,
            'total': len(pagamentos),
            'pagamentos': pagamentos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/comprovante/{pagamento_id}")
async def baixar_comprovante(pagamento_id: int):
    """
    Gera e retorna comprovante de pagamento em PDF.

    Returns:
        FileResponse com PDF do comprovante
    """
    try:
        resultado = payment_gateway.gerar_comprovante_pdf(pagamento_id)

        if not resultado['sucesso']:
            raise HTTPException(status_code=404, detail="Comprovante não encontrado")

        return {
            'sucesso': True,
            'pdf_url': resultado['pdf_url']
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# EXTRATO
# ==============================================================================

@router.get("/extrato/inquilino/{inquilino_id}")
async def extrato_inquilino(inquilino_id: int):
    """
    Retorna extrato de pagamentos do inquilino.

    Mostra:
    - Últimos pagamentos
    - Pagamentos pendentes
    - Saldo devedor
    - Histórico 12 meses
    """
    try:
        pagamentos = payment_gateway.listar_pagamentos(
            inquilino_id=inquilino_id
        )

        # Calcular resumo
        total_pago = sum(p['valor'] for p in pagamentos if p['status'] == 'confirmado')
        total_pendente = sum(p['valor'] for p in pagamentos if p['status'] == 'pendente')

        return {
            'sucesso': True,
            'inquilino_id': inquilino_id,
            'resumo': {
                'total_pago': total_pago,
                'total_pendente': total_pendente,
                'saldo_devedor': total_pendente
            },
            'ultimos_pagamentos': pagamentos[:10],
            'historico_completo': pagamentos
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/extrato/proprietario/{proprietario_id}")
async def extrato_proprietario(proprietario_id: int):
    """
    Retorna extrato de repassos para proprietário.

    Mostra:
    - Aluguéis recebidos
    - Repassos realizados
    - Comissões descontadas
    - Saldo a receber
    """
    try:
        # TODO: Buscar dados reais do banco
        return {
            'sucesso': True,
            'proprietario_id': proprietario_id,
            'resumo': {
                'alugueis_recebidos': 0,
                'repassos_realizados': 0,
                'comissoes': 0,
                'saldo_a_receber': 0
            },
            'imoveis': []
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# CONFIGURAÇÃO
# ==============================================================================

@router.get("/config")
async def configuracao_pagamento():
    """
    Retorna configurações de pagamento disponíveis.

    Returns:
        {
            'pix': {'disponivel': bool, 'taxa': 0},
            'boleto': {'disponivel': bool, 'taxa': 2.49},
            'cartao': {'disponivel': bool, 'taxa': 2.99}
        }
    """
    try:
        return {
            'sucesso': True,
            'metodos': {
                'pix': {
                    'disponivel': bool(payment_gateway.pix_key),
                    'taxa': 0,
                    'descricao': 'Instantâneo, sem taxa'
                },
                'boleto': {
                    'disponivel': True,
                    'taxa': 2.49,
                    'descricao': 'Vence em 5 dias úteis'
                },
                'cartao': {
                    'disponivel': bool(payment_gateway.stripe_api_key),
                    'taxa': 2.99,
                    'descricao': 'Crédito em 1-2 dias'
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
