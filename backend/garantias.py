"""Sistema de garantias — caução, seguro fiança, avalista."""

import os
import sqlite3
import time
from typing import Dict, Any, Optional, List

DB_PATH = os.path.join(os.path.dirname(__file__), "garantias.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS garantias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrato_id INTEGER NOT NULL,
        tipo TEXT NOT NULL,
        valor REAL NOT NULL,
        status TEXT DEFAULT 'ativa',
        data_inicio REAL,
        data_fim REAL,
        criado_em REAL,
        FOREIGN KEY (contrato_id) REFERENCES imob_contratos(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS avalistas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contrato_id INTEGER NOT NULL,
        nome TEXT NOT NULL,
        cpf TEXT,
        telefone TEXT,
        email TEXT,
        endereco TEXT,
        criado_em REAL,
        FOREIGN KEY (contrato_id) REFERENCES imob_contratos(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS deducoes_caucao (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        garantia_id INTEGER NOT NULL,
        motivo TEXT NOT NULL,
        valor REAL,
        criado_em REAL,
        FOREIGN KEY (garantia_id) REFERENCES garantias(id)
    )
    """)

    conn.commit()
    conn.close()

def registrar_caacao(contrato_id: int, valor: float) -> Dict[str, Any]:
    """Registra caução no contrato."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO garantias (contrato_id, tipo, valor, status, data_inicio, criado_em) VALUES (?, ?, ?, 'ativa', ?, ?)",
        (contrato_id, "caucao", valor, time.time(), time.time())
    )
    conn.commit()
    garantia_id = cur.lastrowid
    conn.close()
    return {"id": garantia_id, "tipo": "caucao", "valor": valor, "status": "ativa"}

def registrar_fiador(contrato_id: int, nome: str, cpf: str, telefone: str, email: str, endereco: str) -> Dict[str, Any]:
    """Registra fiador/avalista."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO avalistas (contrato_id, nome, cpf, telefone, email, endereco, criado_em) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (contrato_id, nome, cpf, telefone, email, endereco, time.time())
    )
    conn.commit()
    aval_id = cur.lastrowid
    conn.close()
    return {"id": aval_id, "nome": nome, "email": email}

def registrar_deducao_caacao(garantia_id: int, motivo: str, valor: float) -> Dict[str, Any]:
    """Registra dedução na caução (danos, limpeza, etc)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO deducoes_caucao (garantia_id, motivo, valor, criado_em) VALUES (?, ?, ?, ?)",
        (garantia_id, motivo, valor, time.time())
    )
    conn.commit()
    deducao_id = cur.lastrowid
    conn.close()
    return {"id": deducao_id, "motivo": motivo, "valor": valor}

def calcular_saldo_caacao(garantia_id: int) -> float:
    """Calcula saldo restante da caução."""
    conn = get_db()
    garantia = conn.execute("SELECT valor FROM garantias WHERE id = ?", (garantia_id,)).fetchone()
    total_deducoes = conn.execute("SELECT SUM(valor) FROM deducoes_caucao WHERE garantia_id = ?", (garantia_id,)).fetchone()
    conn.close()

    if not garantia:
        return 0.0

    deducoes = total_deducoes[0] or 0.0
    return garantia["valor"] - deducoes

def listar_garantias(contrato_id: int) -> List[Dict[str, Any]]:
    """Lista garantias de um contrato."""
    conn = get_db()
    rows = conn.execute("SELECT * FROM garantias WHERE contrato_id = ?", (contrato_id,)).fetchall()
    conn.close()
    return [{"id": r["id"], "tipo": r["tipo"], "valor": r["valor"], "status": r["status"]} for r in rows]

def liberar_caacao(garantia_id: int) -> Dict[str, Any]:
    """Marca caução como liberada ao final do contrato."""
    conn = get_db()
    cur = conn.cursor()
    saldo = calcular_saldo_caacao(garantia_id)
    cur.execute("UPDATE garantias SET status = 'liberada', data_fim = ? WHERE id = ?", (time.time(), garantia_id))
    conn.commit()
    conn.close()
    return {"msg": "Caução liberada", "saldo_devolvido": saldo}

init_db()
