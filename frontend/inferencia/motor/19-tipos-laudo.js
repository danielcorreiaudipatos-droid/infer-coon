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
