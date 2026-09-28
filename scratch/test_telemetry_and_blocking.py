import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"
MASTER_KEY = "coon2026master"
HEADERS_ADMIN = {"X-Coon-Master-Key": MASTER_KEY}

def test_user_blocking_and_unblocking():
    print("=== 1. TESTANDO BLOQUEIO E DESBLOQUEIO DE USUÁRIOS ===")
    
    # 1.1 Listar usuários
    r_users = requests.get(f"{BASE_URL}/api/admin/users", headers=HEADERS_ADMIN)
    assert r_users.status_code == 200, f"Erro ao listar usuários: {r_users.text}"
    users = r_users.json()["users"]
    assert len(users) > 0, "Deveria ter usuários cadastrados"
    target_user = users[0]
    uid = target_user["id"]
    uemail = target_user["email"]
    print(f"  [OK] Listou {len(users)} usuários do banco. Alvo de teste: ID {uid} ({uemail})")

    # 1.2 Bloquear usuário
    r_block = requests.post(
        f"{BASE_URL}/api/admin/users/{uid}/toggle-status",
        headers=HEADERS_ADMIN,
        json={"status": "blocked"}
    )
    assert r_block.status_code == 200, f"Erro ao bloquear usuário: {r_block.text}"
    print(f"  [OK] Usuário ID {uid} BLOQUEADO com sucesso.")

    # 1.3 Testar acesso bloqueado no middleware
    login_payload = {
        "email": "perito@infercoon.com.br",
        "password": "infer123"
    }
    r_log = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    if r_log.status_code == 200:
        token = r_log.json()["token"]
        r_me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        # Se for o usuário bloqueado, o middleware deve barrar com 403
        if uemail == "perito@infercoon.com.br":
            assert r_me.status_code == 403, f"Deveria ter sido bloqueado com 403, retornou: {r_me.status_code}"
            print("  [OK] Middleware bloqueou requisição do cliente com 403 Forbidden.")
    
    # 1.4 Desbloquear usuário
    r_unblock = requests.post(
        f"{BASE_URL}/api/admin/users/{uid}/toggle-status",
        headers=HEADERS_ADMIN,
        json={"status": "active"}
    )
    assert r_unblock.status_code == 200, f"Erro ao desbloquear: {r_unblock.text}"
    print(f"  [OK] Usuário ID {uid} DESBLOQUEADO com sucesso.")

    # 1.5 Bloqueio por App Específico
    r_app_lock = requests.post(
        f"{BASE_URL}/api/admin/users/{uid}/app-access",
        headers=HEADERS_ADMIN,
        json={"app_id": "ad", "status": "locked_payment", "plan_id": "pro"}
    )
    assert r_app_lock.status_code == 200
    print(f"  [OK] Bloqueio granular do app 'ad.coon' configurado para status 'locked_payment'.")

def test_ai_watchdog_diagnostics():
    print("\n=== 2. TESTANDO OBSERVATÓRIO ALICE AI WATCHDOG ===")
    
    # 2.1 Simular Falha de Cliente no infer.coon (Singularidade Matricial)
    sim_payload = {
        "app_id": "infer",
        "error_message": "ValueError: Matrix is singular in statsmodels OLS. Multicollinearity detected between area_util and area_total.",
        "client_email": "dr.maranhao@avaliacoes.com.br"
    }
    r_sim = requests.post(
        f"{BASE_URL}/api/admin/test-telemetry-error",
        headers=HEADERS_ADMIN,
        json=sim_payload
    )
    assert r_sim.status_code == 200, f"Erro ao simular erro: {r_sim.text}"
    diag = r_sim.json()["diagnostic"]
    assert "Singularidade Matricial" in diag["error_summary"]
    print(f"  [OK] Simulação de erro gerada. Diagnóstico da IA:")
    print(f"       • Título: {diag['error_summary']}")
    print(f"       • Diagnóstico: {diag['ai_human_diagnosis']}")
    print(f"       • Ação Suporte: {diag['ai_suggested_fix']}")
    print(f"       • Severidade: {diag['severity']}")

    # 2.2 Consultar Feed de Diagnósticos no Admin
    r_feed = requests.get(f"{BASE_URL}/api/admin/ai-diagnostics", headers=HEADERS_ADMIN)
    assert r_feed.status_code == 200
    feed = r_feed.json()["diagnostics"]
    assert len(feed) > 0, "Feed de diagnósticos deveria conter registros"
    latest = feed[0]
    print(f"  [OK] Feed do Observatório listou {len(feed)} diagnósticos. Mais recente ID: {latest['id']}")

    # 2.3 Marcar Diagnóstico como Resolvido
    r_res = requests.post(f"{BASE_URL}/api/admin/ai-diagnostics/{latest['id']}/resolve", headers=HEADERS_ADMIN)
    assert r_res.status_code == 200
    print(f"  [OK] Diagnóstico ID {latest['id']} marcado como resolvido com sucesso.")

if __name__ == "__main__":
    test_user_blocking_and_unblocking()
    test_ai_watchdog_diagnostics()
    print("\n=======================================================")
    print("  SUÍTE DE TELEMETRIA E BLOQUEIOS 100% HOMOLOGADA!")
    print("=======================================================")
