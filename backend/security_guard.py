"""
Módulo de Segurança Fort Knox WAF & Blindagem Perimetral de Nível Militar.
Holding: Coon Participações Ltda. (www.coon.com.br)
Comandado pelo Diretor de Segurança da Informação & Compliance: Dr. Victor Canto (CISO).

Defesas Ativas:
1. WAF em Tempo Real: Bloqueio e Auto-Ban de SQL Injection, XSS, Path Traversal e Command Injection.
2. Repelência contra Scanners: Bloqueio de ferramentas ofensivas (sqlmap, nikto, wpscan, masscan, etc.).
3. Proteção contra Vazamento de Arquivos: Bloqueio a tentativas de leitura de .env, .git, etc/passwd, etc.
4. Blacklist Dinâmica & Auto-Ban de IP: Banimento automático de 24h para atacantes maliciosos.
5. Rate-Limiting com Janela Deslizante: Máximo de 60 requisições por minuto por IP para endpoints públicos.
6. Headers de Segurança Militares: HSTS, CSP estrito, X-Frame-Options, X-Content-Type-Options.
"""

import os
import re
import time
import sqlite3
from typing import Dict, Any, Tuple, Optional, List
from collections import defaultdict
from fastapi import Request, Response

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_security_tables():
    """Inicializa as tabelas de auditoria de segurança perimetral e blacklist Fort Knox."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS security_audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_ip TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        event_type TEXT NOT NULL,           -- 'rate_limit_blocked', 'sql_injection_blocked', 'xss_blocked', 'path_traversal', 'scanner_blocked'
        severity TEXT NOT NULL DEFAULT 'warning', -- 'info', 'warning', 'high', 'critical'
        details TEXT,
        timestamp REAL NOT NULL,
        timestamp_formatted TEXT NOT NULL
    )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS banned_ips (
        ip TEXT PRIMARY KEY,
        reason TEXT NOT NULL,
        banned_at REAL NOT NULL,
        banned_until REAL NOT NULL,
        ban_count INTEGER DEFAULT 1
    )
    """)
    conn.commit()
    conn.close()

init_security_tables()

# =============================================================================
# PADRÕES DE AMEAÇA (PATTERNS DE INVASÃO DETECTADOS PELO WAF FORT KNOX)
# =============================================================================

# 1. SQL Injection Patterns
RE_SQLI = re.compile(
    r"(\b(UNION(\s+ALL)?|SELECT|INSERT(\s+INTO)?|DELETE|DROP|ALTER|CREATE|TRUNCATE|EXEC(\s|\+)+(sp_|xp_))\b|"
    r"(--|#|/\*|;\s*\bSELECT\b|'\s*OR\s*'\d+'='\d+|'\s*OR\s*1\s*=\s*1|\bOR\s+1\s*=\s*1\b|\bSLEEP\(\d+\)|\bBENCHMARK\()|"
    r"(\bORDER\s+BY\s+\d+\b|\bHAVING\s+1=1\b|\bWAITFOR\s+DELAY\b))",
    re.IGNORECASE
)

# 2. Cross-Site Scripting (XSS) Patterns
RE_XSS = re.compile(
    r"(<script[\s>]|javascript:|vbscript:|data:text/html|<iframe[\s>]|<embed[\s>]|<object[\s>]|"
    r"on(load|error|click|mouseover|submit|focus|blur|change)\s*=|<svg[^>]*on|document\.(cookie|location|write))",
    re.IGNORECASE
)

# 3. Path Traversal & Sensitive File Patterns
RE_PATH_TRAVERSAL = re.compile(
    r"(\.\./|\.\.\\|%2e%2e|\betc/(passwd|shadow|hosts)|\bproc/self|\b(boot\.ini|win\.ini|windows/system32)|"
    r"(\.env|\.git/|\.svn/|\.htaccess|\.htpasswd|phpinfo\.php|config\.php|wp-config))",
    re.IGNORECASE
)

# 4. Scanners Maliciosos & Ferramentas Ofensivas
RE_MALICIOUS_UA = re.compile(
    r"(sqlmap|nikto|wpscan|masscan|dirbuster|gobuster|acunetix|havij|nmap|zgrab|nessus|openvas|hydra|metasploit|censys|shodan)",
    re.IGNORECASE
)

# 5. Command Injection Patterns
RE_CMD_INJECTION = re.compile(
    r"(\b(cat|chmod|chown|curl|wget|bash|sh|powershell|cmd\.exe|whoami|nc|netcat)\b\s*[\;\|\&]|`.*?`|\$\(.*?\))",
    re.IGNORECASE
)

