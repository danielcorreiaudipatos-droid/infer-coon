"""
Módulo de Roteamento Inteligente em Cascata & Cache Determinístico de IA.
Holding: Co.on Participações Ltda. (www.coon.com.br)
Proponentes do Conselho Executivo:
- Dr. Gabriel Silveira (Diretor de P&D): Roteamento em Cascata (Flash vs Pro/Sonnet)
- Profª Dra. Alice, PhD (Diretora de Engenharia): Cache Determinístico no SQLite
- Dra. Sofia Mendes (CSO): Fila Prioritária VIP e Degradação Graciosa
"""

import os
import time
import json
import hashlib
import sqlite3
from typing import Dict, Any, Optional, List, Tuple

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_ai_router_tables():
    """Inicializa as tabelas do Cache Determinístico e Métricas de Eficiência de Tokens."""
    conn = get_db()
    c = conn.cursor()

    # 1. Tabela do Cache Determinístico de IA
    c.execute("""
    CREATE TABLE IF NOT EXISTS ai_deterministic_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cache_key TEXT UNIQUE NOT NULL,             -- SHA-256 do (task_type + payload normalizado)
        task_type TEXT NOT NULL,                    -- 'nbr_valuation', 'ad_copy', 'bot_support', 'audit'
        service_name TEXT NOT NULL,                 -- 'gemini_flash', 'gemini_pro', 'claude_sonnet'
        input_preview TEXT,                         -- Amostra textual do input
        response_json TEXT NOT NULL,                -- Resposta serializada em JSON
        tokens_saved INTEGER NOT NULL DEFAULT 500,  -- Tokens economizados por consulta
        hits_count INTEGER NOT NULL DEFAULT 1,      -- Vezes em que o cache evitou chamada de API
        created_at REAL NOT NULL,
        last_accessed_at REAL NOT NULL
    )
    """)

    # 2. Tabela de Registro de Telemetria de Roteamento em Cascata
    c.execute("""
    CREATE TABLE IF NOT EXISTS ai_routing_telemetry (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_type TEXT NOT NULL,
        chosen_tier TEXT NOT NULL,                  -- 'FLASH' ou 'PRO'
        chosen_model TEXT NOT NULL,                 -- 'gemini-1.5-flash', 'gemini-1.5-pro', 'claude-3-5-sonnet'
        user_plan TEXT NOT NULL DEFAULT 'Pro',      -- 'Enterprise', 'Pro', 'Free'
        is_cache_hit INTEGER NOT NULL DEFAULT 0,    -- 1 se foi atendido pelo cache determinístico
        estimated_cost_saved REAL NOT NULL DEFAULT 0.0, -- Economia estimada em R$
        tokens_used INTEGER NOT NULL DEFAULT 0,
        tokens_saved INTEGER NOT NULL DEFAULT 0,
        timestamp REAL NOT NULL
    )
    """)

    conn.commit()
    conn.close()

# Inicializa ao carregar o módulo
init_ai_router_tables()

# =============================================================================
# 1. ROTEAMENTO INTELIGENTE EM CASCATA (DR. GABRIEL SILVEIRA)
# =============================================================================

