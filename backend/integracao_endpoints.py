"""
Endpoints FastAPI para Integrações VivaReal + ZapImóveis
Auto-publish, sync de preços, webhooks
"""

from fastapi import APIRouter, HTTPException, Request, Query
from typing import Dict, Any, List, Optional
import logging

from backend.integracao_vivareal import integracao_vr
from backend.integracao_zapimov import integracao_zap

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integracao", tags=["integrações"])

# ==============================================================================
# VIVAREAL — PUBLISH, SYNC, IMPORT
# ==============================================================================

@router.post("/vivareal/publicar/{imovel_id}")
async def publicar_vivareal(imovel_id: int, imovel_data: Dict[str, Any]):
    """
    Publica imóvel em VivaReal.

    Args:
        imovel_id: ID do imóvel em on.imob
        imovel_data: Dict com dados do imóvel

    Returns:
        {'sucesso': bool, 'vivareal_id': str, 'url': str, 'msg': str}
    """
    try:
        # TODO: Buscar dados reais do banco usando imovel_id
        resultado = integracao_vr.publicar_imovel(imovel_data)

        if resultado['sucesso']:
            logger.info(f"Imóvel {imovel_id} publicado em VivaReal: {resultado['vivareal_id']}")

        return resultado

    except Exception as e:
        logger.error(f"Erro publicar VivaReal: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao publicar: {str(e)}")


