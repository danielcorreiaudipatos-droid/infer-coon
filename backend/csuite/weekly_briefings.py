"""
Módulo de Reuniões Semanais da Diretoria & Relatórios Executivos de Produção.
Holding: Co.on Participações Ltda.

Programa e documenta reuniões semanais de produção toda segunda-feira,
sintetizando metas, entregas, pautas por diretor e relatórios executivos para o Presidente Daniel.
"""

import os
import time
import json
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

def init_weekly_briefing_tables():
    """Inicializa as tabelas de reuniões e relatórios semanais de produção."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
    CREATE TABLE IF NOT EXISTS weekly_production_meetings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_number INTEGER NOT NULL,
        meeting_date TEXT NOT NULL,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed'
        agenda_topics TEXT NOT NULL,              -- JSON array
        production_report TEXT NOT NULL,          -- Markdown completo
        approved_by_president BOOLEAN DEFAULT 0,
        created_at REAL NOT NULL
    )
    """)

    # Seed inicial: Reunião Semanal que começa amanhã (Segunda-feira)
    c.execute("SELECT COUNT(*) as count FROM weekly_production_meetings")
    row = c.fetchone()
    if row and row["count"] == 0:
        now = time.time()
        agenda = [
            {"director": "Dr. Alexandre Valente (VP)", "topic": "Alinhamento do Plano Estratégico Semanal e Diretrizes da Holding Co.on Participações"},
            {"director": "Arthur Montenegro (CFO)", "topic": "Previsão de Fluxo de Caixa da Semana, Metas de Assinaturas e Ponto de Equilíbrio"},
            {"director": "Dr. Gabriel Silveira (CINO)", "topic": "Apresentação dos Dossiês de Viabilidade: Contrato.coon e ITBI.coon"},
            {"director": "Profª Dra. Alice, PhD (CTO)", "topic": "Cronograma de Calibração Pericial NBR 14653 e Banco de Amostras Urbanas/Rurais"},
            {"director": "Lucas Albuquerque (CRO)", "topic": "Metas de Aquisição Paga (Meta/Google Ads) e Novas Copies de Alta Conversão"},
            {"director": "Dr. Bernardo Rezende (COO)", "topic": "Monitoramento de Uptime na Nuvem Hetzner, Rotinas de Backup e SLAs"},
            {"director": "Dr. Victor Canto (CISO)", "topic": "Varredura Preventiva Fort Knox, Tokens JWT e Auditoria de Acessos"},
            {"director": "Dra. Sofia Mendes (CSO)", "topic": "Índice de Retenção de Clientes (Churn < 1.5%) e Pesquisas de Satisfação"},
            {"director": "Prof. Dr. Claude Valois (Advisor)", "topic": "Segunda Opinião Analítica sobre as Metas da Semana e Gestão de Riscos"}
        ]

        report_md = """# 📊 Relatório Executivo Semanal de Produção • Semana 39/2026
**Holding: Co.on Participações Ltda.**  
**Data da Reunião:** Segunda-feira, 28 de Setembro de 2026 — 08:30  
**Presidência:** Daniel Soares Correia • **Coordenação:** Dr. Alexandre Valente (VP)

---

### 1. Destaques & Metas de Produção da Semana
* **Engenharia & Cálculo (infer.coon):** Manutenção do Grau III de Precisão e Fundamentação em 100% dos laudos gerados; paridade estrita com SisDEA.
* **Comercial & Tráfego (ad.coon & growth.coon):** Meta de captação de 45 novos assinantes no lote fundador, mantendo CAC abaixo de R$ 38,00.
* **Finanças & Caixa (Arthur Montenegro):** Projeção de faturamento semanal de R$ 22.500,00 com margem líquida superior a 80%.
* **P&D & Novos Negócios (Dr. Gabriel Silveira):** Validação das primeiras 20 imobiliárias em lista de espera para o Contrato.coon.
* **Infraestrutura & Operações (Dr. Bernardo):** Meta de 100% de disponibilidade dos servidores Hetzner e latência média < 45ms.
* **Segurança (Dr. Victor Canto):** Perímetro de segurança blindado, sem nenhum incidente registrado.
* **Auditoria de Segunda Opinião (Prof. Dr. Claude Valois):** Planos da semana revisados e considerados robustos.

---
*Relatório gerado automaticamente para chancela do Presidente Daniel Soares Correia.*
"""

        c.execute("""
            INSERT INTO weekly_production_meetings (
                week_number, meeting_date, title, status, agenda_topics, production_report, approved_by_president, created_at
            ) VALUES (39, 'Segunda-feira, 28/09/2026 - 08:30', 'Kickoff Semanal de Produção • Co.on Participações Ltda.', 'scheduled', ?, ?, 0, ?)
        """, (json.dumps(agenda), report_md, now))

    conn.commit()
    conn.close()

init_weekly_briefing_tables()

def get_next_scheduled_meeting() -> Dict[str, Any]:
    """Retorna a próxima reunião agendada da diretoria."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM weekly_production_meetings
        ORDER BY id DESC
        LIMIT 1
    """)
    row = c.fetchone()
    conn.close()

    if not row:
        return {}
    
    return {
        "id": row["id"],
        "week_number": row["week_number"],
        "meeting_date": row["meeting_date"],
        "title": row["title"],
        "status": row["status"],
        "agenda_topics": json.loads(row["agenda_topics"]) if row["agenda_topics"] else [],
        "production_report": row["production_report"],
        "approved_by_president": bool(row["approved_by_president"]),
        "created_at": row["created_at"]
    }

def list_weekly_meetings(limit: int = 10) -> List[Dict[str, Any]]:
    """Lista o histórico de reuniões e atas semanais."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        SELECT * FROM weekly_production_meetings
        ORDER BY id DESC
        LIMIT ?
    """, (limit,))
    rows = c.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "week_number": r["week_number"],
            "meeting_date": r["meeting_date"],
            "title": r["title"],
            "status": r["status"],
            "agenda_topics": json.loads(r["agenda_topics"]) if r["agenda_topics"] else [],
            "production_report": r["production_report"],
            "approved_by_president": bool(r["approved_by_president"]),
            "created_at": r["created_at"]
        })
    return results

def approve_weekly_production_meeting(meeting_id: int) -> Dict[str, Any]:
    """Presidente Daniel aprova formalmente a ata e o relatório de produção da semana."""
    conn = get_db()
    c = conn.cursor()
    c.execute("""
        UPDATE weekly_production_meetings
        SET approved_by_president = 1, status = 'completed'
        WHERE id = ?
    """, (meeting_id,))
    conn.commit()
    conn.close()
    return {
        "success": True,
        "message": "Ata e Relatório Semanal de Produção chancelados com sucesso pelo Presidente Daniel Soares Correia!"
    }
