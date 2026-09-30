// =============================================================================
// [SUPADATA] servidor/supadata.mjs — leitura de UM anúncio pelo link
// -----------------------------------------------------------------------------
// A Supadata (supadata.ai) é um serviço que abre uma página e devolve o texto
// dela limpo (markdown). Usamos para: o engenheiro cola o link do anúncio
// que ELE escolheu, o servidor pede o texto à Supadata e o extrator do motor
// (INF.Pesquisa.extrairAnuncio) tira preço, área, telefone e VU.
//
// Uso deliberadamente restrito a um link por vez, escolhido pelo usuário:
// é o mesmo que ele abrir a página e copiar o texto. NÃO é para varrer
// portal inteiro (os termos de uso dos portais proíbem, e amostra de laudo
// precisa de conferência humana).
//
//   SUPADATA_CHAVE = chave da API (painel da Supadata). Só no servidor.
//
// Endpoint usado: GET https://api.supadata.ai/v1/web/scrape?url=...
// com o cabeçalho x-api-key. Conferir na documentação da Supadata se o
// endereço ou o formato da resposta mudar.
// =============================================================================

const CHAVE = process.env.SUPADATA_CHAVE || '';
export const ativo = Boolean(CHAVE);

// Erro com status 503/422: a tela mostra a mensagem em vez de "falha no servidor".
const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });

// Só aceita http/https e recusa endereços internos (evita que alguém use o
// servidor para sondar a rede interna do Railway).
function linkPermitido(link) {
  let u;
  try { u = new URL(link); } catch { return false; }
  if (!/^https?:$/.test(u.protocol)) return false;
  const h = u.hostname.toLowerCase();
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (/^(10|127|0)\.|^192\.168\.|^172\.(1[6-9]|2\d|3[01])\.|^169\.254\./.test(h)) return false;
  return true;
}

// Devolve { texto, titulo } do anúncio.
export async function lerAnuncio(link) {
  if (!ativo) throw falha('Leitura por link desligada: configure SUPADATA_CHAVE no servidor.');
  if (!linkPermitido(link)) throw falha('Link inválido.', 422);
  const r = await fetch('https://api.supadata.ai/v1/web/scrape?url=' + encodeURIComponent(link), {
    headers: { 'x-api-key': CHAVE }
  });
  const corpo = await r.text();
  if (!r.ok) throw falha(`Supadata ${r.status}: ${corpo.slice(0, 200)}`);
  const j = JSON.parse(corpo);
  return { texto: String(j.content || ''), titulo: String(j.name || j.title || '') };
}
