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
    B.push({ t: 'capa', linhas: [TL.titulo(tl), (rural ? 'Imóvel rural' : 'Imóvel urbano') + (tl.imovel ? ' — ' + tl.imovel : '') + (judicial && tl.processo ? ' · Processo nº ' + tl.processo : ''),
      ou(p.projeto.nome, 'nome do trabalho'), ou(c.endereco || p.projeto.municipio, 'endereço do imóvel'),
      'Data de referência: ' + dataBR(p.projeto.dataBase), autor] });
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
    par('Nada mais havendo a relatar, encerro este laudo, que segue assinado, acompanhado dos anexos relacionados abaixo: A — dados de mercado; B — gráficos do tratamento estatístico; C — documentação e fotografias.');
    B.push({ t: 'assinatura', linhas: [ou(c.cidade || (p.projeto.municipio || '').split('/')[0], 'cidade') + ', ' + dataExtenso(new Date().toISOString().slice(0, 10)) + '.',
      autor, ou(c.titulo, 'título profissional') + ' — ' + ou(c.registro, 'CREA'), c.art ? 'ART nº ' + c.art : falta('número da ART')] });

    // ---- anexos ----
    B.push({ t: 'quebra' });
    B.push({ t: 'h1', texto: 'Anexo A — Dados de mercado' });
    const usados = new Set(m.ids);
    const nomes = [m.dep.nome].concat(m.indep.map(function (v) { return v.nome; }));
    B.push({ t: 'tabela', pequena: true, cab: ['Nº', 'Uso', 'Natureza', 'Localização', 'Informante', 'Contato'].concat(nomes), linhas: p.amostras.map(function (a) {
      return [String(a.id), usados.has(a.id) ? 'sim' : 'não', a.natureza === 'transacao' ? 'transação' : 'oferta', a.endereco || a.bairro || '', a.informante || '', a.telefone || a.link || '']
        .concat(nomes.map(function (nv) { return U.fmtAuto(U.lerNumero(a.valores[nv])); }));
    }) });
    B.push({ t: 'quebra' });
    B.push({ t: 'h1', texto: 'Anexo B — Gráficos' });
    const res = d.residuos;
    B.push({ t: 'grafico', titulo: 'Valores observados × estimados', svg: G.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ')', rotX: 'estimado', rotY: 'observado', linha45: true }) });
    B.push({ t: 'grafico', titulo: 'Resíduos padronizados', svg: G.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true }) });
    B.push({ t: 'grafico', titulo: 'Histograma dos resíduos', svg: G.histograma(res.map(function (r) { return r.padronizado; })) });
    B.push({ t: 'grafico', titulo: 'Gráfico Q-Q', svg: G.qq(res.map(function (r) { return r.padronizado; })) });
    m.indep.forEach(function (v, j) { B.push({ t: 'grafico', titulo: m.dep.nome + ' × ' + v.nome, svg: G.curvaModelo(m, j, Rg.prever) }); });
    B.push({ t: 'grafico', titulo: 'Distância de Cook', svg: G.barras(res.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1) });
    B.push({ t: 'quebra' });
    L.anexoInventario(p, B, 'Anexo C — Inventário dos documentos');
    B.push({ t: 'h1', texto: 'Anexo C.1 — Documentação e fotografias' });
    const docs = fotos.filter(function (f) { return f.alvo === 'documento'; });
    const fotosAmostras = fotos.filter(function (f) { return /^amostra/.test(f.alvo); });
    if (docs.length) docs.forEach(imagem); else par(falta('matrícula e ART'));
    if (fotosAmostras.length) { B.push({ t: 'h2', texto: 'Fotografias dos dados de mercado' }); fotosAmostras.forEach(imagem); }

    // Anexo D — tratamento estatístico completo (todas as tabelas e gráficos)
    if (c.anexoCompleto) {
      B.push({ t: 'quebra' });
      B.push({ t: 'h1', texto: 'Anexo D — Tratamento estatístico completo' });
      const desc = INF.Diag.descritivaProjeto(p);
      B.push({ t: 'h2', texto: 'D.1 Estatística descritiva' });
      B.push({ t: 'tabela', pequena: true, cab: ['Variável', 'n', 'Média', 'Mediana', 'Desvio', 'CV', 'Mínimo', 'Máximo'], linhas: desc.linhas.map(function (x) { return [x.nome, String(x.n), U.fmtAuto(x.media), U.fmtAuto(x.mediana), U.fmtAuto(x.desvio), U.fmtPct(x.cv, 1), U.fmtAuto(x.min), U.fmtAuto(x.max)]; }) });
      B.push({ t: 'h2', texto: 'D.2 Regressores' });
      B.push({ t: 'tabela', pequena: true, cab: ['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't', 'Sig', 'Elasticidade', 'VIF'], linhas: [['Constante', '—', U.fmtAuto(m.b[0]), U.fmtAuto(m.ep[0]), U.fmt(m.t[0], 3), U.fmtPct(m.sig[0]), '—', '—']]
        .concat(m.indep.map(function (v, j) { return [v.nome, T.porId[v.transf].rotulo, U.fmtAuto(m.b[j + 1]), U.fmtAuto(m.ep[j + 1]), U.fmt(m.t[j + 1], 3), U.fmtPct(m.sig[j + 1]), U.fmt(m.elasticidade[j].elasticidade, 2) + '%', U.fmt(d.vif[j].vif, 2)]; })) });
      B.push({ t: 'p', texto: INF.Regressao.equacaoExplicita(m), mono: true });
      B.push({ t: 'h2', texto: 'D.3 Análise de variância' });
      B.push({ t: 'tabela', cab: ['Fonte', 'Soma dos quadrados', 'gl', 'Quadrado médio', 'F', 'Sig'], linhas: [
        ['Regressão', U.fmtAuto(m.SQReg), String(m.glReg), U.fmtAuto(m.SQReg / m.glReg), U.fmt(m.F, 3), U.fmtPct(m.sigF, 4)],
        ['Resíduo', U.fmtAuto(m.SQRes), String(m.gl), U.fmtAuto(m.s2), '', ''], ['Total', U.fmtAuto(m.SQTot), String(m.n - 1), '', '', '']] });
      B.push({ t: 'tabela', cab: ['Indicador', 'Valor'], linhas: [['Erro padrão da regressão', U.fmtAuto(m.s)], ['R² de previsão (PRESS)', U.fmt(d.prev.R2previsao, 4)], ['AIC', U.fmt(d.prev.AIC, 2)], ['BIC', U.fmt(d.prev.BIC, 2)], ['Durbin-Watson', U.fmt(d.dw, 3)]] });
      B.push({ t: 'h2', texto: 'D.4 Normalidade e homocedasticidade' });
      B.push({ t: 'tabela', cab: ['Intervalo', 'Curva normal', 'Modelo'], linhas: d.proporcoes.map(function (q) { return [q.faixa, U.fmtPct(q.esperado, 0), U.fmtPct(q.obtido, 0)]; }) });
      B.push({ t: 'tabela', cab: ['Teste', 'Estatística', 'Valor-p'], linhas: [['Shapiro-Wilk', U.fmt(d.sw.estatistica, 4), U.fmtPct(d.sw.p)], ['Kolmogorov-Smirnov (Lilliefors)', U.fmt(d.ks.estatistica, 4), U.fmtPct(d.ks.p)],
        ['Jarque-Bera', U.fmt(d.jb.estatistica, 4), U.fmtPct(d.jb.p)], ['Breusch-Pagan', U.fmt(d.bp.estatistica, 4), U.fmtPct(d.bp.p)]] });
      B.push({ t: 'h2', texto: 'D.5 Correlações (isoladas / parciais)' });
      const cn = d.correl.nomes;
      B.push({ t: 'tabela', pequena: true, cab: [''].concat(cn), linhas: cn.map(function (n, a) { return [n].concat(cn.map(function (_, b) { return a === b ? '—' : U.fmt(d.correl.isoladas[a][b], 2) + ' / ' + (d.correl.parciais ? U.fmt(d.correl.parciais[a][b], 2) : '—'); })); }) });
      B.push({ t: 'h2', texto: 'D.6 Resíduos por amostra' });
      B.push({ t: 'tabela', pequena: true, cab: ['Nº', 'Observado', 'Estimado', 'Resíduo', 'Padronizado', 'Studentizado', 'Alavancagem', 'Cook'], linhas: d.residuos.map(function (r) {
        return [String(r.id), U.fmtAuto(r.observado), U.fmtAuto(r.estimado), U.fmtAuto(r.residuo), U.fmt(r.padronizado, 3), U.fmt(r.studentizado, 3), U.fmt(r.alavancagem, 3), U.fmt(r.cook, 3)]; }) });
      B.push({ t: 'h2', texto: 'D.7 Gráficos complementares' });
      m.indep.forEach(function (v, j) {
        B.push({ t: 'grafico', titulo: 'Resíduos × ' + v.nome, svg: G.dispersao(d.residuos.map(function (r, i) { return { x: m.xOriginal[i][j], y: r.padronizado, rotulo: r.id }; }), { titulo: 'Resíduos × ' + v.nome, rotX: v.nome, rotY: 'resíduo padronizado', faixas2s: true }) });
        B.push({ t: 'grafico', titulo: 'Distribuição de ' + v.nome, svg: G.frequencia(m.xOriginal.map(function (l) { return l[j]; }), 'Distribuição de ' + v.nome, v.nome) });
      });
      B.push({ t: 'grafico', titulo: 'Distribuição de ' + m.dep.nome, svg: G.frequencia(m.yOriginal, 'Distribuição de ' + m.dep.nome, m.dep.nome) });
      B.push({ t: 'grafico', titulo: 'Alavancagem', svg: G.barras(d.residuos.map(function (r) { return { rotulo: r.id, valor: r.alavancagem }; }), 'Alavancagem (h)', 'h', 2 * m.p / m.n) });
    }

    return { blocos: B, autor: p.projeto.autor || '', titulo: 'Laudo de avaliação — ' + (p.projeto.nome || ''), valorAdotado: adotado, dentroIC: dentroIC, dentroArb: dentroArb };
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
    return { blocos: B, autor: p.projeto.autor || '', titulo: TL.titulo(tl) + ' — ' + (ob.nome || p.projeto.nome || ''), vizinhanca: true };
  };

  // ---------------------------------------------------------------------------
  // Saída em HTML (para imprimir em PDF)
  // ---------------------------------------------------------------------------
  const CSS = [
    '@page{size:A4;margin:3cm 2cm 2cm 3cm}body{font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.5;color:#111;max-width:17cm;margin:0 auto}',
    '.capa{text-align:center;padding-top:6cm}.capa p{margin:.4cm 0}.capa .c0{font-size:22pt;font-weight:bold;letter-spacing:1px}.capa .c1{font-size:14pt}',
    'h1{font-size:12pt;text-transform:uppercase;margin:18pt 0 6pt}h2{font-size:11pt;margin:12pt 0 4pt}p{text-align:justify;margin:0 0 8pt}',
    'p.mono{font-family:Consolas,monospace;font-size:9.5pt;text-align:left;background:#f4f4f4;padding:6pt}p.destaque{font-weight:bold}',
    'table{border-collapse:collapse;width:100%;margin:6pt 0 10pt;font-size:9.5pt}th,td{border:1px solid #888;padding:2pt 5pt;text-align:left;vertical-align:top}th{background:#e8e8e8}',
    '.foto img{max-width:100%;max-height:12cm;display:block;margin:0 auto}.legenda{text-align:center;font-style:italic;font-size:9pt}table.pequena{font-size:7.5pt}mark{background:#fff27a}.quebra{page-break-after:always}.graf{page-break-inside:avoid;margin:8pt 0}.graf svg{width:100%;height:auto}',
    '.assin{margin-top:36pt;text-align:center}.assin .linha{margin-top:40pt;border-top:1px solid #000;width:9cm;margin-left:auto;margin-right:auto}',
    '.g-grade{stroke:#e3e3e3}.g-borda{fill:none;stroke:#888}.g-texto{font:10px Arial;fill:#444}.g-titulo{font:bold 11px Arial;fill:#222}.g-ponto{fill:#2d5b8a}.g-ponto-alerta{fill:#c0392b}',
    '.g-linha{stroke:#555;stroke-dasharray:4 3}.g-limite{stroke:#c0392b;stroke-dasharray:2 3}.g-barra{fill:#9db7d3}.g-curva{fill:none;stroke:#c0392b;stroke-width:1.5}.g-num{font:9px Arial;fill:#333}.g-avaliando{fill:#e0a000;stroke:#333}'
  ].join('\n');
  L.CSS_GRAFICO = CSS.split('\n').filter(function (l) { return /^\.g-/.test(l); }).join('\n');

  const marcar = function (t) { return U.esc(t).replace(/\[preencher:[^\]]*\]/g, function (x) { return '<mark>' + x + '</mark>'; }); };
  L.html = function (laudo) {
    let h = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + U.esc(laudo.titulo) + '</title><style>' + CSS + '</style></head><body>';
    laudo.blocos.forEach(function (b) {
      switch (b.t) {
        case 'capa': h += '<div class="capa">' + b.linhas.map(function (l, i) { return '<p class="c' + Math.min(i, 2) + '">' + marcar(l) + '</p>'; }).join('') + '</div>'; break;
        case 'h1': h += '<h1>' + marcar(b.texto) + '</h1>'; break;
        case 'h2': h += '<h2>' + marcar(b.texto) + '</h2>'; break;
        case 'p': h += '<p class="' + (b.mono ? 'mono' : '') + (b.destaque ? ' destaque' : '') + '">' + marcar(b.texto) + '</p>'; break;
        case 'tabela': h += '<table class="' + (b.pequena ? 'pequena' : '') + '"><thead><tr>' + b.cab.map(function (c) { return '<th>' + U.esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>'
          + b.linhas.map(function (l) { return '<tr>' + l.map(function (c) { return '<td>' + marcar(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>'; break;
        case 'grafico': h += '<div class="graf">' + b.svg + '</div>'; break;
        case 'imagem': h += '<div class="graf foto"><img src="' + b.dataUrl + '" alt="' + U.esc(b.titulo) + '"><div class="legenda">' + U.esc(b.titulo) + '</div></div>'; break;
        case 'quebra': h += '<div class="quebra"></div>'; break;
        case 'assinatura': h += '<div class="assin"><p>' + marcar(b.linhas[0]) + '</p><div class="linha"></div>' + b.linhas.slice(1).map(function (l) { return '<div>' + marcar(l) + '</div>'; }).join('') + '</div>'; break;
      }
    });
    return h + '</body></html>';
  };

  // ---------------------------------------------------------------------------
  // Saída em Word (.docx)
  // ---------------------------------------------------------------------------
  // imagens: { indiceDoBloco: { png: Uint8Array, largura, altura } } — os
  // gráficos já convertidos em PNG pela tela (o Word não lê SVG antigo).
  L.docx = function (laudo, imagens) {
    const X = INF.Planilha.xmlEsc;
    const rels = [], midia = [];
    let idDesenho = 1;

    // texto com os trechos "[preencher: ...]" realçados em amarelo
    const runs = function (texto, opcoes) {
      const op = opcoes || {};
      const pr = '<w:rPr>' + (op.negrito ? '<w:b/>' : '') + (op.mono ? '<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/><w:sz w:val="19"/>' : '') + (op.tam ? '<w:sz w:val="' + op.tam + '"/>' : '') + '</w:rPr>';
      return String(texto).split(/(\[preencher:[^\]]*\])/).filter(Boolean).map(function (pedaco) {
        const marca = /^\[preencher:/.test(pedaco);
        return '<w:r>' + (marca ? pr.replace('</w:rPr>', '<w:highlight w:val="yellow"/></w:rPr>') : pr) + '<w:t xml:space="preserve">' + X(pedaco) + '</w:t></w:r>';
      }).join('');
    };
    const paragrafo = function (texto, estilo, opcoes) {
      const op = opcoes || {};
      return '<w:p><w:pPr>' + (estilo ? '<w:pStyle w:val="' + estilo + '"/>' : '') + (op.centro ? '<w:jc w:val="center"/>' : '') + '</w:pPr>' + runs(texto, op) + '</w:p>';
    };
    const tabela = function (b) {
      const nc = b.cab.length, larg = Math.floor(9070 / nc);
      const tam = b.pequena ? 14 : 18;
      const cel = function (t, cab) {
        return '<w:tc><w:tcPr><w:tcW w:w="' + larg + '" w:type="dxa"/>' + (cab ? '<w:shd w:val="clear" w:color="auto" w:fill="E8E8E8"/>' : '') + '</w:tcPr>'
          + '<w:p><w:pPr><w:spacing w:before="0" w:after="0" w:line="240" w:lineRule="auto"/></w:pPr>' + runs(t, { negrito: cab, tam: tam }) + '</w:p></w:tc>';
      };
      return '<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>'
        + ['top', 'left', 'bottom', 'right', 'insideH', 'insideV'].map(function (l) { return '<w:' + l + ' w:val="single" w:sz="4" w:space="0" w:color="888888"/>'; }).join('')
        + '</w:tblBorders><w:tblCellMar><w:left w:w="70" w:type="dxa"/><w:right w:w="70" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>'
        + b.cab.map(function () { return '<w:gridCol w:w="' + larg + '"/>'; }).join('') + '</w:tblGrid>'
        + '<w:tr><w:trPr><w:tblHeader/></w:trPr>' + b.cab.map(function (c) { return cel(c, true); }).join('') + '</w:tr>'
        + b.linhas.map(function (l) { return '<w:tr>' + l.map(function (c) { return cel(c, false); }).join('') + '</w:tr>'; }).join('')
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
    const figura = function (img, titulo) {
      const n = midia.length + 1, rid = 'rIdImg' + n, ext = img.ext || 'png';
      midia.push({ nome: 'word/media/imagem' + n + '.' + ext, bytes: img.png });
      rels.push('<Relationship Id="' + rid + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/imagem' + n + '.' + ext + '"/>');
      // largura de 15 cm; foto em pé limitada a 12 cm de altura (EMU: 1 cm = 360.000)
      let cx = 5400000, cy = Math.round(cx * img.altura / img.largura);
      if (cy > 4320000) { cx = Math.round(cx * 4320000 / cy); cy = 4320000; }
      const id = idDesenho++;
      return '<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="' + cx + '" cy="' + cy + '"/>'
        + '<wp:docPr id="' + id + '" name="Gráfico ' + id + '"/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>'
        + '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="' + id + '" name="imagem' + n + '.' + ext + '"/><pic:cNvPicPr/></pic:nvPicPr>'
        + '<pic:blipFill><a:blip r:embed="' + rid + '"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
        + '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="' + cx + '" cy="' + cy + '"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'
        + paragrafo(titulo, 'Legenda');
    };

    let corpo = '';
    laudo.blocos.forEach(function (b, i) {
      switch (b.t) {
        case 'capa':
          corpo += '<w:p><w:pPr><w:spacing w:before="3000"/></w:pPr></w:p>';
          b.linhas.forEach(function (l, k) { corpo += paragrafo(l, k === 0 ? 'Titulo' : '', { centro: true, negrito: k === 0, tam: k === 1 ? 28 : null }); });
          break;
        case 'h1': corpo += paragrafo(b.texto, 'Titulo1'); break;
        case 'h2': corpo += paragrafo(b.texto, 'Titulo2'); break;
        case 'p': corpo += paragrafo(b.texto, b.mono ? '' : 'Corpo', { mono: b.mono, negrito: b.destaque }); break;
        case 'tabela': corpo += tabela(b); break;
        case 'grafico': if (imagens && imagens[i]) corpo += figura(imagens[i], b.titulo); break;
        case 'imagem': corpo += figura(deDataUrl(b), b.titulo); break;
        case 'quebra': corpo += '<w:p><w:r><w:br w:type="page"/></w:r></w:p>'; break;
        case 'assinatura':
          corpo += paragrafo(b.linhas[0], 'Corpo');
          corpo += '<w:p><w:pPr><w:spacing w:before="1200"/><w:jc w:val="center"/></w:pPr><w:r><w:t>______________________________________</w:t></w:r></w:p>';
          b.linhas.slice(1).forEach(function (l) { corpo += paragrafo(l, '', { centro: true }); });
          break;
      }
    });

    const NS = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      + 'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';
    // página A4, margens ABNT (sup. e esq. 3 cm; inf. e dir. 2 cm), rodapé com número da página
    const documento = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document ' + NS + '><w:body>' + corpo
      + '<w:sectPr><w:footerReference w:type="default" r:id="rIdRodape"/><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1701" w:right="1134" w:bottom="1134" w:left="1701" w:header="709" w:footer="709" w:gutter="0"/></w:sectPr></w:body></w:document>';
    const rodape = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr ' + NS + '><w:p><w:pPr><w:jc w:val="right"/></w:pPr><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:rPr><w:sz w:val="18"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>';
    const estilos = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
      + '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:eastAsia="Arial" w:cs="Arial"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="pt-BR"/></w:rPr></w:rPrDefault>'
      + '<w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="360" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
      + '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Corpo"><w:name w:val="Body Text"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="both"/></w:pPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="44"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Corpo"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:caps/><w:sz w:val="24"/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Titulo2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Corpo"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/></w:rPr></w:style>'
      + '<w:style w:type="paragraph" w:styleId="Legenda"><w:name w:val="caption"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:i/><w:sz w:val="18"/></w:rPr></w:style>'
      + '</w:styles>';
    const agora = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    // propriedades do arquivo: autor = responsável técnico (nada de nome de programa)
    const nucleo = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">'
      + '<dc:title>' + X(laudo.titulo) + '</dc:title><dc:creator>' + X(laudo.autor) + '</dc:creator><cp:lastModifiedBy>' + X(laudo.autor) + '</cp:lastModifiedBy>'
      + '<dcterms:created xsi:type="dcterms:W3CDTF">' + agora + '</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">' + agora + '</dcterms:modified></cp:coreProperties>';

    const arquivos = [
      { nome: '[Content_Types].xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/>'
        + '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
        + '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>' },
      { nome: '_rels/.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>' },
      { nome: 'docProps/core.xml', texto: nucleo },
      { nome: 'word/document.xml', texto: documento },
      { nome: 'word/styles.xml', texto: estilos },
      { nome: 'word/footer1.xml', texto: rodape },
      { nome: 'word/_rels/document.xml.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdEstilos" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdRodape" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>' + rels.join('') + '</Relationships>' }
    ].concat(midia);
    return INF.Planilha.zip(arquivos);
  };

  INF.Laudo = L;
})(globalThis.INF = globalThis.INF || {});
