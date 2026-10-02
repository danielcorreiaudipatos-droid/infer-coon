// js/menu-arquivo.js — abre/fecha o menu "Arquivo" do cabeçalho (Exportar Excel/PDF, Baixar, Abrir arquivo).
// Puramente visual: não mexe em nenhuma ação (data-acao) nem no motor.
(function () {
  function iniciar() {
    const botao = document.getElementById('btnMaisArquivo');
    const menu = document.getElementById('menuMaisArquivo');
    if (!botao || !menu) return;

    function fechar() {
      menu.hidden = true;
      botao.setAttribute('aria-expanded', 'false');
    }
    function abrir() {
      menu.hidden = false;
      botao.setAttribute('aria-expanded', 'true');
    }

    botao.addEventListener('click', function (e) {
      e.stopPropagation();
      if (menu.hidden) abrir(); else fechar();
    });
    document.addEventListener('click', function (e) {
      if (!menu.hidden && !menu.contains(e.target) && e.target !== botao) fechar();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') fechar();
    });
    // Fecha o menu assim que qualquer ação dele for escolhida (export, baixar, abrir arquivo).
    menu.addEventListener('click', function (e) {
      if (e.target.closest('button, label')) fechar();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
