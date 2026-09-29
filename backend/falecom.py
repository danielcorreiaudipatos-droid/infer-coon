"""
Canal Oficial de Atendimento e Mensagens: falecom@coon.com.br
Holding: Coon Participações Ltda. (www.coon.com.br)
"""

import os
import time
import sqlite3
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_falecom_tables():
    """Cria a tabela do canal oficial falecom@coon.com.br."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS falecom_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT,
        message TEXT NOT NULL,
        recipient TEXT NOT NULL DEFAULT 'falecom@coon.com.br',
        status TEXT NOT NULL DEFAULT 'recebido',
        created_at REAL NOT NULL,
        created_at_iso TEXT NOT NULL
    )
    """)
    conn.commit()
    conn.close()

def save_falecom_message(
    name: str, 
    email: str, 
    message: str, 
    subject: Optional[str] = None, 
    phone: Optional[str] = None
) -> Dict[str, Any]:
    """Salva a mensagem recebida para falecom@coon.com.br e retorna o protocolo."""
    init_falecom_tables()
    conn = get_db()
    c = conn.cursor()
    now_ts = time.time()
    now_iso = time.strftime("%Y-%m-%d %H:%M:%S")
    clean_subject = (subject or "Mensagem via Portal Coon").strip()
    
    c.execute("""
    INSERT INTO falecom_messages (name, email, phone, subject, message, recipient, status, created_at, created_at_iso)
    VALUES (?, ?, ?, ?, ?, 'falecom@coon.com.br', 'recebido', ?, ?)
    """, (name.strip(), email.strip(), (phone or "").strip(), clean_subject, message.strip(), now_ts, now_iso))
    
    ticket_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return {
        "success": True,
        "ticket_id": ticket_id,
        "recipient": "falecom@coon.com.br",
        "created_at": now_iso,
        "message": "Sua mensagem foi recebida com sucesso pelo canal oficial falecom@coon.com.br. O gabinete e a equipe Coon responderão prontamente."
    }

def list_falecom_messages(limit: int = 50) -> List[Dict[str, Any]]:
    """Lista mensagens recentes recebidas em falecom@coon.com.br."""
    init_falecom_tables()
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM falecom_messages ORDER BY id DESC LIMIT ?", (limit,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# Inicializa ao importar
init_falecom_tables()
