// =============================================================================
// [GOOGLE MAPS] servidor/google-maps.mjs — imagens de mapa para o laudo
// -----------------------------------------------------------------------------
// Usa a Maps Static API do Google (uma imagem PNG por chamada):
//   · 'satelite' → imagem de satélite do imóvel avaliando (zoom de detalhe)
//   · 'situacao' → mapa com o avaliando (A) e os dados de mercado numerados
//
//   GOOGLE_MAPS_CHAVE = chave da API (Google Cloud → APIs → Maps Static API).
//   Restringir a chave ao IP/serviço do servidor. Nunca vai ao navegador.
//
// A imagem volta ao navegador, entra no projeto como foto do tipo "mapa" e
// sai no laudo com a legenda "Imagem: Google". Sem chave, a tela oferece
// inserir um print do mapa, e o laudo usa o mapa esquemático.
// =============================================================================

const CHAVE = process.env.GOOGLE_MAPS_CHAVE || '';
export const ativo = Boolean(CHAVE);

const falha = (msg, status) => Object.assign(new Error(msg), { status: status || 503 });
const coord = (v) => Number.isFinite(Number(v)) && Math.abs(Number(v)) <= 180;

// Devolve { bytes: Buffer, tipo: 'image/png' }
export async function imagem({ tipo, centro, marcadores }) {
  if (!ativo) throw falha('Mapas do Google desligados: configure GOOGLE_MAPS_CHAVE no servidor.');
  if (!centro || !coord(centro.lat) || !coord(centro.lon)) throw falha('Informe latitude e longitude do imóvel.', 422);
  const q = new URLSearchParams({ size: '640x400', scale: '2', language: 'pt-BR', key: CHAVE });
  if (tipo === 'satelite') {
    q.set('maptype', 'satellite');
    q.set('zoom', '16');
    q.set('center', `${centro.lat},${centro.lon}`);
    q.append('markers', `color:red|${centro.lat},${centro.lon}`);
  } else {
    // mapa de situação: o Google enquadra sozinho todos os marcadores
    q.set('maptype', 'roadmap');
    q.append('markers', `color:red|label:A|${centro.lat},${centro.lon}`);
    (Array.isArray(marcadores) ? marcadores : []).slice(0, 60).forEach((m) => {
      if (!coord(m.lat) || !coord(m.lon)) return;
      // o Google só aceita rótulo de 1 caractere; o número vai no anexo
      const rot = String(m.rotulo || '').length === 1 ? `|label:${m.rotulo}` : '';
      q.append('markers', `size:small|color:blue${rot}|${m.lat},${m.lon}`);
    });
  }
  const r = await fetch('https://maps.googleapis.com/maps/api/staticmap?' + q.toString());
  if (!r.ok) throw falha('Google Maps respondeu ' + r.status + '. Confira a chave e se a Maps Static API está ativa.');
  const tipoResp = r.headers.get('content-type') || '';
  if (!tipoResp.startsWith('image/')) throw falha('Google Maps não devolveu imagem. Confira a chave.');
  return { bytes: Buffer.from(await r.arrayBuffer()), tipo: tipoResp };
}
