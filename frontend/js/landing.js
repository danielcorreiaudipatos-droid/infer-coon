// =============================================================================
// web/js/landing.js — página de apresentação: reserva de nome, simulador e planos
// =============================================================================
(function () {
  'use strict';
  const esc = OM.esc;

  // ---- reserva do endereço -------------------------------------------------
  const formR = document.getElementById('formReserva');
  const resp = document.getElementById('respostaReserva');
  formR.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const nome = formR.nome.value.trim().toLowerCase();
    if (!nome) { resp.textContent = 'Digite o nome que você quer antes do @onmail.br.'; return; }
    resp.textContent = 'Conferindo…';
    try {
      const r = await OM.api('GET', '/api/onmail/disponivel?nome=' + encodeURIComponent(nome));
      if (r.disponivel) {
        resp.innerHTML = '<span class="sinal ok">✓</span> <b>' + esc(r.endereco) + '</b> está livre. <a href="/onmail/entrar?endereco=' + encodeURIComponent(nome) + '#cadastro">Garantir agora</a>';
      } else {
        resp.innerHTML = '<span class="sinal erro">✗</span> ' + esc(r.motivo || 'Este endereço não está disponível.');
      }
    } catch (e) { resp.textContent = e.message; }
  });

  // ---- simulador -----------------------------------------------------------
  const formS = document.getElementById('formSimular');
  const conversa = document.getElementById('conversa');
  formS.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    const qtd = Number(formS.qtd.value), mb = Math.max(0, Number(formS.mb.value) || 0);
    const anexos = [];
    for (let i = 0; i < qtd; i++) anexos.push({ nome: qtd === 1 ? 'proposta.pdf' : 'arquivo-' + (i + 1) + '.pdf', mb: mb / qtd });
    const remetente = 'cliente@empresa.com.br';
    try {
      const r = await OM.api('POST', '/api/onmail/simular', {
        plano: formS.plano.value, remetente, vip: formS.vip.value === 'sim' ? [remetente] : ['outro@empresa.com.br'],
        assunto: 'Proposta aprovada', corpo: 'Bom dia! A proposta foi aprovada pela diretoria. Podemos marcar a vistoria para quinta-feira às 9h?', anexos
      });
      const nota = r.alerta === 'resumo' ? 'Fora da lista VIP no plano Start: entra no resumo das 18h.' : r.triagem.texto;
      conversa.innerHTML = '<p class="balao-nota">' + esc(nota) + '</p><p class="balao">' + formatarZap(r.whatsapp) + '</p>';
    } catch (e) { conversa.innerHTML = '<p class="balao vazio">' + esc(e.message) + '</p>'; }
  });
  // *negrito* e _itálico_ do WhatsApp, sempre depois de escapar
  function formatarZap(t) {
    return esc(t).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/(^|\s)_([^_\n]+)_/g, '$1<i>$2</i>');
  }

  // ---- planos --------------------------------------------------------------
  let planos = null, periodo = 'mensal';
  const grade = document.getElementById('planos-grade');
  const reais = function (v) { return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  function desenharPlanos() {
    if (!planos) return;
    grade.innerHTML = ['start', 'pro', 'business'].map(function (id) {
      const p = planos[id];
      const anual = periodo === 'anual';
      const valor = anual ? p.preco.anual : p.preco.mensal;
      const preco = valor === 0 ? 'Grátis' : 'R$ ' + reais(valor) + '<small>/' + (anual ? 'ano' : 'mês') + '</small>';
      const equivale = anual && valor > 0 ? 'equivale a R$ ' + reais(valor / 12) + ' por mês' : '';
      return '<article class="plano' + (id === 'business' ? ' destaque' : '') + '">'
        + '<span class="p-selo">' + esc(p.selo) + '</span><h3>' + esc(p.nome) + '</h3>'
        + '<div class="preco">' + preco + '</div><div class="equivale">' + esc(equivale) + '</div>'
        + (p.promocao && anual ? '<span class="promo">' + esc(p.promocao.texto) + ' até ' + esc(p.promocao.validoAte.split('-').reverse().join('/')) + '</span>' : '')
        + '<ul>' + p.itens.map(function (i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul>'
        + '<a class="bt ' + (id === 'business' ? 'bt-marca' : '') + ' bt-g" href="/onmail/entrar?plano=' + id + '#cadastro">' + (valor === 0 ? 'Começar grátis' : 'Escolher ' + esc(p.nome)) + '</a>'
        + '</article>';
    }).join('');
  }
  document.querySelectorAll('[data-periodo]').forEach(function (b) {
    b.addEventListener('click', function () {
      periodo = b.dataset.periodo;
      document.querySelectorAll('[data-periodo]').forEach(function (x) { x.classList.toggle('at', x === b); });
      desenharPlanos();
    });
  });
  OM.api('GET', '/api/onmail/planos').then(function (r) { planos = r.planos; desenharPlanos(); })
    .catch(function () { grade.innerHTML = '<p class="dica">Os planos não carregaram agora. Recarregue a página em instantes.</p>'; });
})();
