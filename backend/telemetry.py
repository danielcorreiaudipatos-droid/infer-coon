"""
Módulo de Telemetria, Auditoria e Diagnóstico Ativo por IA (Alice AI Watchdog).
Holding COON Soluções Tecnológicas (www.coon.com.br).

Monitora o uso dos clientes nos 6 softwares da holding, registra falhas de requisição
e gera diagnósticos automáticos em português claro para a Diretoria e Suporte.
"""

import os
import time
import json
import sqlite3
import traceback
from typing import Dict, Any, Optional, List

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_telemetry_and_access_tables():
    """Cria e atualiza as tabelas de controle de acessos, logs e diagnósticos de IA."""
    conn = get_db()
    c = conn.cursor()

    # 1. Garantir colunas 'status' e 'role' em users
    try:
        c.execute("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'client'")
    except Exception:
        pass
    try:
        c.execute("ALTER TABLE users ADD COLUMN phone TEXT")
    except Exception:
        pass

    # 2. Tabela de Acessos Granulares por Aplicativo (Kill-Switch por App)
    c.execute("""
    CREATE TABLE IF NOT EXISTS app_access (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        app_id TEXT NOT NULL,                     -- 'infer', 'ad', 'growth', 'cob', 'imob', 'check'
        plan_id TEXT NOT NULL DEFAULT 'pro',      -- 'starter', 'pro', 'ultra'
        billing_cycle TEXT DEFAULT 'monthly',     -- 'monthly', 'annual'
        status TEXT DEFAULT 'active',             -- 'active', 'locked_payment', 'manual_lock'
        expires_at REAL,
        created_at REAL NOT NULL,
        UNIQUE(user_id, app_id)
    )
    """)

    # 3. Tabela de Logs de Telemetria e Erros em Tempo Real
    c.execute("""
    CREATE TABLE IF NOT EXISTS client_audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        user_email TEXT,
        app_id TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        http_method TEXT NOT NULL,
        status_code INTEGER NOT NULL,
        error_message TEXT,
        request_snippet TEXT,
        client_ip TEXT,
        timestamp REAL NOT NULL
    )
    """)

    # 4. Tabela do Observatório de IA (Diagnósticos da Alice AI)
    c.execute("""
    CREATE TABLE IF NOT EXISTS ai_diagnostics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER REFERENCES users(id),
        user_email TEXT,
        app_id TEXT NOT NULL,
        log_id INTEGER REFERENCES client_audit_logs(id),
        error_summary TEXT NOT NULL,
        ai_human_diagnosis TEXT NOT NULL,
        ai_suggested_fix TEXT NOT NULL,
        severity TEXT DEFAULT 'medium',           -- 'low', 'medium', 'critical'
        resolved BOOLEAN DEFAULT 0,
        created_at REAL NOT NULL
    )
    """)

    conn.commit()
    conn.close()

