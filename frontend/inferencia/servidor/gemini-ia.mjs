// =============================================================================
// servidor/gemini-ia.mjs — Integração Gemini AI para o COON Infer
// Duas chaves com fallback automático: se a principal falhar, a backup assume.
// Cobre: dúvidas técnicas, conferência de amostras, inventário, prints
// =============================================================================

const CHAVE_PRINCIPAL = process.env.GEMINI_API_KEY;
const CHAVE_BACKUP    = process.env.GEMINI_API_KEY_BACKUP;

const MODELO_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-3.8-flash';
const MODELO_PRO  = process.env.GEMINI_MODEL_PRO  || 'gemini-2.5-pro';

function urlGemini(modelo, chave) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${chave}`;
}

// ── Chamada com fallback automático ──────────────────────────────────────────
async function chamarGemini(modelo, systemPrompt, userMessage, imagensBase64 = []) {
  const parts = [{ text: userMessage }];
  for (const img of imagensBase64) {
    parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
  }
  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents: [{ role: 'user', parts }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 4096 }
  };

  const chaves = [CHAVE_PRINCIPAL, CHAVE_BACKUP].filter(Boolean);
  let ultimoErro;

  for (const chave of chaves) {
    try {
      const res = await fetch(urlGemini(modelo, chave), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const txt = await res.text();
        // cota esgotada ou erro temporário → tenta próxima chave
        if (res.status === 429 || res.status === 403) {
          ultimoErro = new Error(`Chave ${chave.slice(0,12)}... erro ${res.status}`);
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${txt}`);
      }
      const json = await res.json();
      return json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch (err) {
      ultimoErro = err;
      // se ainda tem chave backup, continua; senão lança
      if (chave === chaves[chaves.length - 1]) throw ultimoErro;
    }
  }
  throw ultimoErro;
}

// ── 1. Quadro de Dúvidas (Flash — resposta rápida) ──────────────────────────
const SYSTEM_DUVIDAS = `Você é o assistente técnico do COON Infer, programa de avaliação de imóveis pela ABNT NBR 14.653.
Responda em português, direto, citando aba, campo ou botão pelo nome exato.
Nunca invente dados, amostras, valores ou resultados. Se faltar dado, diga o que falta e onde conseguir.
Não dê valor de imóvel. Não peça CPF, RG ou dados bancários.`;

export async function responderDuvida(pergunta, estadoTela = '') {
  const msg = estadoTela
    ? `Estado atual da tela:\n${estadoTela}\n\nPergunta do engenheiro:\n${pergunta}`
    : pergunta;
  return chamarGemini(MODELO_FAST, SYSTEM_DUVIDAS, msg);
}

// ── 2. Conferência de Amostras (Flash) ───────────────────────────────────────
const SYSTEM_CONFERENCIA = `Você confere amostras de avaliação imobiliária do COON Infer.
Regras: oferta só vale com fonte (informante) e telefone ou link. Raio padrão 3km urbano / 60km rural.
Resíduo padronizado acima de 2 desvios = outlier. Distância de Cook acima de 1 = ponto influente.
Nunca invente dados. Aponte o problema e sugira a correção com base na NBR 14.653.`;

export async function conferirAmostras(amostras, modeloAtual) {
  const msg = `Modelo atual:\n${JSON.stringify(modeloAtual, null, 2)}\n\nAmostras:\n${JSON.stringify(amostras, null, 2)}`;
  return chamarGemini(MODELO_FAST, SYSTEM_CONFERENCIA, msg);
}

// ── 3. Inventário de Documentos (Pro — leitura de PDF/imagem) ────────────────
const SYSTEM_INVENTARIO = `Você lê documentos de avaliação imobiliária para o COON Infer.
Extraia só os dados que o modelo de laudo exige. Cada dado vem com: arquivo, página e trecho.
Divergência entre documentos: vale o dono do dado (matrícula para área; petição para processo).
Entre dois do mesmo tipo, o mais recente. Nunca invente dado. Se faltar, diga onde conseguir.
Informe também outros achados importantes mesmo que não solicitados.`;

export async function lerDocumento(modeloLaudo, arquivoBase64, mimeType, nomeArquivo) {
  const msg = `Modelo de laudo: ${modeloLaudo}\nArquivo: ${nomeArquivo}\nExtraia os dados necessários.`;
  return chamarGemini(MODELO_PRO, SYSTEM_INVENTARIO, msg, [{ data: arquivoBase64, mimeType }]);
}

// ── 4. Leitura de Print de Anúncio (Pro — visão) ─────────────────────────────
export async function lerPrintAnuncio(imagemBase64, mimeType = 'image/png') {
  const system = `Você extrai dados de anúncios imobiliários para amostras de avaliação.
Extraia: endereço, área total, área privativa, quartos, vagas, valor anunciado, link, telefone, data.
Retorne JSON. Se não encontrar um campo, retorne null.`;
  const texto = await chamarGemini(MODELO_PRO, system,
    'Extraia os dados deste anúncio imobiliário.',
    [{ data: imagemBase64, mimeType }]);
  try { return JSON.parse(texto.match(/\{[\s\S]*\}/)?.[0] ?? texto); }
  catch { return { raw: texto }; }
}

// ── 5. Status das chaves (para o painel admin) ───────────────────────────────
export async function statusChaves() {
  const resultado = [];
  for (const [nome, chave] of [['Principal', CHAVE_PRINCIPAL], ['Backup', CHAVE_BACKUP]]) {
    if (!chave) { resultado.push({ nome, status: 'não configurada' }); continue; }
    try {
      const res = await fetch(urlGemini('gemini-2.5-flash', chave), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ok' }] }] })
      });
      resultado.push({ nome, status: res.ok ? 'ativa' : `erro ${res.status}`, chave: chave.slice(0,12) + '...' });
    } catch (e) {
      resultado.push({ nome, status: 'falha de rede', chave: chave.slice(0,12) + '...' });
    }
  }
  return resultado;
}
