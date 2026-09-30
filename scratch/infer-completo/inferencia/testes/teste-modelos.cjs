/* Gera o laudo de TODOS os modelos e dos 20 estilos, com dados sintéticos de teste,
   e grava os .docx em testes/saida-modelos/ para conferir com o python-docx. */
const fs = require('fs'), path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
fs.readdirSync(pasta).filter(f => /^\d\d-.*\.js$/.test(f)).sort().forEach(f => require(path.join(pasta, f)));
const INF = globalThis.INF, saida = path.join(__dirname, 'saida-modelos');
fs.mkdirSync(saida, { recursive: true });
const r = INF.U.rng(2026); const nm = () => { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
const p = INF.Dados.novoProjeto(); p.projeto.nome = 'TESTE'; p.projeto.autor = 'Responsável Teste'; p.projeto.municipio = 'Patos de Minas/MG';
['Area', 'Dist', 'Topo'].forEach((n, i) => INF.Dados.incluirVariavel(p, n, ['quantitativa', 'quantitativa', 'qualitativa'][i]));
for (let i = 0; i < 40; i++) { const a = 200 + r() * 1800, d = 0.5 + r() * 12, t = 1 + Math.floor(r() * 3);
  INF.Dados.incluirAmostra(p, { natureza: i % 3 ? 'oferta' : 'transacao', informante: 'Imob ' + i, link: i % 5 ? 'https://x.test/' + i : '', data: '2026-08-10', lat: -18.58 + r() * 0.08, lon: -46.52 + r() * 0.08,
    valores: { VU: Math.exp(5.2 + 180 / a - 0.18 * Math.log(d) + 0.09 * t + 0.08 * nm()), Area: a, Dist: d, Topo: t } }); }
p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x' }; p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
const mod = INF.Regressao.calcular(p, p.modelo.transf), diag = INF.Diag.tudo(mod);
const pr = INF.Projecao.projetar(mod, [800, 3, 2], { areaAvaliando: 800, item1: 2, item3: 2, considerarIntercepto: true });
const resumo = [];
INF.Modelos.MODELOS.forEach((M, k) => {
  const q = JSON.parse(JSON.stringify(p));
  INF.Modelos.aplicar(q, M.id);
  q.laudo = { estilo: (k % 20) + 1, solicitante: 'Solicitante Teste' };
  if (M.objetos.includes('vizinhanca')) q.vizinhanca = { obra: { nome: 'Obra Teste' }, imoveis: [{ endereco: 'Rua A, 90', ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede', dimensao: '0,2 mm', descricao: 'horizontal' }] }] }] };
  const l = INF.Laudo.montar({ proj: q, modelo: mod, diag, projecao: pr });
  if (l.erro) { resumo.push(M.id + ': ERRO ' + l.erro); return; }
  const caps = l.blocos.filter(b => b.t === 'h1').map(b => b.texto);
  fs.writeFileSync(path.join(saida, String(k + 1).padStart(2, '0') + '-' + M.id + '.docx'), INF.Laudo.docx(l, {}));
  fs.writeFileSync(path.join(saida, String(k + 1).padStart(2, '0') + '-' + M.id + '.html'), INF.Laudo.html(l));
  resumo.push((M.nivel + ' ').padEnd(13) + M.nome.padEnd(52) + ' estilo ' + String(l.estilo.numero).padStart(2) + ' | ' + caps.filter(c => !/^Anexo/.test(c)).length + ' capítulos + ' + caps.filter(c => /^Anexo/.test(c)).length + ' anexos | sumário: ' + (l.blocos.some(b => b.t === 'sumario') ? 'sim' : 'não'));
});
// os 20 estilos no mesmo modelo
for (let e = 1; e <= 20; e++) {
  const q = JSON.parse(JSON.stringify(p)); INF.Modelos.aplicar(q, 'jud_valor'); q.laudo = { estilo: e };
  const l = INF.Laudo.montar({ proj: q, modelo: mod, diag, projecao: pr });
  fs.writeFileSync(path.join(saida, 'estilo-' + String(e).padStart(2, '0') + '.docx'), INF.Laudo.docx(l, {}));
}
console.log(resumo.join('\n'));
