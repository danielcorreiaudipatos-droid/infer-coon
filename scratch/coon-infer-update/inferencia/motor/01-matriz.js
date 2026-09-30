/* =============================================================================
   01-matriz.js — Álgebra linear básica
   -----------------------------------------------------------------------------
   A regressão por mínimos quadrados é, no fundo, só isto:
         b = (XᵀX)⁻¹ Xᵀy
   Então precisamos de: transpor, multiplicar e inverter matrizes.

   Matriz aqui é um array de linhas: A[i][j] = linha i, coluna j.
   Nada de biblioteca externa: cada conta está à vista para auditoria.
   ============================================================================= */

(function (INF) {
  'use strict';

  const M = {};

  // Cria matriz l×c preenchida com um valor (0 por padrão).
  M.criar = function (l, c, valor) {
    const v = valor === undefined ? 0 : valor;
    const A = new Array(l);
    for (let i = 0; i < l; i++) A[i] = new Array(c).fill(v);
    return A;
  };

  // Matriz identidade n×n (1 na diagonal, 0 fora).
  M.identidade = function (n) {
    const I = M.criar(n, n, 0);
    for (let i = 0; i < n; i++) I[i][i] = 1;
    return I;
  };

  // Transposta: troca linhas por colunas.
  M.transpor = function (A) {
    const l = A.length, c = A[0].length;
    const T = M.criar(c, l);
    for (let i = 0; i < l; i++)
      for (let j = 0; j < c; j++) T[j][i] = A[i][j];
    return T;
  };

  // Produto A·B. A é l×m, B é m×c, resultado l×c.
  M.multiplicar = function (A, B) {
    const l = A.length, m = B.length, c = B[0].length;
    const R = M.criar(l, c);
    for (let i = 0; i < l; i++) {
      const Ai = A[i], Ri = R[i];
      for (let k = 0; k < m; k++) {
        const a = Ai[k];
        if (a === 0) continue;       // pequena economia em matrizes esparsas
        const Bk = B[k];
        for (let j = 0; j < c; j++) Ri[j] += a * Bk[j];
      }
    }
    return R;
  };

  // Produto matriz × vetor: A (l×m) · v (m) = vetor de tamanho l.
  M.multVetor = function (A, v) {
    const r = new Array(A.length).fill(0);
    for (let i = 0; i < A.length; i++) {
      let s = 0;
      for (let j = 0; j < v.length; j++) s += A[i][j] * v[j];
      r[i] = s;
    }
    return r;
  };

  // Produto escalar de dois vetores.
  M.escalar = function (u, v) {
    let s = 0;
    for (let i = 0; i < u.length; i++) s += u[i] * v[i];
    return s;
  };

  // XᵀX calculado direto, sem montar a transposta (é a conta mais repetida
  // na busca de modelos, então vale economizar memória).
  M.XtX = function (X) {
    const n = X.length, p = X[0].length;
    const R = M.criar(p, p);
    for (let i = 0; i < n; i++) {
      const xi = X[i];
      for (let a = 0; a < p; a++) {
        const v = xi[a];
        for (let b = a; b < p; b++) R[a][b] += v * xi[b];
      }
    }
    // a matriz é simétrica: copia o triângulo de cima para o de baixo
    for (let a = 0; a < p; a++)
      for (let b = 0; b < a; b++) R[a][b] = R[b][a];
    return R;
  };

  // Xᵀy, também direto.
  M.Xty = function (X, y) {
    const p = X[0].length;
    const r = new Array(p).fill(0);
    for (let i = 0; i < X.length; i++)
      for (let j = 0; j < p; j++) r[j] += X[i][j] * y[i];
    return r;
  };

  // ---------------------------------------------------------------------------
  // Inversa por Gauss-Jordan com pivoteamento parcial.
  // ---------------------------------------------------------------------------
  // Monta [A | I] e escalona até virar [I | A⁻¹].
  // Pivoteamento parcial = em cada coluna, usa a linha com o maior valor
  // absoluto como pivô; isso evita dividir por número quase zero.
  // Devolve null quando a matriz é singular — na prática, quando há duas
  // variáveis que são combinação uma da outra (colinearidade perfeita) ou uma
  // variável com o mesmo valor em todas as amostras (o famoso "cálculo trava
  // sem resultado").
  M.inverter = function (A) {
    const n = A.length;
    // cópia aumentada [A | I]
    const W = new Array(n);
    let escala = 0;
    for (let i = 0; i < n; i++) {
      W[i] = A[i].slice().concat(new Array(n).fill(0));
      W[i][n + i] = 1;
      for (let j = 0; j < n; j++) escala = Math.max(escala, Math.abs(A[i][j]));
    }
    const tolerancia = 1e-12 * (escala || 1);

    for (let col = 0; col < n; col++) {
      // 1) procura o melhor pivô da coluna, da diagonal para baixo
      let linhaPivo = col, maior = Math.abs(W[col][col]);
      for (let i = col + 1; i < n; i++) {
        const v = Math.abs(W[i][col]);
        if (v > maior) { maior = v; linhaPivo = i; }
      }
      if (maior < tolerancia) return null;           // singular
      // 2) troca a linha do pivô para a posição da diagonal
      if (linhaPivo !== col) { const t = W[col]; W[col] = W[linhaPivo]; W[linhaPivo] = t; }
      // 3) divide a linha do pivô pelo pivô (pivô vira 1)
      const piv = W[col][col];
      const Lp = W[col];
      for (let j = 0; j < 2 * n; j++) Lp[j] /= piv;
      // 4) zera a coluna em todas as outras linhas
      for (let i = 0; i < n; i++) {
        if (i === col) continue;
        const f = W[i][col];
        if (f === 0) continue;
        const Li = W[i];
        for (let j = 0; j < 2 * n; j++) Li[j] -= f * Lp[j];
      }
    }
    // a metade direita agora é a inversa
    return W.map(function (linha) { return linha.slice(n); });
  };

  INF.Matriz = M;
})(globalThis.INF = globalThis.INF || {});
