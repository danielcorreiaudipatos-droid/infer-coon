// =============================================================================
// servidor/rotas-inferencia.mjs — rotas do COON Infer
// -----------------------------------------------------------------------------
// Este arquivo é o "módulo plugável". Ele exporta uma função só:
//
//     tratarInferencia(req, res, url, sessao)  → true se atendeu a rota
//
// Dois jeitos de usar:
//   1) Dentro do servidor do COON (login único): no server.mjs de lá,
//      antes do 404, acrescentar:
//          import { tratarInferencia } from './inferencia/servidor/rotas-inferencia.mjs';
//          if (await tratarInferencia(req, res, url, sessao)) return;
//      A sessão já vem pronta do login do COON.
//   2) Sozinho: servidor/server.mjs (para testar ou subir separado).
//
// Tudo fica debaixo de /inferencia/ :
//   /inferencia/                 → tela (web/index.html)
//   /inferencia/motor/*.js       → motor estatístico (o mesmo que roda aqui)
//   /inferencia/api/...          → API JSON (exige sessão)
// =============================================================================

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as banco from './supabase.mjs';     // [SUPABASE]
import * as supadata from './supadata.mjs';  // [SUPADATA]
import * as ia from './conferencia-ia.mjs';   // [CLAUDE]
import * as gmaps from './google-maps.mjs';   // [GOOGLE MAPS]
import * as inventario from './inventario-ia.mjs';   // [CLAUDE] inventário de documentos
import * as duvidas from './duvidas-ia.mjs';         // [CLAUDE] quadro de dúvidas

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PASTA_WEB = path.join(RAIZ, 'web');
const PASTA_MOTOR = path.join(RAIZ, 'motor');
const PREFIXO = '/inferencia';
const LIMITE_CORPO = 25 * 1024 * 1024;    // 25 MB por requisição (projeto com fotos da vistoria)

// ---------------------------------------------------------------------------
// Carrega o motor no servidor: os mesmos arquivos que o navegador usa.
// ---------------------------------------------------------------------------
const ARQUIVOS_MOTOR = (await fs.readdir(PASTA_MOTOR)).filter((f) => /^\d\d-.*\.js$/.test(f)).sort();
for (const f of ARQUIVOS_MOTOR) await import(pathToFileURL(path.join(PASTA_MOTOR, f)).href);
const INF = globalThis.INF;

const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json; charset=utf-8'
};

// Cabeçalhos de segurança em toda resposta. CSP: só scripts do próprio site.
function seguranca(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-src 'self' blob:; frame-ancestors 'self'");
}

function json(res, status, obj) {
  seguranca(res);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(obj));
}

async function lerCorpo(req) {
  let tam = 0; const partes = [];
  for await (const p of req) {
    tam += p.length;
    if (tam > LIMITE_CORPO) throw Object.assign(new Error('Arquivo grande demais.'), { status: 413 });
    partes.push(p);
  }
  const t = Buffer.concat(partes).toString('utf8');
  return t ? JSON.parse(t) : {};
}

// Arquivos estáticos, sem deixar escapar da pasta (bloqueia "../").
async function servirArquivo(res, pasta, relativo) {
  const alvo = path.resolve(pasta, '.' + path.sep + relativo);
  if (!alvo.startsWith(pasta + path.sep) && alvo !== pasta) return false;
  try {
    const dados = await fs.readFile(alvo);
    seguranca(res);
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(alvo)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(dados);
    return true;
  } catch { return false; }
}

// Resumo do cálculo que vai para a lista de projetos.
function resumir(dados) {
  try {
    const m = INF.Regressao.calcular(dados, dados.modelo.transf);
    if (m.erro) return null;
    return { n: m.n, k: m.p - 1, R2: m.R2, R2aj: m.R2aj, sigF: m.sigF, equacao: m.equacao };
  } catch { return null; }
}

