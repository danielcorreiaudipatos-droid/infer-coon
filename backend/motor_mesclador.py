"""
Motor de Fusão & Mesclagem Inteligente (Coon Fusion Engine)
Cruza e une os dados do Google Meu Negócio (WhatsApp, Avaliações, Endereço comercial)
com a Base do Governo (CNPJ, Sócios, CNAE, Capital Social).
Gera a Planilha Ouro com todos os dados consolidados.
"""

import os
import sys
import csv
import re
import json
import sqlite3
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = os.path.join(os.path.dirname(__file__), "coon_leads_brasil.db")

def normalizar_texto(txt):
    if not txt:
        return ""
    txt = txt.upper().strip()
    txt = re.sub(r"[ÁÀÃÂÄ]", "A", txt)
    txt = re.sub(r"[ÉÈÊË]", "E", txt)
    txt = re.sub(r"[ÍÌÎÏ]", "I", txt)
    txt = re.sub(r"[ÓÒÕÔÖ]", "O", txt)
    txt = re.sub(r"[ÚÙÛÜ]", "U", txt)
    txt = re.sub(r"[Ç]", "C", txt)
    txt = re.sub(r"[^\w\s]", "", txt)
    return " ".join(txt.split())

def init_tabela_fusao():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS empresas_ouro_mescladas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome_comercial TEXT,
            razao_social TEXT,
            cnpj TEXT,
            categoria_nicho TEXT,
            cnae_descricao TEXT,
            whatsapp_comercial TEXT,
            telefone_secundario TEXT,
            eh_whatsapp INTEGER DEFAULT 1,
            endereco_completo TEXT,
            bairro TEXT,
            cidade TEXT,
            uf TEXT,
            nota_google REAL,
            total_avaliacoes INTEGER,
            nome_socios TEXT,
            capital_social REAL,
            origem_fusao TEXT,
            atualizado_em TEXT,
            UNIQUE(nome_comercial, cidade) ON CONFLICT REPLACE
        )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_ouro_cidade ON empresas_ouro_mescladas(cidade);")
    conn.commit()
    conn.close()