def generate_ai_diagnosis(app_id: str, endpoint: str, error_message: str, request_snippet: str = "") -> Dict[str, str]:
    """
    Motor Heurístico & Cognitivo da Alice AI para traduzir exceções técnicas
    em diagnósticos compreensíveis e planos de ação para a Diretoria / Suporte.
    """
    err = (error_message or "").lower()
    app = (app_id or "holding").lower()
    
    # 1. infer.coon (Engenharia Civil & ABNT NBR 14653)
    if "infer" in app or "regression" in endpoint:
        if "singular" in err or "multicollinear" in err or "linAlg" in err:
            return {
                "error_summary": "Singularidade Matricial na Regressão (Colinearidade)",
                "ai_human_diagnosis": "O perito inseriu amostras onde duas ou mais variáveis independentes possuem variação idêntica (ex: Área Útil e Área Total idênticas). A matriz OLS não pode ser invertida matematicamente.",
                "ai_suggested_fix": "Instruir o perito a remover uma das variáveis redundantes ou variar os dados amostrais conforme item 8 da NBR 14653-2.",
                "severity": "medium"
            }
        elif "sample" in err or "amostra" in err or "degrees of freedom" in err:
            return {
                "error_summary": "Graus de Liberdade Insuficientes (NBR 14653)",
                "ai_human_diagnosis": "Número de amostras ativas é menor que o mínimo exigido para o número de variáveis selecionadas (n < k + 1).",
                "ai_suggested_fix": "Orientar o cliente a adicionar mais dados de mercado ou reduzir variáveis independentes para atingir o Grau I no mínimo.",
                "severity": "low"
            }
        elif "shapiro" in err or "normal" in err:
            return {
                "error_summary": "Falha no Teste de Normalidade dos Resíduos (Shapiro-Wilk)",
                "ai_human_diagnosis": "Os resíduos da regressão do perito não seguem distribuição gaussiana (p-valor < 0,01), o que rebaixa o enquadramento na NBR 14653.",
                "ai_suggested_fix": "Sugerir a aplicação de transformação logarítmica ln(Y) ou exclusão de outliers com distância de Cook > 1.",
                "severity": "low"
            }

    # 2. ad.coon (Tráfego & Anúncios Multicanal)
    if "ad" in app or "campaign" in endpoint:
        if "token" in err or "auth" in err or "oauth" in err:
            return {
                "error_summary": "Conexão Expirada com a Rede Social",
                "ai_human_diagnosis": "O token de permissão do Facebook/Instagram ou Google Ads da empresa expirou ou foi revogado no gerenciador.",
                "ai_suggested_fix": "Pedir para o cliente clicar em 'Reconectar Contas' no ad.coon para renovar a autorização de publicação.",
                "severity": "medium"
            }
        elif "budget" in err or "saldo" in err or "wallet" in err:
            return {
                "error_summary": "Saldo Insuficiente na AdWallet",
                "ai_human_diagnosis": "A empresa tentou ativar uma campanha sem créditos pré-pagos disponíveis na carteira Pix.",
                "ai_suggested_fix": "Enviar link de recarga Pix instantânea de R$ 100 ou R$ 250 via WhatsApp para a campanha ir ao ar.",
                "severity": "low"
            }
        elif "image" in err or "media" in err or "upload" in err:
            return {
                "error_summary": "Arquivo de Mídia Incompatível",
                "ai_human_diagnosis": "O criativo enviado excede o limite de tamanho ou formato não suportado pela rede social (ex: WEBP em vez de JPG/PNG).",
                "ai_suggested_fix": "Avisar o lojista para utilizar formatos JPG/PNG de até 15MB.",
                "severity": "low"
            }

    # 3. cob.coon (Cobrança Humanoide via WhatsApp)
    if "cob" in app:
        if "phone" in err or "whatsapp" in err or "format" in err:
            return {
                "error_summary": "Telefone do Devedor Inválido",
                "ai_human_diagnosis": "O número de WhatsApp cadastrado na planilha não possui o nono dígito ou DDD válido do Brasil.",
                "ai_suggested_fix": "Verificar com o cliente o número correto para garantir a entrega da régua amigável de cobrança.",
                "severity": "low"
            }
        elif "pix" in err or "gateway" in err or "asaas" in err:
            return {
                "error_summary": "Falha na Criação da Chave Pix Dinâmica",
                "ai_human_diagnosis": "Instabilidade temporária na API do Bacen ou gateway bancário ao emitir o Pix Copia e Cola com desconto.",
                "ai_suggested_fix": "Reenviar a requisição automaticamente. O sistema efetuará nova tentativa em 30 segundos.",
                "severity": "critical"
            }

    # 4. imob.coon (Split Pix & Gestão Imobiliária)
    if "imob" in app or "split" in endpoint:
        if "cpf" in err or "cnpj" in err:
            return {
                "error_summary": "Chave Pix do Proprietário Inválida",
                "ai_human_diagnosis": "O CPF/CNPJ de repasse do proprietário ou da imobiliária está com dígitos incorretos.",
                "ai_suggested_fix": "Orientar o financeiro da imobiliária a validar a chave Pix do beneficiário.",
                "severity": "medium"
            }

    # 5. Erros Globais (Banco, Limites de IA e Conexão)
    if "rate limit" in err or "429" in err:
        return {
            "error_summary": "Limite Temporário de Requisições de IA",
            "ai_human_diagnosis": "O cliente executou muitas gerações consecutivas em curto intervalo.",
            "ai_suggested_fix": "A requisição foi enfileirada e será processada automaticamente em 15 segundos.",
            "severity": "low"
        }
    elif "locked" in err or "payment" in err or "assinatura" in err:
        return {
            "error_summary": "Acesso Bloqueado por Assinatura Pendente",
            "ai_human_diagnosis": "O cliente tentou utilizar o módulo sem fatura quitada no ciclo vigente.",
            "ai_suggested_fix": "Enviar mensagem comercial oferecendo condição especial ou chave Pix para liberação imediata.",
            "severity": "low"
        }

    # Fallback Geral Inteligente
    return {
        "error_summary": f"Erro Operacional em {endpoint}",
        "ai_human_diagnosis": f"Houve uma exceção durante o processamento da requisição: {error_message[:160]}.",
        "ai_suggested_fix": "Verificar os dados enviados pelo cliente ou acionar o suporte técnico da COON.",
        "severity": "medium"
    }

