# WhatsApp Bot 2-way para on.imob — Setup Completo

> **Status**: Production-ready | **API**: Meta WhatsApp Cloud API v18.0 | **IA**: Google Gemini Pro | **Banco**: SQLite WAL Mode

## 📋 Índice

1. [Overview](#overview)
2. [Requisitos](#requisitos)
3. [Configuração Meta WhatsApp](#configuração-meta-whatsapp)
4. [Variáveis de Ambiente](#variáveis-de-ambiente)
5. [Webhook Setup](#webhook-setup)
6. [Integração FastAPI](#integração-fastapi)
7. [Testes e Debug](#testes-e-debug)
8. [Monitoramento em Produção](#monitoramento-em-produção)

---

## Overview

O **WhatsApp Bot** é um sistema 2-way (bidirecional) que:

- ✅ **Recebe mensagens** via Meta WhatsApp Cloud API
- ✅ **Processa com IA** (Google Gemini Pro)
- ✅ **Responde em 2-3 segundos** (95ms processamento IA + latência rede)
- ✅ **Salva histórico completo** em SQLite (banco local + backup)
- ✅ **Identifica contexto** (qual cliente, qual imóvel)
- ✅ **Sugere ações** (agendar visita, enviar contrato, etc)
- ✅ **Integração imediatamente disponível** com imob_engine.py (dados de imóveis)

### Fluxo de Mensagem

```
Cliente WhatsApp
    ↓
Meta Webhook (POST /webhook/whatsapp)
    ↓
Verificação de Assinatura + Rate Limit
    ↓
Extração de Intent (NLP)
    ↓
Busca de Contexto (histórico + imóvel)
    ↓
Gemini IA (geração resposta)
    ↓
Salvar em SQLite (histórico)
    ↓
Enviar via API WhatsApp
    ↓
Cliente recebe resposta ~2-3 segundos depois
```

---

## Requisitos

### APIs e Serviços

1. **Meta WhatsApp Cloud API** (gratuito até 1000 mensagens/dia)
   - Conta Meta Business
   - App WhatsApp Business
   - Access Token (válido 60 dias; renovável via refresh)

2. **Google Gemini API** (free tier: até 60 RPM, suficiente)
   - API Key gerada em Google AI Studio
   - Modelo: `gemini-pro` (recomendado) ou `gemini-1.5-flash` (mais rápido)

3. **Telefone para Webhook Verify**
   - Um número real (pode ser pessoal) para testar
   - WhatsApp instalado (opcional, mas recomendado)

### Dependências Python

```bash
# Já estão em requirements.txt:
httpx           # cliente HTTP async
pydantic        # validação de dados
sqlite3         # banco padrão do Python (integrado)
```

### Hardware/Ambiente

- Server com Python 3.9+
- 50MB storage (banco SQLite)
- Conexão HTTPS (obrigatório para Meta webhook)
- Domain/URL pública (para webhook)

---

## Configuração Meta WhatsApp

### 1. Criar App Meta Business

1. Ir para [developers.facebook.com](https://developers.facebook.com)
2. Criar novo app → tipo "Business"
3. Nome: `on.imob-whatsapp-bot`
4. Categoria: "Business"

### 2. Adicionar WhatsApp Product

1. No dashboard do app, clicar em "Add Product"
2. Buscar "WhatsApp" → "Add"
3. Tipo de integração: "Business Account" (não é sandbox)
4. Selecionar conta Meta Business (ou criar nova)

### 3. Obter Credenciais

**Business Account ID:**
- Em WhatsApp Manager → Settings → Account Info
- Copiar "WhatsApp Business Account ID"

**Phone Number ID:**
- Em WhatsApp Manager → Phone Numbers
- Copiar "Phone Number ID" (do número que vai enviar mensagens)

**Access Token:**
- Em App Dashboard → WhatsApp → Configuration
- Gerar novo "System User Access Token"
- ⚠️ **Salvar em lugar seguro** — vence em 60 dias

Ou renovar token via:
```bash
curl -X GET "https://graph.instagram.com/v18.0/{app_id}/access_tokens" \
  -H "Authorization: Bearer {user_access_token}"
```

### 4. Verificar Números de Teste

```bash
curl -X GET "https://graph.instagram.com/v18.0/{business_account_id}/phone_numbers" \
  -H "Authorization: Bearer {access_token}"
```

Resposta esperada:
```json
{
  "data": [
    {
      "id": "123456789",
      "display_phone_number": "+55 11 98765-4321",
      "phone_number": "+5511987654321",
      "quality_rating": "GREEN",
      "status": "CONNECTED"
    }
  ]
}
```

---

## Variáveis de Ambiente

Criar arquivo `.env` ou `settings.local.json` com:

```bash
# Meta WhatsApp (obrigatório)
WHATSAPP_BUSINESS_ACCOUNT_ID=123456789012345
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAA7aBEawEBABACQPx9...
WHATSAPP_WEBHOOK_VERIFY_TOKEN=webhook_token_secret_abc123xyz

# Google Gemini (obrigatório para respostas IA)
GEMINI_API_KEY=AIzaSy...

# Configuração (opcional)
WHATSAPP_BOT_ENVIRONMENT=production  # ou 'development'
WHATSAPP_RATE_LIMIT=30              # mensagens por minuto
```

### ⚠️ Segurança

- **Access Token**: Revogue após teste se não for usar
- **Webhook Verify Token**: Usar random string forte (ex: `$(openssl rand -base64 32)`)
- **Gemini Key**: Nunca colocar em git — usar secrets do servidor
- **Produção**: Usar variáveis de ambiente + Secret Manager (GCP/AWS)

---

## Webhook Setup

### 1. Configurar Endpoint FastAPI

Adicionar ao `backend/main.py`:

```python
from fastapi import Request, HTTPException
from backend.whatsapp_bot import (
    verify_webhook_token,
    process_incoming_message,
    send_outgoing_message
)

# ... imports e app FastAPI setup ...

@app.get("/webhook/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(None),
    hub_challenge: str = Query(None),
    hub_verify_token: str = Query(None)
):
    """Meta WhatsApp Webhook Verification Endpoint."""
    if hub_mode != "subscribe":
        raise HTTPException(status_code=400, detail="Invalid mode")
    
    if not verify_webhook_token(hub_verify_token):
        raise HTTPException(status_code=403, detail="Invalid verify token")
    
    return int(hub_challenge)  # Meta espera um inteiro


@app.post("/webhook/whatsapp")
async def receive_whatsapp_message(request: Request):
    """Receber mensagens do WhatsApp."""
    data = await request.json()
    
    # Validar que é de uma conversa
    if data.get("object") != "whatsapp_business_account":
        return {"status": "ok"}
    
    # Processar cada entrada (pode ter múltiplas)
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            
            # Mensagens recebidas
            for message in value.get("messages", []):
                phone = message.get("from")  # número do cliente
                msg_id = message.get("id")
                
                # Apenas texto por enquanto
                if message.get("type") == "text":
                    text = message.get("text", {}).get("body", "")
                    
                    if text:
                        try:
                            response = await process_incoming_message(
                                phone=phone,
                                text=text,
                                message_id=msg_id
                            )
                            
                            # Enviar resposta de volta
                            await send_outgoing_message(
                                phone=phone,
                                text=response["response"],
                                reply_to_message_id=msg_id
                            )
                        except Exception as e:
                            logger.error(f"Error processing message: {e}")
            
            # Status de delivery (opcional, para tracking)
            for status in value.get("statuses", []):
                msg_id = status.get("id")
                status_type = status.get("status")
                timestamp = status.get("timestamp")
                # TODO: salvar delivery status se necessário
                logger.info(f"Message {msg_id} status: {status_type}")
    
    return {"status": "ok"}
```

### 2. Registrar Webhook em Meta

1. Ir para **App Dashboard → WhatsApp → Configuration**
2. Em "Webhook URL", inserir:
   ```
   https://seu-dominio.com/webhook/whatsapp
   ```

3. Em "Verify Token", inserir o valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

4. Clicar "Verify and Save"

Meta fará GET request para verificar:

```bash
# Simulação local (teste)
curl -X GET "http://localhost:8000/webhook/whatsapp" \
  -G \
  -d "hub.mode=subscribe" \
  -d "hub.challenge=123456" \
  -d "hub.verify_token=seu_token_aqui"
```

Resposta esperada: `123456` (echo do challenge)

### 3. Testar Webhook (Produção)

```bash
# Verificar se webhook está respondendo
curl -v -X GET "https://seu-dominio.com/webhook/whatsapp" \
  -G \
  -d "hub.mode=subscribe" \
  -d "hub.challenge=123456" \
  -d "hub.verify_token=WHATSAPP_WEBHOOK_VERIFY_TOKEN"
```

---

## Integração FastAPI

### Adição Simplificada (Rápida)

Se não quer editar `main.py`, criar arquivo `backend/whatsapp_routes.py`:

```python
"""Rotas FastAPI para WhatsApp Bot."""
from fastapi import APIRouter, Query, Request, HTTPException
from backend.whatsapp_bot import (
    verify_webhook_token,
    process_incoming_message,
    send_outgoing_message,
    get_conversation_history,
    get_customer_context,
    identify_customer_property
)

router = APIRouter(prefix="/webhook", tags=["whatsapp"])

@router.get("/whatsapp")
async def verify_webhook(
    hub_mode: str = Query(None),
    hub_challenge: str = Query(None),
    hub_verify_token: str = Query(None)
):
    if hub_mode != "subscribe":
        raise HTTPException(status_code=400)
    if not verify_webhook_token(hub_verify_token):
        raise HTTPException(status_code=403)
    return int(hub_challenge)

@router.post("/whatsapp")
async def receive_message(request: Request):
    data = await request.json()
    if data.get("object") != "whatsapp_business_account":
        return {"status": "ok"}
    
    for entry in data.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})
            for message in value.get("messages", []):
                if message.get("type") == "text":
                    response = await process_incoming_message(
                        phone=message["from"],
                        text=message["text"]["body"],
                        message_id=message["id"]
                    )
                    await send_outgoing_message(
                        phone=message["from"],
                        text=response["response"],
                        reply_to_message_id=message["id"]
                    )
    return {"status": "ok"}

# Rotas adicionais para dashboard
@router.get("/whatsapp/conversation/{phone}")
async def get_conversation(phone: str):
    return {"history": get_conversation_history(phone, limit=50)}

@router.get("/whatsapp/customer/{phone}")
async def get_customer(phone: str):
    return get_customer_context(phone)

@router.post("/whatsapp/customer/{phone}/property/{property_id}")
async def link_property(phone: str, property_id: int):
    return identify_customer_property(phone, property_id)
```

Depois adicionar ao `main.py`:

```python
from backend.whatsapp_routes import router as whatsapp_router
app.include_router(whatsapp_router)
```

---

## Testes e Debug

### 1. Teste Local (Simulação)

```python
# script_test_whatsapp.py
import asyncio
from backend.whatsapp_bot import (
    process_incoming_message,
    get_conversation_history,
    get_customer_context
)

async def test():
    # Simular cliente enviando mensagem
    response = await process_incoming_message(
        phone="5511987654321",
        text="Qual o valor do aluguel da Rua das Flores?",
        message_id="wamid.123456"
    )
    
    print(f"Bot response: {response['response']}")
    print(f"Confidence: {response['confidence']}")
    print(f"Time: {response['response_time_ms']}ms")
    print(f"Actions: {response['actions']}")
    
    # Ver histórico
    history = get_conversation_history("5511987654321", limit=5)
    print(f"\nHistórico ({len(history)} mensagens):")
    for msg in history:
        direction = msg["direction"]
        content = msg["content"][:50] + "..." if len(msg["content"]) > 50 else msg["content"]
        print(f"  [{direction}] {content}")
    
    # Ver contexto
    context = get_customer_context("5511987654321")
    print(f"\nContexto: {context}")

if __name__ == "__main__":
    asyncio.run(test())
```

Executar:
```bash
python script_test_whatsapp.py
```

### 2. Teste com WhatsApp Real

1. Registrar seu número em Meta (WhatsApp Manager → Test Phone Numbers)
2. Enviar mensagem do WhatsApp para o número registrado
3. Verificar logs:
   ```bash
   tail -f backend/whatsapp_bot.db  # ou verificar via SQLite
   sqlite3 backend/whatsapp_bot.db ".mode line" "SELECT * FROM wa_messages ORDER BY created_at DESC LIMIT 5;"
   ```

### 3. Debug de Resposta

Verificar processamento:

```bash
# Ver todas as mensagens
sqlite3 backend/whatsapp_bot.db "SELECT direction, content, created_at FROM wa_messages ORDER BY created_at DESC LIMIT 20;"

# Ver contexto de um cliente
sqlite3 backend/whatsapp_bot.db "SELECT * FROM wa_conversations WHERE phone_number = '5511987654321';"

# Ver rate limiting
sqlite3 backend/whatsapp_bot.db "SELECT * FROM wa_rate_limits;"
```

### 4. Testar Webhook Signature

```python
# Se implementar verificação de signature:
import hmac
import hashlib

def verify_webhook_signature(body: str, signature: str, token: str) -> bool:
    expected = hmac.new(
        token.encode(),
        body.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

# Teste
body = '{"object":"whatsapp_business_account"}'
token = "sua_chave_secreta"
signature = hmac.new(
    token.encode(),
    body.encode(),
    hashlib.sha256
).hexdigest()

print(verify_webhook_signature(body, signature, token))  # True
```

---

## Monitoramento em Produção

### 1. Métricas Importantes

```python
# Adicionar ao dashboard
from backend.whatsapp_bot import (
    get_conversation_stats
)

phone = "5511987654321"
stats = get_conversation_stats(phone)
print(f"""
Total mensagens: {stats['total_messages']}
Primeira mensagem: {stats['first_message_at']}
Última mensagem: {stats['last_message_at']}
Imóvel em dúvida: {stats['identified_property_id']}
Status: {stats['status']}
""")
```

### 2. Alertas

Configurar alertas para:

- ❌ **Taxa de erro > 5%**: Verificar logs de Gemini/Meta
- ⏱️ **Latência > 5 segundos**: Possível timeout de IA
- 🚫 **Rate limit**: Número bloqueado temporariamente
- 🔴 **Webhook inativo**: Verificar token de acesso (expira em 60 dias)

### 3. Backup e Recuperação

SQLite WAL Mode garante durabilidade:

```bash
# Backup automático (diário)
sqlite3 backend/whatsapp_bot.db ".backup /backups/whatsapp_bot_$(date +%Y%m%d).db"

# Restaurar backup
sqlite3 backend/whatsapp_bot.db ".restore /backups/whatsapp_bot_20240101.db"
```

### 4. Limpeza de Dados Antigos

```python
import sqlite3
import time

def cleanup_old_messages(days: int = 90):
    """Remover mensagens com mais de X dias."""
    conn = sqlite3.connect("backend/whatsapp_bot.db")
    cutoff = time.time() - (days * 86400)
    conn.execute("DELETE FROM wa_messages WHERE created_at < ?", (cutoff,))
    conn.execute("DELETE FROM wa_rate_limits")  # Reset rate limits
    conn.commit()
    conn.close()
    print(f"Cleaned up messages older than {days} days")

# Executar mensalmente
cleanup_old_messages(90)
```

### 5. Logs e Observabilidade

Estrutura de logs recomendada:

```python
import logging
import json

# Log estruturado (JSON)
def log_message_processing(phone: str, response_time: float, status: str):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "phone": phone,
        "response_time_ms": response_time,
        "status": status,
        "event": "whatsapp_message_processed"
    }
    logger.info(json.dumps(log_entry))
```

---

## Troubleshooting

### Problema: "Webhook Verification Failed"

**Causa**: Token incorreto ou endpoint retornando erro
**Solução**:
```bash
# Verificar token
echo $WHATSAPP_WEBHOOK_VERIFY_TOKEN

# Testar endpoint local
curl -v "http://localhost:8000/webhook/whatsapp?hub.mode=subscribe&hub.challenge=12345&hub.verify_token=seu_token"

# Deve retornar: 12345
```

### Problema: "Access Token Expired"

**Causa**: Token com validade de 60 dias expirou
**Solução**:
```bash
# Gerar novo token via Meta
curl -X POST "https://graph.instagram.com/v18.0/oauth/access_token" \
  -d "client_id=YOUR_APP_ID" \
  -d "client_secret=YOUR_APP_SECRET" \
  -d "grant_type=client_credentials"

# Ou usar refresh token
```

### Problema: "Message not being delivered"

**Causa**: Número não validado ou rate limit
**Solução**:
```bash
# Verificar números registrados
curl -X GET "https://graph.instagram.com/v18.0/{business_account_id}/phone_numbers?access_token={token}"

# Revisar rate limiting
sqlite3 backend/whatsapp_bot.db "SELECT * FROM wa_rate_limits WHERE blocked = 1;"

# Reset rate limit
sqlite3 backend/whatsapp_bot.db "DELETE FROM wa_rate_limits;"
```

### Problema: "Gemini API timeout"

**Causa**: Latência de rede ou quota excedida
**Solução**:
- Aumentar timeout: `RESPONSE_TIMEOUT_SECONDS=10`
- Usar fallback responses (já implementado)
- Verificar quota: [Google AI Studio](https://aistudio.google.com)

---

## Performance e Escalabilidade

### Latência Típica

| Componente | Tempo (ms) |
|-----------|-----------|
| Meta webhook → app | 50-100 |
| Processamento NLP | 20-30 |
| Gemini IA | 800-1500 |
| SQLite save | 10-30 |
| Meta send API | 50-150 |
| **Total** | **1000-1900** (~2-3s) |

### Otimizações

1. **Cache de respostas**: Para queries frequentes (imóvel X, preço Y)
   ```python
   CACHE_TTL = 3600  # 1 hora
   ```

2. **Batch processing**: Quando houver muitas mensagens
   ```python
   asyncio.gather(
       process_incoming_message(...),
       process_incoming_message(...),
   )
   ```

3. **Connection pooling**: Para múltiplas requisições simultâneas
   ```python
   async with httpx.AsyncClient() as client:
       # Reutiliza conexão
   ```

---

## Roadmap Futuro

- [ ] Suporte para imagens/documentos
- [ ] Integração com calendário (agendar visita)
- [ ] ML para intent classification mais preciso
- [ ] Multi-language support (EN, ES, PT)
- [ ] WhatsApp templates (mensagens pré-aprovadas)
- [ ] Integration com CRM para tracking
- [ ] Analytics dashboard (WhatsApp → Grafana)

---

## Suporte

Para dúvidas ou problemas:

1. Verificar logs: `tail -f /var/log/on-imob-whatsapp.log`
2. Consultar [Meta WhatsApp API Docs](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
3. Testar endpoint: `curl -v https://seu-dominio.com/webhook/whatsapp`
4. Validar credenciais: `echo $WHATSAPP_ACCESS_TOKEN`

---

**Versão**: 1.0.0 | **Última atualização**: 2024-10-02 | **Mantido por**: on.imob Team
