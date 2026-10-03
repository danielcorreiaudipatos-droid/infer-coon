"""Integração COON Infer — Avaliação Automática de Imóveis no on.imob"""

import json
import os
import sqlite3
from typing import Dict, Any, Optional, List
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "on_imob.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Cria tabela de avaliações."""
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS avaliacoes_imovel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imovel_id INTEGER NOT NULL,
        escritorio_id INTEGER NOT NULL,
        valor_central REAL,
        valor_minimo REAL,
        valor_maximo REAL,
        valor_m2 REAL,
        grau_precisao TEXT,
        intervalo_confianca REAL,
        variáveis_usadas TEXT,
        data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(imovel_id) REFERENCES imoveis(id)
    )
    """)

    conn.commit()
    conn.close()

def extrair_dados_imovel(imovel_dict: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extrai características do imóvel para o modelo COON.

    Esperado no imovel_dict:
    - endereco, bairro, cidade
    - tipo (apartamento, casa, etc)
    - area_util (m²)
    - quartos, banheiros
    - garagens
    - padrão (simples, médio, médio-alto, alto)
    - idade_anos
    - amenidades (piscina, academia, etc)
    - preco (se houver, para histórico)
    """
    dados = {
        'endereco': imovel_dict.get('endereco', ''),
        'bairro': imovel_dict.get('bairro', ''),
        'cidade': imovel_dict.get('cidade', 'São Paulo'),
        'tipo': imovel_dict.get('tipo', 'apartamento'),  # apartamento, casa, comercial
        'area_util': float(imovel_dict.get('area_util', 0)) or 0,
        'quartos': int(imovel_dict.get('quartos', 0)) or 0,
        'banheiros': int(imovel_dict.get('banheiros', 0)) or 0,
        'garagens': int(imovel_dict.get('garagens', 0)) or 0,
        'padrão': imovel_dict.get('padrão', 'médio').lower(),  # simples, médio, médio-alto, alto
        'idade_anos': int(imovel_dict.get('idade_anos', 20)) or 20,
        'amenidades': imovel_dict.get('amenidades', [])  # ['piscina', 'academia', 'playground']
    }
    return dados

def gerar_avaliacao_simples(dados_imovel: Dict[str, Any], escritorio_id: int) -> Dict[str, Any]:
    """
    Gera avaliação SIMPLES usando regra de mercado.
    (Versão base do COON — sem modelo de regressão complexo)

    Usa:
    - Valor base por m² para a região/bairro
    - Ajustes por padrão
    - Ajustes por amenidades
    - Ajustes por idade
    """

    # ========== VALORES BASE POR REGIÃO (exemplo São Paulo) ==========
    valores_base_m2 = {
        'Centro': 5000,
        'Vila Mariana': 6800,
        'Pinheiros': 7200,
        'Vila Olímpia': 8500,
        'Morumbi': 7800,
        'Itaim': 8200,
        'Bela Vista': 6500,
        'Santa Cecília': 5800,
        'Consolação': 6200,
        'Jardins': 7500,
        # ... adicione mais bairros conforme necessário
    }

    # ========== AJUSTES POR PADRÃO ==========
    ajustes_padrao = {
        'simples': -0.15,      # -15%
        'médio': 0.0,           # base
        'médio-alto': 0.15,     # +15%
        'alto': 0.30,           # +30%
        'luxo': 0.50             # +50%
    }

    # ========== AJUSTES POR AMENIDADES ==========
    ajustes_amenidades = {
        'piscina': 0.05,
        'academia': 0.04,
        'playground': 0.03,
        'churrasqueira': 0.03,
        'salão de festas': 0.04,
        'concierge': 0.06,
        'segurança 24h': 0.05
    }

    # ========== LÓGICA DE CÁLCULO ==========

    # 1) Valor base por m² (região)
    bairro = dados_imovel.get('bairro', 'Centro')
    valor_m2_base = valores_base_m2.get(bairro, 6500)  # padrão: 6500 se não encontrar

    # 2) Ajuste por padrão
    padrao = dados_imovel.get('padrão', 'médio')
    ajuste_padrao = ajustes_padrao.get(padrao, 0.0)
    valor_m2_padrao = valor_m2_base * (1 + ajuste_padrao)

    # 3) Ajustes por amenidades
    ajuste_amenidades_total = 0.0
    amenidades_aplicadas = []
    for amenidade in dados_imovel.get('amenidades', []):
        if amenidade in ajustes_amenidades:
            ajuste_amenidades_total += ajustes_amenidades[amenidade]
            amenidades_aplicadas.append(amenidade)

    valor_m2_amenidades = valor_m2_padrao * (1 + ajuste_amenidades_total)

    # 4) Ajuste por idade (depreciação ~0.5% ao ano após 10 anos)
    idade = dados_imovel.get('idade_anos', 20)
    if idade <= 10:
        ajuste_idade = 0.0  # imóvel novo, sem depreciação
    else:
        ajuste_idade = -(idade - 10) * 0.005  # começa a depreciar após 10 anos

    valor_m2_final = valor_m2_amenidades * (1 + ajuste_idade)

    # 5) Ajustes por quantidade de quartos/banheiros
    quartos = dados_imovel.get('quartos', 0)
    ajuste_quartos = (quartos - 2) * 0.03 if quartos > 2 else 0  # +3% por quarto adicional
    valor_m2_final = valor_m2_final * (1 + ajuste_quartos)

    # 6) Ajustes por garagens
    garagens = dados_imovel.get('garagens', 0)
    ajuste_garagens = (garagens - 1) * 0.04 if garagens > 1 else 0  # +4% por garagem extra
    valor_m2_final = valor_m2_final * (1 + ajuste_garagens)

    # 7) CÁLCULO FINAL
    area = dados_imovel.get('area_util', 0)
    valor_central = valor_m2_final * area

    # Intervalo de confiança (±15% é padrão para avaliação simples)
    intervalo = 0.15
    valor_minimo = valor_central * (1 - intervalo)
    valor_maximo = valor_central * (1 + intervalo)

    # Grau de precisão NBR 14.653
    # - Grau I: amplitude > 30%
    # - Grau II: 20% < amplitude ≤ 30%
    # - Grau III: amplitude ≤ 20%
    amplitude = (valor_maximo - valor_minimo) / valor_central
    if amplitude <= 0.20:
        grau = 'III'  # Melhor precisão
    elif amplitude <= 0.30:
        grau = 'II'
    else:
        grau = 'I'

    return {
        'sucesso': True,
        'valor_central': round(valor_central, 2),
        'valor_minimo': round(valor_minimo, 2),
        'valor_maximo': round(valor_maximo, 2),
        'valor_m2': round(valor_m2_final, 2),
        'grau_precisao': grau,
        'intervalo_confianca': intervalo,
        'amplitude': round(amplitude * 100, 1),
        'variáveis_usadas': {
            'bairro': bairro,
            'valor_base_m2': valor_m2_base,
            'padrão': padrao,
            'ajuste_padrao': round(ajuste_padrao * 100, 1),
            'amenidades': amenidades_aplicadas,
            'ajuste_amenidades': round(ajuste_amenidades_total * 100, 1),
            'idade_anos': idade,
            'ajuste_idade': round(ajuste_idade * 100, 1),
            'quartos': quartos,
            'banheiros': dados_imovel.get('banheiros', 0),
            'garagens': garagens,
            'area_util': area
        }
    }

