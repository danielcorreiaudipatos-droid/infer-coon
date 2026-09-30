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
