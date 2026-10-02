"""dmob — delivery mobile integration. App mobile acessa dados do on.imob pra visualizar imóveis, contratos, documentos."""

import os
import sqlite3
import time
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "dmob.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS dmob_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT UNIQUE NOT NULL,
        user_id INTEGER,
        last_active REAL,
        criado_em REAL
    )
    """)
    conn.commit()
    conn.close()

def registrar_dispositivo(device_id: str, user_id: Optional[int] = None) -> Dict[str, Any]:
    """Registra/atualiza um dispositivo mobile."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO dmob_sessions (device_id, user_id, last_active, criado_em) VALUES (?, ?, ?, ?)",
        (device_id, user_id, time.time(), time.time())
    )
    conn.commit()
    conn.close()
    return {"device_id": device_id, "status": "registrado"}

def atualizar_atividade(device_id: str):
    """Atualiza timestamp de última atividade."""
    conn = get_db()
    conn.execute("UPDATE dmob_sessions SET last_active = ? WHERE device_id = ?", (time.time(), device_id))
    conn.commit()
    conn.close()

init_db()
