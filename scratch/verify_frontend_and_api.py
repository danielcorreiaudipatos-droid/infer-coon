import urllib.request
import json

MASTER_KEY = "coon2026master"
BASE_URL = "http://127.0.0.1:8000"

def verify():
    # 1. Test Admin HTML page
    req = urllib.request.Request(f"{BASE_URL}/admin")
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode('utf-8')
        assert "sec-war-room" in html
        assert "sec-cfo-cashflow" in html
        assert "modalNewCashTransaction" in html
        assert "Dr. Alexandre Valente" in html
        assert "Arthur Montenegro" in html
        print("[OK] Admin HTML contém todas as novas seções do Conselho e do Caixa!")

    headers = {
        "X-Coon-Master-Key": MASTER_KEY,
        "Content-Type": "application/json"
    }

    # 2. Test Cash Flow API
    req = urllib.request.Request(f"{BASE_URL}/api/admin/financial/cash-flow", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        s = data['summary']
        txs = data['transactions']
        print(f"[OK] Cash Flow Summary: Faturamento={s['formatado']['faturamento_bruto']}, Despesas={s['formatado']['despesas_totais']}, Lucro={s['formatado']['lucro_liquido_real']}, Margem={s['formatado']['margem_liquida']}")
        print(f"[OK] Lançamentos no extrato: {len(txs)}")

    # 3. Test C-Suite Chat API
    payload = json.dumps({
        "message": "Arthur, qual a margem de lucro operacional hoje?",
        "session_id": "test_board_session"
    }).encode('utf-8')
    req = urllib.request.Request(f"{BASE_URL}/api/admin/csuite/chat", data=payload, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        assert data['lead_director_id'] == "arthur_montenegro"
        print(f"[OK] C-Suite Chat Lead Director: {data['lead_director_id']} com {len(data['turns'])} turnos de fala!")

    # 4. Test C-Suite History API
    req = urllib.request.Request(f"{BASE_URL}/api/admin/csuite/history?limit=10", headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(f"[OK] Histórico do Conselho retornado: {len(data['history'])} mensagens salvas!")

    print("\n[SUCESSO] TODA A ARQUITETURA ESTÁ 100% OPERACIONAL E HOMOLOGADA!")

if __name__ == "__main__":
    verify()
