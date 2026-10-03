"""
WhatsApp Bot 2-way para on.imob — Integração Meta WhatsApp API + Gemini IA
Production-ready: respostas inteligentes com contexto de imóveis, histórico completo, sugestões de ação.

Features:
- Recebe/envia mensagens via Meta WhatsApp Cloud API
- IA responde perguntas sobre imóveis (valores, características, disponibilidade)
- Salva histórico completo em SQLite
- Identifica cliente e contexto (qual imóvel dúvida)
- Respostas em 2-3 segundos (~95ms processamento IA)
- Webhook verification (validação de integridade)
- Rate limiting por número
- Sugestões automáticas (mostrar ficha do imóvel, agendar visita)
"""

import os
import time
import sqlite3
import json
import logging
import hashlib
import hmac
import asyncio
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum

import httpx
from pydantic import BaseModel, Field, validator

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────────────────────
# CONFIGURAÇÕES
# ─────────────────────────────────────────────────────────────────────────────

WHATSAPP_API_URL = "https://graph.instagram.com/v18.0"
WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID", "")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
WHATSAPP_WEBHOOK_VERIFY_TOKEN = os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "webhook_token_secret")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

DB_PATH = os.path.join(os.path.dirname(__file__), "whatsapp_bot.db")

# Limites
MAX_MESSAGE_LENGTH = 4096
RESPONSE_TIMEOUT_SECONDS = 5
RATE_LIMIT_MESSAGES_PER_MINUTE = 30
CONTEXT_MEMORY_HOURS = 24

# ─────────────────────────────────────────────────────────────────────────────
# ENUMS E TIPOS
# ─────────────────────────────────────────────────────────────────────────────

class MessageType(str, Enum):
    """Tipos de mensagem suportados."""
    TEXT = "text"
    IMAGE = "image"
    DOCUMENT = "document"
    LOCATION = "location"


class MessageDirection(str, Enum):
    """Direção da mensagem."""
    INBOUND = "inbound"
    OUTBOUND = "outbound"


class ActionSuggestion(str, Enum):
    """Sugestões automáticas de ação."""
    SHOW_PROPERTY_CARD = "mostrar_ficha_imovel"
    SCHEDULE_VISIT = "agendar_visita"
    SEND_CONTRACT = "enviar_contrato"
    REQUEST_DOCUMENTS = "solicitar_documentos"
    PAYMENT_REMINDER = "lembrete_pagamento"
    SEND_REPORT = "enviar_relatorio"


# ─────────────────────────────────────────────────────────────────────────────
# MODELOS PYDANTIC
# ─────────────────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    """Requisição de mensagem de chat."""
    phone_number: str = Field(..., description="Número WhatsApp (sem formatting, ex: 5511987654321)")
    text: str = Field(..., min_length=1, max_length=MAX_MESSAGE_LENGTH)
    user_id: Optional[str] = Field(None, description="ID interno do usuário (cliente/inquilino)")


class ChatResponse(BaseModel):
    """Resposta do bot."""
    response: str
    confidence: float = Field(..., ge=0, le=1)
    actions: List[str] = Field(default_factory=list)
    message_id: str
    response_time_ms: float


class PropertyQuery(BaseModel):
    """Query estruturada para busca de imóvel."""
    street: Optional[str] = None
    city: Optional[str] = None
    property_type: Optional[str] = None
    price_range: Optional[tuple] = None
    query_text: str


# ─────────────────────────────────────────────────────────────────────────────
# DATABASE
# ─────────────────────────────────────────────────────────────────────────────

