"""
Relatórios PDF Visuais — Dashboards profissionais em PDF
Relatório financeiro, aluguéis, repassos, comissões
"""

from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime, timedelta
import io
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger(__name__)

class RelatoriosPDF:
    """Gera relatórios visuais em PDF para imobiliárias."""

    def __init__(self):
        self.estilos = getSampleStyleSheet()
        self._criar_estilos_customizados()

    def _criar_estilos_customizados(self):
        """Define estilos customizados para relatórios."""

        self.estilo_titulo = ParagraphStyle(
            'CustomTitle',
            parent=self.estilos['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#667eea'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )

        self.estilo_subtitulo = ParagraphStyle(
            'CustomSubtitle',
            parent=self.estilos['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#764ba2'),
            spaceAfter=6,
            fontName='Helvetica-Bold'
        )

        self.estilo_valor = ParagraphStyle(
            'CustomValue',
            parent=self.estilos['Normal'],
            fontSize=12,
            textColor=colors.HexColor('#22c55e'),
            fontName='Helvetica-Bold'
        )

    # ========== RELATÓRIO FINANCEIRO MENSAL ==========

    def gerar_relatorio_financeiro(
        self,
        escritorio_id: int,
        mes: int,
        ano: int
    ) -> bytes:
        """
        Gera relatório financeiro mensal em PDF.

        Inclui:
        - Resumo executivo (KPIs)
        - Aluguéis recebidos
        - Repassos a proprietários
        - Comissões
        - Despesas
        - Gráficos
        """

        # Criar documento em memória
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=landscape(letter),
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )

        elementos = []

        # Título
        titulo = Paragraph(
            f"📊 Relatório Financeiro — {mes}/{ano}",
            self.estilo_titulo
        )
        elementos.append(titulo)
        elementos.append(Spacer(1, 0.2*inch))

        # ========== KPI CARDS ==========

        # TODO: Buscar dados reais do banco
        dados_kpi = {
            'alugueis_recebidos': 45000,
            'repassos': 38000,
            'comissoes': 3500,
            'despesas': 2500,
            'saldo': 7500
        }

        # Cards KPI
        kpi_data = [
            ['ALUGUÉIS', 'REPASSOS', 'COMISSÕES', 'DESPESAS', 'SALDO LÍQUIDO'],
            [
                f"R$ {dados_kpi['alugueis_recebidos']:,}",
                f"R$ {dados_kpi['repassos']:,}",
                f"R$ {dados_kpi['comissoes']:,.2f}",
                f"R$ {dados_kpi['despesas']:,.2f}",
                f"R$ {dados_kpi['saldo']:,.2f}"
            ]
        ]

        kpi_table = Table(kpi_data, colWidths=[1.8*inch]*5)
        kpi_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#f0f4ff')),
            ('TEXTCOLOR', (0, 1), (-1, 1), colors.HexColor('#22c55e')),
            ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 1), (-1, 1), 12),
            ('TOPPADDING', (0, 1), (-1, 1), 12),
            ('BOTTOMPADDING', (0, 1), (-1, 1), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey)
        ]))

        elementos.append(kpi_table)
        elementos.append(Spacer(1, 0.3*inch))

        # ========== ALUGUÉIS RECEBIDOS ==========

        elementos.append(Paragraph("Aluguéis Recebidos", self.estilo_subtitulo))

        # TODO: Buscar dados reais
        alugueis_data = [
            ['IMÓVEL', 'INQUILINO', 'VALOR', 'STATUS'],
            ['Rua A, 100', 'João Silva', 'R$ 2.000', '✓ Pago'],
            ['Rua B, 200', 'Maria Santos', 'R$ 1.800', '✓ Pago'],
            ['Rua C, 300', 'Pedro Costa', 'R$ 2.500', '⏳ Atrasado'],
            ['', '', 'TOTAL', 'R$ 6.300']
        ]

        alugueis_table = Table(alugueis_data, colWidths=[2*inch, 2*inch, 1.5*inch, 1.5*inch])
        alugueis_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (3, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8f4f8')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('TOPPADDING', (0, -1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9f9f9')])
        ]))

        elementos.append(alugueis_table)
        elementos.append(PageBreak())

        # ========== REPASSOS A PROPRIETÁRIOS ==========

        elementos.append(Paragraph("Repassos a Proprietários", self.estilo_subtitulo))

        # TODO: Buscar dados reais
        repassos_data = [
            ['PROPRIETÁRIO', 'IMÓVEL', 'VALOR ALUGUEL', 'REPASSE', 'COMISSÃO', 'STATUS'],
            ['Sr. José', 'Rua A, 100', 'R$ 2.000', 'R$ 1.800', 'R$ 200', '✓ Enviado'],
            ['Dra. Ana', 'Rua B, 200', 'R$ 1.800', 'R$ 1.620', 'R$ 180', '✓ Enviado'],
            ['Sr. Paulo', 'Rua C, 300', 'R$ 2.500', 'R$ 2.250', 'R$ 250', '⏳ Pendente']
        ]

        repassos_table = Table(repassos_data, colWidths=[1.5*inch, 1.5*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        repassos_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#764ba2')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('ALIGN', (2, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9f9f9')])
        ]))

        elementos.append(repassos_table)
        elementos.append(Spacer(1, 0.2*inch))

        # ========== RODAPÉ ==========

        rodape = Paragraph(
            f"<i>Relatório gerado automaticamente pelo on.imob em {datetime.now().strftime('%d/%m/%Y às %H:%M')}</i>",
            self.estilos['Normal']
        )
        elementos.append(rodape)

        # Construir PDF
        doc.build(elementos)
        pdf_buffer.seek(0)

        logger.info(f"Relatório financeiro gerado: {mes}/{ano}")
        return pdf_buffer.getvalue()

    # ========== COMPARATIVO MÊS ANTERIOR ==========

    def gerar_relatorio_comparativo(
        self,
        escritorio_id: int,
        mes_atual: int,
        ano: int
    ) -> bytes:
        """
        Gera relatório comparativo (mês atual vs mês anterior).
        Mostra tendências, crescimento, quedas.
        """

        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            pdf_buffer,
            pagesize=landscape(letter),
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch
        )

        elementos = []

        # Título
        titulo = Paragraph(
            f"📈 Comparativo: {mes_atual}/{ano} vs {mes_atual-1}/{ano}",
            self.estilo_titulo
        )
        elementos.append(titulo)
        elementos.append(Spacer(1, 0.3*inch))

        # Tabela comparativa
        comp_data = [
            ['MÉTRICA', f'MÊS ATUAL', f'MÊS ANTERIOR', 'VARIAÇÃO', 'TREND'],
            ['Aluguéis Recebidos', 'R$ 45.000', 'R$ 42.000', '+R$ 3.000', '↑ +7.1%'],
            ['Repassos', 'R$ 38.000', 'R$ 36.500', '+R$ 1.500', '↑ +4.1%'],
            ['Comissões', 'R$ 3.500', 'R$ 3.200', '+R$ 300', '↑ +9.4%'],
            ['Inadimplência', 'R$ 2.500', 'R$ 3.200', '-R$ 700', '↓ -21.9%'],
            ['SALDO LÍQUIDO', 'R$ 7.500', 'R$ 6.100', '+R$ 1.400', '↑ +22.9%']
        ]

        comp_table = Table(comp_data, colWidths=[2*inch, 1.5*inch, 1.5*inch, 1.5*inch, 1.2*inch])
        comp_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#667eea')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#e8f4f8')),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('TOPPADDING', (0, -1), (-1, -1), 8),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#f9f9f9')])
        ]))

        elementos.append(comp_table)

        # Construir PDF
        doc.build(elementos)
        pdf_buffer.seek(0)

        logger.info(f"Relatório comparativo gerado")
        return pdf_buffer.getvalue()

    # ========== SALVAR ARQUIVO ==========

    def salvar_relatorio(self, pdf_bytes: bytes, filename: str, caminho: str = "./relatorios/"):
        """Salva PDF no servidor."""
        try:
            with open(f"{caminho}{filename}", 'wb') as f:
                f.write(pdf_bytes)
            logger.info(f"Relatório salvo: {filename}")
            return True
        except Exception as e:
            logger.error(f"Erro salvar relatório: {e}")
            return False


# Instância global
relatorios = RelatoriosPDF()
