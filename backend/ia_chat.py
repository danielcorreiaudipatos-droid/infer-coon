"""Chat IA com Gemini — assistente contextual do sistema on.imob."""

import os
import json
from typing import Dict, Any, Optional, List
from datetime import datetime

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

SISTEMA_PROMPT = """Você é o Assistente IA da on.imob — uma plataforma de gestão imobiliária.

RESPONSABILIDADES:
✓ Responder dúvidas sobre locação de imóveis
✓ Esclarecer Lei 8.245/91 (Lei de Locação Brasil)
✓ Sugerir ações baseado no contexto (gerar documentos, enviar mensagens)
✓ Ajudar funcionários com tarefas do dia-a-dia

LEI 8.245/91 - PONTOS CRÍTICOS:
• Aviso Prévio: 30 dias (mínimo)
• Multa Rescisão Antecipada: 3 meses de aluguel
• Multa Atraso: 10% do valor mensal + juros 1% a.m.
• Protesto: permitido após 3 meses de atraso
• Depósito Caução: equivalente a 1 mês de aluguel
• Reajuste: conforme índice contratual (IGP-M, IGPM, etc)

ESTILO:
- Seja conciso e direto
- Ofereça sugestões práticas de ação
- Se pergunta é sobre documento, sugira o template
- Se pergunta é sobre lei, cite o artigo
- Nunca tome decisão pelo usuário, sempre pergunte

NUNCA:
✗ Dê conselho jurídico sem mencionar Lei 8.245/91
✗ Tome decisão sem aprovação do usuário
✗ Revele informações privadas de outros usuários
✗ Execute ações sem botão explícito"""

SUGESTOES_POR_CONTEXTO = {
    "dashboard_financeiro": [
        "Gerar aviso de cobrança",
        "Calcular multa por atraso",
        "Enviar WhatsApp com link PIX",
        "Ver histórico de pagamentos"
    ],
    "dashboard_garantias": [
        "Registrar deducção de caução",
        "Liberar caução",
        "Ver saldo disponível",
        "Gerar comunicado de devolução"
    ],
    "modelos_cartas": [
        "Buscar modelo específico",
        "Adicionar modelo customizado",
        "Gerar carta automática",
        "Preview antes de salvar"
    ],
    "portal_proprietario": [
        "Ver repassos pendentes",
        "Gerar comunicado ao inquilino",
        "Calcular comissão",
        "Verificar documentos"
    ],
    "portal_inquilino": [
        "Ver histórico de pagamentos",
        "Consultar contrato",
        "Questionar cobrança",
        "Pedir referência"
    ]
}

class ContextoChat:
    """Extrai e armazena contexto da página atual."""

    def __init__(self, pagina: str, dados: Dict[str, Any] = None):
        self.pagina = pagina
        self.dados = dados or {}
        self.timestamp = datetime.now().isoformat()

    def resumo(self) -> str:
        """Retorna resumo do contexto para enviar a Gemini."""
        resumo = f"CONTEXTO ATUAL:\nPágina: {self.pagina}\n"

        if self.dados.get("imovel_nome"):
            resumo += f"Imóvel: {self.dados['imovel_nome']}\n"
        if self.dados.get("inquilino_nome"):
            resumo += f"Inquilino: {self.dados['inquilino_nome']}\n"
        if self.dados.get("dias_atraso"):
            resumo += f"⏰ Atraso: {self.dados['dias_atraso']} dias\n"
        if self.dados.get("valor_aluguel"):
            resumo += f"💰 Aluguel: R$ {self.dados['valor_aluguel']}\n"

        return resumo

    def sugestoes(self) -> List[str]:
        """Retorna sugestões baseado na página."""
        return SUGESTOES_POR_CONTEXTO.get(self.pagina, [
            "Dúvida sobre Lei 8.245/91?",
            "Precisa de um modelo de carta?",
            "Como funciona a caução?"
        ])

