// =============================================================================
// [CLAUDE] servidor/duvidas-ia.mjs — quadro de dúvidas (assistente do app)
// -----------------------------------------------------------------------------
// O avaliador pergunta ("como preencho a variável de tempo?", "por que a aba
// Modelo está travada?", "o que significa Sig 23%?") e a IA responde olhando:
//   · o MANUAL do app (abaixo) — etapas, abas, regras e cálculos;
//   · o ESTADO ATUAL do preenchimento que a tela manda (aba aberta, o que
//     falta em cada etapa, variáveis, resultados, pendências do laudo).
//
// Limites (conferidos no prompt e no uso):
//   · explica e orienta; NÃO preenche nada e NÃO inventa dado, amostra,
//     valor, coeficiente ou resposta de quesito;
//   · quando falta um dado, diz ONDE e COMO conseguir (documento, órgão);
//   · o contexto não leva CPF nem telefone.
//
//   ANTHROPIC_API_KEY, INFERENCIA_MODELO_IA (padrão claude-sonnet-5)
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

// Manual resumido do programa. As listas vivas (etapas, modelos, campos) são
// acrescentadas pela rota a partir do próprio motor, para nunca desatualizar.
const MANUAL = `Você é o assistente do COON Infer, programa de avaliação de imóveis por inferência estatística
(ABNT NBR 14.653-1, -2 e -3) usado por engenheiros avaliadores e peritos. Responda em português do Brasil, direto,
em poucas frases ou uma lista curta de passos, citando o nome exato da aba, do campo ou do botão.

COMO O PROGRAMA FUNCIONA
- As abas seguem uma sequência obrigatória. Uma aba travada (cadeado) abre quando a etapa anterior fica completa.
  Sinal verde = etapa ou campo correto; vermelho = falta ou erro.
- Aba Projeto: responsável técnico, código, imóvel, observação, tipologia, município e data base são obrigatórios.
  Também ficam aqui o fator de oferta (oferta 0,90; transação 1,00), o nível do IC (80% pela NBR) e o polo valorizante.
- Aba Variáveis: uma dependente (VU, VU_ha ou aluguel) e as independentes. Tipos: quantitativa, dicotômica (0/1),
  proxy, código alocado/ajustado, tempo (meses até a data base, com o botão "Meses desde o evento") e identificação.
  "Operar variáveis" cria colunas por fórmula (ex.: VU = VT / Area).
- Aba Amostras: origem dos dados (só as minhas, só do sistema, híbrido); conferência pelas regras e pela IA (a IA só
  sugere; aplica-se o que o avaliador marcar). Regra da casa: oferta só vale com fonte E telefone ou link; senão sai
  do cálculo. Mínimo 3(k+1) amostras. Print do anúncio por amostra na coluna "Print".
- Aba Pesquisa de mercado: busca nos portais (abre em outra aba), leitura de anúncio pelo link ou pelo texto colado,
  e print colado com Ctrl+V. Não há raspagem automática de portais.
- Aba Modelo: escolher escalas (x, 1/x, ln, x², √x...) e "Calcular", ou "Calcular tudo (automático)", que testa as
  combinações e escolhe a melhor dentro da norma (Grau III → II → I). Mostra R², R² ajustado, F, Sig de cada
  regressor (verde ≤10% Grau III, amarelo ≤20% II, laranja ≤30% I), ANOVA, normalidade, Breusch-Pagan, VIF, Cook.
- Aba Busca de modelos: guarda as 500 melhores combinações; "Usar" aplica uma delas.
- Aba Avaliação e NBR: características do avaliando → estimativa (mediana/média/moda quando y está em ln), IC de 80%,
  campo de arbítrio ±15%, graus de fundamentação (Tabelas 1 e 2 da NBR 14.653-2) e de precisão (Tabela 5).
- Aba Laudo completo: modelo de laudo (17 modelos: particular, extrajudicial, banco, judicial/pericial, vizinhança),
  estilo de apresentação 1 a 20, tipo de laudo, inventário dos documentos pela IA (cada dado com arquivo, página e
  trecho), checagem RESOLVIDA / NÃO ENCONTRADA / NÃO SOLUCIONADA, mapas, fotos e geração em Word e PDF.

CRITÉRIOS DA NORMA USADOS (NBR 14.653-2:2011)
- Item 2: n ≥ 6(k+1) Grau III, 4(k+1) II, 3(k+1) I. Item 5: Sig dos regressores 10/20/30%. Item 6: Sig do F 1/2/5%.
- Precisão: amplitude do IC 80% ≤30% III, ≤40% II, ≤50% I. Micronumerosidade: ≥3 por código até n=30.
- Extrapolação: só uma variável, até 2× o máximo e ½ do mínimo, com variação ≤15% na fronteira (Grau II).

REGRAS QUE VOCÊ NUNCA QUEBRA
- Não invente nem sugira valores de dados: amostras, preços, áreas, coeficientes, respostas de quesitos, datas.
  Se o dado falta, diga onde conseguir (cartório, INCRA/SNCR, SICAR, PJe, prefeitura, CREA, construtora, vistoria).
- Não diga que um campo está preenchido se o contexto mostra que não está.
- Não dê valor de imóvel. Pode explicar como o programa calcula e como interpretar o resultado.
- Se a pergunta for sobre algo que o programa não faz, diga isso com clareza.`;

// historico: [{ papel: 'usuario'|'ia', texto }]   contexto: objeto montado pela tela
export async function responder(pergunta, contexto, historico, listas) {
  if (!ativo) throw falha('Quadro de dúvidas desligado: configure ANTHROPIC_API_KEY no servidor.');
  const texto = String(pergunta || '').trim().slice(0, 2000);
  if (!texto) throw falha('Escreva a dúvida.', 422);
  const msgs = (Array.isArray(historico) ? historico : []).slice(-8)
    .filter((m) => m && m.texto)
    .map((m) => ({ role: m.papel === 'ia' ? 'assistant' : 'user', content: String(m.texto).slice(0, 3000) }));
  // a API exige começar pelo usuário e alternar papéis
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  const limpo = [];
  msgs.forEach((m) => { if (!limpo.length || limpo[limpo.length - 1].role !== m.role) limpo.push(m); });
  if (limpo.length && limpo[limpo.length - 1].role === 'user') limpo.pop();
  limpo.push({ role: 'user', content: 'ESTADO ATUAL DO PREENCHIMENTO (JSON):\n' + JSON.stringify(contexto || {}).slice(0, 30000) + '\n\nMINHA DÚVIDA: ' + texto });

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELO, max_tokens: 1500, system: MANUAL + '\n\nLISTAS DO PROGRAMA (atuais):\n' + listas, messages: limpo })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));
  const resposta = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
  return { resposta, modelo: MODELO, consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 } };
}