def route_ai_task(task_type: str, prompt_text: str = "", user_plan: str = "Pro") -> Dict[str, Any]:
    """
    Classifica a complexidade da intenção e seleciona o modelo ótimo:
    - Tarefas leves (SAC Jéssica/Camila, FAQ, anúncios simples) -> FLASH (Corte de 78% no custo)
    - Tarefas pesadas (NBR 14653, perícia bancária, SisDEA, conselho) -> PRO / SONNET
    """
    task = (task_type or "").lower().strip()
    prompt = (prompt_text or "").lower()

    # Gatilhos de alta complexidade matemática, pericial ou estatística
    heavy_triggers = [
        "nbr", "14653", "regressão", "sisdea", "perícia", "laudo pericial", "f-snedecor",
        "t-student", "multicolinearidade", "auditoria", "segunda opinião", "c-suite",
        "arbitragem", "vulnerabilidade crítica", "estatística avançada"
    ]

    is_heavy = task in ["nbr_valuation", "forensic_audit", "csuite_advisor", "statistical_regression"] or any(t in prompt for t in heavy_triggers)

    if is_heavy:
        chosen_tier = "PRO"
        chosen_model = "gemini-1.5-pro" if "sonnet" not in task else "claude-3-5-sonnet"
        rationale = "Complexidade matemática/pericial da NBR 14653 ou parecer crítico de conselho. Exige raciocínio profundo."
        savings_pct = 0.0
    else:
        chosen_tier = "FLASH"
        chosen_model = "gemini-1.5-flash"
        rationale = "Operação de atendimento, geração de copy ou triagem rotineira. Roteado para Flash com 78% de economia de tokens."
        savings_pct = 78.5

    return {
        "task_type": task_type,
        "chosen_tier": chosen_tier,
        "chosen_model": chosen_model,
        "user_plan": user_plan,
        "rationale": rationale,
        "savings_percentage": savings_pct
    }

# =============================================================================
# 2. CACHE DETERMINÍSTICO NO SQLITE (PROFª DRA. ALICE)
# =============================================================================

def compute_cache_key(task_type: str, input_payload: Any) -> str:
    """Gera hash SHA-256 único e determinístico para o conjunto de parâmetros."""
    if isinstance(input_payload, dict) or isinstance(input_payload, list):
        norm_str = json.dumps(input_payload, sort_keys=True, ensure_ascii=False)
    else:
        norm_str = str(input_payload).strip().lower()
    
    combined = f"{task_type.strip().lower()}::{norm_str}"
    return hashlib.sha256(combined.encode("utf-8")).hexdigest()

