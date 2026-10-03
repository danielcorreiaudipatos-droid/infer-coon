"""
Rotas FastAPI para WhatsApp Bot 2-way — Pronto para integrar em main.py

Adicionar ao main.py:
    from backend.whatsapp_routes import router as whatsapp_router
    app.include_router(whatsapp_router)
"""

import logging
from fastapi import APIRouter, Query, Request, HTTPException
from typing import Optional

from backend.whatsapp_bot import (
    verify_webhook_token,
    process_incoming_message,
    send_outgoing_message,
    get_conversation_history,
    get_customer_context,
    get_conversation_stats,
    identify_customer_property
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhook", tags=["whatsapp_bot"])


# ─────────────────────────────────────────────────────────────────────────────
# WEBHOOK VERIFICATION E RECEPÇÃO
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(None),
    hub_challenge: str = Query(None),
    hub_verify_token: str = Query(None)
):
    """
    Verificação de webhook Meta WhatsApp.

    Meta envia GET com desafio; devemos retornar o número do desafio se token correto.

    Exemplo:
    ```
    GET /webhook/whatsapp?hub.mode=subscribe&hub.challenge=123456&hub.verify_token=abc123
    Returns: 123456
    ```
    """
    if hub_mode != "subscribe":
        logger.warning(f"Invalid webhook mode: {hub_mode}")
        raise HTTPException(status_code=400, detail="Invalid mode")

    if not verify_webhook_token(hub_verify_token):
        logger.warning(f"Invalid webhook token: {hub_verify_token}")
        raise HTTPException(status_code=403, detail="Invalid verify token")

    logger.info("Webhook verified successfully")
    return int(hub_challenge)


@router.post("/whatsapp")
async def receive_whatsapp_message(request: Request):
    """
    Receber mensagens do WhatsApp via webhook.

    Meta envia POST com payload JSON contendo:
    - Mensagens recebidas (entrada do cliente)
    - Status de entrega (confirmação de envio)
    - Read receipts (confirmação de leitura)

    Processamos apenas mensagens de texto por enquanto.
    """
    data = await request.json()

    # Validar que é de WhatsApp business account
    if data.get("object") != "whatsapp_business_account":
        logger.debug(f"Ignoring non-whatsapp object: {data.get('object')}")
        return {"status": "ok"}

    # Processar cada entrada (pode ter múltiplas no mesmo request)
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            # ── MENSAGENS RECEBIDAS ──────────────────────────────────────────
            for message in value.get("messages", []):
                try:
                    phone = message.get("from")  # número do cliente (5511987654321)
                    msg_id = message.get("id")   # ID único da mensagem
                    msg_type = message.get("type")  # "text", "image", "document", etc

                    # Por enquanto, processar apenas texto
                    if msg_type == "text" and phone and msg_id:
                        text = message.get("text", {}).get("body", "").strip()

                        if text:
                            logger.info(f"Message from {phone}: {text[:50]}...")

                            # Processar mensagem (IA + histórico)
                            response = await process_incoming_message(
                                phone=phone,
                                text=text,
                                message_id=msg_id
                            )

                            # Enviar resposta de volta via WhatsApp
                            send_result = await send_outgoing_message(
                                phone=phone,
                                text=response["response"],
                                reply_to_message_id=msg_id
                            )

                            if send_result["success"]:
                                logger.info(f"Response sent to {phone} in {response['response_time_ms']:.0f}ms")
                            else:
                                logger.error(f"Failed to send response to {phone}: {send_result.get('error')}")

                    elif msg_type in ["image", "document", "location"]:
                        logger.debug(f"Message type '{msg_type}' not yet supported")
                        # TODO: Implementar suporte para outros tipos

                except Exception as e:
                    logger.error(f"Error processing message {msg_id}: {e}", exc_info=True)

            # ── STATUS DE ENTREGA ────────────────────────────────────────────
            # Meta envia updates de status (sent, delivered, read, failed)
            # Útil para tracking e analytics
            for status in value.get("statuses", []):
                msg_id = status.get("id")
                status_type = status.get("status")  # sent, delivered, read, failed
                timestamp = status.get("timestamp")
                # TODO: salvar status no banco se necessário para tracking
                logger.debug(f"Message {msg_id} status update: {status_type}")

    # Sempre retornar 200 OK para Meta (evita retry)
    return {"status": "ok"}


