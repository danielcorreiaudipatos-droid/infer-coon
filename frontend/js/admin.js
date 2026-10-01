// =============================================================================
// web/js/admin.js — painel do administrador do onmail
// -----------------------------------------------------------------------------
// Números reais da base, contas (bloquear/ativar), registro de segurança e o
// botão "Testar o app": roda o teste do servidor (POST /api/admin/onmail/autoteste)
// e o da tela (abre /onmail/caixa?teste=completo), e junta tudo numa frase:
//   "Tudo funcionando."  ou  "Precisa de correção em: … — providenciar."
// =============================================================================
(function () {
  'use strict';
  const esc = OM.esc, $ = function (id) { return document.getElementById(id); };
  const reais = function (v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };

  function erro(e) {
    if (e.status === 401) { location.replace('/onmail/entrar'); return; }
    $('erroAdm').hidden = false; $('erroAdm').textContent = e.message;
  }

  async function carregar() {
    try {
      const m = await OM.api('GET', '/api/admin/onmail/metricas');
      $('versao').textContent = 'versão ' + m.versao;
      const card = function (t, v, s) { return '<div class="cartao"><small>' + esc(t) + '</small><b>' + esc(v) + '</b>' + (s ? '<span>' + esc(s) + '</span>' : '') + '</div>'; };
      $('cartoes').innerHTML = card('Contas ativas', m.contas.ativas, 'de ' + m.contas.total + ' cadastradas')
        + card('Por plano', m.contas.porPlano.start + ' · ' + m.contas.porPlano.pro + ' · ' + m.contas.porPlano.business, 'Start · Pro · Business')
        + card('Enviadas hoje', m.mensagensHoje)
        + card('Eventos na agenda', m.eventos)
        + card('Alertas WhatsApp', m.alertas.enviado || 0, (m.alertas.na_fila || 0) + ' na fila · ' + (m.alertas.nao_configurado || 0) + ' sem ativação · ' + (m.alertas.falhou || 0) + ' falhas')
        + card('Senhas erradas 24 h', m.falhasDeEntrada24h, m.webhooksRecusados24h + ' webhooks recusados')
        + card('Mensalidade contratada', reais(m.mensalidadeContratada))
        + card('Envio externo', m.entrega.emailExterno ? 'ligado' : 'desligado', 'WhatsApp ' + (m.entrega.whatsapp ? 'ligado' : 'desligado'));
      $('obsMetricas').textContent = m.observacao;
      const c = await OM.api('GET', '/api/admin/onmail/contas');
      $('tabContas').querySelector('tbody').innerHTML = c.contas.map(function (x) {
        return '<tr><td>' + esc(x.nome) + (x.papel === 'admin' ? ' <small class="dica">(admin)</small>' : '') + '</td><td>' + esc(x.endereco) + '</td><td>' + esc(x.plano) + '</td><td>' + esc(x.whatsapp) + '</td>'
          + '<td>' + esc(new Date(x.criadaEm).toLocaleDateString('pt-BR')) + '</td><td><span class="estado ' + esc(x.status) + '">' + esc(x.status) + '</span></td>'
          + '<td>' + (x.papel === 'admin' ? '' : '<button class="bt" type="button" data-conta="' + esc(x.id) + '" data-status="' + (x.status === 'ativa' ? 'bloqueada' : 'ativa') + '">' + (x.status === 'ativa' ? 'Bloquear' : 'Ativar') + '</button>') + '</td></tr>';
      }).join('');
      const a = await OM.api('GET', '/api/admin/onmail/auditoria');
      $('tabAuditoria').querySelector('tbody').innerHTML = a.eventos.map(function (x) {
        return '<tr><td>' + esc(new Date(x.data).toLocaleString('pt-BR')) + '</td><td>' + esc(x.acao) + '</td><td>' + esc(x.conta || '') + '</td><td>' + esc(x.ip || '') + '</td><td>' + esc(x.detalhe || '') + '</td></tr>';
      }).join('');
    } catch (e) { erro(e); }
  }

  document.addEventListener('click', async function (ev) {
    const b = ev.target.closest('[data-conta]');
    if (!b) return;
    const bloquear = b.dataset.status === 'bloqueada';
    if (bloquear && !confirm('Bloquear esta conta? A pessoa sai na hora e não consegue entrar até ser ativada.')) return;
    try { await OM.api('POST', '/api/admin/onmail/contas/' + encodeURIComponent(b.dataset.conta) + '/status', { status: b.dataset.status }); OM.aviso(bloquear ? 'Conta bloqueada.' : 'Conta ativada.'); carregar(); }
    catch (e) { OM.aviso(e.message, true); }
  });

  $('btResumo').addEventListener('click', async function () {
    try { const r = await OM.api('POST', '/api/admin/onmail/resumo-agora', {}); OM.aviso(r.contas ? 'Resumo enviado para ' + r.contas + ' conta(s).' : 'Nenhum resumo na fila.'); carregar(); }
    catch (e) { OM.aviso(e.message, true); }
  });

  // ---------------------------------------------------------------------------
  // Testar o app
  // ---------------------------------------------------------------------------
  let servidor = null, tela = null, relatorio = null;
  const saida = $('resultadoTeste');

  $('btTestar').addEventListener('click', async function () {
    const bt = this; bt.disabled = true;
    servidor = null; tela = null;
    saida.innerHTML = '<p class="dica">Testando o servidor… depois a tela abre numa janela ao lado. Leva menos de um minuto.</p>';
    try { servidor = await OM.api('POST', '/api/admin/onmail/autoteste', {}); }
    catch (e) { servidor = { aprovado: false, falhas: ['não rodou: ' + e.message], grupos: {}, casos: [] }; }
    saida.innerHTML = '<p class="dica">Servidor conferido. Agora a tela: a janela do teste abre ao lado; aguarde aqui.</p>';
    const j = window.open('/onmail/caixa?teste=completo', 'testeOnmail', 'width=1320,height=860');
    if (!j) { tela = { aprovado: false, funcionalidade: { falhas: ['o navegador bloqueou a janela do teste; libere pop-ups para este site'] }, botoes: { falhas: [] }, layout: { falhas: [] } }; mostrar(); bt.disabled = false; }
    setTimeout(function () { if (!tela) { tela = { aprovado: false, funcionalidade: { falhas: ['a tela não respondeu em 3 minutos'] }, botoes: { falhas: [] }, layout: { falhas: [] } }; mostrar(); } bt.disabled = false; }, 180000);
  });

  window.addEventListener('message', function (ev) {
    if (ev.origin !== location.origin || !ev.data || ev.data.tipo !== 'onmail-teste-tela' || tela) return;
    tela = ev.data.resumo; mostrar(); $('btTestar').disabled = false;
  });

  function mostrar() {
    const falhas = [];
    (servidor.falhas || []).forEach(function (f) { falhas.push('servidor — ' + f); });
    ['funcionalidade', 'botoes', 'layout'].forEach(function (k) { (tela[k].falhas || []).forEach(function (f) { falhas.push('tela/' + k + ' — ' + f); }); });
    const aprovado = !falhas.length;
    const frase = aprovado ? 'Tudo funcionando.' : 'Precisa de correção em: ' + falhas.map(function (f) { return f.split(':')[0]; }).join('; ') + ' — providenciar.';
    const g = servidor.grupos || {};
    relatorio = { app: 'onmail', quando: new Date().toISOString(), aprovado: aprovado, mensagem: frase, servidor: servidor, tela: tela };
    saida.innerHTML = '<p class="frase ' + (aprovado ? 'ok' : 'erro') + '">' + (aprovado ? '✓ ' : '✗ ') + esc(frase) + '</p>'
      + '<div class="resultado-det">'
      + '<span>Servidor: funcionalidade ' + ((g.Funcional || {}).ok || 0) + '/' + ((g.Funcional || {}).total || 0) + ' · blindagem ' + ((g.Blindagem || {}).ok || 0) + '/' + ((g.Blindagem || {}).total || 0) + (servidor.segundos ? ' · ' + servidor.segundos + ' s' : '') + '</span>'
      + (tela.funcionalidade && tela.funcionalidade.casos ? '<span>Tela: funcionalidade ' + tela.funcionalidade.ok + '/' + tela.funcionalidade.casos + ' · botões ' + tela.botoes.ok + '/' + tela.botoes.acoes + ' · layout ' + tela.layout.ok + '/' + tela.layout.telas + ' telas</span>' : '')
      + (falhas.length ? '<ul>' + falhas.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '')
      + '<button class="bt" type="button" id="btBaixarRel"><svg class="icone" aria-hidden="true"><use href="img/icones.svg#download"></use></svg><span>Baixar relatório (.json)</span></button></div>';
    $('btBaixarRel').addEventListener('click', function () {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([JSON.stringify(relatorio, null, 1)], { type: 'application/json' }));
      a.download = 'teste-onmail-' + relatorio.quando.slice(0, 10) + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    });
    carregar();
  }

  carregar();
})();
