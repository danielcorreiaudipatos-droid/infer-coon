// =============================================================================
// web/js/agenda.js — agenda do onmail (dia, semana, mês) + painel Meu dia
// -----------------------------------------------------------------------------
// Tudo em horário local do navegador; o servidor guarda em UTC (ISO).
// Expõe OM.Agenda: abrir(), novoEvento(dados), editar(id), meuDia().
// =============================================================================
(function (OM) {
  'use strict';
  const esc = OM.esc;
  const AG = { vista: window.innerWidth < 760 ? 'dia' : 'semana', data: new Date(), eventos: [], miniData: new Date(), editando: null, doMes: [] };
  OM.Agenda = AG;

  const inicioDia = function (d) { d = new Date(d); d.setHours(0, 0, 0, 0); return d; };
  const somaDias = function (d, n) { d = new Date(d); d.setDate(d.getDate() + n); return d; };
  const inicioSemana = function (d) { d = inicioDia(d); return somaDias(d, -d.getDay()); };

  function intervalo() {
    if (AG.vista === 'dia') return [inicioDia(AG.data), somaDias(inicioDia(AG.data), 1)];
    if (AG.vista === 'semana') { const i = inicioSemana(AG.data); return [i, somaDias(i, 7)]; }
    const p = new Date(AG.data.getFullYear(), AG.data.getMonth(), 1);
    const i = inicioSemana(p);
    return [i, somaDias(i, 42)];
  }

  async function buscar(de, ate) {
    const r = await OM.api('GET', '/api/onmail/agenda?de=' + encodeURIComponent(de.toISOString()) + '&ate=' + encodeURIComponent(ate.toISOString()));
    return r.eventos;
  }

  AG.carregar = async function () {
    const [de, ate] = intervalo();
    try { AG.eventos = await buscar(de, ate); } catch (e) { OM.aviso(e.message, true); AG.eventos = []; }
    AG.desenhar();
  };

  function doDia(lista, dia) {
    const i = inicioDia(dia).getTime(), f = i + 86400000;
    return lista.filter(function (e) { return new Date(e.inicio).getTime() < f && new Date(e.fim).getTime() > i; });
  }

  function titulo() {
    const d = AG.data;
    if (AG.vista === 'dia') return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    if (AG.vista === 'mes') return OM.MESES[d.getMonth()] + ' de ' + d.getFullYear();
    const i = inicioSemana(d), f = somaDias(i, 6);
    return i.getMonth() === f.getMonth() ? i.getDate() + ' a ' + f.getDate() + ' de ' + OM.MESES[i.getMonth()] + ' de ' + i.getFullYear()
      : i.getDate() + ' de ' + OM.MESES[i.getMonth()].slice(0, 3) + ' a ' + f.getDate() + ' de ' + OM.MESES[f.getMonth()].slice(0, 3) + ' de ' + f.getFullYear();
  }

  AG.desenhar = function () {
    document.getElementById('agTitulo').textContent = titulo();
    document.querySelectorAll('[data-vista]').forEach(function (b) { b.classList.toggle('at', b.dataset.vista === AG.vista); });
    const alvo = document.getElementById('agenda');
    if (AG.vista === 'mes') alvo.innerHTML = desenharMes();
    else alvo.innerHTML = desenharSemana(AG.vista === 'dia' ? [inicioDia(AG.data)] : Array.from({ length: 7 }, function (_, i) { return somaDias(inicioSemana(AG.data), i); }));
    // rola até 7h na primeira abertura da semana/dia
    if (AG.vista !== 'mes' && !AG._rolou) { alvo.scrollTop = 7 * 48; AG._rolou = true; }
  };

  function blocoEvento(e, dia) {
    const ini = new Date(e.inicio), fim = new Date(e.fim), d0 = inicioDia(dia).getTime();
    const a = Math.max(0, (ini - d0) / 60000), b = Math.min(1440, (fim - d0) / 60000);
    const topo = a / 60 * 48, alt = Math.max(22, (b - a) / 60 * 48 - 2);
    return '<button type="button" class="ev c-' + esc(e.cor || 'azul') + '" data-evento="' + esc(e.id) + '" style-top="' + topo + '" style-alt="' + alt + '">'
      + '<b>' + esc(e.titulo) + '</b><small>' + OM.hora(ini) + '–' + OM.hora(fim) + (e.local ? ' · ' + esc(e.local) : '') + '</small></button>';
  }

  function desenharSemana(dias) {
    const hoje = new Date();
    let h = '<div class="sem" style-dias="' + dias.length + '"><div class="sem-canto"></div>';
    dias.forEach(function (d) { h += '<div class="sem-cab' + (OM.mesmoDia(d, hoje) ? ' hoje' : '') + '">' + OM.DIAS[d.getDay()] + '<b>' + d.getDate() + '</b></div>'; });
    h += '<div class="sem-horas">' + Array.from({ length: 24 }, function (_, i) { return '<span>' + (i ? String(i).padStart(2, '0') + ':00' : '') + '</span>'; }).join('') + '</div>';
    dias.forEach(function (d) {
      h += '<div class="sem-dia' + (OM.mesmoDia(d, hoje) ? ' hoje' : '') + '" data-dia="' + OM.dataInput(d) + '">';
      if (OM.mesmoDia(d, hoje)) h += '<i class="agora" style-top="' + ((hoje.getHours() * 60 + hoje.getMinutes()) / 60 * 48) + '"></i>';
      doDia(AG.eventos, d).forEach(function (e) { h += blocoEvento(e, d); });
      h += '</div>';
    });
    return h + '</div>';
  }

  function desenharMes() {
    const [i] = intervalo(), hoje = new Date(), mes = AG.data.getMonth();
    let h = '<div class="mes">' + OM.DIAS.map(function (d) { return '<div class="mes-cab">' + d + '</div>'; }).join('');
    for (let k = 0; k < 42; k++) {
      const d = somaDias(i, k), evs = doDia(AG.eventos, d);
      h += '<div class="mes-dia' + (d.getMonth() !== mes ? ' fora' : '') + (OM.mesmoDia(d, hoje) ? ' hoje' : '') + '" data-dia="' + OM.dataInput(d) + '"><span>' + d.getDate() + '</span>';
      evs.slice(0, 3).forEach(function (e) { h += '<button type="button" class="ev c-' + esc(e.cor || 'azul') + '" data-evento="' + esc(e.id) + '"><b>' + OM.hora(e.inicio) + ' ' + esc(e.titulo) + '</b></button>'; });
      if (evs.length > 3) h += '<button type="button" class="mais-ev" data-ir-dia="' + OM.dataInput(d) + '">+' + (evs.length - 3) + ' mais</button>';
      h += '</div>';
    }
    return h + '</div>';
  }

  // Posições vêm em atributos (a CSP não deixa style="" no HTML): aplica por CSSOM.
  AG.posicionar = function (raiz) {
    raiz.querySelectorAll('[style-top]').forEach(function (el) { el.style.top = el.getAttribute('style-top') + 'px'; if (el.hasAttribute('style-alt')) el.style.height = el.getAttribute('style-alt') + 'px'; });
    raiz.querySelectorAll('[style-dias]').forEach(function (el) { el.style.setProperty('--dias', el.getAttribute('style-dias')); });
  };
  const desenharOriginal = AG.desenhar;
  AG.desenhar = function () { desenharOriginal(); AG.posicionar(document.getElementById('agenda')); };

  // ---- navegação -----------------------------------------------------------
  AG.mover = function (n) {
    if (AG.vista === 'dia') AG.data = somaDias(AG.data, n);
    else if (AG.vista === 'semana') AG.data = somaDias(AG.data, 7 * n);
    else AG.data = new Date(AG.data.getFullYear(), AG.data.getMonth() + n, 1);
    AG.carregar();
  };
  AG.hoje = function () { AG.data = new Date(); AG.carregar(); };
  AG.mudarVista = function (v) { AG.vista = v; AG._rolou = false; AG.carregar(); };
  AG.irDia = function (iso) { AG.data = new Date(iso + 'T12:00:00'); AG.vista = 'dia'; AG._rolou = false; AG.carregar(); };

  // ---- diálogo do evento ---------------------------------------------------
  const dlg = function () { return document.getElementById('dlgEvento'); };
  function preencher(f, e) {
    const ini = new Date(e.inicio), fim = new Date(e.fim);
    f.titulo.value = e.titulo || '';
    f.diaInteiro.checked = !!e.diaInteiro;
    f.data.value = OM.dataInput(ini);
    f.inicio.value = OM.hora(ini); f.fim.value = OM.hora(fim);
    f.local.value = e.local || ''; f.notas.value = e.notas || '';
    f.lembrete.value = String(e.lembrete || 0); f.cor.value = e.cor || 'azul';
    f.inicio.disabled = f.fim.disabled = f.diaInteiro.checked;
  }
  AG.novoEvento = function (base) {
    base = base || {};
    const ini = base.inicio ? new Date(base.inicio) : (function () { const d = new Date(); d.setMinutes(0, 0, 0); d.setHours(d.getHours() + 1); return d; })();
    AG.editando = { id: null, mensagemId: base.mensagemId || null };
    const f = document.getElementById('formEvento');
    preencher(f, { titulo: base.titulo || '', inicio: ini.toISOString(), fim: new Date(ini.getTime() + 3600000).toISOString(), local: base.local || '', notas: base.notas || '', lembrete: 15, cor: 'azul' });
    document.getElementById('tituloEvento').textContent = 'Novo evento';
    document.getElementById('erroEvento').textContent = '';
    f.querySelector('[data-acao=excluirEvento]').hidden = true; f.querySelector('[data-acao=icsEvento]').hidden = true;
    dlg().showModal();
    f.titulo.focus();
  };
  AG.editar = function (id) {
    const e = AG.eventos.concat(AG.doMes).find(function (x) { return x.id === id; });
    if (!e) return;
    AG.editando = { id: id };
    const f = document.getElementById('formEvento');
    preencher(f, e);
    document.getElementById('tituloEvento').textContent = 'Editar evento';
    document.getElementById('erroEvento').textContent = '';
    f.querySelector('[data-acao=excluirEvento]').hidden = false; f.querySelector('[data-acao=icsEvento]').hidden = false;
    dlg().showModal();
  };
  function lerForm(f) {
    if (!f.data.value) throw new Error('Escolha a data.');
    let ini, fim;
    if (f.diaInteiro.checked) { ini = new Date(f.data.value + 'T00:00:00'); fim = new Date(f.data.value + 'T23:59:00'); }
    else {
      ini = new Date(f.data.value + 'T' + (f.inicio.value || '09:00') + ':00');
      fim = new Date(f.data.value + 'T' + (f.fim.value || OM.hora(new Date(ini.getTime() + 3600000))) + ':00');
      if (fim <= ini) fim = new Date(ini.getTime() + 3600000);
    }
    return { titulo: f.titulo.value, inicio: ini.toISOString(), fim: fim.toISOString(), diaInteiro: f.diaInteiro.checked, local: f.local.value, notas: f.notas.value, lembrete: Number(f.lembrete.value), cor: f.cor.value };
  }
  AG.salvar = async function () {
    const f = document.getElementById('formEvento'), erro = document.getElementById('erroEvento');
    erro.textContent = '';
    try {
      const dados = lerForm(f);
      if (AG.editando && AG.editando.id) await OM.api('PUT', '/api/onmail/agenda/' + encodeURIComponent(AG.editando.id), dados);
      else await OM.api('POST', '/api/onmail/agenda', Object.assign(dados, { mensagemId: AG.editando && AG.editando.mensagemId }));
      dlg().close();
      OM.aviso(AG.editando && AG.editando.id ? 'Evento atualizado.' : 'Evento criado na agenda.');
      AG.atualizarTudo();
    } catch (e) { erro.textContent = e.message; }
  };
  AG.excluir = async function () {
    if (!AG.editando || !AG.editando.id) return;
    if (!confirm('Excluir este evento da agenda?')) return;
    try { await OM.api('DELETE', '/api/onmail/agenda/' + encodeURIComponent(AG.editando.id)); dlg().close(); OM.aviso('Evento excluído.'); AG.atualizarTudo(); }
    catch (e) { document.getElementById('erroEvento').textContent = e.message; }
  };
  AG.baixarIcs = function () {
    if (!AG.editando || !AG.editando.id) return;
    const a = document.createElement('a'); a.href = '/api/onmail/agenda/' + encodeURIComponent(AG.editando.id) + '/ics'; a.download = 'evento.ics';
    document.body.appendChild(a); a.click(); a.remove();
  };
  AG.atualizarTudo = function () {
    if (!document.getElementById('modAgenda').hidden) AG.carregar();
    if (!document.getElementById('meuDia').hidden) AG.meuDia();
  };

  // ---- Meu dia -------------------------------------------------------------
  AG.meuDia = async function () {
    const hoje = inicioDia(new Date());
    const m = AG.miniData, p = new Date(m.getFullYear(), m.getMonth(), 1), i = inicioSemana(p);
    let evs = [];
    try { evs = await buscar(i, somaDias(hoje, 8) > somaDias(i, 42) ? somaDias(hoje, 8) : somaDias(i, 42)); } catch (e) { /* mostra vazio */ }
    AG.doMes = evs;
    let h = '<div class="mc-titulo"><button class="bt bt-icone" type="button" data-acao="miniAnterior" aria-label="Mês anterior">' + OM.icone('esquerda') + '</button><span>' + OM.MESES[m.getMonth()] + ' ' + m.getFullYear() + '</span><button class="bt bt-icone" type="button" data-acao="miniProximo" aria-label="Próximo mês">' + OM.icone('direita') + '</button></div>';
    h += OM.DIAS.map(function (d) { return '<span>' + d[0].toUpperCase() + '</span>'; }).join('');
    for (let k = 0; k < 42; k++) {
      const d = somaDias(i, k);
      h += '<button type="button" data-ir-dia="' + OM.dataInput(d) + '" class="' + (d.getMonth() !== m.getMonth() ? 'fora ' : '') + (OM.mesmoDia(d, hoje) ? 'hoje ' : '') + (doDia(evs, d).length ? 'tem' : '') + '" aria-label="' + d.getDate() + ' de ' + OM.MESES[d.getMonth()] + '">' + d.getDate() + '</button>';
    }
    document.getElementById('miniCal').innerHTML = h;
    let lista = '';
    for (let k = 0; k < 7; k++) {
      const d = somaDias(hoje, k), ds = doDia(evs, d);
      if (!ds.length && k > 0) continue;
      lista += '<p class="md-dia">' + (k === 0 ? 'Hoje' : k === 1 ? 'Amanhã' : d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric' })) + '</p>';
      lista += ds.length ? ds.map(function (e) { return '<button type="button" class="md-ev c-' + esc(e.cor || 'azul') + '" data-evento="' + esc(e.id) + '"><b>' + esc(e.titulo) + '</b><small>' + (e.diaInteiro ? 'Dia inteiro' : OM.hora(e.inicio) + '–' + OM.hora(e.fim)) + (e.local ? ' · ' + esc(e.local) : '') + '</small></button>'; }).join('')
        : '<p class="md-vazio">Nada marcado para hoje.</p>';
    }
    document.getElementById('mdEventos').innerHTML = lista;
  };
  AG.miniMover = function (n) { AG.miniData = new Date(AG.miniData.getFullYear(), AG.miniData.getMonth() + n, 1); AG.meuDia(); };

  // ---- eventos de clique da agenda -----------------------------------------
  document.addEventListener('click', function (ev) {
    const alvo = ev.target;
    const evento = alvo.closest('[data-evento]');
    if (evento) { ev.stopPropagation(); AG.editar(evento.dataset.evento); return; }
    const ir = alvo.closest('[data-ir-dia]');
    if (ir) { if (document.getElementById('modAgenda').hidden && OM.Caixa) OM.Caixa.modulo('agenda'); AG.irDia(ir.dataset.irDia); return; }
    const vista = alvo.closest('[data-vista]');
    if (vista) { AG.mudarVista(vista.dataset.vista); return; }
    // clique num horário vazio da semana/dia cria evento naquela hora
    const col = alvo.closest('.sem-dia');
    if (col) {
      const r = col.getBoundingClientRect(), min = Math.floor((ev.clientY - r.top) / 48 * 2) * 30;
      const d = new Date(col.dataset.dia + 'T00:00:00'); d.setMinutes(min);
      AG.novoEvento({ inicio: d.toISOString() });
      return;
    }
    const dia = alvo.closest('.mes-dia');
    if (dia) { const d = new Date(dia.dataset.dia + 'T09:00:00'); AG.novoEvento({ inicio: d.toISOString() }); }
  });
  document.addEventListener('change', function (ev) {
    if (ev.target.name === 'diaInteiro' && ev.target.form && ev.target.form.id === 'formEvento') {
      ev.target.form.inicio.disabled = ev.target.form.fim.disabled = ev.target.checked;
    }
  });
})(window.OM = window.OM || {});
