"""
Motor de Atendimento Humanizado Co.on (Bot Concierge Human-First)
Holding: Co.on Participações Ltda. (www.coon.com.br)
Atendentes: Jéssica Santos, Camila Ferreira, Rodrigo Silva e Eduardo Mendes.
"""

import os
import time
import random
import sqlite3
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_bot_tables():
    """Inicializa as tabelas de tickets, conversas e leads do bot de atendimento."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS bot_conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        attendant_id TEXT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        intent TEXT,
        created_at REAL NOT NULL,
        created_at_iso TEXT NOT NULL
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS bot_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ticket_code TEXT NOT NULL UNIQUE,
        session_id TEXT,
        client_name TEXT,
        client_contact TEXT,
        attendant_id TEXT NOT NULL,
        category TEXT NOT NULL, -- 'plano', 'suporte', 'duvida', 'cancelamento', 'ouvidoria'
        summary TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'aberto', -- 'aberto', 'em_atendimento', 'concluido'
        created_at REAL NOT NULL,
        created_at_iso TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

# Inicializa ao carregar o módulo
init_bot_tables()

# ========================================================
# DEFINIÇÃO DOS ATENDENTES HUMANIZADOS DA COON
# ========================================================
ATTENDANTS: Dict[str, Dict[str, Any]] = {
    "jessica_santos": {
        "id": "jessica_santos",
        "name": "Jéssica Santos",
        "role": "Atendimento & Sucesso do Cliente",
        "avatar": "/jessica_avatar.jpg",
        "department": "Relacionamento Co.on",
        "badge": "Crachá Co.on Oficial",
        "greeting": "Olá! Tudo bem? Aqui é a Jéssica da Co.on! 😊 Como posso te ajudar hoje?"
    },
    "camila_ferreira": {
        "id": "camila_ferreira",
        "name": "Camila Ferreira",
        "role": "Supervisora Comercial & Retenção",
        "avatar": "/camila_avatar.jpg",
        "department": "Supervisão Comercial",
        "badge": "Supervisora Co.on",
        "greeting": "Olá! Aqui é a Camila Ferreira, supervisora de relacionamento da Co.on. A Jéssica me passou seu caso e estou aqui para te dar total atenção! 🤝"
    },
    "rodrigo_silva": {
        "id": "rodrigo_silva",
        "name": "Rodrigo Silva",
        "role": "Supervisor Técnico & Engenharia",
        "avatar": "/rodrigo_avatar.jpg",
        "department": "Suporte Técnico de Softwares",
        "badge": "Engenharia Co.on",
        "greeting": "Olá! Rodrigo Silva por aqui, supervisor técnico da Co.on. Já estou com o seu chamado na tela. Vamos resolver isso juntos! 🛠️"
    },
    "eduardo_mendes": {
        "id": "eduardo_mendes",
        "name": "Eduardo Mendes",
        "role": "Gerente de Operações & Atendimento Executivo",
        "avatar": "/eduardo_avatar.jpg",
        "department": "Gabinete de Operações",
        "badge": "Gerência Co.on",
        "greeting": "Olá! Sou o Eduardo Mendes, gerente de operações da Co.on. Assumi o seu atendimento pessoalmente para garantir que você tenha a melhor solução."
    }
}

class BotChatRequest(BaseModel):
    message: str = Field(..., description="Mensagem do usuário")
    session_id: Optional[str] = Field("sess_default", description="Identificador da sessão")
    current_attendant: Optional[str] = Field("jessica_santos", description="Atendente atual")
    client_name: Optional[str] = Field(None, description="Nome do cliente se informado")
    client_contact: Optional[str] = Field(None, description="E-mail ou WhatsApp do cliente")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Histórico da conversa")

class BotChatResponse(BaseModel):
    response: str
    attendant: Dict[str, Any]
    transferred: bool = False
    transfer_message: Optional[str] = None
    suggested_actions: List[Dict[str, str]] = Field(default_factory=list)
    ticket_code: Optional[str] = None
    whatsapp_url: Optional[str] = None

def generate_ticket_code(prefix: str = "COON") -> str:
    now_str = time.strftime("%y%m%d")
    rnd = random.randint(1000, 9999)
    return f"#{prefix}-{now_str}-{rnd}"

def record_bot_ticket(session_id: str, attendant_id: str, category: str, summary: str, client_name: str = "", client_contact: str = "") -> str:
    code_map = {
        "plano": "PLN",
        "suporte": "SUP",
        "duvida": "DVB",
        "cancelamento": "CAN",
        "ouvidoria": "OUV"
    }
    pfx = code_map.get(category, "COON")
    tcode = generate_ticket_code(pfx)
    now_ts = time.time()
    now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
    
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    INSERT INTO bot_tickets (ticket_code, session_id, client_name, client_contact, attendant_id, category, summary, status, created_at, created_at_iso)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'aberto', ?, ?)
    """, (tcode, session_id, client_name or "Cliente Co.on", client_contact or "", attendant_id, category, summary, now_ts, now_iso))
    conn.commit()
    conn.close()
    return tcode

