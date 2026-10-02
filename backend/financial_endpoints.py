"""
Endpoints FastAPI — Financeiro Aprimorado
Cash Flow, ROI, Forecasting, Conciliação
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
import logging

from backend.financial_advanced import financeiro_adv

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tier2/financeiro", tags=["financeiro-aprimorado"])

# ========== MODELOS PYDANTIC ==========

class ConciliacaoBancoRequest(BaseModel):
    escritorio_id: int
    extrato_banco: List[Dict[str, Any]]

# ==============================================================================
# CASH FLOW
# ==============================================================================

@router.get("/cash-flow/{escritorio_id}")
async def get_cash_flow(
    escritorio_id: int,
    mes: int = Query(default=None, ge=1, le=12),
    ano: int = Query(default=None, ge=2020),
    incluir_previsao: bool = Query(default=False)
):
    """
    Retorna fluxo de caixa de um mês específico.

    Args:
        escritorio_id: ID do escritório
        mes: Mês (1-12), usa mês atual se não informado
        ano: Ano, usa ano atual se não informado
        incluir_previsao: Incluir previsão do mês seguinte

    Returns:
        {
            'receitas': {'alugueis': 45000, 'outras': 2000, 'total': 47000},
            'despesas': {'repassos': 38000, 'comissoes': 2250, ...},
            'saldo_liquido': 5000,
            'margem': 10.6
        }
    """
    try:
        from datetime import datetime

        if mes is None:
            mes = datetime.now().month
        if ano is None:
            ano = datetime.now().year

        resultado = financeiro_adv.calcular_cash_flow(
            escritorio_id,
            mes,
            ano,
            incluir_previsao
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro cash flow: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/cash-flow-12-meses/{escritorio_id}")
async def get_cash_flow_12_meses(
    escritorio_id: int,
    ano: int = Query(default=None, ge=2020)
):
    """
    Retorna fluxo de caixa dos últimos 12 meses.

    Returns:
        {
            'meses': [
                {'mes': '2026-01', 'receita': 45000, 'despesa': 43000, 'saldo': 2000},
                ...
            ],
            'totais': {'receita_total': 540000, ...},
            'media_mensal': 2000,
            'tendencia': 'crescente'
        }
    """
    try:
        from datetime import datetime

        if ano is None:
            ano = datetime.now().year

        resultado = financeiro_adv.fluxo_caixa_12_meses(escritorio_id, ano)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# ROI POR PROPRIEDADE
# ==============================================================================

@router.get("/roi/imovel/{imovel_id}")
async def get_roi_imovel(
    imovel_id: int,
    meses: int = Query(default=12, ge=1, le=60)
):
    """
    Calcula ROI de um imóvel específico.

    Returns:
        {
            'imovel_id': 123,
            'alugueis_recebidos': 30000,
            'lucro_liquido': 26500,
            'roi_percentual': 88.3,
            'roi_mensal': 2210,
            'tempo_retorno_meses': 3.2
        }
    """
    try:
        resultado = financeiro_adv.calcular_roi_imovel(imovel_id, meses)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/roi/ranking/{escritorio_id}")
async def get_ranking_roi(
    escritorio_id: int,
    meses: int = Query(default=12, ge=1, le=60)
):
    """
    Ranking de imóveis por ROI (mais rentáveis primeiro).

    Returns:
        {
            'total_imoveis': 5,
            'imoveis': [
                {'imovel_id': 1, 'endereco': '...', 'roi': 88.3, 'lucro': 26500},
                {'imovel_id': 2, 'endereco': '...', 'roi': 75.2, 'lucro': 22560},
                ...
            ],
            'media_roi': 76.5,
            'roi_maxima': 88.3,
            'roi_minima': 45.1
        }
    """
    try:
        resultado = financeiro_adv.ranking_imoveis_por_roi(escritorio_id, meses)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# FORECASTING
# ==============================================================================

@router.get("/previsoes/{escritorio_id}")
async def get_previsoes(
    escritorio_id: int,
    meses_futuros: int = Query(default=3, ge=1, le=12)
):
    """
    Prevê receita para os próximos meses.

    Returns:
        {
            'previsoes': [
                {'mes': '2026-11', 'receita_prevista': 47000, 'confianca': 0.92},
                {'mes': '2026-12', 'receita_prevista': 48500, 'confianca': 0.88},
                ...
            ],
            'tendencia': 'crescente|estavel|decrescente',
            'crescimento_medio': 2.5
        }
    """
    try:
        resultado = financeiro_adv.prever_receita(escritorio_id, meses_futuros)

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# CONCILIAÇÃO BANCÁRIA
# ==============================================================================

@router.post("/conciliar")
async def conciliar_banco(request: ConciliacaoBancoRequest):
    """
    Concilia transações do banco com registros do on.imob.

    Args:
        escritorio_id: ID do escritório
        extrato_banco: [
            {'data': '2026-10-01', 'valor': 2500, 'descricao': 'PIX Inquilino X'},
            ...
        ]

    Returns:
        {
            'total_banco': 7500,
            'total_on_imob': 7200,
            'diferenca': 300,
            'status': 'conciliado|diferenca_detectada',
            'transacoes_faltando': [...]
        }
    """
    try:
        resultado = financeiro_adv.conciliar_com_banco(
            request.escritorio_id,
            request.extrato_banco
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# ALERTAS FINANCEIROS
# ==============================================================================

@router.get("/alertas/{escritorio_id}")
async def get_alertas(escritorio_id: int):
    """
    Retorna alertas de problemas financeiros.

    Returns:
        [
            {
                'tipo': 'inadimplencia',
                'severidade': 'alta',
                'mensagem': 'Inquilino X atrasado 20 dias',
                'valor': 2500.00,
                'acao': 'Cobrar via WhatsApp'
            },
            {
                'tipo': 'margem_baixa',
                'severidade': 'media',
                'mensagem': 'Margem caiu para 12%',
                'acao': 'Revisar despesas'
            }
        ]
    """
    try:
        alertas = financeiro_adv.gerar_alertas_financeiros(escritorio_id)

        return {
            'sucesso': True,
            'escritorio_id': escritorio_id,
            'total_alertas': len(alertas),
            'alertas': alertas
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# DASHBOARD EXECUTIVO
# ==============================================================================

@router.get("/dashboard/{escritorio_id}")
async def get_dashboard_executivo(
    escritorio_id: int,
    mes: int = Query(default=None, ge=1, le=12),
    ano: int = Query(default=None, ge=2020)
):
    """
    Dashboard executivo com todos os KPIs.

    Inclui:
    - Faturamento e despesas
    - Margem de lucro
    - ROI médio dos imóveis
    - Alertas financeiros
    - Previsões de receita
    - Ranking de imóveis

    Returns:
        {
            'kpis': {
                'faturamento': 45000,
                'despesas': 42000,
                'margem': 6.7,
                'roi_medio': 76.5,
                'total_imoveis': 5
            },
            'alertas': [...],
            'previsoes': [...],
            'ranking_imoveis': [...]
        }
    """
    try:
        resultado = financeiro_adv.gerar_dashboard_executivo(
            escritorio_id,
            mes,
            ano
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=500, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# RELATÓRIO EXECUTIVO
# ==============================================================================

@router.get("/relatorio/{escritorio_id}")
async def get_relatorio_executivo(
    escritorio_id: int,
    formato: str = Query(default="json", regex="^(json|pdf)$")
):
    """
    Gera relatório executivo completo.

    Pode retornar em JSON ou PDF.

    Inclui:
    - Cash flow 12 meses
    - ROI por imóvel
    - Previsões
    - Análise de tendências
    - Recomendações
    """
    try:
        # Gerar dashboard com todos dados
        dashboard = financeiro_adv.gerar_dashboard_executivo(escritorio_id)

        if not dashboard['sucesso']:
            raise HTTPException(status_code=500, detail=dashboard.get('erro'))

        if formato == "pdf":
            # TODO: Gerar PDF com ReportLab
            return {
                'sucesso': True,
                'formato': 'pdf',
                'url': f'https://on.imob.com.br/relatorios/{escritorio_id}_financeiro.pdf'
            }
        else:
            return dashboard

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
