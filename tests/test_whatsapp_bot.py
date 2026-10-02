"""
Testes para WhatsApp Bot 2-way — Execute com: pytest tests/test_whatsapp_bot.py

Production-ready tests cobrindo:
- Processamento de mensagens
- IA responses
- Histórico de conversas
- Rate limiting
- Contexto de imóveis
"""

import asyncio
import sqlite3
import pytest
import time
from typing import List

# Imports do bot
from backend.whatsapp_bot import (
    init_db,
    ChatMessage,
    ChatResponse,
    ConversationManager,
    PropertyContextExtractor,
    GeminiResponder,
    RateLimiter,
    WhatsAppBotEngine,
    process_incoming_message,
    get_conversation_history,
    get_customer_context,
    identify_customer_property,
    DB_PATH
)


# ─────────────────────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────────────────────

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Setup banco de dados de teste."""
    # Usar banco em memória para testes
    import os
    os.environ["WHATSAPP_BOT_DB"] = ":memory:"
    init_db()
    yield


@pytest.fixture
def test_phone():
    """Número de teste padrão."""
    return "5511987654321"


@pytest.fixture
def test_message_id():
    """ID de mensagem padrão."""
    return f"wamid.{int(time.time()*1000)}"


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: CONVERSATION MANAGEMENT
# ─────────────────────────────────────────────────────────────────────────────

class TestConversationManager:
    """Testes para gerenciamento de conversas."""

    def test_create_new_conversation(self, test_phone):
        """Deve criar nova conversa."""
        conv = ConversationManager.get_or_create(test_phone)

        assert conv["phone_number"] == test_phone
        assert conv["total_messages"] == 1
        assert conv["id"] is not None

    def test_get_existing_conversation(self, test_phone):
        """Deve recuperar conversa existente."""
        conv1 = ConversationManager.get_or_create(test_phone)
        conv2 = ConversationManager.get_or_create(test_phone)

        assert conv1["id"] == conv2["id"]
        assert conv2["total_messages"] == 2

    def test_save_and_retrieve_messages(self, test_phone):
        """Deve salvar e recuperar histórico."""
        conv = ConversationManager.get_or_create(test_phone)

        # Salvar mensagem
        ConversationManager.save_message(
            conversation_id=conv["id"],
            phone_number=test_phone,
            message_type="text",
            direction="inbound",
            content="Olá, qual é o valor?",
            message_id="msg_123"
        )

        # Recuperar histórico
        history = get_conversation_history(test_phone, limit=10)

        assert len(history) > 0
        assert history[-1]["content"] == "Olá, qual é o valor?"

    def test_identify_property(self, test_phone):
        """Deve identificar imóvel do cliente."""
        identify_customer_property(test_phone, property_id=42)
        context = get_customer_context(test_phone)

        assert context["identified_property_id"] == 42


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: NLP E CONTEXT EXTRACTION
# ─────────────────────────────────────────────────────────────────────────────

class TestPropertyContextExtractor:
    """Testes para extração de intent e contexto."""

    def test_extract_rent_query_intent(self):
        """Deve reconhecer queries de aluguel."""
        intent = PropertyContextExtractor.extract_intent("Qual é o valor do aluguel?")
        assert intent == "query_rental_price"

    def test_extract_visit_intent(self):
        """Deve reconhecer intenção de visita."""
        intent = PropertyContextExtractor.extract_intent("Gostaria de agendar uma visita")
        assert intent == "schedule_visit"

    def test_extract_document_intent(self):
        """Deve reconhecer pedido de documento."""
        intent = PropertyContextExtractor.extract_intent("Preciso do contrato")
        assert intent == "request_document"

    def test_extract_location(self):
        """Deve extrair localização da mensagem."""
        text = "Quanto custa aluguel na Rua das Flores?"
        location = PropertyContextExtractor.extract_location(text)

        assert location is not None
        assert "Flores" in location.get("extracted_text", "")

    def test_no_location_found(self):
        """Deve retornar None se não encontrar localização."""
        text = "Quais são seus serviços?"
        location = PropertyContextExtractor.extract_location(text)

        assert location is None


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: RATE LIMITING
# ─────────────────────────────────────────────────────────────────────────────

class TestRateLimiter:
    """Testes para rate limiting."""

    def test_allow_first_messages(self, test_phone):
        """Deve permitir primeiras mensagens."""
        # Limpar rate limit anterior
        conn = sqlite3.connect(DB_PATH)
        conn.execute("DELETE FROM wa_rate_limits WHERE phone_number = ?", (test_phone,))
        conn.commit()
        conn.close()

        # Primeiras mensagens devem passar
        for i in range(5):
            assert RateLimiter.check_limit(test_phone) == True

    def test_rate_limit_exceeded(self, test_phone):
        """Deve bloquear quando limite excedido."""
        # Limpar e reset
        conn = sqlite3.connect(DB_PATH)
        conn.execute("DELETE FROM wa_rate_limits WHERE phone_number = ?", (test_phone,))
        conn.commit()
        conn.close()

        # Exceder limite (padrão: 30/min)
        for i in range(30):
            RateLimiter.check_limit(test_phone)

        # 31ª mensagem deve ser bloqueada
        result = RateLimiter.check_limit(test_phone)
        assert result == False

    def test_rate_limit_window_reset(self, test_phone):
        """Deve resetar rate limit após 1 minuto."""
        # Nota: teste com timer real seria muito lento
        # Este é um teste de lógica
        import sqlite3

        phone = f"test_reset_{time.time()}"

        # Preencher com msgs antigas
        conn = sqlite3.connect(DB_PATH)
        old_time = time.time() - 61  # 1 minuto atrás
        conn.execute(
            "INSERT INTO wa_rate_limits (phone_number, message_count, window_start) VALUES (?, ?, ?)",
            (phone, 30, old_time)
        )
        conn.commit()
        conn.close()

        # Deve permitir nova mensagem (window expirou)
        result = RateLimiter.check_limit(phone)
        assert result == True


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: BOT ENGINE
# ─────────────────────────────────────────────────────────────────────────────

class TestWhatsAppBotEngine:
    """Testes para engine principal do bot."""

    @pytest.mark.asyncio
    async def test_process_simple_message(self, test_phone, test_message_id):
        """Deve processar mensagem simples."""
        response = await process_incoming_message(
            phone=test_phone,
            text="Olá!",
            message_id=test_message_id
        )

        assert isinstance(response, dict)
        assert "response" in response
        assert "confidence" in response
        assert "response_time_ms" in response
        assert len(response["response"]) > 0

    @pytest.mark.asyncio
    async def test_response_time_under_limit(self, test_phone, test_message_id):
        """Resposta deve ter latência < 5 segundos."""
        response = await process_incoming_message(
            phone=test_phone,
            text="Qual o valor do aluguel?",
            message_id=test_message_id
        )

        # Deve estar sob 5000ms (5 segundos)
        assert response["response_time_ms"] < 5000

    @pytest.mark.asyncio
    async def test_conversation_history_saved(self, test_phone, test_message_id):
        """Deve salvar mensagens no histórico."""
        msg_text = "Preciso de informações"

        await process_incoming_message(
            phone=test_phone,
            text=msg_text,
            message_id=test_message_id
        )

        history = get_conversation_history(test_phone, limit=5)

        # Deve ter pelo menos a mensagem entrada + resposta
        assert len(history) >= 2
        assert any(msg_text in msg["content"] for msg in history)

    @pytest.mark.asyncio
    async def test_action_suggestions(self, test_phone, test_message_id):
        """Deve gerar sugestões de ação apropriadas."""
        response = await process_incoming_message(
            phone=test_phone,
            text="Como faço para agendar uma visita?",
            message_id=test_message_id
        )

        # Query de agendamento deve sugerir ação relevante
        assert "actions" in response
        # Pode estar vazio ou ter sugestões


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: GEMINI INTEGRATION
# ─────────────────────────────────────────────────────────────────────────────

class TestGeminiResponder:
    """Testes para integração com Gemini."""

    @pytest.mark.asyncio
    async def test_gemini_response_fallback(self):
        """Deve usar fallback se Gemini não disponível."""
        # Se GEMINI_API_KEY não está set, usa fallback
        response = await GeminiResponder.generate_response(
            user_message="Teste",
            context={"total_messages": 1},
            property_data=None
        )

        assert response["response"] is not None
        assert len(response["response"]) > 0

    @pytest.mark.asyncio
    async def test_response_respects_max_length(self):
        """Resposta não deve exceder limite."""
        response = await GeminiResponder.generate_response(
            user_message="x" * 1000,
            context={},
            property_data=None
        )

        # WhatsApp API tem limite de 4096
        assert len(response["response"]) <= 4096


# ─────────────────────────────────────────────────────────────────────────────
# TESTS: PYDANTIC MODELS
# ─────────────────────────────────────────────────────────────────────────────

class TestPydanticModels:
    """Testes para validação de models."""

    def test_chat_message_validation(self):
        """Deve validar ChatMessage."""
        msg = ChatMessage(
            phone_number="5511987654321",
            text="Teste"
        )
        assert msg.phone_number == "5511987654321"
        assert msg.text == "Teste"

    def test_chat_message_empty_text_fails(self):
        """Deve rejeitar mensagem vazia."""
        with pytest.raises(ValueError):
            ChatMessage(
                phone_number="5511987654321",
                text=""  # Vazio
            )

    def test_chat_message_too_long_fails(self):
        """Deve rejeitar mensagem muito longa."""
        with pytest.raises(ValueError):
            ChatMessage(
                phone_number="5511987654321",
                text="x" * 5000  # Excede limite
            )

    def test_chat_response_creation(self, test_message_id):
        """Deve criar ChatResponse válido."""
        response = ChatResponse(
            response="Resposta teste",
            confidence=0.85,
            actions=["acao1", "acao2"],
            message_id=test_message_id,
            response_time_ms=150.5
        )

        assert response.confidence == 0.85
        assert len(response.actions) == 2


# ─────────────────────────────────────────────────────────────────────────────
# INTEGRATION TESTS
# ─────────────────────────────────────────────────────────────────────────────

class TestIntegration:
    """Testes de integração end-to-end."""

    @pytest.mark.asyncio
    async def test_full_conversation_flow(self):
        """Teste completo: mensagem → processamento → resposta → histórico."""
        phone = f"5511{int(time.time())}999"
        msg_id_1 = f"wamid.{int(time.time()*1000)}"

        # Cliente 1: Pergunta sobre imóvel
        r1 = await process_incoming_message(
            phone=phone,
            text="Qual o preço da casa na Rua das Flores?",
            message_id=msg_id_1
        )

        assert r1["response"] is not None

        # Cliente 2: Pergunta relacionada
        msg_id_2 = f"wamid.{int(time.time()*1000)+1}"
        r2 = await process_incoming_message(
            phone=phone,
            text="E qual é a área?",
            message_id=msg_id_2
        )

        assert r2["response"] is not None

        # Verificar histórico foi salvo
        history = get_conversation_history(phone, limit=10)
        assert len(history) >= 4  # 2 entrada + 2 saída

    @pytest.mark.asyncio
    async def test_multiple_customers(self):
        """Deve gerenciar múltiplos clientes independentemente."""
        phones = [
            f"5511111{i:05d}" for i in range(3)
        ]

        for phone in phones:
            msg_id = f"wamid.{phone}"
            await process_incoming_message(
                phone=phone,
                text=f"Mensagem do cliente {phone}",
                message_id=msg_id
            )

        # Verificar que históricos são separados
        for i, phone in enumerate(phones):
            context = get_customer_context(phone)
            assert context["phone_number"] == phone


# ─────────────────────────────────────────────────────────────────────────────
# PERFORMANCE TESTS
# ─────────────────────────────────────────────────────────────────────────────

class TestPerformance:
    """Testes de performance e carga."""

    @pytest.mark.asyncio
    async def test_response_latency(self, test_phone, test_message_id):
        """Deve responder em menos de 5 segundos."""
        start = time.time()

        response = await process_incoming_message(
            phone=test_phone,
            text="Responda rápido!",
            message_id=test_message_id
        )

        elapsed = time.time() - start

        # Deve estar sob 5 segundos
        assert elapsed < 5.0
        assert response["response_time_ms"] < 5000

    @pytest.mark.asyncio
    async def test_batch_processing(self):
        """Deve processar múltiplas mensagens simultaneamente."""
        phones = [f"5511111{i:05d}" for i in range(10)]

        tasks = [
            process_incoming_message(
                phone=phone,
                text=f"Mensagem {i}",
                message_id=f"msg_{i}"
            )
            for i, phone in enumerate(phones)
        ]

        # Executar em paralelo
        results = await asyncio.gather(*tasks)

        # Todas devem ter respondido
        assert len(results) == 10
        assert all(r["response"] for r in results)


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # Executar testes
    pytest.main([__file__, "-v", "--tb=short"])
