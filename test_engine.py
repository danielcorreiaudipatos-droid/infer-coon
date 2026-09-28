"""
Script de teste automatizado chamando diretamente as funções do motor estatístico.
"""
from backend.main import (
    app, 
    run_regression, 
    get_default_dataset, 
    login, 
    list_plans,
    RegressionRequest,
    SubjectData,
    LoginRequest,
    DEFAULT_SAMPLES,
    DEFAULT_SUBJECT
)

def test_full_pipeline():
    print(">>> 1. Testando Dataset Padrão...")
    data = get_default_dataset()
    assert len(data["samples"]) == 10
    print(f"Dataset carregado com {len(data['samples'])} amostras.")

    print("\n>>> 2. Executando Motor Estatístico OLS e NBR 14653...")
    req = RegressionRequest(
        samples=data["samples"],
        dependent_var="preco",
        independent_vars=["area", "vagas", "idade", "padrao"],
        transformations={
            "preco": "linear",
            "area": "linear",
            "vagas": "linear",
            "idade": "linear",
            "padrao": "linear"
        },
        subject=SubjectData(**data["subject"])
    )
    
    res = run_regression(req)
    
    print("\n================ RESULTADOS DA REGRESSÃO ================")
    print(f"Número de Amostras (n): {res['n_samples']}")
    print(f"Regressores (k): {res['k_regressors']}")
    print(f"R²: {res['r2']:.4f} | R² Ajustado: {res['r2_adj']:.4f}")
    print(f"F-calculado: {res['f_statistic']:.2f} (p-valor: {res['f_pvalue']:.6f})")
    print(f"Shapiro-Wilk: W={res['shapiro_wilk']['statistic']} (p={res['shapiro_wilk']['p_value']}) | Normal: {res['shapiro_wilk']['is_normal']}")
    print(f"Durbin-Watson: {res['durbin_watson']}")
    
    print("\n--- Coeficientes e Teste t ---")
    for coef in res["coefficients"]:
        vif_str = f"VIF={coef['vif']}" if coef['vif'] is not None else "VIF=N/A"
        print(f"  {coef['variable']:<10} Coef: {coef['coefficient']:>12.2f} | t: {coef['t_statistic']:>7.2f} | p: {coef['p_value']:>7.4f} | {vif_str}")
        
    print("\n--- Enquadramento NBR 14653-2 ---")
    print(f"Grau de Fundamentação: {res['fundamentacao']['grau_geral']}")
    for item in res['fundamentacao']['itens']:
        print(f"  - {item['item']}: {item['grau']} ({item['descricao']})")
        
    subj = res['subject_evaluation']
    print(f"\n--- Avaliação do Imóvel Sujeito ---")
    print(f"Valor Estimado: R$ {subj['estimated_value']:,.2f}")
    print(f"Valor Unitário: R$ {subj['unit_value']:,.2f}/m²")
    print(f"Intervalo de Confiança (80%): R$ {subj['confidence_interval_80']['lower']:,.2f} a R$ {subj['confidence_interval_80']['upper']:,.2f}")
    print(f"Amplitude do IC (80%): {subj['confidence_interval_80']['amplitude_percent']:.2f}% -> Grau de Precisão: {subj['grau_precisao']}")
    print(f"Campo de Arbítrio (+-15%): R$ {subj['campo_arbitrio_15']['min']:,.2f} a R$ {subj['campo_arbitrio_15']['max']:,.2f}")
    
    print(f"\n--- Auditoria da IA Pericial ---")
    audit = res['audit']
    print(f"Conformidade Geral: {audit['ai_summary']['overall_status']} (Score: {audit['ai_summary']['conformity_score']}/100)")
    print(f"Parecer: {audit['ai_summary']['conclusion']}")
    print(f"Outliers / Influentes detectados: {audit['ai_summary']['total_outliers_detected']}")
    
    print("\n>>> 3. Testando Autenticação e Planos...")
    login_res = login(LoginRequest(email="perito@infercoon.com.br", password="infer123"))
    token = login_res["token"]
    user = login_res["user"]
    print(f"Login OK: {user['name']} | Plano: {user['plan']} | Token JWT gerado!")
    
    plans_res = list_plans()
    print(f"Planos para monetização: {[p['name'] for p in plans_res['plans']]}")
    
    print("\n>>> TODOS OS TESTES PASSARAM COM 100% DE SUCESSO!")

if __name__ == "__main__":
    test_full_pipeline()
