"""
Teste Automatizado do Módulo Financeiro e do Conselho Executivo C-Suite.
Holding COON Soluções Tecnológicas.
"""

import sys
import os

# Adiciona o caminho do projeto ao sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.financial import (
    get_cash_flow_summary,
    record_cash_transaction,
    list_cash_transactions,
    delete_cash_transaction,
    parse_and_record_financial_command
)
from backend.csuite.personas import DIRECTORS, get_all_directors_list
from backend.csuite.orchestrator import (
    conduct_executive_roundtable,
    CSuiteChatRequest,
    get_recent_csuite_history
)

def run_tests():
    print("=== TESTE 1: MÓDULO FINANCEIRO DO ARTHUR MONTENEGRO ===")
    summary = get_cash_flow_summary()
    print("Faturamento Bruto:", summary["formatado"]["faturamento_bruto"])
    print("Despesas Totais:", summary["formatado"]["despesas_totais"])
    print("Lucro Líquido Real:", summary["formatado"]["lucro_liquido_real"])
    print("Margem Líquida:", summary["formatado"]["margem_liquida"])
    assert summary["faturamento_bruto"] > 0
    assert summary["despesas_totais"] > 0
    assert summary["lucro_liquido_real"] > 0

    print("\n=== TESTE 2: LANÇAMENTO MANUAL DE DESPESA ===")
    tx = record_cash_transaction(
        tx_type="expense",
        category="marketing_ads",
        amount=350.00,
        description="Teste de Anúncio Meta Ads para ad.coon",
        source="manual_admin"
    )
    print("Transação gravada:", tx)
    assert tx["id"] is not None
    assert tx["amount"] == 350.00

    print("\n=== TESTE 3: PARSER CONVERSACIONAL DO ARTHUR ===")
    cmd_res = parse_and_record_financial_command("Arthur, lance 400 reais em servidores hoje")
    assert cmd_res is not None
    print("Resultado do comando conversacional:", cmd_res["feedback_message"])
    assert cmd_res["transaction"]["amount"] == 400.00
    assert cmd_res["transaction"]["category"] == "infrastructure"

    print("\n=== TESTE 4: DIRETORIA C-SUITE ===")
    directors = get_all_directors_list()
    print(f"Total de Diretores cadastrados: {len(directors)}")
    for d in directors:
        print(f" - {d['name']} ({d['role']})")
    assert len(directors) == 7

    print("\n=== TESTE 5: SESSÃO DA MESA REDONDA EXECUTIVA ===")
    req = CSuiteChatRequest(
        message="Arthur, qual a situação do nosso lucro líquido e caixa hoje?",
        session_id="test_session_01"
    )
    resp = conduct_executive_roundtable(req)
    print(f"Lead Director: {resp.lead_director_id}")
    print(f"Total de falas na mesa: {len(resp.turns)}")
    for turn in resp.turns:
        print(f"\n[{turn.speaker_name} - {turn.speaker_role}]:")
        print(turn.message[:150] + "...")
    assert resp.lead_director_id == "arthur_montenegro"
    assert len(resp.turns) >= 2 # Arthur + Dr. Alexandre Valente (VP)

    print("\n=== TESTE 6: HISTÓRICO DE ATAS DO CONSELHO ===")
    history = get_recent_csuite_history(limit=5)
    print(f"Total de mensagens no histórico: {len(history)}")
    assert len(history) > 0

    # Limpeza dos lançamentos de teste
    delete_cash_transaction(tx["id"])
    delete_cash_transaction(cmd_res["transaction"]["id"])
    print("\n[OK] TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!")

if __name__ == "__main__":
    run_tests()
