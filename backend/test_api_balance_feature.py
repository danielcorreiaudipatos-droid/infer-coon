"""
Script de teste automatizado para validar o Módulo de Saldos de APIs, Recargas,
Vencimento de Taxas/Apps, Alertas do CFO Arthur e Pareceres dos 10 Diretores.
"""

import sys
import os

# Adiciona raiz ao sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from backend.financial import (
    init_financial_tables,
    list_api_balances,
    reload_api_balance,
    list_app_renewals,
    add_app_renewal,
    mark_renewal_paid,
    get_cfo_api_and_renewal_alerts,
    get_csuite_api_optimization_suggestions,
    get_cash_flow_summary
)

def test_api_balances_and_renewals():
    print("1. Inicializando tabelas...")
    init_financial_tables()

    print("\n2. Testando list_api_balances()...")
    res_apis = list_api_balances()
    assert "apis" in res_apis, "Chave 'apis' não encontrada"
    assert len(res_apis["apis"]) >= 6, f"Esperado ao menos 6 APIs, obtido {len(res_apis['apis'])}"
    print(f"   -> Sucesso! {len(res_apis['apis'])} APIs conectadas.")
    for a in res_apis["apis"]:
        print(f"      • {a['service_name']}: {a['balance_formatted']} ({a['days_remaining_label']}) - Status: {a['status_label']}")

    print("\n3. Testando Alerta do CFO Arthur Montenegro...")
    cfo = get_cfo_api_and_renewal_alerts()
    assert "executive_statement" in cfo, "Declaração executiva do CFO ausente"
    print(f"   -> Nível de Atenção: {cfo['status_level']}")
    print(f"   -> Aporte Imediato Sugerido: {cfo['total_capital_needed_formatted']}")
    print(f"   -> Declaração de Arthur:\n{cfo['executive_statement'][:250]}...")

    print("\n4. Testando Recarga na API Gemini...")
    summary_before = get_cash_flow_summary()
    dre_expenses_before = summary_before["despesas_totais"]
    reload_res = reload_api_balance(service_key="gemini", amount=150.00, method="pix")
    assert reload_res["success"] is True, "Falha na recarga"
    summary_after = get_cash_flow_summary()
    assert summary_after["despesas_totais"] == dre_expenses_before + 150.00, "Despesa de recarga não refletiu no DRE"
    print(f"   -> Recarga confirmada: Novo saldo do Gemini = {reload_res['new_balance_formatted']}")
    print(f"   -> DRE da Holding recalculado: Despesas Totais = {summary_after['formatado']['despesas_totais']}")

    print("\n5. Testando list_app_renewals()...")
    ren_data = list_app_renewals()
    assert len(ren_data["renewals"]) >= 7, f"Esperado ao menos 7 renovações, obtido {len(ren_data['renewals'])}"
    print(f"   -> {len(ren_data['renewals'])} renovações cadastradas.")
    for r in ren_data["renewals"][:4]:
        print(f"      • {r['app_name']}: {r['amount_formatted']} ({r['due_day_label']}) - {r['urgency_label']}")

    print("\n6. Testando mark_renewal_paid()...")
    first_ren = ren_data["renewals"][0]
    paid_res = mark_renewal_paid(first_ren["id"])
    assert paid_res["success"] is True, "Falha ao quitar renovação"
    print(f"   -> Renovação de '{paid_res['app_name']}' quitada com sucesso!")

    print("\n7. Testando pareceres dos 10 Diretores do Conselho Executivo...")
    sugg = get_csuite_api_optimization_suggestions()
    assert len(sugg) == 10, f"Esperado 10 diretores, obtido {len(sugg)}"
    print(f"   -> Sucesso! {len(sugg)} diretores emitiram pareceres técnicos e estratégicos.")
    for s in sugg:
        print(f"      [{s['name']}] ({s['badge']}): {s['title']}")

    print("\n==============================================")
    print("TODOS OS TESTES DO BACKEND PASSARAM COM SUCESSO!")
    print("==============================================")

if __name__ == "__main__":
    test_api_balances_and_renewals()
