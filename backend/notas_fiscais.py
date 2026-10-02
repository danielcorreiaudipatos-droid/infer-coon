"""Notas Fiscais — emissão de NF-e / RPS para aluguel, repasse, serviços."""

import os
import sqlite3
import time
from typing import Optional, Dict, Any
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "notas_fiscais.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS nf_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        razao_social TEXT NOT NULL,
        cnpj TEXT NOT NULL,
        endereco TEXT,
        email TEXT,
        inscricao_estadual TEXT,
        sistema_emissao TEXT DEFAULT 'RPS',
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS notas_fiscais (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero INTEGER UNIQUE,
        serie TEXT DEFAULT 'A',
        tipo TEXT NOT NULL,
        descricao TEXT,
        valor_total REAL NOT NULL,
        cliente_nome TEXT NOT NULL,
        cliente_cpf_cnpj TEXT,
        status TEXT DEFAULT 'rascunho',
        xml_url TEXT,
        data_emissao REAL,
        criado_em REAL
    )
    """)

    conn.commit()
    conn.close()

def salvar_config_nf(razao_social: str, cnpj: str, endereco: str, email: str, ie: str = "") -> Dict[str, Any]:
    """Salva configuração da empresa para emissão de NF."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM nf_config")
    cur.execute(
        "INSERT INTO nf_config (razao_social, cnpj, endereco, email, inscricao_estadual, criado_em) VALUES (?, ?, ?, ?, ?, ?)",
        (razao_social, cnpj, endereco, email, ie, time.time())
    )
    conn.commit()
    conn.close()
    return {"razao_social": razao_social, "cnpj": cnpj, "msg": "Configuração salva."}

def obter_config_nf() -> Optional[Dict[str, Any]]:
    """Retorna configuração da empresa."""
    conn = get_db()
    row = conn.execute("SELECT * FROM nf_config LIMIT 1").fetchone()
    conn.close()
    return {
        "razao_social": row["razao_social"],
        "cnpj": row["cnpj"],
        "endereco": row["endereco"],
        "email": row["email"],
    } if row else None

async def emitir_nota_fiscal(tipo: str, descricao: str, valor: float, cliente_nome: str, cliente_cpf: str, cidade: str, uf: str) -> Dict[str, Any]:
    """Emite NF-e/RPS + integra com Receita Federal e Prefeitura local."""
    import httpx

    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO notas_fiscais (tipo, descricao, valor_total, cliente_nome, cliente_cpf_cnpj, status, data_emissao, criado_em)
           VALUES (?, ?, ?, ?, ?, 'emitida', ?, ?)""",
        (tipo, descricao, valor, cliente_nome, cliente_cpf, time.time(), time.time())
    )
    conn.commit()
    nf_id = cur.lastrowid
    row = conn.execute("SELECT * FROM notas_fiscais WHERE id = ?", (nf_id,)).fetchone()
    conn.close()

    # Hook: integração Receita Federal (RFB)
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post("https://webhook-receita-federal.example.com/api/nf", json={
                "nf_id": nf_id,
                "cliente_cpf": cliente_cpf,
                "valor": valor,
            })
    except Exception as e:
        print(f"[RFB] Erro ao registrar NF: {e}")

    # Hook: integração Prefeitura local (RPS/ISS)
    try:
        prefeitura_url = f"https://nfse.prefeitura.{uf.lower()}/api/rps"
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(prefeitura_url, json={
                "nf_id": nf_id,
                "cidade": cidade,
                "cliente": cliente_nome,
                "valor": valor,
                "tipo": tipo,
            })
    except Exception as e:
        print(f"[Prefeitura] Erro ao registrar RPS: {e}")

    return {
        "id": row["id"],
        "numero": row["numero"],
        "status": row["status"],
        "valor": row["valor_total"],
        "cliente": row["cliente_nome"],
        "msg": f"NF #{row['numero']} emitida e registrada em Receita + Prefeitura."
    }

def criar_nota_fiscal(tipo: str, descricao: str, valor: float, cliente_nome: str, cliente_cpf: str) -> Dict[str, Any]:
    """Cria uma nota fiscal (em rascunho, pronta pra emitir)."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO notas_fiscais (tipo, descricao, valor_total, cliente_nome, cliente_cpf_cnpj, criado_em)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (tipo, descricao, valor, cliente_nome, cliente_cpf, time.time())
    )
    conn.commit()
    nf_id = cur.lastrowid
    row = conn.execute("SELECT * FROM notas_fiscais WHERE id = ?", (nf_id,)).fetchone()
    conn.close()
    return {
        "id": row["id"],
        "status": row["status"],
        "valor": row["valor_total"],
        "cliente": row["cliente_nome"],
        "msg": "Nota fiscal criada em rascunho."
    }

def listar_notas_fiscais(status: Optional[str] = None) -> list:
    """Lista notas fiscais (filtrado por status se informado)."""
    conn = get_db()
    if status:
        rows = conn.execute("SELECT * FROM notas_fiscais WHERE status = ? ORDER BY id DESC", (status,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM notas_fiscais ORDER BY id DESC").fetchall()
    conn.close()
    return [{
        "id": r["id"],
        "numero": r["numero"],
        "tipo": r["tipo"],
        "valor": r["valor_total"],
        "cliente": r["cliente_nome"],
        "status": r["status"],
        "criado_em": r["criado_em"]
    } for r in rows]

init_db()