def executar_mesclagem_cidade(cidade="Patos de Minas"):
    """
    Cruza as empresas do Google Places (empresas_locais) com a base do governo (empresas_governo).
    """
    init_tabela_fusao()
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    print(f"\n⚡ INICIANDO MESCLAGEM INTELIGENTE PARA: {cidade.upper()}...")

    # 1. Pega todas as empresas do Google Places
    cur.execute("""
        SELECT nome_fantasia, categoria_nicho, telefone_bruto, numero_limpo,
               eh_whatsapp, endereco, bairro, cidade, uf, nota_google, total_avaliacoes
        FROM empresas_locais
        WHERE UPPER(cidade) LIKE ?
    """, (f"%{cidade.upper()}%",))
    empresas_google = cur.fetchall()

    # 2. Pega todas as empresas da base do governo para a mesma cidade
    cur.execute("""
        SELECT cnpj, razao_social, nome_fantasia, cnae_descricao, capital_social,
               telefone_1, telefone_2, logradouro, numero, bairro, municipio, uf, socios
        FROM empresas_governo
        WHERE UPPER(municipio) LIKE ?
    """, (f"%{cidade.upper()}%",))
    empresas_gov = cur.fetchall()

    total_mesclados = 0

    for g in empresas_google:
        nome_g, cat_g, tel_bruto_g, num_limpo_g, eh_w_g, end_g, bairro_g, cid_g, uf_g, nota_g, total_rev_g = g
        nome_norm_g = normalizar_texto(nome_g)

        # Procura correspondência na base do governo por nome ou por telefone
        match_gov = None
        for gov in empresas_gov:
            cnpj_v, razao_v, fant_v, cnae_v, cap_v, tel1_v, tel2_v, log_v, num_v, b_gov_v, mun_v, uf_v, soc_v = gov
            
            nome_fant_norm = normalizar_texto(fant_v)
            razao_norm = normalizar_texto(razao_v)
            
            # Se bater o nome fantasia ou o nome comercial estiver contido na razão social
            if nome_norm_g and (nome_norm_g in nome_fant_norm or nome_fant_norm in nome_norm_g or nome_norm_g in razao_norm):
                match_gov = gov
                break

        # Dados finais mesclados
        if match_gov:
            cnpj = match_gov[0]
            razao = match_gov[1]
            cnae_desc = match_gov[3]
            cap_social = match_gov[4]
            tel_secundario = match_gov[5] or match_gov[6] or ""
            
            # Extrai nomes dos sócios do JSON
            socios_str = ""
            try:
                soc_list = json.loads(match_gov[12])
                socios_str = ", ".join([s.get("nome_socio", "") for s in soc_list if s.get("nome_socio")])
            except:
                socios_str = ""
            origem = "Google Maps + Receita Federal (100% Mesclado)"
        else:
            cnpj = ""
            razao = nome_g
            cnae_desc = cat_g
            cap_social = 0.0
            tel_secundario = ""
            socios_str = ""
            origem = "Google Maps (Ficha Verificada)"

        cur.execute("""
            INSERT OR REPLACE INTO empresas_ouro_mescladas (
                nome_comercial, razao_social, cnpj, categoria_nicho, cnae_descricao,
                whatsapp_comercial, telefone_secundario, eh_whatsapp,
                endereco_completo, bairro, cidade, uf, nota_google,
                total_avaliacoes, nome_socios, capital_social, origem_fusao, atualizado_em
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            nome_g, razao, cnpj, cat_g, cnae_desc,
            num_limpo_g, tel_secundario, eh_w_g,
            end_g, bairro_g, cid_g, uf_g, nota_g,
            total_rev_g, socios_str, cap_social, origem,
            datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        ))
        total_mesclados += 1

    conn.commit()
    conn.close()

    print(f"✅ Mesclagem finalizada: {total_mesclados} registros enriquecidos.")
    caminho_planilha = exportar_planilha_ouro(cidade)
    return caminho_planilha

def exportar_planilha_ouro(cidade="Patos de Minas"):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        SELECT nome_comercial, razao_social, cnpj, categoria_nicho, cnae_descricao,
               whatsapp_comercial, telefone_secundario,
               CASE WHEN eh_whatsapp = 1 THEN 'SIM (WhatsApp)' ELSE 'Fixo' END,
               endereco_completo, bairro, cidade, uf, nota_google,
               total_avaliacoes, nome_socios, capital_social, origem_fusao
        FROM empresas_ouro_mescladas
        WHERE UPPER(cidade) LIKE ?
        ORDER BY total_avaliacoes DESC, nota_google DESC
    """, (f"%{cidade.upper()}%",))
    linhas = cur.fetchall()
    conn.close()

    pasta_downloads = os.path.join(os.path.expanduser("~"), "Downloads")
    nome_arquivo = f"PLANILHA_OURO_COON_{cidade.lower().replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M')}.csv"
    caminho = os.path.join(pasta_downloads, nome_arquivo)

    cabecalhos = [
        "Nome Comercial (Google)",
        "Razão Social Oficial",
        "CNPJ",
        "Categoria Comercial",
        "Atividade CNAE Principal",
        "WhatsApp de Atendimento",
        "Telefone Secundário",
        "Tipo de Contato",
        "Endereço Completo",
        "Bairro",
        "Cidade",
        "UF",
        "Nota Google (Estrelas)",
        "Qtd Avaliações Google",
        "Nome dos Sócios / Proprietários",
        "Capital Social Declarado (R$)",
        "Origem da Inteligência"
    ]

    with open(caminho, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f, delimiter=";")
        w.writerow(cabecalhos)
        for l in linhas:
            w.writerow(l)

    print(f"📁 Planilha Ouro exportada com sucesso em: {caminho}")
    return caminho

if __name__ == "__main__":
    executar_mesclagem_cidade("Patos de Minas")