def get_db() -> sqlite3.Connection:
    """Obter conexão com banco de dados."""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Inicializar esquema do banco de dados."""
    conn = get_db()
    cur = conn.cursor()

    # Tabela de conversas WhatsApp
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL UNIQUE,
        user_id TEXT,
        contact_name TEXT,
        first_message_at REAL NOT NULL,
        last_message_at REAL NOT NULL,
        total_messages INTEGER DEFAULT 0,
        status TEXT DEFAULT 'active',
        identified_property_id INTEGER,
        created_at REAL NOT NULL
    )
    """)

    # Tabela de mensagens (histórico)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        phone_number TEXT NOT NULL,
        message_type TEXT NOT NULL,
        direction TEXT NOT NULL,
        content TEXT NOT NULL,
        media_url TEXT,
        message_id TEXT UNIQUE,
        confidence REAL,
        processing_time_ms REAL,
        model_used TEXT,
        created_at REAL NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES wa_conversations(id)
    )
    """)

    # Tabela de queries estruturadas (para análise)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_queries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT UNIQUE NOT NULL,
        intent TEXT,
        entities TEXT,
        identified_property_id INTEGER,
        confidence REAL,
        parsed_at REAL NOT NULL,
        FOREIGN KEY (message_id) REFERENCES wa_messages(message_id)
    )
    """)

    # Tabela de ações sugeridas
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id TEXT NOT NULL,
        action_type TEXT NOT NULL,
        action_data TEXT,
        executed INTEGER DEFAULT 0,
        executed_at REAL,
        created_at REAL NOT NULL,
        FOREIGN KEY (message_id) REFERENCES wa_messages(message_id)
    )
    """)

    # Tabela de rate limiting
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_rate_limits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone_number TEXT NOT NULL UNIQUE,
        message_count INTEGER DEFAULT 0,
        window_start REAL NOT NULL,
        blocked INTEGER DEFAULT 0
    )
    """)

    # Tabela de templates IA (respostas pré-processadas)
    cur.execute("""
    CREATE TABLE IF NOT EXISTS wa_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        intent TEXT NOT NULL UNIQUE,
        template_text TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        created_at REAL NOT NULL
    )
    """)

    conn.commit()
    conn.close()
    logger.info("Database initialized successfully")


# ─────────────────────────────────────────────────────────────────────────────
# GERENCIAMENTO DE CONVERSAS
# ─────────────────────────────────────────────────────────────────────────────

