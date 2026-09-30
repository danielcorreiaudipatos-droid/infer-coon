// =============================================================================
// [CLAUDE] servidor/inventario-ia.mjs — inventário dos documentos pela IA
// -----------------------------------------------------------------------------
// O engenheiro anexa a pasta do trabalho (matrícula, CCIR, CAR, processo,
// decreto de servidão, planta, fotos...). A tela manda UM arquivo por vez; a
// IA lê o documento inteiro e devolve:
//   · que documento é (lista fechada de tipos);
//   · um resumo de 1 a 3 frases;
//   · os dados que servem ao laudo, cada um com a página e o trecho de onde
//     saiu (evidência) — matrícula, área, proprietário, processo, quesitos...
//
// Regras:
//   · nada é preenchido direto: a tela mostra como SUGESTÃO e o avaliador
//     marca o que aceita (mesma regra da conferência das amostras);
//   · a IA não inventa: dado que não está no documento não volta;
//   · CPF, RG e dados bancários não voltam — e o servidor ainda apaga
//     qualquer sequência com cara de CPF que escapar;
//   · o documento não é guardado no servidor nem no banco; só o resultado.
//
//   ANTHROPIC_API_KEY, INFERENCIA_MODELO_IA (padrão claude-sonnet-5)
// =============================================================================

const CHAVE = process.env.ANTHROPIC_API_KEY || '';
const MODELO = process.env.INFERENCIA_MODELO_IA || 'claude-sonnet-5';
export const ativo = Boolean(CHAVE);
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

export const TIPOS_DOC = [
  'matricula', 'certidao_onus', 'escritura', 'contrato', 'ccir', 'itr', 'car', 'georreferenciamento', 'memorial_descritivo',
  'planta_mapa', 'art_rrt', 'iptu', 'alvara_habitese', 'decreto_utilidade_publica', 'projeto_faixa_servidao',
  'peticao_inicial', 'contestacao', 'decisao_despacho', 'quesitos', 'laudo_anterior', 'parecer_assistente',
  'foto_vistoria', 'anuncio_mercado', 'documento_pessoal', 'outro'
];

// A lista de campos vem do INVENTÁRIO DO MODELO de laudo escolhido
// (motor/20-inventario.js → paraIA). O servidor confere a lista contra o
// catálogo antes de mandar à IA; campo fora do catálogo é descartado.
function instrucoes(campos, modelo) {
  return `Você faz o inventário de documentos para um laudo técnico de imóvel (${modelo || 'avaliação ABNT NBR 14.653'}).
Leia o documento INTEIRO (se for digitalizado, leia como imagem, página por página) e responda SOMENTE com JSON:
{"tipo": um de ${JSON.stringify(TIPOS_DOC)},
 "titulo": "nome curto do documento",
 "dataDocumento": "AAAA-MM-DD (emissão/certidão/assinatura) ou null",
 "resumo": "2 a 4 frases objetivas, com os números principais (áreas, datas, valores, números de registro)",
 "datas": ["AAAA-MM-DD — o que é a data"],
 "dados": [{"campo": id da lista abaixo, "valor": "texto", "pagina": número ou null, "trecho": "trecho literal curto que prova o valor"}],
 "quesitos": [{"parte": "autor|réu|juízo|outro", "pergunta": "texto literal do quesito"}],
 "anomalias": [{"tipo": "fissura|trinca|rachadura|infiltração|destacamento|recalque|outra", "localizacao": "onde", "dimensao": "se visível", "descricao": "o que se vê"}],
 "achados": [{"assunto": "até 6 palavras", "texto": "o que encontrou e por que importa", "pagina": número ou null, "trecho": "trecho literal", "importancia": "alta|media|baixa"}],
 "alertas": ["divergências entre dados do próprio documento ou pontos de atenção"]}

O QUE BUSCAR (inventário deste modelo de laudo — procure cada um):
${campos.map((c) => '- ' + c.id + ': ' + c.descricao).join('\n')}

OUTROS ACHADOS: além da lista, registre em "achados" tudo o que um perito precisaria saber, mesmo que ninguém tenha pedido:
ônus, penhora, hipoteca, usufruto, embargo, área de preservação, litígio, processo citado, divergência de área, construção
irregular, restrição ambiental ou urbanística, risco, prazo, valor citado, fato que muda a avaliação.

Regras:
- Só informe dado que ESTÁ no documento, com o trecho literal. Não deduza, não complete, não estime, não invente.
- Campo que não está no documento não aparece em "dados".
- Áreas e valores: mantenha a unidade e a grafia do documento.
- Nunca devolva CPF, RG, dados bancários ou endereço residencial de pessoas físicas.
- Quesitos: texto literal, na ordem.
- Foto: diga se é foto de vistoria, leia data e coordenadas do carimbo (campos dataVistoria e coordenadas, se pedidos)
  e descreva anomalias visíveis em "anomalias" (sem exagerar o que não se vê).`;
}

