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
