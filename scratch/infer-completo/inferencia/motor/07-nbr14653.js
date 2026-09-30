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
