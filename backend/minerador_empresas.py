"""
Motor de Coleta e Mineração de Empresas Locais (Google Meu Negócio & Base Aberta)
Coon Inteligência de Mercado / Coon Leads
Gera planilhas Excel (.xlsx) e CSV diretamente.
"""

import os
import re
import csv
import json
import sqlite3
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "coon_leads_brasil.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS empresas_locais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_fantasia TEXT,
            razao_social TEXT,
            categoria_nicho TEXT,
            telefone_bruto TEXT,
            ddd TEXT,
            numero_limpo TEXT,
            eh_whatsapp INTEGER DEFAULT 0,
            endereco TEXT,
            bairro TEXT,
            cidade TEXT,
            uf TEXT,
            origem TEXT, -- 'google_meu_negocio', 'cnpj_aberto', 'manual'
            nota_google REAL,
            total_avaliacoes INTEGER,
            criado_em TEXT,
            UNIQUE(nome_fantasia, cidade, telefone_bruto) ON CONFLICT IGNORE
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_cidade_nicho ON empresas_locais(cidade, categoria_nicho);")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_eh_whatsapp ON empresas_locais(eh_whatsapp);")
    conn.commit()
    conn.close()

def classificar_telefone(telefone_str, ddd_padrao="34"):
    """
    Limpa e classifica se o telefone tem alta probabilidade de ser WhatsApp móvel.
    Móvel Brasil: DDD (2 dígitos) + 9 (início) + 8 dígitos = 11 dígitos.
    """
    if not telefone_str:
        return None, None, 0
    
    nums = re.sub(r"\D", "", str(telefone_str))
    
    # Se veio sem DDD (8 ou 9 dígitos), aplica DDD padrão
    if len(nums) in (8, 9):
        nums = ddd_padrao + nums
    
    # Se veio com 55 no início (DDI Brasil)
    if len(nums) == 13 and nums.startswith("55"):
        nums = nums[2:]
        
    ddd = nums[:2] if len(nums) >= 2 else ""
    eh_whats = 0
    
    # Celular com 11 dígitos e iniciando com 9
    if len(nums) == 11 and nums[2] == '9':
        eh_whats = 1
    # Fixo: 10 dígitos (DDD + 3xxx-xxxx, 2xxx-xxxx etc)
    elif len(nums) == 10:
        eh_whats = 0
        
    return ddd, nums, eh_whats

def salvar_empresa(dados):
    """
    Salva a empresa no banco de dados local.
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    ddd, numero_limpo, eh_whats = classificar_telefone(dados.get("telefone", ""), dados.get("ddd_padrao", "34"))
    
    cur.execute("""
        INSERT OR IGNORE INTO empresas_locais (
            nome_fantasia, razao_social, categoria_nicho, telefone_bruto,
            ddd, numero_limpo, eh_whatsapp, endereco, bairro, cidade, uf,
            origem, nota_google, total_avaliacoes, criado_em
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        dados.get("nome", ""),
        dados.get("razao_social", ""),
        dados.get("categoria", "Geral"),
        dados.get("telefone", ""),
        ddd,
        numero_limpo,
        eh_whats,
        dados.get("endereco", ""),
        dados.get("bairro", ""),
        dados.get("cidade", "Patos de Minas"),
        dados.get("uf", "MG"),
        dados.get("origem", "google_meu_negocio"),
        dados.get("nota", 0.0),
        dados.get("avaliacoes", 0),
        datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    ))
    conn.commit()
    conn.close()

def exportar_para_csv_ou_excel(cidade="Patos de Minas", apenas_whatsapp=False, caminho_destino=None):
    """
    Exporta os dados minerados diretamente para CSV compatível 100% com Excel.
    Se não informar caminho_destino, salva direto na pasta Downloads do usuário!
    """
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    query = """
        SELECT nome_fantasia, categoria_nicho, telefone_bruto, numero_limpo,
               CASE WHEN eh_whatsapp = 1 THEN 'SIM (WhatsApp)' ELSE 'Fixo / Comercial' END as tipo_contato,
               endereco, bairro, cidade, uf, nota_google, total_avaliacoes
        FROM empresas_locais
        WHERE cidade = ?
    """
    params = [cidade]
    
    if apenas_whatsapp:
        query += " AND eh_whatsapp = 1"
        
    query += " ORDER BY categoria_nicho, nome_fantasia"
    
    cur.execute(query, params)
    linhas = cur.fetchall()
    conn.close()
    
    if not caminho_destino:
        pasta_downloads = os.path.join(os.path.expanduser("~"), "Downloads")
        nome_arquivo = f"empresas_{cidade.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
        caminho_destino = os.path.join(pasta_downloads, nome_arquivo)
        
    cabecalhos = [
        "Nome da Empresa / Loja",
        "Categoria / Nicho",
        "Telefone Divulgado",
        "Numero Limpo (DDD+Num)",
        "E WhatsApp?",
        "Endereco",
        "Bairro",
        "Cidade",
        "UF",
        "Nota Google (Estrelas)",
        "Qtd Avaliacoes"
    ]
    
    # Exporta com BOM utf-8-sig para abrir com acentuação perfeita diretamente no Excel
    with open(caminho_destino, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=";")
        writer.writerow(cabecalhos)
        for l in linhas:
            writer.writerow(l)
            
    return caminho_destino, len(linhas)

if __name__ == "__main__":
    init_db()
    print(f"Banco de dados inicializado em: {DB_PATH}")
