/* =============================================================================
   02-distribuicoes.js — Distribuições de probabilidade
   -----------------------------------------------------------------------------
   Para dizer se uma variável é "significante" precisamos transformar o t
   calculado numa probabilidade (a Sig %). Idem para o F do modelo. Isso
   exige as funções acumuladas das distribuições t de Student, F de Snedecor,
   Normal e Qui-quadrado.

   Todas saem de duas funções especiais clássicas:
     - Beta incompleta regularizada  I_x(a,b)   → t e F
     - Gama incompleta regularizada  P(a,x)     → Qui-quadrado
   Implementadas por frações continuadas / séries (algoritmos do livro
   Numerical Recipes, cap. 6), com precisão de ~1e-10, bem acima do que um
   laudo precisa. A Sig é calculada pela área sob a curva, sem tabela
   pela área sob a curva em vez de tabela — é o que fazemos aqui.
   ============================================================================= */

(function (INF) {
  'use strict';

  const D = {};

  // ---------------------------------------------------------------------------
  // ln Γ(x) — logaritmo da função gama (aproximação de Lanczos, g=7, n=9).
  // ---------------------------------------------------------------------------
  const LANCZOS = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028,
    771.32342877765313, -176.61502916214059, 12.507343278686905,
    -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
  ];
  D.lnGama = function (x) {
    if (x < 0.5) {
      // fórmula de reflexão para x pequeno
      return Math.log(Math.PI / Math.sin(Math.PI * x)) - D.lnGama(1 - x);
    }
    x -= 1;
    let a = LANCZOS[0];
    const t = x + 7.5;
    for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  };

  // ---------------------------------------------------------------------------
  // Fração continuada da beta incompleta (método de Lentz modificado).
  // ---------------------------------------------------------------------------
  function betaFracao(x, a, b) {
    const MAXIT = 300, EPS = 1e-14, MIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap;
    if (Math.abs(d) < MIN) d = MIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      // termo par
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
      c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
      d = 1 / d; h *= d * c;
      // termo ímpar
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < MIN) d = MIN;
      c = 1 + aa / c; if (Math.abs(c) < MIN) c = MIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }

  // I_x(a,b): beta incompleta regularizada, 0 ≤ x ≤ 1.
  D.betaInc = function (x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    const lnFrente = D.lnGama(a + b) - D.lnGama(a) - D.lnGama(b)
      + a * Math.log(x) + b * Math.log(1 - x);
    const frente = Math.exp(lnFrente);
    // usa a simetria I_x(a,b) = 1 - I_{1-x}(b,a) para convergir mais rápido
    if (x < (a + 1) / (a + b + 2)) return frente * betaFracao(x, a, b) / a;
    return 1 - frente * betaFracao(1 - x, b, a) / b;
  };

  // ---------------------------------------------------------------------------
  // P(a,x): gama incompleta regularizada (para o Qui-quadrado).
  // ---------------------------------------------------------------------------
  D.gamaInc = function (a, x) {
    if (x <= 0) return 0;
    const lnG = D.lnGama(a);
    if (x < a + 1) {
      // série
      let soma = 1 / a, termo = soma, ap = a;
      for (let n = 0; n < 500; n++) {
        ap += 1; termo *= x / ap; soma += termo;
        if (Math.abs(termo) < Math.abs(soma) * 1e-15) break;
      }
      return soma * Math.exp(-x + a * Math.log(x) - lnG);
    }
    // fração continuada para Q = 1 - P
    const MIN = 1e-300;
    let b = x + 1 - a, c = 1 / MIN, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b; if (Math.abs(d) < MIN) d = MIN;
      c = b + an / c; if (Math.abs(c) < MIN) c = MIN;
      d = 1 / d;
      const del = d * c; h *= del;
      if (Math.abs(del - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lnG) * h;
  };

  // ---------------------------------------------------------------------------
  // t de Student
  // ---------------------------------------------------------------------------
  // Significância bicaudal: probabilidade de |T| ≥ |t| com gl graus de
  // liberdade. É a coluna "Sig" dos resultados (em fração).
  D.sigT = function (t, gl) {
    if (!Number.isFinite(t)) return 0;
    return D.betaInc(gl / (gl + t * t), gl / 2, 0.5);
  };

  // Acumulada P(T ≤ t).
  D.tCDF = function (t, gl) {
    const cauda = 0.5 * D.sigT(t, gl);
    return t >= 0 ? 1 - cauda : cauda;
  };

  // Inversa: valor t tal que P(T ≤ t) = p. Busca por bisseção — simples,
  // robusta e mais que rápida para o uso (IC de 80% pede p = 0,90).
  D.tInv = function (p, gl) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    let lo = -1000, hi = 1000;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (D.tCDF(mid, gl) < p) lo = mid; else hi = mid;
      if (hi - lo < 1e-12) break;
    }
    return (lo + hi) / 2;
  };

  // ---------------------------------------------------------------------------
  // F de Snedecor
  // ---------------------------------------------------------------------------
  // Significância do modelo: P(F ≥ f) com gl1 (regressão) e gl2 (resíduos).
  D.sigF = function (f, gl1, gl2) {
    if (!Number.isFinite(f)) return 0;
    if (f <= 0) return 1;
    return D.betaInc(gl2 / (gl2 + gl1 * f), gl2 / 2, gl1 / 2);
  };

  // ---------------------------------------------------------------------------
  // Qui-quadrado: P(X ≥ x) com gl graus de liberdade.
  // Usado no Jarque-Bera (normalidade) e no Breusch-Pagan (homocedasticidade).
  // ---------------------------------------------------------------------------
  D.sigQui2 = function (x, gl) {
    if (x <= 0) return 1;
    return 1 - D.gamaInc(gl / 2, x / 2);
  };

  // ---------------------------------------------------------------------------
  // Normal padrão
  // ---------------------------------------------------------------------------
  // Φ(z) via função erro complementar (Chebyshev, erro < 1,2e-7).
  D.normalCDF = function (z) {
    const x = Math.abs(z) / Math.SQRT2;
    const t = 1 / (1 + 0.5 * x);
    const erfc = t * Math.exp(-x * x - 1.26551223 + t * (1.00002368 + t * (0.37409196
      + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398
      + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    const p = 0.5 * erfc;           // P(Z > |z|)
    return z >= 0 ? 1 - p : p;
  };

  // Φ⁻¹(p): inversa da normal (algoritmo de Acklam, erro relativo ~1e-9).
  // Usada no gráfico Q-Q e no teste de Shapiro-Wilk.
  D.normalInv = function (p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;
    const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
      1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
      6.680131188771972e+01, -1.328068155288572e+01];
    const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
      -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
      3.754408661907416e+00];
    const pb = 0.02425;
    let q, r;
    if (p < pb) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
    }
    if (p <= 1 - pb) {
      q = p - 0.5; r = q * q;
      return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
        (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
    }
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  };

  INF.Dist = D;
})(globalThis.INF = globalThis.INF || {});
