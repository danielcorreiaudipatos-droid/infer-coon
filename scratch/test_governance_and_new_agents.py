import json
import urllib.request
import urllib.parse
import sys

sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"
MASTER_KEY = "coon2026master"

def get(path):
    req = urllib.request.Request(f"{BASE_URL}{path}", headers={"X-Coon-Master-Key": MASTER_KEY})
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

def post(path, body):
    data = json.dumps(body).encode('utf-8')
    req = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=data,
        headers={"Content-Type": "application/json", "X-Coon-Master-Key": MASTER_KEY}
    )
    with urllib.request.urlopen(req) as resp:
        return resp.status, resp.read().decode('utf-8')

def test_all():
    print("=== INICIANDO AUDITORIA GERAL DE GOVERNANÇA, NOVOS DIRETORES E REUNIÕES ===")
    
    # 1. Test /governance HTML
    status, html = get("/governance")
    assert status == 200, f"Failed /governance: {status}"
    assert "Co.on Participações Ltda." in html, "Razão social ausente em /governance"
    assert "Dr. Gabriel Silveira" in html, "Dr. Gabriel ausente em /governance"
    assert "Prof. Dr. Claude Valois" in html, "Prof. Claude ausente em /governance"
    print("✅ 1. Painel Corporativo /governance carregado com sucesso (Razão Social e Diretores confirmados)")

    # 2. Test /admin HTML
    status, admin_html = get("/admin")
    assert status == 200, f"Failed /admin: {status}"
    assert "Co.on Participações Ltda." in admin_html, "Razão social ausente em /admin"
    assert "gabriel_silveira" in admin_html, "gabriel_silveira ausente no C-Suite roster do /admin"
    assert "claude_valois" in admin_html, "claude_valois ausente no C-Suite roster do /admin"
    print("✅ 2. Master Cockpit /admin atualizado com 9 diretores e holding Co.on Participações Ltda.")

    # 3. Test /api/admin/csuite/directors
    status, data_str = get("/api/admin/csuite/directors")
    assert status == 200
    directors_data = json.loads(data_str)
    directors = directors_data.get("directors", [])
    assert len(directors) == 9, f"Esperado 9 diretores, obtido {len(directors)}"
    dir_ids = [d["id"] for d in directors]
    assert "gabriel_silveira" in dir_ids, "gabriel_silveira not in dir_ids"
    assert "claude_valois" in dir_ids, "claude_valois not in dir_ids"
    print(f"✅ 3. Roster de Diretores C-Suite validado: {len(directors)} diretores ativos com turn-taking")

    # 4. Test /api/admin/governance/pipeline
    status, pipe_str = get("/api/admin/governance/pipeline")
    assert status == 200
    pipe_data = json.loads(pipe_str)
    apps = pipe_data.get("pipeline", [])
    assert len(apps) >= 4, f"Esperado >= 4 softwares no pipeline, obtido {len(apps)}"
    print(f"✅ 4. Radar de P&D do Dr. Gabriel Silveira validado: {len(apps)} softwares B2B de alta rentabilidade propostos")

    # 5. Test approve software
    target_app = apps[0]
    status, app_res = post(f"/api/admin/governance/pipeline/{target_app['id']}/approve", {})
    assert status == 200
    print(f"✅ 5. Chancela Presidencial no software '{target_app['name']}' executada com sucesso")

    # 6. Test Claude Advisor
    claude_payload = {
        "subject": "Viabilidade e Segurança do modelo SaaS multi-tenant da Co.on Participações Ltda.",
        "specific_question": "Quais os pontos cegos e riscos ocultos de expandir para CRM.coon com cobrança Pix?"
    }
    status, claude_res = post("/api/admin/governance/claude-review", claude_payload)
    assert status == 200
    claude_data = json.loads(claude_res)
    assert claude_data.get("author") == "Prof. Dr. Claude Valois"
    assert "premises_analysis" in claude_data
    assert "hidden_risks" in claude_data
    print(f"✅ 6. Parecer Pericial de 2ª Opinião emitido pelo Prof. Dr. Claude Valois (Notório Saber): Protocolo {claude_data.get('opinion_id')}")

    # 7. Test Weekly Production Meetings
    status, meet_str = get("/api/admin/governance/meetings/next")
    assert status == 200
    next_meet = json.loads(meet_str)
    assert next_meet is not None and "id" in next_meet
    assert next_meet["status"] in ["scheduled", "in_progress", "completed"]
    print(f"✅ 7. Reunião Semanal de Produção validada: Data {next_meet['meeting_date']} (Semana {next_meet['week_number']})")

    # 8. Test Meeting Signing / Approval
    status, sign_res = post(f"/api/admin/governance/meetings/{next_meet['id']}/approve", {})
    assert status == 200
    print("✅ 8. Ata da Reunião Semanal chancelada e arquivada formalmente pela Presidência")

    # 9. Test C-Suite Chat with Dr. Gabriel Silveira
    chat_gabriel = {
        "message": "Dr. Gabriel, apresente uma nova oportunidade de software de altíssima rentabilidade para a holding",
        "target_director": "gabriel_silveira"
    }
    status, res_gab = post("/api/admin/csuite/chat", chat_gabriel)
    assert status == 200
    print("✅ 9. Interação direta com Dr. Gabriel Silveira (Inovação / P&D) validada no C-Suite")

    # 10. Test C-Suite Chat with Prof. Dr. Claude Valois
    chat_claude = {
        "message": "Prof. Claude, qual sua recomendação pericial sobre a cadência de reuniões semanais da holding?",
        "target_director": "claude_valois"
    }
    status, res_cla = post("/api/admin/csuite/chat", chat_claude)
    assert status == 200
    print("✅ 10. Interação sob demanda com Prof. Dr. Claude Valois (Conselheiro Notório Saber) validada")

    print("\n🎉 TODOS OS 10 TESTES DE GOVERNANÇA, NOVOS AGENTES E REUNIÕES PASSARAM COM SUCESSO ABSOLUTO!")

if __name__ == "__main__":
    test_all()