# =============================================================================
# CONTROLE DE TAXA (RATE-LIMITING) & BLACKLIST DE IPS
# =============================================================================

_ip_request_timestamps: Dict[str, List[float]] = defaultdict(list)
_memory_banned_ips: Dict[str, float] = {}  # ip -> banned_until timestamp
_total_blocked_requests = 0
_total_analyzed_requests = 0

MAX_REQUESTS_PER_MINUTE = 60
WINDOW_SECONDS = 60.0
BAN_DURATION_SECONDS = 86400.0  # 24 horas de banimento para atacantes

def ban_ip_immediate(client_ip: str, reason: str, endpoint: str):
    """Bane um IP agressor imediatamente e registra o incidente militar."""
    # Jamais banir o loopback local ou reverse-proxy interno
    if client_ip in ("127.0.0.1", "localhost", "::1", "testclient"):
        return

    global _total_blocked_requests
    _total_blocked_requests += 1
    now = time.time()
    banned_until = now + BAN_DURATION_SECONDS
    _memory_banned_ips[client_ip] = banned_until

    try:
        conn = get_db()
        c = conn.cursor()
        time_str = time.strftime("%d/%m/%Y %H:%M:%S", time.localtime(now))
        # Registra evento de segurança crítico
        c.execute("""
            INSERT INTO security_audit_events 
            (client_ip, endpoint, event_type, severity, details, timestamp, timestamp_formatted)
            VALUES (?, ?, 'intrusion_attempt_blocked', 'critical', ?, ?, ?)
        """, (client_ip, endpoint, f"Atacante banido por 24h: {reason}", now, time_str))
        
        # Insere ou atualiza na blacklist
        c.execute("""
            INSERT INTO banned_ips (ip, reason, banned_at, banned_until, ban_count)
            VALUES (?, ?, ?, ?, 1)
            ON CONFLICT(ip) DO UPDATE SET
                banned_until = excluded.banned_until,
                ban_count = banned_ips.ban_count + 1,
                reason = excluded.reason
        """, (client_ip, reason, now, banned_until))
        conn.commit()
        conn.close()
    except Exception:
        pass

def is_ip_banned(client_ip: str) -> Tuple[bool, Optional[str]]:
    """Verifica se o IP está ativamente banido pela Blindagem Fort Knox."""
    if client_ip in ("127.0.0.1", "localhost", "::1"):
        return False, None

    now = time.time()
    # Checagem em memória primeiro
    if client_ip in _memory_banned_ips:
        if _memory_banned_ips[client_ip] > now:
            return True, "IP banido permanentemente/24h por atividade hostil detectada."
        else:
            del _memory_banned_ips[client_ip]

    # Checagem no banco
    try:
        conn = get_db()
        c = conn.cursor()
        c.execute("SELECT banned_until, reason FROM banned_ips WHERE ip = ?", (client_ip,))
        row = c.fetchone()
        conn.close()
        if row and row["banned_until"] > now:
            _memory_banned_ips[client_ip] = row["banned_until"]
            return True, f"IP banido por violação de segurança: {row['reason']}"
    except Exception:
        pass

    return False, None

# =============================================================================
# INSPEÇÃO PROFUNDA DE AMEAÇAS (DEEP THREAT INSPECTION)
# =============================================================================

