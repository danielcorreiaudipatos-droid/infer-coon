// =============================================================================
// integracao/trecho-server-coon.mjs — o que acrescentar no servidor do COON
// -----------------------------------------------------------------------------
// Arquivo de REFERÊNCIA (não roda sozinho). São três trechos para colar no
// servidor principal do COON (RAE Pericial\nuvem\server.mjs), que é onde
// fica o login único. Assim o Infer abre em
//        https://<seu domínio>/inferencia/
// com o MESMO login, sem outro serviço e sem mexer no cookie de sessão.
//
// Antes: copiar a pasta inteira do Infer para dentro do servidor:
//        RAE Pericial\nuvem\inferencia\   (motor, web, servidor, supabase...)
// =============================================================================


// ---- TRECHO 1 — junto dos outros "import", no topo do server.mjs -----------
import { tratarInferencia } from './inferencia/servidor/rotas-inferencia.mjs';


// ---- TRECHO 2 — no catálogo de programas (const APPS_PADRAO = [ ... ]) ------
// acrescentar este item à lista:
//   { codigo: 'inferencia', nome: 'COON Infer', disponivel: true },


// ---- TRECHO 3 — dentro do createServer, logo DEPOIS do bloco do healthcheck
// ("if (url.pathname === '/api/status') { ... }") e ANTES de "/api/sessao" ---
if (url.pathname === '/inferencia' || url.pathname.startsWith('/inferencia/')) {
  // a sessão só é consultada nas chamadas de API; as páginas abrem livres
  // (a própria tela pede login se a API responder 401)
  let sessaoInf = null;
  if (url.pathname.startsWith('/inferencia/api/')) {
    const s = sessaoDe(req);
    const u = s && lerUsuarios().find((x) => x.email === s.email);
    // entra quem é administrador ou tem o app "inferencia" liberado e em dia
    const pode = s && s.situacao !== 'expirado' && (s.admin || liberados(u).includes('inferencia'));
    if (pode) sessaoInf = { email: s.email, nome: s.nome };
  }
  if (await tratarInferencia(req, res, url, sessaoInf)) return;
}
