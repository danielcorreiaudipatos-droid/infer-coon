// =============================================================================
// web/js/caixa.js — caixa de entrada do onmail
// -----------------------------------------------------------------------------
// Pastas | lista (Prioritária / Outros) | leitura ou escrita, no estilo Outlook.
// Todo texto vindo de mensagem passa por OM.esc antes de ir para a tela.
// Atalhos: N novo · R responder · Delete excluir · Esc fecha.
// =============================================================================
(function (OM) {
  'use strict';
  const esc = OM.esc, ic = OM.icone;
  const E = { conta: null, pasta: 'entrada', aba: 'prioritaria', q: '', lista: [], sel: null, msg: null, compor: null, contatos: null, entrega: null };
  const $ = function (id) { return document.getElementById(id); };
  const NOMES = { entrada: 'Caixa de entrada', enviados: 'Enviados', rascunhos: 'Rascunhos', sinalizados: 'Sinalizados', arquivo: 'Arquivo', spam: 'Spam', lixeira: 'Lixeira' };
  const MAX_MB = 25;

  // ---------------------------------------------------------------------------
  // início
  // ---------------------------------------------------------------------------
  async function iniciar() {
    try {
      const s = await OM.api('GET', '/api/onmail/sessao');
      E.conta = s.conta; E.entrega = s.entrega;
    } catch (e) {
      if (e.status === 401) { location.replace('/onmail/entrar'); return; }
      OM.aviso(e.message, true); return;
    }
    $('avatar').textContent = OM.iniciais(E.conta.nome);
    $('avatar').title = E.conta.nome + ' — ' + E.conta.endereco;
    $('linkAdmin').hidden = E.conta.papel !== 'admin';
    $('statusEntrega').innerHTML =
      '<div><span class="ponto ' + (E.entrega.emailExterno ? 'lig' : 'des') + '"></span>E-mail para fora: ' + (E.entrega.emailExterno ? 'ligado' : 'aguardando ativação') + '</div>'
      + '<div><span class="ponto ' + (E.entrega.whatsapp ? 'lig' : 'des') + '"></span>WhatsApp: ' + (E.entrega.whatsapp ? 'ligado' : 'aguardando ativação') + '</div>'
      + '<div>' + esc(E.conta.endereco) + '</div>';
    desenharVazio();
    await Promise.all([carregarPastas(), carregarLista()]);
    setInterval(function () { if (!document.hidden && !E.compor) { carregarPastas(); carregarLista(true); } }, 60000);
    if (E.conta.novaConta) abrirBoasVindas();
    OM.Caixa.pronto = true;
    document.dispatchEvent(new CustomEvent('onmail-pronto'));
  }

  async function carregarPastas() {
    try {
      const r = await OM.api('GET', '/api/onmail/pastas');
      const p = r.pastas;
      const pinta = function (chave, n) { document.querySelectorAll('[data-contagem="' + chave + '"]').forEach(function (el) { el.textContent = n ? String(n) : ''; }); };
      pinta('entrada', p.entrada.naoLidas); pinta('rascunhos', p.rascunhos.total); pinta('spam', p.spam.naoLidas);
      pinta('arquivo', p.arquivo.naoLidas); pinta('lixeira', ''); pinta('enviados', ''); pinta('sinalizados', p.sinalizados.total);
      pinta('prioritaria', p.entrada.prioritariaNaoLidas); pinta('outros', p.entrada.outrosNaoLidas);
      document.title = (p.entrada.naoLidas ? '(' + p.entrada.naoLidas + ') ' : '') + 'Caixa de entrada — onmail';
    } catch (e) { tratarErro(e); }
  }

  async function carregarLista(silencioso) {
    const qs = new URLSearchParams();
    if (E.q) qs.set('q', E.q);
    else { qs.set('pasta', E.pasta); if (E.pasta === 'entrada') qs.set('aba', E.aba); }
    try {
      const r = await OM.api('GET', '/api/onmail/mensagens?' + qs.toString());
      E.lista = r.mensagens;
      desenharLista();
    } catch (e) { if (!silencioso) tratarErro(e); }
  }

  function tratarErro(e) {
    if (e.status === 401) { location.replace('/onmail/entrar'); return; }
    OM.aviso(e.message, true);
  }

  // ---------------------------------------------------------------------------
  // lista
  // ---------------------------------------------------------------------------
  function desenharLista() {
    const busca = !!E.q;
    $('abasFoco').hidden = busca || E.pasta !== 'entrada';
    $('tituloLista').hidden = !$('abasFoco').hidden;
    $('tituloLista').textContent = busca ? 'Resultados para “' + E.q + '”' : NOMES[E.pasta];
    const ul = $('itens');
    if (!E.lista.length) {
      ul.innerHTML = '<li class="lista-vazia">' + (busca ? 'Nada encontrado.' : E.pasta === 'entrada' ? (E.aba === 'prioritaria' ? 'Tudo em dia na Prioritária.' : 'Nada em Outros.') : 'Esta pasta está vazia.') + '</li>';
      return;
    }
    const mostrarPara = E.pasta === 'enviados' || E.pasta === 'rascunhos';
    ul.innerHTML = E.lista.map(function (m) {
      const quem = mostrarPara ? (m.para.length ? 'Para: ' + m.para.join(', ') : '(sem destinatário)') : (m.deNome || m.de);
      return '<li class="item' + (m.lida ? '' : ' nl') + (E.sel === m.id ? ' sel' : '') + '" data-msg="' + esc(m.id) + '" tabindex="0">'
        + '<span class="av ' + OM.corDe(mostrarPara ? m.para[0] || '' : m.de) + '">' + esc(OM.iniciais(mostrarPara ? m.para[0] || '?' : m.deNome || m.de)) + '</span>'
        + '<span class="item-meio"><span class="item-de">' + esc(quem) + '</span><span class="item-assunto">' + esc(m.assunto || '(sem assunto)') + '</span><span class="item-previa">' + esc(m.previa) + '</span></span>'
        + '<span class="item-dir"><time>' + esc(OM.quandoCurto(m.data)) + '</time><span class="item-marcas">'
        + (m.temConvite ? ic('agenda') : '') + (m.temAnexo ? ic('clipe') : '') + (m.sinalizada ? ic('bandeira', 'bandeira') : '') + '</span></span></li>';
    }).join('');
  }

  // ---------------------------------------------------------------------------
  // leitura
  // ---------------------------------------------------------------------------
  function desenharVazio() {
    E.msg = null; E.sel = null; E.compor = null;
    $('leitura').innerHTML = '<div class="vazio-leitura">' + ic('correio') + '<b>Selecione um item para ler</b><span>Nada está selecionado.</span></div>';
    document.body.classList.remove('lendo');
    atualizarComandos();
  }

  function atualizarComandos() {
    document.querySelectorAll('[data-precisa="msg"]').forEach(function (b) { b.disabled = !E.msg; });
  }

  async function abrir(id) {
    if (E.compor && !(await largarRascunho())) return;
    E.sel = id;
    document.querySelectorAll('.item').forEach(function (li) { li.classList.toggle('sel', li.dataset.msg === id); });
    try {
      const r = await OM.api('GET', '/api/onmail/mensagens/' + encodeURIComponent(id));
      const m = r.mensagem;
      if (m.pasta === 'rascunhos') { E.msg = null; compor('rascunho', m); return; }
      E.msg = m; E.compor = null;
      const li = document.querySelector('.item[data-msg="' + CSS.escape(id) + '"]'); if (li) li.classList.remove('nl');
      const it = E.lista.find(function (x) { return x.id === id; }); if (it && !it.lida) { it.lida = true; carregarPastas(); }
      desenharMensagem(m);
    } catch (e) { tratarErro(e); }
  }

  function desenharMensagem(m) {
    const eu = E.conta.endereco;
    const deMim = m.de === eu;
    let h = '<div class="msg">'
      + '<button class="bt bt-leve msg-voltar" type="button" data-acao="voltar">' + ic('voltar') + '<span>Voltar</span></button>'
      + '<h1>' + esc(m.assunto || '(sem assunto)') + '</h1>'
      + '<div class="msg-cab"><span class="av ' + OM.corDe(m.de) + '">' + esc(OM.iniciais(m.deNome || m.de)) + '</span>'
      + '<div class="msg-quem"><b>' + esc(m.deNome || m.de) + '</b><small>' + esc(m.de) + '</small>'
      + '<small>Para: ' + esc(m.para.join(', ') || '—') + (m.cc && m.cc.length ? ' · Cc: ' + esc(m.cc.join(', ')) : '') + '</small>'
      + '<small>' + esc(OM.quandoLongo(m.data)) + '</small></div>'
      + '<div class="msg-acoes">'
      + '<button class="bt bt-leve" type="button" data-acao="responder">' + ic('responder') + '<span>Responder</span></button>'
      + (!deMim && (m.para.length + (m.cc || []).length) > 1 ? '<button class="bt bt-leve" type="button" data-acao="responderTodos">' + ic('responder') + '<span>Todos</span></button>' : '')
      + '<button class="bt bt-leve" type="button" data-acao="encaminhar">' + ic('encaminhar') + '<span>Encaminhar</span></button>'
      + '</div></div>';
    if (m.convite) {
      const ini = new Date(m.convite.inicio), fim = new Date(m.convite.fim);
      h += '<div class="convite">' + ic('agenda') + '<div class="convite-dados"><b>' + esc(m.convite.titulo) + '</b><small>'
        + esc(ini.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })) + ', ' + OM.hora(ini) + '–' + OM.hora(fim) + '</small>'
        + (m.convite.local ? '<small>' + esc(m.convite.local) + '</small>' : '') + '<small>Organizador: ' + esc(m.convite.organizador) + '</small></div>'
        + (deMim ? '<span class="dica">Já está na sua agenda.</span>' : m.conviteAceito ? '<span class="sinal ok">✓ Na sua agenda</span>' : '<button class="bt bt-marca" type="button" data-acao="aceitarConvite">Adicionar à agenda</button>')
        + '</div>';
    }
    h += '<div class="msg-corpo">' + esc(m.corpo) + '</div>';
    if (m.anexos.length) {
      h += '<div class="anexos">' + m.anexos.map(function (a) {
        return '<a class="anexo" href="/api/onmail/anexos/' + encodeURIComponent(a.id) + '" download>' + ic('clipe') + '<span>' + esc(a.nome) + '</span><small>' + OM.tamanho(a.bytes) + '</small></a>';
      }).join('') + '</div>';
    }
    if (m.entrega) h += desenharEntrega(m.entrega);
    h += '</div>';
    $('leitura').innerHTML = h;
    $('leitura').scrollTop = 0;
    document.body.classList.add('lendo');
    atualizarComandos();
    const bLida = document.querySelector('[data-acao=lida]'); if (bLida) bLida.title = 'Marcar como não lida';
  }

  const ESTADOS = { enviado: 'enviado', nao_configurado: 'aguardando ativação', falhou: 'falhou', na_fila: 'na fila' };
  function desenharEntrega(r) {
    let h = '<div class="entrega"><b>Entrega</b>';
    if (r.interno && r.interno.length) h += '<span>Dentro do onmail: ' + esc(r.interno.join(', ')) + ' <i class="selo-estado enviado">entregue</i></span>';
    if (r.externo) h += '<span>Para fora: ' + esc(r.externo.destinos.join(', ')) + ' <i class="selo-estado ' + esc(r.externo.estado) + '">' + esc(ESTADOS[r.externo.estado] || r.externo.estado) + '</i><br><small>' + esc(r.externo.detalhe) + '</small></span>';
    if (r.whatsapp) h += '<span>WhatsApp ' + esc(r.whatsapp.numero) + ' <i class="selo-estado ' + esc(r.whatsapp.estado) + '">' + esc(ESTADOS[r.whatsapp.estado] || r.whatsapp.estado) + '</i><br><small>' + esc(r.whatsapp.detalhe) + '</small></span>';
    if (r.naoExiste && r.naoExiste.length) h += '<span>Não existem no onmail: ' + esc(r.naoExiste.join(', ')) + ' <i class="selo-estado falhou">não entregue</i></span>';
    return h + '</div>';
  }

  // ---------------------------------------------------------------------------
  // escrever
  // ---------------------------------------------------------------------------
  function citar(m) {
    return '\n\n— Em ' + OM.quandoLongo(m.data) + ', ' + (m.deNome || m.de) + ' <' + m.de + '> escreveu:\n' + m.corpo.split('\n').map(function (l) { return '> ' + l; }).join('\n');
  }

  function compor(modo, m) {
    const eu = E.conta.endereco;
    const c = { modo: modo, rascunhoId: null, para: '', cc: '', assunto: '', corpo: '', canal: 'email', whatsappDestino: '', anexosNovos: [], manter: [], encaminharDe: null, herdados: [], convite: false };
    if (modo === 'responder' || modo === 'responderTodos') {
      c.para = m.de === eu ? m.para.join(', ') : m.de;
      if (modo === 'responderTodos') {
        c.para = [m.de].concat(m.para).filter(function (x) { return x !== eu; }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', ');
        c.cc = (m.cc || []).filter(function (x) { return x !== eu; }).join(', ');
      }
      c.assunto = /^re:/i.test(m.assunto) ? m.assunto : 'Re: ' + m.assunto;
      c.corpo = citar(m);
    } else if (modo === 'encaminhar') {
      c.assunto = /^enc:/i.test(m.assunto) ? m.assunto : 'Enc: ' + m.assunto;
      c.corpo = '\n\n— Mensagem encaminhada —\nDe: ' + (m.deNome || m.de) + ' <' + m.de + '>\nData: ' + OM.quandoLongo(m.data) + '\nAssunto: ' + m.assunto + '\nPara: ' + m.para.join(', ') + '\n\n' + m.corpo;
      c.encaminharDe = m.id; c.herdados = m.anexos.slice();
    } else if (modo === 'rascunho') {
      c.rascunhoId = m.id; c.para = m.para.join(', '); c.cc = (m.cc || []).join(', '); c.assunto = m.assunto; c.corpo = m.corpo;
      c.canal = m.canal || 'email'; c.whatsappDestino = m.whatsappDestino || ''; c.manter = m.anexos.slice();
    }
    if (modo !== 'rascunho' && E.conta.assinatura) c.corpo = '\n\n' + E.conta.assinatura + c.corpo;
    E.compor = c; E.msg = null;
    atualizarComandos();
    desenharCompor();
  }

  function desenharCompor() {
    const c = E.compor;
    const titulo = { novo: 'Novo e-mail', responder: 'Responder', responderTodos: 'Responder a todos', encaminhar: 'Encaminhar', rascunho: 'Rascunho' }[c.modo];
    $('leitura').innerHTML = '<form class="compor" id="formCompor" novalidate autocomplete="off">'
      + '<div class="compor-topo"><button class="bt bt-leve msg-voltar" type="button" data-acao="descartar" aria-label="Voltar">' + ic('voltar') + '</button><h2>' + titulo + '</h2>'
      + '<button class="bt bt-marca" type="submit">' + ic('enviados') + '<span>Enviar</span></button>'
      + '<button class="bt" type="button" data-acao="salvarRascunho">Salvar rascunho</button>'
      + '<button class="bt bt-leve" type="button" data-acao="descartar">Descartar</button></div>'
      + '<div class="compor-linha"><span class="rot">Enviar por</span><div class="canais" role="group" aria-label="Canal">'
      + ['email', 'whatsapp', 'ambos'].map(function (k) { return '<button type="button" data-canal="' + k + '" class="' + (c.canal === k ? 'at' : '') + '">' + { email: 'E-mail', whatsapp: 'WhatsApp', ambos: 'Os dois' }[k] + '</button>'; }).join('')
      + '</div></div>'
      + '<div class="compor-linha" id="linhaPara"><label for="cPara">Para</label><input id="cPara" name="para" type="text" spellcheck="false" autocapitalize="none" value="' + esc(c.para) + '"></div>'
      + '<div class="compor-linha" id="linhaCc"><label for="cCc">Cc</label><input id="cCc" name="cc" type="text" spellcheck="false" autocapitalize="none" value="' + esc(c.cc) + '"></div>'
      + '<div class="compor-linha" id="linhaWa"><label for="cWa">WhatsApp</label><input id="cWa" name="whatsappDestino" type="tel" placeholder="DDD + número do destinatário" value="' + esc(c.whatsappDestino) + '"></div>'
      + '<div class="compor-linha"><label for="cAssunto">Assunto</label><input id="cAssunto" name="assunto" type="text" maxlength="300" value="' + esc(c.assunto) + '"></div>'
      + '<div class="compor-linha"><label class="check"><input type="checkbox" name="convite"' + (c.convite ? ' checked' : '') + '><span>Incluir convite de agenda</span></label></div>'
      + '<div class="compor-extra" id="extraConvite" hidden>'
      + '<label class="campo"><span>Título do compromisso</span><input name="cvTitulo" maxlength="160"></label>'
      + '<div class="linha3"><label class="campo"><span>Data</span><input type="date" name="cvData"></label><label class="campo"><span>Início</span><input type="time" name="cvInicio" value="09:00"></label><label class="campo"><span>Fim</span><input type="time" name="cvFim" value="10:00"></label></div>'
      + '<label class="campo"><span>Local</span><input name="cvLocal" maxlength="200"></label></div>'
      + '<textarea class="compor-texto" name="corpo" aria-label="Mensagem" maxlength="100000">' + esc(c.corpo) + '</textarea>'
      + '<div class="compor-rodape"><label class="bt bt-leve" for="cArquivos">' + ic('clipe') + '<span>Anexar</span></label>'
      + '<input class="arquivo-oculto" id="cArquivos" type="file" multiple tabindex="-1">'
      + '<div class="anexos" id="anexosCompor"></div><span class="dica" id="dicaCompor"></span></div>'
      + '</form>';
    ajustarCanal();
    desenharAnexosCompor();
    document.body.classList.add('lendo');
    const f = $('formCompor');
    (c.para ? f.corpo : f.para).focus();
    if (c.para) { f.corpo.setSelectionRange(0, 0); f.corpo.scrollTop = 0; }
  }

  function ajustarCanal() {
    const c = E.compor;
    $('linhaPara').hidden = c.canal === 'whatsapp';
    $('linhaCc').hidden = c.canal === 'whatsapp';
    $('linhaWa').hidden = c.canal === 'email';
    document.querySelectorAll('[data-canal]').forEach(function (b) { b.classList.toggle('at', b.dataset.canal === c.canal); });
  }

  function desenharAnexosCompor() {
    const c = E.compor;
    const todos = c.manter.map(function (a) { return { chave: 'm:' + a.id, nome: a.nome, bytes: a.bytes }; })
      .concat(c.herdados.map(function (a) { return { chave: 'h:' + a.id, nome: a.nome, bytes: a.bytes }; }))
      .concat(c.anexosNovos.map(function (a, i) { return { chave: 'n:' + i, nome: a.nome, bytes: a.bytes }; }));
    $('anexosCompor').innerHTML = todos.map(function (a) {
      return '<span class="anexo">' + ic('clipe') + '<span>' + esc(a.nome) + '</span><small>' + OM.tamanho(a.bytes) + '</small><button type="button" data-tirar-anexo="' + esc(a.chave) + '" aria-label="Tirar ' + esc(a.nome) + '">' + ic('x') + '</button></span>';
    }).join('');
    const total = todos.reduce(function (s, a) { return s + a.bytes; }, 0);
    $('dicaCompor').textContent = total ? OM.tamanho(total) + ' de ' + MAX_MB + ' MB' : '';
  }

  function lerArquivos(lista) {
    const c = E.compor;
    Array.prototype.forEach.call(lista, function (arq) {
      const atual = c.anexosNovos.concat(c.manter, c.herdados).reduce(function (s, a) { return s + a.bytes; }, 0);
      if (atual + arq.size > MAX_MB * 1048576) { OM.aviso('Os anexos passam de ' + MAX_MB + ' MB. Deixe "' + arq.name + '" de fora ou envie por link.', true); return; }
      const leitor = new FileReader();
      leitor.onload = function () {
        const s = String(leitor.result);
        c.anexosNovos.push({ nome: arq.name, tipo: arq.type || 'application/octet-stream', base64: s.slice(s.indexOf(',') + 1), bytes: arq.size });
        desenharAnexosCompor();
      };
      leitor.onerror = function () { OM.aviso('Não consegui ler "' + arq.name + '".', true); };
      leitor.readAsDataURL(arq);
    });
  }

  function dadosCompor(rascunho) {
    const f = $('formCompor'), c = E.compor;
    const d = {
      rascunho: rascunho, rascunhoId: c.rascunhoId, canal: c.canal,
      para: c.canal === 'whatsapp' ? '' : f.para.value, cc: c.canal === 'whatsapp' ? '' : f.cc.value,
      whatsappDestino: c.canal === 'email' ? '' : f.whatsappDestino.value,
      assunto: f.assunto.value, corpo: f.corpo.value,
      anexos: c.anexosNovos.map(function (a) { return { nome: a.nome, tipo: a.tipo, base64: a.base64 }; }),
      manterAnexos: c.manter.map(function (a) { return a.id; }),
      encaminharDe: c.encaminharDe, herdarAnexos: c.herdados.map(function (a) { return a.id; })
    };
    if (!rascunho && f.convite.checked) {
      if (!f.cvData.value) throw new Error('Escolha a data do convite.');
      const ini = new Date(f.cvData.value + 'T' + (f.cvInicio.value || '09:00') + ':00');
      let fim = new Date(f.cvData.value + 'T' + (f.cvFim.value || '10:00') + ':00');
      if (fim <= ini) fim = new Date(ini.getTime() + 3600000);
      d.convite = { titulo: f.cvTitulo.value || f.assunto.value || 'Compromisso', inicio: ini.toISOString(), fim: fim.toISOString(), local: f.cvLocal.value };
    }
    return d;
  }

  async function enviar(rascunho) {
    const f = $('formCompor'); if (!f) return;
    const botoes = f.querySelectorAll('button'); botoes.forEach(function (b) { b.disabled = true; });
    try {
      const r = await OM.api('POST', '/api/onmail/enviar', dadosCompor(rascunho));
      if (rascunho) { E.compor.rascunhoId = r.rascunhoId; OM.aviso('Rascunho salvo.'); botoes.forEach(function (b) { b.disabled = false; }); carregarPastas(); if (E.pasta === 'rascunhos') carregarLista(); return; }
      const e = r.entrega;
      const pendente = (e.externo && e.externo.estado !== 'enviado') || (e.whatsapp && e.whatsapp.estado !== 'enviado');
      OM.aviso(pendente ? 'Guardado em Enviados. Parte da entrega aguarda ativação — veja o detalhe na mensagem.' : 'Mensagem enviada.', false);
      E.compor = null;
      desenharVazio();
      carregarPastas(); carregarLista();
      if (!$('meuDia').hidden && OM.Agenda) OM.Agenda.meuDia();
    } catch (e) {
      botoes.forEach(function (b) { b.disabled = false; });
      OM.aviso(e.message, true);
      const alvo = e.campo && f.querySelector('[name="' + ({ 'WhatsApp do destinatário': 'whatsappDestino', mensagem: 'corpo' }[e.campo] || e.campo) + '"]');
      if (alvo) alvo.focus();
    }
  }

  function temConteudo() {
    const f = $('formCompor'); if (!f || !E.compor) return false;
    return !!(f.para.value.trim() || f.assunto.value.trim() || f.corpo.value.replace(E.conta.assinatura || '', '').trim() && E.compor.modo === 'novo' || E.compor.anexosNovos.length);
  }
  async function largarRascunho() {
    if (temConteudo() && !confirm('Descartar o que você escreveu? Use "Salvar rascunho" para guardar.')) return false;
    E.compor = null;
    return true;
  }

  // sugestões de endereço (contatos já trocados)
  async function sugerir(input) {
    if (!E.contatos) { try { E.contatos = (await OM.api('GET', '/api/onmail/contatos')).contatos; } catch (e) { E.contatos = []; } }
    fecharSugestoes();
    const partes = input.value.split(','), termo = partes[partes.length - 1].trim().toLowerCase();
    if (termo.length < 2) return;
    const achados = E.contatos.filter(function (c) { return (c.endereco + ' ' + c.nome).toLowerCase().includes(termo); }).slice(0, 8);
    if (!achados.length) return;
    const ul = document.createElement('ul'); ul.className = 'sugestoes'; ul.id = 'sugestoes';
    achados.forEach(function (c) {
      const li = document.createElement('li'); li.dataset.endereco = c.endereco;
      li.textContent = c.nome;
      if (c.nome !== c.endereco) { const s = document.createElement('small'); s.textContent = c.endereco; li.appendChild(s); }
      ul.appendChild(li);
    });
    const r = input.getBoundingClientRect();
    ul.style.left = r.left + 'px'; ul.style.top = (r.bottom + 2) + 'px';
    ul.addEventListener('mousedown', function (ev) {
      const li = ev.target.closest('li'); if (!li) return;
      ev.preventDefault();
      partes[partes.length - 1] = ' ' + li.dataset.endereco;
      input.value = partes.join(',').replace(/^\s+/, '') + ', ';
      fecharSugestoes(); input.focus();
    });
    document.body.appendChild(ul);
  }
  function fecharSugestoes() { const s = $('sugestoes'); if (s) s.remove(); }

  // ---------------------------------------------------------------------------
  // ações sobre a mensagem aberta
  // ---------------------------------------------------------------------------
  async function mudar(dados, aviso) {
    if (!E.msg) return;
    try {
      await OM.api('PATCH', '/api/onmail/mensagens/' + encodeURIComponent(E.msg.id), dados);
      if (aviso) OM.aviso(aviso);
      if (dados.pasta) desenharVazio(); else Object.assign(E.msg, dados);
      carregarPastas(); carregarLista();
    } catch (e) { tratarErro(e); }
  }
  async function excluir() {
    if (!E.msg) return;
    const definitivo = E.msg.pasta === 'lixeira';
    if (definitivo && !confirm('Apagar esta mensagem de vez? Não dá para desfazer.')) return;
    try {
      await OM.api('DELETE', '/api/onmail/mensagens/' + encodeURIComponent(E.msg.id));
      OM.aviso(definitivo ? 'Mensagem apagada.' : 'Movida para a Lixeira.');
      desenharVazio(); carregarPastas(); carregarLista();
    } catch (e) { tratarErro(e); }
  }

  // ---------------------------------------------------------------------------
  // módulos (E-mail / Agenda) e Meu dia
  // ---------------------------------------------------------------------------
  function modulo(nome) {
    $('modEmail').hidden = nome !== 'email';
    $('modAgenda').hidden = nome !== 'agenda';
    document.querySelectorAll('[data-modulo]').forEach(function (b) { b.classList.toggle('at', b.dataset.modulo === nome); });
    if (nome === 'agenda') OM.Agenda.carregar();
  }
  function alternarMeuDia() {
    const md = $('meuDia');
    md.hidden = !md.hidden;
    if (!md.hidden) OM.Agenda.meuDia();
  }

  // ---------------------------------------------------------------------------
  // boas-vindas (primeira entrada da conta)
  // ---------------------------------------------------------------------------
  function abrirBoasVindas() {
    const c = E.conta;
    $('tituloBoasVindas').textContent = 'Bem-vindo, ' + c.nome.split(' ')[0];
    $('bvEndereco').innerHTML = 'Sua caixa <b>' + esc(c.endereco) + '</b> já está ativa.';
    const n = String(c.whatsapp || '').replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3');
    $('bvWhatsapp').textContent = 'Os avisos vão para ' + n + '. ' + (E.entrega && E.entrega.whatsapp ? 'Mandamos uma mensagem para confirmar o número.' : 'A mensagem de confirmação sai assim que o WhatsApp for ativado no servidor.');
    $('bvVip').textContent = c.limiteVip < 0 ? 'No seu plano, todo e-mail que chega avisa na hora.' : 'No Start, escolha até ' + c.limiteVip + ' remetentes VIP em Configurações. Os demais chegam no resumo das 18h.';
    $('dlgBoasVindas').showModal();
  }
  async function fecharBoasVindas() {
    $('dlgBoasVindas').close();
    E.conta.novaConta = false;
    try { await OM.api('PUT', '/api/onmail/conta', { boasVindasVista: true }); } catch (e) { /* mostra de novo na próxima entrada */ }
  }

  // ---------------------------------------------------------------------------
  // configurações
  // ---------------------------------------------------------------------------
  function abrirConfig() {
    const f = $('formConfig'), c = E.conta;
    f.nome.value = c.nome; f.whatsapp.value = c.whatsapp; f.vip.value = (c.vip || []).join('\n'); f.assinatura.value = c.assinatura || '';
    f.senhaAtual.value = ''; f.senhaNova.value = '';
    $('contaInfo').innerHTML = '<b>' + esc(c.endereco) + '</b><br>Plano ' + esc({ start: 'Start', pro: 'Pro', business: 'Business' }[c.plano]) + (c.papel === 'admin' ? ' · administrador' : '');
    $('dicaVip').textContent = c.limiteVip < 0 ? 'No seu plano todo e-mail avisa na hora; a lista VIP destaca na Prioritária.' : 'Até ' + c.limiteVip + ' no plano Start. Os demais chegam no resumo das 18h.';
    $('erroConfig').textContent = '';
    $('dlgConfig').showModal();
  }
  async function salvarConfig() {
    const f = $('formConfig');
    try {
      const r = await OM.api('PUT', '/api/onmail/conta', { nome: f.nome.value, whatsapp: f.whatsapp.value, vip: f.vip.value.split(/[\n,;]/).map(function (s) { return s.trim(); }).filter(Boolean), assinatura: f.assinatura.value });
      E.conta = r.conta; $('avatar').textContent = OM.iniciais(E.conta.nome);
      $('dlgConfig').close(); OM.aviso('Configurações salvas.');
    } catch (e) { $('erroConfig').textContent = e.message; }
  }
  async function trocarSenha() {
    const f = $('formConfig');
    try {
      await OM.api('POST', '/api/onmail/conta/senha', { atual: f.senhaAtual.value, nova: f.senhaNova.value });
      f.senhaAtual.value = ''; f.senhaNova.value = '';
      OM.aviso('Senha trocada. As outras sessões foram encerradas.');
    } catch (e) { $('erroConfig').textContent = e.message; }
  }
  async function sair() {
    try { await OM.api('POST', '/api/onmail/sair', {}); } catch (e) { /* sai de qualquer jeito */ }
    location.replace('/onmail/entrar');
  }

  // ---------------------------------------------------------------------------
  // cliques, teclas e formulários
  // ---------------------------------------------------------------------------
  const ACOES = {
    novo: async function () { if (E.compor && !(await largarRascunho())) return; compor('novo'); },
    responder: function () { if (E.msg) compor('responder', E.msg); },
    responderTodos: function () { if (E.msg) compor('responderTodos', E.msg); },
    encaminhar: function () { if (E.msg) compor('encaminhar', E.msg); },
    excluir: excluir,
    arquivar: function () { mudar({ pasta: 'arquivo' }, 'Arquivada.'); },
    spam: function () { mudar({ pasta: E.msg && E.msg.pasta === 'spam' ? 'entrada' : 'spam' }, E.msg && E.msg.pasta === 'spam' ? 'Devolvida à Caixa de entrada.' : 'Movida para Spam.'); },
    lida: function () { if (E.msg) { mudar({ lida: !E.msg.lida }, E.msg.lida ? 'Marcada como não lida.' : 'Marcada como lida.'); } },
    sinalizar: function () { if (E.msg) mudar({ sinalizada: !E.msg.sinalizada }, E.msg.sinalizada ? 'Sinal retirado.' : 'Sinalizada.'); },
    criarEvento: function () {
      if (!E.msg) return;
      OM.Agenda.novoEvento({ titulo: E.msg.assunto, notas: 'Do e-mail de ' + (E.msg.deNome || E.msg.de) + ':\n' + E.msg.corpo.slice(0, 600), mensagemId: E.msg.id });
    },
    aceitarConvite: async function () {
      try { await OM.api('POST', '/api/onmail/convites/' + encodeURIComponent(E.msg.id) + '/aceitar', {}); E.msg.conviteAceito = true; desenharMensagem(E.msg); OM.aviso('Adicionado à sua agenda.'); OM.Agenda.atualizarTudo(); }
      catch (e) { tratarErro(e); }
    },
    atualizar: function () { carregarPastas(); carregarLista(); },
    voltar: function () { desenharVazio(); },
    descartar: async function () { if (await largarRascunho()) desenharVazio(); },
    salvarRascunho: function () { enviar(true); },
    menuPastas: function () { $('pastas').classList.toggle('abertas'); },
    meuDia: alternarMeuDia,
    config: abrirConfig,
    boasVindasOk: fecharBoasVindas,
    boasVindasConfig: async function () { await fecharBoasVindas(); abrirConfig(); },
    trocarSenha: trocarSenha,
    sair: sair,
    fecharDialogo: function (b) { b.closest('dialog').close(); },
    novoEvento: function () { OM.Agenda.novoEvento(); },
    excluirEvento: function () { OM.Agenda.excluir(); },
    icsEvento: function () { OM.Agenda.baixarIcs(); },
    agHoje: function () { OM.Agenda.hoje(); },
    agAnterior: function () { OM.Agenda.mover(-1); },
    agProximo: function () { OM.Agenda.mover(1); },
    miniAnterior: function () { OM.Agenda.miniMover(-1); },
    miniProximo: function () { OM.Agenda.miniMover(1); }
  };

  document.addEventListener('click', async function (ev) {
    const t = ev.target;
    const acao = t.closest('[data-acao]');
    if (acao && !acao.disabled && ACOES[acao.dataset.acao]) { ev.preventDefault(); ACOES[acao.dataset.acao](acao); return; }
    const pasta = t.closest('[data-pasta]');
    if (pasta) {
      if (E.compor && !(await largarRascunho())) return;
      E.pasta = pasta.dataset.pasta; E.q = ''; $('campoBusca').value = '';
      document.querySelectorAll('[data-pasta]').forEach(function (b) { b.classList.toggle('at', b === pasta); });
      $('pastas').classList.remove('abertas');
      modulo('email'); desenharVazio(); carregarLista();
      return;
    }
    const aba = t.closest('[data-aba]');
    if (aba) { E.aba = aba.dataset.aba; document.querySelectorAll('[data-aba]').forEach(function (b) { b.classList.toggle('at', b === aba); }); carregarLista(); return; }
    const item = t.closest('.item[data-msg]');
    if (item) { abrir(item.dataset.msg); return; }
    const mod = t.closest('[data-modulo]');
    if (mod) { modulo(mod.dataset.modulo); return; }
    const canal = t.closest('[data-canal]');
    if (canal && E.compor) { E.compor.canal = canal.dataset.canal; ajustarCanal(); return; }
    const tirar = t.closest('[data-tirar-anexo]');
    if (tirar && E.compor) {
      const [tipo, v] = tirar.dataset.tirarAnexo.split(':');
      if (tipo === 'n') E.compor.anexosNovos.splice(Number(v), 1);
      if (tipo === 'm') E.compor.manter = E.compor.manter.filter(function (a) { return a.id !== v; });
      if (tipo === 'h') E.compor.herdados = E.compor.herdados.filter(function (a) { return a.id !== v; });
      desenharAnexosCompor(); return;
    }
    if (!t.closest('#sugestoes')) fecharSugestoes();
    if (!t.closest('#pastas') && !t.closest('[data-acao=menuPastas]')) $('pastas').classList.remove('abertas');
  });

  document.addEventListener('keydown', function (ev) {
    if (ev.target.closest('input, textarea, select, dialog')) { if (ev.key === 'Escape') fecharSugestoes(); return; }
    if (ev.key === 'Enter' && ev.target.matches('.item[data-msg]')) { abrir(ev.target.dataset.msg); return; }
    if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.key === 'n' || ev.key === 'N') { ev.preventDefault(); ACOES.novo(); }
    else if ((ev.key === 'r' || ev.key === 'R') && E.msg) { ev.preventDefault(); ACOES.responder(); }
    else if (ev.key === 'Delete' && E.msg) { ev.preventDefault(); excluir(); }
    else if (ev.key === 'Escape') { if (E.compor) ACOES.descartar(); else if (E.msg) desenharVazio(); }
  });

  document.addEventListener('submit', function (ev) {
    const f = ev.target;
    if (f.id === 'formCompor') { ev.preventDefault(); enviar(false); }
    else if (f.id === 'formEvento') { ev.preventDefault(); OM.Agenda.salvar(); }
    else if (f.id === 'formConfig') { ev.preventDefault(); salvarConfig(); }
    else if (f.id === 'formBusca') {
      ev.preventDefault();
      E.q = $('campoBusca').value.trim();
      modulo('email'); desenharVazio(); carregarLista();
    }
  });
  document.addEventListener('input', function (ev) {
    const t = ev.target;
    if (t.id === 'campoBusca' && !t.value && E.q) { E.q = ''; carregarLista(); }
    if (t.id === 'cPara' || t.id === 'cCc') sugerir(t);
  });
  document.addEventListener('change', function (ev) {
    const t = ev.target;
    if (t.id === 'cArquivos') { lerArquivos(t.files); t.value = ''; }
    if (t.name === 'convite' && t.form && t.form.id === 'formCompor') {
      E.compor.convite = t.checked;
      $('extraConvite').hidden = !t.checked;
      if (t.checked && !t.form.cvData.value) { const d = new Date(); d.setDate(d.getDate() + 1); t.form.cvData.value = OM.dataInput(d); t.form.cvTitulo.value = t.form.assunto.value; }
    }
  });
  window.addEventListener('beforeunload', function (ev) { if (temConteudo()) { ev.preventDefault(); ev.returnValue = ''; } });

  OM.Caixa = { boasVindas: abrirBoasVindas, estado: E, modulo: modulo, abrir: abrir, compor: compor, carregarLista: carregarLista, carregarPastas: carregarPastas, desenharVazio: desenharVazio, pronto: false };
  iniciar();
})(window.OM = window.OM || {});