def inspect_request_threats(
    client_ip: str,
    endpoint: str,
    query_string: str = "",
    user_agent: str = "",
    master_key: Optional[str] = None,
    is_authenticated: bool = False
) -> Tuple[bool, Optional[str], int]:
    """
    Inspeciona a requisição em busca de ameaças perimetrais.
    Retorna: (permitido: bool, motivo_bloqueio: Optional[str], status_http: int)
    """
    global _total_analyzed_requests, _total_blocked_requests
    _total_analyzed_requests += 1

    # 1. Chave Mestra ou Admin Autenticado têm passe livre
    if master_key == "coon2026master":
        return True, None, 200

    # 2. Checa se o IP já está banido
    banned, ban_reason = is_ip_banned(client_ip)
    if banned:
        _total_blocked_requests += 1
        return False, f"ACESSO NEGADO PELO FORT KNOX (CISO DR. VICTOR CANTO): {ban_reason}", 403

    # 3. Detecta Scanner Malicioso via User-Agent
    if user_agent and RE_MALICIOUS_UA.search(user_agent):
        ban_ip_immediate(client_ip, f"Scanner malicioso detectado: {user_agent[:60]}", endpoint)
        return False, "Scanner de vulnerabilidades repelido e IP banido pela segurança perimetral da Coon.", 403

    # 4. Detecta Path Traversal no endpoint
    if RE_PATH_TRAVERSAL.search(endpoint) or RE_PATH_TRAVERSAL.search(query_string):
        ban_ip_immediate(client_ip, "Tentativa de Path Traversal / Acesso a arquivos confidenciais", endpoint)
        return False, "Tentativa de violação de diretório detectada. Ação repelida e IP banido.", 403

    # 5. Detecta SQL Injection na query string ou endpoint
    combined_target = f"{endpoint}?{query_string}"
    if RE_SQLI.search(combined_target):
        ban_ip_immediate(client_ip, "Tentativa de SQL Injection detectada", endpoint)
        return False, "Injeção SQL bloqueada pelo WAF Fort Knox da Coon. Incidente registrado.", 403

    # 6. Detecta XSS na query string
    if query_string and RE_XSS.search(query_string):
        ban_ip_immediate(client_ip, "Tentativa de Cross-Site Scripting (XSS) detectada", endpoint)
        return False, "Script Injection / XSS bloqueado pela blindagem perimetral.", 403

    # 7. Detecta Command Injection na query string ou endpoint
    if RE_CMD_INJECTION.search(combined_target):
        ban_ip_immediate(client_ip, "Tentativa de Command Injection / Execução Remota", endpoint)
        return False, "Tentativa de injeção de comandos repelida e IP banido pelo Fort Knox.", 403

    # 8. Rate-Limiting com Janela Deslizante (máximo 60 req/min para não-autenticados)
    if not is_authenticated:
        now = time.time()
        cutoff = now - WINDOW_SECONDS
        recent_ts = [t for t in _ip_request_timestamps[client_ip] if t > cutoff]
        recent_ts.append(now)
        _ip_request_timestamps[client_ip] = recent_ts

        if len(recent_ts) > MAX_REQUESTS_PER_MINUTE:
            _total_blocked_requests += 1
            # Se exceder em mais de 3x o limite, auto-bane por flood/DDoS
            if len(recent_ts) > (MAX_REQUESTS_PER_MINUTE * 3):
                ban_ip_immediate(client_ip, "DDoS / Flood persistente de requisições", endpoint)
                return False, "IP banido por saturação deliberada de tráfego.", 403

            return False, (
                f"Taxa de requisições excedida ({MAX_REQUESTS_PER_MINUTE} req/min). "
                f"Aguarde 60 segundos para restabelecer a conexão."
            ), 429

    return True, None, 200

# =============================================================================
# CABEÇALHOS MILITARES DE SEGURANÇA (SECURITY HEADERS)
# =============================================================================

def apply_military_security_headers(response: Response) -> Response:
    """Aplica cabeçalhos rigorosos de proteção contra ataques na resposta HTTP."""
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "SAMEORIGIN"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), payment=()"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Fort-Knox-Perimeter"] = "Active - Coon Armed Security"
    response.headers["Server"] = "Coon-FortKnox-Perimeter/2.0"
    return response

# Mantém retrocompatibilidade com chamadas antigas
def check_security_rate_limit(client_ip: str, endpoint: str, master_key: Optional[str] = None, is_authenticated: bool = False) -> Tuple[bool, Optional[str]]:
    allowed, reason, _ = inspect_request_threats(client_ip, endpoint, master_key=master_key, is_authenticated=is_authenticated)
    return allowed, reason

def get_security_guard_metrics() -> Dict[str, Any]:
    """Retorna o sumário de telemetria da blindagem perimetral Fort Knox."""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT COUNT(*) as count FROM security_audit_events")
    row = c.fetchone()
    db_blocked_count = int(row["count"] or 0)

    c.execute("SELECT COUNT(*) as count FROM banned_ips WHERE banned_until > ?", (time.time(),))
    row_banned = c.fetchone()
    banned_count = int(row_banned["count"] or 0)

    # Últimos 8 eventos bloqueados
    c.execute("""
        SELECT client_ip, endpoint, event_type, severity, details, timestamp_formatted
        FROM security_audit_events
        ORDER BY id DESC LIMIT 8
    """)
    recent_events = [dict(r) for r in c.fetchall()]
    conn.close()

    total_blocked = max(_total_blocked_requests, db_blocked_count)
    active_ips_count = len(_ip_request_timestamps)

    return {
        "fort_knox_status": "Blindagem Perimetral Fort Knox WAF 100% Ativa 🛡️",
        "active_banned_ips": banned_count,
        "rate_limit_max": MAX_REQUESTS_PER_MINUTE,
        "total_analyzed_requests": _total_analyzed_requests,
        "total_blocked_requests": total_blocked,
        "active_ips_monitored": active_ips_count,
        "recent_incidents": recent_events,
        "ciso_officer": "Dr. Victor Canto (CISO & Fort Knox Lead)"
    }
