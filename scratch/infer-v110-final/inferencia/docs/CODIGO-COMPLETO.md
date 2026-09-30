# COON Infer — Código completo

Todo o código-fonte num arquivo só: 47 arquivos e 10.651 linhas.
A estrutura e as decisões estão em ESTRUTURA.md.

Para achar as integrações, busque no texto:
- `[SUPABASE]` — banco de dados (projetos, banco de mercado, auditoria)
- `[SUPADATA]` — leitura de anúncio pelo link
- `[CLAUDE]` — conferência das amostras pela IA
- `[GOOGLE MAPS]` — imagens de satélite e mapa de situação no laudo

Gerado em 30/09/2026, 09:32:13 por scripts/juntar-codigo.mjs.

## Índice

**Motor estatístico**

- [motor/00-base.js](#motor-00-base-js) — 152 linhas 
- [motor/01-matriz.js](#motor-01-matriz-js) — 153 linhas 
- [motor/02-distribuicoes.js](#motor-02-distribuicoes-js) — 209 linhas 
- [motor/03-transformacoes.js](#motor-03-transformacoes-js) — 92 linhas 
- [motor/04-regressao.js](#motor-04-regressao-js) — 279 linhas 
- [motor/05-diagnosticos.js](#motor-05-diagnosticos-js) — 314 linhas 
- [motor/06-busca-modelos.js](#motor-06-busca-modelos-js) — 294 linhas 
- [motor/07-nbr14653.js](#motor-07-nbr14653-js) — 252 linhas 
- [motor/08-projecao.js](#motor-08-projecao-js) — 114 linhas 
- [motor/09-rna.js](#motor-09-rna-js) — 249 linhas 
- [motor/10-dados.js](#motor-10-dados-js) — 314 linhas 
- [motor/11-operar-variaveis.js](#motor-11-operar-variaveis-js) — 141 linhas 
- [motor/12-pesquisa-mercado.js](#motor-12-pesquisa-mercado-js) — 112 linhas 
- [motor/13-graficos.js](#motor-13-graficos-js) — 248 linhas 
- [motor/14-relatorio.js](#motor-14-relatorio-js) — 194 linhas 
- [motor/15-conferencia.js](#motor-15-conferencia-js) — 304 linhas 
- [motor/16-avancado.js](#motor-16-avancado-js) — 474 linhas 
- [motor/17-planilha.js](#motor-17-planilha-js) — 248 linhas 
- [motor/18-laudo.js](#motor-18-laudo-js) — 961 linhas 
- [motor/19-tipos-laudo.js](#motor-19-tipos-laudo-js) — 165 linhas 
- [motor/20-inventario.js](#motor-20-inventario-js) — 325 linhas 
- [motor/21-modelos-laudo.js](#motor-21-modelos-laudo-js) — 130 linhas 
- [motor/22-estilos-laudo.js](#motor-22-estilos-laudo-js) — 59 linhas 
- [motor/23-etapas.js](#motor-23-etapas-js) — 112 linhas 

**Tela**

- [web/css/estilo.css](#web-css-estilo-css) — 195 linhas 
- [web/index.html](#web-index-html) — 66 linhas 
- [web/js/interface.js](#web-js-interface-js) — 1970 linhas 
- [web/js/nuvem.js](#web-js-nuvem-js) — 76 linhas [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]
- [web/js/teste-app.js](#web-js-teste-app-js) — 729 linhas 
- [web/landing.html](#web-landing-html) — 328 linhas 

**Servidor (nuvem)**

- [servidor/conferencia-ia.mjs](#servidor-conferencia-ia-mjs) — 119 linhas [CLAUDE]
- [servidor/duvidas-ia.mjs](#servidor-duvidas-ia-mjs) — 90 linhas [CLAUDE]
- [servidor/google-maps.mjs](#servidor-google-maps-mjs) — 49 linhas [GOOGLE MAPS]
- [servidor/inventario-ia.mjs](#servidor-inventario-ia-mjs) — 122 linhas [CLAUDE]
- [servidor/rotas-inferencia.mjs](#servidor-rotas-inferencia-mjs) — 266 linhas [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]
- [servidor/server.mjs](#servidor-server-mjs) — 69 linhas 
- [servidor/supabase.mjs](#servidor-supabase-mjs) — 136 linhas [SUPABASE]
- [servidor/supadata.mjs](#servidor-supadata-mjs) — 51 linhas [SUPADATA]

**Banco de dados [SUPABASE]**

- [supabase/migrations/001_inferencia.sql](#supabase-migrations-001-inferencia-sql) — 86 linhas [SUPABASE]

**Testes**

- [testes/conferir_statsmodels.py](#testes-conferir-statsmodels-py) — 69 linhas 
- [testes/teste-funcional.cjs](#testes-teste-funcional-cjs) — 17 linhas 
- [testes/teste-modelos.cjs](#testes-teste-modelos-cjs) — 37 linhas 
- [testes/teste-motor.cjs](#testes-teste-motor-cjs) — 156 linhas 

**Configuração**

- [.env.exemplo](#-env-exemplo) — 25 linhas [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]
- [package.json](#package-json) — 16 linhas 
- [railway.json](#railway-json) — 11 linhas 

**Scripts**

- [scripts/juntar-codigo.mjs](#scripts-juntar-codigo-mjs) — 73 linhas [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]


---

# Motor estatístico

## motor/00-base.js
<a id="motor-00-base-js"></a>

````javascript
/* =============================================================================
   00-base.js — Base comum do COON Infer
   -----------------------------------------------------------------------------
   Este é o primeiro arquivo carregado. Ele cria o "espaço de nomes" INF, onde
   todos os outros módulos se penduram (INF.Matriz, INF.Dist, INF.Regressao...).
   Assim nada fica solto no escopo global e o mesmo código roda no navegador
   (index.html) e no Node (testes/teste-motor.js) sem mudar uma linha.

   Aqui também ficam as funções miúdas usadas em todo canto: formatar número
   no padrão brasileiro, ler número digitado com vírgula, escapar texto para
   HTML e um gerador de números aleatórios com semente (para a RNA dar sempre
   o mesmo resultado com os mesmos dados — laudo precisa ser reproduzível).
   ============================================================================= */

(function (INF) {
  'use strict';

  // Versão do motor. Sai impressa no relatório para rastrear qual versão
  // do cálculo gerou cada laudo.
  INF.VERSAO = '1.1.0';

  const U = {};

  // ---------------------------------------------------------------------------
  // Leitura de números no padrão brasileiro
  // ---------------------------------------------------------------------------
  // Aceita "1.234.567,89", "1234567,89", "1234567.89", "R$ 3.440.000", "172 ha".
  // Regra usada: se houver vírgula, ela é o separador decimal e os pontos são
  // de milhar. Se não houver vírgula e houver mais de um ponto, os pontos são
  // de milhar. Se houver um ponto só, ele é decimal (formato de planilha/CSV).
  U.lerNumero = function (valor) {
    if (valor === null || valor === undefined) return NaN;
    if (typeof valor === 'number') return valor;
    let s = String(valor).trim();
    if (s === '') return NaN;
    // tira tudo que não é dígito, sinal, ponto ou vírgula (R$, espaços, "ha")
    s = s.replace(/[^\d,.\-eE+]/g, '');
    const temVirgula = s.indexOf(',') >= 0;
    const qtdPontos = (s.match(/\./g) || []).length;
    if (temVirgula) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (qtdPontos > 1) {
      s = s.replace(/\./g, '');
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  // ---------------------------------------------------------------------------
  // Escrita de números no padrão brasileiro
  // ---------------------------------------------------------------------------
  // fmt(1234.5, 2) -> "1.234,50"
  U.fmt = function (v, casas) {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    const c = casas === undefined ? 2 : casas;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  };

  // Moeda: fmtR$(1250000) -> "R$ 1.250.000,00"
  U.fmtMoeda = function (v) {
    if (!Number.isFinite(v)) return '—';
    return 'R$ ' + U.fmt(v, 2);
  };

  // Percentual a partir de fração: fmtPct(0.0312) -> "3,12%"
  U.fmtPct = function (fracao, casas) {
    if (!Number.isFinite(fracao)) return '—';
    return U.fmt(fracao * 100, casas === undefined ? 2 : casas) + '%';
  };

  // Número com casas "inteligentes": muitos dígitos para valores pequenos
  // (coeficientes como 0,000123) e poucos para valores grandes.
  U.fmtAuto = function (v) {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1000) return U.fmt(v, 2);
    if (a >= 1) return U.fmt(v, 4);
    if (a >= 0.001) return U.fmt(v, 6);
    return v.toExponential(4).replace('.', ',');
  };

  // ---------------------------------------------------------------------------
  // Proteção de texto antes de jogar no HTML (evita quebrar a tela com
  // um "<" digitado no nome do informante, por exemplo).
  // ---------------------------------------------------------------------------
  U.esc = function (texto) {
    return String(texto === undefined || texto === null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  // ---------------------------------------------------------------------------
  // Gerador pseudoaleatório com semente (mulberry32).
  // Math.random() não aceita semente; sem semente a RNA daria um valor
  // diferente a cada clique, o que é inaceitável num laudo.
  // ---------------------------------------------------------------------------
  U.rng = function (semente) {
    let a = (semente >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Média e desvio padrão amostral (n-1) de um vetor.
  U.media = function (v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i];
    return s / v.length;
  };
  U.desvio = function (v) {
    const m = U.media(v);
    let s = 0;
    for (let i = 0; i < v.length; i++) s += (v[i] - m) * (v[i] - m);
    return Math.sqrt(s / (v.length - 1));
  };

  // Data "AAAA-MM-DD" -> número de meses entre ela e a data base.
  // Usado na variável "Data do Evento" (tempo de mercado da amostra).
  U.mesesEntre = function (dataIso, dataBaseIso) {
    if (!dataIso || !dataBaseIso) return NaN;
    const a = new Date(dataIso + 'T00:00:00');
    const b = new Date(dataBaseIso + 'T00:00:00');
    if (isNaN(a) || isNaN(b)) return NaN;
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
      + (b.getDate() - a.getDate()) / 30;
  };

  // Distância em km entre dois pontos geográficos (fórmula de Haversine).
  // Serve para a variável "distância ao polo valorizante".
  U.distanciaKm = function (lat1, lon1, lat2, lon2) {
    const R = 6371.0088;               // raio médio da Terra em km
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const h = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // Cópia profunda simples (o estado do projeto é JSON puro).
  U.copiar = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  INF.U = U;
})(globalThis.INF = globalThis.INF || {});
````

## motor/01-matriz.js
<a id="motor-01-matriz-js"></a>

````javascript
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
````

## motor/02-distribuicoes.js
<a id="motor-02-distribuicoes-js"></a>

````javascript
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
````

## motor/03-transformacoes.js
<a id="motor-03-transformacoes-js"></a>

````javascript
/* =============================================================================
   03-transformacoes.js — Escalas (transformações) das variáveis
   -----------------------------------------------------------------------------
   É aqui que mora o "segredo" do R² alto: a relação entre área e valor
   unitário quase nunca é uma reta; em 1/x ou ln(x) ela vira reta.

   Cada transformação tem:
     id       → código interno (vai para o arquivo do projeto)
     rotulo   → como aparece na tela e no relatório
     f(x)     → aplica a transformação
     inv(z)   → desfaz (só é usada na variável dependente, para voltar
                de ln(VU) para VU, por exemplo)
     valida   → diz se x pode ser transformado (ln de zero não existe)
     crescente→ true se a transformação preserva a ordem (x maior → f maior).
                1/x e 1/x² invertem a ordem; isso importa para o intervalo
                de confiança da dependente (o mínimo vira máximo).

   A lista traz as escalas usuais em avaliação (x, 1/x, x², 1/x², ln x, √x, 1/√x)
   e acrescenta "fora", que significa "variável excluída do modelo". Com isso
   a busca automática testa ao mesmo tempo QUAL escala e SE a variável entra.
   ============================================================================= */

(function (INF) {
  'use strict';

  const T = {};

  T.LISTA = [
    { id: 'x',     rotulo: 'x',     f: x => x,               inv: z => z,               valida: x => Number.isFinite(x), crescente: true },
    { id: '1/x',   rotulo: '1/x',   f: x => 1 / x,           inv: z => 1 / z,           valida: x => x !== 0,           crescente: false },
    { id: 'ln',    rotulo: 'ln(x)', f: x => Math.log(x),     inv: z => Math.exp(z),     valida: x => x > 0,             crescente: true },
    { id: 'x2',    rotulo: 'x²',    f: x => x * x,           inv: z => Math.sqrt(z),    valida: x => x >= 0,            crescente: true },
    { id: '1/x2',  rotulo: '1/x²',  f: x => 1 / (x * x),     inv: z => 1 / Math.sqrt(z),valida: x => x > 0,             crescente: false },
    { id: 'raiz',  rotulo: '√x',    f: x => Math.sqrt(x),    inv: z => z * z,           valida: x => x >= 0,            crescente: true },
    { id: '1/raiz',rotulo: '1/√x',  f: x => 1 / Math.sqrt(x),inv: z => 1 / (z * z),    valida: x => x > 0,             crescente: false }
  ];

  // Pseudo-transformação que tira a variável do modelo.
  T.FORA = { id: 'fora', rotulo: '(fora)' };

  // Busca rápida por id.
  T.porId = {};
  T.LISTA.forEach(function (t) { T.porId[t.id] = t; });
  T.porId.fora = T.FORA;

  // Aplica a transformação 'id' a um valor. Devolve NaN se for inválido.
  T.aplicar = function (id, x) {
    const t = T.porId[id];
    if (!t || id === 'fora') return NaN;
    return t.valida(x) ? t.f(x) : NaN;
  };

  // Desfaz a transformação (uso na dependente).
  T.desfazer = function (id, z) {
    const t = T.porId[id];
    return t ? t.inv(z) : NaN;
  };

  // Transformações que fazem sentido para cada tipo de variável.
  // Código alocado e dicotômica NÃO se transformam (NBR 14.653-2 e prática
  // consolidada): o código 1-2-3 é uma escala ordinal, elevar ao quadrado ou
  // tirar logaritmo não tem significado. O usuário pode liberar na tela.
  T.permitidasPorTipo = function (tipo) {
    switch (tipo) {
      case 'dependente':  return ['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz'];
      case 'quantitativa':
      case 'proxy':       return ['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz'];
      case 'tempo':       return ['x'];
      case 'qualitativa': return ['x'];
      case 'dicotomica':  return ['x'];
      default:            return [];
    }
  };

  // Escreve a equação no formato do laudo, por exemplo:
  //   ln(VU) = 8,1234 + 45,67 / Area − 0,3312 · ln(Dist) + 0,1100 · Topo
  T.termo = function (id, nome) {
    switch (id) {
      case 'x':      return nome;
      case '1/x':    return '(1/' + nome + ')';
      case 'ln':     return 'ln(' + nome + ')';
      case 'x2':     return nome + '²';
      case '1/x2':   return '(1/' + nome + '²)';
      case 'raiz':   return '√' + nome;
      case '1/raiz': return '(1/√' + nome + ')';
      default:       return nome;
    }
  };

  INF.Transf = T;
})(globalThis.INF = globalThis.INF || {});
````

## motor/04-regressao.js
<a id="motor-04-regressao-js"></a>

````javascript
/* =============================================================================
   04-regressao.js — Regressão linear múltipla (Mínimos Quadrados Ordinários)
   -----------------------------------------------------------------------------
   Fluxo:
     1) montar()   → lê o projeto, aplica fator de oferta/atualização na
                     dependente, aplica as transformações escolhidas e monta
                     a matriz X (com a coluna de 1 da constante) e o vetor y.
     2) ajustar()  → resolve b = (XᵀX)⁻¹Xᵀy e calcula R², F, t, Sig etc.
     3) calcular() → junta tudo num "modelo" pronto para diagnóstico,
                     enquadramento na NBR e projeção do avaliando.

   Convenções:
     n = número de amostras habilitadas usadas
     k = número de variáveis independentes no modelo
     p = k + 1 (parâmetros, contando a constante)
     gl = n − p  (graus de liberdade dos resíduos)
   ============================================================================= */

(function (INF) {
  'use strict';

  const M = INF.Matriz, D = INF.Dist, T = INF.Transf, U = INF.U;
  const R = {};

  // ---------------------------------------------------------------------------
  // Valor da variável dependente já ajustado para a data e natureza do dado.
  // ---------------------------------------------------------------------------
  // Oferta de anúncio costuma estar acima do preço de fechamento; o fator de
  // oferta (0,90 na regra da Bio Store) traz o preço pedido para perto do
  // preço praticado. Transação efetiva não leva fator. O fator de atualização
  // (padrão 1) é para quem atualiza valores antigos por índice.
  R.valorDependente = function (proj, amostra, nomeDep) {
    const bruto = U.lerNumero(amostra.valores[nomeDep]);
    if (!Number.isFinite(bruto)) return NaN;
    let fator = 1;
    if (proj.config.aplicarFatorOferta && amostra.natureza === 'oferta') {
      fator *= Number(proj.config.fatorOferta) || 1;
    }
    const atual = U.lerNumero(amostra.fatorAtualizacao);
    if (Number.isFinite(atual) && atual > 0) fator *= atual;
    return bruto * fator;
  };

  // A variável dependente do projeto (só pode haver uma).
  R.dependente = function (proj) {
    return proj.variaveis.find(function (v) { return v.tipo === 'dependente'; }) || null;
  };

  // Variáveis que podem entrar como independentes (tudo menos identificação
  // e a própria dependente).
  R.candidatas = function (proj) {
    return proj.variaveis.filter(function (v) {
      return v.tipo !== 'dependente' && v.tipo !== 'identificacao';
    });
  };

  // ---------------------------------------------------------------------------
  // 1) Montagem de X e y
  // ---------------------------------------------------------------------------
  // transf: objeto { nomeVariavel: idTransformacao }. Se uma independente
  // estiver com 'fora' (ou sem entrada), ela não entra no modelo.
  // Devolve { erro } se alguma amostra tiver valor inválido para a escala
  // escolhida (ex.: ln de zero) — a busca de modelos usa isso para descartar
  // a combinação sem travar.
  R.montar = function (proj, transf) {
    const dep = R.dependente(proj);
    if (!dep) return { erro: 'Defina uma variável dependente (ex.: VU).' };
    const tDep = transf[dep.nome] || 'x';

    const indep = R.candidatas(proj).filter(function (v) {
      const t = transf[v.nome];
      return t && t !== 'fora';
    });

    const X = [], y = [], ids = [], yOriginal = [], xOriginal = [];
    const amostras = proj.amostras.filter(function (a) { return a.habilitada !== false; });

    for (let i = 0; i < amostras.length; i++) {
      const a = amostras[i];
      const yo = R.valorDependente(proj, a, dep.nome);
      const yt = T.aplicar(tDep, yo);
      if (!Number.isFinite(yt)) {
        return { erro: 'Amostra ' + a.id + ': valor de ' + dep.nome + ' inválido para a escala ' + T.porId[tDep].rotulo };
      }
      const linha = [1];                     // coluna da constante (intercepto)
      const linhaOriginal = [];
      for (let j = 0; j < indep.length; j++) {
        const v = indep[j];
        const xo = U.lerNumero(a.valores[v.nome]);
        const xt = T.aplicar(transf[v.nome], xo);
        if (!Number.isFinite(xt)) {
          return { erro: 'Amostra ' + a.id + ': valor de ' + v.nome + ' inválido para a escala ' + T.porId[transf[v.nome]].rotulo };
        }
        linha.push(xt);
        linhaOriginal.push(xo);
      }
      X.push(linha); y.push(yt); ids.push(a.id);
      yOriginal.push(yo); xOriginal.push(linhaOriginal);
    }

    if (!X.length) return { erro: 'Não há amostras habilitadas para o cálculo.' };

    return {
      X: X, y: y, ids: ids, yOriginal: yOriginal, xOriginal: xOriginal,
      dep: { nome: dep.nome, transf: tDep },
      indep: indep.map(function (v) { return { nome: v.nome, transf: transf[v.nome], tipo: v.tipo, direcao: v.direcao || '' }; }),
      n: X.length, p: indep.length + 1
    };
  };

  // ---------------------------------------------------------------------------
  // 2) Ajuste por mínimos quadrados
  // ---------------------------------------------------------------------------
  // leve = true pula a diagonal da matriz chapéu (h). A busca de modelos
  // chama isto dezenas de milhares de vezes e só precisa do essencial.
  R.ajustar = function (X, y, leve) {
    const n = X.length, p = X[0].length, gl = n - p;
    if (gl < 1) return { erro: 'Poucas amostras: n = ' + n + ' para ' + p + ' parâmetros.' };

    const XtX = M.XtX(X);
    const inv = M.inverter(XtX);
    if (!inv) return { erro: 'Matriz singular: há variável constante ou colinearidade perfeita.' };

    // coeficientes b = (XᵀX)⁻¹ Xᵀy
    const b = M.multVetor(inv, M.Xty(X, y));

    // valores ajustados e resíduos
    const yhat = new Array(n), e = new Array(n);
    let somaY = 0;
    for (let i = 0; i < n; i++) somaY += y[i];
    const ybar = somaY / n;
    let SQRes = 0, SQTot = 0;
    for (let i = 0; i < n; i++) {
      yhat[i] = M.escalar(X[i], b);
      e[i] = y[i] - yhat[i];
      SQRes += e[i] * e[i];
      SQTot += (y[i] - ybar) * (y[i] - ybar);
    }
    const SQReg = SQTot - SQRes;

    // variância e erro padrão da regressão
    const s2 = SQRes / gl;
    const s = Math.sqrt(s2);

    // coeficiente de determinação e sua versão ajustada
    const R2 = SQTot > 0 ? 1 - SQRes / SQTot : 0;
    const R2aj = 1 - (1 - R2) * (n - 1) / gl;

    // F de Snedecor (modelo inteiro) e sua significância
    const glReg = p - 1;
    const F = glReg > 0 ? (SQReg / glReg) / s2 : 0;
    const sigF = glReg > 0 ? D.sigF(F, glReg, gl) : 1;

    // erro padrão, t e Sig bicaudal de cada coeficiente
    const ep = new Array(p), t = new Array(p), sig = new Array(p);
    for (let j = 0; j < p; j++) {
      ep[j] = Math.sqrt(Math.max(s2 * inv[j][j], 0));
      t[j] = ep[j] > 0 ? b[j] / ep[j] : Infinity;
      sig[j] = D.sigT(t[j], gl);
    }

    const out = {
      n: n, p: p, gl: gl, b: b, ep: ep, t: t, sig: sig,
      yhat: yhat, e: e, ybar: ybar,
      SQRes: SQRes, SQTot: SQTot, SQReg: SQReg, s2: s2, s: s,
      R2: R2, R2aj: R2aj, r: Math.sqrt(Math.max(R2, 0)),
      F: F, sigF: sigF, glReg: glReg, inv: inv
    };

    if (!leve) {
      // diagonal da matriz chapéu H = X(XᵀX)⁻¹Xᵀ — "alavancagem" de cada
      // amostra. Base para Cook, resíduo studentizado e PRESS.
      const h = new Array(n);
      for (let i = 0; i < n; i++) h[i] = M.escalar(X[i], M.multVetor(inv, X[i]));
      out.h = h;
    }
    return out;
  };

  // ---------------------------------------------------------------------------
  // 3) Modelo completo
  // ---------------------------------------------------------------------------
  R.calcular = function (proj, transf) {
    const m = R.montar(proj, transf);
    if (m.erro) return m;
    const aj = R.ajustar(m.X, m.y, false);
    if (aj.erro) return aj;

    const modelo = Object.assign({}, m, aj);
    modelo.transf = U.copiar(transf);

    // Faixa amostral (mínimo, máximo, média) de cada variável na escala
    // ORIGINAL. Serve para o teste de extrapolação e para a elasticidade.
    modelo.faixa = m.indep.map(function (v, j) {
      const col = m.xOriginal.map(function (l) { return l[j]; });
      return { nome: v.nome, min: Math.min.apply(null, col), max: Math.max.apply(null, col), media: U.media(col) };
    });
    modelo.faixaY = {
      min: Math.min.apply(null, m.yOriginal), max: Math.max.apply(null, m.yOriginal), media: U.media(m.yOriginal)
    };

    modelo.equacao = R.equacao(modelo);
    modelo.elasticidade = R.elasticidades(modelo, proj);
    return modelo;
  };

  // ---------------------------------------------------------------------------
  // Previsão pontual: recebe valores ORIGINAIS das independentes (na ordem de
  // modelo.indep) e devolve { z: valor na escala transformada, x0: vetor }.
  // ---------------------------------------------------------------------------
  R.preverTransformado = function (modelo, valoresOriginais) {
    const x0 = [1];
    for (let j = 0; j < modelo.indep.length; j++) {
      x0.push(T.aplicar(modelo.indep[j].transf, valoresOriginais[j]));
    }
    return { z: M.escalar(x0, modelo.b), x0: x0 };
  };

  // Valor estimado na escala original da dependente (sem correção de viés).
  R.prever = function (modelo, valoresOriginais) {
    return T.desfazer(modelo.dep.transf, R.preverTransformado(modelo, valoresOriginais).z);
  };

  // ---------------------------------------------------------------------------
  // Elasticidade no ponto médio
  // ---------------------------------------------------------------------------
  // Pergunta respondida: "se esta variável aumentar 1%, com as outras na
  // média, quantos % muda o valor estimado?". Calculada numericamente, por
  // isso vale para qualquer combinação de escalas (x, 1/x, ln...).
  // Para variável de código ou dicotômica a elasticidade tem pouco sentido
  // econômico; mostramos também o "efeito de +1 unidade", que é mais útil.
  R.elasticidades = function (modelo) {
    const base = modelo.faixa.map(function (f) { return f.media; });
    const y0 = R.prever(modelo, base);
    return modelo.indep.map(function (v, j) {
      const mais1pct = base.slice(); mais1pct[j] = base[j] * 1.01;
      const mais1un = base.slice(); mais1un[j] = base[j] + 1;
      const y1 = R.prever(modelo, mais1pct);
      const y2 = R.prever(modelo, mais1un);
      return {
        nome: v.nome,
        // em "% de y por 1% de x"
        elasticidade: (Number.isFinite(y1) && y0 !== 0) ? ((y1 - y0) / y0) * 100 : NaN,
        efeitoUnidade: (Number.isFinite(y2) && y0 !== 0) ? (y2 - y0) / y0 : NaN
      };
    });
  };

  // ---------------------------------------------------------------------------
  // Equação por extenso, pronta para o laudo.
  // ---------------------------------------------------------------------------
  R.equacao = function (modelo) {
    const lado = T.termo(modelo.dep.transf, modelo.dep.nome);
    let txt = lado + ' = ' + U.fmtAuto(modelo.b[0]);
    for (let j = 0; j < modelo.indep.length; j++) {
      const c = modelo.b[j + 1];
      txt += (c >= 0 ? ' + ' : ' − ') + U.fmtAuto(Math.abs(c)) + ' × '
        + T.termo(modelo.indep[j].transf, modelo.indep[j].nome);
    }
    return txt;
  };

  // Equação explícita na escala original (ex.: VU = exp(...)).
  R.equacaoExplicita = function (modelo) {
    const inner = R.equacao(modelo).split(' = ')[1];
    switch (modelo.dep.transf) {
      case 'ln':     return modelo.dep.nome + ' = exp(' + inner + ')';
      case '1/x':    return modelo.dep.nome + ' = 1 / (' + inner + ')';
      case 'x2':     return modelo.dep.nome + ' = √(' + inner + ')';
      case '1/x2':   return modelo.dep.nome + ' = 1 / √(' + inner + ')';
      case 'raiz':   return modelo.dep.nome + ' = (' + inner + ')²';
      case '1/raiz': return modelo.dep.nome + ' = 1 / (' + inner + ')²';
      default:       return modelo.dep.nome + ' = ' + inner;
    }
  };

  INF.Regressao = R;
})(globalThis.INF = globalThis.INF || {});
````

## motor/05-diagnosticos.js
<a id="motor-05-diagnosticos-js"></a>

````javascript
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
````

## motor/06-busca-modelos.js
<a id="motor-06-busca-modelos-js"></a>

````javascript
/* =============================================================================
   06-busca-modelos.js — Busca automática de modelos
   -----------------------------------------------------------------------------
   Para cada variável existe um conjunto de escalas possíveis (x, 1/x, ln...).
   Com 5 independentes + a dependente, 7 escalas cada, são 7⁶ = 117.649
   modelos diferentes. O programa ajusta todos, descarta os que não passam
   nos filtros e guarda os N melhores (500 por padrão), ordenados pelo
   critério escolhido.

   Quando o número de combinações passa do limite (ex.: 9 variáveis dariam
   40 milhões), a busca exaustiva vira busca heurística: parte de vários
   pontos, e em cada rodada troca a escala de uma variável por vez ficando
   com a melhor ("descida por coordenadas" com reinícios). Acha o mesmo
   ótimo na imensa maioria dos casos em uma fração do tempo.

   Filtros disponíveis (todos opcionais):
     · Sig máxima dos regressores (ex.: 10% para mirar o Grau III)
     · Sig máxima do F
     · sinais coerentes com a direção esperada de cada variável
     · testar exclusão de variáveis (escala "fora")

   Critérios de ordenação:
     'R2aj'   R² ajustado
     'R2'     R²
     'R2orig' R² na escala original da dependente — permite comparar de
              forma justa um modelo em VU com outro em ln(VU)   ← novidade
     'R2prev' R² de previsão (PRESS, validação cruzada)          ← novidade
     'AIC'    critério de Akaike (menor é melhor)
     'sigMax' menor Sig máxima entre os regressores
   ============================================================================= */

(function (INF) {
  'use strict';

  const T = INF.Transf, R = INF.Regressao, U = INF.U;
  const B = {};

  // Critérios em que "maior é melhor"; os demais são "menor é melhor".
  const MAIOR_MELHOR = { R2aj: true, R2: true, R2orig: true, R2prev: true };

  // ---------------------------------------------------------------------------
  // Prepara as colunas já transformadas, uma vez só, para todas as escalas.
  // ---------------------------------------------------------------------------
  function prepararColunas(proj, opcoes) {
    const dep = R.dependente(proj);
    const amostras = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    const vars = [dep].concat(R.candidatas(proj));

    const dados = vars.map(function (v, idx) {
      const ehDep = idx === 0;
      const brutos = amostras.map(function (a) {
        return ehDep ? R.valorDependente(proj, a, v.nome) : U.lerNumero(a.valores[v.nome]);
      });
      // escalas permitidas: as marcadas na variável ou as padrão do tipo
      let escalas = (v.permitidas && v.permitidas.length) ? v.permitidas.slice() : T.permitidasPorTipo(v.tipo);
      // travada: o usuário fixou uma escala e a busca não mexe
      if (opcoes.travadas && opcoes.travadas[v.nome]) escalas = [opcoes.travadas[v.nome]];
      // "fora" só faz sentido para independentes
      if (!ehDep && opcoes.testarExclusao && !(opcoes.travadas && opcoes.travadas[v.nome])) escalas.push('fora');
      const colunas = {};
      escalas.forEach(function (id) {
        if (id === 'fora') { colunas[id] = null; return; }
        const col = brutos.map(function (x) { return T.aplicar(id, x); });
        // se algum valor ficou inválido, a escala inteira não serve
        colunas[id] = col.every(Number.isFinite) ? col : undefined;
      });
      // remove escalas inválidas
      escalas = escalas.filter(function (id) { return colunas[id] !== undefined; });
      return { v: v, escalas: escalas, colunas: colunas, brutos: brutos };
    });
    return { dados: dados, n: amostras.length, ids: amostras.map(function (a) { return a.id; }) };
  }

  // ---------------------------------------------------------------------------
  // Avalia uma combinação (vetor de índices de escala, um por variável).
  // ---------------------------------------------------------------------------
  function avaliar(prep, escolha, opcoes) {
    const dados = prep.dados, n = prep.n;
    const d0 = dados[0];
    const idY = d0.escalas[escolha[0]];
    const y = d0.colunas[idY];

    // monta X só com as independentes que não estão "fora"
    const usadas = [];
    for (let j = 1; j < dados.length; j++) {
      const id = dados[j].escalas[escolha[j]];
      if (id !== 'fora') usadas.push(j);
    }
    const p = usadas.length + 1;
    if (n - p < 1 || usadas.length === 0) return null;

    const X = new Array(n);
    for (let i = 0; i < n; i++) {
      const linha = new Array(p);
      linha[0] = 1;
      for (let c = 0; c < usadas.length; c++) {
        const j = usadas[c];
        linha[c + 1] = dados[j].colunas[dados[j].escalas[escolha[j]]][i];
      }
      X[i] = linha;
    }

    const precisaH = opcoes.criterio === 'R2prev';
    const aj = R.ajustar(X, y, !precisaH);
    if (aj.erro) return null;

    // Sig máxima dos regressores (a constante entra ou não, conforme config)
    let sigMax = 0;
    for (let j = opcoes.considerarIntercepto ? 0 : 1; j < p; j++) sigMax = Math.max(sigMax, aj.sig[j]);

    // coerência de sinais: efeito de x sobre y na escala ORIGINAL
    let sinaisOk = true;
    const crescY = T.porId[idY].crescente ? 1 : -1;
    for (let c = 0; c < usadas.length; c++) {
      const dd = dados[usadas[c]];
      const dir = dd.v.direcao;
      if (dir !== '+' && dir !== '-') continue;
      const crescX = T.porId[dd.escalas[escolha[usadas[c]]]].crescente ? 1 : -1;
      const efeito = Math.sign(aj.b[c + 1]) * crescX * crescY;
      if ((dir === '+' && efeito < 0) || (dir === '-' && efeito > 0)) { sinaisOk = false; break; }
    }

    // R² na escala original: correlação² entre y real e y estimado desfeito
    let R2orig = NaN;
    if (opcoes.criterio === 'R2orig' || opcoes.calcularR2orig) {
      const yo = d0.brutos;
      const ye = aj.yhat.map(function (z) { return T.desfazer(idY, z); });
      if (ye.every(Number.isFinite)) {
        const mo = U.media(yo), me = U.media(ye);
        let sxy = 0, sxx = 0, syy = 0;
        for (let i = 0; i < n; i++) {
          sxy += (yo[i] - mo) * (ye[i] - me); sxx += (yo[i] - mo) ** 2; syy += (ye[i] - me) ** 2;
        }
        R2orig = sxy * sxy / (sxx * syy);
      }
    }

    let R2prev = NaN;
    if (precisaH) {
      let press = 0;
      for (let i = 0; i < n; i++) { const el = aj.e[i] / Math.max(1 - aj.h[i], 1e-12); press += el * el; }
      R2prev = 1 - press / aj.SQTot;
    }

    const AIC = n * Math.log(aj.SQRes / n) + 2 * p;

    // monta o mapa {variável: escala}
    const transf = {};
    for (let j = 0; j < dados.length; j++) transf[dados[j].v.nome] = dados[j].escalas[escolha[j]];

    return {
      transf: transf, k: usadas.length, n: n,
      R2: aj.R2, R2aj: aj.R2aj, R2orig: R2orig, R2prev: R2prev, AIC: AIC,
      F: aj.F, sigF: aj.sigF, sigMax: sigMax, sinaisOk: sinaisOk
    };
  }

  // Passa nos filtros escolhidos pelo usuário?
  function passa(res, opcoes) {
    if (!res) return false;
    if (opcoes.sigMaxRegressores != null && res.sigMax > opcoes.sigMaxRegressores) return false;
    if (opcoes.sigMaxF != null && res.sigF > opcoes.sigMaxF) return false;
    if (opcoes.exigirSinais && !res.sinaisOk) return false;
    if (opcoes.minAmostrasPorVariavel && res.n < opcoes.minAmostrasPorVariavel * (res.k + 1)) return false;
    return true;
  }

  // Nota numérica para comparar (sempre "maior é melhor" internamente).
  function nota(res, criterio) {
    const v = res[criterio];
    if (!Number.isFinite(v)) return -Infinity;
    return MAIOR_MELHOR[criterio] ? v : -v;
  }

  // ---------------------------------------------------------------------------
  // Ranking limitado aos N melhores (inserção ordenada por busca binária).
  // ---------------------------------------------------------------------------
  function Ranking(limite, criterio) {
    this.limite = limite; this.criterio = criterio; this.itens = []; this.vistos = new Set();
  }
  Ranking.prototype.oferecer = function (res) {
    const chave = JSON.stringify(res.transf);
    if (this.vistos.has(chave)) return;
    this.vistos.add(chave);
    const s = nota(res, this.criterio);
    if (this.itens.length >= this.limite && s <= this.itens[this.itens.length - 1]._nota) return;
    res._nota = s;
    let lo = 0, hi = this.itens.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.itens[mid]._nota >= s) lo = mid + 1; else hi = mid; }
    this.itens.splice(lo, 0, res);
    if (this.itens.length > this.limite) this.itens.pop();
  };

  // ---------------------------------------------------------------------------
  // Busca principal (assíncrona: devolve Promise e cede a vez à tela a cada
  // bloco de modelos, para a barra de progresso andar e nada congelar).
  // ---------------------------------------------------------------------------
  B.buscar = function (proj, opcoesUsuario, aoProgredir) {
    const opcoes = Object.assign({
      limite: 500, criterio: 'R2aj', testarExclusao: false,
      sigMaxRegressores: null, sigMaxF: null, exigirSinais: false,
      maxCombinacoes: 300000, reinicios: 40, semente: 12345,
      considerarIntercepto: !!(proj.config && proj.config.considerarIntercepto),
      travadas: null, minAmostrasPorVariavel: 0
    }, opcoesUsuario || {});

    const prep = prepararColunas(proj, opcoes);
    const tamanhos = prep.dados.map(function (d) { return d.escalas.length; });
    if (tamanhos.some(function (t) { return t === 0; })) {
      const ruim = prep.dados.filter(function (d) { return d.escalas.length === 0; }).map(function (d) { return d.v.nome; });
      return Promise.resolve({ erro: 'Sem escala válida para: ' + ruim.join(', ') + ' (valores zerados, negativos ou vazios?)' });
    }
    const total = tamanhos.reduce(function (a, b) { return a * b; }, 1);
    const ranking = new Ranking(opcoes.limite, opcoes.criterio);
    let avaliados = 0, validos = 0;

    function registrar(res) {
      avaliados++;
      if (passa(res, opcoes)) { validos++; ranking.oferecer(res); }
    }

    // --- modo exaustivo -----------------------------------------------------
    if (total <= opcoes.maxCombinacoes) {
      const escolha = new Array(tamanhos.length).fill(0);
      return new Promise(function (resolver) {
        let terminou = false;
        function bloco() {
          const fim = Date.now() + 40;           // ~40 ms por bloco
          while (!terminou && Date.now() < fim) {
            registrar(avaliar(prep, escolha, opcoes));
            // "odômetro": incrementa a última posição e vai levando o "vai um"
            let j = tamanhos.length - 1;
            while (j >= 0) {
              escolha[j]++;
              if (escolha[j] < tamanhos[j]) break;
              escolha[j] = 0; j--;
            }
            if (j < 0) terminou = true;
          }
          if (aoProgredir) aoProgredir(avaliados / total, avaliados, total);
          if (terminou) resolver(fechar('exaustiva'));
          else setTimeout(bloco, 0);
        }
        bloco();
      });
    }

    // --- modo heurístico ----------------------------------------------------
    const sorteio = U.rng(opcoes.semente);
    const pontosPartida = [];
    pontosPartida.push(tamanhos.map(function () { return 0; }));   // tudo em x
    for (let r = 1; r < opcoes.reinicios; r++) {
      pontosPartida.push(tamanhos.map(function (t) { return Math.floor(sorteio() * t); }));
    }
    let partida = 0;
    return new Promise(function (resolver) {
      function proximaPartida() {
        if (partida >= pontosPartida.length) { resolver(fechar('heuristica')); return; }
        const atual = pontosPartida[partida++].slice();
        let melhor = avaliar(prep, atual, opcoes); registrar(melhor);
        let melhorNota = melhor && passa(melhor, opcoes) ? nota(melhor, opcoes.criterio) : -Infinity;
        let mudou = true, voltas = 0;
        while (mudou && voltas < 25) {
          mudou = false; voltas++;
          for (let j = 0; j < tamanhos.length; j++) {
            const original = atual[j];
            let melhorIdx = original;
            for (let e = 0; e < tamanhos[j]; e++) {
              if (e === original) continue;
              atual[j] = e;
              const res = avaliar(prep, atual, opcoes); registrar(res);
              const s = res && passa(res, opcoes) ? nota(res, opcoes.criterio) : -Infinity;
              if (s > melhorNota) { melhorNota = s; melhorIdx = e; mudou = true; }
            }
            atual[j] = melhorIdx;
          }
        }
        if (aoProgredir) aoProgredir(partida / pontosPartida.length, avaliados, total);
        setTimeout(proximaPartida, 0);
      }
      proximaPartida();
    });

    function fechar(modo) {
      return {
        modo: modo, totalCombinacoes: total, avaliados: avaliados, validos: validos,
        criterio: opcoes.criterio, modelos: ranking.itens
      };
    }
  };

  INF.Busca = B;
})(globalThis.INF = globalThis.INF || {});
````

## motor/07-nbr14653.js
<a id="motor-07-nbr14653-js"></a>

````javascript
/* =============================================================================
   07-nbr14653.js — Enquadramento na ABNT NBR 14.653-2
   -----------------------------------------------------------------------------
   Tudo que é "regra da norma" está concentrado na constante NORMA logo
   abaixo. Se sair uma revisão da norma, ou se o trabalho for rural
   (NBR 14.653-3, que tem tabela própria), muda-se só este bloco — o resto do
   programa lê daqui.

   IMPORTANTE: os valores abaixo foram transcritos da NBR 14.653-2:2011
   (Tabelas 1, 2 e 5 e item A.2). Conferir com o exemplar vigente antes do
   primeiro laudo e sempre que a ABNT publicar revisão.

   Funções:
     fundamentacao()   → Tabela 1 (6 itens) + Tabela 2 (enquadramento)
     precisao()        → Tabela 5 (amplitude do IC de 80%)
     extrapolacao()    → item 4 da Tabela 1
     micronumerosidade → item A.2 (códigos/dicotômicas)
     campoArbitrio()   → ±15% em torno da estimativa central
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const N = {};

  N.NORMA = {
    referencia: 'ABNT NBR 14.653-2:2011 — Tabelas 1, 2 e 5',

    // Item 2 — quantidade mínima de dados efetivamente utilizados, em
    // múltiplos de (k+1), sendo k o número de variáveis independentes.
    item2: { III: 6, II: 4, I: 3 },

    // Item 4 — extrapolação: limites da variável e do valor na fronteira.
    item4: {
      limiteSuperior: 2.0,      // até 100% acima do máximo amostral (2 × máx)
      limiteInferior: 0.5,      // até a metade do mínimo amostral
      variacaoII: 0.15,         // valor estimado ≤ 15% do valor na fronteira
      variacaoI: 0.20           // idem, 20%
    },

    // Item 5 — Sig máxima de cada regressor (teste bicaudal).
    item5: { III: 0.10, II: 0.20, I: 0.30 },

    // Item 6 — Sig máxima do F de Snedecor para rejeitar H0 do modelo.
    item6: { III: 0.01, II: 0.02, I: 0.05 },

    // Tabela 2 — pontuação e itens obrigatórios.
    enquadramento: {
      III: { pontos: 16, obrigatorios: [2, 4, 5, 6], grauObrig: 3, grauDemais: 2 },
      II:  { pontos: 10, obrigatorios: [2, 4, 5, 6], grauObrig: 2, grauDemais: 1 },
      I:   { pontos: 6,  obrigatorios: [1, 2, 3, 4, 5, 6], grauObrig: 1, grauDemais: 1 }
    },

    // Tabela 5 — amplitude do IC de 80% em torno da estimativa central.
    precisao: { III: 0.30, II: 0.40, I: 0.50 },

    // Campo de arbítrio em torno da estimativa central.
    campoArbitrio: 0.15,

    // Micronumerosidade (A.2) para códigos alocados e dicotômicas.
    micro: function (n) {
      if (n <= 30) return 3;
      if (n <= 100) return Math.ceil(0.10 * n);
      return 10;
    },

    // Textos dos itens 1 e 3 (preenchidos pelo avaliador, não pelo programa).
    textoItem1: {
      3: 'Completa quanto a todas as variáveis analisadas',
      2: 'Completa quanto às variáveis utilizadas no modelo',
      1: 'Adoção de situação paradigma'
    },
    textoItem3: {
      3: 'Apresentação de informações de todas as características dos dados analisados, com foto e características observadas pelo autor do laudo',
      2: 'Apresentação de informações de todas as características dos dados analisados',
      1: 'Apresentação de informações das características dos dados correspondentes às variáveis utilizadas no modelo'
    }
  };

  const ROMANO = { 3: 'III', 2: 'II', 1: 'I', 0: '—' };
  N.romano = function (g) { return ROMANO[g] || '—'; };

  // ---------------------------------------------------------------------------
  // Item 4 — extrapolação
  // ---------------------------------------------------------------------------
  // Para cada variável, o avaliando está dentro de [mín, máx] da amostra?
  // Se não estiver, verifica os limites admitidos e compara o valor estimado
  // com o valor calculado na fronteira amostral daquela variável.
  N.extrapolacao = function (modelo, valoresAvaliando) {
    const L = N.NORMA.item4;
    const Rg = INF.Regressao;
    const yAval = Rg.prever(modelo, valoresAvaliando);
    const fora = [];
    modelo.faixa.forEach(function (f, j) {
      const x = valoresAvaliando[j];
      if (x >= f.min && x <= f.max) return;
      const fronteira = x > f.max ? f.max : f.min;
      const noLimite = x <= L.limiteSuperior * f.max && x >= L.limiteInferior * f.min;
      const naFronteira = valoresAvaliando.slice(); naFronteira[j] = fronteira;
      const yFront = Rg.prever(modelo, naFronteira);
      const variacao = Math.abs(yAval - yFront) / Math.abs(yFront);
      fora.push({ nome: f.nome, valor: x, min: f.min, max: f.max, dentroDosLimites: noLimite, variacao: variacao });
    });

    // variação conjunta: todas as extrapoladas levadas à fronteira ao mesmo tempo
    let variacaoConjunta = 0;
    if (fora.length > 1) {
      const tudoNaFronteira = valoresAvaliando.map(function (x, j) {
        const f = modelo.faixa[j];
        return Math.min(Math.max(x, f.min), f.max);
      });
      const yF = Rg.prever(modelo, tudoNaFronteira);
      variacaoConjunta = Math.abs(yAval - yF) / Math.abs(yF);
    } else if (fora.length === 1) {
      variacaoConjunta = fora[0].variacao;
    }

    let grau;
    if (fora.length === 0) grau = 3;
    else if (fora.some(function (f) { return !f.dentroDosLimites; })) grau = 0;
    else if (fora.length === 1 && fora[0].variacao <= L.variacaoII) grau = 2;
    else if (fora.every(function (f) { return f.variacao <= L.variacaoI; }) && variacaoConjunta <= L.variacaoI) grau = 1;
    else grau = 0;

    return { grau: grau, variaveis: fora, variacaoConjunta: variacaoConjunta };
  };

  // ---------------------------------------------------------------------------
  // Tabela 1 + Tabela 2 — grau de fundamentação
  // ---------------------------------------------------------------------------
  // item1 e item3 vêm do avaliador (1, 2 ou 3). O resto sai do modelo.
  N.fundamentacao = function (modelo, extrap, item1, item3, considerarIntercepto) {
    const K = N.NORMA;
    const k = modelo.p - 1, n = modelo.n;

    // item 2 — quantidade de dados
    let g2 = 0;
    if (n >= K.item2.III * (k + 1)) g2 = 3;
    else if (n >= K.item2.II * (k + 1)) g2 = 2;
    else if (n >= K.item2.I * (k + 1)) g2 = 1;

    // item 5 — maior Sig entre os regressores
    let sigMax = 0;
    for (let j = considerarIntercepto ? 0 : 1; j < modelo.p; j++) sigMax = Math.max(sigMax, modelo.sig[j]);
    let g5 = 0;
    if (sigMax <= K.item5.III) g5 = 3;
    else if (sigMax <= K.item5.II) g5 = 2;
    else if (sigMax <= K.item5.I) g5 = 1;

    // item 6 — Sig do F
    let g6 = 0;
    if (modelo.sigF <= K.item6.III) g6 = 3;
    else if (modelo.sigF <= K.item6.II) g6 = 2;
    else if (modelo.sigF <= K.item6.I) g6 = 1;

    const g4 = extrap ? extrap.grau : 3;
    const itens = [
      { item: 1, descricao: 'Caracterização do imóvel avaliando', grau: item1 || 0, fonte: 'avaliador',
        detalhe: K.textoItem1[item1] || 'não informado' },
      { item: 2, descricao: 'Quantidade mínima de dados de mercado efetivamente utilizados', grau: g2, fonte: 'modelo',
        detalhe: 'n = ' + n + '; k = ' + k + '; 6(k+1) = ' + 6 * (k + 1) + ', 4(k+1) = ' + 4 * (k + 1) + ', 3(k+1) = ' + 3 * (k + 1) },
      { item: 3, descricao: 'Identificação dos dados de mercado', grau: item3 || 0, fonte: 'avaliador',
        detalhe: K.textoItem3[item3] || 'não informado' },
      { item: 4, descricao: 'Extrapolação', grau: g4, fonte: 'modelo',
        detalhe: extrap && extrap.variaveis.length ? extrap.variaveis.map(function (v) { return v.nome + ' (' + U.fmtPct(v.variacao, 1) + ' na fronteira)'; }).join('; ') : 'Não há extrapolação' },
      { item: 5, descricao: 'Nível de significância máximo dos regressores (bicaudal)', grau: g5, fonte: 'modelo',
        detalhe: 'maior Sig = ' + U.fmtPct(sigMax) + (considerarIntercepto ? ' (inclui a constante)' : ' (sem a constante)') },
      { item: 6, descricao: 'Nível de significância máximo do modelo (F de Snedecor)', grau: g6, fonte: 'modelo',
        detalhe: 'Sig F = ' + U.fmtPct(modelo.sigF, 4) }
    ];
    itens.forEach(function (it) { it.pontos = it.grau; });
    const pontos = itens.reduce(function (s, it) { return s + it.pontos; }, 0);

    // Tabela 2: verifica do grau mais alto para o mais baixo
    function atende(regra) {
      if (pontos < regra.pontos) return false;
      return itens.every(function (it) {
        const minimo = regra.obrigatorios.indexOf(it.item) >= 0 ? regra.grauObrig : regra.grauDemais;
        return it.grau >= minimo;
      });
    }
    let grau = 0;
    if (atende(K.enquadramento.III)) grau = 3;
    else if (atende(K.enquadramento.II)) grau = 2;
    else if (atende(K.enquadramento.I)) grau = 1;

    // o que falta para subir de grau — ajuda muito na hora de ajustar o modelo
    const pendencias = [];
    if (grau < 3) {
      const alvo = K.enquadramento[grau === 2 ? 'III' : 'II'];
      itens.forEach(function (it) {
        const minimo = alvo.obrigatorios.indexOf(it.item) >= 0 ? alvo.grauObrig : alvo.grauDemais;
        if (it.grau < minimo) pendencias.push('Item ' + it.item + ' precisa chegar ao Grau ' + N.romano(minimo));
      });
      if (pontos < alvo.pontos) pendencias.push('Somar ao menos ' + alvo.pontos + ' pontos (hoje: ' + pontos + ')');
    }

    return { itens: itens, pontos: pontos, grau: grau, sigMax: sigMax, pendencias: pendencias, n: n, k: k };
  };

  // Fundamentação só do modelo, antes de existir avaliando: o item 4
  // (extrapolação) fica como "a verificar" e é tratado como atendido. O
  // grau definitivo sai da projeção, que olha o imóvel avaliando.
  N.fundamentacaoPreliminar = function (modelo, cfg) {
    const f = N.fundamentacao(modelo, { grau: 3, variaveis: [] }, Number(cfg.item1), Number(cfg.item3), cfg.considerarIntercepto);
    f.itens[3].detalhe = 'a verificar com o avaliando';
    f.preliminar = true;
    return f;
  };

  // ---------------------------------------------------------------------------
  // Tabela 5 — grau de precisão pela amplitude do IC de 80%
  // ---------------------------------------------------------------------------
  N.precisao = function (amplitude) {
    const P = N.NORMA.precisao;
    if (amplitude <= P.III) return 3;
    if (amplitude <= P.II) return 2;
    if (amplitude <= P.I) return 1;
    return 0;
  };

  // ---------------------------------------------------------------------------
  // Micronumerosidade — conta amostras por código em variáveis de código
  // alocado e dicotômicas que estão no modelo.
  // ---------------------------------------------------------------------------
  N.micronumerosidade = function (proj, modelo) {
    const minimo = N.NORMA.micro(modelo.n);
    const problemas = [];
    modelo.indep.forEach(function (v, j) {
      if (v.tipo !== 'qualitativa' && v.tipo !== 'dicotomica') return;
      const contagem = {};
      modelo.xOriginal.forEach(function (linha) {
        const c = String(linha[j]);
        contagem[c] = (contagem[c] || 0) + 1;
      });
      Object.keys(contagem).forEach(function (c) {
        if (contagem[c] < minimo) problemas.push({ variavel: v.nome, codigo: c, qtd: contagem[c], minimo: minimo });
      });
    });
    return { minimo: minimo, problemas: problemas };
  };

  // Campo de arbítrio (±15% da estimativa central).
  N.campoArbitrio = function (central) {
    const c = N.NORMA.campoArbitrio;
    return { min: central * (1 - c), max: central * (1 + c) };
  };

  INF.NBR = N;
})(globalThis.INF = globalThis.INF || {});
````

## motor/08-projecao.js
<a id="motor-08-projecao-js"></a>

````javascript
/* =============================================================================
   08-projecao.js — Projeção de valores do imóvel avaliando
   -----------------------------------------------------------------------------
   Estimativa do avaliando. Recebe as características do imóvel,
   calcula a estimativa central, o intervalo de confiança de 80% (padrão da
   norma), o intervalo de predição (opcional, quando o contratante pede),
   a amplitude, o grau de precisão, o campo de arbítrio e o valor total.

   Detalhe técnico que muita gente erra: quando a dependente está em ln(VU),
   o valor "desfeito" exp(ŷ) é a MEDIANA da distribuição, não a média.
   Por isso o programa oferece as três estimativas:
       mediana = exp(ŷ)
       média   = exp(ŷ + s²/2)
       moda    = exp(ŷ − s²)
   O intervalo de confiança é calculado na escala transformada e depois
   desfeito nas duas pontas. Se a escala da dependente for decrescente
   (1/y, 1/y², 1/√y), as pontas se invertem — tratamos isso.
   ============================================================================= */

(function (INF) {
  'use strict';

  const M = INF.Matriz, D = INF.Dist, T = INF.Transf, Rg = INF.Regressao, N = INF.NBR;
  const P = {};

  // opcoes: { nivel: 0.80, estimativa: 'mediana'|'media'|'moda',
  //           areaAvaliando: número (para o valor total), item1, item3,
  //           considerarIntercepto }
  P.projetar = function (modelo, valoresAvaliando, opcoes) {
    const op = Object.assign({ nivel: 0.80, estimativa: 'mediana' }, opcoes || {});
    for (let j = 0; j < valoresAvaliando.length; j++) {
      if (!Number.isFinite(valoresAvaliando[j])) {
        return { erro: 'Preencha ' + modelo.indep[j].nome + ' do avaliando.' };
      }
    }

    // vetor do avaliando na escala do modelo (com o 1 da constante)
    const prev = Rg.preverTransformado(modelo, valoresAvaliando);
    if (prev.x0.some(function (v) { return !Number.isFinite(v); })) {
      return { erro: 'Algum valor do avaliando é inválido para a escala da variável (ex.: ln de zero).' };
    }
    const z = prev.z;

    // variância da média estimada: s² · x0ᵀ (XᵀX)⁻¹ x0
    const q = M.escalar(prev.x0, M.multVetor(modelo.inv, prev.x0));
    const epMedia = modelo.s * Math.sqrt(q);
    const epPredicao = modelo.s * Math.sqrt(1 + q);

    // t de Student bicaudal para o nível pedido (80% → t de 0,90)
    const t = D.tInv(1 - (1 - op.nivel) / 2, modelo.gl);

    const idY = modelo.dep.transf;
    const desfazer = function (v) { return T.desfazer(idY, v); };
    const ordenar = function (a, b) { return a <= b ? [a, b] : [b, a]; };

    // estimativa central
    let central = desfazer(z);
    if (idY === 'ln') {
      if (op.estimativa === 'media') central = Math.exp(z + modelo.s2 / 2);
      else if (op.estimativa === 'moda') central = Math.exp(z - modelo.s2);
    }

    // as três estimativas lado a lado (só diferem quando y está em ln)
    const estimativas = idY === 'ln'
      ? { mediana: Math.exp(z), media: Math.exp(z + modelo.s2 / 2), moda: Math.exp(z - modelo.s2) }
      : { mediana: central, media: central, moda: central };

    const ic = ordenar(desfazer(z - t * epMedia), desfazer(z + t * epMedia));
    const ip = ordenar(desfazer(z - t * epPredicao), desfazer(z + t * epPredicao));

    // amplitude em relação à estimativa central (Tabela 5 da NBR)
    const amplitude = (ic[1] - ic[0]) / central;
    const grauPrecisao = N.precisao(amplitude);

    // extrapolação e fundamentação dependem do avaliando
    const extrap = N.extrapolacao(modelo, valoresAvaliando);
    const fund = N.fundamentacao(modelo, extrap, op.item1, op.item3, op.considerarIntercepto);

    const arb = N.campoArbitrio(central);
    const area = Number(op.areaAvaliando);
    const temArea = Number.isFinite(area) && area > 0;

    return {
      z: z, t: t, nivel: op.nivel, estimativa: idY === 'ln' ? op.estimativa : 'direta',
      central: central, estimativas: estimativas,
      icMin: ic[0], icMax: ic[1],
      ipMin: ip[0], ipMax: ip[1],
      amplitude: amplitude, grauPrecisao: grauPrecisao,
      // desvio do IC em relação à central, para cada lado
      icAbaixo: (central - ic[0]) / central, icAcima: (ic[1] - central) / central,
      arbitrioMin: arb.min, arbitrioMax: arb.max,
      extrapolacao: extrap, fundamentacao: fund,
      area: temArea ? area : null,
      totalCentral: temArea ? central * area : null,
      totalMin: temArea ? ic[0] * area : null,
      totalMax: temArea ? ic[1] * area : null
    };
  };

  // Arredondamento do valor final: a NBR admite até 1% para não passar
  // ideia de exatidão. Arredonda para o "degrau" que fica dentro de 1%.
  P.arredondar = function (valor) {
    if (!Number.isFinite(valor) || valor === 0) return valor;
    const degraus = [1e7, 5e6, 1e6, 5e5, 1e5, 5e4, 1e4, 5e3, 1e3, 500, 100, 50, 10, 5, 1, 0.5, 0.1, 0.05, 0.01];
    for (let i = 0; i < degraus.length; i++) {
      const r = Math.round(valor / degraus[i]) * degraus[i];
      if (Math.abs(r - valor) / Math.abs(valor) <= 0.01) return r;
    }
    return valor;
  };

  INF.Projecao = P;
})(globalThis.INF = globalThis.INF || {});
````

## motor/09-rna.js
<a id="motor-09-rna-js"></a>

````javascript
/* =============================================================================
   09-rna.js — Rede Neural Artificial (perceptron de uma camada oculta)
   -----------------------------------------------------------------------------
   Treinamento de rede neural com bagging.

   Estrutura:   entradas (variáveis) → camada oculta (tanh) → 1 saída (linear)
   Treino:      gradiente com otimizador Adam, erro quadrático + penalidade
                L2 nos pesos (evita "decorar" os dados)
   Parada:      separa ~20% das amostras para validação e para quando o erro
                de validação não melhora por N épocas (parada antecipada)
   Bagging:     treina B redes, cada uma numa reamostragem com reposição dos
                dados, e usa a média das previsões. A dispersão entre as
                redes dá uma ideia de incerteza.
   Transparência (novidade): sensibilidade de cada variável calculada no
                ponto médio — o "quanto cada variável pesa" que falta na RNA
                em rede neural e que o juiz costuma perguntar.

   Tudo com semente fixa: mesmos dados + mesma semente = mesmo resultado.
   Atenção: RNA é mais difícil de defender em perícia. Use como comparação
   ou quando a regressão não chegar ao Grau II.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, Rg = INF.Regressao;
  const A = {};

  // Normalização min-max para [-1, 1] (a tanh trabalha melhor nessa faixa).
  function escalador(colunas) {
    return colunas.map(function (c) {
      const min = Math.min.apply(null, c), max = Math.max.apply(null, c);
      const amp = max - min || 1;
      return { min: min, max: max, ida: function (v) { return 2 * (v - min) / amp - 1; }, volta: function (v) { return (v + 1) / 2 * amp + min; } };
    });
  }

  // Cria uma rede com pesos aleatórios pequenos (inicialização de Xavier).
  function criarRede(nEnt, nOcultos, sorteio) {
    const lim1 = Math.sqrt(6 / (nEnt + nOcultos)), lim2 = Math.sqrt(6 / (nOcultos + 1));
    const W1 = [], b1 = [], W2 = [];
    for (let h = 0; h < nOcultos; h++) {
      const linha = [];
      for (let i = 0; i < nEnt; i++) linha.push((sorteio() * 2 - 1) * lim1);
      W1.push(linha); b1.push(0); W2.push((sorteio() * 2 - 1) * lim2);
    }
    return { W1: W1, b1: b1, W2: W2, b2: 0 };
  }

  // Passada para frente: devolve saída e ativações da camada oculta.
  function frente(rede, x) {
    const a = new Array(rede.W1.length);
    let saida = rede.b2;
    for (let h = 0; h < a.length; h++) {
      let s = rede.b1[h];
      for (let i = 0; i < x.length; i++) s += rede.W1[h][i] * x[i];
      a[h] = Math.tanh(s);
      saida += rede.W2[h] * a[h];
    }
    return { saida: saida, a: a };
  }

  // Treina uma rede. X e y já normalizados.
  function treinar(X, y, idxTreino, idxValid, op, sorteio) {
    const nEnt = X[0].length;
    const rede = criarRede(nEnt, op.ocultos, sorteio);
    // estado do Adam (primeiro e segundo momentos de cada peso)
    const zeroW1 = function () { return rede.W1.map(function (l) { return l.map(function () { return 0; }); }); };
    const m = { W1: zeroW1(), b1: rede.b1.map(function () { return 0; }), W2: rede.W2.map(function () { return 0; }), b2: 0 };
    const v = { W1: zeroW1(), b1: rede.b1.map(function () { return 0; }), W2: rede.W2.map(function () { return 0; }), b2: 0 };
    const b1a = 0.9, b2a = 0.999, eps = 1e-8, lr = op.taxa, lambda = op.l2;

    const erroEm = function (idx) {
      let s = 0;
      idx.forEach(function (i) { const d = frente(rede, X[i]).saida - y[i]; s += d * d; });
      return s / Math.max(idx.length, 1);
    };

    let melhor = Infinity, melhorRede = JSON.stringify(rede), semMelhora = 0, passo = 0;
    for (let ep = 0; ep < op.epocas; ep++) {
      // gradiente acumulado no lote inteiro (os conjuntos de laudo são pequenos)
      const gW1 = zeroW1(), gb1 = rede.b1.map(function () { return 0; }), gW2 = rede.W2.map(function () { return 0; });
      let gb2 = 0;
      idxTreino.forEach(function (i) {
        const f = frente(rede, X[i]);
        const d = 2 * (f.saida - y[i]) / idxTreino.length;   // derivada do erro quadrático médio
        gb2 += d;
        for (let h = 0; h < f.a.length; h++) {
          gW2[h] += d * f.a[h];
          const dh = d * rede.W2[h] * (1 - f.a[h] * f.a[h]);  // derivada da tanh
          gb1[h] += dh;
          for (let k = 0; k < X[i].length; k++) gW1[h][k] += dh * X[i][k];
        }
      });
      // penalidade L2 (só nos pesos, não nos vieses)
      for (let h = 0; h < rede.W2.length; h++) {
        gW2[h] += lambda * rede.W2[h];
        for (let k = 0; k < nEnt; k++) gW1[h][k] += lambda * rede.W1[h][k];
      }
      // atualização Adam
      passo++;
      const c1 = 1 - Math.pow(b1a, passo), c2 = 1 - Math.pow(b2a, passo);
      const adam = function (w, g, mo, ve) {
        const mn = b1a * mo + (1 - b1a) * g, vn = b2a * ve + (1 - b2a) * g * g;
        return { w: w - lr * (mn / c1) / (Math.sqrt(vn / c2) + eps), m: mn, v: vn };
      };
      for (let h = 0; h < rede.W2.length; h++) {
        let r = adam(rede.W2[h], gW2[h], m.W2[h], v.W2[h]); rede.W2[h] = r.w; m.W2[h] = r.m; v.W2[h] = r.v;
        r = adam(rede.b1[h], gb1[h], m.b1[h], v.b1[h]); rede.b1[h] = r.w; m.b1[h] = r.m; v.b1[h] = r.v;
        for (let k = 0; k < nEnt; k++) {
          r = adam(rede.W1[h][k], gW1[h][k], m.W1[h][k], v.W1[h][k]);
          rede.W1[h][k] = r.w; m.W1[h][k] = r.m; v.W1[h][k] = r.v;
        }
      }
      const rb = adam(rede.b2, gb2, m.b2, v.b2); rede.b2 = rb.w; m.b2 = rb.m; v.b2 = rb.v;

      // parada antecipada pelo erro de validação
      if (ep % 10 === 0) {
        const ev = idxValid.length ? erroEm(idxValid) : erroEm(idxTreino);
        if (ev < melhor - 1e-9) { melhor = ev; melhorRede = JSON.stringify(rede); semMelhora = 0; }
        else if (++semMelhora * 10 >= op.paciencia) break;
      }
    }
    return JSON.parse(melhorRede);
  }

  // ---------------------------------------------------------------------------
  // Treino completo com bagging.
  // ---------------------------------------------------------------------------
  // Usa as mesmas variáveis do modelo de regressão atual, na escala ORIGINAL
  // (a rede descobre sozinha a curvatura, não precisa de ln ou 1/x).
  A.treinar = function (proj, transfModelo, opcoes) {
    const op = Object.assign({ ocultos: 4, epocas: 3000, taxa: 0.01, l2: 0.001, paciencia: 300, redes: 15, fracValid: 0.2, semente: 12345 }, opcoes || {});
    // aproveita o montar() com todas as escalas em "x"
    const transfX = {};
    Object.keys(transfModelo).forEach(function (k) { transfX[k] = transfModelo[k] === 'fora' ? 'fora' : 'x'; });
    const mt = Rg.montar(proj, transfX);
    if (mt.erro) return mt;
    const n = mt.n, k = mt.indep.length;
    if (n < 8) return { erro: 'A RNA precisa de pelo menos 8 amostras.' };

    const colunas = [];
    for (let j = 0; j < k; j++) colunas.push(mt.xOriginal.map(function (l) { return l[j]; }));
    const escX = escalador(colunas);
    const escY = escalador([mt.yOriginal])[0];
    const X = mt.xOriginal.map(function (l) { return l.map(function (v, j) { return escX[j].ida(v); }); });
    const y = mt.yOriginal.map(escY.ida);

    const sorteio = U.rng(op.semente);
    const redes = [];
    for (let r = 0; r < op.redes; r++) {
      // reamostragem com reposição (bootstrap); o que ficou de fora vira validação
      const treino = [], dentro = new Set();
      for (let i = 0; i < n; i++) { const s = Math.floor(sorteio() * n); treino.push(s); dentro.add(s); }
      let valid = [];
      for (let i = 0; i < n; i++) if (!dentro.has(i)) valid.push(i);
      if (valid.length < 2) valid = treino.slice(0, Math.max(2, Math.floor(n * op.fracValid)));
      redes.push(treinar(X, y, treino, valid, op, sorteio));
    }

    const modelo = { tipo: 'RNA', redes: redes, escX: escX.map(function (e) { return { min: e.min, max: e.max }; }), escY: { min: escY.min, max: escY.max }, indep: mt.indep, dep: mt.dep, n: n, opcoes: op };

    // desempenho nas próprias amostras
    const est = mt.xOriginal.map(function (l) { return A.prever(modelo, l).media; });
    const obs = mt.yOriginal;
    const mo = U.media(obs);
    let sqr = 0, sqt = 0, somaPct = 0;
    for (let i = 0; i < n; i++) {
      sqr += (obs[i] - est[i]) ** 2; sqt += (obs[i] - mo) ** 2;
      somaPct += Math.abs(obs[i] - est[i]) / Math.abs(obs[i]);
    }
    modelo.R2 = 1 - sqr / sqt;
    modelo.EMP = somaPct / n;          // erro médio percentual
    modelo.ids = mt.ids; modelo.observado = obs; modelo.estimado = est;
    modelo.xs = X; modelo.xOriginal = mt.xOriginal;   // usados pela poda
    modelo.faixa = colunas.map(function (c, j) { return { nome: mt.indep[j].nome, min: Math.min.apply(null, c), max: Math.max.apply(null, c), media: U.media(c) }; });
    modelo.sensibilidade = A.sensibilidade(modelo);
    return modelo;
  };

  // Previsão: média e desvio entre as redes do bagging.
  A.prever = function (modelo, valoresOriginais) {
    const x = valoresOriginais.map(function (v, j) {
      const e = modelo.escX[j]; const amp = e.max - e.min || 1;
      return 2 * (v - e.min) / amp - 1;
    });
    const ampY = modelo.escY.max - modelo.escY.min || 1;
    const saidas = modelo.redes.map(function (rede) {
      const s = frente(rede, x).saida;
      return (s + 1) / 2 * ampY + modelo.escY.min;
    });
    return { media: U.media(saidas), desvio: saidas.length > 1 ? U.desvio(saidas) : 0, todas: saidas };
  };

  // Sensibilidade: variação % do valor para +1% em cada variável, no ponto
  // médio — mesma leitura da elasticidade da regressão.
  A.sensibilidade = function (modelo) {
    const base = modelo.faixa.map(function (f) { return f.media; });
    const y0 = A.prever(modelo, base).media;
    return modelo.faixa.map(function (f, j) {
      const b = base.slice(); b[j] = base[j] * 1.01;
      return { nome: f.nome, elasticidade: (A.prever(modelo, b).media - y0) / y0 * 100 };
    });
  };

  // ---------------------------------------------------------------------------
  // Poda: retira neurônios ocultos que quase não contribuem
  // para a saída. Contribuição de um neurônio = |peso de saída| × média de
  // |ativação| nas amostras. Corta os que ficam abaixo de "limite" (fração
  // da soma) e mede de novo o desempenho — rede menor, mais fácil de explicar.
  // ---------------------------------------------------------------------------
  A.podar = function (modelo, limite) {
    const lim = limite || 0.05;
    const podado = JSON.parse(JSON.stringify({ redes: modelo.redes }));
    let antes = 0, depois = 0;
    const xs = modelo.xs;            // entradas já normalizadas, guardadas no treino
    podado.redes.forEach(function (rede) {
      antes += rede.W2.length;
      const contrib = rede.W2.map(function (w, h) {
        let s = 0;
        xs.forEach(function (x) {
          let z = rede.b1[h];
          for (let k = 0; k < x.length; k++) z += rede.W1[h][k] * x[k];
          s += Math.abs(Math.tanh(z));
        });
        return Math.abs(w) * s / xs.length;
      });
      const total = contrib.reduce(function (s, c) { return s + c; }, 0) || 1;
      const manter = contrib.map(function (c) { return c / total >= lim; });
      if (!manter.some(Boolean)) manter[contrib.indexOf(Math.max.apply(null, contrib))] = true;
      rede.W1 = rede.W1.filter(function (_, h) { return manter[h]; });
      rede.b1 = rede.b1.filter(function (_, h) { return manter[h]; });
      rede.W2 = rede.W2.filter(function (_, h) { return manter[h]; });
      depois += rede.W2.length;
    });
    const novo = Object.assign({}, modelo, { redes: podado.redes });
    const est = modelo.xOriginal.map(function (l) { return A.prever(novo, l).media; });
    const obs = modelo.observado, mo = U.media(obs);
    let sqr = 0, sqt = 0, pct = 0;
    obs.forEach(function (o, i) { sqr += (o - est[i]) ** 2; sqt += (o - mo) ** 2; pct += Math.abs(o - est[i]) / Math.abs(o); });
    novo.estimado = est; novo.R2 = 1 - sqr / sqt; novo.EMP = pct / obs.length;
    novo.sensibilidade = A.sensibilidade(novo);
    novo.poda = { neuroniosAntes: antes, neuroniosDepois: depois, limite: lim, R2antes: modelo.R2, EMPantes: modelo.EMP };
    return novo;
  };

  INF.RNA = A;
})(globalThis.INF = globalThis.INF || {});
````

## motor/10-dados.js
<a id="motor-10-dados-js"></a>

````javascript
/* =============================================================================
   10-dados.js — Projeto, amostras, importação/exportação e gravação
   -----------------------------------------------------------------------------
   O "projeto" é o arquivo de trabalho, em JSON
   aberto (qualquer um lê no Bloco de Notas). Estrutura:

   {
     formato: 'inferencia-nbr', versao: 1,
     projeto:   { nome, autor, tipologia, municipio, dataBase, finalidade },
     config:    { fatorOferta, aplicarFatorOferta, nivelIC, estimativaLn,
                  considerarIntercepto, semente, item1, item3, polo },
     variaveis: [ { nome, tipo, unidade, direcao, permitidas, codigos, descricao } ],
     amostras:  [ { id, habilitada, natureza, data, endereco, bairro,
                    informante, telefone, link, lat, lon, obs,
                    fatorAtualizacao, valores: { nomeVariavel: valor } } ],
     avaliando: { descricao, lat, lon, area, valores: { ... } },
     modelo:    { transf: { nomeVariavel: escala } }   ← o modelo escolhido
   }

   Tipos de variável (ordem de preferência da NBR, da mais objetiva para a
   mais subjetiva): quantitativa → dicotômica → proxy → código ajustado →
   código alocado ("qualitativa" aqui). Mais: dependente, tempo (meses da
   data do evento) e identificação (não entra no cálculo).
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const Dd = {};

  Dd.TIPOS = [
    { id: 'dependente',    rotulo: 'Dependente (y)' },
    { id: 'quantitativa',  rotulo: 'Quantitativa' },
    { id: 'dicotomica',    rotulo: 'Dicotômica (0/1)' },
    { id: 'proxy',         rotulo: 'Proxy' },
    { id: 'qualitativa',   rotulo: 'Código alocado / ajustado' },
    { id: 'tempo',         rotulo: 'Tempo (data do evento)' },
    { id: 'identificacao', rotulo: 'Identificação (não entra)' }
  ];

  // Projeto vazio, com a configuração padrão da Bio Store.
  Dd.novoProjeto = function () {
    return {
      formato: 'inferencia-nbr', versao: 1,
      projeto: { nome: '', autor: '', codigo: '', imovel: '', observacao: '', tipologia: 'Terreno', municipio: '', dataBase: new Date().toISOString().slice(0, 10), finalidade: '' },
      config: {
        fatorOferta: 0.90, aplicarFatorOferta: true, nivelIC: 0.80, estimativaLn: 'mediana',
        considerarIntercepto: true, semente: 12345, item1: 2, item3: 2, polo: { lat: null, lon: null, nome: '' }
      },
      variaveis: [
        { nome: 'VU', tipo: 'dependente', unidade: 'R$/m²', direcao: '', permitidas: [], codigos: {}, descricao: 'Valor unitário' }
      ],
      amostras: [],
      avaliando: { descricao: '', lat: null, lon: null, area: null, valores: {} },
      modelo: { transf: { VU: 'x' } }
    };
  };

  // Garante que um projeto lido de arquivo tem todos os campos.
  Dd.normalizar = function (p) {
    const base = Dd.novoProjeto();
    const r = Object.assign({}, base, p);
    r.projeto = Object.assign({}, base.projeto, p.projeto);
    r.config = Object.assign({}, base.config, p.config);
    r.config.polo = Object.assign({}, base.config.polo, (p.config || {}).polo);
    r.avaliando = Object.assign({}, base.avaliando, p.avaliando);
    r.avaliando.valores = r.avaliando.valores || {};
    r.modelo = Object.assign({ transf: {} }, p.modelo);
    r.variaveis = (p.variaveis || base.variaveis).map(function (v) {
      return Object.assign({ unidade: '', direcao: '', permitidas: [], codigos: {}, descricao: '' }, v);
    });
    r.amostras = (p.amostras || []).map(function (a, i) {
      return Object.assign({ id: i + 1, habilitada: true, natureza: 'oferta', data: '', endereco: '', bairro: '', informante: '', telefone: '', link: '', lat: null, lon: null, obs: '', fatorAtualizacao: 1, valores: {} }, a);
    });
    return r;
  };

  // ---------------------------------------------------------------------------
  // Variáveis
  // ---------------------------------------------------------------------------
  Dd.incluirVariavel = function (proj, nome, tipo) {
    nome = String(nome || '').trim();
    if (!nome) return 'Informe o nome.';
    if (!/^[A-Za-zÀ-ú_][\wÀ-ú]*$/.test(nome)) return 'Use só letras, números e _ (sem espaço).';
    if (proj.variaveis.some(function (v) { return v.nome === nome; })) return 'Já existe variável com esse nome.';
    if (tipo === 'dependente' && proj.variaveis.some(function (v) { return v.tipo === 'dependente'; })) return 'Só pode haver uma dependente.';
    proj.variaveis.push({ nome: nome, tipo: tipo, unidade: '', direcao: '', permitidas: [], codigos: {}, descricao: '' });
    if (tipo !== 'identificacao') proj.modelo.transf[nome] = 'x';
    return null;
  };

  Dd.renomearVariavel = function (proj, antigo, novo) {
    novo = String(novo || '').trim();
    if (!novo || proj.variaveis.some(function (v) { return v.nome === novo; })) return 'Nome inválido ou repetido.';
    const v = proj.variaveis.find(function (x) { return x.nome === antigo; });
    if (!v) return 'Variável não encontrada.';
    v.nome = novo;
    proj.amostras.forEach(function (a) { if (antigo in a.valores) { a.valores[novo] = a.valores[antigo]; delete a.valores[antigo]; } });
    if (antigo in proj.avaliando.valores) { proj.avaliando.valores[novo] = proj.avaliando.valores[antigo]; delete proj.avaliando.valores[antigo]; }
    if (antigo in proj.modelo.transf) { proj.modelo.transf[novo] = proj.modelo.transf[antigo]; delete proj.modelo.transf[antigo]; }
    return null;
  };

  Dd.excluirVariavel = function (proj, nome) {
    proj.variaveis = proj.variaveis.filter(function (v) { return v.nome !== nome; });
    proj.amostras.forEach(function (a) { delete a.valores[nome]; });
    delete proj.avaliando.valores[nome];
    delete proj.modelo.transf[nome];
  };

  // ---------------------------------------------------------------------------
  // Amostras
  // ---------------------------------------------------------------------------
  Dd.proximoId = function (proj) {
    return proj.amostras.reduce(function (m, a) { return Math.max(m, a.id); }, 0) + 1;
  };

  Dd.incluirAmostra = function (proj, dados) {
    const a = Object.assign({ id: Dd.proximoId(proj), habilitada: true, natureza: 'oferta', data: '', endereco: '', bairro: '', informante: '', telefone: '', link: '', lat: null, lon: null, obs: '', fatorAtualizacao: 1, valores: {} }, dados || {});
    proj.amostras.push(a);
    return a;
  };

  // Preenche a variável de tempo (meses entre a data da amostra e a data
  // base do laudo). No avaliando, tempo = 0 (a data base é "hoje").
  Dd.preencherTempo = function (proj, nomeVar) {
    let feitos = 0;
    proj.amostras.forEach(function (a) {
      const m = U.mesesEntre(a.data, proj.projeto.dataBase);
      if (Number.isFinite(m)) { a.valores[nomeVar] = Math.round(m * 10) / 10; feitos++; }
    });
    proj.avaliando.valores[nomeVar] = 0;
    return feitos;
  };

  // Preenche a distância ao polo valorizante (km, Haversine) para toda
  // amostra que tiver latitude/longitude.
  Dd.preencherDistancia = function (proj, nomeVar) {
    const polo = proj.config.polo;
    if (!Number.isFinite(polo.lat) || !Number.isFinite(polo.lon)) return -1;
    let feitos = 0;
    proj.amostras.forEach(function (a) {
      if (Number.isFinite(a.lat) && Number.isFinite(a.lon)) {
        a.valores[nomeVar] = Math.round(U.distanciaKm(a.lat, a.lon, polo.lat, polo.lon) * 1000) / 1000;
        feitos++;
      }
    });
    const av = proj.avaliando;
    if (Number.isFinite(av.lat) && Number.isFinite(av.lon)) {
      av.valores[nomeVar] = Math.round(U.distanciaKm(av.lat, av.lon, polo.lat, polo.lon) * 1000) / 1000;
    }
    return feitos;
  };

  // ---------------------------------------------------------------------------
  // CSV (Excel salva em CSV com ";" no Brasil)
  // ---------------------------------------------------------------------------
  // Lê CSV respeitando aspas. Detecta o separador (";", "," ou tabulação)
  // pelo que mais aparece na primeira linha.
  Dd.lerCSV = function (texto) {
    texto = texto.replace(/^﻿/, '');                  // tira BOM do Excel
    const primeira = texto.split(/\r?\n/)[0];
    const cands = [';', '\t', ','];
    const sep = cands.reduce(function (melhor, c) {
      return primeira.split(c).length > primeira.split(melhor).length ? c : melhor;
    }, ';');
    const linhas = [];
    let campo = '', linha = [], aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const ch = texto[i];
      if (aspas) {
        if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (ch === '"') aspas = false;
        else campo += ch;
      } else if (ch === '"') aspas = true;
      else if (ch === sep) { linha.push(campo); campo = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && texto[i + 1] === '\n') i++;
        linha.push(campo); campo = '';
        if (linha.some(function (c) { return c.trim() !== ''; })) linhas.push(linha);
        linha = [];
      } else campo += ch;
    }
    linha.push(campo);
    if (linha.some(function (c) { return c.trim() !== ''; })) linhas.push(linha);
    return { separador: sep, linhas: linhas };
  };

  // Limpa a planilha antes de importar: tira a linha "Unnamed: 0, Unnamed: 1..."
  // que o pandas/Excel às vezes deixa acima do cabeçalho, e tira linhas com
  // no máximo uma célula preenchida (títulos, notas de rodapé, linhas vazias).
  Dd.limparLinhas = function (linhas) {
    let l = linhas.filter(function (li) { return li.filter(function (c) { return String(c).trim() !== ''; }).length > 1; });
    while (l.length && l[0].every(function (c) { return /^(unnamed:?\s*\d*|)$/i.test(String(c).trim()); })) l = l.slice(1);
    return l;
  };

  // Campos de identificação que o importador reconhece pelo nome da coluna.
  const CAMPOS_ID = {
    endereco: /^(endere[cç]o|localiza|logradouro|refer)/i,
    bairro: /^(bairro|zona|localidade)/i,
    informante: /^(informante|fonte|imobili|corretor|anunciante)/i,
    telefone: /^(telefone|fone|contato|whats)/i,
    link: /^(link|url|site)/i,
    data: /^(data)/i,
    natureza: /^(natureza|oferta|transa|tipo.?de.?dado)/i,
    lat: /^(lat)/i,
    lon: /^(lon|lng)/i,
    obs: /^(obs|observa)/i
  };

  // Importa as linhas para o projeto. "mapa" diz, para cada coluna do CSV,
  // se ela vira um campo de identificação, uma variável ou é ignorada.
  // Se não vier mapa, monta um automático pelo nome do cabeçalho.
  Dd.mapaAutomatico = function (proj, cabecalho) {
    return cabecalho.map(function (col) {
      const nome = col.trim();
      const v = proj.variaveis.find(function (x) { return x.nome.toLowerCase() === nome.toLowerCase(); });
      if (v) return { destino: 'variavel', nome: v.nome };
      for (const campo in CAMPOS_ID) if (CAMPOS_ID[campo].test(nome)) return { destino: 'campo', nome: campo };
      return { destino: 'ignorar', nome: nome };
    });
  };

  Dd.importarLinhas = function (proj, linhas, mapa) {
    let qtd = 0;
    linhas.forEach(function (l) {
      const a = Dd.incluirAmostra(proj, {});
      mapa.forEach(function (m, c) {
        const bruto = (l[c] || '').trim();
        if (m.destino === 'variavel') a.valores[m.nome] = U.lerNumero(bruto);
        else if (m.destino === 'campo') {
          if (m.nome === 'lat' || m.nome === 'lon') a[m.nome] = U.lerNumero(bruto);
          else if (m.nome === 'natureza') a.natureza = /transa|itbi|venda\s*efet/i.test(bruto) ? 'transacao' : 'oferta';
          else if (m.nome === 'data') a.data = Dd.dataIso(bruto);
          else a[m.nome] = bruto;
        }
      });
      qtd++;
    });
    return qtd;
  };

  // Converte "15/08/2026" ou "2026-08-15" em "2026-08-15".
  Dd.dataIso = function (s) {
    s = String(s || '').trim();
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      const ano = m[3].length === 2 ? '20' + m[3] : m[3];
      return ano + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[0] : '';
  };

  // Exporta as amostras em CSV com ";" e vírgula decimal (abre direto no
  // Excel brasileiro e volta pelo importador sem ajuste).
  Dd.exportarCSV = function (proj) {
    const vars = proj.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    const cab = ['Nº', 'Habilitada', 'Natureza', 'Data', 'Endereço', 'Bairro', 'Informante', 'Telefone', 'Link', 'Latitude', 'Longitude', 'Observação']
      .concat(vars.map(function (v) { return v.nome; }));
    const q = function (s) { s = String(s === null || s === undefined ? '' : s); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const num = function (v) { return Number.isFinite(v) ? String(v).replace('.', ',') : ''; };
    const linhas = [cab.map(q).join(';')];
    proj.amostras.forEach(function (a) {
      linhas.push([a.id, a.habilitada === false ? 'não' : 'sim', a.natureza === 'transacao' ? 'transação' : 'oferta', a.data, a.endereco, a.bairro, a.informante, a.telefone, a.link, num(a.lat), num(a.lon), a.obs]
        .map(q).concat(vars.map(function (v) { return num(U.lerNumero(a.valores[v.nome])); })).join(';'));
    });
    return '﻿' + linhas.join('\r\n');
  };

  // ---------------------------------------------------------------------------
  // Gravação
  // ---------------------------------------------------------------------------
  // Autossalvamento local (conveniência: se o navegador fechar, não perde).
  // O arquivo "oficial" do laudo é o .json baixado pelo botão Salvar.
  const CHAVE = 'inferencia-nbr:projeto';
  const CHAVE_ANTERIOR = 'inferencia-nbr:anterior';
  // Rede de segurança: quando o projeto guardado é OUTRO (nome ou conteúdo
  // diferente), a versão que estava lá vai para "anterior" antes de ser
  // substituída — dá para recuperar pelo botão da aba Projeto.
  Dd.salvarLocal = function (proj) {
    try {
      const atual = localStorage.getItem(CHAVE);
      if (atual) {
        const a = JSON.parse(atual);
        const outro = (a.projeto && a.projeto.nome) !== proj.projeto.nome || (a.amostras || []).length > proj.amostras.length + 5;
        if (outro && (a.amostras || []).length) localStorage.setItem(CHAVE_ANTERIOR, atual);
      }
      localStorage.setItem(CHAVE, JSON.stringify(proj));
      return true;
    } catch (e) { return false; }
  };
  Dd.lerAnterior = function () {
    try { const s = localStorage.getItem(CHAVE_ANTERIOR); return s ? Dd.normalizar(JSON.parse(s)) : null; } catch (e) { return null; }
  };
  Dd.lerLocal = function () {
    try { const s = localStorage.getItem(CHAVE); return s ? Dd.normalizar(JSON.parse(s)) : null; } catch (e) { return null; }
  };

  // Dispara o download de um arquivo gerado na hora (JSON, CSV, HTML).
  Dd.baixar = function (nomeArquivo, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  INF.Dados = Dd;
})(globalThis.INF = globalThis.INF || {});
````

## motor/11-operar-variaveis.js
<a id="motor-11-operar-variaveis-js"></a>

````javascript
/* =============================================================================
   11-operar-variaveis.js — Operar variáveis
   -----------------------------------------------------------------------------
   Cria uma coluna nova a partir de uma fórmula com as colunas existentes.
   Exemplos:
        VU        = VT / Area
        VU_ha     = Valor / Area_ha
        Frente_Pr = Frente / Profundidade
        Idade     = 2026 - Ano
        Dummy_Pav = Acesso >= 3          (vira 1 ou 0)

   Sem eval(): a fórmula é lida por um analisador próprio (descida recursiva),
   que só entende números, nomes de variáveis, + − × ÷ ^, comparações,
   parênteses e as funções ln, log, exp, raiz/sqrt, abs, min, max.
   Assim uma fórmula maliciosa num arquivo de projeto não executa nada.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const O = {};

  // Quebra a fórmula em pedaços (números, nomes, operadores, parênteses).
  function tokens(txt) {
    const r = [];
    const re = /\s*(\d+(?:[.,]\d+)?|[A-Za-zÀ-ú_][\wÀ-ú]*|>=|<=|==|!=|[-+*/^(),<>])/y;
    let m, pos = 0;
    while (pos < txt.length) {
      re.lastIndex = pos;
      m = re.exec(txt);
      if (!m) {
        if (/^\s*$/.test(txt.slice(pos))) break;
        throw new Error('Não entendi a fórmula perto de: "' + txt.slice(pos, pos + 10) + '"');
      }
      r.push(m[1]); pos = re.lastIndex;
    }
    return r;
  }

  const FUNCOES = {
    ln: Math.log, log: Math.log10, exp: Math.exp, raiz: Math.sqrt, sqrt: Math.sqrt,
    abs: Math.abs, min: Math.min, max: Math.max
  };

  // Compila a fórmula numa função (valores) → número.
  O.compilar = function (formula) {
    const tk = tokens(formula);
    let i = 0;
    const ver = function () { return tk[i]; };
    const pegar = function (esperado) {
      if (esperado && tk[i] !== esperado) throw new Error('Esperava "' + esperado + '"');
      return tk[i++];
    };

    // gramática, da menor para a maior precedência:
    // comparacao → soma → produto → potencia → unario → atomo
    function comparacao() {
      let a = soma();
      while (['>', '<', '>=', '<=', '==', '!='].indexOf(ver()) >= 0) {
        const op = pegar(), b = soma(), fa = a;
        a = function (v) {
          const x = fa(v), y = b(v);
          switch (op) { case '>': return x > y ? 1 : 0; case '<': return x < y ? 1 : 0; case '>=': return x >= y ? 1 : 0;
            case '<=': return x <= y ? 1 : 0; case '==': return x === y ? 1 : 0; default: return x !== y ? 1 : 0; }
        };
      }
      return a;
    }
    function soma() {
      let a = produto();
      while (ver() === '+' || ver() === '-') {
        const op = pegar(), b = produto(), fa = a;
        a = op === '+' ? function (v) { return fa(v) + b(v); } : function (v) { return fa(v) - b(v); };
      }
      return a;
    }
    function produto() {
      let a = potencia();
      while (ver() === '*' || ver() === '/') {
        const op = pegar(), b = potencia(), fa = a;
        a = op === '*' ? function (v) { return fa(v) * b(v); } : function (v) { return fa(v) / b(v); };
      }
      return a;
    }
    function potencia() {
      const a = unario();
      if (ver() === '^') { pegar(); const b = potencia(); return function (v) { return Math.pow(a(v), b(v)); }; }
      return a;
    }
    function unario() {
      if (ver() === '-') { pegar(); const a = unario(); return function (v) { return -a(v); }; }
      if (ver() === '+') { pegar(); return unario(); }
      return atomo();
    }
    function atomo() {
      const t = pegar();
      if (t === undefined) throw new Error('Fórmula incompleta');
      if (t === '(') { const a = comparacao(); pegar(')'); return a; }
      if (/^\d/.test(t)) { const n = parseFloat(t.replace(',', '.')); return function () { return n; }; }
      const f = FUNCOES[t.toLowerCase()];
      if (f && ver() === '(') {
        pegar('(');
        const args = [comparacao()];
        while (ver() === ',') { pegar(); args.push(comparacao()); }
        pegar(')');
        return function (v) { return f.apply(null, args.map(function (g) { return g(v); })); };
      }
      // nome de variável
      return function (v) { return U.lerNumero(v[t]); };
    }

    const raiz = comparacao();
    if (i < tk.length) throw new Error('Sobrou algo no fim da fórmula: "' + tk.slice(i).join(' ') + '"');
    return raiz;
  };

  // Cria (ou recalcula) a variável "nome" em todas as amostras e no avaliando.
  O.operar = function (proj, nome, tipo, formula) {
    let fn;
    try { fn = O.compilar(formula); } catch (e) { return { erro: e.message }; }
    if (!proj.variaveis.some(function (v) { return v.nome === nome; })) {
      const err = INF.Dados.incluirVariavel(proj, nome, tipo);
      if (err) return { erro: err };
    }
    const v = proj.variaveis.find(function (x) { return x.nome === nome; });
    v.descricao = v.descricao || ('= ' + formula);
    let ok = 0;
    proj.amostras.forEach(function (a) {
      const r = fn(a.valores);
      a.valores[nome] = Number.isFinite(r) ? r : NaN;
      if (Number.isFinite(r)) ok++;
    });
    const ra = fn(proj.avaliando.valores);
    if (Number.isFinite(ra)) proj.avaliando.valores[nome] = ra;
    return { ok: ok, total: proj.amostras.length };
  };

  INF.Operar = O;
})(globalThis.INF = globalThis.INF || {});
````

## motor/12-pesquisa-mercado.js
<a id="motor-12-pesquisa-mercado-js"></a>

````javascript
/* =============================================================================
   12-pesquisa-mercado.js — Pesquisa de ofertas e transações
   -----------------------------------------------------------------------------
   O que este módulo faz e o que ele NÃO faz:

   · FAZ: abre a busca pronta nos portais (Google restrito ao site, porque
     os endereços internos dos portais mudam toda hora), com tipo de imóvel,
     finalidade e município já preenchidos.
   · FAZ: lê o texto de um anúncio copiado (Ctrl+A, Ctrl+C na página) e
     extrai preço, área, telefone, quartos, vagas e link, calculando o VU.
     O avaliador confere e grava como amostra, com natureza "oferta".
   · FAZ: importa transações (ITBI da prefeitura, cartório, SIMIL) por CSV,
     com natureza "transação" — sem fator de oferta.
   · NÃO FAZ: raspagem automática dos portais. Os termos de uso de ZAP,
     VivaReal, OLX e similares proíbem, os sites bloqueiam, e amostra de
     laudo precisa ser conferida por gente (telefone, visita, foto). A
     automação cega é justamente o que gera amostra falsa em laudo.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const PM = {};

  // Portais e fontes. "site" vai no operador site: do Google.
  PM.PORTAIS = [
    { nome: 'ZAP Imóveis',      site: 'zapimoveis.com.br',    uso: 'urbano e rural' },
    { nome: 'VivaReal',         site: 'vivareal.com.br',      uso: 'urbano' },
    { nome: 'OLX',              site: 'olx.com.br',           uso: 'urbano e rural (particular)' },
    { nome: 'Imovelweb',        site: 'imovelweb.com.br',     uso: 'urbano e rural' },
    { nome: 'Chaves na Mão',    site: 'chavesnamao.com.br',   uso: 'urbano e rural' },
    { nome: 'QuintoAndar',      site: 'quintoandar.com.br',   uso: 'urbano (grandes cidades)' },
    { nome: 'Leilões Caixa',    site: 'venda-imoveis.caixa.gov.br', uso: 'referência (não é mercado livre)' },
    { nome: 'MF Rural',         site: 'mfrural.com.br',       uso: 'rural' },
    { nome: 'Imóveis Rurais',   site: 'imoveisrurais.com.br', uso: 'rural' }
  ];

  // Fontes de transação/referência (acesso manual, conforme cada órgão).
  PM.FONTES_TRANSACAO = [
    { nome: 'ITBI da prefeitura', obs: 'Pedir base de transações ao setor de tributos; conferir subdeclaração.' },
    { nome: 'Cartório de Registro de Imóveis', obs: 'Valor declarado na escritura/matrícula.' },
    { nome: 'SIMIL / Caixa', obs: 'Base de laudos da Caixa, para quem é credenciado.' },
    { nome: 'INCRA — Planilha de Preços Referenciais (PPR)', obs: 'Rural: preços de terra por região (referência, não amostra).' },
    { nome: 'IEA-SP / EMATER / Deral-PR', obs: 'Rural: levantamentos periódicos de preço de terra.' },
    { nome: 'FipeZAP', obs: 'Urbano: índice de preço anunciado para atualização temporal.' }
  ];

  // Monta a URL de busca no Google restrita a um portal.
  PM.urlBusca = function (portal, tipo, finalidade, municipio, uf) {
    const termos = [tipo, finalidade, municipio, uf].filter(Boolean).join(' ');
    return 'https://www.google.com/search?q=' + encodeURIComponent('site:' + portal.site + ' ' + termos);
  };

  // ---------------------------------------------------------------------------
  // Extração de dados do texto de um anúncio
  // ---------------------------------------------------------------------------
  // Procura padrões comuns: "R$ 3.440.000", "172 ha", "450 m²", "3 quartos",
  // "2 vagas", telefones com DDD. Quando há vários preços (condomínio, IPTU),
  // fica com o MAIOR, que é o preço de venda. Área: prefere "ha"/"alqueire"
  // no rural e "m²" no urbano; o avaliador corrige o que precisar.
  PM.extrairAnuncio = function (texto, urlOpcional) {
    const t = String(texto || '').replace(/ /g, ' ');
    const r = { preco: NaN, area: NaN, unidadeArea: '', quartos: NaN, vagas: NaN, telefone: '', link: urlOpcional || '', vu: NaN, avisos: [] };

    // preços
    const precos = [];
    // "milhão/milhões/mi" antes de "mil" (senão "milhões" casa como "mil")
    const rePreco = /R\$\s*([\d.]+(?:,\d{1,2})?)\s*(milh[õo]es|milh[ãa]o|mil|mi)?/gi;
    let m;
    while ((m = rePreco.exec(t))) {
      let v = U.lerNumero(m[1]);
      if (m[2]) v *= /^mil$/i.test(m[2]) ? 1e3 : 1e6;
      if (Number.isFinite(v)) precos.push(v);
    }
    if (precos.length) r.preco = Math.max.apply(null, precos);
    if (precos.length > 1) r.avisos.push('Achei ' + precos.length + ' valores em R$; usei o maior (' + U.fmtMoeda(r.preco) + '). Confira.');

    // área em hectare / alqueire / m²
    const ha = t.match(/([\d.]+(?:,\d+)?)\s*(ha|hectares?)\b/i);
    const alq = t.match(/([\d.]+(?:,\d+)?)\s*(alqueires?)(\s*(mineiros?|paulistas?|goianos?|baianos?))?/i);
    const m2s = [];
    const reM2 = /([\d.]+(?:,\d+)?)\s*(m²|m2|metros\s*quadrados)/gi;
    while ((m = reM2.exec(t))) { const v = U.lerNumero(m[1]); if (Number.isFinite(v)) m2s.push(v); }
    if (ha) { r.area = U.lerNumero(ha[1]); r.unidadeArea = 'ha'; }
    else if (alq) {
      // alqueire mineiro/goiano = 4,84 ha; paulista = 2,42 ha; baiano = 9,68 ha
      const tipo = (alq[4] || '').toLowerCase();
      const fator = /paulista/.test(tipo) ? 2.42 : /baiano/.test(tipo) ? 9.68 : 4.84;
      r.area = U.lerNumero(alq[1]) * fator; r.unidadeArea = 'ha';
      r.avisos.push('Área em alqueire convertida com ' + U.fmt(fator, 2) + ' ha/alqueire' + (tipo ? ' (' + tipo + ')' : ' (mineiro, padrão)') + '. Confirme o tipo de alqueire.');
    } else if (m2s.length) {
      // vários m²: normalmente área útil, total, terreno. Fica com o maior
      // e avisa (o avaliador escolhe qual é a certa para a variável).
      r.area = Math.max.apply(null, m2s); r.unidadeArea = 'm²';
      if (m2s.length > 1) r.avisos.push('Várias áreas em m² (' + m2s.map(function (v) { return U.fmt(v, 0); }).join(', ') + '); usei a maior.');
    }

    const q = t.match(/(\d+)\s*(quartos?|dormit[óo]rios?|dorms?)/i); if (q) r.quartos = +q[1];
    const vg = t.match(/(\d+)\s*(vagas?)/i); if (vg) r.vagas = +vg[1];
    const tel = t.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/); if (tel) r.telefone = tel[0].trim();
    if (!r.link) { const u = t.match(/https?:\/\/\S+/); if (u) r.link = u[0]; }

    if (Number.isFinite(r.preco) && Number.isFinite(r.area) && r.area > 0) r.vu = r.preco / r.area;
    if (!Number.isFinite(r.preco)) r.avisos.push('Não achei o preço.');
    if (!Number.isFinite(r.area)) r.avisos.push('Não achei a área.');
    return r;
  };

  INF.Pesquisa = PM;
})(globalThis.INF = globalThis.INF || {});
````

## motor/13-graficos.js
<a id="motor-13-graficos-js"></a>

````javascript
/* =============================================================================
   13-graficos.js — Gráficos em SVG puro
   -----------------------------------------------------------------------------
   Sem biblioteca: cada gráfico é um texto SVG montado aqui. Vantagens:
   funciona sem internet, sai idêntico na tela e no relatório impresso, e dá
   para ler cada traço no código.

   Gráficos (os mesmos que o laudo pede):
     dispersao()   → observado × estimado (com a reta de 45°), variável × y,
                     resíduos × estimado (com faixas de ±2σ)
     histograma()  → resíduos padronizados com a curva normal por cima
     qq()          → gráfico Q-Q normal (quantis teóricos × observados)

   As cores vêm de variáveis CSS (--g-ponto, --g-linha...) para respeitar o
   tema claro/escuro. No relatório impresso o CSS define cores fixas.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, D = INF.Dist;
  const G = {};

  const LARG = 460, ALT = 320;
  const MARG = { e: 62, d: 16, t: 30, b: 46 };

  // "Escala bonita": acha limites e passos redondos para os eixos.
  function eixo(min, max, divisoes) {
    if (min === max) { min -= 1; max += 1; }
    const bruto = (max - min) / (divisoes || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
    const passo = [1, 2, 2.5, 5, 10].map(function (f) { return f * mag; }).find(function (p) { return p >= bruto; });
    const ini = Math.floor(min / passo) * passo, fim = Math.ceil(max / passo) * passo;
    const marcas = [];
    for (let v = ini; v <= fim + passo / 2; v += passo) marcas.push(+v.toPrecision(12));
    return { min: ini, max: fim, marcas: marcas };
  }

  // Moldura comum: fundo, grade, eixos, rótulos e título.
  function moldura(ex, ey, titulo, rotX, rotY) {
    const w = LARG - MARG.e - MARG.d, h = ALT - MARG.t - MARG.b;
    const sx = function (v) { return MARG.e + (v - ex.min) / (ex.max - ex.min) * w; };
    const sy = function (v) { return MARG.t + h - (v - ey.min) / (ey.max - ey.min) * h; };
    let s = '';
    ex.marcas.forEach(function (v) {
      s += '<line class="g-grade" x1="' + sx(v) + '" y1="' + MARG.t + '" x2="' + sx(v) + '" y2="' + (MARG.t + h) + '"/>';
      s += '<text class="g-texto" x="' + sx(v) + '" y="' + (MARG.t + h + 16) + '" text-anchor="middle">' + U.fmtAuto(v) + '</text>';
    });
    ey.marcas.forEach(function (v) {
      s += '<line class="g-grade" x1="' + MARG.e + '" y1="' + sy(v) + '" x2="' + (MARG.e + w) + '" y2="' + sy(v) + '"/>';
      s += '<text class="g-texto" x="' + (MARG.e - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + U.fmtAuto(v) + '</text>';
    });
    s += '<rect class="g-borda" x="' + MARG.e + '" y="' + MARG.t + '" width="' + w + '" height="' + h + '"/>';
    s += '<text class="g-titulo" x="' + (LARG / 2) + '" y="18" text-anchor="middle">' + U.esc(titulo) + '</text>';
    s += '<text class="g-texto" x="' + (MARG.e + w / 2) + '" y="' + (ALT - 8) + '" text-anchor="middle">' + U.esc(rotX) + '</text>';
    s += '<text class="g-texto" transform="translate(14,' + (MARG.t + h / 2) + ') rotate(-90)" text-anchor="middle">' + U.esc(rotY) + '</text>';
    return { svg: s, sx: sx, sy: sy, w: w, h: h };
  }

  function envelope(conteudo, rotuloAcessivel) {
    return '<svg class="grafico" viewBox="0 0 ' + LARG + ' ' + ALT + '" role="img" aria-label="' + U.esc(rotuloAcessivel) + '" xmlns="http://www.w3.org/2000/svg">' + conteudo + '</svg>';
  }

  // ---------------------------------------------------------------------------
  // Dispersão
  // pontos: [{ x, y, rotulo, destaque }]
  // opcoes: { titulo, rotX, rotY, linha45, faixas2s }
  // ---------------------------------------------------------------------------
  G.dispersao = function (pontos, opcoes) {
    const op = opcoes || {};
    const xs = pontos.map(function (p) { return p.x; }), ys = pontos.map(function (p) { return p.y; });
    let xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    let ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    if (op.linha45) { xmin = ymin = Math.min(xmin, ymin); xmax = ymax = Math.max(xmax, ymax); }
    if (op.faixas2s) { ymin = Math.min(ymin, -2.5); ymax = Math.max(ymax, 2.5); }
    const ex = eixo(xmin, xmax), ey = eixo(ymin, ymax);
    const f = moldura(ex, ey, op.titulo || '', op.rotX || '', op.rotY || '');
    let s = f.svg;
    if (op.linha45) {
      s += '<line class="g-linha" x1="' + f.sx(ex.min) + '" y1="' + f.sy(ex.min) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(ex.max) + '"/>';
    }
    if (op.faixas2s) {
      [-2, 0, 2].forEach(function (v) {
        s += '<line class="' + (v === 0 ? 'g-linha' : 'g-limite') + '" x1="' + f.sx(ex.min) + '" y1="' + f.sy(v) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(v) + '"/>';
      });
    }
    pontos.forEach(function (p) {
      s += '<circle class="' + (p.destaque ? 'g-ponto-alerta' : 'g-ponto') + '" cx="' + f.sx(p.x) + '" cy="' + f.sy(p.y) + '" r="4">'
        + '<title>' + U.esc((p.rotulo ? 'Amostra ' + p.rotulo + ': ' : '') + U.fmtAuto(p.x) + ' ; ' + U.fmtAuto(p.y)) + '</title></circle>';
      if (op.numerar && p.rotulo !== undefined) {
        s += '<text class="g-num" x="' + (f.sx(p.x) + 6) + '" y="' + (f.sy(p.y) - 5) + '">' + U.esc(p.rotulo) + '</text>';
      }
    });
    return envelope(s, op.titulo || 'gráfico de dispersão');
  };

  // ---------------------------------------------------------------------------
  // Histograma de resíduos padronizados com a curva normal teórica
  // ---------------------------------------------------------------------------
  G.histograma = function (valores, titulo) {
    const n = valores.length;
    const classes = Math.max(5, Math.min(12, Math.round(1 + 3.322 * Math.log10(n))));  // regra de Sturges
    const lim = Math.max(3, Math.ceil(Math.max.apply(null, valores.map(Math.abs))));
    const larg = 2 * lim / classes;
    const cont = new Array(classes).fill(0);
    valores.forEach(function (v) { cont[Math.min(classes - 1, Math.max(0, Math.floor((v + lim) / larg)))]++; });
    const dens = cont.map(function (c) { return c / (n * larg); });       // densidade, para comparar com a curva
    const ex = eixo(-lim, lim), ey = eixo(0, Math.max(0.45, Math.max.apply(null, dens)));
    const f = moldura(ex, ey, titulo || 'Distribuição dos resíduos padronizados', 'resíduo padronizado', 'densidade');
    let s = f.svg;
    dens.forEach(function (d, i) {
      const x0 = -lim + i * larg;
      s += '<rect class="g-barra" x="' + f.sx(x0) + '" y="' + f.sy(d) + '" width="' + (f.sx(x0 + larg) - f.sx(x0) - 1) + '" height="' + (f.sy(0) - f.sy(d)) + '"><title>' + cont[i] + ' resíduo(s)</title></rect>';
    });
    let caminho = '';
    for (let i = 0; i <= 120; i++) {
      const x = -lim + i * (2 * lim / 120);
      const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
      caminho += (i ? 'L' : 'M') + f.sx(x).toFixed(1) + ',' + f.sy(y).toFixed(1);
    }
    s += '<path class="g-curva" d="' + caminho + '"/>';
    return envelope(s, titulo || 'histograma dos resíduos');
  };

  // ---------------------------------------------------------------------------
  // Q-Q normal: se os pontos seguem a reta, os resíduos são normais.
  // ---------------------------------------------------------------------------
  G.qq = function (valores, titulo) {
    const n = valores.length;
    const ord = valores.slice().sort(function (a, b) { return a - b; });
    const pts = ord.map(function (v, i) { return { x: D.normalInv((i + 1 - 0.375) / (n + 0.25)), y: v }; });
    return G.dispersao(pts, { titulo: titulo || 'Gráfico Q-Q normal dos resíduos', rotX: 'quantil teórico', rotY: 'resíduo padronizado', linha45: true });
  };

  // ---------------------------------------------------------------------------
  // Distribuição de frequência de qualquer variável (valores originais)
  // ---------------------------------------------------------------------------
  G.frequencia = function (valores, titulo, rotX) {
    const v = valores.filter(Number.isFinite);
    if (v.length < 2) return '';
    const n = v.length, classes = Math.max(4, Math.min(12, Math.round(1 + 3.322 * Math.log10(n))));
    const min = Math.min.apply(null, v), max = Math.max.apply(null, v);
    const larg = (max - min) / classes || 1;
    const cont = new Array(classes).fill(0);
    v.forEach(function (x) { cont[Math.min(classes - 1, Math.floor((x - min) / larg))]++; });
    const ex = eixo(min, max), ey = eixo(0, Math.max.apply(null, cont));
    const f = moldura(ex, ey, titulo || 'Distribuição de frequência', rotX || '', 'frequência');
    let s = f.svg;
    cont.forEach(function (c, i) {
      const x0 = min + i * larg;
      s += '<rect class="g-barra" x="' + f.sx(x0) + '" y="' + f.sy(c) + '" width="' + Math.max(1, f.sx(x0 + larg) - f.sx(x0) - 1) + '" height="' + (f.sy(0) - f.sy(c)) + '"><title>' + U.fmtAuto(x0) + ' a ' + U.fmtAuto(x0 + larg) + ': ' + c + '</title></rect>';
    });
    return envelope(s, titulo || 'distribuição de frequência');
  };

  // ---------------------------------------------------------------------------
  // Barras por amostra (distância de Cook, alavancagem...) com linha de limite
  // ---------------------------------------------------------------------------
  G.barras = function (itens, titulo, rotY, limite) {
    const vals = itens.map(function (i) { return i.valor; });
    const ex = eixo(0, itens.length + 1, 6), ey = eixo(0, Math.max(Math.max.apply(null, vals), limite || 0));
    const f = moldura(ex, ey, titulo, 'amostra', rotY || '');
    let s = f.svg;
    const w = Math.max(2, (f.sx(1) - f.sx(0)) * 0.7);
    itens.forEach(function (it, i) {
      const x = f.sx(i + 1) - w / 2;
      s += '<rect class="' + (limite && it.valor > limite ? 'g-ponto-alerta' : 'g-barra') + '" x="' + x + '" y="' + f.sy(it.valor) + '" width="' + w + '" height="' + (f.sy(0) - f.sy(it.valor)) + '"><title>Amostra ' + U.esc(it.rotulo) + ': ' + U.fmtAuto(it.valor) + '</title></rect>';
    });
    if (limite) s += '<line class="g-limite" x1="' + f.sx(ex.min) + '" y1="' + f.sy(limite) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(limite) + '"/>';
    return envelope(s, titulo);
  };

  // ---------------------------------------------------------------------------
  // Valor × variável na escala ORIGINAL, com a curva do modelo passando pela
  // média das demais variáveis.
  // ---------------------------------------------------------------------------
  G.curvaModelo = function (modelo, j, prever) {
    const f0 = modelo.faixa[j];
    const pts = modelo.xOriginal.map(function (l, i) { return { x: l[j], y: modelo.yOriginal[i], rotulo: modelo.ids[i] }; });
    const base = modelo.faixa.map(function (f) { return f.media; });
    const curva = [];
    for (let k = 0; k <= 60; k++) {
      const x = f0.min + (f0.max - f0.min) * k / 60;
      const b = base.slice(); b[j] = x;
      const y = prever(modelo, b);
      if (Number.isFinite(y)) curva.push({ x: x, y: y });
    }
    const ys = pts.map(function (p) { return p.y; }).concat(curva.map(function (c) { return c.y; }));
    const ex = eixo(f0.min, f0.max), ey = eixo(Math.min.apply(null, ys), Math.max.apply(null, ys));
    const titulo = modelo.dep.nome + ' × ' + f0.nome + ' (curva do modelo, demais na média)';
    const f = moldura(ex, ey, titulo, f0.nome, modelo.dep.nome);
    let s = f.svg;
    s += '<path class="g-curva" d="' + curva.map(function (c, k) { return (k ? 'L' : 'M') + f.sx(c.x).toFixed(1) + ',' + f.sy(c.y).toFixed(1); }).join('') + '"/>';
    pts.forEach(function (p) {
      s += '<circle class="g-ponto" cx="' + f.sx(p.x) + '" cy="' + f.sy(p.y) + '" r="4"><title>Amostra ' + U.esc(p.rotulo) + ': ' + U.fmtAuto(p.x) + ' ; ' + U.fmtAuto(p.y) + '</title></circle>';
    });
    return envelope(s, titulo);
  };

  // ---------------------------------------------------------------------------
  // Mapa esquemático das amostras (lat/lon) e do avaliando. Sem fundo de mapa
  // (não depende de serviço externo); a escala é a mesma nos dois eixos.
  // ---------------------------------------------------------------------------
  // raioKm (opcional): círculo do raio de pesquisa em volta do avaliando
  G.mapa = function (pontos, avaliando, raioKm) {
    let todos = pontos.concat(avaliando ? [avaliando] : []);
    if (avaliando && raioKm > 0) {
      // o enquadramento inclui o círculo inteiro
      const dLat = raioKm / 111.32, dLon = raioKm / (111.32 * Math.cos(avaliando.lat * Math.PI / 180));
      todos = todos.concat([{ lat: avaliando.lat + dLat, lon: avaliando.lon + dLon }, { lat: avaliando.lat - dLat, lon: avaliando.lon - dLon }]);
    }
    if (!todos.length) return '';
    let latMin = Math.min.apply(null, todos.map(function (p) { return p.lat; })), latMax = Math.max.apply(null, todos.map(function (p) { return p.lat; }));
    let lonMin = Math.min.apply(null, todos.map(function (p) { return p.lon; })), lonMax = Math.max.apply(null, todos.map(function (p) { return p.lon; }));
    // mesma escala em km nos dois eixos (corrige o encolhimento da longitude)
    const kmLat = 111.32, kmLon = 111.32 * Math.cos((latMin + latMax) / 2 * Math.PI / 180);
    const spanKm = Math.max((latMax - latMin) * kmLat, (lonMax - lonMin) * kmLon, 1) * 1.1;
    const cLat = (latMin + latMax) / 2, cLon = (lonMin + lonMax) / 2;
    latMin = cLat - spanKm / kmLat / 2; latMax = cLat + spanKm / kmLat / 2;
    lonMin = cLon - spanKm / kmLon / 2; lonMax = cLon + spanKm / kmLon / 2;
    const ex = eixo(lonMin, lonMax), ey = eixo(latMin, latMax);
    const f = moldura(ex, ey, 'Localização das amostras (' + U.fmt(spanKm, 0) + ' km de lado)', 'longitude', 'latitude');
    let s = f.svg;
    pontos.forEach(function (p) {
      s += '<circle class="' + (p.destaque ? 'g-ponto-alerta' : 'g-ponto') + '" cx="' + f.sx(p.lon) + '" cy="' + f.sy(p.lat) + '" r="4"><title>Amostra ' + U.esc(p.rotulo) + (p.valor ? ': ' + U.fmtAuto(p.valor) : '') + '</title></circle>'
        + '<text class="g-num" x="' + (f.sx(p.lon) + 6) + '" y="' + (f.sy(p.lat) - 5) + '">' + U.esc(p.rotulo) + '</text>';
    });
    if (avaliando && raioKm > 0) {
      const rx = Math.abs(f.sx(avaliando.lon + raioKm / (kmLon)) - f.sx(avaliando.lon));
      s = s.replace('<rect class="g-borda"', '<circle class="g-raio" cx="' + f.sx(avaliando.lon) + '" cy="' + f.sy(avaliando.lat) + '" r="' + rx.toFixed(1) + '"/><rect class="g-borda"');
    }
    if (avaliando) {
      const x = f.sx(avaliando.lon), y = f.sy(avaliando.lat);
      s += '<path class="g-avaliando" d="M' + x + ',' + (y - 8) + 'L' + (x + 7) + ',' + (y + 6) + 'L' + (x - 7) + ',' + (y + 6) + 'Z"><title>Avaliando</title></path>';
    }
    return envelope(s, 'mapa das amostras');
  };

  // Moldura vazia: o gráfico aparece mesmo sem dados, com o aviso do que falta.
  G.vazio = function (titulo, rotX, rotY, motivo) {
    const f = moldura(eixo(0, 10), eixo(0, 10), titulo, rotX || '', rotY || '');
    return envelope(f.svg + '<text class="g-titulo" x="' + (MARG.e + f.w / 2) + '" y="' + (MARG.t + f.h / 2) + '" text-anchor="middle">sem dados ainda</text>'
      + '<text class="g-texto" x="' + (MARG.e + f.w / 2) + '" y="' + (MARG.t + f.h / 2 + 16) + '" text-anchor="middle">' + U.esc(motivo || '') + '</text>', titulo + ' (sem dados)');
  };

  INF.Graficos = G;
})(globalThis.INF = globalThis.INF || {});
````

## motor/14-relatorio.js
<a id="motor-14-relatorio-js"></a>

````javascript
/* =============================================================================
   14-relatorio.js — Relatório estatístico para anexar ao laudo
   -----------------------------------------------------------------------------
   Gera um documento HTML completo e autossuficiente (CSS embutido, gráficos
   em SVG), pronto para imprimir em PDF pelo navegador. Roda igual no
   navegador e no servidor (é só montagem de texto).

   Conteúdo, na ordem em que o laudo costuma apresentar:
     1. Identificação do trabalho
     2. Amostras utilizadas (com natureza, fonte e fator aplicado)
     3. Variáveis, escalas e estatísticas descritivas
     4. Equação do modelo
     5. Resultados: coeficientes, t, Sig, elasticidades, R², F
     6. Pressupostos: normalidade, homocedasticidade, autocorrelação,
        colinearidade, outliers e pontos influentes
     7. Gráficos
     8. Projeção do avaliando, IC 80%, campo de arbítrio
     9. Graus de fundamentação e precisão (Tabelas 1, 2 e 5 da NBR)

   O texto é neutro e técnico; a assinatura é do responsável técnico
   informado no projeto.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, N = INF.NBR, G = INF.Graficos, Rg = INF.Regressao;
  const Rel = {};

  const CSS = [
    'body{font-family:Georgia,"Times New Roman",serif;color:#1d1d1f;max-width:900px;margin:32px auto;padding:0 20px;line-height:1.45;font-size:13px}',
    'h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;border-bottom:1px solid #999;padding-bottom:3px;margin-top:26px}',
    'table{border-collapse:collapse;width:100%;margin:8px 0;font-size:12px}th,td{border:1px solid #bbb;padding:3px 6px;text-align:right}',
    'th{background:#eee}td.t,th.t{text-align:left}.eq{font-family:Consolas,monospace;background:#f5f5f5;padding:8px;border:1px solid #ddd;overflow-wrap:anywhere}',
    '.graf{display:grid;grid-template-columns:1fr 1fr;gap:10px}.graf svg{width:100%;height:auto;border:1px solid #ddd}',
    '.g-grade{stroke:#e3e3e3}.g-borda{fill:none;stroke:#888}.g-texto{font:10px Arial;fill:#444}.g-titulo{font:bold 11px Arial;fill:#222}',
    '.g-ponto{fill:#2d5b8a}.g-ponto-alerta{fill:#c0392b}.g-linha{stroke:#555;stroke-dasharray:4 3}.g-limite{stroke:#c0392b;stroke-dasharray:2 3}',
    '.g-avaliando{fill:#e0a000;stroke:#333}.g-barra{fill:#9db7d3}.g-curva{fill:none;stroke:#c0392b;stroke-width:1.5}.g-num{font:9px Arial;fill:#333}',
    '.pequeno{font-size:11px;color:#555}.assin{margin-top:48px;text-align:center}',
    '@media print{body{margin:0}h2{page-break-after:avoid}table,svg{page-break-inside:avoid}}'
  ].join('\n');

  function tabela(cab, linhas, alinharTexto) {
    let h = '<table><thead><tr>' + cab.map(function (c, i) { return '<th' + (alinharTexto && alinharTexto.indexOf(i) >= 0 ? ' class="t"' : '') + '>' + U.esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    linhas.forEach(function (l) {
      h += '<tr>' + l.map(function (c, i) { return '<td' + (alinharTexto && alinharTexto.indexOf(i) >= 0 ? ' class="t"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }

  // estado: { proj, modelo, diag, projecao }
  Rel.gerar = function (estado) {
    const p = estado.proj, m = estado.modelo, d = estado.diag, pr = estado.projecao;
    if (!m || m.erro) return null;
    const cfg = p.config;
    const hoje = new Date().toLocaleDateString('pt-BR');
    let h = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + U.esc('Tratamento estatístico — ' + (p.projeto.nome || 'avaliação')) + '</title><style>' + CSS + '</style></head><body>';

    // 1. Identificação
    h += '<h1>Tratamento estatístico por inferência</h1>';
    h += '<div class="pequeno">Metodologia: método comparativo direto de dados de mercado, tratamento por regressão linear (ABNT NBR 14.653-2).</div>';
    h += '<h2>1. Identificação</h2>' + tabela(['Campo', 'Informação'], [
      ['Trabalho', U.esc(p.projeto.nome)], ['Responsável técnico', U.esc(p.projeto.autor)],
      ['Tipologia', U.esc(p.projeto.tipologia)], ['Município', U.esc(p.projeto.municipio)],
      ['Finalidade', U.esc(p.projeto.finalidade)], ['Data base', U.esc(p.projeto.dataBase.split('-').reverse().join('/'))]
    ], [0, 1]);

    // 2. Amostras
    const usadas = new Set(m.ids);
    h += '<h2>2. Dados de mercado</h2>';
    h += '<p>Foram levantados ' + p.amostras.length + ' dados, dos quais ' + m.n + ' foram efetivamente utilizados no modelo. ';
    h += cfg.aplicarFatorOferta ? 'Aos dados de oferta aplicou-se fator de oferta de ' + U.fmt(cfg.fatorOferta, 2) + '; às transações, fator unitário.</p>' : 'Não foi aplicado fator de oferta.</p>';
    const nomesVars = [m.dep.nome].concat(m.indep.map(function (v) { return v.nome; }));
    h += tabela(['Nº', 'Uso', 'Natureza', 'Data', 'Endereço / referência', 'Informante'].concat(nomesVars),
      p.amostras.map(function (a) {
        return [a.id, usadas.has(a.id) ? 'sim' : 'não', a.natureza === 'transacao' ? 'transação' : 'oferta', U.esc(a.data ? a.data.split('-').reverse().join('/') : ''), U.esc(a.endereco), U.esc(a.informante)]
          .concat(nomesVars.map(function (nv) { return U.fmtAuto(U.lerNumero(a.valores[nv])); }));
      }), [4, 5]);

    // correções feitas nos dados depois da conferência (rastro para contestação)
    // só alterações nos DADOS (correção, retirada, escala); preenchimento de campo do laudo não entra
    const hist = (p.historico || []).filter(function (r) { return !r.desfeito && ['corrigir', 'desligar', 'escala'].indexOf(r.acao) >= 0; });
    if (hist.length) {
      h += '<p><b>Saneamento dos dados.</b> Após conferência, foram feitas as seguintes alterações, com a respectiva evidência:</p>';
      h += tabela(['Data', 'Amostra', 'Alteração', 'Evidência'], hist.map(function (r) {
        const alt = r.acao === 'desligar' ? 'retirada do cálculo' : (r.acao === 'escala' ? 'escala de ' : '') + U.esc(r.campo) + ': ' + U.esc(r.de) + ' → ' + U.esc(r.para);
        return [r.quando.slice(0, 10).split('-').reverse().join('/'), r.amostra || '—', alt, U.esc(r.evidencia)];
      }), [2, 3]);
    }

    // 3. Variáveis
    h += '<h2>3. Variáveis do modelo</h2>';
    const vDep = p.variaveis.find(function (v) { return v.nome === m.dep.nome; }) || {};
    const linhasVar = [[U.esc(m.dep.nome), 'dependente', U.esc(vDep.descricao || ''), T.porId[m.dep.transf].rotulo, U.fmtAuto(m.faixaY.min), U.fmtAuto(m.faixaY.media), U.fmtAuto(m.faixaY.max)]];
    m.indep.forEach(function (v, j) {
      const def = p.variaveis.find(function (x) { return x.nome === v.nome; }) || {};
      let desc = def.descricao || '';
      const cod = def.codigos && Object.keys(def.codigos).length ? ' (' + Object.keys(def.codigos).map(function (c) { return c + ' = ' + def.codigos[c]; }).join('; ') + ')' : '';
      linhasVar.push([U.esc(v.nome), U.esc(v.tipo), U.esc(desc + cod), T.porId[v.transf].rotulo, U.fmtAuto(m.faixa[j].min), U.fmtAuto(m.faixa[j].media), U.fmtAuto(m.faixa[j].max)]);
    });
    h += tabela(['Variável', 'Tipo', 'Descrição', 'Escala', 'Mínimo', 'Média', 'Máximo'], linhasVar, [0, 1, 2]);

    // 4. Equação
    h += '<h2>4. Equação de regressão</h2><div class="eq">' + U.esc(m.equacao) + '</div>';
    h += '<p class="pequeno">Forma explícita: ' + U.esc(Rg.equacaoExplicita(m)) + '</p>';

    // 5. Resultados
    h += '<h2>5. Resultados estatísticos</h2>';
    const linhasCoef = [['Constante', '—', U.fmtAuto(m.b[0]), U.fmtAuto(m.ep[0]), U.fmt(m.t[0], 3), U.fmtPct(m.sig[0]), '—']];
    m.indep.forEach(function (v, j) {
      const el = m.elasticidade[j];
      linhasCoef.push([U.esc(v.nome), T.porId[v.transf].rotulo, U.fmtAuto(m.b[j + 1]), U.fmtAuto(m.ep[j + 1]), U.fmt(m.t[j + 1], 3), U.fmtPct(m.sig[j + 1]), U.fmt(el.elasticidade, 2) + '%']);
    });
    h += tabela(['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't calculado', 'Significância', 'Elasticidade'], linhasCoef, [0]);
    h += tabela(['Indicador', 'Valor'], [
      ['Dados utilizados (n)', m.n], ['Variáveis independentes (k)', m.p - 1],
      ['Coeficiente de correlação (r)', U.fmt(m.r, 4)], ['Coeficiente de determinação (R²)', U.fmt(m.R2, 4)],
      ['R² ajustado', U.fmt(m.R2aj, 4)], ['Erro padrão da regressão', U.fmtAuto(m.s)],
      ['F calculado', U.fmt(m.F, 3)], ['Significância do modelo (F)', U.fmtPct(m.sigF, 4)],
      ['R² de previsão (PRESS)', U.fmt(d.prev.R2previsao, 4)]
    ], [0]);

    h += '<p><b>Análise de variância.</b></p>' + tabela(['Fonte', 'Soma dos quadrados', 'gl', 'Quadrado médio', 'F', 'Significância'], [
      ['Regressão', U.fmtAuto(m.SQReg), m.glReg, U.fmtAuto(m.SQReg / m.glReg), U.fmt(m.F, 3), U.fmtPct(m.sigF, 4)],
      ['Resíduo', U.fmtAuto(m.SQRes), m.gl, U.fmtAuto(m.s2), '', ''],
      ['Total', U.fmtAuto(m.SQTot), m.n - 1, '', '', '']], [0]);
    const desc = INF.Diag.descritivaProjeto(p);
    h += '<p><b>Estatística descritiva das amostras utilizadas.</b></p>' + tabela(['Variável', 'n', 'Média', 'Mediana', 'Desvio padrão', 'CV', 'Mínimo', 'Máximo'],
      desc.linhas.map(function (x) { return [U.esc(x.nome), x.n, U.fmtAuto(x.media), U.fmtAuto(x.mediana), U.fmtAuto(x.desvio), U.fmtPct(x.cv, 1), U.fmtAuto(x.min), U.fmtAuto(x.max)]; }), [0]);

    // 6. Pressupostos
    h += '<h2>6. Verificação dos pressupostos</h2>';
    h += '<p><b>Normalidade dos resíduos.</b> Distribuição dos resíduos padronizados:</p>';
    h += tabela(['Intervalo', 'Curva normal', 'Modelo'], d.proporcoes.map(function (q) { return [q.faixa, U.fmtPct(q.esperado, 0), U.fmtPct(q.obtido, 0)]; }), [0]);
    h += tabela(['Teste', 'Estatística', 'Valor-p', 'Conclusão a 5%'], [
      ['Shapiro-Wilk', U.fmt(d.sw.estatistica, 4), U.fmtPct(d.sw.p), d.sw.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Kolmogorov-Smirnov (Lilliefors)', U.fmt(d.ks.estatistica, 4), U.fmtPct(d.ks.p), d.ks.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Jarque-Bera', U.fmt(d.jb.estatistica, 4), U.fmtPct(d.jb.p), d.jb.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Breusch-Pagan (homocedasticidade)', U.fmt(d.bp.estatistica, 4), U.fmtPct(d.bp.p), d.bp.p >= 0.05 ? 'variância constante' : 'indício de heterocedasticidade'],
      ['Durbin-Watson (autocorrelação)', U.fmt(d.dw, 3), '—', (d.dw >= 1.5 && d.dw <= 2.5) ? 'sem indício de autocorrelação' : 'verificar ordenação dos dados']
    ], [0, 3]);
    h += '<p><b>Colinearidade.</b> Fatores de inflação da variância: ' + d.vif.map(function (v) { return U.esc(v.nome) + ' = ' + U.fmt(v.vif, 2); }).join('; ') + '.</p>';
    h += '<p><b>Pontos atípicos.</b> ' + (d.outliers.length ? 'Resíduo padronizado acima de 2 desvios nas amostras ' + d.outliers.join(', ') + '.' : 'Nenhum resíduo padronizado acima de 2 desvios.') + ' ';
    h += (d.influentes.length ? 'Distância de Cook superior a 1 nas amostras ' + d.influentes.join(', ') + '.' : 'Nenhuma amostra com distância de Cook superior a 1.') + '</p>';

    // 7. Gráficos
    h += '<h2>7. Gráficos</h2><div class="graf">';
    h += G.dispersao(d.residuos.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id }; }), { titulo: 'Valores observados × estimados', rotX: 'estimado', rotY: 'observado', linha45: true });
    h += G.dispersao(d.residuos.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimados', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true });
    h += G.histograma(d.residuos.map(function (r) { return r.padronizado; }));
    h += G.qq(d.residuos.map(function (r) { return r.padronizado; }));
    h += G.barras(d.residuos.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1);
    h += G.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ')', rotX: 'estimado', rotY: 'observado', linha45: true });
    m.indep.forEach(function (v, j) {
      h += G.curvaModelo(m, j, Rg.prever);
      h += G.frequencia(m.xOriginal.map(function (l) { return l[j]; }), 'Distribuição de ' + v.nome, v.nome);
    });
    h += G.frequencia(m.yOriginal, 'Distribuição de ' + m.dep.nome, m.dep.nome);
    h += '</div>';

    // 8 e 9. Projeção e graus
    if (pr && !pr.erro) {
      h += '<h2>8. Estimativa de valor do imóvel avaliando</h2>';
      h += tabela(['Característica', 'Valor'], m.indep.map(function (v) { return [U.esc(v.nome), U.fmtAuto(U.lerNumero(p.avaliando.valores[v.nome]))]; }), [0]);
      const lin = [
        ['Estimativa central' + (pr.estimativa !== 'direta' ? ' (' + pr.estimativa + ')' : ''), U.fmtAuto(pr.central)],
        ['Intervalo de confiança de 80% — mínimo', U.fmtAuto(pr.icMin) + ' (−' + U.fmtPct(pr.icAbaixo) + ')'],
        ['Intervalo de confiança de 80% — máximo', U.fmtAuto(pr.icMax) + ' (+' + U.fmtPct(pr.icAcima) + ')'],
        ['Amplitude do intervalo', U.fmtPct(pr.amplitude)],
        ['Campo de arbítrio (±15%)', U.fmtAuto(pr.arbitrioMin) + ' a ' + U.fmtAuto(pr.arbitrioMax)]
      ];
      if (pr.area) {
        lin.push(['Área do avaliando', U.fmtAuto(pr.area)]);
        lin.push(['Valor total estimado', U.fmtMoeda(pr.totalCentral) + ' (IC: ' + U.fmtMoeda(pr.totalMin) + ' a ' + U.fmtMoeda(pr.totalMax) + ')']);
      }
      h += tabela(['Resultado', 'Valor'], lin, [0]);

      h += '<h2>9. Especificação da avaliação (NBR 14.653-2)</h2>';
      h += tabela(['Item', 'Descrição', 'Situação', 'Grau', 'Pontos'], pr.fundamentacao.itens.map(function (it) {
        return [it.item, U.esc(it.descricao), U.esc(it.detalhe), N.romano(it.grau), it.pontos];
      }), [1, 2]);
      h += '<p><b>Grau de fundamentação: ' + N.romano(pr.fundamentacao.grau) + '</b> (' + pr.fundamentacao.pontos + ' pontos). ';
      h += '<b>Grau de precisão: ' + N.romano(pr.grauPrecisao) + '</b> (amplitude de ' + U.fmtPct(pr.amplitude) + ').</p>';
      h += '<p class="pequeno">Critérios: ' + U.esc(N.NORMA.referencia) + '.</p>';
    }

    h += '<div class="assin">' + U.esc(p.projeto.municipio ? p.projeto.municipio + ', ' : '') + hoje + '<br><br><br>______________________________________<br>' + U.esc(p.projeto.autor || 'Responsável técnico') + '</div>';
    h += '</body></html>';
    return h;
  };

  INF.Relatorio = Rel;
})(globalThis.INF = globalThis.INF || {});
````

## motor/15-conferencia.js
<a id="motor-15-conferencia-js"></a>

````javascript
/* =============================================================================
   15-conferencia.js — Modelo híbrido e conferência das amostras
   -----------------------------------------------------------------------------
   MODELO HÍBRIDO — de onde vêm os dados antes de calcular:
     'meus'     → só as amostras que o engenheiro lançou no projeto
     'sistema'  → só amostras do banco de mercado (as dele de laudos
                  anteriores + as compartilhadas na COON), filtradas por
                  município e tipologia
     'hibrido'  → as dele + as do banco, sem repetir
   As amostras que vêm do banco entram marcadas (origem = 'banco') para o
   laudo dizer de onde saiu cada dado, e podem ser desligadas uma a uma.

   CONFERÊNCIA — duas camadas, nessa ordem:
     1) REGRAS FIXAS (este arquivo, sem IA, resultado sempre igual):
        duplicatas, VU muito fora do conjunto, dado velho, falta de
        informante/data/fonte, área ou valor zerado, oferta sem fator,
        micronumerosidade prevista, poucas amostras para as variáveis.
     2) IA (servidor/conferencia-ia.mjs): lê o conjunto e o modelo e
        aponta incoerências que regra não pega (ex.: "chácara de 2 ha no
        meio de fazendas de 300 ha", "descrição fala em benfeitoria mas o
        código diz sem benfeitoria"). Pode PROPOR correção com a evidência
        (corrigir um campo, tirar amostra do cálculo, trocar escala).
        Nada muda sozinho: cada correção só é aplicada quando o avaliador
        autoriza (aplicarCorrecao), fica no histórico e pode ser desfeita.
        Criar amostra ou inventar valor sem evidência é proibido.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, Rg = INF.Regressao;
  const C = {};

  // ---------------------------------------------------------------------------
  // Converte um registro do banco de mercado em amostra do projeto.
  // "mapa" diz qual variável recebe preço/área/VU; atributos com o mesmo nome
  // de uma variável do projeto entram direto (ex.: atributos.Topo → Topo).
  // ---------------------------------------------------------------------------
  C.registroParaAmostra = function (proj, reg) {
    const dep = Rg.dependente(proj);
    const valores = {};
    const preco = Number(reg.preco), area = Number(reg.area);
    proj.variaveis.forEach(function (v) {
      const nome = v.nome.toLowerCase();
      if (v.tipo === 'dependente') {
        // dependente: VU (preço/área) ou valor total, conforme a unidade dela
        const ehTotal = /^(vt|valor|preco|pre[çc]o)/.test(nome) && !/(vu|unit)/.test(nome);
        valores[v.nome] = ehTotal ? preco : (area > 0 ? preco / area : NaN);
      } else if (/^area|^área/.test(nome) && Number.isFinite(area)) {
        valores[v.nome] = area;
      } else if (reg.atributos && reg.atributos[v.nome] !== undefined) {
        valores[v.nome] = U.lerNumero(reg.atributos[v.nome]);
      }
    });
    return {
      natureza: reg.natureza, data: reg.data_evento || '', endereco: reg.endereco || '', bairro: reg.bairro || '',
      informante: reg.informante || '', telefone: reg.telefone || '', link: reg.link || '',
      lat: reg.lat, lon: reg.lon, obs: 'Banco de mercado' + (reg.compartilhado ? ' (compartilhado)' : ''),
      origem: 'banco', idBanco: reg.id, valores: valores, dependente: dep ? dep.nome : ''
    };
  };

  // Aplica a escolha de origem ao projeto. Devolve quantas entraram/saíram.
  C.aplicarOrigem = function (proj, modo, registrosBanco) {
    // tira do projeto o que veio do banco numa rodada anterior
    const antes = proj.amostras.length;
    proj.amostras = proj.amostras.filter(function (a) { return a.origem !== 'banco'; });
    const removidas = antes - proj.amostras.length;
    // devolve às amostras próprias o liga/desliga que tinham antes do modo 'sistema'
    proj.amostras.forEach(function (a) {
      if (a.habilitadaAntes !== undefined) { a.habilitada = a.habilitadaAntes; delete a.habilitadaAntes; }
    });
    // no modo 'sistema' as próprias ficam guardadas, mas fora do cálculo
    if (modo === 'sistema') proj.amostras.forEach(function (a) { a.habilitadaAntes = a.habilitada; a.habilitada = false; });
    let incluidas = 0;
    if (modo === 'sistema' || modo === 'hibrido') {
      const links = new Set(proj.amostras.map(function (a) { return (a.link || '').trim(); }).filter(Boolean));
      (registrosBanco || []).forEach(function (reg) {
        if (reg.link && links.has(reg.link.trim())) return;       // já está no projeto
        const a = C.registroParaAmostra(proj, reg);
        delete a.dependente;
        INF.Dados.incluirAmostra(proj, a);
        incluidas++;
      });
    }
    proj.config.origemDados = modo;
    return { removidas: removidas, incluidas: incluidas };
  };

  // ---------------------------------------------------------------------------
  // Regra da casa: OFERTA só vale com FONTE (informante) e com TELEFONE ou
  // LINK do anúncio — sem isso ninguém consegue conferir o dado depois.
  // Telefone escrito dentro do campo informante também vale.
  // (Transação não entra nesta regra: a fonte dela é o ITBI/cartório.)
  // ---------------------------------------------------------------------------
  const RE_TELEFONE = /\(?\d{2}\)?\s?9?[\s.]?\d{4}[-\s.]?\d{4}/;
  const FONTE_VAZIA = /^\s*(n[ãa]o\s+informad[oa]|n\/?i|sem\s+informante|a\s+confirmar|-+)?\s*$/i;
  C.ofertaRastreavel = function (a) {
    if (a.natureza !== 'oferta') return { ok: true };
    const temFonte = !FONTE_VAZIA.test(a.informante || '');
    const temLink = /^https?:\/\/\S+/i.test((a.link || '').trim());
    const temTelefone = RE_TELEFONE.test(a.telefone || '') || RE_TELEFONE.test(a.informante || '');
    const falta = [];
    if (!temFonte) falta.push('fonte (informante)');
    if (!temLink && !temTelefone) falta.push('telefone ou link');
    return { ok: falta.length === 0, falta: falta };
  };

  // Tira do cálculo (sem apagar) as ofertas que não cumprem a regra, com
  // registro no histórico — cada uma pode ser desfeita.
  C.desligarSemContato = function (proj) {
    proj.historico = proj.historico || [];
    const ids = [];
    proj.amostras.forEach(function (a) {
      if (a.habilitada === false) return;
      const r = C.ofertaRastreavel(a);
      if (r.ok) return;
      a.habilitada = false;
      ids.push(a.id);
      proj.historico.push({ quando: new Date().toISOString(), autor: proj.projeto.autor || '', origem: 'regra da casa', acao: 'desligar',
        amostra: a.id, campo: null, de: true, para: false, evidencia: 'Oferta sem ' + r.falta.join(' e '), motivo: 'Oferta precisa de fonte e de telefone ou link' });
    });
    return ids;
  };

  // ---------------------------------------------------------------------------
  // Conferência por regras fixas
  // ---------------------------------------------------------------------------
  // Cada achado: { nivel: 'erro'|'alerta'|'info', amostra: id|null, regra, texto }
  C.conferir = function (proj) {
    const achados = [];
    const add = function (nivel, amostra, regra, texto) { achados.push({ nivel: nivel, amostra: amostra, regra: regra, texto: texto }); };
    const dep = Rg.dependente(proj);
    const ativas = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    if (!dep) { add('erro', null, 'dependente', 'Não há variável dependente definida.'); return achados; }

    // 1) preenchimento e identificação (itens 3 da Tabela 1 dependem disso)
    ativas.forEach(function (a) {
      const y = U.lerNumero(a.valores[dep.nome]);
      if (!Number.isFinite(y) || y <= 0) add('erro', a.id, 'valor', 'Valor de ' + dep.nome + ' vazio, zero ou negativo.');
      const rast = C.ofertaRastreavel(a);
      if (!rast.ok) add('erro', a.id, 'rastreavel', 'Oferta sem ' + rast.falta.join(' e ') + ': não pode entrar no cálculo.');
      else if (!a.informante) add('alerta', a.id, 'informante', 'Sem informante (fonte) identificado.');
      if (!a.data) add('alerta', a.id, 'data', 'Sem data do evento.');
      if (!a.endereco && !(Number.isFinite(a.lat) && Number.isFinite(a.lon))) add('alerta', a.id, 'localizacao', 'Sem endereço nem coordenadas.');
      const meses = U.mesesEntre(a.data, proj.projeto.dataBase);
      if (meses > 24) add('alerta', a.id, 'antiga', 'Dado com ' + Math.round(meses) + ' meses em relação à data base: atualizar ou justificar.');
      if (meses < -0.5) add('erro', a.id, 'futura', 'Data do evento posterior à data base.');
      proj.variaveis.forEach(function (v) {
        if (v.tipo === 'dependente' || v.tipo === 'identificacao') return;
        if (proj.modelo.transf[v.nome] === 'fora') return;
        if (!Number.isFinite(U.lerNumero(a.valores[v.nome]))) add('erro', a.id, 'vazio', 'Sem valor em ' + v.nome + '.');
      });
    });

    // 1b) exigências do MODELO de laudo: print/link das ofertas, raio, coordenadas
    if (INF.Modelos) {
      const modelo = INF.Modelos.doProjeto(proj), ex = INF.Modelos.exigencias(modelo), raio = INF.Modelos.raio(proj);
      const av = proj.avaliando, temAv = Number.isFinite(av.lat) && Number.isFinite(av.lon);
      const temPrint = function (a) { return (proj.fotos || []).some(function (f) { return f.alvo === 'print:' + a.id || f.alvo === 'amostra:' + a.id; }); };
      ativas.forEach(function (a) {
        if (ex.printOuLink && a.natureza === 'oferta' && !a.link && !temPrint(a)) add('alerta', a.id, 'print', 'Sem print nem link do anúncio (o modelo "' + modelo.nome + '" exige).');
        const temCoord = Number.isFinite(a.lat) && Number.isFinite(a.lon);
        if (ex.coordenadas && !temCoord) add('alerta', a.id, 'coordenadas', 'Sem coordenadas (o modelo "' + modelo.nome + '" exige, para medir o raio).');
        if (temAv && temCoord) {
          const km = U.distanciaKm(av.lat, av.lon, a.lat, a.lon);
          if (km > raio) add('alerta', a.id, 'raio', 'A ' + U.fmt(km, 1) + ' km do avaliando, além do raio de ' + U.fmt(raio, 0) + ' km: justificar no laudo ou retirar.');
        }
      });
      if (ex.coordenadas && !temAv) add('alerta', null, 'coordenadas', 'Informe latitude e longitude do imóvel avaliando (aba Laudo completo).');
    }

    // 2) duplicatas: mesmo link, ou mesmo valor + mesma área + mesmo informante
    const vistos = {};
    ativas.forEach(function (a) {
      const chaves = [];
      if (a.link) chaves.push('L:' + a.link.trim().toLowerCase());
      const area = proj.variaveis.find(function (v) { return /^area|^área/i.test(v.nome); });
      chaves.push('V:' + U.lerNumero(a.valores[dep.nome]).toFixed(2) + '|' + (area ? U.lerNumero(a.valores[area.nome]) : '') + '|' + (a.informante || '').toLowerCase());
      chaves.forEach(function (k) {
        if (vistos[k] && vistos[k] !== a.id) add('alerta', a.id, 'duplicata', 'Parece repetir a amostra ' + vistos[k] + '.');
        else vistos[k] = a.id;
      });
    });

    // 3) valor muito fora do conjunto (antes de qualquer modelo): regra do
    //    intervalo interquartil sobre ln(y). Não exclui nada, só avisa.
    const ys = ativas.map(function (a) { return { id: a.id, v: Math.log(U.lerNumero(a.valores[dep.nome])) }; })
      .filter(function (o) { return Number.isFinite(o.v); }).sort(function (a, b) { return a.v - b.v; });
    if (ys.length >= 8) {
      const q = function (f) { const i = f * (ys.length - 1), b = Math.floor(i); return ys[b].v + (ys[Math.min(b + 1, ys.length - 1)].v - ys[b].v) * (i - b); };
      const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
      ys.forEach(function (o) {
        if (o.v < q1 - 1.5 * iqr || o.v > q3 + 1.5 * iqr) add('alerta', o.id, 'discrepante', dep.nome + ' muito afastado do conjunto (' + U.fmtAuto(Math.exp(o.v)) + '). Conferir com o informante.');
      });
    }

    // 4) fator de oferta
    const ofertas = ativas.filter(function (a) { return a.natureza === 'oferta'; }).length;
    if (ofertas && !proj.config.aplicarFatorOferta) add('info', null, 'fator', ofertas + ' dado(s) de oferta sem fator de oferta aplicado.');

    // 5) quantidade mínima para as variáveis em uso: 3(k+1) (Grau I)
    const k = Rg.candidatas(proj).filter(function (v) { return proj.modelo.transf[v.nome] && proj.modelo.transf[v.nome] !== 'fora'; }).length;
    if (ativas.length < 3 * (k + 1)) add('erro', null, 'quantidade', ativas.length + ' amostras para ' + k + ' variáveis: mínimo 3(k+1) = ' + 3 * (k + 1) + '.');
    else if (ativas.length < 6 * (k + 1)) add('info', null, 'quantidade', 'Para o Grau III no item 2 seriam ' + 6 * (k + 1) + ' amostras (hoje ' + ativas.length + ').');

    // 6) micronumerosidade prevista nas variáveis de código/dicotômicas
    const minimo = INF.NBR.NORMA.micro(ativas.length);
    Rg.candidatas(proj).forEach(function (v) {
      if ((v.tipo !== 'qualitativa' && v.tipo !== 'dicotomica') || proj.modelo.transf[v.nome] === 'fora') return;
      const cont = {};
      ativas.forEach(function (a) { const c = String(U.lerNumero(a.valores[v.nome])); cont[c] = (cont[c] || 0) + 1; });
      Object.keys(cont).forEach(function (c) {
        if (cont[c] < minimo) add('alerta', null, 'micronumerosidade', v.nome + ' = ' + c + ' aparece em ' + cont[c] + ' amostra(s); mínimo ' + minimo + '. Reagrupar códigos ou coletar mais.');
      });
    });

    // 7) mistura de origens
    const doBanco = ativas.filter(function (a) { return a.origem === 'banco'; }).length;
    if (doBanco) add('info', null, 'origem', doBanco + ' amostra(s) vieram do banco de mercado: confirmar se ainda estão válidas.');

    return achados;
  };

  // Pacote enxuto que vai para a conferência pela IA. Telefone NÃO vai
  // (não é necessário para conferir coerência e é dado pessoal).
  C.pacoteParaIA = function (proj, modelo, achadosRegras) {
    const dep = Rg.dependente(proj);
    return {
      trabalho: { tipologia: proj.projeto.tipologia, municipio: proj.projeto.municipio, dataBase: proj.projeto.dataBase, finalidade: proj.projeto.finalidade },
      variaveis: proj.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; }).map(function (v) {
        return { nome: v.nome, tipo: v.tipo, unidade: v.unidade, direcao: v.direcao, descricao: v.descricao, codigos: v.codigos };
      }),
      amostras: proj.amostras.map(function (a) {
        return { id: a.id, usada: a.habilitada !== false, natureza: a.natureza, data: a.data, endereco: a.endereco, bairro: a.bairro,
          informante: a.informante, origem: a.origem || 'projeto', obs: a.obs, valores: a.valores };
      }),
      avaliando: proj.avaliando.valores,
      modelo: modelo && !modelo.erro ? {
        equacao: modelo.equacao, n: modelo.n, R2: modelo.R2, R2aj: modelo.R2aj, sigF: modelo.sigF,
        coeficientes: modelo.indep.map(function (v, j) { return { nome: v.nome, escala: v.transf, coef: modelo.b[j + 1], sig: modelo.sig[j + 1] }; })
      } : null,
      dependente: dep ? dep.nome : '',
      achadosDasRegras: achadosRegras
    };
  };

  // ---------------------------------------------------------------------------
  // Aplicação de correção AUTORIZADA pelo avaliador
  // ---------------------------------------------------------------------------
  // Só é chamada quando o avaliador clica em "Aplicar" na sugestão. Guarda no
  // histórico do projeto o antes e o depois, quem sugeriu e a evidência —
  // é o rastro que se mostra se o laudo for contestado — e permite desfazer.
  C.aplicarCorrecao = function (proj, apontamento, autor) {
    const c = apontamento.correcao;
    if (!c) return { erro: 'Esta sugestão não tem correção.' };
    proj.historico = proj.historico || [];
    const reg = { quando: new Date().toISOString(), autor: autor || '', origem: 'sugestão conferida', acao: c.acao,
      amostra: apontamento.amostra, campo: c.campo || null, evidencia: c.evidencia || '', motivo: apontamento.texto };

    if (c.acao === 'escala') {
      reg.de = proj.modelo.transf[c.campo] || 'x';
      reg.para = c.para;
      proj.modelo.transf[c.campo] = c.para;
    } else {
      const a = proj.amostras.find(function (x) { return x.id === apontamento.amostra; });
      if (!a) return { erro: 'Amostra ' + apontamento.amostra + ' não existe mais.' };
      if (c.acao === 'desligar') {
        reg.de = a.habilitada !== false; reg.para = false;
        a.habilitada = false;
      } else if (c.acao === 'corrigir') {
        const ehVariavel = proj.variaveis.some(function (v) { return v.nome === c.campo; });
        reg.de = ehVariavel ? (a.valores[c.campo] === undefined ? null : a.valores[c.campo]) : (a[c.campo] === undefined ? null : a[c.campo]);
        reg.para = c.para;
        if (ehVariavel) a.valores[c.campo] = c.para; else a[c.campo] = c.para;
      } else return { erro: 'Ação desconhecida.' };
      // marca na própria amostra, para aparecer no relatório
      a.obs = ((a.obs || '') + ' [' + (c.acao === 'desligar' ? 'retirada do cálculo' : c.campo + ': ' + reg.de + ' → ' + reg.para) + ' em ' + reg.quando.slice(0, 10) + ']').trim();
    }
    proj.historico.push(reg);
    return { ok: true, registro: reg };
  };

  // Desfaz a última alteração do histórico (ou a de índice i).
  C.desfazer = function (proj, i) {
    const h = proj.historico || [];
    const idx = i === undefined ? h.length - 1 : i;
    const reg = h[idx];
    if (!reg || reg.desfeito) return { erro: 'Nada para desfazer.' };
    if (reg.acao === 'escala') proj.modelo.transf[reg.campo] = reg.de;
    else {
      const a = proj.amostras.find(function (x) { return x.id === reg.amostra; });
      if (!a) return { erro: 'Amostra não existe mais.' };
      if (reg.acao === 'desligar') a.habilitada = reg.de;
      else if (proj.variaveis.some(function (v) { return v.nome === reg.campo; })) a.valores[reg.campo] = reg.de;
      else a[reg.campo] = reg.de;
    }
    reg.desfeito = new Date().toISOString();
    return { ok: true };
  };

  INF.Conferencia = C;
})(globalThis.INF = globalThis.INF || {});
````

## motor/16-avancado.js
<a id="motor-16-avancado-js"></a>

````javascript
/* =============================================================================
   16-avancado.js — Ferramentas avançadas
   -----------------------------------------------------------------------------
   Análises clássicas:
     pca()        Componentes principais: quantas "dimensões" reais existem
                  entre variáveis correlacionadas.
     kmedias()    Agrupamento de amostras parecidas (sub-mercados).
     dea()        Data Envelopment Analysis (CCR, orientação a insumo):
                  eficiência relativa de cada amostra (0 a 1).
     (A poda da RNA fica em 09-rna.js → INF.RNA.podar.)

   Novidades usadas hoje em inferência avaliatória:
     boxCox()     Acha a melhor potência para a dependente (λ): diz, com
                  número, se y deve ficar em escala direta, ln, 1/y ou √y.
     bootstrap()  Intervalo de confiança do avaliando por reamostragem dos
                  resíduos — confirma o IC clássico quando há poucas amostras
                  ou resíduos pouco normais.
     robusta()    Regressão robusta de Huber: reduz o peso dos outliers em
                  vez de excluí-los; se os coeficientes mudarem muito em
                  relação ao modelo comum, algum dado está puxando a equação.
     moran()      I de Moran nos resíduos: mede autocorrelação espacial
                  (amostras vizinhas com erros parecidos = localização mal
                  representada no modelo).
   Tudo determinístico (semente fixa onde há sorteio).
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, M = INF.Matriz, D = INF.Dist, Rg = INF.Regressao, T = INF.Transf;
  const A = {};

  // Colunas das variáveis independentes do modelo, em escala original.
  function colunasOriginais(modelo) {
    return modelo.indep.map(function (v, j) { return modelo.xOriginal.map(function (l) { return l[j]; }); });
  }
  function padronizar(col) {
    const m = U.media(col), s = U.desvio(col) || 1;
    return col.map(function (v) { return (v - m) / s; });
  }

  // ---------------------------------------------------------------------------
  // Autovalores/autovetores de matriz simétrica (método de Jacobi)
  // ---------------------------------------------------------------------------
  function jacobi(S) {
    const n = S.length, a = S.map(function (l) { return l.slice(); }), V = M.identidade(n);
    for (let varredura = 0; varredura < 100; varredura++) {
      let fora = 0;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) fora += a[p][q] * a[p][q];
      if (fora < 1e-20) break;
      for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        const t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        const c = 1 / Math.sqrt(t * t + 1), s = t * c;
        for (let k = 0; k < n; k++) {           // gira linhas/colunas p e q
          const akp = a[k][p], akq = a[k][q];
          a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = a[p][k], aqk = a[q][k];
          a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p], vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq; V[k][q] = s * vkp + c * vkq;
        }
      }
    }
    return { valores: a.map(function (l, i) { return l[i]; }), vetores: V };
  }

  // ---------------------------------------------------------------------------
  // PCA sobre as independentes padronizadas
  // ---------------------------------------------------------------------------
  A.pca = function (modelo) {
    const cols = colunasOriginais(modelo).map(padronizar);
    const k = cols.length, n = modelo.n;
    if (k < 2) return { erro: 'PCA precisa de pelo menos duas variáveis independentes.' };
    const R = M.criar(k, k);
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) R[a][b] = M.escalar(cols[a], cols[b]) / (n - 1);
    const e = jacobi(R);
    const ordem = e.valores.map(function (v, i) { return i; }).sort(function (x, y) { return e.valores[y] - e.valores[x]; });
    let acumulado = 0;
    return {
      nomes: modelo.indep.map(function (v) { return v.nome; }),
      componentes: ordem.map(function (i, pos) {
        acumulado += e.valores[i] / k;
        return { componente: 'CP' + (pos + 1), autovalor: e.valores[i], variancia: e.valores[i] / k, acumulada: acumulado,
          cargas: e.vetores.map(function (linha) { return linha[i]; }) };
      })
    };
  };

  // ---------------------------------------------------------------------------
  // K-médias (k-means++ com semente) sobre as independentes padronizadas
  // ---------------------------------------------------------------------------
  A.kmedias = function (modelo, k, semente) {
    const cols = colunasOriginais(modelo).map(padronizar);
    const n = modelo.n, pts = [];
    for (let i = 0; i < n; i++) pts.push(cols.map(function (c) { return c[i]; }));
    const sorteio = U.rng(semente || 12345);
    const dist2 = function (a, b) { let s = 0; for (let j = 0; j < a.length; j++) s += (a[j] - b[j]) ** 2; return s; };
    // k-means++: primeiro centro sorteado, os demais com chance proporcional à distância²
    const centros = [pts[Math.floor(sorteio() * n)].slice()];
    while (centros.length < k) {
      const d = pts.map(function (p) { return Math.min.apply(null, centros.map(function (c) { return dist2(p, c); })); });
      let alvo = sorteio() * d.reduce(function (s, x) { return s + x; }, 0), i = 0;
      while (alvo > d[i] && i < n - 1) { alvo -= d[i]; i++; }
      centros.push(pts[i].slice());
    }
    let grupo = new Array(n).fill(0);
    for (let it = 0; it < 100; it++) {
      const novo = pts.map(function (p) {
        let melhor = 0; centros.forEach(function (c, g) { if (dist2(p, c) < dist2(p, centros[melhor])) melhor = g; }); return melhor;
      });
      const igual = novo.every(function (g, i) { return g === grupo[i]; });
      grupo = novo;
      centros.forEach(function (c, g) {
        const membros = pts.filter(function (_, i) { return grupo[i] === g; });
        if (membros.length) for (let j = 0; j < c.length; j++) c[j] = U.media(membros.map(function (m) { return m[j]; }));
      });
      if (igual && it > 0) break;
    }
    let sqDentro = 0;
    pts.forEach(function (p, i) { sqDentro += dist2(p, centros[grupo[i]]); });
    const resumo = [];
    for (let g = 0; g < k; g++) {
      const idx = grupo.map(function (x, i) { return x === g ? i : -1; }).filter(function (i) { return i >= 0; });
      resumo.push({ grupo: g + 1, amostras: idx.map(function (i) { return modelo.ids[i]; }),
        mediaY: idx.length ? U.media(idx.map(function (i) { return modelo.yOriginal[i]; })) : NaN,
        medias: modelo.indep.map(function (v, j) { return idx.length ? U.media(idx.map(function (i) { return modelo.xOriginal[i][j]; })) : NaN; }) });
    }
    return { k: k, grupos: resumo, sqDentro: sqDentro, porAmostra: modelo.ids.map(function (id, i) { return { id: id, grupo: grupo[i] + 1 }; }) };
  };

  // ---------------------------------------------------------------------------
  // Box-Cox: maximiza a verossimilhança perfilada em λ ∈ [-2, 2]
  // ---------------------------------------------------------------------------
  A.boxCox = function (modelo) {
    const y = modelo.yOriginal;
    if (y.some(function (v) { return !(v > 0); })) return { erro: 'Box-Cox exige dependente positiva.' };
    const n = y.length;
    const lnGeo = U.media(y.map(Math.log));                  // ln da média geométrica
    let melhor = null;
    const curva = [];
    for (let l100 = -200; l100 <= 200; l100 += 5) {
      const lam = l100 / 100;
      // transformação normalizada pela média geométrica (torna os SQ comparáveis)
      const z = y.map(function (v) {
        return Math.abs(lam) < 1e-9 ? Math.exp(lnGeo) * Math.log(v) : (Math.pow(v, lam) - 1) / (lam * Math.pow(Math.exp(lnGeo), lam - 1));
      });
      const aj = Rg.ajustar(modelo.X, z, true);
      if (aj.erro) continue;
      const logv = -n / 2 * Math.log(aj.SQRes / n);
      curva.push({ lambda: lam, logv: logv });
      if (!melhor || logv > melhor.logv) melhor = { lambda: lam, logv: logv };
    }
    // intervalo de 95% para λ: logv ≥ máximo − χ²(1; 0,95)/2
    const corte = melhor.logv - 3.8415 / 2;
    const dentro = curva.filter(function (c) { return c.logv >= corte; }).map(function (c) { return c.lambda; });
    const ic = [Math.min.apply(null, dentro), Math.max.apply(null, dentro)];
    const sugestoes = [[1, 'y (escala direta)', 'x'], [0.5, '√y', 'raiz'], [0, 'ln(y)', 'ln'], [-0.5, '1/√y', '1/raiz'], [-1, '1/y', '1/x'], [2, 'y²', 'x2'], [-2, '1/y²', '1/x2']];
    const aceitas = sugestoes.filter(function (s) { return s[0] >= ic[0] && s[0] <= ic[1]; });
    const maisPerto = sugestoes.slice().sort(function (a, b) { return Math.abs(a[0] - melhor.lambda) - Math.abs(b[0] - melhor.lambda); })[0];
    return { lambda: melhor.lambda, ic95: ic, curva: curva, recomendada: (aceitas[0] || maisPerto), compativeis: aceitas };
  };

  // ---------------------------------------------------------------------------
  // Bootstrap dos resíduos para o intervalo do avaliando
  // ---------------------------------------------------------------------------
  A.bootstrap = function (modelo, valoresAvaliando, opcoes) {
    const op = Object.assign({ B: 1000, nivel: 0.80, semente: 12345 }, opcoes || {});
    const x0 = Rg.preverTransformado(modelo, valoresAvaliando).x0;
    const sorteio = U.rng(op.semente), n = modelo.n;
    // resíduos corrigidos pela alavancagem (reduz o viés de encolhimento)
    const r = modelo.e.map(function (e, i) { return e / Math.sqrt(Math.max(1 - modelo.h[i], 1e-9)); });
    const rm = U.media(r);
    const estimativas = [];
    for (let b = 0; b < op.B; b++) {
      const yb = modelo.yhat.map(function (yh) { return yh + (r[Math.floor(sorteio() * n)] - rm); });
      const aj = Rg.ajustar(modelo.X, yb, true);
      if (aj.erro) continue;
      estimativas.push(T.desfazer(modelo.dep.transf, M.escalar(x0, aj.b)));
    }
    estimativas.sort(function (a, b) { return a - b; });
    const q = function (f) { return estimativas[Math.min(estimativas.length - 1, Math.max(0, Math.round(f * (estimativas.length - 1))))]; };
    const cauda = (1 - op.nivel) / 2;
    const central = T.desfazer(modelo.dep.transf, M.escalar(x0, modelo.b));
    return { B: estimativas.length, central: central, min: q(cauda), max: q(1 - cauda), mediana: q(0.5), amplitude: (q(1 - cauda) - q(cauda)) / central };
  };

  // ---------------------------------------------------------------------------
  // Regressão robusta de Huber (mínimos quadrados reponderados)
  // ---------------------------------------------------------------------------
  A.robusta = function (modelo) {
    const X = modelo.X, y = modelo.y, n = modelo.n, p = modelo.p, c = 1.345;
    let b = modelo.b.slice(), pesos = new Array(n).fill(1);
    for (let it = 0; it < 50; it++) {
      const e = y.map(function (yi, i) { return yi - M.escalar(X[i], b); });
      // escala robusta: desvio absoluto mediano / 0,6745
      const abs = e.map(Math.abs).sort(function (a, b2) { return a - b2; });
      const escala = (abs[Math.floor((n - 1) / 2)] + abs[Math.ceil((n - 1) / 2)]) / 2 / 0.6745 || 1e-12;
      pesos = e.map(function (ei) { const u = Math.abs(ei / escala); return u <= c ? 1 : c / u; });
      // mínimos quadrados ponderados: multiplica cada linha por √peso
      const Xw = X.map(function (l, i) { const w = Math.sqrt(pesos[i]); return l.map(function (v) { return v * w; }); });
      const yw = y.map(function (v, i) { return v * Math.sqrt(pesos[i]); });
      const inv = M.inverter(M.XtX(Xw));
      if (!inv) break;
      const novo = M.multVetor(inv, M.Xty(Xw, yw));
      const mud = Math.max.apply(null, novo.map(function (v, j) { return Math.abs(v - b[j]) / (Math.abs(b[j]) + 1e-12); }));
      b = novo;
      if (mud < 1e-8) break;
    }
    const nomes = ['Constante'].concat(modelo.indep.map(function (v) { return v.nome; }));
    return {
      coeficientes: nomes.map(function (nm, j) { return { nome: nm, comum: modelo.b[j], robusto: b[j], diferenca: (b[j] - modelo.b[j]) / (Math.abs(modelo.b[j]) || 1) }; }),
      pesos: modelo.ids.map(function (id, i) { return { id: id, peso: pesos[i] }; }).filter(function (x) { return x.peso < 0.999; }),
      b: b, p: p
    };
  };

  // ---------------------------------------------------------------------------
  // I de Moran nos resíduos (pesos = 1/distância entre amostras)
  // ---------------------------------------------------------------------------
  A.moran = function (proj, modelo) {
    const porId = {};
    proj.amostras.forEach(function (a) { porId[a.id] = a; });
    const pts = [];
    modelo.ids.forEach(function (id, i) {
      const a = porId[id];
      if (a && Number.isFinite(a.lat) && Number.isFinite(a.lon)) pts.push({ lat: a.lat, lon: a.lon, e: modelo.e[i] });
    });
    const n = pts.length;
    if (n < 8) return { erro: 'Moran precisa de ao menos 8 amostras com latitude e longitude (há ' + n + ').' };
    const W = M.criar(n, n);
    let S0 = 0;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const d = U.distanciaKm(pts[i].lat, pts[i].lon, pts[j].lat, pts[j].lon);
      W[i][j] = 1 / Math.max(d, 0.01);
      S0 += W[i][j];
    }
    const em = U.media(pts.map(function (p) { return p.e; }));
    const z = pts.map(function (p) { return p.e - em; });
    let num = 0, den = 0;
    for (let i = 0; i < n; i++) { den += z[i] * z[i]; for (let j = 0; j < n; j++) num += W[i][j] * z[i] * z[j]; }
    const I = (n / S0) * (num / den);
    // variância sob normalidade (Cliff e Ord)
    let S1 = 0, S2 = 0;
    for (let i = 0; i < n; i++) {
      let li = 0, ci = 0;
      for (let j = 0; j < n; j++) { S1 += (W[i][j] + W[j][i]) ** 2; li += W[i][j]; ci += W[j][i]; }
      S2 += (li + ci) ** 2;
    }
    S1 /= 2;
    const EI = -1 / (n - 1);
    const VI = (n * n * S1 - n * S2 + 3 * S0 * S0) / ((n * n - 1) * S0 * S0) - EI * EI;
    const zI = (I - EI) / Math.sqrt(VI);
    return { I: I, esperado: EI, z: zI, p: 2 * (1 - D.normalCDF(Math.abs(zI))), n: n };
  };

  // ---------------------------------------------------------------------------
  // DEA — modelo CCR, orientação a insumo, forma dos multiplicadores
  // max u·y_o  s.a.  v·x_o = 1 ;  u·y_j − v·x_j ≤ 0 ;  u, v ≥ 0
  // Resolvido por simplex com "M grande" na restrição de igualdade.
  // insumos/produtos: nomes de variáveis (valores originais, todos > 0).
  // ---------------------------------------------------------------------------
  function simplexMax(c, A2, b, igualdade) {
    // tableau: variáveis originais + folgas das ≤ + 1 artificial (igualdade)
    const m = A2.length, nv = c.length, BIG = 1e6;
    const cols = nv + m + 1;
    const tab = [];
    for (let i = 0; i < m; i++) {
      const linha = new Array(cols + 1).fill(0);
      for (let j = 0; j < nv; j++) linha[j] = A2[i][j];
      if (i === igualdade) linha[nv + m] = 1; else linha[nv + i] = 1;
      linha[cols] = b[i];
      tab.push(linha);
    }
    const base = []; for (let i = 0; i < m; i++) base.push(i === igualdade ? nv + m : nv + i);
    const custo = new Array(cols).fill(0);
    for (let j = 0; j < nv; j++) custo[j] = c[j];
    custo[nv + m] = -BIG;
    for (let it = 0; it < 500; it++) {
      // custo reduzido de cada coluna
      let entra = -1, melhor = 1e-9;
      for (let j = 0; j < cols; j++) {
        let z = 0; for (let i = 0; i < m; i++) z += custo[base[i]] * tab[i][j];
        const red = custo[j] - z;
        if (red > melhor) { melhor = red; entra = j; }
      }
      if (entra < 0) break;
      let sai = -1, razao = Infinity;
      for (let i = 0; i < m; i++) if (tab[i][entra] > 1e-12) { const r = tab[i][cols] / tab[i][entra]; if (r < razao - 1e-12) { razao = r; sai = i; } }
      if (sai < 0) return null;                 // ilimitado (não ocorre no CCR)
      const piv = tab[sai][entra];
      for (let j = 0; j <= cols; j++) tab[sai][j] /= piv;
      for (let i = 0; i < m; i++) if (i !== sai) {
        const f = tab[i][entra]; if (f === 0) continue;
        for (let j = 0; j <= cols; j++) tab[i][j] -= f * tab[sai][j];
      }
      base[sai] = entra;
    }
    const x = new Array(nv).fill(0);
    base.forEach(function (bj, i) { if (bj < nv) x[bj] = tab[i][cols]; });
    return x;
  }

  A.dea = function (proj, insumos, produtos) {
    const ativas = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    const val = function (a, nome) { return nome === '__dep__' ? Rg.valorDependente(proj, a, Rg.dependente(proj).nome) : U.lerNumero(a.valores[nome]); };
    const linhas = ativas.map(function (a) {
      return { id: a.id, x: insumos.map(function (nm) { return val(a, nm); }), y: produtos.map(function (nm) { return val(a, nm); }) };
    }).filter(function (l) { return l.x.concat(l.y).every(function (v) { return v > 0; }); });
    if (linhas.length < 3) return { erro: 'DEA precisa de valores positivos em todas as variáveis escolhidas.' };
    // normaliza cada coluna pelo máximo (estabilidade numérica)
    const maxX = insumos.map(function (_, k) { return Math.max.apply(null, linhas.map(function (l) { return l.x[k]; })); });
    const maxY = produtos.map(function (_, k) { return Math.max.apply(null, linhas.map(function (l) { return l.y[k]; })); });
    linhas.forEach(function (l) { l.xn = l.x.map(function (v, k) { return v / maxX[k]; }); l.yn = l.y.map(function (v, k) { return v / maxY[k]; }); });
    const res = linhas.map(function (o) {
      // variáveis: [u (produtos) ..., v (insumos) ...]
      const c = o.yn.concat(insumos.map(function () { return 0; }));
      const A2 = [o.yn.map(function () { return 0; }).concat(o.xn)];     // igualdade v·x_o = 1 (linha 0)
      const b = [1];
      linhas.forEach(function (j) { A2.push(j.yn.concat(j.xn.map(function (v) { return -v; }))); b.push(0); });
      const w = simplexMax(c, A2, b, 0);
      const ef = w ? M.escalar(o.yn, w.slice(0, produtos.length)) : NaN;
      return { id: o.id, eficiencia: Math.min(1, ef) };
    });
    return { insumos: insumos, produtos: produtos, resultado: res.sort(function (a, b) { return b.eficiencia - a.eficiencia; }) };
  };

  // ---------------------------------------------------------------------------
  // Bootstrap dos coeficientes — reamostragem de
  // PARES (amostra inteira com reposição): para cada coeficiente, o intervalo
  // e a proporção de vezes em que o sinal se manteve. Útil com poucos dados,
  // quando a Sig clássica depende muito da normalidade.
  // ---------------------------------------------------------------------------
  A.bootstrapCoeficientes = function (modelo, opcoes) {
    const op = Object.assign({ B: 1000, nivel: 0.80, semente: 12345 }, opcoes || {});
    const sorteio = U.rng(op.semente), n = modelo.n, p = modelo.p;
    const amostras = [];
    for (let b = 0; b < op.B; b++) {
      const Xb = [], yb = [];
      for (let i = 0; i < n; i++) { const k = Math.floor(sorteio() * n); Xb.push(modelo.X[k]); yb.push(modelo.y[k]); }
      const aj = Rg.ajustar(Xb, yb, true);
      if (!aj.erro) amostras.push(aj.b);
    }
    const cauda = (1 - op.nivel) / 2;
    const nomes = ['Constante'].concat(modelo.indep.map(function (v) { return v.nome; }));
    return {
      B: amostras.length, nivel: op.nivel,
      coeficientes: nomes.map(function (nm, j) {
        const v = amostras.map(function (b) { return b[j]; }).sort(function (a, b) { return a - b; });
        const q = function (f) { return v[Math.min(v.length - 1, Math.max(0, Math.round(f * (v.length - 1))))]; };
        const mesmoSinal = v.filter(function (x) { return Math.sign(x) === Math.sign(modelo.b[j]); }).length / v.length;
        return { nome: nm, coeficiente: modelo.b[j], min: q(cauda), max: q(1 - cauda), erroPadrao: U.desvio(v),
          mesmoSinal: mesmoSinal, cruzaZero: q(cauda) <= 0 && q(1 - cauda) >= 0 };
      })
    };
  };

  // ---------------------------------------------------------------------------
  // Reforço de árvores (gradient boosting, a família do XGBoost)
  // ---------------------------------------------------------------------------
  // Soma de muitas árvores pequenas; cada uma corrige o erro das anteriores.
  // Dá a IMPORTÂNCIA DAS VARIÁVEIS (quanto cada uma reduziu o erro).
  // Serve para comparar e para descobrir variável esquecida; não gera
  // equação, então não substitui a regressão no laudo.
  function arvore(X, r, idx, prof, minFolha) {
    // folha: média dos resíduos
    const media = U.media(idx.map(function (i) { return r[i]; }));
    if (prof === 0 || idx.length < 2 * minFolha) return { folha: media };
    let melhor = null;
    const sqTot = idx.reduce(function (s, i) { return s + (r[i] - media) ** 2; }, 0);
    for (let j = 0; j < X[0].length; j++) {
      const ord = idx.slice().sort(function (a, b) { return X[a][j] - X[b][j]; });
      let somaE = 0, sq2E = 0;
      const somaT = ord.reduce(function (s, i) { return s + r[i]; }, 0), sq2T = ord.reduce(function (s, i) { return s + r[i] * r[i]; }, 0);
      for (let k = 0; k < ord.length - 1; k++) {
        somaE += r[ord[k]]; sq2E += r[ord[k]] ** 2;
        const nE = k + 1, nD = ord.length - nE;
        if (nE < minFolha || nD < minFolha || X[ord[k]][j] === X[ord[k + 1]][j]) continue;
        const sq = (sq2E - somaE * somaE / nE) + ((sq2T - sq2E) - (somaT - somaE) ** 2 / nD);
        if (!melhor || sq < melhor.sq) melhor = { sq: sq, j: j, corte: (X[ord[k]][j] + X[ord[k + 1]][j]) / 2 };
      }
    }
    if (!melhor) return { folha: media };
    const esq = idx.filter(function (i) { return X[i][melhor.j] <= melhor.corte; });
    const dir = idx.filter(function (i) { return X[i][melhor.j] > melhor.corte; });
    return { j: melhor.j, corte: melhor.corte, ganho: sqTot - melhor.sq,
      esq: arvore(X, r, esq, prof - 1, minFolha), dir: arvore(X, r, dir, prof - 1, minFolha) };
  }
  function preverArvore(no, x) { while (no.folha === undefined) no = x[no.j] <= no.corte ? no.esq : no.dir; return no.folha; }
  function somarGanhos(no, imp) { if (no.folha !== undefined) return; imp[no.j] += no.ganho; somarGanhos(no.esq, imp); somarGanhos(no.dir, imp); }

  A.boosting = function (modelo, opcoes) {
    const op = Object.assign({ arvores: 300, taxa: 0.05, profundidade: 3, minFolha: 3, subamostra: 0.8, semente: 12345 }, opcoes || {});
    const X = modelo.xOriginal, y = modelo.yOriginal.map(Math.log), n = modelo.n, k = X[0].length;
    const sorteio = U.rng(op.semente);
    const base = U.media(y);
    const pred = new Array(n).fill(base), arvores = [], imp = new Array(k).fill(0);
    // validação cruzada simples: 1 em cada 5 amostras fica de fora para medir
    const fora = modelo.ids.map(function (_, i) { return i % 5 === 0; });
    const predV = new Array(n).fill(base);
    for (let t = 0; t < op.arvores; t++) {
      const r = y.map(function (v, i) { return v - pred[i]; });
      const idx = [];
      for (let i = 0; i < n; i++) if (!fora[i] && sorteio() < op.subamostra) idx.push(i);
      if (idx.length < 2 * op.minFolha) continue;
      const a = arvore(X, r, idx, op.profundidade, op.minFolha);
      arvores.push(a); somarGanhos(a, imp);
      for (let i = 0; i < n; i++) { const d = op.taxa * preverArvore(a, X[i]); pred[i] += d; predV[i] += d; }
    }
    const obs = modelo.yOriginal, est = pred.map(Math.exp);
    const R2 = function (filtro) {
      const o = obs.filter(function (_, i) { return filtro(i); }), e = est.filter(function (_, i) { return filtro(i); });
      const m = U.media(o); let sr = 0, st = 0;
      o.forEach(function (v, i) { sr += (v - e[i]) ** 2; st += (v - m) ** 2; });
      return 1 - sr / st;
    };
    const totalImp = imp.reduce(function (s, v) { return s + v; }, 0) || 1;
    const modeloB = { base: base, taxa: op.taxa, arvores: arvores };
    return {
      arvores: arvores.length, R2treino: R2(function (i) { return !fora[i]; }), R2validacao: R2(function (i) { return fora[i]; }),
      importancia: modelo.indep.map(function (v, j) { return { nome: v.nome, importancia: imp[j] / totalImp }; }).sort(function (a, b) { return b.importancia - a.importancia; }),
      prever: function (xOrig) { let s = base; arvores.forEach(function (a) { s += op.taxa * preverArvore(a, xOrig); }); return Math.exp(s); },
      observado: obs, estimado: est, ids: modelo.ids, interno: modeloB
    };
  };

  // ---------------------------------------------------------------------------
  // Simulação de variáveis aleatórias (Monte Carlo):
  // sorteia coeficientes pela distribuição estimada (normal multivariada
  // com a matriz de covariância s²(XᵀX)⁻¹) e, se pedido, varia as
  // características do avaliando dentro de uma incerteza informada.
  // Resultado: distribuição do valor, percentis e probabilidades.
  // ---------------------------------------------------------------------------
  function cholesky(S) {
    const n = S.length, L = M.criar(n, n);
    for (let i = 0; i < n; i++) for (let j = 0; j <= i; j++) {
      let s = S[i][j];
      for (let k = 0; k < j; k++) s -= L[i][k] * L[j][k];
      L[i][j] = i === j ? Math.sqrt(Math.max(s, 0)) : s / (L[j][j] || 1e-300);
    }
    return L;
  }
  A.simulacao = function (modelo, valoresAvaliando, opcoes) {
    const op = Object.assign({ N: 10000, semente: 12345, incertezaPct: null }, opcoes || {});
    const sorteio = U.rng(op.semente);
    const normal = function () { const u = Math.max(sorteio(), 1e-12), v = sorteio(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const cov = modelo.inv.map(function (l) { return l.map(function (v) { return v * modelo.s2; }); });
    const L = cholesky(cov);
    const valores = [];
    for (let s = 0; s < op.N; s++) {
      const z = modelo.b.map(function () { return normal(); });
      const b = modelo.b.map(function (bj, i) { let d = 0; for (let k = 0; k <= i; k++) d += L[i][k] * z[k]; return bj + d; });
      const x = valoresAvaliando.map(function (v, j) {
        const inc = op.incertezaPct && op.incertezaPct[j];
        return inc ? v * (1 + inc * (2 * sorteio() - 1)) : v;          // uniforme ±inc
      });
      const x0 = [1].concat(x.map(function (v, j) { return T.aplicar(modelo.indep[j].transf, v); }));
      const val = T.desfazer(modelo.dep.transf, M.escalar(x0, b));
      if (Number.isFinite(val)) valores.push(val);
    }
    valores.sort(function (a, b) { return a - b; });
    const q = function (f) { return valores[Math.min(valores.length - 1, Math.round(f * (valores.length - 1)))]; };
    return { N: valores.length, media: U.media(valores), desvio: U.desvio(valores), p05: q(0.05), p10: q(0.10), p50: q(0.5), p90: q(0.90), p95: q(0.95), valores: valores };
  };

  INF.Avancado = A;
})(globalThis.INF = globalThis.INF || {});
````

## motor/17-planilha.js
<a id="motor-17-planilha-js"></a>

````javascript
/* =============================================================================
   17-planilha.js — Exportação para Excel (.xlsx de verdade)
   -----------------------------------------------------------------------------
   Um .xlsx é um arquivo ZIP com alguns XML dentro. Aqui montamos esses XML
   e o ZIP "na mão" (sem compressão, que o Excel aceita), sem biblioteca.
   Números vão como número (dá para fazer conta no Excel), texto como texto.

   Uso:  INF.Planilha.pastaCompleta(estado) → Uint8Array com o .xlsx
         estado = { proj, modelo, diag, projecao, busca }
   Abas geradas (as que tiverem conteúdo):
     Identificação · Amostras · Estatística · Variáveis · Regressores ·
     ANOVA e indicadores · Resíduos · Correlações · Normalidade ·
     Fundamentação · Projeção · Busca de modelos · Histórico · Critérios NBR
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, N = INF.NBR;
  const P = {};

  // ---------------------------------------------------------------------------
  // CRC-32 (exigido pelo formato ZIP para cada arquivo)
  // ---------------------------------------------------------------------------
  const TABELA_CRC = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // ---------------------------------------------------------------------------
  // ZIP sem compressão ("stored")
  // ---------------------------------------------------------------------------
  // arquivos: [{ nome, texto }] ou [{ nome, bytes: Uint8Array }] (imagens do Word)
  function zip(arquivos) {
    const cod = new TextEncoder();
    const partes = [], central = [];
    let deslocamento = 0;
    const u16 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF]; };
    const u32 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; };
    arquivos.forEach(function (a) {
      const nome = cod.encode(a.nome), dados = a.bytes || cod.encode(a.texto), crc = crc32(dados);
      // cabeçalho local
      const local = [].concat([0x50, 0x4B, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
        u32(crc), u32(dados.length), u32(dados.length), u16(nome.length), u16(0));
      partes.push(new Uint8Array(local), nome, dados);
      // entrada no diretório central
      central.push(new Uint8Array([].concat([0x50, 0x4B, 0x01, 0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
        u32(crc), u32(dados.length), u32(dados.length), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(deslocamento))), nome);
      deslocamento += local.length + nome.length + dados.length;
    });
    const tamCentral = central.reduce(function (s, p) { return s + p.length; }, 0);
    const fim = new Uint8Array([].concat([0x50, 0x4B, 0x05, 0x06], u16(0), u16(0), u16(arquivos.length), u16(arquivos.length), u32(tamCentral), u32(deslocamento), u16(0)));
    const todas = partes.concat(central, [fim]);
    const total = todas.reduce(function (s, p) { return s + p.length; }, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    todas.forEach(function (p) { out.set(p, pos); pos += p.length; });
    return out;
  }

  // ---------------------------------------------------------------------------
  // XML das abas
  // ---------------------------------------------------------------------------
  const xmlEsc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  };
  function colunaLetra(i) {  // 0 → A, 26 → AA
    let s = '';
    for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
    return s;
  }
  // linhas: array de arrays; a primeira linha de cada bloco pode ser título.
  // Célula { t: 'texto', negrito: true } para cabeçalho.
  function abaXml(linhas) {
    let larguras = [];
    let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    linhas.forEach(function (linha, r) {
      x += '<row r="' + (r + 1) + '">';
      (linha || []).forEach(function (c, ci) {
        if (c === null || c === undefined || c === '') return;
        const ref = colunaLetra(ci) + (r + 1);
        const negrito = typeof c === 'object' && c.negrito;
        const v = typeof c === 'object' ? c.t : c;
        const estilo = negrito ? ' s="1"' : '';
        if (typeof v === 'number') {
          if (!Number.isFinite(v)) return;
          x += '<c r="' + ref + '"' + estilo + '><v>' + v + '</v></c>';
        } else {
          x += '<c r="' + ref + '" t="inlineStr"' + estilo + '><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
        }
        larguras[ci] = Math.min(60, Math.max(larguras[ci] || 8, String(v).length + 2));
      });
      x += '</row>';
    });
    x += '</sheetData></worksheet>';
    // larguras de coluna (inseridas antes de sheetData)
    const cols = '<cols>' + larguras.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (w || 10) + '" customWidth="1"/>'; }).join('') + '</cols>';
    return larguras.length ? x.replace('<sheetData>', cols + '<sheetData>') : x;
  }

  // Monta o .xlsx a partir de [{ nome, linhas }].
  P.gerar = function (abas) {
    const nomes = abas.map(function (a, i) {
      return (a.nome.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31) || ('Aba ' + (i + 1)));
    });
    const arquivos = [
      { nome: '[Content_Types].xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        + abas.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>' },
      { nome: '_rels/.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { nome: 'xl/workbook.xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
        + nomes.map(function (n, i) { return '<sheet name="' + xmlEsc(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>' },
      { nome: 'xl/_rels/workbook.xml.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + abas.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('')
        + '<Relationship Id="rId' + (abas.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { nome: 'xl/styles.xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' }
    ];
    abas.forEach(function (a, i) { arquivos.push({ nome: 'xl/worksheets/sheet' + (i + 1) + '.xml', texto: abaXml(a.linhas) }); });
    return zip(arquivos);
  };

  // ---------------------------------------------------------------------------
  // Pasta completa do trabalho
  // ---------------------------------------------------------------------------
  const cab = function (lista) { return lista.map(function (t) { return { t: t, negrito: true }; }); };
  const num = function (v) { const n = U.lerNumero(v); return Number.isFinite(n) ? n : ''; };

  P.pastaCompleta = function (e) {
    const p = e.proj, m = e.modelo && !e.modelo.erro ? e.modelo : null, d = e.diag, pr = e.projecao && !e.projecao.erro ? e.projecao : null;
    const abas = [];

    abas.push({ nome: 'Identificação', linhas: [cab(['Campo', 'Informação']),
      ['Trabalho', p.projeto.nome], ['Responsável técnico', p.projeto.autor], ['Tipologia', p.projeto.tipologia],
      ['Município', p.projeto.municipio], ['Finalidade', p.projeto.finalidade], ['Data base', p.projeto.dataBase],
      ['Fator de oferta', p.config.aplicarFatorOferta ? p.config.fatorOferta : 'não aplicado'],
      ['Nível do intervalo', p.config.nivelIC], ['Estimativa (y em ln)', p.config.estimativaLn],
      ['Critérios', N.NORMA.referencia], ['Versão do motor', INF.VERSAO]] });

    const vars = p.variaveis;
    abas.push({ nome: 'Amostras', linhas: [cab(['Nº', 'No cálculo', 'Natureza', 'Data', 'Endereço', 'Bairro', 'Informante', 'Telefone', 'Link', 'Latitude', 'Longitude', 'Observação'].concat(vars.map(function (v) { return v.nome + (v.unidade ? ' (' + v.unidade + ')' : ''); })))]
      .concat(p.amostras.map(function (a) {
        return [a.id, a.habilitada === false ? 'não' : 'sim', a.natureza === 'transacao' ? 'transação' : 'oferta', a.data, a.endereco, a.bairro, a.informante, a.telefone, a.link, num(a.lat), num(a.lon), a.obs]
          .concat(vars.map(function (v) { const n = U.lerNumero(a.valores[v.nome]); return Number.isFinite(n) ? n : (a.valores[v.nome] || ''); }));
      })) });

    const desc = INF.Diag.descritivaProjeto(p);
    abas.push({ nome: 'Estatística', linhas: [cab(['Variável', 'Unidade', 'n', 'Média', 'Mediana', 'Desvio padrão', 'CV', 'Mínimo', '1º quartil', '3º quartil', 'Máximo', 'Assimetria'])]
      .concat(desc.linhas.map(function (x) { return [x.nome, x.unidade, x.n, x.media, x.mediana, x.desvio, x.cv, x.min, x.q1, x.q3, x.max, x.assimetria]; })) });

    abas.push({ nome: 'Variáveis', linhas: [cab(['Variável', 'Tipo', 'Unidade', 'Direção esperada', 'Escala no modelo', 'Códigos', 'Descrição'])]
      .concat(vars.map(function (v) {
        const t = p.modelo.transf[v.nome];
        return [v.nome, v.tipo, v.unidade, v.direcao, t ? (T.porId[t] || {}).rotulo || t : '', Object.keys(v.codigos || {}).map(function (c) { return c + '=' + v.codigos[c]; }).join('; '), v.descricao];
      })) });

    if (m) {
      abas.push({ nome: 'Regressores', linhas: [['Equação', m.equacao], ['Forma explícita', INF.Regressao.equacaoExplicita(m)], [],
        cab(['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't calculado', 'Significância', 'Elasticidade (%)', 'VIF', 'Mínimo', 'Média', 'Máximo']),
        ['Constante', '', m.b[0], m.ep[0], m.t[0], m.sig[0]]]
        .concat(m.indep.map(function (v, j) {
          return [v.nome, T.porId[v.transf].rotulo, m.b[j + 1], m.ep[j + 1], m.t[j + 1], m.sig[j + 1], m.elasticidade[j].elasticidade, d ? d.vif[j].vif : '', m.faixa[j].min, m.faixa[j].media, m.faixa[j].max];
        })) });

      abas.push({ nome: 'ANOVA e indicadores', linhas: [cab(['Fonte de variação', 'Soma dos quadrados', 'Graus de liberdade', 'Quadrado médio', 'F calculado', 'Significância']),
        ['Regressão', m.SQReg, m.glReg, m.SQReg / m.glReg, m.F, m.sigF], ['Resíduo', m.SQRes, m.gl, m.s2], ['Total', m.SQTot, m.n - 1], [],
        cab(['Indicador', 'Valor']), ['Dados utilizados (n)', m.n], ['Variáveis independentes (k)', m.p - 1], ['Correlação (r)', m.r],
        ['Determinação (R²)', m.R2], ['R² ajustado', m.R2aj], ['Erro padrão da regressão', m.s],
        ['R² de previsão (PRESS)', d ? d.prev.R2previsao : ''], ['AIC', d ? d.prev.AIC : ''], ['BIC', d ? d.prev.BIC : ''], ['Durbin-Watson', d ? d.dw : '']] });

      if (d) {
        abas.push({ nome: 'Resíduos', linhas: [cab(['Nº', 'Observado', 'Estimado', 'Resíduo', 'Padronizado', 'Studentizado', 'Alavancagem', 'Distância de Cook', 'Outlier (|r|>2)', 'Influente (Cook>1)'])]
          .concat(d.residuos.map(function (r) { return [r.id, r.observado, r.estimado, r.residuo, r.padronizado, r.studentizado, r.alavancagem, r.cook, r.outlier ? 'sim' : 'não', r.influente ? 'sim' : 'não']; })) });

        const nomes = d.correl.nomes;
        const blocoCorrel = function (titulo, M) {
          return [[{ t: titulo, negrito: true }], cab([''].concat(nomes))].concat(nomes.map(function (n, a) { return [n].concat(nomes.map(function (_, b) { return M ? M[a][b] : ''; })); }));
        };
        abas.push({ nome: 'Correlações', linhas: blocoCorrel('Correlações isoladas', d.correl.isoladas).concat([[]], blocoCorrel('Correlações parciais', d.correl.parciais)) });

        abas.push({ nome: 'Normalidade', linhas: [cab(['Intervalo', 'Curva normal', 'Modelo'])]
          .concat(d.proporcoes.map(function (q) { return [q.faixa, q.esperado, q.obtido]; }))
          .concat([[], cab(['Teste', 'Estatística', 'Valor-p']),
            ['Shapiro-Wilk', d.sw.estatistica, d.sw.p], ['Kolmogorov-Smirnov (Lilliefors)', d.ks.estatistica, d.ks.p],
            ['Jarque-Bera', d.jb.estatistica, d.jb.p], ['Breusch-Pagan (homocedasticidade)', d.bp.estatistica, d.bp.p],
            ['Durbin-Watson', d.dw, '']]) });
      }

      const fund = pr ? pr.fundamentacao : N.fundamentacaoPreliminar(m, p.config);
      abas.push({ nome: 'Fundamentação', linhas: [cab(['Item', 'Descrição', 'Situação', 'Grau', 'Pontos'])]
        .concat(fund.itens.map(function (it) { return [it.item, it.descricao, it.detalhe, N.romano(it.grau), it.pontos]; }))
        .concat([[], ['Total de pontos', fund.pontos], ['Grau de fundamentação', N.romano(fund.grau) + (fund.preliminar ? ' (preliminar)' : '')],
          ['Grau de precisão', pr ? N.romano(pr.grauPrecisao) : 'estimar o avaliando']]) });
    }

    if (pr) {
      abas.push({ nome: 'Projeção', linhas: [cab(['Característica do avaliando', 'Valor'])]
        .concat(m.indep.map(function (v) { return [v.nome, num(p.avaliando.valores[v.nome])]; }))
        .concat([[], cab(['Resultado', 'Valor unitário', 'Valor total']),
          ['Estimativa pela mediana', pr.estimativas.mediana, pr.area ? pr.estimativas.mediana * pr.area : ''],
          ['Estimativa pela média', pr.estimativas.media, pr.area ? pr.estimativas.media * pr.area : ''],
          ['Estimativa pela moda', pr.estimativas.moda, pr.area ? pr.estimativas.moda * pr.area : ''],
          ['Estimativa adotada (' + pr.estimativa + ')', pr.central, pr.totalCentral || ''],
          ['IC ' + Math.round(pr.nivel * 100) + '% — mínimo', pr.icMin, pr.totalMin || ''], ['IC ' + Math.round(pr.nivel * 100) + '% — máximo', pr.icMax, pr.totalMax || ''],
          ['Predição — mínimo', pr.ipMin, pr.area ? pr.ipMin * pr.area : ''], ['Predição — máximo', pr.ipMax, pr.area ? pr.ipMax * pr.area : ''],
          ['Campo de arbítrio — mínimo', pr.arbitrioMin, pr.area ? pr.arbitrioMin * pr.area : ''], ['Campo de arbítrio — máximo', pr.arbitrioMax, pr.area ? pr.arbitrioMax * pr.area : ''],
          ['Amplitude do IC', pr.amplitude], ['Grau de precisão', N.romano(pr.grauPrecisao)], ['Grau de fundamentação', N.romano(pr.fundamentacao.grau)]]) });
    }

    if (e.busca && e.busca.modelos && e.busca.modelos.length) {
      const nomesV = Object.keys(e.busca.modelos[0].transf);
      abas.push({ nome: 'Busca de modelos', linhas: [cab(['#'].concat(nomesV, ['k', 'R²', 'R² ajustado', 'R² escala original', 'Sig máxima', 'Sig F', 'Sinais coerentes']))]
        .concat(e.busca.modelos.map(function (r, i) {
          return [i + 1].concat(nomesV.map(function (n) { return (T.porId[r.transf[n]] || {}).rotulo || r.transf[n]; }), [r.k, r.R2, r.R2aj, r.R2orig, r.sigMax, r.sigF, r.sinaisOk ? 'sim' : 'não']);
        })) });
    }

    if (p.historico && p.historico.length) {
      abas.push({ nome: 'Histórico', linhas: [cab(['Quando', 'Origem', 'Amostra', 'Ação', 'Campo', 'De', 'Para', 'Evidência', 'Desfeito em'])]
        .concat(p.historico.map(function (r) { return [r.quando, r.origem, r.amostra || '', r.acao, r.campo || '', String(r.de), String(r.para), r.evidencia, r.desfeito || '']; })) });
    }

    const K = N.NORMA;
    abas.push({ nome: 'Critérios NBR', linhas: [[K.referencia], [], cab(['Item', 'Grau III', 'Grau II', 'Grau I']),
      ['2 — quantidade de dados (múltiplo de k+1)', K.item2.III, K.item2.II, K.item2.I],
      ['5 — Sig máxima dos regressores', K.item5.III, K.item5.II, K.item5.I],
      ['6 — Sig máxima do F', K.item6.III, K.item6.II, K.item6.I],
      ['Precisão — amplitude máxima do IC 80%', K.precisao.III, K.precisao.II, K.precisao.I],
      ['Enquadramento — pontos mínimos', K.enquadramento.III.pontos, K.enquadramento.II.pontos, K.enquadramento.I.pontos]] });

    return P.gerar(abas);
  };

  P.zip = zip;              // reaproveitado pelo gerador do laudo em Word (18-laudo.js)
  P.xmlEsc = xmlEsc;

  INF.Planilha = P;
})(globalThis.INF = globalThis.INF || {});
````

## motor/18-laudo.js
<a id="motor-18-laudo-js"></a>

````javascript
/* =============================================================================
   18-laudo.js — Laudo de avaliação completo (Word e PDF)
   -----------------------------------------------------------------------------
   Monta o laudo na ordem dos requisitos mínimos da ABNT NBR 14.653-1 (item
   "Laudo de avaliação") e o entrega em dois formatos:
     · docx()  → Word editável (.docx montado aqui, sem biblioteca)
     · html()  → página para imprimir em PDF
   Os dois saem da MESMA lista de blocos (montar), então dizem a mesma coisa.

   Regras de redação:
     · voz do perito, primeira pessoa, prosa simples e direta;
     · números, tabelas e graus saem do cálculo — nada é digitado à mão;
     · o que o programa não sabe (solicitante, matrícula, vistoria...) vem
       dos campos da aba Laudo; se estiver vazio, sai "[preencher: ...]"
       marcado em amarelo, para ninguém esquecer. Nada é inventado;
     · autor do arquivo Word = responsável técnico do projeto.

   Blocos: { t: 'capa' | 'h1' | 'h2' | 'p' | 'tabela' | 'grafico' | 'quebra' | 'assinatura' }
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, N = INF.NBR, Rg = INF.Regressao, G = INF.Graficos;
  const L = {};

  // ---------------------------------------------------------------------------
  // Valor por extenso (reais), para a conclusão do laudo
  // ---------------------------------------------------------------------------
  const UNI = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const DEZ = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const CEM = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];
  function ate999(n) {
    if (n === 100) return 'cem';
    const c = Math.floor(n / 100), r = n % 100, partes = [];
    if (c) partes.push(CEM[c]);
    if (r) partes.push(r < 20 ? UNI[r] : DEZ[Math.floor(r / 10)] + (r % 10 ? ' e ' + UNI[r % 10] : ''));
    return partes.join(' e ');
  }
  function inteiroPorExtenso(n) {
    if (n === 0) return 'zero';
    const escalas = [['', ''], ['mil', 'mil'], ['milhão', 'milhões'], ['bilhão', 'bilhões']];
    const grupos = [];
    let i = 0;
    while (n > 0) { grupos.push({ v: n % 1000, e: i }); n = Math.floor(n / 1000); i++; }
    const partes = grupos.filter(function (g) { return g.v; }).reverse().map(function (g) {
      if (g.e === 1) return g.v === 1 ? 'mil' : ate999(g.v) + ' mil';
      if (g.e >= 2) return ate999(g.v) + ' ' + (g.v === 1 ? escalas[g.e][0] : escalas[g.e][1]);
      return ate999(g.v);
    });
    // grupos separados por espaço ("dois mil trezentos e dez"); "e" antes do
    // último grupo quando ele é menor que 100 ou centena exata ("mil e cem")
    const ultimo = grupos[0].v;
    if (partes.length > 1 && ultimo && (ultimo < 100 || ultimo % 100 === 0)) {
      return partes.slice(0, -1).join(' ') + ' e ' + partes[partes.length - 1];
    }
    return partes.join(' ');
  }
  L.porExtenso = function (valor) {
    const reais = Math.floor(Math.round(valor * 100) / 100);
    const cent = Math.round((valor - reais) * 100);
    let txt = '';
    if (reais) {
      txt = inteiroPorExtenso(reais);
      // "um milhão de reais", "dois milhões de reais" (sem milhar/unidade depois)
      const deReais = reais >= 1e6 && reais % 1e6 === 0;
      txt += (deReais ? ' de' : '') + (reais === 1 ? ' real' : ' reais');
    }
    if (cent) txt += (txt ? ' e ' : '') + inteiroPorExtenso(cent) + (cent === 1 ? ' centavo' : ' centavos');
    return txt || 'zero real';
  };

  // ---------------------------------------------------------------------------
  // Campos da aba Laudo (o que o programa não sabe sozinho)
  // ---------------------------------------------------------------------------
  L.PADRAO = {
    solicitante: '', proprietario: '', objetivo: 'valor de mercado para compra e venda',
    endereco: '', matricula: '', cartorio: '', areaDocumento: '', coordenadas: '',
    dataVistoria: '', acompanhante: '', descricaoRegiao: '', descricaoImovel: '', benfeitorias: '',
    diagnosticoMercado: '',
    pressupostos: 'Considerei verdadeiras as informações e os documentos fornecidos pelo solicitante, em especial a matrícula do imóvel, sem investigação de títulos, ônus ou gravames. As áreas adotadas são as constantes da documentação, sem levantamento topográfico. Não fiz análise de solo, de estrutura ou de passivo ambiental além do que a vistoria visual permite observar. Os dados de mercado foram obtidos de fontes que considero idôneas e estão identificados no anexo.',
    valorAdotado: null, justificativa: '',
    titulo: 'Engenheiro Civil', registro: '', art: '', cidade: '',
    anexoCompleto: true          // anexo estatístico completo (todas as tabelas e gráficos)
  };
  L.campos = function (proj) { return Object.assign({}, L.PADRAO, proj.laudo || {}); };

  const falta = function (o) { return '[preencher: ' + o + ']'; };
  const ou = function (v, o) { return (v !== null && v !== undefined && String(v).trim() !== '') ? String(v).trim() : falta(o); };
  const dataBR = function (iso) { return iso ? iso.split('-').reverse().join('/') : ''; };
  const dataExtenso = function (iso) {
    if (!iso) return '';
    const m = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    const p = iso.split('-');
    return Number(p[2]) + ' de ' + m[Number(p[1]) - 1] + ' de ' + p[0];
  };

  // ---------------------------------------------------------------------------
  // Montagem do conteúdo
  // ---------------------------------------------------------------------------
  // estado: { proj, modelo, diag, projecao }
  L.montar = function (estado) {
    if (INF.TiposLaudo && INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(estado.proj))) return L.montarVizinhanca(estado);
    const p = estado.proj, m = estado.modelo, d = estado.diag, pr = estado.projecao;
    if (!m || m.erro) return { erro: 'Calcule o modelo antes de gerar o laudo.' };
    if (!pr || pr.erro) return { erro: 'Estime o valor do avaliando (aba Avaliação e NBR) antes de gerar o laudo.' };
    const c = L.campos(p), cfg = p.config;
    const TL = INF.TiposLaudo, tl = TL.ler(p);
    const rural = tl.ambito === 'rural';
    const judicial = tl.destino === 'judicial';
    const B = [];
    const par = function (t) { B.push({ t: 'p', texto: t }); };
    // capítulos numerados na ordem em que entram (o tipo de laudo muda quais entram)
    let nSec = 0, nSub = 0;
    const sec = function (t) { nSec++; nSub = 0; B.push({ t: 'h1', texto: nSec + '. ' + t }); };
    const sub = function (t) { nSub++; B.push({ t: 'h2', texto: nSec + '.' + nSub + ' ' + t }); };
    const autor = ou(p.projeto.autor, 'responsável técnico');
    const dataRef = dataExtenso(p.projeto.dataBase);

    // valor final: o adotado pelo avaliador ou, se vazio, o total arredondado
    const baseValor = pr.area ? pr.totalCentral : pr.central;
    const adotado = Number.isFinite(Number(c.valorAdotado)) && Number(c.valorAdotado) > 0 ? Number(c.valorAdotado) : INF.Projecao.arredondar(baseValor);
    const mult = pr.area || 1;
    const dentroIC = adotado >= pr.icMin * mult - 1e-6 && adotado <= pr.icMax * mult + 1e-6;
    const dentroArb = adotado >= pr.arbitrioMin * mult - 1e-6 && adotado <= pr.arbitrioMax * mult + 1e-6;

    // ---- capa ----
    const modeloLaudo = INF.Modelos ? INF.Modelos.doProjeto(p) : { nome: '' };
    B.push({ t: 'capa', linhas: [TL.titulo(tl), modeloLaudo.nome,
      (rural ? 'Imóvel rural' : 'Imóvel urbano') + (tl.imovel ? ' — ' + tl.imovel : ''),
      ou(c.endereco || p.projeto.nome, 'endereço ou denominação do imóvel') + (p.projeto.municipio ? ' · ' + p.projeto.municipio : ''),
      judicial ? 'Processo nº ' + ou(tl.processo, 'número do processo') : 'Solicitante: ' + ou(c.solicitante, 'solicitante'),
      'Data de referência: ' + dataBR(p.projeto.dataBase),
      autor + (c.registro ? ' — ' + c.registro : '')] });
    B.push({ t: 'quebra' });

    // ---- 1 a 4 ----
    if (judicial) {
      sec('Identificação do processo');
      B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: [
        ['Processo nº', ou(tl.processo, 'número do processo')], ['Juízo', ou(tl.vara, 'vara')], ['Comarca', ou(tl.comarca, 'comarca')],
        ['Autor(es)', ou(tl.autor, 'autor')], ['Réu(s)', ou(tl.reu, 'réu')], ['Função', tl.funcao || 'Perito do Juízo']]
        .concat(tl.assistentes ? [['Assistentes técnicos', tl.assistentes]] : []) });
      if (c.solicitante) par('A perícia foi determinada por ' + c.solicitante + '.');
    } else {
      sec('Solicitante');
      par('Este trabalho foi solicitado por ' + ou(c.solicitante, 'nome do solicitante') + '. ' + (c.proprietario ? 'O imóvel pertence a ' + c.proprietario + '.' : ''));
      if (tl.destino === 'banco') {
        B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: [['Instituição financeira', ou(tl.banco, 'banco')], ['Proposta / contrato', ou(tl.contrato, 'número da proposta ou contrato')], ['Proponente', ou(tl.proponente, 'proponente')]] });
      }
    }
    sec('Finalidade');
    par('A avaliação destina-se a ' + ou(p.projeto.finalidade, 'finalidade (ex.: garantia de financiamento, instrução de processo judicial)') + '.');
    if (judicial) par(ou(tl.objetoPericia, 'objeto da perícia conforme a decisão que a determinou'));
    const objetosTxt = (tl.objetos || []).map(function (o) { const x = TL.OBJETOS.find(function (y) { return y.id === o; }); return x ? x.rotulo.toLowerCase() : o; });
    if (objetosTxt.length) par('Este trabalho abrange: ' + objetosTxt.join('; ') + '.');
    sec('Objetivo');
    par('O objetivo é determinar o ' + ou(c.objetivo, 'objetivo') + ' do imóvel descrito neste laudo, na data de referência de ' + dataRef + '.');
    sec('Pressupostos, ressalvas e fatores limitantes');
    par(ou(c.pressupostos, 'pressupostos e ressalvas'));
    L.blocoAchados(p, B, par);

    // ---- 5 imóvel ----
    sec('Identificação e caracterização do imóvel');
    sub('Documentação');
    B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: [
      ['Matrícula', ou(c.matricula, 'número da matrícula')], ['Cartório', ou(c.cartorio, 'cartório de registro')],
      ['Área documental', ou(c.areaDocumento, 'área da matrícula')], ['Proprietário', ou(c.proprietario, 'proprietário')]] });
    sub('Localização');
    par('O imóvel está situado em ' + ou(c.endereco, 'endereço ou referência de acesso') + ', município de ' + ou(p.projeto.municipio, 'município') + '.' +
      (c.coordenadas ? ' Coordenadas geográficas: ' + c.coordenadas + '.' : ''));
    const fotos = p.fotos || [];
    const imagem = function (f) { B.push({ t: 'imagem', dataUrl: f.dataUrl, titulo: f.legenda || '', largura: f.largura, altura: f.altura }); };
    const mapas = fotos.filter(function (f) { return f.alvo === 'mapa'; });
    if (mapas.length) mapas.forEach(imagem);
    else {
      const comCoord = p.amostras.filter(function (a) { return a.habilitada !== false && Number.isFinite(a.lat) && Number.isFinite(a.lon); });
      const av = p.avaliando;
      if (comCoord.length || (Number.isFinite(av.lat) && Number.isFinite(av.lon))) {
        B.push({ t: 'grafico', titulo: 'Situação do imóvel avaliando (triângulo) e dos dados de mercado', svg: G.mapa(comCoord.map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: a.id }; }),
          Number.isFinite(av.lat) && Number.isFinite(av.lon) ? { lat: av.lat, lon: av.lon } : null) });
      } else par(falta('imagem de localização (Google Maps) ou coordenadas do imóvel'));
    }
    sub('Vistoria');
    if (judicial) {
      par(c.dataVistoria ? 'Realizei a diligência no imóvel em ' + dataExtenso(c.dataVistoria) + (c.acompanhante ? ', com a presença de ' + c.acompanhante : '') + ', após comunicação às partes e aos assistentes técnicos.' : falta('data da diligência, quem esteve presente e como as partes foram comunicadas'));
    } else {
      par(c.dataVistoria ? 'Vistoriei o imóvel em ' + dataExtenso(c.dataVistoria) + (c.acompanhante ? ', acompanhado de ' + c.acompanhante : '') + '.' : falta('data da vistoria e quem acompanhou'));
    }
    sub('Região');
    par(ou(c.descricaoRegiao, 'descrição da região: acesso, infraestrutura, vocação, uso predominante'));
    sub('Descrição do imóvel');
    par(ou(c.descricaoImovel, 'descrição do imóvel: dimensões, topografia, solo, uso atual'));
    if (c.benfeitorias) par(c.benfeitorias);
    sub('Registro fotográfico');
    const fotosImovel = fotos.filter(function (f) { return f.alvo === 'avaliando'; });
    if (fotosImovel.length) fotosImovel.forEach(imagem); else par(falta('fotografias da vistoria'));
    sub('Características adotadas no cálculo');
    par('Para o cálculo, o imóvel foi caracterizado pelas variáveis abaixo, com os mesmos critérios usados nos dados de mercado:');
    B.push({ t: 'tabela', cab: ['Variável', 'Descrição', 'Valor no avaliando'], linhas: m.indep.map(function (v) {
      const def = p.variaveis.find(function (x) { return x.nome === v.nome; }) || {};
      return [v.nome, def.descricao || '', U.fmtAuto(U.lerNumero(p.avaliando.valores[v.nome])) + (def.unidade ? ' ' + def.unidade : '')];
    }).concat(pr.area ? [['Área para o valor total', '', U.fmtAuto(pr.area)]] : []) });

    // ---- 6 diagnóstico de mercado ----
    const ativos = p.amostras.filter(function (a) { return a.habilitada !== false; });
    const ofertas = ativos.filter(function (a) { return a.natureza === 'oferta'; }).length;
    const muns = Array.from(new Set(ativos.map(function (a) { return a.bairro; }).filter(Boolean)));
    const dY = INF.Diag.descritiva(m.yOriginal);
    const vDep = p.variaveis.find(function (x) { return x.nome === m.dep.nome; }) || {};
    sec('Diagnóstico de mercado');
    par('Pesquisei ' + p.amostras.length + ' dados de mercado de imóveis ' + (rural ? 'rurais' : 'semelhantes ao avaliando') + (muns.length ? ' em ' + muns.join(', ') : '') +
      '. Destes, ' + ativos.length + ' foram usados no tratamento (' + ofertas + ' ofertas e ' + (ativos.length - ofertas) + ' transações). ' +
      'Após o fator de oferta, o ' + m.dep.nome + ' variou de ' + U.fmtAuto(dY.min) + ' a ' + U.fmtAuto(dY.max) + (vDep.unidade ? ' ' + vDep.unidade : '') +
      ', com mediana de ' + U.fmtAuto(dY.mediana) + ' e coeficiente de variação de ' + U.fmtPct(dY.cv, 1) + '.');
    par(ou(c.diagnosticoMercado, 'leitura do mercado: liquidez, número de ofertas, tempo de absorção, tendência de preços'));

    // ---- pesquisa de mercado: raio, localização das amostras, prints ----
    sec('Pesquisa de mercado');
    L.capituloPesquisa(p, m, B, par, sub);

    // ---- 7 método ----
    sec('Método e procedimentos');
    par('Adotei o Método Comparativo Direto de Dados de Mercado, previsto na ABNT NBR 14.653-2' + (rural ? ' e na ABNT NBR 14.653-3' : '') +
      ', com tratamento dos dados por inferência estatística (regressão linear múltipla). Esse método permite explicar o valor do imóvel pelas características que o mercado efetivamente remunera e dá, junto com a estimativa, a medida da sua confiabilidade.');
    par(cfg.aplicarFatorOferta ? 'Os preços de oferta foram multiplicados pelo fator ' + U.fmt(cfg.fatorOferta, 2) + ', para trazê-los ao nível de preço de fechamento; as transações entraram sem fator.' : 'Não apliquei fator de oferta.');
    par('Só aceitei como dado de mercado a oferta com fonte identificada e com telefone ou link do anúncio, para que qualquer dado possa ser conferido.');

    // ---- 8 tratamento ----
    sec('Tratamento dos dados');
    sub('Variáveis');
    B.push({ t: 'tabela', cab: ['Variável', 'Tipo', 'Escala', 'Mínimo', 'Média', 'Máximo'], linhas: [[m.dep.nome, 'dependente', T.porId[m.dep.transf].rotulo, U.fmtAuto(m.faixaY.min), U.fmtAuto(m.faixaY.media), U.fmtAuto(m.faixaY.max)]]
      .concat(m.indep.map(function (v, j) { return [v.nome, v.tipo, T.porId[v.transf].rotulo, U.fmtAuto(m.faixa[j].min), U.fmtAuto(m.faixa[j].media), U.fmtAuto(m.faixa[j].max)]; })) });
    sub('Modelo');
    par('Testei as combinações de escalas das variáveis e escolhi o modelo abaixo, que atende aos critérios da norma com o melhor ajuste:');
    B.push({ t: 'p', texto: m.equacao, mono: true });
    B.push({ t: 'tabela', cab: ['Regressor', 'Coeficiente', 't calculado', 'Significância', 'Elasticidade'], linhas: [['Constante', U.fmtAuto(m.b[0]), U.fmt(m.t[0], 3), U.fmtPct(m.sig[0]), '—']]
      .concat(m.indep.map(function (v, j) { return [v.nome, U.fmtAuto(m.b[j + 1]), U.fmt(m.t[j + 1], 3), U.fmtPct(m.sig[j + 1]), U.fmt(m.elasticidade[j].elasticidade, 2) + '%']; })) });
    B.push({ t: 'tabela', cab: ['Indicador', 'Valor'], linhas: [['Dados utilizados', String(m.n)], ['Coeficiente de correlação', U.fmt(m.r, 4)], ['Coeficiente de determinação (R²)', U.fmt(m.R2, 4)],
      ['R² ajustado', U.fmt(m.R2aj, 4)], ['F calculado', U.fmt(m.F, 3)], ['Significância do modelo', U.fmtPct(m.sigF, 4)]] });
    sub('Verificação dos pressupostos');
    const normal = d.sw.p >= 0.05;
    par('Os resíduos ' + (normal ? 'não rejeitam' : 'rejeitam') + ' a hipótese de normalidade pelo teste de Shapiro-Wilk (p = ' + U.fmtPct(d.sw.p) + '). ' +
      'O teste de Breusch-Pagan ' + (d.bp.p >= 0.05 ? 'não indica' : 'indica') + ' variância não constante (p = ' + U.fmtPct(d.bp.p) + '). ' +
      'A maior inflação de variância entre as variáveis é ' + U.fmt(Math.max.apply(null, d.vif.map(function (v) { return v.vif; })), 2) + '. ' +
      (d.outliers.length ? 'As amostras ' + d.outliers.join(', ') + ' têm resíduo acima de dois desvios padrão; mantive-as após conferência' : 'Nenhuma amostra tem resíduo acima de dois desvios padrão') + '.');
    // só alterações nos DADOS (correção, retirada, escala); preenchimento de campo do laudo não entra
    const hist = (p.historico || []).filter(function (r) { return !r.desfeito && ['corrigir', 'desligar', 'escala'].indexOf(r.acao) >= 0; });
    if (hist.length) {
      sub('Saneamento dos dados');
      B.push({ t: 'tabela', cab: ['Amostra', 'Alteração', 'Motivo'], linhas: hist.map(function (r) {
        return [String(r.amostra || '—'), r.acao === 'desligar' ? 'retirada do cálculo' : r.campo + ': ' + r.de + ' → ' + r.para, r.evidencia || r.motivo || ''];
      }) });
    }

    // ---- 9 especificação ----
    sec('Especificação da avaliação');
    B.push({ t: 'tabela', cab: ['Item', 'Descrição', 'Grau'], linhas: pr.fundamentacao.itens.map(function (it) { return [String(it.item), it.descricao, N.romano(it.grau)]; }) });
    par('Somados os pontos (' + pr.fundamentacao.pontos + '), a avaliação enquadra-se no Grau ' + N.romano(pr.fundamentacao.grau) + ' de fundamentação. ' +
      'A amplitude do intervalo de confiança de 80% em torno da estimativa central é de ' + U.fmtPct(pr.amplitude) + ', o que corresponde ao Grau ' + N.romano(pr.grauPrecisao) + ' de precisão.');

    // ---- 10 resultado ----
    sec('Resultado da avaliação');
    const un = vDep.unidade ? ' ' + vDep.unidade : '';
    B.push({ t: 'tabela', cab: ['Resultado', 'Valor unitário', pr.area ? 'Valor total' : ''].filter(Boolean), linhas: [
      ['Estimativa central', U.fmtAuto(pr.central) + un].concat(pr.area ? [U.fmtMoeda(pr.totalCentral)] : []),
      ['Intervalo de confiança de 80% — mínimo', U.fmtAuto(pr.icMin) + un].concat(pr.area ? [U.fmtMoeda(pr.totalMin)] : []),
      ['Intervalo de confiança de 80% — máximo', U.fmtAuto(pr.icMax) + un].concat(pr.area ? [U.fmtMoeda(pr.totalMax)] : []),
      ['Campo de arbítrio — mínimo', U.fmtAuto(pr.arbitrioMin) + un].concat(pr.area ? [U.fmtMoeda(pr.arbitrioMin * pr.area)] : []),
      ['Campo de arbítrio — máximo', U.fmtAuto(pr.arbitrioMax) + un].concat(pr.area ? [U.fmtMoeda(pr.arbitrioMax * pr.area)] : [])] });
    // valor unitário adotado (base das contas de servidão e remanescente)
    const areaTot = U.lerNumero(tl.areaTotal);
    const vuAdotado = pr.area ? adotado / pr.area : (Number.isFinite(areaTot) && areaTot > 0 ? adotado / areaTot : pr.central);
    const extra = TL.calcular(tl, vuAdotado, adotado);
    const locativo = TL.tem(tl, 'locativo');
    const soPleno = !TL.tem(tl, 'servidao') && !TL.tem(tl, 'remanescente');
    const conclusoes = [];
    let base = 'o ' + (locativo ? 'valor locativo mensal' : 'valor de mercado') + ' de ' + U.fmtMoeda(adotado) + ' (' + L.porExtenso(adotado) + ')';
    if (!dentroIC) base += ', fora do intervalo de confiança e ' + (dentroArb ? 'dentro do campo de arbítrio' : 'FORA do campo de arbítrio') + ', pelo seguinte motivo: ' + ou(c.justificativa, 'justificativa do valor adotado');
    if (TL.tem(tl, 'pleno') || soPleno) conclusoes.push((TL.tem(tl, 'pleno') ? 'pleno domínio: ' : '') + base);
    par('O valor unitário adotado é de ' + U.fmtAuto(vuAdotado) + un + '.');

    if (extra.servidao) {
      sub('Indenização pela servidão administrativa');
      const sv = extra.servidao;
      par('A servidão não retira a propriedade, mas restringe o uso da faixa. Por isso a indenização corresponde a uma parcela do valor da terra na faixa, medida pelo coeficiente de servidão. ' + ou(tl.justifServidao, 'justificativa do coeficiente de servidão adotado (restrições de uso na faixa)'));
      B.push({ t: 'tabela', cab: ['Item', 'Valor'], linhas: [['Área da faixa de servidão', Number.isFinite(sv.area) ? U.fmtAuto(sv.area) : falta('área da faixa')], ['Valor unitário adotado', U.fmtAuto(vuAdotado) + un],
        ['Coeficiente de servidão', Number.isFinite(sv.coef) ? U.fmtPct(sv.coef, 1) : falta('coeficiente')], ['Indenização da terra na faixa', U.fmtMoeda(sv.terra)],
        ['Benfeitorias atingidas', U.fmtMoeda(sv.benfeitorias)], ['Indenização total pela servidão', U.fmtMoeda(sv.total)]] });
      if (Number.isFinite(sv.total)) { const v = INF.Projecao.arredondar(sv.total); conclusoes.push('servidão administrativa: indenização de ' + U.fmtMoeda(v) + ' (' + L.porExtenso(v) + ')'); }
    }
    if (extra.remanescente) {
      sub('Desvalorização da área remanescente');
      const rm = extra.remanescente;
      par(ou(tl.justifRemanescente, 'justificativa da desvalorização da área remanescente (forma, acesso, fracionamento)'));
      B.push({ t: 'tabela', cab: ['Item', 'Valor'], linhas: [['Área remanescente', Number.isFinite(rm.area) ? U.fmtAuto(rm.area) : falta('área remanescente')],
        ['Percentual de desvalorização', Number.isFinite(rm.perc) ? U.fmtPct(rm.perc, 1) : falta('percentual')], ['Desvalorização do remanescente', U.fmtMoeda(rm.total)]] });
      if (Number.isFinite(rm.total)) { const v = INF.Projecao.arredondar(rm.total); conclusoes.push('desvalorização do remanescente: ' + U.fmtMoeda(v) + ' (' + L.porExtenso(v) + ')'); }
    }
    if (extra.vtn) {
      sub('Terra nua e benfeitorias');
      par('O valor acima corresponde à terra nua. As benfeitorias foram avaliadas em separado, pelo custo de reedição com depreciação, conforme a ABNT NBR 14.653-3.');
      B.push({ t: 'tabela', cab: ['Benfeitoria', 'Quantidade', 'Valor unitário', 'Depreciação', 'Valor'], linhas: extra.vtn.benfeitorias.length
        ? extra.vtn.benfeitorias.map(function (b) { return [b.descricao, U.fmtAuto(b.quantidade) + ' ' + b.unidade, U.fmtMoeda(b.unitario), U.fmtPct(b.depreciacao / 100, 0), U.fmtMoeda(b.valor)]; })
        : [[falta('benfeitorias: descrição, quantidade, custo unitário e depreciação'), '', '', '', '']] });
      B.push({ t: 'tabela', cab: ['Composição', 'Valor'], linhas: [['Terra nua', U.fmtMoeda(extra.vtn.terraNua)], ['Benfeitorias', U.fmtMoeda(extra.vtn.somaBenfeitorias)], ['Valor total do imóvel', U.fmtMoeda(extra.vtn.total)]] });
      const v = INF.Projecao.arredondar(extra.vtn.total); conclusoes.push('valor total do imóvel (terra nua e benfeitorias): ' + U.fmtMoeda(v) + ' (' + L.porExtenso(v) + ')');
    }
    if (extra.liquidacao) {
      sub('Valor de liquidação forçada');
      const lq = extra.liquidacao;
      par('Para venda em prazo menor que o de absorção normal pelo mercado, descontei o valor de mercado pelo prazo de absorção à taxa mensal indicada: VLF = V ÷ (1 + i)ⁿ.');
      B.push({ t: 'tabela', cab: ['Item', 'Valor'], linhas: [['Prazo de absorção', Number.isFinite(lq.meses) ? lq.meses + ' meses' : falta('prazo de absorção')], ['Taxa de desconto', Number.isFinite(lq.taxa) ? U.fmtPct(lq.taxa, 2) + ' ao mês' : falta('taxa mensal')],
        ['Valor de liquidação forçada', U.fmtMoeda(lq.valor)], ['Deságio sobre o valor de mercado', U.fmtPct(lq.desagio, 1)]] });
      if (Number.isFinite(lq.valor)) { const v = INF.Projecao.arredondar(lq.valor); conclusoes.push('valor de liquidação forçada: ' + U.fmtMoeda(v) + ' (' + L.porExtenso(v) + ')'); }
    }

    B.push({ t: 'p', destaque: true, texto: 'Com base no tratamento apresentado, na data de referência de ' + dataRef + ', concluo pelos seguintes valores: ' + conclusoes.join('; ') + '.' });

    // quesitos (judicial)
    if (judicial) {
      sec('Respostas aos quesitos');
      const qs = tl.quesitos || [];
      if (!qs.length) par(falta('quesitos das partes e do juízo, com as respostas'));
      qs.forEach(function (q, i) {
        B.push({ t: 'p', destaque: true, texto: 'Quesito ' + (i + 1) + (q.parte ? ' (' + q.parte + ')' : '') + ': ' + (q.pergunta || '') });
        par('Resposta: ' + ou(q.resposta, 'resposta ao quesito ' + (i + 1)));
      });
    }

    // ---- 11 encerramento ----
    sec('Encerramento');
    par('Nada mais havendo a relatar, encerro este laudo, que segue assinado, acompanhado dos anexos relacionados no sumário.');
    B.push({ t: 'assinatura', linhas: [ou(c.cidade || (p.projeto.municipio || '').split('/')[0], 'cidade') + ', ' + dataExtenso(new Date().toISOString().slice(0, 10)) + '.',
      autor, ou(c.titulo, 'título profissional') + ' — ' + ou(c.registro, 'CREA'), c.art ? 'ART nº ' + c.art : falta('número da ART')] });

    // ---- anexos ----
    B.push({ t: 'quebra' });
    B.push({ t: 'h1', texto: 'Anexo — Dados de mercado' });
    const usados = new Set(m.ids);
    const nomes = [m.dep.nome].concat(m.indep.map(function (v) { return v.nome; }));
    B.push({ t: 'tabela', pequena: true, cab: ['Nº', 'Uso', 'Natureza', 'Localização', 'Informante', 'Contato'].concat(nomes), linhas: p.amostras.map(function (a) {
      return [String(a.id), usados.has(a.id) ? 'sim' : 'não', a.natureza === 'transacao' ? 'transação' : 'oferta', a.endereco || a.bairro || '', a.informante || '', a.telefone || a.link || '']
        .concat(nomes.map(function (nv) { return U.fmtAuto(U.lerNumero(a.valores[nv])); }));
    }) });
    B.push({ t: 'quebra' });
    L.anexoFichas(p, m, B);
    B.push({ t: 'quebra' });
    B.push({ t: 'h1', texto: 'Anexo — Gráficos' });
    const res = d.residuos;
    B.push({ t: 'grafico', titulo: 'Valores observados × estimados', svg: G.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ')', rotX: 'estimado', rotY: 'observado', linha45: true }) });
    B.push({ t: 'grafico', titulo: 'Resíduos padronizados', svg: G.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true }) });
    B.push({ t: 'grafico', titulo: 'Histograma dos resíduos', svg: G.histograma(res.map(function (r) { return r.padronizado; })) });
    B.push({ t: 'grafico', titulo: 'Gráfico Q-Q', svg: G.qq(res.map(function (r) { return r.padronizado; })) });
    m.indep.forEach(function (v, j) { B.push({ t: 'grafico', titulo: m.dep.nome + ' × ' + v.nome, svg: G.curvaModelo(m, j, Rg.prever) }); });
    B.push({ t: 'grafico', titulo: 'Distância de Cook', svg: G.barras(res.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1) });
    B.push({ t: 'quebra' });
    L.anexoOrigem(p, B);
    B.push({ t: 'quebra' });
    L.anexoInventario(p, B, 'Anexo — Inventário dos documentos');
    B.push({ t: 'quebra' });
    B.push({ t: 'h1', texto: 'Anexo — Documentação e fotografias' });
    const docs = fotos.filter(function (f) { return f.alvo === 'documento'; });
    if (docs.length) docs.forEach(imagem); else par(falta('matrícula e ART'));

    // Anexo do tratamento estatístico completo (o modelo decide se entra)
    {
      B.push({ t: 'quebra' });
      B.push({ t: 'h1', texto: 'Anexo — Tratamento estatístico completo' });
      const desc = INF.Diag.descritivaProjeto(p);
      B.push({ t: 'h2', texto: 'Estatística descritiva' });
      B.push({ t: 'tabela', pequena: true, cab: ['Variável', 'n', 'Média', 'Mediana', 'Desvio', 'CV', 'Mínimo', 'Máximo'], linhas: desc.linhas.map(function (x) { return [x.nome, String(x.n), U.fmtAuto(x.media), U.fmtAuto(x.mediana), U.fmtAuto(x.desvio), U.fmtPct(x.cv, 1), U.fmtAuto(x.min), U.fmtAuto(x.max)]; }) });
      B.push({ t: 'h2', texto: 'Regressores' });
      B.push({ t: 'tabela', pequena: true, cab: ['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't', 'Sig', 'Elasticidade', 'VIF'], linhas: [['Constante', '—', U.fmtAuto(m.b[0]), U.fmtAuto(m.ep[0]), U.fmt(m.t[0], 3), U.fmtPct(m.sig[0]), '—', '—']]
        .concat(m.indep.map(function (v, j) { return [v.nome, T.porId[v.transf].rotulo, U.fmtAuto(m.b[j + 1]), U.fmtAuto(m.ep[j + 1]), U.fmt(m.t[j + 1], 3), U.fmtPct(m.sig[j + 1]), U.fmt(m.elasticidade[j].elasticidade, 2) + '%', U.fmt(d.vif[j].vif, 2)]; })) });
      B.push({ t: 'p', texto: INF.Regressao.equacaoExplicita(m), mono: true });
      B.push({ t: 'h2', texto: 'Análise de variância' });
      B.push({ t: 'tabela', cab: ['Fonte', 'Soma dos quadrados', 'gl', 'Quadrado médio', 'F', 'Sig'], linhas: [
        ['Regressão', U.fmtAuto(m.SQReg), String(m.glReg), U.fmtAuto(m.SQReg / m.glReg), U.fmt(m.F, 3), U.fmtPct(m.sigF, 4)],
        ['Resíduo', U.fmtAuto(m.SQRes), String(m.gl), U.fmtAuto(m.s2), '', ''], ['Total', U.fmtAuto(m.SQTot), String(m.n - 1), '', '', '']] });
      B.push({ t: 'tabela', cab: ['Indicador', 'Valor'], linhas: [['Erro padrão da regressão', U.fmtAuto(m.s)], ['R² de previsão (PRESS)', U.fmt(d.prev.R2previsao, 4)], ['AIC', U.fmt(d.prev.AIC, 2)], ['BIC', U.fmt(d.prev.BIC, 2)], ['Durbin-Watson', U.fmt(d.dw, 3)]] });
      B.push({ t: 'h2', texto: 'Normalidade e homocedasticidade' });
      B.push({ t: 'tabela', cab: ['Intervalo', 'Curva normal', 'Modelo'], linhas: d.proporcoes.map(function (q) { return [q.faixa, U.fmtPct(q.esperado, 0), U.fmtPct(q.obtido, 0)]; }) });
      B.push({ t: 'tabela', cab: ['Teste', 'Estatística', 'Valor-p'], linhas: [['Shapiro-Wilk', U.fmt(d.sw.estatistica, 4), U.fmtPct(d.sw.p)], ['Kolmogorov-Smirnov (Lilliefors)', U.fmt(d.ks.estatistica, 4), U.fmtPct(d.ks.p)],
        ['Jarque-Bera', U.fmt(d.jb.estatistica, 4), U.fmtPct(d.jb.p)], ['Breusch-Pagan', U.fmt(d.bp.estatistica, 4), U.fmtPct(d.bp.p)]] });
      B.push({ t: 'h2', texto: 'Correlações (isoladas / parciais)' });
      const cn = d.correl.nomes;
      B.push({ t: 'tabela', pequena: true, cab: [''].concat(cn), linhas: cn.map(function (n, a) { return [n].concat(cn.map(function (_, b) { return a === b ? '—' : U.fmt(d.correl.isoladas[a][b], 2) + ' / ' + (d.correl.parciais ? U.fmt(d.correl.parciais[a][b], 2) : '—'); })); }) });
      B.push({ t: 'h2', texto: 'Resíduos por amostra' });
      B.push({ t: 'tabela', pequena: true, cab: ['Nº', 'Observado', 'Estimado', 'Resíduo', 'Padronizado', 'Studentizado', 'Alavancagem', 'Cook'], linhas: d.residuos.map(function (r) {
        return [String(r.id), U.fmtAuto(r.observado), U.fmtAuto(r.estimado), U.fmtAuto(r.residuo), U.fmt(r.padronizado, 3), U.fmt(r.studentizado, 3), U.fmt(r.alavancagem, 3), U.fmt(r.cook, 3)]; }) });
      B.push({ t: 'h2', texto: 'Gráficos complementares' });
      m.indep.forEach(function (v, j) {
        B.push({ t: 'grafico', titulo: 'Resíduos × ' + v.nome, svg: G.dispersao(d.residuos.map(function (r, i) { return { x: m.xOriginal[i][j], y: r.padronizado, rotulo: r.id }; }), { titulo: 'Resíduos × ' + v.nome, rotX: v.nome, rotY: 'resíduo padronizado', faixas2s: true }) });
        B.push({ t: 'grafico', titulo: 'Distribuição de ' + v.nome, svg: G.frequencia(m.xOriginal.map(function (l) { return l[j]; }), 'Distribuição de ' + v.nome, v.nome) });
      });
      B.push({ t: 'grafico', titulo: 'Distribuição de ' + m.dep.nome, svg: G.frequencia(m.yOriginal, 'Distribuição de ' + m.dep.nome, m.dep.nome) });
      B.push({ t: 'grafico', titulo: 'Alavancagem', svg: G.barras(d.residuos.map(function (r) { return { rotulo: r.id, valor: r.alavancagem }; }), 'Alavancagem (h)', 'h', 2 * m.p / m.n) });
    }

    return L.finalizar({ blocos: B, autor: p.projeto.autor || '', titulo: TL.titulo(tl) + ' — ' + (p.projeto.nome || ''), valorAdotado: adotado, dentroIC: dentroIC, dentroArb: dentroArb }, p);
  };



  // ---------------------------------------------------------------------------
  // Pesquisa de mercado: raio, distância de cada amostra, mapa e prints
  // ---------------------------------------------------------------------------
  L.distancias = function (p) {
    const av = p.avaliando;
    const temAv = Number.isFinite(av.lat) && Number.isFinite(av.lon);
    return p.amostras.map(function (a) {
      const ok = temAv && Number.isFinite(a.lat) && Number.isFinite(a.lon);
      return { id: a.id, km: ok ? U.distanciaKm(av.lat, av.lon, a.lat, a.lon) : NaN };
    });
  };
  const temPrint = function (p, a) { return (p.fotos || []).some(function (f) { return f.alvo === 'print:' + a.id || f.alvo === 'amostra:' + a.id; }); };
  L.capituloPesquisa = function (p, m, B, par, sub) {
    const ML = INF.Modelos, modelo = ML.doProjeto(p), ex = ML.exigencias(modelo), raio = ML.raio(p);
    const usados = new Set(m.ids);
    const ativos = p.amostras.filter(function (a) { return usados.has(a.id); });
    const dist = {}; L.distancias(p).forEach(function (x) { dist[x.id] = x.km; });
    const av = p.avaliando, temAv = Number.isFinite(av.lat) && Number.isFinite(av.lon);
    const kms = ativos.map(function (a) { return dist[a.id]; }).filter(Number.isFinite);
    const fora = ativos.filter(function (a) { return Number.isFinite(dist[a.id]) && dist[a.id] > raio; });
    par('Pesquisei dados de mercado de imóveis comparáveis num raio de referência de ' + U.fmt(raio, raio < 10 ? 1 : 0) + ' km do imóvel avaliando. ' +
      (temAv ? (kms.length ? 'Das ' + ativos.length + ' amostras usadas, ' + kms.length + ' têm coordenadas: a mais próxima está a ' + U.fmt(Math.min.apply(null, kms), 1) +
        ' km e a mais distante a ' + U.fmt(Math.max.apply(null, kms), 1) + ' km (média de ' + U.fmt(U.media(kms), 1) + ' km).' : falta('coordenadas das amostras (para medir a distância ao avaliando)'))
        : falta('coordenadas do imóvel avaliando (para medir o raio das amostras)')));
    if (fora.length) par('As amostras ' + fora.map(function (a) { return a.id; }).join(', ') + ' estão além do raio de referência; mantive-as por ' + ou((p.laudo || {}).justifRaio, 'justificativa das amostras fora do raio (mesmo mercado, falta de dados próximos...)') + '.');
    const dep = INF.Regressao.dependente(p);
    B.push({ t: 'tabela', pequena: true, cab: ['Nº', 'Natureza', 'Fonte', 'Data', 'Distância (km)', (dep ? dep.nome : 'Valor') + ' com fator', 'Print / link'], linhas: ativos.map(function (a) {
      return [String(a.id), a.natureza === 'transacao' ? 'transação' : 'oferta', a.informante || '', a.data ? dataBR(a.data) : '', Number.isFinite(dist[a.id]) ? U.fmt(dist[a.id], 1) : '—',
        U.fmtAuto(INF.Regressao.valorDependente(p, a, dep.nome)), temPrint(p, a) ? 'print' : (a.link ? 'link' : (a.natureza === 'oferta' ? 'falta' : '—'))];
    }) });
    const comCoord = ativos.filter(function (a) { return Number.isFinite(a.lat) && Number.isFinite(a.lon); });
    if (comCoord.length || temAv) {
      B.push({ t: 'grafico', titulo: 'Localização das amostras e raio de referência de ' + U.fmt(raio, raio < 10 ? 1 : 0) + ' km', svg: G.mapa(comCoord.map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: a.id, destaque: fora.indexOf(a) >= 0 }; }), temAv ? { lat: av.lat, lon: av.lon } : null, temAv ? raio : null) });
    }
    if (ex.printOuLink) {
      const semProva = ativos.filter(function (a) { return a.natureza === 'oferta' && !temPrint(p, a) && !a.link; });
      par(semProva.length ? falta('print ou link do anúncio das amostras ' + semProva.map(function (a) { return a.id; }).join(', '))
        : 'Todas as ofertas usadas têm o print ou o link do anúncio, reproduzidos na ficha de cada amostra, em anexo.');
    }
    if (ex.coordenadas && comCoord.length < ativos.length) par(falta('coordenadas das amostras ' + ativos.filter(function (a) { return !(Number.isFinite(a.lat) && Number.isFinite(a.lon)); }).map(function (a) { return a.id; }).join(', ')));
  };

  // ---------------------------------------------------------------------------
  // Anexo: ficha de cada amostra usada, com o print do anúncio
  // ---------------------------------------------------------------------------
  L.anexoFichas = function (p, m, B) {
    const usados = new Set(m.ids), dist = {};
    L.distancias(p).forEach(function (x) { dist[x.id] = x.km; });
    const dep = INF.Regressao.dependente(p);
    B.push({ t: 'h1', texto: 'Anexo — Fichas das amostras' });
    p.amostras.filter(function (a) { return usados.has(a.id); }).forEach(function (a) {
      B.push({ t: 'h2', texto: 'Amostra ' + a.id });
      const linhas = [['Natureza', a.natureza === 'transacao' ? 'transação' : 'oferta'], ['Data', a.data ? dataBR(a.data) : falta('data do anúncio ou da transação')],
        ['Endereço / referência', a.endereco || a.bairro || falta('localização da amostra')], ['Fonte', a.informante || falta('fonte')],
        ['Contato', a.telefone || (a.natureza === 'oferta' ? '—' : '')], ['Link', a.link || '—'],
        ['Coordenadas', Number.isFinite(a.lat) && Number.isFinite(a.lon) ? U.fmt(a.lat, 6) + ', ' + U.fmt(a.lon, 6) : '—'],
        ['Distância ao avaliando', Number.isFinite(dist[a.id]) ? U.fmt(dist[a.id], 1) + ' km' : '—']];
      p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; }).forEach(function (v) {
        const x = U.lerNumero(a.valores[v.nome]);
        linhas.push([v.nome + (v.unidade ? ' (' + v.unidade + ')' : ''), Number.isFinite(x) ? U.fmtAuto(x) : '—']);
      });
      if (dep) linhas.push([dep.nome + ' com fator', U.fmtAuto(INF.Regressao.valorDependente(p, a, dep.nome))]);
      if (a.obs) linhas.push(['Observação', a.obs]);
      B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: linhas });
      const prints = (p.fotos || []).filter(function (f) { return f.alvo === 'print:' + a.id || f.alvo === 'amostra:' + a.id; });
      prints.forEach(function (f) { B.push({ t: 'imagem', dataUrl: f.dataUrl, titulo: f.legenda || ('Amostra ' + a.id), largura: f.largura, altura: f.altura }); });
      if (!prints.length && a.natureza === 'oferta' && !a.link) B.push({ t: 'p', texto: falta('print do anúncio da amostra ' + a.id) });
    });
  };

  // ---------------------------------------------------------------------------
  // Anexo: ORIGEM DE CADA DADO — prova de que nada foi inventado
  // ---------------------------------------------------------------------------
  L.anexoOrigem = function (p, B) {
    const IV = INF.Inventario; if (!IV) return;
    const tl = INF.TiposLaudo.ler(p);
    const ficha = IV.ficha(tl, p.inventario || {}, p.inventarioDecisoes || {}, function (c) { return IV.valorNoProjeto(p, c); });
    B.push({ t: 'h1', texto: 'Anexo — Origem de cada dado' });
    B.push({ t: 'p', texto: 'Cada informação deste laudo tem uma origem verificável: um documento (arquivo, página e trecho), o levantamento de campo e a decisão técnica do signatário, ou o cálculo apresentado.' });
    B.push({ t: 'tabela', pequena: true, cab: ['Dado', 'Valor', 'Origem'], linhas: ficha.filter(function (f) { return f.quem !== 'calculo'; }).map(function (f) {
      let origem;
      if (f.fonte && f.fonte.arquivo) origem = f.fonte.arquivo + (f.fonte.pagina ? ', p. ' + f.fonte.pagina : '') + (f.fonte.trecho ? ' — "' + f.fonte.trecho + '"' : '');
      else if (f.estado === 'RESOLVIDA') origem = f.quem === 'avaliador' ? 'levantamento e decisão técnica do signatário' : 'informado pelo signatário';
      else origem = falta(f.rotulo.toLowerCase() + ' — ' + (IV.porId[f.campo] && IV.porId[f.campo].comoObter || 'obter a informação'));
      return [f.rotulo, f.valor || '—', origem];
    }).concat([['Valores, intervalos, graus e gráficos', 'ver capítulos de tratamento e resultado', 'cálculo apresentado neste laudo']]) });
  };

  // ---------------------------------------------------------------------------
  // Finalização pelo MODELO: filtra os capítulos, põe o sumário, renumera
  // capítulos (1, 2, 3...) e anexos (A, B, C...), e anexa o estilo 1–20.
  // ---------------------------------------------------------------------------
  const CAP_TITULO = [
    [/^Identificação do processo/, 'processo'], [/^Solicitante/, 'solicitante'], [/^Finalidade/, 'finalidade'], [/^Objetivo/, 'objetivo'],
    [/^Pressupostos/, 'pressupostos'], [/^Identificação e caracterização/, 'imovel'], [/^Diagnóstico/, 'diagnostico'], [/^Pesquisa de mercado/, 'pesquisa'],
    [/^Método/, 'metodo'], [/^Tratamento/, 'tratamento'], [/^Especificação/, 'especificacao'], [/^Resultado/, 'resultado'], [/^Respostas aos quesitos/, 'quesitos'],
    [/^Encerramento/, 'encerramento'], [/^Anexo — Dados de mercado/, 'anexo_amostras'], [/^Anexo — Fichas/, 'anexo_fichas'], [/^Anexo — Gráficos/, 'anexo_graficos'],
    [/^Anexo — Tratamento estatístico/, 'anexo_estatistico'], [/^Anexo — Origem/, 'anexo_origem'], [/^Anexo — Inventário/, 'anexo_inventario'], [/^Anexo — Documentação/, 'anexo_documentos']
  ];
  L.finalizar = function (laudo, p) {
    const ML = INF.Modelos, c = L.campos(p);
    const modelo = ML ? ML.doProjeto(p) : { nivel: 'completo', nome: '' };
    const caps = ML ? ML.capitulos(modelo, c.anexoCompleto) : null;
    const semNumero = function (t) { return t.replace(/^\d+\.\s+/, '').replace(/^\d+\.\d+\s+/, ''); };
    let B = laudo.blocos;
    // 1) filtra por capítulo (vizinhança tem estrutura própria: não filtra)
    if (caps && !laudo.vizinhanca) {
      let atual = 'capa';
      B = B.filter(function (b) {
        if (b.t === 'h1') {
          const t = semNumero(b.texto);
          const achou = CAP_TITULO.find(function (x) { return x[0].test(t); });
          atual = achou ? achou[1] : atual;
        }
        return caps.indexOf(atual) >= 0;
      });
      // não deixa duas quebras seguidas nem quebra no fim
      B = B.filter(function (b, i) { return !(b.t === 'quebra' && (i === B.length - 1 || B[i + 1].t === 'quebra')); });
    }
    // 2) renumera: capítulos 1, 2, 3 e itens 1.1; anexos A, B, C e itens A.1
    let n = 0, sn = 0, letra = 64, emAnexo = false;
    B.forEach(function (b) {
      if (b.t === 'h1') {
        const t = semNumero(b.texto);
        if (/^Anexo/.test(t)) { emAnexo = true; letra++; sn = 0; b.texto = t.replace(/^Anexo(\s+[A-Z](\.\d+)?)?\s*—\s*/, 'Anexo ' + String.fromCharCode(letra) + ' — '); }
        else { emAnexo = false; n++; sn = 0; b.texto = n + '. ' + t; }
      } else if (b.t === 'h2') {
        sn++;
        b.texto = (emAnexo ? String.fromCharCode(letra) : n) + '.' + sn + ' ' + semNumero(b.texto);
      }
    });
    // 3) sumário depois da capa
    const querSumario = laudo.vizinhanca ? modelo.nivel !== 'simplificado' : (caps ? caps.indexOf('sumario') >= 0 : true);
    const estilo = INF.Estilos ? INF.Estilos.doProjeto(p) : null;
    if (querSumario) {
      const nivel = estilo ? estilo.sumario : 2;
      const itens = B.filter(function (b) { return b.t === 'h1' || (b.t === 'h2' && nivel > 1); }).map(function (b) { return { nivel: b.t === 'h1' ? 1 : 2, texto: b.texto }; });
      const posCapa = B.findIndex(function (b) { return b.t === 'quebra'; });
      B.splice(posCapa + 1, 0, { t: 'sumario', itens: itens, niveis: nivel }, { t: 'quebra' });
    }
    laudo.blocos = B;
    laudo.modelo = modelo;
    laudo.estilo = estilo;
    return laudo;
  };

  // ---------------------------------------------------------------------------
  // Outros achados dos documentos que o avaliador aprovou para o laudo
  // ---------------------------------------------------------------------------
  L.blocoAchados = function (p, B, par) {
    const ach = ((p.laudo || {}).achadosIncluidos || []);
    if (!ach.length) return;
    par('Na análise dos documentos, registro ainda as seguintes informações relevantes:');
    B.push({ t: 'tabela', cab: ['Assunto', 'Informação', 'Fonte'], linhas: ach.map(function (a) { return [a.assunto || '', a.texto || '', a.fonte || '']; }) });
  };

  // ---------------------------------------------------------------------------
  // Anexo: inventário dos documentos (o que foi lido e o que saiu de cada um)
  // ---------------------------------------------------------------------------
  L.anexoInventario = function (p, B, titulo) {
    const inv = p.inventario || {};
    const regs = Object.keys(inv).map(function (h) { return inv[h]; });
    B.push({ t: 'h1', texto: titulo });
    if (!regs.length) { B.push({ t: 'p', texto: falta('inventário dos documentos (aba Laudo completo → Documentos do trabalho)') }); return; }
    B.push({ t: 'p', texto: 'Li integralmente os ' + regs.length + ' documentos abaixo. Os dados que usei neste laudo citam o documento de origem.' });
    B.push({ t: 'tabela', pequena: true, cab: ['Documento', 'Tipo', 'Data', 'Conteúdo'], linhas: regs.map(function (r) {
      return [r.arquivo, String(r.tipo || '').replace(/_/g, ' '), r.dataDocumento ? dataBR(r.dataDocumento) : '', r.resumo || ''];
    }) });
  };

  // ---------------------------------------------------------------------------
  // Laudo de VISTORIA CAUTELAR DE VIZINHANÇA (não avalia valor)
  // ---------------------------------------------------------------------------
  // Registra o estado dos imóveis vizinhos ANTES da obra, para servir de
  // referência em eventual reclamação de dano. Estrutura:
  //   solicitante/processo · objetivo · a obra · metodologia · imóveis
  //   vistoriados (resumo) · um capítulo por imóvel (ambientes, anomalias,
  //   fotos, recusa) · conclusão · encerramento · anexos
  L.montarVizinhanca = function (estado) {
    const p = estado.proj, c = L.campos(p);
    const TL = INF.TiposLaudo, tl = TL.ler(p), judicial = tl.destino === 'judicial';
    const vz = Object.assign(TL.vizinhancaPadrao(), p.vizinhanca || {});
    const ob = Object.assign(TL.vizinhancaPadrao().obra, vz.obra || {});
    const B = [];
    const par = function (t) { B.push({ t: 'p', texto: t }); };
    let nSec = 0, nSub = 0;
    const sec = function (t) { nSec++; nSub = 0; B.push({ t: 'h1', texto: nSec + '. ' + t }); };
    const sub = function (t) { nSub++; B.push({ t: 'h2', texto: nSec + '.' + nSub + ' ' + t }); };
    const autor = ou(p.projeto.autor, 'responsável técnico');
    const fotos = p.fotos || [];
    const imagem = function (f) { B.push({ t: 'imagem', dataUrl: f.dataUrl, titulo: f.legenda || '', largura: f.largura, altura: f.altura }); };
    const imoveis = vz.imoveis || [];

    B.push({ t: 'capa', linhas: [TL.titulo(tl), 'Obra: ' + ou(ob.nome, 'nome da obra'), ou(ob.endereco, 'endereço da obra'),
      imoveis.length + ' imóvel(is) vizinho(s)', 'Data: ' + dataBR(p.projeto.dataBase), autor] });
    B.push({ t: 'quebra' });

    if (judicial) {
      sec('Identificação do processo');
      B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: [['Processo nº', ou(tl.processo, 'número do processo')], ['Juízo', ou(tl.vara, 'vara')], ['Comarca', ou(tl.comarca, 'comarca')],
        ['Autor(es)', ou(tl.autor, 'autor')], ['Réu(s)', ou(tl.reu, 'réu')]] });
    } else {
      sec('Solicitante');
      par('Este trabalho foi solicitado por ' + ou(c.solicitante || ob.construtora, 'nome do solicitante') + '.');
    }
    sec('Objetivo');
    par('O objetivo é registrar o estado de conservação dos imóveis vizinhos à obra antes do início dos serviços, com a descrição e a fotografia das anomalias já existentes, para servir de referência técnica em eventual reclamação futura de dano.');
    sec('A obra');
    B.push({ t: 'tabela', cab: ['Item', 'Informação'], linhas: [['Obra / empreendimento', ou(ob.nome, 'nome da obra')], ['Endereço', ou(ob.endereco, 'endereço da obra')],
      ['Construtora / contratante', ou(ob.construtora, 'construtora')], ['Alvará de construção', ou(ob.alvara, 'alvará')], ['Responsável técnico da obra', ou(ob.responsavel, 'responsável técnico e ART')],
      ['Serviços previstos', ou(ob.tipo, 'serviços previstos (demolição, escavação, fundação...)')], ['Início previsto', ob.inicio ? dataBR(ob.inicio) : falta('início previsto')]] });
    sec('Metodologia');
    par('A vistoria foi visual e não destrutiva, feita ambiente por ambiente, com registro fotográfico datado de cada anomalia encontrada: localização, tipo e, quando mensurável, a dimensão (abertura e extensão de fissuras). Segui a boa prática das perícias de engenharia na construção civil (ABNT NBR 13752). Não fiz ensaios, sondagens nem remoção de revestimentos; ambientes não acessados ficam registrados como tal.');
    par(ou(c.pressupostos, 'pressupostos e ressalvas'));
    L.blocoAchados(p, B, par);

    sec('Imóveis vistoriados');
    if (!imoveis.length) par(falta('imóveis vizinhos vistoriados'));
    else B.push({ t: 'tabela', cab: ['Nº', 'Endereço', 'Ocupante', 'Tipo', 'Data', 'Situação', 'Anomalias'], linhas: imoveis.map(function (im, i) {
      const n = (im.ambientes || []).reduce(function (s, a) { return s + (a.anomalias || []).length; }, 0);
      return [String(i + 1), im.endereco || falta('endereço'), im.ocupante || '', im.tipo || '', im.dataVistoria ? dataBR(im.dataVistoria) : '', im.recusou ? 'recusou a vistoria' : 'vistoriado', im.recusou ? '—' : String(n)];
    }) });

    imoveis.forEach(function (im, i) {
      sec('Imóvel ' + (i + 1) + ' — ' + (im.endereco || 'endereço a preencher'));
      if (im.recusou) {
        par('O ocupante não permitiu a vistoria' + (im.motivoRecusa ? ' (' + im.motivoRecusa + ')' : '') + (im.dataVistoria ? ', em ' + dataExtenso(im.dataVistoria) : '') + '. Registrei apenas o aspecto externo visível da via pública.');
      } else {
        par('Vistoriei o imóvel em ' + (im.dataVistoria ? dataExtenso(im.dataVistoria) : falta('data da vistoria')) + (im.acompanhante ? ', acompanhado de ' + im.acompanhante : '') + '. ' +
          'Trata-se de ' + (im.tipo || falta('tipo do imóvel')).toLowerCase() + (im.pavimentos ? ' com ' + im.pavimentos + ' pavimento(s)' : '') + (im.padrao ? ', padrão ' + im.padrao.toLowerCase() : '') +
          (im.idade ? ', com idade aparente de ' + im.idade + ' anos' : '') + '. Estado geral de conservação: ' + (im.conservacao || falta('estado de conservação')) + '.');
      }
      if (im.obs) par(im.obs);
      (im.ambientes || []).forEach(function (a) {
        sub(a.nome || 'Ambiente');
        if (!(a.anomalias || []).length) par('Não encontrei anomalias neste ambiente.');
        else B.push({ t: 'tabela', cab: ['Anomalia', 'Localização', 'Dimensão', 'Descrição'], linhas: a.anomalias.map(function (x) { return [x.tipo || '', x.localizacao || '', x.dimensao || '', x.descricao || '']; }) });
      });
      const fotosIm = fotos.filter(function (f) { return f.alvo === 'vizinho:' + i; });
      if (fotosIm.length) { sub('Registro fotográfico'); fotosIm.forEach(imagem); }
      else if (!im.recusou) par(falta('fotografias do imóvel ' + (i + 1)));
    });

    sec('Conclusão');
    const vist = imoveis.filter(function (im) { return !im.recusou; });
    const comAnom = vist.filter(function (im) { return (im.ambientes || []).some(function (a) { return (a.anomalias || []).length; }); });
    par('Vistoriei ' + vist.length + ' imóvel(is) vizinho(s) à obra' + (imoveis.length - vist.length ? '; ' + (imoveis.length - vist.length) + ' ocupante(s) recusaram a vistoria' : '') + '. ' +
      comAnom.length + ' imóvel(is) apresentam anomalias preexistentes, descritas e fotografadas neste laudo, que registra o estado dos imóveis antes do início da obra.');

    sec('Encerramento');
    par('Nada mais havendo a relatar, encerro este laudo, que segue assinado, com o inventário dos documentos em anexo.');
    B.push({ t: 'assinatura', linhas: [ou(c.cidade || (p.projeto.municipio || '').split('/')[0], 'cidade') + ', ' + dataExtenso(new Date().toISOString().slice(0, 10)) + '.',
      autor, ou(c.titulo, 'título profissional') + ' — ' + ou(c.registro, 'CREA'), c.art ? 'ART nº ' + c.art : falta('número da ART')] });
    B.push({ t: 'quebra' });
    L.anexoInventario(p, B, 'Anexo — Inventário dos documentos');
    L.anexoOrigem(p, B);
    return L.finalizar({ blocos: B, autor: p.projeto.autor || '', titulo: TL.titulo(tl) + ' — ' + (ob.nome || p.projeto.nome || ''), vizinhanca: true }, p);
  };

  // ---------------------------------------------------------------------------
  // Saída em HTML (para imprimir em PDF) — aplica o estilo 1–20
  // ---------------------------------------------------------------------------
  const CSS_GRAF = [
    '.g-grade{stroke:#e3e3e3}.g-borda{fill:none;stroke:#888}.g-texto{font:10px Arial;fill:#444}.g-titulo{font:bold 11px Arial;fill:#222}.g-ponto{fill:#2d5b8a}.g-ponto-alerta{fill:#c0392b}',
    '.g-linha{stroke:#555;stroke-dasharray:4 3}.g-limite{stroke:#c0392b;stroke-dasharray:2 3}.g-barra{fill:#9db7d3}.g-curva{fill:none;stroke:#c0392b;stroke-width:1.5}.g-num{font:9px Arial;fill:#333}.g-avaliando{fill:#e0a000;stroke:#333}.g-raio{fill:#2d5b8a;fill-opacity:.06;stroke:#2d5b8a;stroke-dasharray:5 4}'
  ].join('\n');
  L.CSS_GRAFICO = CSS_GRAF;
  const ESTILO_PADRAO = { capa: 'centro', fonte: 'Arial', titulo: 'Arial', tam: 11, linha: 1.5, cor: '1F1F1F', tabela: 'grade', caixa: true, cabecalho: false, rodape: 'pagina', fotos: 1, sumario: 2 };

  function cssDoEstilo(e, titulo, autor) {
    const cor = '#' + e.cor;
    const q = function (t) { return '"' + String(t || '').replace(/["\\]/g, '') + '"'; };
    let css = '@page{size:A4;margin:3cm 2cm 2cm 3cm;'
      + (e.cabecalho ? '@top-right{content:' + q(titulo) + ';font:8pt ' + e.fonte + ';color:#777}' : '')
      + '@bottom-right{content:counter(page);font:9pt ' + e.fonte + '}'
      + (e.rodape === 'pagina-autor' ? '@bottom-left{content:' + q(autor) + ';font:8pt ' + e.fonte + ';color:#777}' : '') + '}'
      + '@page:first{@top-right{content:none}@bottom-right{content:none}@bottom-left{content:none}}'
      + 'body{font-family:"' + e.fonte + '",Arial,sans-serif;font-size:' + e.tam + 'pt;line-height:' + e.linha + ';color:#111;max-width:17cm;margin:0 auto}'
      + 'h1,h2{font-family:"' + e.titulo + '",Arial,sans-serif;color:' + cor + '}h1{font-size:' + (e.tam + 1.5) + 'pt;margin:18pt 0 6pt;' + (e.caixa ? 'text-transform:uppercase;' : '') + '}h2{font-size:' + (e.tam + 0.5) + 'pt;margin:12pt 0 4pt}'
      + 'p{text-align:justify;margin:0 0 8pt}p.mono{font-family:Consolas,monospace;font-size:9.5pt;text-align:left;background:#f4f4f4;padding:6pt}p.destaque{font-weight:bold}'
      + 'table{border-collapse:collapse;width:100%;margin:6pt 0 10pt;font-size:' + (e.tam - 1.5) + 'pt}th,td{padding:2pt 5pt;text-align:left;vertical-align:top}table.pequena{font-size:' + Math.max(7, e.tam - 3.5) + 'pt}';
    if (e.tabela === 'grade') css += 'th,td{border:1px solid #888}th{background:#e8e8e8}';
    if (e.tabela === 'zebra') css += 'th,td{border:1px solid #d0d0d0}th{background:' + cor + ';color:#fff}tbody tr:nth-child(even) td{background:#f3f3f3}';
    if (e.tabela === 'linhas') css += 'th,td{border-bottom:1px solid #bbb}th{border-bottom:2px solid ' + cor + '}';
    if (e.tabela === 'minima') css += 'th{border-bottom:1.5px solid #333}table{border-bottom:1.5px solid #333}';
    css += 'mark{background:#fff27a}.quebra{page-break-after:always}.graf{page-break-inside:avoid;margin:8pt 0}.graf svg{width:100%;height:auto}'
      + '.foto img{max-width:100%;max-height:12cm;display:block;margin:0 auto}.legenda{text-align:center;font-style:italic;font-size:9pt}'
      + '.fotos2{display:grid;grid-template-columns:1fr 1fr;gap:10pt}.fotos2 .foto img{max-height:8cm}'
      + '.assin{margin-top:36pt;text-align:center}.assin .linha{margin-top:40pt;border-top:1px solid #000;width:9cm;margin-left:auto;margin-right:auto}'
      + '.sumario h1{text-transform:none}.sumario .s1{font-weight:bold;margin:4pt 0 0}.sumario .s2{margin:1pt 0 0 1cm}'
      // capas
      + '.capa{min-height:24cm;box-sizing:border-box}.capa p{margin:.35cm 0}.capa .c0{font-size:22pt;font-weight:bold;letter-spacing:.5px}.capa .c1{font-size:14pt;color:' + cor + '}'
      + '.capa-centro{text-align:center;padding-top:6cm}'
      + '.capa-faixa{text-align:center;padding-top:4cm}.capa-faixa .faixa{background:' + cor + ';color:#fff;padding:1.2cm .8cm;margin-bottom:1cm}.capa-faixa .faixa .c1{color:#fff}'
      + '.capa-lateral{display:flex}.capa-lateral .barra{width:1.4cm;background:' + cor + '}.capa-lateral .texto{padding:7cm 0 0 1cm;text-align:left}'
      + '.capa-moldura{border:5px double ' + cor + ';padding:5cm 1cm 1cm;text-align:center}'
      + '.capa-minima{text-align:left;padding-top:2cm}.capa-minima .c0{font-size:24pt;color:' + cor + '}.capa-minima .resto{margin-top:12cm;font-size:10pt}';
    return css + CSS_GRAF;
  }

  const marcar = function (t) { return U.esc(t).replace(/\[preencher:[^\]]*\]/g, function (x) { return '<mark>' + x + '</mark>'; }); };
  function capaHtml(linhas, e) {
    const l = linhas.map(function (x, i) { return '<p class="c' + Math.min(i, 2) + '">' + marcar(x) + '</p>'; });
    switch (e.capa) {
      case 'faixa': return '<div class="capa capa-faixa"><div class="faixa">' + l.slice(0, 2).join('') + '</div>' + l.slice(2).join('') + '</div>';
      case 'lateral': return '<div class="capa capa-lateral"><div class="barra"></div><div class="texto">' + l.join('') + '</div></div>';
      case 'moldura': return '<div class="capa capa-moldura">' + l.join('') + '</div>';
      case 'minima': return '<div class="capa capa-minima">' + l.slice(0, 2).join('') + '<div class="resto">' + l.slice(2).join('') + '</div></div>';
      default: return '<div class="capa capa-centro">' + l.join('') + '</div>';
    }
  }
  L.html = function (laudo) {
    const e = laudo.estilo || ESTILO_PADRAO;
    let h = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + U.esc(laudo.titulo) + '</title><style>' + cssDoEstilo(e, laudo.titulo, laudo.autor) + '</style></head><body>';
    const B = laudo.blocos;
    for (let i = 0; i < B.length; i++) {
      const b = B[i];
      switch (b.t) {
        case 'capa': h += capaHtml(b.linhas, e); break;
        case 'sumario': h += '<div class="sumario"><h1>Sumário</h1>' + b.itens.map(function (it) { return '<p class="s' + it.nivel + '">' + U.esc(it.texto) + '</p>'; }).join('') + '</div>'; break;
        case 'h1': h += '<h1>' + marcar(b.texto) + '</h1>'; break;
        case 'h2': h += '<h2>' + marcar(b.texto) + '</h2>'; break;
        case 'p': h += '<p class="' + (b.mono ? 'mono' : '') + (b.destaque ? ' destaque' : '') + '">' + marcar(b.texto) + '</p>'; break;
        case 'tabela': h += '<table class="' + (b.pequena ? 'pequena' : '') + '"><thead><tr>' + b.cab.map(function (c) { return '<th>' + U.esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
          + b.linhas.map(function (l) { return '<tr>' + l.map(function (c) { return '<td>' + marcar(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; break;
        case 'grafico': h += '<div class="graf">' + b.svg + '</div>'; break;
        case 'imagem': {
          // fotos seguidas: uma ou duas por linha, conforme o estilo
          const grupo = [];
          while (i < B.length && B[i].t === 'imagem') grupo.push(B[i++]);
          i--;
          const fig = function (x) { return '<div class="graf foto"><img src="' + x.dataUrl + '" alt="' + U.esc(x.titulo) + '"><div class="legenda">' + U.esc(x.titulo) + '</div></div>'; };
          h += e.fotos === 2 && grupo.length > 1 ? '<div class="fotos2">' + grupo.map(fig).join('') + '</div>' : grupo.map(fig).join('');
          break;
        }
        case 'quebra': h += '<div class="quebra"></div>'; break;
        case 'assinatura': h += '<div class="assin"><p>' + marcar(b.linhas[0]) + '</p><div class="linha"></div>' + b.linhas.slice(1).map(function (l) { return '<div>' + marcar(l) + '</div>'; }).join('') + '</div>'; break;
      }
    }
    return h + '</body></html>';
  };

  // ---------------------------------------------------------------------------
  // Saída em Word (.docx) — aplica o estilo 1–20
  // ---------------------------------------------------------------------------
  // imagens: { indiceDoBloco: { png: Uint8Array, largura, altura } } — os
  // gráficos já convertidos em PNG pela tela (o Word não lê SVG antigo).
  L.docx = function (laudo, imagens) {
    const X = INF.Planilha.xmlEsc;
    const e = laudo.estilo || ESTILO_PADRAO;
    const rels = [], midia = [];
    let idDesenho = 1;
    const meioPt = function (pt) { return Math.round(pt * 2); };

    // texto com os trechos "[preencher: ...]" realçados em amarelo
    const runs = function (texto, opcoes) {
      const op = opcoes || {};
      const pr = '<w:rPr>' + (op.negrito ? '<w:b/>' : '') + (op.cor ? '<w:color w:val="' + op.cor + '"/>' : '')
        + (op.mono ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/>' : '') + (op.tam ? '<w:sz w:val="' + op.tam + '"/>' : '') + '</w:rPr>';
      return String(texto).split(/(\[preencher:[^\]]*\])/).filter(Boolean).map(function (pedaco) {
        const marca = /^\[preencher:/.test(pedaco);
        return '<w:r>' + (marca ? pr.replace('</w:rPr>', '<w:highlight w:val="yellow"/></w:rPr>') : pr) + '<w:t xml:space="preserve">' + X(pedaco) + '</w:t></w:r>';
      }).join('');
    };
    const paragrafo = function (texto, estilo, opcoes) {
      const op = opcoes || {};
      return '<w:p><w:pPr>' + (estilo ? '<w:pStyle w:val="' + estilo + '"/>' : '') + (op.antes ? '<w:spacing w:before="' + op.antes + '"/>' : '')
        + (op.centro ? '<w:jc w:val="center"/>' : (op.esquerda ? '<w:jc w:val="left"/>' : '')) + '</w:pPr>' + runs(texto, op) + '</w:p>';
    };
    const borda = function (lados, sz, cor, tipo) {
      return lados.map(function (l) { return '<w:' + l + ' w:val="' + (tipo || 'single') + '" w:sz="' + sz + '" w:space="0" w:color="' + cor + '"/>'; }).join('');
    };
    const tabela = function (b) {
      const nc = b.cab.length, larg = Math.floor(9070 / nc);
      const tam = b.pequena ? meioPt(Math.max(7, e.tam - 3.5)) : meioPt(e.tam - 1.5);
      const fundoCab = e.tabela === 'zebra' ? e.cor : (e.tabela === 'grade' ? 'E8E8E8' : null);
      const corCab = e.tabela === 'zebra' ? 'FFFFFF' : null;
      const cel = function (t, cab, zebra) {
        let pr = '<w:tcW w:w="' + larg + '" w:type="dxa"/>';
        if (cab && fundoCab) pr += '<w:shd w:val="clear" w:color="auto" w:fill="' + fundoCab + '"/>';
        else if (zebra) pr += '<w:shd w:val="clear" w:color="auto" w:fill="F3F3F3"/>';
        if (cab && e.tabela === 'linhas') pr += '<w:tcBorders>' + borda(['bottom'], 12, e.cor) + '</w:tcBorders>';
        return '<w:tc><w:tcPr>' + pr + '</w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' + runs(t, { negrito: cab, tam: tam, cor: cab ? corCab : null }) + '</w:p></w:tc>';
      };
      let bordas;
      if (e.tabela === 'grade') bordas = borda(['top', 'left', 'bottom', 'right', 'insideH', 'insideV'], 4, '888888');
      else if (e.tabela === 'zebra') bordas = borda(['top', 'left', 'bottom', 'right', 'insideH', 'insideV'], 4, 'D0D0D0');
      else if (e.tabela === 'linhas') bordas = borda(['bottom', 'insideH'], 4, 'BBBBBB');
      else bordas = borda(['top', 'bottom'], 12, '333333');
      return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + bordas + '</w:tblBorders><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'
        + b.cab.map(function () { return '<w:gridCol w:w="' + larg + '"/>'; }).join('') + '</w:tblGrid>'
        + '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + b.cab.map(function (c) { return cel(c, true); }).join('') + '</w:tr>'
        + b.linhas.map(function (l, k) { return '<w:tr>' + l.map(function (c) { return cel(c, false, e.tabela === 'zebra' && k % 2 === 1); }).join('') + '</w:tr>'; }).join('')
        + '</w:tbl><w:p/>';
    };
    // foto guardada como "data:image/jpeg;base64,..." → bytes
    const deDataUrl = function (b) {
      const m = /^data:image\/(png|jpeg);base64,(.*)$/.exec(b.dataUrl || '');
      const bin = m ? atob(m[2]) : '';
      const bytes = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
      return { png: bytes, ext: m && m[1] === 'jpeg' ? 'jpeg' : 'png', largura: b.largura || 4, altura: b.altura || 3 };
    };
    // desenho em linha; largura máxima em EMU (1 cm = 360.000)
    const desenho = function (img, larguraMax, alturaMax) {
      const n = midia.length + 1, rid = 'rIdImg' + n, ext = img.ext || 'png';
      midia.push({ nome: 'word/media/imagem' + n + '.' + ext, bytes: img.png });
      rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/imagem' + n + '.' + ext + '"/>');
      let cx = larguraMax, cy = Math.round(cx * img.altura / img.largura);
      if (cy > alturaMax) { cx = Math.round(cx * alturaMax / cy); cy = alturaMax; }
      const id = idDesenho++;
      return '<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/>'
        + '<wp:docPr id="' + id + '" name="Imagem ' + id + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        + '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="imagem' + n + '.' + ext + '"/><pic:cNvPicPr/></pic:nvPicPr>'
        + '<pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        + '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
    };
    const figura = function (img, titulo) {
      return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr>' + desenho(img, 5400000, 4320000) + '</w:p>' + paragrafo(titulo, 'Legenda');
    };
    // duas fotos por linha: tabela sem bordas de 2 colunas
    const fotosEmDuas = function (lista) {
      let x = '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + borda(['top', 'left', 'bottom', 'right', 'insideH', 'insideV'], 0, 'FFFFFF', 'nil') + '</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="4535"/><w:gridCol w:w="4535"/></w:tblGrid>';
      for (let k = 0; k < lista.length; k += 2) {
        x += '<w:tr>' + [lista[k], lista[k + 1]].map(function (it) {
          if (!it) return '<w:tc><w:tcPr><w:tcW w:w="4535" w:type="dxa"/></w:tcPr><w:p/></w:tc>';
          return '<w:tc><w:tcPr><w:tcW w:w="4535" w:type="dxa"/></w:tcPr><w:p><w:pPr><w:jc w:val="center"/></w:pPr>' + desenho(it.img, 2700000, 2600000) + '</w:p>' + paragrafo(it.titulo, 'Legenda') + '</w:tc>';
        }).join('') + '</w:tr>';
      }
      return x + '</w:tbl><w:p/>';
    };
    // capas
    const capa = function (linhas) {
      const l = linhas;
      const grande = function (t, cor, centro) { return paragrafo(t, 'Titulo', { centro: centro !== false, esquerda: centro === false, cor: cor }); };
      const media = function (t, cor, centro) { return paragrafo(t, '', { centro: centro !== false, esquerda: centro === false, tam: 28, cor: cor }); };
      const demais = function (arr, centro) { return arr.map(function (t) { return paragrafo(t, '', { centro: centro !== false, esquerda: centro === false }); }).join(''); };
      const celula = function (conteudo, largura, fundo, extra) {
        return '<w:tc><w:tcPr><w:tcW w:w="' + largura + '" w:type="dxa"/>' + (fundo ? '<w:shd w:val="clear" w:color="auto" w:fill="' + fundo + '"/>' : '') + (extra || '') + '</w:tcPr>' + (conteudo || '<w:p/>') + '</w:tc>';
      };
      const tbl = function (bordas, grid, linhasXml) { return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>' + bordas + '</w:tblBorders></w:tblPr><w:tblGrid>' + grid + '</w:tblGrid>' + linhasXml + '</w:tbl>'; };
      const semBorda = borda(['top', 'left', 'bottom', 'right', 'insideH', 'insideV'], 0, 'FFFFFF', 'nil');
      switch (e.capa) {
        case 'faixa':
          return '<w:p><w:pPr><w:spacing w:before="1800"/></w:pPr></w:p>'
            + tbl(semBorda, '<w:gridCol w:w="9070"/>', '<w:tr><w:trPr><w:trHeight w:val="2400"/></w:trPr>' + celula('<w:p><w:pPr><w:spacing w:before="400"/></w:pPr></w:p>' + grande(l[0], 'FFFFFF') + media(l[1], 'FFFFFF'), 9070, e.cor, '<w:vAlign w:val="center"/>') + '</w:tr>')
            + '<w:p><w:pPr><w:spacing w:before="1200"/></w:pPr></w:p>' + demais(l.slice(2));
        case 'lateral':
          return tbl(semBorda, '<w:gridCol w:w="800"/><w:gridCol w:w="8270"/>', '<w:tr><w:trPr><w:trHeight w:val="13200"/></w:trPr>' + celula('<w:p/>', 800, e.cor)
            + celula('<w:p><w:pPr><w:spacing w:before="3600"/></w:pPr></w:p>' + grande(l[0], e.cor, false) + media(l[1], null, false) + demais(l.slice(2), false), 8270, null, '<w:tcMar><w:left w:w="400" w:type="dxa"/></w:tcMar>') + '</w:tr>');
        case 'moldura':
          return tbl(borda(['top', 'left', 'bottom', 'right'], 18, e.cor, 'double'), '<w:gridCol w:w="9070"/>',
            '<w:tr><w:trPr><w:trHeight w:val="13200"/></w:trPr>' + celula(grande(l[0]) + media(l[1], e.cor) + demais(l.slice(2)), 9070, null, '<w:vAlign w:val="center"/>') + '</w:tr>');
        case 'minima':
          return grande(l[0], e.cor, false) + media(l[1], null, false) + '<w:p><w:pPr><w:spacing w:before="6500"/></w:pPr></w:p>' + demais(l.slice(2), false);
        default:
          return '<w:p><w:pPr><w:spacing w:before="3000"/></w:pPr></w:p>' + grande(l[0]) + media(l[1], e.cor) + demais(l.slice(2));
      }
    };
    // sumário: campo TOC do Word (atualiza ao abrir) com a lista já escrita
    const sumario = function (b) {
      const itens = b.itens.length ? b.itens : [{ nivel: 1, texto: '' }];
      let x = paragrafo('Sumário', 'TituloSumario');
      itens.forEach(function (it, k) {
        const ini = k === 0 ? '<w:r><w:fldChar w:fldCharType="begin" w:dirty="true"/></w:r><w:r><w:instrText xml:space="preserve"> TOC \\o "1-' + (b.niveis || 2) + '" \\h \\z \\u </w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r>' : '';
        const fim = k === itens.length - 1 ? '<w:r><w:fldChar w:fldCharType="end"/></w:r>' : '';
        x += '<w:p><w:pPr><w:pStyle w:val="Sumario' + it.nivel + '"/></w:pPr>' + ini + runs(it.texto) + fim + '</w:p>';
      });
      return x;
    };

    let corpo = '';
    const B = laudo.blocos;
    for (let i = 0; i < B.length; i++) {
      const b = B[i];
      switch (b.t) {
        case 'capa': corpo += capa(b.linhas); break;
        case 'sumario': corpo += sumario(b); break;
        case 'h1': corpo += paragrafo(b.texto, 'Titulo1'); break;
        case 'h2': corpo += paragrafo(b.texto, 'Titulo2'); break;
        case 'p': corpo += paragrafo(b.texto, b.mono ? '' : 'Corpo', { mono: b.mono, negrito: b.destaque }); break;
        case 'tabela': corpo += tabela(b); break;
        case 'grafico': if (imagens && imagens[i]) corpo += figura(imagens[i], b.titulo); break;
        case 'imagem': {
          const grupo = [];
          while (i < B.length && B[i].t === 'imagem') { grupo.push({ img: deDataUrl(B[i]), titulo: B[i].titulo }); i++; }
          i--;
          corpo += e.fotos === 2 && grupo.length > 1 ? fotosEmDuas(grupo) : grupo.map(function (g) { return figura(g.img, g.titulo); }).join('');
          break;
        }
        case 'quebra': corpo += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; break;
        case 'assinatura':
          corpo += paragrafo(b.linhas[0], 'Corpo');
          corpo += '<w:p><w:pPr><w:spacing w:before="1200"/><w:jc w:val="center"/></w:pPr><w:r><w:t>______________________________________</w:t></w:r></w:p>';
          b.linhas.slice(1).forEach(function (l) { corpo += paragrafo(l, '', { centro: true }); });
          break;
      }
    }

    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      + 'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
    // página A4, margens ABNT; capa sem cabeçalho/rodapé (titlePg)
    const documento = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + corpo
      + '<w:sectPr>' + (e.cabecalho ? '<w:headerReference w:type="default" r:id="rIdCabecalho"/>' : '') + '<w:footerReference w:type="default" r:id="rIdRodape"/>'
      + '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/><w:titlePg/></w:sectPr></w:body></w:document>';
    const campoPagina = '<w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>';
    const rodape = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + NS + '><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9070"/></w:tabs>' + (e.rodape === 'pagina-autor' ? '' : '<w:jc w:val="right"/>') + '</w:pPr>'
      + (e.rodape === 'pagina-autor' ? '<w:r><w:rPr><w:sz w:val="16"/><w:color w:val="777777"/></w:rPr><w:t xml:space="preserve">' + X(laudo.autor || '') + '</w:t></w:r><w:r><w:tab/></w:r>' : '') + campoPagina + '</w:p></w:ftr>';
    const cabecalho = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr ' + NS + '><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="' + e.cor + '"/></w:pBdr><w:jc w:val="right"/></w:pPr>'
      + '<w:r><w:rPr><w:sz w:val="16"/><w:color w:val="777777"/></w:rPr><w:t xml:space="preserve">' + X(laudo.titulo || '') + '</w:t></w:r></w:p></w:hdr>';
    const fonte = function (f) { return '<w:rFonts w:ascii="' + X(f) + '" w:hAnsi="' + X(f) + '" w:eastAsia="' + X(f) + '" w:cs="' + X(f) + '"/>'; };
    const estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + '<w:docDefaults><w:rPrDefault><w:rPr>' + fonte(e.fonte) + '<w:sz w:val="' + meioPt(e.tam) + '"/><w:szCs w:val="' + meioPt(e.tam) + '"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault>'
      + '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="' + Math.round(e.linha * 240) + '" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
      + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Corpo"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="both"/></w:pPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr>' + fonte(e.titulo) + '<w:b/><w:sz w:val="44"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Corpo"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr>' + fonte(e.titulo) + '<w:b/>' + (e.caixa ? '<w:caps/>' : '') + '<w:color w:val="' + e.cor + '"/><w:sz w:val="' + meioPt(e.tam + 1.5) + '"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Corpo"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr>' + fonte(e.titulo) + '<w:b/><w:color w:val="' + e.cor + '"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="TituloSumario"><w:name w:val="TOC Heading"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="240"/></w:pPr><w:rPr>' + fonte(e.titulo) + '<w:b/><w:color w:val="' + e.cor + '"/><w:sz w:val="' + meioPt(e.tam + 3) + '"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Sumario1"><w:name w:val="toc 1"/><w:basedOn w:val="Normal"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9060"/></w:tabs><w:spacing w:before="80" w:after="0"/></w:pPr><w:rPr><w:b/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Sumario2"><w:name w:val="toc 2"/><w:basedOn w:val="Normal"/><w:pPr><w:tabs><w:tab w:val="right" w:leader="dot" w:pos="9060"/></w:tabs><w:spacing w:before="0" w:after="0"/><w:ind w:left="440"/></w:pPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Legenda"><w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:sz w:val="18"/></w:rPr></w:style>'
      + '</w:styles>';
    // o Word pergunta se atualiza os campos ao abrir: é o que preenche as páginas do sumário
    const config = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:updateFields w:val="true"/><w:defaultTabStop w:val="708"/></w:settings>';
    const agora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    // propriedades do arquivo: autor = responsável técnico (nada de nome de programa)
    const nucleo = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
      + '<dc:title>' + X(laudo.titulo) + '</dc:title><dc:creator>' + X(laudo.autor) + '</dc:creator><cp:lastModifiedBy>' + X(laudo.autor) + '</cp:lastModifiedBy>'
      + '<dcterms:created xsi:type="dcterms:W3CDTF">' + agora + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + agora + '</dcterms:modified></cp:coreProperties>';

    const arquivos = [
      { nome: '[Content_Types].xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>'
        + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
        + '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
        + '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>'
        + (e.cabecalho ? '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>' : '')
        + '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
      { nome: '_rels/.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
      { nome: 'docProps/core.xml', texto: nucleo },
      { nome: 'word/document.xml', texto: documento },
      { nome: 'word/styles.xml', texto: estilos },
      { nome: 'word/settings.xml', texto: config },
      { nome: 'word/footer1.xml', texto: rodape },
      { nome: 'word/_rels/document.xml.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdEstilos" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
        + '<Relationship Id="rIdConfig" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>'
        + '<Relationship Id="rIdRodape" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
        + (e.cabecalho ? '<Relationship Id="rIdCabecalho" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>' : '') + rels.join('') + '</Relationships>' }
    ].concat(e.cabecalho ? [{ nome: 'word/header1.xml', texto: cabecalho }] : []).concat(midia);
    return INF.Planilha.zip(arquivos);
  };

  INF.Laudo = L;
})(globalThis.INF = globalThis.INF || {});
````

## motor/19-tipos-laudo.js
<a id="motor-19-tipos-laudo-js"></a>

````javascript
/* =============================================================================
   19-tipos-laudo.js — Tipos de laudo: imóvel, destino e objeto do valor
   -----------------------------------------------------------------------------
   O avaliador marca três coisas e o laudo se monta de acordo:

     1) ÂMBITO e TIPO DO IMÓVEL  — urbano (apartamento, casa, loja...) ou rural
        (fazenda, sítio, gleba...). Rural segue também a NBR 14.653-3.
     2) DESTINO — para quem é o laudo: banco (garantia), judicial, particular,
        órgão público. Judicial vira "Laudo pericial", com processo, partes,
        diligência e quesitos.
     3) OBJETO DO VALOR — o que se está avaliando (pode marcar mais de um):
        pleno domínio, servidão administrativa, desvalorização do remanescente,
        valor locativo, liquidação forçada, terra nua + benfeitorias,
        desapropriação, partilha...

   ATALHOS reproduzem as combinações mais usadas ("Judicial — servidão e pleno
   domínio" = destino judicial + pleno domínio + servidão).

   As contas extras ficam aqui também:
     · servidão:      indenização = VU × área da faixa × coeficiente de servidão
                      + benfeitorias atingidas
     · remanescente:  desvalorização = VU × área remanescente × percentual
     · liquidação forçada: VLF = V ÷ (1 + i)ⁿ  (i = taxa mensal, n = meses de
                      absorção pelo mercado)
     · terra nua + benfeitorias: valor total = VTN + Σ benfeitorias
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const TL = {};

  TL.IMOVEIS = {
    urbano: ['Apartamento', 'Cobertura', 'Kitnet / studio', 'Casa', 'Casa em condomínio', 'Sobrado', 'Terreno / lote', 'Lote em condomínio',
      'Sala comercial', 'Loja', 'Galpão / barracão', 'Prédio comercial', 'Imóvel misto (residencial e comercial)', 'Vaga de garagem',
      'Hotel / pousada', 'Posto de combustível', 'Gleba urbanizável', 'Área institucional', 'Outro urbano'],
    rural: ['Fazenda', 'Sítio', 'Chácara / recreio', 'Gleba rural (terra nua)', 'Área de lavoura', 'Área de pastagem', 'Área irrigada (pivô)',
      'Área de reflorestamento', 'Área de reserva / preservação', 'Faixa de servidão', 'Imóvel rural com benfeitorias', 'Agroindústria', 'Outro rural']
  };

  TL.DESTINOS = [
    { id: 'banco', rotulo: 'Banco — garantia / financiamento', ajuda: 'Caixa, Banco do Brasil, cooperativas, alienação fiduciária.' },
    { id: 'judicial', rotulo: 'Judicial (perícia)', ajuda: 'Perito do juízo ou assistente técnico: processo, partes, diligência e quesitos.' },
    { id: 'particular', rotulo: 'Particular / extrajudicial', ajuda: 'Compra e venda, negociação, assessoria.' },
    { id: 'publico', rotulo: 'Órgão público / concessionária', ajuda: 'Prefeitura, estado, concessionária de energia, rodovia, saneamento.' }
  ];

  TL.OBJETOS = [
    { id: 'pleno', rotulo: 'Pleno domínio (valor de mercado do imóvel)' },
    { id: 'servidao', rotulo: 'Servidão administrativa (indenização da faixa)' },
    { id: 'remanescente', rotulo: 'Desvalorização da área remanescente' },
    { id: 'desapropriacao', rotulo: 'Desapropriação (justa indenização)' },
    { id: 'vtn', rotulo: 'Terra nua + benfeitorias em separado (rural)' },
    { id: 'locativo', rotulo: 'Valor locativo (aluguel)' },
    { id: 'liquidacao', rotulo: 'Valor de liquidação forçada' },
    { id: 'partilha', rotulo: 'Inventário / partilha / divórcio' },
    { id: 'contabil', rotulo: 'Contábil / patrimonial / seguro' },
    { id: 'vizinhanca', rotulo: 'Vistoria cautelar de vizinhança (estado dos vizinhos antes de obra)' }
  ];

  TL.ATALHOS = [
    { rotulo: 'Banco (garantia)', destino: 'banco', objetos: ['pleno', 'liquidacao'] },
    { rotulo: 'Judicial — valor', destino: 'judicial', objetos: ['pleno'] },
    { rotulo: 'Judicial — servidão', destino: 'judicial', objetos: ['servidao'] },
    { rotulo: 'Judicial — servidão e pleno domínio', destino: 'judicial', objetos: ['pleno', 'servidao'] },
    { rotulo: 'Judicial — servidão, pleno domínio e remanescente', destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente'] },
    { rotulo: 'Pleno domínio rural', destino: 'particular', objetos: ['pleno', 'vtn'], ambito: 'rural' },
    { rotulo: 'Pleno domínio urbano', destino: 'particular', objetos: ['pleno'], ambito: 'urbano' },
    { rotulo: 'Servidão (concessionária)', destino: 'publico', objetos: ['servidao'] },
    { rotulo: 'Desapropriação', destino: 'judicial', objetos: ['desapropriacao', 'pleno'] },
    { rotulo: 'Locação / revisional', destino: 'particular', objetos: ['locativo'] },
    { rotulo: 'Inventário / partilha', destino: 'judicial', objetos: ['partilha', 'pleno'] },
    { rotulo: 'Vistoria de vizinhança', destino: 'particular', objetos: ['vizinhanca'] },
    { rotulo: 'Vizinhança judicial (produção antecipada de prova)', destino: 'judicial', objetos: ['vizinhanca'] }
  ];

  // Configuração padrão do tipo de laudo dentro do projeto.
  TL.padrao = function () {
    return {
      ambito: 'urbano', imovel: '', destino: 'particular', objetos: ['pleno'],
      // banco
      banco: '', contrato: '', proponente: '',
      // judicial
      processo: '', vara: '', comarca: '', autor: '', reu: '', funcao: 'Perito do Juízo', assistentes: '', objetoPericia: '',
      quesitos: [],                 // [{ parte, pergunta, resposta }]
      // servidão / remanescente / desapropriação
      areaTotal: null, areaFaixa: null, coefServidao: null, justifServidao: '', benfeitoriasAtingidas: null,
      areaRemanescente: null, percRemanescente: null, justifRemanescente: '',
      // liquidação forçada
      prazoAbsorcao: null, taxaMensal: null,
      // terra nua + benfeitorias
      benfeitorias: []              // [{ descricao, quantidade, unidade, unitario, depreciacao }]
    };
  };
  TL.ler = function (proj) {
    const t = Object.assign(TL.padrao(), proj.tipoLaudo || {});
    if (!t.imovel) t.imovel = proj.projeto.tipologia || '';
    if (/rural|fazenda|s[ií]tio|ch[áa]cara|gleba rural/i.test(t.imovel) && !proj.tipoLaudo) t.ambito = 'rural';
    return t;
  };
  TL.tem = function (t, objeto) { return (t.objetos || []).indexOf(objeto) >= 0; };

  // Título do documento conforme o destino.
  TL.titulo = function (t) {
    if (TL.soVizinhanca(t)) return t.destino === 'judicial' ? 'LAUDO PERICIAL DE VISTORIA CAUTELAR DE VIZINHANÇA' : 'LAUDO DE VISTORIA CAUTELAR DE VIZINHANÇA';
    if (t.destino === 'judicial') return t.funcao === 'Assistente Técnico' ? 'PARECER TÉCNICO' : 'LAUDO PERICIAL';
    return 'LAUDO DE AVALIAÇÃO';
  };
  // Vizinhança não avalia valor: o laudo não usa o tratamento estatístico.
  TL.soVizinhanca = function (t) { return (t.objetos || []).length > 0 && (t.objetos || []).every(function (o) { return o === 'vizinhanca'; }); };

  // Estrutura da vistoria de vizinhança (guardada em proj.vizinhanca).
  TL.vizinhancaPadrao = function () {
    return {
      obra: { nome: '', endereco: '', construtora: '', alvara: '', responsavel: '', tipo: '', inicio: '' },
      imoveis: []   // [{ id, endereco, ocupante, tipo, padrao, idade, pavimentos, dataVistoria, acompanhante, recusou, motivoRecusa,
                    //    conservacao, obs, ambientes: [{ nome, anomalias: [{ tipo, localizacao, dimensao, descricao }] }] }]
    };
  };
  TL.ANOMALIAS = ['Fissura', 'Trinca', 'Rachadura', 'Infiltração / umidade', 'Destacamento de revestimento', 'Descolamento de piso',
    'Recalque / desnível', 'Esquadria desalinhada', 'Mancha / eflorescência', 'Corrosão de armadura', 'Telhado / cobertura danificada', 'Outra'];

  // ---------------------------------------------------------------------------
  // Contas extras
  // ---------------------------------------------------------------------------
  // vu = valor unitário adotado (R$/m² ou R$/ha, na unidade das áreas).
  TL.calcular = function (t, vu, valorPleno) {
    const n = function (v) { const x = U.lerNumero(v); return Number.isFinite(x) ? x : NaN; };
    const r = { pendencias: [] };
    if (TL.tem(t, 'servidao')) {
      const a = n(t.areaFaixa), k = n(t.coefServidao), b = n(t.benfeitoriasAtingidas);
      if (!Number.isFinite(a)) r.pendencias.push('área da faixa de servidão');
      if (!Number.isFinite(k)) r.pendencias.push('coeficiente de servidão');
      r.servidao = { area: a, coef: k / 100, benfeitorias: Number.isFinite(b) ? b : 0,
        terra: vu * a * k / 100, total: vu * a * k / 100 + (Number.isFinite(b) ? b : 0) };
    }
    if (TL.tem(t, 'remanescente')) {
      const a = n(t.areaRemanescente), pc = n(t.percRemanescente);
      if (!Number.isFinite(a)) r.pendencias.push('área remanescente');
      if (!Number.isFinite(pc)) r.pendencias.push('percentual de desvalorização do remanescente');
      r.remanescente = { area: a, perc: pc / 100, total: vu * a * pc / 100 };
    }
    if (TL.tem(t, 'liquidacao')) {
      const nMeses = n(t.prazoAbsorcao), i = n(t.taxaMensal);
      if (!Number.isFinite(nMeses)) r.pendencias.push('prazo de absorção (meses)');
      if (!Number.isFinite(i)) r.pendencias.push('taxa de desconto mensal');
      r.liquidacao = { meses: nMeses, taxa: i / 100, valor: valorPleno / Math.pow(1 + i / 100, nMeses) };
      r.liquidacao.desagio = 1 - r.liquidacao.valor / valorPleno;
    }
    if (TL.tem(t, 'vtn')) {
      const itens = (t.benfeitorias || []).map(function (b) {
        const q = n(b.quantidade), pu = n(b.unitario), dep = n(b.depreciacao);
        const bruto = q * pu, liquido = bruto * (1 - (Number.isFinite(dep) ? dep : 0) / 100);
        return { descricao: b.descricao || '', quantidade: q, unidade: b.unidade || '', unitario: pu, depreciacao: Number.isFinite(dep) ? dep : 0, valor: liquido };
      });
      const soma = itens.reduce(function (s, b) { return s + (Number.isFinite(b.valor) ? b.valor : 0); }, 0);
      r.vtn = { terraNua: valorPleno, benfeitorias: itens, somaBenfeitorias: soma, total: valorPleno + soma };
    }
    return r;
  };

  INF.TiposLaudo = TL;
})(globalThis.INF = globalThis.INF || {});
````

## motor/20-inventario.js
<a id="motor-20-inventario-js"></a>

````javascript
/* =============================================================================
   20-inventario.js — Inventário de dados por modelo de laudo (modelo da RAE)
   -----------------------------------------------------------------------------
   CAMPOS é a lista de TODOS os dados que os modelos de laudo usam. Cada um diz:
     quem   → 'documento' (a IA extrai, com fonte), 'avaliador' (julgamento do
              perito — a IA NÃO preenche) ou 'calculo' (sai do programa);
     fontes → tipos de documento donos do campo, em ordem de autoridade;
     quando → em quais modelos o campo é exigido (função do tipo de laudo).
   Assim cada modelo tem o seu inventário: a IA recebe só os campos daquele
   modelo e só devolve o que está escrito nos documentos.

   Regras (as mesmas da RAE):
   1. TODOS os documentos da pasta são lidos; nenhum é dispensável.
   2. Cada documento é lido UMA vez: o cache é pelo SHA-256 do arquivo.
      Renomeado não relê; alterado relê; o que sumiu da pasta é avisado.
   3. Todo campo guarda a FONTE: nome do arquivo, página e trecho literal.
   4. Divergência vai ao DOCUMENTO DONO do campo (não se contam votos). Entre
      documentos do mesmo tipo, vale o mais recente.
   5. Hierarquia: decisão do avaliador > documento dono > demais documentos >
      carimbo da foto (só data e coordenadas da vistoria).
   6. Trava de leitura: documento não lido, com erro ou com resumo raso
      (menos de 120 caracteres ou sem número) reprova.
   7. Checagem: RESOLVIDA / NÃO ENCONTRADA / NÃO SOLUCIONADA. Pendência em
      campo obrigatório → "ENTREGA BLOQUEADA - FAVOR VERIFICAR ESTAS
      PENDÊNCIAS". Bloqueia a entrega, nunca o preenchimento.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const IV = {};

  // Condições de uso (t = tipo de laudo lido por INF.TiposLaudo.ler)
  const tem = function (t, o) { return (t.objetos || []).indexOf(o) >= 0; };
  const SEMPRE = function () { return true; };
  const RURAL = function (t) { return t.ambito === 'rural' && VALOR(t); };
  const URBANO = function (t) { return t.ambito === 'urbano' && VALOR(t); };
  const JUDICIAL = function (t) { return t.destino === 'judicial'; };
  const BANCO = function (t) { return t.destino === 'banco'; };
  const SERVIDAO = function (t) { return tem(t, 'servidao'); };
  const DESAPROP = function (t) { return tem(t, 'desapropriacao') || tem(t, 'servidao'); };
  const REMANESC = function (t) { return tem(t, 'remanescente'); };
  const LOCATIVO = function (t) { return tem(t, 'locativo'); };
  const VTN = function (t) { return tem(t, 'vtn'); };
  const LIQUID = function (t) { return tem(t, 'liquidacao'); };
  const VIZ = function (t) { return tem(t, 'vizinhanca'); };
  // modelos que avaliam valor (vizinhança pura não usa matrícula, mercado nem cálculo)
  const VALOR = function (t) { return !(t.objetos || []).length || !(t.objetos || []).every(function (o) { return o === 'vizinhanca'; }); };

  // id, rótulo, destino no projeto, quem preenche, fontes (autoridade), quando é exigido, descrição para a IA
  IV.CAMPOS = [
    // ---- identificação e documentação (todos os modelos) ----
    { id: 'solicitante', rotulo: 'Solicitante', destino: 'laudo.solicitante', quem: 'documento', fontes: ['decisao_despacho', 'contrato', 'outro'], quando: SEMPRE, obrig: true, desc: 'quem pediu o laudo (pessoa, empresa, juízo)' },
    { id: 'proprietario', rotulo: 'Proprietário', destino: 'laudo.proprietario', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'ccir', 'itr', 'car'], quando: VALOR, obrig: true, desc: 'nome do(s) proprietário(s) atual(is) conforme o registro' },
    { id: 'matricula', rotulo: 'Matrícula', destino: 'laudo.matricula', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'ccir', 'itr'], quando: VALOR, obrig: true, desc: 'número da matrícula do imóvel' },
    { id: 'cartorio', rotulo: 'Cartório de registro', destino: 'laudo.cartorio', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura'], quando: VALOR, obrig: true, desc: 'cartório de registro de imóveis e comarca' },
    { id: 'areaDocumento', rotulo: 'Área documental', destino: 'laudo.areaDocumento', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'georreferenciamento', 'memorial_descritivo', 'ccir', 'itr', 'car'], quando: VALOR, obrig: true, desc: 'área do imóvel com a unidade escrita no documento' },
    { id: 'onus', rotulo: 'Ônus e averbações', destino: 'laudo.onus', quem: 'documento', fontes: ['certidao_onus', 'matricula'], quando: VALOR, obrig: false, desc: 'hipotecas, penhoras, servidões, alienação fiduciária e averbações relevantes (resumo literal)' },
    { id: 'descricaoMatricula', rotulo: 'Descrição do registro', destino: 'laudo.descricaoMatricula', quem: 'documento', fontes: ['matricula', 'escritura', 'memorial_descritivo'], quando: VALOR, obrig: false, desc: 'descrição do imóvel e confrontações conforme o registro (trecho literal resumido)' },
    { id: 'endereco', rotulo: 'Endereço / localização', destino: 'laudo.endereco', quem: 'documento', fontes: ['alvara_habitese', 'matricula', 'escritura', 'iptu', 'ccir', 'contrato'], quando: SEMPRE, obrig: true, desc: 'endereço (urbano) ou denominação e localização do imóvel (rural)' },
    { id: 'municipio', rotulo: 'Município / UF', destino: 'projeto.municipio', quem: 'documento', fontes: ['matricula', 'escritura', 'ccir', 'itr', 'iptu'], quando: SEMPRE, obrig: true, desc: 'município e UF do imóvel' },
    { id: 'coordenadas', rotulo: 'Coordenadas', destino: 'laudo.coordenadas', quem: 'documento', fontes: ['georreferenciamento', 'memorial_descritivo', 'car', 'foto_vistoria'], quando: SEMPRE, obrig: false, desc: 'coordenadas geográficas do imóvel ou da sede' },
    { id: 'dataVistoria', rotulo: 'Data da vistoria', destino: 'laudo.dataVistoria', quem: 'documento', fontes: ['foto_vistoria'], quando: SEMPRE, obrig: true, desc: 'data da vistoria lida no carimbo da foto (AAAA-MM-DD)' },
    { id: 'art', rotulo: 'ART / RRT', destino: 'laudo.art', quem: 'documento', fontes: ['art_rrt'], quando: SEMPRE, obrig: true, desc: 'número da ART ou RRT do laudo' },
    { id: 'registro', rotulo: 'Registro profissional', destino: 'laudo.registro', quem: 'documento', fontes: ['art_rrt'], quando: SEMPRE, obrig: true, desc: 'registro no CREA/CAU do responsável técnico' },

    // ---- rural ----
    { id: 'ccir', rotulo: 'CCIR / código INCRA', destino: 'laudo.ccir', quem: 'documento', fontes: ['ccir'], quando: RURAL, obrig: true, desc: 'número do CCIR e código do imóvel no INCRA' },
    { id: 'nirf', rotulo: 'NIRF (ITR)', destino: 'laudo.nirf', quem: 'documento', fontes: ['itr'], quando: RURAL, obrig: false, desc: 'número do imóvel na Receita Federal (NIRF/CIB)' },
    { id: 'car', rotulo: 'Registro no CAR', destino: 'laudo.car', quem: 'documento', fontes: ['car'], quando: RURAL, obrig: true, desc: 'número do recibo de inscrição no CAR' },
    { id: 'areaReservaLegal', rotulo: 'Reserva legal', destino: 'laudo.areaReservaLegal', quem: 'documento', fontes: ['car', 'matricula', 'georreferenciamento'], quando: RURAL, obrig: false, desc: 'área de reserva legal com unidade' },
    { id: 'areaApp', rotulo: 'Área de preservação permanente', destino: 'laudo.areaApp', quem: 'documento', fontes: ['car', 'georreferenciamento'], quando: RURAL, obrig: false, desc: 'área de APP com unidade' },
    { id: 'sigef', rotulo: 'Georreferenciamento (SIGEF)', destino: 'laudo.sigef', quem: 'documento', fontes: ['georreferenciamento', 'matricula'], quando: RURAL, obrig: false, desc: 'certificação SIGEF/INCRA: número e data' },
    { id: 'usoAtual', rotulo: 'Uso atual do solo', destino: 'laudo.usoAtual', quem: 'documento', fontes: ['car', 'itr', 'laudo_anterior', 'foto_vistoria'], quando: RURAL, obrig: false, desc: 'uso do solo declarado (lavoura, pastagem, vegetação nativa...) com áreas' },

    // ---- urbano ----
    { id: 'inscricaoIptu', rotulo: 'Inscrição imobiliária (IPTU)', destino: 'laudo.inscricaoIptu', quem: 'documento', fontes: ['iptu'], quando: URBANO, obrig: false, desc: 'inscrição imobiliária municipal' },
    { id: 'areaTerreno', rotulo: 'Área do terreno', destino: 'laudo.areaTerreno', quem: 'documento', fontes: ['matricula', 'escritura', 'iptu'], quando: URBANO, obrig: false, desc: 'área do terreno com unidade' },
    { id: 'areaConstruida', rotulo: 'Área construída', destino: 'laudo.areaConstruida', quem: 'documento', fontes: ['alvara_habitese', 'matricula', 'iptu'], quando: URBANO, obrig: false, desc: 'área construída / privativa com unidade' },
    { id: 'habiteSe', rotulo: 'Habite-se / alvará', destino: 'laudo.habiteSe', quem: 'documento', fontes: ['alvara_habitese'], quando: URBANO, obrig: false, desc: 'número e data do habite-se ou alvará' },

    // ---- banco ----
    { id: 'banco', rotulo: 'Instituição financeira', destino: 'tipoLaudo.banco', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'banco ou cooperativa' },
    { id: 'contrato', rotulo: 'Proposta / contrato', destino: 'tipoLaudo.contrato', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'número da proposta ou contrato' },
    { id: 'proponente', rotulo: 'Proponente', destino: 'tipoLaudo.proponente', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'nome do proponente' },

    // ---- judicial ----
    { id: 'processo', rotulo: 'Processo nº', destino: 'tipoLaudo.processo', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial', 'quesitos', 'contestacao'], quando: JUDICIAL, obrig: true, desc: 'número do processo (CNJ)' },
    { id: 'vara', rotulo: 'Vara / juízo', destino: 'tipoLaudo.vara', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'vara ou juízo' },
    { id: 'comarca', rotulo: 'Comarca', destino: 'tipoLaudo.comarca', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'comarca' },
    { id: 'autor', rotulo: 'Autor(es)', destino: 'tipoLaudo.autor', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho'], quando: JUDICIAL, obrig: true, desc: 'nome do(s) autor(es)' },
    { id: 'reu', rotulo: 'Réu(s)', destino: 'tipoLaudo.reu', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho', 'contestacao'], quando: JUDICIAL, obrig: true, desc: 'nome do(s) réu(s)' },
    { id: 'objetoPericia', rotulo: 'Objeto da perícia', destino: 'tipoLaudo.objetoPericia', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'o que o juízo determinou avaliar (trecho literal da decisão)' },
    { id: 'dataNomeacao', rotulo: 'Data da nomeação', destino: 'tipoLaudo.dataNomeacao', quem: 'documento', fontes: ['decisao_despacho'], quando: JUDICIAL, obrig: false, desc: 'data da decisão que nomeou o perito' },
    { id: 'prazoLaudo', rotulo: 'Prazo do laudo', destino: 'tipoLaudo.prazoLaudo', quem: 'documento', fontes: ['decisao_despacho'], quando: JUDICIAL, obrig: false, desc: 'prazo fixado para entrega do laudo' },
    { id: 'assistentes', rotulo: 'Assistentes técnicos', destino: 'tipoLaudo.assistentes', quem: 'documento', fontes: ['quesitos', 'peticao_inicial', 'contestacao', 'parecer_assistente'], quando: JUDICIAL, obrig: false, desc: 'assistentes técnicos indicados pelas partes' },
    { id: 'quesitos', rotulo: 'Quesitos', destino: 'tipoLaudo.quesitos', quem: 'documento', fontes: ['quesitos', 'peticao_inicial', 'contestacao', 'decisao_despacho'], quando: JUDICIAL, obrig: true, desc: 'texto literal de cada quesito (lista separada)' },

    // ---- servidão / desapropriação / remanescente ----
    { id: 'areaTotal', rotulo: 'Área total do imóvel', destino: 'tipoLaudo.areaTotal', quem: 'documento', fontes: ['matricula', 'georreferenciamento', 'memorial_descritivo', 'ccir', 'itr', 'car'], quando: DESAPROP, obrig: true, desc: 'área total com unidade' },
    { id: 'areaFaixa', rotulo: 'Área da faixa atingida', destino: 'tipoLaudo.areaFaixa', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'memorial_descritivo', 'peticao_inicial'], quando: DESAPROP, obrig: true, desc: 'área da faixa de servidão ou área desapropriada, com unidade' },
    { id: 'larguraFaixa', rotulo: 'Largura da faixa', destino: 'laudo.larguraFaixa', quem: 'documento', fontes: ['projeto_faixa_servidao', 'decreto_utilidade_publica', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'largura da faixa em metros' },
    { id: 'extensaoFaixa', rotulo: 'Extensão da faixa', destino: 'laudo.extensaoFaixa', quem: 'documento', fontes: ['projeto_faixa_servidao', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'extensão da faixa dentro do imóvel' },
    { id: 'decretoDup', rotulo: 'Decreto / DUP', destino: 'laudo.decretoDup', quem: 'documento', fontes: ['decreto_utilidade_publica', 'peticao_inicial'], quando: DESAPROP, obrig: false, desc: 'número e data do decreto de utilidade pública ou resolução autorizativa' },
    { id: 'empreendimento', rotulo: 'Empreendimento', destino: 'laudo.empreendimento', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'peticao_inicial'], quando: DESAPROP, obrig: false, desc: 'obra ou linha que motiva a servidão/desapropriação (ex.: LT 138 kV)' },
    { id: 'restricoesFaixa', rotulo: 'Restrições na faixa', destino: 'laudo.restricoesFaixa', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'usos proibidos ou restritos na faixa, conforme o documento' },
    { id: 'ofertaInicial', rotulo: 'Oferta / depósito inicial', destino: 'laudo.ofertaInicial', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho'], quando: DESAPROP, obrig: false, desc: 'valor oferecido ou depositado pelo expropriante' },

    // ---- vizinhança (vistoria cautelar) ----
    { id: 'obraNome', rotulo: 'Obra / empreendimento', destino: 'vizinhanca.obra.nome', quem: 'documento', fontes: ['alvara_habitese', 'contrato', 'outro'], quando: VIZ, obrig: true, desc: 'nome da obra ou empreendimento que motiva a vistoria' },
    { id: 'obraEndereco', rotulo: 'Endereço da obra', destino: 'vizinhanca.obra.endereco', quem: 'documento', fontes: ['alvara_habitese', 'contrato', 'matricula'], quando: VIZ, obrig: true, desc: 'endereço do terreno da obra' },
    { id: 'construtora', rotulo: 'Construtora / contratante', destino: 'vizinhanca.obra.construtora', quem: 'documento', fontes: ['contrato', 'alvara_habitese', 'art_rrt'], quando: VIZ, obrig: true, desc: 'empresa responsável pela obra' },
    { id: 'alvaraObra', rotulo: 'Alvará de construção', destino: 'vizinhanca.obra.alvara', quem: 'documento', fontes: ['alvara_habitese'], quando: VIZ, obrig: false, desc: 'número e data do alvará da obra' },
    { id: 'responsavelObra', rotulo: 'Responsável técnico da obra', destino: 'vizinhanca.obra.responsavel', quem: 'documento', fontes: ['art_rrt', 'alvara_habitese'], quando: VIZ, obrig: false, desc: 'engenheiro ou arquiteto da obra e a ART' },
    { id: 'tipoObra', rotulo: 'Serviços previstos', destino: 'vizinhanca.obra.tipo', quem: 'documento', fontes: ['contrato', 'alvara_habitese', 'outro'], quando: VIZ, obrig: false, desc: 'demolição, escavação, contenção, fundação profunda, estrutura...' },
    { id: 'inicioObra', rotulo: 'Início previsto da obra', destino: 'vizinhanca.obra.inicio', quem: 'documento', fontes: ['contrato', 'alvara_habitese'], quando: VIZ, obrig: false, desc: 'data prevista de início' },
    { id: 'imoveisVizinhos', rotulo: 'Imóveis vizinhos vistoriados', quem: 'avaliador', quando: VIZ, obrig: true },
    { id: 'anomalias', rotulo: 'Anomalias por imóvel e ambiente', quem: 'avaliador', quando: VIZ, obrig: true },

    // ---- locação ----
    { id: 'aluguelAtual', rotulo: 'Aluguel atual', destino: 'laudo.aluguelAtual', quem: 'documento', fontes: ['contrato'], quando: LOCATIVO, obrig: false, desc: 'valor do aluguel vigente e data do contrato' },

    // ---- julgamento do avaliador (a IA não preenche) ----
    { id: 'coefServidao', rotulo: 'Coeficiente de servidão', destino: 'tipoLaudo.coefServidao', quem: 'avaliador', quando: SERVIDAO, obrig: true },
    { id: 'justifServidao', rotulo: 'Justificativa do coeficiente', destino: 'tipoLaudo.justifServidao', quem: 'avaliador', quando: SERVIDAO, obrig: true },
    { id: 'percRemanescente', rotulo: 'Desvalorização do remanescente', destino: 'tipoLaudo.percRemanescente', quem: 'avaliador', quando: REMANESC, obrig: true },
    { id: 'respostasQuesitos', rotulo: 'Respostas aos quesitos', destino: 'tipoLaudo.quesitos', quem: 'avaliador', quando: JUDICIAL, obrig: true },
    { id: 'benfeitoriasCusto', rotulo: 'Benfeitorias (custo e depreciação)', destino: 'tipoLaudo.benfeitorias', quem: 'avaliador', quando: VTN, obrig: true },
    { id: 'liquidacaoParam', rotulo: 'Prazo e taxa da liquidação', destino: 'tipoLaudo.prazoAbsorcao', quem: 'avaliador', quando: LIQUID, obrig: true },
    { id: 'descricaoRegiao', rotulo: 'Descrição da região', destino: 'laudo.descricaoRegiao', quem: 'avaliador', quando: SEMPRE, obrig: true },
    { id: 'descricaoImovel', rotulo: 'Descrição do imóvel (vistoria)', destino: 'laudo.descricaoImovel', quem: 'avaliador', quando: VALOR, obrig: true },
    { id: 'diagnosticoMercado', rotulo: 'Leitura do mercado', destino: 'laudo.diagnosticoMercado', quem: 'avaliador', quando: VALOR, obrig: true },

    // ---- sai do cálculo ----
    { id: 'valor', rotulo: 'Valor, intervalo, graus e gráficos', quem: 'calculo', quando: VALOR, obrig: true }
  ];
  // CAMINHO PARA CONSEGUIR cada dado quando nenhum documento da pasta o traz.
  // Aparece na lista de pendências: é o que o avaliador (ou a equipe) faz
  // para obter o dado de verdade — nunca estimar.
  IV.COMO_OBTER = {
    solicitante: 'Contrato de prestação de serviço, e-mail de solicitação ou decisão judicial de nomeação.',
    proprietario: 'Certidão de inteiro teor da matrícula no Cartório de Registro de Imóveis (ou pedido on-line no ONR / registradores.org.br).',
    matricula: 'Certidão de inteiro teor no Cartório de Registro de Imóveis da comarca; o número também está no IPTU/ITR e na escritura.',
    cartorio: 'Cabeçalho da certidão de matrícula; na dúvida, o cartório competente pela localização do imóvel.',
    areaDocumento: 'Certidão de matrícula (área registrada); no rural, conferir com CCIR e CAR.',
    onus: 'Certidão de ônus reais e ações reipersecutórias no Cartório de Registro de Imóveis (validade curta: pedir atualizada).',
    descricaoMatricula: 'Certidão de inteiro teor da matrícula (descrição e confrontações).',
    endereco: 'Alvará/habite-se ou matrícula; no rural, denominação do imóvel na matrícula/CCIR e roteiro de acesso da vistoria.',
    municipio: 'Matrícula, CCIR ou IPTU.',
    coordenadas: 'GPS na vistoria (ponto na sede ou no acesso) ou georreferenciamento/CAR.',
    dataVistoria: 'Carimbo de data das fotos de campo ou anotação da vistoria.',
    art: 'Sistema do CREA/CAU: emitir a ART/RRT do trabalho antes de assinar o laudo.',
    registro: 'Carteira profissional / cadastro no CREA ou CAU.',
    ccir: 'SNCR/INCRA (sncr.serpro.gov.br) — emitir o CCIR do exercício com o código do imóvel.',
    nirf: 'Receita Federal (declaração do ITR / consulta CAFIR).',
    car: 'SICAR (car.gov.br) — consulta pública pelo número do recibo ou demonstrativo do CAR.',
    areaReservaLegal: 'Demonstrativo do CAR (SICAR) ou averbação na matrícula.',
    areaApp: 'Demonstrativo do CAR (SICAR) ou levantamento topográfico.',
    sigef: 'SIGEF/INCRA (sigef.incra.gov.br) — consulta de parcelas certificadas.',
    usoAtual: 'Vistoria de campo, demonstrativo do CAR e declaração do ITR.',
    inscricaoIptu: 'Carnê do IPTU ou certidão da prefeitura.',
    areaTerreno: 'Matrícula ou cadastro imobiliário da prefeitura.',
    areaConstruida: 'Habite-se, projeto aprovado ou cadastro da prefeitura; medir na vistoria se não houver.',
    habiteSe: 'Prefeitura (setor de aprovação de projetos).',
    banco: 'Ordem de serviço ou proposta do banco.',
    contrato: 'Ordem de serviço ou proposta do banco.',
    proponente: 'Ordem de serviço ou proposta do banco.',
    processo: 'Intimação/nomeação recebida ou consulta processual no PJe do tribunal.',
    vara: 'Cabeçalho da decisão de nomeação (PJe).',
    comarca: 'Cabeçalho da decisão de nomeação (PJe).',
    autor: 'Petição inicial nos autos (PJe).',
    reu: 'Petição inicial ou contestação nos autos (PJe).',
    objetoPericia: 'Decisão que determinou a perícia (PJe).',
    dataNomeacao: 'Decisão de nomeação (PJe).',
    prazoLaudo: 'Decisão de nomeação ou despacho posterior (PJe).',
    assistentes: 'Petições das partes indicando assistentes técnicos (PJe).',
    quesitos: 'Petições de quesitos das partes e do juízo (PJe).',
    areaTotal: 'Matrícula, georreferenciamento ou CCIR.',
    areaFaixa: 'Decreto de utilidade pública, projeto/memorial da faixa da concessionária ou petição inicial.',
    larguraFaixa: 'Projeto da linha/duto (concessionária) ou resolução autorizativa (ANEEL/ANP).',
    extensaoFaixa: 'Projeto da faixa (concessionária) ou medição no georreferenciamento.',
    decretoDup: 'Diário Oficial ou resolução autorizativa da ANEEL/ANP.',
    empreendimento: 'Petição inicial, decreto ou projeto da concessionária.',
    restricoesFaixa: 'Escritura/contrato de servidão, normas técnicas da concessionária ou decreto.',
    ofertaInicial: 'Petição inicial ou guia de depósito nos autos.',
    aluguelAtual: 'Contrato de locação vigente e último recibo.',
    obraNome: 'Contrato com a construtora ou alvará de construção.',
    obraEndereco: 'Alvará de construção.',
    construtora: 'Contrato de serviço ou alvará de construção.',
    alvaraObra: 'Construtora ou prefeitura (alvará de construção).',
    responsavelObra: 'ART de execução da obra (construtora / CREA).',
    tipoObra: 'Cronograma ou memorial da obra (construtora).',
    inicioObra: 'Cronograma da obra (construtora).',
    coefServidao: 'Decisão técnica do avaliador: restrições de uso na faixa (normas da concessionária) e referências de mercado/literatura.',
    justifServidao: 'Redação do avaliador a partir das restrições da faixa.',
    percRemanescente: 'Decisão técnica do avaliador: forma, acesso e fracionamento da área remanescente.',
    respostasQuesitos: 'Redação do perito, quesito por quesito, com base no laudo.',
    benfeitoriasCusto: 'Vistoria (quantidades) + custo de reedição (SINAPI, CUB, tabelas regionais) + depreciação pela idade e estado.',
    liquidacaoParam: 'Prazo de absorção observado no mercado (tempo médio das ofertas) e taxa de desconto justificada.',
    descricaoRegiao: 'Vistoria e dados públicos (IBGE, prefeitura, mapas).',
    descricaoImovel: 'Vistoria de campo.',
    diagnosticoMercado: 'Pesquisa de mercado: número de ofertas, tempo de anúncio, contato com corretores.',
    imoveisVizinhos: 'Levantamento em campo dos imóveis confrontantes e vizinhos à obra.',
    anomalias: 'Vistoria de cada imóvel vizinho, ambiente por ambiente, com foto e medida.'
  };

  IV.porId = {};
  IV.CAMPOS.forEach(function (c) { IV.porId[c.id] = c; c.comoObter = IV.COMO_OBTER[c.id] || ''; });

  // Valor que o projeto já tem para um campo (usado no anexo "origem dos dados").
  IV.valorNoProjeto = function (proj, c) {
    if (!c.destino) return '';
    const partes = c.destino.split('.');
    let o = partes[0] === 'tipoLaudo' ? INF.TiposLaudo.ler(proj) : proj;
    if (partes[0] === 'tipoLaudo') partes.shift();
    for (let i = 0; i < partes.length; i++) { if (o == null) return ''; o = o[partes[i]]; }
    if (o == null || (typeof o === 'number' && !Number.isFinite(o))) return '';
    if (Array.isArray(o)) return o.length ? o.length + ' item(ns)' : '';
    return String(o);
  };

  // Inventário do modelo: os campos que ESTE tipo de laudo usa.
  IV.doModelo = function (tl) { return IV.CAMPOS.filter(function (c) { return c.quando(tl); }); };
  // Campos que a IA pode buscar nos documentos para este modelo.
  IV.paraIA = function (tl) {
    return IV.doModelo(tl).filter(function (c) { return c.quem === 'documento'; }).map(function (c) { return { id: c.id, descricao: c.rotulo + ' — ' + c.desc }; });
  };
  IV.rotulo = function (id) { return (IV.porId[id] || {}).rotulo || id; };

  // Normaliza para comparar ("172,5 ha" = "172,50 ha"; maiúsculas/espaços não contam).
  IV.normalizar = function (v) {
    const s = String(v === null || v === undefined ? '' : v).trim().toLowerCase().replace(/\s+/g, ' ');
    const n = U.lerNumero(s);
    const soNumero = /^[\d.,\s]+(ha|m²|m2|hectares?|alqueires?)?$/.test(s);
    return soNumero && Number.isFinite(n) ? 'n:' + n + ':' + ((s.match(/ha|m²|m2|hectare|alqueire/) || [''])[0].replace('hectare', 'ha').replace('m2', 'm²')) : 's:' + s.replace(/[.,;:]+$/, '');
  };
  const dataDoc = function (reg) {
    const d = [reg.dataDocumento].concat(reg.datas || []).map(function (x) { const m = String(x || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : ''; }).filter(Boolean).sort();
    return d.length ? d[d.length - 1] : '';
  };

  // ---------------------------------------------------------------------------
  // Ficha do modelo: um registro por campo do inventário, com estado e fonte.
  // ---------------------------------------------------------------------------
  IV.ficha = function (tl, inventario, decisoes, valorAtual) {
    const cand = {};
    Object.keys(inventario || {}).forEach(function (h) {
      const reg = inventario[h];
      (reg.dados || []).forEach(function (d) {
        (cand[d.campo] = cand[d.campo] || []).push({ valor: d.valor, pagina: d.pagina, trecho: d.trecho, arquivo: reg.arquivo, hash: h, tipo: reg.tipo, data: dataDoc(reg) });
      });
      if ((reg.quesitos || []).length) (cand.quesitos = cand.quesitos || []).push({ valor: reg.quesitos.length + ' quesito(s)', lista: reg.quesitos, arquivo: reg.arquivo, hash: h, tipo: reg.tipo, data: dataDoc(reg) });
    });
    return IV.doModelo(tl).map(function (c) {
      const base = { campo: c.id, rotulo: c.rotulo, quem: c.quem, obrig: c.obrig, fontesEsperadas: c.fontes || [], destino: c.destino };
      const atual = valorAtual ? valorAtual(c) : '';
      if (c.quem === 'calculo') return Object.assign(base, { estado: 'RESOLVIDA', valor: 'calculado pelo programa', porque: 'sai do tratamento estatístico' });
      if (c.quem === 'avaliador') {
        return Object.assign(base, atual ? { estado: 'RESOLVIDA', valor: atual, porque: 'preenchido pelo avaliador' } : { estado: 'NÃO ENCONTRADA', valor: '', porque: 'julgamento do avaliador — preencher na tela' });
      }
      const lista = cand[c.id] || [];
      const dec = decisoes && decisoes[c.id];
      if (dec) return Object.assign(base, { estado: 'RESOLVIDA', valor: dec.valor, fonte: dec.fonte, candidatos: lista, porque: 'decisão do avaliador' + (dec.porque ? ': ' + dec.porque : '') });
      if (!lista.length) {
        return Object.assign(base, atual ? { estado: 'RESOLVIDA', valor: atual, candidatos: [], porque: 'digitado pelo avaliador (sem documento)' }
          : { estado: 'NÃO ENCONTRADA', valor: '', candidatos: [], porque: 'nenhum documento traz este dado' });
      }
      const ordem = c.fontes || [];
      const rank = function (x) { const i = ordem.indexOf(x.tipo); return i < 0 ? 999 : i; };
      const ord = lista.slice().sort(function (a, b) { return rank(a) - rank(b) || (b.data || '').localeCompare(a.data || ''); });
      const topo = ord[0];
      const distintos = new Set(lista.map(function (x) { return IV.normalizar(x.valor); }));
      if (c.id === 'quesitos') return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: lista.length > 1 ? 'quesitos em ' + lista.length + ' documentos' : 'um documento' });
      if (distintos.size === 1) return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: lista.length > 1 ? lista.length + ' documentos concordam' : 'um documento' });
      if (rank(topo) === 999) return Object.assign(base, { estado: 'NÃO SOLUCIONADA', valor: '', candidatos: lista, porque: 'documentos divergem e nenhum é dono deste campo' });
      const nivel = ord.filter(function (x) { return rank(x) === rank(topo); });
      if (new Set(nivel.map(function (x) { return IV.normalizar(x.valor); })).size === 1) {
        return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: 'divergência resolvida pelo documento dono do campo (' + topo.tipo.replace(/_/g, ' ') + ')' });
      }
      if (topo.data && nivel.filter(function (x) { return x.data === topo.data; }).length === 1) {
        return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: 'documento mais recente do mesmo tipo (' + topo.data.split('-').reverse().join('/') + ')' });
      }
      return Object.assign(base, { estado: 'NÃO SOLUCIONADA', valor: '', candidatos: lista, porque: 'dois documentos do mesmo tipo divergem e não há data para desempatar' });
    });
  };

  // ---------------------------------------------------------------------------
  // Trava de leitura e arquivos sumidos
  // ---------------------------------------------------------------------------
  IV.trava = function (docs, inventario) {
    const problemas = [];
    (docs || []).forEach(function (d) {
      if (!d.hash) { problemas.push({ arquivo: d.nome, texto: 'identificação do arquivo ainda sendo calculada' }); return; }
      const reg = inventario && inventario[d.hash];
      if (!reg) { problemas.push({ arquivo: d.nome, texto: d.status && /formato|erro/.test(d.status) ? d.status : 'documento não lido' }); return; }
      const foto = reg.tipo === 'foto_vistoria' || reg.tipo === 'anuncio_mercado';
      if (!foto && ((reg.resumo || '').length < 120 || !/\d/.test(reg.resumo || ''))) problemas.push({ arquivo: d.nome, texto: 'resumo raso (menos de 120 caracteres ou sem número): ler de novo, inteiro' });
      if (!foto && !(reg.dados || []).length && !(reg.quesitos || []).length && ['documento_pessoal', 'planta_mapa', 'outro'].indexOf(reg.tipo) < 0) problemas.push({ arquivo: d.nome, texto: 'nenhum dado saiu deste documento — conferir se foi lido por inteiro', leve: true });
    });
    return problemas;
  };
  IV.sumidos = function (docs, inventario) {
    const presentes = new Set((docs || []).map(function (d) { return d.hash; }));
    return Object.keys(inventario || {}).filter(function (h) { return !presentes.has(h); }).map(function (h) { return inventario[h].arquivo; });
  };

  // ---------------------------------------------------------------------------
  // Checagem antes de entregar
  // ---------------------------------------------------------------------------
  IV.checagem = function (ficha, trava) {
    const pend = [];
    (trava || []).filter(function (t) { return !t.leve; }).forEach(function (t) { pend.push('Documento ' + t.arquivo + ': ' + t.texto); });
    ficha.forEach(function (f) {
      if (!f.obrig) return;
      if (f.estado === 'NÃO SOLUCIONADA') pend.push(f.rotulo + ': NÃO SOLUCIONADA — ' + f.porque);
      if (f.estado === 'NÃO ENCONTRADA') pend.push(f.rotulo + ': NÃO ENCONTRADA — ' + f.porque);
    });
    return { bloqueada: pend.length > 0, pendencias: pend,
      mensagem: pend.length ? 'ENTREGA BLOQUEADA - FAVOR VERIFICAR ESTAS PENDÊNCIAS' : 'Checagem sem pendências: todos os campos do modelo resolvidos com fonte.' };
  };

  INF.Inventario = IV;
})(globalThis.INF = globalThis.INF || {});
````

## motor/21-modelos-laudo.js
<a id="motor-21-modelos-laudo-js"></a>

````javascript
/* =============================================================================
   21-modelos-laudo.js — Catálogo de MODELOS de laudo
   -----------------------------------------------------------------------------
   Cada modelo diz:
     · para quem é e o que avalia (destino, objetos, âmbito) — vai para o
       tipo de laudo (19-tipos-laudo.js);
     · o NÍVEL de detalhe:
         simplificado → particular, uso próprio: o essencial da NBR 14.653-1
         completo     → extrajudicial, banco, concessionária, rural
         pericial     → judicial: processo, quesitos, origem de cada dado,
                        anexos completos (o mais detalhado)
     · os CAPÍTULOS que entram, na ordem (o gerador do laudo monta todos e
       este catálogo filtra);
     · as exigências do modelo: print ou link de cada oferta, coordenadas
       das amostras, raio de pesquisa, grau mínimo.

   Regra de todos os modelos (não negociável): NENHUM dado sem origem.
   Cada dado do laudo sai de (1) documento, com arquivo/página/trecho,
   (2) o avaliador, que digitou, ou (3) o cálculo. O que não tiver origem
   sai "[preencher: …]" e aparece na lista de pendências com o CAMINHO para
   conseguir o dado (20-inventario.js → comoObter).
   ============================================================================= */

(function (INF) {
  'use strict';

  const ML = {};

  // Capítulos por nível (ids usados pelo gerador do laudo).
  ML.CAPITULOS = {
    simplificado: ['capa', 'solicitante', 'processo', 'finalidade', 'objetivo', 'pressupostos', 'imovel', 'pesquisa', 'metodo',
      'especificacao', 'resultado', 'encerramento', 'anexo_amostras'],
    completo: ['capa', 'sumario', 'solicitante', 'processo', 'finalidade', 'objetivo', 'pressupostos', 'imovel', 'diagnostico', 'pesquisa',
      'metodo', 'tratamento', 'especificacao', 'resultado', 'encerramento', 'anexo_amostras', 'anexo_fichas', 'anexo_graficos',
      'anexo_estatistico', 'anexo_inventario', 'anexo_documentos'],
    pericial: ['capa', 'sumario', 'processo', 'solicitante', 'finalidade', 'objetivo', 'pressupostos', 'imovel', 'diagnostico', 'pesquisa',
      'metodo', 'tratamento', 'especificacao', 'resultado', 'quesitos', 'encerramento', 'anexo_amostras', 'anexo_fichas', 'anexo_graficos',
      'anexo_estatistico', 'anexo_origem', 'anexo_inventario', 'anexo_documentos']
  };
  ML.NOMES_CAP = {
    capa: 'Capa', sumario: 'Sumário', solicitante: 'Solicitante', processo: 'Identificação do processo', finalidade: 'Finalidade', objetivo: 'Objetivo',
    pressupostos: 'Pressupostos e ressalvas', imovel: 'Imóvel (documentação, localização, vistoria, fotos)', diagnostico: 'Diagnóstico de mercado',
    pesquisa: 'Pesquisa de mercado (amostras, raio, prints)', metodo: 'Método', tratamento: 'Tratamento estatístico', especificacao: 'Graus da NBR',
    resultado: 'Resultado e valores', quesitos: 'Respostas aos quesitos', encerramento: 'Encerramento e assinatura',
    anexo_amostras: 'Anexo: tabela de dados de mercado', anexo_fichas: 'Anexo: ficha de cada amostra com print', anexo_graficos: 'Anexo: gráficos',
    anexo_estatistico: 'Anexo: tratamento estatístico completo', anexo_origem: 'Anexo: origem de cada dado', anexo_inventario: 'Anexo: inventário dos documentos',
    anexo_documentos: 'Anexo: documentos e fotografias'
  };

  // Raio de pesquisa padrão (km) quando o avaliador não informa.
  ML.RAIO_PADRAO = { urbano: 3, rural: 60 };

  ML.MODELOS = [
    // ---- particular ----
    { id: 'part_valor_simpl', nome: 'Particular — valor (simplificado)', nivel: 'simplificado', destino: 'particular', objetos: ['pleno'],
      uso: 'Uso próprio do cliente: saber quanto vale. Laudo curto, com o essencial da norma.' },
    { id: 'part_valor', nome: 'Particular — valor (completo)', nivel: 'completo', destino: 'particular', objetos: ['pleno'],
      uso: 'Valor de mercado para decisão do cliente, com toda a fundamentação.' },
    { id: 'part_locacao', nome: 'Particular — locação', nivel: 'completo', destino: 'particular', objetos: ['locativo'],
      uso: 'Valor de aluguel para o cliente. A dependente do modelo é o aluguel (R$/m² ao mês); amostras de oferta ou contrato de locação.' },
    // ---- extrajudicial ----
    { id: 'extra_venda', nome: 'Extrajudicial — venda', nivel: 'completo', destino: 'particular', objetos: ['pleno', 'liquidacao'], extrajudicial: true,
      uso: 'Para negociar compra e venda entre partes, notificação ou acordo: valor de mercado e, se pedido, valor de venda rápida.' },
    { id: 'extra_locacao', nome: 'Extrajudicial — locação', nivel: 'completo', destino: 'particular', objetos: ['locativo'], extrajudicial: true,
      uso: 'Revisão ou renovação amigável de aluguel entre locador e locatário.' },
    { id: 'banco', nome: 'Bancário — garantia', nivel: 'completo', destino: 'banco', objetos: ['pleno', 'liquidacao'], grauMinimo: 2,
      uso: 'Garantia de financiamento ou alienação fiduciária: valor de mercado e de liquidação forçada.' },
    { id: 'servidao_conc', nome: 'Servidão — concessionária (extrajudicial)', nivel: 'completo', destino: 'publico', objetos: ['servidao', 'remanescente'], ambito: 'rural',
      uso: 'Indenização amigável da faixa de servidão (energia, dutos, rodovia).' },
    { id: 'rural_pleno', nome: 'Rural — pleno domínio (terra nua + benfeitorias)', nivel: 'completo', destino: 'particular', objetos: ['pleno', 'vtn'], ambito: 'rural',
      uso: 'Imóvel rural inteiro, terra nua e benfeitorias em separado (NBR 14.653-3).' },
    // ---- judicial (pericial) ----
    { id: 'jud_valor', nome: 'Judicial — valor', nivel: 'pericial', destino: 'judicial', objetos: ['pleno'], uso: 'Perito do juízo: valor de mercado.' },
    { id: 'jud_locacao', nome: 'Judicial — locação (revisional / renovatória)', nivel: 'pericial', destino: 'judicial', objetos: ['locativo'], uso: 'Aluguel de mercado em ação revisional ou renovatória.' },
    { id: 'jud_servidao', nome: 'Judicial — servidão', nivel: 'pericial', destino: 'judicial', objetos: ['servidao'], ambito: 'rural', uso: 'Indenização pela instituição de servidão administrativa.' },
    { id: 'jud_servidao_pleno', nome: 'Judicial — servidão e pleno domínio', nivel: 'pericial', destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente'], ambito: 'rural',
      uso: 'Servidão, valor do imóvel inteiro e desvalorização do remanescente.' },
    { id: 'jud_desapropriacao', nome: 'Judicial — desapropriação', nivel: 'pericial', destino: 'judicial', objetos: ['desapropriacao', 'pleno'], uso: 'Justa indenização da área desapropriada.' },
    { id: 'jud_partilha', nome: 'Judicial — inventário / partilha', nivel: 'pericial', destino: 'judicial', objetos: ['partilha', 'pleno'], uso: 'Valor para partilha de bens.' },
    { id: 'assistente', nome: 'Parecer de assistente técnico', nivel: 'pericial', destino: 'judicial', objetos: ['pleno'], funcao: 'Assistente Técnico',
      uso: 'Parecer da parte, comentando ou contrapondo o laudo do perito.' },
    // ---- vizinhança ----
    { id: 'viz', nome: 'Vistoria cautelar de vizinhança', nivel: 'completo', destino: 'particular', objetos: ['vizinhanca'], uso: 'Estado dos vizinhos antes da obra.' },
    { id: 'viz_jud', nome: 'Vizinhança — judicial', nivel: 'pericial', destino: 'judicial', objetos: ['vizinhanca'], uso: 'Produção antecipada de prova.' }
  ];
  ML.porId = {};
  ML.MODELOS.forEach(function (m) { ML.porId[m.id] = m; });

  // Modelo ativo: o escolhido; se não houver, o que bate com o tipo de laudo marcado.
  ML.doProjeto = function (proj) {
    const t = INF.TiposLaudo.ler(proj);
    if (t.modelo && ML.porId[t.modelo]) return ML.porId[t.modelo];
    const ord = function (a) { return (a || []).slice().sort().join(); };
    const igual = ML.MODELOS.find(function (m) { return m.destino === t.destino && ord(m.objetos) === ord(t.objetos); });
    if (igual) return igual;
    return { id: 'livre', nome: 'Personalizado', nivel: t.destino === 'judicial' ? 'pericial' : 'completo', destino: t.destino, objetos: t.objetos };
  };

  // Aplica o modelo ao tipo de laudo do projeto.
  ML.aplicar = function (proj, id) {
    const m = ML.porId[id]; if (!m) return;
    const t = Object.assign(INF.TiposLaudo.ler(proj), { modelo: m.id, destino: m.destino, objetos: m.objetos.slice() });
    if (m.ambito) t.ambito = m.ambito;
    t.funcao = m.funcao || (m.destino === 'judicial' ? 'Perito do Juízo' : t.funcao);
    proj.tipoLaudo = t;
  };

  ML.capitulos = function (modelo, anexoCompleto) {
    const lista = ML.CAPITULOS[modelo.nivel] || ML.CAPITULOS.completo;
    return lista.filter(function (c) { return c !== 'anexo_estatistico' || anexoCompleto || modelo.nivel === 'pericial'; });
  };

  // Exigências do modelo sobre as amostras.
  ML.exigencias = function (modelo) {
    return {
      printOuLink: modelo.nivel !== 'simplificado',           // toda oferta com print ou link
      coordenadas: modelo.nivel === 'pericial',               // amostras e avaliando georreferenciados
      grauMinimo: modelo.grauMinimo || (modelo.nivel === 'simplificado' ? 1 : 2)
    };
  };

  ML.raio = function (proj) {
    const r = INF.U.lerNumero(proj.config && proj.config.raioPesquisa);
    if (Number.isFinite(r) && r > 0) return r;
    return ML.RAIO_PADRAO[INF.TiposLaudo.ler(proj).ambito] || 3;
  };

  INF.Modelos = ML;
})(globalThis.INF = globalThis.INF || {});
````

## motor/22-estilos-laudo.js
<a id="motor-22-estilos-laudo-js"></a>

````javascript
/* =============================================================================
   22-estilos-laudo.js — 20 estilos de apresentação (1 a 20) para cada modelo
   -----------------------------------------------------------------------------
   Modelo = O QUE o laudo contém (capítulos, exigências).
   Estilo = COMO ele se apresenta (capa, fonte, cor, cabeçalho, rodapé,
            tabelas, fotos por linha, profundidade do sumário).
   Qualquer modelo × qualquer estilo: 17 modelos × 20 estilos.
   O estilo nunca muda dado nem texto técnico — só a aparência.

   Campos de cada estilo:
     capa     'centro' | 'faixa' | 'lateral' | 'moldura' | 'minima'
     fonte    fonte do corpo (existente no Word do Windows)
     titulo   fonte dos títulos
     tam      tamanho do corpo em pontos
     linha    entrelinhas (1.15 / 1.3 / 1.5)
     cor      cor de destaque (títulos, faixa da capa, cabeçalho das tabelas)
     tabela   'grade' | 'zebra' | 'linhas' | 'minima'
     caixa    títulos em MAIÚSCULAS (true/false)
     cabecalho título do laudo no alto de cada página (true/false)
     rodape   'pagina' | 'pagina-autor'
     fotos    fotos por linha (1 ou 2)
     sumario  níveis no sumário (1 = capítulos; 2 = capítulos e itens)
   ============================================================================= */

(function (INF) {
  'use strict';

  const E = [
    { nome: 'Clássico ABNT',            capa: 'centro',  fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.5,  cor: '1F1F1F', tabela: 'grade',  caixa: true,  cabecalho: false, rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Executivo azul',           capa: 'faixa',   fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '1F4E79', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Jurídico tradicional',     capa: 'moldura', fonte: 'Times New Roman', titulo: 'Times New Roman', tam: 12,   linha: 1.5,  cor: '000000', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Técnico verde',            capa: 'lateral', fonte: 'Arial',           titulo: 'Arial',           tam: 10.5, linha: 1.3,  cor: '2E6B3F', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 1 },
    { nome: 'Minimalista',              capa: 'minima',  fonte: 'Calibri',         titulo: 'Calibri Light',   tam: 11,   linha: 1.3,  cor: '444444', tabela: 'linhas', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Rural terra',              capa: 'faixa',   fonte: 'Georgia',         titulo: 'Georgia',         tam: 11,   linha: 1.3,  cor: '7A4E1F', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Pericial sóbrio',          capa: 'moldura', fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.5,  cor: '333333', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Corporativo grafite',      capa: 'lateral', fonte: 'Segoe UI',        titulo: 'Segoe UI Semibold', tam: 10.5, linha: 1.3, cor: '3A3F44', tabela: 'linhas', caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Bancário',                 capa: 'faixa',   fonte: 'Arial',           titulo: 'Arial',           tam: 10.5, linha: 1.15, cor: '005CA9', tabela: 'grade',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Acadêmico',                capa: 'centro',  fonte: 'Times New Roman', titulo: 'Times New Roman', tam: 12,   linha: 1.5,  cor: '1A1A1A', tabela: 'minima', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Engenharia laranja',       capa: 'faixa',   fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: 'C2410C', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Compacto',                 capa: 'minima',  fonte: 'Arial Narrow',    titulo: 'Arial',           tam: 10,   linha: 1.15, cor: '222222', tabela: 'linhas', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Serifado elegante',        capa: 'moldura', fonte: 'Garamond',        titulo: 'Garamond',        tam: 12,   linha: 1.3,  cor: '5B1A1A', tabela: 'minima', caixa: true,  cabecalho: true,  rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Governo / concessionária', capa: 'centro',  fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.3,  cor: '003366', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Moderno petróleo',         capa: 'lateral', fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '0F5257', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Relatório de campo',       capa: 'faixa',   fonte: 'Verdana',         titulo: 'Verdana',         tam: 10,   linha: 1.3,  cor: '4B5320', tabela: 'grade',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Clássico vinho',           capa: 'centro',  fonte: 'Georgia',         titulo: 'Georgia',         tam: 11,   linha: 1.5,  cor: '6D1A36', tabela: 'linhas', caixa: true,  cabecalho: false, rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Neutro cinza',             capa: 'minima',  fonte: 'Segoe UI',        titulo: 'Segoe UI',        tam: 10.5, linha: 1.3,  cor: '595959', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 2 },
    { nome: 'Alto contraste',           capa: 'faixa',   fonte: 'Arial',           titulo: 'Arial Black',     tam: 11,   linha: 1.3,  cor: '000000', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Assinatura COON',         capa: 'lateral', fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '1F5F8B', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 }
  ];

  const S = {};
  S.LISTA = E.map(function (e, i) { return Object.assign({ numero: i + 1 }, e); });
  S.porNumero = function (n) { return S.LISTA[Math.min(Math.max(Number(n) || 1, 1), 20) - 1]; };
  // Estilo do projeto (padrão: 1 — Clássico ABNT).
  S.doProjeto = function (proj) { return S.porNumero((proj.laudo || {}).estilo || 1); };

  INF.Estilos = S;
})(globalThis.INF = globalThis.INF || {});
````

## motor/23-etapas.js
<a id="motor-23-etapas-js"></a>

````javascript
/* =============================================================================
   23-etapas.js — Sequência obrigatória das etapas (abas)
   -----------------------------------------------------------------------------
   O sistema só roda direito se cada etapa estiver completa antes da próxima,
   seja no modo automático ("Calcular tudo"), híbrido (amostras próprias +
   banco) ou manual. Cada etapa diz:
     aba        → aba da tela
     obrigatoria→ se bloqueia as seguintes (as de apoio, como gráficos e
                  ferramentas avançadas, ficam livres depois do modelo)
     depende    → etapas que precisam estar completas antes
     validar    → devolve a lista do que falta (vazia = completa)

   A aba 1 exige: responsável técnico, código do trabalho, identificação do
   imóvel, observação, tipologia, município e data base.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const ET = {};
  const vazio = function (v) { return v === null || v === undefined || String(v).trim() === ''; };

  ET.ETAPAS = [
    { aba: 'projeto', rotulo: '1. Projeto', obrigatoria: true, depende: [], validar: function (p) {
      const f = [], pr = p.projeto;
      if (vazio(pr.autor)) f.push('responsável técnico');
      if (vazio(pr.codigo)) f.push('código do trabalho');
      if (vazio(pr.imovel)) f.push('identificação do imóvel');
      if (vazio(pr.observacao)) f.push('observação');
      if (vazio(pr.tipologia)) f.push('tipologia');
      if (vazio(pr.municipio)) f.push('município / UF');
      if (vazio(pr.dataBase)) f.push('data base');
      return f;
    } },
    { aba: 'variaveis', rotulo: '2. Variáveis', obrigatoria: true, depende: ['projeto'], validar: function (p) {
      const f = [], R = INF.Regressao;
      if (!R.dependente(p)) f.push('variável dependente (ex.: VU)');
      if (!R.candidatas(p).length) f.push('ao menos uma variável independente');
      return f;
    } },
    { aba: 'amostras', rotulo: '3. Amostras', obrigatoria: true, depende: ['variaveis'], validar: function (p) {
      const f = [], R = INF.Regressao, dep = R.dependente(p);
      const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
      const k = R.candidatas(p).filter(function (v) { return p.modelo.transf[v.nome] && p.modelo.transf[v.nome] !== 'fora'; }).length;
      if (ativas.length < 3 * (k + 1)) f.push('no mínimo ' + 3 * (k + 1) + ' amostras no cálculo, 3(k+1) (hoje ' + ativas.length + ')');
      if (dep && ativas.some(function (a) { return !(U.lerNumero(a.valores[dep.nome]) > 0); })) f.push('valor de ' + dep.nome + ' em todas as amostras no cálculo');
      const erros = INF.Conferencia.conferir(p).filter(function (c) { return c.nivel === 'erro'; });
      if (erros.length) f.push(erros.length + ' erro(s) na conferência das amostras (ex.: ' + erros[0].texto + ')');
      return f;
    } },
    { aba: 'pesquisa', rotulo: 'Pesquisa de mercado', obrigatoria: false, depende: ['variaveis'], validar: function () { return []; } },
    { aba: 'modelo', rotulo: '4. Modelo', obrigatoria: true, depende: ['amostras'], validar: function (p, e) {
      if (!e.modelo) return ['calcular o modelo (botão "Calcular tudo" ou "Calcular só estas escalas")'];
      if (e.modelo.erro) return ['modelo com erro: ' + e.modelo.erro];
      return [];
    } },
    { aba: 'graficos', rotulo: 'Gráficos', obrigatoria: false, depende: [], validar: function () { return []; } },
    { aba: 'busca', rotulo: 'Busca de modelos', obrigatoria: false, depende: ['amostras'], validar: function () { return []; } },
    { aba: 'rna', rotulo: 'Rede neural', obrigatoria: false, depende: ['modelo'], validar: function () { return []; } },
    { aba: 'avancado', rotulo: 'Ferramentas avançadas', obrigatoria: false, depende: ['modelo'], validar: function () { return []; } },
    { aba: 'avaliacao', rotulo: '5. Avaliação e NBR', obrigatoria: true, depende: ['modelo'], validar: function (p, e) {
      if (!e.projecao) return ['estimar o valor do avaliando (botão "Estimar valor")'];
      if (e.projecao.erro) return ['estimativa com erro: ' + e.projecao.erro];
      return [];
    } },
    { aba: 'laudo', rotulo: '6. Laudo completo', obrigatoria: true, depende: ['avaliacao'], validar: function () { return []; } },
    { aba: 'relatorio', rotulo: 'Relatório', obrigatoria: false, depende: ['avaliacao'], validar: function () { return []; } }
  ];
  ET.porAba = {};
  ET.ETAPAS.forEach(function (x) { ET.porAba[x.aba] = x; });

  // Vizinhança não calcula valor: pula variáveis, amostras, modelo e avaliação.
  const soViz = function (p) { return INF.TiposLaudo && INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(p)); };

  // Situação de todas as etapas: { aba: { completa, liberada, faltas, bloqueio } }
  ET.situacao = function (p, estado) {
    const r = {};
    const completa = function (aba) {
      if (r[aba]) return r[aba].completa;
      const et = ET.porAba[aba];
      if (soViz(p) && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(aba) >= 0) return true;
      return et.validar(p, estado).length === 0;
    };
    ET.ETAPAS.forEach(function (et) {
      const faltas = soViz(p) && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(et.aba) >= 0 ? [] : et.validar(p, estado);
      // liberada quando TODAS as dependências (e as delas) estão completas
      const pendente = (function procura(lista) {
        for (let i = 0; i < lista.length; i++) {
          const dep = ET.porAba[lista[i]];
          const antes = procura(dep.depende);
          if (antes) return antes;
          if (!completa(dep.aba)) return dep;
        }
        return null;
      })(et.depende);
      r[et.aba] = { completa: faltas.length === 0, liberada: !pendente, faltas: faltas,
        bloqueio: pendente ? { etapa: pendente.rotulo, aba: pendente.aba, faltas: soViz(p) ? [] : pendente.validar(p, estado) } : null };
    });
    return r;
  };

  // Etapas obrigatórias completas / total (para a barra de progresso).
  ET.progresso = function (sit) {
    const obrig = ET.ETAPAS.filter(function (x) { return x.obrigatoria; });
    return { feitas: obrig.filter(function (x) { return sit[x.aba].completa; }).length, total: obrig.length,
      proxima: obrig.find(function (x) { return !sit[x.aba].completa; }) || null };
  };

  INF.Etapas = ET;
})(globalThis.INF = globalThis.INF || {});
````


---

# Tela

## web/css/estilo.css
<a id="web-css-estilo-css"></a>

````css
/* =============================================================================
   web/css/estilo.css — visual do COON Infer
   Cores em variáveis (tokens) no :root; tema escuro automático pelo sistema.
   ============================================================================= */

:root {
  --fundo: #f4f5f7; --cartao: #ffffff; --texto: #1c1f24; --suave: #5d6570; --linha: #dde1e6;
  --marca: #1f5f8b; --marca-forte: #164868; --marca-fundo: #e7f0f7;
  --ok: #1e7b45; --ok-fundo: #e5f4ea; --atencao: #9a6a00; --atencao-fundo: #fbf2dc;
  --fraco: #b85c00; --ruim: #b3261e; --ruim-fundo: #fbe7e5; --info-fundo: #eef1f5;
  --banco: #e8f1fb;
  --laudo: #c2410c; --laudo-forte: #9a3412; --laudo-fundo: #fff1e6;
  --g-grade: #e6e8eb; --g-borda: #9aa1a9; --g-texto: #4a5159; --g-ponto: #1f5f8b; --g-alerta: #b3261e; --g-barra: #a9c3da; --g-curva: #b3261e;
  --raio: 10px; --sombra: 0 1px 2px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04);
  color-scheme: light;
}
@media (prefers-color-scheme: dark) {
  :root {
    --fundo: #14171b; --cartao: #1c2025; --texto: #e6e8eb; --suave: #9aa3ad; --linha: #2f353c;
    --marca: #5ea7d8; --marca-forte: #86bfe4; --marca-fundo: #1d2b36;
    --ok: #5fc58a; --ok-fundo: #16291e; --atencao: #e2b24a; --atencao-fundo: #2c2515;
    --fraco: #f09a4a; --ruim: #f07b72; --ruim-fundo: #331c1a; --info-fundo: #222830;
    --banco: #1b2733;
    --laudo: #f08a4b; --laudo-forte: #ffb482; --laudo-fundo: #3a2418;
    --g-grade: #2a3037; --g-borda: #58616b; --g-texto: #aab2bb; --g-ponto: #5ea7d8; --g-alerta: #f07b72; --g-barra: #3c5b75; --g-curva: #f07b72;
    color-scheme: dark;
  }
}

* { box-sizing: border-box; }
body { margin: 0; background: var(--fundo); color: var(--texto); font: 14px/1.45 system-ui, "Segoe UI", Roboto, sans-serif; }
h2 { font-size: 16px; margin: 0 0 12px; } h2 small { font-weight: 400; color: var(--suave); margin-left: 8px; }
h3 { font-size: 14px; margin: 16px 0 8px; }
code { background: var(--info-fundo); padding: 1px 5px; border-radius: 4px; }

/* topo */
.topo { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 10px 20px; background: var(--cartao); border-bottom: 1px solid var(--linha); position: sticky; top: 0; z-index: 5; }
.marca { font-weight: 600; font-size: 16px; } .logo { color: var(--marca); font-weight: 800; letter-spacing: .5px; }
.projeto-atual { flex: 1; color: var(--suave); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 120px; }
.arquivo { display: flex; gap: 6px; flex-wrap: wrap; }
.status { font-size: 12px; padding: 3px 10px; border-radius: 99px; background: var(--info-fundo); color: var(--suave); }
.status.on { background: var(--ok-fundo); color: var(--ok); }

/* abas */
.abas { display: flex; gap: 4px; padding: 8px 20px 0; overflow-x: auto; border-bottom: 1px solid var(--linha); background: var(--cartao); }
.aba { border: 0; background: none; padding: 9px 14px; border-bottom: 3px solid transparent; color: var(--suave); cursor: pointer; white-space: nowrap; font: inherit; border-radius: 0; }
.aba:hover { color: var(--texto); } .aba.ativa { color: var(--marca); border-bottom-color: var(--marca); font-weight: 600; }

.conteudo { max-width: 1320px; margin: 0 auto; padding: 18px 20px 60px; }
.cartao { background: var(--cartao); border: 1px solid var(--linha); border-radius: var(--raio); box-shadow: var(--sombra); padding: 18px; margin-bottom: 16px; }
.cartao.destaque { border-color: var(--marca); }

/* formulários */
.grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 12px 16px; }
.escolha-escalas { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 10px 14px; }
.campo { display: flex; flex-direction: column; gap: 4px; } .campo > span { font-size: 12px; color: var(--suave); font-weight: 500; }
.campo small, .barra small, .nota { color: var(--suave); font-size: 12px; }
input, select, textarea { font: inherit; color: var(--texto); background: var(--cartao); border: 1px solid var(--linha); border-radius: 6px; padding: 6px 8px; min-width: 0; }
input:focus, select:focus, textarea:focus { outline: 2px solid var(--marca); outline-offset: -1px; }
textarea { width: 100%; resize: vertical; }
input.largo { min-width: 320px; flex: 1; } input.curto { width: 80px; }
button, .botao { font: inherit; border: 1px solid var(--marca); background: var(--marca-fundo); color: var(--marca-forte); padding: 6px 12px; border-radius: 6px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
button:hover, .botao:hover { filter: brightness(.97); }
button.principal { background: var(--marca); color: #fff; }
button.leve, .botao.leve { background: transparent; border-color: var(--linha); color: var(--texto); }
button.perigo { color: var(--ruim); }
button:disabled { opacity: .45; cursor: not-allowed; }
.barra { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 12px; }
.chk { display: inline-flex; gap: 4px; align-items: center; font-size: 12px; margin-right: 6px; white-space: nowrap; }
progress { width: 240px; height: 10px; }

.radios { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
.radio { border: 1px solid var(--linha); border-radius: 8px; padding: 10px 12px; display: grid; grid-template-columns: auto 1fr; gap: 2px 8px; cursor: pointer; }
.radio input { grid-row: span 2; } .radio small { color: var(--suave); } .radio.ativo { border-color: var(--marca); background: var(--marca-fundo); }

.portais { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.portais button { flex-direction: column; align-items: flex-start; gap: 0; } .portais small { color: var(--suave); font-size: 11px; }

/* tabelas */
.rolagem { overflow-x: auto; }
.tabela { border-collapse: collapse; width: 100%; font-size: 13px; }
.tabela th, .tabela td { border-bottom: 1px solid var(--linha); padding: 5px 7px; text-align: right; white-space: nowrap; }
.tabela th { font-size: 12px; color: var(--suave); font-weight: 600; background: var(--fundo); position: sticky; top: 0; }
.tabela th small { display: block; font-weight: 400; }
.tabela td:first-child, .tabela th:first-child, .tabela .esq { text-align: left; }
.tabela td.ok { color: var(--ok); } .tabela td.ruim { color: var(--ruim); font-weight: 600; }
.grade-amostras input { width: 90px; padding: 3px 5px; } .grade-amostras input.num { width: 96px; text-align: right; }
.grade-amostras input.medio { width: 170px; } .grade-amostras input[type=checkbox] { width: auto; }
.grade-amostras td { padding: 3px 4px; }
tr.desligada td { opacity: .45; } tr.outlier td { background: var(--ruim-fundo); } tr.banco td { background: var(--banco); }
.escalas { white-space: normal !important; max-width: 300px; text-align: left !important; }
.acoes { display: flex; gap: 4px; }
.sinal { color: var(--atencao); font-weight: 700; }

/* indicadores */
.indicadores { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.ind { background: var(--fundo); border-radius: 8px; padding: 8px 10px; } .ind span { display: block; font-size: 11px; color: var(--suave); } .ind b { font-size: 15px; font-variant-numeric: tabular-nums; }
.equacao { margin-top: 14px; font-family: Consolas, "Cascadia Mono", monospace; background: var(--fundo); padding: 10px; border-radius: 6px; overflow-wrap: anywhere; }
.duas { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; }
.graus { display: flex; gap: 24px; margin-top: 14px; flex-wrap: wrap; } .graus > div { display: flex; align-items: center; gap: 8px; font-weight: 600; } .graus small { font-weight: 400; color: var(--suave); }
.selo { padding: 2px 9px; border-radius: 99px; font-size: 12px; font-weight: 700; }
.selo.g3 { background: var(--ok-fundo); color: var(--ok); } .selo.g2 { background: var(--atencao-fundo); color: var(--atencao); }
.selo.g1, .selo.g0 { background: var(--ruim-fundo); color: var(--ruim); }
.sig { font-weight: 600; } .sig.ok { color: var(--ok); } .sig.atencao { color: var(--atencao); } .sig.fraco { color: var(--fraco); } .sig.ruim { color: var(--ruim); }

/* avisos e achados */
.aviso { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; margin-bottom: 14px; background: var(--info-fundo); }
.aviso.ok { background: var(--ok-fundo); color: var(--ok); } .aviso.erro { background: var(--ruim-fundo); color: var(--ruim); }
.aviso .fechar { border: 0; background: none; font-size: 18px; color: inherit; padding: 0 4px; }
.achados { list-style: none; padding: 0; margin: 8px 0; display: grid; gap: 6px; }
.achados li { padding: 7px 10px; border-radius: 6px; border-left: 4px solid var(--linha); background: var(--fundo); }
.achados li.erro { border-left-color: var(--ruim); } .achados li.alerta { border-left-color: var(--atencao); } .achados li.info { border-left-color: var(--marca); }
.correcao { margin-top: 6px; padding: 6px 8px; border: 1px dashed var(--marca); border-radius: 6px; background: var(--cartao); }
.correcao small { display: block; color: var(--suave); } .correcao.feita { border-style: solid; color: var(--ok); }
.erro-caixa { background: var(--ruim-fundo); color: var(--ruim); padding: 10px 14px; border-radius: 8px; }
.vazio { color: var(--suave); text-align: center; padding: 40px 0; } p.ok { color: var(--ok); }
.lista { padding-left: 18px; } .lista li { margin-bottom: 4px; }

/* gráficos */
.graficos { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 12px; }
.grafico { width: 100%; height: auto; background: var(--cartao); border: 1px solid var(--linha); border-radius: 8px; }
.g-grade { stroke: var(--g-grade); } .g-borda { fill: none; stroke: var(--g-borda); }
.g-texto { font: 10px system-ui, sans-serif; fill: var(--g-texto); } .g-titulo { font: 600 11px system-ui, sans-serif; fill: var(--texto); }
.g-ponto { fill: var(--g-ponto); fill-opacity: .8; } .g-ponto-alerta { fill: var(--g-alerta); }
.g-linha { stroke: var(--g-borda); stroke-dasharray: 4 3; } .g-limite { stroke: var(--g-alerta); stroke-dasharray: 2 3; }
.g-barra { fill: var(--g-barra); } .g-curva { fill: none; stroke: var(--g-curva); stroke-width: 1.5; } .g-num { font: 9px system-ui, sans-serif; fill: var(--g-texto); }

/* celular */
@media (max-width: 700px) {
  .topo { padding: 8px 16px; } .abas { padding: 6px 16px 0; } .conteudo { padding: 14px 16px 50px; }
  .cartao { padding: 14px; } input.largo { min-width: 0; width: 100%; } .graficos { grid-template-columns: 1fr; }
}
tr.escolhida td { background: var(--ok-fundo); font-weight: 600; }
.g-avaliando { fill: var(--atencao); stroke: var(--texto); stroke-width: 1; }

.largo2 { grid-column: 1 / -1; }
.fotos { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 12px; }
.foto-item { margin: 0; display: flex; flex-direction: column; gap: 6px; border: 1px solid var(--linha); border-radius: 8px; padding: 8px; }
.foto-item img { width: 100%; height: 140px; object-fit: cover; border-radius: 4px; }
mark { background: #fff27a; color: #1c1f24; padding: 0 2px; }

/* botão e aba do laudo completo: cor própria para achar de longe */
.botao-laudo { background: var(--laudo); border-color: var(--laudo); color: #fff; font-weight: 700; }
.botao-laudo:hover { background: var(--laudo-forte); border-color: var(--laudo-forte); }
.aba[data-aba="laudo"] { color: var(--laudo); font-weight: 700; }
.aba[data-aba="laudo"].ativa { border-bottom-color: var(--laudo); color: var(--laudo); }
.cartao-laudo { border-color: var(--laudo); background: var(--laudo-fundo); }
.cartao-laudo button.principal { background: var(--laudo); border-color: var(--laudo); }

.marcas { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 6px 14px; }
.chk.grande { font-size: 13px; white-space: normal; }
.quesito { border: 1px solid var(--linha); border-radius: 8px; padding: 8px; margin-bottom: 8px; display: grid; gap: 6px; }
.fonte { display: block; color: var(--suave); font-size: 11px; margin-left: 22px; }
.texto-longo { white-space: normal !important; min-width: 260px; }

.checagem { margin-top: 12px; padding: 10px 12px; border-radius: 8px; border: 2px solid var(--linha); }
.checagem.bloqueada { border-color: var(--ruim); background: var(--ruim-fundo); color: var(--ruim); }
.checagem.liberada { border-color: var(--ok); background: var(--ok-fundo); color: var(--ok); }
.checagem ul { margin: 6px 0 0; padding-left: 18px; }
.ambiente { border-left: 3px solid var(--laudo); padding-left: 10px; margin: 8px 0; }
.g-raio { fill: var(--g-ponto); fill-opacity: .06; stroke: var(--g-ponto); stroke-dasharray: 5 4; }

.botao.mini { padding: 2px 8px; font-size: 12px; }
.print-colar { margin-top: 10px; padding: 10px; border: 2px dashed var(--linha); border-radius: 8px; }
.print-colar:focus { border-color: var(--marca); outline: none; }
.print-colar img { max-width: 100%; max-height: 260px; display: block; margin-bottom: 6px; }

/* sinais de preenchimento: verde correto, vermelho falta/erro, cadeado bloqueado */
.aba { display: inline-flex; flex-direction: column; align-items: center; gap: 1px; }
.sinal-aba { font-size: 12px; line-height: 1; font-weight: 700; }
.sinal-aba.ok { color: var(--ok); } .sinal-aba.erro { color: var(--ruim); } .sinal-aba.bloq { font-size: 10px; opacity: .8; } .sinal-aba.neutro { color: var(--suave); }
.aba.travada { opacity: .55; }
.sinal { font-size: 12px; font-weight: 600; } .sinal-ok { color: var(--ok); } .sinal-erro { color: var(--ruim); }
.req { color: var(--ruim); }
.campo.obrigatorio input, .campo.obrigatorio textarea { border-left: 3px solid var(--linha); }
.etapas { margin-bottom: 14px; } .etapas small { color: var(--suave); }
.etapas-barra { height: 6px; background: var(--linha); border-radius: 99px; overflow: hidden; margin-bottom: 4px; }
.etapas-barra span { display: block; height: 100%; background: var(--ok); }
.teste-resultado { position: fixed; inset: 20px; z-index: 50; overflow: auto; background: var(--cartao); border: 2px solid var(--marca); border-radius: 12px; padding: 18px; box-shadow: 0 8px 30px rgba(0,0,0,.3); }

/* quadro de dúvidas */
#duvidas { position: fixed; right: 16px; bottom: 16px; z-index: 40; }
.duvidas-botao { background: var(--marca); color: #fff; border-radius: 99px; padding: 10px 16px; box-shadow: 0 4px 14px rgba(0,0,0,.2); font-weight: 600; }
.duvidas-painel { width: min(420px, calc(100vw - 32px)); height: min(560px, calc(100vh - 100px)); display: flex; flex-direction: column; background: var(--cartao); border: 1px solid var(--marca); border-radius: 12px; box-shadow: 0 8px 30px rgba(0,0,0,.25); }
.duvidas-topo { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--linha); }
.duvidas-msgs { flex: 1; overflow: auto; padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
.duvidas-msgs .msg { padding: 8px 10px; border-radius: 10px; max-width: 90%; font-size: 13px; }
.duvidas-msgs .msg.eu { align-self: flex-end; background: var(--marca-fundo); }
.duvidas-msgs .msg.ia { align-self: flex-start; background: var(--fundo); }
.duvidas-rodape { display: flex; gap: 6px; padding: 10px; border-top: 1px solid var(--linha); }
.duvidas-rodape textarea { flex: 1; resize: none; }

.comece { padding: 12px 14px; border-radius: 10px; margin-bottom: 14px; background: var(--ruim-fundo); color: var(--ruim); border: 2px solid var(--ruim); }
.comece.ok { background: var(--ok-fundo); color: var(--ok); border-color: var(--ok); }
````

## web/index.html
<a id="web-index-html"></a>

````html
<!doctype html>
<!-- =============================================================================
     web/index.html — página única do COON Infer
     Carrega o motor (mesmos arquivos que o servidor usa) e depois a tela.
     Nenhum script embutido: a política de segurança do servidor proíbe.
     ============================================================================= -->
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>COON Infer</title>
  <meta name="description" content="Avaliação de imóveis por inferência estatística conforme a ABNT NBR 14.653-2.">
  <link rel="stylesheet" href="css/estilo.css">
</head>
<body>
  <header class="topo">
    <div class="marca"><span class="logo">COON</span> Infer</div>
    <div class="projeto-atual" id="tituloProjeto">Projeto sem nome</div>
    <nav class="arquivo" aria-label="Arquivo">
      <button class="botao-laudo" data-aba="laudo" title="Gerar o laudo de avaliação completo em Word ou PDF">Laudo completo</button>
      <button data-acao="novo">Novo</button>
      <button data-acao="meusProjetos">Meus projetos</button>
      <button class="principal" data-acao="salvarNuvem">Salvar</button>
      <button class="leve" data-acao="exportarExcel" title="Todas as planilhas do trabalho em .xlsx">Exportar Excel</button>
      <button class="leve" data-acao="exportarPDF" title="Relatório completo com gráficos; na impressão escolha Salvar como PDF">Exportar PDF</button>
      <button class="leve" data-acao="baixarProjeto" title="Baixar o projeto em arquivo .json">Baixar</button>
      <label class="botao leve" title="Abrir um projeto .json do computador">Abrir arquivo<input type="file" id="arqProjeto" accept=".json" hidden></label>
    </nav>
    <span id="statusNuvem" class="status off">conectando…</span>
  </header>

  <nav id="abas" class="abas" aria-label="Etapas"></nav>
  <main id="conteudo" class="conteudo"></main>

  <!-- motor estatístico (ordem importa: cada arquivo usa os anteriores) -->
  <script src="motor/00-base.js"></script>
  <script src="motor/01-matriz.js"></script>
  <script src="motor/02-distribuicoes.js"></script>
  <script src="motor/03-transformacoes.js"></script>
  <script src="motor/04-regressao.js"></script>
  <script src="motor/05-diagnosticos.js"></script>
  <script src="motor/06-busca-modelos.js"></script>
  <script src="motor/07-nbr14653.js"></script>
  <script src="motor/08-projecao.js"></script>
  <script src="motor/09-rna.js"></script>
  <script src="motor/10-dados.js"></script>
  <script src="motor/11-operar-variaveis.js"></script>
  <script src="motor/12-pesquisa-mercado.js"></script>
  <script src="motor/13-graficos.js"></script>
  <script src="motor/14-relatorio.js"></script>
  <script src="motor/15-conferencia.js"></script>
  <script src="motor/16-avancado.js"></script>
  <script src="motor/17-planilha.js"></script>
  <script src="motor/18-laudo.js"></script>
  <script src="motor/19-tipos-laudo.js"></script>
  <script src="motor/20-inventario.js"></script>
  <script src="motor/21-modelos-laudo.js"></script>
  <script src="motor/22-estilos-laudo.js"></script>
  <script src="motor/23-etapas.js"></script>
  <!-- tela -->
  <script src="js/nuvem.js"></script>
  <script src="js/interface.js"></script>
  <script src="js/teste-app.js"></script>
</body>
</html>
````

## web/js/interface.js
<a id="web-js-interface-js"></a>

````javascript
/* =============================================================================
   web/js/interface.js — a tela
   -----------------------------------------------------------------------------
   Organização:
     E            → estado da tela (projeto aberto, modelo calculado etc.)
     ABAS         → uma função por aba que devolve o HTML dela
     AÇÕES        → o que cada botão faz (data-acao="nome" no HTML)
     vínculos     → campos com data-bind="caminho" gravam direto no projeto
   Um único ouvinte de clique e um de alteração atendem a tela toda
   ("delegação de eventos"). Nada de onclick no HTML: a política de
   segurança do servidor (CSP) proíbe script embutido, de propósito.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, Rg = INF.Regressao, Dd = INF.Dados, N = INF.NBR, Gf = INF.Graficos, Nv = INF.Nuvem;
  const h = U.esc;

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  const E = {
    proj: Dd.lerLocal() || Dd.novoProjeto(),
    id: null,                 // id do projeto na nuvem (null = ainda não salvo lá)
    aba: 'projeto',
    modelo: null, diag: null, projecao: null, rna: null,
    busca: null, buscando: false, progresso: 0,
    conferencia: null, conferenciaIA: null, conferindoIA: false,
    importacao: null, anuncio: null, mercado: null,
    aviso: null, sujo: false
  };
  try { E.id = localStorage.getItem('inferencia-nbr:id') || null; } catch (e) { /* navegador sem armazenamento */ }

  const ABAS_MENU = [
    ['projeto', 'Projeto'], ['variaveis', 'Variáveis'], ['amostras', 'Amostras'], ['pesquisa', 'Pesquisa de mercado'],
    ['modelo', 'Modelo (regressão)'], ['graficos', 'Gráficos'], ['busca', 'Busca de modelos'], ['rna', 'Rede neural'], ['avancado', 'Ferramentas avançadas'],
    ['avaliacao', 'Avaliação e NBR'], ['laudo', 'Laudo completo'], ['relatorio', 'Relatório']
  ];

  // Roteiros de variáveis por tipologia (só a estrutura; os dados são do avaliador).
  const ROTEIROS = {
    'Terreno': { dep: ['VU', 'R$/m²'], vars: [['Area', 'quantitativa', '-', 'Área do terreno (m²)'], ['Frente', 'quantitativa', '+', 'Testada (m)'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo valorizante (km)'], ['Topografia', 'qualitativa', '+', '1 = aclive/declive acentuado; 2 = leve; 3 = plano'], ['Infra', 'qualitativa', '+', '1 = sem; 2 = parcial; 3 = completa'], ['Meses', 'tempo', '-', 'Meses entre o evento e a data base']] },
    'Apartamento': { dep: ['VU', 'R$/m²'], vars: [['Area_priv', 'quantitativa', '-', 'Área privativa (m²)'], ['Vagas', 'quantitativa', '+', 'Vagas de garagem'], ['Andar', 'quantitativa', '+', 'Pavimento'], ['Padrao', 'qualitativa', '+', '1 = baixo; 2 = normal; 3 = alto'], ['Conservacao', 'qualitativa', '+', '1 = ruim; 2 = regular; 3 = bom'], ['Idade', 'quantitativa', '-', 'Idade aparente (anos)'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo (km)']] },
    'Casa': { dep: ['VU', 'R$/m²'], vars: [['Area_const', 'quantitativa', '-', 'Área construída (m²)'], ['Area_terr', 'quantitativa', '+', 'Área do terreno (m²)'], ['Padrao', 'qualitativa', '+', '1 = baixo; 2 = normal; 3 = alto'], ['Conservacao', 'qualitativa', '+', '1 = ruim; 2 = regular; 3 = bom'], ['Idade', 'quantitativa', '-', 'Idade aparente (anos)'], ['Vagas', 'quantitativa', '+', 'Vagas'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo (km)']] },
    'Sala/Loja': { dep: ['VU', 'R$/m²'], vars: [['Area', 'quantitativa', '-', 'Área (m²)'], ['Frente', 'quantitativa', '+', 'Frente (m)'], ['Andar', 'quantitativa', '-', 'Pavimento'], ['Fluxo', 'qualitativa', '+', '1 = baixo; 2 = médio; 3 = alto'], ['Vaga', 'dicotomica', '+', '0 = sem; 1 = com']] },
    'Galpão': { dep: ['VU', 'R$/m²'], vars: [['Area_const', 'quantitativa', '-', 'Área construída (m²)'], ['Pe_direito', 'quantitativa', '+', 'Pé-direito (m)'], ['Acesso', 'qualitativa', '+', '1 = local; 2 = avenida; 3 = rodovia'], ['Idade', 'quantitativa', '-', 'Idade (anos)']] },
    'Rural': { dep: ['VU_ha', 'R$/ha'], vars: [['Area_ha', 'quantitativa', '-', 'Área total (ha)'], ['Dist_sede', 'quantitativa', '-', 'Distância à sede do município (km)'], ['Topografia', 'qualitativa', '+', '1 = ondulado; 2 = suave-ondulado; 3 = plano'], ['Aptidao', 'qualitativa', '+', '1 = inapto; 2 = regular; 3 = apto; 4 = ótimo'], ['Acesso', 'qualitativa', '+', '1 = terra ruim; 2 = terra boa; 3 = cascalho; 4 = asfalto'], ['Benfeitoria', 'dicotomica', '+', '0 = sem; 1 = com']] }
  };

  // ---------------------------------------------------------------------------
  // Utilidades de tela
  // ---------------------------------------------------------------------------
  const numEntrada = function (v) { const n = U.lerNumero(v); return Number.isFinite(n) ? String(n).replace('.', ',') : ''; };
  const opcoes = function (lista, atual) {
    return lista.map(function (o) { const v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o; return '<option value="' + h(v) + '"' + (String(v) === String(atual) ? ' selected' : '') + '>' + h(r) + '</option>'; }).join('');
  };
  const campo = function (rotulo, controle, dica) {
    return '<label class="campo"><span>' + h(rotulo) + '</span>' + controle + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>';
  };
  const campo_ = function (r, c, d) { return campo(r, c, d); };
  const entrada = function (bind, valor, extra) {
    return '<input data-bind="' + bind + '" value="' + h(valor === null || valor === undefined ? '' : valor) + '"' + (extra || '') + '>';
  };
  const selo = function (grau) {
    return '<span class="selo g' + grau + '">Grau ' + N.romano(grau) + '</span>';
  };
  const semaforo = function (sig) {
    const c = sig <= 0.10 ? 'ok' : sig <= 0.20 ? 'atencao' : sig <= 0.30 ? 'fraco' : 'ruim';
    return '<span class="sig ' + c + '">' + U.fmtPct(sig) + '</span>';
  };
  function avisar(texto, tipo) { E.aviso = { texto: texto, tipo: tipo || 'info' }; desenhar(); }

  // Caminho "projeto.nome" → objeto e chave.
  function resolver(caminho) {
    const partes = caminho.split('.');
    let obj = E.proj;
    for (let i = 0; i < partes.length - 1; i++) { if (obj[partes[i]] === undefined || obj[partes[i]] === null) obj[partes[i]] = {}; obj = obj[partes[i]]; }
    return { obj: obj, chave: partes[partes.length - 1] };
  }

  // Tudo que muda os dados invalida o cálculo anterior.
  function mudou(invalidarModelo) {
    E.sujo = true;
    if (invalidarModelo) { E.modelo = null; E.diag = null; E.projecao = null; }
    Dd.salvarLocal(E.proj);
    atualizarTopo();
  }

  // ---------------------------------------------------------------------------
  // ABAS
  // ---------------------------------------------------------------------------
  const ABAS = {};

  // ---- Projeto -----------------------------------------------------------------
  ABAS.projeto = function () {
    const p = E.proj.projeto, c = E.proj.config;
    // campo obrigatório: rótulo com asterisco e sinal verde (preenchido) ou vermelho (falta)
    const obrig = function (rotulo, controle, valor, dica) {
      const ok = valor !== null && valor !== undefined && String(valor).trim() !== '';
      return '<label class="campo obrigatorio"><span>' + h(rotulo) + ' <b class="req">*</b></span>' + controle
        + '<span class="sinal ' + (ok ? 'sinal-ok' : 'sinal-erro') + '">' + (ok ? '✓ preenchido' : '✗ obrigatório') + '</span>' + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>';
    };
    const sitP = INF.Etapas.situacao(E.proj, E).projeto;
    let s = sitP.completa
      ? '<div class="comece ok">✓ Aba 1 completa. As outras abas estão liberadas: pode lançar os dados em qualquer ordem. Os cálculos só rodam quando os dados necessários estiverem completos.</div>'
      : '<div class="comece">✗ <b>Comece aqui.</b> Preencha os campos com * desta aba para liberar as outras. Falta: ' + h(sitP.faltas.join(', ')) + '.</div>';
    s += '<section class="cartao"><h2>Identificação do trabalho</h2><div class="grade">';
    s += obrig('Responsável técnico', entrada('projeto.autor', p.autor), p.autor);
    s += obrig('Código do trabalho', entrada('projeto.codigo', p.codigo, ' placeholder="Ex.: 2026-045"'), p.codigo, 'Seu código interno do laudo/processo.');
    s += obrig('Imóvel', entrada('projeto.imovel', p.imovel, ' placeholder="Ex.: Fazenda Santa Rita, matrícula 12.345"'), p.imovel, 'Identificação do imóvel avaliado.');
    s += campo('Nome do trabalho', entrada('projeto.nome', p.nome, ' placeholder="Ex.: Fazenda Santa Rita — gleba 2"'));
    s += campo('Tipologia', '<select data-bind="projeto.tipologia">' + opcoes(['Terreno', 'Apartamento', 'Casa', 'Sala/Loja', 'Galpão', 'Rural', 'Gleba urbanizável', 'Outro'], p.tipologia) + '</select>');
    s += obrig('Município / UF', entrada('projeto.municipio', p.municipio, ' placeholder="Ex.: Patos de Minas/MG"'), p.municipio);
    s += obrig('Data base', '<input type="date" data-bind="projeto.dataBase" value="' + h(p.dataBase) + '">', p.dataBase);
    s += campo('Finalidade', entrada('projeto.finalidade', p.finalidade, ' placeholder="Ex.: garantia, perícia judicial, servidão"'));
    s += '</div><label class="campo largo2 obrigatorio"><span>Observação <b class="req">*</b></span><textarea rows="3" data-bind="projeto.observacao" placeholder="Contexto do trabalho, pedido do cliente, particularidades do imóvel">' + h(p.observacao || '') + '</textarea>'
      + '<span class="sinal ' + (String(p.observacao || '').trim() ? 'sinal-ok">✓ preenchido' : 'sinal-erro">✗ obrigatório') + '</span></label>';
    s += '<div class="barra"><button data-acao="roteiro">Montar variáveis sugeridas para a tipologia</button>'
      + '<small>Cria só a estrutura das variáveis (nomes, tipos, direção). Não cria dado.</small></div></section>';

    s += '<section class="cartao"><h2>Critérios do cálculo</h2><div class="grade">';
    s += campo('Fator de oferta', '<input data-bind="config.fatorOferta" data-num value="' + numEntrada(c.fatorOferta) + '">', 'Aplicado só às amostras de oferta.');
    s += campo('Aplicar fator de oferta', '<select data-bind="config.aplicarFatorOferta" data-bool>' + opcoes([['true', 'Sim'], ['false', 'Não']], String(c.aplicarFatorOferta)) + '</select>');
    s += campo('Nível do intervalo de confiança', '<select data-bind="config.nivelIC" data-num>' + opcoes([['0.8', '80% (NBR)'], ['0.9', '90%'], ['0.95', '95%']], String(c.nivelIC)) + '</select>');
    s += campo('Estimativa quando y está em ln', '<select data-bind="config.estimativaLn">' + opcoes([['mediana', 'Mediana — exp(ŷ)'], ['media', 'Média — exp(ŷ + s²/2)'], ['moda', 'Moda — exp(ŷ − s²)']], c.estimativaLn) + '</select>');
    s += campo('Constante entra no item 5', '<select data-bind="config.considerarIntercepto" data-bool>' + opcoes([['true', 'Sim (mais conservador)'], ['false', 'Não']], String(c.considerarIntercepto)) + '</select>');
    s += campo('Item 1 — caracterização do avaliando', '<select data-bind="config.item1" data-num>' + opcoes([[3, 'III — ' + N.NORMA.textoItem1[3]], [2, 'II — ' + N.NORMA.textoItem1[2]], [1, 'I — ' + N.NORMA.textoItem1[1]]], c.item1) + '</select>');
    s += campo('Item 3 — identificação dos dados', '<select data-bind="config.item3" data-num>' + opcoes([[3, 'III — com foto e características observadas'], [2, 'II — todas as características'], [1, 'I — só as variáveis do modelo']], c.item3) + '</select>');
    s += campo('Semente (RNA e busca)', '<input data-bind="config.semente" data-num value="' + h(c.semente) + '">', 'Mesma semente = mesmo resultado.');
    s += '</div></section>';

    const ant = Dd.lerAnterior();
    if (ant && ant.projeto.nome !== E.proj.projeto.nome) {
      s += '<section class="cartao"><h2>Projeto anterior deste navegador</h2><p class="nota">"' + h(ant.projeto.nome || '(sem nome)') + '", com ' + ant.amostras.length + ' amostra(s), foi substituído neste navegador.</p><div class="barra"><button data-acao="recuperarAnterior">Recuperar esse projeto</button></div></section>';
    }
    s += '<section class="cartao"><h2>Polo valorizante</h2><p class="nota">Ponto de referência para a variável de distância (centro, sede do município, via principal).</p><div class="grade">';
    s += campo('Nome do polo', entrada('config.polo.nome', c.polo.nome));
    s += campo('Latitude', '<input data-bind="config.polo.lat" data-num value="' + numEntrada(c.polo.lat) + '" placeholder="-18,5789">');
    s += campo('Longitude', '<input data-bind="config.polo.lon" data-num value="' + numEntrada(c.polo.lon) + '" placeholder="-46,5178">');
    s += '</div></section>';
    return s;
  };

  // ---- Variáveis -----------------------------------------------------------------
  ABAS.variaveis = function () {
    let s = '<section class="cartao"><h2>Variáveis</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Nome</th><th>Tipo</th><th>Unidade</th><th>Direção esperada</th><th>Escalas testadas na busca</th><th>Códigos / descrição</th><th></th></tr></thead><tbody>';
    E.proj.variaveis.forEach(function (v) {
      const perm = v.permitidas && v.permitidas.length ? v.permitidas : T.permitidasPorTipo(v.tipo);
      const escalas = v.tipo === 'identificacao' ? '—' : T.LISTA.map(function (t) {
        return '<label class="chk"><input type="checkbox" data-var="' + h(v.nome) + '" data-escala="' + t.id + '"' + (perm.indexOf(t.id) >= 0 ? ' checked' : '') + '>' + t.rotulo + '</label>';
      }).join('');
      const codigos = Object.keys(v.codigos || {}).map(function (c) { return c + '=' + v.codigos[c]; }).join('; ');
      s += '<tr><td><b>' + h(v.nome) + '</b></td>'
        + '<td><select data-var="' + h(v.nome) + '" data-chave="tipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), v.tipo) + '</select></td>'
        + '<td><input class="curto" data-var="' + h(v.nome) + '" data-chave="unidade" value="' + h(v.unidade) + '"></td>'
        + '<td><select data-var="' + h(v.nome) + '" data-chave="direcao">' + opcoes([['', '—'], ['+', '↑ aumenta o valor'], ['-', '↓ diminui o valor']], v.direcao) + '</select></td>'
        + '<td class="escalas">' + escalas + '</td>'
        + '<td><input data-var="' + h(v.nome) + '" data-chave="codigos" value="' + h(codigos) + '" placeholder="1=Plano; 2=Aclive"><input data-var="' + h(v.nome) + '" data-chave="descricao" value="' + h(v.descricao) + '" placeholder="descrição"></td>'
        + '<td class="acoes"><button class="leve" data-acao="renomear" data-arg="' + h(v.nome) + '">Renomear</button><button class="leve perigo" data-acao="excluirVar" data-arg="' + h(v.nome) + '">Excluir</button></td></tr>';
    });
    s += '</tbody></table></div>';
    s += '<div class="barra"><input id="novaVarNome" placeholder="Nome (sem espaço)"><select id="novaVarTipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), 'quantitativa') + '</select><button data-acao="incluirVar">Incluir variável</button></div></section>';

    s += '<section class="cartao"><h2>Operar variáveis</h2><p class="nota">Cria uma coluna a partir de outras. Ex.: <code>VU = VT / Area</code>, <code>Idade = 2026 - Ano</code>, <code>Asfalto = Acesso >= 4</code>. Funções: ln, log, exp, raiz, abs, min, max.</p>';
    s += '<div class="barra"><input id="opNome" placeholder="Nova variável"><select id="opTipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), 'quantitativa') + '</select><input id="opFormula" class="largo" placeholder="Fórmula"><button data-acao="operar">Calcular coluna</button></div></section>';

    const tempos = E.proj.variaveis.filter(function (v) { return v.tipo === 'tempo'; });
    const quants = E.proj.variaveis.filter(function (v) { return v.tipo === 'quantitativa' || v.tipo === 'proxy'; });
    s += '<section class="cartao"><h2>Preenchimento automático</h2><div class="barra">';
    s += '<select id="varTempo">' + opcoes(tempos.map(function (v) { return v.nome; }), '') + '</select><button data-acao="tempo"' + (tempos.length ? '' : ' disabled') + '>Meses desde o evento (pela data de cada amostra)</button></div>';
    s += '<div class="barra"><select id="varDist">' + opcoes(quants.map(function (v) { return v.nome; }), '') + '</select><button data-acao="distancia"' + (quants.length ? '' : ' disabled') + '>Distância ao polo (km, pelas coordenadas)</button></div></section>';
    return s;
  };

  // ---- Amostras ------------------------------------------------------------------
  ABAS.amostras = function () {
    const p = E.proj;
    const vars = p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    const outl = new Set(E.diag ? E.diag.outliers : []);
    const achadosPorAmostra = {};
    (E.conferencia || []).concat((E.conferenciaIA && E.conferenciaIA.apontamentos) || []).forEach(function (a) { if (a.amostra) achadosPorAmostra[a.amostra] = (achadosPorAmostra[a.amostra] || 0) + 1; });

    // origem dos dados (modelo híbrido)
    const origem = p.config.origemDados || 'meus';
    let s = '<section class="cartao"><h2>Origem dos dados</h2><div class="radios">';
    [['meus', 'Só as minhas amostras', 'O que você lançou ou importou neste projeto.'],
      ['sistema', 'Só dados do sistema', 'Banco de mercado: suas pesquisas anteriores e as compartilhadas na COON.'],
      ['hibrido', 'Híbrido', 'As suas + as do banco, sem repetir.']].forEach(function (o) {
      s += '<label class="radio' + (origem === o[0] ? ' ativo' : '') + '"><input type="radio" name="origem" value="' + o[0] + '"' + (origem === o[0] ? ' checked' : '') + ' data-acao-mudar="origem"><b>' + o[1] + '</b><small>' + o[2] + '</small></label>';
    });
    s += '</div><div class="barra"><label class="chk"><input type="checkbox" id="incluirCompart" checked> incluir amostras compartilhadas por outros engenheiros</label>'
      + '<button data-acao="buscarBanco"' + (Nv.logado() ? '' : ' disabled') + '>Aplicar origem escolhida</button>'
      + '<button class="leve" data-acao="enviarBanco"' + (Nv.logado() ? '' : ' disabled') + '>Guardar minhas amostras no banco</button>'
      + '<label class="chk"><input type="checkbox" id="compartilhar"> compartilhar com a COON (sem informante e telefone)</label></div>'
      + (Nv.logado() ? '' : '<p class="nota">Entre no COON para usar o banco de mercado.</p>') + '</section>';

    // conferência
    s += '<section class="cartao"><h2>Conferência antes de calcular</h2><div class="barra">'
      + '<button data-acao="conferir">Conferir pelas regras</button>'
      + '<button class="leve" data-acao="semContato">Tirar do cálculo ofertas sem fonte e telefone/link</button>'
      + '<button data-acao="conferirIA"' + (Nv.sessao && Nv.sessao.conferenciaIA ? '' : ' disabled') + '>' + (E.conferindoIA ? 'Conferindo…' : 'Conferir com IA') + '</button>'
      + '<small>A IA aponta e sugere correções; nada muda sem a sua autorização.</small></div>';
    if (E.conferencia) {
      s += E.conferencia.length ? '<ul class="achados">' + E.conferencia.map(function (a) {
        return '<li class="' + a.nivel + '"><b>' + (a.amostra ? 'Amostra ' + a.amostra : 'Geral') + '</b> — ' + h(a.texto) + '</li>';
      }).join('') + '</ul>' : '<p class="ok">Nenhum problema pelas regras.</p>';
    }
    if (E.conferenciaIA) {
      const aps = E.conferenciaIA.apontamentos;
      s += '<h3>Apontamentos da IA</h3>' + (aps.length ? '<ul class="achados">' + aps.map(function (a, i) {
        let corr = '';
        if (a.correcao && !a.aplicada) {
          const c = a.correcao;
          const oque = c.acao === 'desligar' ? 'tirar a amostra do cálculo'
            : c.acao === 'escala' ? 'escala de ' + h(c.campo) + ': ' + h(E.proj.modelo.transf[c.campo] || 'x') + ' → ' + h(c.para)
            : h(c.campo) + ': ' + h(c.de === null ? 'vazio' : c.de) + ' → <b>' + h(c.para) + '</b>';
          corr = '<div class="correcao"><label class="chk"><input type="checkbox" data-sugestao="' + i + '"> Sugestão: ' + oque + '</label>'
            + (c.evidencia ? '<small>Evidência: ' + h(c.evidencia) + '</small>' : '') + '</div>';
        } else if (a.aplicada) corr = '<div class="correcao feita">Correção aplicada.</div>';
        return '<li class="' + (a.gravidade === 'alta' ? 'erro' : a.gravidade === 'media' ? 'alerta' : 'info') + '"><b>' + (a.amostra ? 'Amostra ' + a.amostra : 'Geral') + ' · ' + h(a.assunto) + '</b> — ' + h(a.texto) + corr + '</li>';
      }).join('') + '</ul>' : '<p class="ok">Nenhum apontamento.</p>');
      if (aps.some(function (a) { return a.correcao && !a.aplicada; })) {
        s += '<div class="barra"><button class="principal" data-acao="aplicarSugestoes">Aplicar as sugestões marcadas</button><small>Só as marcadas. Cada uma fica no histórico e pode ser desfeita.</small></div>';
      }
      if (E.conferenciaIA.parecer) s += '<p class="nota">' + h(E.conferenciaIA.parecer) + '</p>';
      s += '<p class="nota">Consumo: ' + E.conferenciaIA.consumo.entrada + ' tokens de entrada, ' + E.conferenciaIA.consumo.saida + ' de saída (' + h(E.conferenciaIA.modelo) + ').</p>';
    }
    s += '</section>';

    // histórico de correções autorizadas
    const hist = (p.historico || []);
    if (hist.length) {
      s += '<section class="cartao"><h2>Histórico de correções</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Quando</th><th>Amostra</th><th>Alteração</th><th>Evidência</th><th></th></tr></thead><tbody>'
        + hist.map(function (r, i) {
          const alt = r.acao === 'desligar' ? 'retirada do cálculo' : (r.acao === 'escala' ? 'escala de ' : '') + h(r.campo) + ': ' + h(r.de) + ' → ' + h(r.para);
          return '<tr class="' + (r.desfeito ? 'desligada' : '') + '"><td>' + new Date(r.quando).toLocaleString('pt-BR') + '</td><td>' + (r.amostra || '—') + '</td><td class="esq">' + alt + '</td><td class="esq">' + h(r.evidencia) + '</td>'
            + '<td>' + (r.desfeito ? 'desfeita' : '<button class="leve" data-acao="desfazer" data-arg="' + i + '">Desfazer</button>') + '</td></tr>';
        }).join('') + '</tbody></table></div></section>';
    }

    // importação em andamento
    if (E.importacao) s += painelImportacao();

    // estatística descritiva das amostras no cálculo
    s += '<section class="cartao"><h2>Estatística das amostras</h2>' + tabelaDescritiva(INF.Diag.descritivaProjeto(p)) + '</section>';

    // grade de amostras
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; }).length;
    s += '<section class="cartao"><h2>Amostras <small>' + p.amostras.length + ' lançadas · ' + ativas + ' no cálculo</small></h2><div class="barra">'
      + '<button data-acao="novaAmostra" data-arg="1">+ Amostra</button><button class="leve" data-acao="novaAmostra" data-arg="5">+ 5 linhas</button>'
      + '<label class="botao leve">Importar planilha (CSV)<input type="file" id="arqCSV" accept=".csv,.txt" hidden></label>'
      + '<button class="leve" data-acao="exportarCSV">Exportar CSV</button><button class="leve" data-acao="reconsiderar">Reconsiderar todas</button></div>';
    s += '<div class="rolagem"><table class="tabela grade-amostras"><thead><tr><th title="Entra no cálculo">✓</th><th>Nº</th><th>Natureza</th><th>Data</th>'
      + vars.map(function (v) { return '<th>' + h(v.nome) + (v.unidade ? '<small>' + h(v.unidade) + '</small>' : '') + '</th>'; }).join('')
      + '<th>Endereço</th><th>Bairro</th><th>Informante</th><th>Telefone</th><th>Link</th><th>Print</th><th>Lat</th><th>Lon</th><th>Observação</th><th></th></tr></thead><tbody>';
    p.amostras.forEach(function (a) {
      const cls = [a.habilitada === false ? 'desligada' : '', outl.has(a.id) ? 'outlier' : '', a.origem === 'banco' ? 'banco' : ''].join(' ');
      const id = a.id;
      const cel = function (chave, valor, num, larg) {
        return '<td><input class="' + (larg || '') + '" data-amostra="' + id + '" data-chave="' + chave + '"' + (num ? ' data-num inputmode="decimal"' : '') + ' value="' + h(num ? numEntrada(valor) : valor) + '"></td>';
      };
      s += '<tr class="' + cls + '"><td><input type="checkbox" data-amostra="' + id + '" data-chave="habilitada"' + (a.habilitada !== false ? ' checked' : '') + '></td>'
        + '<td>' + id + (achadosPorAmostra[id] ? ' <span class="sinal" title="Tem apontamento na conferência">!</span>' : '') + '</td>'
        + '<td><select data-amostra="' + id + '" data-chave="natureza">' + opcoes([['oferta', 'Oferta'], ['transacao', 'Transação']], a.natureza) + '</select></td>'
        + '<td><input type="date" data-amostra="' + id + '" data-chave="data" value="' + h(a.data) + '"></td>'
        + vars.map(function (v) { return cel('valores.' + v.nome, a.valores[v.nome], true, 'num'); }).join('')
        + cel('endereco', a.endereco, false, 'medio') + cel('bairro', a.bairro) + cel('informante', a.informante, false, 'medio') + cel('telefone', a.telefone)
        + cel('link', a.link, false, 'medio')
        + '<td><label class="botao leve mini" title="Anexar o print do anúncio">' + ((p.fotos || []).filter(function (f) { return f.alvo === 'print:' + id; }).length || '+') + '<input type="file" accept="image/*" data-print-amostra="' + id + '" hidden></label></td>'
        + cel('lat', a.lat, true, 'num') + cel('lon', a.lon, true, 'num') + cel('obs', a.obs, false, 'medio')
        + '<td><button class="leve perigo" data-acao="excluirAmostra" data-arg="' + id + '" title="Excluir">×</button></td></tr>';
    });
    s += '</tbody></table></div><p class="nota">Linha vermelha = outlier no último cálculo (resíduo acima de 2 desvios). Linha azul = veio do banco de mercado. Desmarcar ✓ tira do cálculo sem apagar.</p></section>';
    return s;
  };

  function painelImportacao() {
    const im = E.importacao;
    const destinos = [['ignorar', '(ignorar)']]
      .concat(['endereco', 'bairro', 'informante', 'telefone', 'link', 'data', 'natureza', 'lat', 'lon', 'obs'].map(function (c) { return ['campo:' + c, 'campo: ' + c]; }))
      .concat(E.proj.variaveis.map(function (v) { return ['variavel:' + v.nome, 'variável: ' + v.nome]; }))
      .concat([['nova', '+ nova variável quantitativa']]);
    let s = '<section class="cartao destaque"><h2>Importar ' + im.linhas.length + ' linha(s)</h2><p class="nota">Confira para onde vai cada coluna da planilha.</p><div class="rolagem"><table class="tabela"><thead><tr><th>Coluna da planilha</th><th>Exemplo</th><th>Vai para</th></tr></thead><tbody>';
    im.cab.forEach(function (c, i) {
      const m = im.mapa[i];
      const atual = m.destino === 'ignorar' ? 'ignorar' : m.destino === 'nova' ? 'nova' : m.destino + ':' + m.nome;
      s += '<tr><td>' + h(c) + '</td><td>' + h((im.linhas[0] || [])[i] || '') + '</td><td><select data-mapa="' + i + '">' + opcoes(destinos, atual) + '</select></td></tr>';
    });
    return s + '</tbody></table></div><div class="barra"><button data-acao="confirmarImportacao">Importar</button><button class="leve" data-acao="cancelarImportacao">Cancelar</button></div></section>';
  }

  // ---- Pesquisa de mercado -----------------------------------------------------------
  ABAS.pesquisa = function () {
    const p = E.proj.projeto;
    const pm = INF.Pesquisa;
    let s = '<section class="cartao"><h2>Buscar ofertas nos portais</h2><div class="grade">';
    s += campo('Tipo de imóvel', '<input id="pqTipo" value="' + h(p.tipologia === 'Rural' ? 'fazenda' : p.tipologia.toLowerCase()) + '">');
    s += campo('Finalidade', '<select id="pqFin">' + opcoes(['venda', 'aluguel'], 'venda') + '</select>');
    s += campo('Município', '<input id="pqMun" value="' + h(p.municipio) + '">');
    s += '</div><div class="portais">' + pm.PORTAIS.map(function (po, i) {
      return '<button class="leve" data-acao="abrirPortal" data-arg="' + i + '">' + h(po.nome) + '<small>' + h(po.uso) + '</small></button>';
    }).join('') + '</div><p class="nota">Abre a busca em outra aba. A captura automática em massa não é feita: os portais proíbem e amostra de laudo precisa de conferência.</p></section>';

    s += '<section class="cartao"><h2>Trazer um anúncio</h2><div class="grade">';
    s += campo('Link do anúncio', '<input id="anLink" class="largo" placeholder="https://...">');
    s += '</div><div class="barra"><button data-acao="lerLink"' + (Nv.sessao && Nv.sessao.leituraLink ? '' : ' disabled') + '>Ler pelo link</button><small>Leitura automática da página (Supadata), um anúncio por vez.</small></div>';
    s += campo('Ou cole aqui o texto do anúncio (Ctrl+A, Ctrl+C na página)', '<textarea id="anTexto" rows="5"></textarea>');
    s += '<div class="barra"><button data-acao="extrair">Extrair dados do texto</button></div>';
    if (E.anuncio) s += painelAnuncio();
    s += '</section>';

    s += '<section class="cartao"><h2>Fontes de transações</h2><ul class="lista">' + pm.FONTES_TRANSACAO.map(function (f) {
      return '<li><b>' + h(f.nome) + '</b> — ' + h(f.obs) + '</li>';
    }).join('') + '</ul><p class="nota">Transações entram pela aba Amostras → Importar planilha, com a coluna "natureza" = transação (sem fator de oferta).</p></section>';
    return s;
  };

  function painelAnuncio() {
    const a = E.anuncio;
    const vars = E.proj.variaveis;
    const dep = Rg.dependente(E.proj);
    const areas = vars.filter(function (v) { return v.tipo === 'quantitativa'; });
    let s = '<div class="cartao destaque"><h3>Dados encontrados — confira antes de gravar</h3>';
    if (a.avisos && a.avisos.length) s += '<ul class="achados">' + a.avisos.map(function (t) { return '<li class="alerta">' + h(t) + '</li>'; }).join('') + '</ul>';
    s += '<div class="grade">';
    s += campo('Preço (R$)', '<input id="anPreco" value="' + numEntrada(a.preco) + '">');
    s += campo('Área', '<input id="anArea" value="' + numEntrada(a.area) + '">', a.unidadeArea ? 'unidade encontrada: ' + a.unidadeArea : '');
    s += campo('Valor unitário', '<output>' + (Number.isFinite(a.vu) ? U.fmt(a.vu, 2) : '—') + '</output>');
    s += campo('Natureza', '<select id="anNat">' + opcoes([['oferta', 'Oferta'], ['transacao', 'Transação']], 'oferta') + '</select>');
    s += campo('Informante', '<input id="anInf" value="' + h(a.informante || '') + '">');
    s += campo('Telefone', '<input id="anTel" value="' + h(a.telefone) + '">');
    s += campo('Data do anúncio', '<input type="date" id="anData" value="' + new Date().toISOString().slice(0, 10) + '">');
    s += campo('Endereço / referência', '<input id="anEnd" value="' + h(a.titulo || '') + '">');
    s += campo('Área vai para a variável', '<select id="anVarArea">' + opcoes([['', '(nenhuma)']].concat(areas.map(function (v) { return v.nome; })), (areas.find(function (v) { return /area/i.test(v.nome); }) || {}).nome || '') + '</select>');
    s += campo(dep ? dep.nome + ' recebe' : 'Dependente', '<select id="anModoDep">' + opcoes([['vu', 'Preço ÷ área (valor unitário)'], ['total', 'Preço total']], /^(vt|valor)/i.test(dep ? dep.nome : '') ? 'total' : 'vu') + '</select>');
    s += '</div><div class="print-colar" tabindex="0" id="areaPrint">' + (E.anuncioPrint ? '<img src="' + E.anuncioPrint.dataUrl + '" alt="print do anúncio"><small>Print pronto: vai para a ficha da amostra.</small>'
      : '<b>Print do anúncio:</b> clique aqui e cole (Ctrl+V), ou <label class="botao leve mini">escolha o arquivo<input type="file" accept="image/*" id="arqPrintAnuncio" hidden></label>') + '</div>';
    s += '<div class="barra"><button data-acao="gravarAnuncio">Adicionar como amostra</button><label class="chk"><input type="checkbox" id="anBanco"' + (Nv.logado() ? ' checked' : ' disabled') + '> guardar também no banco de mercado</label></div></div>';
    return s;
  }

  // ---- Modelo (regressão) ----------------------------------------------------------------
  ABAS.modelo = function () {
    const p = E.proj;
    const vars = p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    let s = '<section class="cartao"><h2>Escalas do modelo</h2><div class="escolha-escalas">';
    vars.forEach(function (v) {
      const perm = (v.permitidas && v.permitidas.length ? v.permitidas : T.permitidasPorTipo(v.tipo));
      const lista = perm.map(function (id) { return [id, T.porId[id].rotulo]; });
      if (v.tipo !== 'dependente') lista.push(['fora', '(fora do modelo)']);
      s += campo(v.nome + (v.tipo === 'dependente' ? ' (y)' : ''), '<select data-bind="modelo.transf.' + v.nome + '">' + opcoes(lista, p.modelo.transf[v.nome] || 'x') + '</select>');
    });
    s += '</div><div class="barra"><button class="principal" data-acao="calcularTudo"' + (E.buscando ? ' disabled' : '') + '>' + (E.buscando ? 'Calculando…' : 'Calcular tudo (automático)') + '</button>'
      + '<button data-acao="calcular">Calcular só estas escalas</button>'
      + (E.buscando ? '<progress max="1" value="0"></progress>' : '<small>Automático: confere, testa todas as combinações, escolhe a melhor dentro da norma e calcula.</small>') + '</div></section>';
    if (E.resumoAuto) s += '<section class="cartao destaque"><h2>Cálculo automático</h2><ul class="lista">' + E.resumoAuto.map(function (t) { return '<li>' + h(t) + '</li>'; }).join('') + '</ul></section>';

    const m = E.modelo;
    if (!m) return s + '<p class="vazio">Escolha as escalas e clique em Calcular.</p>';
    if (m.erro) return s + '<p class="erro-caixa">' + h(m.erro) + '</p>';
    const d = E.diag;

    // quadro-resumo
    s += '<section class="cartao"><h2>Resultado</h2><div class="indicadores">'
      + ind('Dados usados', m.n) + ind('Variáveis (k)', m.p - 1) + ind('Correlação (r)', U.fmt(m.r, 4)) + ind('R²', U.fmt(m.R2, 4))
      + ind('R² ajustado', U.fmt(m.R2aj, 4)) + ind('F calculado', U.fmt(m.F, 2)) + ind('Sig do modelo', U.fmtPct(m.sigF, 4))
      + ind('Erro padrão', U.fmtAuto(m.s)) + ind('R² de previsão', U.fmt(d.prev.R2previsao, 4)) + ind('Durbin-Watson', U.fmt(d.dw, 3))
      + ind('Outliers', d.outliers.length ? d.outliers.join(', ') : 'nenhum') + ind('Cook > 1', d.influentes.length ? d.influentes.join(', ') : 'nenhum')
      + '</div><div class="equacao">' + h(m.equacao) + '</div><div class="nota">' + h(Rg.equacaoExplicita(m)) + '</div></section>';

    // enquadramento na NBR (definitivo se já houve projeção)
    const fundM = E.projecao && !E.projecao.erro ? E.projecao.fundamentacao : N.fundamentacaoPreliminar(m, p.config);
    s += '<section class="cartao"><h2>Enquadramento NBR 14.653-2</h2>' + quadroGraus(fundM, E.projecao && !E.projecao.erro ? E.projecao.grauPrecisao : null, E.projecao ? E.projecao.amplitude : NaN) + '</section>';
    s += '<section class="cartao"><h2>Estatística das amostras usadas</h2>' + tabelaDescritiva(INF.Diag.descritivaProjeto(p)) + '</section>';

    // tabela de regressores
    s += '<section class="cartao"><h2>Regressores</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Variável</th><th>Escala</th><th>Coeficiente</th><th>t calculado</th><th>Sig</th><th>Elasticidade</th><th>VIF</th><th>Mínimo</th><th>Média</th><th>Máximo</th></tr></thead><tbody>';
    s += '<tr><td>Constante</td><td>—</td><td>' + U.fmtAuto(m.b[0]) + '</td><td>' + U.fmt(m.t[0], 3) + '</td><td>' + semaforo(m.sig[0]) + '</td><td>—</td><td>—</td><td></td><td></td><td></td></tr>';
    m.indep.forEach(function (v, j) {
      s += '<tr><td>' + h(v.nome) + '</td><td>' + T.porId[v.transf].rotulo + '</td><td>' + U.fmtAuto(m.b[j + 1]) + '</td><td>' + U.fmt(m.t[j + 1], 3) + '</td><td>' + semaforo(m.sig[j + 1]) + '</td>'
        + '<td>' + U.fmt(m.elasticidade[j].elasticidade, 2) + '%</td><td>' + U.fmt(d.vif[j].vif, 2) + '</td>'
        + '<td>' + U.fmtAuto(m.faixa[j].min) + '</td><td>' + U.fmtAuto(m.faixa[j].media) + '</td><td>' + U.fmtAuto(m.faixa[j].max) + '</td></tr>';
    });
    s += '<tr><td><b>' + h(m.dep.nome) + '</b> (y)</td><td>' + T.porId[m.dep.transf].rotulo + '</td><td colspan="5"></td><td>' + U.fmtAuto(m.faixaY.min) + '</td><td>' + U.fmtAuto(m.faixaY.media) + '</td><td>' + U.fmtAuto(m.faixaY.max) + '</td></tr>';
    s += '</tbody></table></div><p class="nota">Sig: verde ≤ 10% (Grau III) · amarelo ≤ 20% (II) · laranja ≤ 30% (I) · vermelho acima.</p></section>';

    // tabela de análise de variância
    s += '<section class="cartao"><h2>Análise de variância (ANOVA)</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Fonte</th><th>Soma dos quadrados</th><th>gl</th><th>Quadrado médio</th><th>F</th><th>Sig</th></tr></thead><tbody>'
      + '<tr><td>Regressão</td><td>' + U.fmtAuto(m.SQReg) + '</td><td>' + m.glReg + '</td><td>' + U.fmtAuto(m.SQReg / m.glReg) + '</td><td>' + U.fmt(m.F, 3) + '</td><td>' + U.fmtPct(m.sigF, 4) + '</td></tr>'
      + '<tr><td>Resíduo</td><td>' + U.fmtAuto(m.SQRes) + '</td><td>' + m.gl + '</td><td>' + U.fmtAuto(m.s2) + '</td><td></td><td></td></tr>'
      + '<tr><td>Total</td><td>' + U.fmtAuto(m.SQTot) + '</td><td>' + (m.n - 1) + '</td><td></td><td></td><td></td></tr></tbody></table></div></section>';

    // pressupostos
    const teste = function (nome, est, p, okTexto, nokTexto) {
      return '<tr><td>' + nome + '</td><td>' + U.fmt(est, 4) + '</td><td>' + U.fmtPct(p) + '</td><td class="' + (p >= 0.05 ? 'ok' : 'ruim') + '">' + (p >= 0.05 ? okTexto : nokTexto) + '</td></tr>';
    };
    s += '<section class="cartao"><h2>Pressupostos</h2><div class="duas"><div><h3>Normalidade — proporções</h3><table class="tabela"><thead><tr><th>Faixa</th><th>Normal</th><th>Modelo</th></tr></thead><tbody>'
      + d.proporcoes.map(function (q) { return '<tr><td>' + q.faixa + '</td><td>' + U.fmtPct(q.esperado, 0) + '</td><td>' + U.fmtPct(q.obtido, 0) + '</td></tr>'; }).join('')
      + '</tbody></table></div><div><h3>Testes</h3><table class="tabela"><thead><tr><th>Teste</th><th>Estat.</th><th>p</th><th>Leitura (5%)</th></tr></thead><tbody>'
      + teste('Shapiro-Wilk', d.sw.estatistica, d.sw.p, 'normal', 'não normal')
      + teste('Kolmogorov-Smirnov (Lilliefors)', d.ks.estatistica, d.ks.p, 'normal', 'não normal')
      + teste('Jarque-Bera', d.jb.estatistica, d.jb.p, 'normal', 'não normal')
      + teste('Breusch-Pagan', d.bp.estatistica, d.bp.p, 'homocedástico', 'heterocedástico')
      + '</tbody></table></div></div>';
    s += '<h3>Correlações (isoladas / parciais)</h3><div class="rolagem"><table class="tabela"><thead><tr><th></th>' + d.correl.nomes.map(function (n) { return '<th>' + h(n) + '</th>'; }).join('') + '</tr></thead><tbody>';
    d.correl.nomes.forEach(function (n, a) {
      s += '<tr><th>' + h(n) + '</th>' + d.correl.nomes.map(function (_, b) {
        const iso = d.correl.isoladas[a][b], par = d.correl.parciais ? d.correl.parciais[a][b] : NaN;
        const alerta = a !== b && a < d.correl.nomes.length - 1 && b < d.correl.nomes.length - 1 && Math.abs(iso) > 0.8;
        return '<td class="' + (alerta ? 'ruim' : '') + '">' + (a === b ? '—' : U.fmt(iso, 2) + ' / ' + U.fmt(par, 2)) + '</td>';
      }).join('') + '</tr>';
    });
    s += '</tbody></table></div><p class="nota">Vermelho = duas independentes com correlação acima de 0,80 (colinearidade).</p></section>';

    // gráficos
    const res = d.residuos;
    s += '<section class="cartao"><h2>Gráficos</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Observado × estimado', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true, numerar: true })
      + Gf.histograma(res.map(function (r) { return r.padronizado; }))
      + Gf.qq(res.map(function (r) { return r.padronizado; }));
    m.indep.forEach(function (v, j) {
      s += Gf.dispersao(m.X.map(function (l, i) { return { x: l[j + 1], y: m.y[i], rotulo: m.ids[i] }; }), { titulo: T.termo(m.dep.transf, m.dep.nome) + ' × ' + T.termo(v.transf, v.nome), rotX: T.termo(v.transf, v.nome), rotY: T.termo(m.dep.transf, m.dep.nome) });
    });
    s += '</div></section>';

    // resíduos
    s += '<section class="cartao"><h2>Resíduos por amostra</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Nº</th><th>Observado</th><th>Estimado</th><th>Resíduo</th><th>Padronizado</th><th>Studentizado</th><th>Alavancagem</th><th>Cook</th><th></th></tr></thead><tbody>';
    res.forEach(function (r) {
      s += '<tr class="' + (r.outlier || r.influente ? 'outlier' : '') + '"><td>' + r.id + '</td><td>' + U.fmtAuto(r.observado) + '</td><td>' + U.fmtAuto(r.estimado) + '</td><td>' + U.fmtAuto(r.residuo) + '</td><td>' + U.fmt(r.padronizado, 3) + '</td><td>' + U.fmt(r.studentizado, 3) + '</td><td>' + U.fmt(r.alavancagem, 3) + '</td><td>' + U.fmt(r.cook, 3) + '</td>'
        + '<td><button class="leve" data-acao="desligar" data-arg="' + r.id + '">Tirar do cálculo</button></td></tr>';
    });
    s += '</tbody></table></div></section>';
    return s;
  };
  // Tabela de estatística descritiva (média, mediana, desvio, CV...).
  function tabelaDescritiva(desc) {
    let t = '<div class="rolagem"><table class="tabela"><thead><tr><th>Variável</th><th>n</th><th>Média</th><th>Mediana</th><th>Desvio padrão</th><th>CV</th><th>Mínimo</th><th>1º quartil</th><th>3º quartil</th><th>Máximo</th><th>Assimetria</th></tr></thead><tbody>';
    desc.linhas.forEach(function (d) {
      t += '<tr><td>' + h(d.nome) + (d.unidade ? ' <small>' + h(d.unidade) + '</small>' : '') + '</td><td>' + d.n + '</td><td>' + U.fmtAuto(d.media) + '</td><td><b>' + U.fmtAuto(d.mediana) + '</b></td><td>' + U.fmtAuto(d.desvio) + '</td>'
        + '<td class="' + (d.cv > 0.3 ? 'ruim' : '') + '">' + U.fmtPct(d.cv, 1) + '</td><td>' + U.fmtAuto(d.min) + '</td><td>' + U.fmtAuto(d.q1) + '</td><td>' + U.fmtAuto(d.q3) + '</td><td>' + U.fmtAuto(d.max) + '</td><td>' + U.fmt(d.assimetria, 2) + '</td></tr>';
    });
    return t + '</tbody></table></div><p class="nota">' + desc.ativas + ' de ' + desc.total + ' amostras no cálculo. CV acima de 30% (vermelho) indica conjunto heterogêneo. Assimetria acima de 1 sugere testar ln na dependente.</p>';
  }

  // Quadro dos graus NBR (fundamentação e precisão) com os itens.
  function quadroGraus(fund, precisao, amplitude) {
    let t = '<div class="graus"><div>Fundamentação ' + selo(fund.grau) + '<small>' + fund.pontos + ' pontos' + (fund.preliminar ? ' · preliminar (falta o avaliando)' : '') + '</small></div>'
      + '<div>Precisão ' + (precisao === null ? '<span class="selo g0">—</span><small>estime o avaliando</small>' : selo(precisao) + '<small>amplitude ' + U.fmtPct(amplitude) + '</small>') + '</div></div>';
    t += '<div class="rolagem"><table class="tabela"><thead><tr><th>Item</th><th>Descrição</th><th>Situação</th><th>Grau</th></tr></thead><tbody>'
      + fund.itens.map(function (it) { return '<tr><td>' + it.item + '</td><td class="esq">' + h(it.descricao) + '</td><td class="esq">' + h(it.detalhe) + '</td><td>' + selo(it.grau) + '</td></tr>'; }).join('')
      + '</tbody></table></div>';
    if (fund.pendencias.length) t += '<ul class="achados">' + fund.pendencias.map(function (x) { return '<li class="info">' + h(x) + '</li>'; }).join('') + '</ul>';
    return t;
  }

  function ind(rotulo, valor) { return '<div class="ind"><span>' + h(rotulo) + '</span><b>' + h(valor) + '</b></div>'; }

  // ---- Gráficos (todos) -------------------------------------------------------------------
  ABAS.graficos = function () {
    const m = E.modelo, p = E.proj;
    let s = '';
    // distribuição de frequência de todas as variáveis (não depende de modelo)
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
    s += '<section class="cartao"><h2>Distribuição de frequência das variáveis</h2><div class="graficos">';
    p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; }).forEach(function (v) {
      const g = Gf.frequencia(ativas.map(function (a) { return v.tipo === 'dependente' ? Rg.valorDependente(p, a, v.nome) : U.lerNumero(a.valores[v.nome]); }), v.nome + (v.unidade ? ' (' + v.unidade + ')' : ''), v.nome);
      s += g || Gf.vazio('Distribuição de ' + v.nome, v.nome, 'frequência', 'lance ao menos 2 amostras com valor');
    });
    s += '</div></section>';
    // mapa
    const comCoord = ativas.filter(function (a) { return Number.isFinite(a.lat) && Number.isFinite(a.lon); });
    if (comCoord.length) {
      const dep = Rg.dependente(p);
      const outl = new Set(E.diag ? E.diag.outliers : []);
      s += '<section class="cartao"><h2>Mapa das amostras</h2><div class="graficos">' + Gf.mapa(comCoord.map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: a.id, valor: dep ? U.lerNumero(a.valores[dep.nome]) : null, destaque: outl.has(a.id) }; }),
        Number.isFinite(p.avaliando.lat) && Number.isFinite(p.avaliando.lon) ? { lat: p.avaliando.lat, lon: p.avaliando.lon } : null) + '</div><p class="nota">' + comCoord.length + ' amostra(s) com coordenadas. Triângulo = avaliando.</p></section>';
    }
    if (!comCoord.length) s += '<section class="cartao"><h2>Mapa das amostras</h2><div class="graficos">' + Gf.vazio('Localização das amostras', 'longitude', 'latitude', 'informe latitude e longitude das amostras') + '</div></section>';
    if (!m || m.erro) {
      // sem modelo: as molduras aparecem vazias, cada uma dizendo o que falta
      const motivo = m && m.erro ? m.erro : 'calcule o modelo na aba Modelo';
      return s + '<section class="cartao"><h2>Ajuste do modelo e resíduos</h2><div class="graficos">'
        + Gf.vazio('Observado × estimado', 'estimado', 'observado', motivo) + Gf.vazio('Resíduos padronizados × estimado', 'estimado', 'resíduo padronizado', motivo)
        + Gf.vazio('Distribuição dos resíduos', 'resíduo padronizado', 'densidade', motivo) + Gf.vazio('Gráfico Q-Q normal', 'quantil teórico', 'resíduo', motivo)
        + Gf.vazio('Distância de Cook', 'amostra', 'Cook', motivo) + Gf.vazio('Valor × variável (curva do modelo)', 'variável', 'valor', motivo) + '</div></section>';
    }
    const res = E.diag.residuos;
    s += '<section class="cartao"><h2>Ajuste do modelo</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Observado × estimado (escala do modelo)', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + Gf.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ' real)', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + '</div></section>';
    s += '<section class="cartao"><h2>Valor × cada variável, com a curva do modelo</h2><div class="graficos">'
      + m.indep.map(function (v, j) { return Gf.curvaModelo(m, j, Rg.prever); }).join('') + '</div></section>';
    s += '<section class="cartao"><h2>Resíduos</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true, numerar: true })
      + m.indep.map(function (v, j) { return Gf.dispersao(res.map(function (r, i) { return { x: m.xOriginal[i][j], y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos × ' + v.nome, rotX: v.nome, rotY: 'resíduo padronizado', faixas2s: true }); }).join('')
      + Gf.histograma(res.map(function (r) { return r.padronizado; }))
      + Gf.qq(res.map(function (r) { return r.padronizado; }))
      + Gf.barras(res.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1)
      + Gf.barras(res.map(function (r) { return { rotulo: r.id, valor: r.alavancagem }; }), 'Alavancagem (h)', 'h', 2 * m.p / m.n)
      + '</div></section>';
    s += '<section class="cartao"><h2>Dispersão na escala do modelo</h2><div class="graficos">'
      + m.indep.map(function (v, j) { return Gf.dispersao(m.X.map(function (l, i) { return { x: l[j + 1], y: m.y[i], rotulo: m.ids[i] }; }), { titulo: T.termo(m.dep.transf, m.dep.nome) + ' × ' + T.termo(v.transf, v.nome), rotX: T.termo(v.transf, v.nome), rotY: T.termo(m.dep.transf, m.dep.nome) }); }).join('')
      + '</div></section>';
    return s;
  };

  // ---- Ferramentas avançadas ----------------------------------------------------------------
  ABAS.avancado = function () {
    const m = E.modelo;
    if (!m || m.erro) return '<p class="vazio">Calcule o modelo primeiro (aba Modelo).</p>';
    const R = E.avancado || (E.avancado = {});
    const bt = function (acao, rotulo, ajuda) { return '<div class="barra"><button data-acao="' + acao + '">' + rotulo + '</button><small>' + ajuda + '</small></div>'; };
    let s = '<section class="cartao"><h2>Análises clássicas</h2>';
    s += bt('avPCA', 'Componentes principais (PCA)', 'Quantas dimensões independentes existem entre as variáveis.');
    if (R.pca) s += R.pca.erro ? '<p class="erro-caixa">' + h(R.pca.erro) + '</p>' : '<div class="rolagem"><table class="tabela"><thead><tr><th>Componente</th><th>Autovalor</th><th>Variância</th><th>Acumulada</th>' + R.pca.nomes.map(function (n) { return '<th>' + h(n) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + R.pca.componentes.map(function (c) { return '<tr><td>' + c.componente + '</td><td>' + U.fmt(c.autovalor, 3) + '</td><td>' + U.fmtPct(c.variancia, 1) + '</td><td>' + U.fmtPct(c.acumulada, 1) + '</td>' + c.cargas.map(function (x) { return '<td>' + U.fmt(x, 3) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    s += '<div class="barra"><button data-acao="avKmedias">Agrupamento K-médias</button><select id="avK">' + opcoes([2, 3, 4, 5, 6], R.k || 3) + '</select><small>Sub-mercados de amostras parecidas.</small></div>';
    if (R.km) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Grupo</th><th>Amostras</th><th>Média de ' + h(m.dep.nome) + '</th>' + m.indep.map(function (v) { return '<th>' + h(v.nome) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + R.km.grupos.map(function (g) { return '<tr><td>' + g.grupo + '</td><td class="esq">' + g.amostras.join(', ') + '</td><td>' + U.fmtAuto(g.mediaY) + '</td>' + g.medias.map(function (x) { return '<td>' + U.fmtAuto(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    const numericas = E.proj.variaveis.filter(function (v) { return v.tipo === 'quantitativa' || v.tipo === 'proxy'; });
    s += '<div class="barra"><button data-acao="avDEA">DEA — eficiência</button><small>Insumo:</small><select id="avDeaIn">' + opcoes(numericas.map(function (v) { return v.nome; }), R.deaIn || '') + '</select><small>Produto: ' + h(m.dep.nome) + ' (com fator)</small></div>';
    if (R.dea) s += R.dea.erro ? '<p class="erro-caixa">' + h(R.dea.erro) + '</p>' : '<p class="nota">Eficiência 1 = na fronteira (melhor relação ' + h(m.dep.nome) + ' / ' + h(R.dea.insumos[0]) + ').</p><div class="rolagem"><table class="tabela"><thead><tr><th>Amostra</th><th>Eficiência</th></tr></thead><tbody>' + R.dea.resultado.map(function (r) { return '<tr><td>' + r.id + '</td><td>' + U.fmt(r.eficiencia, 4) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    s += '<p class="nota">Poda da rede neural: na aba Rede neural.</p></section>';

    s += '<section class="cartao"><h2>Novidades</h2>';
    s += bt('avBoxCox', 'Box-Cox (escala ideal de ' + h(m.dep.nome) + ')', 'Diz com número se y deve ficar direta, em ln, 1/y ou √y.');
    if (R.bc) s += R.bc.erro ? '<p class="erro-caixa">' + h(R.bc.erro) + '</p>' : '<p>λ = <b>' + U.fmt(R.bc.lambda, 2) + '</b> (IC 95%: ' + U.fmt(R.bc.ic95[0], 2) + ' a ' + U.fmt(R.bc.ic95[1], 2) + '). Escala recomendada: <b>' + h(R.bc.recomendada[1]) + '</b>' + (R.bc.compativeis.length > 1 ? '; também compatíveis: ' + R.bc.compativeis.slice(1).map(function (c) { return c[1]; }).join(', ') : '') + '. <button class="leve" data-acao="avUsarBoxCox">Usar esta escala</button></p>';
    s += bt('avBootCoef', 'Bootstrap dos coeficientes', 'Intervalo de cada coeficiente e quantas vezes o sinal se manteve (1.000 reamostragens).');
    if (R.bcoef) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Regressor</th><th>Coeficiente</th><th>IC ' + Math.round(R.bcoef.nivel * 100) + '% mín</th><th>máx</th><th>Erro padrão bootstrap</th><th>Mesmo sinal</th></tr></thead><tbody>'
      + R.bcoef.coeficientes.map(function (c) { return '<tr><td>' + h(c.nome) + '</td><td>' + U.fmtAuto(c.coeficiente) + '</td><td>' + U.fmtAuto(c.min) + '</td><td>' + U.fmtAuto(c.max) + '</td><td>' + U.fmtAuto(c.erroPadrao) + '</td><td class="' + (c.mesmoSinal < 0.9 ? 'ruim' : 'ok') + '">' + U.fmtPct(c.mesmoSinal, 0) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    s += bt('avRobusta', 'Regressão robusta (Huber)', 'Reduz o peso dos outliers em vez de excluir; compara com o modelo comum.');
    if (R.rob) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Regressor</th><th>Comum</th><th>Robusto</th><th>Diferença</th></tr></thead><tbody>' + R.rob.coeficientes.map(function (c) { return '<tr><td>' + h(c.nome) + '</td><td>' + U.fmtAuto(c.comum) + '</td><td>' + U.fmtAuto(c.robusto) + '</td><td class="' + (Math.abs(c.diferenca) > 0.2 ? 'ruim' : '') + '">' + U.fmtPct(c.diferenca, 1) + '</td></tr>'; }).join('') + '</tbody></table></div><p class="nota">Amostras com peso reduzido: ' + (R.rob.pesos.length ? R.rob.pesos.map(function (x) { return x.id + ' (' + U.fmt(x.peso, 2) + ')'; }).join(', ') : 'nenhuma') + '.</p>';
    s += bt('avBoosting', 'Árvores com reforço (tipo XGBoost) e importância das variáveis', 'Comparação e descoberta de variável esquecida; não substitui a equação no laudo.');
    if (R.gb) s += '<p>R² treino ' + U.fmt(R.gb.R2treino, 3) + ' · R² validação (1 em cada 5 amostras fora) <b>' + U.fmt(R.gb.R2validacao, 3) + '</b>' + (R.gb.R2validacao < 0.5 ? ' — decorou os dados; pouca amostra para esse método.' : '') + '</p><table class="tabela"><thead><tr><th>Variável</th><th>Importância</th></tr></thead><tbody>' + R.gb.importancia.map(function (i) { return '<tr><td>' + h(i.nome) + '</td><td>' + U.fmtPct(i.importancia, 1) + '</td></tr>'; }).join('') + '</tbody></table>';
    s += bt('avMoran', 'Autocorrelação espacial (I de Moran)', 'Resíduos parecidos entre vizinhos = localização mal representada.');
    if (R.moran) s += R.moran.erro ? '<p class="erro-caixa">' + h(R.moran.erro) + '</p>' : '<p>I = ' + U.fmt(R.moran.I, 4) + ' (esperado ' + U.fmt(R.moran.esperado, 4) + '), z = ' + U.fmt(R.moran.z, 2) + ', p = ' + U.fmtPct(R.moran.p) + ' — <b>' + (R.moran.p < 0.05 ? 'há autocorrelação espacial: incluir variável de localização' : 'sem autocorrelação espacial relevante') + '</b>.</p>';
    const valsAval = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    const temAval = valsAval.every(Number.isFinite);
    s += bt('avBootAval', 'Bootstrap do valor do avaliando', temAval ? 'Confere o intervalo clássico por reamostragem.' : 'Preencha o avaliando na aba Avaliação.');
    if (R.bs) s += '<p>IC ' + U.fmt(E.proj.config.nivelIC * 100, 0) + '% por bootstrap: <b>' + U.fmtAuto(R.bs.min) + ' a ' + U.fmtAuto(R.bs.max) + '</b> (amplitude ' + U.fmtPct(R.bs.amplitude) + ')' + (E.projecao && !E.projecao.erro ? ' · clássico: ' + U.fmtAuto(E.projecao.icMin) + ' a ' + U.fmtAuto(E.projecao.icMax) : '') + '.</p>';
    s += bt('avSimulacao', 'Simulação de variáveis aleatórias (Monte Carlo)', temAval ? '10.000 sorteios dos coeficientes; distribuição do valor.' : 'Preencha o avaliando na aba Avaliação.');
    if (R.sim) s += '<div class="indicadores">' + ind('P5', U.fmtAuto(R.sim.p05)) + ind('P10', U.fmtAuto(R.sim.p10)) + ind('Mediana (P50)', U.fmtAuto(R.sim.p50)) + ind('P90', U.fmtAuto(R.sim.p90)) + ind('P95', U.fmtAuto(R.sim.p95)) + ind('Média', U.fmtAuto(R.sim.media)) + '</div><div class="graficos">' + Gf.frequencia(R.sim.valores.filter(function (_, i) { return i % 5 === 0; }), 'Distribuição simulada do valor', m.dep.nome) + '</div>';
    s += '</section>';
    return s;
  };

  // ---- Busca de modelos -------------------------------------------------------------------
  ABAS.busca = function () {
    const o = E.opBusca || (E.opBusca = { criterio: 'R2orig', limite: 500, testarExclusao: true, sigMaxRegressores: '0.3', sigMaxF: '0.05', exigirSinais: true });
    let s = '<section class="cartao"><h2>Busca automática de modelos</h2><p class="nota">Testa todas as combinações de escalas (e, se marcado, a exclusão de variáveis) e guarda os melhores. Com muitas variáveis, passa para busca heurística.</p><div class="grade">';
    s += campo('Ordenar por', '<select data-busca="criterio">' + opcoes([['R2orig', 'R² na escala original (compara ln e linear com justiça)'], ['R2aj', 'R² ajustado'], ['R2', 'R²'], ['R2prev', 'R² de previsão (validação cruzada)'], ['AIC', 'AIC (menor)'], ['sigMax', 'Menor Sig máxima']], o.criterio) + '</select>');
    s += campo('Quantos guardar', '<select data-busca="limite">' + opcoes([['100', '100'], ['500', '500'], ['1000', '1.000'], ['5000', '5.000']], String(o.limite)) + '</select>');
    s += campo('Sig máxima dos regressores', '<select data-busca="sigMaxRegressores">' + opcoes([['', 'sem filtro'], ['0.3', '30% (Grau I)'], ['0.2', '20% (Grau II)'], ['0.1', '10% (Grau III)']], o.sigMaxRegressores) + '</select>');
    s += campo('Sig máxima do F', '<select data-busca="sigMaxF">' + opcoes([['', 'sem filtro'], ['0.05', '5% (Grau I)'], ['0.02', '2% (Grau II)'], ['0.01', '1% (Grau III)']], o.sigMaxF) + '</select>');
    s += campo('Testar exclusão de variáveis', '<select data-busca="testarExclusao">' + opcoes([['true', 'Sim'], ['false', 'Não']], String(o.testarExclusao)) + '</select>');
    s += campo('Exigir sinais coerentes', '<select data-busca="exigirSinais">' + opcoes([['true', 'Sim (usa a direção esperada)'], ['false', 'Não']], String(o.exigirSinais)) + '</select>');
    s += '</div><div class="barra"><button class="principal" data-acao="buscar"' + (E.buscando ? ' disabled' : '') + '>' + (E.buscando ? 'Buscando…' : 'Iniciar busca') + '</button>'
      + (E.buscando ? '<progress max="1" value="' + E.progresso + '"></progress>' : '') + '</div></section>';

    const b = E.busca;
    if (!b) return s;
    if (b.erro) return s + '<p class="erro-caixa">' + h(b.erro) + '</p>';
    s += '<section class="cartao"><h2>' + b.modelos.length + ' melhores modelos <small>' + U.fmt(b.avaliados, 0) + ' avaliados · ' + U.fmt(b.validos, 0) + ' passaram nos filtros · busca ' + b.modo + '</small></h2>';
    s += '<div class="rolagem"><table class="tabela"><thead><tr><th>#</th><th>Escalas</th><th>k</th><th>R²</th><th>R² aj.</th><th>R² orig.</th><th>Sig máx</th><th>Sig F</th><th></th></tr></thead><tbody>';
    b.modelos.slice(0, 200).forEach(function (r, i) {
      const esc = Object.keys(r.transf).filter(function (k) { return r.transf[k] !== 'fora'; }).map(function (k) { return T.termo(r.transf[k], k); }).join(', ');
      s += '<tr><td>' + (i + 1) + '</td><td class="esq">' + h(esc) + '</td><td>' + r.k + '</td><td>' + U.fmt(r.R2, 4) + '</td><td>' + U.fmt(r.R2aj, 4) + '</td><td>' + U.fmt(r.R2orig, 4) + '</td><td>' + semaforo(r.sigMax) + '</td><td>' + U.fmtPct(r.sigF, 3) + '</td>'
        + '<td><button class="leve" data-acao="usarModelo" data-arg="' + i + '">Usar</button></td></tr>';
    });
    s += '</tbody></table></div>' + (b.modelos.length > 200 ? '<p class="nota">Mostrando 200 de ' + b.modelos.length + '. Os demais seguem guardados.</p>' : '') + '</section>';
    return s;
  };

  // ---- RNA ------------------------------------------------------------------------------
  ABAS.rna = function () {
    const o = E.opRna || (E.opRna = { ocultos: 4, redes: 15, epocas: 3000 });
    let s = '<section class="cartao"><h2>Rede neural artificial</h2><p class="nota">Usa as mesmas variáveis do modelo de regressão (as que não estão "fora"), na escala original. Serve de comparação; em perícia a regressão é mais fácil de defender.</p><div class="grade">';
    s += campo('Neurônios na camada oculta', '<input data-rna="ocultos" value="' + o.ocultos + '">');
    s += campo('Redes no bagging', '<input data-rna="redes" value="' + o.redes + '">');
    s += campo('Épocas máximas', '<input data-rna="epocas" value="' + o.epocas + '">');
    s += '</div><div class="barra"><button class="principal" data-acao="treinarRNA">Treinar</button><button data-acao="podarRNA"' + (E.rna && !E.rna.erro ? '' : ' disabled') + '>Poda (retirar neurônios fracos)</button></div></section>';
    const r = E.rna;
    if (!r) return s;
    if (r.erro) return s + '<p class="erro-caixa">' + h(r.erro) + '</p>';
    if (r.poda) s += '<p class="nota">Poda: ' + r.poda.neuroniosAntes + ' → ' + r.poda.neuroniosDepois + ' neurônios no total das redes; R² ' + U.fmt(r.poda.R2antes, 4) + ' → ' + U.fmt(r.R2, 4) + '.</p>';
    s += '<section class="cartao"><h2>Resultado da RNA</h2><div class="indicadores">' + ind('R²', U.fmt(r.R2, 4)) + ind('Erro médio percentual', U.fmtPct(r.EMP)) + ind('Redes', r.redes.length) + ind('Amostras', r.n)
      + (E.modelo && !E.modelo.erro ? ind('R² da regressão', U.fmt(E.modelo.R2, 4)) : '') + '</div>';
    s += '<table class="tabela"><thead><tr><th>Variável</th><th>Sensibilidade (+1% na variável)</th></tr></thead><tbody>' + r.sensibilidade.map(function (x) { return '<tr><td>' + h(x.nome) + '</td><td>' + U.fmt(x.elasticidade, 2) + '%</td></tr>'; }).join('') + '</tbody></table>';
    const valores = r.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    if (valores.every(Number.isFinite)) {
      const pv = INF.RNA.prever(r, valores);
      s += '<p>Avaliando pela RNA: <b>' + U.fmtAuto(pv.media) + '</b> (desvio entre as redes: ' + U.fmtAuto(pv.desvio) + ')</p>';
    }
    s += '<div class="graficos">' + Gf.dispersao(r.observado.map(function (y, i) { return { x: r.estimado[i], y: y, rotulo: r.ids[i] }; }), { titulo: 'RNA: observado × estimado', rotX: 'estimado', rotY: 'observado', linha45: true }) + '</div></section>';
    return s;
  };

  // ---- Avaliação e NBR -------------------------------------------------------------------
  ABAS.avaliacao = function () {
    const m = E.modelo;
    if (!m || m.erro) return '<p class="vazio">Calcule o modelo na aba "Modelo" primeiro.</p>';
    const av = E.proj.avaliando;
    let s = '<section class="cartao"><h2>Imóvel avaliando</h2><div class="grade">';
    s += campo('Descrição', entrada('avaliando.descricao', av.descricao));
    m.indep.forEach(function (v, j) {
      const f = m.faixa[j];
      s += campo(v.nome, '<input data-bind="avaliando.valores.' + v.nome + '" data-num value="' + numEntrada(av.valores[v.nome]) + '">', 'amostra: ' + U.fmtAuto(f.min) + ' a ' + U.fmtAuto(f.max));
    });
    s += campo('Área para o valor total', '<input data-bind="avaliando.area" data-num value="' + numEntrada(av.area) + '">', 'Deixe vazio se a dependente já é valor total.');
    s += '</div><div class="barra"><button class="principal" data-acao="projetar">Estimar valor</button></div></section>';

    const pr = E.projecao;
    if (!pr) return s;
    if (pr.erro) return s + '<p class="erro-caixa">' + h(pr.erro) + '</p>';
    s += '<section class="cartao"><h2>Estimativa</h2><div class="indicadores">'
      + ind('Estimativa central', U.fmtAuto(pr.central)) + ind('IC ' + U.fmt(pr.nivel * 100, 0) + '% mínimo', U.fmtAuto(pr.icMin) + ' (−' + U.fmtPct(pr.icAbaixo) + ')')
      + ind('IC ' + U.fmt(pr.nivel * 100, 0) + '% máximo', U.fmtAuto(pr.icMax) + ' (+' + U.fmtPct(pr.icAcima) + ')') + ind('Amplitude', U.fmtPct(pr.amplitude))
      + ind('Predição mínimo', U.fmtAuto(pr.ipMin)) + ind('Predição máximo', U.fmtAuto(pr.ipMax))
      + ind('Campo de arbítrio', U.fmtAuto(pr.arbitrioMin) + ' a ' + U.fmtAuto(pr.arbitrioMax))
      + (pr.area ? ind('Valor total', U.fmtMoeda(pr.totalCentral)) + ind('Total arredondado (≤1%)', U.fmtMoeda(INF.Projecao.arredondar(pr.totalCentral))) : '')
      + '</div>' + quadroGraus(pr.fundamentacao, pr.grauPrecisao, pr.amplitude);
    s += '<h3>Estimativas</h3><table class="tabela"><thead><tr><th>Estimativa</th><th>Valor unitário</th>' + (pr.area ? '<th>Valor total</th>' : '') + '</tr></thead><tbody>'
      + [['Mediana', pr.estimativas.mediana], ['Média', pr.estimativas.media], ['Moda', pr.estimativas.moda]].map(function (e) {
        const usada = (pr.estimativa === 'direta' && e[0] === 'Mediana') || e[0].toLowerCase() === pr.estimativa;
        return '<tr' + (usada ? ' class="escolhida"' : '') + '><td>' + e[0] + (usada ? ' (adotada)' : '') + '</td><td>' + U.fmtAuto(e[1]) + '</td>' + (pr.area ? '<td>' + U.fmtMoeda(e[1] * pr.area) + '</td>' : '') + '</tr>';
      }).join('') + '</tbody></table>'
      + '<p class="nota">' + (m.dep.transf === 'ln' ? 'Com y em ln, a mediana é exp(ŷ), a média exp(ŷ + s²/2) e a moda exp(ŷ − s²). A escolha fica na aba Projeto.' : 'Com y na escala direta, as três estimativas coincidem.') + '</p>';
    if (pr.fundamentacao.grau < 2 || pr.grauPrecisao < 2) s += '<p class="erro-caixa">Abaixo do Grau II. Pela regra da casa, não emitir: ajustar o modelo ou ampliar a amostra.</p>';
    if (pr.fundamentacao.pendencias.length) s += '<h3>O que falta para subir de grau</h3><ul class="achados">' + pr.fundamentacao.pendencias.map(function (t) { return '<li class="info">' + h(t) + '</li>'; }).join('') + '</ul>';
    if (pr.extrapolacao.variaveis.length) {
      s += '<h3>Extrapolação</h3><ul class="achados">' + pr.extrapolacao.variaveis.map(function (v) {
        return '<li class="alerta">' + h(v.nome) + ' = ' + U.fmtAuto(v.valor) + ' fora da amostra (' + U.fmtAuto(v.min) + ' a ' + U.fmtAuto(v.max) + '); variação na fronteira ' + U.fmtPct(v.variacao) + (v.dentroDosLimites ? '' : ' — além do limite admitido') + '</li>';
      }).join('') + '</ul>';
    }
    const micro = N.micronumerosidade(E.proj, m);
    if (micro.problemas.length) s += '<h3>Micronumerosidade</h3><ul class="achados">' + micro.problemas.map(function (q) { return '<li class="alerta">' + h(q.variavel) + ' = ' + h(q.codigo) + ': ' + q.qtd + ' amostra(s), mínimo ' + q.minimo + '</li>'; }).join('') + '</ul>';
    s += '</section>';

    return s;
  };


  // ---- Laudo completo ---------------------------------------------------------------------
  ABAS.laudo = function () {
    const p = E.proj, c = INF.Laudo.campos(p), av = p.avaliando;
    const txt = function (campo, rotulo, dica) { return campo_(rotulo, '<input data-bind="laudo.' + campo + '" value="' + h(c[campo] || '') + '">', dica); };
    const area = function (campo, rotulo, dica) { return '<label class="campo largo2"><span>' + h(rotulo) + '</span><textarea rows="4" data-bind="laudo.' + campo + '">' + h(c[campo] || '') + '</textarea>' + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>'; };
    let s = '<section class="cartao cartao-laudo"><h2>Laudo de avaliação completo</h2><p class="nota">O programa já coloca no laudo todos os cálculos, tabelas, graus e gráficos. Nos campos abaixo vão as informações que só você tem: quem pediu, matrícula, vistoria, descrição do imóvel, seu registro. O que ficar em branco aparece no laudo marcado em amarelo, por exemplo <mark>[preencher: número da matrícula]</mark>, para você completar depois no Word.</p><div class="barra">'
      + '<select data-estilo="1" title="Estilo 1 a 20">' + INF.Estilos.LISTA.map(function (e) { return '<option value="' + e.numero + '"' + (e.numero === INF.Estilos.doProjeto(p).numero ? ' selected' : '') + '>Estilo ' + e.numero + '</option>'; }).join('') + '</select>'
      + '<button class="principal" data-acao="laudoWord">Gerar Word (.docx)</button><button class="principal" data-acao="laudoPDF">Gerar PDF</button><button class="leve" data-acao="laudoVer">Visualizar</button>'
      + '<label class="chk"><input type="checkbox" data-bind="laudo.anexoCompleto"' + (c.anexoCompleto ? ' checked' : '') + '> anexo estatístico completo (todas as tabelas e gráficos)</label></div>';
    // dados obrigatórios do modelo que ainda não têm origem, com o caminho para conseguir
    const IVp = INF.Inventario, tlp = INF.TiposLaudo.ler(p);
    const faltam = IVp.ficha(tlp, p.inventario || {}, p.inventarioDecisoes || {}, valorAtualCampo).filter(function (f) { return f.obrig && f.estado !== 'RESOLVIDA'; });
    if (faltam.length) {
      s += '<h3>Dados do modelo sem origem (' + faltam.length + ') — como conseguir</h3><ul class="achados">' + faltam.map(function (f) {
        return '<li class="alerta"><b>' + h(f.rotulo) + '</b> — ' + h(f.estado.toLowerCase()) + '<small class="fonte">' + h((IVp.porId[f.campo] || {}).comoObter || '') + '</small></li>';
      }).join('') + '</ul>';
    }
    if (E.pendenciasLaudo !== undefined) {
      s += E.pendenciasLaudo.length
        ? '<h3>Faltou preencher (' + E.pendenciasLaudo.length + ')</h3><ul class="achados">' + E.pendenciasLaudo.map(function (t) { return '<li class="alerta">' + h(t) + '</li>'; }).join('') + '</ul>'
        : '<p class="ok">Tudo preenchido: o laudo não tem nenhum campo pendente.</p>';
    }
    s += '</section>';

    s += secaoModelo() + secaoTipoLaudo() + secaoDocumentos() + secaoVizinhanca();
    s += '<section class="cartao"><h2>Solicitante e objetivo</h2><div class="grade">'
      + txt('solicitante', 'Solicitante') + txt('proprietario', 'Proprietário') + txt('objetivo', 'Objetivo', 'Ex.: valor de mercado para compra e venda')
      + campo_('Finalidade', '<input data-bind="projeto.finalidade" value="' + h(p.projeto.finalidade) + '">') + '</div></section>';

    s += '<section class="cartao"><h2>Imóvel</h2><div class="grade">'
      + txt('endereco', 'Endereço / referência de acesso') + txt('matricula', 'Matrícula') + txt('cartorio', 'Cartório') + txt('areaDocumento', 'Área documental')
      + campo_('Latitude do imóvel', '<input data-bind="avaliando.lat" data-num value="' + numEntrada(av.lat) + '" placeholder="-17,7412">')
      + campo_('Longitude do imóvel', '<input data-bind="avaliando.lon" data-num value="' + numEntrada(av.lon) + '" placeholder="-46,1719">')
      + campo_('Data da vistoria', '<input type="date" data-bind="laudo.dataVistoria" value="' + h(c.dataVistoria) + '">') + txt('acompanhante', 'Acompanhou a vistoria')
      + campo_('Raio de pesquisa (km)', '<input data-bind="config.raioPesquisa" data-num value="' + numEntrada(p.config.raioPesquisa) + '" placeholder="' + INF.Modelos.raio(p) + '">', 'Padrão: 3 km urbano, 60 km rural.')
      + txt('justifRaio', 'Por que usar amostras fora do raio', 'Só se houver amostra além do raio.')
      + '</div><div class="grade">' + area('descricaoRegiao', 'Região') + area('descricaoImovel', 'Descrição do imóvel') + area('benfeitorias', 'Benfeitorias')
      + area('diagnosticoMercado', 'Leitura do mercado', 'Liquidez, oferta, absorção, tendência. Os números da pesquisa entram sozinhos.') + area('pressupostos', 'Pressupostos e ressalvas') + '</div></section>';

    // valor adotado
    const pr = E.projecao && !E.projecao.erro ? E.projecao : null;
    const mult = pr && pr.area ? pr.area : 1;
    s += '<section class="cartao"><h2>Valor adotado</h2>' + (pr ? '<p class="nota">Estimativa ' + U.fmtMoeda(pr.central * mult) + ' · IC 80%: ' + U.fmtMoeda(pr.icMin * mult) + ' a ' + U.fmtMoeda(pr.icMax * mult) + ' · campo de arbítrio: ' + U.fmtMoeda(pr.arbitrioMin * mult) + ' a ' + U.fmtMoeda(pr.arbitrioMax * mult) + '. Vazio = estimativa arredondada (' + U.fmtMoeda(INF.Projecao.arredondar(pr.central * mult)) + ').</p>' : '<p class="erro-caixa">Estime o avaliando na aba Avaliação e NBR antes de gerar o laudo.</p>')
      + '<div class="grade">' + campo_('Valor adotado (R$)', '<input data-bind="laudo.valorAdotado" data-num value="' + numEntrada(c.valorAdotado) + '">') + txt('justificativa', 'Justificativa, se fora do intervalo')
      + '</div></section>';

    s += '<section class="cartao"><h2>Responsável técnico</h2><div class="grade">'
      + campo_('Nome', '<input data-bind="projeto.autor" value="' + h(p.projeto.autor) + '">') + txt('titulo', 'Título profissional') + txt('registro', 'Registro (CREA/CAU)') + txt('art', 'ART nº') + txt('cidade', 'Cidade da assinatura')
      + '</div></section>';

    // mapas
    const temCoord = Number.isFinite(av.lat) && Number.isFinite(av.lon);
    const google = Nv.sessao && Nv.sessao.mapasGoogle;
    s += '<section class="cartao"><h2>Mapas</h2><div class="barra">'
      + '<button data-acao="mapaGoogle" data-arg="satelite"' + (google && temCoord ? '' : ' disabled') + '>Satélite do imóvel (Google Maps)</button>'
      + '<button data-acao="mapaGoogle" data-arg="situacao"' + (google && temCoord ? '' : ' disabled') + '>Mapa de situação com as amostras (Google Maps)</button>'
      + '<label class="botao leve">Inserir print do mapa<input type="file" id="arqMapa" accept="image/*" hidden></label></div>'
      + '<p class="nota">' + (!google ? 'Busca no Google Maps desligada: falta a chave no servidor (GOOGLE_MAPS_CHAVE). ' : '') + (!temCoord ? 'Informe latitude e longitude do imóvel acima. ' : '') + 'Sem imagem de mapa, o laudo usa o mapa esquemático pelas coordenadas.</p></section>';

    // fotos
    const fotos = p.fotos || [];
    const alvos = [['avaliando', 'Imóvel (vistoria)'], ['mapa', 'Mapa'], ['documento', 'Documento']]
      .concat(((p.vizinhanca || {}).imoveis || []).map(function (im, i) { return ['vizinho:' + i, 'Vizinho ' + (i + 1) + (im.endereco ? ' — ' + im.endereco : '')]; }))
      .concat(p.amostras.map(function (a) { return ['amostra:' + a.id, 'Amostra ' + a.id]; }));
    s += '<section class="cartao"><h2>Fotografias e imagens <small>' + fotos.length + '</small></h2><div class="barra"><select id="fotoAlvo">' + opcoes(alvos, 'avaliando') + '</select>'
      + '<label class="botao">Inserir fotos<input type="file" id="arqFotos" accept="image/*" multiple hidden></label><small>As fotos são reduzidas para até 1600 px antes de guardar.</small></div>'
      + '<div class="fotos">' + fotos.map(function (f) {
        return '<figure class="foto-item"><img src="' + f.dataUrl + '" alt="">' + '<select data-foto="' + f.id + '" data-chave="alvo">' + opcoes(alvos, f.alvo) + '</select>'
          + '<input data-foto="' + f.id + '" data-chave="legenda" value="' + h(f.legenda) + '" placeholder="Legenda"><button class="leve perigo" data-acao="excluirFoto" data-arg="' + f.id + '">Remover</button></figure>';
      }).join('') + '</div></section>';
    return s;
  };



  // ---- Modelo de laudo (1 de 17) e estilo (1 a 20) ------------------------------------------
  function secaoModelo() {
    const ML = INF.Modelos, S = INF.Estilos;
    const atual = ML.doProjeto(E.proj), estilo = S.doProjeto(E.proj);
    const caps = ML.capitulos(atual, INF.Laudo.campos(E.proj).anexoCompleto);
    const grupos = [['Particular e extrajudicial', ['part_valor_simpl', 'part_valor', 'part_locacao', 'extra_venda', 'extra_locacao']],
      ['Banco, concessionária e rural', ['banco', 'servidao_conc', 'rural_pleno']],
      ['Judicial (pericial)', ['jud_valor', 'jud_locacao', 'jud_servidao', 'jud_servidao_pleno', 'jud_desapropriacao', 'jud_partilha', 'assistente']],
      ['Vizinhança', ['viz', 'viz_jud']]];
    let s = '<section class="cartao cartao-laudo"><h2>Modelo e estilo do laudo</h2><div class="grade">'
      + campo('Modelo de laudo', '<select data-modelo="1">' + (atual.id === 'livre' ? '<option value="">Personalizado (marcado abaixo)</option>' : '')
        + grupos.map(function (g) { return '<optgroup label="' + h(g[0]) + '">' + g[1].map(function (id) { const m = ML.porId[id]; return '<option value="' + id + '"' + (atual.id === id ? ' selected' : '') + '>' + h(m.nome) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>',
        atual.uso || 'Escolha um modelo pronto ou marque o tipo abaixo.')
      + campo('Estilo de apresentação (1 a 20)', '<select data-estilo="1">' + S.LISTA.map(function (e) { return '<option value="' + e.numero + '"' + (e.numero === estilo.numero ? ' selected' : '') + '>' + e.numero + ' — ' + h(e.nome) + '</option>'; }).join('') + '</select>',
        'Capa ' + estilo.capa + ' · ' + estilo.fonte + ' ' + estilo.tam + ' pt · tabelas ' + estilo.tabela + ' · ' + estilo.fotos + ' foto(s) por linha')
      + '</div><div class="barra"><button class="leve" data-acao="verEstilos">Ver os 20 estilos lado a lado</button>'
      + '<small>Nível: <b>' + h(atual.nivel) + '</b> — ' + caps.length + ' partes: ' + caps.map(function (c) { return ML.NOMES_CAP[c]; }).join(' · ') + '</small></div></section>';
    return s;
  }

  // ---- Tipo de laudo (marcar) --------------------------------------------------------------
  function secaoTipoLaudo() {
    const TL = INF.TiposLaudo, t = TL.ler(E.proj);
    const campoTL = function (chave, rotulo, dica, num) {
      return campo(rotulo, '<input data-bind="tipoLaudo.' + chave + '"' + (num ? ' data-num' : '') + ' value="' + h(num ? numEntrada(t[chave]) : (t[chave] || '')) + '">', dica);
    };
    let s = '<section class="cartao"><h2>Tipo de laudo</h2><p class="nota">Marque o tipo; o laudo muda título, capítulos e contas. Atalhos:</p><div class="barra">'
      + TL.ATALHOS.map(function (a, i) { return '<button class="leve" data-acao="tlAtalho" data-arg="' + i + '">' + h(a.rotulo) + '</button>'; }).join('') + '</div>';
    s += '<div class="grade"><div class="campo"><span>Âmbito</span><div class="barra">'
      + [['urbano', 'Urbano'], ['rural', 'Rural']].map(function (o) { return '<label class="chk"><input type="radio" name="tlAmbito" data-tl="ambito" value="' + o[0] + '"' + (t.ambito === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>'; }).join('') + '</div></div>'
      + campo('Tipo do imóvel', '<select data-bind="tipoLaudo.imovel">' + opcoes([['', '(escolha)']].concat(TL.IMOVEIS[t.ambito]), t.imovel) + '</select>')
      + '</div>';
    s += '<h3>Para quem é o laudo</h3><div class="radios">' + TL.DESTINOS.map(function (d) {
      return '<label class="radio' + (t.destino === d.id ? ' ativo' : '') + '"><input type="radio" name="tlDestino" data-tl="destino" value="' + d.id + '"' + (t.destino === d.id ? ' checked' : '') + '><b>' + h(d.rotulo) + '</b><small>' + h(d.ajuda) + '</small></label>';
    }).join('') + '</div>';
    s += '<h3>O que será avaliado (pode marcar mais de um)</h3><div class="marcas">' + TL.OBJETOS.map(function (o) {
      return '<label class="chk grande"><input type="checkbox" data-tl-objeto="' + o.id + '"' + (TL.tem(t, o.id) ? ' checked' : '') + '> ' + h(o.rotulo) + '</label>';
    }).join('') + '</div>';

    if (t.destino === 'banco') s += '<h3>Banco</h3><div class="grade">' + campoTL('banco', 'Instituição') + campoTL('contrato', 'Proposta / contrato') + campoTL('proponente', 'Proponente') + '</div>';
    if (t.destino === 'judicial') {
      s += '<h3>Processo</h3><div class="grade">' + campoTL('processo', 'Número do processo') + campoTL('vara', 'Vara / juízo') + campoTL('comarca', 'Comarca')
        + campoTL('autor', 'Autor(es)') + campoTL('reu', 'Réu(s)')
        + campo('Função', '<select data-bind="tipoLaudo.funcao">' + opcoes(['Perito do Juízo', 'Assistente Técnico'], t.funcao) + '</select>')
        + campoTL('assistentes', 'Assistentes técnicos') + '</div>'
        + '<label class="campo largo2"><span>Objeto da perícia</span><textarea rows="3" data-bind="tipoLaudo.objetoPericia">' + h(t.objetoPericia) + '</textarea></label>';
      s += '<h3>Quesitos <small>' + (t.quesitos || []).length + '</small></h3>' + (t.quesitos || []).map(function (q, i) {
        return '<div class="quesito"><div class="barra"><b>Quesito ' + (i + 1) + '</b><input data-quesito="' + i + '" data-chave="parte" value="' + h(q.parte) + '" placeholder="parte (autor, réu, juízo)"><button class="leve perigo" data-acao="tirarQuesito" data-arg="' + i + '">Remover</button></div>'
          + '<textarea rows="2" data-quesito="' + i + '" data-chave="pergunta" placeholder="Pergunta">' + h(q.pergunta) + '</textarea><textarea rows="3" data-quesito="' + i + '" data-chave="resposta" placeholder="Resposta do perito">' + h(q.resposta) + '</textarea></div>';
      }).join('') + '<div class="barra"><button class="leve" data-acao="novoQuesito">+ Quesito</button></div>';
    }
    if (TL.tem(t, 'servidao') || TL.tem(t, 'remanescente') || TL.tem(t, 'desapropriacao')) {
      s += '<h3>Áreas</h3><p class="nota">Use a mesma unidade da variável de área do modelo (ha ou m²).</p><div class="grade">' + campoTL('areaTotal', 'Área total do imóvel', '', true);
      if (TL.tem(t, 'servidao')) s += campoTL('areaFaixa', 'Área da faixa de servidão', '', true) + campoTL('coefServidao', 'Coeficiente de servidão (%)', 'Parcela do valor da terra perdida pela restrição de uso.', true) + campoTL('benfeitoriasAtingidas', 'Benfeitorias atingidas (R$)', '', true);
      if (TL.tem(t, 'remanescente')) s += campoTL('areaRemanescente', 'Área remanescente', '', true) + campoTL('percRemanescente', 'Desvalorização do remanescente (%)', '', true);
      s += '</div>';
      if (TL.tem(t, 'servidao')) s += '<label class="campo largo2"><span>Justificativa do coeficiente de servidão</span><textarea rows="3" data-bind="tipoLaudo.justifServidao">' + h(t.justifServidao) + '</textarea></label>';
      if (TL.tem(t, 'remanescente')) s += '<label class="campo largo2"><span>Justificativa da desvalorização do remanescente</span><textarea rows="3" data-bind="tipoLaudo.justifRemanescente">' + h(t.justifRemanescente) + '</textarea></label>';
    }
    if (TL.tem(t, 'liquidacao')) s += '<h3>Liquidação forçada</h3><div class="grade">' + campoTL('prazoAbsorcao', 'Prazo de absorção (meses)', '', true) + campoTL('taxaMensal', 'Taxa de desconto (% ao mês)', '', true) + '</div>';
    if (TL.tem(t, 'vtn')) {
      s += '<h3>Benfeitorias (custo de reedição)</h3><div class="rolagem"><table class="tabela"><thead><tr><th>Descrição</th><th>Quantidade</th><th>Unidade</th><th>Custo unitário (R$)</th><th>Depreciação (%)</th><th></th></tr></thead><tbody>'
        + (t.benfeitorias || []).map(function (b, i) {
          const cel = function (ch, num) { return '<td><input class="' + (num ? 'num' : 'medio') + '" data-benf="' + i + '" data-chave="' + ch + '" value="' + h(num ? numEntrada(b[ch]) : (b[ch] || '')) + '"></td>'; };
          return '<tr>' + cel('descricao') + cel('quantidade', true) + cel('unidade') + cel('unitario', true) + cel('depreciacao', true) + '<td><button class="leve perigo" data-acao="tirarBenf" data-arg="' + i + '">×</button></td></tr>';
        }).join('') + '</tbody></table></div><div class="barra"><button class="leve" data-acao="novaBenf">+ Benfeitoria</button></div>';
    }
    return s + '</section>';
  }

  // ---- Documentos: inventário por modelo de laudo (modelo da RAE) ---------------------------
  // Os arquivos ficam só na memória da tela (não vão ao banco). O que se guarda
  // é o RESULTADO da leitura, indexado pelo SHA-256 do arquivo: renomear não
  // relê, alterar relê, e o que sumiu da pasta é avisado.
  E.docs = E.docs || [];
  async function hashArquivo(f) {
    const buf = await f.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function situacaoDoc(d) {
    const inv = E.proj.inventario || {};
    if (d.status && /erro|formato/.test(d.status)) return d.status;
    if (!d.hash) return 'calculando…';
    if (inv[d.hash]) return 'JÁ LIDO';
    const mesmoNome = Object.keys(inv).some(function (h) { return inv[h].arquivo === d.nome; });
    return mesmoNome ? 'ALTERADO' : 'NOVO';
  }
  function nomeModelo(t) {
    const TL = INF.TiposLaudo;
    const at = TL.ATALHOS.find(function (a) { return a.destino === t.destino && a.objetos.slice().sort().join() === (t.objetos || []).slice().sort().join(); });
    return (at ? at.rotulo : TL.titulo(t)) + ' · ' + (t.ambito === 'rural' ? 'rural' : 'urbano') + (t.imovel ? ' · ' + t.imovel : '');
  }
  // valor que o projeto já tem para um campo do inventário
  function valorAtualCampo(c) {
    const t = INF.TiposLaudo.ler(E.proj), vz = E.proj.vizinhanca || {};
    switch (c.id) {
      case 'imoveisVizinhos': return (vz.imoveis || []).length ? vz.imoveis.length + ' imóvel(is)' : '';
      case 'anomalias': { const n = (vz.imoveis || []).reduce(function (s2, im) { return s2 + (im.ambientes || []).reduce(function (x, a) { return x + (a.anomalias || []).length; }, 0); }, 0); return (vz.imoveis || []).length ? n + ' anomalia(s) registrada(s)' : ''; }
      case 'respostasQuesitos': { const q = t.quesitos || []; return q.length && q.every(function (x) { return String(x.resposta || '').trim(); }) ? q.length + ' respondido(s)' : ''; }
      case 'benfeitoriasCusto': return (t.benfeitorias || []).length ? t.benfeitorias.length + ' benfeitoria(s)' : '';
      case 'liquidacaoParam': return Number.isFinite(U.lerNumero(t.prazoAbsorcao)) && Number.isFinite(U.lerNumero(t.taxaMensal)) ? t.prazoAbsorcao + ' meses a ' + t.taxaMensal + '% a.m.' : '';
      case 'quesitos': return (t.quesitos || []).length ? t.quesitos.length + ' quesito(s)' : '';
    }
    if (!c.destino) return '';
    const v = lerCaminho(c.destino);
    return v === 'null' || v === 'NaN' ? '' : v;
  }
  function lerCaminho(caminho) {
    const partes = caminho.split('.');
    let o = partes[0] === 'tipoLaudo' ? INF.TiposLaudo.ler(E.proj) : E.proj;
    if (partes[0] === 'tipoLaudo') partes.shift();
    for (let i = 0; i < partes.length; i++) { if (o == null) return ''; o = o[partes[i]]; }
    return o == null ? '' : String(o);
  }
  function fichaAtual() {
    const t = INF.TiposLaudo.ler(E.proj), IV = INF.Inventario;
    const ficha = IV.ficha(t, E.proj.inventario || {}, E.proj.inventarioDecisoes || {}, valorAtualCampo);
    const trava = IV.trava(E.docs.map(function (d) { return { nome: d.nome, hash: d.hash, status: d.status }; }), E.proj.inventario || {});
    return { t: t, ficha: ficha, trava: trava, checagem: IV.checagem(ficha, trava), sumidos: E.docs.length ? IV.sumidos(E.docs, E.proj.inventario || {}) : [] };
  }
  const linkArquivo = function (nome) {
    const d = E.docs.find(function (x) { return x.nome === nome; });
    return d ? '<a href="#" data-acao="abrirDoc" data-arg="' + h(d.hash || d.nome) + '">' + h(nome) + '</a>' : h(nome);
  };
  function secaoDocumentos() {
    const inv = E.proj.inventario || {};
    const ligado = Nv.sessao && Nv.sessao.inventarioIA;
    const F = fichaAtual();
    const aLer = E.docs.filter(function (d) { return ['NOVO', 'ALTERADO'].indexOf(situacaoDoc(d)) >= 0; }).length;
    let s = '<section class="cartao"><h2>Documentos e inventário do laudo <small>' + E.docs.length + ' arquivo(s) · modelo: ' + h(nomeModelo(F.t)) + '</small></h2>'
      + '<p class="nota">Anexe a pasta do trabalho. A IA lê TODOS os documentos, cada um uma vez, procurando os dados que ESTE modelo de laudo exige (lista abaixo) e registrando outros achados importantes. Cada dado vem com arquivo, página e trecho. Nada entra sem você marcar. CPF e RG não são guardados.</p><div class="barra">'
      + '<label class="botao">Anexar pasta<input type="file" id="arqPasta" webkitdirectory multiple hidden></label>'
      + '<label class="botao leve">Anexar arquivos<input type="file" id="arqDocs" multiple hidden></label>'
      + '<button class="principal" data-acao="inventariar"' + (ligado && aLer && !E.inventariando ? '' : ' disabled') + '>' + (E.inventariando ? 'Lendo ' + h(E.inventariando) + '…' : 'Fazer o inventário (' + aLer + ' a ler)') + '</button>'
      + (ligado ? '' : '<small>Leitura por IA desligada: falta a chave da IA no servidor. A lista de campos e a checagem funcionam mesmo assim.</small>') + '</div>';

    if (E.docs.length) {
      s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Arquivo</th><th>Situação</th><th>Tipo</th><th>Data</th><th>Resumo</th></tr></thead><tbody>' + E.docs.map(function (d) {
        const r = d.hash && inv[d.hash], sit = situacaoDoc(d);
        return '<tr><td class="esq">' + linkArquivo(d.nome) + '<small class="fonte">' + h(d.caminho) + '</small></td><td class="' + (sit === 'JÁ LIDO' ? 'ok' : (/erro|formato/.test(sit) ? 'ruim' : '')) + '">' + h(sit) + '</td>'
          + '<td>' + h(r ? r.tipo.replace(/_/g, ' ') : '—') + '</td><td>' + h(r && r.dataDocumento ? r.dataDocumento.split('-').reverse().join('/') : '') + '</td><td class="esq texto-longo">' + h(r ? r.resumo : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    if (F.sumidos.length) s += '<ul class="achados"><li class="alerta">Lidos antes e fora da pasta agora: ' + F.sumidos.map(h).join(', ') + '.</li></ul>';

    // inventário do modelo: um campo por linha
    s += '<h3>Inventário do modelo — o que este laudo precisa</h3><div class="rolagem"><table class="tabela"><thead><tr><th></th><th>Dado</th><th>Quem preenche</th><th>Estado</th><th>Valor encontrado</th><th>Fonte</th><th>No laudo hoje</th></tr></thead><tbody>'
      + F.ficha.map(function (f, i) {
        const quem = f.quem === 'documento' ? 'documento: ' + (f.fontesEsperadas || []).slice(0, 3).map(function (x) { return x.replace(/_/g, ' '); }).join(', ') : (f.quem === 'avaliador' ? 'avaliador' : 'cálculo');
        const cls = f.estado === 'RESOLVIDA' ? 'ok' : (f.estado === 'NÃO SOLUCIONADA' ? 'ruim' : (f.obrig ? 'ruim' : ''));
        const atual = valorAtualCampo(IV_campo(f.campo));
        let marca = '', valor = h(f.valor || '');
        if (f.quem === 'documento' && f.estado === 'RESOLVIDA' && f.fonte && f.campo !== 'quesitos' && String(f.valor) !== String(atual)) marca = '<input type="checkbox" data-ficha="' + i + '" checked>';
        if (f.estado === 'NÃO SOLUCIONADA') {
          valor = '<select data-decidir="' + i + '"><option value="">escolher…</option>' + f.candidatos.map(function (c2, k) { return '<option value="' + k + '">' + h(c2.valor) + ' — ' + h(c2.arquivo) + '</option>'; }).join('') + '</select>';
        }
        const comoObter = (INF.Inventario.porId[f.campo] || {}).comoObter;
        const fonte = f.fonte ? linkArquivo(f.fonte.arquivo) + (f.fonte.pagina ? ', p. ' + f.fonte.pagina : '') + (f.fonte.trecho ? '<small class="fonte">"' + h(f.fonte.trecho) + '"</small>' : '')
          : '<small>' + h(f.porque || '') + (f.estado === 'NÃO ENCONTRADA' && comoObter ? '<br><b>Como conseguir:</b> ' + h(comoObter) : '') + '</small>';
        return '<tr><td>' + marca + '</td><td class="esq"><b>' + h(f.rotulo) + '</b>' + (f.obrig ? '' : ' <small>(opcional)</small>') + '</td><td class="esq"><small>' + h(quem) + '</small></td>'
          + '<td class="' + cls + '">' + h(f.estado) + '</td><td class="esq texto-longo">' + valor + '</td><td class="esq texto-longo">' + fonte + '</td><td class="esq"><small>' + h(atual) + '</small></td></tr>';
      }).join('') + '</tbody></table></div>';

    // outros achados da IA
    const achados = [];
    Object.keys(inv).forEach(function (hh) { (inv[hh].achados || []).forEach(function (a, k) { achados.push(Object.assign({ arquivo: inv[hh].arquivo, chave: hh + ':' + k }, a)); }); });
    const incluidos = new Set(((E.proj.laudo || {}).achadosIncluidos || []).map(function (a) { return a.chave; }));
    if (achados.length) {
      s += '<h3>Outros achados importantes <small>' + achados.length + '</small></h3><ul class="achados">' + achados.map(function (a, i) {
        return '<li class="' + (a.importancia === 'alta' ? 'erro' : a.importancia === 'media' ? 'alerta' : 'info') + '"><label class="chk"><input type="checkbox" data-achado="' + i + '"' + (incluidos.has(a.chave) ? ' checked disabled' : '') + '> <b>' + h(a.assunto) + '</b></label> — ' + h(a.texto)
          + '<small class="fonte">' + linkArquivo(a.arquivo) + (a.pagina ? ', p. ' + a.pagina : '') + (a.trecho ? ' — "' + h(a.trecho) + '"' : '') + (incluidos.has(a.chave) ? ' · já está no laudo' : '') + '</small></li>';
      }).join('') + '</ul>';
    }
    // quesitos e fotos
    const comQuesitos = Object.keys(inv).filter(function (hh) { return (inv[hh].quesitos || []).length; });
    const fotosVist = E.docs.filter(function (d) { return d.hash && inv[d.hash] && inv[d.hash].tipo === 'foto_vistoria'; });
    if (comQuesitos.length || fotosVist.length) {
      s += '<ul class="achados">' + comQuesitos.map(function (hh) { return '<li class="info"><label class="chk"><input type="checkbox" data-sug-quesitos="' + h(hh) + '"> Importar ' + inv[hh].quesitos.length + ' quesito(s) de ' + h(inv[hh].arquivo) + '</label></li>'; }).join('')
        + fotosVist.map(function (d) { return '<li class="info"><label class="chk"><input type="checkbox" data-sug-foto="' + h(d.hash) + '"> Usar como foto da vistoria: ' + h(d.nome) + '</label><small class="fonte">' + h(inv[d.hash].resumo) + '</small></li>'; }).join('') + '</ul>';
    }
    s += '<div class="barra"><button class="principal" data-acao="aplicarInventario">Aplicar ao laudo o que está marcado</button><small>Cada campo preenchido fica registrado com o documento de origem.</small></div>';

    // checagem (trava da entrega)
    s += '<div class="checagem ' + (F.checagem.bloqueada ? 'bloqueada' : 'liberada') + '"><b>' + h(F.checagem.mensagem) + '</b>'
      + (F.checagem.pendencias.length ? '<ul>' + F.checagem.pendencias.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '')
      + (F.trava.filter(function (x) { return x.leve; }).length ? '<small>Atenção: ' + F.trava.filter(function (x) { return x.leve; }).map(function (x) { return x.arquivo + ' — ' + x.texto; }).map(h).join('; ') + '</small>' : '') + '</div>';
    return s + '</section>';
  }
  function IV_campo(id) { return INF.Inventario.porId[id] || { id: id }; }

  // ---- Vistoria de vizinhança: obra e imóveis --------------------------------------------------
  function secaoVizinhanca() {
    const TL = INF.TiposLaudo;
    if (!TL.tem(TL.ler(E.proj), 'vizinhanca')) return '';
    const vz = E.proj.vizinhanca = Object.assign(TL.vizinhancaPadrao(), E.proj.vizinhanca || {});
    const ob = vz.obra;
    const cV = function (cam, rot, valor, tipo) { return campo(rot, '<input' + (tipo ? ' type="' + tipo + '"' : '') + ' data-viz="' + cam + '" value="' + h(valor || '') + '">'); };
    let s = '<section class="cartao"><h2>Vistoria de vizinhança</h2><h3>A obra</h3><div class="grade">'
      + cV('obra.nome', 'Obra / empreendimento', ob.nome) + cV('obra.endereco', 'Endereço da obra', ob.endereco) + cV('obra.construtora', 'Construtora / contratante', ob.construtora)
      + cV('obra.alvara', 'Alvará de construção', ob.alvara) + cV('obra.responsavel', 'Responsável técnico da obra', ob.responsavel) + cV('obra.tipo', 'Serviços previstos', ob.tipo)
      + cV('obra.inicio', 'Início previsto', ob.inicio, 'date') + '</div>';
    s += '<h3>Imóveis vizinhos <small>' + vz.imoveis.length + '</small></h3>';
    vz.imoveis.forEach(function (im, i) {
      const b = 'imoveis.' + i + '.';
      s += '<div class="quesito"><div class="barra"><b>Imóvel ' + (i + 1) + '</b><label class="chk"><input type="checkbox" data-viz="' + b + 'recusou"' + (im.recusou ? ' checked' : '') + '> recusou a vistoria</label>'
        + '<button class="leve perigo" data-acao="vizTirarImovel" data-arg="' + i + '">Remover imóvel</button></div><div class="grade">'
        + cV(b + 'endereco', 'Endereço', im.endereco) + cV(b + 'ocupante', 'Ocupante', im.ocupante)
        + campo('Tipo', '<select data-viz="' + b + 'tipo">' + opcoes(['', 'Casa', 'Sobrado', 'Apartamento', 'Prédio', 'Loja', 'Galpão', 'Muro / terreno', 'Outro'], im.tipo || '') + '</select>')
        + campo('Padrão', '<select data-viz="' + b + 'padrao">' + opcoes(['', 'Baixo', 'Normal', 'Alto'], im.padrao || '') + '</select>')
        + cV(b + 'idade', 'Idade aparente (anos)', im.idade) + cV(b + 'pavimentos', 'Pavimentos', im.pavimentos)
        + cV(b + 'dataVistoria', 'Data da vistoria', im.dataVistoria, 'date') + cV(b + 'acompanhante', 'Acompanhou', im.acompanhante)
        + campo('Conservação', '<select data-viz="' + b + 'conservacao">' + opcoes(['', 'bom', 'regular', 'ruim', 'precário'], im.conservacao || '') + '</select>')
        + (im.recusou ? cV(b + 'motivoRecusa', 'Motivo da recusa', im.motivoRecusa) : '') + '</div>'
        + '<label class="campo largo2"><span>Observações</span><textarea rows="2" data-viz="' + b + 'obs">' + h(im.obs || '') + '</textarea></label>';
      (im.ambientes || []).forEach(function (a, j) {
        const ba = b + 'ambientes.' + j + '.';
        s += '<div class="ambiente"><div class="barra"><input data-viz="' + ba + 'nome" value="' + h(a.nome || '') + '" placeholder="Ambiente (sala, fachada, muro...)">'
          + '<button class="leve" data-acao="vizNovaAnomalia" data-arg="' + i + '.' + j + '">+ Anomalia</button><button class="leve perigo" data-acao="vizTirarAmbiente" data-arg="' + i + '.' + j + '">Remover ambiente</button></div>';
        if ((a.anomalias || []).length) {
          s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Anomalia</th><th>Localização</th><th>Dimensão</th><th>Descrição</th><th></th></tr></thead><tbody>' + a.anomalias.map(function (x, k) {
            const bx = ba + 'anomalias.' + k + '.';
            return '<tr><td><select data-viz="' + bx + 'tipo">' + opcoes([''].concat(TL.ANOMALIAS), x.tipo || '') + '</select></td><td><input class="medio" data-viz="' + bx + 'localizacao" value="' + h(x.localizacao || '') + '"></td>'
              + '<td><input data-viz="' + bx + 'dimensao" value="' + h(x.dimensao || '') + '" placeholder="0,3 mm × 40 cm"></td><td><input class="medio" data-viz="' + bx + 'descricao" value="' + h(x.descricao || '') + '"></td>'
              + '<td><button class="leve perigo" data-acao="vizTirarAnomalia" data-arg="' + i + '.' + j + '.' + k + '">×</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        } else s += '<small>Sem anomalias registradas neste ambiente.</small>';
        s += '</div>';
      });
      s += '<div class="barra"><button class="leve" data-acao="vizNovoAmbiente" data-arg="' + i + '">+ Ambiente</button><small>Fotos: em "Fotografias e imagens", escolha "Vizinho ' + (i + 1) + '".</small></div></div>';
    });
    s += '<div class="barra"><button data-acao="vizNovoImovel">+ Imóvel vizinho</button></div></section>';
    return s;
  }

  // ---- Relatório --------------------------------------------------------------------------
  ABAS.relatorio = function () {
    let s = '<section class="cartao"><h2>Relatório estatístico</h2><p>Documento para anexar ao laudo: dados, variáveis, equação, testes, gráficos, estimativa e graus da NBR. Abra e imprima em PDF pelo navegador.</p><div class="barra">'
      + '<button class="principal" data-acao="exportarPDF">Exportar PDF</button><button class="principal" data-acao="exportarExcel">Exportar Excel</button>'
      + '<button class="leve" data-acao="abrirRelatorio">Ver relatório</button><button class="leve" data-acao="baixarRelatorio">Baixar .html</button></div>'
      + '<p class="nota">PDF: abre a impressão; escolha "Salvar como PDF". Excel: uma aba para cada quadro (amostras, estatística, regressores, ANOVA, resíduos, correlações, normalidade, fundamentação, projeção, busca de modelos, histórico).</p></section>';
    const K = N.NORMA;
    s += '<section class="cartao"><h2>Critérios da norma em uso</h2><p class="nota">' + h(K.referencia) + ' — confira com seu exemplar.</p><table class="tabela"><thead><tr><th>Item</th><th>Grau III</th><th>Grau II</th><th>Grau I</th></tr></thead><tbody>'
      + '<tr><td class="esq">2 — quantidade de dados</td><td>' + K.item2.III + '(k+1)</td><td>' + K.item2.II + '(k+1)</td><td>' + K.item2.I + '(k+1)</td></tr>'
      + '<tr><td class="esq">5 — Sig dos regressores</td><td>' + U.fmtPct(K.item5.III, 0) + '</td><td>' + U.fmtPct(K.item5.II, 0) + '</td><td>' + U.fmtPct(K.item5.I, 0) + '</td></tr>'
      + '<tr><td class="esq">6 — Sig do F</td><td>' + U.fmtPct(K.item6.III, 0) + '</td><td>' + U.fmtPct(K.item6.II, 0) + '</td><td>' + U.fmtPct(K.item6.I, 0) + '</td></tr>'
      + '<tr><td class="esq">Precisão — amplitude do IC 80%</td><td>≤ ' + U.fmtPct(K.precisao.III, 0) + '</td><td>≤ ' + U.fmtPct(K.precisao.II, 0) + '</td><td>≤ ' + U.fmtPct(K.precisao.I, 0) + '</td></tr>'
      + '<tr><td class="esq">Enquadramento (pontos mínimos)</td><td>' + K.enquadramento.III.pontos + '</td><td>' + K.enquadramento.II.pontos + '</td><td>' + K.enquadramento.I.pontos + '</td></tr>'
      + '</tbody></table></section>';
    return s;
  };

  // ---------------------------------------------------------------------------
  // AÇÕES (botões)
  // ---------------------------------------------------------------------------
  const ACOES = {};

  ACOES.roteiro = function () {
    const r = ROTEIROS[E.proj.projeto.tipologia];
    if (!r) return avisar('Sem roteiro pronto para essa tipologia. Monte as variáveis na aba Variáveis.');
    if (E.proj.amostras.length && !confirm('O projeto já tem amostras. Acrescentar as variáveis sugeridas que ainda não existem?')) return;
    const dep = Rg.dependente(E.proj);
    if (dep && !E.proj.amostras.length) { dep.nome !== r.dep[0] && Dd.renomearVariavel(E.proj, dep.nome, r.dep[0]); dep.unidade = r.dep[1]; }
    r.vars.forEach(function (v) {
      if (E.proj.variaveis.some(function (x) { return x.nome === v[0]; })) return;
      Dd.incluirVariavel(E.proj, v[0], v[1]);
      const nv = E.proj.variaveis.find(function (x) { return x.nome === v[0]; });
      nv.direcao = v[2]; nv.descricao = v[3];
    });
    mudou(true); E.aba = 'variaveis'; avisar('Variáveis sugeridas criadas. Ajuste o que precisar.', 'ok');
  };

  ACOES.incluirVar = function () {
    const err = Dd.incluirVariavel(E.proj, document.getElementById('novaVarNome').value, document.getElementById('novaVarTipo').value);
    if (err) return avisar(err, 'erro');
    mudou(true); desenhar();
  };
  ACOES.renomear = function (nome) {
    const novo = prompt('Novo nome para ' + nome + ':', nome);
    if (!novo || novo === nome) return;
    const err = Dd.renomearVariavel(E.proj, nome, novo);
    if (err) return avisar(err, 'erro');
    mudou(true); desenhar();
  };
  ACOES.excluirVar = function (nome) {
    if (!confirm('Excluir a variável ' + nome + ' e todos os valores dela nas amostras?')) return;
    Dd.excluirVariavel(E.proj, nome); mudou(true); desenhar();
  };
  ACOES.operar = function () {
    const r = INF.Operar.operar(E.proj, document.getElementById('opNome').value.trim(), document.getElementById('opTipo').value, document.getElementById('opFormula').value);
    if (r.erro) return avisar(r.erro, 'erro');
    mudou(true); avisar('Coluna calculada em ' + r.ok + ' de ' + r.total + ' amostras.', 'ok');
  };
  ACOES.tempo = function () {
    const n = Dd.preencherTempo(E.proj, document.getElementById('varTempo').value);
    mudou(true); avisar(n + ' amostra(s) com meses calculados. Avaliando = 0 (data base).', 'ok');
  };
  ACOES.distancia = function () {
    const n = Dd.preencherDistancia(E.proj, document.getElementById('varDist').value);
    if (n < 0) return avisar('Informe latitude e longitude do polo na aba Projeto.', 'erro');
    mudou(true); avisar(n + ' amostra(s) com distância calculada.', 'ok');
  };

  // amostras
  ACOES.novaAmostra = function (qtd) {
    for (let i = 0; i < Number(qtd); i++) Dd.incluirAmostra(E.proj, {});
    mudou(true); desenhar();
  };
  ACOES.excluirAmostra = function (id) {
    if (!confirm('Excluir a amostra ' + id + '? (Para só tirar do cálculo, desmarque o ✓.)')) return;
    E.proj.amostras = E.proj.amostras.filter(function (a) { return a.id !== Number(id); });
    mudou(true); desenhar();
  };
  ACOES.reconsiderar = function () { E.proj.amostras.forEach(function (a) { a.habilitada = true; }); mudou(true); desenhar(); };
  ACOES.desligar = function (id) {
    const a = E.proj.amostras.find(function (x) { return x.id === Number(id); });
    if (a) { a.habilitada = false; mudou(true); ACOES.calcular(); }
  };
  ACOES.exportarCSV = function () {
    Dd.baixar((E.proj.projeto.nome || 'amostras') + ' - amostras.csv', Dd.exportarCSV(E.proj), 'text/csv;charset=utf-8');
  };
  ACOES.confirmarImportacao = function () {
    const im = E.importacao;
    im.mapa.forEach(function (m, i) {
      if (m.destino === 'nova') {
        const nome = im.cab[i].trim().replace(/[^\wÀ-ú]+/g, '_').replace(/^_+|_+$/g, '') || ('Col' + (i + 1));
        Dd.incluirVariavel(E.proj, nome, 'quantitativa');
        im.mapa[i] = { destino: 'variavel', nome: nome };
      }
    });
    const n = Dd.importarLinhas(E.proj, im.linhas, im.mapa);
    E.importacao = null; mudou(true); avisar(n + ' amostra(s) importada(s).', 'ok');
  };
  ACOES.cancelarImportacao = function () { E.importacao = null; desenhar(); };

  // modelo híbrido e banco de mercado
  ACOES.buscarBanco = async function () {
    const modo = E.proj.config.origemDados || 'meus';
    try {
      let regs = [];
      if (modo !== 'meus') {
        regs = await Nv.mercado(E.proj.projeto.municipio.split('/')[0].trim(), E.proj.projeto.tipologia, document.getElementById('incluirCompart').checked);
      }
      const r = INF.Conferencia.aplicarOrigem(E.proj, modo, regs);
      mudou(true);
      avisar('Origem "' + modo + '": ' + r.incluidas + ' amostra(s) do banco incluída(s)' + (r.removidas ? ', ' + r.removidas + ' da rodada anterior retirada(s)' : '') + '. Confira antes de calcular.', 'ok');
    } catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.enviarBanco = async function () {
    const compart = document.getElementById('compartilhar').checked;
    const dep = Rg.dependente(E.proj);
    const areaVar = E.proj.variaveis.find(function (v) { return /^area|^área/i.test(v.nome); });
    const proprias = E.proj.amostras.filter(function (a) { return a.origem !== 'banco'; });
    const itens = proprias.map(function (a) {
      const area = areaVar ? U.lerNumero(a.valores[areaVar.nome]) : NaN;
      const y = dep ? U.lerNumero(a.valores[dep.nome]) : NaN;
      const ehTotal = dep && /^(vt|valor)/i.test(dep.nome);
      const atributos = {};
      E.proj.variaveis.forEach(function (v) { if (v.tipo !== 'dependente' && v.tipo !== 'identificacao' && v !== areaVar) atributos[v.nome] = a.valores[v.nome]; });
      return { natureza: a.natureza, tipologia: E.proj.projeto.tipologia, municipio: E.proj.projeto.municipio.split('/')[0].trim(), uf: (E.proj.projeto.municipio.split('/')[1] || '').trim(),
        endereco: a.endereco, bairro: a.bairro, informante: a.informante, telefone: a.telefone, link: a.link, data: a.data || null,
        preco: ehTotal ? y : (Number.isFinite(area) ? y * area : null), area: Number.isFinite(area) ? area : null, unidadeArea: areaVar ? areaVar.unidade : '',
        lat: a.lat, lon: a.lon, atributos: atributos, origem: 'projeto', compartilhado: compart };
    });
    if (!itens.length) return avisar('Não há amostras próprias para guardar.');
    if (!confirm('Guardar ' + itens.length + ' amostra(s) no banco de mercado' + (compart ? ', compartilhando com a COON' : '') + '?')) return;
    try { const r = await Nv.gravarMercado(itens); avisar(r.gravados + ' amostra(s) guardada(s) no banco.', 'ok'); }
    catch (e) { avisar(e.message, 'erro'); }
  };

  // conferência
  ACOES.semContato = function () {
    const ids = INF.Conferencia.desligarSemContato(E.proj);
    mudou(true); E.conferencia = INF.Conferencia.conferir(E.proj);
    avisar(ids.length ? ids.length + ' oferta(s) tirada(s) do cálculo: ' + ids.join(', ') + '. Ficam guardadas e podem ser desfeitas no histórico.' : 'Todas as ofertas no cálculo têm fonte e telefone ou link.', 'ok');
  };
  ACOES.conferir = function () { E.conferencia = INF.Conferencia.conferir(E.proj); desenhar(); };
  ACOES.conferirIA = async function () {
    E.conferencia = INF.Conferencia.conferir(E.proj);
    E.conferindoIA = true; desenhar();
    try { E.conferenciaIA = await Nv.conferirIA(E.id, E.proj); }
    catch (e) { avisar(e.message, 'erro'); }
    E.conferindoIA = false; desenhar();
  };

  // aplica SÓ as sugestões marcadas pelo avaliador
  ACOES.aplicarSugestoes = function () {
    const marcadas = Array.prototype.slice.call(document.querySelectorAll('[data-sugestao]:checked')).map(function (el) { return Number(el.dataset.sugestao); });
    if (!marcadas.length) return avisar('Marque as sugestões que quer aplicar.', 'erro');
    if (!confirm('Aplicar ' + marcadas.length + ' correção(ões)? Ficam no histórico e podem ser desfeitas.')) return;
    let feitas = 0; const erros = [];
    marcadas.forEach(function (i) {
      const ap = E.conferenciaIA.apontamentos[i];
      const r = INF.Conferencia.aplicarCorrecao(E.proj, ap, E.proj.projeto.autor);
      if (r.erro) erros.push(r.erro); else { ap.aplicada = true; feitas++; }
    });
    mudou(true);
    avisar(feitas + ' correção(ões) aplicada(s).' + (erros.length ? ' Não aplicadas: ' + erros.join('; ') : '') + ' Recalcule o modelo.', erros.length ? 'erro' : 'ok');
  };
  ACOES.desfazer = function (i) {
    const r = INF.Conferencia.desfazer(E.proj, Number(i));
    if (r.erro) return avisar(r.erro, 'erro');
    mudou(true); avisar('Alteração desfeita.', 'ok');
  };

  // pesquisa de mercado
  ACOES.abrirPortal = function (i) {
    const po = INF.Pesquisa.PORTAIS[Number(i)];
    const url = INF.Pesquisa.urlBusca(po, document.getElementById('pqTipo').value, document.getElementById('pqFin').value, document.getElementById('pqMun').value, '');
    window.open(url, '_blank', 'noopener');
  };
  ACOES.extrair = function () {
    E.anuncio = INF.Pesquisa.extrairAnuncio(document.getElementById('anTexto').value, document.getElementById('anLink').value.trim());
    desenhar();
  };
  ACOES.lerLink = async function () {
    const link = document.getElementById('anLink').value.trim();
    if (!link) return avisar('Cole o link do anúncio.', 'erro');
    avisar('Lendo o anúncio…');
    try { E.anuncio = await Nv.anuncio(link); E.aviso = null; desenhar(); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.gravarAnuncio = async function () {
    const preco = U.lerNumero(document.getElementById('anPreco').value);
    const area = U.lerNumero(document.getElementById('anArea').value);
    const varArea = document.getElementById('anVarArea').value;
    const dep = Rg.dependente(E.proj);
    if (!dep) return avisar('Crie a variável dependente antes.', 'erro');
    if (!Number.isFinite(preco)) return avisar('Informe o preço.', 'erro');
    const teste = INF.Conferencia.ofertaRastreavel({ natureza: document.getElementById('anNat').value, informante: document.getElementById('anInf').value,
      telefone: document.getElementById('anTel').value, link: E.anuncio.link || '' });
    if (!teste.ok) return avisar('Oferta sem ' + teste.falta.join(' e ') + '. Preencha antes de gravar.', 'erro');
    const valores = {};
    valores[dep.nome] = document.getElementById('anModoDep').value === 'total' ? preco : (area > 0 ? preco / area : NaN);
    if (varArea && Number.isFinite(area)) valores[varArea] = area;
    const dados = {
      natureza: document.getElementById('anNat').value, data: document.getElementById('anData').value,
      endereco: document.getElementById('anEnd').value, informante: document.getElementById('anInf').value,
      telefone: document.getElementById('anTel').value, link: E.anuncio.link || '', valores: valores,
      obs: 'Anúncio: preço ' + U.fmtMoeda(preco) + (Number.isFinite(area) ? ', área ' + U.fmt(area, 2) : '')
    };
    const a = Dd.incluirAmostra(E.proj, dados);
    if (E.anuncioPrint) {
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'print:' + a.id, legenda: 'Print do anúncio da amostra ' + a.id + (dados.link ? ' — ' + dados.link : '') + ' (capturado em ' + new Date().toLocaleDateString('pt-BR') + ')' }, E.anuncioPrint));
      E.anuncioPrint = null;
    }
    if (document.getElementById('anBanco').checked && Nv.logado()) {
      try {
        await Nv.gravarMercado([{ natureza: dados.natureza, tipologia: E.proj.projeto.tipologia, municipio: E.proj.projeto.municipio.split('/')[0].trim(),
          endereco: dados.endereco, informante: dados.informante, telefone: dados.telefone, link: dados.link, data: dados.data || null,
          preco: preco, area: area, unidadeArea: E.anuncio.unidadeArea, origem: E.anuncio.titulo !== undefined ? 'supadata' : 'anuncio-colado' }]);
      } catch (e) { avisar('Amostra criada, mas não foi ao banco: ' + e.message, 'erro'); }
    }
    E.anuncio = null; mudou(true);
    avisar('Amostra ' + a.id + ' criada. Complete as demais variáveis na aba Amostras.', 'ok');
  };

  // cálculo
  ACOES.calcular = function () {
    E.avancado = {};
    E.modelo = Rg.calcular(E.proj, E.proj.modelo.transf);
    E.diag = E.modelo.erro ? null : INF.Diag.tudo(E.modelo);
    E.projecao = null;
    E.aba = 'modelo'; desenhar();
  };
  ACOES.buscar = function () {
    const o = E.opBusca;
    E.buscando = true; E.progresso = 0; E.busca = null; desenhar();
    INF.Busca.buscar(E.proj, {
      criterio: o.criterio, limite: Number(o.limite), testarExclusao: String(o.testarExclusao) === 'true',
      sigMaxRegressores: o.sigMaxRegressores === '' ? null : Number(o.sigMaxRegressores),
      sigMaxF: o.sigMaxF === '' ? null : Number(o.sigMaxF), exigirSinais: String(o.exigirSinais) === 'true',
      semente: Number(E.proj.config.semente) || 12345
    }, function (fr) {
      E.progresso = fr;
      const barra = document.querySelector('progress'); if (barra) barra.value = fr;
    }).then(function (r) { E.busca = r; E.buscando = false; desenhar(); });
  };
  // Cálculo automático completo. Quem calcula é o motor (resultado sempre
  // igual para os mesmos dados); nada aqui usa IA.
  ACOES.calcularTudo = function () {
    const sitA = INF.Etapas.situacao(E.proj, E);
    const antes = ['projeto', 'variaveis'].find(function (a) { return !sitA[a].completa; });
    if (antes) return avisar('Antes de calcular, complete a etapa ' + INF.Etapas.porAba[antes].rotulo + ': falta ' + sitA[antes].faltas.join(', ') + '.', 'erro');
    const resumo = [];
    const semContato = INF.Conferencia.desligarSemContato(E.proj);
    if (semContato.length) {
      mudou(true);
      resumo.push(semContato.length + ' oferta(s) sem fonte e telefone/link tirada(s) do cálculo (amostras ' + semContato.join(', ') + '). Continuam guardadas; dá para desfazer no histórico da aba Amostras.');
    }
    E.conferencia = INF.Conferencia.conferir(E.proj);
    const erros = E.conferencia.filter(function (c) { return c.nivel === 'erro'; });
    resumo.push('Conferência: ' + E.conferencia.length + ' apontamento(s), ' + erros.length + ' erro(s).');
    resumo.push('Amostras no cálculo: ' + E.proj.amostras.filter(function (a) { return a.habilitada !== false; }).length + ' de ' + E.proj.amostras.length + '.');
    E.buscando = true; E.resumoAuto = null; desenhar();
    const base = { criterio: 'R2orig', limite: 500, testarExclusao: true, sigMaxF: 0.05, semente: Number(E.proj.config.semente) || 12345 };
    // do mais exigente para o menos exigente: Grau III → II → I
    const tentativas = [
      { rotulo: 'Grau III (Sig ≤ 10%, F ≤ 1%, sinais coerentes)', op: { sigMaxRegressores: 0.10, sigMaxF: 0.01, exigirSinais: true } },
      { rotulo: 'Grau II (Sig ≤ 20%, F ≤ 2%, sinais coerentes)', op: { sigMaxRegressores: 0.20, sigMaxF: 0.02, exigirSinais: true } },
      { rotulo: 'Grau I (Sig ≤ 30%, F ≤ 5%, sinais coerentes)', op: { sigMaxRegressores: 0.30, sigMaxF: 0.05, exigirSinais: true } }
    ];
    let i = 0;
    (function proxima() {
      if (i >= tentativas.length) {
        E.buscando = false;
        resumo.push('Nenhuma combinação atende nem ao Grau I com sinais coerentes. Revise amostras e variáveis.');
        E.resumoAuto = resumo; desenhar(); return;
      }
      const t = tentativas[i++];
      INF.Busca.buscar(E.proj, Object.assign({}, base, t.op), function (fr) { const b = document.querySelector('progress'); if (b) b.value = fr; })
        .then(function (r) {
          if (r.erro) { E.buscando = false; resumo.push(r.erro); E.resumoAuto = resumo; desenhar(); return; }
          if (!r.modelos.length) { resumo.push('Filtro ' + t.rotulo + ': nenhum modelo (' + U.fmt(r.avaliados, 0) + ' testados).'); proxima(); return; }
          E.busca = r;
          E.proj.modelo.transf = U.copiar(r.modelos[0].transf);
          ACOES.calcular();
          E.buscando = false;
          resumo.push('Filtro ' + t.rotulo + ': ' + U.fmt(r.avaliados, 0) + ' combinações testadas, ' + U.fmt(r.validos, 0) + ' atendem; escolhida a de maior R² na escala original.');
          const m = E.modelo;
          if (m && !m.erro) {
            resumo.push('Modelo: ' + m.equacao);
            resumo.push('n = ' + m.n + ', R² = ' + U.fmt(m.R2, 4) + ', R² ajustado = ' + U.fmt(m.R2aj, 4) + ', Sig F = ' + U.fmtPct(m.sigF, 4) + '.');
            const fp = N.fundamentacaoPreliminar(m, E.proj.config);
            const dY = INF.Diag.descritiva(m.yOriginal);
            resumo.push(m.dep.nome + ': média ' + U.fmtAuto(dY.media) + ', mediana ' + U.fmtAuto(dY.mediana) + ', CV ' + U.fmtPct(dY.cv, 1) + '.');
            resumo.push('Fundamentação (preliminar): Grau ' + N.romano(fp.grau) + ' com ' + fp.pontos + ' pontos. Precisão: sai ao estimar o avaliando.');
            if (E.diag.outliers.length) resumo.push('Outliers (resíduo > 2σ): amostras ' + E.diag.outliers.join(', ') + '. Não foram retirados: a decisão é sua.');
            const valores = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
            if (valores.every(Number.isFinite)) {
              ACOES.projetar();
              const pr = E.projecao;
              if (pr && !pr.erro) resumo.push('Avaliando: ' + U.fmtAuto(pr.central) + ' (IC 80%: ' + U.fmtAuto(pr.icMin) + ' a ' + U.fmtAuto(pr.icMax) + ') — Fundamentação Grau ' + N.romano(pr.fundamentacao.grau) + ', Precisão Grau ' + N.romano(pr.grauPrecisao) + '.');
            } else resumo.push('Preencha o avaliando na aba "Avaliação e NBR" para estimar o valor.');
          }
          E.resumoAuto = resumo; E.aba = 'modelo'; desenhar();
        });
    })();
  };

  ACOES.usarModelo = function (i) {
    const r = E.busca.modelos[Number(i)];
    E.proj.modelo.transf = U.copiar(r.transf);
    mudou(true); ACOES.calcular();
  };
  ACOES.treinarRNA = function () {
    const o = E.opRna;
    avisar('Treinando a rede…');
    setTimeout(function () {
      E.rna = INF.RNA.treinar(E.proj, E.proj.modelo.transf, { ocultos: Number(o.ocultos) || 4, redes: Number(o.redes) || 15, epocas: Number(o.epocas) || 3000, semente: Number(E.proj.config.semente) || 12345 });
      E.aviso = null; desenhar();
    }, 30);
  };
  ACOES.projetar = function () {
    const m = E.modelo, c = E.proj.config;
    const valores = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    E.projecao = INF.Projecao.projetar(m, valores, { nivel: Number(c.nivelIC) || 0.8, estimativa: c.estimativaLn, areaAvaliando: E.proj.avaliando.area, item1: Number(c.item1), item3: Number(c.item3), considerarIntercepto: c.considerarIntercepto });
    desenhar();
  };

  // ferramentas avançadas
  const Av = INF.Avancado;
  const valsAvaliando = function () { return E.modelo.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); }); };
  const semente = function () { return Number(E.proj.config.semente) || 12345; };
  ACOES.avPCA = function () { E.avancado.pca = Av.pca(E.modelo); desenhar(); };
  ACOES.avKmedias = function () { E.avancado.k = Number(document.getElementById('avK').value); E.avancado.km = Av.kmedias(E.modelo, E.avancado.k, semente()); desenhar(); };
  ACOES.avDEA = function () { E.avancado.deaIn = document.getElementById('avDeaIn').value; E.avancado.dea = Av.dea(E.proj, [E.avancado.deaIn], ['__dep__']); desenhar(); };
  ACOES.avBoxCox = function () { E.avancado.bc = Av.boxCox(E.modelo); desenhar(); };
  ACOES.avUsarBoxCox = function () { E.proj.modelo.transf[E.modelo.dep.nome] = E.avancado.bc.recomendada[2]; mudou(true); ACOES.calcular(); };
  ACOES.avBootCoef = function () { E.avancado.bcoef = Av.bootstrapCoeficientes(E.modelo, { semente: semente(), nivel: Number(E.proj.config.nivelIC) || 0.8 }); desenhar(); };
  ACOES.avRobusta = function () { E.avancado.rob = Av.robusta(E.modelo); desenhar(); };
  ACOES.avBoosting = function () { E.avancado.gb = Av.boosting(E.modelo, { semente: semente() }); desenhar(); };
  ACOES.avMoran = function () { E.avancado.moran = Av.moran(E.proj, E.modelo); desenhar(); };
  ACOES.avBootAval = function () {
    const v = valsAvaliando(); if (!v.every(Number.isFinite)) return avisar('Preencha o avaliando na aba Avaliação e NBR.', 'erro');
    E.avancado.bs = Av.bootstrap(E.modelo, v, { semente: semente(), nivel: Number(E.proj.config.nivelIC) || 0.8 }); desenhar();
  };
  ACOES.avSimulacao = function () {
    const v = valsAvaliando(); if (!v.every(Number.isFinite)) return avisar('Preencha o avaliando na aba Avaliação e NBR.', 'erro');
    E.avancado.sim = Av.simulacao(E.modelo, v, { semente: semente() }); desenhar();
  };
  ACOES.podarRNA = function () { E.rna = INF.RNA.podar(E.rna, 0.05); desenhar(); };

  // exportação: Excel e PDF
  ACOES.exportarExcel = function () {
    if (E.modelo && !E.modelo.erro && !E.projecao && E.modelo.indep.every(function (v) { return Number.isFinite(U.lerNumero(E.proj.avaliando.valores[v.nome])); })) ACOES.projetar();
    const bytes = INF.Planilha.pastaCompleta({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao, busca: E.busca });
    Dd.baixar((E.proj.projeto.nome || 'avaliacao') + ' - planilhas.xlsx', bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };
  ACOES.exportarPDF = function () {
    const html = htmlRelatorio(); if (!html) return;
    // imprime por um quadro invisível: abre direto a janela de impressão,
    // onde se escolhe "Salvar como PDF"
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const quadro = document.createElement('iframe');
    quadro.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    quadro.src = url;
    quadro.onload = function () {
      setTimeout(function () {
        quadro.contentWindow.focus(); quadro.contentWindow.print();
        setTimeout(function () { quadro.remove(); URL.revokeObjectURL(url); }, 60000);
      }, 300);
    };
    document.body.appendChild(quadro);
  };


  // ---- laudo: fotos, mapas, Word e PDF --------------------------------------------------------
  // Reduz a foto para no máximo 1600 px e guarda como JPEG (qualidade 0,82).
  function reduzirImagem(arquivo) {
    return new Promise(function (ok, falhou) {
      const leitor = new FileReader();
      leitor.onload = function () {
        const img = new Image();
        img.onload = function () {
          const esc = Math.min(1, 1600 / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(img.width * esc); cv.height = Math.round(img.height * esc);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          ok({ dataUrl: cv.toDataURL('image/jpeg', 0.82), largura: cv.width, altura: cv.height });
        };
        img.onerror = function () { falhou(new Error('Imagem inválida: ' + arquivo.name)); };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }
  function proximoIdFoto() { return (E.proj.fotos || []).reduce(function (m, f) { return Math.max(m, f.id); }, 0) + 1; }
  async function incluirFotos(arquivos, alvo) {
    E.proj.fotos = E.proj.fotos || [];
    for (let i = 0; i < arquivos.length; i++) {
      try {
        const r = await reduzirImagem(arquivos[i]);
        E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: alvo, legenda: arquivos[i].name.replace(/\.[^.]+$/, '') }, r));
      } catch (e) { avisar(e.message, 'erro'); }
    }
    mudou(false);
    if (!Dd.salvarLocal(E.proj)) avisar('Fotos incluídas. O projeto ficou grande para o armazenamento do navegador: use Salvar (nuvem) ou Baixar para não perder.', 'erro');
    else desenhar();
  }
  ACOES.excluirFoto = function (id) {
    E.proj.fotos = (E.proj.fotos || []).filter(function (f) { return f.id !== Number(id); });
    mudou(false); desenhar();
  };
  ACOES.mapaGoogle = async function (tipo) {
    const av = E.proj.avaliando;
    const marc = E.proj.amostras.filter(function (a) { return a.habilitada !== false && Number.isFinite(a.lat) && Number.isFinite(a.lon); })
      .map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: String(a.id).length === 1 ? String(a.id) : '' }; });
    avisar('Buscando imagem no Google Maps…');
    try {
      const dataUrl = await Nv.mapa(tipo, { lat: av.lat, lon: av.lon }, marc);
      const dims = await new Promise(function (ok) { const i = new Image(); i.onload = function () { ok({ largura: i.width, altura: i.height }); }; i.src = dataUrl; });
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'mapa', dataUrl: dataUrl,
        legenda: tipo === 'satelite' ? 'Imagem de satélite do imóvel avaliando. Imagem: Google.' : 'Situação do imóvel avaliando (A) e dos dados de mercado. Imagem: Google.' }, dims));
      mudou(false); E.aviso = null; desenhar();
    } catch (e) { avisar(e.message, 'erro'); }
  };

  // Gráfico SVG → PNG (o Word não lê SVG): desenha num canvas em 2× de resolução.
  function svgParaPng(svg) {
    return new Promise(function (ok) {
      const estilo = '<style>' + INF.Laudo.CSS_GRAFICO + '</style><rect width="100%" height="100%" fill="#fff"/>';
      const texto = svg.replace(/(<svg[^>]*>)/, '$1' + estilo);
      const img = new Image();
      img.onload = function () {
        const cv = document.createElement('canvas'); cv.width = 920; cv.height = 640;
        cv.getContext('2d').drawImage(img, 0, 0, 920, 640);
        cv.toBlob(function (b) { b.arrayBuffer().then(function (buf) { ok({ png: new Uint8Array(buf), largura: 920, altura: 640 }); }); }, 'image/png');
      };
      img.onerror = function () { ok(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(texto);
    });
  }
  function montarLaudo() {
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    if (!soViz && (!E.modelo || E.modelo.erro)) { avisar('Calcule o modelo antes (aba Modelo).', 'erro'); return null; }
    if (!soViz && !E.projecao) ACOES.projetar();
    const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
    if (l.erro) { avisar(l.erro, 'erro'); return null; }
    const html = INF.Laudo.html(l);
    // lista, sem repetir, do que ficou em branco (ex.: "número da matrícula")
    E.pendenciasLaudo = Array.from(new Set((html.match(/\[preencher:[^\]]*\]/g) || []).map(function (x) { return x.slice(11, -1).trim(); })));
    return { laudo: l, html: html };
  }
  const nomeLaudo = function () { return 'Laudo de avaliação - ' + (E.proj.projeto.nome || 'imóvel').replace(/[\\/:*?"<>|]/g, ' '); };
  ACOES.laudoWord = async function () {
    const r = montarLaudo(); if (!r) return;
    avisar('Montando o Word…');
    const imagens = {};
    for (let i = 0; i < r.laudo.blocos.length; i++) {
      if (r.laudo.blocos[i].t === 'grafico') imagens[i] = await svgParaPng(r.laudo.blocos[i].svg);
    }
    Dd.baixar(nomeLaudo() + '.docx', INF.Laudo.docx(r.laudo, imagens), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    E.aviso = null; desenhar();
  };
  function imprimirHtml(html) {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const quadro = document.createElement('iframe');
    quadro.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    quadro.src = url;
    quadro.onload = function () { setTimeout(function () { quadro.contentWindow.focus(); quadro.contentWindow.print(); setTimeout(function () { quadro.remove(); URL.revokeObjectURL(url); }, 60000); }, 400); };
    document.body.appendChild(quadro);
  }
  ACOES.laudoPDF = function () { const r = montarLaudo(); if (r) { imprimirHtml(r.html); desenhar(); } };
  ACOES.laudoVer = function () {
    const r = montarLaudo(); if (!r) return;
    window.open(URL.createObjectURL(new Blob([r.html], { type: 'text/html;charset=utf-8' })), '_blank', 'noopener');
    desenhar();
  };


  // ---- tipo de laudo: ações -------------------------------------------------------------------
  function tipoLaudo() { if (!E.proj.tipoLaudo) E.proj.tipoLaudo = INF.TiposLaudo.ler(E.proj); return E.proj.tipoLaudo; }
  ACOES.tlAtalho = function (i) {
    const a = INF.TiposLaudo.ATALHOS[Number(i)], t = tipoLaudo();
    t.destino = a.destino; t.objetos = a.objetos.slice(); if (a.ambito) t.ambito = a.ambito;
    mudou(false); avisar('Tipo de laudo: ' + a.rotulo + '.', 'ok');
  };
  ACOES.novoQuesito = function () { tipoLaudo().quesitos.push({ parte: '', pergunta: '', resposta: '' }); mudou(false); desenhar(); };
  ACOES.tirarQuesito = function (i) { tipoLaudo().quesitos.splice(Number(i), 1); mudou(false); desenhar(); };
  ACOES.novaBenf = function () { tipoLaudo().benfeitorias.push({ descricao: '', quantidade: null, unidade: '', unitario: null, depreciacao: null }); mudou(false); desenhar(); };
  ACOES.tirarBenf = function (i) { tipoLaudo().benfeitorias.splice(Number(i), 1); mudou(false); desenhar(); };

  // ---- galeria dos 20 estilos: capa e primeira página de cada um, lado a lado --------------------
  ACOES.verEstilos = function () {
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    if (!soViz && (!E.modelo || E.modelo.erro)) return avisar('Calcule o modelo antes (aba Modelo) para ver o laudo nos 20 estilos.', 'erro');
    if (!soViz && !E.projecao) ACOES.projetar();
    const original = (E.proj.laudo || {}).estilo;
    let pag = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Os 20 estilos</title><style>body{font-family:Arial;margin:16px;background:#eee}'
      + '.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}.c{background:#fff;padding:8px;border-radius:8px}.c h3{margin:0 0 6px;font-size:14px}'
      + 'iframe{width:100%;height:460px;border:1px solid #ccc;background:#fff}</style></head><body><h2>Os 20 estilos — mesmo conteúdo, apresentação diferente</h2><div class="g">';
    E.proj.laudo = E.proj.laudo || {};
    INF.Estilos.LISTA.forEach(function (e) {
      E.proj.laudo.estilo = e.numero;
      const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
      if (l.erro) return;
      // capa + sumário + primeiro capítulo, para comparar
      const q = l.blocos.findIndex(function (b, i) { return b.t === 'h1' && i > 3; });
      l.blocos = l.blocos.slice(0, Math.max(q + 6, 8));
      pag += '<div class="c"><h3>' + e.numero + ' — ' + h(e.nome) + '</h3><iframe srcdoc="' + h(INF.Laudo.html(l)) + '"></iframe></div>';
    });
    E.proj.laudo.estilo = original;
    pag += '</div></body></html>';
    window.open(URL.createObjectURL(new Blob([pag], { type: 'text/html;charset=utf-8' })), '_blank', 'noopener');
  };

  // ---- inventário de documentos ----------------------------------------------------------------
  const lerComo = function (arquivo, modo) {
    return new Promise(function (ok, falhou) {
      const f = new FileReader();
      f.onload = function () { ok(f.result); }; f.onerror = function () { falhou(new Error('Não consegui ler ' + arquivo.name)); };
      if (modo === 'texto') f.readAsText(arquivo, 'utf-8'); else f.readAsDataURL(arquivo);
    });
  };
  ACOES.abrirDoc = function (chave) {
    const d = E.docs.find(function (x) { return x.hash === chave || x.nome === chave; });
    if (d) window.open(URL.createObjectURL(d.file), '_blank', 'noopener');
  };
  // Lê TODOS os documentos NOVOS ou ALTERADOS, um por vez, com a lista do modelo.
  ACOES.inventariar = async function () {
    E.proj.inventario = E.proj.inventario || {};
    const t = INF.TiposLaudo.ler(E.proj);
    const campos = INF.Inventario.paraIA(t), modelo = nomeModelo(t);
    const pendentes = E.docs.filter(function (d) { return d.hash && ['NOVO', 'ALTERADO'].indexOf(situacaoDoc(d)) >= 0; });
    let lidos = 0; const erros = [];
    for (const d of pendentes) {
      E.inventariando = d.nome; desenhar();
      const f = d.file, ext = (d.nome.split('.').pop() || '').toLowerCase();
      try {
        let arq;
        if (f.type === 'application/pdf' || ext === 'pdf') {
          if (f.size > 30 * 1024 * 1024) throw new Error('PDF acima de 30 MB: divida o arquivo');
          arq = { nome: d.nome, mime: 'application/pdf', base64: String(await lerComo(f, 'url')).split(',')[1] };
        } else if (/^image\//.test(f.type) || /^(jpe?g|png|webp|heic)$/.test(ext)) {
          const r = await reduzirImagem(f);
          arq = { nome: d.nome, mime: 'image/jpeg', base64: r.dataUrl.split(',')[1] };
        } else if (/^(txt|csv|kml|xml|json|md)$/.test(ext)) {
          arq = { nome: d.nome, texto: String(await lerComo(f, 'texto')) };
        } else { d.status = 'formato não lido — salve em PDF'; continue; }
        // se o arquivo foi ALTERADO, a leitura antiga (mesmo nome) sai do cache
        Object.keys(E.proj.inventario).forEach(function (hh) { if (E.proj.inventario[hh].arquivo === d.nome && hh !== d.hash) delete E.proj.inventario[hh]; });
        const r = await Nv.inventariar(E.id, arq, campos, modelo);
        r.lidoEm = new Date().toISOString(); r.hash = d.hash;
        E.proj.inventario[d.hash] = r;
        d.status = ''; lidos++;
        mudou(false);
      } catch (e) { d.status = 'erro: ' + e.message; erros.push(d.nome); }
    }
    E.inventariando = null;
    avisar(lidos + ' documento(s) lido(s).' + (erros.length ? ' Com erro: ' + erros.join(', ') + '.' : ' Confira o inventário do modelo abaixo.'), erros.length ? 'erro' : 'ok');
  };
  ACOES.aplicarInventario = async function () {
    const F = fichaAtual(), inv = E.proj.inventario || {};
    const marcados = function (atr) { return Array.prototype.slice.call(document.querySelectorAll('[' + atr + ']')).filter(function (el) { return el.checked && !el.disabled; }).map(function (el) { return el.getAttribute(atr); }); };
    const agora = new Date().toISOString();
    E.proj.historico = E.proj.historico || [];
    let feitos = 0;
    const gravar = function (campoId, destino, valor, fonte) {
      const numerico = /^tipoLaudo\.area/.test(destino);
      const v = numerico ? U.lerNumero(valor) : valor;
      let partes = destino.split('.'), alvo = E.proj;
      if (partes[0] === 'tipoLaudo') { alvo = tipoLaudo(); partes = partes.slice(1); }
      for (let k = 0; k < partes.length - 1; k++) { alvo[partes[k]] = alvo[partes[k]] || {}; alvo = alvo[partes[k]]; }
      const de = alvo[partes[partes.length - 1]];
      alvo[partes[partes.length - 1]] = v;
      E.proj.historico.push({ quando: agora, autor: E.proj.projeto.autor || '', origem: 'inventário de documentos', acao: 'preencher', amostra: null, campo: destino,
        de: de === undefined ? null : de, para: v, evidencia: fonte ? fonte.arquivo + (fonte.pagina ? ', p. ' + fonte.pagina : '') + (fonte.trecho ? ': "' + fonte.trecho + '"' : '') : '' });
      feitos++;
    };
    // campos resolvidos marcados
    marcados('data-ficha').forEach(function (i) { const f = F.ficha[Number(i)]; if (f && f.destino) gravar(f.campo, f.destino, f.valor, f.fonte); });
    // divergências decididas pelo avaliador (vira decisão, com a fonte escolhida)
    Array.prototype.slice.call(document.querySelectorAll('[data-decidir]')).forEach(function (el) {
      if (el.value === '') return;
      const f = F.ficha[Number(el.dataset.decidir)], c = f.candidatos[Number(el.value)];
      E.proj.inventarioDecisoes = E.proj.inventarioDecisoes || {};
      E.proj.inventarioDecisoes[f.campo] = { valor: c.valor, fonte: c, porque: 'escolha entre documentos divergentes' };
      if (f.destino) gravar(f.campo, f.destino, c.valor, c);
    });
    // outros achados para o laudo
    const achados = [];
    Object.keys(inv).forEach(function (hh) { (inv[hh].achados || []).forEach(function (a, k) { achados.push(Object.assign({ arquivo: inv[hh].arquivo, chave: hh + ':' + k }, a)); }); });
    marcados('data-achado').forEach(function (i) {
      const a = achados[Number(i)];
      E.proj.laudo = E.proj.laudo || {};
      E.proj.laudo.achadosIncluidos = E.proj.laudo.achadosIncluidos || [];
      E.proj.laudo.achadosIncluidos.push({ chave: a.chave, assunto: a.assunto, texto: a.texto, fonte: a.arquivo + (a.pagina ? ', p. ' + a.pagina : '') });
      feitos++;
    });
    // quesitos e fotos
    marcados('data-sug-quesitos').forEach(function (hh) { const t = tipoLaudo(); (inv[hh].quesitos || []).forEach(function (q) { t.quesitos.push({ parte: q.parte, pergunta: q.pergunta, resposta: '' }); }); feitos++; });
    for (const hh of marcados('data-sug-foto')) {
      const d = E.docs.find(function (x) { return x.hash === hh; });
      if (!d) continue;
      const r = await reduzirImagem(d.file);
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'avaliando', legenda: String(inv[hh].resumo || '').slice(0, 120) }, r));
      feitos++;
    }
    if (!feitos) return avisar('Marque o que quer aplicar.', 'erro');
    mudou(false);
    avisar(feitos + ' item(ns) aplicado(s) ao laudo, cada um com o documento de origem.', 'ok');
  };

  // ---- vizinhança: incluir e tirar imóveis, ambientes e anomalias ---------------------------------------
  function viz() { const TL = INF.TiposLaudo; E.proj.vizinhanca = Object.assign(TL.vizinhancaPadrao(), E.proj.vizinhanca || {}); return E.proj.vizinhanca; }
  const partes3 = function (arg) { return String(arg).split('.').map(Number); };
  ACOES.vizNovoImovel = function () { viz().imoveis.push({ endereco: '', ocupante: '', tipo: '', ambientes: [{ nome: 'Fachada', anomalias: [] }] }); mudou(false); desenhar(); };
  ACOES.vizTirarImovel = function (i) { if (!confirm('Remover o imóvel ' + (Number(i) + 1) + '?')) return; viz().imoveis.splice(Number(i), 1); mudou(false); desenhar(); };
  ACOES.vizNovoAmbiente = function (i) { const im = viz().imoveis[Number(i)]; im.ambientes = im.ambientes || []; im.ambientes.push({ nome: '', anomalias: [] }); mudou(false); desenhar(); };
  ACOES.vizTirarAmbiente = function (arg) { const q = partes3(arg); viz().imoveis[q[0]].ambientes.splice(q[1], 1); mudou(false); desenhar(); };
  ACOES.vizNovaAnomalia = function (arg) { const q = partes3(arg); const a = viz().imoveis[q[0]].ambientes[q[1]]; a.anomalias = a.anomalias || []; a.anomalias.push({ tipo: '', localizacao: '', dimensao: '', descricao: '' }); mudou(false); desenhar(); };
  ACOES.vizTirarAnomalia = function (arg) { const q = partes3(arg); viz().imoveis[q[0]].ambientes[q[1]].anomalias.splice(q[2], 1); mudou(false); desenhar(); };

  // relatório
  function htmlRelatorio() {
    if (!E.modelo || E.modelo.erro) { avisar('Calcule o modelo antes.', 'erro'); return null; }
    if (!E.projecao) ACOES.projetar();
    return INF.Relatorio.gerar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
  }
  ACOES.abrirRelatorio = function () {
    const html = htmlRelatorio(); if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  };
  ACOES.baixarRelatorio = function () {
    const html = htmlRelatorio(); if (!html) return;
    Dd.baixar((E.proj.projeto.nome || 'avaliacao') + ' - tratamento estatístico.html', html, 'text/html;charset=utf-8');
  };

  // arquivo e nuvem
  ACOES.recuperarAnterior = function () {
    const ant = Dd.lerAnterior(); if (!ant) return;
    if (!confirm('Abrir "' + (ant.projeto.nome || 'projeto anterior') + '"? O projeto atual fica guardado como anterior.')) return;
    E.proj = ant; E.id = null; guardarId(); limparCalculos(); Dd.salvarLocal(ant); E.sujo = true; E.aba = 'projeto'; desenhar();
  };
  ACOES.novo = function () {
    if (E.sujo && !confirm('Começar um projeto novo? O atual fica salvo neste navegador até você substituir.')) return;
    E.proj = Dd.novoProjeto(); E.id = null; guardarId(); limparCalculos(); E.aba = 'projeto'; mudou(false); E.sujo = false; desenhar();
  };
  ACOES.baixarProjeto = function () {
    Dd.baixar((E.proj.projeto.nome || 'projeto') + '.inferencia.json', JSON.stringify(E.proj, null, 1), 'application/json');
  };
  ACOES.salvarNuvem = async function () {
    if (!Nv.logado()) return avisar('Entre no COON para salvar na nuvem. Enquanto isso o projeto fica neste navegador e pode ser baixado em .json.', 'erro');
    try { const r = await Nv.salvar(E.id, E.proj); E.id = r.id; guardarId(); E.sujo = false; avisar(Nv.sessao.banco === 'supabase' ? 'Projeto salvo na nuvem.' : 'Projeto salvo no servidor (modo teste, sem Supabase).', 'ok'); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.meusProjetos = async function () {
    if (!Nv.logado()) return avisar('Entre no COON para ver os projetos da nuvem.', 'erro');
    try { E.lista = await Nv.listar(); E.aba = 'lista'; desenhar(); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.abrirDaNuvem = async function (id) {
    try {
      const r = await Nv.abrir(id);
      E.proj = Dd.normalizar(r.dados); E.id = r.id; guardarId(); limparCalculos(); E.sujo = false; Dd.salvarLocal(E.proj); E.aba = 'projeto'; desenhar();
    } catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.excluirDaNuvem = async function (id) {
    if (!confirm('Excluir este projeto da nuvem?')) return;
    try { await Nv.excluir(id); ACOES.meusProjetos(); } catch (e) { avisar(e.message, 'erro'); }
  };
  ABAS.lista = function () {
    const l = E.lista || [];
    if (!l.length) return '<p class="vazio">Nenhum projeto na nuvem ainda.</p>';
    return '<section class="cartao"><h2>Meus projetos</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Trabalho</th><th>Tipologia</th><th>Município</th><th>n</th><th>R²</th><th>Alterado</th><th></th></tr></thead><tbody>'
      + l.map(function (p) {
        return '<tr><td class="esq">' + h(p.nome || '(sem nome)') + '</td><td>' + h(p.tipologia) + '</td><td>' + h(p.municipio) + '</td><td>' + (p.resumo ? p.resumo.n : '—') + '</td><td>' + (p.resumo ? U.fmt(p.resumo.R2, 4) : '—') + '</td><td>' + new Date(p.alterado_em).toLocaleString('pt-BR') + '</td>'
          + '<td><button class="leve" data-acao="abrirDaNuvem" data-arg="' + h(p.id) + '">Abrir</button><button class="leve perigo" data-acao="excluirDaNuvem" data-arg="' + h(p.id) + '">Excluir</button></td></tr>';
      }).join('') + '</tbody></table></div></section>';
  };

  function guardarId() { try { if (E.id) localStorage.setItem('inferencia-nbr:id', E.id); else localStorage.removeItem('inferencia-nbr:id'); } catch (e) { /* sem armazenamento */ } }
  function limparCalculos() { E.modelo = E.diag = E.projecao = E.rna = E.busca = E.conferencia = E.conferenciaIA = E.anuncio = E.importacao = null; }

  // ---------------------------------------------------------------------------
  // Desenho da tela
  // ---------------------------------------------------------------------------
  function atualizarTopo() {
    const t = document.getElementById('tituloProjeto');
    if (t) t.textContent = (E.proj.projeto.nome || 'Projeto sem nome') + (E.sujo ? ' •' : '');
    const st = document.getElementById('statusNuvem');
    if (st) {
      const s = Nv.sessao;
      st.textContent = Nv.logado() ? (s.usuario.nome || s.usuario.email) + ' · ' + (s.banco === 'supabase' ? 'nuvem' : 'servidor local') : (s ? 'não conectado' : 'sem servidor (trabalho local)');
      st.className = 'status ' + (Nv.logado() ? 'on' : 'off');
    }
  }

  function desenhar() {
    const nav = document.getElementById('abas');
    const sit = INF.Etapas.situacao(E.proj, E);
    E.situacao = sit;
    const inicioOk = sit.projeto.completa;
    nav.innerHTML = ABAS_MENU.map(function (a) {
      const st = sit[a[0]] || { completa: true, liberada: true };
      const et = INF.Etapas.porAba[a[0]] || {};
      let sinal, cls;
      if (!inicioOk && a[0] !== 'projeto') { sinal = '·'; cls = 'neutro'; }
      else if (!et.obrigatoria) { sinal = st.liberada ? '·' : '✗'; cls = st.liberada ? 'neutro' : 'erro'; }
      else if (!st.liberada) { sinal = '✗'; cls = 'erro'; }
      else if (st.completa) { sinal = '✓'; cls = 'ok'; }
      else { sinal = '✗'; cls = 'erro'; }
      const dica = !inicioOk && a[0] !== 'projeto' ? 'Complete antes a aba 1 (Projeto)' : !st.liberada ? 'Pode editar, mas para rodar complete antes: ' + st.bloqueio.etapa + (st.bloqueio.faltas.length ? ' — falta: ' + st.bloqueio.faltas.join(', ') : '')
        : (st.faltas && st.faltas.length ? 'Falta: ' + st.faltas.join(', ') : (et.obrigatoria ? 'Etapa completa' : 'Etapa de apoio'));
      return '<button class="aba' + (E.aba === a[0] ? ' ativa' : '') + '" data-aba="' + a[0] + '" title="' + h(dica) + '">' + a[1]
        + '<span class="sinal-aba ' + cls + '">' + sinal + '</span></button>';
    }).join('');
    const main = document.getElementById('conteudo');
    const aviso = E.aviso ? '<div class="aviso ' + E.aviso.tipo + '" role="status">' + h(E.aviso.texto) + '<button class="fechar" data-acao="fecharAviso" aria-label="Fechar">×</button></div>' : '';
    const pos = window.scrollY;
    const pg = INF.Etapas.progresso(sit), stA = sit[E.aba];
    const barraEtapas = '<div class="etapas"><div class="etapas-barra"><span style="width:' + Math.round(pg.feitas / pg.total * 100) + '%"></span></div>'
      + '<small>' + pg.feitas + ' de ' + pg.total + ' etapas obrigatórias completas' + (pg.proxima ? ' · próxima: <b>' + h(pg.proxima.rotulo) + '</b>' + (sit[pg.proxima.aba].faltas.length ? ' — falta: ' + h(sit[pg.proxima.aba].faltas.join(', ')) : '') : ' · tudo pronto para o laudo') + '</small>'
      + (stA && stA.faltas && stA.faltas.length && INF.Etapas.porAba[E.aba].obrigatoria ? '<div class="sinal sinal-erro">✗ Nesta etapa falta: ' + h(stA.faltas.join('; ')) + '</div>' : (stA && INF.Etapas.porAba[E.aba] && INF.Etapas.porAba[E.aba].obrigatoria ? '<div class="sinal sinal-ok">✓ Etapa completa</div>' : ''))
      + '</div>';
    main.innerHTML = aviso + barraEtapas + (ABAS[E.aba] ? ABAS[E.aba]() : '');
    desenharDuvidas();
    window.scrollTo(0, pos);
    atualizarTopo();
  }
  ACOES.fecharAviso = function () { E.aviso = null; desenhar(); };


  // ---------------------------------------------------------------------------
  // QUADRO DE DÚVIDAS — pergunte à IA como preencher, calcular e interpretar
  // ---------------------------------------------------------------------------
  // A IA recebe o manual do programa (no servidor) e este retrato do estado da
  // tela. Sem CPF e sem telefone. Ela orienta; não preenche e não inventa dado.
  E.duvidas = E.duvidas || [];
  function contextoDuvida() {
    const p = E.proj, sit = INF.Etapas.situacao(p, E), m = E.modelo && !E.modelo.erro ? E.modelo : null, pr = E.projecao && !E.projecao.erro ? E.projecao : null;
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
    const tl = INF.TiposLaudo.ler(p), IV = INF.Inventario;
    return {
      abaAberta: (INF.Etapas.porAba[E.aba] || {}).rotulo || E.aba,
      etapas: INF.Etapas.ETAPAS.map(function (x) { return { etapa: x.rotulo, obrigatoria: x.obrigatoria, completa: sit[x.aba].completa, falta: sit[x.aba].faltas }; }),
      projeto: { tipologia: p.projeto.tipologia, municipio: p.projeto.municipio, dataBase: p.projeto.dataBase, temCodigo: !!p.projeto.codigo, temResponsavel: !!p.projeto.autor,
        fatorOferta: p.config.aplicarFatorOferta ? p.config.fatorOferta : 'não aplicado', raioKm: INF.Modelos.raio(p) },
      laudo: { modelo: INF.Modelos.doProjeto(p).nome, nivel: INF.Modelos.doProjeto(p).nivel, estilo: INF.Estilos.doProjeto(p).numero, destino: tl.destino, objetos: tl.objetos,
        dadosSemOrigem: IV.ficha(tl, p.inventario || {}, p.inventarioDecisoes || {}, valorAtualCampo).filter(function (f) { return f.obrig && f.estado !== 'RESOLVIDA'; }).map(function (f) { return f.rotulo + ' (' + f.estado + ')'; }) },
      variaveis: p.variaveis.map(function (v) { return { nome: v.nome, tipo: v.tipo, unidade: v.unidade, direcao: v.direcao, escala: p.modelo.transf[v.nome] || '' }; }),
      amostras: { total: p.amostras.length, noCalculo: ativas.length, ofertas: ativas.filter(function (a) { return a.natureza === 'oferta'; }).length,
        semData: ativas.filter(function (a) { return !a.data; }).length, semCoordenadas: ativas.filter(function (a) { return !(Number.isFinite(a.lat) && Number.isFinite(a.lon)); }).length },
      conferencia: (E.conferencia || []).slice(0, 15).map(function (c) { return (c.amostra ? 'amostra ' + c.amostra + ': ' : '') + c.texto; }),
      modelo: m ? { equacao: m.equacao, n: m.n, k: m.p - 1, R2: +m.R2.toFixed(4), R2aj: +m.R2aj.toFixed(4), sigF: m.sigF, regressores: m.indep.map(function (v, j) { return { nome: v.nome, escala: v.transf, sig: +m.sig[j + 1].toFixed(4) }; }),
        outliers: E.diag ? E.diag.outliers : [], normalidadeShapiroP: E.diag ? +E.diag.sw.p.toFixed(4) : null } : (E.modelo && E.modelo.erro ? { erro: E.modelo.erro } : 'não calculado'),
      avaliacao: pr ? { estimativa: pr.central, amplitudeIC: +pr.amplitude.toFixed(4), grauFundamentacao: pr.fundamentacao.grau, grauPrecisao: pr.grauPrecisao, pendenciasGrau: pr.fundamentacao.pendencias } : 'não estimada',
      aviso: E.aviso ? E.aviso.texto : ''
    };
  }
  function desenharDuvidas() {
    let caixa = document.getElementById('duvidas');
    if (!caixa) { caixa = document.createElement('div'); caixa.id = 'duvidas'; document.body.appendChild(caixa); }
    const ligado = Nv.sessao && Nv.sessao.duvidasIA;
    if (!E.duvidasAberto) { caixa.innerHTML = '<button class="duvidas-botao" data-acao="abrirDuvidas">Dúvidas? Pergunte à IA</button>'; return; }
    caixa.innerHTML = '<div class="duvidas-painel"><div class="duvidas-topo"><b>Dúvidas — assistente do preenchimento</b><button class="leve" data-acao="fecharDuvidas">×</button></div>'
      + '<div class="duvidas-msgs">' + (E.duvidas.length ? E.duvidas.map(function (m) { return '<div class="msg ' + (m.papel === 'ia' ? 'ia' : 'eu') + '">' + h(m.texto).replace(/\n/g, '<br>') + '</div>'; }).join('')
        : '<p class="nota">Pergunte sobre qualquer aba: como preencher, por que algo não roda, o que significa um resultado, onde conseguir um dado. A IA vê o estado atual da tela (sem CPF nem telefone). Ela orienta; não preenche nem inventa dado.</p>')
      + (E.perguntando ? '<div class="msg ia">Pensando…</div>' : '') + '</div>'
      + '<div class="duvidas-rodape"><textarea id="duvidaTexto" rows="2" placeholder="Ex.: por que a aba Modelo está vermelha?"></textarea>'
      + '<button class="principal" data-acao="perguntarIA"' + (ligado && !E.perguntando ? '' : ' disabled') + '>Perguntar</button></div>'
      + (ligado ? '' : '<small class="nota">Desligado: falta a chave da IA no servidor.</small>') + '</div>';
    const msgs = caixa.querySelector('.duvidas-msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
  ACOES.abrirDuvidas = function () { E.duvidasAberto = true; desenharDuvidas(); const t = document.getElementById('duvidaTexto'); if (t) t.focus(); };
  ACOES.fecharDuvidas = function () { E.duvidasAberto = false; desenharDuvidas(); };
  ACOES.perguntarIA = async function () {
    const t = document.getElementById('duvidaTexto'), pergunta = (t && t.value || '').trim();
    if (!pergunta) return;
    E.duvidas.push({ papel: 'eu', texto: pergunta }); E.perguntando = true; desenharDuvidas();
    try {
      const r = await Nv.duvida(E.id, pergunta, contextoDuvida(), E.duvidas.slice(0, -1));
      E.duvidas.push({ papel: 'ia', texto: r.resposta });
    } catch (e) { E.duvidas.push({ papel: 'ia', texto: 'Não consegui responder: ' + e.message }); }
    E.perguntando = false; desenharDuvidas();
  };

  // ---------------------------------------------------------------------------
  // Pré-requisitos das ações que RODAM (a aba abre sempre; o cálculo não roda
  // com dado faltando). Cada ação lista as etapas que precisam estar completas.
  // ---------------------------------------------------------------------------
  const PRE_REQUISITOS = {
    calcular: ['projeto', 'variaveis', 'amostras'], buscar: ['projeto', 'variaveis', 'amostras'], treinarRNA: ['projeto', 'variaveis', 'amostras', 'modelo'],
    calcularTudo: ['projeto', 'variaveis'], projetar: ['projeto', 'modelo'],
    laudoWord: ['projeto', 'avaliacao'], laudoPDF: ['projeto', 'avaliacao'], laudoVer: ['projeto', 'avaliacao'], verEstilos: ['projeto', 'avaliacao'],
    exportarPDF: ['projeto', 'avaliacao'], abrirRelatorio: ['projeto', 'avaliacao'], baixarRelatorio: ['projeto', 'avaliacao'],
    exportarExcel: ['projeto'], conferirIA: ['projeto', 'variaveis'], inventariar: ['projeto']
  };
  function faltaParaRodar(acao) {
    const lista = PRE_REQUISITOS[acao];
    if (!lista) return null;
    const sit = INF.Etapas.situacao(E.proj, E);
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    for (let i = 0; i < lista.length; i++) {
      if (soViz && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(lista[i]) >= 0) continue;
      const st = sit[lista[i]];
      if (!st.completa) return 'Não dá para rodar ainda: falta completar ' + INF.Etapas.porAba[lista[i]].rotulo + ' — ' + st.faltas.join('; ') + '. Você pode continuar editando qualquer aba.';
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Ouvintes (delegação)
  // ---------------------------------------------------------------------------
  document.addEventListener('click', function (ev) {
    const aba = ev.target.closest('[data-aba]');
    // Regra: a aba 1 (Projeto) é a ÚNICA obrigatória antes de começar. Completa a aba 1,
    // todas as abas abrem e aceitam dados em qualquer ordem; o que não roda sem dado
    // é o botão de executar (PRE_REQUISITOS).
    if (aba) {
      const sitP = INF.Etapas.situacao(E.proj, E).projeto;
      if (aba.dataset.aba !== 'projeto' && !sitP.completa) {
        E.aba = 'projeto';
        avisar('Para começar, complete a aba 1 (Projeto): falta ' + sitP.faltas.join(', ') + '. Depois todas as abas ficam livres, em qualquer ordem.', 'erro');
        window.scrollTo(0, 0); return;
      }
      E.aba = aba.dataset.aba; E.aviso = null; desenhar(); window.scrollTo(0, 0); return;
    }
    const bt = ev.target.closest('[data-acao]');
    if (bt && ACOES[bt.dataset.acao] && !bt.disabled) {
      ev.preventDefault();
      const falta = faltaParaRodar(bt.dataset.acao);
      if (falta) return avisar(falta, 'erro');
      ACOES[bt.dataset.acao](bt.dataset.arg);
    }
  });

  document.addEventListener('change', function (ev) {
    const el = ev.target;
    const valorDe = function () {
      if (el.type === 'checkbox') return el.checked;
      if (el.hasAttribute('data-bool')) return el.value === 'true';
      if (el.hasAttribute('data-num')) { const n = U.lerNumero(el.value); return Number.isFinite(n) ? n : null; }
      return el.value;
    };

    // campos simples do projeto
    if (el.dataset.bind) {
      const r = resolver(el.dataset.bind);
      r.obj[r.chave] = valorDe();
      mudou(/^(modelo|config\.(fator|aplicar))/.test(el.dataset.bind));
      // redesenha para atualizar os sinais ✓/✗ da aba 1 e das abas
      if (/^projeto\.|^modelo\./.test(el.dataset.bind)) desenhar();
      return;
    }
    // células da grade de amostras
    if (el.dataset.amostra) {
      const a = E.proj.amostras.find(function (x) { return x.id === Number(el.dataset.amostra); });
      const ch = el.dataset.chave;
      if (ch === 'habilitada') a.habilitada = el.checked;
      else if (ch.indexOf('valores.') === 0) a.valores[ch.slice(8)] = valorDe();
      else a[ch] = valorDe();
      mudou(true);
      if (ch === 'habilitada') desenhar();
      return;
    }
    // propriedades de variável
    if (el.dataset.var) {
      const v = E.proj.variaveis.find(function (x) { return x.nome === el.dataset.var; });
      if (el.dataset.escala) {
        let perm = v.permitidas && v.permitidas.length ? v.permitidas.slice() : T.permitidasPorTipo(v.tipo);
        perm = el.checked ? perm.concat([el.dataset.escala]) : perm.filter(function (x) { return x !== el.dataset.escala; });
        v.permitidas = T.LISTA.map(function (t) { return t.id; }).filter(function (id) { return perm.indexOf(id) >= 0; });
        if (!v.permitidas.length) v.permitidas = ['x'];
      } else if (el.dataset.chave === 'codigos') {
        v.codigos = {};
        el.value.split(';').forEach(function (par) { const m = par.split('='); if (m.length === 2 && m[0].trim()) v.codigos[m[0].trim()] = m[1].trim(); });
      } else if (el.dataset.chave === 'tipo') {
        if (el.value === 'dependente' && Rg.dependente(E.proj) && Rg.dependente(E.proj) !== v) { avisar('Já existe uma dependente.', 'erro'); return; }
        v.tipo = el.value; v.permitidas = [];
        if (v.tipo !== 'identificacao' && !E.proj.modelo.transf[v.nome]) E.proj.modelo.transf[v.nome] = 'x';
        desenhar();
      } else v[el.dataset.chave] = el.value;
      mudou(true);
      return;
    }
    // tipo de laudo: âmbito/destino (rádio), objetos (marcar), quesitos e benfeitorias
    if (el.dataset.tl) {
      const t = tipoLaudo(); t[el.dataset.tl] = el.value;
      if (el.dataset.tl === 'ambito' && INF.TiposLaudo.IMOVEIS[el.value].indexOf(t.imovel) < 0) t.imovel = '';
      mudou(false); desenhar(); return;
    }
    if (el.dataset.tlObjeto) {
      const t = tipoLaudo();
      t.objetos = t.objetos.filter(function (o) { return o !== el.dataset.tlObjeto; });
      if (el.checked) t.objetos.push(el.dataset.tlObjeto);
      mudou(false); desenhar(); return;
    }
    if (el.dataset.quesito !== undefined) { tipoLaudo().quesitos[Number(el.dataset.quesito)][el.dataset.chave] = el.value; mudou(false); return; }
    if (el.dataset.benf !== undefined) {
      const b = tipoLaudo().benfeitorias[Number(el.dataset.benf)];
      b[el.dataset.chave] = el.dataset.chave === 'descricao' || el.dataset.chave === 'unidade' ? el.value : U.lerNumero(el.value);
      mudou(false); return;
    }
    // pasta ou arquivos para o inventário: identifica cada arquivo pelo SHA-256
    if ((el.id === 'arqPasta' || el.id === 'arqDocs') && el.files.length) {
      const novos = Array.prototype.slice.call(el.files).filter(function (f) { return !/^(\.|thumbs\.db|desktop\.ini)/i.test(f.name); });
      el.value = '';
      novos.forEach(function (f) {
        const d = { file: f, nome: f.name, caminho: f.webkitRelativePath || f.name, hash: '', status: '' };
        E.docs.push(d);
        hashArquivo(f).then(function (hh) {
          if (E.docs.some(function (x) { return x !== d && x.hash === hh; })) { E.docs.splice(E.docs.indexOf(d), 1); } else d.hash = hh;
          desenhar();
        });
      });
      desenhar(); return;
    }
    // modelo de laudo e estilo 1–20
    if (el.dataset.modelo) { if (el.value) { INF.Modelos.aplicar(E.proj, el.value); mudou(false); desenhar(); } return; }
    if (el.dataset.estilo) { E.proj.laudo = E.proj.laudo || {}; E.proj.laudo.estilo = Number(el.value); mudou(false); desenhar(); return; }
    // print do anúncio de uma amostra da grade
    if (el.dataset.printAmostra && el.files.length) {
      const idA = el.dataset.printAmostra, arq = el.files[0]; el.value = '';
      reduzirImagem(arq).then(function (r) {
        E.proj.fotos = E.proj.fotos || [];
        E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'print:' + idA, legenda: 'Print do anúncio da amostra ' + idA }, r));
        mudou(false); desenhar();
      });
      return;
    }
    if (el.id === 'arqPrintAnuncio' && el.files.length) {
      reduzirImagem(el.files[0]).then(function (r) { E.anuncioPrint = r; desenhar(); });
      el.value = ''; return;
    }
    // campos da vistoria de vizinhança (caminho relativo a proj.vizinhanca)
    if (el.dataset.viz) {
      let o = viz(); const partes = el.dataset.viz.split('.');
      for (let k = 0; k < partes.length - 1; k++) o = o[/^\d+$/.test(partes[k]) ? Number(partes[k]) : partes[k]];
      o[partes[partes.length - 1]] = el.type === 'checkbox' ? el.checked : el.value;
      mudou(false);
      if (el.type === 'checkbox') desenhar();
      return;
    }
    // fotos do laudo
    if (el.dataset.foto) {
      const f = (E.proj.fotos || []).find(function (x) { return x.id === Number(el.dataset.foto); });
      if (f) { f[el.dataset.chave] = el.value; mudou(false); }
      return;
    }
    if ((el.id === 'arqFotos' || el.id === 'arqMapa') && el.files.length) {
      incluirFotos(Array.prototype.slice.call(el.files), el.id === 'arqMapa' ? 'mapa' : document.getElementById('fotoAlvo').value);
      el.value = '';
      return;
    }
    // origem dos dados (modelo híbrido)
    if (el.dataset.acaoMudar === 'origem') { E.proj.config.origemDados = el.value; mudou(false); desenhar(); return; }
    // opções da busca e da RNA
    if (el.dataset.busca) { E.opBusca[el.dataset.busca] = el.value; return; }
    if (el.dataset.rna) { E.opRna[el.dataset.rna] = el.value; return; }
    // mapeamento da importação
    if (el.dataset.mapa !== undefined) {
      const i = Number(el.dataset.mapa), v = el.value;
      E.importacao.mapa[i] = v === 'ignorar' ? { destino: 'ignorar' } : v === 'nova' ? { destino: 'nova' } : { destino: v.split(':')[0], nome: v.split(':').slice(1).join(':') };
      return;
    }
    // arquivo CSV escolhido
    if (el.id === 'arqCSV' && el.files[0]) {
      const leitor = new FileReader();
      leitor.onload = function () {
        const r = Dd.lerCSV(String(leitor.result)); r.linhas = Dd.limparLinhas(r.linhas);
        if (r.linhas.length < 2) return avisar('Planilha vazia.', 'erro');
        E.importacao = { cab: r.linhas[0], linhas: r.linhas.slice(1), mapa: Dd.mapaAutomatico(E.proj, r.linhas[0]) };
        desenhar();
      };
      leitor.readAsText(el.files[0], 'utf-8');
      return;
    }
    // abrir projeto .json do computador
    if (el.id === 'arqProjeto' && el.files[0]) {
      const leitor = new FileReader();
      leitor.onload = function () {
        try {
          const p = JSON.parse(String(leitor.result));
          if (p.formato !== 'inferencia-nbr') throw new Error();
          E.proj = Dd.normalizar(p); E.id = null; guardarId(); limparCalculos(); mudou(false); E.aba = 'projeto'; desenhar();
        } catch (e) { avisar('Arquivo não é um projeto do COON Infer.', 'erro'); }
      };
      leitor.readAsText(el.files[0], 'utf-8');
      el.value = '';
    }
  });

  // Ctrl+V com imagem na aba Pesquisa: vira o print do anúncio em edição
  document.addEventListener('paste', function (ev) {
    if (E.aba !== 'pesquisa' || !E.anuncio) return;
    const item = Array.prototype.slice.call((ev.clipboardData || {}).items || []).find(function (it) { return /^image\//.test(it.type); });
    if (!item) return;
    ev.preventDefault();
    reduzirImagem(item.getAsFile()).then(function (r) { E.anuncioPrint = r; desenhar(); });
  });

  // aviso ao fechar a aba com alteração não salva na nuvem
  window.addEventListener('beforeunload', function (ev) { if (E.sujo && Nv.logado()) { ev.preventDefault(); ev.returnValue = ''; } });

  // ---------------------------------------------------------------------------
  // Partida
  // ---------------------------------------------------------------------------
  Nv.iniciar().then(desenhar);
  desenhar();

  INF.Tela = { estado: E, desenhar: desenhar };
})(globalThis.INF = globalThis.INF || {});
````

## web/js/nuvem.js
<a id="web-js-nuvem-js"></a>

Integrações: [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]

````javascript
/* =============================================================================
   web/js/nuvem.js — conversa da tela com o servidor
   -----------------------------------------------------------------------------
   Toda ida ao servidor passa por aqui. O navegador só fala com o próprio
   servidor do COON (mesmo endereço); quem fala com Supabase, Supadata e a
   API da IA é o servidor, com as chaves guardadas lá.

   Se o servidor não responder (sem internet, por exemplo), a tela continua
   funcionando: o cálculo é todo local e o projeto fica guardado no próprio
   navegador até a conexão voltar.
   ============================================================================= */

(function (INF) {
  'use strict';

  const API = 'api/';          // relativo a /inferencia/
  const Nv = { online: false, sessao: null };

  async function chamar(metodo, rota, corpo) {
    const op = { method: metodo, headers: {}, credentials: 'same-origin' };
    if (corpo !== undefined) { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo); }
    let r;
    try { r = await fetch(API + rota, op); }
    catch (e) { Nv.online = false; throw new Error('Sem conexão com o servidor. O trabalho continua salvo neste navegador.'); }
    Nv.online = true;
    const tipo = r.headers.get('content-type') || '';
    const dados = tipo.indexOf('json') >= 0 ? await r.json() : await r.text();
    if (!r.ok) throw new Error((dados && dados.erro) || ('Erro ' + r.status));
    return dados;
  }

  Nv.iniciar = async function () {
    try { Nv.sessao = await chamar('GET', 'sessao'); }
    catch (e) { Nv.sessao = null; }
    return Nv.sessao;
  };
  Nv.logado = function () { return !!(Nv.sessao && Nv.sessao.usuario); };

  // [SUPABASE] projetos
  Nv.listar = function () { return chamar('GET', 'projetos'); };
  Nv.abrir = function (id) { return chamar('GET', 'projetos/' + id); };
  Nv.salvar = function (id, dados) { return chamar('POST', 'projetos', { id: id, dados: dados }); };
  Nv.excluir = function (id) { return chamar('DELETE', 'projetos/' + id); };

  // [SUPABASE] banco de mercado ("dados do sistema")
  Nv.mercado = function (municipio, tipologia, compartilhadas) {
    return chamar('GET', 'mercado?municipio=' + encodeURIComponent(municipio || '') + '&tipologia=' + encodeURIComponent(tipologia || '') + (compartilhadas ? '&compartilhadas=1' : ''));
  };
  Nv.gravarMercado = function (itens) { return chamar('POST', 'mercado', { itens: itens }); };

  // [SUPADATA] leitura de um anúncio pelo link
  Nv.anuncio = function (link) { return chamar('POST', 'anuncio', { link: link }); };

  // [CLAUDE] conferência das amostras pela IA
  Nv.conferirIA = function (id, dados) { return chamar('POST', 'conferir-ia', { id: id, dados: dados }); };

  // [GOOGLE MAPS] imagem do mapa → "data:image/png;base64,..." para guardar no projeto
  Nv.mapa = async function (tipo, centro, marcadores) {
    let r;
    try { r = await fetch(API + 'mapa', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: tipo, centro: centro, marcadores: marcadores }) }); }
    catch (e) { throw new Error('Sem conexão com o servidor.'); }
    if (!r.ok) { const j = await r.json().catch(function () { return {}; }); throw new Error(j.erro || 'Erro ' + r.status); }
    const blob = await r.blob();
    return new Promise(function (ok) { const f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(blob); });
  };

  // [CLAUDE] inventário de um documento: { nome, mime, base64 } ou { nome, texto }
  // campos = inventário do modelo de laudo (o que a IA deve buscar); modelo = nome do tipo de laudo
  Nv.inventariar = function (id, arquivo, campos, modelo) { return chamar('POST', 'inventario', Object.assign({ id: id, campos: campos, modelo: modelo }, arquivo)); };

  // [CLAUDE] quadro de dúvidas
  Nv.duvida = function (id, pergunta, contexto, historico) { return chamar('POST', 'duvida', { id: id, pergunta: pergunta, contexto: contexto, historico: historico }); };

  INF.Nuvem = Nv;
})(globalThis.INF = globalThis.INF || {});
````

## web/js/teste-app.js
<a id="web-js-teste-app-js"></a>

````javascript
/* =============================================================================
   web/js/teste-app.js — TESTE COMPLETO DO COON INFER (arquivo único)
   -----------------------------------------------------------------------------
   Para o botão "Testar o app" do PAINEL DO ADMINISTRADOR: o botão abre
       /inferencia/?teste=completo
   e este arquivo roda, em sequência, com um projeto de TESTE (dados
   sintéticos; o projeto aberto é guardado e devolvido; nada é baixado,
   aberto ou gravado):
     PARTE 1 — funcionalidade: cada etapa faz a coisa certa (resultado esperado)
     PARTE 2 — botões: clica em todos os botões de todas as abas
     PARTE 3 — layout: botão visível, tamanho de clique, texto sem estourar,
               nada sobreposto, página sem rolagem lateral
   No fim mostra o relatório (✓ aprovado / ✗ com falhas), permite baixar o
   relatório em .json e devolve o resumo ao painel que abriu a janela
   (mensagem "coon-infer-teste"). Também roda por partes:
     ?teste=funcional · ?teste=botoes · ou no Node: node testes/teste-funcional.cjs
   ============================================================================= */

/* ---------------------------------- PARTE 1 ---------------------------------- */
/* =============================================================================
   web/js/teste-funcional.js — APLICADOR DE TESTES DE FUNCIONALIDADE
   -----------------------------------------------------------------------------
   O teste de botões (teste-botoes.js) confere que nada QUEBRA ao clicar.
   Este confere que cada etapa FAZ A COISA CERTA: cada caso monta uma
   situação, executa e compara com o resultado esperado.

   Etapas cobertas: 1 Projeto · 2 Variáveis · 3 Amostras · Pesquisa · 4 Modelo
   · Busca · Rede neural · Ferramentas avançadas · 5 Avaliação e NBR ·
   Inventário · 6 Laudo (17 modelos, 20 estilos, vizinhança) · Exportação ·
   Tela (abas, bloqueios, gráficos sem dados, seletores).

   Onde roda:
     · na tela: botão "Testar o app" (aba Relatório) ou /inferencia/?teste=funcional
     · no Node: node testes/teste-funcional.cjs  (só os casos sem tela)
   Os dados são SINTÉTICOS (não são mercado). O projeto aberto é guardado
   antes e devolvido no fim; nada é baixado, aberto ou gravado.
   ============================================================================= */

(function (INF) {
  'use strict';

  const CASOS = [];
  // caso(etapa, nome, fn, tela?) — fn recebe o verificador "v"
  function caso(etapa, nome, fn, tela) { CASOS.push({ etapa: etapa, nome: nome, fn: fn, tela: !!tela }); }

  // ---- verificador ----
  function Verif() { this.falhas = []; this.n = 0; }
  Verif.prototype.ok = function (cond, msg) { this.n++; if (!cond) this.falhas.push(msg); };
  Verif.prototype.igual = function (a, b, msg) { this.ok(a === b, msg + ' (esperado ' + JSON.stringify(b) + ', veio ' + JSON.stringify(a) + ')'); };
  Verif.prototype.perto = function (a, b, tol, msg) { this.ok(Math.abs(a - b) <= tol, msg + ' (esperado ' + b + ' ± ' + tol + ', veio ' + a + ')'); };

  // ---- dados sintéticos (mesma receita do teste-motor.cjs: R² conhecido) ----
  function projetoSintetico(n) {
    const U = INF.U, r = U.rng(2026);
    const nm = function () { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const p = INF.Dados.novoProjeto();
    Object.assign(p.projeto, { nome: 'TESTE FUNCIONAL', autor: 'Responsável Teste', codigo: 'T-001', imovel: 'Imóvel teste', observacao: 'Dados sintéticos de teste.', municipio: 'Patos de Minas/MG', dataBase: '2026-09-29' });
    ['Area', 'Dist', 'Topo', 'Pav'].forEach(function (nome, i) { INF.Dados.incluirVariavel(p, nome, ['quantitativa', 'quantitativa', 'qualitativa', 'dicotomica'][i]); });
    for (let i = 0; i < (n || 40); i++) {
      const area = 200 + r() * 1800, dist = 0.5 + r() * 12, topo = 1 + Math.floor(r() * 3), pav = r() < 0.6 ? 1 : 0;
      const lnvu = 5.2 + 180 / area - 0.18 * Math.log(dist) + 0.09 * topo + 0.12 * pav + 0.08 * nm();
      INF.Dados.incluirAmostra(p, { natureza: i % 3 === 0 ? 'transacao' : 'oferta', informante: 'Fonte ' + i, link: 'https://exemplo.test/' + i, data: '2026-08-10',
        endereco: 'Rua ' + i, lat: -18.58 + (i % 7) * 0.01, lon: -46.52 + Math.floor(i / 7) * 0.01, valores: { VU: Math.exp(lnvu), Area: area, Dist: dist, Topo: topo, Pav: pav } });
    }
    p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x' };
    p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2, Pav: 1 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
    return p;
  }
  function calcular(p) {
    const m = INF.Regressao.calcular(p, p.modelo.transf), d = INF.Diag.tudo(m);
    const pr = INF.Projecao.projetar(m, [800, 3, 2, 1], { nivel: 0.8, areaAvaliando: 800, item1: 2, item3: 2, considerarIntercepto: true });
    return { m: m, d: d, pr: pr };
  }

  // =========================== ETAPA 1 — PROJETO ===========================
  caso('1. Projeto', 'Projeto novo: aba 1 incompleta, com a lista do que falta', function (v) {
    const s = INF.Etapas.situacao(INF.Dados.novoProjeto(), {});
    v.ok(!s.projeto.completa, 'aba 1 deveria estar incompleta');
    ['responsável técnico', 'código do trabalho', 'identificação do imóvel', 'observação', 'município / UF'].forEach(function (f) { v.ok(s.projeto.faltas.indexOf(f) >= 0, 'deveria faltar: ' + f); });
  });
  caso('1. Projeto', 'Campos obrigatórios preenchidos: aba 1 completa', function (v) {
    v.ok(INF.Etapas.situacao(projetoSintetico(), {}).projeto.completa, 'aba 1 deveria estar completa');
  });
  caso('1. Projeto', 'Só a aba 1 barra o início; o resto roda só com dado', function (v) {
    const p = projetoSintetico(), s = INF.Etapas.situacao(p, {});
    v.ok(s.amostras.completa, 'amostras sintéticas deveriam passar');
    v.ok(!s.modelo.completa, 'modelo ainda não calculado deveria constar como incompleto');
  });

  // =========================== ETAPA 2 — VARIÁVEIS ===========================
  caso('2. Variáveis', 'Nome inválido, repetido e segunda dependente são recusados', function (v) {
    const p = INF.Dados.novoProjeto();
    v.ok(!!INF.Dados.incluirVariavel(p, 'Area total', 'quantitativa'), 'nome com espaço deveria ser recusado');
    v.igual(INF.Dados.incluirVariavel(p, 'Area', 'quantitativa'), null, 'nome válido deveria entrar');
    v.ok(!!INF.Dados.incluirVariavel(p, 'Area', 'quantitativa'), 'nome repetido deveria ser recusado');
    v.ok(!!INF.Dados.incluirVariavel(p, 'VT', 'dependente'), 'segunda dependente deveria ser recusada');
  });
  caso('2. Variáveis', 'Renomear leva junto os valores das amostras e a escala', function (v) {
    const p = projetoSintetico(), antes = p.amostras[0].valores.Area;
    v.igual(INF.Dados.renomearVariavel(p, 'Area', 'Area_m2'), null, 'renomear deveria funcionar');
    v.igual(p.amostras[0].valores.Area_m2, antes, 'valor deveria acompanhar o novo nome');
    v.igual(p.modelo.transf.Area_m2, '1/x', 'escala deveria acompanhar o novo nome');
  });
  caso('2. Variáveis', 'Operar variáveis: VT = VU * Area calcula certo', function (v) {
    const p = projetoSintetico(), a = p.amostras[5];
    const r = INF.Operar.operar(p, 'VT', 'identificacao', 'VU * Area');
    v.igual(r.ok, 40, 'todas as amostras deveriam receber VT');
    v.perto(a.valores.VT, a.valores.VU * a.valores.Area, 1e-6, 'VT = VU × Area');
  });
  caso('2. Variáveis', 'Operar variáveis: funções, comparação e fórmula inválida', function (v) {
    const f = INF.Operar.compilar('ln(x) + raiz(y) * 2 + (x >= 10)');
    v.perto(f({ x: 10, y: 9 }), Math.log(10) + 6 + 1, 1e-12, 'ln, raiz e comparação');
    let erro = null; try { INF.Operar.compilar('x +* 2'); } catch (e) { erro = e.message; }
    v.ok(!!erro, 'fórmula malformada deveria dar erro legível');
  });
  caso('2. Variáveis', 'Fórmula não executa código (sem eval)', function (v) {
    const f = INF.Operar.compilar('alert + constructor');
    v.ok(!Number.isFinite(f({})), 'nomes desconhecidos viram vazio, nunca código');
  });
  caso('2. Variáveis', 'Meses desde o evento e distância ao polo', function (v) {
    const p = projetoSintetico();
    INF.Dados.incluirVariavel(p, 'Meses', 'tempo');
    INF.Dados.preencherTempo(p, 'Meses');
    v.perto(p.amostras[0].valores.Meses, 1.6, 0.1, 'agosto/10 a setembro/29 ≈ 1,6 mês');
    v.igual(p.avaliando.valores.Meses, 0, 'avaliando na data base = 0');
    v.perto(INF.U.distanciaKm(0, 0, 1, 0), 111.19, 0.05, '1 grau de latitude ≈ 111,19 km');
  });

  // =========================== ETAPA 3 — AMOSTRAS ===========================
  caso('3. Amostras', 'Importação: descarta linha "Unnamed" e nota de rodapé; lê aspas e ;', function (v) {
    const csv = '﻿Unnamed: 0;Unnamed: 1;Unnamed: 2\nNº;Informante;Valor (R$/ha)\n1;"Imob; Centro";"20.000,50"\n2;Outra;15000\n;;\nNOTA METODOLÓGICA;;\n';
    const r = INF.Dados.lerCSV(csv), l = INF.Dados.limparLinhas(r.linhas);
    v.igual(r.separador, ';', 'separador');
    v.igual(l.length, 3, 'cabeçalho + 2 linhas');
    v.igual(l[1][1], 'Imob; Centro', 'aspas com ; dentro');
    v.igual(INF.U.lerNumero(l[1][2]), 20000.5, 'número brasileiro');
    v.igual(INF.Dados.dataIso('15/08/2026'), '2026-08-15', 'data dd/mm/aaaa');
  });
  caso('3. Amostras', 'Fator: oferta × 0,90 e transação × 1,00', function (v) {
    const p = projetoSintetico(), o = p.amostras[1], t = p.amostras[0];
    v.perto(INF.Regressao.valorDependente(p, o, 'VU'), o.valores.VU * 0.9, 1e-9, 'oferta com 0,90');
    v.perto(INF.Regressao.valorDependente(p, t, 'VU'), t.valores.VU, 1e-9, 'transação sem fator');
  });
  caso('3. Amostras', 'Oferta só vale com fonte e telefone ou link', function (v) {
    const R = INF.Conferencia.ofertaRastreavel;
    v.ok(!R({ natureza: 'oferta', informante: 'Imob X' }).ok, 'sem telefone e sem link: não vale');
    v.ok(R({ natureza: 'oferta', informante: 'Imob X', link: 'https://a.test' }).ok, 'com link: vale');
    v.ok(R({ natureza: 'oferta', informante: 'Fernando (38) 9.9949-8922' }).ok, 'telefone dentro do informante: vale');
    v.ok(!R({ natureza: 'oferta', informante: 'Não informado', link: 'https://a.test' }).ok, 'sem fonte: não vale');
    v.ok(R({ natureza: 'transacao' }).ok, 'transação não entra na regra');
  });
  caso('3. Amostras', 'Tirar do cálculo as ofertas sem contato e desfazer', function (v) {
    const p = projetoSintetico();
    p.amostras[1].link = ''; p.amostras[2].link = '';
    const ids = INF.Conferencia.desligarSemContato(p);
    v.igual(ids.join(','), '2,3', 'amostras 2 e 3 deveriam sair');
    v.igual(p.amostras[1].habilitada, false, 'fica fora do cálculo');
    INF.Conferencia.desfazer(p, p.historico.length - 1);
    v.igual(p.amostras[2].habilitada, true, 'desfazer devolve a amostra');
  });
  caso('3. Amostras', 'Conferência acha duplicata, valor discrepante, data futura e poucas amostras', function (v) {
    const p = projetoSintetico();
    p.amostras[4].link = p.amostras[3].link;
    p.amostras[6].valores.VU = p.amostras[6].valores.VU * 40;
    p.amostras[7].data = '2027-01-01';
    const c = INF.Conferencia.conferir(p), tem = function (r, id) { return c.some(function (x) { return x.regra === r && (id === undefined || x.amostra === id); }); };
    v.ok(tem('duplicata', 5), 'duplicata pelo link');
    v.ok(tem('discrepante', 7), 'valor muito fora');
    v.ok(tem('futura', 8), 'data depois da data base');
    const q = projetoSintetico(8);
    v.ok(INF.Conferencia.conferir(q).some(function (x) { return x.regra === 'quantidade' && x.nivel === 'erro'; }), '8 amostras para 4 variáveis: abaixo de 3(k+1)');
  });
  caso('3. Amostras', 'Modelo híbrido: sistema, híbrido e só as minhas', function (v) {
    const p = projetoSintetico(), reg = [{ id: 'b1', natureza: 'oferta', preco: 300000, area: 1000, informante: 'Banco', link: 'https://b.test/1', atributos: { Dist: 2, Topo: 3, Pav: 1 } }];
    INF.Conferencia.aplicarOrigem(p, 'hibrido', reg);
    v.igual(p.amostras.length, 41, 'híbrido soma 1 do banco');
    v.perto(p.amostras[40].valores.VU, 300, 1e-9, 'VU do banco = preço ÷ área');
    INF.Conferencia.aplicarOrigem(p, 'sistema', reg);
    v.igual(p.amostras.filter(function (a) { return a.habilitada !== false; }).length, 1, 'só dados do sistema no cálculo');
    INF.Conferencia.aplicarOrigem(p, 'meus', reg);
    v.igual(p.amostras.length, 40, 'só as minhas: tira as do banco');
    v.igual(p.amostras.filter(function (a) { return a.habilitada !== false; }).length, 40, 'as próprias voltam ao cálculo');
  });

  // =========================== PESQUISA ===========================
  caso('Pesquisa de mercado', 'Leitor de anúncio: preço, área, alqueire, m² e telefone', function (v) {
    const E = INF.Pesquisa.extrairAnuncio;
    const a = E('Fazenda 172 ha. R$ 3.440.000. Condomínio R$ 0. Fone (38) 99876-5432');
    v.igual(a.preco, 3440000, 'maior valor em R$'); v.igual(a.area, 172, 'área em ha'); v.igual(a.vu, 20000, 'VU = preço ÷ área'); v.ok(/99876-5432/.test(a.telefone), 'telefone');
    const b = E('Sítio de 10 alqueires, R$ 1,2 milhões');
    v.perto(b.area, 48.4, 1e-9, 'alqueire mineiro = 4,84 ha'); v.igual(b.preco, 1200000, 'R$ 1,2 milhões');
    v.igual(E('Apartamento 85 m², R$ 450.000').area, 85, 'área em m²');
  });

  // =========================== ETAPA 4 — MODELO ===========================
  caso('4. Modelo', 'Regressão confere com a referência (statsmodels)', function (v) {
    const r = calcular(projetoSintetico());
    v.perto(r.m.R2, 0.864663, 1e-6, 'R²'); v.perto(r.m.R2aj, 0.849196, 1e-6, 'R² ajustado'); v.perto(r.m.F, 55.9036, 1e-3, 'F');
    v.igual(r.m.n, 40, 'n'); v.igual(r.m.p, 5, 'parâmetros');
  });
  caso('4. Modelo', 'Escala impossível e variável constante dão erro claro', function (v) {
    const p = projetoSintetico(); p.amostras[0].valores.Dist = 0;
    v.ok(/inválido para a escala/.test(INF.Regressao.calcular(p, p.modelo.transf).erro || ''), 'ln(0) deveria ser recusado');
    const q = projetoSintetico(); q.amostras.forEach(function (a) { a.valores.Pav = 1; });
    v.ok(/singular/i.test(INF.Regressao.calcular(q, q.modelo.transf).erro || ''), 'variável constante deveria dar matriz singular');
  });
  caso('4. Modelo', 'Diagnósticos dentro dos limites', function (v) {
    const d = calcular(projetoSintetico()).d;
    v.ok(d.sw.estatistica > 0 && d.sw.estatistica <= 1, 'W de Shapiro entre 0 e 1');
    v.ok(d.dw > 0 && d.dw < 4, 'Durbin-Watson entre 0 e 4');
    v.ok(d.vif.every(function (x) { return x.vif >= 1; }), 'VIF ≥ 1');
    v.ok(d.proporcoes[0].obtido <= d.proporcoes[1].obtido && d.proporcoes[1].obtido <= d.proporcoes[2].obtido, 'proporções crescentes');
    v.ok(d.prev.R2previsao <= calcular(projetoSintetico()).m.R2, 'R² de previsão ≤ R²');
  });
  caso('4. Modelo', 'Estatística descritiva: mediana e CV', function (v) {
    const d = INF.Diag.descritiva([1, 2, 3, 4, 100]);
    v.igual(d.mediana, 3, 'mediana'); v.igual(d.n, 5, 'n'); v.ok(d.cv > 1, 'CV alto com valor extremo');
  });

  // =========================== BUSCA ===========================
  caso('Busca de modelos', 'Busca exaustiva: combinações, ordem e filtro', async function (v) {
    const p = projetoSintetico();
    const r = await INF.Busca.buscar(p, { criterio: 'R2aj', limite: 50, testarExclusao: true, sigMaxRegressores: 0.3 });
    v.igual(r.totalCombinacoes, 7 * 8 * 8 * 2 * 2, 'combinações = 7 × 8 × 8 × 2 × 2');
    v.ok(r.modelos.length === 50, 'guarda o limite pedido');
    v.ok(r.modelos.every(function (x, i, a) { return i === 0 || a[i - 1].R2aj >= x.R2aj; }), 'ordenado do melhor para o pior');
    v.ok(r.modelos.every(function (x) { return x.sigMax <= 0.3; }), 'todos passam no filtro de Sig');
  });

  // =========================== RNA E AVANÇADO ===========================
  caso('Rede neural', 'Treina, prevê e poda', function (v) {
    const p = projetoSintetico(), rna = INF.RNA.treinar(p, p.modelo.transf, { redes: 3, epocas: 600 });
    v.ok(rna.R2 > 0.3, 'R² da RNA razoável'); v.ok(rna.EMP > 0 && rna.EMP < 0.5, 'erro médio percentual');
    const pod = INF.RNA.podar(rna, 0.1);
    v.ok(pod.poda.neuroniosDepois <= pod.poda.neuroniosAntes, 'poda não aumenta neurônios');
    v.ok(Number.isFinite(INF.RNA.prever(rna, [800, 3, 2, 1]).media), 'prevê o avaliando');
  });
  caso('Ferramentas avançadas', 'Box-Cox, bootstrap, Huber, Moran, DEA, PCA, K-médias, boosting e Monte Carlo', function (v) {
    const p = projetoSintetico(), r = calcular(p), A = INF.Avancado;
    const bc = A.boxCox(r.m); v.ok(bc.lambda >= -2 && bc.lambda <= 2 && bc.ic95[0] <= bc.lambda && bc.lambda <= bc.ic95[1], 'λ dentro do intervalo');
    const bs = A.bootstrap(r.m, [800, 3, 2, 1], { B: 300 }); v.ok(bs.min < bs.central && bs.central < bs.max, 'bootstrap envolve a estimativa');
    v.ok(A.robusta(r.m).coeficientes.length === 5, 'Huber devolve os 5 coeficientes');
    const mo = A.moran(p, r.m); v.ok(mo.p >= 0 && mo.p <= 1, 'p de Moran entre 0 e 1');
    const dea = A.dea(p, ['Area'], ['__dep__']); v.ok(dea.resultado.every(function (x) { return x.eficiencia <= 1 + 1e-9; }) && Math.abs(dea.resultado[0].eficiencia - 1) < 1e-6, 'DEA: máxima = 1, todas ≤ 1');
    const pca = A.pca(r.m); v.perto(pca.componentes[pca.componentes.length - 1].acumulada, 1, 1e-6, 'PCA soma 100%');
    const km = A.kmedias(r.m, 3); v.igual(km.grupos.reduce(function (s, g) { return s + g.amostras.length; }, 0), 40, 'K-médias usa todas as amostras');
    const gb = A.boosting(r.m); v.perto(gb.importancia.reduce(function (s, x) { return s + x.importancia; }, 0), 1, 1e-9, 'importâncias somam 100%');
    const sim = A.simulacao(r.m, [800, 3, 2, 1], { N: 2000 }); v.ok(sim.p10 < sim.p50 && sim.p50 < sim.p90, 'Monte Carlo ordenado');
  });

  // =========================== ETAPA 5 — AVALIAÇÃO ===========================
  caso('5. Avaliação e NBR', 'Intervalos em ordem, amplitude e graus pela norma', function (v) {
    const pr = calcular(projetoSintetico()).pr;
    v.ok(pr.ipMin < pr.icMin && pr.icMin < pr.central && pr.central < pr.icMax && pr.icMax < pr.ipMax, 'predição ⊃ confiança ⊃ central');
    v.perto(pr.amplitude, (pr.icMax - pr.icMin) / pr.central, 1e-12, 'amplitude = (máx − mín) ÷ central');
    v.igual(pr.grauPrecisao, INF.NBR.precisao(pr.amplitude), 'grau de precisão pela Tabela 5');
    v.igual(pr.fundamentacao.pontos, pr.fundamentacao.itens.reduce(function (s, i) { return s + i.pontos; }, 0), 'pontos = soma dos itens');
    v.perto(pr.arbitrioMax / pr.central, 1.15, 1e-12, 'campo de arbítrio +15%');
  });
  caso('5. Avaliação e NBR', 'Tabela 5 e extrapolação', function (v) {
    v.igual(INF.NBR.precisao(0.30), 3, '30% → III'); v.igual(INF.NBR.precisao(0.35), 2, '35% → II'); v.igual(INF.NBR.precisao(0.45), 1, '45% → I'); v.igual(INF.NBR.precisao(0.6), 0, '60% → fora');
    const r = calcular(projetoSintetico());
    v.igual(INF.NBR.extrapolacao(r.m, [800, 3, 2, 1]).grau, 3, 'dentro da amostra: sem extrapolação');
    v.igual(INF.NBR.extrapolacao(r.m, [r.m.faixa[0].max * 3, 3, 2, 1]).grau, 0, 'além de 2× o máximo: não admitida');
  });
  caso('5. Avaliação e NBR', 'Arredondamento até 1% e micronumerosidade', function (v) {
    const a = INF.Projecao.arredondar(187592.11);
    v.ok(Math.abs(a - 187592.11) / 187592.11 <= 0.01, 'arredonda até 1%');
    const p = projetoSintetico(); p.amostras.forEach(function (x, i) { x.valores.Topo = i < 2 ? 3 : 1 + (i % 2); });
    const m = INF.Regressao.calcular(p, p.modelo.transf);
    v.ok(INF.NBR.micronumerosidade(p, m).problemas.some(function (q) { return q.variavel === 'Topo' && q.codigo === '3'; }), 'código com 2 amostras é apontado');
  });

  // =========================== INVENTÁRIO ===========================
  caso('Inventário de documentos', 'Divergência vai ao documento dono; empate sem data fica em aberto', function (v) {
    const tl = INF.TiposLaudo.padrao();
    const inv = { a: { arquivo: 'matricula.pdf', tipo: 'matricula', dados: [{ campo: 'areaDocumento', valor: '172,5 ha', trecho: 'x' }] },
      b: { arquivo: 'ccir.pdf', tipo: 'ccir', dados: [{ campo: 'areaDocumento', valor: '170 ha', trecho: 'y' }] } };
    const f = INF.Inventario.ficha(tl, inv, {}).find(function (x) { return x.campo === 'areaDocumento'; });
    v.igual(f.estado, 'RESOLVIDA', 'resolvida'); v.igual(f.valor, '172,5 ha', 'vale a matrícula');
    const inv2 = { a: { arquivo: 'm1.pdf', tipo: 'matricula', dados: [{ campo: 'matricula', valor: '100', trecho: 'x' }] }, b: { arquivo: 'm2.pdf', tipo: 'matricula', dados: [{ campo: 'matricula', valor: '200', trecho: 'y' }] } };
    v.igual(INF.Inventario.ficha(tl, inv2, {}).find(function (x) { return x.campo === 'matricula'; }).estado, 'NÃO SOLUCIONADA', 'duas matrículas sem data');
    inv2.b.dataDocumento = '2026-09-01'; inv2.a.dataDocumento = '2025-01-01';
    v.igual(INF.Inventario.ficha(tl, inv2, {}).find(function (x) { return x.campo === 'matricula'; }).valor, '200', 'vale a mais recente');
  });
  caso('Inventário de documentos', 'Trava de leitura e checagem de entrega', function (v) {
    const tl = INF.TiposLaudo.padrao();
    const inv = { h: { arquivo: 'a.pdf', tipo: 'matricula', resumo: 'curto', dados: [] } };
    const trava = INF.Inventario.trava([{ nome: 'a.pdf', hash: 'h' }, { nome: 'b.pdf', hash: 'z' }], inv);
    v.ok(trava.some(function (t) { return /resumo raso/.test(t.texto); }), 'resumo raso reprova');
    v.ok(trava.some(function (t) { return t.arquivo === 'b.pdf' && /não lido/.test(t.texto); }), 'documento não lido reprova');
    const ch = INF.Inventario.checagem(INF.Inventario.ficha(tl, inv, {}), trava);
    v.ok(ch.bloqueada && /ENTREGA BLOQUEADA/.test(ch.mensagem), 'entrega bloqueada');
    v.ok(Object.keys(INF.Inventario.COMO_OBTER).length >= 40, 'caminho para conseguir cada dado');
  });

  // =========================== ETAPA 6 — LAUDO ===========================
  caso('6. Laudo completo', 'Os 17 modelos: capítulos do nível, sem "undefined" nem "NaN"', function (v) {
    const base = projetoSintetico(), r = calcular(base);
    INF.Modelos.MODELOS.forEach(function (M) {
      const p = JSON.parse(JSON.stringify(base)); INF.Modelos.aplicar(p, M.id); p.laudo = { estilo: 1 };
      if (M.objetos.indexOf('vizinhanca') >= 0) p.vizinhanca = { obra: { nome: 'Obra' }, imoveis: [{ endereco: 'Rua A', ambientes: [{ nome: 'Sala', anomalias: [] }] }] };
      const l = INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr });
      if (l.erro) { v.ok(false, M.id + ': ' + l.erro); return; }
      const html = INF.Laudo.html(l), h1 = l.blocos.filter(function (b) { return b.t === 'h1'; }).map(function (b) { return b.texto; }).join(' | ');
      v.ok(!/undefined|NaN|\[object Object\]/.test(html.replace(/<[^>]+>/g, ' ')), M.id + ': texto sem "undefined", "NaN" ou objeto cru');
      if (M.nivel === 'simplificado') v.ok(!l.blocos.some(function (b) { return b.t === 'sumario'; }), M.id + ': simplificado sem sumário');
      else v.ok(l.blocos.some(function (b) { return b.t === 'sumario'; }), M.id + ': com sumário');
      if (M.nivel === 'pericial' && M.objetos.indexOf('vizinhanca') < 0) { v.ok(/Respostas aos quesitos/.test(h1), M.id + ': quesitos'); v.ok(/Origem de cada dado/.test(h1), M.id + ': anexo de origem'); }
      if (M.objetos.indexOf('vizinhanca') < 0) v.ok(/Pesquisa de mercado/.test(h1), M.id + ': pesquisa de mercado');
    });
  });
  caso('6. Laudo completo', 'Dado ausente vira [preencher]; valor por extenso', function (v) {
    const p = projetoSintetico(), r = calcular(p); p.laudo = {};
    const html = INF.Laudo.html(INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr }));
    v.ok(/\[preencher: número da matrícula\]/.test(html), 'matrícula ausente sai marcada, não inventada');
    v.igual(INF.Laudo.porExtenso(1180), 'mil cento e oitenta reais', 'extenso 1.180');
    v.igual(INF.Laudo.porExtenso(2000000), 'dois milhões de reais', 'extenso 2 milhões');
    v.igual(INF.Laudo.porExtenso(187592.11), 'cento e oitenta e sete mil quinhentos e noventa e dois reais e onze centavos', 'extenso com centavos');
  });
  caso('6. Laudo completo', 'Contas de servidão, remanescente e liquidação forçada', function (v) {
    const c = INF.TiposLaudo.calcular(Object.assign(INF.TiposLaudo.padrao(), { objetos: ['servidao', 'remanescente', 'liquidacao'], areaFaixa: 12.5, coefServidao: 30, areaRemanescente: 100, percRemanescente: 5, prazoAbsorcao: 12, taxaMensal: 1 }), 235, 188000);
    v.perto(c.servidao.total, 12.5 * 235 * 0.3, 1e-9, 'servidão = VU × área × coef');
    v.perto(c.remanescente.total, 100 * 235 * 0.05, 1e-9, 'remanescente');
    v.perto(c.liquidacao.valor, 188000 / Math.pow(1.01, 12), 1e-6, 'VLF = V ÷ (1 + i)ⁿ');
  });
  caso('6. Laudo completo', 'Os 20 estilos geram Word válido', function (v) {
    const p = projetoSintetico(), r = calcular(p); INF.Modelos.aplicar(p, 'jud_valor'); p.laudo = {};
    for (let n = 1; n <= 20; n++) {
      p.laudo.estilo = n;
      const z = INF.Laudo.docx(INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr }), {});
      v.ok(z[0] === 0x50 && z[1] === 0x4B && z.length > 10000, 'estilo ' + n + ': arquivo Word (ZIP) gerado');
    }
  });

  // =========================== EXPORTAÇÃO ===========================
  caso('Exportação', 'Excel com as abas esperadas', function (v) {
    const p = projetoSintetico(), r = calcular(p);
    const z = INF.Planilha.pastaCompleta({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr });
    const txt = new TextDecoder().decode(z);
    v.ok(z[0] === 0x50 && z[1] === 0x4B, 'arquivo .xlsx (ZIP)');
    ['Amostras', 'Estatística', 'Regressores', 'ANOVA e indicadores', 'Resíduos', 'Fundamentação', 'Projeção'].forEach(function (aba) { v.ok(txt.indexOf('name="' + aba + '"') >= 0, 'aba ' + aba); });
  });

  // =========================== TELA ===========================
  function E() { return INF.Tela.estado; }
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  caso('Tela', 'Aba 1 incompleta leva de volta ao Projeto com aviso', async function (v) {
    E().proj = INF.Dados.novoProjeto(); E().aba = 'projeto'; INF.Tela.desenhar();
    document.querySelector('[data-aba=amostras]').click(); await espera(30);
    v.igual(E().aba, 'projeto', 'continua no Projeto');
    v.ok(/Para começar/.test((document.querySelector('.aviso') || {}).textContent || ''), 'aviso claro do que falta');
    v.ok(document.querySelectorAll('.campo.obrigatorio .sinal-erro').length >= 4, 'sinais vermelhos nos obrigatórios');
  }, true);
  caso('Tela', 'Aba 1 completa: todas as abas abrem e sinais verdes', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'projeto'; INF.Tela.desenhar();
    v.ok(document.querySelectorAll('.campo.obrigatorio .sinal-ok').length >= 6, 'sinais verdes nos obrigatórios');
    for (const b of Array.prototype.slice.call(document.querySelectorAll('.aba'))) {
      const aba = b.dataset.aba; document.querySelector('[data-aba="' + aba + '"]').click(); await espera(15);
      v.igual(E().aba, aba, 'abre a aba ' + aba);
    }
  }, true);
  caso('Tela', 'Calcular não roda com amostras insuficientes', async function (v) {
    E().proj = projetoSintetico(6); E().modelo = null; E().aba = 'modelo'; INF.Tela.desenhar();
    document.querySelector('[data-acao=calcular]').click(); await espera(30);
    v.ok(!E().modelo, 'modelo não foi calculado');
    v.ok(/Não dá para rodar/.test((document.querySelector('.aviso') || {}).textContent || ''), 'aviso do que falta');
  }, true);
  caso('Tela', 'Calcular com dados completos mostra resultado e sinal verde', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'modelo'; INF.Tela.desenhar();
    document.querySelector('[data-acao=calcular]').click(); await espera(40);
    v.ok(E().modelo && !E().modelo.erro, 'modelo calculado');
    v.ok(/0,8647/.test(document.querySelector('.indicadores').textContent), 'R² 0,8647 na tela');
    v.ok(document.querySelector('[data-aba=modelo] .sinal-aba.ok'), 'aba Modelo com ✓ verde');
  }, true);
  caso('Tela', 'Gráficos aparecem mesmo sem dados', async function (v) {
    E().proj = projetoSintetico(); E().modelo = null; E().aba = 'graficos'; INF.Tela.desenhar();
    v.ok(document.querySelectorAll('#conteudo svg').length >= 6, 'molduras dos gráficos na tela');
    v.ok(/sem dados ainda/.test(document.querySelector('#conteudo').textContent), 'aviso "sem dados ainda"');
  }, true);
  caso('Tela', 'Seletor de modelo e de estilo gravam no projeto', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'laudo'; INF.Tela.desenhar();
    const sm = document.querySelector('[data-modelo]'); sm.value = 'jud_servidao_pleno'; sm.dispatchEvent(new Event('change', { bubbles: true })); await espera(20);
    v.igual(INF.TiposLaudo.ler(E().proj).destino, 'judicial', 'modelo aplica o destino');
    const se = document.querySelector('[data-estilo]'); se.value = '7'; se.dispatchEvent(new Event('change', { bubbles: true })); await espera(20);
    v.igual(E().proj.laudo.estilo, 7, 'estilo 7 gravado');
  }, true);

  // ---------------------------------------------------------------------------
  // Execução
  // ---------------------------------------------------------------------------
  INF.TesteFuncional = {
    CASOS: CASOS,
    projetoSintetico: projetoSintetico,
    rodar: async function (opcoes) {
      const op = opcoes || {}, comTela = op.tela !== false && typeof document !== 'undefined' && INF.Tela;
      let guardado = null, orig = null;
      if (comTela) {
        guardado = JSON.stringify(E().proj);
        orig = { salvar: INF.Dados.salvarLocal, baixar: INF.Dados.baixar, open: window.open };
        INF.Dados.salvarLocal = function () { return true; }; INF.Dados.baixar = function () {}; window.open = function () { return null; };
      }
      const res = [];
      for (const c of CASOS) {
        if (c.tela && !comTela) continue;
        const v = new Verif(), t0 = Date.now();
        try { await c.fn(v); } catch (e) { v.falhas.push('exceção: ' + e.message); }
        res.push({ etapa: c.etapa, nome: c.nome, ok: v.falhas.length === 0, verificacoes: v.n, falhas: v.falhas, ms: Date.now() - t0 });
      }
      if (comTela) {
        INF.Dados.salvarLocal = orig.salvar; INF.Dados.baixar = orig.baixar; window.open = orig.open;
        const e = E(); e.proj = INF.Dados.normalizar(JSON.parse(guardado));
        e.modelo = e.diag = e.projecao = e.rna = e.busca = e.conferencia = e.conferenciaIA = null; e.aviso = null; e.aba = 'projeto'; INF.Tela.desenhar();
      }
      const ondeF = []; res.filter(function (r) { return !r.ok; }).forEach(function (r) { if (ondeF.indexOf(r.etapa) < 0) ondeF.push(r.etapa); });
      return { casos: res.length, ok: res.filter(function (r) { return r.ok; }).length, verificacoes: res.reduce(function (s, r) { return s + r.verificacoes; }, 0), resultados: res,
        mensagem: ondeF.length ? 'Precisa de correção em: ' + ondeF.join('; ') + ' — providenciar.' : 'Tudo funcionando.' };
    },
    mostrar: function (r) {
      const esc = INF.U.esc;
      const d = document.createElement('div'); d.className = 'teste-resultado';
      let etapaAtual = '';
      d.innerHTML = '<h2>Teste de funcionalidade: ' + r.ok + ' de ' + r.casos + ' casos certos · ' + r.verificacoes + ' verificações</h2>'
        + '<p class="nota">Dados sintéticos (não são mercado). O seu projeto foi guardado antes e devolvido.</p><table class="tabela"><tbody>'
        + r.resultados.map(function (x) {
          const cab = x.etapa !== etapaAtual ? '<tr><th colspan="3" class="esq">' + esc(x.etapa) + '</th></tr>' : '';
          etapaAtual = x.etapa;
          return cab + '<tr><td><span class="sinal ' + (x.ok ? 'sinal-ok">✓' : 'sinal-erro">✗') + '</span></td><td class="esq">' + esc(x.nome) + (x.falhas.length ? '<small class="fonte">' + x.falhas.map(esc).join('<br>') + '</small>' : '') + '</td><td>' + x.verificacoes + ' verif.</td></tr>';
        }).join('') + '</tbody></table><button class="principal">Fechar</button>';
      d.querySelector('button').addEventListener('click', function () { d.remove(); });
      document.body.appendChild(d);
    }
  };

  if (typeof location !== 'undefined' && /[?&]teste=funcional/.test(location.search)) {
    setTimeout(function () { INF.TesteFuncional.rodar().then(INF.TesteFuncional.mostrar); }, 1200);
  }
})(globalThis.INF = globalThis.INF || {});

/* ---------------------------------- PARTE 2 ---------------------------------- */
/* =============================================================================
   web/js/teste-botoes.js — teste automático de todos os botões da tela
   -----------------------------------------------------------------------------
   Como rodar: abrir  /inferencia/?teste=botoes   (ou chamar
   INF.TesteBotoes.rodar() no console). O resultado aparece numa janela sobre
   a tela e também volta como objeto.

   O que faz:
     1. guarda o projeto aberto (sessionStorage) — ele volta no fim;
     2. monta um projeto de TESTE com dados sintéticos (não é mercado);
     3. em cada aba, clica em TODOS os botões (data-acao), um por um, e anota
        erro de JavaScript, promessa rejeitada ou botão que sumiu;
     4. troca os 17 modelos de laudo e os 20 estilos e gera o laudo de cada;
     5. devolve o projeto original.
   Downloads, janelas novas e impressão são interceptados (nada é baixado,
   aberto ou impresso). Botões que gravam na nuvem ou trocam de projeto são
   pulados de propósito (lista PULAR).
   ============================================================================= */

(function (INF) {
  'use strict';

  const PULAR = ['salvarNuvem', 'meusProjetos', 'abrirDaNuvem', 'excluirDaNuvem', 'recuperarAnterior', 'novo'];
  // estes apagam coisas: rodam por último em cada aba
  const DESTRUTIVOS = ['excluirAmostra', 'excluirVar', 'excluirFoto', 'tirarQuesito', 'tirarBenf', 'vizTirarImovel', 'vizTirarAmbiente', 'vizTirarAnomalia', 'desfazer', 'desligar'];
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  function projetoDeTeste() {
    const U = INF.U, r = U.rng(2026);
    const nm = function () { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const p = INF.Dados.novoProjeto();
    p.projeto.nome = 'TESTE AUTOMÁTICO DE BOTÕES'; p.projeto.autor = 'Responsável Teste'; p.projeto.municipio = 'Patos de Minas/MG';
    p.projeto.codigo = 'TESTE-001'; p.projeto.imovel = 'Imóvel de teste'; p.projeto.observacao = 'Projeto sintético do teste automático de botões (não é mercado).';
    [['Area', 'quantitativa', '-'], ['Dist', 'quantitativa', '-'], ['Topo', 'qualitativa', '+'], ['Pav', 'dicotomica', '+'], ['Meses', 'tempo', '-']].forEach(function (v) {
      INF.Dados.incluirVariavel(p, v[0], v[1]); p.variaveis.find(function (x) { return x.nome === v[0]; }).direcao = v[2];
    });
    for (let i = 0; i < 40; i++) {
      const a = 200 + r() * 1800, d = 0.5 + r() * 12, t = 1 + Math.floor(r() * 3), pv = r() < 0.6 ? 1 : 0;
      INF.Dados.incluirAmostra(p, { natureza: i % 3 ? 'oferta' : 'transacao', informante: 'Imobiliária teste ' + i, telefone: '(34) 99999-00' + String(i).padStart(2, '0'),
        link: 'https://exemplo.test/anuncio/' + i, data: '2026-0' + (1 + i % 8) + '-10', endereco: 'Rua teste ' + i, lat: -18.58 + r() * 0.06, lon: -46.52 + r() * 0.06,
        valores: { VU: Math.exp(5.2 + 180 / a - 0.18 * Math.log(d) + 0.09 * t + 0.12 * pv + 0.08 * nm()), Area: a, Dist: d, Topo: t, Pav: pv, Meses: i % 8 } });
    }
    p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x', Meses: 'fora' };
    p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2, Pav: 1, Meses: 0 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
    p.config.polo = { nome: 'Centro', lat: -18.578, lon: -46.518 };
    p.laudo = { solicitante: 'Solicitante teste', dataVistoria: '2026-09-20', estilo: 1 };
    p.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente', 'vtn', 'liquidacao'], areaFaixa: 12, coefServidao: 30,
      areaRemanescente: 100, percRemanescente: 5, prazoAbsorcao: 12, taxaMensal: 1, quesitos: [{ parte: 'autor', pergunta: 'Qual o valor?', resposta: '' }],
      benfeitorias: [{ descricao: 'Casa', quantidade: 100, unidade: 'm²', unitario: 1500, depreciacao: 20 }] });
    p.vizinhanca = { obra: { nome: 'Obra teste' }, imoveis: [{ endereco: 'Rua A, 90', ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede' }] }] }] };
    // uma foto mínima (1×1) para exercitar legenda/alvo/remover
    p.fotos = [{ id: 1, alvo: 'avaliando', legenda: 'foto teste', largura: 1, altura: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }];
    return p;
  }

  INF.TesteBotoes = {
    rodar: async function () {
      const E = INF.Tela.estado, relatorio = [], erros = [];
      const guardado = JSON.stringify(E.proj);
      sessionStorage.setItem('inferencia-nbr:backup-teste', guardado);
      // interceptações
      const orig = { baixar: INF.Dados.baixar, open: window.open, confirm: window.confirm, prompt: window.prompt, append: document.body.appendChild.bind(document.body), salvar: INF.Dados.salvarLocal };
      const baixados = [], abertos = [], impressos = [];
      INF.Dados.baixar = function (nome, c) { baixados.push({ nome: nome, bytes: c.length || c.size || 0 }); };
      INF.Dados.salvarLocal = function () { return true; };     // não sobrescreve o projeto dele no navegador
      window.open = function (u) { abertos.push(String(u).slice(0, 40)); return null; };
      window.confirm = function () { return true; };
      window.prompt = function () { return 'Renomeada_teste'; };
      document.body.appendChild = function (no) { if (no && no.tagName === 'IFRAME') { impressos.push('impressão'); return no; } return orig.append(no); };
      const aoErro = function (ev) { erros.push(ev.message || String(ev.reason)); };
      window.addEventListener('error', aoErro); window.addEventListener('unhandledrejection', aoErro);

      async function clicar(aba, acao, arg) {
        const n0 = erros.length;
        const sel = '[data-acao="' + acao + '"]' + (arg !== undefined && arg !== null ? '[data-arg="' + String(arg).replace(/"/g, '\\"') + '"]' : '');
        const bt = document.querySelector(sel);
        if (!bt) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'sumiu (ação anterior mudou a tela)' }); return; }
        if (bt.disabled) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'desligado (esperado: falta chave/dado)' }); return; }
        try {
          bt.click();
          await espera(60);
          for (let k = 0; k < 400 && (E.buscando || E.inventariando || E.conferindoIA); k++) await espera(100);
          await espera(40);
          relatorio.push({ aba: aba, acao: acao, arg: arg, status: erros.length > n0 ? 'ERRO: ' + erros.slice(n0).join(' | ') : 'ok' });
        } catch (e) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'ERRO: ' + e.message }); }
      }

      try {
        E.proj = projetoDeTeste(); E.docs.length = 0;
        E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        const abas = Array.prototype.slice.call(document.querySelectorAll('.aba')).map(function (b) { return b.dataset.aba; });
        for (const aba of abas) {
          // projeto novo a cada aba: botões que apagam (ex.: excluir variável) não contaminam as abas seguintes
          E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
          document.querySelector('[data-acao=calcular]').click(); await espera(60);
          document.querySelector('[data-aba=avaliacao]').click(); await espera(30);
          const btProj = document.querySelector('[data-acao=projetar]'); if (btProj) { btProj.click(); await espera(60); }
          document.querySelector('[data-aba="' + aba + '"]').click(); await espera(60);
          if (document.querySelector('.aba.ativa').dataset.aba !== aba) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: a aba não abriu' });
          if (erros.length) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: ' + erros.join(' | ') });
          const lista = Array.prototype.slice.call(document.querySelectorAll('#conteudo [data-acao], .topo [data-acao]'))
            .map(function (b) { return { acao: b.dataset.acao, arg: b.dataset.arg }; })
            .filter(function (x, i, a) { return PULAR.indexOf(x.acao) < 0 && a.findIndex(function (y) { return y.acao === x.acao && y.arg === x.arg; }) === i; })
            // botões repetidos (ex.: 200 "Usar" da busca): 3 de cada tipo bastam
            .filter(function (x, i, a) { return a.slice(0, i).filter(function (y) { return y.acao === x.acao; }).length < 3; });
          const ordem = lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) < 0; }).concat(lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) >= 0; }));
          for (const x of ordem) {
            if (document.querySelector('.aba.ativa') && document.querySelector('.aba.ativa').dataset.aba !== aba) { document.querySelector('[data-aba="' + aba + '"]').click(); await espera(40); }
            await clicar(aba, x.acao, x.arg);
          }
        }
        // 17 modelos × laudo (HTML) e 20 estilos × Word
        E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        document.querySelector('[data-aba=avaliacao]').click(); document.querySelector('[data-acao=projetar]').click(); await espera(60);
        for (const M of INF.Modelos.MODELOS) {
          INF.Modelos.aplicar(E.proj, M.id);
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          const html = l.erro ? '' : INF.Laudo.html(l);
          relatorio.push({ aba: 'modelos', acao: 'laudo ' + M.id, status: l.erro ? 'ERRO: ' + l.erro : (html.length > 5000 ? 'ok (' + Math.round(html.length / 1024) + ' KB)' : 'ERRO: laudo vazio') });
        }
        INF.Modelos.aplicar(E.proj, 'jud_valor');
        for (let n = 1; n <= 20; n++) {
          E.proj.laudo.estilo = n;
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          let st = 'ok';
          try { const z = INF.Laudo.docx(l, {}); if (!(z.length > 10000)) st = 'ERRO: Word pequeno demais'; } catch (e) { st = 'ERRO: ' + e.message; }
          relatorio.push({ aba: 'estilos', acao: 'Word estilo ' + n, status: st });
        }
      } catch (e) {
        relatorio.push({ aba: '(teste)', acao: '(interrompido)', status: 'ERRO: ' + e.message });
      } finally {
        // devolve tudo como estava
        INF.Dados.baixar = orig.baixar; INF.Dados.salvarLocal = orig.salvar; window.open = orig.open; window.confirm = orig.confirm; window.prompt = orig.prompt;
        document.body.appendChild = orig.append;
        window.removeEventListener('error', aoErro); window.removeEventListener('unhandledrejection', aoErro);
        E.proj = INF.Dados.normalizar(JSON.parse(guardado)); E.docs.length = 0;
        E.modelo = E.diag = E.projecao = E.rna = E.busca = E.conferencia = E.conferenciaIA = E.anuncio = E.importacao = null;
        E.aviso = null; E.aba = 'projeto'; INF.Tela.desenhar();
      }
      const falhas = relatorio.filter(function (r) { return /^ERRO/.test(r.status); });
      return { total: relatorio.length, ok: relatorio.filter(function (r) { return /^ok/.test(r.status); }).length, falhas: falhas, relatorio: relatorio,
        interceptados: { downloads: baixados.length, janelas: abertos.length, impressoes: impressos.length }, projetoDevolvido: E.proj.projeto.nome };
    },

    // mostra o resultado numa janela sobre a tela
    mostrar: function (r) {
      const d = document.createElement('div');
      d.className = 'teste-resultado';
      d.innerHTML = '<h2>Teste de botões: ' + r.ok + ' de ' + r.total + ' ok · ' + r.falhas.length + ' falha(s)</h2>'
        + '<p>Interceptados: ' + r.interceptados.downloads + ' downloads, ' + r.interceptados.janelas + ' janelas, ' + r.interceptados.impressoes + ' impressões. Projeto devolvido: ' + INF.U.esc(r.projetoDevolvido) + '.</p>'
        + '<table class="tabela"><thead><tr><th>Aba</th><th>Botão</th><th>Resultado</th></tr></thead><tbody>'
        + r.relatorio.map(function (x) { return '<tr class="' + (/^ERRO/.test(x.status) ? 'outlier' : '') + '"><td>' + INF.U.esc(x.aba) + '</td><td class="esq">' + INF.U.esc(x.acao + (x.arg ? ' (' + x.arg + ')' : '')) + '</td><td class="esq">' + INF.U.esc(x.status) + '</td></tr>'; }).join('')
        + '</tbody></table><button class="principal">Fechar</button>';
      d.querySelector('button').addEventListener('click', function () { d.remove(); });
      document.body.appendChild(d);
    }
  };

  // ?teste=botoes → roda sozinho ao abrir
  if (typeof location !== 'undefined' && /[?&]teste=botoes/.test(location.search)) {
    setTimeout(function () { INF.TesteBotoes.rodar().then(INF.TesteBotoes.mostrar); }, 1200);
  }
})(globalThis.INF = globalThis.INF || {});

/* ----------------------------------------------------------------------------
   PARTE 3 — LAYOUT DOS BOTÕES e EXECUÇÃO COMPLETA (painel do administrador)
   ---------------------------------------------------------------------------- */
(function (INF) {
  'use strict';

  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  // Confere, na aba aberta, o layout de cada botão e da página.
  function conferirLayout(aba) {
    const problemas = [];
    const larguraTela = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > larguraTela + 2) problemas.push('a página rola para o lado (' + document.documentElement.scrollWidth + ' px > ' + larguraTela + ' px)');
    const botoes = Array.prototype.slice.call(document.querySelectorAll('.topo button, .topo .botao, #abas .aba, #conteudo button, #conteudo .botao'))
      .filter(function (b) { return b.offsetParent !== null; });
    botoes.forEach(function (b) {
      const r = b.getBoundingClientRect(), nome = (b.textContent || b.title || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const rotulo = '"' + (nome || b.dataset.acao || '?').slice(0, 40) + '"';
      if (!nome) problemas.push('botão sem texto nem título: ' + (b.dataset.acao || b.outerHTML.slice(0, 60)));
      if (r.height < 22 || r.width < 22) problemas.push('botão pequeno demais para clicar ' + rotulo + ' (' + Math.round(r.width) + '×' + Math.round(r.height) + ')');
      if (b.scrollWidth > b.clientWidth + 3 && getComputedStyle(b).overflow !== 'visible') problemas.push('texto estourando o botão ' + rotulo);
      if (r.right > larguraTela + 2 && !b.closest('.rolagem') && !b.closest('#abas')) problemas.push('botão saindo da tela ' + rotulo);
    });
    // botões da mesma barra não podem se sobrepor
    Array.prototype.slice.call(document.querySelectorAll('.barra, .topo nav, .portais')).forEach(function (barra) {
      const bs = Array.prototype.slice.call(barra.children).filter(function (x) { return x.offsetParent !== null && /BUTTON|LABEL|SELECT|A/.test(x.tagName); }).map(function (x) { return { el: x, r: x.getBoundingClientRect() }; });
      for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i].r, c = bs[j].r;
        if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) {
          problemas.push('elementos sobrepostos: "' + (bs[i].el.textContent || '').trim().slice(0, 25) + '" e "' + (bs[j].el.textContent || '').trim().slice(0, 25) + '"');
        }
      }
    });
    return { aba: aba, botoes: botoes.length, problemas: problemas };
  }

  INF.TesteLayout = {
    rodar: async function () {
      const E = INF.Tela.estado, guardado = JSON.stringify(E.proj);
      const salvar = INF.Dados.salvarLocal; INF.Dados.salvarLocal = function () { return true; };
      const res = [];
      try {
        E.proj = INF.TesteFuncional.projetoSintetico(); E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(40);
        document.querySelector('[data-aba=avaliacao]').click(); await espera(20);
        const bp = document.querySelector('[data-acao=projetar]'); if (bp) { bp.click(); await espera(40); }
        for (const b of Array.prototype.slice.call(document.querySelectorAll('.aba'))) {
          const aba = b.dataset.aba;
          document.querySelector('[data-aba="' + aba + '"]').click(); await espera(40);
          res.push(conferirLayout(aba));
        }
        // quadro de dúvidas aberto também
        const bd = document.querySelector('[data-acao=abrirDuvidas]'); if (bd) { bd.click(); await espera(20); res.push(conferirLayout('quadro de dúvidas')); document.querySelector('[data-acao=fecharDuvidas]').click(); }
      } finally {
        INF.Dados.salvarLocal = salvar;
        E.proj = INF.Dados.normalizar(JSON.parse(guardado)); E.modelo = E.diag = E.projecao = null; E.aviso = null; E.aba = 'projeto'; INF.Tela.desenhar();
      }
      return { abas: res.length, ok: res.filter(function (r) { return !r.problemas.length; }).length, botoes: res.reduce(function (s, r) { return s + r.botoes; }, 0), resultados: res };
    }
  };

  // ---------------------------------------------------------------------------
  // TESTE COMPLETO — é o que o botão do painel do administrador chama
  // (abre /inferencia/?teste=completo). Roda as três partes em sequência,
  // mostra o relatório e devolve o resumo ao painel que abriu a janela.
  // ---------------------------------------------------------------------------
  INF.TesteCompleto = {
    rodar: async function () {
      const t0 = Date.now();
      const func = await INF.TesteFuncional.rodar();
      const lay = await INF.TesteLayout.rodar();
      const bot = await INF.TesteBotoes.rodar();
      const resumo = {
        app: 'COON Infer', versao: INF.VERSAO, quando: new Date().toISOString(), segundos: Math.round((Date.now() - t0) / 1000),
        funcionalidade: { casos: func.casos, ok: func.ok, verificacoes: func.verificacoes, falhas: func.resultados.filter(function (r) { return !r.ok; }).map(function (r) { return r.etapa + ' — ' + r.nome + ': ' + r.falhas.join('; '); }) },
        layout: { abas: lay.abas, ok: lay.ok, botoes: lay.botoes, falhas: lay.resultados.filter(function (r) { return r.problemas.length; }).map(function (r) { return r.aba + ': ' + r.problemas.join('; '); }) },
        botoes: { acoes: bot.total, ok: bot.ok, falhas: bot.falhas.map(function (f) { return f.aba + ' / ' + f.acao + ': ' + f.status; }) }
      };
      resumo.aprovado = !resumo.funcionalidade.falhas.length && !resumo.layout.falhas.length && !resumo.botoes.falhas.length;
      // veredito em uma frase: tudo funcionando, ou onde providenciar correção
      const onde = [];
      func.resultados.filter(function (x) { return !x.ok; }).forEach(function (x) { if (onde.indexOf(x.etapa) < 0) onde.push(x.etapa); });
      lay.resultados.filter(function (x) { return x.problemas.length; }).forEach(function (x) { const t = 'layout da aba ' + x.aba; if (onde.indexOf(t) < 0) onde.push(t); });
      bot.falhas.forEach(function (f) { const t = 'botões da aba ' + f.aba; if (onde.indexOf(t) < 0) onde.push(t); });
      resumo.onde = onde;
      resumo.mensagem = resumo.aprovado ? 'Tudo funcionando.' : 'Precisa de correção em: ' + onde.join('; ') + ' — providenciar.';
      return { resumo: resumo, funcional: func, layout: lay, botoes: bot };
    },
    mostrar: function (r) {
      const esc = INF.U.esc, s = r.resumo;
      const bloco = function (titulo, ok, total, falhas) {
        return '<h3>' + (falhas.length ? '<span class="sinal sinal-erro">✗</span> ' : '<span class="sinal sinal-ok">✓</span> ') + esc(titulo) + ': ' + ok + ' de ' + total + '</h3>'
          + (falhas.length ? '<ul class="achados">' + falhas.map(function (f) { return '<li class="erro">' + esc(f) + '</li>'; }).join('') + '</ul>' : '');
      };
      const d = document.createElement('div'); d.className = 'teste-resultado';
      d.innerHTML = '<h2>' + (s.aprovado ? '<span class="sinal sinal-ok">✓ APROVADO</span>' : '<span class="sinal sinal-erro">✗ COM FALHAS</span>') + ' — teste completo do COON Infer ' + esc(s.versao) + '</h2>'
        + '<div class="comece' + (s.aprovado ? ' ok' : '') + '" style="font-size:17px"><b>' + esc(s.mensagem) + '</b></div>'
        + '<p class="nota">' + new Date(s.quando).toLocaleString('pt-BR') + ' · ' + s.segundos + ' s · dados sintéticos · o projeto aberto foi guardado e devolvido.</p>'
        + bloco('Funcionalidade (casos por etapa)', s.funcionalidade.ok, s.funcionalidade.casos, s.funcionalidade.falhas)
        + bloco('Layout dos botões (abas conferidas)', s.layout.ok, s.layout.abas, s.layout.falhas)
        + bloco('Botões clicados sem erro', s.botoes.acoes - s.botoes.falhas.length, s.botoes.acoes, s.botoes.falhas)
        + (s.botoes.acoes - s.botoes.ok - s.botoes.falhas.length > 0 ? '<p class="nota">' + (s.botoes.acoes - s.botoes.ok - s.botoes.falhas.length) + ' botão(ões) não executaram por motivo esperado: desligados por falta de chave no servidor (IA, Google Maps, Supadata) ou que somem depois de outra ação (ex.: excluir). Não é falha.</p>' : '')
        + '<div class="barra"><button class="principal" data-fechar="1">Fechar</button><button class="leve" data-baixar="1">Baixar relatório (.json)</button></div>';
      d.querySelector('[data-fechar]').addEventListener('click', function () { d.remove(); });
      d.querySelector('[data-baixar]').addEventListener('click', function () {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 1)], { type: 'application/json' }));
        a.download = 'teste-coon-infer-' + s.quando.slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
      });
      document.body.appendChild(d);
    }
  };

  // ?teste=completo → roda sozinho e avisa o painel do administrador (mesma origem)
  if (typeof location !== 'undefined' && /[?&]teste=completo/.test(location.search)) {
    setTimeout(function () {
      INF.TesteCompleto.rodar().then(function (r) {
        INF.TesteCompleto.mostrar(r);
        try { if (window.opener) window.opener.postMessage({ tipo: 'coon-infer-teste', resumo: r.resumo }, location.origin); } catch (e) { /* painel fechado */ }
      });
    }, 1500);
  }
})(globalThis.INF = globalThis.INF || {});
````

## web/landing.html
<a id="web-landing-html"></a>

````html
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>COON Infer — avaliação de imóveis por inferência</title>
<meta name="description" content="Do dado de mercado ao laudo assinado: inferência estatística pela NBR 14.653, laudos em Word e PDF, e nenhum dado sem origem.">
<style>
:root{
  --papel:#FBFAF7; --tinta:#10202B; --suave:#5A6670; --linha:#E4E1DA; --cartao:#FFFFFF;
  --marca:#1F5F8B; --marca-escura:#174868; --marca-clara:#E8F0F6; --acento:#C2410C; --ok:#1E7B45;
  --raio:14px; --largura:1140px;
  color-scheme:light;
}
@media (prefers-color-scheme:dark){
  :root{ --papel:#0E1418; --tinta:#E9EDF0; --suave:#9AA6AF; --linha:#26313A; --cartao:#141C22; --marca:#6BAEDB; --marca-escura:#9CCBEA; --marca-clara:#16242E; --acento:#F08A4B; --ok:#5FC58A; color-scheme:dark; }
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--papel);color:var(--tinta);font:17px/1.6 "Segoe UI Variable Text","Segoe UI",system-ui,-apple-system,Roboto,sans-serif;-webkit-font-smoothing:antialiased}
a{color:inherit}
.faixa{max-width:var(--largura);margin:0 auto;padding:0 24px}
h1,h2,h3{font-family:"Segoe UI Variable Display","Segoe UI",system-ui,sans-serif;letter-spacing:-.02em;line-height:1.1;margin:0}
h1{font-size:clamp(40px,6vw,68px);font-weight:600}
h2{font-size:clamp(30px,4vw,44px);font-weight:600}
h3{font-size:20px;font-weight:600;letter-spacing:-.01em}
p{margin:0}
.sobre{color:var(--suave)}

/* barra do topo */
.topo{position:sticky;top:0;z-index:5;background:color-mix(in srgb,var(--papel) 88%,transparent);backdrop-filter:saturate(1.4) blur(10px);border-bottom:1px solid var(--linha)}
.topo .faixa{display:flex;align-items:center;gap:28px;height:64px}
.marca{font-weight:700;letter-spacing:.02em;text-decoration:none;display:flex;align-items:baseline;gap:8px}
.marca b{color:var(--marca);font-weight:800}
.marca span{font-weight:500;color:var(--tinta)}
.topo nav{display:flex;gap:22px;font-size:15px;margin-left:auto}
.topo nav a{text-decoration:none;color:var(--suave)}
.topo nav a:hover{color:var(--tinta)}
.bt{display:inline-flex;align-items:center;gap:8px;border-radius:999px;padding:12px 22px;font-weight:600;font-size:16px;text-decoration:none;border:1px solid transparent;transition:transform .15s ease,background .15s ease}
.bt:hover{transform:translateY(-1px)}
.bt-cheio{background:var(--marca);color:#fff}
.bt-cheio:hover{background:var(--marca-escura)}
.bt-linha{border-color:var(--linha);color:var(--tinta)}
.bt-pequeno{padding:8px 16px;font-size:14px}

/* abertura */
.abertura{padding:96px 0 56px;text-align:center}
.selo{display:inline-block;font-size:13px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--marca);margin-bottom:22px}
.abertura h1 span{color:var(--marca)}
.abertura .sobre{max-width:640px;margin:22px auto 0;font-size:20px}
.acoes{display:flex;gap:12px;justify-content:center;margin-top:34px;flex-wrap:wrap}

/* tela do produto (desenhada em HTML, sem imagem) */
.vitrine{margin:64px auto 0;max-width:1000px;border:1px solid var(--linha);border-radius:18px;background:var(--cartao);box-shadow:0 30px 80px -30px rgba(16,32,43,.25);overflow:hidden;text-align:left}
.vitrine .janela{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid var(--linha)}
.vitrine .janela i{width:10px;height:10px;border-radius:50%;background:var(--linha)}
.vitrine .abas{display:flex;gap:18px;padding:0 20px;border-bottom:1px solid var(--linha);font-size:13px;color:var(--suave);overflow:hidden;white-space:nowrap}
.vitrine .abas span{padding:12px 0;display:flex;flex-direction:column;align-items:center;gap:2px}
.vitrine .abas span.at{color:var(--marca);border-bottom:2px solid var(--marca);font-weight:600}
.vitrine .abas small{font-size:11px;color:var(--ok);font-weight:700}
.vitrine .corpo{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;padding:22px}
.ind{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
.ind div{background:var(--papel);border-radius:10px;padding:10px 12px}
.ind small{display:block;font-size:11px;color:var(--suave)}
.ind b{font-size:18px}
.eq{font:13px/1.5 Consolas,"Cascadia Mono",monospace;background:var(--papel);border-radius:10px;padding:10px 12px;color:var(--tinta)}
.graus{display:flex;gap:10px;margin-top:14px;font-size:13px;font-weight:600}
.graus span{padding:4px 10px;border-radius:999px;background:color-mix(in srgb,var(--ok) 14%,transparent);color:var(--ok)}
.vitrine svg{width:100%;height:auto;display:block}
.vitrine .eixo{stroke:var(--linha)} .vitrine .pt{fill:var(--marca);opacity:.85} .vitrine .reta{stroke:var(--acento);stroke-width:2;stroke-dasharray:5 4}

/* faixa de confiança */
.provas{border-top:1px solid var(--linha);border-bottom:1px solid var(--linha);margin-top:88px}
.provas .faixa{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding-top:28px;padding-bottom:28px}
.provas b{display:block;font-size:15px}
.provas span{font-size:14px;color:var(--suave)}

/* seções */
section.bloco{padding:112px 0 0}
.cab{max-width:720px}
.cab p{margin-top:16px;font-size:19px}
.tres{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:56px}
.tres .n{font:600 14px/1 system-ui;color:var(--marca);letter-spacing:.08em}
.tres h3{margin:14px 0 10px}
.passos{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:56px;border-top:1px solid var(--linha)}
.passos div{padding:28px 24px 0 0}
.passos b{display:block;font-size:44px;font-weight:300;color:var(--marca);line-height:1}
.passos h3{margin:18px 0 8px;font-size:18px}
.passos p{font-size:15px;color:var(--suave)}
.grade{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--linha);border:1px solid var(--linha);border-radius:var(--raio);overflow:hidden;margin-top:56px}
.grade div{background:var(--cartao);padding:30px 28px}
.grade h3{font-size:17px;margin-bottom:8px}
.grade p{font-size:15px;color:var(--suave)}
.grade svg{width:26px;height:26px;margin-bottom:16px;stroke:var(--marca);fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}

/* regra de ouro */
.regra{margin-top:112px;background:var(--marca-clara);border-radius:24px;padding:72px 56px;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.regra ul{list-style:none;padding:0;margin:0;display:grid;gap:14px}
.regra li{display:flex;gap:12px;font-size:16px}
.regra li::before{content:"";flex:0 0 8px;height:8px;margin-top:9px;border-radius:50%;background:var(--marca)}
.origem{background:var(--cartao);border:1px solid var(--linha);border-radius:14px;padding:18px;font-size:14px}
.origem .l{display:grid;grid-template-columns:1fr 1.4fr;gap:10px;padding:10px 0;border-bottom:1px solid var(--linha)}
.origem .l:last-child{border:0}
.origem small{color:var(--suave)}
.origem mark{background:#FFF1A8;color:#10202B;padding:0 3px;border-radius:3px}

/* modelos */
.modelos{display:flex;flex-wrap:wrap;gap:10px;margin-top:40px}
.modelos span{border:1px solid var(--linha);border-radius:999px;padding:8px 16px;font-size:15px;background:var(--cartao)}

/* perguntas */
.perguntas{margin-top:48px;border-top:1px solid var(--linha)}
details{border-bottom:1px solid var(--linha);padding:22px 0}
summary{cursor:pointer;font-size:18px;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:20px}
summary::after{content:"+";color:var(--marca);font-weight:400;font-size:24px;line-height:1}
details[open] summary::after{content:"–"}
details p{margin-top:12px;color:var(--suave);max-width:760px}

/* chamada final e rodapé */
.final{padding:128px 0;text-align:center}
.final p{max-width:560px;margin:18px auto 0;font-size:19px}
footer{border-top:1px solid var(--linha);padding:36px 0 48px;font-size:14px;color:var(--suave)}
footer .faixa{display:flex;gap:24px;flex-wrap:wrap;align-items:center}
footer .faixa div:last-child{margin-left:auto;display:flex;gap:18px}

@media (max-width:900px){
  .topo nav{display:none}
  .vitrine .corpo,.regra{grid-template-columns:1fr}
  .tres,.grade{grid-template-columns:1fr}
  .passos{grid-template-columns:1fr 1fr;gap:24px}
  .provas .faixa{grid-template-columns:1fr 1fr}
  .regra{padding:40px 24px}
  .abertura{padding-top:64px}
}
@media (max-width:520px){ .passos,.provas .faixa{grid-template-columns:1fr} .ind{grid-template-columns:1fr 1fr} }
@media (prefers-reduced-motion:reduce){ html{scroll-behavior:auto} .bt{transition:none} }
</style>
</head>
<body>

<header class="topo">
  <div class="faixa">
    <a class="marca" href="#"><b>COON</b><span>Infer</span></a>
    <nav aria-label="Seções">
      <a href="#como">Como funciona</a>
      <a href="#recursos">Recursos</a>
      <a href="#laudos">Laudos</a>
      <a href="#perguntas">Perguntas</a>
    </nav>
    <a class="bt bt-cheio bt-pequeno" href="./">Entrar</a>
  </div>
</header>

<main>
  <section class="abertura">
    <div class="faixa">
      <div class="selo">Avaliação de imóveis · ABNT NBR 14.653</div>
      <h1>Do dado de mercado<br>ao <span>laudo assinado.</span></h1>
      <p class="sobre">Inferência estatística conferida, laudo em Word e PDF no seu estilo, e uma regra que não se dobra: nenhum dado sem origem.</p>
      <div class="acoes">
        <a class="bt bt-cheio" href="./">Começar agora</a>
        <a class="bt bt-linha" href="#como">Ver como funciona</a>
      </div>

      <div class="vitrine" aria-label="Tela do COON Infer (ilustração)">
        <div class="janela"><i></i><i></i><i></i></div>
        <div class="abas">
          <span>Projeto<small>✓</small></span><span>Variáveis<small>✓</small></span><span>Amostras<small>✓</small></span>
          <span class="at">Modelo<small>✓</small></span><span>Gráficos<small>·</small></span><span>Avaliação<small>✓</small></span><span>Laudo completo<small>✓</small></span>
        </div>
        <div class="corpo">
          <div>
            <div class="ind">
              <div><small>Amostras</small><b>40</b></div>
              <div><small>R² ajustado</small><b>0,85</b></div>
              <div><small>Sig do modelo</small><b>&lt; 0,01%</b></div>
            </div>
            <div class="eq">ln(VU) = 5,19 + 202,0 × (1/Área) − 0,19 × ln(Dist) + 0,07 × Topo</div>
            <div class="graus"><span>Fundamentação Grau III</span><span>Precisão Grau III</span></div>
          </div>
          <svg viewBox="0 0 300 190" role="img" aria-label="Gráfico de valores observados por estimados">
            <line class="eixo" x1="30" y1="170" x2="290" y2="170"/><line class="eixo" x1="30" y1="10" x2="30" y2="170"/>
            <line class="reta" x1="40" y1="160" x2="280" y2="20"/>
            <circle class="pt" cx="52" cy="150" r="4"/><circle class="pt" cx="70" cy="146" r="4"/><circle class="pt" cx="84" cy="128" r="4"/>
            <circle class="pt" cx="98" cy="132" r="4"/><circle class="pt" cx="112" cy="118" r="4"/><circle class="pt" cx="128" cy="104" r="4"/>
            <circle class="pt" cx="140" cy="110" r="4"/><circle class="pt" cx="156" cy="92" r="4"/><circle class="pt" cx="170" cy="86" r="4"/>
            <circle class="pt" cx="184" cy="74" r="4"/><circle class="pt" cx="198" cy="78" r="4"/><circle class="pt" cx="214" cy="60" r="4"/>
            <circle class="pt" cx="230" cy="52" r="4"/><circle class="pt" cx="246" cy="44" r="4"/><circle class="pt" cx="262" cy="32" r="4"/>
          </svg>
        </div>
      </div>
    </div>
  </section>

  <div class="provas">
    <div class="faixa">
      <div><b>NBR 14.653-1, -2 e -3</b><span>Graus de fundamentação e precisão calculados pela norma.</span></div>
      <div><b>Cálculo conferido</b><span>Resultados batem com o statsmodels, a referência estatística do Python.</span></div>
      <div><b>Nada sem origem</b><span>Cada dado cita documento, página e trecho — ou fica pendente.</span></div>
      <div><b>No navegador</b><span>Sem instalar nada. Funciona no computador e no celular.</span></div>
    </div>
  </div>

  <section class="bloco" id="como">
    <div class="faixa">
      <div class="cab">
        <h2>Quatro passos. O resto é cálculo.</h2>
        <p class="sobre">Você preenche o que só o avaliador sabe. O programa faz as contas, confere a norma e monta o laudo.</p>
      </div>
      <div class="passos">
        <div><b>1</b><h3>Projeto</h3><p>Responsável técnico, código, imóvel e data base. É a única etapa obrigatória antes de começar.</p></div>
        <div><b>2</b><h3>Amostras</h3><p>Lance, importe da planilha, traga do banco de mercado ou cole o anúncio. O print vira prova.</p></div>
        <div><b>3</b><h3>Modelo</h3><p>Um clique testa as combinações de escalas e escolhe o melhor modelo dentro da norma.</p></div>
        <div><b>4</b><h3>Laudo</h3><p>Escolha entre 17 modelos e 20 estilos. Sai em Word e PDF, com capa, sumário e anexos.</p></div>
      </div>
    </div>
  </section>

  <section class="bloco" id="recursos">
    <div class="faixa">
      <div class="cab">
        <h2>Feito para quem assina.</h2>
        <p class="sobre">Cada recurso existe para o laudo aguentar a pergunta mais difícil: de onde saiu este número?</p>
      </div>
      <div class="grade">
        <div>
          <svg viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6"/></svg>
          <h3>Inferência completa</h3>
          <p>Regressão com todas as escalas, busca dos 500 melhores modelos, normalidade, homocedasticidade, Cook, VIF e ANOVA.</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4"/></svg>
          <h3>Inventário de documentos</h3>
          <p>A IA lê a pasta inteira, cada arquivo uma vez, e sugere o preenchimento com página e trecho. Você decide o que entra.</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>
          <h3>Checagem antes de entregar</h3>
          <p>Cada campo aparece como resolvido, não encontrado ou em aberto. Com pendência, a entrega fica bloqueada.</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>
          <h3>Raio e prints</h3>
          <p>Distância de cada amostra ao imóvel, mapa com o raio de referência e ficha de cada oferta com o anúncio.</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>
          <h3>Excel e PDF de verdade</h3>
          <p>Planilha com uma aba por quadro e relatório com todos os gráficos, prontos para anexar.</p>
        </div>
        <div>
          <svg viewBox="0 0 24 24"><path d="M5 5h14v10H9l-4 4z"/><path d="M9 9h6M9 12h4"/></svg>
          <h3>Dúvidas, na hora</h3>
          <p>Pergunte como preencher ou o que significa um resultado. A IA vê a tela e orienta — sem preencher por você.</p>
        </div>
      </div>
    </div>
  </section>

  <div class="faixa">
    <div class="regra">
      <div>
        <h2>Nenhum dado sem origem.</h2>
        <p class="sobre" style="margin-top:16px">É a regra do programa inteiro, escrita no código:</p>
        <ul style="margin-top:24px">
          <li>Cada dado vem de um documento, do levantamento do avaliador ou do cálculo.</li>
          <li>O que falta sai marcado no laudo, com o caminho para conseguir.</li>
          <li>A IA sugere; nada muda sem a sua marcação.</li>
          <li>Divergência entre documentos vai ao documento dono do dado.</li>
        </ul>
      </div>
      <div class="origem" aria-label="Exemplo do anexo de origem dos dados">
        <div class="l"><b>Matrícula</b><span>Certidão_matricula.pdf, p. 1<br><small>"Matrícula nº 33.744 — Livro 2"</small></span></div>
        <div class="l"><b>Área documental</b><span>Certidão_matricula.pdf, p. 2<br><small>"com a área de 172,50 ha"</small></span></div>
        <div class="l"><b>Coeficiente de servidão</b><span>decisão técnica do signatário</span></div>
        <div class="l"><b>ART</b><span><mark>[preencher: emitir a ART no CREA]</mark></span></div>
      </div>
    </div>
  </div>

  <section class="bloco" id="laudos">
    <div class="faixa">
      <div class="cab">
        <h2>O laudo certo para cada trabalho.</h2>
        <p class="sobre">Do parecer simplificado para o cliente ao laudo pericial com quesitos. Cada modelo com o seu nível de detalhe, em 20 estilos de apresentação.</p>
      </div>
      <div class="modelos">
        <span>Particular — valor</span><span>Particular — locação</span><span>Extrajudicial — venda</span><span>Extrajudicial — locação</span>
        <span>Bancário — garantia</span><span>Rural — terra nua e benfeitorias</span><span>Servidão — concessionária</span>
        <span>Judicial — valor</span><span>Judicial — locação</span><span>Judicial — servidão</span><span>Judicial — servidão e pleno domínio</span>
        <span>Desapropriação</span><span>Inventário e partilha</span><span>Parecer de assistente técnico</span><span>Vistoria cautelar de vizinhança</span>
      </div>
    </div>
  </section>

  <section class="bloco" id="perguntas">
    <div class="faixa">
      <div class="cab"><h2>Perguntas frequentes</h2></div>
      <div class="perguntas">
        <details><summary>Preciso instalar alguma coisa?</summary><p>Não. O COON Infer roda no navegador, com o mesmo login dos outros aplicativos COON.</p></details>
        <details><summary>A IA escreve o laudo por mim?</summary><p>Não. Os cálculos são do programa, sempre iguais para os mesmos dados. A IA lê documentos, aponta problemas e responde dúvidas; o que ela sugere só entra quando você marca. O laudo sai na sua voz, com a sua assinatura.</p></details>
        <details><summary>Consigo levar meus dados de outro programa?</summary><p>Sim. Exporte as amostras para planilha (CSV) e importe na aba Amostras; o programa ajuda a ligar cada coluna à variável certa.</p></details>
        <details><summary>Onde ficam os meus projetos?</summary><p>Na nuvem do COON, separados por conta. Documentos com CPF não são guardados; do inventário fica só o resultado da leitura, com a fonte.</p></details>
        <details><summary>Quais critérios da norma o programa usa?</summary><p>Os da ABNT NBR 14.653-2:2011 para fundamentação e precisão, e a NBR 14.653-3 para imóveis rurais. Os limites ficam num bloco único do código, fácil de conferir com o seu exemplar.</p></details>
      </div>
    </div>
  </section>

  <section class="final">
    <div class="faixa">
      <h2>Menos planilha. Mais laudo.</h2>
      <p class="sobre">Entre com a sua conta COON e comece pelo primeiro projeto.</p>
      <div class="acoes"><a class="bt bt-cheio" href="./">Começar agora</a></div>
    </div>
  </section>
</main>

<footer>
  <div class="faixa">
    <div><b style="color:var(--marca)">COON</b> Infer</div>
    <div>Avaliação de imóveis por inferência estatística</div>
    <div><a href="./">Entrar</a><a href="#perguntas">Perguntas</a></div>
  </div>
</footer>

</body>
</html>
````


---

# Servidor (nuvem)

## servidor/conferencia-ia.mjs
<a id="servidor-conferencia-ia-mjs"></a>

Integrações: [CLAUDE]

````javascript
// =============================================================================
// [CLAUDE] servidor/conferencia-ia.mjs — conferência das amostras pela IA
// -----------------------------------------------------------------------------
// Segunda camada da conferência (a primeira são as regras fixas do motor).
// Chama a API da Anthropic pelo servidor, com a chave da COON guardada em
// variável de ambiente. A chave NUNCA vai ao navegador.
//
//   ANTHROPIC_API_KEY = chave da API (só no Railway)
//   INFERENCIA_MODELO_IA = modelo (padrão claude-sonnet-5)
//
// Regras dadas à IA (e conferidas aqui na volta):
//   · aponta e pode PROPOR correção (corrigir campo, desligar amostra,
//     trocar escala), sempre com a evidência; quem aplica é a tela, e só
//     depois que o avaliador autoriza cada uma;
//   · nunca cria amostra nem inventa valor sem evidência nos dados;
//   · cada apontamento cita a amostra (id) e o motivo;
//   · resposta em JSON, que o servidor valida antes de devolver à tela.
// O consumo (tokens de entrada e saída) volta junto, para medir o custo por
// conferência — decisão já registrada para o COON.
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);

// Erro com status 503/422: a tela mostra a mensagem em vez de "falha no servidor".
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

const INSTRUCOES = `Você confere dados de mercado usados em avaliação de imóveis pela ABNT NBR 14.653-2 (inferência estatística).
Recebe o trabalho, as variáveis, as amostras, o modelo de regressão (se já calculado) e os achados das regras automáticas.

Aponte apenas problemas concretos que mereçam conferência do avaliador, por exemplo:
- amostra que não parece do mesmo mercado (tipologia, porte, localização muito diferentes do avaliando e das demais);
- incoerência entre descrição/observação e os códigos lançados;
- valor unitário implausível para o porte ou para a região, comparado às demais amostras;
- sinal de coeficiente contrário ao esperado para a variável, e a provável causa;
- variável candidata a colinearidade ou a código mal escalonado;
- avaliando fora da faixa das amostras em alguma variável.

Para cada apontamento você PODE propor uma correção, que só será aplicada se o avaliador autorizar. Correções permitidas:
- "corrigir": trocar o valor de um campo de uma amostra, SOMENTE quando o valor certo estiver evidente nos próprios dados
  (ex.: erro de digitação de milhar 1.000× maior que o anúncio citado na observação; área lançada em m² numa coluna em ha;
  valor total lançado na coluna de valor unitário quando preço e área estão na observação; código fora da escala declarada).
  Informe em "evidencia" de onde saiu o valor proposto.
- "desligar": tirar a amostra do cálculo (fica guardada), quando não pertence ao mercado do avaliando.
- "escala": trocar a escala de uma variável no modelo (x, 1/x, ln, x2, 1/x2, raiz, 1/raiz, fora).
Proibido: criar amostra; estimar ou arbitrar valor sem evidência nos dados; mexer no avaliando; sugerir valor para o imóvel;
repetir os achados das regras automáticas. Na dúvida, aponte sem correção.
Se não houver problema relevante, devolva a lista vazia.

Responda SOMENTE com JSON neste formato:
{"apontamentos":[{"amostra": <id ou null>, "gravidade": "alta"|"media"|"baixa", "assunto": "<até 6 palavras>", "texto": "<explicação objetiva, até 2 frases>",
   "correcao": null | {"acao": "corrigir"|"desligar"|"escala", "campo": "<nome da variável ou campo>", "de": <valor atual>, "para": <valor proposto>, "evidencia": "<de onde saiu>"}}],
 "parecer": "<até 3 frases sobre a qualidade geral do conjunto>"}`;

export async function conferir(pacote) {
  if (!ativo) throw falha('Conferência por IA desligada: configure ANTHROPIC_API_KEY no servidor.');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 4000,
      system: INSTRUCOES,
      messages: [{ role: 'user', content: 'Dados para conferência (JSON):\n' + JSON.stringify(pacote) }]
    })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));

  const texto = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  const inicio = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let dados;
  try { dados = JSON.parse(texto.slice(inicio, fim + 1)); } catch { throw falha('A IA respondeu fora do formato; tente de novo.'); }

  // validação da volta: só aceita apontamentos de amostras que existem e
  // correções dentro do permitido (a tela ainda pede autorização uma a uma)
  const ids = new Set((pacote.amostras || []).map((a) => a.id));
  const nomesVars = new Set((pacote.variaveis || []).map((v) => v.nome));
  const CAMPOS_TEXTO = new Set(['natureza', 'data', 'endereco', 'bairro']);
  const ESCALAS = new Set(['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz', 'fora']);
  const validarCorrecao = (c, amostra) => {
    if (!c || typeof c !== 'object') return null;
    const evidencia = String(c.evidencia || '').slice(0, 300);
    if (c.acao === 'desligar' && ids.has(amostra)) return { acao: 'desligar', evidencia };
    if (c.acao === 'escala' && nomesVars.has(c.campo) && ESCALAS.has(String(c.para))) {
      return { acao: 'escala', campo: c.campo, de: c.de ?? null, para: String(c.para), evidencia };
    }
    if (c.acao === 'corrigir' && ids.has(amostra) && evidencia) {
      if (nomesVars.has(c.campo) && Number.isFinite(Number(c.para))) {
        return { acao: 'corrigir', campo: c.campo, de: c.de ?? null, para: Number(c.para), evidencia };
      }
      if (CAMPOS_TEXTO.has(c.campo) && typeof c.para === 'string') {
        return { acao: 'corrigir', campo: c.campo, de: c.de ?? null, para: c.para.slice(0, 200), evidencia };
      }
    }
    return null;   // correção fora das regras é descartada; o apontamento continua
  };
  const apontamentos = (Array.isArray(dados.apontamentos) ? dados.apontamentos : [])
    .filter((a) => a && typeof a.texto === 'string')
    .map((a) => {
      const amostra = ids.has(a.amostra) ? a.amostra : null;
      return {
        amostra,
        gravidade: ['alta', 'media', 'baixa'].includes(a.gravidade) ? a.gravidade : 'media',
        assunto: String(a.assunto || '').slice(0, 60),
        texto: String(a.texto).slice(0, 400),
        correcao: validarCorrecao(a.correcao, amostra)
      };
    });

  return {
    apontamentos,
    parecer: String(dados.parecer || '').slice(0, 600),
    modelo: MODELO,
    consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 }
  };
}
````

## servidor/duvidas-ia.mjs
<a id="servidor-duvidas-ia-mjs"></a>

Integrações: [CLAUDE]

````javascript
// =============================================================================
// [CLAUDE] servidor/duvidas-ia.mjs — quadro de dúvidas (assistente do app)
// -----------------------------------------------------------------------------
// O avaliador pergunta ("como preencho a variável de tempo?", "por que a aba
// Modelo está travada?", "o que significa Sig 23%?") e a IA responde olhando:
//   · o MANUAL do app (abaixo) — etapas, abas, regras e cálculos;
//   · o ESTADO ATUAL do preenchimento que a tela manda (aba aberta, o que
//     falta em cada etapa, variáveis, resultados, pendências do laudo).
//
// Limites (conferidos no prompt e no uso):
//   · explica e orienta; NÃO preenche nada e NÃO inventa dado, amostra,
//     valor, coeficiente ou resposta de quesito;
//   · quando falta um dado, diz ONDE e COMO conseguir (documento, órgão);
//   · o contexto não leva CPF nem telefone.
//
//   ANTHROPIC_API_KEY, INFERENCIA_MODELO_IA (padrão claude-sonnet-5)
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

// Manual resumido do programa. As listas vivas (etapas, modelos, campos) são
// acrescentadas pela rota a partir do próprio motor, para nunca desatualizar.
const MANUAL = `Você é o assistente do COON Infer, programa de avaliação de imóveis por inferência estatística
(ABNT NBR 14.653-1, -2 e -3) usado por engenheiros avaliadores e peritos. Responda em português do Brasil, direto,
em poucas frases ou uma lista curta de passos, citando o nome exato da aba, do campo ou do botão.

COMO O PROGRAMA FUNCIONA
- As abas seguem uma sequência obrigatória. Uma aba travada (cadeado) abre quando a etapa anterior fica completa.
  Sinal verde = etapa ou campo correto; vermelho = falta ou erro.
- Aba Projeto: responsável técnico, código, imóvel, observação, tipologia, município e data base são obrigatórios.
  Também ficam aqui o fator de oferta (oferta 0,90; transação 1,00), o nível do IC (80% pela NBR) e o polo valorizante.
- Aba Variáveis: uma dependente (VU, VU_ha ou aluguel) e as independentes. Tipos: quantitativa, dicotômica (0/1),
  proxy, código alocado/ajustado, tempo (meses até a data base, com o botão "Meses desde o evento") e identificação.
  "Operar variáveis" cria colunas por fórmula (ex.: VU = VT / Area).
- Aba Amostras: origem dos dados (só as minhas, só do sistema, híbrido); conferência pelas regras e pela IA (a IA só
  sugere; aplica-se o que o avaliador marcar). Regra da casa: oferta só vale com fonte E telefone ou link; senão sai
  do cálculo. Mínimo 3(k+1) amostras. Print do anúncio por amostra na coluna "Print".
- Aba Pesquisa de mercado: busca nos portais (abre em outra aba), leitura de anúncio pelo link ou pelo texto colado,
  e print colado com Ctrl+V. Não há raspagem automática de portais.
- Aba Modelo: escolher escalas (x, 1/x, ln, x², √x...) e "Calcular", ou "Calcular tudo (automático)", que testa as
  combinações e escolhe a melhor dentro da norma (Grau III → II → I). Mostra R², R² ajustado, F, Sig de cada
  regressor (verde ≤10% Grau III, amarelo ≤20% II, laranja ≤30% I), ANOVA, normalidade, Breusch-Pagan, VIF, Cook.
- Aba Busca de modelos: guarda as 500 melhores combinações; "Usar" aplica uma delas.
- Aba Avaliação e NBR: características do avaliando → estimativa (mediana/média/moda quando y está em ln), IC de 80%,
  campo de arbítrio ±15%, graus de fundamentação (Tabelas 1 e 2 da NBR 14.653-2) e de precisão (Tabela 5).
- Aba Laudo completo: modelo de laudo (17 modelos: particular, extrajudicial, banco, judicial/pericial, vizinhança),
  estilo de apresentação 1 a 20, tipo de laudo, inventário dos documentos pela IA (cada dado com arquivo, página e
  trecho), checagem RESOLVIDA / NÃO ENCONTRADA / NÃO SOLUCIONADA, mapas, fotos e geração em Word e PDF.

CRITÉRIOS DA NORMA USADOS (NBR 14.653-2:2011)
- Item 2: n ≥ 6(k+1) Grau III, 4(k+1) II, 3(k+1) I. Item 5: Sig dos regressores 10/20/30%. Item 6: Sig do F 1/2/5%.
- Precisão: amplitude do IC 80% ≤30% III, ≤40% II, ≤50% I. Micronumerosidade: ≥3 por código até n=30.
- Extrapolação: só uma variável, até 2× o máximo e ½ do mínimo, com variação ≤15% na fronteira (Grau II).

REGRAS QUE VOCÊ NUNCA QUEBRA
- Não invente nem sugira valores de dados: amostras, preços, áreas, coeficientes, respostas de quesitos, datas.
  Se o dado falta, diga onde conseguir (cartório, INCRA/SNCR, SICAR, PJe, prefeitura, CREA, construtora, vistoria).
- Não diga que um campo está preenchido se o contexto mostra que não está.
- Não dê valor de imóvel. Pode explicar como o programa calcula e como interpretar o resultado.
- Se a pergunta for sobre algo que o programa não faz, diga isso com clareza.`;

// historico: [{ papel: 'usuario'|'ia', texto }]   contexto: objeto montado pela tela
export async function responder(pergunta, contexto, historico, listas) {
  if (!ativo) throw falha('Quadro de dúvidas desligado: configure ANTHROPIC_API_KEY no servidor.');
  const texto = String(pergunta || '').trim().slice(0, 2000);
  if (!texto) throw falha('Escreva a dúvida.', 422);
  const msgs = (Array.isArray(historico) ? historico : []).slice(-8)
    .filter((m) => m && m.texto)
    .map((m) => ({ role: m.papel === 'ia' ? 'assistant' : 'user', content: String(m.texto).slice(0, 3000) }));
  // a API exige começar pelo usuário e alternar papéis
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  const limpo = [];
  msgs.forEach((m) => { if (!limpo.length || limpo[limpo.length - 1].role !== m.role) limpo.push(m); });
  if (limpo.length && limpo[limpo.length - 1].role === 'user') limpo.pop();
  limpo.push({ role: 'user', content: 'ESTADO ATUAL DO PREENCHIMENTO (JSON):\n' + JSON.stringify(contexto || {}).slice(0, 30000) + '\n\nMINHA DÚVIDA: ' + texto });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELO, max_tokens: 1500, system: MANUAL + '\n\nLISTAS DO PROGRAMA (atuais):\n' + listas, messages: limpo })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));
  const resposta = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  return { resposta, modelo: MODELO, consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 } };
}
````

## servidor/google-maps.mjs
<a id="servidor-google-maps-mjs"></a>

Integrações: [GOOGLE MAPS]

````javascript
// =============================================================================
// [GOOGLE MAPS] servidor/google-maps.mjs — imagens de mapa para o laudo
// -----------------------------------------------------------------------------
// Usa a Maps Static API do Google (uma imagem PNG por chamada):
//   · 'satelite' → imagem de satélite do imóvel avaliando (zoom de detalhe)
//   · 'situacao' → mapa com o avaliando (A) e os dados de mercado numerados
//
//   GOOGLE_MAPS_CHAVE = chave da API (Google Cloud → APIs → Maps Static API).
//   Restringir a chave ao IP/serviço do servidor. Nunca vai ao navegador.
//
// A imagem volta ao navegador, entra no projeto como foto do tipo "mapa" e
// sai no laudo com a legenda "Imagem: Google". Sem chave, a tela oferece
// inserir um print do mapa, e o laudo usa o mapa esquemático.
// =============================================================================

const CHAVE = process.env.GOOGLE_MAPS_CHAVE || '';
export const ativo = Boolean(CHAVE);

const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });
const coord = (v) => Number.isFinite(Number(v)) && Math.abs(Number(v)) <= 180;

// Devolve { bytes: Buffer, tipo: 'image/png' }
export async function imagem({ tipo, centro, marcadores }) {
  if (!ativo) throw falha('Mapas do Google desligados: configure GOOGLE_MAPS_CHAVE no servidor.');
  if (!centro || !coord(centro.lat) || !coord(centro.lon)) throw falha('Informe latitude e longitude do imóvel.', 422);
  const q = new URLSearchParams({ size: '640x400', scale: '2', language: 'pt-BR', key: CHAVE });
  if (tipo === 'satelite') {
    q.set('maptype', 'satellite');
    q.set('zoom', '16');
    q.set('center', `${centro.lat},${centro.lon}`);
    q.append('markers', `color:red|${centro.lat},${centro.lon}`);
  } else {
    // mapa de situação: o Google enquadra sozinho todos os marcadores
    q.set('maptype', 'roadmap');
    q.append('markers', `color:red|label:A|${centro.lat},${centro.lon}`);
    (Array.isArray(marcadores) ? marcadores : []).slice(0, 60).forEach((m) => {
      if (!coord(m.lat) || !coord(m.lon)) return;
      // o Google só aceita rótulo de 1 caractere; o número vai no anexo
      const rot = String(m.rotulo || '').length === 1 ? `|label:${m.rotulo}` : '';
      q.append('markers', `size:small|color:blue${rot}|${m.lat},${m.lon}`);
    });
  }
  const r = await fetch('https://maps.googleapis.com/maps/api/staticmap?' + q.toString());
  if (!r.ok) throw falha('Google Maps respondeu ' + r.status + '. Confira a chave e se a Maps Static API está ativa.');
  const tipoResp = r.headers.get('content-type') || '';
  if (!tipoResp.startsWith('image/')) throw falha('Google Maps não devolveu imagem. Confira a chave.');
  return { bytes: Buffer.from(await r.arrayBuffer()), tipo: tipoResp };
}
````

## servidor/inventario-ia.mjs
<a id="servidor-inventario-ia-mjs"></a>

Integrações: [CLAUDE]

````javascript
// =============================================================================
// [CLAUDE] servidor/inventario-ia.mjs — inventário dos documentos pela IA
// -----------------------------------------------------------------------------
// O engenheiro anexa a pasta do trabalho (matrícula, CCIR, CAR, processo,
// decreto de servidão, planta, fotos...). A tela manda UM arquivo por vez; a
// IA lê o documento inteiro e devolve:
//   · que documento é (lista fechada de tipos);
//   · um resumo de 1 a 3 frases;
//   · os dados que servem ao laudo, cada um com a página e o trecho de onde
//     saiu (evidência) — matrícula, área, proprietário, processo, quesitos...
//
// Regras:
//   · nada é preenchido direto: a tela mostra como SUGESTÃO e o avaliador
//     marca o que aceita (mesma regra da conferência das amostras);
//   · a IA não inventa: dado que não está no documento não volta;
//   · CPF, RG e dados bancários não voltam — e o servidor ainda apaga
//     qualquer sequência com cara de CPF que escapar;
//   · o documento não é guardado no servidor nem no banco; só o resultado.
//
//   ANTHROPIC_API_KEY, INFERENCIA_MODELO_IA (padrão claude-sonnet-5)
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

export const TIPOS_DOC = [
  'matricula', 'certidao_onus', 'escritura', 'contrato', 'ccir', 'itr', 'car', 'georreferenciamento', 'memorial_descritivo',
  'planta_mapa', 'art_rrt', 'iptu', 'alvara_habitese', 'decreto_utilidade_publica', 'projeto_faixa_servidao',
  'peticao_inicial', 'contestacao', 'decisao_despacho', 'quesitos', 'laudo_anterior', 'parecer_assistente',
  'foto_vistoria', 'anuncio_mercado', 'documento_pessoal', 'outro'
];

// A lista de campos vem do INVENTÁRIO DO MODELO de laudo escolhido
// (motor/20-inventario.js → paraIA). O servidor confere a lista contra o
// catálogo antes de mandar à IA; campo fora do catálogo é descartado.
function instrucoes(campos, modelo) {
  return `Você faz o inventário de documentos para um laudo técnico de imóvel (${modelo || 'avaliação ABNT NBR 14.653'}).
Leia o documento INTEIRO (se for digitalizado, leia como imagem, página por página) e responda SOMENTE com JSON:
{"tipo": um de ${JSON.stringify(TIPOS_DOC)},
 "titulo": "nome curto do documento",
 "dataDocumento": "AAAA-MM-DD (emissão/certidão/assinatura) ou null",
 "resumo": "2 a 4 frases objetivas, com os números principais (áreas, datas, valores, números de registro)",
 "datas": ["AAAA-MM-DD — o que é a data"],
 "dados": [{"campo": id da lista abaixo, "valor": "texto", "pagina": número ou null, "trecho": "trecho literal curto que prova o valor"}],
 "quesitos": [{"parte": "autor|réu|juízo|outro", "pergunta": "texto literal do quesito"}],
 "anomalias": [{"tipo": "fissura|trinca|rachadura|infiltração|destacamento|recalque|outra", "localizacao": "onde", "dimensao": "se visível", "descricao": "o que se vê"}],
 "achados": [{"assunto": "até 6 palavras", "texto": "o que encontrou e por que importa", "pagina": número ou null, "trecho": "trecho literal", "importancia": "alta|media|baixa"}],
 "alertas": ["divergências entre dados do próprio documento ou pontos de atenção"]}

O QUE BUSCAR (inventário deste modelo de laudo — procure cada um):
${campos.map((c) => '- ' + c.id + ': ' + c.descricao).join('\n')}

OUTROS ACHADOS: além da lista, registre em "achados" tudo o que um perito precisaria saber, mesmo que ninguém tenha pedido:
ônus, penhora, hipoteca, usufruto, embargo, área de preservação, litígio, processo citado, divergência de área, construção
irregular, restrição ambiental ou urbanística, risco, prazo, valor citado, fato que muda a avaliação.

Regras:
- Só informe dado que ESTÁ no documento, com o trecho literal. Não deduza, não complete, não estime, não invente.
- Campo que não está no documento não aparece em "dados".
- Áreas e valores: mantenha a unidade e a grafia do documento.
- Nunca devolva CPF, RG, dados bancários ou endereço residencial de pessoas físicas.
- Quesitos: texto literal, na ordem.
- Foto: diga se é foto de vistoria, leia data e coordenadas do carimbo (campos dataVistoria e coordenadas, se pedidos)
  e descreva anomalias visíveis em "anomalias" (sem exagerar o que não se vê).`;
}

const semDocPessoal = (t) => String(t || '')
  .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF removido]')
  .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, (m) => m);   // CNPJ de empresa pode ficar

// arquivo: { nome, mime, base64 } (PDF ou imagem) ou { nome, texto } (txt/csv/kml)
// campos:  [{ id, descricao }] — inventário do modelo (já conferido pela rota)
export async function inventariar(arquivo, campos, modelo) {
  campos = Array.isArray(campos) ? campos : [];
  const ids = new Set(campos.map((c) => c.id));
  if (!ativo) throw falha('Inventário por IA desligado: configure ANTHROPIC_API_KEY no servidor.');
  let bloco;
  if (arquivo.texto !== undefined) bloco = { type: 'text', text: 'Conteúdo do arquivo "' + arquivo.nome + '":\n' + String(arquivo.texto).slice(0, 200000) };
  else if (arquivo.mime === 'application/pdf') bloco = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: arquivo.base64 } };
  else if (/^image\/(jpeg|png|gif|webp)$/.test(arquivo.mime)) bloco = { type: 'image', source: { type: 'base64', media_type: arquivo.mime, data: arquivo.base64 } };
  else throw falha('Formato não lido pela IA: ' + (arquivo.mime || 'desconhecido') + '. Salve em PDF.', 422);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELO, max_tokens: 6000, system: instrucoes(campos, modelo),
      messages: [{ role: 'user', content: [bloco, { type: 'text', text: 'Arquivo: ' + arquivo.nome + '. Faça o inventário.' }] }] })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));
  const texto = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  let j;
  try { j = JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)); } catch { throw falha('A IA respondeu fora do formato; tente de novo.'); }

  // validação da volta
  return {
    arquivo: arquivo.nome,
    tipo: TIPOS_DOC.includes(j.tipo) ? j.tipo : 'outro',
    titulo: semDocPessoal(j.titulo).slice(0, 160),
    resumo: semDocPessoal(j.resumo).slice(0, 700),
    datas: (Array.isArray(j.datas) ? j.datas : []).map((d) => semDocPessoal(d).slice(0, 160)).slice(0, 20),
    dataDocumento: /^\d{4}-\d{2}-\d{2}$/.test(String(j.dataDocumento || '')) ? j.dataDocumento : null,
    // só campos do inventário do modelo, e só com trecho literal como prova
    dados: (Array.isArray(j.dados) ? j.dados : [])
      .filter((d) => d && ids.has(d.campo) && d.valor !== undefined && String(d.valor).trim() && d.trecho)
      .map((d) => ({ campo: d.campo, valor: semDocPessoal(d.valor).slice(0, 600),
        pagina: Number.isFinite(Number(d.pagina)) ? Number(d.pagina) : null, trecho: semDocPessoal(d.trecho).slice(0, 300) })),
    anomalias: (Array.isArray(j.anomalias) ? j.anomalias : []).filter((a) => a && a.descricao)
      .map((a) => ({ tipo: String(a.tipo || 'outra').slice(0, 40), localizacao: String(a.localizacao || '').slice(0, 160), dimensao: String(a.dimensao || '').slice(0, 80), descricao: String(a.descricao).slice(0, 400) })).slice(0, 40),
    achados: (Array.isArray(j.achados) ? j.achados : []).filter((a) => a && a.texto)
      .map((a) => ({ assunto: semDocPessoal(a.assunto).slice(0, 80), texto: semDocPessoal(a.texto).slice(0, 600), pagina: Number.isFinite(Number(a.pagina)) ? Number(a.pagina) : null,
        trecho: semDocPessoal(a.trecho || '').slice(0, 300), importancia: ['alta', 'media', 'baixa'].includes(a.importancia) ? a.importancia : 'media' })).slice(0, 30),
    quesitos: (Array.isArray(j.quesitos) ? j.quesitos : []).filter((q) => q && q.pergunta)
      .map((q) => ({ parte: String(q.parte || '').slice(0, 40), pergunta: semDocPessoal(q.pergunta).slice(0, 2000) })).slice(0, 80),
    alertas: (Array.isArray(j.alertas) ? j.alertas : []).map((a) => semDocPessoal(a).slice(0, 400)).slice(0, 20),
    modelo: MODELO,
    consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 }
  };
}
````

## servidor/rotas-inferencia.mjs
<a id="servidor-rotas-inferencia-mjs"></a>

Integrações: [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]

````javascript
// =============================================================================
// servidor/rotas-inferencia.mjs — rotas do COON Infer
// -----------------------------------------------------------------------------
// Este arquivo é o "módulo plugável". Ele exporta uma função só:
//
//     tratarInferencia(req, res, url, sessao)  → true se atendeu a rota
//
// Dois jeitos de usar:
//   1) Dentro do servidor do COON (login único): no server.mjs de lá,
//      antes do 404, acrescentar:
//          import { tratarInferencia } from './inferencia/servidor/rotas-inferencia.mjs';
//          if (await tratarInferencia(req, res, url, sessao)) return;
//      A sessão já vem pronta do login do COON.
//   2) Sozinho: servidor/server.mjs (para testar ou subir separado).
//
// Tudo fica debaixo de /inferencia/ :
//   /inferencia/                 → tela (web/index.html)
//   /inferencia/motor/*.js       → motor estatístico (o mesmo que roda aqui)
//   /inferencia/api/...          → API JSON (exige sessão)
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as banco from './supabase.mjs';     // [SUPABASE]
import * as supadata from './supadata.mjs';  // [SUPADATA]
import * as ia from './conferencia-ia.mjs';   // [CLAUDE]
import * as gmaps from './google-maps.mjs';   // [GOOGLE MAPS]
import * as inventario from './inventario-ia.mjs';   // [CLAUDE] inventário de documentos
import * as duvidas from './duvidas-ia.mjs';         // [CLAUDE] quadro de dúvidas

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_WEB = path.join(RAIZ, 'web');
const PASTA_MOTOR = path.join(RAIZ, 'motor');
const PREFIXO = '/inferencia';
const LIMITE_CORPO = 25 * 1024 * 1024;    // 25 MB por requisição (projeto com fotos da vistoria)

// ---------------------------------------------------------------------------
// Carrega o motor no servidor: os mesmos arquivos que o navegador usa.
// ---------------------------------------------------------------------------
const ARQUIVOS_MOTOR = (await fs.readdir(PASTA_MOTOR)).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
for (const f of ARQUIVOS_MOTOR) await import(pathToFileURL(path.join(PASTA_MOTOR, f)).href);
const INF = globalThis.INF;

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};

// Cabeçalhos de segurança em toda resposta. CSP: só scripts do próprio site.
function seguranca(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self' blob:; frame-ancestors 'self'");
}

function json(res, status, obj) {
  seguranca(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

async function lerCorpo(req) {
  let tam = 0; const partes = [];
  for await (const p of req) {
    tam += p.length;
    if (tam > LIMITE_CORPO) throw Object.assign(new Error('Arquivo grande demais.'), { status: 413 });
    partes.push(p);
  }
  const t = Buffer.concat(partes).toString('utf8');
  return t ? JSON.parse(t) : {};
}

// Arquivos estáticos, sem deixar escapar da pasta (bloqueia "../").
async function servirArquivo(res, pasta, relativo) {
  const alvo = path.resolve(pasta, '.' + path.sep + relativo);
  if (!alvo.startsWith(pasta + path.sep) && alvo !== pasta) return false;
  try {
    const dados = await fs.readFile(alvo);
    seguranca(res);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(alvo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(dados);
    return true;
  } catch { return false; }
}

// Resumo do cálculo que vai para a lista de projetos.
function resumir(dados) {
  try {
    const m = INF.Regressao.calcular(dados, dados.modelo.transf);
    if (m.erro) return null;
    return { n: m.n, k: m.p - 1, R2: m.R2, R2aj: m.R2aj, sigF: m.sigF, equacao: m.equacao };
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Roteador
// ---------------------------------------------------------------------------
export async function tratarInferencia(req, res, url, sessao) {
  const p = url.pathname;
  if (p !== PREFIXO && !p.startsWith(PREFIXO + '/')) return false;

  try {
    // ---- páginas e arquivos -------------------------------------------------
    if (p === PREFIXO) { res.writeHead(302, { Location: PREFIXO + '/' }); res.end(); return true; }
    if (!p.startsWith(PREFIXO + '/api/')) {
      const rel = decodeURIComponent(p.slice(PREFIXO.length + 1)) || 'index.html';
      if (rel.startsWith('motor/')) { if (await servirArquivo(res, PASTA_MOTOR, rel.slice(6))) return true; }
      else if (await servirArquivo(res, PASTA_WEB, rel)) return true;
      json(res, 404, { erro: 'Não encontrado.' }); return true;
    }

    // ---- API ------------------------------------------------------------------
    const rota = p.slice((PREFIXO + '/api/').length);
    const metodo = req.method;

    if (rota === 'sessao') {
      return json(res, 200, {
        usuario: sessao ? { nome: sessao.nome, email: sessao.email } : null,
        banco: banco.ativo ? 'supabase' : 'local', leituraLink: supadata.ativo, conferenciaIA: ia.ativo, mapasGoogle: gmaps.ativo, inventarioIA: inventario.ativo, duvidasIA: duvidas.ativo, versaoMotor: INF.VERSAO
      }), true;
    }
    if (!sessao) return json(res, 401, { erro: 'Faça login para continuar.' }), true;
    const email = sessao.email;

    // [SUPABASE] lista / abre / salva / exclui projetos
    if (rota === 'projetos' && metodo === 'GET') return json(res, 200, await banco.listarProjetos(email)), true;
    let m = rota.match(/^projetos\/([0-9a-f-]{36})$/i);
    if (m && metodo === 'GET') {
      const pr = await banco.abrirProjeto(email, m[1]);
      return json(res, pr ? 200 : 404, pr || { erro: 'Projeto não encontrado.' }), true;
    }
    if (m && metodo === 'DELETE') {
      await banco.excluirProjeto(email, m[1]);
      await banco.auditar(email, m[1], 'excluiu projeto');
      return json(res, 200, { ok: true }), true;
    }
    if (rota === 'projetos' && metodo === 'POST') {
      const b = await lerCorpo(req);
      if (!b.dados || b.dados.formato !== 'inferencia-nbr') return json(res, 400, { erro: 'Projeto em formato inválido.' }), true;
      const dados = INF.Dados.normalizar(b.dados);
      const id = await banco.salvarProjeto(email, b.id || null, dados, resumir(dados));
      await banco.auditar(email, id, 'salvou projeto', { amostras: dados.amostras.length });
      return json(res, 200, { id }), true;
    }

    // cálculo no servidor (mesmo motor) — para integrações e conferência
    if (rota === 'calcular' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, b.transf || dados.modelo.transf);
      if (mod.erro) return json(res, 422, { erro: mod.erro }), true;
      const d = INF.Diag.tudo(mod);
      return json(res, 200, {
        equacao: mod.equacao, n: mod.n, k: mod.p - 1, b: mod.b, t: mod.t, sig: mod.sig,
        R2: mod.R2, R2aj: mod.R2aj, F: mod.F, sigF: mod.sigF,
        normalidade: { shapiro: d.sw, lilliefors: d.ks, jarqueBera: d.jb }, breuschPagan: d.bp, durbinWatson: d.dw,
        outliers: d.outliers, influentes: d.influentes
      }), true;
    }

    // relatório gerado no servidor (idêntico ao da tela)
    if (rota === 'relatorio' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, dados.modelo.transf);
      if (mod.erro) return json(res, 422, { erro: mod.erro }), true;
      const valores = mod.indep.map((v) => INF.U.lerNumero(dados.avaliando.valores[v.nome]));
      const projecao = INF.Projecao.projetar(mod, valores, {
        nivel: dados.config.nivelIC, estimativa: dados.config.estimativaLn, areaAvaliando: dados.avaliando.area,
        item1: dados.config.item1, item3: dados.config.item3, considerarIntercepto: dados.config.considerarIntercepto
      });
      const html = INF.Relatorio.gerar({ proj: dados, modelo: mod, diag: INF.Diag.tudo(mod), projecao });
      seguranca(res);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
      return true;
    }

    // [SUPADATA] lê um anúncio pelo link e extrai os dados
    if (rota === 'anuncio' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const { texto, titulo } = await supadata.lerAnuncio(String(b.link || ''));
      const dados = INF.Pesquisa.extrairAnuncio(titulo + '\n' + texto, String(b.link || ''));
      await banco.auditar(email, null, 'leu anúncio', { link: b.link });
      return json(res, 200, { ...dados, titulo }), true;
    }

    // [SUPABASE] banco de mercado pessoal
    if (rota === 'mercado' && metodo === 'GET') {
      return json(res, 200, await banco.listarMercado(email, url.searchParams.get('municipio') || '', url.searchParams.get('tipologia') || '',
        url.searchParams.get('compartilhadas') === '1')), true;
    }
    if (rota === 'mercado' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const itens = (Array.isArray(b.itens) ? b.itens : []).slice(0, 500).map((i) => ({
        natureza: i.natureza === 'transacao' ? 'transacao' : 'oferta',
        tipologia: String(i.tipologia || ''), municipio: String(i.municipio || ''), uf: String(i.uf || ''),
        endereco: String(i.endereco || ''), bairro: String(i.bairro || ''), informante: String(i.informante || ''),
        telefone: String(i.telefone || ''), link: String(i.link || ''), data_evento: i.data || null,
        preco: Number.isFinite(+i.preco) ? +i.preco : null, area: Number.isFinite(+i.area) ? +i.area : null,
        unidade_area: String(i.unidadeArea || ''), lat: Number.isFinite(+i.lat) ? +i.lat : null, lon: Number.isFinite(+i.lon) ? +i.lon : null,
        atributos: i.atributos && typeof i.atributos === 'object' ? i.atributos : {}, origem: String(i.origem || 'manual'),
        compartilhado: i.compartilhado === true
      }));
      return json(res, 200, { gravados: await banco.gravarMercado(email, itens) }), true;
    }

    // [CLAUDE] conferência das amostras pela IA (só aponta, nunca altera)
    if (rota === 'conferir-ia' && metodo === 'POST') {
      if (!ia.ativo) return json(res, 503, { erro: 'Conferência por IA desligada: configure ANTHROPIC_API_KEY no servidor.' }), true;
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, dados.modelo.transf);
      const regras = INF.Conferencia.conferir(dados);
      const resultado = await ia.conferir(INF.Conferencia.pacoteParaIA(dados, mod, regras));
      await banco.auditar(email, b.id || null, 'conferência por IA', { modelo: resultado.modelo, consumo: resultado.consumo, apontamentos: resultado.apontamentos.length });
      return json(res, 200, resultado), true;
    }

    // [CLAUDE] inventário de UM documento (a tela manda um por vez).
    // O arquivo não é gravado em lugar nenhum; só o resultado volta.
    if (rota === 'inventario' && metodo === 'POST') {
      const b = await lerCorpo(req);
      // inventário do modelo: só ids que existem no catálogo e são de documento
      const campos = (Array.isArray(b.campos) ? b.campos : []).filter((c) => c && INF.Inventario.porId[c.id] && INF.Inventario.porId[c.id].quem === 'documento')
        .map((c) => ({ id: c.id, descricao: INF.Inventario.rotulo(c.id) + ' — ' + (INF.Inventario.porId[c.id].desc || '') }));
      const res2 = await inventario.inventariar({ nome: String(b.nome || 'arquivo'), mime: String(b.mime || ''), base64: b.base64, texto: b.texto }, campos, String(b.modelo || '').slice(0, 200));
      await banco.auditar(email, b.id || null, 'inventário de documento', { arquivo: res2.arquivo, tipo: res2.tipo, consumo: res2.consumo });
      return json(res, 200, res2), true;
    }

    // [CLAUDE] quadro de dúvidas: a IA orienta o preenchimento olhando o manual e o estado da tela
    if (rota === 'duvida' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const listas = 'Etapas: ' + INF.Etapas.ETAPAS.map((x) => x.rotulo + (x.obrigatoria ? ' (obrigatória)' : ' (apoio)')).join('; ')
        + '\nModelos de laudo: ' + INF.Modelos.MODELOS.map((m) => m.nome + ' [' + m.nivel + ']').join('; ')
        + '\nEstilos: ' + INF.Estilos.LISTA.map((e) => e.numero + ' ' + e.nome).join('; ')
        + '\nDados que a IA do inventário busca (por modelo): ' + INF.Inventario.CAMPOS.map((c) => c.rotulo + ' (' + c.quem + ')').join('; ');
      const r2 = await duvidas.responder(b.pergunta, b.contexto, b.historico, listas);
      await banco.auditar(email, b.id || null, 'dúvida à IA', { consumo: r2.consumo });
      return json(res, 200, r2), true;
    }

    // [GOOGLE MAPS] imagem de satélite ou mapa de situação para o laudo
    if (rota === 'mapa' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const img = await gmaps.imagem({ tipo: b.tipo, centro: b.centro, marcadores: b.marcadores });
      seguranca(res);
      res.writeHead(200, { 'Content-Type': img.tipo, 'Cache-Control': 'no-store' });
      res.end(img.bytes);
      return true;
    }

    return json(res, 404, { erro: 'Rota inexistente.' }), true;
  } catch (e) {
    const status = e.status || (e instanceof SyntaxError ? 400 : 500);
    // não devolve detalhe interno ao navegador em erro 500
    json(res, status, { erro: status === 500 ? 'Falha no servidor. Tente de novo.' : e.message });
    if (status === 500) console.error('[inferencia]', e);
    return true;
  }
}
````

## servidor/server.mjs
<a id="servidor-server-mjs"></a>

````javascript
// =============================================================================
// servidor/server.mjs — servidor independente do COON Infer
// -----------------------------------------------------------------------------
// Sobe o módulo sozinho (Railway, ou no PC para testar). Zero dependências:
// só Node 20+.
//
// De onde vem o login (quem é o usuário):
//   · COON_HUB_URL definido (ex.: https://app.copontoon.com): repassa o
//     cookie do navegador para  COON_HUB_URL/api/sessao  e usa o usuário
//     que o login único do COON devolver. Só entra quem tiver o app
//     "inferencia" liberado na conta.
//   · INFERENCIA_DEV=1: modo de teste no PC, usuário fixo "teste@local".
//     Recusado se estiver rodando no Railway.
//   · nenhum dos dois: API responde 401 (tela abre, mas pede login).
//
// Variáveis de ambiente (Railway → Variables):
//   PORT, COON_HUB_URL, SUPABASE_URL, SUPABASE_CHAVE, SUPADATA_CHAVE
// =============================================================================

import http from 'node:http';
import { tratarInferencia } from './rotas-inferencia.mjs';

const PORTA = Number(process.env.PORT) || 8795;
const HUB = (process.env.COON_HUB_URL || '').replace(/\/+$/, '');
const NA_NUVEM = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const DEV = process.env.INFERENCIA_DEV === '1' && !NA_NUVEM;

// Guarda por 60 s a resposta do hub para não consultar a cada clique.
const cache = new Map();

async function sessaoDe(req) {
  if (DEV) return { email: 'teste@local', nome: 'Teste local' };
  if (!HUB) return null;
  const cookie = req.headers.cookie || '';
  if (!/coon_sessao=/.test(cookie)) return null;
  const guardado = cache.get(cookie);
  if (guardado && guardado.expira > Date.now()) return guardado.sessao;
  try {
    const r = await fetch(HUB + '/api/sessao', { headers: { cookie } });
    const j = await r.json();
    const u = j && j.usuario;
    const liberado = u && (u.admin || (Array.isArray(u.apps) && u.apps.some((a) => (a.codigo || a) === 'inferencia')));
    const sessao = liberado && u.situacao !== 'expirado' ? { email: u.email, nome: u.nome } : null;
    cache.set(cookie, { sessao, expira: Date.now() + 60000 });
    return sessao;
  } catch {
    return null;
  }
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // healthcheck do Railway
  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, app: 'inferencia', ts: Date.now() }));
  }
  if (url.pathname === '/') { res.writeHead(302, { Location: '/inferencia/' }); return res.end(); }
  const sessao = url.pathname.startsWith('/inferencia/api/') ? await sessaoDe(req) : null;
  if (await tratarInferencia(req, res, url, sessao)) return;
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Não encontrado');
});

// No PC escuta só na própria máquina; na nuvem, em todas as interfaces.
servidor.listen(PORTA, NA_NUVEM ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`COON Infer em http://localhost:${PORTA}/inferencia/  (${DEV ? 'modo teste' : HUB ? 'login pelo hub ' + HUB : 'sem login configurado'})`);
});
````

## servidor/supabase.mjs
<a id="servidor-supabase-mjs"></a>

Integrações: [SUPABASE]

````javascript
// =============================================================================
// [SUPABASE] servidor/supabase.mjs — acesso ao banco do COON
// -----------------------------------------------------------------------------
// Mesmo jeito do RAE Pericial: API REST do Supabase chamada SÓ pelo servidor,
// com a chave secreta lida de variável de ambiente (nunca vai ao navegador,
// nunca fica no código nem no Git).
//
//   SUPABASE_URL    = https://<projeto>.supabase.co
//   SUPABASE_CHAVE  = chave secreta (sb_secret_...) — criar uma dedicada,
//                     por exemplo "inferencia_servidor", no painel do Supabase
//
// Sem essas variáveis o módulo fica desligado e o servidor guarda os
// projetos numa pasta local (modo teste), para não travar o desenvolvimento.
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const URL_BASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const CHAVE = process.env.SUPABASE_CHAVE || '';
export const ativo = Boolean(URL_BASE && CHAVE);

// Pasta local usada só quando o Supabase não está configurado.
const PASTA_LOCAL = process.env.INFERENCIA_PASTA_LOCAL || path.join(process.cwd(), '.dados-locais');

// ---------------------------------------------------------------------------
// Chamada REST genérica (PostgREST)
// ---------------------------------------------------------------------------
async function rest(metodo, caminho, corpo, prefer) {
  const cab = { apikey: CHAVE, 'Content-Type': 'application/json' };
  if (CHAVE.startsWith('eyJ')) cab.Authorization = 'Bearer ' + CHAVE;   // chave antiga em formato JWT
  if (prefer) cab.Prefer = prefer;
  const r = await fetch(`${URL_BASE}/rest/v1/${caminho}`, {
    method: metodo, headers: cab, body: corpo === undefined ? undefined : JSON.stringify(corpo)
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${texto.slice(0, 200)}`);
  return texto ? JSON.parse(texto) : null;
}

// Filtro seguro para PostgREST (o e-mail vai codificado na URL).
const eq = (v) => 'eq.' + encodeURIComponent(v);

// ---------------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------------
export async function listarProjetos(email) {
  if (!ativo) return (await lerLocal(email)).map(({ dados, ...resto }) => resto);
  return rest('GET', `inferencia_projetos?select=id,nome,tipologia,municipio,resumo,alterado_em&email=${eq(email)}&excluido_em=is.null&order=alterado_em.desc`);
}

export async function abrirProjeto(email, id) {
  if (!ativo) return (await lerLocal(email)).find((p) => p.id === id) || null;
  const l = await rest('GET', `inferencia_projetos?select=*&id=${eq(id)}&email=${eq(email)}&excluido_em=is.null`);
  return l && l[0] ? l[0] : null;
}

export async function salvarProjeto(email, id, dados, resumo) {
  const linha = {
    email, dados, resumo: resumo || null,
    nome: String(dados?.projeto?.nome || '').slice(0, 200),
    tipologia: String(dados?.projeto?.tipologia || '').slice(0, 60),
    municipio: String(dados?.projeto?.municipio || '').slice(0, 120),
    alterado_em: new Date().toISOString()
  };
  if (!ativo) return salvarLocal(email, id, linha);
  if (id) {
    // o filtro por e-mail garante que ninguém grava no projeto de outro
    const r = await rest('PATCH', `inferencia_projetos?id=${eq(id)}&email=${eq(email)}`, linha, 'return=representation');
    if (!r || !r.length) throw new Error('Projeto não encontrado.');
    return r[0].id;
  }
  const r = await rest('POST', 'inferencia_projetos', linha, 'return=representation');
  return r[0].id;
}

export async function excluirProjeto(email, id) {
  if (!ativo) {
    const l = (await lerLocal(email)).filter((p) => p.id !== id);
    return gravarLocal(email, l);
  }
  await rest('PATCH', `inferencia_projetos?id=${eq(id)}&email=${eq(email)}`, { excluido_em: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Banco de mercado
// ---------------------------------------------------------------------------
// "Dados do sistema" = as amostras do próprio usuário + as compartilhadas
// por outros engenheiros. Das compartilhadas de terceiros, o servidor
// apaga informante, telefone e e-mail do dono antes de devolver.
export async function listarMercado(email, municipio, tipologia, incluirCompartilhadas) {
  if (!ativo) return [];
  let filtro = '';
  if (municipio) filtro += `&municipio=ilike.${encodeURIComponent('*' + municipio + '*')}`;
  if (tipologia) filtro += `&tipologia=${eq(tipologia)}`;
  const dono = incluirCompartilhadas ? `or=(email.${eq(email)},compartilhado.is.true)` : `email=${eq(email)}`;
  const l = await rest('GET', `inferencia_mercado?select=*&${dono}${filtro}&order=criado_em.desc&limit=1000`);
  return l.map((r) => (r.email === email ? r : { ...r, email: null, informante: 'Banco COON (compartilhado)', telefone: '' }));
}

export async function gravarMercado(email, itens) {
  if (!ativo || !itens.length) return 0;
  const linhas = itens.map((i) => ({ ...i, email }));
  await rest('POST', 'inferencia_mercado', linhas);
  return linhas.length;
}

export async function auditar(email, projetoId, acao, detalhe) {
  if (!ativo) return;
  try { await rest('POST', 'inferencia_auditoria', { email, projeto_id: projetoId || null, acao, detalhe: detalhe || null }); }
  catch { /* auditoria nunca derruba a operação principal */ }
}

// ---------------------------------------------------------------------------
// Modo local (sem Supabase): um arquivo JSON por usuário
// ---------------------------------------------------------------------------
function arquivoDe(email) {
  return path.join(PASTA_LOCAL, email.replace(/[^a-z0-9@._-]/gi, '_') + '.json');
}
async function lerLocal(email) {
  try { return JSON.parse(await fs.readFile(arquivoDe(email), 'utf8')); } catch { return []; }
}
async function gravarLocal(email, lista) {
  await fs.mkdir(PASTA_LOCAL, { recursive: true });
  await fs.writeFile(arquivoDe(email), JSON.stringify(lista), 'utf8');
}
async function salvarLocal(email, id, linha) {
  const l = await lerLocal(email);
  const i = id ? l.findIndex((p) => p.id === id) : -1;
  if (i >= 0) l[i] = { ...l[i], ...linha };
  else { id = randomUUID(); l.unshift({ id, criado_em: linha.alterado_em, ...linha }); }
  await gravarLocal(email, l);
  return id;
}
````

## servidor/supadata.mjs
<a id="servidor-supadata-mjs"></a>

Integrações: [SUPADATA]

````javascript
// =============================================================================
// [SUPADATA] servidor/supadata.mjs — leitura de UM anúncio pelo link
// -----------------------------------------------------------------------------
// A Supadata (supadata.ai) é um serviço que abre uma página e devolve o texto
// dela limpo (markdown). Usamos para: o engenheiro cola o link do anúncio
// que ELE escolheu, o servidor pede o texto à Supadata e o extrator do motor
// (INF.Pesquisa.extrairAnuncio) tira preço, área, telefone e VU.
//
// Uso deliberadamente restrito a um link por vez, escolhido pelo usuário:
// é o mesmo que ele abrir a página e copiar o texto. NÃO é para varrer
// portal inteiro (os termos de uso dos portais proíbem, e amostra de laudo
// precisa de conferência humana).
//
//   SUPADATA_CHAVE = chave da API (painel da Supadata). Só no servidor.
//
// Endpoint usado: GET https://api.supadata.ai/v1/web/scrape?url=...
// com o cabeçalho x-api-key. Conferir na documentação da Supadata se o
// endereço ou o formato da resposta mudar.
// =============================================================================

const CHAVE = process.env.SUPADATA_CHAVE || '';
export const ativo = Boolean(CHAVE);

// Erro com status 503/422: a tela mostra a mensagem em vez de "falha no servidor".
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

// Só aceita http/https e recusa endereços internos (evita que alguém use o
// servidor para sondar a rede interna do Railway).
function linkPermitido(link) {
  let u;
  try { u = new URL(link); } catch { return false; }
  if (!/^https?:$/.test(u.protocol)) return false;
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (/^(10|127|0)\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\./.test(h)) return false;
  return true;
}

// Devolve { texto, titulo } do anúncio.
export async function lerAnuncio(link) {
  if (!ativo) throw falha('Leitura por link desligada: configure SUPADATA_CHAVE no servidor.');
  if (!linkPermitido(link)) throw falha('Link inválido.', 422);
  const r = await fetch('https://api.supadata.ai/v1/web/scrape?url=' + encodeURIComponent(link), {
    headers: { 'x-api-key': CHAVE }
  });
  const corpo = await r.text();
  if (!r.ok) throw falha(`Supadata ${r.status}: ${corpo.slice(0, 200)}`);
  const j = JSON.parse(corpo);
  return { texto: String(j.content || ''), titulo: String(j.name || j.title || '') };
}
````


---

# Banco de dados [SUPABASE]

## supabase/migrations/001_inferencia.sql
<a id="supabase-migrations-001-inferencia-sql"></a>

Integrações: [SUPABASE]

````sql
-- =============================================================================
-- [SUPABASE] 001_inferencia.sql — tabelas do COON Infer
-- -----------------------------------------------------------------------------
-- Aplicar no projeto "coon" (sa-east-1) pelo SQL Editor do Supabase.
-- Segue a regra já adotada no COON: RLS ligado em todas as tabelas e NENHUM
-- acesso para anon/authenticated. Só o servidor (chave secreta, guardada em
-- variável de ambiente no Railway) lê e grava. O navegador nunca fala direto
-- com o banco.
--
-- LGPD: amostra de mercado guarda nome e telefone de corretor/imobiliária
-- (contato comercial). Dado de proprietário/mutuário com CPF NÃO entra aqui.
-- =============================================================================

-- Projetos (arquivo de trabalho de cada avaliação). O projeto inteiro vai numa
-- coluna jsonb: variáveis, amostras, avaliando e modelo escolhido. Isso deixa
-- o formato idêntico ao arquivo .json que o engenheiro baixa.
create table if not exists public.inferencia_projetos (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,                       -- dono (mesmo e-mail do login único COON)
  nome         text not null default '',
  tipologia    text not null default '',
  municipio    text not null default '',
  dados        jsonb not null,                      -- projeto completo
  resumo       jsonb,                               -- R², graus etc. do último cálculo (para a lista)
  criado_em    timestamptz not null default now(),
  alterado_em  timestamptz not null default now(),
  excluido_em  timestamptz                          -- exclusão lógica: some da lista, dá para recuperar
);
create index if not exists inferencia_projetos_email on public.inferencia_projetos (email, alterado_em desc);

-- Banco de mercado pessoal: cada oferta/transação pesquisada fica guardada e
-- pode ser reaproveitada em outros laudos da mesma região.
create table if not exists public.inferencia_mercado (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  natureza     text not null check (natureza in ('oferta','transacao')),
  tipologia    text not null default '',
  municipio    text not null default '',
  uf           text not null default '',
  endereco     text not null default '',
  bairro       text not null default '',
  informante   text not null default '',
  telefone     text not null default '',
  link         text not null default '',
  data_evento  date,
  preco        numeric,
  area         numeric,
  unidade_area text not null default '',
  lat          double precision,
  lon          double precision,
  atributos    jsonb not null default '{}'::jsonb,  -- quartos, vagas, topografia, acesso...
  origem       text not null default 'manual',      -- manual | anuncio-colado | supadata | csv
  -- compartilhado = o engenheiro autorizou que a amostra vire "dado do sistema"
  -- para outros usuários da COON. Ao compartilhar, informante e telefone NÃO
  -- são mostrados a terceiros (o servidor apaga esses campos na leitura).
  compartilhado boolean not null default false,
  criado_em    timestamptz not null default now()
);
create index if not exists inferencia_mercado_busca on public.inferencia_mercado (email, municipio, tipologia);
create index if not exists inferencia_mercado_sistema on public.inferencia_mercado (compartilhado, municipio, tipologia) where compartilhado;

-- Trilha de uso (quem calculou o quê e quando) — útil em perícia contestada.
create table if not exists public.inferencia_auditoria (
  id         bigint generated always as identity primary key,
  email      text not null,
  projeto_id uuid,
  acao       text not null,
  detalhe    jsonb,
  quando     timestamptz not null default now()
);

alter table public.inferencia_projetos  enable row level security;
alter table public.inferencia_mercado   enable row level security;
alter table public.inferencia_auditoria enable row level security;

revoke all on public.inferencia_projetos  from anon, authenticated;
revoke all on public.inferencia_mercado   from anon, authenticated;
revoke all on public.inferencia_auditoria from anon, authenticated;

-- Catálogo do login único: registra o programa (codigo, nome, disponivel e
-- preco são as colunas que o servidor do COON lê). Só insere se ainda não
-- existir — não depende de a coluna "codigo" ter restrição de unicidade.
insert into public.aplicativos (codigo, nome, disponivel, preco)
select 'inferencia', 'COON Infer', true, 0
where not exists (select 1 from public.aplicativos where codigo = 'inferencia');
````


---

# Testes

## testes/conferir_statsmodels.py
<a id="testes-conferir-statsmodels-py"></a>

````python
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
````

## testes/teste-funcional.cjs
<a id="testes-teste-funcional-cjs"></a>

````javascript
/* Roda no Node a PARTE 1 (funcionalidade) do web/js/teste-app.js, sem os casos de tela.
   node testes/teste-funcional.cjs */
const fs = require('fs'), path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
fs.readdirSync(pasta).filter(f => /^\d\d-.*\.js$/.test(f)).sort().forEach(f => require(path.join(pasta, f)));
require(path.join(__dirname, '..', 'web', 'js', 'teste-app.js'));
globalThis.INF.TesteFuncional.rodar({ tela: false }).then(function (r) {
  let etapa = '';
  r.resultados.forEach(function (x) {
    if (x.etapa !== etapa) { etapa = x.etapa; console.log('\n' + etapa); }
    console.log('  ' + (x.ok ? '✓' : '✗') + ' ' + x.nome + (x.ok ? '' : '\n      ' + x.falhas.join('\n      ')));
  });
  console.log('\n' + r.ok + ' de ' + r.casos + ' casos certos · ' + r.verificacoes + ' verificações');
  console.log(r.mensagem);
  process.exitCode = r.ok === r.casos ? 0 : 1;
});
````

## testes/teste-modelos.cjs
<a id="testes-teste-modelos-cjs"></a>

````javascript
/* Gera o laudo de TODOS os modelos e dos 20 estilos, com dados sintéticos de teste,
   e grava os .docx em testes/saida-modelos/ para conferir com o python-docx. */
const fs = require('fs'), path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
fs.readdirSync(pasta).filter(f => /^\d\d-.*\.js$/.test(f)).sort().forEach(f => require(path.join(pasta, f)));
const INF = globalThis.INF, saida = path.join(__dirname, 'saida-modelos');
fs.mkdirSync(saida, { recursive: true });
const r = INF.U.rng(2026); const nm = () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const p = INF.Dados.novoProjeto(); p.projeto.nome = 'TESTE'; p.projeto.autor = 'Responsável Teste'; p.projeto.municipio = 'Patos de Minas/MG';
['Area', 'Dist', 'Topo'].forEach((n, i) => INF.Dados.incluirVariavel(p, n, ['quantitativa', 'quantitativa', 'qualitativa'][i]));
for (let i = 0; i < 40; i++) { const a = 200 + r() * 1800, d = 0.5 + r() * 12, t = 1 + Math.floor(r() * 3);
  INF.Dados.incluirAmostra(p, { natureza: i % 3 ? 'oferta' : 'transacao', informante: 'Imob ' + i, link: i % 5 ? 'https://x.test/' + i : '', data: '2026-08-10', lat: -18.58 + r() * 0.08, lon: -46.52 + r() * 0.08,
    valores: { VU: Math.exp(5.2 + 180 / a - 0.18 * Math.log(d) + 0.09 * t + 0.08 * nm()), Area: a, Dist: d, Topo: t } }); }
p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x' }; p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
const mod = INF.Regressao.calcular(p, p.modelo.transf), diag = INF.Diag.tudo(mod);
const pr = INF.Projecao.projetar(mod, [800, 3, 2], { areaAvaliando: 800, item1: 2, item3: 2, considerarIntercepto: true });
const resumo = [];
INF.Modelos.MODELOS.forEach((M, k) => {
  const q = JSON.parse(JSON.stringify(p));
  INF.Modelos.aplicar(q, M.id);
  q.laudo = { estilo: (k % 20) + 1, solicitante: 'Solicitante Teste' };
  if (M.objetos.includes('vizinhanca')) q.vizinhanca = { obra: { nome: 'Obra Teste' }, imoveis: [{ endereco: 'Rua A, 90', ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede', dimensao: '0,2 mm', descricao: 'horizontal' }] }] }] };
  const l = INF.Laudo.montar({ proj: q, modelo: mod, diag, projecao: pr });
  if (l.erro) { resumo.push(M.id + ': ERRO ' + l.erro); return; }
  const caps = l.blocos.filter(b => b.t === 'h1').map(b => b.texto);
  fs.writeFileSync(path.join(saida, String(k + 1).padStart(2, '0') + '-' + M.id + '.docx'), INF.Laudo.docx(l, {}));
  fs.writeFileSync(path.join(saida, String(k + 1).padStart(2, '0') + '-' + M.id + '.html'), INF.Laudo.html(l));
  resumo.push((M.nivel + ' ').padEnd(13) + M.nome.padEnd(52) + ' estilo ' + String(l.estilo.numero).padStart(2) + ' | ' + caps.filter(c => !/^Anexo/.test(c)).length + ' capítulos + ' + caps.filter(c => /^Anexo/.test(c)).length + ' anexos | sumário: ' + (l.blocos.some(b => b.t === 'sumario') ? 'sim' : 'não'));
});
// os 20 estilos no mesmo modelo
for (let e = 1; e <= 20; e++) {
  const q = JSON.parse(JSON.stringify(p)); INF.Modelos.aplicar(q, 'jud_valor'); q.laudo = { estilo: e };
  const l = INF.Laudo.montar({ proj: q, modelo: mod, diag, projecao: pr });
  fs.writeFileSync(path.join(saida, 'estilo-' + String(e).padStart(2, '0') + '.docx'), INF.Laudo.docx(l, {}));
}
console.log(resumo.join('\n'));
````

## testes/teste-motor.cjs
<a id="testes-teste-motor-cjs"></a>

````javascript
/* =============================================================================
   teste-motor.js — Conferência do motor estatístico
   -----------------------------------------------------------------------------
   Roda no Node:   node testes/teste-motor.cjs
   Gera um conjunto SINTÉTICO (não é mercado, não é amostra de laudo: serve
   só para testar as contas), calcula o modelo e grava o resultado em
   testes/saida-motor.json. O script conferir_statsmodels.py refaz as mesmas
   contas no Python (statsmodels/scipy) e compara número a número.
   ============================================================================= */

const fs = require('fs');
const path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
['00-base', '01-matriz', '02-distribuicoes', '03-transformacoes', '04-regressao', '05-diagnosticos',
  '06-busca-modelos', '07-nbr14653', '08-projecao', '09-rna', '10-dados', '11-operar-variaveis', '12-pesquisa-mercado', '13-graficos', '14-relatorio', '15-conferencia', '16-avancado', '17-planilha', '18-laudo', '19-tipos-laudo', '20-inventario', '21-modelos-laudo', '22-estilos-laudo']
  .forEach(function (f) { require(path.join(pasta, f + '.js')); });
const INF = globalThis.INF;

// ---- dados sintéticos com semente fixa -------------------------------------
const sorteio = INF.U.rng(2026);
const normal = function () {           // Box-Muller
  const u = Math.max(sorteio(), 1e-12), v = sorteio();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const proj = INF.Dados.novoProjeto();
proj.projeto.dataBase = '2026-09-29';
proj.config.aplicarFatorOferta = true;
proj.config.fatorOferta = 0.9;
['Area', 'Dist', 'Topo', 'Pav'].forEach(function (n, i) {
  INF.Dados.incluirVariavel(proj, n, ['quantitativa', 'quantitativa', 'qualitativa', 'dicotomica'][i]);
});
proj.variaveis.find(v => v.nome === 'Area').direcao = '-';
proj.variaveis.find(v => v.nome === 'Dist').direcao = '-';
proj.variaveis.find(v => v.nome === 'Topo').direcao = '+';
proj.variaveis.find(v => v.nome === 'Pav').direcao = '+';

for (let i = 0; i < 40; i++) {
  const area = 200 + sorteio() * 1800;
  const dist = 0.5 + sorteio() * 12;
  const topo = 1 + Math.floor(sorteio() * 3);
  const pav = sorteio() < 0.6 ? 1 : 0;
  const lnvu = 5.2 + 180 / area - 0.18 * Math.log(dist) + 0.09 * topo + 0.12 * pav + 0.08 * normal();
  INF.Dados.incluirAmostra(proj, {
    natureza: i % 3 === 0 ? 'transacao' : 'oferta',
    valores: { VU: Math.exp(lnvu), Area: area, Dist: dist, Topo: topo, Pav: pav }
  });
}

const transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x' };
const mod = INF.Regressao.calcular(proj, transf);
if (mod.erro) { console.error(mod.erro); process.exit(1); }
const diag = INF.Diag.tudo(mod);
const aval = [800, 3, 2, 1];
const proj80 = INF.Projecao.projetar(mod, aval, { nivel: 0.80, item1: 2, item3: 2, considerarIntercepto: true, areaAvaliando: 800 });

// ---- saída para comparação --------------------------------------------------
const saida = {
  X: mod.X, y: mod.y, aval: aval, transf: transf,
  b: mod.b, ep: mod.ep, t: mod.t, sig: mod.sig,
  R2: mod.R2, R2aj: mod.R2aj, F: mod.F, sigF: mod.sigF, s: mod.s,
  dw: diag.dw, sw: diag.sw, jb: diag.jb, bp: diag.bp, ks: diag.ks,
  cook: diag.residuos.map(r => r.cook), h: mod.h,
  vif: diag.vif.map(v => v.vif), press: diag.prev.PRESS, AIC: diag.prev.AIC,
  projecao: { z: proj80.z, icMin: proj80.icMin, icMax: proj80.icMax, ipMin: proj80.ipMin, ipMax: proj80.ipMax, central: proj80.central }
};
fs.writeFileSync(path.join(__dirname, 'saida-motor.json'), JSON.stringify(saida, null, 1));

console.log('Equação:', mod.equacao);
console.log('R² =', mod.R2.toFixed(6), ' R²aj =', mod.R2aj.toFixed(6), ' F =', mod.F.toFixed(4), ' SigF =', mod.sigF.toExponential(3));
console.log('Fundamentação: Grau', INF.NBR.romano(proj80.fundamentacao.grau), '(' + proj80.fundamentacao.pontos + ' pontos)');
console.log('Precisão: amplitude', (proj80.amplitude * 100).toFixed(2) + '% → Grau', INF.NBR.romano(proj80.grauPrecisao));
console.log('Operar: VT = VU*Area →', JSON.stringify(INF.Operar.operar(proj, 'VT', 'identificacao', 'VU * Area')));
console.log('Anúncio:', JSON.stringify(INF.Pesquisa.extrairAnuncio('Fazenda 172 ha, R$ 3.440.000. Cond. R$ 0. Fone (38) 99876-5432')));

// ---- busca de modelos -------------------------------------------------------
const t0 = Date.now();
INF.Busca.buscar(proj, { limite: 500, criterio: 'R2aj', testarExclusao: true, sigMaxRegressores: 0.30 }).then(function (r) {
  console.log('Busca', r.modo, ':', r.avaliados, 'modelos avaliados,', r.validos, 'válidos,', r.modelos.length, 'no ranking, em', Date.now() - t0, 'ms');
  console.log('Melhor:', JSON.stringify(r.modelos[0].transf), 'R²aj', r.modelos[0].R2aj.toFixed(4));
  const t1 = Date.now();
  const rna = INF.RNA.treinar(proj, transf, { redes: 5, epocas: 1500 });
  console.log('RNA: R²', rna.R2.toFixed(4), ' EMP', (rna.EMP * 100).toFixed(2) + '%', 'em', Date.now() - t1, 'ms');
});

// ---- conferência, correção autorizada e desfazer ---------------------------
const achados = INF.Conferencia.conferir(proj);
console.log('Conferência por regras:', achados.length, 'achado(s); ex.:', achados.slice(0, 2).map(a => a.texto).join(' | '));
const antes = proj.amostras[2].valores.Area;
const ap = { amostra: 3, texto: 'teste', correcao: { acao: 'corrigir', campo: 'Area', de: antes, para: 999, evidencia: 'teste de código' } };
INF.Conferencia.aplicarCorrecao(proj, ap, 'Teste');
const depois = proj.amostras[2].valores.Area;
INF.Conferencia.desfazer(proj);
console.log('Correção autorizada:', antes.toFixed(2), '→', depois, '→ desfeita:', proj.amostras[2].valores.Area === antes);
const rel = INF.Relatorio.gerar({ proj, modelo: mod, diag, projecao: proj80 });
console.log('Relatório HTML:', rel.length, 'caracteres');

// ---- ferramentas avançadas e exportação --------------------------------------
const Av = INF.Avancado;
console.log('PCA 1º componente:', (Av.pca(mod).componentes[0].variancia * 100).toFixed(1) + '% da variância');
console.log('K-médias (3):', Av.kmedias(mod, 3).grupos.map(g => g.amostras.length).join('/'), 'amostras por grupo');
const bc = Av.boxCox(mod); console.log('Box-Cox λ =', bc.lambda, 'IC95', bc.ic95, '→', bc.recomendada[1]);
const bs = Av.bootstrap(mod, aval, { B: 500 }); console.log('Bootstrap IC80%:', bs.min.toFixed(2), 'a', bs.max.toFixed(2), '| clássico:', proj80.icMin.toFixed(2), 'a', proj80.icMax.toFixed(2));
const bcoef = Av.bootstrapCoeficientes(mod, { B: 500 }); console.log('Bootstrap coef. mesmo sinal:', bcoef.coeficientes.map(c => c.nome + ' ' + (c.mesmoSinal * 100).toFixed(0) + '%').join(', '));
const rb = Av.robusta(mod); console.log('Huber: maior diferença', Math.max(...rb.coeficientes.map(c => Math.abs(c.diferenca))).toFixed(3), '| amostras com peso reduzido:', rb.pesos.length);
const gb = Av.boosting(mod); console.log('Boosting: R² treino', gb.R2treino.toFixed(3), 'validação', gb.R2validacao.toFixed(3), '| importância:', gb.importancia.map(i => i.nome + ' ' + (i.importancia * 100).toFixed(0) + '%').join(', '));
const sim = Av.simulacao(mod, aval, { N: 5000 }); console.log('Monte Carlo: P10', sim.p10.toFixed(2), 'P50', sim.p50.toFixed(2), 'P90', sim.p90.toFixed(2));
proj.amostras.forEach((a, i) => { a.lat = -18.5 + (i % 7) * 0.01; a.lon = -46.5 + Math.floor(i / 7) * 0.01; });
console.log('Moran:', JSON.stringify(Av.moran(proj, mod)));
const dea = Av.dea(proj, ['Area'], ['__dep__']); console.log('DEA eficientes (=1):', dea.resultado.filter(r => r.eficiencia > 0.9999).map(r => r.id).join(','), '| menor:', dea.resultado[dea.resultado.length - 1].eficiencia.toFixed(3));
const rna2 = INF.RNA.treinar(proj, transf, { redes: 3, epocas: 800 }); const pod = INF.RNA.podar(rna2, 0.1);
console.log('Poda RNA:', pod.poda.neuroniosAntes, '→', pod.poda.neuroniosDepois, 'neurônios; R²', rna2.R2.toFixed(3), '→', pod.R2.toFixed(3));
const xlsx = INF.Planilha.pastaCompleta({ proj, modelo: mod, diag, projecao: proj80, busca: null });
fs.writeFileSync(path.join(__dirname, 'teste.xlsx'), xlsx); console.log('XLSX:', xlsx.length, 'bytes');

// ---- laudo completo -----------------------------------------------------------
const Lx = INF.Laudo;
[1, 21, 100, 101, 1000, 1001, 1250000, 2000000, 3440000.5, 187592.11].forEach(v => console.log('Extenso', v, '→', Lx.porExtenso(v)));
proj.projeto.nome = 'Teste sintético'; proj.projeto.autor = 'Responsável Teste';
proj.laudo = { solicitante: 'Solicitante Teste', dataVistoria: '2026-09-20' };
// foto mínima (PNG 1×1 branco) só para exercitar a inclusão de imagem
proj.fotos = [{ id: 1, alvo: 'avaliando', legenda: 'Foto de teste', largura: 1, altura: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }];
const lau = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
if (lau.erro) console.log('Laudo erro:', lau.erro);
const htmlL = Lx.html(lau);
console.log('Laudo: blocos', lau.blocos.length, '| [preencher]:', (htmlL.match(/\[preencher:/g) || []).length, '| valor adotado', lau.valorAdotado);
fs.writeFileSync(path.join(__dirname, 'teste-laudo.docx'), Lx.docx(lau, {}));

// ---- tipos de laudo -------------------------------------------------------------
proj.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { ambito: 'rural', imovel: 'Fazenda', destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente'],
  processo: '0000000-00.0000.0.00.0000', areaFaixa: 12.5, coefServidao: 30, areaRemanescente: 100, percRemanescente: 5,
  quesitos: [{ parte: 'autor', pergunta: 'Qual o valor da indenização?', resposta: '' }] });
let lj = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
const txtJ = Lx.html(lj);
console.log('Judicial: título', /LAUDO PERICIAL/.test(txtJ), '| capítulos', lj.blocos.filter(b => b.t === 'h1').map(b => b.texto).slice(0, 13).join(' / '));
console.log('Conclusão judicial:', lj.blocos.find(b => b.t === 'p' && /concluo pelos seguintes valores/.test(b.texto)).texto);
proj.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { ambito: 'rural', imovel: 'Sítio', destino: 'banco', objetos: ['pleno', 'vtn', 'liquidacao'], banco: 'Banco Teste',
  prazoAbsorcao: 12, taxaMensal: 1, benfeitorias: [{ descricao: 'Casa sede', quantidade: 120, unidade: 'm²', unitario: 1500, depreciacao: 30 }] });
lj = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
console.log('Banco: título', /LAUDO DE AVALIAÇÃO/.test(Lx.html(lj)), '|', lj.blocos.find(b => b.t === 'p' && /concluo pelos seguintes valores/.test(b.texto)).texto);
fs.writeFileSync(path.join(__dirname, 'teste-laudo-banco.docx'), Lx.docx(lj, {}));

// ---- vizinhança e inventário por modelo ------------------------------------------------
const pv = INF.Dados.novoProjeto(); pv.projeto.autor = 'Responsável Teste';
pv.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { destino: 'particular', objetos: ['vizinhanca'] });
pv.vizinhanca = { obra: { nome: 'Edifício Teste', endereco: 'Rua A, 100', construtora: 'Construtora Teste' }, imoveis: [
  { endereco: 'Rua A, 90', ocupante: 'Morador 1', tipo: 'Casa', dataVistoria: '2026-09-20', conservacao: 'regular',
    ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede leste, sob a janela', dimensao: '0,3 mm × 40 cm', descricao: 'fissura inclinada' }] }, { nome: 'Cozinha', anomalias: [] }] },
  { endereco: 'Rua A, 110', recusou: true, motivoRecusa: 'ocupante ausente', dataVistoria: '2026-09-20' }] };
pv.inventario = { h1: { arquivo: 'alvara.pdf', tipo: 'alvara_habitese', dataDocumento: '2026-08-01', resumo: 'Alvará de construção nº 123/2026...', dados: [{ campo: 'alvaraObra', valor: '123/2026', pagina: 1, trecho: 'Alvará nº 123/2026' }] } };
const lv = Lx.montar({ proj: pv });
console.log('Vizinhança:', lv.titulo, '| capítulos:', lv.blocos.filter(b => b.t === 'h1').map(b => b.texto).join(' / '));
fs.writeFileSync(path.join(__dirname, 'teste-vizinhanca.docx'), Lx.docx(lv, {}));
const fic = INF.Inventario.ficha(pv.tipoLaudo, pv.inventario, {}, function () { return ''; });
console.log('Ficha vizinhança:', fic.filter(f => f.estado === 'RESOLVIDA').map(f => f.rotulo + '=' + f.valor).join('; '), '| não encontradas:', fic.filter(f => f.estado === 'NÃO ENCONTRADA').length);
console.log('Checagem:', INF.Inventario.checagem(fic, INF.Inventario.trava([{ nome: 'alvara.pdf', hash: 'h1' }], pv.inventario)).mensagem);
````


---

# Configuração

## .env.exemplo
<a id="-env-exemplo"></a>

Integrações: [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]

````bash
# Copie para .env (só no seu PC) ou cadastre em Railway → Variables.
# NUNCA envie o .env para o Git nem cole as chaves em conversa.

PORT=8795

# Login único do COON: endereço do servidor principal (onde fica /api/sessao)
COON_HUB_URL=https://app.copontoon.com

# Teste no PC sem login (recusado automaticamente no Railway)
INFERENCIA_DEV=0

# [SUPABASE] banco de dados — chave secreta dedicada a este app
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_CHAVE=

# [SUPADATA] leitura de anúncio pelo link
SUPADATA_CHAVE=

# [CLAUDE] conferência das amostras pela IA
ANTHROPIC_API_KEY=
INFERENCIA_MODELO_IA=claude-sonnet-5

# [GOOGLE MAPS] imagens de satélite e mapa de situação no laudo (Maps Static API)
GOOGLE_MAPS_CHAVE=
````

## package.json
<a id="package-json"></a>

````json
{
  "name": "coon-infer",
  "version": "1.1.0",
  "private": true,
  "description": "COON Infer — avaliação de imóveis por inferência estatística (ABNT NBR 14.653-2)",
  "type": "module",
  "main": "servidor/server.mjs",
  "scripts": {
    "start": "node servidor/server.mjs",
    "teste-local": "node --env-file-if-exists=.env servidor/server.mjs",
    "teste-motor": "node testes/teste-motor.cjs && python testes/conferir_statsmodels.py",
    "codigo-completo": "node scripts/juntar-codigo.mjs"
  },
  "engines": { "node": ">=20" }
}
````

## railway.json
<a id="railway-json"></a>

````json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "node servidor/server.mjs",
    "healthcheckPath": "/api/status",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
````


---

# Scripts

## scripts/juntar-codigo.mjs
<a id="scripts-juntar-codigo-mjs"></a>

Integrações: [SUPABASE] [SUPADATA] [CLAUDE] [GOOGLE MAPS]

````javascript
// =============================================================================
// scripts/juntar-codigo.mjs — gera docs/CODIGO-COMPLETO.md
// -----------------------------------------------------------------------------
// Junta todo o código do sistema num arquivo só, com índice e o nome de cada
// arquivo, para ler e analisar do começo ao fim. Rodar sempre que o código
// mudar:   node scripts/juntar-codigo.mjs
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Ordem de leitura sugerida: do núcleo matemático até a tela e a nuvem.
const GRUPOS = [
  ['Motor estatístico', 'motor', /\.js$/],
  ['Tela', 'web', /\.(html|css|js)$/],
  ['Servidor (nuvem)', 'servidor', /\.mjs$/],
  ['Banco de dados [SUPABASE]', 'supabase/migrations', /\.sql$/],
  ['Testes', 'testes', /\.(cjs|py)$/],
  ['Configuração', '.', /^(package\.json|railway\.json|\.env\.exemplo)$/],
  ['Scripts', 'scripts', /\.mjs$/]
];
const LINGUAGEM = { '.js': 'javascript', '.mjs': 'javascript', '.cjs': 'javascript', '.html': 'html', '.css': 'css', '.sql': 'sql', '.py': 'python', '.json': 'json', '.exemplo': 'bash' };

async function listar(pasta, filtro) {
  const base = path.join(RAIZ, pasta);
  const saida = [];
  for (const nome of (await fs.readdir(base, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = path.posix.join(pasta === '.' ? '' : pasta, nome.name);
    if (nome.isDirectory()) { if (pasta !== '.') saida.push(...await listar(rel, filtro)); }
    else if (filtro.test(nome.name)) saida.push(rel);
  }
  return saida;
}

let indice = '', corpo = '', totalLinhas = 0, totalArquivos = 0;
for (const [titulo, pasta, filtro] of GRUPOS) {
  const arquivos = await listar(pasta, filtro);
  if (!arquivos.length) continue;
  indice += `\n**${titulo}**\n\n`;
  corpo += `\n\n---\n\n# ${titulo}\n`;
  for (const rel of arquivos) {
    const texto = (await fs.readFile(path.join(RAIZ, rel), 'utf8')).replace(/\r\n/g, '\n');
    const linhas = texto.split('\n').length;
    totalLinhas += linhas; totalArquivos++;
    const ancora = rel.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const marcas = ['SUPABASE', 'SUPADATA', 'CLAUDE', 'GOOGLE MAPS'].filter((m) => texto.includes('[' + m + ']')).map((m) => `[${m}]`).join(' ');
    indice += `- [${rel}](#${ancora}) — ${linhas} linhas ${marcas}\n`;
    const lang = LINGUAGEM[path.extname(rel)] || '';
    corpo += `\n## ${rel}\n<a id="${ancora}"></a>\n\n${marcas ? 'Integrações: ' + marcas + '\n\n' : ''}\`\`\`\`${lang}\n${texto.trimEnd()}\n\`\`\`\`\n`;
  }
}

const cabecalho = `# COON Infer — Código completo

Todo o código-fonte num arquivo só: ${totalArquivos} arquivos e ${totalLinhas.toLocaleString('pt-BR')} linhas.
A estrutura e as decisões estão em ESTRUTURA.md.

Para achar as integrações, busque no texto:
- \`[SUPABASE]\` — banco de dados (projetos, banco de mercado, auditoria)
- \`[SUPADATA]\` — leitura de anúncio pelo link
- \`[CLAUDE]\` — conferência das amostras pela IA
- \`[GOOGLE MAPS]\` — imagens de satélite e mapa de situação no laudo

Gerado em ${new Date().toLocaleString('pt-BR')} por scripts/juntar-codigo.mjs.

## Índice
`;
await fs.writeFile(path.join(RAIZ, 'docs', 'CODIGO-COMPLETO.md'), cabecalho + indice + corpo, 'utf8');
console.log(`docs/CODIGO-COMPLETO.md: ${totalArquivos} arquivos, ${totalLinhas} linhas`);
````