@router.patch("/vivareal/atualizar/{imovel_id}")
async def atualizar_vivareal(imovel_id: int, imovel_data: Dict[str, Any]):
    """Atualiza imóvel em VivaReal."""
    try:
        # TODO: Buscar vivareal_id do banco
        vivareal_id = "TODO"  # Obtido do mapeamento no banco
        resultado = integracao_vr.atualizar_imovel(imovel_data, vivareal_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/vivareal/preco/{imovel_id}")
async def atualizar_preco_vivareal(
    imovel_id: int,
    novo_preco: float,
    vivareal_id: str = Query(...)
):
    """Sincroniza preço com VivaReal."""
    try:
        sucesso = integracao_vr.sincronizar_preco(imovel_id, novo_preco, vivareal_id)
        return {
            'sucesso': sucesso,
            'msg': 'Preço sincronizado' if sucesso else 'Erro ao sincronizar'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/vivareal/disponibilidade/{imovel_id}")
async def atualizar_disponibilidade_vivareal(
    imovel_id: int,
    disponivel: bool,
    vivareal_id: str = Query(...)
):
    """Sincroniza disponibilidade com VivaReal."""
    try:
        sucesso = integracao_vr.sincronizar_disponibilidade(vivareal_id, disponivel)
        return {
            'sucesso': sucesso,
            'msg': 'Disponibilidade sincronizada' if sucesso else 'Erro'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vivareal/despublicar/{imovel_id}")
async def despublicar_vivareal(imovel_id: int, vivareal_id: str = Query(...)):
    """Remove anúncio de VivaReal."""
    try:
        resultado = integracao_vr.despublicar_imovel(vivareal_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/vivareal/importar")
async def importar_vivareal(bairro: Optional[str] = None):
    """
    Importa imóveis de VivaReal para on.imob.

    Args:
        bairro: Filtro opcional por bairro

    Returns:
        Lista de imóveis importados
    """
    try:
        imoveis = integracao_vr.importar_imoveis_vivareal(bairro)
        return {
            'sucesso': len(imoveis) > 0,
            'total_importados': len(imoveis),
            'imoveis': imoveis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/vivareal/webhook")
async def webhook_vivareal(request: Request):
    """
    Recebe notificações de VivaReal (atualização de anúncio, nova mensagem, etc).
    """
    try:
        payload = await request.json()
        evento = payload.get('event')

        logger.info(f"Webhook VivaReal recebido: {evento}")

        # TODO: Processar eventos:
        # - listing_updated: sincronizar atualização de VivaReal
        # - message_received: nova mensagem de cliente
        # - listing_deleted: anúncio deletado

        return {'sucesso': True, 'msg': f'Evento {evento} processado'}

    except Exception as e:
        logger.error(f"Erro processar webhook VivaReal: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# ZAPIMOVEIS — PUBLISH, SYNC, IMPORT, WEBHOOKS
# ==============================================================================

@router.post("/zapimoveis/publicar/{imovel_id}")
async def publicar_zapimoveis(imovel_id: int, imovel_data: Dict[str, Any]):
    """
    Publica imóvel em ZapImóveis.

    Args:
        imovel_id: ID do imóvel em on.imob
        imovel_data: Dict com dados do imóvel

    Returns:
        {'sucesso': bool, 'zap_id': str, 'url': str, 'msg': str}
    """
    try:
        # TODO: Buscar dados reais do banco usando imovel_id
        resultado = integracao_zap.publicar_imovel(imovel_data)

        if resultado['sucesso']:
            logger.info(f"Imóvel {imovel_id} publicado em ZapImóveis: {resultado['zap_id']}")

        return resultado

    except Exception as e:
        logger.error(f"Erro publicar ZapImóveis: {e}")
        raise HTTPException(status_code=500, detail=f"Erro ao publicar: {str(e)}")


@router.patch("/zapimoveis/atualizar/{imovel_id}")
async def atualizar_zapimoveis(imovel_id: int, imovel_data: Dict[str, Any]):
    """Atualiza imóvel em ZapImóveis."""
    try:
        # TODO: Buscar zap_id do banco
        zap_id = "TODO"  # Obtido do mapeamento no banco
        resultado = integracao_zap.atualizar_imovel(imovel_data, zap_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/zapimoveis/preco/{imovel_id}")
async def atualizar_preco_zapimoveis(
    imovel_id: int,
    novo_preco: float,
    zap_id: str = Query(...)
):
    """Sincroniza preço com ZapImóveis."""
    try:
        sucesso = integracao_zap.sincronizar_preco(zap_id, novo_preco)
        return {
            'sucesso': sucesso,
            'msg': 'Preço sincronizado' if sucesso else 'Erro ao sincronizar'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/zapimoveis/disponibilidade/{imovel_id}")
async def atualizar_disponibilidade_zapimoveis(
    imovel_id: int,
    disponivel: bool,
    zap_id: str = Query(...)
):
    """Sincroniza disponibilidade com ZapImóveis."""
    try:
        sucesso = integracao_zap.sincronizar_disponibilidade(zap_id, disponivel)
        return {
            'sucesso': sucesso,
            'msg': 'Disponibilidade sincronizada' if sucesso else 'Erro'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/zapimoveis/despublicar/{imovel_id}")
async def despublicar_zapimoveis(imovel_id: int, zap_id: str = Query(...)):
    """Remove anúncio de ZapImóveis."""
    try:
        resultado = integracao_zap.despublicar_imovel(zap_id)
        return resultado
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/zapimoveis/importar")
async def importar_zapimoveis(bairro: Optional[str] = None):
    """
    Importa imóveis de ZapImóveis para on.imob.

    Args:
        bairro: Filtro opcional por bairro

    Returns:
        Lista de imóveis importados
    """
    try:
        imoveis = integracao_zap.importar_imoveis_zap(bairro)
        return {
            'sucesso': len(imoveis) > 0,
            'total_importados': len(imoveis),
            'imoveis': imoveis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/zapimoveis/webhook")
async def webhook_zapimoveis(request: Request):
    """
    Recebe notificações de ZapImóveis (atualização de anúncio, nova mensagem, etc).
    """
    try:
        payload = await request.json()

        logger.info(f"Webhook ZapImóveis recebido")

        # Processar webhook
        resultado = integracao_zap.processar_webhook_zap(payload)

        return resultado

    except Exception as e:
        logger.error(f"Erro processar webhook ZapImóveis: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# STATUS E CONFIGURAÇÃO
# ==============================================================================

@router.get("/status")
async def status_integracoes():
    """Retorna status das integrações."""
    return {
        'vivareal': {
            'configurado': bool(integracao_vr.access_token),
            'api_key': '***' if integracao_vr.api_key else 'não configurado'
        },
        'zapimoveis': {
            'configurado': bool(integracao_zap.api_key),
            'account_id': integracao_zap.account_id or 'não configurado'
        }
    }


@router.get("/vivareal/config")
async def get_vivareal_config():
    """Retorna configuração VivaReal (sem sensitive data)."""
    return {
        'api_key': '***' if integracao_vr.api_key else 'não configurado',
        'access_token': '***' if integracao_vr.access_token else 'não configurado',
        'base_url': integracao_vr.base_url
    }


@router.get("/zapimoveis/config")
async def get_zapimoveis_config():
    """Retorna configuração ZapImóveis (sem sensitive data)."""
    return {
        'api_key': '***' if integracao_zap.api_key else 'não configurado',
        'account_id': integracao_zap.account_id or 'não configurado',
        'base_url': integracao_zap.base_url
    }
