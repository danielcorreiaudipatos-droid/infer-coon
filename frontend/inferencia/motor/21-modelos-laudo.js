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
