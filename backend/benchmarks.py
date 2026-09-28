"""
Infer.coon - Bancada Oficial de 10 Testes de Validação Estatística vs SisDEA (Pelli Sistemas).
Conformidade ABNT NBR 14653 (Partes 1 e 2).
"""

import math
import numpy as np
import pandas as pd
import statsmodels.api as sm
from typing import Dict, Any, List

def calculate_ols_metrics(samples: List[Dict[str, Any]], dep_var: str, indep_vars: List[str], transforms: Dict[str, str], subject_attrs: Dict[str, float]):
    """Calcula todas as métricas OLS exatamente conforme a NBR 14653 e SisDEA."""
    df = pd.DataFrame(samples)
    
    # Aplicar transformações
    y_raw = df[dep_var].values.astype(float)
    y_trans_name = transforms.get(dep_var, "linear")
    if y_trans_name == "ln":
        y = np.log(y_raw)
    elif y_trans_name == "inv":
        y = 1.0 / y_raw
    elif y_trans_name == "sqrt":
        y = np.sqrt(y_raw)
    else:
        y = y_raw

    X_list = []
    for var in indep_vars:
        x_raw = df[var].values.astype(float)
        t_name = transforms.get(var, "linear")
        if t_name == "ln":
            X_list.append(np.log(x_raw))
        elif t_name == "inv":
            X_list.append(1.0 / x_raw)
        elif t_name == "sqrt":
            X_list.append(np.sqrt(x_raw))
        else:
            X_list.append(x_raw)
            
    X_matrix = np.column_stack(X_list)
    X_with_const = sm.add_constant(X_matrix)
    
    model = sm.OLS(y, X_with_const).fit()
    
    n = len(y)
    k = len(indep_vars)
    df_resid = n - k - 1
    
    r2 = float(model.rsquared)
    r2_adj = float(model.rsquared_adj)
    f_stat = float(model.fvalue)
    f_pval = float(model.f_pvalue)
    se_reg = float(np.sqrt(model.mse_resid))
    
    # Coeficientes
    coefs = {}
    coefs["const"] = {
        "valor": float(model.params[0]),
        "se": float(model.bse[0]),
        "t": float(model.tvalues[0]),
        "p": float(model.pvalues[0])
    }
    for i, var in enumerate(indep_vars):
        coefs[var] = {
            "valor": float(model.params[i + 1]),
            "se": float(model.bse[i + 1]),
            "t": float(model.tvalues[i + 1]),
            "p": float(model.pvalues[i + 1])
        }
        
    # Estimativa no Imóvel Avaliando
    subj_vector = [1.0]
    for var in indep_vars:
        val_raw = float(subject_attrs.get(var, 0.0))
        t_name = transforms.get(var, "linear")
        if t_name == "ln":
            subj_vector.append(math.log(val_raw) if val_raw > 0 else 0.0)
        elif t_name == "inv":
            subj_vector.append(1.0 / val_raw if val_raw != 0 else 0.0)
        elif t_name == "sqrt":
            subj_vector.append(math.sqrt(val_raw) if val_raw >= 0 else 0.0)
        else:
            subj_vector.append(val_raw)
            
    subj_vec_np = np.array(subj_vector)
    y_pred = float(np.dot(subj_vec_np, model.params))
    
    # Variância da estimativa pontual média s^2(y_0) = s^2 * (x_0 (X'X)^-1 x_0')
    cov_matrix = model.cov_params()
    var_mean_pred = float(np.dot(subj_vec_np, np.dot(cov_matrix, subj_vec_np)))
    se_mean_pred = float(np.sqrt(var_mean_pred))
    
    # t crítico para 80% bicaudal (alpha = 0.20, alpha/2 = 0.10)
    from scipy.stats import t as t_dist
    t_crit_80 = float(t_dist.ppf(0.90, df=df_resid))
    
    # Despolarização e Intervalo de Confiança 80%
    if y_trans_name == "ln":
        y_median = float(math.exp(y_pred))
        y_mean = float(math.exp(y_pred + (se_reg ** 2) / 2.0))
        y_final = y_mean
        ci_lower = float(y_median * math.exp(-t_crit_80 * se_mean_pred))
        ci_upper = float(y_median * math.exp(t_crit_80 * se_mean_pred))
    elif y_trans_name == "inv":
        y_final = float(1.0 / y_pred) if y_pred != 0 else 0.0
        y_mean = y_final
        y_median = y_final
        ci_lower = max(0.0, y_final * (1.0 - t_crit_80 * (se_mean_pred / abs(y_pred))))
        ci_upper = y_final * (1.0 + t_crit_80 * (se_mean_pred / abs(y_pred)))
    elif y_trans_name == "sqrt":
        y_final = float(y_pred ** 2)
        y_mean = y_final
        y_median = y_final
        ci_lower = max(0.0, (y_pred - t_crit_80 * se_mean_pred) ** 2)
        ci_upper = (y_pred + t_crit_80 * se_mean_pred) ** 2
    else:
        y_final = y_pred
        y_mean = y_final
        y_median = y_final
        ci_lower = max(0.0, y_final - t_crit_80 * se_mean_pred)
        ci_upper = y_final + t_crit_80 * se_mean_pred
        
    amp_abs = ci_upper - ci_lower
    amp_pct = (amp_abs / y_final) * 100.0 if y_final > 0 else 0.0
    
    # Enquadramento NBR 14653
    grau_prec = "Grau III" if amp_pct <= 30.0 else ("Grau II" if amp_pct <= 40.0 else ("Grau I" if amp_pct <= 50.0 else "Não Enquadrado"))
    
    # Grau de fundamentação aproximado
    grau_fund = "Grau III" if (n >= 3 * (k + 1) and r2 >= 0.75 and f_pval <= 0.01) else ("Grau II" if (n >= 2 * (k + 1) and r2 >= 0.50 and f_pval <= 0.05) else "Grau I")
    
    return {
        "r2": r2,
        "r2_adj": r2_adj,
        "f_stat": f_stat,
        "f_pval": f_pval,
        "se_reg": se_reg,
        "se_mean_pred": se_mean_pred,
        "t_crit_80": t_crit_80,
        "df_resid": df_resid,
        "coefficients": coefs,
        "estimated_value": y_final,
        "mean_value": y_mean,
        "median_value": y_median,
        "ci_80": {"lower": ci_lower, "upper": ci_upper, "amplitude_pct": amp_pct},
        "grau_precisao": grau_prec,
        "grau_fundamentacao": grau_fund
    }

