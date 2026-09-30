// =============================================================================
// [SUPABASE] servidor/supabase.mjs — acesso ao banco do COON
// -----------------------------------------------------------------------------
// Mesmo jeito do RAE Pericial: API REST do Supabase chamada SÓ pelo servidor,
// com a chave secreta lida de variável de ambiente (nunca vai ao navegador,
// nunca fica no código nem no Git).
//
//   SUPABASE_URL    = https://<projeto>.supabase.co
//   SUPABASE_CHAVE  = chave secreta (sb_secret_...) — criar uma dedicada,
//                     por exemplo "inferencia_servidor", no painel do Supabase
//
// Sem essas variáveis o módulo fica desligado e o servidor guarda os
// projetos numa pasta local (modo teste), para não travar o desenvolvimento.
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

const URL_BASE = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const CHAVE = process.env.SUPABASE_CHAVE || '';
export const ativo = Boolean(URL_BASE && CHAVE);

// Pasta local usada só quando o Supabase não está configurado.
const PASTA_LOCAL = process.env.INFERENCIA_PASTA_LOCAL || path.join(process.cwd(), '.dados-locais');

// ---------------------------------------------------------------------------
// Chamada REST genérica (PostgREST)
// ---------------------------------------------------------------------------
async function rest(metodo, caminho, corpo, prefer) {
  const cab = { apikey: CHAVE, 'Content-Type': 'application/json' };
  if (CHAVE.startsWith('eyJ')) cab.Authorization = 'Bearer ' + CHAVE;   // chave antiga em formato JWT
  if (prefer) cab.Prefer = prefer;
  const r = await fetch(`${URL_BASE}/rest/v1/${caminho}`, {
    method: metodo, headers: cab, body: corpo === undefined ? undefined : JSON.stringify(corpo)
  });
  const texto = await r.text();
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${texto.slice(0, 200)}`);
  return texto ? JSON.parse(texto) : null;
}

// Filtro seguro para PostgREST (o e-mail vai codificado na URL).
const eq = (v) => 'eq.' + encodeURIComponent(v);

// ---------------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------------
export async function listarProjetos(email) {
  if (!ativo) return (await lerLocal(email)).map(({ dados, ...resto }) => resto);
  return rest('GET', `inferencia_projetos?select=id,nome,tipologia,municipio,resumo,alterado_em&email=${eq(email)}&excluido_em=is.null&order=alterado_em.desc`);
}

export async function abrirProjeto(email, id) {
  if (!ativo) return (await lerLocal(email)).find((p) => p.id === id) || null;
  const l = await rest('GET', `inferencia_projetos?select=*&id=${eq(id)}&email=${eq(email)}&excluido_em=is.null`);
  return l && l[0] ? l[0] : null;
}

export async function salvarProjeto(email, id, dados, resumo) {
  const linha = {
    email, dados, resumo: resumo || null,
    nome: String(dados?.projeto?.nome || '').slice(0, 200),
    tipologia: String(dados?.projeto?.tipologia || '').slice(0, 60),
    municipio: String(dados?.projeto?.municipio || '').slice(0, 120),
    alterado_em: new Date().toISOString()
  };
  if (!ativo) return salvarLocal(email, id, linha);
  if (id) {
    // o filtro por e-mail garante que ninguém grava no projeto de outro
    const r = await rest('PATCH', `inferencia_projetos?id=${eq(id)}&email=${eq(email)}`, linha, 'return=representation');
    if (!r || !r.length) throw new Error('Projeto não encontrado.');
    return r[0].id;
  }
  const r = await rest('POST', 'inferencia_projetos', linha, 'return=representation');
  return r[0].id;
}

export async function excluirProjeto(email, id) {
  if (!ativo) {
    const l = (await lerLocal(email)).filter((p) => p.id !== id);
    return gravarLocal(email, l);
  }
  await rest('PATCH', `inferencia_projetos?id=${eq(id)}&email=${eq(email)}`, { excluido_em: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// Banco de mercado
// ---------------------------------------------------------------------------
// "Dados do sistema" = as amostras do próprio usuário + as compartilhadas
// por outros engenheiros. Das compartilhadas de terceiros, o servidor
// apaga informante, telefone e e-mail do dono antes de devolver.
export async function listarMercado(email, municipio, tipologia, incluirCompartilhadas) {
  if (!ativo) return [];
  let filtro = '';
  if (municipio) filtro += `&municipio=ilike.${encodeURIComponent('*' + municipio + '*')}`;
  if (tipologia) filtro += `&tipologia=${eq(tipologia)}`;
  const dono = incluirCompartilhadas ? `or=(email.${eq(email)},compartilhado.is.true)` : `email=${eq(email)}`;
  const l = await rest('GET', `inferencia_mercado?select=*&${dono}${filtro}&order=criado_em.desc&limit=1000`);
  return l.map((r) => (r.email === email ? r : { ...r, email: null, informante: 'Banco COON (compartilhado)', telefone: '' }));
}

export async function gravarMercado(email, itens) {
  if (!ativo || !itens.length) return 0;
  const linhas = itens.map((i) => ({ ...i, email }));
  await rest('POST', 'inferencia_mercado', linhas);
  return linhas.length;
}

export async function auditar(email, projetoId, acao, detalhe) {
  if (!ativo) return;
  try { await rest('POST', 'inferencia_auditoria', { email, projeto_id: projetoId || null, acao, detalhe: detalhe || null }); }
  catch { /* auditoria nunca derruba a operação principal */ }
}

// ---------------------------------------------------------------------------
// Modo local (sem Supabase): um arquivo JSON por usuário
// ---------------------------------------------------------------------------
function arquivoDe(email) {
  return path.join(PASTA_LOCAL, email.replace(/[^a-z0-9@._-]/gi, '_') + '.json');
}
async function lerLocal(email) {
  try { return JSON.parse(await fs.readFile(arquivoDe(email), 'utf8')); } catch { return []; }
}
async function gravarLocal(email, lista) {
  await fs.mkdir(PASTA_LOCAL, { recursive: true });
  await fs.writeFile(arquivoDe(email), JSON.stringify(lista), 'utf8');
}
async function salvarLocal(email, id, linha) {
  const l = await lerLocal(email);
  const i = id ? l.findIndex((p) => p.id === id) : -1;
  if (i >= 0) l[i] = { ...l[i], ...linha };
  else { id = randomUUID(); l.unshift({ id, criado_em: linha.alterado_em, ...linha }); }
  await gravarLocal(email, l);
  return id;
}
