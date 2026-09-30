// =============================================================================
// servidor/gemini-ia.mjs — Integração Gemini AI para o COON Infer
// Pré-pago principal (3.8 Flash + 2.5 Pro) + backup gratuito + monitor de uso
// =============================================================================

const CHAVE_PRINCIPAL = process.env.GEMINI_API_KEY;
const CHAVE_BACKUP    = process.env.GEMINI_API_KEY_BACKUP;
const ALERTA_USD      = parseFloat(process.env.GEMINI_ALERTA_USD || '5.00');

const MODELO_FAST = process.env.GEMINI_MODEL_FAST || 'gemini-3.8-flash';
const MODELO_PRO  = process.env.GEMINI_MODEL_PRO  || 'gemini-2.5-pro';

// ── Monitor de uso (estimativa em tempo real) ─────────────────────────────────
const uso = { flash: 0, pro: 0, usdEstimado: 0, alertaEnviado: false };

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
    usdEstimado: uso.usdEstimado.toFixed(4),
    brlEstimado: (uso.usdEstimado * 5.5).toFixed(2),
    alertaAtivado: uso.alertaEnviado,
    limiteUSD: ALERTA_USD
  };
}

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
        if (res.status === 429 || res.status === 403) {
          ultimoErro = new Error(`Cota esgotada (${res.status}) — trocando para backup`);
          continue;
        }
        throw new Error(`Gemini ${res.status}: ${await res.text()}`);
      }
      const json = await res.json();
      const texto = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      // registrar uso estimado
      const meta = json.usageMetadata;
      if (meta) registrarUso(modelo, meta.promptTokenCount || 500, meta.candidatesTokenCount || 500);
      return texto;
    } catch (err) {
      ultimoErro = err;
      if (chave === chaves[chaves.length - 1]) throw ultimoErro;
    }
  }
  throw ultimoErro;
}

// ── 1. Quadro de Dúvidas ──────────────────────────────────────────────────────
const SYSTEM_DUVIDAS = `Você é o assistente técnico do COON Infer, avaliação de imóveis ABNT NBR 14.653.
Responda em português, direto, citando aba, campo ou botão pelo nome exato.
Nunca invente dados. Se faltar dado, diga o que falta e onde conseguir.`;

export async function responderDuvida(pergunta, estadoTela = '') {
  const msg = estadoTela ? `Tela atual:\n${estadoTela}\n\nPergunta:\n${pergunta}` : pergunta;
  return chamarGemini(MODELO_FAST, SYSTEM_DUVIDAS, msg);
}

// ── 2. Conferência de Amostras ────────────────────────────────────────────────
const SYSTEM_CONFERENCIA = `Você confere amostras de avaliação imobiliária COON Infer.
Oferta só vale com fonte e link. Raio 3km urbano / 60km rural.
Resíduo > 2σ = outlier. Cook > 1 = influente. Aponte e sugira correção.`;

export async function conferirAmostras(amostras, modeloAtual) {
  const msg = `Modelo:\n${JSON.stringify(modeloAtual, null, 2)}\n\nAmostras:\n${JSON.stringify(amostras, null, 2)}`;
  return chamarGemini(MODELO_FAST, SYSTEM_CONFERENCIA, msg);
}

// ── 3. Inventário de Documentos ───────────────────────────────────────────────
const SYSTEM_INVENTARIO = `Você lê documentos de avaliação imobiliária para o COON Infer.
Extraia dados que o modelo de laudo exige. Informe: arquivo, página, trecho.
Em divergência, vale o mais recente. Nunca invente. Se faltar, diga onde conseguir.`;

export async function lerDocumento(modeloLaudo, arquivoBase64, mimeType, nomeArquivo) {
  const msg = `Modelo: ${modeloLaudo}\nArquivo: ${nomeArquivo}\nExtraia os dados.`;
  return chamarGemini(MODELO_PRO, SYSTEM_INVENTARIO, msg, [{ data: arquivoBase64, mimeType }]);
}

// ── 4. Leitura de Print de Anúncio ────────────────────────────────────────────
export async function lerPrintAnuncio(imagemBase64, mimeType = 'image/png') {
  const system = `Extraia dados de anúncios imobiliários: endereço, área, quartos, vagas, valor, link, telefone, data. Retorne JSON.`;
  const texto = await chamarGemini(MODELO_PRO, system, 'Extraia os dados deste anúncio.', [{ data: imagemBase64, mimeType }]);
  try { return JSON.parse(texto.match(/\{[\s\S]*\}/)?.[0] ?? texto); }
  catch { return { raw: texto }; }
}