def registrar_avaliacao(imovel_id: int, escritorio_id: int, avaliacao: Dict[str, Any]) -> bool:
    """Registra avaliação no banco de dados."""
    try:
        conn = get_db()
        cur = conn.cursor()

        cur.execute("""
            INSERT INTO avaliacoes_imovel
            (imovel_id, escritorio_id, valor_central, valor_minimo, valor_maximo,
             valor_m2, grau_precisao, intervalo_confianca, variáveis_usadas)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            imovel_id,
            escritorio_id,
            avaliacao.get('valor_central'),
            avaliacao.get('valor_minimo'),
            avaliacao.get('valor_maximo'),
            avaliacao.get('valor_m2'),
            avaliacao.get('grau_precisao'),
            avaliacao.get('intervalo_confianca'),
            json.dumps(avaliacao.get('variáveis_usadas', {}))
        ))

        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Erro ao registrar avaliação: {e}")
        return False

def obter_avaliacao(imovel_id: int) -> Optional[Dict[str, Any]]:
    """Obtém avaliação mais recente de um imóvel."""
    try:
        conn = get_db()
        row = conn.execute("""
            SELECT * FROM avaliacoes_imovel
            WHERE imovel_id = ?
            ORDER BY data_geracao DESC
            LIMIT 1
        """, (imovel_id,)).fetchone()
        conn.close()

        if row:
            return {
                'id': row['id'],
                'valor_central': row['valor_central'],
                'valor_minimo': row['valor_minimo'],
                'valor_maximo': row['valor_maximo'],
                'valor_m2': row['valor_m2'],
                'grau_precisao': row['grau_precisao'],
                'intervalo_confianca': row['intervalo_confianca'],
                'variáveis_usadas': json.loads(row['variáveis_usadas'] or '{}'),
                'data_geracao': row['data_geracao']
            }
        return None
    except Exception as e:
        print(f"Erro ao obter avaliação: {e}")
        return None

def gerar_pdf_avaliacao(avaliacao: Dict[str, Any], dados_imovel: Dict[str, Any]) -> str:
    """
    Gera PDF com o relatório de avaliação.
    Retorna o conteúdo do PDF ou path do arquivo gerado.
    """
    # TODO: Usar ReportLab ou python-docx para gerar PDF
    # Por enquanto, retorna um placeholder

    template = f"""
    ==========================================
    RELATÓRIO DE AVALIAÇÃO DE IMÓVEL
    Gerado por on.imob (Sistema COON)
    ==========================================

    IMÓVEL:
    Endereço: {dados_imovel.get('endereco')}
    Bairro: {dados_imovel.get('bairro')}
    Tipo: {dados_imovel.get('tipo')}
    Área Útil: {dados_imovel.get('area_util')} m²

    AVALIAÇÃO:
    Valor Estimado: R$ {avaliacao.get('valor_central'):,.2f}
    Intervalo (80%): R$ {avaliacao.get('valor_minimo'):,.2f} a R$ {avaliacao.get('valor_maximo'):,.2f}
    Valor por m²: R$ {avaliacao.get('valor_m2'):,.2f}
    Grau de Precisão: {avaliacao.get('grau_precisao')}
    Amplitude: ±{avaliacao.get('intervalo_confianca')*100:.0f}%

    VARIÁVEIS UTILIZADAS:
    {json.dumps(avaliacao.get('variáveis_usadas'), indent=2, ensure_ascii=False)}

    ==========================================
    """

    return template

# Inicializar banco ao importar
init_db()
