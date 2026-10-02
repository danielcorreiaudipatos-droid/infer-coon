"""Analytics da IA — histórico de perguntas, padrões, insights."""

import os
import sqlite3
import time
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "ia_analytics.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_email TEXT,
        pergunta TEXT NOT NULL,
        resposta TEXT,
        pagina TEXT,
        fonte TEXT,
        timestamp REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS pergunta_frequente (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pergunta TEXT UNIQUE NOT NULL,
        freq INTEGER DEFAULT 1,
        categoria TEXT
    )
    """)

    conn.commit()
    conn.close()

def registrar_pergunta(usuario_email: str, pergunta: str, resposta: str, pagina: str, fonte: str) -> Dict[str, Any]:
    """Registra pergunta e resposta no histórico."""
    conn = get_db()
    cur = conn.cursor()

    # Registrar no histórico
    cur.execute(
        """INSERT INTO chat_history (usuario_email, pergunta, resposta, pagina, fonte, timestamp)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (usuario_email, pergunta, resposta, pagina, fonte, time.time())
    )

    # Atualizar frequência
    try:
        cur.execute("INSERT INTO pergunta_frequente (pergunta, freq, categoria) VALUES (?, 1, ?)",
                   (pergunta[:100], pagina))
    except sqlite3.IntegrityError:
        cur.execute("UPDATE pergunta_frequente SET freq = freq + 1 WHERE pergunta = ?",
                   (pergunta[:100],))

    conn.commit()
    conn.close()
    return {"msg": "Pergunta registrada"}

def obter_historico(usuario_email: str, limite: int = 20) -> List[Dict[str, Any]]:
    """Retorna histórico de perguntas do usuário."""
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM chat_history WHERE usuario_email = ? ORDER BY timestamp DESC LIMIT ?",
        (usuario_email, limite)
    ).fetchall()
    conn.close()

    return [{"id": r["id"], "pergunta": r["pergunta"], "resposta": r["resposta"], "timestamp": r["timestamp"]} for r in rows]

def obter_perguntas_frequentes(limite: int = 10) -> List[Dict[str, Any]]:
    """Retorna perguntas mais frequentes do sistema."""
    conn = get_db()
    rows = conn.execute(
        "SELECT pergunta, freq, categoria FROM pergunta_frequente ORDER BY freq DESC LIMIT ?",
        (limite,)
    ).fetchall()
    conn.close()

    return [{"pergunta": r["pergunta"], "freq": r["freq"], "categoria": r["categoria"]} for r in rows]

def obter_analise_by_pagina() -> List[Dict[str, Any]]:
    """Análise de perguntas por página."""
    conn = get_db()
    rows = conn.execute("""
        SELECT pagina, COUNT(*) as total FROM chat_history
        GROUP BY pagina ORDER BY total DESC
    """).fetchall()
    conn.close()

    return [{"pagina": r["pagina"], "total": r["total"]} for r in rows]

def limpar_historico(usuario_email: str) -> Dict[str, Any]:
    """Limpa histórico do usuário."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM chat_history WHERE usuario_email = ?", (usuario_email,))
    conn.commit()
    conn.close()
    return {"msg": "Histórico limpo"}

init_db()