def record_client_error_and_diagnose(
    user_id: Optional[int],
    user_email: Optional[str],
    app_id: str,
    endpoint: str,
    http_method: str,
    status_code: int,
    error_message: str,
    request_snippet: str = "",
    client_ip: str = ""
) -> Dict[str, Any]:
    """Grava o log bruto e aciona a Alice AI para gerar o diagnóstico instantâneo."""
    conn = get_db()
    c = conn.cursor()
    now = time.time()

    # 1. Salva log de auditoria
    c.execute("""
    INSERT INTO client_audit_logs 
    (user_id, user_email, app_id, endpoint, http_method, status_code, error_message, request_snippet, client_ip, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, user_email, app_id, endpoint, http_method, status_code, error_message, request_snippet[:500], client_ip, now))
    
    log_id = c.lastrowid

    # 2. Gera diagnóstico da IA
    diag = generate_ai_diagnosis(app_id, endpoint, error_message, request_snippet)

    # 3. Salva diagnóstico no observatório
    c.execute("""
    INSERT INTO ai_diagnostics
    (user_id, user_email, app_id, log_id, error_summary, ai_human_diagnosis, ai_suggested_fix, severity, resolved, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    """, (
        user_id,
        user_email or "anônimo",
        app_id,
        log_id,
        diag["error_summary"],
        diag["ai_human_diagnosis"],
        diag["ai_suggested_fix"],
        diag["severity"],
        now
    ))
    diag_id = c.lastrowid

    conn.commit()
    conn.close()

    return {
        "log_id": log_id,
        "diagnostic_id": diag_id,
        **diag
    }

def list_recent_diagnostics(limit: int = 50) -> List[Dict[str, Any]]:
    """Retorna os diagnósticos recentes ordenados por severidade e data."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    SELECT 
        d.id, d.user_id, d.user_email, d.app_id, d.error_summary, 
        d.ai_human_diagnosis, d.ai_suggested_fix, d.severity, d.resolved, d.created_at,
        u.name as user_name, u.phone as user_phone
    FROM ai_diagnostics d
    LEFT JOIN users u ON d.user_id = u.id
    ORDER BY d.resolved ASC, d.id DESC
    LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    
    results = []
    for r in rows:
        time_str = time.strftime("%d/%m/%Y %H:%M:%S", time.localtime(r["created_at"]))
        results.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "user_name": r["user_name"] or r["user_email"] or "Cliente Anônimo",
            "user_email": r["user_email"],
            "user_phone": r["user_phone"] or "",
            "app": f"{r['app_id']}.coon",
            "error_summary": r["error_summary"],
            "ai_diagnosis": r["ai_human_diagnosis"],
            "ai_fix": r["ai_suggested_fix"],
            "severity": r["severity"],
            "resolved": bool(r["resolved"]),
            "date": time_str
        })
    conn.close()
    return results