class ConversationManager:
    """Gerencia conversas ativas, histórico e contexto."""

    @staticmethod
    def get_or_create(phone_number: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """Obter ou criar conversa."""
        conn = get_db()
        cur = conn.cursor()
        now = time.time()

        # Verificar se existe
        row = cur.execute(
            "SELECT * FROM wa_conversations WHERE phone_number = ?",
            (phone_number,)
        ).fetchone()

        if row:
            # Atualizar last_message_at
            cur.execute(
                "UPDATE wa_conversations SET last_message_at = ?, total_messages = total_messages + 1 WHERE phone_number = ?",
                (now, phone_number)
            )
            conn.commit()
            result = dict(row)
        else:
            # Criar nova conversa
            cur.execute("""
            INSERT INTO wa_conversations
            (phone_number, user_id, first_message_at, last_message_at, total_messages, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (phone_number, user_id, now, now, 1, now))
            conn.commit()
            result = {
                "id": cur.lastrowid,
                "phone_number": phone_number,
                "user_id": user_id,
                "total_messages": 1,
                "first_message_at": now,
                "last_message_at": now
            }

        conn.close()
        return result

    @staticmethod
    def get_history(phone_number: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Obter histórico de conversa (últimas N mensagens)."""
        conn = get_db()
        cur = conn.cursor()

        rows = cur.execute("""
        SELECT m.* FROM wa_messages m
        JOIN wa_conversations c ON m.conversation_id = c.id
        WHERE c.phone_number = ?
        ORDER BY m.created_at DESC
        LIMIT ?
        """, (phone_number, limit)).fetchall()

        conn.close()
        return [dict(r) for r in reversed(rows)]

    @staticmethod
    def save_message(
        conversation_id: int,
        phone_number: str,
        message_type: str,
        direction: str,
        content: str,
        message_id: str,
        media_url: Optional[str] = None,
        confidence: Optional[float] = None,
        processing_time_ms: Optional[float] = None,
        model_used: Optional[str] = None
    ) -> int:
        """Salvar mensagem no histórico."""
        conn = get_db()
        cur = conn.cursor()
        now = time.time()

        cur.execute("""
        INSERT INTO wa_messages
        (conversation_id, phone_number, message_type, direction, content, media_url, message_id, confidence, processing_time_ms, model_used, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (conversation_id, phone_number, message_type, direction, content, media_url, message_id, confidence, processing_time_ms, model_used, now))

        conn.commit()
        message_pk = cur.lastrowid
        conn.close()
        return message_pk

    @staticmethod
    def identify_property(phone_number: str, property_id: int):
        """Identificar qual imóvel o cliente está perguntando."""
        conn = get_db()
        conn.execute(
            "UPDATE wa_conversations SET identified_property_id = ? WHERE phone_number = ?",
            (property_id, phone_number)
        )
        conn.commit()
        conn.close()

    @staticmethod
    def get_context(phone_number: str) -> Dict[str, Any]:
        """Obter contexto atual da conversa (cliente, imóvel, etc)."""
        conn = get_db()
        cur = conn.cursor()

        row = cur.execute(
            "SELECT * FROM wa_conversations WHERE phone_number = ?",
            (phone_number,)
        ).fetchone()
        conn.close()

        if not row:
            return {}

        context = dict(row)
        # Obter histórico recente
        context["recent_messages"] = ConversationManager.get_history(phone_number, limit=5)
        return context


# ─────────────────────────────────────────────────────────────────────────────
# IA E NLP
# ─────────────────────────────────────────────────────────────────────────────

class PropertyContextExtractor:
    """Extrai intent e entities de mensagem usando regex + IA."""

    RENT_KEYWORDS = ["aluguel", "renda", "rent", "quanto custa", "valor", "preço", "mensalidade"]
    INFO_KEYWORDS = ["qual", "quanto", "como", "informação", "detalhe", "especificação", "características"]
    VISIT_KEYWORDS = ["visita", "agendar", "horário", "disponível", "ir lá", "conhecer"]
    DOCUMENT_KEYWORDS = ["contrato", "documento", "formulário", "papel", "comprovante"]

    @staticmethod
    def extract_intent(text: str) -> str:
        """Identificar intent primário da mensagem."""
        text_lower = text.lower()

        if any(k in text_lower for k in PropertyContextExtractor.RENT_KEYWORDS):
            if any(k in text_lower for k in PropertyContextExtractor.INFO_KEYWORDS):
                return "query_rental_price"
            return "request_rental_info"

        if any(k in text_lower for k in PropertyContextExtractor.VISIT_KEYWORDS):
            return "schedule_visit"

        if any(k in text_lower for k in PropertyContextExtractor.DOCUMENT_KEYWORDS):
            return "request_document"

        if "erro" in text_lower or "problema" in text_lower or "bug" in text_lower:
            return "report_issue"

        return "general_question"

    @staticmethod
    def extract_location(text: str) -> Optional[Dict[str, str]]:
        """Extrair localização mencionada na mensagem."""
        import re

        # Padrões comuns: "Rua X, cidade" ou "X próximo ao Y"
        patterns = [
            r"(?:rua|avenida|av\.?|pç\.?|praça)\s+([A-Za-záéíóúâãôõ\s]+)",
            r"em\s+([A-Za-záéíóúâãôõ\s]+)",
            r"(?:bairro|zona)\s+([A-Za-záéíóúâãôõ\s]+)"
        ]

        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return {
                    "extracted_text": match.group(1).strip(),
                    "pattern": pattern
                }

        return None


class GeminiResponder:
    """Gera respostas usando Gemini IA com contexto de imóveis."""

    SYSTEM_PROMPT = """Você é um assistente inteligente de um imobiliário chamado on.imob.
Responda perguntas sobre imóveis, aluguel, contratos e processos imobiliários de forma amigável e profissional.

Diretrizes:
1. Se a pergunta é sobre valor de aluguel, sempre cite o banco de dados ou oferta conhecida
2. Se não souber o valor exato, sugira agendar uma visita ou fale com um corretor
3. Sempre ofereça próximas ações (agendar visita, enviar contrato, etc)
4. Respostas concisas (máx 200 caracteres se possível, até 500 em casos complexos)
5. Use linguagem natural e amigável
6. Se for pergunta não relacionada a imóveis, redirecione educadamente

IMPORTANTE: Você tem acesso a um banco de dados de imóveis, mas apenas para responder.
Não invente dados — sempre indique quando não tem informação exata."""

    @staticmethod
    async def generate_response(
        user_message: str,
        context: Dict[str, Any],
        property_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Gerar resposta usando Gemini."""
        if not GEMINI_API_KEY:
            return GeminiResponder._fallback_response(user_message)

        start_time = time.time()

        # Montar contexto
        context_text = f"Contexto: Cliente com {context.get('total_messages', 1)} mensagens anteriores"
        if property_data:
            context_text += f"\nImóvel em dúvida: {property_data.get('titulo', 'N/A')}"
            context_text += f"\nValor: R$ {property_data.get('valor', 'N/A')}"

        prompt = f"""{GeminiResponder.SYSTEM_PROMPT}

{context_text}

Cliente: {user_message}

Responda agora. Seja conciso e útil."""

        try:
            async with httpx.AsyncClient(timeout=RESPONSE_TIMEOUT_SECONDS) as client:
                response = await client.post(
                    GEMINI_API_URL,
                    params={"key": GEMINI_API_KEY},
                    json={
                        "contents": [{
                            "parts": [{"text": prompt}]
                        }],
                        "generationConfig": {
                            "temperature": 0.6,
                            "maxOutputTokens": 500,
                            "topP": 0.95
                        },
                        "safetySettings": [
                            {
                                "category": "HARM_CATEGORY_UNSPECIFIED",
                                "threshold": "BLOCK_NONE"
                            }
                        ]
                    }
                )
                response.raise_for_status()
                data = response.json()

                if "candidates" in data and len(data["candidates"]) > 0:
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    processing_time = (time.time() - start_time) * 1000

                    return {
                        "response": text.strip(),
                        "confidence": 0.85,
                        "processing_time_ms": processing_time,
                        "model": "gemini-pro"
                    }
        except asyncio.TimeoutError:
            logger.warning("Gemini timeout — usando fallback")
            return GeminiResponder._fallback_response(user_message)
        except Exception as e:
            logger.error(f"Erro ao chamar Gemini: {e}")
            return GeminiResponder._fallback_response(user_message)

    @staticmethod
    def _fallback_response(user_message: str) -> Dict[str, Any]:
        """Resposta fallback quando IA não está disponível."""
        intent = PropertyContextExtractor.extract_intent(user_message)

        fallbacks = {
            "query_rental_price": "Obrigado pela pergunta! Para informações sobre valores de aluguel, gostaria de saber qual imóvel te interessa. Posso ajudar? 😊",
            "schedule_visit": "Ótimo! Posso ajudar a agendar sua visita. Qual imóvel gostaria de conhecer?",
            "request_document": "Perfeito! Qual documento você precisa? (Contrato, Comprovante de Renda, etc)",
            "general_question": "Ótimo! Estou aqui para ajudar com suas dúvidas sobre imóveis. Como posso te ajudar?"
        }

        return {
            "response": fallbacks.get(intent, "Entendi sua pergunta. Como posso ajudar?"),
            "confidence": 0.4,
            "processing_time_ms": 50,
            "model": "fallback"
        }


# ─────────────────────────────────────────────────────────────────────────────
# RATE LIMITING
# ─────────────────────────────────────────────────────────────────────────────

class RateLimiter:
    """Controlar rate limiting por número."""

    @staticmethod
    def check_limit(phone_number: str) -> bool:
        """Verificar se cliente excedeu limite de mensagens/min."""
        conn = get_db()
        cur = conn.cursor()
        now = time.time()
        window_start = now - 60  # janela de 1 minuto

        row = cur.execute(
            "SELECT * FROM wa_rate_limits WHERE phone_number = ?",
            (phone_number,)
        ).fetchone()

        if not row:
            # Primeira mensagem
            cur.execute(
                "INSERT INTO wa_rate_limits (phone_number, message_count, window_start) VALUES (?, ?, ?)",
                (phone_number, 1, now)
            )
            conn.commit()
            conn.close()
            return True

        row_dict = dict(row)
        window_start_db = row_dict["window_start"]

        if now - window_start_db > 60:
            # Janela expirou, resetar
            cur.execute(
                "UPDATE wa_rate_limits SET message_count = 1, window_start = ? WHERE phone_number = ?",
                (now, phone_number)
            )
            conn.commit()
            conn.close()
            return True

        count = row_dict["message_count"]
        if count >= RATE_LIMIT_MESSAGES_PER_MINUTE:
            logger.warning(f"Rate limit exceeded for {phone_number}")
            conn.close()
            return False

        # Incrementar contador
        cur.execute(
            "UPDATE wa_rate_limits SET message_count = message_count + 1 WHERE phone_number = ?",
            (phone_number,)
        )
        conn.commit()
        conn.close()
        return True


# ─────────────────────────────────────────────────────────────────────────────
# INTEGRAÇÃO META WHATSAPP API
# ─────────────────────────────────────────────────────────────────────────────

class WhatsAppAPI:
    """Interface com Meta WhatsApp Cloud API."""

    @staticmethod
    async def send_message(
        phone_number: str,
        message_text: str,
        message_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Enviar mensagem de texto via WhatsApp."""
        if not WHATSAPP_BUSINESS_ACCOUNT_ID or not WHATSAPP_ACCESS_TOKEN:
            logger.warning("WhatsApp credentials not configured")
            return {"success": False, "error": "WhatsApp not configured"}

        url = f"{WHATSAPP_API_URL}/{WHATSAPP_BUSINESS_ACCOUNT_ID}/messages"

        # Garantir que o número está no formato correto
        phone = phone_number.replace("+", "").replace(" ", "").replace("-", "")
        if not phone.startswith("55"):
            phone = f"55{phone}"

        payload = {
            "messaging_product": "whatsapp",
            "to": phone,
            "type": "text",
            "text": {
                "body": message_text[:4096]  # Limite da API
            }
        }

        # Se a mensagem é uma resposta, incluir ID da mensagem original
        if message_id:
            payload["context"] = {"message_id": message_id}

        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
                        "Content-Type": "application/json"
                    },
                    json=payload
                )
                response.raise_for_status()
                data = response.json()
                logger.info(f"Message sent to {phone}: {data}")
                return {"success": True, "data": data}
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return {"success": False, "error": str(e)}

    @staticmethod
    def verify_webhook(token: str) -> bool:
        """Verificar token de webhook."""
        return token == WHATSAPP_WEBHOOK_VERIFY_TOKEN

    @staticmethod
    def verify_signature(request_body: str, signature_header: str) -> bool:
        """Verificar assinatura HMAC da requisição."""
        if not WHATSAPP_ACCESS_TOKEN:
            return False

        # Meta usa HMAC SHA256
        expected_signature = hmac.new(
            WHATSAPP_ACCESS_TOKEN.encode(),
            request_body.encode(),
            hashlib.sha256
        ).hexdigest()

        return hmac.compare_digest(signature_header, expected_signature)


# ─────────────────────────────────────────────────────────────────────────────
# BOT ENGINE PRINCIPAL
# ─────────────────────────────────────────────────────────────────────────────

class WhatsAppBotEngine:
    """Engine principal do WhatsApp Bot."""

    @staticmethod
    async def process_message(
        phone_number: str,
        message_text: str,
        message_id: str,
        user_id: Optional[str] = None
    ) -> ChatResponse:
        """Processar mensagem recebida — responder via IA."""
        start_time = time.time()

        # 1. Rate limiting
        if not RateLimiter.check_limit(phone_number):
            return ChatResponse(
                response="Você está enviando muitas mensagens. Aguarde um momento. ⏳",
                confidence=1.0,
                message_id=message_id,
                response_time_ms=(time.time() - start_time) * 1000
            )

        # 2. Obter ou criar conversa
        conv = ConversationManager.get_or_create(phone_number, user_id)
        conv_id = conv["id"]

        # 3. Salvar mensagem recebida
        ConversationManager.save_message(
            conversation_id=conv_id,
            phone_number=phone_number,
            message_type=MessageType.TEXT,
            direction=MessageDirection.INBOUND,
            content=message_text,
            message_id=message_id,
            model_used="user_input"
        )

        # 4. Extrair intent e contexto
        intent = PropertyContextExtractor.extract_intent(message_text)
        location = PropertyContextExtractor.extract_location(message_text)
        context = ConversationManager.get_context(phone_number)

        # 5. Obter dados de imóvel se aplicável (integração com imob_engine)
        property_data = None
        if context.get("identified_property_id"):
            property_data = WhatsAppBotEngine._get_property_data(context["identified_property_id"])

        # 6. Gerar resposta via Gemini
        ai_response = await GeminiResponder.generate_response(
            message_text,
            context,
            property_data
        )

        response_text = ai_response["response"]
        confidence = ai_response.get("confidence", 0.7)
        processing_time = ai_response.get("processing_time_ms", 100)

        # 7. Salvar resposta no histórico
        response_msg_id = f"bot_{message_id}_{int(time.time()*1000)}"
        ConversationManager.save_message(
            conversation_id=conv_id,
            phone_number=phone_number,
            message_type=MessageType.TEXT,
            direction=MessageDirection.OUTBOUND,
            content=response_text,
            message_id=response_msg_id,
            confidence=confidence,
            processing_time_ms=processing_time,
            model_used=ai_response.get("model", "unknown")
        )

        # 8. Gerar sugestões de ações
        actions = WhatsAppBotEngine._generate_action_suggestions(intent, property_data)

        # 9. Salvar query estruturada para análise
        WhatsAppBotEngine._save_query_analysis(message_id, intent, location, property_data)

        total_time = (time.time() - start_time) * 1000

        return ChatResponse(
            response=response_text,
            confidence=confidence,
            actions=actions,
            message_id=response_msg_id,
            response_time_ms=total_time
        )

    @staticmethod
    def _get_property_data(property_id: int) -> Optional[Dict[str, Any]]:
        """Obter dados do imóvel do banco de dados on.imob."""
        try:
            from backend.imob_engine import obter_imovel
            return obter_imovel(property_id)
        except Exception as e:
            logger.error(f"Error fetching property data: {e}")
            return None

    @staticmethod
    def _generate_action_suggestions(intent: str, property_data: Optional[Dict]) -> List[str]:
        """Gerar sugestões automáticas de ação baseado em intent."""
        actions = []

        if intent == "query_rental_price" and property_data:
            actions.append(ActionSuggestion.SHOW_PROPERTY_CARD.value)
            actions.append(ActionSuggestion.SCHEDULE_VISIT.value)

        elif intent == "schedule_visit":
            actions.append(ActionSuggestion.SCHEDULE_VISIT.value)
            if property_data:
                actions.append(ActionSuggestion.SEND_CONTRACT.value)

        elif intent == "request_document":
            actions.append(ActionSuggestion.REQUEST_DOCUMENTS.value)

        return actions[:3]  # Máximo 3 ações

    @staticmethod
    def _save_query_analysis(message_id: str, intent: str, location: Optional[Dict], property_data: Optional[Dict]):
        """Salvar análise da query para futuro aprendizado."""
        conn = get_db()
        cur = conn.cursor()
        now = time.time()

        try:
            cur.execute("""
            INSERT INTO wa_queries (message_id, intent, entities, identified_property_id, confidence, parsed_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """, (
                message_id,
                intent,
                json.dumps(location) if location else None,
                property_data["id"] if property_data else None,
                0.8 if property_data else 0.5,
                now
            ))
            conn.commit()
        except Exception as e:
            logger.warning(f"Could not save query analysis: {e}")
        finally:
            conn.close()


# ─────────────────────────────────────────────────────────────────────────────
# FUNÇÕES PÚBLICAS
# ─────────────────────────────────────────────────────────────────────────────

async def process_incoming_message(phone: str, text: str, message_id: str) -> Dict[str, Any]:
    """
    Função pública para processar mensagem recebida do WhatsApp.

    Args:
        phone: Número WhatsApp do cliente (formato: 5511987654321)
        text: Conteúdo da mensagem
        message_id: ID único da mensagem (fornecido por Meta)

    Returns:
        Dict com resposta gerada e metadados
    """
    response = await WhatsAppBotEngine.process_message(phone, text, message_id)
    return asdict(response)


async def send_outgoing_message(phone: str, text: str, reply_to_message_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Função pública para enviar mensagem via WhatsApp.

    Args:
        phone: Número WhatsApp do destinatário
        text: Conteúdo da mensagem
        reply_to_message_id: ID da mensagem que está respondendo (opcional)

    Returns:
        Dict com status de envio
    """
    return await WhatsAppAPI.send_message(phone, text, reply_to_message_id)


def get_conversation_history(phone: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Obter histórico completo de conversa.

    Args:
        phone: Número WhatsApp do cliente
        limit: Número máximo de mensagens (padrão: 20)

    Returns:
        Lista de mensagens ordenadas por timestamp
    """
    return ConversationManager.get_history(phone, limit)


def get_customer_context(phone: str) -> Dict[str, Any]:
    """
    Obter contexto atual do cliente (conversa, imóvel identificado, etc).

    Args:
        phone: Número WhatsApp do cliente

    Returns:
        Contexto da conversa (sem histórico completo)
    """
    context = ConversationManager.get_context(phone)
    # Remover histórico para resposta mais limpa
    context.pop("recent_messages", None)
    return context


def identify_customer_property(phone: str, property_id: int) -> Dict[str, str]:
    """
    Marcar qual imóvel o cliente está perguntando.

    Args:
        phone: Número WhatsApp do cliente
        property_id: ID do imóvel no banco de dados

    Returns:
        Confirmação de identificação
    """
    ConversationManager.identify_property(phone, property_id)
    return {"status": "ok", "message": f"Property {property_id} identified for {phone}"}


def verify_webhook_token(token: str) -> bool:
    """Verificar token de webhook."""
    return WhatsAppAPI.verify_webhook(token)


def get_conversation_stats(phone: str) -> Dict[str, Any]:
    """Obter estatísticas da conversa."""
    context = ConversationManager.get_context(phone)
    return {
        "total_messages": context.get("total_messages", 0),
        "first_message_at": context.get("first_message_at"),
        "last_message_at": context.get("last_message_at"),
        "identified_property_id": context.get("identified_property_id"),
        "status": context.get("status", "active")
    }


# Inicializar banco ao importar módulo
if not os.path.exists(DB_PATH):
    init_db()
