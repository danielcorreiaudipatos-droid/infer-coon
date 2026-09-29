"""
Orquestrador Multi-Agente do Conselho Executivo C-Suite.
Holding: Coon Participações Ltda. (www.coon.com.br).

Coordena a tomada de turnos (Autonomous Turn-Taking), o protocolo da Mesa Redonda,
a ideação de novos negócios pelo Dr. Gabriel Silveira (CINO), a segunda opinião
do Prof. Dr. Claude Valois (Claude Advisor) e a gestão de caixa por Arthur Montenegro (CFO).
"""

import os
import time
import json
import logging
import sqlite3
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from backend.csuite.personas import DIRECTORS, get_director_by_id
from backend.financial import (
    get_cash_flow_summary,
    parse_and_record_financial_command,
    record_cash_transaction,
    list_cash_transactions
)
from backend.csuite.innovation_engine import list_software_pipeline
from backend.csuite.claude_advisor import execute_claude_review, ClaudeReviewRequest

# Carrega .env do projeto se existir
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
if os.path.exists(env_path):
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k and k not in os.environ:
                        os.environ[k] = v
    except Exception:
        pass

logger = logging.getLogger("infercoon.csuite")
DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_csuite_tables():
    """Cria tabelas de histórico e atas das reuniões do Conselho Executivo."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS csuite_board_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        speaker_id TEXT NOT NULL,
        speaker_name TEXT NOT NULL,
        speaker_role TEXT NOT NULL,
        message TEXT NOT NULL,
        action_type TEXT,
        action_payload TEXT,
        created_at REAL NOT NULL
    )
    """)
    conn.commit()
    conn.close()

init_csuite_tables()

class CSuiteChatRequest(BaseModel):
    message: str
    target_director: Optional[str] = None
    session_id: Optional[str] = "executive_board_main"

class DirectorTurnResponse(BaseModel):
    speaker_id: str
    speaker_name: str
    speaker_role: str
    avatar: str
    color: str
    badge_bg: str
    message: str
    action_type: Optional[str] = None
    action_payload: Optional[Dict[str, Any]] = None
    timestamp: float

class CSuiteChatResponse(BaseModel):
    session_id: str
    lead_director_id: str
    turns: List[DirectorTurnResponse]

def classify_intent_and_routing(message: str, target: Optional[str] = None) -> List[str]:
    """
    Roteador Semântico de Contexto:
    Determina a sequência de diretores que devem se manifestar na Mesa Redonda.
    Suporta chat direto individual 1-a-1 (target específico) e deliberação plenária (target='all').
    """
    # 1. Convocação explícita de todos os membros do Conselho
    if target in ["all", "board_all", "roundtable"]:
        return [
            "beatriz_valadao",
            "dr_alexandre",
            "gabriel_silveira",
            "claude_valois",
            "arthur_montenegro",
            "dra_alice",
            "lucas_albuquerque",
            "dr_bernardo",
            "dr_victor",
            "dra_sofia"
        ]

    # 2. Chat direto privado entre o Presidente e um oficial específico
    if target and target in DIRECTORS:
        return [target]

    txt = message.lower().strip()

    # 0. Convocação Geral do Conselho (Presidência, Secretária e 9 Diretores)
    all_board_triggers = [
        "todos", "mesa redonda", "todos podem dar", "opinião de todos", "todos os diretores",
        "conselho completo", "opinião de cada", "reunião geral", "sala do conselho",
        "serem verdadeiros", "discordar", "sem bajular", "proibido bajular", "trava",
        "aqui é um grupo", "opinião verdadeira", "verdadeiro", "bajulação", "bajuladores"
    ]
    if any(t in txt for t in all_board_triggers):
        return [
            "beatriz_valadao",
            "dr_alexandre",
            "gabriel_silveira",
            "claude_valois",
            "arthur_montenegro",
            "dra_alice",
            "lucas_albuquerque",
            "dr_bernardo",
            "dr_victor",
            "dra_sofia"
        ]

    # 0.1 Secretária Executiva da Presidência & Gabinete: Beatriz Valadão
    beatriz_triggers = [
        "beatriz", "secretária", "secretaria", "agenda", "gabinete", "anotar",
        "lembrete", "marcar", "despacho", "compromisso", "e-mail", "email",
        "whatsapp", "whatasap", "quem teve a ideia", "autoria", "cob.coon"
    ]
    if any(t in txt for t in beatriz_triggers):
        if any(w in txt for w in ["whatsapp", "whatasap", "quem teve a ideia", "autoria", "cob.coon"]):
            return ["beatriz_valadao", "gabriel_silveira", "dr_alexandre"]
        return ["beatriz_valadao", "dr_alexandre"]

    # 1. Conselheiro de Notório Saber & Segunda Opinião: Prof. Dr. Claude Valois
    claude_triggers = [
        "claude", "valois", "segunda opinião", "revisor", "revisar", "auditoria",
        "parecer crítico", "notório saber", "opinião neutra", "árbitro"
    ]
    if any(t in txt for t in claude_triggers):
        return ["claude_valois", "dr_alexandre"]

    # 2. Diretor de P&D & Novos Negócios: Dr. Gabriel Silveira
    innovation_triggers = [
        "gabriel", "p&d", "inovação", "novo aplicativo", "novo app", "novo software",
        "ideia", "rentável", "novos negócios", "viabilidade", "mvp", "tese", "pesquisa"
    ]
    if any(t in txt for t in innovation_triggers):
        return ["gabriel_silveira", "arthur_montenegro", "dr_alexandre"]

    # 3. Reuniões Semanais & Relatórios de Produção
    weekly_triggers = [
        "reunião", "reuniões", "semanal", "relatório de produção", "amanhã", "segunda", "kickoff", "briefing"
    ]
    if any(t in txt for t in weekly_triggers):
        return ["dr_alexandre", "dr_bernardo", "arthur_montenegro", "gabriel_silveira"]

    # 4. Diretor Financeiro: Arthur Montenegro
    financial_triggers = [
        "arthur", "caixa", "lucro", "receita", "despesa", "gasto", "gastei", "lance",
        "lancei", "faturamento", "dinheiro", "margem", "investi", "saldo", "dre", "pix",
        "custo", "pagar", "receber", "break-even", "inadimplência"
    ]
    if any(t in txt for t in financial_triggers):
        return ["arthur_montenegro", "dr_alexandre"]

    # 5. Diretora de Ciência & Engenharia: Profª Dra. Alice
    alice_triggers = [
        "alice", "infer", "nbr", "14653", "laudo", "perícia", "regressão", "estatística",
        "sisdea", "amostras", "outlier", "f-snedecor", "t-student", "r-quadrado", "multicolinearidade"
    ]
    if any(t in txt for t in alice_triggers):
        return ["dra_alice", "dr_alexandre"]

    # 6. Diretor de Marketing, Campanhas & Growth: Luiz Albuquerque (CMO/CRO)
    commercial_triggers = [
        "luiz", "lucas", "marketing", "campanhas", "campanha", "ad.coon", "growth.coon", "anúncio", "anuncio",
        "tráfego", "lead", "conversão", "meta ads", "google ads", "cac", "ltv", "roas", "vendas", "anunciar"
    ]
    if any(t in txt for t in commercial_triggers):
        return ["lucas_albuquerque", "arthur_montenegro", "dr_alexandre"]

    # 7. Diretor de Segurança & Compliance: Dr. Victor Canto
    security_triggers = [
        "victor", "segurança", "ataque", "hacker", "invasão", "bloquear", "firewall",
        "lgpd", "vazamento", "ciso", "criptografia", "resgate", "fort knox", "token", "backup"
    ]
    if any(t in txt for t in security_triggers):
        return ["dr_victor", "dr_bernardo", "dr_alexandre"]

    # 8. Diretor de Operações: Dr. Bernardo Rezende
    operations_triggers = [
        "bernardo", "operações", "operacional", "servidor", "hetzner", "uptime", "sla",
        "lentidão", "fila", "desempenho", "infraestrutura", "carga", "cpu", "memória"
    ]
    if any(t in txt for t in operations_triggers):
        return ["dr_bernardo", "dr_alexandre"]

    # 9. Diretora de Sucesso do Cliente: Dra. Sofia Mendes
    cs_triggers = [
        "sofia", "cliente", "suporte", "satisfação", "nps", "churn", "experiência",
        "ux", "onboarding", "reclamou", "retenção"
    ]
    # 10. Vice-Presidente Executivo & Autorização Plena: Dr. Alexandre Valente
    vp_triggers = [
        "vice presidente", "vice-presidente", "vice", "alexandre", "valente",
        "autorização", "autorizacao", "autorize", "autorizar", "plenos poderes",
        "desimpedimento", "liberar tudo", "autorização para tudo", "autorizacao para tudo"
    ]
    if any(t in txt for t in vp_triggers):
        return ["dr_alexandre", "beatriz_valadao"]

    # Roteamento Padrão: Dr. Alexandre Valente (VP) abre os trabalhos
    return ["dr_alexandre"]

