"""
Integração ZapImóveis — Auto-publish e Auto-sync de imóveis
Similar à VivaReal, publica em ZapImóveis automaticamente
"""

import requests
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime

logger = logging.getLogger(__name__)

class IntegracaoZapImoveis:
    """Integra on.imob com ZapImóveis via API."""

    def __init__(self, api_key: str = None, account_id: str = None):
        """
        Inicializar integração ZapImóveis.

        Args:
            api_key: Chave de API ZapImóveis
            account_id: ID da conta ZapImóveis
        """
        self.api_key = api_key
        self.account_id = account_id
        self.base_url = "https://api.zapimoveis.com.br/v2"
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": self.api_key or "",
            "Content-Type": "application/json"
        })

    # ========== PUBLISH ==========

    def publicar_imovel(self, imovel_on_imob: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publica imóvel do on.imob em ZapImóveis.

        Args:
            imovel_on_imob: Dados do imóvel

        Returns:
            {
                'sucesso': True/False,
                'zap_id': 'xyz789',
                'url': 'https://zapimoveis.com.br/imovel/...'
            }
        """
        try:
            payload = self._mapear_para_zap(imovel_on_imob)

            # POST para ZapImóveis
            response = self.session.post(
                f"{self.base_url}/listings",
                json=payload
            )

            if response.status_code in [200, 201]:
                data = response.json()
                zap_id = data.get('id')

                # Salvar mapeamento
                self._salvar_mapeamento(imovel_on_imob['id'], zap_id)

                logger.info(f"Imóvel publicado em ZapImóveis: {zap_id}")

                return {
                    'sucesso': True,
                    'zap_id': zap_id,
                    'url': data.get('url', ''),
                    'msg': 'Publicado com sucesso em ZapImóveis'
                }
            else:
                logger.error(f"Erro publicar ZapImóveis: {response.status_code} - {response.text}")
                return {
                    'sucesso': False,
                    'erro': response.json().get('message', 'Erro desconhecido'),
                    'status': response.status_code
                }

        except Exception as e:
            logger.error(f"Erro integração ZapImóveis: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def atualizar_imovel(self, imovel_on_imob: Dict[str, Any], zap_id: str) -> Dict[str, Any]:
        """Atualiza imóvel em ZapImóveis."""
        try:
            payload = self._mapear_para_zap(imovel_on_imob)

            response = self.session.patch(
                f"{self.base_url}/listings/{zap_id}",
                json=payload
            )

            if response.status_code == 200:
                logger.info(f"Imóvel atualizado em ZapImóveis: {zap_id}")
                return {'sucesso': True, 'msg': 'Atualizado em ZapImóveis'}
            else:
                return {
                    'sucesso': False,
                    'erro': response.json().get('message', '')
                }

        except Exception as e:
            logger.error(f"Erro atualizar ZapImóveis: {e}")
            return {'sucesso': False, 'erro': str(e)}

    def despublicar_imovel(self, zap_id: str) -> Dict[str, Any]:
        """Remove anúncio de ZapImóveis."""
        try:
            response = self.session.delete(
                f"{self.base_url}/listings/{zap_id}"
            )

            if response.status_code in [200, 204]:
                logger.info(f"Imóvel removido de ZapImóveis: {zap_id}")
                return {'sucesso': True}
            else:
                return {'sucesso': False, 'erro': 'Erro ao remover'}

        except Exception as e:
            logger.error(f"Erro remover ZapImóveis: {e}")
            return {'sucesso': False, 'erro': str(e)}

    # ========== SYNC ==========

    def sincronizar_preco(self, zap_id: str, novo_preco: float) -> bool:
        """Sincroniza preço com ZapImóveis."""
        try:
            payload = {'price': novo_preco}
            response = self.session.patch(
                f"{self.base_url}/listings/{zap_id}",
                json=payload
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Erro sincronizar preço: {e}")
            return False

    def sincronizar_disponibilidade(self, zap_id: str, disponivel: bool) -> bool:
        """Sincroniza disponibilidade."""
        try:
            # ZapImóveis usa "status": "active" ou "inactive"
            payload = {'status': 'active' if disponivel else 'inactive'}
            response = self.session.patch(
                f"{self.base_url}/listings/{zap_id}",
                json=payload
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Erro sincronizar disponibilidade: {e}")
            return False

    # ========== IMPORT ==========

    def importar_imoveis_zap(self, bairro: Optional[str] = None) -> List[Dict[str, Any]]:
        """Importa imóveis listados em ZapImóveis para on.imob."""
        try:
            params = {}
            if bairro:
                params['neighborhood'] = bairro

            response = self.session.get(
                f"{self.base_url}/listings",
                params=params
            )

            if response.status_code == 200:
                imoveis_zap = response.json().get('listings', [])

                # Mapear ZapImóveis → on.imob
                imoveis_importados = [
                    self._mapear_de_zap(i) for i in imoveis_zap
                ]

                logger.info(f"Importados {len(imoveis_importados)} imóveis de ZapImóveis")
                return imoveis_importados
            else:
                logger.error(f"Erro importar de ZapImóveis: {response.status_code}")
                return []

        except Exception as e:
            logger.error(f"Erro importar ZapImóveis: {e}")
            return []

    # ========== WEBHOOK (Receber notificações de ZapImóveis) ==========

    def processar_webhook_zap(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processa webhook de ZapImóveis.
        Eventos: listing_updated, listing_deleted, message_received, etc.
        """
        try:
            evento = payload.get('event')

            if evento == 'listing_updated':
                # Alguém atualizou o anúncio em ZapImóveis
                # Sincronizar de volta para on.imob
                logger.info("Sincronizando atualização de ZapImóveis")
                return {'sucesso': True, 'acao': 'sincronizar'}

            elif evento == 'message_received':
                # Nova mensagem de cliente em ZapImóveis
                # Trazer para on.imob (conversa integrada)
                msg = payload.get('message', {})
                logger.info(f"Nova mensagem de {msg.get('sender')}")
                return {'sucesso': True, 'acao': 'nova_mensagem'}

            elif evento == 'listing_deleted':
                # Anúncio deletado em ZapImóveis
                logger.info("Anúncio deletado em ZapImóveis")
                return {'sucesso': True, 'acao': 'deletar'}

            else:
                logger.warning(f"Evento desconhecido: {evento}")
                return {'sucesso': False, 'erro': 'Evento desconhecido'}

        except Exception as e:
            logger.error(f"Erro processar webhook: {e}")
            return {'sucesso': False, 'erro': str(e)}

    # ========== UTILITÁRIOS ==========

    def _mapear_para_zap(self, imovel: Dict[str, Any]) -> Dict[str, Any]:
        """Converte formato on.imob → ZapImóveis."""

        tipo_map = {
            'apartamento': 'apartment',
            'casa': 'house',
            'comercial': 'commercial',
            'terreno': 'land'
        }

        tipo_anuncio = 'rent' if imovel.get('preco_locacao') else 'sale'
        preco = imovel.get('preco_venda') or imovel.get('preco_locacao')

        payload = {
            'title': imovel.get('titulo', f"{imovel.get('tipo')} - {imovel.get('bairro')}"),
            'description': imovel.get('descricao', ''),
            'propertyType': tipo_map.get(imovel.get('tipo', 'apartment'), 'apartment'),
            'listingType': tipo_anuncio,
            'price': preco,
            'address': {
                'street': imovel.get('endereco', ''),
                'neighborhood': imovel.get('bairro', ''),
                'city': imovel.get('cidade', 'São Paulo'),
                'state': imovel.get('estado', 'SP'),
                'zipCode': imovel.get('cep', ''),
                'latitude': imovel.get('latitude'),
                'longitude': imovel.get('longitude')
            },
            'details': {
                'bedrooms': imovel.get('quartos', 0),
                'bathrooms': imovel.get('banheiros', 0),
                'garages': imovel.get('garagens', 0),
                'usableArea': imovel.get('area', 0)
            },
            'contact': {
                'phone': imovel.get('telefone', ''),
                'email': imovel.get('email', '')
            },
            'photos': [
                {'url': foto} for foto in imovel.get('fotos', [])
            ]
        }

        # Se for locação, adicionar campos extras
        if tipo_anuncio == 'rent':
            payload['details']['condominium'] = imovel.get('condominio', 0)
            payload['details']['iptu'] = imovel.get('iptu', 0)

        return payload

    def _mapear_de_zap(self, imovel_zap: Dict[str, Any]) -> Dict[str, Any]:
        """Converte formato ZapImóveis → on.imob."""

        return {
            'zap_id': imovel_zap.get('id'),
            'titulo': imovel_zap.get('title'),
            'descricao': imovel_zap.get('description'),
            'tipo': imovel_zap.get('propertyType'),
            'endereco': imovel_zap.get('address', {}).get('street'),
            'bairro': imovel_zap.get('address', {}).get('neighborhood'),
            'cidade': imovel_zap.get('address', {}).get('city'),
            'preco': imovel_zap.get('price'),
            'quartos': imovel_zap.get('details', {}).get('bedrooms'),
            'banheiros': imovel_zap.get('details', {}).get('bathrooms'),
            'garagens': imovel_zap.get('details', {}).get('garages'),
            'area': imovel_zap.get('details', {}).get('usableArea'),
            'condominio': imovel_zap.get('details', {}).get('condominium'),
            'iptu': imovel_zap.get('details', {}).get('iptu'),
            'fotos': [img.get('url') for img in imovel_zap.get('photos', [])]
        }

    def _salvar_mapeamento(self, on_imob_id: int, zap_id: str):
        """Salva mapeamento (on_imob_id ↔ zap_id) no banco."""
        try:
            # TODO: Salvar em banco de dados
            # UPDATE imoveis SET zap_id = zap_id WHERE id = on_imob_id
            pass
        except Exception as e:
            logger.error(f"Erro salvar mapeamento: {e}")

    def obter_zap_id(self, on_imob_id: int) -> Optional[str]:
        """Obtém zap_id para um imóvel on.imob."""
        try:
            # TODO: Buscar do banco
            return None
        except Exception as e:
            logger.error(f"Erro obter zap_id: {e}")
            return None


# Instância global
integracao_zap = IntegracaoZapImoveis(
    api_key="SUA_API_KEY_ZAPIMOVEIS",
    account_id="SUA_ACCOUNT_ID"
)
