"""
Payment Gateway — PIX, Boleto, Cartão de Crédito
Tier 2.2 — Portal de Pagamento Online
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from enum import Enum
import hashlib
import secrets

logger = logging.getLogger(__name__)

class TipoPagamento(str, Enum):
    PIX = "pix"
    BOLETO = "boleto"
    CARTAO = "cartao"

class StatusPagamento(str, Enum):
    PENDENTE = "pendente"
    PROCESSANDO = "processando"
    CONFIRMADO = "confirmado"
    FALHADO = "falhado"
    CANCELADO = "cancelado"

class PaymentGateway:
    """Gerencia pagamentos (PIX, Boleto, Cartão)."""

    def __init__(self):
        """Inicializar gateway de pagamentos."""
        # Stripe API (para cartão de crédito)
        self.stripe_api_key = os.getenv("STRIPE_API_KEY")

        # PIX (usar serviço como Pix-Brasil ou integração bancária)
        self.pix_key = os.getenv("PIX_KEY")  # CPF, CNPJ, email ou telefone

        # Boleto (usar serviço como Banco Central ou integração bancária)
        self.boleto_bank = os.getenv("BOLETO_BANK", "itau")  # itau, bradesco, santander

        # Configurações gerais
        self.taxa_processamento = 2.99  # 2.99% + R$ 0.30 para cartão
        self.taxa_boleto = 2.49  # 2.49%
        self.taxa_pix = 0  # PIX sem taxa

    # ========== PIX ==========

    def gerar_qrcode_pix(
        self,
        valor: float,
        inquilino_id: int,
        imovel_id: int,
        mes_referencia: str,
        chave_pix: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gera QR Code PIX para pagamento de aluguel.

        Args:
            valor: Valor em reais (ex: 2500.00)
            inquilino_id: ID do inquilino
            imovel_id: ID do imóvel
            mes_referencia: Mês (ex: "2026-10")
            chave_pix: Chave PIX (se não usar a padrão)

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
            chave = chave_pix or self.pix_key
            if not chave:
                return {
                    'sucesso': False,
                    'erro': 'Chave PIX não configurada'
                }

            # Gerar referência única
            ref_id = f"{inquilino_id}-{imovel_id}-{mes_referencia}"

            # Em produção, usar biblioteca qrcode + backend PIX real
            # Aqui vamos simular a geração
            pix_string = f"00020126360014br.gov.bcb.brcode0136{chave}520400005303986540{valor:010.2f}5802BR5913IMOBILIARIA6009SAOPAULO62360532{ref_id}6304"

            logger.info(f"QR Code PIX gerado para inquilino {inquilino_id}: R$ {valor}")

            return {
                'sucesso': True,
                'pix_copy_paste': pix_string,
                'qrcode_url': f'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={pix_string}',
                'valor': valor,
                'chave_pix': chave,
                'referencia': ref_id,
                'instrucoes': f'Abra seu app de banco, escaneie o QR Code ou copie a chave PIX e cole no seu banco'
            }

        except Exception as e:
            logger.error(f"Erro gerar QR Code PIX: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def verificar_pagamento_pix(self, ref_id: str) -> Dict[str, Any]:
        """
        Verifica se PIX foi recebido (webhook do banco).

        Em produção, usar webhook de confirmação do banco:
        - Itaú PIX: POST webhook
        - Bradesco PIX: POST webhook
        - Santander PIX: POST webhook
        """
        try:
            # TODO: Integrar com webhook real do banco
            # Aqui apenas placeholder
            return {
                'sucesso': False,
                'status': 'pendente',
                'msg': 'Aguardando pagamento'
            }
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== BOLETO ==========

    def gerar_boleto(
        self,
        valor: float,
        inquilino_id: int,
        imovel_id: int,
        mes_referencia: str,
        vencimento_dias: int = 5
    ) -> Dict[str, Any]:
        """
        Gera boleto bancário para pagamento.

        Args:
            valor: Valor em reais
            inquilino_id: ID do inquilino
            imovel_id: ID do imóvel
            mes_referencia: Mês (ex: "2026-10")
            vencimento_dias: Dias para vencer (padrão 5)

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
            vencimento = (datetime.now() + timedelta(days=vencimento_dias)).date()

            # Gerar número de boleto simulado
            # Em produção, usar API real (Itaú, Bradesco, Santander)
            numero_boleto = f"{self.boleto_bank.upper()}.{datetime.now().strftime('%Y%m%d')}.{inquilino_id}{imovel_id}"

            logger.info(f"Boleto gerado para inquilino {inquilino_id}: R$ {valor}, vence em {vencimento}")

            return {
                'sucesso': True,
                'numero_boleto': numero_boleto,
                'pdf_url': f'https://boleto-api.example.com/boleto/{numero_boleto}.pdf',
                'vencimento': vencimento.isoformat(),
                'valor': valor,
                'banco': self.boleto_bank,
                'instrucoes': 'Pague no seu banco pelo código de barras ou download do PDF'
            }

        except Exception as e:
            logger.error(f"Erro gerar boleto: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== CARTÃO DE CRÉDITO (STRIPE) ==========

    def processar_pagamento_cartao(
        self,
        valor: float,
        numero_cartao: str,
        mes_vencimento: str,
        ano_vencimento: str,
        cvv: str,
        nome_titular: str,
        email: str,
        inquilino_id: int
    ) -> Dict[str, Any]:
        """
        Processa pagamento com cartão de crédito via Stripe.

        Args:
            valor: Valor em reais
            numero_cartao: Número do cartão (sem espaços)
            mes_vencimento: Mês de vencimento (01-12)
            ano_vencimento: Ano de vencimento (ex: 2026)
            cvv: CVV de 3-4 dígitos
            nome_titular: Nome do titular
            email: Email para comprovante
            inquilino_id: ID do inquilino

        Returns:
            {'sucesso': bool, 'transacao_id': str, 'comprovante': dict}
        """
        try:
            if not self.stripe_api_key:
                return {
                    'sucesso': False,
                    'erro': 'Stripe não configurado'
                }

            # TODO: Integrar com Stripe real
            # Aqui apenas simulação segura

            # Validações básicas
            if len(numero_cartao) < 13:
                return {
                    'sucesso': False,
                    'erro': 'Cartão inválido'
                }

            if int(mes_vencimento) < 1 or int(mes_vencimento) > 12:
                return {
                    'sucesso': False,
                    'erro': 'Mês de vencimento inválido'
                }

            # Simular processamento Stripe
            transacao_id = f"txn_{secrets.token_hex(12)}"

            # Calcular taxa
            taxa = (valor * self.taxa_processamento / 100) + 0.30
            valor_liquido = valor - taxa

            logger.info(f"Pagamento cartão processado: {transacao_id}, Inquilino {inquilino_id}")

            return {
                'sucesso': True,
                'transacao_id': transacao_id,
                'status': 'confirmado',
                'comprovante': {
                    'valor_bruto': valor,
                    'taxa': round(taxa, 2),
                    'valor_liquido': round(valor_liquido, 2),
                    'data': datetime.now().isoformat(),
                    'titular': nome_titular,
                    'ultimos_digitos': numero_cartao[-4:],
                    'email': email
                }
            }

        except Exception as e:
            logger.error(f"Erro processar cartão: {e}")
            return {
                'sucesso': False,
                'erro': 'Falha ao processar pagamento'
            }

    # ========== GESTÃO DE PAGAMENTOS ==========

    def registrar_pagamento(
        self,
        inquilino_id: int,
        imovel_id: int,
        valor: float,
        tipo_pagamento: str,
        mes_referencia: str,
        transacao_id: Optional[str] = None,
        comprovante: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """
        Registra pagamento no sistema.

        Args:
            inquilino_id: ID do inquilino
            imovel_id: ID do imóvel
            valor: Valor pago
            tipo_pagamento: 'pix', 'boleto', 'cartao'
            mes_referencia: Mês (ex: "2026-10")
            transacao_id: ID da transação (para cartão/PIX)
            comprovante: Dict com dados do comprovante

        Returns:
            {'sucesso': bool, 'pagamento_id': int}
        """
        try:
            # TODO: Salvar em banco de dados
            # INSERT INTO pagamentos (inquilino_id, imovel_id, valor, tipo_pagamento, ...)

            pagamento_id = hash(f"{inquilino_id}{imovel_id}{mes_referencia}") % 1000000

            logger.info(f"Pagamento registrado: {pagamento_id}")

            return {
                'sucesso': True,
                'pagamento_id': pagamento_id,
                'status': 'confirmado',
                'data_confirmacao': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Erro registrar pagamento: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def listar_pagamentos(
        self,
        inquilino_id: Optional[int] = None,
        imovel_id: Optional[int] = None,
        mes: Optional[str] = None
    ) -> List[Dict[str, Any]]:
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
            # TODO: Buscar do banco
            # SELECT * FROM pagamentos WHERE ...
            return []
        except Exception as e:
            logger.error(f"Erro listar pagamentos: {e}")
            return []

    def gerar_comprovante_pdf(self, pagamento_id: int) -> Dict[str, Any]:
        """
        Gera PDF do comprovante de pagamento.

        Returns:
            {'sucesso': bool, 'pdf_url': 'string'}
        """
        try:
            # TODO: Integrar com ReportLab para gerar PDF
            return {
                'sucesso': True,
                'pdf_url': f'https://on.imob.com.br/comprovantes/{pagamento_id}.pdf'
            }
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== WEBHOOKS ==========

    def processar_webhook_pix(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook de confirmação PIX do banco.

        Chamado quando banco confirma recebimento do PIX.
        """
        try:
            # TODO: Validar assinatura do webhook
            # TODO: Atualizar status do pagamento em banco

            ref_id = payload.get('ref_id')
            valor = payload.get('valor')

            logger.info(f"PIX confirmado: {ref_id}, R$ {valor}")

            return {
                'sucesso': True,
                'msg': 'PIX processado com sucesso'
            }
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def processar_webhook_boleto(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Processa webhook de confirmação de boleto."""
        try:
            numero_boleto = payload.get('numero_boleto')
            valor = payload.get('valor')

            logger.info(f"Boleto confirmado: {numero_boleto}, R$ {valor}")

            return {
                'sucesso': True,
                'msg': 'Boleto processado com sucesso'
            }
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }


# Instância global
payment_gateway = PaymentGateway()
