/* =============================================================================
   teste-motor.js — Conferência do motor estatístico
   -----------------------------------------------------------------------------
   Roda no Node:   node testes/teste-motor.cjs
   Gera um conjunto SINTÉTICO (não é mercado, não é amostra de laudo: serve
   só para testar as contas), calcula o modelo e grava o resultado em
   testes/saida-motor.json. O script conferir_statsmodels.py refaz as mesmas
   contas no Python (statsmodels/scipy) e compara número a número.
   ============================================================================= */

const fs = require('fs');
const path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
['00-base', '01-matriz', '02-distribuicoes', '03-transformacoes', '04-regressao', '05-diagnosticos',
  '06-busca-modelos', '07-nbr14653', '08-projecao', '09-rna', '10-dados', '11-operar-variaveis', '12-pesquisa-mercado', '13-graficos', '14-relatorio', '15-conferencia', '16-avancado', '17-planilha', '18-laudo', '19-tipos-laudo', '20-inventario', '21-modelos-laudo', '22-estilos-laudo']
  .forEach(function (f) { require(path.join(pasta, f + '.js')); });
const INF = globalThis.INF;

// ---- dados sintéticos com semente fixa -------------------------------------
const sorteio = INF.U.rng(2026);
const normal = function () {           // Box-Muller
  const u = Math.max(sorteio(), 1e-12), v = sorteio();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const proj = INF.Dados.novoProjeto();
proj.projeto.dataBase = '2026-09-29';
proj.config.aplicarFatorOferta = true;
proj.config.fatorOferta = 0.9;
['Area', 'Dist', 'Topo', 'Pav'].forEach(function (n, i) {
  INF.Dados.incluirVariavel(proj, n, ['quantitativa', 'quantitativa', 'qualitativa', 'dicotomica'][i]);
});
proj.variaveis.find(v => v.nome === 'Area').direcao = '-';
proj.variaveis.find(v => v.nome === 'Dist').direcao = '-';
proj.variaveis.find(v => v.nome === 'Topo').direcao = '+';
proj.variaveis.find(v => v.nome === 'Pav').direcao = '+';

for (let i = 0; i < 40; i++) {
  const area = 200 + sorteio() * 1800;
  const dist = 0.5 + sorteio() * 12;
  const topo = 1 + Math.floor(sorteio() * 3);
  const pav = sorteio() < 0.6 ? 1 : 0;
  const lnvu = 5.2 + 180 / area - 0.18 * Math.log(dist) + 0.09 * topo + 0.12 * pav + 0.08 * normal();
  INF.Dados.incluirAmostra(proj, {
    natureza: i % 3 === 0 ? 'transacao' : 'oferta',
    valores: { VU: Math.exp(lnvu), Area: area, Dist: dist, Topo: topo, Pav: pav }
  });
}

const transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x' };
const mod = INF.Regressao.calcular(proj, transf);
if (mod.erro) { console.error(mod.erro); process.exit(1); }
const diag = INF.Diag.tudo(mod);
const aval = [800, 3, 2, 1];
const proj80 = INF.Projecao.projetar(mod, aval, { nivel: 0.80, item1: 2, item3: 2, considerarIntercepto: true, areaAvaliando: 800 });

// ---- saída para comparação --------------------------------------------------
const saida = {
  X: mod.X, y: mod.y, aval: aval, transf: transf,
  b: mod.b, ep: mod.ep, t: mod.t, sig: mod.sig,
  R2: mod.R2, R2aj: mod.R2aj, F: mod.F, sigF: mod.sigF, s: mod.s,
  dw: diag.dw, sw: diag.sw, jb: diag.jb, bp: diag.bp, ks: diag.ks,
  cook: diag.residuos.map(r => r.cook), h: mod.h,
  vif: diag.vif.map(v => v.vif), press: diag.prev.PRESS, AIC: diag.prev.AIC,
  projecao: { z: proj80.z, icMin: proj80.icMin, icMax: proj80.icMax, ipMin: proj80.ipMin, ipMax: proj80.ipMax, central: proj80.central }
};
fs.writeFileSync(path.join(__dirname, 'saida-motor.json'), JSON.stringify(saida, null, 1));

console.log('Equação:', mod.equacao);
console.log('R² =', mod.R2.toFixed(6), ' R²aj =', mod.R2aj.toFixed(6), ' F =', mod.F.toFixed(4), ' SigF =', mod.sigF.toExponential(3));
console.log('Fundamentação: Grau', INF.NBR.romano(proj80.fundamentacao.grau), '(' + proj80.fundamentacao.pontos + ' pontos)');
console.log('Precisão: amplitude', (proj80.amplitude * 100).toFixed(2) + '% → Grau', INF.NBR.romano(proj80.grauPrecisao));
console.log('Operar: VT = VU*Area →', JSON.stringify(INF.Operar.operar(proj, 'VT', 'identificacao', 'VU * Area')));
console.log('Anúncio:', JSON.stringify(INF.Pesquisa.extrairAnuncio('Fazenda 172 ha, R$ 3.440.000. Cond. R$ 0. Fone (38) 99876-5432')));

// ---- busca de modelos -------------------------------------------------------
const t0 = Date.now();
INF.Busca.buscar(proj, { limite: 500, criterio: 'R2aj', testarExclusao: true, sigMaxRegressores: 0.30 }).then(function (r) {
  console.log('Busca', r.modo, ':', r.avaliados, 'modelos avaliados,', r.validos, 'válidos,', r.modelos.length, 'no ranking, em', Date.now() - t0, 'ms');
  console.log('Melhor:', JSON.stringify(r.modelos[0].transf), 'R²aj', r.modelos[0].R2aj.toFixed(4));
  const t1 = Date.now();
  const rna = INF.RNA.treinar(proj, transf, { redes: 5, epocas: 1500 });
  console.log('RNA: R²', rna.R2.toFixed(4), ' EMP', (rna.EMP * 100).toFixed(2) + '%', 'em', Date.now() - t1, 'ms');
});

// ---- conferência, correção autorizada e desfazer ---------------------------
const achados = INF.Conferencia.conferir(proj);
console.log('Conferência por regras:', achados.length, 'achado(s); ex.:', achados.slice(0, 2).map(a => a.texto).join(' | '));
const antes = proj.amostras[2].valores.Area;
const ap = { amostra: 3, texto: 'teste', correcao: { acao: 'corrigir', campo: 'Area', de: antes, para: 999, evidencia: 'teste de código' } };
INF.Conferencia.aplicarCorrecao(proj, ap, 'Teste');
const depois = proj.amostras[2].valores.Area;
INF.Conferencia.desfazer(proj);
console.log('Correção autorizada:', antes.toFixed(2), '→', depois, '→ desfeita:', proj.amostras[2].valores.Area === antes);
const rel = INF.Relatorio.gerar({ proj, modelo: mod, diag, projecao: proj80 });
console.log('Relatório HTML:', rel.length, 'caracteres');

// ---- ferramentas avançadas e exportação --------------------------------------
const Av = INF.Avancado;
console.log('PCA 1º componente:', (Av.pca(mod).componentes[0].variancia * 100).toFixed(1) + '% da variância');
console.log('K-médias (3):', Av.kmedias(mod, 3).grupos.map(g => g.amostras.length).join('/'), 'amostras por grupo');
const bc = Av.boxCox(mod); console.log('Box-Cox λ =', bc.lambda, 'IC95', bc.ic95, '→', bc.recomendada[1]);
const bs = Av.bootstrap(mod, aval, { B: 500 }); console.log('Bootstrap IC80%:', bs.min.toFixed(2), 'a', bs.max.toFixed(2), '| clássico:', proj80.icMin.toFixed(2), 'a', proj80.icMax.toFixed(2));
const bcoef = Av.bootstrapCoeficientes(mod, { B: 500 }); console.log('Bootstrap coef. mesmo sinal:', bcoef.coeficientes.map(c => c.nome + ' ' + (c.mesmoSinal * 100).toFixed(0) + '%').join(', '));
const rb = Av.robusta(mod); console.log('Huber: maior diferença', Math.max(...rb.coeficientes.map(c => Math.abs(c.diferenca))).toFixed(3), '| amostras com peso reduzido:', rb.pesos.length);
const gb = Av.boosting(mod); console.log('Boosting: R² treino', gb.R2treino.toFixed(3), 'validação', gb.R2validacao.toFixed(3), '| importância:', gb.importancia.map(i => i.nome + ' ' + (i.importancia * 100).toFixed(0) + '%').join(', '));
const sim = Av.simulacao(mod, aval, { N: 5000 }); console.log('Monte Carlo: P10', sim.p10.toFixed(2), 'P50', sim.p50.toFixed(2), 'P90', sim.p90.toFixed(2));
proj.amostras.forEach((a, i) => { a.lat = -18.5 + (i % 7) * 0.01; a.lon = -46.5 + Math.floor(i / 7) * 0.01; });
console.log('Moran:', JSON.stringify(Av.moran(proj, mod)));
const dea = Av.dea(proj, ['Area'], ['__dep__']); console.log('DEA eficientes (=1):', dea.resultado.filter(r => r.eficiencia > 0.9999).map(r => r.id).join(','), '| menor:', dea.resultado[dea.resultado.length - 1].eficiencia.toFixed(3));
const rna2 = INF.RNA.treinar(proj, transf, { redes: 3, epocas: 800 }); const pod = INF.RNA.podar(rna2, 0.1);
console.log('Poda RNA:', pod.poda.neuroniosAntes, '→', pod.poda.neuroniosDepois, 'neurônios; R²', rna2.R2.toFixed(3), '→', pod.R2.toFixed(3));
const xlsx = INF.Planilha.pastaCompleta({ proj, modelo: mod, diag, projecao: proj80, busca: null });
fs.writeFileSync(path.join(__dirname, 'teste.xlsx'), xlsx); console.log('XLSX:', xlsx.length, 'bytes');

// ---- laudo completo -----------------------------------------------------------
const Lx = INF.Laudo;
[1, 21, 100, 101, 1000, 1001, 1250000, 2000000, 3440000.5, 187592.11].forEach(v => console.log('Extenso', v, '→', Lx.porExtenso(v)));
proj.projeto.nome = 'Teste sintético'; proj.projeto.autor = 'Responsável Teste';
proj.laudo = { solicitante: 'Solicitante Teste', dataVistoria: '2026-09-20' };
// foto mínima (PNG 1×1 branco) só para exercitar a inclusão de imagem
proj.fotos = [{ id: 1, alvo: 'avaliando', legenda: 'Foto de teste', largura: 1, altura: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }];
const lau = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
if (lau.erro) console.log('Laudo erro:', lau.erro);
const htmlL = Lx.html(lau);
console.log('Laudo: blocos', lau.blocos.length, '| [preencher]:', (htmlL.match(/\[preencher:/g) || []).length, '| valor adotado', lau.valorAdotado);
fs.writeFileSync(path.join(__dirname, 'teste-laudo.docx'), Lx.docx(lau, {}));

// ---- tipos de laudo -------------------------------------------------------------
proj.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { ambito: 'rural', imovel: 'Fazenda', destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente'],
  processo: '0000000-00.0000.0.00.0000', areaFaixa: 12.5, coefServidao: 30, areaRemanescente: 100, percRemanescente: 5,
  quesitos: [{ parte: 'autor', pergunta: 'Qual o valor da indenização?', resposta: '' }] });
let lj = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
const txtJ = Lx.html(lj);
console.log('Judicial: título', /LAUDO PERICIAL/.test(txtJ), '| capítulos', lj.blocos.filter(b => b.t === 'h1').map(b => b.texto).slice(0, 13).join(' / '));
console.log('Conclusão judicial:', lj.blocos.find(b => b.t === 'p' && /concluo pelos seguintes valores/.test(b.texto)).texto);
proj.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { ambito: 'rural', imovel: 'Sítio', destino: 'banco', objetos: ['pleno', 'vtn', 'liquidacao'], banco: 'Banco Teste',
  prazoAbsorcao: 12, taxaMensal: 1, benfeitorias: [{ descricao: 'Casa sede', quantidade: 120, unidade: 'm²', unitario: 1500, depreciacao: 30 }] });
