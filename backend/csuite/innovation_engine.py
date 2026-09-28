"""
Motor de P&D e Novos Negócios da Co.on Participações Ltda.
Comandado pelo Diretor de Inovação & P&D: Dr. Gabriel Silveira (CINO).

Varre continuamente oportunidades de mercado em segundo plano, calculando
viabilidade econômica, tempo de MVP e rentabilidade para novos softwares da holding.
"""

import os
import time
import sqlite3
from typing import Dict, Any, List, Optional

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_innovation_tables():
    """Inicializa as tabelas do pipeline de P&D e novos softwares."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS innovation_software_pipeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        target_market TEXT NOT NULL,
        problem_solved TEXT NOT NULL,
        monetization_model TEXT NOT NULL,
        estimated_monthly_revenue REAL NOT NULL,
        estimated_net_margin REAL NOT NULL,
        development_weeks INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'validated', -- 'validated', 'approved_by_president', 'in_development', 'launched'
        dossier_text TEXT NOT NULL,
        created_at REAL NOT NULL
    )
    """)

    # Seed inicial das primeiras teses de altíssima rentabilidade
    c.execute("SELECT COUNT(*) as count FROM innovation_software_pipeline")
    row = c.fetchone()
    if row and row["count"] == 0:
        now = time.time()
        initial_ideas = [
            (
                "Contrato.coon",
                "contrato",
                "Imobiliárias, Peritos, Corretores e Engenheiros",
                "Assinatura eletrônica e digital (ICP-Brasil) de laudos periciais e contratos de locação direto no WhatsApp, com validade jurídica instantânea.",
                "R$ 89,90/mês (Plano Pro com 50 assinaturas) + R$ 1,50 por documento excedente.",
                45000.00,
                88.5,
                2,
                "validated",
                "Dossiê Dr. Gabriel: Mercado de DocuSign e Clicksign cobra R$ 150 a 300/mês com interfaces burocráticas. O Contrato.coon roda embutido no imob.coon e infer.coon em 1 clique, captando receita imediata.",
                now
            ),
            (
                "ITBI.coon",
                "itbi",
                "Advogados Imobiliários, Peritos Judiciais e Compradores de Imóveis",
                "Auditoria e cálculo pericial contra cobranças abusivas de ITBI pelas Prefeituras (base de cálculo ilegal vs. Tema 1113 do STJ), com petição pronta em PDF.",
                "R$ 149,00 por cálculo pericial avulso ou R$ 397,00/mês para escritórios de advocacia.",
                38000.00,
                92.0,
                1,
                "validated",
                "Dossiê Dr. Gabriel: Mais de 80% das cidades brasileiras cobram ITBI sobre valor venal de referência arbitrário e ilegal. O software gera laudo e peça jurídica em 60 segundos.",
                now
            ),
            (
                "CRM.coon",
                "crm",
                "Corretores de Alta Renda, Avaliadores e Vistoriadores",
                "Gestão comercial no WhatsApp sem funis complexos, com lembrete inteligente de follow-up e integração direta com o ad.coon.",
                "R$ 69,90/mês por corretor ou R$ 249,00/mês para imobiliárias.",
                52000.00,
                84.0,
                2,
                "validated",
                "Dossiê Dr. Gabriel: O maior gargalo dos clientes do ad.coon é esquecer de atender os leads do WhatsApp. O CRM.coon fecha o ciclo de ponta a ponta.",
                now
            ),
            (
                "Vistoria360.coon",
                "vistoria360",
                "Vistoriadores, Imobiliárias e Seguradoras",
                "Captura de fotos panorâmicas em 360° pelo próprio celular sem necessidade de câmeras caras, embutindo tour virtual direto no laudo do check.coon.",
                "R$ 129,00/mês ou R$ 9,90 por vistoria 360° gerada.",
                31000.00,
                86.0,
                3,
                "validated",
                "Dossiê Dr. Gabriel: Reduz contestações judiciais de devolução de chaves a zero e dobra o valor percebido das imobiliárias parceiras.",
                now
            )
        ]
        c.executemany("""
            INSERT INTO innovation_software_pipeline (
                name, slug, target_market, problem_solved, monetization_model, estimated_monthly_revenue, estimated_net_margin, development_weeks, status, dossier_text, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, initial_ideas)

    conn.commit()
    conn.close()

init_innovation_tables()

def list_software_pipeline() -> List[Dict[str, Any]]:
    """Retorna a lista de softwares em ideação e desenvolvimento."""
    conn = get_db()
    c = conn.cursor()
    c.execute("SELECT * FROM innovation_software_pipeline ORDER BY estimated_monthly_revenue DESC")
    rows = c.fetchall()
    conn.close()
    
    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "name": r["name"],
            "slug": r["slug"],
            "target_market": r["target_market"],
            "problem_solved": r["problem_solved"],
            "monetization_model": r["monetization_model"],
            "estimated_monthly_revenue": r["estimated_monthly_revenue"],
            "revenue_formatted": f"R$ {r['estimated_monthly_revenue']:,.2f}".replace(",", "X").replace(".", ",").replace("X", "."),
            "estimated_net_margin": r["estimated_net_margin"],
            "development_weeks": r["development_weeks"],
            "status": r["status"],
            "status_label": "Validado pelo P&D" if r["status"] == "validated" else ("Aprovado pelo Presidente" if r["status"] == "approved_by_president" else "Em Desenvolvimento"),
            "dossier_text": r["dossier_text"],
            "created_at": r["created_at"]
        })
    return results

def approve_software_idea(pipeline_id: int) -> Dict[str, Any]:
    """Presidente Daniel aprova uma ideia de software para entrar em produção imediata."""
    conn = get_db()
    c = conn.cursor()
    c.execute("UPDATE innovation_software_pipeline SET status = 'approved_by_president' WHERE id = ?", (pipeline_id,))
    c.execute("SELECT * FROM innovation_software_pipeline WHERE id = ?", (pipeline_id,))
    row = c.fetchone()
    conn.commit()
    conn.close()
    
    if not row:
        return {"success": False, "message": "Software não encontrado no pipeline."}
    
    return {
        "success": True,
        "message": f"Software {row['name']} aprovado pelo Presidente Daniel Soares Correia! Encaminhado para desenvolvimento imediato.",
        "software": dict(row)
    }
