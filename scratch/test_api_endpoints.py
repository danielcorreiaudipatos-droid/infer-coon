import urllib.request
import json

MASTER_KEY = "coon2026master"
BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    headers = {
        "X-Coon-Master-Key": MASTER_KEY,
        "Content-Type": "application/json"
    }

    # 1. Test Directors list
    req = urllib.request.Request(f"{BASE_URL}/api/admin/csuite/directors", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[OK] Directores retornados: {len(data['directors'])}")
        assert len(data['directors']) == 7

    # 2. Test Cash Flow
    req = urllib.request.Request(f"{BASE_URL}/api/admin/financial/cash-flow", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        summary = data['summary']
        print(f"[OK] Cash Flow: Faturamento={summary['formatado']['faturamento_bruto']}, Lucro={summary['formatado']['lucro_liquido_real']}")
        assert summary['faturamento_bruto'] > 0

    # 3. Test Manual Cash Transaction
    payload = json.dumps({
        "type": "revenue",
        "category": "consultancy",
        "amount": 2500.00,
        "description": "Laudo Pericial Bancário RAE",
        "source": "manual_admin"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/admin/financial/transactions", data=payload, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[OK] Transação criada: ID={data['transaction']['id']}, Lucro={data['updated_summary']['formatado']['lucro_liquido_real']}")
        tx_id = data['transaction']['id']

    # 4. Test CSuite Chat (Arthur cash command)
    payload = json.dumps({
        "message": "Arthur, lancei 350 reais em anúncios hoje",
        "session_id": "api_test_session"
    }).encode()
    req = urllib.request.Request(f"{BASE_URL}/api/admin/csuite/chat", data=payload, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[OK] C-Suite Chat Turns: {len(data['turns'])}")
        print(f"Lead Director: {data['lead_director_id']}")
        for t in data['turns']:
            msg_ascii = t['message'][:100].encode('ascii', 'replace').decode()
            print(f" -> {t['speaker_name']}: {msg_ascii}...")

    # Cleanup transaction
    req = urllib.request.Request(f"{BASE_URL}/api/admin/financial/transactions/{tx_id}", headers=headers, method="DELETE")
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        print(f"[OK] Transação removida: {data['message']}")

    print("\n[OK] TODOS OS ENDPOINTS DA API ESTÃO 100% OPERACIONAIS!")

if __name__ == "__main__":
    test_endpoints()
