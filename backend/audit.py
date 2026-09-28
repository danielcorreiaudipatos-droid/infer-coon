"""
Módulo de Auditoria Pericial e IA da Plataforma Infer.coon.
Em conformidade com a ABNT NBR 14653-2 (Avaliação de Imóveis Urbanos).
Audita:
1. Coerência dos Sinais Econômicos dos regressores.
2. Multicolinearidade (VIF - Variance Inflation Factor).
3. Normalidade dos Resíduos (Teste de Shapiro-Wilk).
4. Independência dos Resíduos (Durbin-Watson).
5. Pontos Influentes e Atípicos (Resíduos Padronizados/Studentizados e Distância de Cook).
6. Gera diagnóstico e recomendações periciais fundamentadas.
"""

from typing import Dict, List, Any, Optional
import numpy as np

# Dicionário de expectativa econômica dos sinais dos coeficientes
# Sinal esperado: +1 para positivo, -1 para negativo, 0 para indefinido
ECONOMIC_SIGNS_EXPECTED = {
    # Variáveis com relação direta (quanto maior, maior o valor esperado)
    "area": 1,
    "area_privativa": 1,
    "area_util": 1,
    "area_terreno": 1,
    "area_total": 1,
    "vagas": 1,
    "vaga": 1,
    "garagem": 1,
    "quartos": 1,
    "dormitorios": 1,
    "suites": 1,
    "banheiros": 1,
    "padrao": 1,
    "padrao_acabamento": 1,
    "conservacao": 1,
    "andar": 1,
    "elevador": 1,
    "frente": 1,
    
    # Variáveis com relação inversa (quanto maior, menor o valor esperado)
    "idade": -1,
    "idade_aparente": -1,
    "ano_construcao": 1, # Se for ano (ex: 2020), mais novo = maior valor
    "distancia": -1,
    "dist_metro": -1,
    "dist_centro": -1,
    "distancia_polo": -1,
    "depreciacao": -1,
    "tempo_construcao": -1
}

def guess_expected_sign(var_name: str) -> int:
    clean_name = var_name.lower().replace("ln_", "").replace("log_", "").strip()
    for key, sign in ECONOMIC_SIGNS_EXPECTED.items():
        if key in clean_name:
            return sign
    return 0  # Neutro/não especificado a priori

def audit_economic_signs(coefficients: Dict[str, float], p_values: Dict[str, float]) -> List[Dict[str, Any]]:
    """
    Audita se os sinais dos coeficientes calculados fazem sentido econômico
    de acordo com a teoria da avaliação imobiliária e NBR 14653.
    """
    audits = []
    for var, coef in coefficients.items():
        if var.lower() in ["const", "intercept", "intercepto"]:
            continue
            
        expected = guess_expected_sign(var)
        pval = p_values.get(var, 0.0)
        
        status = "ok"
        message = ""
        recommendation = ""
        
        if expected == 1 and coef < 0:
            status = "critical" if pval < 0.10 else "warning"
            message = f"Inconsistência de sinal econômico: '{var}' apresentou coeficiente negativo ({coef:.4f}), contrariando a lógica de mercado (relação direta esperada)."
            recommendation = (
                f"Verifique se '{var}' não está colinear com outra variável no modelo, "
                f"ou se há dados digitados incorretamente na amostra. Se o p-valor ({pval:.4f}) for alto, "
                f"considere remover a variável ou aplicar transformação logarítmica."
            )
        elif expected == -1 and coef > 0:
            status = "critical" if pval < 0.10 else "warning"
            message = f"Inconsistência de sinal econômico: '{var}' apresentou coeficiente positivo ({coef:.4f}), quando o mercado penaliza esta característica (relação inversa esperada)."
            recommendation = (
                f"Para '{var}', valores maiores deveriam reduzir o preço. Verifique se o fator de depreciação "
                f"não está mascarado por padrão construtivo ou localização privilegiada."
            )
        else:
            status = "ok"
            message = f"Sinal do coeficiente de '{var}' ({coef:.4f}) condiz com o comportamento de mercado esperado."
            recommendation = "Nenhuma intervenção necessária no sinal desta variável."
            
        audits.append({
            "variable": var,
            "coefficient": coef,
            "p_value": pval,
            "expected_sign": "+" if expected == 1 else ("-" if expected == -1 else "Livre"),
            "actual_sign": "+" if coef >= 0 else "-",
            "status": status,
            "message": message,
            "recommendation": recommendation
        })
    return audits