const semDocPessoal = (t) => String(t || '')
  .replace(/\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g, '[CPF removido]')
  .replace(/\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g, (m) => m);   // CNPJ de empresa pode ficar

// arquivo: { nome, mime, base64 } (PDF ou imagem) ou { nome, texto } (txt/csv/kml)
// campos:  [{ id, descricao }] — inventário do modelo (já conferido pela rota)
export async function inventariar(arquivo, campos, modelo) {
  campos = Array.isArray(campos) ? campos : [];
  const ids = new Set(campos.map((c) => c.id));
  if (!ativo) throw falha('Inventário por IA desligado: configure ANTHROPIC_API_KEY no servidor.');
  let bloco;
  if (arquivo.texto !== undefined) bloco = { type: 'text', text: 'Conteúdo do arquivo "' + arquivo.nome + '":\n' + String(arquivo.texto).slice(0, 200000) };
  else if (arquivo.mime === 'application/pdf') bloco = { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: arquivo.base64 } };
  else if (/^image\/(jpeg|png|gif|webp)$/.test(arquivo.mime)) bloco = { type: 'image', source: { type: 'base64', media_type: arquivo.mime, data: arquivo.base64 } };
  else throw falha('Formato não lido pela IA: ' + (arquivo.mime || 'desconhecido') + '. Salve em PDF.', 422);

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': CHAVE, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODELO, max_tokens: 6000, system: instrucoes(campos, modelo),
      messages: [{ role: 'user', content: [bloco, { type: 'text', text: 'Arquivo: ' + arquivo.nome + '. Faça o inventário.' }] }] })
  });
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw falha('IA indisponível (' + r.status + '): ' + (corpo?.error?.message || '').slice(0, 160));
  const texto = (corpo.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('');
  let j;
  try { j = JSON.parse(texto.slice(texto.indexOf('{'), texto.lastIndexOf('}') + 1)); } catch { throw falha('A IA respondeu fora do formato; tente de novo.'); }

  // validação da volta
  return {
    arquivo: arquivo.nome,
    tipo: TIPOS_DOC.includes(j.tipo) ? j.tipo : 'outro',
    titulo: semDocPessoal(j.titulo).slice(0, 160),
    resumo: semDocPessoal(j.resumo).slice(0, 700),
    datas: (Array.isArray(j.datas) ? j.datas : []).map((d) => semDocPessoal(d).slice(0, 160)).slice(0, 20),
    dataDocumento: /^\d{4}-\d{2}-\d{2}$/.test(String(j.dataDocumento || '')) ? j.dataDocumento : null,
    // só campos do inventário do modelo, e só com trecho literal como prova
    dados: (Array.isArray(j.dados) ? j.dados : [])
      .filter((d) => d && ids.has(d.campo) && d.valor !== undefined && String(d.valor).trim() && d.trecho)
      .map((d) => ({ campo: d.campo, valor: semDocPessoal(d.valor).slice(0, 600),
        pagina: Number.isFinite(Number(d.pagina)) ? Number(d.pagina) : null, trecho: semDocPessoal(d.trecho).slice(0, 300) })),
    anomalias: (Array.isArray(j.anomalias) ? j.anomalias : []).filter((a) => a && a.descricao)
      .map((a) => ({ tipo: String(a.tipo || 'outra').slice(0, 40), localizacao: String(a.localizacao || '').slice(0, 160), dimensao: String(a.dimensao || '').slice(0, 80), descricao: String(a.descricao).slice(0, 400) })).slice(0, 40),
    achados: (Array.isArray(j.achados) ? j.achados : []).filter((a) => a && a.texto)
      .map((a) => ({ assunto: semDocPessoal(a.assunto).slice(0, 80), texto: semDocPessoal(a.texto).slice(0, 600), pagina: Number.isFinite(Number(a.pagina)) ? Number(a.pagina) : null,
        trecho: semDocPessoal(a.trecho || '').slice(0, 300), importancia: ['alta', 'media', 'baixa'].includes(a.importancia) ? a.importancia : 'media' })).slice(0, 30),
    quesitos: (Array.isArray(j.quesitos) ? j.quesitos : []).filter((q) => q && q.pergunta)
      .map((q) => ({ parte: String(q.parte || '').slice(0, 40), pergunta: semDocPessoal(q.pergunta).slice(0, 2000) })).slice(0, 80),
    alertas: (Array.isArray(j.alertas) ? j.alertas : []).map((a) => semDocPessoal(a).slice(0, 400)).slice(0, 20),
    modelo: MODELO,
    consumo: { entrada: corpo.usage?.input_tokens || 0, saida: corpo.usage?.output_tokens || 0 }
  };
}