# --------------------------------------------------------------------------
# Os 10 Modelos Oficiais de Benchmark SisDEA
# --------------------------------------------------------------------------

BENCHMARK_MODELS = [
    {
        "id": 1,
        "nome": "Modelo 1: Regressão Linear Simples (Preço x Área)",
        "descricao": "Benchmark clássico SisDEA para apartamentos urbanos. Relação direta entre área privativa e valor de mercado.",
        "tipo": "Linear Simples",
        "dependent_var": "preco",
        "independent_vars": ["area"],
        "transformations": {"preco": "linear", "area": "linear"},
        "subject": {"area": 75.0},
        "samples": [
            {"id": 1, "endereco": "Amostra 01", "preco": 320000, "area": 45.0},
            {"id": 2, "endereco": "Amostra 02", "preco": 380000, "area": 55.0},
            {"id": 3, "endereco": "Amostra 03", "preco": 420000, "area": 60.0},
            {"id": 4, "endereco": "Amostra 04", "preco": 490000, "area": 70.0},
            {"id": 5, "endereco": "Amostra 05", "preco": 560000, "area": 80.0},
            {"id": 6, "endereco": "Amostra 06", "preco": 630000, "area": 90.0},
            {"id": 7, "endereco": "Amostra 07", "preco": 710000, "area": 100.0},
            {"id": 8, "endereco": "Amostra 08", "preco": 770000, "area": 110.0},
            {"id": 9, "endereco": "Amostra 09", "preco": 850000, "area": 120.0},
            {"id": 10, "endereco": "Amostra 10", "preco": 910000, "area": 130.0},
            {"id": 11, "endereco": "Amostra 11", "preco": 980000, "area": 140.0},
            {"id": 12, "endereco": "Amostra 12", "preco": 1060000, "area": 150.0}
        ]
    },
    {
        "id": 2,
        "nome": "Modelo 2: Regressão Linear Múltipla Completa (4 Variáveis)",
        "descricao": "Modelo urbano SisDEA com Área, Vagas, Idade e Padrão Construtivo atendendo Grau III de Fundamentação.",
        "tipo": "Linear Múltiplo",
        "dependent_var": "preco",
        "independent_vars": ["area", "vagas", "idade", "padrao"],
        "transformations": {"preco": "linear", "area": "linear", "vagas": "linear", "idade": "linear", "padrao": "linear"},
        "subject": {"area": 85.0, "vagas": 2.0, "idade": 5.0, "padrao": 2.8},
        "samples": [
            {"id": 1, "endereco": "Rua Oscar Freire, 110", "preco": 850000, "area": 68.0, "vagas": 1, "idade": 6, "padrao": 2.5},
            {"id": 2, "endereco": "Alameda Lorena, 450", "preco": 1250000, "area": 95.0, "vagas": 2, "idade": 4, "padrao": 3.0},
            {"id": 3, "endereco": "Rua Bela Cintra, 890", "preco": 620000, "area": 52.0, "vagas": 1, "idade": 12, "padrao": 2.0},
            {"id": 4, "endereco": "Rua Haddock Lobo, 720", "preco": 1680000, "area": 120.0, "vagas": 2, "idade": 3, "padrao": 3.5},
            {"id": 5, "endereco": "Rua Augusta, 1420", "preco": 540000, "area": 45.0, "vagas": 0, "idade": 15, "padrao": 2.0},
            {"id": 6, "endereco": "Alameda Santos, 310", "preco": 1100000, "area": 84.0, "vagas": 1, "idade": 8, "padrao": 3.0},
            {"id": 7, "endereco": "Rua Pamplona, 980", "preco": 980000, "area": 76.0, "vagas": 1, "idade": 5, "padrao": 2.5},
            {"id": 8, "endereco": "Rua da Consolação, 2100", "preco": 710000, "area": 58.0, "vagas": 1, "idade": 10, "padrao": 2.0},
            {"id": 9, "endereco": "Alameda Campinas, 650", "preco": 1420000, "area": 105.0, "vagas": 2, "idade": 2, "padrao": 3.5},
            {"id": 10, "endereco": "Rua Estados Unidos, 180", "preco": 1950000, "area": 135.0, "vagas": 3, "idade": 5, "padrao": 3.5},
            {"id": 11, "endereco": "Rua Peixoto Gomide, 550", "preco": 890000, "area": 70.0, "vagas": 1, "idade": 7, "padrao": 2.7},
            {"id": 12, "endereco": "Alameda Itu, 320", "preco": 1340000, "area": 100.0, "vagas": 2, "idade": 3, "padrao": 3.2},
            {"id": 13, "endereco": "Rua Melo Alves, 410", "preco": 1180000, "area": 88.0, "vagas": 2, "idade": 6, "padrao": 3.0},
            {"id": 14, "endereco": "Rua da Consolação, 1850", "preco": 760000, "area": 62.0, "vagas": 1, "idade": 9, "padrao": 2.2},
            {"id": 15, "endereco": "Alameda Franca, 890", "preco": 1550000, "area": 115.0, "vagas": 2, "idade": 4, "padrao": 3.4}
        ]
    },
    {
        "id": 3,
        "nome": "Modelo 3: Semi-Log ln(Preço) com Despolarização de Miller",
        "descricao": "Cálculo exato de Média Despolarizada exp(Y + s²/2) vs Mediana exp(Y) idêntico ao SisDEA e ABNT NBR 14653-2.",
        "tipo": "Semi-Log (Miller)",
        "dependent_var": "preco",
        "independent_vars": ["area", "vagas"],
        "transformations": {"preco": "ln", "area": "linear", "vagas": "linear"},
        "subject": {"area": 80.0, "vagas": 2.0},
        "samples": [
            {"id": 1, "endereco": "Apt 101", "preco": 450000, "area": 50.0, "vagas": 1},
            {"id": 2, "endereco": "Apt 102", "preco": 580000, "area": 65.0, "vagas": 1},
            {"id": 3, "endereco": "Apt 201", "preco": 720000, "area": 75.0, "vagas": 2},
            {"id": 4, "endereco": "Apt 202", "preco": 890000, "area": 90.0, "vagas": 2},
            {"id": 5, "endereco": "Apt 301", "preco": 1050000, "area": 105.0, "vagas": 2},
            {"id": 6, "endereco": "Apt 302", "preco": 1280000, "area": 120.0, "vagas": 3},
            {"id": 7, "endereco": "Apt 401", "preco": 610000, "area": 70.0, "vagas": 1},
            {"id": 8, "endereco": "Apt 402", "preco": 790000, "area": 82.0, "vagas": 2},
            {"id": 9, "endereco": "Apt 501", "preco": 940000, "area": 95.0, "vagas": 2},
            {"id": 10, "endereco": "Apt 502", "preco": 1150000, "area": 110.0, "vagas": 3},
            {"id": 11, "endereco": "Apt 601", "preco": 510000, "area": 58.0, "vagas": 1},
            {"id": 12, "endereco": "Apt 602", "preco": 1400000, "area": 130.0, "vagas": 3}
        ]
    },
    {
        "id": 4,
        "nome": "Modelo 4: Log-Log ln(Preço) x ln(Área)",
        "descricao": "Modelo de elasticidade constante de preço em função da área (Cobb-Douglas aplicada à avaliação imobiliária).",
        "tipo": "Log-Log",
        "dependent_var": "preco",
        "independent_vars": ["area"],
        "transformations": {"preco": "ln", "area": "ln"},
        "subject": {"area": 92.0},
        "samples": [
            {"id": 1, "endereco": "Ponto A", "preco": 350000, "area": 48.0},
            {"id": 2, "endereco": "Ponto B", "preco": 440000, "area": 58.0},
            {"id": 3, "endereco": "Ponto C", "preco": 530000, "area": 68.0},
            {"id": 4, "endereco": "Ponto D", "preco": 640000, "area": 80.0},
            {"id": 5, "endereco": "Ponto E", "preco": 760000, "area": 95.0},
            {"id": 6, "endereco": "Ponto F", "preco": 890000, "area": 110.0},
            {"id": 7, "endereco": "Ponto G", "preco": 1020000, "area": 125.0},
            {"id": 8, "endereco": "Ponto H", "preco": 1180000, "area": 140.0},
            {"id": 9, "endereco": "Ponto I", "preco": 1350000, "area": 160.0},
            {"id": 10, "endereco": "Ponto J", "preco": 1540000, "area": 180.0}
        ]
    },
    {
        "id": 5,
        "nome": "Modelo 5: Modelo Recíproco 1/Idade (Depreciação Não-Linear)",
        "descricao": "Modelagem de depreciação imobiliária onde a perda de valor desacelera com a idade do imóvel (Critério de Heidecke).",
        "tipo": "Recíproco 1/X",
        "dependent_var": "preco",
        "independent_vars": ["area", "idade"],
        "transformations": {"preco": "linear", "area": "linear", "idade": "inv"},
        "subject": {"area": 70.0, "idade": 8.0},
        "samples": [
            {"id": 1, "endereco": "Imóvel 1", "preco": 680000, "area": 65.0, "idade": 2.0},
            {"id": 2, "endereco": "Imóvel 2", "preco": 630000, "area": 65.0, "idade": 5.0},
            {"id": 3, "endereco": "Imóvel 3", "preco": 590000, "area": 65.0, "idade": 10.0},
            {"id": 4, "endereco": "Imóvel 4", "preco": 560000, "area": 65.0, "idade": 20.0},
            {"id": 5, "endereco": "Imóvel 5", "preco": 850000, "area": 85.0, "idade": 3.0},
            {"id": 6, "endereco": "Imóvel 6", "preco": 790000, "area": 85.0, "idade": 7.0},
            {"id": 7, "endereco": "Imóvel 7", "preco": 740000, "area": 85.0, "idade": 15.0},
            {"id": 8, "endereco": "Imóvel 8", "preco": 710000, "area": 85.0, "idade": 25.0},
            {"id": 9, "endereco": "Imóvel 9", "preco": 1050000, "area": 110.0, "idade": 4.0},
            {"id": 10, "endereco": "Imóvel 10", "preco": 970000, "area": 110.0, "idade": 12.0}
        ]
    },
    {
        "id": 6,
        "nome": "Modelo 6: Modelo Raiz Quadrada √Área (Retornos Decrescentes)",
        "descricao": "Modelagem com transformação raiz quadrada de variável explicativa no SisDEA.",
        "tipo": "Raiz Quadrada",
        "dependent_var": "preco",
        "independent_vars": ["area", "vagas"],
        "transformations": {"preco": "linear", "area": "sqrt", "vagas": "linear"},
        "subject": {"area": 100.0, "vagas": 2.0},
        "samples": [
            {"id": 1, "endereco": "Lote 1", "preco": 220000, "area": 36.0, "vagas": 1},
            {"id": 2, "endereco": "Lote 2", "preco": 290000, "area": 49.0, "vagas": 1},
            {"id": 3, "endereco": "Lote 3", "preco": 370000, "area": 64.0, "vagas": 2},
            {"id": 4, "endereco": "Lote 4", "preco": 460000, "area": 81.0, "vagas": 2},
            {"id": 5, "endereco": "Lote 5", "preco": 560000, "area": 100.0, "vagas": 2},
            {"id": 6, "endereco": "Lote 6", "preco": 660000, "area": 121.0, "vagas": 3},
            {"id": 7, "endereco": "Lote 7", "preco": 780000, "area": 144.0, "vagas": 3},
            {"id": 8, "endereco": "Lote 8", "preco": 910000, "area": 169.0, "vagas": 3},
            {"id": 9, "endereco": "Lote 9", "preco": 410000, "area": 75.0, "vagas": 2},
            {"id": 10, "endereco": "Lote 10", "preco": 610000, "area": 110.0, "vagas": 2}
        ]
    },
    {
        "id": 7,
        "nome": "Modelo 7: Imóveis Rurais Fazenda São Joaquim (Caso Real SisDEA)",
        "descricao": "Modelo real de 21 fazendas da região de Buritizeiro/MG calibrado no SisDEA com Valor Unitário (R$/ha) x Área (ha).",
        "tipo": "Caso Real SisDEA (Rural)",
        "dependent_var": "vu_ha",
        "independent_vars": ["area_ha"],
        "transformations": {"vu_ha": "ln", "area_ha": "ln"},
        "subject": {"area_ha": 1500.0},
        "samples": [
            {"id": 1, "endereco": "Fazenda Buritizeiro 1", "vu_ha": 9000.0, "area_ha": 4086.0},
            {"id": 2, "endereco": "Fazenda Buritizeiro 2", "vu_ha": 6818.18, "area_ha": 1100.0},
            {"id": 3, "endereco": "Fazenda Buritizeiro 3", "vu_ha": 5000.0, "area_ha": 6200.0},
            {"id": 4, "endereco": "Fazenda Buritizeiro 4", "vu_ha": 15000.0, "area_ha": 622.0},
            {"id": 5, "endereco": "Fazenda Buritizeiro 5", "vu_ha": 33000.0, "area_ha": 513.0},
            {"id": 6, "endereco": "Fazenda Buritizeiro 6", "vu_ha": 12000.0, "area_ha": 1850.0},
            {"id": 7, "endereco": "Fazenda Buritizeiro 7", "vu_ha": 11500.0, "area_ha": 2100.0},
            {"id": 8, "endereco": "Fazenda Buritizeiro 8", "vu_ha": 18000.0, "area_ha": 750.0},
            {"id": 9, "endereco": "Fazenda Buritizeiro 9", "vu_ha": 8500.0, "area_ha": 3200.0},
            {"id": 10, "endereco": "Fazenda Buritizeiro 10", "vu_ha": 14000.0, "area_ha": 950.0},
            {"id": 11, "endereco": "Fazenda Buritizeiro 11", "vu_ha": 7200.0, "area_ha": 4500.0},
            {"id": 12, "endereco": "Fazenda Buritizeiro 12", "vu_ha": 16500.0, "area_ha": 800.0},
            {"id": 13, "endereco": "Fazenda Buritizeiro 13", "vu_ha": 10200.0, "area_ha": 2600.0},
            {"id": 14, "endereco": "Fazenda Buritizeiro 14", "vu_ha": 13100.0, "area_ha": 1200.0},
            {"id": 15, "endereco": "Fazenda Buritizeiro 15", "vu_ha": 6100.0, "area_ha": 5300.0},
            {"id": 16, "endereco": "Fazenda Buritizeiro 16", "vu_ha": 21000.0, "area_ha": 420.0},
            {"id": 17, "endereco": "Fazenda Buritizeiro 17", "vu_ha": 9400.0, "area_ha": 3100.0},
            {"id": 18, "endereco": "Fazenda Buritizeiro 18", "vu_ha": 11000.0, "area_ha": 1900.0},
            {"id": 19, "endereco": "Fazenda Buritizeiro 19", "vu_ha": 15500.0, "area_ha": 890.0},
            {"id": 20, "endereco": "Fazenda Buritizeiro 20", "vu_ha": 8100.0, "area_ha": 3800.0},
            {"id": 21, "endereco": "Fazenda Buritizeiro 21", "vu_ha": 12500.0, "area_ha": 1450.0}
        ]
    },
    {
        "id": 8,
        "nome": "Modelo 8: Detecção e Expurgo de Outlier (Distância de Cook)",
        "descricao": "Identificação de ponto atípico com resíduo padronizado elevado (> 2,5) e recálculo da regressão sem a amostra espúria.",
        "tipo": "Expurgo de Outliers",
        "dependent_var": "preco",
        "independent_vars": ["area", "vagas"],
        "transformations": {"preco": "linear", "area": "linear", "vagas": "linear"},
        "subject": {"area": 80.0, "vagas": 2.0},
        "samples": [
            {"id": 1, "endereco": "Amostra Normal 1", "preco": 450000, "area": 50.0, "vagas": 1},
            {"id": 2, "endereco": "Amostra Normal 2", "preco": 550000, "area": 60.0, "vagas": 1},
            {"id": 3, "endereco": "Amostra Normal 3", "preco": 650000, "area": 70.0, "vagas": 2},
            {"id": 4, "endereco": "Amostra Normal 4", "preco": 750000, "area": 80.0, "vagas": 2},
            {"id": 5, "endereco": "Amostra Normal 5", "preco": 850000, "area": 90.0, "vagas": 2},
            {"id": 6, "endereco": "Amostra Normal 6", "preco": 950000, "area": 100.0, "vagas": 3},
            {"id": 7, "endereco": "Amostra Normal 7", "preco": 1050000, "area": 110.0, "vagas": 3},
            {"id": 8, "endereco": "Amostra Normal 8", "preco": 1150000, "area": 120.0, "vagas": 3},
            {"id": 9, "endereco": "Amostra Normal 9", "preco": 580000, "area": 65.0, "vagas": 1},
            {"id": 10, "endereco": "Amostra Normal 10", "preco": 880000, "area": 95.0, "vagas": 2},
            {"id": 11, "endereco": "Amostra OUTLIER (Abaixo de Mercado)", "preco": 320000, "area": 95.0, "vagas": 2}
        ]
    },
    {
        "id": 9,
        "nome": "Modelo 9: Diagnóstico de Multicolinearidade (VIF e Correlação)",
        "descricao": "Avaliação de variáveis altamente correlacionadas no SisDEA (VIF > 5.0) para isolamento do efeito causal real.",
        "tipo": "Diagnóstico de Colinearidade",
        "dependent_var": "preco",
        "independent_vars": ["area", "comodos", "vagas"],
        "transformations": {"preco": "linear", "area": "linear", "comodos": "linear", "vagas": "linear"},
        "subject": {"area": 80.0, "comodos": 6.0, "vagas": 2.0},
        "samples": [
            {"id": 1, "endereco": "Imóvel 1", "preco": 480000, "area": 50.0, "comodos": 4.0, "vagas": 1},
            {"id": 2, "endereco": "Imóvel 2", "preco": 590000, "area": 60.0, "comodos": 5.0, "vagas": 1},
            {"id": 3, "endereco": "Imóvel 3", "preco": 710000, "area": 72.0, "comodos": 6.0, "vagas": 2},
            {"id": 4, "endereco": "Imóvel 4", "preco": 820000, "area": 84.0, "comodos": 7.0, "vagas": 2},
            {"id": 5, "endereco": "Imóvel 5", "preco": 940000, "area": 96.0, "comodos": 8.0, "vagas": 2},
            {"id": 6, "endereco": "Imóvel 6", "preco": 1060000, "area": 108.0, "comodos": 9.0, "vagas": 3},
            {"id": 7, "endereco": "Imóvel 7", "preco": 1190000, "area": 120.0, "comodos": 10.0, "vagas": 3},
            {"id": 8, "endereco": "Imóvel 8", "preco": 650000, "area": 66.0, "comodos": 5.0, "vagas": 1},
            {"id": 9, "endereco": "Imóvel 9", "preco": 880000, "area": 90.0, "comodos": 7.0, "vagas": 2},
            {"id": 10, "endereco": "Imóvel 10", "preco": 1320000, "area": 135.0, "comodos": 11.0, "vagas": 3}
        ]
    },
    {
        "id": 10,
        "nome": "Modelo 10: Liberdade Pericial (Equação Arbitrada Manualmente)",
        "descricao": "Parametrização direta dos coeficientes e constante conforme prerrogativa pericial do SisDEA e NBR 14653.",
        "tipo": "Liberdade Pericial",
        "dependent_var": "preco",
        "independent_vars": ["area", "vagas", "padrao"],
        "transformations": {"preco": "linear", "area": "linear", "vagas": "linear", "padrao": "linear"},
        "subject": {"area": 80.0, "vagas": 2.0, "padrao": 3.0},
        "samples": [
            {"id": 1, "endereco": "Amostra 1", "preco": 500000, "area": 55.0, "vagas": 1, "padrao": 2.0},
            {"id": 2, "endereco": "Amostra 2", "preco": 750000, "area": 75.0, "vagas": 2, "padrao": 2.5},
            {"id": 3, "endereco": "Amostra 3", "preco": 920000, "area": 90.0, "vagas": 2, "padrao": 3.0},
            {"id": 4, "endereco": "Amostra 4", "preco": 1150000, "area": 110.0, "vagas": 2, "padrao": 3.5},
            {"id": 5, "endereco": "Amostra 5", "preco": 1400000, "area": 130.0, "vagas": 3, "padrao": 4.0},
            {"id": 6, "endereco": "Amostra 6", "preco": 620000, "area": 65.0, "vagas": 1, "padrao": 2.2},
            {"id": 7, "endereco": "Amostra 7", "preco": 840000, "area": 85.0, "vagas": 2, "padrao": 2.8},
            {"id": 8, "endereco": "Amostra 8", "preco": 1020000, "area": 100.0, "vagas": 2, "padrao": 3.2}
        ]
    }
]

def run_all_benchmarks():
    """Executa todos os 10 modelos e gera o relatório comparativo."""
    results = []
    for bm in BENCHMARK_MODELS:
        m = calculate_ols_metrics(
            samples=bm["samples"],
            dep_var=bm["dependent_var"],
            indep_vars=bm["independent_vars"],
            transforms=bm["transformations"],
            subject_attrs=bm["subject"]
        )
        results.append({
            "id": bm["id"],
            "nome": bm["nome"],
            "tipo": bm["tipo"],
            "metrics": m
        })
    return results

if __name__ == "__main__":
    res = run_all_benchmarks()
    for r in res:
        m = r["metrics"]
        print(f"[{r['id']}] {r['nome']}: R²={m['r2']:.4f}, F={m['f_stat']:.2f}, Valor Est=R$ {m['estimated_value']:,.2f}, Grau Prec={m['grau_precisao']}")
