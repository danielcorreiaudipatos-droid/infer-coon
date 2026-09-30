// =============================================================================
// [CLAUDE] servidor/conferencia-ia.mjs — conferência das amostras pela IA
// -----------------------------------------------------------------------------
// Segunda camada da conferência (a primeira são as regras fixas do motor).
// Chama a API da Anthropic pelo servidor, com a chave da COON guardada em
// variável de ambiente. A chave NUNCA vai ao navegador.
//
//   ANTHROPIC_API_KEY = chave da API (só no Railway)
//   INFERENCIA_MODELO_IA = modelo (padrão claude-sonnet-5)
//
// Regras dadas à IA (e conferidas aqui na volta):
//   · aponta e pode PROPOR correção (corrigir campo, desligar amostra,
//     trocar escala), sempre com a evidência; quem aplica é a tela, e só
//     depois que o avaliador autoriza cada uma;
//   · nunca cria amostra nem inventa valor sem evidência nos dados;
//   · cada apontamento cita a amostra (id) e o motivo;
//   · resposta em JSON, que o servidor valida antes de devolver à tela.
// O consumo (tokens de entrada e saída) volta junto, para medir o custo por
// conferência — decisão já registrada para o COON.
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);

// Erro com status 503/422: a tela mostra a mensagem em vez de "falha no servidor".
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

const INSTRUCOES = `Você confere dados de mercado usados em avaliação de imóveis pela ABNT NBR 14.653-2 (inferência estatística).
Recebe o trabalho, as variáveis, as amostras, o modelo de regressão (se já calculado) e os achados das regras automáticas.

Aponte apenas problemas concretos que mereçam conferência do avaliador, por exemplo:
- amostra que não parece do mesmo mercado (tipologia, porte, localização muito diferentes do avaliando e das demais);
- incoerência entre descrição/observação e os códigos lançados;
- valor unitário implausível para o porte ou para a região, comparado às demais amostras;
- sinal de coeficiente contrário ao esperado para a variável, e a provável causa;
- variável candidata a colinearidade ou a código mal escalonado;
- avaliando fora da faixa das amostras em alguma variável.

Para cada apontamento você PODE propor uma correção, que só será aplicada se o avaliador autorizar. Correções permitidas:
- "corrigir": trocar o valor de um campo de uma amostra, SOMENTE quando o valor certo estiver evidente nos próprios dados
  (ex.: erro de digitação de milhar 1.000× maior que o anúncio citado na observação; área lançada em m² numa coluna em ha;
  valor total lançado na coluna de valor unitário quando preço e área estão na observação; código fora da escala declarada).
  Informe em "evidencia" de onde saiu o valor proposto.
- "desligar": tirar a amostra do cálculo (fica guardada), quando não pertence ao mercado do avaliando.
- "escala": trocar a escala de uma variável no modelo (x, 1/x, ln, x2, 1/x2, raiz, 1/raiz, fora).
Proibido: criar amostra; estimar ou arbitrar valor sem evidência nos dados; mexer no avaliando; sugerir valor para o imóvel;
repetir os achados das regras automáticas. Na dúvida, aponte sem correção.
Se não houver problema relevante, devolva a lista vazia.

Responda SOMENTE com JSON neste formato:
{"apontamentos":[{"amostra": <id ou null>, "gravidade": "alta"|"media"|"baixa", "assunto": "<até 6 palavras>", "texto": "<explicação objetiva, até 2 frases>",
   "correcao": null | {"acao": "corrigir"|"desligar"|"escala", "campo": "<nome da variável ou campo>", "de": <valor atual>, "para": <valor proposto>, "evidencia": "<de onde saiu>"}}],
 "parecer": "<até 3 frases sobre a qualidade geral do conjunto>"}`;

export async function conferir(pacote) {
  if (!ativo) throw falha('Conferência por IA desligada: configure ANTHROPIC_API_KEY no servidor.');
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 4000,
      system: INSTRUCOES,
      messages: [{ role: 'user', content: 'Dados para conferência (JSON):\n' + JSON.stringify(pacote) }]
    })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));

  const texto = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  const inicio = texto.indexOf('{'), fim = texto.lastIndexOf('}');
  let dados;
  try { dados = JSON.parse(texto.slice(inicio, fim + 1)); } catch { throw falha('A IA respondeu fora do formato; tente de novo.'); }

  // validação da volta: só aceita apontamentos de amostras que existem e
  // correções dentro do permitido (a tela ainda pede autorização uma a uma)
  const ids = new Set((pacote.amostras || []).map((a) => a.id));
  const nomesVars = new Set((pacote.variaveis || []).map((v) => v.nome));
  const CAMPOS_TEXTO = new Set(['natureza', 'data', 'endereco', 'bairro']);
  const ESCALAS = new Set(['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz', 'fora']);
  const validarCorrecao = (c, amostra) => {
    if (!c || typeof c !== 'object') return null;
    const evidencia = String(c.evidencia || '').slice(0, 300);
    if (c.acao === 'desligar' && ids.has(amostra)) return { acao: 'desligar', evidencia };
    if (c.acao === 'escala' && nomesVars.has(c.campo) && ESCALAS.has(String(c.para))) {
      return { acao: 'escala', campo: c.campo, de: c.de ?? null, para: String(c.para), evidencia };
    }
    if (c.acao === 'corrigir' && ids.has(amostra) && evidencia) {
      if (nomesVars.has(c.campo) && Number.isFinite(Number(c.para))) {
        return { acao: 'corrigir', campo: c.campo, de: c.de ?? null, para: Number(c.para), evidencia };
      }
      if (CAMPOS_TEXTO.has(c.campo) && typeof c.para === 'string') {
        return { acao: 'corrigir', campo: c.campo, de: c.de ?? null, para: c.para.slice(0, 200), evidencia };
      }
    }
    return null;   // correção fora das regras é descartada; o apontamento continua
  };
  const apontamentos = (Array.isArray(dados.apontamentos) ? dados.apontamentos : [])
    .filter((a) => a && typeof a.texto === 'string')
    .map((a) => {
      const amostra = ids.has(a.amostra) ? a.amostra : null;
      return {
        amostra,
        gravidade: ['alta', 'media', 'baixa'].includes(a.gravidade) ? a.gravidade : 'media',
        assunto: String(a.assunto || '').slice(0, 60),
        texto: String(a.texto).slice(0, 400),
        correcao: validarCorrecao(a.correcao, amostra)
      };
    });

  return {
    apontamentos,
    parecer: String(dados.parecer || '').slice(0, 600),
    modelo: MODELO,
    consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 }
  };
}
