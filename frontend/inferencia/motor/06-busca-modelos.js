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
