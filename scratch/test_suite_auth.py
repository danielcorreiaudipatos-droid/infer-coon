import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_routes():
    print("=== 1. TESTANDO ROTAS FRONTEND & INJEÇÃO DO COON-AUTH ===")
    routes = [
        ("/", "coon-auth.js"),
        ("/ad", "coon-auth.js"),
        ("/growth", "coon-auth.js"),
        ("/cob", "coon-auth.js"),
        ("/imob", "coon-auth.js"),
        ("/check", "coon-auth.js"),
        ("/studio", "coon-auth.js"),
        ("/infer", "coon-auth.js"),
        ("/admin", "masterAuthModal")
    ]
    
    for path, expected in routes:
        url = f"{BASE_URL}{path}"
        try:
            r = requests.get(url, timeout=5)
            assert r.status_code == 200, f"Status {r.status_code} em {url}"
            assert expected in r.text, f"'{expected}' não encontrado em {url}"
            print(f"  [OK] {path.ljust(10)} -> 200 OK & Contém '{expected}'")
        except Exception as e:
            print(f"  [FALHA] {path} -> {e}")
            sys.exit(1)

def test_client_auth():
    print("\n=== 2. TESTANDO FLUXO DE CLIENTE (CADASTRO, LOGIN & PERFIL) ===")
    
    # 2.1 Cadastro
    reg_payload = {
        "name": "Dr. Fernando Imóveis",
        "email": f"fernando_test_{int(sys.version_info[0])}@imobiliaria.com.br",
        "password": "senhaForte2026@"
    }
    r_reg = requests.post(f"{BASE_URL}/api/auth/register", json=reg_payload)
    print(f"  Registro: status {r_reg.status_code}")
    assert r_reg.status_code in [200, 400], f"Erro no registro: {r_reg.text}"
    
    # 2.2 Login com Email/Senha
    login_payload = {
        "email": reg_payload["email"],
        "password": reg_payload["password"]
    }
    r_log = requests.post(f"{BASE_URL}/api/auth/login", json=login_payload)
    assert r_log.status_code == 200, f"Erro no login: {r_log.text}"
    log_data = r_log.json()
    token = log_data["token"]
    assert token, "Token não retornado no login"
    assert log_data["user"]["email"] == reg_payload["email"]
    print(f"  [OK] Login Email/Senha -> 200 OK | Token gerado: {token[:20]}...")
    
    # 2.3 Sessão /api/auth/me
    headers = {"Authorization": f"Bearer {token}"}
    r_me = requests.get(f"{BASE_URL}/api/auth/me", headers=headers)
    assert r_me.status_code == 200, f"Erro no /me: {r_me.text}"
    me_data = r_me.json()
    assert me_data["user"]["email"] == reg_payload["email"]
    print(f"  [OK] /api/auth/me -> 200 OK | Usuário: {me_data['user']['name']} ({me_data['user']['plan']})")
    
    # 2.4 Google OAuth
    google_payload = {
        "email": "mariana.engenharia@gmail.com",
        "name": "Mariana Santos Eng"
    }
    r_google = requests.post(f"{BASE_URL}/api/auth/google", json=google_payload)
    assert r_google.status_code == 200, f"Erro no google login: {r_google.text}"
    g_data = r_google.json()
    assert g_data["user"]["email"] == "mariana.engenharia@gmail.com"
    print(f"  [OK] Google OAuth -> 200 OK | Cliente Google conectado: {g_data['user']['name']}")

def test_admin_master_key():
    print("\n=== 3. TESTANDO CHAVE MASTER DO ADMINISTRADOR ===")
    
    # 3.1 Verificação de Chave Master Errada
    r_wrong = requests.post(f"{BASE_URL}/api/admin/verify-key", json={"key": "chave_errada"})
    assert r_wrong.status_code == 401, "Deveria barrar chave errada"
    print("  [OK] Chave incorreta rejeitada com 401 Unauthorized")
    
    # 3.2 Verificação de Chave Master Correta
    r_ok = requests.post(f"{BASE_URL}/api/admin/verify-key", json={"key": "coon2026master"})
    assert r_ok.status_code == 200, f"Erro na chave master: {r_ok.text}"
    print("  [OK] Chave Master 'coon2026master' autorizada com 200 OK")
    
    # 3.3 Login via /api/auth/login usando Chave Master
    master_login_payload = {
        "email": "admin@coon.com.br",
        "password": "coon2026master"
    }
    r_master_log = requests.post(f"{BASE_URL}/api/auth/login", json=master_login_payload)
    assert r_master_log.status_code == 200
    m_data = r_master_log.json()
    assert m_data["user"]["is_admin"] is True, "is_admin deve ser True"
    assert m_data.get("master_key") == "coon2026master"
    admin_token = m_data["token"]
    print(f"  [OK] Login Master -> is_admin: True | master_key: {m_data['master_key']}")
    
    # 3.4 Desbloqueio e Acesso a Métricas Admin com Header X-Coon-Master-Key
    r_metrics_raw = requests.get(f"{BASE_URL}/api/admin/metrics", headers={"X-Coon-Master-Key": "coon2026master"})
    assert r_metrics_raw.status_code == 200
    m_res = r_metrics_raw.json()
    print(f"  [OK] /api/admin/metrics (Chave Raw) -> MRR: {m_res['mrr_formatted']} | Empresas: {m_res['active_companies']}")

    # 3.5 Acesso a Métricas Admin com Token JWT emitido
    r_metrics_jwt = requests.get(f"{BASE_URL}/api/admin/metrics", headers={"Authorization": f"Bearer {admin_token}"})
    assert r_metrics_jwt.status_code == 200
    print(f"  [OK] /api/admin/metrics (Token JWT Admin) -> Autorizado com 200 OK")

    # 3.6 Acesso aos Assinantes Hetzner
    r_subs = requests.get(f"{BASE_URL}/api/admin/recent-subscriptions", headers={"X-Coon-Master-Key": "coon2026master"})
    assert r_subs.status_code == 200
    print(f"  [OK] /api/admin/recent-subscriptions -> {len(r_subs.json().get('subscriptions', []))} registros reais listados")

if __name__ == "__main__":
    test_routes()
    test_client_auth()
    test_admin_master_key()
    print("\n=======================================================")
    print("  TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!")
    print("=======================================================")
