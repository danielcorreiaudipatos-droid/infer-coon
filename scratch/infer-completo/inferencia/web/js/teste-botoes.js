/* =============================================================================
   web/js/teste-botoes.js — teste automático de todos os botões da tela
   -----------------------------------------------------------------------------
   Como rodar: abrir  /inferencia/?teste=botoes   (ou chamar
   INF.TesteBotoes.rodar() no console). O resultado aparece numa janela sobre
   a tela e também volta como objeto.

   O que faz:
     1. guarda o projeto aberto (sessionStorage) — ele volta no fim;
     2. monta um projeto de TESTE com dados sintéticos (não é mercado);
     3. em cada aba, clica em TODOS os botões (data-acao), um por um, e anota
        erro de JavaScript, promessa rejeitada ou botão que sumiu;
     4. troca os 17 modelos de laudo e os 20 estilos e gera o laudo de cada;
     5. devolve o projeto original.
   Downloads, janelas novas e impressão são interceptados (nada é baixado,
   aberto ou impresso). Botões que gravam na nuvem ou trocam de projeto são
   pulados de propósito (lista PULAR).
   ============================================================================= */

(function (INF) {
  'use strict';

  const PULAR = ['salvarNuvem', 'meusProjetos', 'abrirDaNuvem', 'excluirDaNuvem', 'recuperarAnterior', 'novo'];
  // estes apagam coisas: rodam por último em cada aba
  const DESTRUTIVOS = ['excluirAmostra', 'excluirVar', 'excluirFoto', 'tirarQuesito', 'tirarBenf', 'vizTirarImovel', 'vizTirarAmbiente', 'vizTirarAnomalia', 'desfazer', 'desligar'];
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  function projetoDeTeste() {
    const U = INF.U, r = U.rng(2026);
    const nm = function () { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const p = INF.Dados.novoProjeto();
    p.projeto.nome = 'TESTE AUTOMÁTICO DE BOTÕES'; p.projeto.autor = 'Responsável Teste'; p.projeto.municipio = 'Patos de Minas/MG';
    p.projeto.codigo = 'TESTE-001'; p.projeto.imovel = 'Imóvel de teste'; p.projeto.observacao = 'Projeto sintético do teste automático de botões (não é mercado).';
    [['Area', 'quantitativa', '-'], ['Dist', 'quantitativa', '-'], ['Topo', 'qualitativa', '+'], ['Pav', 'dicotomica', '+'], ['Meses', 'tempo', '-']].forEach(function (v) {
      INF.Dados.incluirVariavel(p, v[0], v[1]); p.variaveis.find(function (x) { return x.nome === v[0]; }).direcao = v[2];
    });
    for (let i = 0; i < 40; i++) {
      const a = 200 + r() * 1800, d = 0.5 + r() * 12, t = 1 + Math.floor(r() * 3), pv = r() < 0.6 ? 1 : 0;
      INF.Dados.incluirAmostra(p, { natureza: i % 3 ? 'oferta' : 'transacao', informante: 'Imobiliária teste ' + i, telefone: '(34) 99999-00' + String(i).padStart(2, '0'),
        link: 'https://exemplo.test/anuncio/' + i, data: '2026-0' + (1 + i % 8) + '-10', endereco: 'Rua teste ' + i, lat: -18.58 + r() * 0.06, lon: -46.52 + r() * 0.06,
        valores: { VU: Math.exp(5.2 + 180 / a - 0.18 * Math.log(d) + 0.09 * t + 0.12 * pv + 0.08 * nm()), Area: a, Dist: d, Topo: t, Pav: pv, Meses: i % 8 } });
    }
    p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x', Meses: 'fora' };
    p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2, Pav: 1, Meses: 0 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
    p.config.polo = { nome: 'Centro', lat: -18.578, lon: -46.518 };
    p.laudo = { solicitante: 'Solicitante teste', dataVistoria: '2026-09-20', estilo: 1 };
    p.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente', 'vtn', 'liquidacao'], areaFaixa: 12, coefServidao: 30,
      areaRemanescente: 100, percRemanescente: 5, prazoAbsorcao: 12, taxaMensal: 1, quesitos: [{ parte: 'autor', pergunta: 'Qual o valor?', resposta: '' }],
      benfeitorias: [{ descricao: 'Casa', quantidade: 100, unidade: 'm²', unitario: 1500, depreciacao: 20 }] });
    p.vizinhanca = { obra: { nome: 'Obra teste' }, imoveis: [{ endereco: 'Rua A, 90', ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede' }] }] }] };
    // uma foto mínima (1×1) para exercitar legenda/alvo/remover
    p.fotos = [{ id: 1, alvo: 'avaliando', legenda: 'foto teste', largura: 1, altura: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }];
    return p;
  }

  INF.TesteBotoes = {
    rodar: async function () {
      const E = INF.Tela.estado, relatorio = [], erros = [];
      const guardado = JSON.stringify(E.proj);
      sessionStorage.setItem('inferencia-nbr:backup-teste', guardado);
      // interceptações
      const orig = { baixar: INF.Dados.baixar, open: window.open, confirm: window.confirm, prompt: window.prompt, append: document.body.appendChild.bind(document.body), salvar: INF.Dados.salvarLocal };
      const baixados = [], abertos = [], impressos = [];
      INF.Dados.baixar = function (nome, c) { baixados.push({ nome: nome, bytes: c.length || c.size || 0 }); };
      INF.Dados.salvarLocal = function () { return true; };     // não sobrescreve o projeto dele no navegador
      window.open = function (u) { abertos.push(String(u).slice(0, 40)); return null; };
      window.confirm = function () { return true; };
      window.prompt = function () { return 'Renomeada_teste'; };
      document.body.appendChild = function (no) { if (no && no.tagName === 'IFRAME') { impressos.push('impressão'); return no; } return orig.append(no); };
      const aoErro = function (ev) { erros.push(ev.message || String(ev.reason)); };
      window.addEventListener('error', aoErro); window.addEventListener('unhandledrejection', aoErro);

      async function clicar(aba, acao, arg) {
        const n0 = erros.length;
        const sel = '[data-acao="' + acao + '"]' + (arg !== undefined && arg !== null ? '[data-arg="' + String(arg).replace(/"/g, '\\"') + '"]' : '');
        const bt = document.querySelector(sel);
        if (!bt) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'sumiu (ação anterior mudou a tela)' }); return; }
        if (bt.disabled) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'desligado (esperado: falta chave/dado)' }); return; }
        try {
          bt.click();
          await espera(60);
          for (let k = 0; k < 400 && (E.buscando || E.inventariando || E.conferindoIA); k++) await espera(100);
          await espera(40);
          relatorio.push({ aba: aba, acao: acao, arg: arg, status: erros.length > n0 ? 'ERRO: ' + erros.slice(n0).join(' | ') : 'ok' });
        } catch (e) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'ERRO: ' + e.message }); }
      }

      try {
        E.proj = projetoDeTeste(); E.docs.length = 0;
        E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        const abas = Array.prototype.slice.call(document.querySelectorAll('.aba')).map(function (b) { return b.dataset.aba; });
        for (const aba of abas) {
          // projeto novo a cada aba: botões que apagam (ex.: excluir variável) não contaminam as abas seguintes
          E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
          document.querySelector('[data-acao=calcular]').click(); await espera(60);
          document.querySelector('[data-aba=avaliacao]').click(); await espera(30);
          const btProj = document.querySelector('[data-acao=projetar]'); if (btProj) { btProj.click(); await espera(60); }
          document.querySelector('[data-aba="' + aba + '"]').click(); await espera(60);
          if (document.querySelector('.aba.ativa').dataset.aba !== aba) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: a aba não abriu' });
          if (erros.length) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: ' + erros.join(' | ') });
          const lista = Array.prototype.slice.call(document.querySelectorAll('#conteudo [data-acao], .topo [data-acao]'))
            .map(function (b) { return { acao: b.dataset.acao, arg: b.dataset.arg }; })
            .filter(function (x, i, a) { return PULAR.indexOf(x.acao) < 0 && a.findIndex(function (y) { return y.acao === x.acao && y.arg === x.arg; }) === i; });
          const ordem = lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) < 0; }).concat(lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) >= 0; }));
          for (const x of ordem) {
            if (document.querySelector('.aba.ativa') && document.querySelector('.aba.ativa').dataset.aba !== aba) { document.querySelector('[data-aba="' + aba + '"]').click(); await espera(40); }
            await clicar(aba, x.acao, x.arg);
          }
        }
        // 17 modelos × laudo (HTML) e 20 estilos × Word
        E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        document.querySelector('[data-aba=avaliacao]').click(); document.querySelector('[data-acao=projetar]').click(); await espera(60);
        for (const M of INF.Modelos.MODELOS) {
          INF.Modelos.aplicar(E.proj, M.id);
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          const html = l.erro ? '' : INF.Laudo.html(l);
          relatorio.push({ aba: 'modelos', acao: 'laudo ' + M.id, status: l.erro ? 'ERRO: ' + l.erro : (html.length > 5000 ? 'ok (' + Math.round(html.length / 1024) + ' KB)' : 'ERRO: laudo vazio') });
        }
        INF.Modelos.aplicar(E.proj, 'jud_valor');
        for (let n = 1; n <= 20; n++) {
          E.proj.laudo.estilo = n;
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          let st = 'ok';
          try { const z = INF.Laudo.docx(l, {}); if (!(z.length > 10000)) st = 'ERRO: Word pequeno demais'; } catch (e) { st = 'ERRO: ' + e.message; }
          relatorio.push({ aba: 'estilos', acao: 'Word estilo ' + n, status: st });
        }
      } catch (e) {
        relatorio.push({ aba: '(teste)', acao: '(interrompido)', status: 'ERRO: ' + e.message });
      } finally {
        // devolve tudo como estava
        INF.Dados.baixar = orig.baixar; INF.Dados.salvarLocal = orig.salvar; window.open = orig.open; window.confirm = orig.confirm; window.prompt = orig.prompt;
        document.body.appendChild = orig.append;
        window.removeEventListener('error', aoErro); window.removeEventListener('unhandledrejection', aoErro);
        E.proj = INF.Dados.normalizar(JSON.parse(guardado)); E.docs.length = 0;
        E.modelo = E.diag = E.projecao = E.rna = E.busca = E.conferencia = E.conferenciaIA = E.anuncio = E.importacao = null;
        E.aviso = null; E.aba = 'projeto'; INF.Tela.desenhar();
      }
      const falhas = relatorio.filter(function (r) { return /^ERRO/.test(r.status); });
      return { total: relatorio.length, ok: relatorio.filter(function (r) { return /^ok/.test(r.status); }).length, falhas: falhas, relatorio: relatorio,
        interceptados: { downloads: baixados.length, janelas: abertos.length, impressoes: impressos.length }, projetoDevolvido: E.proj.projeto.nome };
    },

    // mostra o resultado numa janela sobre a tela
    mostrar: function (r) {
      const d = document.createElement('div');
      d.className = 'teste-resultado';
      d.innerHTML = '<h2>Teste de botões: ' + r.ok + ' de ' + r.total + ' ok · ' + r.falhas.length + ' falha(s)</h2>'
        + '<p>Interceptados: ' + r.interceptados.downloads + ' downloads, ' + r.interceptados.janelas + ' janelas, ' + r.interceptados.impressoes + ' impressões. Projeto devolvido: ' + INF.U.esc(r.projetoDevolvido) + '.</p>'
        + '<table class="tabela"><thead><tr><th>Aba</th><th>Botão</th><th>Resultado</th></tr></thead><tbody>'
        + r.relatorio.map(function (x) { return '<tr class="' + (/^ERRO/.test(x.status) ? 'outlier' : '') + '"><td>' + INF.U.esc(x.aba) + '</td><td class="esq">' + INF.U.esc(x.acao + (x.arg ? ' (' + x.arg + ')' : '')) + '</td><td class="esq">' + INF.U.esc(x.status) + '</td></tr>'; }).join('')
        + '</tbody></table><button class="principal">Fechar</button>';
      d.querySelector('button').addEventListener('click', function () { d.remove(); });
      document.body.appendChild(d);
    }
  };

  // ?teste=botoes → roda sozinho ao abrir
  if (/[?&]teste=botoes/.test(location.search)) {
    setTimeout(function () { INF.TesteBotoes.rodar().then(INF.TesteBotoes.mostrar); }, 1200);
  }
})(globalThis.INF = globalThis.INF || {});
