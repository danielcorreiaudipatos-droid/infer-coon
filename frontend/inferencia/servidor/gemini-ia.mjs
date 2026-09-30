// =============================================================================
// servidor/gemini-ia.mjs — Integração Gemini AI & Groq Fallback para o COON Infer
// Ordem de execução:
// 1. Chave Principal Gemini (Pré-pago / 3.8 Flash + 2.5 Pro)
// 2. Chave Backup Gemini (Gratuito)
// 3. Groq Fallback (Llama-3.3-70b-versatile / super rápida e ultra barata/gratuita)
// =============================================================================

const CHAVE_PRINCIPAL = process.env.GEMINI_API_KEY;
const CHAVE_BACKUP    = process.env.GEMINI_API_KEY_BACKUP;
const CHAVE_GROQ      = process.env.GROQ_API_KEY;
const ALERTA_USD      = parseFloat(process.env.GEMINI_ALERTA_USD || '5.00');

const MODELO_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-3.8-flash';
const MODELO_PRO  = process.env.GEMINI_MODEL_PRO  || 'gemini-2.5-pro';
const MODELO_GROQ = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

// ── Monitor de uso (estimativa em tempo real) ─────────────────────────────────
const uso = { flash: 0, pro: 0, groq: 0, usdEstimado: 0, alertaEnviado: false };

// Preços por 1M tokens (aproximado em USD → R$ x5.5)
const PRECO = { fast: 0.075 / 1_000_000, pro: 3.5 / 1_000_000 };

function registrarUso(modelo, tokensEntrada, tokensSaida) {
  const preco = modelo === MODELO_PRO ? PRECO.pro : PRECO.fast;
  const custo = (tokensEntrada + tokensSaida) * preco;
  uso.usdEstimado += custo;
  if (modelo === MODELO_PRO) uso.pro++; else uso.flash++;

  // Alerta quando chegar em 80% do limite configurado
  if (!uso.alertaEnviado && uso.usdEstimado >= ALERTA_USD * 0.8) {
    uso.alertaEnviado = true;
    console.warn(`\n⚠️  COON IA — Aviso de recarga Gemini!
    Gasto estimado: US$${uso.usdEstimado.toFixed(3)} (≈ R$${(uso.usdEstimado * 5.5).toFixed(2)})
    Limite configurado: US$${ALERTA_USD}
    Ação: recarregue créditos em console.cloud.google.com/billing\n`);
  }
}

export function statusUso() {
  return {
    flash: uso.flash,
    pro: uso.pro,
    groq: uso.groq,
    usdEstimado: uso.usdEstimado.toFixed(4),
    brlEstimado: (uso.usdEstimado * 5.5).toFixed(2),
    alertaAtivado: uso.alertaEnviado,
    limiteUSD: ALERTA_USD
  };
}

function urlGemini(modelo, chave) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${chave}`;
}

// ── Chamada Groq (Fallback para texto / JSON quando Gemini falha ou esgota cota) ──
async function chamarGroq(systemPrompt, userMessage) {
  if (!CHAVE_GROQ) throw new Error('Groq API Key não configurada');
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CHAVE_GROQ}`
    },
    body: JSON.stringify({
      model: MODELO_GROQ,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2,
      max_tokens: 4096
    })
  });
  if (!res.ok) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  uso.groq++;
  return json.choices?.[0]?.message?.content ?? '';
}

// ── Chamada com fallback automático completo (Gemini 1 -> Gemini 2 -> Groq) ──
async function chamarIA(modelo, systemPrompt, userMessage, imagensBase64 = []) {
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
        if (res.status === 429 || res.status === 403) {
          ultimoErro = new Error(`Cota Gemini esgotada (${res.status}) — tentando próximo fallback`);
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      }
      const json = await res.json();
      const texto = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const meta = json.usageMetadata;
      if (meta) registrarUso(modelo, meta.promptTokenCount || 500, meta.candidatesTokenCount || 500);
      return texto;
    } catch (err) {
      ultimoErro = err;
      console.warn(`[COON IA] Falha em chave Gemini: ${err.message}`);
    }
  }

  // Se todas as chaves Gemini falharem ou esgotarem cota:
  // Se for texto (sem imagens), Groq assume com Llama-3.3-70b-versatile
  if (CHAVE_GROQ && imagensBase64.length === 0) {
    try {
      console.log('[COON IA] Ativando Fallback de Emergência: GROQ (Llama-3.3-70b)');
      return await chamarGroq(systemPrompt, userMessage);
    } catch (groqErr) {
      console.error('[COON IA] Falha também no fallback Groq:', groqErr);
      throw ultimoErro || groqErr;
    }
  }

  throw ultimoErro || new Error('Nenhum provedor de IA disponível no momento.');
}

// ── 1. Quadro de Dúvidas ──────────────────────────────────────────────────────
const SYSTEM_DUVIDAS = `Você é o assistente técnico do COON Infer, avaliação de imóveis ABNT NBR 14.653.
Responda em português, direto, citando aba, campo ou botão pelo nome exato.
Nunca invente dados. Se faltar dado, diga o que falta e onde conseguir.`;

export async function responderDuvida(pergunta, estadoTela = '') {
  const msg = estadoTela ? `Tela atual:\n${estadoTela}\n\nPergunta:\n${pergunta}` : pergunta;
  return chamarIA(MODELO_FAST, SYSTEM_DUVIDAS, msg);
}

// ── 2. Conferência de Amostras ────────────────────────────────────────────────
const SYSTEM_CONFERENCIA = `Você confere amostras de avaliação imobiliária COON Infer.
Oferta só vale com fonte e link. Raio 3km urbano / 60km rural.
Resíduo > 2σ = outlier. Cook > 1 = influente. Aponte e sugira correção.`;

export async function conferirAmostras(amostras, modeloAtual) {
  const msg = `Modelo:\n${JSON.stringify(modeloAtual, null, 2)}\n\nAmostras:\n${JSON.stringify(amostras, null, 2)}`;
  return chamarIA(MODELO_FAST, SYSTEM_CONFERENCIA, msg);
}

// ── 3. Inventário de Documentos ───────────────────────────────────────────────
const SYSTEM_INVENTARIO = `Você lê documentos de avaliação imobiliária para o COON Infer.
Extraia dados que o modelo de laudo exige. Informe: arquivo, página, trecho.
Em divergência, vale o mais recente. Nunca invente. Se faltar, diga onde conseguir.`;

export async function lerDocumento(modeloLaudo, arquivoBase64, mimeType, nomeArquivo) {
  const msg = `Modelo: ${modeloLaudo}\nArquivo: ${nomeArquivo}\nExtraia os dados.`;
  return chamarIA(MODELO_PRO, SYSTEM_INVENTARIO, msg, [{ data: arquivoBase64, mimeType }]);
}

// ── 4. Leitura de Print de Anúncio ────────────────────────────────────────────
export async function lerPrintAnuncio(imagemBase64, mimeType = 'image/png') {
  const system = `Extraia dados de anúncios imobiliários: endereço, área, quartos, vagas, valor, link, telefone, data. Retorne JSON.`;
  const texto = await chamarIA(MODELO_PRO, system, 'Extraia os dados deste anúncio.', [{ data: imagemBase64, mimeType }]);
  try { return JSON.parse(texto.match(/\{[\s\S]*\}/)?.[0] ?? texto); }
  catch { return { raw: texto }; }
}