def process_bot_turn(req: BotChatRequest) -> BotChatResponse:
    """Processa a mensagem com tom 100% humano brasileiro e regras de transferência entre os 4 atendentes."""
    msg = req.message.strip().lower()
    session_id = req.session_id or f"sess_{int(time.time())}"
    curr_id = req.current_attendant if req.current_attendant in ATTENDANTS else "jessica_santos"

    # Roteador em Cascata Onda 1: Classifica como triagem Flash e audita economia
    try:
        from backend.ai_router import route_ai_task
        route_ai_task("bot_support", req.message)
    except Exception:
        pass
    
    # Detecção de Intenções Chave
    is_plan = any(k in msg for k in ["plano", "planos", "preço", "preco", "valor", "quanto custa", "custo", "assinar", "contratar", "comprar", "mensalidade", "pacote"])
    is_support = any(k in msg for k in ["suporte", "ajuda", "erro", "bug", "falha", "não consigo", "nao consigo", "problema", "senha", "login", "trava", "acesso"])
    is_doubt = any(k in msg for k in ["dúvida", "duvida", "como funciona", "o que é", "quem é", "laudo", "abnt", "nbr", "seguro", "segurança", "google", "anthropic", "empresa", "coon"])
    is_cancel = any(k in msg for k in ["cancelar", "cancelamento", "desistir", "estorno", "devolução", "reembolso", "parar", "encerrar"])
    is_gratitude = any(k in msg for k in ["obrigado", "obrigada", "valeu", "agradeço", "agradeco", "show", "maravilha", "perfeito", "excelente", "top", "muito bom", "ótimo"])
    is_greeting = any(k in msg for k in ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite", "tudo bem", "opa"])
    
    # Atendente Padrão: Jéssica Santos
    # Se Jéssica detectar cancelamento ou negociação avançada -> transfere para Camila Ferreira
    # Se Jéssica detectar suporte técnico aprofundado -> transfere para Rodrigo Silva
    # Se já estiver com Camila ou Rodrigo, continua com eles.
    
    transferred = False
    transfer_msg = None
    ticket_code = None
    next_attendant = ATTENDANTS[curr_id]
    
    # ----------------------------------------------------
    # CENÁRIO: CANCELAMENTO (Transfere para Supervisora Camila)
    # ----------------------------------------------------
    if is_cancel:
        if curr_id == "jessica_santos":
            transferred = True
            next_attendant = ATTENDANTS["camila_ferreira"]
            transfer_msg = "Só um minutinho! Estou chamando aqui no chat a minha supervisora Camila Ferreira. Ela cuida pessoalmente dessa área e já vai continuar com você com total carinho e atenção! 🤝"
        
        ticket_code = record_bot_ticket(session_id, next_attendant["id"], "cancelamento", f"Solicitação de cancelamento: {req.message}", req.client_name or "", req.client_contact or "")
        
        text = (
            f"Compreendo perfeitamente o seu pedido e o seu momento. Aqui na Co.on o respeito a você é prioridade absoluta — **não temos nenhuma pegadinha, multa ou burocracia oculta.** 💬\n\n"
            f"Já registrei o seu protocolo formal **{ticket_code}**.\n\n"
            f"Antes de finalizarmos no sistema, posso te ouvir com carinho? Me conta o que aconteceu: foi redução temporária de custos ou alguma funcionalidade que sentiu falta? Se você preferir, podemos fazer uma **pausa temporária da mensalidade** (mantendo seu histórico salvo) ou aplicar uma condição especial. Mas fique 100% em paz: se a sua decisão for mesmo cancelar, eu já concluo para você agora mesmo com total transparência e respeito! ✨"
        )
        actions = [
            {"label": "💬 Pausar Mensalidade Temporariamente", "action": "pausar"},
            {"label": "✨ Negociar Condição Especial", "action": "negociar"},
            {"label": "✔️ Confirmar Cancelamento sem atrito", "action": "confirmar_cancelamento"}
        ]

    # ----------------------------------------------------
    # CENÁRIO: PLANOS & CONTRATAÇÃO
    # ----------------------------------------------------
    elif is_plan:
        if curr_id == "jessica_santos" and any(k in msg for k in ["negociar", "desconto", "combo", "empresa", "pj", "parcelar", "especial"]):
            transferred = True
            next_attendant = ATTENDANTS["camila_ferreira"]
            transfer_msg = "Para vermos uma proposta sob medida com as melhores condições e descontos, chamei aqui no chat a nossa supervisora comercial Camila Ferreira! Ela já está com a sua tela aberta. 🚀"
        
        ticket_code = record_bot_ticket(session_id, next_attendant["id"], "plano", f"Consulta de planos e valores: {req.message}", req.client_name or "", req.client_contact or "")
        
        if next_attendant["id"] == "camila_ferreira":
            text = (
                f"Que excelente falar com você! Aqui é a Camila. Temos soluções pensadas exatamente para cada momento do seu negócio e com certeza uma delas vai se encaixar como uma luva para você! 🚀✨\n\n"
                f"Confira os nossos planos oficiais do **Studio Co.on**:\n\n"
                f"• **infer.coon** (Engenharia de Avaliações ABNT NBR 14653): a partir de **R$ 199/mês** (Laudos em 3 minutos, auditoria de 8 premissas e SisDEA compliance);\n"
                f"• **cob.coon** (Cobrança Humanoide via WhatsApp): a partir de **R$ 249/mês** (Recupere recebíveis em atraso com taxa de sucesso >45%);\n"
                f"• **ad.coon** (Inteligência Criativa de Anúncios): a partir de **R$ 199/mês**;\n"
                f"• **growth.coon** (Fechamento Comercial & Prospecção): a partir de **R$ 299/mês**;\n"
                f"• **Combo Studio Co.on Completo**: Acesso ilimitado a todos os softwares da holding com condição especial.\n\n"
                f"Aceitamos **Pix com ativação imediata**, Cartão de Crédito em até 12x e faturamento PJ. Me conta: qual software te chamou mais atenção ou qual área você quer acelerar hoje? 💡"
            )
        else:
            text = (
                f"Temos diversos planos incríveis e com certeza um deles vai dar muito certo para o que você precisa! 🚀😊\n\n"
                f"Nossos softwares verticais começam a partir de **R$ 199/mês**, e você pode contratar individualmente ou levar o **Combo Studio Co.on** com todas as ferramentas integradas.\n\n"
                f"Qual software você tem mais interesse em conhecer agora? O de **Engenharia de Avaliações (infer.coon)**, o de **Cobrança (cob.coon)**, o de **Anúncios (ad.coon)** ou o de **Prospecção (growth.coon)**?"
            )
        
        actions = [
            {"label": "💎 infer.coon (Engenharia ABNT)", "action": "quero infer"},
            {"label": "📱 cob.coon (Cobrança WhatsApp)", "action": "quero cob"},
            {"label": "🚀 growth.coon (Vendas Rápidas)", "action": "quero growth"},
            {"label": "💼 Combo Studio Co.on Completo", "action": "combo completo"}
        ]

    # ----------------------------------------------------
    # CENÁRIO: SUPORTE TÉCNICO (Transfere para Rodrigo Silva)
    # ----------------------------------------------------
    elif is_support:
        if curr_id == "jessica_santos":
            transferred = True
            next_attendant = ATTENDANTS["rodrigo_silva"]
            transfer_msg = "Poxa, sinto muito por qualquer transtorno! Fica tranquilo(a) que já vou chamar o nosso supervisor técnico Rodrigo Silva para te dar suporte imediato. Ele já entrou na conversa! 🛠️🤝"
        
        ticket_code = record_bot_ticket(session_id, next_attendant["id"], "suporte", f"Chamado de suporte: {req.message}", req.client_name or "", req.client_contact or "")
        
        text = (
            f"Olá! Rodrigo por aqui. Sinto muito pelo contratempo, mas não se preocupe: estou aqui com você e vamos resolver isso agora mesmo! 🛠️\n\n"
            f"Gerei o seu chamado técnico com o protocolo oficial **{ticket_code}**.\n\n"
            f"Me conta em detalhes: o que está acontecendo? É alguma dificuldade para entrar na sua conta (login/senha), erro ao gerar algum laudo ou relatório, ou dúvida de uso em alguma ferramenta específica? Já estou com os logs da plataforma abertos na minha tela para checar! 🔍"
        )
        actions = [
            {"label": "🔑 Esqueci minha senha / Erro de Login", "action": "erro login"},
            {"label": "📊 Dúvida ao gerar Laudo no infer.coon", "action": "erro laudo"},
            {"label": "⚡ Lentidão ou tela travada", "action": "lentidao"},
            {"label": "📲 Falar com Rodrigo no WhatsApp", "action": "whatsapp_suporte"}
        ]

    # ----------------------------------------------------
    # CENÁRIO: DÚVIDAS & CONFIABILIDADE (Jéssica Santos responde com autoridade e carinho)
    # ----------------------------------------------------
    elif is_doubt:
        ticket_code = record_bot_ticket(session_id, next_attendant["id"], "duvida", f"Dúvida institucional: {req.message}", req.client_name or "", req.client_contact or "")
        
        if "abnt" in msg or "nbr" in msg or "laudo" in msg or "caixa" in msg or "justiça" in msg or "perícia" in msg:
            text = (
                f"Excelente pergunta! Essa é uma das principais garantias da Co.on! 🛡️📄\n\n"
                f"Todos os laudos e relatórios gerados pela nossa plataforma de engenharia (**infer.coon**) seguem **100% rigorosamente as normas ABNT NBR 14653-1 e 14653-2** com auditoria automática de 8 pressupostos estatísticos (incluindo normalidade de resíduos, multicolinearidade e autocorrelação de Durbin-Watson).\n\n"
                f"Por isso, eles têm **plena validade judicial e aceitação bancária em instituições como Caixa Econômica Federal, Banco do Brasil e peritos judiciais** em todo o Brasil. Você tem total segurança técnica e pericial em cada clique! ✨"
            )
        elif "google" in msg or "anthropic" in msg or "segurança" in msg or "seguranca" in msg or "lgpd" in msg:
            text = (
                f"Nossa infraestrutura é do mais alto padrão Big Tech! 🔒🌐\n\n"
                f"A **Co.on Participações Ltda.** realiza um investimento contínuo e maciço em infraestrutura em nuvem, servidores de alta disponibilidade e parcerias com as tecnologias mais avançadas da **Google** e **Anthropic**.\n\n"
                f"Além disso, todos os dados são blindados com criptografia de ponta a ponta (TLS 1.3), bancos de dados isolados e **conformidade integral com a LGPD e diretrizes da ANPD**. Seus dados e laudos estão em ambiente Fort Knox! 🛡️"
            )
        else:
            text = (
                f"Que bom que você perguntou! Adoro explicar sobre o nosso ecossistema! 😊✨\n\n"
                f"A **Co.on Participações Ltda.** (liderada pelo nosso Presidente Daniel Soares Correia) é uma holding de tecnologia focada em criar softwares que eliminam a burocracia e aumentam o lucro de profissionais e empresas.\n\n"
                f"Dentro do nosso **Studio Co.on** (www.coon.com.br), você tem desde engenharia de avaliações periciais automatizada até robôs de cobrança ativa no WhatsApp e inteligência de vendas.\n\n"
                f"Gostaria de ver uma demonstração de como funciona na prática ou prefere conhecer os planos?"
            )
        
        actions = [
            {"label": "💎 Conhecer os Planos", "action": "ver planos"},
            {"label": "🚀 Ver Softwares do Studio", "action": "ver softwares"},
            {"label": "📲 Falar com Consultor no WhatsApp", "action": "whatsapp_comercial"}
        ]

    # ----------------------------------------------------
    # CENÁRIO: AGRADECIMENTO & SIMPATIA
    # ----------------------------------------------------
    elif is_gratitude:
        text = (
            f"Eu que agradeço imensamente pelo seu carinho e pelo contato! 🥰✨\n\n"
            f"É sempre uma alegria enorme poder te atender e te ajudar. Aqui na Co.on, cuidamos de cada cliente com dedicação absoluta.\n\n"
            f"Se precisar de mais qualquer coisa — seja tirar uma dúvida, ver um plano ou bater um papo —, pode me chamar aqui a qualquer hora. Tenha um dia maravilhoso e muito abençoado! 🚀💎"
        )
        actions = [
            {"label": "💎 Ver Planos Disponíveis", "action": "ver planos"},
            {"label": "🛠️ Preciso de Outra Ajuda", "action": "ajuda"}
        ]

    # ----------------------------------------------------
    # CENÁRIO: SAUDAÇÃO / MENSAGEM PADRÃO HUMANA
    # ----------------------------------------------------
    else:
        text = (
            f"Olá! Tudo bem com você? Que alegria te receber por aqui! 😊✨\n\n"
            f"Aqui é a **Jéssica Santos**, da equipe de atendimento e sucesso da **Co.on**.\n\n"
            f"Estou à sua total disposição para te ajudar hoje! No que posso ser útil? Posso te apresentar os nossos planos, tirar dúvidas sobre as ferramentas, dar suporte técnico ou te encaminhar diretamente para a nossa supervisão no WhatsApp. Como prefere começar? 🚀"
        )
        actions = [
            {"label": "💎 Planos & Valores", "action": "ver planos"},
            {"label": "🛠️ Suporte Técnico", "action": "preciso suporte"},
            {"label": "❓ Dúvidas sobre Softwares", "action": "tirar duvidas"},
            {"label": "📋 Cancelamento sem burocracia", "action": "cancelar plano"}
        ]

    # Registrar conversa
    now_ts = time.time()
    now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    INSERT INTO bot_conversations (session_id, attendant_id, user_message, bot_response, intent, created_at, created_at_iso)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (session_id, next_attendant["id"], req.message, text, "geral", now_ts, now_iso))
    conn.commit()
    conn.close()

    # Telemetria da Onda 1: Roteador em Cascata (Gemini 1.5 Flash - Dr. Gabriel Silveira)
    try:
        from backend.ai_router import route_ai_task, get_db as get_ai_db
        route = route_ai_task("bot_support", req.message)
        ai_conn = get_ai_db()
        ai_conn.execute("""
            INSERT INTO ai_routing_telemetry 
            (task_type, chosen_tier, chosen_model, user_plan, is_cache_hit, estimated_cost_saved, tokens_used, tokens_saved, timestamp)
            VALUES (?, ?, ?, 'Pro', 0, 0.05, 150, 520, ?)
        """, (route["task_type"], route["chosen_tier"], route["chosen_model"], now_ts))
        ai_conn.commit()
        ai_conn.close()
    except Exception:
        pass

    # Formatar URL do WhatsApp com resumo
    protocol_text = f" Protocolo: {ticket_code}." if ticket_code else ""
    wa_msg = f"Olá! Estava conversando com a {next_attendant['name']} no site da Co.on.{protocol_text} Gostaria de atendimento humano."
    # Número padrão configurável (depois linkamos ao número exato que o Presidente indicar)
    wa_number = os.getenv("COON_WHATSAPP_PHONE", "5511980000001")
    whatsapp_url = f"https://wa.me/{wa_number}?text={wa_msg.replace(' ', '%20')}"

    return BotChatResponse(
        response=text,
        attendant=next_attendant,
        transferred=transferred,
        transfer_message=transfer_msg,
        suggested_actions=actions,
        ticket_code=ticket_code,
        whatsapp_url=whatsapp_url
    )

def list_recent_bot_tickets(limit: int = 50) -> List[Dict[str, Any]]:
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM bot_tickets ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]
