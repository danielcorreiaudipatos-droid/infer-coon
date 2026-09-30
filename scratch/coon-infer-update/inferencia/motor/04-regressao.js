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