def audit_multicollinearity(vif_dict: Dict[str, float]) -> List[Dict[str, Any]]:
    """
    Audita o Fator de Inflação da Variância (VIF).
    NBR 14653 recomenda evitar modelos com multicolinearidade excessiva.
    """
    results = []
    for var, vif in vif_dict.items():
        if var.lower() in ["const", "intercept", "intercepto"]:
            continue
            
        if vif < 5.0:
            status = "ok"
            severity = "Baixo"
            message = f"VIF = {vif:.2f}: Multicolinearidade desprezível."
            recommendation = "Variável independente bem ajustada."
        elif 5.0 <= vif < 10.0:
            status = "warning"
            severity = "Moderado"
            message = f"VIF = {vif:.2f}: Multicolinearidade moderada."
            recommendation = "Observe se os coeficientes e erros-padrão não estão inflados. Considere monitorar a estabilidade do modelo."
        else:
            status = "critical"
            severity = "Grave"
            message = f"VIF = {vif:.2f}: Multicolinearidade severa detectada."
            recommendation = f"A variável '{var}' compartilha forte variância comum com outros regressores. A NBR 14653 recomenda expurgar um dos regressores correlacionados ou criar uma variável combinada."
            
        results.append({
            "variable": var,
            "vif": round(vif, 2),
            "severity": severity,
            "status": status,
            "message": message,
            "recommendation": recommendation
        })
    return results

def audit_residuals_normality(shapiro_w: float, shapiro_p: float) -> Dict[str, Any]:
    """
    Audita o teste de Shapiro-Wilk para normalidade dos resíduos.
    """
    is_normal = shapiro_p >= 0.05
    if is_normal:
        status = "ok"
        message = f"Resíduos com distribuição normal (Shapiro-Wilk W = {shapiro_w:.4f}, p = {shapiro_p:.4f} >= 0.05). Atende aos preceitos da NBR 14653-2."
        recommendation = "Pressuposto de normalidade perfeitamente atendido."
    else:
        status = "warning"
        message = f"Fuga de normalidade dos resíduos detectada (Shapiro-Wilk W = {shapiro_w:.4f}, p = {shapiro_p:.4f} < 0.05)."
        recommendation = (
            "A hipótese de normalidade foi rejeitada ao nível de 5%. A NBR 14653-2 recomenda: "
            "1) Testar transformação na variável dependente (ex: ln(Preço) ou ln(Preço Unitário)); "
            "2) Verificar presença de pontos atípicos (outliers) na amostra de mercado."
        )
    return {
        "statistic": round(shapiro_w, 4),
        "p_value": round(shapiro_p, 4),
        "is_normal": is_normal,
        "status": status,
        "message": message,
        "recommendation": recommendation
    }

def audit_durbin_watson(dw_val: float) -> Dict[str, Any]:
    """
    Audita a autocorrelação residual via estatística de Durbin-Watson.
    Valor ideal próximo a 2.0 (entre 1.5 e 2.5).
    """
    if 1.5 <= dw_val <= 2.5:
        status = "ok"
        message = f"Durbin-Watson = {dw_val:.2f}: Ausência de autocorrelação residual evidente. Resíduos independentes."
        recommendation = "Pressuposto de independência atendido."
    elif dw_val < 1.5:
        status = "warning"
        message = f"Durbin-Watson = {dw_val:.2f}: Indício de autocorrelação serial positiva nos resíduos."
        recommendation = "Pode indicar omissão de variável explicativa espacial ou ordenação dependente dos dados."
    else:
        status = "warning"
        message = f"Durbin-Watson = {dw_val:.2f}: Indício de autocorrelação serial negativa nos resíduos."
        recommendation = "Verifique alternâncias nos dados amostrais ou reordene aleatoriamente as amostras."
        
    return {
        "value": round(dw_val, 2),
        "status": status,
        "message": message,
        "recommendation": recommendation
    }

