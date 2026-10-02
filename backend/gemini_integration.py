"""Integração Gemini API para IA — cartas, comunicados, dúvidas de funcionários."""

import os
import json
from typing import Dict, Any, Optional
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent"

MODELOS_CARTA = {
    "cobranca_gentil": """Prezado(a) {nome_inquilino},

Espero que você esteja bem! Observei que a parcela de aluguel referente a {mes_atraso} ainda não foi recebida.

Entendo que às vezes surgem imprevistos, mas gostaria de lembrá-lo(a) que o vencimento era {data_vencimento}.

Para sua conveniência, segue a chave PIX para pagamento imediato:
{chave_pix}

Qualquer dúvida ou dificuldade, por favor não hesite em entrar em contato comigo pelo WhatsApp.

Agradecido(a) antecipadamente!
Atenciosamente,
{nome_proprietario}""",

    "aviso_protesto": """Prezado(a) {nome_inquilino},

Por este meio, informo que o imóvel situado em {endereco_imovel} encontra-se com {dias_atraso} dias de atraso no pagamento do aluguel.

Conforme disposto no contrato assinado em {data_contrato}, a falta de pagamento nos prazos estabelecidos pode resultar em:
- Notificação extrajudicial
- Cobrança judicial
- Protesto em cartório

Solicito regularização imediata do débito no valor de R$ {valor_atraso}.

Chave PIX para pagamento: {chave_pix}

Atenciosamente,
{nome_proprietario}""",

    "encerramento_contrato": """Prezado(a) {nome_inquilino},

Por este meio, formalizo a rescisão do contrato de locação referente ao imóvel situado em {endereco_imovel}, com término em {data_encerramento}.

Conforme acordado, solicitamos:
1. Devolução das chaves
2. Estado do imóvel conforme entregue
3. Pagamento de eventuais débitos pendentes

A vistoria será realizada em {data_vistoria} às {hora_vistoria}.

Agradecemos pela oportunidade de trabalhar com você.

Atenciosamente,
{nome_proprietario}"""
}

async def gerar_texto_ia(prompt: str, context: Optional[Dict[str, Any]] = None, modelo: str = "cobranca_gentil") -> Optional[str]:
    """Gera texto via Gemini — cartas, comunicados, respostas."""
    if not GEMINI_API_KEY:
        return None

    # Se context foi fornecido, usar template
    if context and modelo in MODELOS_CARTA:
        template = MODELOS_CARTA[modelo]
        try:
            return template.format(**context)
        except KeyError as e:
            print(f"Chave faltando no template: {e}")
            return None

    # Senão, usar Gemini para gerar
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                GEMINI_API_URL,
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 500
                    }
                }
            )
            response.raise_for_status()
            data = response.json()

            # Extrair texto da resposta
            if "candidates" in data and len(data["candidates"]) > 0:
                return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        print(f"Erro ao chamar Gemini: {e}")

    return None

async def responder_duvida_funcionario(pergunta: str) -> Optional[str]:
    """Responde dúvida de funcionário usando Gemini."""
    prompt = f"""Você é um especialista em gestão imobiliária e legislação de aluguéis no Brasil.

Pergunta do funcionário: {pergunta}

Responda de forma clara, concisa e prática."""

    return await gerar_texto_ia(prompt)

async def gerar_comunicado_proprietario(tipo: str, context: Dict[str, Any]) -> Optional[str]:
    """Gera comunicado automático para proprietário."""
    modelos_disponiveis = {
        "cobranca": "cobranca_gentil",
        "aviso_protesto": "aviso_protesto",
        "encerramento": "encerramento_contrato"
    }

    modelo = modelos_disponiveis.get(tipo)
    if not modelo:
        return None

    return await gerar_texto_ia("", context, modelo)

def listar_modelos_carta() -> Dict[str, str]:
    """Lista todos os modelos de carta disponíveis."""
    return {k: v[:100] + "..." for k, v in MODELOS_CARTA.items()}

def adicionar_modelo_carta(nome: str, template: str) -> Dict[str, Any]:
    """Adiciona novo modelo de carta."""
    if nome in MODELOS_CARTA:
        return {"erro": "Modelo já existe"}
    MODELOS_CARTA[nome] = template
    return {"msg": f"Modelo '{nome}' adicionado com sucesso"}
