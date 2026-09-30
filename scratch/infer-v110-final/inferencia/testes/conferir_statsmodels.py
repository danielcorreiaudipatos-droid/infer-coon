"""
conferir_statsmodels.py — refaz no Python as contas do motor JavaScript
e compara número a número. Rodar depois de: node testes/teste-motor.cjs

    python testes/conferir_statsmodels.py
"""
import json, os
import numpy as np
import statsmodels.api as sm
from statsmodels.stats.stattools import durbin_watson, jarque_bera
from statsmodels.stats.diagnostic import het_breuschpagan, lilliefors
from statsmodels.stats.outliers_influence import variance_inflation_factor, OLSInfluence
from scipy import stats

aqui = os.path.dirname(os.path.abspath(__file__))
js = json.load(open(os.path.join(aqui, "saida-motor.json"), encoding="utf-8"))
X, y = np.array(js["X"]), np.array(js["y"])
m = sm.OLS(y, X).fit()
inf = OLSInfluence(m)

falhas = 0
def confere(nome, a, b, tol=1e-6):
    global falhas
    a, b = np.atleast_1d(np.array(a, float)), np.atleast_1d(np.array(b, float))
    erro = np.max(np.abs(a - b) / np.maximum(np.abs(b), 1e-12))
    ok = erro <= tol
    falhas += 0 if ok else 1
    print(f"{'OK ' if ok else 'ERRO'}  {nome:<22} erro relativo máx = {erro:.2e}")

confere("coeficientes", js["b"], m.params)
confere("erros padrão", js["ep"], m.bse)
confere("t", js["t"], m.tvalues)
confere("Sig t", js["sig"], m.pvalues, 1e-5)
confere("R²", js["R2"], m.rsquared)
confere("R² ajustado", js["R2aj"], m.rsquared_adj)
confere("F", js["F"], m.fvalue)
confere("Sig F", js["sigF"], m.f_pvalue, 1e-4)
confere("Durbin-Watson", js["dw"], durbin_watson(m.resid))
confere("Cook", js["cook"], inf.cooks_distance[0])
confere("alavancagem h", js["h"], inf.hat_matrix_diag)
jb = jarque_bera(m.resid)
confere("Jarque-Bera", js["jb"]["estatistica"], jb[0])
confere("Jarque-Bera p", js["jb"]["p"], jb[1], 1e-5)
sw = stats.shapiro(m.resid)
confere("Shapiro-Wilk W", js["sw"]["estatistica"], sw.statistic, 1e-4)
confere("Shapiro-Wilk p", js["sw"]["p"], sw.pvalue, 2e-2)
bp = het_breuschpagan(m.resid, X)
confere("Breusch-Pagan LM", js["bp"]["estatistica"], bp[0])
confere("Breusch-Pagan p", js["bp"]["p"], bp[1], 1e-5)
ks = lilliefors(m.resid, dist="norm", pvalmethod="approx")
confere("Lilliefors D", js["ks"]["estatistica"], ks[0], 1e-6)
print(f"      Lilliefors p       JS={js['ks']['p']:.4f}  statsmodels(approx)={ks[1]:.4f}  (métodos de aproximação diferentes)")
vif = [variance_inflation_factor(X, j) for j in range(1, X.shape[1])]
confere("VIF", js["vif"], vif)
press = np.sum((m.resid / (1 - inf.hat_matrix_diag)) ** 2)
confere("PRESS", js["press"], press)

# projeção: IC 80% e intervalo de predição na escala ln, desfeitos com exp
Area, Dist, Topo, Pav = js["aval"]
x0 = np.array([[1, 1 / Area, np.log(Dist), Topo, Pav]])
pr = m.get_prediction(x0).summary_frame(alpha=0.20)
confere("projeção central", js["projecao"]["central"], np.exp(pr["mean"].iloc[0]))
confere("IC 80% mín", js["projecao"]["icMin"], np.exp(pr["mean_ci_lower"].iloc[0]))
confere("IC 80% máx", js["projecao"]["icMax"], np.exp(pr["mean_ci_upper"].iloc[0]))
confere("IP 80% mín", js["projecao"]["ipMin"], np.exp(pr["obs_ci_lower"].iloc[0]))
confere("IP 80% máx", js["projecao"]["ipMax"], np.exp(pr["obs_ci_upper"].iloc[0]))

print("\nRESULTADO:", "tudo confere" if falhas == 0 else f"{falhas} divergência(s)")
