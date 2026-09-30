/* =============================================================================
   05-diagnosticos.js — Verificação dos pressupostos do modelo
   -----------------------------------------------------------------------------
   A NBR 14.653-2 (Anexo A) exige verificar se o modelo respeita os
   pressupostos da regressão. Este módulo faz todos eles de uma vez:

     Normalidade dos resíduos
       · proporções em ±1σ, ±1,64σ e ±1,96σ (quadro de aderência)
       · Kolmogorov-Smirnov com correção de Lilliefors
       · Shapiro-Wilk (mais poderoso para amostras pequenas)   ← novidade
       · Jarque-Bera                                          ← novidade
     Homocedasticidade
       · Breusch-Pagan (versão de Koenker)                     ← novidade
     Autocorrelação
       · Durbin-Watson
     Colinearidade
       · matriz de correlação, correlações parciais e VIF      ← VIF é novidade
     Pontos atípicos e influentes
       · resíduo padronizado (|r| > 2 = outlier)
       · resíduo studentizado e distância de Cook
     Capacidade de previsão
       · PRESS e R² de previsão (validação cruzada "deixa-um-fora")  ← novidade
       · AIC e BIC para comparar modelos                             ← novidade
   ============================================================================= */

(function (INF) {
  'use strict';

  const M = INF.Matriz, D = INF.Dist, U = INF.U;
  const G = {};

  // ---------------------------------------------------------------------------
  // Resíduos padronizados, studentizados e distância de Cook
  // ---------------------------------------------------------------------------
  G.residuos = function (mod) {
    const n = mod.n, p = mod.p, s = mod.s;
    const lista = [];
    for (let i = 0; i < n; i++) {
      const h = mod.h[i];
      const pad = mod.e[i] / s;                                // e / s
      const stud = mod.e[i] / (s * Math.sqrt(Math.max(1 - h, 1e-12)));
      const cook = (stud * stud) * h / (p * Math.max(1 - h, 1e-12));
      lista.push({
        id: mod.ids[i], observado: mod.y[i], estimado: mod.yhat[i], residuo: mod.e[i],
        padronizado: pad, studentizado: stud, alavancagem: h, cook: cook,
        outlier: Math.abs(pad) > 2,
        // referência usual: Cook > 1 é influente; > 4/n merece olhar
        influente: cook > 1
      });
    }
    return lista;
  };

  // ---------------------------------------------------------------------------
  // Normalidade
  // ---------------------------------------------------------------------------
  // Quadro de proporções: quantos resíduos padronizados caem em cada faixa,
  // comparado com o esperado pela curva normal (68%, 90%, 95%).
  G.proporcoes = function (pad) {
    const n = pad.length;
    const conta = function (lim) { return pad.filter(function (r) { return Math.abs(r) <= lim; }).length / n; };
    return [
      { faixa: '−1σ a +1σ', esperado: 0.68, obtido: conta(1) },
      { faixa: '−1,64σ a +1,64σ', esperado: 0.90, obtido: conta(1.64) },
      { faixa: '−1,96σ a +1,96σ', esperado: 0.95, obtido: conta(1.96) }
    ];
  };

  // Kolmogorov-Smirnov com correção de Lilliefors (média e desvio estimados
  // dos próprios resíduos). Valor-p pela aproximação de Dallal-Wilkinson,
  // a mesma usada no pacote "nortest" do R.
  G.lilliefors = function (x) {
    const n = x.length;
    const m = U.media(x), s = U.desvio(x);
    const z = x.map(function (v) { return (v - m) / s; }).sort(function (a, b) { return a - b; });
    let Dmax = 0;
    for (let i = 0; i < n; i++) {
      const F = D.normalCDF(z[i]);
      Dmax = Math.max(Dmax, (i + 1) / n - F, F - i / n);
    }
    let Kd = Dmax, nd = n;
    if (n > 100) { Kd = Dmax * Math.pow(n / 100, 0.49); nd = 100; }
    let p = Math.exp(-7.01256 * Kd * Kd * (nd + 2.78019) + 2.99587 * Kd * Math.sqrt(nd + 2.78019)
      - 0.122119 + 0.974598 / Math.sqrt(nd) + 1.67997 / nd);
    if (p > 0.1) {
      const KK = (Math.sqrt(n) - 0.01 + 0.85 / Math.sqrt(n)) * Dmax;
      if (KK <= 0.302) p = 1;
      else if (KK <= 0.5) p = 2.76773 - 19.828315 * KK + 80.709644 * KK * KK - 138.55152 * KK ** 3 + 81.218052 * KK ** 4;
      else if (KK <= 0.9) p = -4.901232 + 40.662806 * KK - 97.490286 * KK * KK + 94.029866 * KK ** 3 - 32.355711 * KK ** 4;
      else if (KK <= 1.31) p = 6.198765 - 19.558097 * KK + 23.186922 * KK * KK - 12.234627 * KK ** 3 + 2.423045 * KK ** 4;
      else p = 0;
    }
    return { estatistica: Dmax, p: Math.min(Math.max(p, 0), 1) };
  };

  // Shapiro-Wilk pelo algoritmo de Royston (1995), válido de n = 4 a 5000.
  G.shapiroWilk = function (x) {
    const n = x.length;
    if (n < 4) return { estatistica: NaN, p: NaN };
    const xs = x.slice().sort(function (a, b) { return a - b; });
    // pontuações normais esperadas m_i
    const m = new Array(n);
    let mm = 0;
    for (let i = 0; i < n; i++) {
      m[i] = D.normalInv((i + 1 - 0.375) / (n + 0.25));
      mm += m[i] * m[i];
    }
    const u = 1 / Math.sqrt(n);
    // coeficientes a_i (polinômios de Royston para as duas pontas)
    const a = new Array(n);
    const an = m[n - 1] / Math.sqrt(mm) + 0.221157 * u - 0.147981 * u ** 2
      - 2.071190 * u ** 3 + 4.434685 * u ** 4 - 2.706056 * u ** 5;
    let phi;
    if (n > 5) {
      const an1 = m[n - 2] / Math.sqrt(mm) + 0.042981 * u - 0.293762 * u ** 2
        - 1.752461 * u ** 3 + 5.682633 * u ** 4 - 3.582633 * u ** 5;
      phi = (mm - 2 * m[n - 1] ** 2 - 2 * m[n - 2] ** 2) / (1 - 2 * an ** 2 - 2 * an1 ** 2);
      for (let i = 2; i < n - 2; i++) a[i] = m[i] / Math.sqrt(phi);
      a[n - 1] = an; a[0] = -an; a[n - 2] = an1; a[1] = -an1;
    } else {
      phi = (mm - 2 * m[n - 1] ** 2) / (1 - 2 * an ** 2);
      for (let i = 1; i < n - 1; i++) a[i] = m[i] / Math.sqrt(phi);
      a[n - 1] = an; a[0] = -an;
    }
    // estatística W
    const media = U.media(xs);
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { num += a[i] * xs[i]; den += (xs[i] - media) ** 2; }
    const W = Math.min(num * num / den, 1);
    // valor-p (transformação normalizadora de Royston)
    let z;
    if (n <= 11) {
      const gama = -2.273 + 0.459 * n;
      const mu = 0.5440 - 0.39978 * n + 0.025054 * n * n - 0.0006714 * n ** 3;
      const sigma = Math.exp(1.3822 - 0.77857 * n + 0.062767 * n * n - 0.0020322 * n ** 3);
      const w1 = gama - Math.log(1 - W);
      z = w1 > 0 ? (-Math.log(w1) - mu) / sigma : Infinity;
    } else {
      const L = Math.log(n);
      const mu = -1.5861 - 0.31082 * L - 0.083751 * L * L + 0.0038915 * L ** 3;
      const sigma = Math.exp(-0.4803 - 0.082676 * L + 0.0030302 * L * L);
      z = (Math.log(1 - W) - mu) / sigma;
    }
    return { estatistica: W, p: 1 - D.normalCDF(z) };
  };

  // Jarque-Bera: usa assimetria e curtose. Qui-quadrado com 2 gl.
  G.jarqueBera = function (x) {
    const n = x.length, m = U.media(x);
    let m2 = 0, m3 = 0, m4 = 0;
    x.forEach(function (v) { const d = v - m; m2 += d * d; m3 += d ** 3; m4 += d ** 4; });
    m2 /= n; m3 /= n; m4 /= n;
    const assimetria = m3 / Math.pow(m2, 1.5);
    const curtose = m4 / (m2 * m2);
    const JB = n / 6 * (assimetria ** 2 + (curtose - 3) ** 2 / 4);
    return { estatistica: JB, p: D.sigQui2(JB, 2), assimetria: assimetria, curtose: curtose };
  };

  // ---------------------------------------------------------------------------
  // Homocedasticidade — Breusch-Pagan (Koenker): regride e² contra os
  // mesmos X; LM = n·R² ~ Qui-quadrado com k gl. p pequeno = variância não
  // constante (a "nuvem em funil" do gráfico de resíduos).
  // ---------------------------------------------------------------------------
  G.breuschPagan = function (mod) {
    if (mod.p < 2) return { estatistica: NaN, p: NaN };
    const e2 = mod.e.map(function (v) { return v * v; });
    const aux = INF.Regressao.ajustar(mod.X, e2, true);
    if (aux.erro) return { estatistica: NaN, p: NaN };
    const LM = mod.n * aux.R2;
    return { estatistica: LM, p: D.sigQui2(LM, mod.p - 1) };
  };

  // ---------------------------------------------------------------------------
  // Autocorrelação — Durbin-Watson. Perto de 2 = sem autocorrelação.
  // Só faz sentido se as amostras tiverem uma ordem natural (tempo, espaço).
  // ---------------------------------------------------------------------------
  G.durbinWatson = function (e) {
    let num = 0, den = 0;
    for (let i = 0; i < e.length; i++) {
      den += e[i] * e[i];
      if (i > 0) num += (e[i] - e[i - 1]) ** 2;
    }
    return num / den;
  };

  // ---------------------------------------------------------------------------
  // Correlações entre as colunas transformadas (inclui a dependente no fim)
  // ---------------------------------------------------------------------------
  G.correlacoes = function (mod) {
    const nomes = mod.indep.map(function (v) { return v.nome; }).concat([mod.dep.nome]);
    const cols = [];
    for (let j = 1; j < mod.p; j++) cols.push(mod.X.map(function (l) { return l[j]; }));
    cols.push(mod.y.slice());
    const q = cols.length, n = mod.n;
    // padroniza cada coluna e faz o produto
    const z = cols.map(function (c) {
      const m = U.media(c), s = U.desvio(c);
      return c.map(function (v) { return (v - m) / s; });
    });
    const Rm = M.criar(q, q);
    for (let a = 0; a < q; a++)
      for (let b = 0; b < q; b++) Rm[a][b] = M.escalar(z[a], z[b]) / (n - 1);

    // correlação parcial ("com influência"):
    // relação entre duas variáveis descontado o efeito de todas as outras.
    let parcial = null;
    const P = M.inverter(Rm);
    if (P) {
      parcial = M.criar(q, q);
      for (let a = 0; a < q; a++)
        for (let b = 0; b < q; b++)
          parcial[a][b] = a === b ? 1 : -P[a][b] / Math.sqrt(P[a][a] * P[b][b]);
    }
    return { nomes: nomes, isoladas: Rm, parciais: parcial };
  };

  // VIF: quanto a variância de cada coeficiente é inflada pela colinearidade.
  // Referência usual: VIF > 5 atenção, VIF > 10 problema sério.
  G.vif = function (mod) {
    const k = mod.p - 1;
    const res = [];
    for (let j = 1; j <= k; j++) {
      if (k === 1) { res.push({ nome: mod.indep[0].nome, vif: 1 }); break; }
      const yj = mod.X.map(function (l) { return l[j]; });
      const Xj = mod.X.map(function (l) { return l.filter(function (_, c) { return c !== j; }); });
      const aj = INF.Regressao.ajustar(Xj, yj, true);
      res.push({ nome: mod.indep[j - 1].nome, vif: aj.erro ? Infinity : 1 / Math.max(1 - aj.R2, 1e-12) });
    }
    return res;
  };

  // ---------------------------------------------------------------------------
  // Capacidade de previsão e critérios de informação
  // ---------------------------------------------------------------------------
  G.previsao = function (mod) {
    let PRESS = 0;
    for (let i = 0; i < mod.n; i++) {
      const eLoo = mod.e[i] / Math.max(1 - mod.h[i], 1e-12);   // erro "deixando i de fora"
      PRESS += eLoo * eLoo;
    }
    const n = mod.n, p = mod.p;
    const lnSQ = Math.log(mod.SQRes / n);
    return {
      PRESS: PRESS,
      R2previsao: 1 - PRESS / mod.SQTot,
      AIC: n * lnSQ + 2 * p,
      BIC: n * lnSQ + p * Math.log(n)
    };
  };

  // ---------------------------------------------------------------------------
  // Estatística descritiva de um conjunto de valores (ignora vazios)
  // ---------------------------------------------------------------------------
  // Mediana e quartis pelo método usual das planilhas (interpolação linear).
  // CV = desvio / média: acima de ~30% indica amostra heterogênea.
  G.descritiva = function (valores) {
    const v = valores.filter(Number.isFinite).sort(function (a, b) { return a - b; });
    const n = v.length;
    if (!n) return { n: 0 };
    const q = function (f) { const i = f * (n - 1), b = Math.floor(i); return v[b] + ((v[Math.min(b + 1, n - 1)] - v[b]) * (i - b)); };
    const media = U.media(v);
    const desvio = n > 1 ? U.desvio(v) : 0;
    let m3 = 0; v.forEach(function (x) { m3 += Math.pow(x - media, 3); });
    return {
      n: n, media: media, mediana: q(0.5), desvio: desvio, cv: media !== 0 ? desvio / Math.abs(media) : NaN,
      min: v[0], max: v[n - 1], amplitude: v[n - 1] - v[0], q1: q(0.25), q3: q(0.75),
      assimetria: n > 2 && desvio > 0 ? (m3 / n) / Math.pow(desvio * Math.sqrt((n - 1) / n), 3) : NaN
    };
  };

  // Descritiva de todas as variáveis numéricas das amostras habilitadas.
  // A dependente aparece duas vezes: como lançada e já com fator de oferta.
  G.descritivaProjeto = function (proj) {
    const R = INF.Regressao;
    const ativas = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    const linhas = [];
    const dep = R.dependente(proj);
    if (dep) {
      linhas.push(Object.assign({ nome: dep.nome + ' (lançado)', unidade: dep.unidade }, G.descritiva(ativas.map(function (a) { return U.lerNumero(a.valores[dep.nome]); }))));
      linhas.push(Object.assign({ nome: dep.nome + ' (com fator)', unidade: dep.unidade }, G.descritiva(ativas.map(function (a) { return R.valorDependente(proj, a, dep.nome); }))));
    }
    proj.variaveis.forEach(function (v) {
      if (v.tipo === 'dependente') return;
      const d = G.descritiva(ativas.map(function (a) { return U.lerNumero(a.valores[v.nome]); }));
      if (d.n) linhas.push(Object.assign({ nome: v.nome, unidade: v.unidade }, d));
    });
    return { total: proj.amostras.length, ativas: ativas.length, linhas: linhas };
  };

  // ---------------------------------------------------------------------------
  // Pacote completo
  // ---------------------------------------------------------------------------
  G.tudo = function (mod) {
    const res = G.residuos(mod);
    const pad = res.map(function (r) { return r.padronizado; });
    return {
      residuos: res,
      outliers: res.filter(function (r) { return r.outlier; }).map(function (r) { return r.id; }),
      influentes: res.filter(function (r) { return r.influente; }).map(function (r) { return r.id; }),
      proporcoes: G.proporcoes(pad),
      ks: G.lilliefors(mod.e),
      sw: G.shapiroWilk(mod.e),
      jb: G.jarqueBera(mod.e),
      bp: G.breuschPagan(mod),
      dw: G.durbinWatson(mod.e),
      correl: G.correlacoes(mod),
      vif: G.vif(mod),
      prev: G.previsao(mod)
    };
  };

  INF.Diag = G;
})(globalThis.INF = globalThis.INF || {});
