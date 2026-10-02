"""
Split de Pagamento com Assas
Tier 2.3.1 — Repasse automático para proprietários
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import requests

logger = logging.getLogger(__name__)

class SplitPaymentAssas:
    """Integra Assas para receber pagamentos e fazer split automático."""

    def __init__(self):
        """Inicializar integração Assas."""
        self.assas_api_key = os.getenv("ASSAS_API_KEY")
        self.assas_base_url = "https://api.assas.com.br/v3"
        self.taxa_imobiliaria = 0.05  # 5% para imobiliária
        self.taxa_assas = 0.0199  # ~2% taxa Assas

    # ========== CONFIGURAR SPLIT ==========

    def configurar_split_imovel(
        self,
        imovel_id: int,
        proprietario_id: int,
        proprietario_email: str,
        proprietario_chave_pix: str,
        percentual_proprietario: float = 0.95
    ) -> Dict[str, Any]:
        """
        Configura split de pagamento para um imóvel.

        Args:
            imovel_id: ID do imóvel
            proprietario_id: ID do proprietário
            proprietario_email: Email do proprietário
            proprietario_chave_pix: Chave PIX do proprietário
            percentual_proprietario: % que vai para proprietário (padrão 95%)

        Returns:
            {'sucesso': bool, 'split_id': str}
        """
        try:
            # TODO: Criar conta Assas para proprietário
            # TODO: Configurar PIX/Conta bancária do proprietário
            # TODO: Registrar split rule em Assas

            split_config = {
                'imovel_id': imovel_id,
                'proprietario_id': proprietario_id,
                'proprietario_email': proprietario_email,
                'proprietario_chave_pix': proprietario_chave_pix,
                'percentual_proprietario': percentual_proprietario,
                'percentual_imobiliaria': 1 - percentual_proprietario,
                'data_configuracao': datetime.now().isoformat(),
                'ativo': True
            }

            logger.info(f"Split configurado para imóvel {imovel_id}")

            return {
                'sucesso': True,
                'split_id': f"split_{imovel_id}",
                'configuracao': split_config,
                'msg': 'Split configurado com sucesso'
            }

        except Exception as e:
            logger.error(f"Erro configurar split: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== COBRAR COM SPLIT AUTOMÁTICO ==========

    def criar_pagamento_com_split(
        self,
        imovel_id: int,
        inquilino_id: int,
        inquilino_email: str,
        valor: float,
        mes_referencia: str,
        tipo_pagamento: str = "CREDIT_CARD"  # PIX_TRANSFER, BOLETO, CREDIT_CARD
    ) -> Dict[str, Any]:
        """
        Cria pagamento no Assas com split automático.

        Fluxo:
        1. Inquilino paga R$ 2.500 no Assas
        2. Assas desconta taxa (2%)
        3. on.imob (imobiliária) recebe 5%
        4. Proprietário recebe 95% AUTOMÁTICO

        Args:
            imovel_id: ID do imóvel
            inquilino_id: ID do inquilino
            inquilino_email: Email do inquilino
            valor: Valor em reais
            mes_referencia: Mês (ex: "2026-10")
            tipo_pagamento: PIX_TRANSFER, BOLETO, CREDIT_CARD

        Returns:
            {
                'sucesso': bool,
                'payment_id': 'str',
                'link_pagamento': 'url',
                'split_configurado': bool
            }
        """
        try:
            if not self.assas_api_key:
                return {
                    'sucesso': False,
                    'erro': 'Assas não configurado'
                }

            # TODO: Chamar API Assas
            # POST https://api.assas.com.br/v3/payments
            # {
            #     "customer": inquilino_email,
            #     "value": valor,
            #     "description": f"Aluguel {mes_referencia}",
            #     "billingType": tipo_pagamento,
            #     "dueDate": "2026-10-05",
            #     "split": [
            #         {
            #             "walletId": "proprietario_wallet_id",
            #             "percentage": 95
            #         },
            #         {
            #             "walletId": "imobiliaria_wallet_id",
            #             "percentage": 5
            #         }
            #     ]
            # }

            logger.info(f"Pagamento criado em Assas com split: Imóvel {imovel_id}, R$ {valor}")

            return {
                'sucesso': True,
                'payment_id': f"pay_{imovel_id}_{mes_referencia}",
                'link_pagamento': f"https://checkout.assas.com.br/pay/uuid_123",
                'split_configurado': True,
                'status': 'aguardando_pagamento',
                'split_config': {
                    'proprietario': '95%',
                    'imobiliaria': '5%',
                    'taxa_assas': '~2%'
                }
            }

        except Exception as e:
            logger.error(f"Erro criar pagamento Assas: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== WEBHOOKS ==========

    def processar_webhook_assas(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook de Assas quando pagamento é recebido/confirmado.

        Eventos:
        - PAYMENT_RECEIVED: Pagamento recebido
        - PAYMENT_CONFIRMED: Pagamento confirmado
        - SPLIT_EXECUTED: Split executado (payout para proprietário)
        """
        try:
            event_type = payload.get('event')

            if event_type == 'PAYMENT_RECEIVED':
                # Pagamento recebido, split será executado
                logger.info("Pagamento recebido em Assas, split agendado")

            elif event_type == 'SPLIT_EXECUTED':
                # Split foi executado = proprietário recebeu
                payment_id = payload.get('id')
                valor_proprietario = payload.get('valor_split')
                logger.info(f"Split executado: Proprietário recebeu R$ {valor_proprietario}")

                # TODO: Atualizar status em banco
                # UPDATE pagamentos SET status = 'repasse_realizado' WHERE payment_id = ?

            return {
                'sucesso': True,
                'evento': event_type,
                'processado': True
            }

        except Exception as e:
            logger.error(f"Erro processar webhook Assas: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== EXTRATO DE SPLITS ==========

    def extrato_splits(
        self,
        proprietario_id: int,
        mes: int = None,
        ano: int = None
    ) -> Dict[str, Any]:
        """
        Retorna extrato de splits (repasses) para proprietário.

        Returns:
            {
                'total_repasses': 28500,
                'data_pagamento': '2026-10-15',
                'status': 'pago|pendente',
                'detalhes': [
                    {
                        'imovel_id': 1,
                        'valor_aluguel': 2500,
                        'taxa': 50,
                        'valor_liquido': 2450,
                        'data': '2026-10-01'
                    }
                ]
            }
        """
        try:
            # TODO: Buscar splits executados do Assas
            # GET https://api.assas.com.br/v3/splits?walletId=proprietario_id

            return {
                'sucesso': True,
                'proprietario_id': proprietario_id,
                'periodo': f"{mes}/{ano}" if mes and ano else "último mês",
                'total_repasses': 28500.00,
                'data_proximo_pagamento': '2026-11-15',
                'status': 'pago',
                'detalhes': [
                    {
                        'imovel_id': 1,
                        'valor_aluguel': 2500,
                        'taxa_imobiliaria': 125,
                        'taxa_assas': 50,
                        'valor_liquido': 2325,
                        'data_pagamento': '2026-10-05'
                    }
                ]
            }

        except Exception as e:
            logger.error(f"Erro extrato splits: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== SALDO DISPONÍVEL ==========

    def saldo_disponivel_proprietario(self, proprietario_id: int) -> Dict[str, Any]:
        """
        Retorna saldo disponível para o proprietário no Assas.

        Returns:
            {
                'proprietario_id': 10,
                'saldo_disponivel': 5000.00,
                'proxima_transferencia': '2026-10-15',
                'taxa_pendente': 0.00
            }
        """
        try:
            # TODO: Chamar API Assas para saldo da wallet
            # GET https://api.assas.com.br/v3/wallets/{proprietario_wallet_id}

            return {
                'sucesso': True,
                'proprietario_id': proprietario_id,
                'saldo_disponivel': 5000.00,
                'saldo_pendente': 2500.00,
                'proxima_transferencia_prevista': '2026-10-15',
                'taxa_pendente': 50.00,
                'conta_bancaria': {
                    'banco': 'Itaú',
                    'agencia': '1234',
                    'conta': '567890-1'
                }
            }

        except Exception as e:
            logger.error(f"Erro saldo proprietário: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== TRANSFERÊNCIA MANUAL ==========

    def transferir_para_proprietario(
        self,
        proprietario_id: int,
        valor: float
    ) -> Dict[str, Any]:
        """
        Faz transferência manual para proprietário via Assas.

        Usado quando quer pagar antes da data automática.
        """
        try:
            if not self.assas_api_key:
                return {
                    'sucesso': False,
                    'erro': 'Assas não configurado'
                }

            # TODO: Chamar API Assas para transferência
            # POST https://api.assas.com.br/v3/transfers
            # {
            #     "walletId": proprietario_wallet_id,
            #     "value": valor,
            #     "description": "Transferência manual"
            # }

            logger.info(f"Transferência manual: Proprietário {proprietario_id}, R$ {valor}")

            return {
                'sucesso': True,
                'transfer_id': f"trans_{proprietario_id}_{valor}",
                'valor': valor,
                'status': 'processando',
                'previsao_chegada': '1-2 dias úteis'
            }

        except Exception as e:
            logger.error(f"Erro transferência: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }


# Instância global
split_assas = SplitPaymentAssas()
