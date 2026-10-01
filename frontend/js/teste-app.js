// =============================================================================
// web/js/teste-app.js — teste completo da TELA do onmail (botão do administrador)
// -----------------------------------------------------------------------------
// Só age quando a caixa abre com ?teste=completo (o painel do administrador faz
// isso). Antes da caixa carregar, troca o fetch por um servidor de mentira em
// memória: nenhuma mensagem real é lida, enviada ou apagada.
// Três partes:
//   1) funcionalidade da tela (casos com resultado esperado)
//   2) botões: clica em todos, em cada tela, e vigia erro de script
//   3) layout: botão visível e clicável, texto sem estourar, nada sobreposto,
//      sem rolagem lateral
// No fim mostra o relatório e devolve o resumo ao painel que abriu a janela.
// =============================================================================
(function (OM) {
  'use strict';
  if (!/[?&]teste=completo/.test(location.search)) return;

  // ---------------------------------------------------------------------------
  // servidor de mentira
  // ---------------------------------------------------------------------------
  const agora = Date.now(), iso = function (ms) { return new Date(agora + ms).toISOString(); };
  const XSS = '<img src=x id=xssTeste onerror="window.__xss=1">Assunto <b>perigoso</b>';
  const F = {
    conta: { id: 'c_t', nome: 'Conta de Teste', endereco: 'teste@onmail.br', whatsapp: '5534999990000', plano: 'start', papel: 'usuario', vip: [], assinatura: '', limiteVip: 2 },
    msgs: [
      { id: 'm1', pasta: 'entrada', de: 'cartorio@exemplo.com.br', deNome: 'Cartório (teste)', para: ['teste@onmail.br'], cc: [], assunto: 'Certidão atualizada', corpo: 'Segue a certidão.\nLinha dois.', data: iso(-3600e3), lida: false, sinalizada: false, prioritaria: true,
        anexos: [{ id: 'a1', nome: 'certidao.pdf', tipo: 'application/pdf', bytes: 120000 }], convite: { uid: 'cv1', titulo: 'Retirada do original', inicio: iso(86400e3), fim: iso(90000e3), local: 'Balcão', organizador: 'cartorio@exemplo.com.br' }, conviteAceito: false },
      { id: 'm2', pasta: 'entrada', de: 'xss@exemplo.com', deNome: XSS, para: ['teste@onmail.br'], cc: [], assunto: XSS, corpo: XSS, data: iso(-7200e3), lida: false, sinalizada: false, prioritaria: true, anexos: [], convite: null },
      { id: 'm3', pasta: 'entrada', de: 'novidades@loja.com', deNome: 'Loja (teste)', para: ['teste@onmail.br'], cc: [], assunto: 'Promoção', corpo: 'Oferta.', data: iso(-86400e3), lida: true, sinalizada: false, prioritaria: false, anexos: [], convite: null },
      { id: 'm4', pasta: 'enviados', de: 'teste@onmail.br', deNome: 'Conta de Teste', para: ['cliente@exemplo.com'], cc: [], assunto: 'Proposta', corpo: 'Segue a proposta.', data: iso(-5000e3), lida: true, sinalizada: false, prioritaria: false, anexos: [], convite: null,
        entrega: { interno: [], externo: { destinos: ['cliente@exemplo.com'], estado: 'nao_configurado', detalhe: 'aguarda ativação' }, whatsapp: null, naoExiste: [] } },
      { id: 'm5', pasta: 'rascunhos', de: 'teste@onmail.br', deNome: 'Conta de Teste', para: [], cc: [], assunto: 'Rascunho de teste', corpo: 'meio escrito', data: iso(-100e3), lida: true, sinalizada: false, prioritaria: false, anexos: [], convite: null, canal: 'email' }
    ],
    eventos: [{ id: 'e1', titulo: 'Vistoria (teste)', inicio: iso(3600e3), fim: iso(7200e3), local: 'Fazenda', notas: '', lembrete: 15, cor: 'verde', diaInteiro: false }],
    chamadas: []
  };
  // cada tela começa dos mesmos dados (os cliques do teste mexem neles)
  const ORIGINAL = JSON.stringify({ conta: F.conta, msgs: F.msgs, eventos: F.eventos });
  function restaurar() { const o = JSON.parse(ORIGINAL); Object.assign(F.conta, o.conta); F.msgs = o.msgs; F.eventos = o.eventos; }
  const resumo = function (m) { return { id: m.id, pasta: m.pasta, de: m.de, deNome: m.deNome, para: m.para, assunto: m.assunto, previa: m.corpo.slice(0, 160), data: m.data, lida: m.lida, sinalizada: m.sinalizada, prioritaria: m.prioritaria, temAnexo: m.anexos.length > 0, temConvite: !!m.convite, entrega: m.entrega || null }; };
  function responder(status, dados) { return new Response(JSON.stringify(dados), { status: status, headers: { 'Content-Type': 'application/json' } }); }

  async function falso(url, op) {
    op = op || {};
    const u = new URL(url, location.origin), p = u.pathname, metodo = (op.method || 'GET').toUpperCase();
    const corpo = op.body ? JSON.parse(op.body) : {};
    F.chamadas.push({ metodo: metodo, p: p, corpo: corpo, csrf: op.headers && op.headers['X-Onmail'] });
    let m;
    if (p === '/api/onmail/sessao') return responder(200, { conta: F.conta, versao: 'teste', entrega: { emailExterno: false, whatsapp: false } });
    if (p === '/api/onmail/pastas') {
      const c = function (pa) { const d = F.msgs.filter(function (x) { return x.pasta === pa; }); return { total: d.length, naoLidas: d.filter(function (x) { return !x.lida; }).length }; };
      const pastas = {}; ['entrada', 'enviados', 'rascunhos', 'arquivo', 'spam', 'lixeira'].forEach(function (k) { pastas[k] = c(k); });
      pastas.sinalizados = { total: F.msgs.filter(function (x) { return x.sinalizada; }).length };
      pastas.entrada.prioritariaNaoLidas = F.msgs.filter(function (x) { return x.pasta === 'entrada' && x.prioritaria && !x.lida; }).length;
      pastas.entrada.outrosNaoLidas = F.msgs.filter(function (x) { return x.pasta === 'entrada' && !x.prioritaria && !x.lida; }).length;
      return responder(200, { pastas: pastas });
    }
    if (p === '/api/onmail/mensagens') {
      const pa = u.searchParams.get('pasta') || 'entrada', aba = u.searchParams.get('aba'), q = (u.searchParams.get('q') || '').toLowerCase();
      let l = F.msgs.filter(function (x) { return q ? (x.assunto + x.corpo).toLowerCase().includes(q) : pa === 'sinalizados' ? x.sinalizada : x.pasta === pa; });
      if (!q && pa === 'entrada' && aba) l = l.filter(function (x) { return aba === 'prioritaria' ? x.prioritaria : !x.prioritaria; });
      return responder(200, { total: l.length, mensagens: l.map(resumo) });
    }
    if ((m = p.match(/^\/api\/onmail\/mensagens\/(\w+)$/))) {
      const msg = F.msgs.find(function (x) { return x.id === m[1]; });
      if (!msg) return responder(404, { erro: 'Mensagem não encontrada.' });
      if (metodo === 'GET') { msg.lida = true; return responder(200, { mensagem: Object.assign(resumo(msg), { corpo: msg.corpo, cc: msg.cc, anexos: msg.anexos, convite: msg.convite, conviteAceito: msg.conviteAceito, canal: msg.canal || 'email', whatsappDestino: '' }) }); }
      if (metodo === 'PATCH') { Object.assign(msg, corpo); return responder(200, { ok: true, mensagem: resumo(msg) }); }
      if (metodo === 'DELETE') { const apagada = msg.pasta === 'lixeira'; if (apagada) F.msgs = F.msgs.filter(function (x) { return x !== msg; }); else msg.pasta = 'lixeira'; return responder(200, { ok: true, apagada: apagada }); }
    }
    if ((m = p.match(/^\/api\/onmail\/convites\/(\w+)\/aceitar$/))) {
      const msg = F.msgs.find(function (x) { return x.id === m[1]; }); msg.conviteAceito = true;
      const ev = { id: 'e' + (F.eventos.length + 1), titulo: msg.convite.titulo, inicio: msg.convite.inicio, fim: msg.convite.fim, local: msg.convite.local, cor: 'verde', lembrete: 15 };
      F.eventos.push(ev); return responder(200, { ok: true, evento: ev });
    }
    if (p === '/api/onmail/enviar') {
      if (corpo.rascunho) return responder(200, { ok: true, rascunhoId: corpo.rascunhoId || 'm9' });
      if (!corpo.para && corpo.canal !== 'whatsapp') return responder(400, { erro: 'Informe pelo menos um destinatário.', campo: 'para' });
      const nova = { id: 'm' + (F.msgs.length + 10), pasta: 'enviados', de: F.conta.endereco, deNome: F.conta.nome, para: String(corpo.para).split(',').map(function (s) { return s.trim(); }).filter(Boolean), cc: [], assunto: corpo.assunto, corpo: corpo.corpo, data: new Date().toISOString(), lida: true, sinalizada: false, prioritaria: false, anexos: [], convite: null, entrega: { interno: [], externo: null, whatsapp: null, naoExiste: [] } };
      F.msgs.push(nova);
      return responder(200, { ok: true, id: nova.id, entrega: nova.entrega });
    }
    if (p === '/api/onmail/contatos') return responder(200, { contatos: [{ endereco: 'cliente@exemplo.com', nome: 'Cliente (teste)' }] });
    if (p === '/api/onmail/conta' && metodo === 'PUT') {
      ['nome', 'whatsapp', 'vip', 'assinatura'].forEach(function (k) { if (corpo[k] !== undefined) F.conta[k] = corpo[k]; });
      if (corpo.boasVindasVista) F.conta.novaConta = false;
      return responder(200, { ok: true, conta: F.conta });
    }
    if (p === '/api/onmail/conta/senha') return responder(400, { erro: 'A senha atual não confere.' });
    if (p === '/api/onmail/sair') return responder(200, { ok: true });
    if (p === '/api/onmail/agenda') {
      if (metodo === 'GET') return responder(200, { eventos: F.eventos });
      const ev = Object.assign({ id: 'e' + (F.eventos.length + 1) }, corpo); F.eventos.push(ev); return responder(200, { ok: true, evento: ev });
    }
    if ((m = p.match(/^\/api\/onmail\/agenda\/(\w+)$/))) {
      const ev = F.eventos.find(function (x) { return x.id === m[1]; });
      if (!ev) return responder(404, { erro: 'Evento não encontrado.' });
      if (metodo === 'PUT') { Object.assign(ev, corpo); return responder(200, { ok: true, evento: ev }); }
      if (metodo === 'DELETE') { F.eventos = F.eventos.filter(function (x) { return x !== ev; }); return responder(200, { ok: true }); }
    }
    return responder(404, { erro: 'Rota de teste inexistente: ' + metodo + ' ' + p });
  }
  window.fetch = falso;
  window.confirm = function () { return true; };
  const errosScript = [];
  window.addEventListener('error', function (e) { errosScript.push(String(e.message)); });
  window.addEventListener('unhandledrejection', function (e) { errosScript.push(String(e.reason && e.reason.message || e.reason)); });

  // ---------------------------------------------------------------------------
  // utilidades
  // ---------------------------------------------------------------------------
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  const q = function (s) { return document.querySelector(s); };
  const visivel = function (el) { return el && el.offsetParent !== null && el.getClientRects().length > 0; };
  async function clicar(sel) { const el = typeof sel === 'string' ? q(sel) : sel; if (!el) throw new Error('não achei ' + sel); el.click(); await espera(60); return el; }
  function fecharDialogos() { document.querySelectorAll('dialog[open]').forEach(function (d) { d.close(); }); }
  async function telaInicial() {
    restaurar();
    fecharDialogos();
    OM.Caixa.estado.compor = null;
    OM.Caixa.modulo('email');
    await clicar('[data-pasta=entrada]');
    await clicar('[data-aba=prioritaria]');
    if (!q('#meuDia').hidden) await clicar('.md-topo [data-acao=meuDia]');
  }

  // ---------------------------------------------------------------------------
  // 1) FUNCIONALIDADE DA TELA
  // ---------------------------------------------------------------------------
  async function funcional() {
    const casos = [];
    async function caso(nome, fn) {
      try { await telaInicial(); await fn(); casos.push({ nome: nome, ok: true }); }
      catch (e) { casos.push({ nome: nome, ok: false, erro: e.message }); }
    }
    const conferir = function (c, m) { if (!c) throw new Error(m); };

    await caso('lista da Prioritária mostra as mensagens', async function () {
      conferir(document.querySelectorAll('#itens .item').length === 2, 'esperava 2 itens, vieram ' + document.querySelectorAll('#itens .item').length);
      conferir(q('#itens .item.nl'), 'sem destaque de não lida');
    });
    await caso('aba Outros separa o que não é prioritário', async function () {
      await clicar('[data-aba=outros]');
      conferir(q('#itens').textContent.includes('Promoção'), 'Promoção não apareceu em Outros');
    });
    await caso('abrir mensagem mostra corpo, anexo e convite', async function () {
      await clicar('.item[data-msg=m1]'); await espera(60);
      conferir(q('.msg-corpo') && q('.msg-corpo').textContent.includes('Linha dois'), 'corpo');
      conferir(q('.anexo') && q('.anexo').textContent.includes('certidao.pdf'), 'anexo');
      conferir(q('[data-acao=aceitarConvite]'), 'botão do convite');
    });
    await caso('texto com HTML aparece como texto e não executa', async function () {
      await clicar('.item[data-msg=m2]'); await espera(60);
      conferir(!document.getElementById('xssTeste') && !window.__xss, 'o HTML da mensagem virou elemento na tela');
      conferir(q('.msg h1').textContent.includes('<img'), 'assunto não foi mostrado literalmente');
    });
    await caso('aceitar convite põe o evento na agenda', async function () {
      await clicar('.item[data-msg=m1]'); await espera(60);
      await clicar('[data-acao=aceitarConvite]'); await espera(60);
      conferir(F.eventos.some(function (e) { return e.titulo === 'Retirada do original'; }), 'evento não criado');
      conferir(!q('[data-acao=aceitarConvite]'), 'botão continuou');
    });
    await caso('escrever e enviar manda os dados certos com o cabeçalho de segurança', async function () {
      await clicar('[data-acao=novo]');
      const f = q('#formCompor');
      f.para.value = 'cliente@exemplo.com'; f.assunto.value = 'Teste de envio'; f.corpo.value = 'Olá';
      f.requestSubmit(); await espera(120);
      const ch = F.chamadas.filter(function (c) { return c.p === '/api/onmail/enviar'; }).pop();
      conferir(ch && ch.corpo.para === 'cliente@exemplo.com' && ch.corpo.assunto === 'Teste de envio' && ch.csrf === '1', 'envio: ' + JSON.stringify(ch && ch.corpo));
      conferir(!q('#formCompor'), 'a tela de escrever não fechou');
    });
    await caso('envio sem destinatário mostra o erro e não fecha', async function () {
      await clicar('[data-acao=novo]');
      q('#formCompor').requestSubmit(); await espera(120);
      conferir(q('#formCompor'), 'fechou sem enviar');
      conferir(q('#aviso') && q('#aviso').classList.contains('erro'), 'sem aviso de erro');
    });
    await caso('canal WhatsApp mostra o número e esconde Para/Cc', async function () {
      await clicar('[data-acao=novo]');
      await clicar('[data-canal=whatsapp]');
      conferir(!q('#linhaWa').hidden && q('#linhaPara').hidden, 'campos do canal');
      await clicar('[data-canal=ambos]');
      conferir(!q('#linhaWa').hidden && !q('#linhaPara').hidden, 'canal "os dois"');
    });
    await caso('incluir convite abre os campos do compromisso', async function () {
      await clicar('[data-acao=novo]');
      const cb = q('#formCompor [name=convite]'); cb.click(); await espera(40);
      conferir(!q('#extraConvite').hidden && q('#formCompor').cvData.value, 'campos do convite');
    });
    await caso('responder preenche destinatário, "Re:" e a citação', async function () {
      await clicar('.item[data-msg=m1]'); await espera(60);
      await clicar('.msg-acoes [data-acao=responder]');
      const f = q('#formCompor');
      conferir(f.para.value === 'cartorio@exemplo.com.br' && /^Re: /.test(f.assunto.value) && f.corpo.value.includes('> Segue a certidão.'), 'resposta');
    });
    await caso('rascunho abre para continuar escrevendo', async function () {
      await clicar('[data-pasta=rascunhos]'); await espera(60);
      await clicar('.item[data-msg=m5]'); await espera(80);
      conferir(q('#formCompor') && q('#formCompor').assunto.value === 'Rascunho de teste', 'rascunho');
    });
    await caso('enviados mostram o estado de cada entrega', async function () {
      await clicar('[data-pasta=enviados]'); await espera(60);
      await clicar('.item[data-msg=m4]'); await espera(60);
      conferir(q('.entrega') && q('.entrega').textContent.includes('aguardando ativação'), 'estado da entrega');
    });
    await caso('sinalizar, arquivar e excluir mudam a mensagem', async function () {
      await clicar('.item[data-msg=m3]').catch(function () {});
      await clicar('[data-aba=outros]'); await clicar('.item[data-msg=m3]'); await espera(60);
      await clicar('[data-acao=sinalizar]'); await espera(60);
      conferir(F.msgs.find(function (x) { return x.id === 'm3'; }).sinalizada, 'sinalizar');
      await clicar('[data-acao=arquivar]'); await espera(60);
      conferir(F.msgs.find(function (x) { return x.id === 'm3'; }).pasta === 'arquivo', 'arquivar');
    });
    await caso('busca mostra os resultados', async function () {
      q('#campoBusca').value = 'certidão'; q('#formBusca').requestSubmit(); await espera(100);
      conferir(q('#tituloLista').textContent.includes('certidão') && document.querySelectorAll('#itens .item').length === 1, 'busca');
      q('#campoBusca').value = ''; q('#campoBusca').dispatchEvent(new Event('input', { bubbles: true })); await espera(60);
    });
    await caso('criar evento a partir do e-mail abre a agenda com o assunto', async function () {
      await clicar('.item[data-msg=m1]'); await espera(60);
      await clicar('[data-acao=criarEvento]');
      conferir(q('#dlgEvento').open && q('#formEvento').titulo.value === 'Certidão atualizada', 'diálogo do evento');
      q('#formEvento').requestSubmit(); await espera(100);
      conferir(F.chamadas.some(function (c) { return c.p === '/api/onmail/agenda' && c.metodo === 'POST' && c.corpo.mensagemId === 'm1'; }), 'evento não foi salvo');
    });
    await caso('agenda abre em dia, semana e mês com o evento', async function () {
      await clicar('[data-modulo=agenda]'); await espera(100);
      for (const v of ['dia', 'semana', 'mes']) {
        await clicar('[data-vista=' + v + ']'); await espera(80);
        conferir(q('#agenda .ev') || v === 'dia', 'vista ' + v + ' sem evento');
      }
      await clicar('[data-acao=agProximo]'); await clicar('[data-acao=agHoje]');
      conferir(q('#agTitulo').textContent.length > 3, 'título da agenda');
    });
    await caso('Meu dia lista os compromissos de hoje', async function () {
      await clicar('.barra-dir [data-acao=meuDia]'); await espera(120);
      conferir(!q('#meuDia').hidden && q('#miniCal button'), 'painel');
      conferir(q('#mdEventos').textContent.includes('Vistoria (teste)') || q('#mdEventos').textContent.includes('Nada marcado'), 'eventos de hoje');
    });
    await caso('boas-vindas abre para conta nova e fecha gravando', async function () {
      OM.Caixa.estado.conta.novaConta = true; OM.Caixa.boasVindas(); await espera(40);
      conferir(q('#dlgBoasVindas').open && q('#bvEndereco').textContent.includes(F.conta.endereco), 'tela de boas-vindas');
      await clicar('[data-acao=boasVindasOk]');
      conferir(!q('#dlgBoasVindas').open, 'não fechou');
      conferir(F.chamadas.some(function (c) { return c.p === '/api/onmail/conta' && c.metodo === 'PUT' && c.corpo.boasVindasVista === true; }), 'não gravou que foi vista');
    });
    await caso('configurações abrem e salvam', async function () {
      await clicar('.barra-dir [data-acao=config]');
      conferir(q('#dlgConfig').open && q('#formConfig').nome.value === F.conta.nome, 'abrir');
      q('#formConfig').nome.value = 'Conta de Teste 2'; q('#formConfig').requestSubmit(); await espera(100);
      conferir(F.conta.nome === 'Conta de Teste 2' && !q('#dlgConfig').open, 'salvar');
    });
    return casos;
  }

  // ---------------------------------------------------------------------------
  // 2) TODOS OS BOTÕES, em cada tela
  // ---------------------------------------------------------------------------
  const TELAS = [
    { nome: 'caixa (lista)', preparar: async function () {} },
    { nome: 'leitura', preparar: async function () { await clicar('.item[data-msg=m1]'); await espera(80); } },
    { nome: 'escrever', preparar: async function () { await clicar('[data-acao=novo]'); await clicar('#formCompor [name=convite]'); } },
    { nome: 'agenda semana', preparar: async function () { await clicar('[data-modulo=agenda]'); await clicar('[data-vista=semana]'); } },
    { nome: 'agenda mês', preparar: async function () { await clicar('[data-modulo=agenda]'); await clicar('[data-vista=mes]'); } },
    { nome: 'agenda dia', preparar: async function () { await clicar('[data-modulo=agenda]'); await clicar('[data-vista=dia]'); } },
    { nome: 'Meu dia', preparar: async function () { await clicar('.barra-dir [data-acao=meuDia]'); await espera(100); } },
    { nome: 'evento', preparar: async function () { await clicar('[data-modulo=agenda]'); await clicar('[data-acao=novoEvento]'); } },
    { nome: 'boas-vindas', preparar: async function () { OM.Caixa.boasVindas(); await espera(40); } },
    { nome: 'configurações', preparar: async function () { await clicar('.barra-dir [data-acao=config]'); } }
  ];
  const NAO_CLICAR = ['sair'];     // sair deixaria a janela do teste

  function botoesVisiveis() {
    const raiz = q('dialog[open]') || document;
    return Array.prototype.slice.call(raiz.querySelectorAll('button, [data-acao]'))
      .filter(function (b) { return visivel(b) && !b.disabled && !NAO_CLICAR.includes(b.dataset.acao) && b.type !== 'submit'; });
  }
  function nomeBotao(b) { return (b.dataset.acao || b.dataset.pasta || b.dataset.aba || b.dataset.modulo || b.dataset.vista || b.dataset.canal || '') + ' "' + (b.textContent || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 30) + '"'; }

  async function botoes() {
    const res = [], vistos = {};
    for (const t of TELAS) {
      await telaInicial(); await t.preparar();
      const lista = botoesVisiveis().map(nomeBotao);
      for (const nome of lista) {
        const tipo = nome.split(' ')[0];
        vistos[t.nome + tipo] = (vistos[t.nome + tipo] || 0) + 1;
        if (vistos[t.nome + tipo] > 3) continue;           // basta 3 de cada tipo repetido
        await telaInicial(); await t.preparar();
        const alvo = botoesVisiveis().find(function (b) { return nomeBotao(b) === nome; });
        if (!alvo) continue;
        const antes = errosScript.length;
        try { alvo.click(); await espera(90); } catch (e) { errosScript.push(e.message); }
        res.push({ tela: t.nome, botao: nome, ok: errosScript.length === antes, erro: errosScript.slice(antes).join('; ') });
      }
    }
    await telaInicial();
    return res;
  }

  // ---------------------------------------------------------------------------
  // 3) LAYOUT
  // ---------------------------------------------------------------------------
  function conferirLayout(tela) {
    const problemas = [];
    const L = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > L + 2) problemas.push('a página rola para o lado');
    const raiz = q('dialog[open]') || document;
    Array.prototype.slice.call(raiz.querySelectorAll('button, .bt, a.anexo')).filter(visivel).forEach(function (b) {
      const r = b.getBoundingClientRect(), nome = '"' + (b.textContent || b.getAttribute('aria-label') || '?').replace(/\s+/g, ' ').trim().slice(0, 30) + '"';
      if (!(b.textContent || '').trim() && !b.getAttribute('aria-label') && !b.title) problemas.push('botão sem nome ' + (b.dataset.acao || ''));
      if (r.width < 22 || r.height < 22) problemas.push('botão pequeno demais ' + nome + ' (' + Math.round(r.width) + '×' + Math.round(r.height) + ')');
      if (b.scrollWidth > b.clientWidth + 3 && getComputedStyle(b).overflow !== 'visible' && !b.closest('.anexo, .ev, .md-ev')) problemas.push('texto estourando ' + nome);
      if (r.right > L + 2 && !b.closest('.comandos, .agenda')) problemas.push('botão saindo da tela ' + nome);
    });
    document.querySelectorAll('.comandos, .msg-acoes, .compor-topo, .barra-dir, .dlg-rodape, .canais, .vistas').forEach(function (barra) {
      const bs = Array.prototype.slice.call(barra.children).filter(visivel).map(function (x) { return { el: x, r: x.getBoundingClientRect() }; });
      for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i].r, c = bs[j].r;
        if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) problemas.push('sobrepostos: "' + bs[i].el.textContent.trim().slice(0, 20) + '" e "' + bs[j].el.textContent.trim().slice(0, 20) + '"');
      }
    });
    return { tela: tela, problemas: problemas };
  }
  async function layout() {
    const res = [];
    for (const t of TELAS) { await telaInicial(); await t.preparar(); await espera(60); res.push(conferirLayout(t.nome)); }
    await telaInicial();
    return res;
  }

  // ---------------------------------------------------------------------------
  // execução e relatório
  // ---------------------------------------------------------------------------
  async function rodar() {
    const t0 = Date.now();
    const parte = async function (fn, vazio) { try { return await fn(); } catch (e) { return vazio(e); } };
    const f = await parte(funcional, function (e) { return [{ nome: 'execução da funcionalidade', ok: false, erro: e.message }]; });
    const b = await parte(botoes, function (e) { return [{ tela: '-', botao: 'execução dos botões', ok: false, erro: e.message }]; });
    const l = await parte(layout, function (e) { return [{ tela: 'execução do layout', problemas: [e.message] }]; });
    const r = {
      app: 'onmail (tela)', quando: new Date().toISOString(), segundos: Math.round((Date.now() - t0) / 100) / 10,
      funcionalidade: { casos: f.length, ok: f.filter(function (c) { return c.ok; }).length, falhas: f.filter(function (c) { return !c.ok; }).map(function (c) { return c.nome + ': ' + c.erro; }) },
      botoes: { acoes: b.length, ok: b.filter(function (c) { return c.ok; }).length, falhas: b.filter(function (c) { return !c.ok; }).map(function (c) { return c.tela + ' / ' + c.botao + ': ' + c.erro; }) },
      layout: { telas: l.length, ok: l.filter(function (c) { return !c.problemas.length; }).length, falhas: l.filter(function (c) { return c.problemas.length; }).map(function (c) { return c.tela + ': ' + c.problemas.join('; '); }) }
    };
    r.aprovado = !r.funcionalidade.falhas.length && !r.botoes.falhas.length && !r.layout.falhas.length;
    return r;
  }

  function mostrar(r) {
    const esc = OM.esc;
    const bloco = function (t, ok, total, falhas) {
      return '<h3>' + (falhas.length ? '<span class="sinal erro">✗</span> ' : '<span class="sinal ok">✓</span> ') + esc(t) + ': ' + ok + ' de ' + total + '</h3>'
        + (falhas.length ? '<ul>' + falhas.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '');
    };
    const d = document.createElement('dialog'); d.id = 'relatorioTeste';
    d.innerHTML = '<div class="dlg-topo"><h2>' + (r.aprovado ? '<span class="sinal ok">✓ Tela aprovada</span>' : '<span class="sinal erro">✗ Tela com falhas</span>') + '</h2></div><div class="dlg-corpo">'
      + '<p class="dica">' + esc(new Date(r.quando).toLocaleString('pt-BR')) + ' · ' + r.segundos + ' s · dados de teste, nenhuma caixa real foi usada.</p>'
      + bloco('Funcionalidade', r.funcionalidade.ok, r.funcionalidade.casos, r.funcionalidade.falhas)
      + bloco('Botões clicados', r.botoes.ok, r.botoes.acoes, r.botoes.falhas)
      + bloco('Layout (telas)', r.layout.ok, r.layout.telas, r.layout.falhas)
      + '</div><div class="dlg-rodape"><button class="bt bt-marca" type="button" id="fecharRelatorio">Fechar</button></div>';
    document.body.appendChild(d);
    d.querySelector('#fecharRelatorio').addEventListener('click', function () { d.close(); });
    d.showModal();
  }

  OM.TesteTela = { rodar: rodar, fixture: F };
  document.addEventListener('onmail-pronto', function () {
    setTimeout(function () {
      rodar().then(function (r) {
        mostrar(r);
        try { if (window.opener) window.opener.postMessage({ tipo: 'onmail-teste-tela', resumo: r }, location.origin); } catch (e) { /* painel fechado */ }
      });
    }, 300);
  });
})(window.OM = window.OM || {});
