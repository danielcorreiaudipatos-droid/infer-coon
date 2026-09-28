"""
Módulo de Segurança Fort Knox & Rate-Limiting Perimetral.
Holding: Co.on Participações Ltda. (www.coon.com.br)
Comandado pelo Diretor de Segurança da Informação & Compliance: Dr. Victor Canto (CISO).

Implementa:
1. Rate-Limiting Estrito: Máximo de 60 requisições por minuto por IP para endpoints públicos.
2. Proteção Anti-Scraping: Repelência contra bots e drenagem indevida de créditos de APIs.
3. Auditoria de Incidentes em SQLite: Histórico auditável de tentativas bloqueadas.
4. Fila Expressa para Administradores e Usuários Autenticados.
"""

import os
import time
import sqlite3
from typing import Dict, Any, Tuple, Optional, List
from collections import defaultdict

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_security_tables():
    """Inicializa as tabelas de auditoria de segurança perimetral Fort Knox."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS security_audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_ip TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        event_type TEXT NOT NULL,           -- 'rate_limit_blocked', 'scraper_detected', 'auth_bypass_attempt'
        severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'high', 'critical'
        details TEXT,
        timestamp REAL NOT NULL,
        timestamp_formatted TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

init_security_tables()

# =============================================================================
# CONTROLE DE TAXA (RATE-LIMITING) EM MEMÓRIA COM JANELA DESLIZANTE DE 60 SEGUNDOS
# =============================================================================

# IP -> lista de timestamps das requisições recentes
_ip_request_timestamps: Dict[str, List[float]] = defaultdict(list)
_total_blocked_requests = 0
_total_analyzed_requests = 0

# Configurações do Dr. Victor Canto
MAX_REQUESTS_PER_MINUTE = 60
WINDOW_SECONDS = 60.0

def check_security_rate_limit(
    client_ip: str,
    endpoint: str,
    master_key: Optional[str] = None,
    is_authenticated: bool = False
) -> Tuple[bool, Optional[str]]:
    """
    Verifica se a requisição está dentro dos limites de segurança perimetral.
    - Requisições autenticadas com Chave Mestra ou sessão ativa têm bypass seguro.
    - Requisições públicas são auditadas e limitadas a 60 req/min por IP.
    """
    global _total_blocked_requests, _total_analyzed_requests
    _total_analyzed_requests += 1

    # 1. Bypass seguro para Presidência e Chave Mestra
    if master_key == "coon2026master" or is_authenticated:
        return True, None

    now = time.time()
    cutoff = now - WINDOW_SECONDS

    # Limpeza de timestamps antigos da janela deslizante
    recent_ts = [t for t in _ip_request_timestamps[client_ip] if t > cutoff]
    recent_ts.append(now)
    _ip_request_timestamps[client_ip] = recent_ts

    req_count = len(recent_ts)

    # 2. Avaliação de limite
    if req_count > MAX_REQUESTS_PER_MINUTE:
        _total_blocked_requests += 1
        
        # Registra incidente no banco para auditoria do Dr. Victor
        try:
            conn = get_db()
            c = conn.cursor()
            time_str = time.strftime("%d/%m/%Y %H:%M:%S", time.localtime(now))
            c.execute("""
                INSERT INTO security_audit_events 
                (client_ip, endpoint, event_type, severity, details, timestamp, timestamp_formatted)
                VALUES (?, ?, 'rate_limit_blocked', 'warning', ?, ?, ?)
            """, (client_ip, endpoint, f"Excedeu limite de {MAX_REQUESTS_PER_MINUTE} req/min (Total: {req_count} reqs na janela)", now, time_str))
            conn.commit()
            conn.close()
        except Exception:
            pass

        return False, (
            f"Requisição bloqueada pela Proteção Perimetral Fort Knox (Dr. Victor Canto). "
            f"Limite de {MAX_REQUESTS_PER_MINUTE} requisições por minuto por IP excedido. "
            f"Aguarde 60 segundos para restabelecer a conexão."
        )

    return True, None

def get_security_guard_metrics() -> Dict[str, Any]:
    """Retorna o sumário de telemetria da blindagem perimetral Fort Knox."""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as count FROM security_audit_events")
    row = c.fetchone()
    db_blocked_count = int(row["count"] or 0)

    # Últimos 5 eventos bloqueados
    c.execute("""
        SELECT client_ip, endpoint, event_type, details, timestamp_formatted
        FROM security_audit_events
        ORDER BY id DESC LIMIT 5
    """)
    recent_events = [dict(r) for r in c.fetchall()]
    conn.close()

    total_blocked = max(_total_blocked_requests, db_blocked_count)
    active_ips_count = len(_ip_request_timestamps)

    return {
        "fort_knox_status": "Blindagem Perimetral Ativa 🛡️",
        "rate_limit_max": MAX_REQUESTS_PER_MINUTE,
        "total_analyzed_requests": _total_analyzed_requests,
        "total_blocked_requests": total_blocked,
        "active_ips_monitored": active_ips_count,
        "recent_incidents": recent_events,
        "ciso_officer": "Dr. Victor Canto (CISO & Fort Knox)"
    }
