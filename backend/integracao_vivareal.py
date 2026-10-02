"""
Integração VivaReal — Auto-publish e Auto-sync de imóveis
Publica imóvel em on.imob → aparece em VivaReal automaticamente
"""

import requests
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
import hashlib

logger = logging.getLogger(__name__)

class IntegracaoVivaReal:
    """Integra on.imob com VivaReal via API."""

    def __init__(self, api_key: str = None, access_token: str = None):
        """
        Inicializar integração VivaReal.

        Args:
            api_key: Chave da API VivaReal (obter em portal VivaReal)
            access_token: Token OAuth VivaReal
        """
        self.api_key = api_key
        self.access_token = access_token
        self.base_url = "https://api.vivareal.com/v2"
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.access_token}" if self.access_token else "",
            "Content-Type": "application/json"
        })

    # ========== PUBLISH ==========

    def publicar_imovel(self, imovel_on_imob: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publica imóvel do on.imob em VivaReal.

        Args:
            imovel_on_imob: Dict com dados do imóvel no on.imob
                {
                    'id': 123,
                    'endereco': 'Rua X, 100',
                    'bairro': 'Vila Y',
                    'tipo': 'apartamento',
                    'area': 85,
                    'quartos': 2,
                    'banheiros': 2,
                    'garagens': 1,
                    'preco_venda': 500000,  # SE for venda
                    'preco_locacao': 2500,   # SE for locação
                    'descricao': 'Bem localizado...',
                    'fotos': ['url1', 'url2', ...],
                    'latitude': -23.55,
                    'longitude': -46.63
                }

        Returns:
            {
                'sucesso': True/False,
                'vivareal_id': 'abc123',
                'url': 'https://vivareal.com.br/imovel/...'
            }
        """
        try:
            # Mapear dados on.imob → VivaReal
            payload = self._mapear_para_vivareal(imovel_on_imob)

            # POST para VivaReal
            response = self.session.post(
                f"{self.base_url}/listings",
                json=payload
            )

            if response.status_code in [200, 201]:
                data = response.json()
                vivareal_id = data.get('id')

                # Salvar mapeamento (on_imob_id ↔ vivareal_id)
                self._salvar_mapeamento(imovel_on_imob['id'], vivareal_id)

                logger.info(f"Imóvel publicado em VivaReal: {vivareal_id}")

                return {
                    'sucesso': True,
                    'vivareal_id': vivareal_id,
                    'url': data.get('url', ''),
                    'msg': 'Publicado com sucesso em VivaReal'
                }
            else:
                logger.error(f"Erro publicar VivaReal: {response.status_code} - {response.text}")
                return {
                    'sucesso': False,
                    'erro': response.json().get('message', 'Erro desconhecido'),
                    'status': response.status_code
                }

        except Exception as e:
            logger.error(f"Erro integração VivaReal: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def atualizar_imovel(self, imovel_on_imob: Dict[str, Any], vivareal_id: str) -> Dict[str, Any]:
        """
        Atualiza imóvel em VivaReal (preço mudou, disponibilidade, etc).
        """
        try:
            payload = self._mapear_para_vivareal(imovel_on_imob)

            response = self.session.patch(
                f"{self.base_url}/listings/{vivareal_id}",
                json=payload
            )

            if response.status_code == 200:
                logger.info(f"Imóvel atualizado em VivaReal: {vivareal_id}")
                return {
                    'sucesso': True,
                    'msg': 'Atualizado em VivaReal'
                }
            else:
                logger.error(f"Erro atualizar VivaReal: {response.status_code}")
                return {
                    'sucesso': False,
                    'erro': response.json().get('message', '')
                }

        except Exception as e:
            logger.error(f"Erro atualizar VivaReal: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    def despublicar_imovel(self, vivareal_id: str) -> Dict[str, Any]:
        """Remove anúncio de VivaReal."""
        try:
            response = self.session.delete(
                f"{self.base_url}/listings/{vivareal_id}"
            )

            if response.status_code == 204:
                logger.info(f"Imóvel removido de VivaReal: {vivareal_id}")
                return {'sucesso': True}
            else:
                return {
                    'sucesso': False,
                    'erro': 'Erro ao remover de VivaReal'
                }

        except Exception as e:
            logger.error(f"Erro remover VivaReal: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== SYNC ==========

    def sincronizar_preco(self, imovel_id: int, novo_preco: float, vivareal_id: str) -> bool:
        """Sincroniza preço do on.imob com VivaReal."""
        try:
            payload = {'price': novo_preco}
            response = self.session.patch(
                f"{self.base_url}/listings/{vivareal_id}",
                json=payload
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Erro sincronizar preço: {e}")
            return False

    def sincronizar_disponibilidade(self, vivareal_id: str, disponivel: bool) -> bool:
        """Sincroniza disponibilidade (ativo/inativo)."""
        try:
            payload = {'status': 'active' if disponivel else 'inactive'}
            response = self.session.patch(
                f"{self.base_url}/listings/{vivareal_id}",
                json=payload
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Erro sincronizar disponibilidade: {e}")
            return False

    # ========== IMPORT (Do VivaReal para on.imob) ==========

    def importar_imoveis_vivareal(self, bairro: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Importa imóveis listados em VivaReal para on.imob.
        Útil para gerenciar tudo em um lugar.
        """
        try:
            params = {}
            if bairro:
                params['neighborhood'] = bairro

            response = self.session.get(
                f"{self.base_url}/listings",
                params=params
            )

            if response.status_code == 200:
                imoveis_vivareal = response.json().get('listings', [])

                # Mapear VivaReal → on.imob
                imoveis_importados = [
                    self._mapear_de_vivareal(i) for i in imoveis_vivareal
                ]

                logger.info(f"Importados {len(imoveis_importados)} imóveis de VivaReal")
                return imoveis_importados
            else:
                logger.error(f"Erro importar de VivaReal: {response.status_code}")
                return []

        except Exception as e:
            logger.error(f"Erro importar VivaReal: {e}")
            return []

    # ========== UTILITÁRIOS ==========

    def _mapear_para_vivareal(self, imovel: Dict[str, Any]) -> Dict[str, Any]:
        """Converte formato on.imob → VivaReal."""

        # Detectar tipo de anúncio
        tipo_anuncio = 'venda' if imovel.get('preco_venda') else 'locacao'
        preco = imovel.get('preco_venda') or imovel.get('preco_locacao')

        # Mapear tipo imóvel
        tipo_map = {
            'apartamento': 'apartment',
            'casa': 'house',
            'comercial': 'commercial',
            'terreno': 'land'
        }

        payload = {
            'title': imovel.get('titulo', f"{imovel.get('tipo', '')} - {imovel.get('bairro', '')}"),
            'description': imovel.get('descricao', ''),
            'propertyType': tipo_map.get(imovel.get('tipo', 'apartamento'), 'apartment'),
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
                'parkingSpaces': imovel.get('garagens', 0),
                'usableArea': imovel.get('area', 0),
                'totalArea': imovel.get('area_terreno', imovel.get('area', 0))
            },
            'images': [
                {'url': foto} for foto in imovel.get('fotos', [])
            ]
        }

        return payload

    def _mapear_de_vivareal(self, imovel_vivareal: Dict[str, Any]) -> Dict[str, Any]:
        """Converte formato VivaReal → on.imob."""

        return {
            'vivareal_id': imovel_vivareal.get('id'),
            'titulo': imovel_vivareal.get('title'),
            'descricao': imovel_vivareal.get('description'),
            'tipo': imovel_vivareal.get('propertyType'),
            'endereco': imovel_vivareal.get('address', {}).get('street'),
            'bairro': imovel_vivareal.get('address', {}).get('neighborhood'),
            'cidade': imovel_vivareal.get('address', {}).get('city'),
            'preco': imovel_vivareal.get('price'),
            'quartos': imovel_vivareal.get('details', {}).get('bedrooms'),
            'banheiros': imovel_vivareal.get('details', {}).get('bathrooms'),
            'garagens': imovel_vivareal.get('details', {}).get('parkingSpaces'),
            'area': imovel_vivareal.get('details', {}).get('usableArea'),
            'fotos': [img.get('url') for img in imovel_vivareal.get('images', [])],
            'latitude': imovel_vivareal.get('address', {}).get('latitude'),
            'longitude': imovel_vivareal.get('address', {}).get('longitude')
        }

    def _salvar_mapeamento(self, on_imob_id: int, vivareal_id: str):
        """Salva mapeamento (on_imob_id ↔ vivareal_id) no banco."""
        try:
            # TODO: Salvar em banco de dados
            # UPDATE imoveis SET vivareal_id = vivareal_id WHERE id = on_imob_id
            pass
        except Exception as e:
            logger.error(f"Erro salvar mapeamento: {e}")

    def obter_vivareal_id(self, on_imob_id: int) -> Optional[str]:
        """Obtém vivareal_id para um imóvel on.imob."""
        try:
            # TODO: Buscar do banco
            # SELECT vivareal_id FROM imoveis WHERE id = on_imob_id
            return None
        except Exception as e:
            logger.error(f"Erro obter vivareal_id: {e}")
            return None


# Instância global
integracao_vr = IntegracaoVivaReal(
    access_token="SEU_TOKEN_VIVAREAL"  # Obter em portal VivaReal
)