def toggle_user_block(user_id: int, target_status: str) -> Dict[str, Any]:
    """Altera o status global de um usuário ('active', 'blocked', 'suspended')."""
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE users SET status = ? WHERE id = ?", (target_status, user_id))
    conn.commit()
    conn.close()
    return {"user_id": user_id, "status": target_status, "message": f"Usuário atualizado para '{target_status}'."}

def toggle_app_access_lock(user_id: int, app_id: str, target_status: str, plan_id: str = "pro") -> Dict[str, Any]:
    """Altera ou cria o acesso de um usuário para um aplicativo específico ('active', 'locked_payment', 'manual_lock')."""
    conn = get_db()
    c = conn.cursor()
    now = time.time()
    c.execute("""
    INSERT INTO app_access (user_id, app_id, plan_id, status, created_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, app_id) DO UPDATE SET status=excluded.status, plan_id=excluded.plan_id
    """, (user_id, app_id, plan_id, target_status, now))
    conn.commit()
    conn.close()
    return {"user_id": user_id, "app_id": app_id, "status": target_status, "message": f"Acesso ao {app_id}.coon definido como '{target_status}'."}

def check_user_access(user_id: int, app_id: Optional[str] = None) -> Dict[str, Any]:
    """Verifica se o usuário está ativo globalmente e no aplicativo solicitado."""
    conn = get_db()
    c = conn.cursor()
    
    # 1. Checa status global
    c.execute("SELECT id, name, email, status, role FROM users WHERE id = ?", (user_id,))
    u = c.fetchone()
    if not u:
        conn.close()
        return {"allowed": False, "reason": "user_not_found", "message": "Usuário não encontrado."}
    
    if u["status"] in ("blocked", "suspended"):
        conn.close()
        return {
            "allowed": False, 
            "reason": "global_block", 
            "message": "Sua conta na holding COON está temporariamente bloqueada. Entre em contato com a Diretoria."
        }

    # Se for admin, acesso total irrestrito
    if u["role"] == "admin" or u["email"] == "admin@coon.com.br":
        conn.close()
        return {"allowed": True, "plan": "master_admin", "status": "active"}

    # 2. Checa status no app específico (se informado)
    if app_id:
        c.execute("SELECT plan_id, status FROM app_access WHERE user_id = ? AND app_id = ?", (user_id, app_id))
        app_acc = c.fetchone()
        if app_acc and app_acc["status"] in ("locked_payment", "manual_lock"):
            conn.close()
            return {
                "allowed": False, 
                "reason": "app_lock", 
                "message": f"Seu acesso ao {app_id}.coon está pendente de regularização de assinatura. Efetue o pagamento para liberar instantaneamente."
            }

    conn.close()
    return {"allowed": True, "status": "active"}

def get_all_users_with_access() -> List[Dict[str, Any]]:
    """Retorna lista de todos os usuários com status de bloqueio e detalhamento de cada app."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    SELECT id, name, email, phone, role, status, plan, created_at
    FROM users
    ORDER BY id DESC
    """)
    users = [dict(r) for r in c.fetchall()]

    for u in users:
        c.execute("""
        SELECT app_id, plan_id, status FROM app_access WHERE user_id = ?
        """, (u["id"],))
        apps = [dict(a) for a in c.fetchall()]
        
        c.execute("""
        SELECT app_id, plan_id, amount, status FROM holding_subscriptions WHERE user_email = ?
        """, (u["email"],))
        subs = [dict(s) for s in c.fetchall()]

        u["app_access"] = apps
        u["subscriptions"] = subs
        
        mrr = sum(s.get("amount", 0) for s in subs if s.get("status") == "active")
        if mrr == 0 and u.get("status") == "active":
            mrr = 89.90
        u["mrr"] = mrr
        u["created_at_formatted"] = time.strftime("%d/%m/%Y", time.localtime(u["created_at"])) if u.get("created_at") else "Ativo"
    conn.close()
    return users

def resolve_diagnostic(diagnostic_id: int) -> bool:
    """Marca um diagnóstico de IA como resolvido pela equipe."""
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE ai_diagnostics SET resolved = 1 WHERE id = ?", (diagnostic_id,))
    conn.commit()
    conn.close()
    return True

