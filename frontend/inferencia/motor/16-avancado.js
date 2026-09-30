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
