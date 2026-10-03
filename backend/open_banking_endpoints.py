"""
Endpoints FastAPI — Open Banking (Tier 2.4)
Itaú, Bradesco, Santander integrations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import logging

from backend.open_banking import open_banking

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/open-banking", tags=["open-banking"])


# ========== MODELOS PYDANTIC ==========

class AuthorizationRequest(BaseModel):
    banco: str  # itau, bradesco, santander
    client_id: str
    redirect_uri: str
    state: str


class ConnectBankRequest(BaseModel):
    banco: str
    authorization_code: str
    client_id: str
    client_secret: str
    redirect_uri: str


class TransactionQuery(BaseModel):
    banco: str
    access_token: str
    conta_id: str
    data_inicio: Optional[str] = None
    data_fim: Optional[str] = None
    limite: int = 100


class ReconciliationRequest(BaseModel):
    banco: str
    access_token: str
    conta_id: str
    transacoes_sistema: List[dict] = []


# ==============================================================================
# AUTORIZAÇÃO E CONEXÃO
# ==============================================================================

@router.post("/auth-url")
async def gerar_url_autorizacao(request: AuthorizationRequest):
    """
    Gera URL para autorizar conexão com banco via OAuth2.

    Args:
        banco: 'itau' | 'bradesco' | 'santander'
        client_id: Client ID do banco
        redirect_uri: URI de redirecionamento
        state: Token CSRF

    Returns:
        {'sucesso': bool, 'authorization_url': str}
    """
    try:
        resultado = open_banking.gerar_authorization_url(
            banco=request.banco,
            client_id=request.client_id,
            redirect_uri=request.redirect_uri,
            state=request.state
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro gerar URL: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/conectar")
async def conectar_banco(request: ConnectBankRequest):
    """
    Conecta conta bancária após autorização.

    Args:
        banco: 'itau' | 'bradesco' | 'santander'
        authorization_code: Código retornado pelo banco
        client_id: Client ID do banco
        client_secret: Client Secret do banco
        redirect_uri: URI de redirecionamento

    Returns:
        {'sucesso': bool, 'access_token': str, 'conta_id': str, 'saldo': float}
    """
    try:
        resultado = open_banking.conectar_banco(
            banco=request.banco,
            authorization_code=request.authorization_code,
            client_id=request.client_id,
            client_secret=request.client_secret,
            redirect_uri=request.redirect_uri
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        # TODO: Salvar access_token e conta_id no banco de dados
        # INSERT INTO open_banking_conexoes (escritorio_id, banco, access_token, conta_id, ...)

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro conectar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# CONTAS E SALDOS
# ==============================================================================

@router.get("/contas/{banco}/{access_token}")
async def listar_contas(banco: str, access_token: str):
    """Lista todas as contas do usuário no banco."""
    try:
        resultado = open_banking.buscar_contas(banco, access_token)

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/saldo/{banco}/{access_token}/{conta_id}")
async def buscar_saldo(banco: str, access_token: str, conta_id: str):
    """Busca saldo atual de uma conta."""
    try:
        resultado = open_banking.buscar_saldo(banco, access_token, conta_id)

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# TRANSAÇÕES
# ==============================================================================

@router.post("/transacoes")
async def buscar_transacoes(request: TransactionQuery):
    """
    Busca transações bancárias.

    Args:
        banco: 'itau' | 'bradesco' | 'santander'
        access_token: Access token OAuth2
        conta_id: ID da conta
        data_inicio: YYYY-MM-DD (opcional)
        data_fim: YYYY-MM-DD (opcional)
        limite: Máximo de transações (default 100)

    Returns:
        {'sucesso': bool, 'transacoes': [...], 'total': int}
    """
    try:
        resultado = open_banking.buscar_transacoes(
            banco=request.banco,
            access_token=request.access_token,
            conta_id=request.conta_id,
            data_inicio=request.data_inicio,
            data_fim=request.data_fim,
            limite=request.limite
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        # TODO: Armazenar transações em cache/banco para histórico
        # INSERT INTO transacoes_bancarias (escritorio_id, banco, ...)

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro buscar transações: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# RECONCILIAÇÃO
# ==============================================================================

@router.post("/reconciliar")
async def reconciliar_extrato(request: ReconciliationRequest):
    """
    Reconcilia transações do sistema com extratos bancários.

    Identifica:
    - Transações reconciliadas ✓
    - Faltando no sistema ⚠️
    - Divergências de valores ❌

    Args:
        banco: 'itau' | 'bradesco' | 'santander'
        access_token: Access token OAuth2
        conta_id: ID da conta
        transacoes_sistema: Transações registradas em on.imob

    Returns:
        {
            'sucesso': bool,
            'total_banco': int,
            'total_sistema': int,
            'reconciliados': int,
            'faltando_no_sistema': [...],
            'percentual_reconciliacao': float
        }
    """
    try:
        resultado = open_banking.reconciliar_com_banco(
            banco=request.banco,
            access_token=request.access_token,
            conta_id=request.conta_id,
            transacoes_sistema=request.transacoes_sistema
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        # TODO: Gerar alertas de divergências
        # Se percentual_reconciliacao < 90%, enviar notificação ao financeiro

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro reconciliar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# SINCRONIZAÇÃO AUTOMÁTICA
# ==============================================================================

@router.post("/sincronizar-automatico/{banco}/{access_token}/{conta_id}")
async def configurar_sincronizacao(
    banco: str,
    access_token: str,
    conta_id: str,
    intervalo_horas: int = 24
):
    """
    Configura sincronização automática de extratos.

    A cada X horas, o sistema:
    - Busca transações do banco
    - Reconcilia com on.imob
    - Atualiza saldos
    - Gera alertas

    TODO: Implementar cronjob com APScheduler ou similar
    """
    try:
        resultado = open_banking.sincronizar_automatico(
            banco=banco,
            access_token=access_token,
            conta_id=conta_id,
            intervalo_horas=intervalo_horas
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        # TODO: Criar registro de sincronização automática
        # INSERT INTO sync_schedule (banco, intervalo, proximo_sync, ...)

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sincronizar-agora/{banco}/{access_token}/{conta_id}")
async def sincronizar_agora(banco: str, access_token: str, conta_id: str):
    """Força sincronização imediata."""
    try:
        # Buscar transações imediatamente
        resultado = open_banking.buscar_transacoes(banco, access_token, conta_id)

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return {
            **resultado,
            'msg': 'Sincronização realizada com sucesso',
            'timestamp': __import__('datetime').datetime.now().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro sincronizar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# EXPORTAÇÃO
# ==============================================================================

@router.get("/exportar/{banco}/{formato}")
async def exportar_extrato(banco: str, formato: str = 'csv'):
    """
    Exporta extratos em CSV, Excel ou PDF.

    Formatos suportados:
    - csv: Arquivo CSV simples
    - xlsx: Excel (com formatação)
    - pdf: PDF com gráficos

    TODO: Implementar geração real de arquivos
    """
    try:
        if formato not in ['csv', 'xlsx', 'pdf']:
            raise HTTPException(
                status_code=400,
                detail="Formato deve ser: csv, xlsx ou pdf"
            )

        # TODO: Buscar transações e gerar arquivo
        # Usar: pandas (CSV), openpyxl (Excel), reportlab (PDF)

        return {
            'sucesso': True,
            'banco': banco,
            'formato': formato,
            'arquivo': f'extrato_{banco}.{formato}',
            'msg': f'Extrato exportado em {formato.upper()}'
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==============================================================================
# DASHBOARDS E RELATÓRIOS
# ==============================================================================

@router.get("/dashboard/{banco}/{access_token}/{conta_id}")
async def dashboard_open_banking(banco: str, access_token: str, conta_id: str):
    """
    Dashboard com fluxo de caixa, saldo, transações, alertas.

    TODO: Implementar dashboard com:
    - Saldo atual
    - Últimas 10 transações
    - Gráfico de fluxo entrada/saída (últimos 30 dias)
    - Alertas de divergências
    - % reconciliação
    """
    try:
        # Buscar dados
        saldo_result = open_banking.buscar_saldo(banco, access_token, conta_id)
        transacoes_result = open_banking.buscar_transacoes(
            banco, access_token, conta_id, limite=10
        )

        if not saldo_result['sucesso'] or not transacoes_result['sucesso']:
            raise HTTPException(status_code=400, detail="Erro ao buscar dados")

        return {
            'sucesso': True,
            'banco': banco,
            'saldo': saldo_result.get('saldo'),
            'transacoes_recentes': transacoes_result.get('transacoes'),
            'total_transacoes_mes': transacoes_result.get('total'),
            'alerta': None,
            'msg': 'Dashboard carregado'
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