# ─────────────────────────────────────────────────────────────────────────────
# API DE DASHBOARD
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/whatsapp/conversation/{phone}")
async def get_conversation(phone: str, limit: int = Query(50, ge=1, le=500)):
    """
    Obter histórico completo de conversa com cliente.

    Params:
    - phone: Número WhatsApp (ex: 5511987654321)
    - limit: Número de mensagens (padrão: 50, máximo: 500)

    Returns:
    ```json
    {
      "phone": "5511987654321",
      "total_messages": 12,
      "messages": [
        {
          "id": 1,
          "direction": "inbound",
          "content": "Qual o valor?",
          "created_at": 1696270800,
          "confidence": 0.8
        }
      ]
    }
    ```
    """
    history = get_conversation_history(phone, limit=limit)

    return {
        "phone": phone,
        "total_messages": len(history),
        "messages": history
    }


@router.get("/whatsapp/customer/{phone}")
async def get_customer_profile(phone: str):
    """
    Obter contexto/perfil do cliente para dashboard.

    Params:
    - phone: Número WhatsApp

    Returns:
    ```json
    {
      "phone": "5511987654321",
      "user_id": "cliente_123",
      "total_messages": 12,
      "identified_property_id": 45,
      "first_message_at": 1696270800,
      "last_message_at": 1696271900,
      "status": "active"
    }
    ```
    """
    context = get_customer_context(phone)
    stats = get_conversation_stats(phone)

    return {
        "phone": phone,
        "user_id": context.get("user_id"),
        "total_messages": stats["total_messages"],
        "identified_property_id": stats["identified_property_id"],
        "first_message_at": stats["first_message_at"],
        "last_message_at": stats["last_message_at"],
        "status": stats["status"]
    }


@router.post("/whatsapp/customer/{phone}/property/{property_id}")
async def link_customer_to_property(phone: str, property_id: int):
    """
    Marcar qual imóvel o cliente está perguntando.

    Útil para contextualizar respostas de IA com dados específicos do imóvel.

    Params:
    - phone: Número WhatsApp
    - property_id: ID do imóvel no banco on.imob

    Returns:
    ```json
    {
      "status": "linked",
      "phone": "5511987654321",
      "property_id": 45
    }
    ```
    """
    result = identify_customer_property(phone, property_id)

    return {
        "status": "linked",
        "phone": phone,
        "property_id": property_id
    }


@router.post("/whatsapp/send/{phone}")
async def send_manual_message(phone: str, message: str):
    """
    Enviar mensagem manualmente (para atendimento humano).

    Params:
    - phone: Número WhatsApp
    - message: Texto a enviar

    Body:
    ```json
    {
      "message": "Confirmamos sua visita para amanhã às 14h"
    }
    ```

    Returns:
    ```json
    {
      "success": true,
      "phone": "5511987654321",
      "sent_at": 1696271900
    }
    ```
    """
    result = await send_outgoing_message(phone=phone, text=message)

    if result["success"]:
        return {
            "success": True,
            "phone": phone,
            "message": message
        }
    else:
        raise HTTPException(status_code=500, detail=result.get("error", "Unknown error"))


# ─────────────────────────────────────────────────────────────────────────────
# HEALTH CHECKS
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/whatsapp/health")
async def health_check():
    """
    Health check do WhatsApp Bot.

    Retorna status dos componentes essenciais.
    """
    import os
    from backend.whatsapp_bot import DB_PATH

    health = {
        "status": "healthy",
        "components": {
            "database": "ok" if os.path.exists(DB_PATH) else "error",
            "whatsapp_token": "configured" if os.getenv("WHATSAPP_ACCESS_TOKEN") else "missing",
            "gemini_key": "configured" if os.getenv("GEMINI_API_KEY") else "missing",
            "webhook_token": "configured" if os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN") else "missing"
        }
    }

    # Status global é "error" se algum componente está faltando
    if "missing" in health["components"].values() or "error" in health["components"].values():
        health["status"] = "degraded"

    return health