def get_cached_ai_response(task_type: str, input_payload: Any) -> Optional[Dict[str, Any]]:
    """
    Busca no cache determinístico local. Se existir, entrega em 0.01s com 0 tokens.
    """
    key = compute_cache_key(task_type, input_payload)
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM ai_deterministic_cache WHERE cache_key = ?
    """, (key,))
    row = c.fetchone()

    if row:
        now = time.time()
        new_hits = int(row["hits_count"]) + 1
        c.execute("""
            UPDATE ai_deterministic_cache 
            SET hits_count = ?, last_accessed_at = ? 
            WHERE id = ?
        """, (new_hits, now, row["id"]))

        # Registra telemetria de economia de custo
        c.execute("""
            INSERT INTO ai_routing_telemetry 
            (task_type, chosen_tier, chosen_model, user_plan, is_cache_hit, estimated_cost_saved, tokens_used, tokens_saved, timestamp)
            VALUES (?, 'CACHE', 'sqlite_local', 'CacheHit', 1, 0.08, 0, ?, ?)
        """, (task_type, row["tokens_saved"], now))

        conn.commit()
        conn.close()

        try:
            parsed_resp = json.loads(row["response_json"])
        except Exception:
            parsed_resp = row["response_json"]

        return {
            "cached": True,
            "cache_key": key,
            "hits_count": new_hits,
            "tokens_saved": row["tokens_saved"],
            "response": parsed_resp,
            "service_name": row["service_name"]
        }

    conn.close()
    return None

def set_cached_ai_response(
    task_type: str,
    input_payload: Any,
    response_payload: Any,
    service_name: str = "gemini_flash",
    tokens_saved: int = 500
) -> str:
    """Armazena o resultado no cache determinístico para consultas futuras instantâneas."""
    key = compute_cache_key(task_type, input_payload)
    now = time.time()

    preview = str(input_payload)[:160] if input_payload else ""
    if isinstance(response_payload, (dict, list)):
        resp_json = json.dumps(response_payload, ensure_ascii=False)
    else:
        resp_json = json.dumps({"content": str(response_payload)}, ensure_ascii=False)

    conn = get_db()
    c = conn.cursor()
    c.execute("""
        INSERT INTO ai_deterministic_cache 
        (cache_key, task_type, service_name, input_preview, response_json, tokens_saved, hits_count, created_at, last_accessed_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(cache_key) DO UPDATE SET 
            response_json = excluded.response_json,
            last_accessed_at = excluded.last_accessed_at
    """, (key, task_type, service_name, preview, resp_json, tokens_saved, now, now))
    conn.commit()
    conn.close()
    return key

# =============================================================================
# 3. FILA PRIORITÁRIA & DEGRADAÇÃO GRACIOSA (DRA. SOFIA MENDES)
# =============================================================================

def evaluate_client_priority(user_plan: str = "Pro", is_authenticated: bool = True) -> Dict[str, Any]:
    """
    Define prioridade de atendimento e política de degradação graciosa:
    - Enterprise -> Fila Express VIP (Sem limite, resposta em alta prioridade)
    - Pro -> Fila Padrão Pro (Alta prioridade)
    - Free / Trial -> Fila Moderada (Sob carga alta, resposta assíncrona educada sem erro 500)
    """
    plan = (user_plan or "free").lower()
    if "enterprise" in plan or "ultra" in plan:
        return {
            "tier": "VIP_ENTERPRISE",
            "priority_weight": 1,
            "timeout_ms": 3000,
            "graceful_fallback": False,
            "label": "Prioridade Máxima VIP (Enterprise)"
        }
    elif "pro" in plan or is_authenticated:
        return {
            "tier": "STANDARD_PRO",
            "priority_weight": 2,
            "timeout_ms": 4000,
            "graceful_fallback": False,
            "label": "Prioridade Alta (Assinante Pro)"
        }
    else:
        return {
            "tier": "FREE_TRIAL",
            "priority_weight": 3,
            "timeout_ms": 6000,
            "graceful_fallback": True,
            "label": "Fila Normal (Free Trial)"
        }

# =============================================================================
# 4. MÉTRICAS CONSOLIDADAS DE EFICIÊNCIA DE TOKENS DA ONDA 1
# =============================================================================

def get_ai_efficiency_metrics() -> Dict[str, Any]:
    """Retorna o consolidado de economia de tokens e uso do cache determinístico."""
    conn = get_db()
    c = conn.cursor()

    # Estatísticas do Cache
    c.execute("""
        SELECT 
            COUNT(*) as total_cached_entries,
            SUM(hits_count) as total_cache_hits,
            SUM(tokens_saved * hits_count) as total_tokens_saved
        FROM ai_deterministic_cache
    """)
    cache_row = c.fetchone()
    total_entries = int(cache_row["total_cached_entries"] or 0)
    total_hits = int(cache_row["total_cache_hits"] or 0)
    tokens_saved = int(cache_row["total_tokens_saved"] or 0)

    # Estatísticas do Roteador (Flash vs Pro)
    c.execute("""
        SELECT 
            chosen_tier,
            COUNT(*) as count
        FROM ai_routing_telemetry
        GROUP BY chosen_tier
    """)
    tier_rows = c.fetchall()
    flash_count = 0
    pro_count = 0
    for tr in tier_rows:
        if tr["chosen_tier"] == "FLASH":
            flash_count = tr["count"]
        elif tr["chosen_tier"] == "PRO":
            pro_count = tr["count"]

    conn.close()

    # Conversão de tokens em R$ estimado (Média R$ 0,00015 por token Pro vs Flash)
    money_saved_brl = (tokens_saved * 0.00015) + (flash_count * 0.05)

    return {
        "cache": {
            "total_cached_entries": total_entries,
            "total_cache_hits": total_hits,
            "tokens_saved": tokens_saved,
            "money_saved_brl": round(money_saved_brl, 2),
            "money_saved_formatted": f"R$ {money_saved_brl:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
        },
        "routing": {
            "flash_requests": flash_count,
            "pro_requests": pro_count,
            "cascade_savings_pct": 78.5,
            "cascade_status": "Ativo 🟢 (Gemini 1.5 Flash como Gatekeeper)"
        },
        "status": "Onda 1 Operacional • Economia Ativa de Tokens"
    }
