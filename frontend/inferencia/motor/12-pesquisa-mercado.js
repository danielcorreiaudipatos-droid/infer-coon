/* =============================================================================
   12-pesquisa-mercado.js — Pesquisa de ofertas e transações
   -----------------------------------------------------------------------------
   O que este módulo faz e o que ele NÃO faz:

   · FAZ: abre a busca pronta nos portais (Google restrito ao site, porque
     os endereços internos dos portais mudam toda hora), com tipo de imóvel,
     finalidade e município já preenchidos.
   · FAZ: lê o texto de um anúncio copiado (Ctrl+A, Ctrl+C na página) e
     extrai preço, área, telefone, quartos, vagas e link, calculando o VU.
     O avaliador confere e grava como amostra, com natureza "oferta".
   · FAZ: importa transações (ITBI da prefeitura, cartório, SIMIL) por CSV,
     com natureza "transação" — sem fator de oferta.
   · NÃO FAZ: raspagem automática dos portais. Os termos de uso de ZAP,
     VivaReal, OLX e similares proíbem, os sites bloqueiam, e amostra de
     laudo precisa ser conferida por gente (telefone, visita, foto). A
     automação cega é justamente o que gera amostra falsa em laudo.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const PM = {};

  // Portais e fontes. "site" vai no operador site: do Google.
  PM.PORTAIS = [
    { nome: 'ZAP Imóveis',      site: 'zapimoveis.com.br',    uso: 'urbano e rural' },
    { nome: 'VivaReal',         site: 'vivareal.com.br',      uso: 'urbano' },
    { nome: 'OLX',              site: 'olx.com.br',           uso: 'urbano e rural (particular)' },
    { nome: 'Imovelweb',        site: 'imovelweb.com.br',     uso: 'urbano e rural' },
    { nome: 'Chaves na Mão',    site: 'chavesnamao.com.br',   uso: 'urbano e rural' },
    { nome: 'QuintoAndar',      site: 'quintoandar.com.br',   uso: 'urbano (grandes cidades)' },
    { nome: 'Leilões Caixa',    site: 'venda-imoveis.caixa.gov.br', uso: 'referência (não é mercado livre)' },
    { nome: 'MF Rural',         site: 'mfrural.com.br',       uso: 'rural' },
    { nome: 'Imóveis Rurais',   site: 'imoveisrurais.com.br', uso: 'rural' }
  ];

  // Fontes de transação/referência (acesso manual, conforme cada órgão).
  PM.FONTES_TRANSACAO = [
    { nome: 'ITBI da prefeitura', obs: 'Pedir base de transações ao setor de tributos; conferir subdeclaração.' },
    { nome: 'Cartório de Registro de Imóveis', obs: 'Valor declarado na escritura/matrícula.' },
    { nome: 'SIMIL / Caixa', obs: 'Base de laudos da Caixa, para quem é credenciado.' },
    { nome: 'INCRA — Planilha de Preços Referenciais (PPR)', obs: 'Rural: preços de terra por região (referência, não amostra).' },
    { nome: 'IEA-SP / EMATER / Deral-PR', obs: 'Rural: levantamentos periódicos de preço de terra.' },
    { nome: 'FipeZAP', obs: 'Urbano: índice de preço anunciado para atualização temporal.' }
  ];

  // Monta a URL de busca no Google restrita a um portal.
  PM.urlBusca = function (portal, tipo, finalidade, municipio, uf) {
    const termos = [tipo, finalidade, municipio, uf].filter(Boolean).join(' ');
    return 'https://www.google.com/search?q=' + encodeURIComponent('site:' + portal.site + ' ' + termos);
  };

  // ---------------------------------------------------------------------------
  // Extração de dados do texto de um anúncio
  // ---------------------------------------------------------------------------
  // Procura padrões comuns: "R$ 3.440.000", "172 ha", "450 m²", "3 quartos",
  // "2 vagas", telefones com DDD. Quando há vários preços (condomínio, IPTU),
  // fica com o MAIOR, que é o preço de venda. Área: prefere "ha"/"alqueire"
  // no rural e "m²" no urbano; o avaliador corrige o que precisar.
  PM.extrairAnuncio = function (texto, urlOpcional) {
    const t = String(texto || '').replace(/ /g, ' ');
    const r = { preco: NaN, area: NaN, unidadeArea: '', quartos: NaN, vagas: NaN, telefone: '', link: urlOpcional || '', vu: NaN, avisos: [] };

    // preços
    const precos = [];
    const rePreco = /R\$\s*([\d.]+(?:,\d{1,2})?)\s*(mil|milh[õo]es|mi)?/gi;
    let m;
    while ((m = rePreco.exec(t))) {
      let v = U.lerNumero(m[1]);
      if (m[2]) v *= /mil$/i.test(m[2]) ? 1e3 : 1e6;
      if (Number.isFinite(v)) precos.push(v);
    }
    if (precos.length) r.preco = Math.max.apply(null, precos);
    if (precos.length > 1) r.avisos.push('Achei ' + precos.length + ' valores em R$; usei o maior (' + U.fmtMoeda(r.preco) + '). Confira.');

    // área em hectare / alqueire / m²
    const ha = t.match(/([\d.]+(?:,\d+)?)\s*(ha|hectares?)\b/i);
    const alq = t.match(/([\d.]+(?:,\d+)?)\s*(alqueires?)(\s*(mineiros?|paulistas?|goianos?|baianos?))?/i);
    const m2s = [];
    const reM2 = /([\d.]+(?:,\d+)?)\s*(m²|m2|metros\s*quadrados)/gi;
    while ((m = reM2.exec(t))) { const v = U.lerNumero(m[1]); if (Number.isFinite(v)) m2s.push(v); }
    if (ha) { r.area = U.lerNumero(ha[1]); r.unidadeArea = 'ha'; }
    else if (alq) {
      // alqueire mineiro/goiano = 4,84 ha; paulista = 2,42 ha; baiano = 9,68 ha
      const tipo = (alq[4] || '').toLowerCase();
      const fator = /paulista/.test(tipo) ? 2.42 : /baiano/.test(tipo) ? 9.68 : 4.84;
      r.area = U.lerNumero(alq[1]) * fator; r.unidadeArea = 'ha';
      r.avisos.push('Área em alqueire convertida com ' + U.fmt(fator, 2) + ' ha/alqueire' + (tipo ? ' (' + tipo + ')' : ' (mineiro, padrão)') + '. Confirme o tipo de alqueire.');
    } else if (m2s.length) {
      // vários m²: normalmente área útil, total, terreno. Fica com o maior
      // e avisa (o avaliador escolhe qual é a certa para a variável).
      r.area = Math.max.apply(null, m2s); r.unidadeArea = 'm²';
      if (m2s.length > 1) r.avisos.push('Várias áreas em m² (' + m2s.map(function (v) { return U.fmt(v, 0); }).join(', ') + '); usei a maior.');
    }

    const q = t.match(/(\d+)\s*(quartos?|dormit[óo]rios?|dorms?)/i); if (q) r.quartos = +q[1];
    const vg = t.match(/(\d+)\s*(vagas?)/i); if (vg) r.vagas = +vg[1];
    const tel = t.match(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/); if (tel) r.telefone = tel[0].trim();
    if (!r.link) { const u = t.match(/https?:\/\/\S+/); if (u) r.link = u[0]; }

    if (Number.isFinite(r.preco) && Number.isFinite(r.area) && r.area > 0) r.vu = r.preco / r.area;
    if (!Number.isFinite(r.preco)) r.avisos.push('Não achei o preço.');
    if (!Number.isFinite(r.area)) r.avisos.push('Não achei a área.');
    return r;
  };

  INF.Pesquisa = PM;
})(globalThis.INF = globalThis.INF || {});
