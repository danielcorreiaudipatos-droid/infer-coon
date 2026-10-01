// =============================================================================
// web/js/comum.js — utilidades de todas as páginas do onmail
// -----------------------------------------------------------------------------
// OM.api()   chamada à API com o cabeçalho anti-CSRF e erro legível
// OM.esc()   escapa texto antes de ir para o HTML (nada do usuário vira código)
// OM.icone() ícone do sprite; OM.aviso() mensagem flutuante; OM.tema() alterna
// =============================================================================
(function (OM) {
  'use strict';

  OM.api = async function (metodo, caminho, corpo) {
    const op = { method: metodo, headers: { 'X-Onmail': '1' }, credentials: 'same-origin' };
    if (corpo !== undefined) { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo); }
    let r;
    try { r = await fetch(caminho, op); }
    catch (e) { const x = new Error('Sem conexão com o servidor. Confira a internet e tente de novo.'); x.status = 0; throw x; }
    const tipo = r.headers.get('content-type') || '';
    const dados = tipo.includes('json') ? await r.json() : null;
    if (!r.ok) { const x = new Error((dados && dados.erro) || 'Falha (' + r.status + ').'); x.status = r.status; x.campo = dados && dados.campo; throw x; }
    return dados;
  };

  OM.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  };

  OM.icone = function (nome, cls) {
    return '<svg class="icone' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="img/icones.svg#' + nome + '"></use></svg>';
  };

  let tAviso = null;
  OM.aviso = function (texto, erro) {
    let el = document.getElementById('aviso');
    if (!el) { el = document.createElement('div'); el.id = 'aviso'; el.className = 'aviso'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = texto;
    el.classList.toggle('erro', !!erro);
    el.classList.add('ver');
    clearTimeout(tAviso);
    tAviso = setTimeout(function () { el.classList.remove('ver'); }, erro ? 6000 : 3200);
  };

  OM.temaAtual = function () {
    const t = document.documentElement.getAttribute('data-tema');
    if (t) return t;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro';
  };
  OM.tema = function () {
    const novo = OM.temaAtual() === 'escuro' ? 'claro' : 'escuro';
    document.documentElement.setAttribute('data-tema', novo);
    try { localStorage.setItem('onmail_tema', novo); } catch (e) { /* sem armazenamento */ }
  };

  // ---- datas ---------------------------------------------------------------
  const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  OM.MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  OM.DIAS = DIAS;
  OM.hora = function (d) { d = new Date(d); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
  OM.mesmoDia = function (a, b) { a = new Date(a); b = new Date(b); return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); };
  // na lista: hoje → hora; esta semana → dia; antes → data curta
  OM.quandoCurto = function (iso) {
    const d = new Date(iso), agora = new Date();
    if (OM.mesmoDia(d, agora)) return OM.hora(d);
    const dias = (agora - d) / 86400000;
    if (dias < 6) return DIAS[d.getDay()] + ' ' + OM.hora(d);
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + (d.getFullYear() !== agora.getFullYear() ? '/' + d.getFullYear() : '');
  };
  OM.quandoLongo = function (iso) {
    return new Date(iso).toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };
  OM.dataInput = function (d) { d = new Date(d); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  OM.tamanho = function (b) { return b < 1024 ? b + ' B' : b < 1048576 ? Math.round(b / 1024) + ' KB' : (b / 1048576).toFixed(1).replace('.', ',') + ' MB'; };
  OM.iniciais = function (nome) {
    const p = String(nome || '?').replace(/[<@].*$/, '').trim().split(/\s+/).filter(Boolean);
    return ((p[0] || '?')[0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
  };
  // cor estável por remetente (tons discretos)
  OM.corDe = function (s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return 'tom' + (h % 6); };

  document.addEventListener('click', function (ev) {
    const b = ev.target.closest('[data-tema-alternar]');
    if (b) OM.tema();
  });
})(window.OM = window.OM || {});
