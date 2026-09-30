// =============================================================================
// servidor/server.mjs — servidor independente do COON Infer
// -----------------------------------------------------------------------------
// Sobe o módulo sozinho (Railway, ou no PC para testar). Zero dependências:
// só Node 20+.
//
// De onde vem o login (quem é o usuário):
//   · COON_HUB_URL definido (ex.: https://app.copontoon.com): repassa o
//     cookie do navegador para  COON_HUB_URL/api/sessao  e usa o usuário
//     que o login único do COON devolver. Só entra quem tiver o app
//     "inferencia" liberado na conta.
//   · INFERENCIA_DEV=1: modo de teste no PC, usuário fixo "teste@local".
//     Recusado se estiver rodando no Railway.
//   · nenhum dos dois: API responde 401 (tela abre, mas pede login).
//
// Variáveis de ambiente (Railway → Variables):
//   PORT, COON_HUB_URL, SUPABASE_URL, SUPABASE_CHAVE, SUPADATA_CHAVE
// =============================================================================

import http from 'node:http';
import { tratarInferencia } from './rotas-inferencia.mjs';

const PORTA = Number(process.env.PORT) || 8795;
const HUB = (process.env.COON_HUB_URL || '').replace(/\/+$/, '');
const NA_NUVEM = Boolean(process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID);
const DEV = process.env.INFERENCIA_DEV === '1' && !NA_NUVEM;

// Guarda por 60 s a resposta do hub para não consultar a cada clique.
const cache = new Map();

async function sessaoDe(req) {
  if (DEV) return { email: 'teste@local', nome: 'Teste local' };
  if (!HUB) return null;
  const cookie = req.headers.cookie || '';
  if (!/coon_sessao=/.test(cookie)) return null;
  const guardado = cache.get(cookie);
  if (guardado && guardado.expira > Date.now()) return guardado.sessao;
  try {
    const r = await fetch(HUB + '/api/sessao', { headers: { cookie } });
    const j = await r.json();
    const u = j && j.usuario;
    const liberado = u && (u.admin || (Array.isArray(u.apps) && u.apps.some((a) => (a.codigo || a) === 'inferencia')));
    const sessao = liberado && u.situacao !== 'expirado' ? { email: u.email, nome: u.nome } : null;
    cache.set(cookie, { sessao, expira: Date.now() + 60000 });
    return sessao;
  } catch {
    return null;
  }
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  // healthcheck do Railway
  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, app: 'inferencia', ts: Date.now() }));
  }
  if (url.pathname === '/') { res.writeHead(302, { Location: '/inferencia/' }); return res.end(); }
  const sessao = url.pathname.startsWith('/inferencia/api/') ? await sessaoDe(req) : null;
  if (await tratarInferencia(req, res, url, sessao)) return;
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Não encontrado');
});

// No PC escuta só na própria máquina; na nuvem, em todas as interfaces.
servidor.listen(PORTA, NA_NUVEM ? '0.0.0.0' : '127.0.0.1', () => {
  console.log(`COON Infer em http://localhost:${PORTA}/inferencia/  (${DEV ? 'modo teste' : HUB ? 'login pelo hub ' + HUB : 'sem login configurado'})`);
});
