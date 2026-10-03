"""Multi-tenant — isolamento de dados por escritório/imobiliária."""

import os
import sqlite3
import time
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "multi_tenant.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS escritorios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        cnpj TEXT,
        owner_email TEXT,
        plano TEXT DEFAULT 'basico',
        ativo INTEGER DEFAULT 1,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS user_escritorio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        email TEXT NOT NULL,
        escritorio_id INTEGER NOT NULL,
        role TEXT DEFAULT 'corretor',
        UNIQUE(email, escritorio_id),
        FOREIGN KEY (escritorio_id) REFERENCES escritorios(id)
    )
    """)

    conn.commit()
    conn.close()

def criar_escritorio(nome: str, cnpj: str, owner_email: str) -> Dict[str, Any]:
    """Cria novo escritório (imobiliária)."""
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO escritorios (nome, cnpj, owner_email, criado_em) VALUES (?, ?, ?, ?)",
            (nome, cnpj, owner_email, time.time())
        )
        conn.commit()
        esc_id = cur.lastrowid
        cur.execute("INSERT INTO user_escritorio (email, escritorio_id, role) VALUES (?, ?, 'admin')", (owner_email, esc_id))
        conn.commit()
        conn.close()
        return {"id": esc_id, "nome": nome, "msg": "Escritório criado."}
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Escritório já existe.")

def obter_escritorio_usuario(email: str) -> Optional[Dict[str, Any]]:
    """Retorna escritório principal do usuário."""
    conn = get_db()
    row = conn.execute(
        "SELECT e.* FROM escritorios e JOIN user_escritorio ue ON e.id=ue.escritorio_id WHERE ue.email=? LIMIT 1",
        (email,)
    ).fetchone()
    conn.close()
    if row:
        return {"id": row["id"], "nome": row["nome"], "plano": row["plano"]}
    return None

def listar_escritorios(owner_email: str) -> list:
    """Lista escritórios do dono."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM escritorios WHERE owner_email = ?", (owner_email,)).fetchall()
    conn.close()
    return [{"id": r["id"], "nome": r["nome"], "cnpj": r["cnpj"], "ativo": r["ativo"]} for r in rows]

def adicionar_usuario_escritorio(email: str, escritorio_id: int, role: str = "corretor"):
    """Adiciona usuário a um escritório."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO user_escritorio (email, escritorio_id, role) VALUES (?, ?, ?)",
        (email, escritorio_id, role)
    )
    conn.commit()
    conn.close()
    return {"msg": f"Usuário {email} adicionado ao escritório."}

init_db()
