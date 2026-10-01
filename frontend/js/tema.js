// web/js/tema.js — aplica o tema salvo antes de desenhar a página (sem piscar)
(function () {
  try { var t = localStorage.getItem('onmail_tema'); if (t === 'claro' || t === 'escuro') document.documentElement.setAttribute('data-tema', t); } catch (e) { /* sem armazenamento */ }
})();