def audit_outliers_and_influence(
    std_residuals: List[float], 
    cooks_distance: List[float], 
    sample_ids: Optional[List[Any]] = None
) -> List[Dict[str, Any]]:
    """
    Detecta outliers amostrais (|resíduo padronizado| > 2 ou > 3)
    e pontos com alta alavancagem/influência (Cook's D > 4/n).
    """
    n = len(std_residuals)
    cook_threshold = 4.0 / n if n > 0 else 0.5
    outliers = []
    
    for i, (res, cook) in enumerate(zip(std_residuals, cooks_distance)):
        idx = sample_ids[i] if sample_ids and i < len(sample_ids) else i + 1
        abs_res = abs(res)
        
        is_extreme_res = abs_res > 2.0
        is_critical_res = abs_res > 3.0
        is_influential = cook > cook_threshold
        
        if is_extreme_res or is_influential:
            severity = "critical" if (is_critical_res or cook > 1.0) else "warning"
            issues = []
            if is_critical_res:
                issues.append(f"Resíduo padronizado crítico (|r| = {abs_res:.2f} > 3.0)")
            elif is_extreme_res:
                issues.append(f"Resíduo padronizado elevado (|r| = {abs_res:.2f} > 2.0)")
            if is_influential:
                issues.append(f"Distância de Cook expressiva (D = {cook:.3f} > limite {cook_threshold:.3f})")
                
            outliers.append({
                "sample_index": idx,
                "sample_order": i + 1,
                "std_residual": round(res, 3),
                "cooks_distance": round(cook, 4),
                "severity": severity,
                "issues": "; ".join(issues),
                "recommendation": (
                    f"Amostra #{idx} exerce forte influência ou discrepa do mercado. "
                    "Inspecione a contemporaneidade e idoneidade da fonte pericial. "
                    "Se confirmada inconsistência de vistoria/anúncio, justifique o expurgo conforme NBR 14653-2."
                )
            })
    return outliers

def generate_ai_pericial_summary(
    f_pvalue: float,
    r2_adj: float,
    fundamentacao_grau: str,
    precisao_grau: str,
    sign_audits: List[Dict[str, Any]],
    vif_audits: List[Dict[str, Any]],
    normality_audit: Dict[str, Any],
    dw_audit: Dict[str, Any],
    outliers: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Gera um parecer pericial executivo automatizado (Parecer da IA Infer.coon),
    apontando o grau de conformidade do modelo com a ABNT NBR 14653.
    """
    has_critical_sign = any(a["status"] == "critical" for a in sign_audits)
    has_critical_vif = any(a["status"] == "critical" for a in vif_audits)
    has_critical_outlier = any(o["severity"] == "critical" for o in outliers)
    
    score = 100
    penalties = []
    
    if fundamentacao_grau == "Grau I":
        score -= 20
        penalties.append("Fundamentação Grau I (mínimo normativo)")
    elif fundamentacao_grau == "Não Enquadrado":
        score -= 40
        penalties.append("Modelo não atende aos requisitos mínimos da NBR 14653 para Grau I")
        
    if precisao_grau == "Grau I":
        score -= 15
        penalties.append("Precisão Grau I")
    elif precisao_grau == "Não Enquadrado":
        score -= 30
        penalties.append("Amplitude do intervalo de confiança superior a 50% (Fora de Grau)")
        
    if has_critical_sign:
        score -= 25
        penalties.append("Inconsistência de sinal econômico em regressor estatisticamente significativo")
        
    if has_critical_vif:
        score -= 15
        penalties.append("Multicolinearidade severa (VIF > 10)")
        
    if not normality_audit.get("is_normal", True):
        score -= 10
        penalties.append("Resíduos sem distribuição normal ao nível de 5%")
        
    if has_critical_outlier:
        score -= 15
        penalties.append("Presença de outliers críticos (|resíduo| > 3.0)")
        
    score = max(10, score)
    
    if score >= 85:
        overall_status = "Excelente"
        badge_color = "emerald"
        conclusion = "Modelo de regressão de alto padrão técnico, plenamente fundamentado e apto para emissão de Laudo Pericial definitivo perante a NBR 14653 e instituições financeiras (bancos públicos e privados)."
    elif score >= 65:
        overall_status = "Aprovado com Ressalvas"
        badge_color = "amber"
        conclusion = "Modelo aceitável, porém com pontos de atenção periciais que demandam justificativa técnica fundamentada no corpo do laudo de avaliação."
    else:
        overall_status = "Revisão Necessária"
        badge_color = "rose"
        conclusion = "O modelo apresenta não-conformidades críticas com preceitos estatísticos ou normativos da NBR 14653. Recomenda-se ajustar variáveis ou revisar a base amostral."
        
    return {
        "conformity_score": score,
        "overall_status": overall_status,
        "badge_color": badge_color,
        "conclusion": conclusion,
        "penalties": penalties,
        "total_outliers_detected": len(outliers),
        "has_critical_alerts": has_critical_sign or has_critical_vif or has_critical_outlier
    }