// ---------------------------------------------------------------------------
// Roteador
// ---------------------------------------------------------------------------
export async function tratarInferencia(req, res, url, sessao) {
  const p = url.pathname;
  if (p !== PREFIXO && !p.startsWith(PREFIXO + '/')) return false;

  try {
    // ---- páginas e arquivos -------------------------------------------------
    if (p === PREFIXO) { res.writeHead(302, { Location: PREFIXO + '/' }); res.end(); return true; }
    if (!p.startsWith(PREFIXO + '/api/')) {
      const rel = decodeURIComponent(p.slice(PREFIXO.length + 1)) || 'index.html';
      if (rel.startsWith('motor/')) { if (await servirArquivo(res, PASTA_MOTOR, rel.slice(6))) return true; }
      else if (await servirArquivo(res, PASTA_WEB, rel)) return true;
      json(res, 404, { erro: 'Não encontrado.' }); return true;
    }

    // ---- API ------------------------------------------------------------------
    const rota = p.slice((PREFIXO + '/api/').length);
    const metodo = req.method;

    if (rota === 'sessao') {
      return json(res, 200, {
        usuario: sessao ? { nome: sessao.nome, email: sessao.email } : null,
        banco: banco.ativo ? 'supabase' : 'local', leituraLink: supadata.ativo, conferenciaIA: ia.ativo, mapasGoogle: gmaps.ativo, inventarioIA: inventario.ativo, duvidasIA: duvidas.ativo, versaoMotor: INF.VERSAO
      }), true;
    }
    if (!sessao) return json(res, 401, { erro: 'Faça login para continuar.' }), true;
    const email = sessao.email;

    // [SUPABASE] lista / abre / salva / exclui projetos
    if (rota === 'projetos' && metodo === 'GET') return json(res, 200, await banco.listarProjetos(email)), true;
    let m = rota.match(/^projetos\/([0-9a-f-]{36})$/i);
    if (m && metodo === 'GET') {
      const pr = await banco.abrirProjeto(email, m[1]);
      return json(res, pr ? 200 : 404, pr || { erro: 'Projeto não encontrado.' }), true;
    }
    if (m && metodo === 'DELETE') {
      await banco.excluirProjeto(email, m[1]);
      await banco.auditar(email, m[1], 'excluiu projeto');
      return json(res, 200, { ok: true }), true;
    }
    if (rota === 'projetos' && metodo === 'POST') {
      const b = await lerCorpo(req);
      if (!b.dados || b.dados.formato !== 'inferencia-nbr') return json(res, 400, { erro: 'Projeto em formato inválido.' }), true;
      const dados = INF.Dados.normalizar(b.dados);
      const id = await banco.salvarProjeto(email, b.id || null, dados, resumir(dados));
      await banco.auditar(email, id, 'salvou projeto', { amostras: dados.amostras.length });
      return json(res, 200, { id }), true;
    }

    // cálculo no servidor (mesmo motor) — para integrações e conferência
    if (rota === 'calcular' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, b.transf || dados.modelo.transf);
      if (mod.erro) return json(res, 422, { erro: mod.erro }), true;
      const d = INF.Diag.tudo(mod);
      return json(res, 200, {
        equacao: mod.equacao, n: mod.n, k: mod.p - 1, b: mod.b, t: mod.t, sig: mod.sig,
        R2: mod.R2, R2aj: mod.R2aj, F: mod.F, sigF: mod.sigF,
        normalidade: { shapiro: d.sw, lilliefors: d.ks, jarqueBera: d.jb }, breuschPagan: d.bp, durbinWatson: d.dw,
        outliers: d.outliers, influentes: d.influentes
      }), true;
    }

    // relatório gerado no servidor (idêntico ao da tela)
    if (rota === 'relatorio' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, dados.modelo.transf);
      if (mod.erro) return json(res, 422, { erro: mod.erro }), true;
      const valores = mod.indep.map((v) => INF.U.lerNumero(dados.avaliando.valores[v.nome]));
      const projecao = INF.Projecao.projetar(mod, valores, {
        nivel: dados.config.nivelIC, estimativa: dados.config.estimativaLn, areaAvaliando: dados.avaliando.area,
        item1: dados.config.item1, item3: dados.config.item3, considerarIntercepto: dados.config.considerarIntercepto
      });
      const html = INF.Relatorio.gerar({ proj: dados, modelo: mod, diag: INF.Diag.tudo(mod), projecao });
      seguranca(res);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(html);
      return true;
    }

    // [SUPADATA] lê um anúncio pelo link e extrai os dados
    if (rota === 'anuncio' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const { texto, titulo } = await supadata.lerAnuncio(String(b.link || ''));
      const dados = INF.Pesquisa.extrairAnuncio(titulo + '\n' + texto, String(b.link || ''));
      await banco.auditar(email, null, 'leu anúncio', { link: b.link });
      return json(res, 200, { ...dados, titulo }), true;
    }

    // [SUPABASE] banco de mercado pessoal
    if (rota === 'mercado' && metodo === 'GET') {
      return json(res, 200, await banco.listarMercado(email, url.searchParams.get('municipio') || '', url.searchParams.get('tipologia') || '',
        url.searchParams.get('compartilhadas') === '1')), true;
    }
    if (rota === 'mercado' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const itens = (Array.isArray(b.itens) ? b.itens : []).slice(0, 500).map((i) => ({
        natureza: i.natureza === 'transacao' ? 'transacao' : 'oferta',
        tipologia: String(i.tipologia || ''), municipio: String(i.municipio || ''), uf: String(i.uf || ''),
        endereco: String(i.endereco || ''), bairro: String(i.bairro || ''), informante: String(i.informante || ''),
        telefone: String(i.telefone || ''), link: String(i.link || ''), data_evento: i.data || null,
        preco: Number.isFinite(+i.preco) ? +i.preco : null, area: Number.isFinite(+i.area) ? +i.area : null,
        unidade_area: String(i.unidadeArea || ''), lat: Number.isFinite(+i.lat) ? +i.lat : null, lon: Number.isFinite(+i.lon) ? +i.lon : null,
        atributos: i.atributos && typeof i.atributos === 'object' ? i.atributos : {}, origem: String(i.origem || 'manual'),
        compartilhado: i.compartilhado === true
      }));
      return json(res, 200, { gravados: await banco.gravarMercado(email, itens) }), true;
    }

    // [CLAUDE] conferência das amostras pela IA (só aponta, nunca altera)
    if (rota === 'conferir-ia' && metodo === 'POST') {
      if (!ia.ativo) return json(res, 503, { erro: 'Conferência por IA desligada: configure ANTHROPIC_API_KEY no servidor.' }), true;
      const b = await lerCorpo(req);
      const dados = INF.Dados.normalizar(b.dados || {});
      const mod = INF.Regressao.calcular(dados, dados.modelo.transf);
      const regras = INF.Conferencia.conferir(dados);
      const resultado = await ia.conferir(INF.Conferencia.pacoteParaIA(dados, mod, regras));
      await banco.auditar(email, b.id || null, 'conferência por IA', { modelo: resultado.modelo, consumo: resultado.consumo, apontamentos: resultado.apontamentos.length });
      return json(res, 200, resultado), true;
    }

    // [CLAUDE] inventário de UM documento (a tela manda um por vez).
    // O arquivo não é gravado em lugar nenhum; só o resultado volta.
    if (rota === 'inventario' && metodo === 'POST') {
      const b = await lerCorpo(req);
      // inventário do modelo: só ids que existem no catálogo e são de documento
      const campos = (Array.isArray(b.campos) ? b.campos : []).filter((c) => c && INF.Inventario.porId[c.id] && INF.Inventario.porId[c.id].quem === 'documento')
        .map((c) => ({ id: c.id, descricao: INF.Inventario.rotulo(c.id) + ' — ' + (INF.Inventario.porId[c.id].desc || '') }));
      const res2 = await inventario.inventariar({ nome: String(b.nome || 'arquivo'), mime: String(b.mime || ''), base64: b.base64, texto: b.texto }, campos, String(b.modelo || '').slice(0, 200));
      await banco.auditar(email, b.id || null, 'inventário de documento', { arquivo: res2.arquivo, tipo: res2.tipo, consumo: res2.consumo });
      return json(res, 200, res2), true;
    }

    // [CLAUDE] quadro de dúvidas: a IA orienta o preenchimento olhando o manual e o estado da tela
    if (rota === 'duvida' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const listas = 'Etapas: ' + INF.Etapas.ETAPAS.map((x) => x.rotulo + (x.obrigatoria ? ' (obrigatória)' : ' (apoio)')).join('; ')
        + '\nModelos de laudo: ' + INF.Modelos.MODELOS.map((m) => m.nome + ' [' + m.nivel + ']').join('; ')
        + '\nEstilos: ' + INF.Estilos.LISTA.map((e) => e.numero + ' ' + e.nome).join('; ')
        + '\nDados que a IA do inventário busca (por modelo): ' + INF.Inventario.CAMPOS.map((c) => c.rotulo + ' (' + c.quem + ')').join('; ');
      const r2 = await duvidas.responder(b.pergunta, b.contexto, b.historico, listas);
      await banco.auditar(email, b.id || null, 'dúvida à IA', { consumo: r2.consumo });
      return json(res, 200, r2), true;
    }

    // [GOOGLE MAPS] imagem de satélite ou mapa de situação para o laudo
    if (rota === 'mapa' && metodo === 'POST') {
      const b = await lerCorpo(req);
      const img = await gmaps.imagem({ tipo: b.tipo, centro: b.centro, marcadores: b.marcadores });
      seguranca(res);
      res.writeHead(200, { 'Content-Type': img.tipo, 'Cache-Control': 'no-store' });
      res.end(img.bytes);
      return true;
    }

    return json(res, 404, { erro: 'Rota inexistente.' }), true;
  } catch (e) {
    const status = e.status || (e instanceof SyntaxError ? 400 : 500);
    // não devolve detalhe interno ao navegador em erro 500
    json(res, status, { erro: status === 500 ? 'Falha no servidor. Tente de novo.' : e.message });
    if (status === 500) console.error('[inferencia]', e);
    return true;
  }
}
