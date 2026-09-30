/* =============================================================================
   web/js/nuvem.js — conversa da tela com o servidor
   -----------------------------------------------------------------------------
   Toda ida ao servidor passa por aqui. O navegador só fala com o próprio
   servidor do COON (mesmo endereço); quem fala com Supabase, Supadata e a
   API da IA é o servidor, com as chaves guardadas lá.

   Se o servidor não responder (sem internet, por exemplo), a tela continua
   funcionando: o cálculo é todo local e o projeto fica guardado no próprio
   navegador até a conexão voltar.
   ============================================================================= */

(function (INF) {
  'use strict';

  const API = 'api/';          // relativo a /inferencia/
  const Nv = { online: false, sessao: null };

  async function chamar(metodo, rota, corpo) {
    const op = { method: metodo, headers: {}, credentials: 'same-origin' };
    if (corpo !== undefined) { op.headers['Content-Type'] = 'application/json'; op.body = JSON.stringify(corpo); }
    let r;
    try { r = await fetch(API + rota, op); }
    catch (e) { Nv.online = false; throw new Error('Sem conexão com o servidor. O trabalho continua salvo neste navegador.'); }
    Nv.online = true;
    const tipo = r.headers.get('content-type') || '';
    const dados = tipo.indexOf('json') >= 0 ? await r.json() : await r.text();
    if (!r.ok) throw new Error((dados && dados.erro) || ('Erro ' + r.status));
    return dados;
  }

  Nv.iniciar = async function () {
    try { Nv.sessao = await chamar('GET', 'sessao'); }
    catch (e) { Nv.sessao = null; }
    return Nv.sessao;
  };
  Nv.logado = function () { return !!(Nv.sessao && Nv.sessao.usuario); };

  // [SUPABASE] projetos
  Nv.listar = function () { return chamar('GET', 'projetos'); };
  Nv.abrir = function (id) { return chamar('GET', 'projetos/' + id); };
  Nv.salvar = function (id, dados) { return chamar('POST', 'projetos', { id: id, dados: dados }); };
  Nv.excluir = function (id) { return chamar('DELETE', 'projetos/' + id); };

  // [SUPABASE] banco de mercado ("dados do sistema")
  Nv.mercado = function (municipio, tipologia, compartilhadas) {
    return chamar('GET', 'mercado?municipio=' + encodeURIComponent(municipio || '') + '&tipologia=' + encodeURIComponent(tipologia || '') + (compartilhadas ? '&compartilhadas=1' : ''));
  };
  Nv.gravarMercado = function (itens) { return chamar('POST', 'mercado', { itens: itens }); };

  // [SUPADATA] leitura de um anúncio pelo link
  Nv.anuncio = function (link) { return chamar('POST', 'anuncio', { link: link }); };

  // [CLAUDE] conferência das amostras pela IA
  Nv.conferirIA = function (id, dados) { return chamar('POST', 'conferir-ia', { id: id, dados: dados }); };

  // [GOOGLE MAPS] imagem do mapa → "data:image/png;base64,..." para guardar no projeto
  Nv.mapa = async function (tipo, centro, marcadores) {
    let r;
    try { r = await fetch(API + 'mapa', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo: tipo, centro: centro, marcadores: marcadores }) }); }
    catch (e) { throw new Error('Sem conexão com o servidor.'); }
    if (!r.ok) { const j = await r.json().catch(function () { return {}; }); throw new Error(j.erro || 'Erro ' + r.status); }
    const blob = await r.blob();
    return new Promise(function (ok) { const f = new FileReader(); f.onload = function () { ok(f.result); }; f.readAsDataURL(blob); });
  };

  // [CLAUDE] inventário de um documento: { nome, mime, base64 } ou { nome, texto }
  // campos = inventário do modelo de laudo (o que a IA deve buscar); modelo = nome do tipo de laudo
  Nv.inventariar = function (id, arquivo, campos, modelo) { return chamar('POST', 'inventario', Object.assign({ id: id, campos: campos, modelo: modelo }, arquivo)); };

  // [CLAUDE] quadro de dúvidas
  Nv.duvida = function (id, pergunta, contexto, historico) { return chamar('POST', 'duvida', { id: id, pergunta: pergunta, contexto: contexto, historico: historico }); };

  INF.Nuvem = Nv;
})(globalThis.INF = globalThis.INF || {});