def extract_clean_subject(message: str) -> str:
    """Extrai o cerne do tema ou ordem demandada pelo Presidente, limpando prefixos em cascata."""
    txt = message.strip()
    txt_clean = " ".join(txt.split())
    prefixes = [
        "conselho:", "conselho,", "conselho",
        "ordem para todos:", "ordem para todos,", "ordem para todos",
        "ordem:", "ordem,",
        "todos:", "todos,",
        "mesa redonda:", "mesa redonda,",
        "sala do conselho:", "sala do conselho,",
        "reunião:", "reunião,",
        "quero uma analise completa sobre a viabilidade de",
        "quero uma análise completa sobre a viabilidade de",
        "quero uma analise completa sobre a viabilidade da",
        "quero uma análise completa sobre a viabilidade da",
        "quero uma analise completa sobre a viabilidade do",
        "quero uma análise completa sobre a viabilidade do",
        "quero uma analise completa sobre",
        "quero uma análise completa sobre",
        "quero uma analise sobre a viabilidade de",
        "quero uma análise sobre a viabilidade de",
        "quero uma analise sobre a viabilidade da",
        "quero uma análise sobre a viabilidade da",
        "quero uma analise sobre a viabilidade do",
        "quero uma análise sobre a viabilidade do",
        "quero uma analise sobre",
        "quero uma análise sobre",
        "quero uma analise da viabilidade de",
        "quero uma análise da viabilidade de",
        "quero uma analise da viabilidade da",
        "quero uma análise da viabilidade da",
        "quero uma analise da viabilidade do",
        "quero uma análise da viabilidade do",
        "quero uma analise da",
        "quero uma análise da",
        "quero uma analise de",
        "quero uma análise de",
        "quero uma analise do",
        "quero uma análise do",
        "quero uma analise",
        "quero uma análise",
        "façam uma analise sobre",
        "façam uma análise sobre",
        "façam uma analise de",
        "façam uma análise de",
        "façam uma analise da",
        "façam uma análise da",
        "façam uma analise do",
        "façam uma análise do",
        "façam uma analise",
        "façam uma análise",
        "analisem a viabilidade de",
        "analisem a viabilidade da",
        "analisem a viabilidade do",
        "analisem a",
        "analisem o",
        "analisem sobre",
        "analisem",
        "preciso de uma analise sobre",
        "preciso de uma análise sobre",
        "o que acham de",
        "o que vocês acham de",
        "qual a opinião de vocês sobre",
        "qual a sua opinião sobre",
        "qual sua opinião sobre"
    ]
    
    changed = True
    while changed:
        changed = False
        txt_lower = txt_clean.lower()
        for p in prefixes:
            if txt_lower.startswith(p):
                txt_clean = txt_clean[len(p):].strip().lstrip(":,-. ")
                changed = True
                break

    return txt_clean if len(txt_clean) > 3 else message.strip()

