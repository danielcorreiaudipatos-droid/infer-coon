/* =============================================================================
   14-relatorio.js — Relatório estatístico para anexar ao laudo
   -----------------------------------------------------------------------------
   Gera um documento HTML completo e autossuficiente (CSS embutido, gráficos
   em SVG), pronto para imprimir em PDF pelo navegador. Roda igual no
   navegador e no servidor (é só montagem de texto).

   Conteúdo, na ordem em que o laudo costuma apresentar:
     1. Identificação do trabalho
     2. Amostras utilizadas (com natureza, fonte e fator aplicado)
     3. Variáveis, escalas e estatísticas descritivas
     4. Equação do modelo
     5. Resultados: coeficientes, t, Sig, elasticidades, R², F
     6. Pressupostos: normalidade, homocedasticidade, autocorrelação,
        colinearidade, outliers e pontos influentes
     7. Gráficos
     8. Projeção do avaliando, IC 80%, campo de arbítrio
     9. Graus de fundamentação e precisão (Tabelas 1, 2 e 5 da NBR)

   O texto é neutro e técnico; a assinatura é do responsável técnico
   informado no projeto.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, N = INF.NBR, G = INF.Graficos, Rg = INF.Regressao;
  const Rel = {};

  const CSS = [
    'body{font-family:Georgia,"Times New Roman",serif;color:#1d1d1f;max-width:900px;margin:32px auto;padding:0 20px;line-height:1.45;font-size:13px}',
    'h1{font-size:20px;margin:0 0 4px}h2{font-size:15px;border-bottom:1px solid #999;padding-bottom:3px;margin-top:26px}',
    'table{border-collapse:collapse;width:100%;margin:8px 0;font-size:12px}th,td{border:1px solid #bbb;padding:3px 6px;text-align:right}',
    'th{background:#eee}td.t,th.t{text-align:left}.eq{font-family:Consolas,monospace;background:#f5f5f5;padding:8px;border:1px solid #ddd;overflow-wrap:anywhere}',
    '.graf{display:grid;grid-template-columns:1fr 1fr;gap:10px}.graf svg{width:100%;height:auto;border:1px solid #ddd}',
    '.g-grade{stroke:#e3e3e3}.g-borda{fill:none;stroke:#888}.g-texto{font:10px Arial;fill:#444}.g-titulo{font:bold 11px Arial;fill:#222}',
    '.g-ponto{fill:#2d5b8a}.g-ponto-alerta{fill:#c0392b}.g-linha{stroke:#555;stroke-dasharray:4 3}.g-limite{stroke:#c0392b;stroke-dasharray:2 3}',
    '.g-avaliando{fill:#e0a000;stroke:#333}.g-barra{fill:#9db7d3}.g-curva{fill:none;stroke:#c0392b;stroke-width:1.5}.g-num{font:9px Arial;fill:#333}',
    '.pequeno{font-size:11px;color:#555}.assin{margin-top:48px;text-align:center}',
    '@media print{body{margin:0}h2{page-break-after:avoid}table,svg{page-break-inside:avoid}}'
  ].join('\n');

  function tabela(cab, linhas, alinharTexto) {
    let h = '<table><thead><tr>' + cab.map(function (c, i) { return '<th' + (alinharTexto && alinharTexto.indexOf(i) >= 0 ? ' class="t"' : '') + '>' + U.esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    linhas.forEach(function (l) {
      h += '<tr>' + l.map(function (c, i) { return '<td' + (alinharTexto && alinharTexto.indexOf(i) >= 0 ? ' class="t"' : '') + '>' + c + '</td>'; }).join('') + '</tr>';
    });
    return h + '</tbody></table>';
  }

  // estado: { proj, modelo, diag, projecao }
  Rel.gerar = function (estado) {
    const p = estado.proj, m = estado.modelo, d = estado.diag, pr = estado.projecao;
    if (!m || m.erro) return null;
    const cfg = p.config;
    const hoje = new Date().toLocaleDateString('pt-BR');
    let h = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>' + U.esc('Tratamento estatístico — ' + (p.projeto.nome || 'avaliação')) + '</title><style>' + CSS + '</style></head><body>';

    // 1. Identificação
    h += '<h1>Tratamento estatístico por inferência</h1>';
    h += '<div class="pequeno">Metodologia: método comparativo direto de dados de mercado, tratamento por regressão linear (ABNT NBR 14.653-2).</div>';
    h += '<h2>1. Identificação</h2>' + tabela(['Campo', 'Informação'], [
      ['Trabalho', U.esc(p.projeto.nome)], ['Responsável técnico', U.esc(p.projeto.autor)],
      ['Tipologia', U.esc(p.projeto.tipologia)], ['Município', U.esc(p.projeto.municipio)],
      ['Finalidade', U.esc(p.projeto.finalidade)], ['Data base', U.esc(p.projeto.dataBase.split('-').reverse().join('/'))]
    ], [0, 1]);

    // 2. Amostras
    const usadas = new Set(m.ids);
    h += '<h2>2. Dados de mercado</h2>';
    h += '<p>Foram levantados ' + p.amostras.length + ' dados, dos quais ' + m.n + ' foram efetivamente utilizados no modelo. ';
    h += cfg.aplicarFatorOferta ? 'Aos dados de oferta aplicou-se fator de oferta de ' + U.fmt(cfg.fatorOferta, 2) + '; às transações, fator unitário.</p>' : 'Não foi aplicado fator de oferta.</p>';
    const nomesVars = [m.dep.nome].concat(m.indep.map(function (v) { return v.nome; }));
    h += tabela(['Nº', 'Uso', 'Natureza', 'Data', 'Endereço / referência', 'Informante'].concat(nomesVars),
      p.amostras.map(function (a) {
        return [a.id, usadas.has(a.id) ? 'sim' : 'não', a.natureza === 'transacao' ? 'transação' : 'oferta', U.esc(a.data ? a.data.split('-').reverse().join('/') : ''), U.esc(a.endereco), U.esc(a.informante)]
          .concat(nomesVars.map(function (nv) { return U.fmtAuto(U.lerNumero(a.valores[nv])); }));
      }), [4, 5]);

    // correções feitas nos dados depois da conferência (rastro para contestação)
    // só alterações nos DADOS (correção, retirada, escala); preenchimento de campo do laudo não entra
    const hist = (p.historico || []).filter(function (r) { return !r.desfeito && ['corrigir', 'desligar', 'escala'].indexOf(r.acao) >= 0; });
    if (hist.length) {
      h += '<p><b>Saneamento dos dados.</b> Após conferência, foram feitas as seguintes alterações, com a respectiva evidência:</p>';
      h += tabela(['Data', 'Amostra', 'Alteração', 'Evidência'], hist.map(function (r) {
        const alt = r.acao === 'desligar' ? 'retirada do cálculo' : (r.acao === 'escala' ? 'escala de ' : '') + U.esc(r.campo) + ': ' + U.esc(r.de) + ' → ' + U.esc(r.para);
        return [r.quando.slice(0, 10).split('-').reverse().join('/'), r.amostra || '—', alt, U.esc(r.evidencia)];
      }), [2, 3]);
    }

    // 3. Variáveis
    h += '<h2>3. Variáveis do modelo</h2>';
    const vDep = p.variaveis.find(function (v) { return v.nome === m.dep.nome; }) || {};
    const linhasVar = [[U.esc(m.dep.nome), 'dependente', U.esc(vDep.descricao || ''), T.porId[m.dep.transf].rotulo, U.fmtAuto(m.faixaY.min), U.fmtAuto(m.faixaY.media), U.fmtAuto(m.faixaY.max)]];
    m.indep.forEach(function (v, j) {
      const def = p.variaveis.find(function (x) { return x.nome === v.nome; }) || {};
      let desc = def.descricao || '';
      const cod = def.codigos && Object.keys(def.codigos).length ? ' (' + Object.keys(def.codigos).map(function (c) { return c + ' = ' + def.codigos[c]; }).join('; ') + ')' : '';
      linhasVar.push([U.esc(v.nome), U.esc(v.tipo), U.esc(desc + cod), T.porId[v.transf].rotulo, U.fmtAuto(m.faixa[j].min), U.fmtAuto(m.faixa[j].media), U.fmtAuto(m.faixa[j].max)]);
    });
    h += tabela(['Variável', 'Tipo', 'Descrição', 'Escala', 'Mínimo', 'Média', 'Máximo'], linhasVar, [0, 1, 2]);

    // 4. Equação
    h += '<h2>4. Equação de regressão</h2><div class="eq">' + U.esc(m.equacao) + '</div>';
    h += '<p class="pequeno">Forma explícita: ' + U.esc(Rg.equacaoExplicita(m)) + '</p>';

    // 5. Resultados
    h += '<h2>5. Resultados estatísticos</h2>';
    const linhasCoef = [['Constante', '—', U.fmtAuto(m.b[0]), U.fmtAuto(m.ep[0]), U.fmt(m.t[0], 3), U.fmtPct(m.sig[0]), '—']];
    m.indep.forEach(function (v, j) {
      const el = m.elasticidade[j];
      linhasCoef.push([U.esc(v.nome), T.porId[v.transf].rotulo, U.fmtAuto(m.b[j + 1]), U.fmtAuto(m.ep[j + 1]), U.fmt(m.t[j + 1], 3), U.fmtPct(m.sig[j + 1]), U.fmt(el.elasticidade, 2) + '%']);
    });
    h += tabela(['Regressor', 'Escala', 'Coeficiente', 'Erro padrão', 't calculado', 'Significância', 'Elasticidade'], linhasCoef, [0]);
    h += tabela(['Indicador', 'Valor'], [
      ['Dados utilizados (n)', m.n], ['Variáveis independentes (k)', m.p - 1],
      ['Coeficiente de correlação (r)', U.fmt(m.r, 4)], ['Coeficiente de determinação (R²)', U.fmt(m.R2, 4)],
      ['R² ajustado', U.fmt(m.R2aj, 4)], ['Erro padrão da regressão', U.fmtAuto(m.s)],
      ['F calculado', U.fmt(m.F, 3)], ['Significância do modelo (F)', U.fmtPct(m.sigF, 4)],
      ['R² de previsão (PRESS)', U.fmt(d.prev.R2previsao, 4)]
    ], [0]);

    h += '<p><b>Análise de variância.</b></p>' + tabela(['Fonte', 'Soma dos quadrados', 'gl', 'Quadrado médio', 'F', 'Significância'], [
      ['Regressão', U.fmtAuto(m.SQReg), m.glReg, U.fmtAuto(m.SQReg / m.glReg), U.fmt(m.F, 3), U.fmtPct(m.sigF, 4)],
      ['Resíduo', U.fmtAuto(m.SQRes), m.gl, U.fmtAuto(m.s2), '', ''],
      ['Total', U.fmtAuto(m.SQTot), m.n - 1, '', '', '']], [0]);
    const desc = INF.Diag.descritivaProjeto(p);
    h += '<p><b>Estatística descritiva das amostras utilizadas.</b></p>' + tabela(['Variável', 'n', 'Média', 'Mediana', 'Desvio padrão', 'CV', 'Mínimo', 'Máximo'],
      desc.linhas.map(function (x) { return [U.esc(x.nome), x.n, U.fmtAuto(x.media), U.fmtAuto(x.mediana), U.fmtAuto(x.desvio), U.fmtPct(x.cv, 1), U.fmtAuto(x.min), U.fmtAuto(x.max)]; }), [0]);

    // 6. Pressupostos
    h += '<h2>6. Verificação dos pressupostos</h2>';
    h += '<p><b>Normalidade dos resíduos.</b> Distribuição dos resíduos padronizados:</p>';
    h += tabela(['Intervalo', 'Curva normal', 'Modelo'], d.proporcoes.map(function (q) { return [q.faixa, U.fmtPct(q.esperado, 0), U.fmtPct(q.obtido, 0)]; }), [0]);
    h += tabela(['Teste', 'Estatística', 'Valor-p', 'Conclusão a 5%'], [
      ['Shapiro-Wilk', U.fmt(d.sw.estatistica, 4), U.fmtPct(d.sw.p), d.sw.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Kolmogorov-Smirnov (Lilliefors)', U.fmt(d.ks.estatistica, 4), U.fmtPct(d.ks.p), d.ks.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Jarque-Bera', U.fmt(d.jb.estatistica, 4), U.fmtPct(d.jb.p), d.jb.p >= 0.05 ? 'não rejeita a normalidade' : 'rejeita a normalidade'],
      ['Breusch-Pagan (homocedasticidade)', U.fmt(d.bp.estatistica, 4), U.fmtPct(d.bp.p), d.bp.p >= 0.05 ? 'variância constante' : 'indício de heterocedasticidade'],
      ['Durbin-Watson (autocorrelação)', U.fmt(d.dw, 3), '—', (d.dw >= 1.5 && d.dw <= 2.5) ? 'sem indício de autocorrelação' : 'verificar ordenação dos dados']
    ], [0, 3]);
    h += '<p><b>Colinearidade.</b> Fatores de inflação da variância: ' + d.vif.map(function (v) { return U.esc(v.nome) + ' = ' + U.fmt(v.vif, 2); }).join('; ') + '.</p>';
    h += '<p><b>Pontos atípicos.</b> ' + (d.outliers.length ? 'Resíduo padronizado acima de 2 desvios nas amostras ' + d.outliers.join(', ') + '.' : 'Nenhum resíduo padronizado acima de 2 desvios.') + ' ';
    h += (d.influentes.length ? 'Distância de Cook superior a 1 nas amostras ' + d.influentes.join(', ') + '.' : 'Nenhuma amostra com distância de Cook superior a 1.') + '</p>';

    // 7. Gráficos
    h += '<h2>7. Gráficos</h2><div class="graf">';
    h += G.dispersao(d.residuos.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id }; }), { titulo: 'Valores observados × estimados', rotX: 'estimado', rotY: 'observado', linha45: true });
    h += G.dispersao(d.residuos.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimados', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true });
    h += G.histograma(d.residuos.map(function (r) { return r.padronizado; }));
    h += G.qq(d.residuos.map(function (r) { return r.padronizado; }));
    h += G.barras(d.residuos.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1);
    h += G.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ')', rotX: 'estimado', rotY: 'observado', linha45: true });
    m.indep.forEach(function (v, j) {
      h += G.curvaModelo(m, j, Rg.prever);
      h += G.frequencia(m.xOriginal.map(function (l) { return l[j]; }), 'Distribuição de ' + v.nome, v.nome);
    });
    h += G.frequencia(m.yOriginal, 'Distribuição de ' + m.dep.nome, m.dep.nome);
    h += '</div>';

    // 8 e 9. Projeção e graus
    if (pr && !pr.erro) {
      h += '<h2>8. Estimativa de valor do imóvel avaliando</h2>';
      h += tabela(['Característica', 'Valor'], m.indep.map(function (v) { return [U.esc(v.nome), U.fmtAuto(U.lerNumero(p.avaliando.valores[v.nome]))]; }), [0]);
      const lin = [
        ['Estimativa central' + (pr.estimativa !== 'direta' ? ' (' + pr.estimativa + ')' : ''), U.fmtAuto(pr.central)],
        ['Intervalo de confiança de 80% — mínimo', U.fmtAuto(pr.icMin) + ' (−' + U.fmtPct(pr.icAbaixo) + ')'],
        ['Intervalo de confiança de 80% — máximo', U.fmtAuto(pr.icMax) + ' (+' + U.fmtPct(pr.icAcima) + ')'],
        ['Amplitude do intervalo', U.fmtPct(pr.amplitude)],
        ['Campo de arbítrio (±15%)', U.fmtAuto(pr.arbitrioMin) + ' a ' + U.fmtAuto(pr.arbitrioMax)]
      ];
      if (pr.area) {
        lin.push(['Área do avaliando', U.fmtAuto(pr.area)]);
        lin.push(['Valor total estimado', U.fmtMoeda(pr.totalCentral) + ' (IC: ' + U.fmtMoeda(pr.totalMin) + ' a ' + U.fmtMoeda(pr.totalMax) + ')']);
      }
      h += tabela(['Resultado', 'Valor'], lin, [0]);

      h += '<h2>9. Especificação da avaliação (NBR 14.653-2)</h2>';
      h += tabela(['Item', 'Descrição', 'Situação', 'Grau', 'Pontos'], pr.fundamentacao.itens.map(function (it) {
        return [it.item, U.esc(it.descricao), U.esc(it.detalhe), N.romano(it.grau), it.pontos];
      }), [1, 2]);
      h += '<p><b>Grau de fundamentação: ' + N.romano(pr.fundamentacao.grau) + '</b> (' + pr.fundamentacao.pontos + ' pontos). ';
      h += '<b>Grau de precisão: ' + N.romano(pr.grauPrecisao) + '</b> (amplitude de ' + U.fmtPct(pr.amplitude) + ').</p>';
      h += '<p class="pequeno">Critérios: ' + U.esc(N.NORMA.referencia) + '.</p>';
    }

    h += '<div class="assin">' + U.esc(p.projeto.municipio ? p.projeto.municipio + ', ' : '') + hoje + '<br><br><br>______________________________________<br>' + U.esc(p.projeto.autor || 'Responsável técnico') + '</div>';
    h += '</body></html>';
    return h;
  };

  INF.Relatorio = Rel;
})(globalThis.INF = globalThis.INF || {});