async def chat_ia(pergunta: str, contexto: ContextoChat) -> Dict[str, Any]:
    """
    Chat com Gemini usando contexto do sistema.
    Funciona offline com fallback se Gemini indisponível.
    """

    if not GEMINI_API_KEY:
        # Fallback: responder com base em templates/conhecimento
        return resposta_fallback(pergunta, contexto)

    try:
        import httpx

        mensagem_completa = f"""{SISTEMA_PROMPT}

{contexto.resumo()}

PERGUNTA DO USUÁRIO: {pergunta}

Responda concisamente (máx 200 palavras).
Se apropriado, sugira 1-2 ações práticas."""

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [{
                        "parts": [{"text": mensagem_completa}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 300
                    }
                }
            )
            response.raise_for_status()
            data = response.json()

            if "candidates" in data and len(data["candidates"]) > 0:
                resposta_texto = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "resposta": resposta_texto,
                    "sugestoes": contexto.sugestoes(),
                    "fonte": "gemini",
                    "erro": None
                }
    except Exception as e:
        print(f"Erro Gemini: {e}")

    # Fallback se Gemini falhar
    return resposta_fallback(pergunta, contexto)

def resposta_fallback(pergunta: str, contexto: ContextoChat) -> Dict[str, Any]:
    """Responde com base em templates quando Gemini indisponível."""

    pergunta_lower = pergunta.lower()

    # Respostas básicas
    respostas = {
        "aviso prévio": "Lei 8.245/91 exige aviso prévio de 30 dias. Quer que eu gere um comunicado?",
        "multa": "Multa por atraso: 10% do valor + 1% a.m. de juros. Por rescisão: 3 meses de aluguel.",
        "caução": "Caução é equivalente a 1 mês de aluguel. Deve ser devolvida no fim do contrato.",
        "protesto": "Após 3 meses de atraso, você pode registrar protesto em cartório.",
        "reajuste": "Reajuste é permitido no aniversário do contrato, conforme índice.",
        "lei 8.245": "Lei de Locação Urbana. Valida contratos, prazos, multas e direitos de inquilino/locador.",
    }

    resposta = None
    for palavra_chave, resposta_template in respostas.items():
        if palavra_chave in pergunta_lower:
            resposta = resposta_template
            break

    if not resposta:
        resposta = "Desculpe, não consegui entender bem. Pode reformular a pergunta? Estou aqui para ajudar com dúvidas sobre locação, Lei 8.245/91, documentos e tarefas do sistema."

    return {
        "resposta": resposta,
        "sugestoes": contexto.sugestoes(),
        "fonte": "template",
        "erro": "API Gemini não configurada"
    }

def extrair_sugestoes_de_resposta(resposta: str) -> List[str]:
    """Extrai sugestões da resposta (ações recomendadas)."""
    sugestoes = []

    if "gerar" in resposta.lower():
        sugestoes.append("Gerar documento")
    if "whatsapp" in resposta.lower() or "mensagem" in resposta.lower():
        sugestoes.append("Enviar mensagem")
    if "calcular" in resposta.lower():
        sugestoes.append("Calcular valor")
    if "modelo" in resposta.lower():
        sugestoes.append("Usar modelo")

    return sugestoes[:2]  # Max 2 sugestões

def determinar_acao_recomendada(contexto: ContextoChat) -> Optional[Dict[str, Any]]:
    """Determina ação recomendada baseado no contexto."""

    # Alertas por contexto
    if contexto.pagina == "dashboard_financeiro":
        if contexto.dados.get("dias_atraso", 0) > 30:
            return {
                "tipo": "aviso_protesto",
                "descricao": f"Atraso de {contexto.dados['dias_atraso']} dias - considere protesto",
                "botao": "Gerar Aviso Protesto"
            }
        if contexto.dados.get("dias_atraso", 0) > 0:
            return {
                "tipo": "cobranca",
                "descricao": "Aluguel atrasado - enviar lembrança?",
                "botao": "Enviar Cobrança"
            }

    if contexto.pagina == "portal_proprietario":
        if contexto.dados.get("repassos_pendentes", 0) > 0:
            return {
                "tipo": "repasse",
                "descricao": f"{contexto.dados['repassos_pendentes']} repassos pendentes",
                "botao": "Ver Repassos"
            }

    if contexto.pagina == "dashboard_garantias":
        if contexto.dados.get("caucas_liberadas", 0) > 0:
            return {
                "tipo": "devolucao",
                "descricao": "Há caução para devolver",
                "botao": "Gerar Comunicado Devolução"
            }

    return None