lj = Lx.montar({ proj, modelo: mod, diag, projecao: proj80 });
console.log('Banco: título', /LAUDO DE AVALIAÇÃO/.test(Lx.html(lj)), '|', lj.blocos.find(b => b.t === 'p' && /concluo pelos seguintes valores/.test(b.texto)).texto);
fs.writeFileSync(path.join(__dirname, 'teste-laudo-banco.docx'), Lx.docx(lj, {}));

// ---- vizinhança e inventário por modelo ------------------------------------------------
const pv = INF.Dados.novoProjeto(); pv.projeto.autor = 'Responsável Teste';
pv.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { destino: 'particular', objetos: ['vizinhanca'] });
pv.vizinhanca = { obra: { nome: 'Edifício Teste', endereco: 'Rua A, 100', construtora: 'Construtora Teste' }, imoveis: [
  { endereco: 'Rua A, 90', ocupante: 'Morador 1', tipo: 'Casa', dataVistoria: '2026-09-20', conservacao: 'regular',
    ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede leste, sob a janela', dimensao: '0,3 mm × 40 cm', descricao: 'fissura inclinada' }] }, { nome: 'Cozinha', anomalias: [] }] },
  { endereco: 'Rua A, 110', recusou: true, motivoRecusa: 'ocupante ausente', dataVistoria: '2026-09-20' }] };
pv.inventario = { h1: { arquivo: 'alvara.pdf', tipo: 'alvara_habitese', dataDocumento: '2026-08-01', resumo: 'Alvará de construção nº 123/2026...', dados: [{ campo: 'alvaraObra', valor: '123/2026', pagina: 1, trecho: 'Alvará nº 123/2026' }] } };
const lv = Lx.montar({ proj: pv });
console.log('Vizinhança:', lv.titulo, '| capítulos:', lv.blocos.filter(b => b.t === 'h1').map(b => b.texto).join(' / '));
fs.writeFileSync(path.join(__dirname, 'teste-vizinhanca.docx'), Lx.docx(lv, {}));
const fic = INF.Inventario.ficha(pv.tipoLaudo, pv.inventario, {}, function () { return ''; });
console.log('Ficha vizinhança:', fic.filter(f => f.estado === 'RESOLVIDA').map(f => f.rotulo + '=' + f.valor).join('; '), '| não encontradas:', fic.filter(f => f.estado === 'NÃO ENCONTRADA').length);
console.log('Checagem:', INF.Inventario.checagem(fic, INF.Inventario.trava([{ nome: 'alvara.pdf', hash: 'h1' }], pv.inventario)).mensagem);