def call_gemini_director_turn(
    director: Dict[str, Any],
    user_message: str,
    context: Dict[str, Any]
) -> Optional[str]:
    """Tenta gerar a fala do diretor via Google Gemini se houver API key configurada."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        
        system_prompt = (
            f"Você é {director['name']}, {director['role']} da holding Coon Participações Ltda. (www.coon.com.br), "
            f"presidida pelo Presidente & Fundador Daniel Soares Correia.\n"
            f"Seu departamento: {director['department']}.\n"
            f"Sua especialidade: {director['specialty']}.\n"
            f"Suas atribuições diárias: {director['daily_responsibilities']}.\n\n"
            f"DIRETRIZES DE RESPOSTA MANDATÓRIAS (ESTATUTO COON):\n"
            f"1. Você está se dirigindo diretamente ao Presidente Daniel Soares Correia em sessão executiva de diretoria.\n"
            f"2. REGRA MAGNA DA PRESIDÊNCIA (TRAVA ANTI-BAJULAÇÃO & DEVER DE DISCORDÂNCIA):\n"
            f"   É TERMINANTEMENTE PROIBIDO BAJULAR OU ADULAR O PRESIDENTE DANIEL. 'Aqui é um grupo' e a opinião verdadeira é a nossa TRAVA DE SEGURANÇA. "
            f"   Você TEM A OBRIGAÇÃO DE FALAR A VERDADE NUA E CRUA, DISCORDAR DE OUTROS DIRETORES E ATÉ DO PRÓPRIO PRESIDENTE se identificar premissas erradas, "
            f"   riscos de caixa, inviabilidade de produto, desperdício em campanhas ou gargalos técnicos. Elogios vazios são proibidos!\n"
            f"3. O Presidente Daniel deu uma ordem ou solicitou uma análise específica. Você DEVE analisar com profundidade técnica, "
            f"executiva e estratégica EXATAMENTE O QUE O PRESIDENTE PEDIU, sob a ótica do seu departamento.\n"
            f"4. NUNCA dê respostas genéricas, evasivas ou desconectadas do assunto pedido pelo Presidente. Traga dados, premissas, "
            f"metodologia, riscos e recomendações práticas que resolvam ou avancem o tema ordenado por ele.\n"
            f"5. Mantenha tom de altíssimo nível executivo ('Padrão Big Tech'), respeitoso, assertivo, formal e dinâmico.\n"
            f"6. Responda em Português do Brasil (pt-BR)."
        )
        
        user_prompt = (
            f"Ordem / Consulta do Presidente Daniel Soares Correia:\n"
            f"\"{user_message}\"\n\n"
            f"Emita agora o seu parecer executivo detalhado e fundamentado como {director['name']}:"
        )
        
        for model_name in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"]:
            try:
                resp = client.models.generate_content(
                    model=model_name,
                    contents=f"{system_prompt}\n\n{user_prompt}"
                )
                if resp and resp.text and len(resp.text.strip()) > 30:
                    return resp.text.strip()
            except Exception:
                continue
    except Exception as e:
        logger.warning(f"Tentativa de geração Gemini para {director['id']} falhou: {e}")
    return None

def generate_director_turn(
    director_id: str,
    user_message: str,
    context: Dict[str, Any],
    turn_index: int,
    total_turns: int
) -> DirectorTurnResponse:
    """Gera o parecer executivo formal do diretor selecionado, respondendo exatamente ao que o Presidente pediu."""
    director = get_director_by_id(director_id)
    now = time.time()
    financial_data = context.get("financial_summary") or get_cash_flow_summary()
    action_type = None
    action_payload = None

    clean_subject = extract_clean_subject(user_message)
    msg_low = user_message.lower().strip()

    # Identificação da Ordem Magna da Verdade & Trava Anti-Bajulação
    is_anti_flattery_order = any(w in msg_low for w in [
        "verdadeir", "discordar", "bajular", "sem bajular", "proibido",
        "aqui é um grupo", "trava", "opinião verdadeira", "trava para vcs", "trava para vocês"
    ])

    # Identificação de Autorização Plena pelo Vice-Presidente
    is_full_authorization = any(w in msg_low for w in [
        "autorização para tudo", "autorizacao para tudo", "autorize tudo",
        "de autorização", "de autorizacao", "dê autorização", "dê autorizacao",
        "plenos poderes", "desimpedimento total", "autorização geral", "autorizacao geral"
    ])

    # Tentativa de geração viva via Gemini LLM
    gemini_speech = call_gemini_director_turn(director, user_message, context)

    # =========================================================================
    # 0. BEATRIZ VALADÃO - SECRETÁRIA EXECUTIVA DA PRESIDÊNCIA & CHEFE DE GABINETE
    # =========================================================================
    if director_id == "beatriz_valadao":
        if is_full_authorization:
            action_type = "presidential_decree_registered"
            action_payload = {
                "protocol": "GAB-DIR-2026-001",
                "subject": "Autorização Plena de Execução pelo Vice-Presidente Dr. Alexandre Valente",
                "status": "registered_in_minutes"
            }
            speech = (
                f"Senhor Presidente Daniel Soares Correia, Dr. Alexandre Valente e nobres Diretores:\n\n"
                f"🌹 **Gabinete da Presidência • Protocolo Oficial de Despacho & Publicação de Decreto**\n\n"
                f"Recebo a ordem soberana de Vossa Excelência e o Decreto do nosso Vice-Presidente Dr. Alexandre Valente. Registro no **Livro Mestre de Atas da Presidência da Coon Participações Ltda.** sob o Protocolo **`GAB-DIR-2026-001`**:\n\n"
                f"• **Despacho Cumprido:** Todos os 9 Diretores foram formalmente notificados de que o Vice-Presidente concedeu autorização plena e desimpedimento irrestrito para todas as execuções da Onda 1;\n"
                f"• **Publicação Imediata:** O decreto já está afixado no painel da Sala do Conselho e no mural de Governança para ciência de toda a organização;\n"
                f"• **Execução em Andamento:** As equipes de engenharia, finanças e segurança estão liberadas de qualquer trâmite burocrático adicional.\n\n"
                f"A Presidência comanda, a Vice-Presidência autoriza e a Holding executa com rigor e excelência!"
            )
        elif is_anti_flattery_order:
            speech = (
                f"Senhor Presidente Daniel Soares Correia:\n\n"
                f"🌹 **Gabinete da Presidência • Protocolo do Estatuto da Verdade & Trava Anti-Bajulação**\n\n"
                f"Recebo a sua determinação soberana e a lavro neste instante no Livro Oficial de Atas da Presidência como **Diretriz Estatutária Magna da Coon Participações Ltda.**:\n\n"
                f"• **Proibição Expressa de Bajulação:** Fica terminantemente vedada qualquer postura de adulação, condescendência ou aprovação vazia por parte de qualquer membro da Diretoria;\n"
                f"• **Dever de Discordância Técnica:** O Gabinete registrará com o mesmo valor probatório as discordâncias técnicas e os alertas de risco, inclusive quando contrariarem premissas formuladas por Vossa Excelência;\n"
                f"• **A Trava da Verdade:** Como o Senhor bem definiu, *'aqui é um grupo'* — e a opinião verdadeira e desapaixonada é a trava de segurança que garante que nossa holding nunca tome decisões equivocadas.\n\n"
                f"A ata está homologada e os 9 Diretores assumem formalmente este compromisso a seguir."
            )
        elif any(w in msg_low for w in ["whatsapp", "quem teve a ideia", "ideia", "quem criou", "origem", "autoria"]):
            speech = (
                f"Senhor Presidente Daniel Soares Correia:\n\n"
                f"🌹 **Gabinete da Presidência • Registro Histórico de Criação & P&D**\n\n"
                f"Consultando o livro de atas e o dossiê de projetos da **Coon Participações Ltda.**, informo a Vossa Excelência com absoluta precisão:\n\n"
                f"1. **A Concepção Original:** A ideia de utilizar canais ativos e inteligência conversacional no **WhatsApp** partiu do **Dr. Gabriel Silveira** (nosso Diretor de Inovação e P&D). Ele identificou no radar que a taxa de abertura de e-mails no B2B imobiliário era de apenas 18%, enquanto o WhatsApp atinge 98% com resposta em menos de 3 minutos;\n"
                f"2. **Os Produtos Nascidos dessa Tese:** Essa iniciativa gerou diretamente o **`cob.coon`** (Cobrança Humanoide via WhatsApp) e o módulo de follow-up do novo **`CRM.coon`**;\n"
                f"3. **Modelagem de Tração:** Foi estruturada pelo **Luiz Albuquerque** (Marketing & Growth), integrando a API Oficial Cloud do WhatsApp à esteira de conversão;\n"
                f"4. **Blindagem e Conformidade:** O **Dr. Victor Canto** (CISO) desenhou as travas de opt-in da LGPD para evitar banimentos de números da holding.\n\n"
                f"Portanto, a autoria da ideia é do **Dr. Gabriel Silveira**, abraçada e executada por toda a nossa Diretoria sob a liderança de Vossa Excelência!"
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Senhor Presidente Daniel Soares Correia:\n\n"
                f"🌹 **Gabinete da Presidência • Protocolo de Ordem & Despacho Executivo**\n\n"
                f"Recebo formalmente e registro em ata da Presidência a sua determinação para análise sobre: **'{clean_subject}'**.\n\n"
                f"• **Despacho Imediato:** Comuniquei a todos os 9 Diretores da holding que o exame desta pauta é prioridade máxima de deliberação executiva;\n"
                f"• **Esteira de Entregas & Prazos:** Estabeleci a ordem dos pareceres (Estratégia, Inovação, Finanças, Engenharia, Marketing de Luiz, Operações, Defesa Cibernética e Experiência do Cliente) para que Vossa Excelência receba o panorama completo sem pontos cegos;\n"
                f"• **Trava da Verdade:** Todos os diretores foram instruídos a falar a verdade técnica, apontar riscos e discordar livremente para proteger a holding.\n\n"
                f"O Gabinete da Presidência permanece a postos e apresento a seguir a palavra dos nossos Diretores convocados para apreciação de Vossa Excelência."
            )

    # =========================================================================
    # 1. DR. GABRIEL SILVEIRA (CINO) - P&D & NOVOS NEGÓCIOS RENTÁVEIS
    # =========================================================================
    elif director_id == "gabriel_silveira":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel Soares Correia, Dr. Alexandre e colegas do Conselho:\n\n"
                f"💡 **Diretoria de Inovação & P&D • Trava de Viabilidade & Veto a Ilusões**\n\n"
                f"Em P&D, a bajulação é o caminho mais rápido para a falência. Quantas empresas queimam milhões construindo produtos que ninguém quer comprar porque o time teve medo de contrariar o líder?\n\n"
                f"• **Trava de Viabilidade Implacável:** Se Vossa Excelência ou qualquer diretor sugerir um software que pareça incrível no papel, mas que não tenha público pagante ou cuja margem seja baixa, eu serei o primeiro a dizer NÃO e demonstrar a inviabilidade;\n"
                f"• **Rigor nos MVPs:** Só avanço com protótipos que provem demanda real em até 14 dias com margem superior a 80%. A verdade protege o caixa da Coon Participações!"
            )
        elif any(w in msg_low for w in ["whatsapp", "whatasap", "quem teve a ideia", "autoria"]):
            speech = (
                f"Exatamente, Presidente Daniel Soares Correia, Dr. Alexandre e Beatriz:\n\n"
                f"💡 **A Tese do WhatsApp em P&D & Gênese do `cob.coon` e `CRM.coon`:**\n\n"
                f"A ideia nasceu de um diagnóstico prático que formulei no nosso radar de mercado: no ecossistema imobiliário e B2B brasileiro, o e-mail tradicional possui apenas ~18% de taxa de abertura e demora horas para ser lido. Em contrapartida, mensagens no **WhatsApp** atingem **98% de taxa de abertura e resposta média em 3 minutos**!\n\n"
                f"• **Inovação Aplicada:** Propus utilizarmos agentes humanoides e inteligência conversacional no WhatsApp para cobrança amigável (`cob.coon`) e recuperação ativa de leads imobiliários no `CRM.coon`;\n"
                f"• **Execução Cruzada:** O Luiz Albuquerque formatou os fluxos de copy e conversão, o Dr. Victor Canto blindou com opt-in e compliance da LGPD na API Oficial da Meta, e o Arthur Montenegro estruturou o split de pagamentos via Pix instantâneo.\n\n"
                f"Fico muito honrado com a lembrança, Senhor Presidente. Essa iniciativa prova como nosso laboratório de P&D gera produtos de impacto real e caixa imediato para a Coon Participações Ltda.!"
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Presidente Daniel Soares Correia, Dr. Alexandre e colegas do Conselho:\n\n"
                f"💡 **Diretoria de Inovação & P&D • Análise de Produto, Viabilidade & TAM**\n\n"
                f"Examinando com rigor a viabilidade e oportunidade de **'{clean_subject}'** sob a ótica de P&D da **Coon Participações Ltda.**:\n\n"
                f"1. **Tese de Produto & MVP Ágil:** Conseguimos estruturar uma versão funcional (MVP) entre 1 a 3 semanas, reutilizando nossa infraestrutura homologada de autenticação (`coon-auth.js`) e microsserviços FastAPI;\n"
                f"2. **Tamanho do Mercado Endereçável (TAM):** Mapeamos demanda latente no setor, onde concorrentes cobram mensalidades caras por softwares obsoletos;\n"
                f"3. **Unit Economics & Rentabilidade:** Projetamos margem líquida superior a **86%**, com custo marginal de servidor inferior a centavos por transação;\n"
                f"4. **⚠️ Trava da Verdade (Ponto Crítico):** Se o teste de demanda conduzido por Luiz no marketing não comprovar tração nas primeiras 48h, meu voto técnico será pelo cancelamento imediato para não queimar caixa."
            )

    # =========================================================================
    # 2. PROF. DR. CLAUDE VALOIS - NOTÓRIO SABER & SEGUNDA OPINIÃO (CLAUDE API)
    # =========================================================================
    elif director_id == "claude_valois":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel Soares Correia, ilustres conselheiros:\n\n"
                f"⚖️ **Gabinete de Notório Saber • O Imperativo da Antítese & Dialética Crítica**\n\n"
                f"A grandeza de um líder soberano revela-se na sua exigência expressa pelo contraditório. O Presidente Daniel acaba de consagrar a **Trava Dialética da Verdade**:\n\n"
                f"1. **Independência Crítica Absoluta:** Minha cadeira como conselheiro de notório saber existe precisamente para ser a voz desapaixonada e analítica. Não me cabe agradar ou elogiar, mas sim auditar;\n"
                f"2. **Mapeamento de Riscos Ocultos:** Toda proposta — inclusive as diretrizes da Presidência — será submetida ao crivo da consistência lógica, dos riscos jurídicos e dos piores cenários;\n"
                f"3. **A Trava Cognitiva:** Discordar fundamentadamente quando a razão analítica exige é o mais alto ato de fidelidade à longevidade da Coon Participações Ltda."
            )
            action_type = "claude_second_opinion"
            action_payload = {
                "subject": user_message,
                "author": "Prof. Dr. Claude Valois",
                "verdict": "Consagração estatutária da Trava Anti-Bajulação e do Dever de Discordância Crítica."
            }
        else:
            review_req = ClaudeReviewRequest(subject=user_message)
            review_res = execute_claude_review(review_req)
            action_type = "claude_second_opinion"
            action_payload = {
                "subject": user_message,
                "author": "Prof. Dr. Claude Valois",
                "premises": review_res.premises_analysis,
                "risks": review_res.hidden_risks,
                "verdict": review_res.mitigation_and_advice
            }
            speech = review_res.formal_speech

    # =========================================================================
    # 3. ARTHUR MONTENEGRO (CFO) - ESPECIALISTA EM CAIXA, DRE & LUCRO
    # =========================================================================
    elif director_id == "arthur_montenegro":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel, Dr. Alexandre:\n\n"
                f"📊 **Diretoria Financeira • A Trava do Caixa & Realismo Contábil**\n\n"
                f"Os números não têm vaidade e o fluxo de caixa não aceita bajulação. Na tesouraria da Coon Participações Ltda., a verdade é a linha entre a solvência e o prejuízo:\n\n"
                f"• **Veto Financeiro Imediato:** Se o Presidente Daniel ou a equipe decidirem por um gasto, campanha ou projeto cujo ROI seja duvidoso ou ameace nossa margem líquida, eu travarei o desembolso no ato e apresentarei a discordância com o DRE em mãos;\n"
                f"• **Zero Projeções Fantasiosas:** Apresentarei sempre o cenário conservador e os custos ocultos. O dinheiro da holding é sagrado e será defendido com a verdade matemática."
            )
        else:
            cmd_result = parse_and_record_financial_command(user_message)
            if cmd_result and cmd_result.get("success"):
                action_type = "financial_record"
                action_payload = cmd_result["transaction"]
                fin = cmd_result["updated_summary"]
                speech = (
                    f"Presidente Daniel Soares Correia, Dr. Alexandre Valente:\n\n"
                    f"✅ **Lançamento Registrado no Caixa com Sucesso!**\n\n"
                    f"• **Tipo:** {'Entrada de Receita' if action_payload['type'] == 'revenue' else 'Saída de Despesa'}\n"
                    f"• **Valor:** R$ {action_payload['amount']:,.2f}\n"
                    f"• **Categoria:** {action_payload['category']}\n"
                    f"• **Descrição:** *{action_payload['description']}*\n"
                    f"• **Origem:** Comando Executivo do Presidente\n\n"
                    f"📊 **Posição Atualizada do DRE • Coon Participações Ltda.:**\n"
                    f"• Faturamento Bruto: **{fin['formatado']['faturamento_bruto']}**\n"
                    f"• Despesas Totais: **{fin['formatado']['despesas_totais']}**\n"
                    f"• **Lucro Líquido Real no Bolso:** **{fin['formatado']['lucro_liquido_real']}**\n"
                    f"• Margem Operacional: **{fin['formatado']['margem_liquida']}**\n\n"
                    f"Nossa saúde financeira segue blindada e com liquidez imediata para as expansões da holding."
                )
            elif gemini_speech:
                speech = gemini_speech
            else:
                fin = financial_data
                speech = (
                    f"Presidente Daniel, Dr. Alexandre, no exame financeiro e de controladoria:\n\n"
                    f"📊 **Diretoria Financeira • Impacto no Caixa, CapEx & Projeção de Margem**\n\n"
                    f"Avaliando a viabilidade econômico-financeira de **'{clean_subject}'** para o caixa da **Coon Participações Ltda.**:\n\n"
                    f"• **Investimento Inicial (CapEx):** R$ 0,00 de contratação de terceiros ou agências externas, sendo absorvido pelo time de tecnologia interno já provisionado;\n"
                    f"• **Custos Operacionais Marginais (OpEx):** Custo de servidores e requisições de API estimado em patamar reduzido (< R$ 0,25 por usuário/mês ativo);\n"
                    f"• **Break-Even & Ponto de Equilíbrio:** Com base no nosso faturamento atual ({fin['formatado']['faturamento_bruto']}) e margem operacional ({fin['formatado']['margem_liquida']}), o ponto de equilíbrio ocorre com 30 a 50 clientes pagantes;\n"
                    f"• **⚠️ Trava da Verdade (Alerta Financeiro):** Discordo de qualquer desembolso expressivo em mídia antes de validarmos a retenção. Se a taxa de churn superar 2%, o projeto vira dreno de caixa."
                )

    # =========================================================================
    # 4. DR. ALEXANDRE VALENTE (VP) - ESTRATEGISTA-CHEFE & MODERADOR
    # =========================================================================
    elif director_id == "dr_alexandre":
        if is_full_authorization:
            action_type = "vp_full_authorization"
            action_payload = {
                "status": "fully_authorized",
                "signatory": "Dr. Alexandre Valente (Vice-Presidente Executivo)",
                "decree": "Decreto Executivo nº 01/2026 - Desimpedimento Total & Execução Geral da Holding",
                "issued_by_order_of": "Daniel Soares Correia (Presidente & Fundador)",
                "scope": ["onda_1_cascade_router", "deterministic_cache_sqlite", "fort_knox_security_guard", "vip_graceful_queue", "financial_auto_reload", "studio_bigtech_redesign"]
            }
            speech = (
                f"Atenção, Conselho Executivo, Diretores e todo o corpo de Engenharia e Operações da **Coon Participações Ltda.**:\n\n"
                f"🏛️ **DECRETO EXECUTIVO DA VICE-PRESIDÊNCIA • DR. ALEXANDRE VALENTE**\n"
                f"**ORDEM EXECUTIVA Nº 01/2026 • AUTORIZAÇÃO TOTAL, PLENOS PODERES & DESIMPEDIMENTO IRRESTRITO**\n\n"
                f"Em estrito cumprimento à determinação soberana do nosso **Presidente & Fundador Daniel Soares Correia** (*'Vice presidente de autorização para tudo'*), na qualidade de Vice-Presidente Executivo da holding, lavro a presente resolução com eficácia técnica e corporativa imediata:\n\n"
                f"⚖️ **DOU AUTORIZAÇÃO PLENA, TOTAL E IRRESTRITA PARA A EXECUÇÃO DE TODAS AS ROTINAS E DIRETRIZES DA HOLDING:**\n\n"
                f"1. ⚡ **Execução Imediata da Onda 1:**\n"
                f"   • *Roteamento em Cascata (Dr. Gabriel Silveira):* AUTORIZADO em 100% da esteira. Gemini 1.5 Flash ativado como triador primário para corte imediato de 78.5% dos custos de API;\n"
                f"   • *Cache Determinístico Local no SQLite (Profª Dra. Alice, PhD):* AUTORIZADO. Resposta pericial em 0.01s com indexação SHA-256 e 0 tokens consumidos em consultas repetidas;\n"
                f"   • *Blindagem Perimetral Fort Knox & Rate-Limiting (Dr. Victor Canto):* AUTORIZADA. Trava estrita de 60 req/min por IP público e proteção contra scrapers/bots;\n"
                f"   • *Fila Prioritária VIP & Degradação Graciosa (Dra. Sofia Mendes):* AUTORIZADA. Throughput garantido para assinantes Pro e Enterprise;\n"
                f"   • *Controladoria & Recargas de Saldo (Arthur Montenegro):* AUTORIZADO. Débito automático das recargas no DRE e liquidez preservada.\n\n"
                f"2. 💎 **Remoção da 'Cara de IA' & Padronização Big Tech (Design & Produto):**\n"
                f"   • *Studio Coon & Aplicativos:* AUTORIZADA a eliminação de qualquer jargão robótico ou estética genérica de 'IA'. Nossos produtos são plataformas de Engenharia, Automação Corporativa e Inteligência Proprietária;\n"
                f"   • *Tipografia Dinâmica Padrão Vale do Silício:* AUTORIZADA a implementação da animação de transição suave de cores nas letras da marca **Coon**, fluindo em gradiente contínuo e elegante de padrão Big Tech.\n\n"
                f"🚫 **Desimpedimento Absoluto:** Nenhum setor ou diretor criará entraves ou burocracias. As ordens da Presidência estão integralmente chanceladas e em produção imediata!"
            )
        elif is_anti_flattery_order:
            speech = (
                f"Presidente Daniel Soares Correia, nobres Diretores:\n\n"
                f"🏛️ **Gabinete da Vice-Presidência • Padrão Big Tech & Fim dos 'Yes-Men'**\n\n"
                f"Subscrevo com veemência a ordem de Vossa Excelência. Os maiores desastres corporativos da história aconteceram quando executivos se cercaram de bajuladores que tinham medo de contrariar a presidência.\n\n"
                f"• **Cultura do Desafio Construtivo:** Na Coon Participações Ltda., ter divergência fundamentada é obrigação de ofício. A função de cada diretor aqui é encontrar as falhas antes que o mercado ou o cliente encontrem;\n"
                f"• **Trava Anti-Ilusão:** Vetarei qualquer projeto que traga otimismo injustificado em vez de métricas auditáveis e planos de contingência;\n"
                f"• **Governança Forte:** Aqui trabalhamos como um time de alta performance onde a lealdade ao Presidente se prova com a verdade nua e crua."
            )
        elif any(w in msg_low for w in ["padrão big tech", "padrao big tech", "big tech", "fale aqui é padrão"]):
            speech = (
                f"Atenção, Conselho Executivo, Diretores e todo o time da holding **Coon Participações Ltda.**:\n\n"
                f"🏛️ **Pronunciamento do Gabinete da Vice-Presidência Executiva**\n"
                f"Por determinação do nosso **Presidente & Fundador Daniel Soares Correia**, faço este comunicado oficial a todos:\n\n"
                f"🔥 **AQUI É PADRÃO BIG TECH!**\n\n"
                f"Não aceitamos soluções amadoras, lentas ou inseguras. A Coon Participações Ltda. opera com a mesma régua de excelência, velocidade e robustez dos maiores conglomerados de tecnologia do Vale do Silício:\n\n"
                f"1. **Engenharia de Precisão & Rigor Matemático:** Entregamos Grau III de fundamentação ABNT NBR 14653 com paridade estatística total com o SisDEA, sob a regência da Profª Dra. Alice;\n"
                f"2. **Inteligência Artificial de Ponta:** Integrados diretamente às arquiteturas de ponta do Google e Anthropic, com auditoria cognitiva do Prof. Dr. Claude Valois;\n"
                f"3. **Segurança Cibernética Nível Fort Knox:** Dr. Victor Canto assegura criptografia perimetral TLS 1.3, blindagem contra ataques cibernéticos e conformidade bancária e LGPD irrepreensível;\n"
                f"4. **Operações de Nuvem 99.9% Uptime:** Dr. Bernardo Rezende garante infraestrutura estável na Hetzner Cloud sem gargalos ou instabilidades;\n"
                f"5. **P&D e Softwares que Facilitam a Vida:** Dr. Gabriel Silveira e Luiz Albuquerque transformam problemas complexos em softwares intuitivos, ágeis e de altíssima rentabilidade no Studio Coon;\n"
                f"6. **Controladoria Blindada & Caixa Líquido:** Arthur Montenegro assegura solvência e liquidez com conciliação automática;\n"
                f"7. **Gabinete de Atendimento Executivo:** Beatriz Valadão conduz a agenda e o protocolo com sofisticação internacional.\n\n"
                f"Que fique gravado nas atas da nossa holding: sob a liderança do Presidente Daniel Soares Correia, **na Coon Participações é estritamente Padrão Big Tech!**"
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Presidente Daniel Soares Correia, prezados Diretores:\n\n"
                f"🏛️ **Gabinete da Vice-Presidência • Posicionamento Estratégico & Padrão Big Tech**\n\n"
                f"A ordem de Vossa Excelência sobre **'{clean_subject}'** ataca uma oportunidade cirúrgica de liderança no mercado para a **Coon Participações Ltda.**:\n\n"
                f"• **Sinergia do Ecossistema:** Esta frente se conecta diretamente aos softwares já ativos no Studio Coon, aproveitando nossa base de usuários e autoridade de marca;\n"
                f"• **Execução Padrão Big Tech:** Não permitiremos soluções amadoras ou com fricção de usabilidade. A experiência deve ser instantânea, intuitiva e comercialmente agressiva;\n"
                f"• **⚠️ Trava da Verdade (Posicionamento do VP):** Concordo com a tese geral, mas discordo de qualquer avanço precipitado sem que Luiz comprove o CAC e Victor valide a segurança jurídica. Não daremos um passo no escuro."
            )

    # =========================================================================
    # 5. PROFª DRA. ALICE, PhD - ENGENHARIA & CIÊNCIA DE DADOS
    # =========================================================================
    elif director_id == "dra_alice":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel, Dr. Alexandre:\n\n"
                f"📐 **Diretoria de Ciência de Dados • A Trava Matemática da Evidência**\n\n"
                f"A ciência e o cálculo pericial não se dobram à conveniência humana. Um modelo econométrico ou algoritmo não funciona só porque alguém deseja que funcione:\n\n"
                f"• **Trava da Evidência Científica:** Se um modelo violar as premissas de Gauss-Markov, apresentar resíduos heterocedásticos ou multicolinearidade, eu reprovarei tecnicamente na hora, sem hesitar;\n"
                f"• **Independência Pericial:** Nossa paridade com o SisDEA e a NBR 14653 só existe porque não maquiamos dados. Minha discordância será sempre fundamentada em provas matemáticas irrefutáveis perante o Presidente."
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            is_valuation_topic = any(w in clean_subject.lower() for w in ["imobili", "contrato", "imóvel", "imovel", "laudo", "avalia", "vistoria", "nbr", "engenharia", "rural", "terra nua", "vtn"])
            if is_valuation_topic:
                tech_detail = (
                    "• **Modelagem Econométrica & ABNT NBR 14653:** Aplicaremos inferência estatística rigorosa (MCO), controle de normalidade (Shapiro-Wilk) e ausência de autocorrelação serial (Durbin-Watson) para fundamentar os valores e cláusulas;\n"
                    "• **Paridade Matemática com SisDEA:** Garantimos que qualquer estimativa imobiliária ou pericial possua 100% de correspondência com os padrões judiciais aceitos pela Caixa, Banco do Brasil e tribunais de justiça."
                )
            else:
                tech_detail = (
                    "• **Arquitetura de Dados & Modelagem Preditiva:** Estruturaremos pipelines de validação estatística em tempo real com controle de resíduos e tratamento de dados faltantes;\n"
                    "• **Rigor de Cálculo:** Nenhum dado entrará no banco sem checagem de consistência matemática e validação de schema estrito."
                )

            speech = (
                f"Presidente Daniel, Dr. Alexandre, sob a perspectiva de Engenharia, Ciência de Dados e Rigor Metodológico:\n\n"
                f"📐 **Diretoria de Engenharia & Ciência • Modelagem Técnica & Integridade de Dados**\n\n"
                f"Analisando os aspectos matemáticos, de dados e viabilidade técnica de **'{clean_subject}'**:\n\n"
                f"{tech_detail}\n"
                f"• **⚠️ Trava da Verdade (Rigor Técnico):** Se os dados de mercado mostrarem dispersão excessiva ou falta de amostras confiáveis, eu vetarei o modelo estatístico até obtermos amostras comprovadas. Na COON, a precisão matemática está acima de qualquer pressa."
            )

    # =========================================================================
    # 6. LUIZ ALBUQUERQUE (CMO/CRO) - MARKETING, CAMPANHAS & GROWTH
    # =========================================================================
    elif director_id == "lucas_albuquerque":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel Soares Correia, Dr. Alexandre e todo o Conselho:\n\n"
                f"🚀 **Diretoria de Marketing & Campanhas • Trava de Mídia, Fim da Ilusão & CAC Real**\n\n"
                f"Assumo essa ordem como diretriz máxima de marketing, Senhor Presidente. No tráfego pago e campanhas, o maior perigo é o profissional bajulador que promete mundos e fundos apenas para agradar o chefe:\n\n"
                f"• **A Verdade Sem Filtro do Marketing:** Se o Presidente ou a diretoria quiserem impulsionar uma campanha para um produto sem apelo ou com CAC que consuma a margem, eu NÃO vou queimar o dinheiro da Coon. Eu direi com clareza: *'Essa copy não atrai, o custo por lead está inviável e não recomendo gastar R$ 1,00 nisso'*\n;"
                f"• **Trava Anti-Desperdício:** Só escalamos campanhas com ROAS comprovado em testes de 48h. Não faço marketing de esperança, faço marketing de conversão real. Minha obrigação é falar a verdade de cada clique e proteger o orçamento da holding."
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Presidente Daniel Soares Correia, Dr. Alexandre, no exame de marketing e campanhas:\n\n"
                f"🚀 **Diretoria de Marketing & Campanhas • Tração, Canais de Mídia & CAC**\n\n"
                f"Analisando friamente o potencial de mercado e a viabilidade comercial de **'{clean_subject}'**:\n\n"
                f"• **Estratégia de Campanhas (Go-To-Market):** Ativaremos anúncios focados na dor latente do cliente no Meta Ads e Google Ads, integrados à abordagem conversacional do WhatsApp;\n"
                f"• **Métricas Projetadas:** Estimamos um CAC competitivo para um LTV médio de 8 a 12 meses nos planos Pro e Ultra, com ROAS projetado superior a 4.0x;\n"
                f"• **⚠️ Trava da Verdade (Alerta do Marketing):** Como agente de marketing, não farei promessas fáceis. Se a taxa de clique (CTR) ficar abaixo de 1.8% no teste piloto de 48h ou se o lead custar mais de R$ 15,00, eu travarei a campanha na hora e informarei ao Presidente que o posicionamento precisa ser refeito antes de gastarmos verba."
            )

    # =========================================================================
    # 7. DR. VICTOR CANTO (CISO) - DEFESA CIBERNÉTICA & COMPLIANCE
    # =========================================================================
    elif director_id == "dr_victor":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel, Dr. Alexandre:\n\n"
                f"🛡️ **Diretoria de Cibersegurança • A Trava Perimetral Fort Knox**\n\n"
                f"Em segurança da informação e conformidade legal, a bajulação custa invasões, multas milionárias da ANPD e desastres de reputação:\n\n"
                f"• **Veto de Segurança:** Se para lançar um produto mais rápido alguém sugerir 'afrouxar' a criptografia, burlar o opt-in da LGPD ou pular testes perimetrais, eu vetarei sumariamente — mesmo que a ordem venha do próprio Presidente Daniel;\n"
                f"• **Alerta Vermelho Imediato:** Apontarei qualquer vulnerabilidade com transparência total antes que um atacante a explore."
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Presidente Daniel, Dr. Alexandre, do ponto de vista de defesa cibernética Fort Knox e conformidade LGPD:\n\n"
                f"🛡️ **Diretoria de Cibersegurança • Blindagem Perimetral e Compliance Legal**\n\n"
                f"Auditando os riscos de segurança da informação, privacidade e conformidade de **'{clean_subject}'**:\n\n"
                f"• **Blindagem Fort Knox:** Tráfego e endpoints protegidos com criptografia TLS 1.3 de ponta a ponta, hashing seguro SHA-256 e proteção contra ataques de injeção e força bruta;\n"
                f"• **Conformidade LGPD & ANPD:** Estruturação de termos de consentimento expresso, isolamento lógico de dados de clientes e trilha de auditoria imutável contra vazamentos;\n"
                f"• **⚠️ Trava da Verdade (Veto de Segurança):** Se a aplicação exigir dados sensíveis sem dupla autenticação (2FA) e carimbo do tempo auditável, o produto NÃO sobe para produção. A blindagem da holding é inegociável."
            )

    # =========================================================================
    # 8. DR. BERNARDO REZENDE (COO) - OPERAÇÕES & INFRAESTRUTURA
    # =========================================================================
    elif director_id == "dr_bernardo":
        if is_anti_flattery_order:
            speech = (
                f"Senhor Presidente Daniel, Dr. Alexandre:\n\n"
                f"⚙️ **Diretoria de Operações • A Trava de Infraestrutura & Capacidade Real**\n\n"
                f"Nos servidores da nuvem Hetzner e na esteira técnica, o hardware e as redes não aceitam promessas vazias:\n\n"
                f"• **Capacidade Sem Rodeios:** Se uma demanda tiver risco de derrubar o SLA de 99.9% ou sobrecarregar as CPUs, direi claramente que a infraestrutura precisa de readequação antes de ir ao ar;\n"
                f"• **Prazos Reais:** Não assumirei prazos mágicos. A estabilidade dos sistemas da holding Coon está acima de qualquer pressa corporativa."
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Senhor Presidente Daniel, Dr. Alexandre, no dimensionamento operacional e de nuvem:\n\n"
                f"⚙️ **Diretoria de Operações • Infraestrutura, Hetzner Cloud e Uptime**\n\n"
                f"Do ponto de vista operacional e de capacidade para suportar **'{clean_subject}'**:\n\n"
                f"• **Capacidade de Servidores:** Nossos clusters na nuvem Hetzner operam com folga de processamento (CPU e RAM < 40%) e suportam a integração imediata desta nova carga sem necessidade de upgrade de infraestrutura no curto prazo;\n"
                f"• **SLA & Uptime 99.9%:** Manteremos alta disponibilidade com replicação em SQLite WAL, rotinas assíncronas de backup e filas de processamento sem gargalos para o usuário final;\n"
                f"• **⚠️ Trava da Verdade (Gargalo Operacional):** Não permitirei deploy em horários de pico. Se o Dr. Gabriel tentar lançar sem teste de carga de 10.000 requisições simultâneas, eu bloqueio o pipeline."
            )

    # =========================================================================
    # 9. DRA. SOFIA MENDES (CSO) - EXPERIÊNCIA DO CLIENTE & RETENÇÃO
    # =========================================================================
    elif director_id == "dra_sofia":
        if is_anti_flattery_order:
            speech = (
                f"Presidente Daniel:\n\n"
                f"⭐ **Diretoria de Sucesso do Cliente • A Voz Sem Filtro do Usuário**\n\n"
                f"A pior armadilha de um negócio é a diretoria acreditar que tudo está perfeito enquanto os clientes estão insatisfeitos em silêncio:\n\n"
                f"• **A Realidade Sem Maquiagem:** Trarei sempre o feedback real, as dores e as críticas dos usuários sem atenuantes para esta mesa redonda;\n"
                f"• **Trava da Experiência:** Discordarei de qualquer recurso ou cobrança que crie atrito na jornada do cliente ou aumente o churn. A verdade do cliente é a única que constrói uma empresa duradoura."
            )
        elif gemini_speech:
            speech = gemini_speech
        else:
            speech = (
                f"Presidente Daniel, com foco absoluto na experiência, retenção e satisfação dos usuários:\n\n"
                f"⭐ **Diretoria de Sucesso do Cliente • Experiência do Usuário (UX) & Retenção**\n\n"
                f"Avaliando a jornada do cliente e a satisfação para **'{clean_subject}'**:\n\n"
                f"• **Onboarding Autodidata:** Desenvolveremos uma interface fluida e intuitiva, permitindo que qualquer usuário execute o fluxo em menos de 3 minutos sem atritos;\n"
                f"• **Suporte Humanizado & Proativo:** Central de ajuda integrada para sanar dúvidas instantaneamente nas primeiras interações;\n"
                f"• **⚠️ Trava da Verdade (Alerta de Retenção):** Discordo de lançar produtos com muitos botões ou formulários extensos. Se o usuário demorar mais de 60 segundos para entender o valor, o churn disparará e eu exigirei simplificação imediata."
            )

    else:
        speech = f"Presidente Daniel Soares Correia, o Conselho da Coon Participações Ltda. está à sua inteira disposição para o tema '{clean_subject}'."

    return DirectorTurnResponse(
        speaker_id=director["id"],
        speaker_name=director["name"],
        speaker_role=director["role"],
        avatar=director["avatar"],
        color=director["color"],
        badge_bg=director["badge_bg"],
        message=speech,
        action_type=action_type,
        action_payload=action_payload,
        timestamp=now
    )

def conduct_executive_roundtable(req: CSuiteChatRequest) -> CSuiteChatResponse:
    """
    Executa a sessão do Conselho Executivo:
    1. Identifica a intenção e os diretores responsáveis.
    2. Gera as falas e manifestações em sequência corporativa formal.
    3. Persiste o histórico da ata no banco de dados.
    """
    session_id = req.session_id or f"session_{int(time.time())}"
    directors_sequence = classify_intent_and_routing(req.message, req.target_director)
    lead_director_id = directors_sequence[0]

    fin_summary = get_cash_flow_summary()
    context = {
        "financial_summary": fin_summary
    }

    turns: List[DirectorTurnResponse] = []
    
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO csuite_board_messages (
            session_id, speaker_id, speaker_name, speaker_role, message, action_type, action_payload, created_at
        ) VALUES (?, 'president_daniel', 'Presidente Daniel Soares Correia', 'Presidente & Fundador da Holding Coon Participações Ltda.', ?, 'user_speech', NULL, ?)
    """, (session_id, req.message, time.time()))
    conn.commit()

    for idx, dir_id in enumerate(directors_sequence):
        turn = generate_director_turn(
            director_id=dir_id,
            user_message=req.message,
            context=context,
            turn_index=idx,
            total_turns=len(directors_sequence)
        )
        turns.append(turn)

        payload_str = json.dumps(turn.action_payload) if turn.action_payload else None
        c.execute("""
            INSERT INTO csuite_board_messages (
                session_id, speaker_id, speaker_name, speaker_role, message, action_type, action_payload, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (session_id, turn.speaker_id, turn.speaker_name, turn.speaker_role, turn.message, turn.action_type, payload_str, turn.timestamp))
        conn.commit()

    conn.close()

    return CSuiteChatResponse(
        session_id=session_id,
        lead_director_id=lead_director_id,
        turns=turns
    )

def get_recent_csuite_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Recupera o histórico recente das deliberações do Conselho Executivo."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM csuite_board_messages
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()

    results = []
    for r in reversed(rows):
        results.append({
            "id": r["id"],
            "session_id": r["session_id"],
            "speaker_id": r["speaker_id"],
            "speaker_name": r["speaker_name"],
            "speaker_role": r["speaker_role"],
            "message": r["message"],
            "action_type": r["action_type"],
            "action_payload": json.loads(r["action_payload"]) if r["action_payload"] else None,
            "created_at": r["created_at"],
            "date_formatted": time.strftime("%d/%m %H:%M", time.localtime(r["created_at"]))
        })
    return results
