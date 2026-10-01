"""
Motor de Extração e Mineração de Dados Públicos do Governo (Receita Federal / CNPJ Aberto)
Coon Inteligência de Mercado / Coon Leads
Cobre: Patos de Minas, Uberlândia, Uberaba e qualquer cidade do Brasil.
"""

import os
import sys
import re
import json
import sqlite3
import urllib.request
import urllib.parse
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.path.join(os.path.dirname(__file__), "coon_leads_brasil.db")

# Códigos de Município IBGE mais comuns da nossa região:
IBGE_CIDADES = {
    "PATOS DE MINAS": "3148004",
    "UBERLANDIA": "3170206",
    "UBERABA": "3170107"
}

def init_tabela_governo():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS empresas_governo (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cnpj TEXT UNIQUE,
            razao_social TEXT,
            nome_fantasia TEXT,
            cnae_principal TEXT,
            cnae_descricao TEXT,
            natureza_juridica TEXT,
            situacao_cadastral TEXT,
            capital_social REAL,
            telefone_1 TEXT,
            telefone_2 TEXT,
            email TEXT,
            logradouro TEXT,
            numero TEXT,
            bairro TEXT,
            municipio TEXT,
            uf TEXT,
            cep TEXT,
            socios TEXT, -- JSON com nome e qualificação dos sócios
            criado_em TEXT
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_gov_municipio ON empresas_governo(municipio);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_gov_cnae ON empresas_governo(cnae_principal);")
    conn.commit()
    conn.close()

def consultar_cnpj_publico(cnpj_limpo):
    """
    Consulta a API pública gratuita oficial do CNPJ aberto para enriquecimento individual em lote.
    """
    cnpj_limpo = re.sub(r"\D", "", cnpj_limpo)
    if len(cnpj_limpo) != 14:
        return None

    url = f"https://minhareceita.org/{cnpj_limpo}"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoonEngine/1.0"}

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            if resp.status == 200:
                data = json.loads(resp.read().decode("utf-8"))
                return data
    except Exception as e:
        pass
    return None

def salvar_empresa_governo(d):
    """
    Armazena os dados oficiais da Receita Federal na tabela de empresas_governo.
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cnpj = re.sub(r"\D", "", str(d.get("cnpj", "")))
    if not cnpj:
        conn.close()
        return False

    socios_json = json.dumps(d.get("qsa", []), ensure_ascii=False)

    try:
        cur.execute("""
            INSERT OR REPLACE INTO empresas_governo (
                cnpj, razao_social, nome_fantasia, cnae_principal, cnae_descricao,
                natureza_juridica, situacao_cadastral, capital_social,
                telefone_1, telefone_2, email, logradouro, numero, bairro,
                municipio, uf, cep, socios, criado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            cnpj,
            d.get("razao_social", ""),
            d.get("nome_fantasia", "") or d.get("razao_social", ""),
            str(d.get("cnae_fiscal", "")),
            d.get("cnae_fiscal_descricao", ""),
            d.get("natureza_juridica", ""),
            d.get("descricao_situacao_cadastral", "ATIVA"),
            float(d.get("capital_social", 0.0) or 0.0),
            d.get("ddd_telefone_1", ""),
            d.get("ddd_telefone_2", ""),
            d.get("email", ""),
            d.get("logradouro", ""),
            d.get("numero", ""),
            d.get("bairro", ""),
            d.get("municipio", "PATOS DE MINAS").upper(),
            d.get("uf", "MG").upper(),
            d.get("cep", ""),
            socios_json,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        conn.close()
        return False

if __name__ == "__main__":
    init_tabela_governo()
    print(f"Tabela de empresas do Governo inicializada com sucesso em: {DB_PATH}")
