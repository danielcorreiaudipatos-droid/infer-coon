/* =============================================================================
   17-planilha.js — Exportação para Excel (.xlsx de verdade)
   -----------------------------------------------------------------------------
   Um .xlsx é um arquivo ZIP com alguns XML dentro. Aqui montamos esses XML
   e o ZIP "na mão" (sem compressão, que o Excel aceita), sem biblioteca.
   Números vão como número (dá para fazer conta no Excel), texto como texto.

   Uso:  INF.Planilha.pastaCompleta(estado) → Uint8Array com o .xlsx
         estado = { proj, modelo, diag, projecao, busca }
   Abas geradas (as que tiverem conteúdo):
     Identificação · Amostras · Estatística · Variáveis · Regressores ·
     ANOVA e indicadores · Resíduos · Correlações · Normalidade ·
     Fundamentação · Projeção · Busca de modelos · Histórico · Critérios NBR
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, N = INF.NBR;
  const P = {};

  // ---------------------------------------------------------------------------
  // CRC-32 (exigido pelo formato ZIP para cada arquivo)
  // ---------------------------------------------------------------------------
  const TABELA_CRC = (function () {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  // ---------------------------------------------------------------------------
  // ZIP sem compressão ("stored")
  // ---------------------------------------------------------------------------
  // arquivos: [{ nome, texto }] ou [{ nome, bytes: Uint8Array }] (imagens do Word)
  function zip(arquivos) {
    const cod = new TextEncoder();
    const partes = [], central = [];
    let deslocamento = 0;
    const u16 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF]; };
    const u32 = function (v) { return [v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]; };
    arquivos.forEach(function (a) {
      const nome = cod.encode(a.nome), dados = a.bytes || cod.encode(a.texto), crc = crc32(dados);
      // cabeçalho local
      const local = [].concat([0x50, 0x4B, 0x03, 0x04], u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
        u32(crc), u32(dados.length), u32(dados.length), u16(nome.length), u16(0));
      partes.push(new Uint8Array(local), nome, dados);
      // entrada no diretório central
      central.push(new Uint8Array([].concat([0x50, 0x4B, 0x01, 0x02], u16(20), u16(20), u16(0x0800), u16(0), u16(0), u16(0x21),
        u32(crc), u32(dados.length), u32(dados.length), u16(nome.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(deslocamento))), nome);
      deslocamento += local.length + nome.length + dados.length;
    });
    const tamCentral = central.reduce(function (s, p) { return s + p.length; }, 0);
    const fim = new Uint8Array([].concat([0x50, 0x4B, 0x05, 0x06], u16(0), u16(0), u16(arquivos.length), u16(arquivos.length), u32(tamCentral), u32(deslocamento), u16(0)));
    const todas = partes.concat(central, [fim]);
    const total = todas.reduce(function (s, p) { return s + p.length; }, 0);
    const out = new Uint8Array(total);
    let pos = 0;
    todas.forEach(function (p) { out.set(p, pos); pos += p.length; });
    return out;
  }

  // ---------------------------------------------------------------------------
  // XML das abas
  // ---------------------------------------------------------------------------
  const xmlEsc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  };
  function colunaLetra(i) {  // 0 → A, 26 → AA
    let s = '';
    for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s;
    return s;
  }
  // linhas: array de arrays; a primeira linha de cada bloco pode ser título.
  // Célula { t: 'texto', negrito: true } para cabeçalho.
  function abaXml(linhas) {
    let larguras = [];
    let x = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>';
    linhas.forEach(function (linha, r) {
      x += '<row r="' + (r + 1) + '">';
      (linha || []).forEach(function (c, ci) {
        if (c === null || c === undefined || c === '') return;
        const ref = colunaLetra(ci) + (r + 1);
        const negrito = typeof c === 'object' && c.negrito;
        const v = typeof c === 'object' ? c.t : c;
        const estilo = negrito ? ' s="1"' : '';
        if (typeof v === 'number') {
          if (!Number.isFinite(v)) return;
          x += '<c r="' + ref + '"' + estilo + '><v>' + v + '</v></c>';
        } else {
          x += '<c r="' + ref + '" t="inlineStr"' + estilo + '><is><t xml:space="preserve">' + xmlEsc(v) + '</t></is></c>';
        }
        larguras[ci] = Math.min(60, Math.max(larguras[ci] || 8, String(v).length + 2));
      });
      x += '</row>';
    });
    x += '</sheetData></worksheet>';
    // larguras de coluna (inseridas antes de sheetData)
    const cols = '<cols>' + larguras.map(function (w, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (w || 10) + '" customWidth="1"/>'; }).join('') + '</cols>';
    return larguras.length ? x.replace('<sheetData>', cols + '<sheetData>') : x;
  }

  // Monta o .xlsx a partir de [{ nome, linhas }].
  P.gerar = function (abas) {
    const nomes = abas.map(function (a, i) {
      return (a.nome.replace(/[\[\]:*?\/\\]/g, ' ').slice(0, 31) || ('Aba ' + (i + 1)));
    });
    const arquivos = [
      { nome: '[Content_Types].xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
        + abas.map(function (_, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>' },
      { nome: '_rels/.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { nome: 'xl/workbook.xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>'
        + nomes.map(function (n, i) { return '<sheet name="' + xmlEsc(n) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets></workbook>' },
      { nome: 'xl/_rels/workbook.xml.rels', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        + abas.map(function (_, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('')
        + '<Relationship Id="rId' + (abas.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { nome: 'xl/styles.xml', texto: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>' }
    ];
    abas.forEach(function (a, i) { arquivos.push({ nome: 'xl/worksheets/sheet' + (i + 1) + '.xml', texto: abaXml(a.linhas) }); });
    return zip(arquivos);
  };

  // ---------------------------------------------------------------------------
  // Pasta completa do trabalho
  // ---------------------------------------------------------------------------
  const cab = function (lista) { return lista.map(function (t) { return { t: t, negrito: true }; }); };
  const num = function (v) { const n = U.lerNumero(v); return Number.isFinite(n) ? n : ''; };

  P.pastaCompleta = function (e) {
    const p = e.proj, m = e.modelo && !e.modelo.erro ? e.modelo : null, d = e.diag, pr = e.projecao && !e.projecao.erro ? e.projecao : null;
    const abas = [];

    abas.push({ nome: 'Identificação', linhas: [cab(['Campo', 'Informação']),
      ['Trabalho', p.projeto.nome], ['Responsável técnico', p.projeto.autor], ['Tipologia', p.projeto.tipologia],
      ['Município', p.projeto.municipio], ['Finalidade', p.projeto.finalidade], ['Data base', p.projeto.dataBase],
      ['Fator de oferta', p.config.aplicarFatorOferta ? p.config.fatorOferta : 'não aplicado'],
      ['Nível do intervalo', p.config.nivelIC], ['Estimativa (y em ln)', p.config.estimativaLn],
      ['Critérios', N.NORMA.referencia], ['Versão do motor', INF.VERSAO]] });

    const vars = p.variaveis;
    abas.push({ nome: 'Amostras', linhas: [cab(['Nº', 'No cálculo', 'Natureza', 'Data', 'Endereço', 'Bairro', 'Informante', 'Telefone', 'Link', 'Latitude', 'Longitude', 'Observação'].concat(vars.map(function (v) { return v.nome + (v.unidade ? ' (' + v.unidade + ')' : ''); })))]
      .concat(p.amostras.map(function (a) {
        return [a.id, a.habilitada === false ? 'não' : 'sim', a.natureza === 'transacao' ? 'transação' : 'oferta', a.data, a.endereco, a.bairro, a.informante, a.telefone, a.link, num(a.lat), num(a.lon), a.obs]
          .concat(vars.map(function (v) { const n = U.lerNumero(a.valores[v.nome]); return Number.isFinite(n) ? n : (a.valores[v.nome] || ''); }));
      })) });

    const desc = INF.Diag.descritivaProjeto(p);
    abas.push({ nome: 'Estatística', linhas: [cab(['Variável', 'Unidade', 'n', 'Média', 'Mediana', 'Desvio padrão', 'CV', 'Mínimo', '1º quartil', '3º quartil', 'Máximo', 'Assimetria'])]
      .concat(desc.linhas.map(function (x) { return [x.nome, x.unidade, x.n, x.media, x.mediana, x.desvio, x.cv, x.min, x.q1, x.q3, x.max, x.assimetria]; })) });

    abas.push({ nome: 'Variáveis', linhas: [cab(['Variável', 'Tipo', 'Unidade', 'Direção esperada', 'Escala no modelo', 'Códigos', 'Descrição'])]
      .concat(vars.map(function (v) {
        const t = p.modelo.transf[v.nome];
        return [v.nome, v.tipo, v.unidade, v.direcao, t ? (T.porId[t] || {}).rotulo || t : '', Object.keys(v.codigos || {}).map(function (c) { return c + '=' + v.codigos[c]; }).join('; '), v.descricao];
      })) });

    if (m) {
      abas.push({ nome: 'Regressores', linhas: [['Equação', m.equacao], ['Forma explícita', INF.Regressao.equacaoExplicita(m)], [],
        cab(['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't calculado', 'Significância', 'Elasticidade (%)', 'VIF', 'Mínimo', 'Média', 'Máximo']),
        ['Constante', '', m.b[0], m.ep[0], m.t[0], m.sig[0]]]
        .concat(m.indep.map(function (v, j) {
          return [v.nome, T.porId[v.transf].rotulo, m.b[j + 1], m.ep[j + 1], m.t[j + 1], m.sig[j + 1], m.elasticidade[j].elasticidade, d ? d.vif[j].vif : '', m.faixa[j].min, m.faixa[j].media, m.faixa[j].max];
        })) });

      abas.push({ nome: 'ANOVA e indicadores', linhas: [cab(['Fonte de variação', 'Soma dos quadrados', 'Graus de liberdade', 'Quadrado médio', 'F calculado', 'Significância']),
        ['Regressão', m.SQReg, m.glReg, m.SQReg / m.glReg, m.F, m.sigF], ['Resíduo', m.SQRes, m.gl, m.s2], ['Total', m.SQTot, m.n - 1], [],
        cab(['Indicador', 'Valor']), ['Dados utilizados (n)', m.n], ['Variáveis independentes (k)', m.p - 1], ['Correlação (r)', m.r],
        ['Determinação (R²)', m.R2], ['R² ajustado', m.R2aj], ['Erro padrão da regressão', m.s],
        ['R² de previsão (PRESS)', d ? d.prev.R2previsao : ''], ['AIC', d ? d.prev.AIC : ''], ['BIC', d ? d.prev.BIC : ''], ['Durbin-Watson', d ? d.dw : '']] });

      if (d) {
        abas.push({ nome: 'Resíduos', linhas: [cab(['Nº', 'Observado', 'Estimado', 'Resíduo', 'Padronizado', 'Studentizado', 'Alavancagem', 'Distância de Cook', 'Outlier (|r|>2)', 'Influente (Cook>1)'])]
          .concat(d.residuos.map(function (r) { return [r.id, r.observado, r.estimado, r.residuo, r.padronizado, r.studentizado, r.alavancagem, r.cook, r.outlier ? 'sim' : 'não', r.influente ? 'sim' : 'não']; })) });

        const nomes = d.correl.nomes;
        const blocoCorrel = function (titulo, M) {
          return [[{ t: titulo, negrito: true }], cab([''].concat(nomes))].concat(nomes.map(function (n, a) { return [n].concat(nomes.map(function (_, b) { return M ? M[a][b] : ''; })); }));
        };
        abas.push({ nome: 'Correlações', linhas: blocoCorrel('Correlações isoladas', d.correl.isoladas).concat([[]], blocoCorrel('Correlações parciais', d.correl.parciais)) });

        abas.push({ nome: 'Normalidade', linhas: [cab(['Intervalo', 'Curva normal', 'Modelo'])]
          .concat(d.proporcoes.map(function (q) { return [q.faixa, q.esperado, q.obtido]; }))
          .concat([[], cab(['Teste', 'Estatística', 'Valor-p']),
            ['Shapiro-Wilk', d.sw.estatistica, d.sw.p], ['Kolmogorov-Smirnov (Lilliefors)', d.ks.estatistica, d.ks.p],
            ['Jarque-Bera', d.jb.estatistica, d.jb.p], ['Breusch-Pagan (homocedasticidade)', d.bp.estatistica, d.bp.p],
            ['Durbin-Watson', d.dw, '']]) });
      }

      const fund = pr ? pr.fundamentacao : N.fundamentacaoPreliminar(m, p.config);
      abas.push({ nome: 'Fundamentação', linhas: [cab(['Item', 'Descrição', 'Situação', 'Grau', 'Pontos'])]
        .concat(fund.itens.map(function (it) { return [it.item, it.descricao, it.detalhe, N.romano(it.grau), it.pontos]; }))
        .concat([[], ['Total de pontos', fund.pontos], ['Grau de fundamentação', N.romano(fund.grau) + (fund.preliminar ? ' (preliminar)' : '')],
          ['Grau de precisão', pr ? N.romano(pr.grauPrecisao) : 'estimar o avaliando']]) });
    }

    if (pr) {
      abas.push({ nome: 'Projeção', linhas: [cab(['Característica do avaliando', 'Valor'])]
        .concat(m.indep.map(function (v) { return [v.nome, num(p.avaliando.valores[v.nome])]; }))
        .concat([[], cab(['Resultado', 'Valor unitário', 'Valor total']),
          ['Estimativa pela mediana', pr.estimativas.mediana, pr.area ? pr.estimativas.mediana * pr.area : ''],
          ['Estimativa pela média', pr.estimativas.media, pr.area ? pr.estimativas.media * pr.area : ''],
          ['Estimativa pela moda', pr.estimativas.moda, pr.area ? pr.estimativas.moda * pr.area : ''],
          ['Estimativa adotada (' + pr.estimativa + ')', pr.central, pr.totalCentral || ''],
          ['IC ' + Math.round(pr.nivel * 100) + '% — mínimo', pr.icMin, pr.totalMin || ''], ['IC ' + Math.round(pr.nivel * 100) + '% — máximo', pr.icMax, pr.totalMax || ''],
          ['Predição — mínimo', pr.ipMin, pr.area ? pr.ipMin * pr.area : ''], ['Predição — máximo', pr.ipMax, pr.area ? pr.ipMax * pr.area : ''],
          ['Campo de arbítrio — mínimo', pr.arbitrioMin, pr.area ? pr.arbitrioMin * pr.area : ''], ['Campo de arbítrio — máximo', pr.arbitrioMax, pr.area ? pr.arbitrioMax * pr.area : ''],
          ['Amplitude do IC', pr.amplitude], ['Grau de precisão', N.romano(pr.grauPrecisao)], ['Grau de fundamentação', N.romano(pr.fundamentacao.grau)]]) });
    }

    if (e.busca && e.busca.modelos && e.busca.modelos.length) {
      const nomesV = Object.keys(e.busca.modelos[0].transf);
      abas.push({ nome: 'Busca de modelos', linhas: [cab(['#'].concat(nomesV, ['k', 'R²', 'R² ajustado', 'R² escala original', 'Sig máxima', 'Sig F', 'Sinais coerentes']))]
        .concat(e.busca.modelos.map(function (r, i) {
          return [i + 1].concat(nomesV.map(function (n) { return (T.porId[r.transf[n]] || {}).rotulo || r.transf[n]; }), [r.k, r.R2, r.R2aj, r.R2orig, r.sigMax, r.sigF, r.sinaisOk ? 'sim' : 'não']);
        })) });
    }

    if (p.historico && p.historico.length) {
      abas.push({ nome: 'Histórico', linhas: [cab(['Quando', 'Origem', 'Amostra', 'Ação', 'Campo', 'De', 'Para', 'Evidência', 'Desfeito em'])]
        .concat(p.historico.map(function (r) { return [r.quando, r.origem, r.amostra || '', r.acao, r.campo || '', String(r.de), String(r.para), r.evidencia, r.desfeito || '']; })) });
    }

    const K = N.NORMA;
    abas.push({ nome: 'Critérios NBR', linhas: [[K.referencia], [], cab(['Item', 'Grau III', 'Grau II', 'Grau I']),
      ['2 — quantidade de dados (múltiplo de k+1)', K.item2.III, K.item2.II, K.item2.I],
      ['5 — Sig máxima dos regressores', K.item5.III, K.item5.II, K.item5.I],
      ['6 — Sig máxima do F', K.item6.III, K.item6.II, K.item6.I],
      ['Precisão — amplitude máxima do IC 80%', K.precisao.III, K.precisao.II, K.precisao.I],
      ['Enquadramento — pontos mínimos', K.enquadramento.III.pontos, K.enquadramento.II.pontos, K.enquadramento.I.pontos]] });

    return P.gerar(abas);
  };

  P.zip = zip;              // reaproveitado pelo gerador do laudo em Word (18-laudo.js)
  P.xmlEsc = xmlEsc;

  INF.Planilha = P;
})(globalThis.INF = globalThis.INF || {});
