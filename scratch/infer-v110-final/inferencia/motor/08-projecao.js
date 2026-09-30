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
