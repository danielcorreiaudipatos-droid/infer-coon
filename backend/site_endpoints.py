"""
Endpoints FastAPI para Site Auto-gerado
POST /api/tier2/site/gerar — Gera site de imóvel
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Dict, Any, Optional
import logging

from backend.site_generator import site_gen

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tier2/site", tags=["site-auto-gerado"])

# ==============================================================================
# SITE AUTO-GERADO
# ==============================================================================

@router.post("/gerar/{imovel_id}")
async def gerar_site(imovel_id: int, imovel_data: Dict[str, Any]):
    """
    Gera site HTML estático para um imóvel.

    Args:
        imovel_id: ID do imóvel
        imovel_data: Dict com dados do imóvel

    Returns:
        {'sucesso': bool, 'url': str, 'pasta': str}

    Exemplo:
        POST /api/tier2/site/gerar/123
        {
            "titulo": "Apartamento 2 quartos Vila Madalena",
            "descricao": "Bem localizado, próximo a metrô",
            "tipo": "apartamento",
            "endereco": "Rua X, 100",
            "bairro": "Vila Madalena",
            "cidade": "São Paulo",
            "estado": "SP",
            "cep": "01234-567",
            "area": 85,
            "quartos": 2,
            "banheiros": 2,
            "garagens": 1,
            "preco_locacao": 2500,
            "condominio": 500,
            "iptu": 150,
            "latitude": -23.5505,
            "longitude": -46.6333,
            "fotos": ["url1", "url2"],
            "ar_condicionado": true,
            "piscina": false,
            "academia": true,
            "telefone_whatsapp": "5511999999999",
            "email": "contato@imobiliaria.com.br",
            "imobiliaria_nome": "Imobiliária XYZ"
        }
    """
    try:
        if not imovel_data.get('titulo'):
            raise HTTPException(status_code=400, detail="Título é obrigatório")

        resultado = site_gen.gerar_site_imovel(imovel_id, imovel_data)

        if resultado['sucesso']:
            logger.info(f"Site gerado para imóvel {imovel_id}: {resultado['url']}")

        return resultado

    except Exception as e:
        logger.error(f"Erro gerar site: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao gerar: {str(e)}")


@router.patch("/atualizar/{imovel_id}")
async def atualizar_site(imovel_id: int, imovel_data: Dict[str, Any]):
    """
    Atualiza site existente com dados novos.

    Args:
        imovel_id: ID do imóvel
        imovel_data: Dados atualizados

    Returns:
        {'sucesso': bool, 'url': str, 'msg': str}
    """
    try:
        resultado = site_gen.atualizar_site_imovel(imovel_id, imovel_data)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/deletar/{imovel_id}")
async def deletar_site(imovel_id: int):
    """
    Remove site de um imóvel.

    Args:
        imovel_id: ID do imóvel

    Returns:
        {'sucesso': bool, 'msg': str}
    """
    try:
        resultado = site_gen.deletar_site_imovel(imovel_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/listar")
async def listar_sites():
    """
    Lista todos os sites gerados.

    Returns:
        [
            {
                "imovel_id": 123,
                "url": "https://on.imob.com.br/imoveis/123",
                "data_criacao": "2026-10-02T12:00:00",
                "data_atualizacao": "2026-10-02T14:30:00"
            }
        ]
    """
    try:
        sites = site_gen.listar_sites()
        return {
            'sucesso': True,
            'total': len(sites),
            'sites': sites
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{imovel_id}")
async def status_site(imovel_id: int):
    """
    Verifica se site existe e retorna informações.

    Returns:
        {'existe': bool, 'url': str, 'data_criacao': str}
    """
    try:
        sites = site_gen.listar_sites()
        for site in sites:
            if site['imovel_id'] == imovel_id:
                return {
                    'existe': True,
                    'url': site['url'],
                    'data_criacao': site['data_criacao'],
                    'data_atualizacao': site['data_atualizacao']
                }

        return {
            'existe': False,
            'url': None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
