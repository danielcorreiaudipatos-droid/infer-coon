"""
Financeiro Aprimorado — Tier 2.3
Cash Flow, ROI, Forecasting, Conciliação Bancária
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from enum import Enum
import statistics

logger = logging.getLogger(__name__)

class TipoTransacao(str, Enum):
    ALUGUEL_RECEBIDO = "aluguel_recebido"
    REPASSE_PROPRIETARIO = "repasse_proprietario"
    COMISSAO = "comissao"
    DESPESA = "despesa"
    MANUTENCAO = "manutencao"
    TAXA_ADMINISTRACAO = "taxa_administracao"

class FinanceiroAvancado:
    """Análise financeira avançada com cash flow, ROI e forecasting."""

    def __init__(self):
        """Inicializar módulo financeiro."""
        self.taxa_comissao = 0.05  # 5% padrão
        self.taxa_administracao = 0.02  # 2% padrão

    # ========== CASH FLOW ==========

    def calcular_cash_flow(
        self,
        escritorio_id: int,
        mes: int,
        ano: int,
        incluir_previsao: bool = False
    ) -> Dict[str, Any]:
        """
        Calcula fluxo de caixa para um mês.

        Args:
            escritorio_id: ID do escritório/imobiliária
            mes: Mês (1-12)
            ano: Ano (ex: 2026)
            incluir_previsao: Incluir previsão do mês seguinte

        Returns:
            {
                'receitas': {
                    'alugueis': float,
                    'outras': float,
                    'total': float
                },
                'despesas': {
                    'repassos': float,
                    'comissoes': float,
                    'manutencao': float,
                    'total': float
                },
                'saldo': float,
                'fluxo_diario': [...]
            }
        """
        try:
            # TODO: Buscar dados reais do banco
            # SELECT * FROM transacoes WHERE escritorio_id = ? AND mes = ? AND ano = ?

            receitas = {
                'alugueis': 0,
                'outras': 0,
                'total': 0
            }

            despesas = {
                'repassos': 0,
                'comissoes': 0,
                'manutencao': 0,
                'taxa_administracao': 0,
                'total': 0
            }

            # Dados simulados para teste
            receitas['alugueis'] = 45000.00
            receitas['outras'] = 2000.00
            receitas['total'] = receitas['alugueis'] + receitas['outras']

            despesas['repassos'] = 38000.00
            despesas['comissoes'] = 2250.00
            despesas['manutencao'] = 1500.00
            despesas['taxa_administracao'] = 1200.00
            despesas['total'] = sum(v for k, v in despesas.items() if k != 'total')

            saldo = receitas['total'] - despesas['total']

            logger.info(f"Cash flow calculado: {mes}/{ano}, Saldo: R$ {saldo}")

            return {
                'sucesso': True,
                'periodo': f"{mes}/{ano}",
                'receitas': receitas,
                'despesas': despesas,
                'saldo_bruto': receitas['total'],
                'saldo_liquido': saldo,
                'margem': (saldo / receitas['total'] * 100) if receitas['total'] > 0 else 0
            }

        except Exception as e:
            logger.error(f"Erro calcular cash flow: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def fluxo_caixa_12_meses(
        self,
        escritorio_id: int,
        ano: int
    ) -> Dict[str, Any]:
        """
        Retorna fluxo de caixa dos últimos 12 meses.

        Returns:
            {
                'meses': [
                    {'mes': '2026-01', 'receita': 45000, 'despesa': 43000, 'saldo': 2000},
                    ...
                ],
                'totais': {'receita_total': 540000, 'despesa_total': 516000, 'saldo_total': 24000},
                'media_mensal': 2000,
                'tendencia': 'crescente|estavel|decrescente'
            }
        """
        try:
            meses = []

            for mes in range(1, 13):
                cf = self.calcular_cash_flow(escritorio_id, mes, ano)
                if cf['sucesso']:
                    meses.append({
                        'mes': f"{ano}-{mes:02d}",
                        'receita': cf['receitas']['total'],
                        'despesa': cf['despesas']['total'],
                        'saldo': cf['saldo_liquido']
                    })

            if not meses:
                return {
                    'sucesso': False,
                    'erro': 'Sem dados'
                }

            # Calcular totais
            receita_total = sum(m['receita'] for m in meses)
            despesa_total = sum(m['despesa'] for m in meses)
            saldo_total = sum(m['saldo'] for m in meses)

            # Tendência
            saldos = [m['saldo'] for m in meses]
            if len(saldos) >= 3:
                ultimos_3 = saldos[-3:]
                primeiro_terco = saldos[:4]
                tendencia = 'crescente' if statistics.mean(ultimos_3) > statistics.mean(primeiro_terco) else 'decrescente'
            else:
                tendencia = 'estavel'

            return {
                'sucesso': True,
                'ano': ano,
                'meses': meses,
                'totais': {
                    'receita_total': receita_total,
                    'despesa_total': despesa_total,
                    'saldo_total': saldo_total
                },
                'media_mensal': saldo_total / 12,
                'tendencia': tendencia
            }

        except Exception as e:
            logger.error(f"Erro fluxo 12 meses: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== ROI POR PROPRIEDADE ==========

    def calcular_roi_imovel(
        self,
        imovel_id: int,
        meses: int = 12
    ) -> Dict[str, Any]:
        """
        Calcula ROI de um imóvel específico.

        Args:
            imovel_id: ID do imóvel
            meses: Período de análise em meses

        Returns:
            {
                'imovel_id': 123,
                'alugueis_recebidos': 30000,
                'comissoes': 1500,
                'despesas': 2000,
                'lucro_liquido': 26500,
                'roi': 88.3,
                'roi_mensal': 2210,
                'tempo_retorno': 3.2  # meses
            }
        """
        try:
            # TODO: Buscar dados reais
            alugueis = 2500 * meses  # 2.5K × meses
            comissoes = alugueis * self.taxa_comissao
            despesas = 200 * meses  # despesas médias

            lucro_liquido = alugueis - comissoes - despesas
            roi = (lucro_liquido / (2500 * meses)) * 100 if alugueis > 0 else 0

            logger.info(f"ROI calculado para imóvel {imovel_id}: {roi:.1f}%")

            return {
                'sucesso': True,
                'imovel_id': imovel_id,
                'periodo_meses': meses,
                'alugueis_recebidos': alugueis,
                'comissoes': comissoes,
                'despesas': despesas,
                'lucro_liquido': lucro_liquido,
                'roi_percentual': round(roi, 2),
                'roi_mensal': round(lucro_liquido / meses, 2),
                'tempo_retorno_meses': round(meses / (roi / 100) if roi > 0 else 0, 1)
            }

        except Exception as e:
            logger.error(f"Erro calcular ROI: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def ranking_imoveis_por_roi(
        self,
        escritorio_id: int,
        meses: int = 12
    ) -> Dict[str, Any]:
        """
        Ranking de imóveis por ROI (mais rentáveis primeiro).

        Returns:
            {
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
            # TODO: Buscar todos imóveis do escritório
            imoveis_ranking = []

            for imovel_id in range(1, 6):  # Simulado: 5 imóveis
                roi_data = self.calcular_roi_imovel(imovel_id, meses)
                if roi_data['sucesso']:
                    imoveis_ranking.append({
                        'imovel_id': imovel_id,
                        'endereco': f"Rua X, {imovel_id}00",
                        'roi': roi_data['roi_percentual'],
                        'lucro': roi_data['lucro_liquido'],
                        'lucro_mensal': roi_data['roi_mensal']
                    })

            # Ordenar por ROI (maior primeiro)
            imoveis_ranking.sort(key=lambda x: x['roi'], reverse=True)

            rois = [i['roi'] for i in imoveis_ranking]

            return {
                'sucesso': True,
                'escritorio_id': escritorio_id,
                'total_imoveis': len(imoveis_ranking),
                'imoveis': imoveis_ranking,
                'media_roi': round(statistics.mean(rois), 2) if rois else 0,
                'roi_maxima': round(max(rois), 2) if rois else 0,
                'roi_minima': round(min(rois), 2) if rois else 0
            }

        except Exception as e:
            logger.error(f"Erro ranking ROI: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== FORECASTING ==========

    def prever_receita(
        self,
        escritorio_id: int,
        meses_futuros: int = 3
    ) -> Dict[str, Any]:
        """
        Prevê receita para os próximos meses usando tendência histórica.

        Args:
            escritorio_id: ID do escritório
            meses_futuros: Quantos meses prever (1-12)

        Returns:
            {
                'previsoes': [
                    {'mes': '2026-11', 'receita_prevista': 47000, 'confianca': 0.92},
                    {'mes': '2026-12', 'receita_prevista': 48500, 'confianca': 0.88},
                    ...
                ],
                'tendencia': 'crescente|estavel|decrescente',
                'crescimento_medio': 2.5  # % ao mês
            }
        """
        try:
            # Buscar dados históricos dos últimos 12 meses
            historico = self.fluxo_caixa_12_meses(
                escritorio_id,
                datetime.now().year
            )

            if not historico['sucesso']:
                return {
                    'sucesso': False,
                    'erro': 'Sem histórico suficiente'
                }

            # Extrair receitas do histórico
            receitas_historicas = [m['receita'] for m in historico['meses']]

            # Calcular tendência com regressão linear simples
            n = len(receitas_historicas)
            x = list(range(n))
            y = receitas_historicas

            x_mean = statistics.mean(x)
            y_mean = statistics.mean(y)

            numerador = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
            denominador = sum((x[i] - x_mean) ** 2 for i in range(n))

            if denominador == 0:
                inclinacao = 0
            else:
                inclinacao = numerador / denominador

            intersecao = y_mean - inclinacao * x_mean

            # Gerar previsões
            previsoes = []
            mes_atual = datetime.now().month
            ano_atual = datetime.now().year

            for i in range(1, meses_futuros + 1):
                mes_futuro = mes_atual + i
                ano_futuro = ano_atual

                if mes_futuro > 12:
                    mes_futuro -= 12
                    ano_futuro += 1

                x_futuro = n + i - 1
                receita_prevista = intersecao + inclinacao * x_futuro
                confianca = max(0.5, 1 - (i * 0.08))  # Confiança diminui com distância

                previsoes.append({
                    'mes': f"{ano_futuro}-{mes_futuro:02d}",
                    'receita_prevista': max(0, round(receita_prevista, 2)),
                    'confianca': round(confianca, 2)
                })

            # Determinar tendência
            if inclinacao > 500:
                tendencia = 'crescente'
            elif inclinacao < -500:
                tendencia = 'decrescente'
            else:
                tendencia = 'estavel'

            crescimento_medio = (inclinacao / y_mean * 100) if y_mean > 0 else 0

            logger.info(f"Previsão gerada para {meses_futuros} meses, tendência: {tendencia}")

            return {
                'sucesso': True,
                'previsoes': previsoes,
                'tendencia': tendencia,
                'crescimento_medio': round(crescimento_medio, 2),
                'base_historica': n
            }

        except Exception as e:
            logger.error(f"Erro forecasting: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== CONCILIAÇÃO BANCÁRIA ==========

    def conciliar_com_banco(
        self,
        escritorio_id: int,
        extrato_banco: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Concilia transações em banco com registros do on.imob.

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
                'transacoes_faltando': [...],
                'duplicadas': [...],
                'status': 'conciliado|diferenca_detectada'
            }
        """
        try:
            # TODO: Buscar transações do on.imob do banco
            total_banco = sum(t['valor'] for t in extrato_banco)
            total_on_imob = 7200  # Simulado
            diferenca = total_banco - total_on_imob

            status = 'conciliado' if abs(diferenca) < 0.01 else 'diferenca_detectada'

            logger.info(f"Conciliação: Banco R$ {total_banco}, on.imob R$ {total_on_imob}, Status: {status}")

            return {
                'sucesso': True,
                'escritorio_id': escritorio_id,
                'total_banco': total_banco,
                'total_on_imob': total_on_imob,
                'diferenca': round(diferenca, 2),
                'status': status,
                'data_conciliacao': datetime.now().isoformat(),
                'transacoes_faltando': [],
                'duplicadas': [],
                'proxima_conciliacao': (datetime.now() + timedelta(days=1)).isoformat()
            }

        except Exception as e:
            logger.error(f"Erro conciliação: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== ALERTAS FINANCEIROS ==========

    def gerar_alertas_financeiros(
        self,
        escritorio_id: int
    ) -> List[Dict[str, Any]]:
        """
        Gera alertas de problemas financeiros.

        Returns:
            [
                {'tipo': 'inadimplencia', 'severidade': 'alta', 'msg': 'Inquilino X atrasado 15 dias'},
                {'tipo': 'margem_baixa', 'severidade': 'media', 'msg': 'Margem caiu para 15%'},
                ...
            ]
        """
        try:
            alertas = []

            # TODO: Buscar dados reais

            # Simular alguns alertas
            alertas.append({
                'tipo': 'inadimplencia',
                'severidade': 'alta',
                'mensagem': 'Inquilino no Imóvel 3 atrasado 20 dias',
                'valor': 2500.00,
                'acao': 'Cobrar via WhatsApp'
            })

            alertas.append({
                'tipo': 'margem_baixa',
                'severidade': 'media',
                'mensagem': 'Margem de lucro caiu para 12% (era 18%)',
                'acao': 'Revisar despesas'
            })

            logger.info(f"Gerados {len(alertas)} alertas para escritório {escritorio_id}")

            return alertas

        except Exception as e:
            logger.error(f"Erro gerar alertas: {e}")
            return []

    # ========== DASHBOARD EXECUTIVO ==========

    def gerar_dashboard_executivo(
        self,
        escritorio_id: int,
        mes: int = None,
        ano: int = None
    ) -> Dict[str, Any]:
        """
        Gera dashboard executivo com todos os KPIs.

        Returns:
            {
                'kpis': {
                    'faturamento': 45000,
                    'margem': 18.5,
                    'roi_medio': 76.5,
                    'inadimplencia': 5.2,
                    'taxa_ocupacao': 92.0
                },
                'alertas': [...],
                'previsoes': [...],
                'ranking_imoveis': [...]
            }
        """
        try:
            if mes is None:
                mes = datetime.now().month
            if ano is None:
                ano = datetime.now().year

            cash_flow = self.calcular_cash_flow(escritorio_id, mes, ano)
            roi_ranking = self.ranking_imoveis_por_roi(escritorio_id)
            previsoes = self.prever_receita(escritorio_id, meses_futuros=3)
            alertas = self.gerar_alertas_financeiros(escritorio_id)

            return {
                'sucesso': True,
                'escritorio_id': escritorio_id,
                'periodo': f"{mes}/{ano}",
                'kpis': {
                    'faturamento': cash_flow['receitas']['total'] if cash_flow['sucesso'] else 0,
                    'despesas': cash_flow['despesas']['total'] if cash_flow['sucesso'] else 0,
                    'margem': cash_flow['margem'] if cash_flow['sucesso'] else 0,
                    'roi_medio': roi_ranking['media_roi'] if roi_ranking['sucesso'] else 0,
                    'total_imoveis': roi_ranking['total_imoveis'] if roi_ranking['sucesso'] else 0
                },
                'alertas': alertas,
                'previsoes': previsoes['previsoes'] if previsoes['sucesso'] else [],
                'ranking_imoveis': roi_ranking['imoveis'] if roi_ranking['sucesso'] else []
            }

        except Exception as e:
            logger.error(f"Erro gerar dashboard: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }


# Instância global
financeiro_adv = FinanceiroAvancado()
