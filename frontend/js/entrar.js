// =============================================================================
// web/js/entrar.js — entrar e criar conta
// =============================================================================
(function () {
  'use strict';
  const fE = document.getElementById('formEntrar'), fC = document.getElementById('formCadastro');
  const q = new URLSearchParams(location.search);

  function modo(m) {
    fE.hidden = m !== 'entrar'; fC.hidden = m !== 'cadastro';
    document.querySelectorAll('[data-modo]').forEach(function (b) { b.classList.toggle('at', b.dataset.modo === m); b.setAttribute('aria-selected', String(b.dataset.modo === m)); });
    const alvo = (m === 'entrar' ? fE : fC).querySelector('input');
    if (alvo && !('ontouchstart' in window)) alvo.focus();
  }
  document.querySelectorAll('[data-modo]').forEach(function (b) {
    b.addEventListener('click', function () { modo(b.dataset.modo); history.replaceState(null, '', b.dataset.modo === 'cadastro' ? '#cadastro' : location.pathname + location.search); });
  });
  if (q.get('endereco')) fC.endereco.value = q.get('endereco');
  if (['start', 'pro', 'business'].includes(q.get('plano'))) fC.plano.value = q.get('plano');
  modo(location.hash === '#cadastro' ? 'cadastro' : 'entrar');

  // já está dentro? vai direto para a caixa
  OM.api('GET', '/api/onmail/sessao').then(function () { location.replace('/onmail/caixa'); }).catch(function () { /* fica aqui */ });

  fE.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const erro = document.getElementById('erroEntrar'); erro.textContent = '';
    const b = fE.querySelector('button[type=submit]'); b.disabled = true;
    try {
      await OM.api('POST', '/api/onmail/entrar', { endereco: fE.endereco.value, senha: fE.senha.value });
      location.replace('/onmail/caixa');
    } catch (e) { erro.textContent = e.message; b.disabled = false; }
  });

  // disponibilidade do endereço enquanto digita
  let t = null;
  const dica = document.getElementById('dicaEndereco');
  fC.endereco.addEventListener('input', function () {
    clearTimeout(t);
    const v = fC.endereco.value.trim().toLowerCase();
    if (!v) { dica.className = 'dica'; dica.textContent = 'Letras, números e ponto. Sem números fica mais fácil de lembrar.'; return; }
    t = setTimeout(async function () {
      try {
        const r = await OM.api('GET', '/api/onmail/disponivel?nome=' + encodeURIComponent(v));
        dica.className = 'dica ' + (r.disponivel ? 'ok' : 'erro');
        dica.textContent = r.disponivel ? '✓ ' + r.endereco + ' está livre' + (r.temNumeros ? ' (tem números; se puder, prefira só letras)' : '') + '.' : '✗ ' + (r.motivo || 'Indisponível.');
      } catch (e) { dica.className = 'dica erro'; dica.textContent = e.message; }
    }, 300);
  });
  fC.senha.addEventListener('input', function () {
    const s = fC.senha.value, d = document.getElementById('dicaSenha');
    const ok = s.length >= 10 && /[a-zA-Z]/.test(s) && /\d/.test(s);
    d.className = 'dica ' + (s ? (ok ? 'ok' : 'erro') : '');
    d.textContent = ok ? '✓ Senha aceita.' : 'Pelo menos 10 caracteres, com letras e números.';
  });

  fC.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const erro = document.getElementById('erroCadastro'); erro.textContent = '';
    const b = fC.querySelector('button[type=submit]'); b.disabled = true;
    try {
      await OM.api('POST', '/api/onmail/cadastro', { nome: fC.nome.value, endereco: fC.endereco.value, whatsapp: fC.whatsapp.value, senha: fC.senha.value, plano: fC.plano.value });
      location.replace('/onmail/caixa');
    } catch (e) {
      erro.textContent = e.message; b.disabled = false;
      const campo = e.campo && fC.querySelector('[name="' + e.campo + '"]'); if (campo) campo.focus();
    }
  });
})();
