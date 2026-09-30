/* =============================================================================
   web/js/teste-app.js — TESTE COMPLETO DO COON INFER (arquivo único)
   -----------------------------------------------------------------------------
   Para o botão "Testar o app" do PAINEL DO ADMINISTRADOR: o botão abre
       /inferencia/?teste=completo
   e este arquivo roda, em sequência, com um projeto de TESTE (dados
   sintéticos; o projeto aberto é guardado e devolvido; nada é baixado,
   aberto ou gravado):
     PARTE 1 — funcionalidade: cada etapa faz a coisa certa (resultado esperado)
     PARTE 2 — botões: clica em todos os botões de todas as abas
     PARTE 3 — layout: botão visível, tamanho de clique, texto sem estourar,
               nada sobreposto, página sem rolagem lateral
   No fim mostra o relatório (✓ aprovado / ✗ com falhas), permite baixar o
   relatório em .json e devolve o resumo ao painel que abriu a janela
   (mensagem "coon-infer-teste"). Também roda por partes:
     ?teste=funcional · ?teste=botoes · ou no Node: node testes/teste-funcional.cjs
   ============================================================================= */

/* ---------------------------------- PARTE 1 ---------------------------------- */
/* =============================================================================
   web/js/teste-funcional.js — APLICADOR DE TESTES DE FUNCIONALIDADE
   -----------------------------------------------------------------------------
   O teste de botões (teste-botoes.js) confere que nada QUEBRA ao clicar.
   Este confere que cada etapa FAZ A COISA CERTA: cada caso monta uma
   situação, executa e compara com o resultado esperado.

   Etapas cobertas: 1 Projeto · 2 Variáveis · 3 Amostras · Pesquisa · 4 Modelo
   · Busca · Rede neural · Ferramentas avançadas · 5 Avaliação e NBR ·
   Inventário · 6 Laudo (17 modelos, 20 estilos, vizinhança) · Exportação ·
   Tela (abas, bloqueios, gráficos sem dados, seletores).

   Onde roda:
     · na tela: botão "Testar o app" (aba Relatório) ou /inferencia/?teste=funcional
     · no Node: node testes/teste-funcional.cjs  (só os casos sem tela)
   Os dados são SINTÉTICOS (não são mercado). O projeto aberto é guardado
   antes e devolvido no fim; nada é baixado, aberto ou gravado.
   ============================================================================= */

(function (INF) {
  'use strict';

  const CASOS = [];
  // caso(etapa, nome, fn, tela?) — fn recebe o verificador "v"
  function caso(etapa, nome, fn, tela) { CASOS.push({ etapa: etapa, nome: nome, fn: fn, tela: !!tela }); }

  // ---- verificador ----
  function Verif() { this.falhas = []; this.n = 0; }
  Verif.prototype.ok = function (cond, msg) { this.n++; if (!cond) this.falhas.push(msg); };
  Verif.prototype.igual = function (a, b, msg) { this.ok(a === b, msg + ' (esperado ' + JSON.stringify(b) + ', veio ' + JSON.stringify(a) + ')'); };
  Verif.prototype.perto = function (a, b, tol, msg) { this.ok(Math.abs(a - b) <= tol, msg + ' (esperado ' + b + ' ± ' + tol + ', veio ' + a + ')'); };

  // ---- dados sintéticos (mesma receita do teste-motor.cjs: R² conhecido) ----
  function projetoSintetico(n) {
    const U = INF.U, r = U.rng(2026);
    const nm = function () { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const p = INF.Dados.novoProjeto();
    Object.assign(p.projeto, { nome: 'TESTE FUNCIONAL', autor: 'Responsável Teste', codigo: 'T-001', imovel: 'Imóvel teste', observacao: 'Dados sintéticos de teste.', municipio: 'Patos de Minas/MG', dataBase: '2026-09-29' });
    ['Area', 'Dist', 'Topo', 'Pav'].forEach(function (nome, i) { INF.Dados.incluirVariavel(p, nome, ['quantitativa', 'quantitativa', 'qualitativa', 'dicotomica'][i]); });
    for (let i = 0; i < (n || 40); i++) {
      const area = 200 + r() * 1800, dist = 0.5 + r() * 12, topo = 1 + Math.floor(r() * 3), pav = r() < 0.6 ? 1 : 0;
      const lnvu = 5.2 + 180 / area - 0.18 * Math.log(dist) + 0.09 * topo + 0.12 * pav + 0.08 * nm();
      INF.Dados.incluirAmostra(p, { natureza: i % 3 === 0 ? 'transacao' : 'oferta', informante: 'Fonte ' + i, link: 'https://exemplo.test/' + i, data: '2026-08-10',
        endereco: 'Rua ' + i, lat: -18.58 + (i % 7) * 0.01, lon: -46.52 + Math.floor(i / 7) * 0.01, valores: { VU: Math.exp(lnvu), Area: area, Dist: dist, Topo: topo, Pav: pav } });
    }
    p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x' };
    p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2, Pav: 1 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
    return p;
  }
  function calcular(p) {
    const m = INF.Regressao.calcular(p, p.modelo.transf), d = INF.Diag.tudo(m);
    const pr = INF.Projecao.projetar(m, [800, 3, 2, 1], { nivel: 0.8, areaAvaliando: 800, item1: 2, item3: 2, considerarIntercepto: true });
    return { m: m, d: d, pr: pr };
  }

  // =========================== ETAPA 1 — PROJETO ===========================
  caso('1. Projeto', 'Projeto novo: aba 1 incompleta, com a lista do que falta', function (v) {
    const s = INF.Etapas.situacao(INF.Dados.novoProjeto(), {});
    v.ok(!s.projeto.completa, 'aba 1 deveria estar incompleta');
    ['responsável técnico', 'código do trabalho', 'identificação do imóvel', 'observação', 'município / UF'].forEach(function (f) { v.ok(s.projeto.faltas.indexOf(f) >= 0, 'deveria faltar: ' + f); });
  });
  caso('1. Projeto', 'Campos obrigatórios preenchidos: aba 1 completa', function (v) {
    v.ok(INF.Etapas.situacao(projetoSintetico(), {}).projeto.completa, 'aba 1 deveria estar completa');
  });
  caso('1. Projeto', 'Só a aba 1 barra o início; o resto roda só com dado', function (v) {
    const p = projetoSintetico(), s = INF.Etapas.situacao(p, {});
    v.ok(s.amostras.completa, 'amostras sintéticas deveriam passar');
    v.ok(!s.modelo.completa, 'modelo ainda não calculado deveria constar como incompleto');
  });

  // =========================== ETAPA 2 — VARIÁVEIS ===========================
  caso('2. Variáveis', 'Nome inválido, repetido e segunda dependente são recusados', function (v) {
    const p = INF.Dados.novoProjeto();
    v.ok(!!INF.Dados.incluirVariavel(p, 'Area total', 'quantitativa'), 'nome com espaço deveria ser recusado');
    v.igual(INF.Dados.incluirVariavel(p, 'Area', 'quantitativa'), null, 'nome válido deveria entrar');
    v.ok(!!INF.Dados.incluirVariavel(p, 'Area', 'quantitativa'), 'nome repetido deveria ser recusado');
    v.ok(!!INF.Dados.incluirVariavel(p, 'VT', 'dependente'), 'segunda dependente deveria ser recusada');
  });
  caso('2. Variáveis', 'Renomear leva junto os valores das amostras e a escala', function (v) {
    const p = projetoSintetico(), antes = p.amostras[0].valores.Area;
    v.igual(INF.Dados.renomearVariavel(p, 'Area', 'Area_m2'), null, 'renomear deveria funcionar');
    v.igual(p.amostras[0].valores.Area_m2, antes, 'valor deveria acompanhar o novo nome');
    v.igual(p.modelo.transf.Area_m2, '1/x', 'escala deveria acompanhar o novo nome');
  });
  caso('2. Variáveis', 'Operar variáveis: VT = VU * Area calcula certo', function (v) {
    const p = projetoSintetico(), a = p.amostras[5];
    const r = INF.Operar.operar(p, 'VT', 'identificacao', 'VU * Area');
    v.igual(r.ok, 40, 'todas as amostras deveriam receber VT');
    v.perto(a.valores.VT, a.valores.VU * a.valores.Area, 1e-6, 'VT = VU × Area');
  });
  caso('2. Variáveis', 'Operar variáveis: funções, comparação e fórmula inválida', function (v) {
    const f = INF.Operar.compilar('ln(x) + raiz(y) * 2 + (x >= 10)');
    v.perto(f({ x: 10, y: 9 }), Math.log(10) + 6 + 1, 1e-12, 'ln, raiz e comparação');
    let erro = null; try { INF.Operar.compilar('x +* 2'); } catch (e) { erro = e.message; }
    v.ok(!!erro, 'fórmula malformada deveria dar erro legível');
  });
  caso('2. Variáveis', 'Fórmula não executa código (sem eval)', function (v) {
    const f = INF.Operar.compilar('alert + constructor');
    v.ok(!Number.isFinite(f({})), 'nomes desconhecidos viram vazio, nunca código');
  });
  caso('2. Variáveis', 'Meses desde o evento e distância ao polo', function (v) {
    const p = projetoSintetico();
    INF.Dados.incluirVariavel(p, 'Meses', 'tempo');
    INF.Dados.preencherTempo(p, 'Meses');
    v.perto(p.amostras[0].valores.Meses, 1.6, 0.1, 'agosto/10 a setembro/29 ≈ 1,6 mês');
    v.igual(p.avaliando.valores.Meses, 0, 'avaliando na data base = 0');
    v.perto(INF.U.distanciaKm(0, 0, 1, 0), 111.19, 0.05, '1 grau de latitude ≈ 111,19 km');
  });

  // =========================== ETAPA 3 — AMOSTRAS ===========================
  caso('3. Amostras', 'Importação: descarta linha "Unnamed" e nota de rodapé; lê aspas e ;', function (v) {
    const csv = '﻿Unnamed: 0;Unnamed: 1;Unnamed: 2\nNº;Informante;Valor (R$/ha)\n1;"Imob; Centro";"20.000,50"\n2;Outra;15000\n;;\nNOTA METODOLÓGICA;;\n';
    const r = INF.Dados.lerCSV(csv), l = INF.Dados.limparLinhas(r.linhas);
    v.igual(r.separador, ';', 'separador');
    v.igual(l.length, 3, 'cabeçalho + 2 linhas');
    v.igual(l[1][1], 'Imob; Centro', 'aspas com ; dentro');
    v.igual(INF.U.lerNumero(l[1][2]), 20000.5, 'número brasileiro');
    v.igual(INF.Dados.dataIso('15/08/2026'), '2026-08-15', 'data dd/mm/aaaa');
  });
  caso('3. Amostras', 'Fator: oferta × 0,90 e transação × 1,00', function (v) {
    const p = projetoSintetico(), o = p.amostras[1], t = p.amostras[0];
    v.perto(INF.Regressao.valorDependente(p, o, 'VU'), o.valores.VU * 0.9, 1e-9, 'oferta com 0,90');
    v.perto(INF.Regressao.valorDependente(p, t, 'VU'), t.valores.VU, 1e-9, 'transação sem fator');
  });
  caso('3. Amostras', 'Oferta só vale com fonte e telefone ou link', function (v) {
    const R = INF.Conferencia.ofertaRastreavel;
    v.ok(!R({ natureza: 'oferta', informante: 'Imob X' }).ok, 'sem telefone e sem link: não vale');
    v.ok(R({ natureza: 'oferta', informante: 'Imob X', link: 'https://a.test' }).ok, 'com link: vale');
    v.ok(R({ natureza: 'oferta', informante: 'Fernando (38) 9.9949-8922' }).ok, 'telefone dentro do informante: vale');
    v.ok(!R({ natureza: 'oferta', informante: 'Não informado', link: 'https://a.test' }).ok, 'sem fonte: não vale');
    v.ok(R({ natureza: 'transacao' }).ok, 'transação não entra na regra');
  });
  caso('3. Amostras', 'Tirar do cálculo as ofertas sem contato e desfazer', function (v) {
    const p = projetoSintetico();
    p.amostras[1].link = ''; p.amostras[2].link = '';
    const ids = INF.Conferencia.desligarSemContato(p);
    v.igual(ids.join(','), '2,3', 'amostras 2 e 3 deveriam sair');
    v.igual(p.amostras[1].habilitada, false, 'fica fora do cálculo');
    INF.Conferencia.desfazer(p, p.historico.length - 1);
    v.igual(p.amostras[2].habilitada, true, 'desfazer devolve a amostra');
  });
  caso('3. Amostras', 'Conferência acha duplicata, valor discrepante, data futura e poucas amostras', function (v) {
    const p = projetoSintetico();
    p.amostras[4].link = p.amostras[3].link;
    p.amostras[6].valores.VU = p.amostras[6].valores.VU * 40;
    p.amostras[7].data = '2027-01-01';
    const c = INF.Conferencia.conferir(p), tem = function (r, id) { return c.some(function (x) { return x.regra === r && (id === undefined || x.amostra === id); }); };
    v.ok(tem('duplicata', 5), 'duplicata pelo link');
    v.ok(tem('discrepante', 7), 'valor muito fora');
    v.ok(tem('futura', 8), 'data depois da data base');
    const q = projetoSintetico(8);
    v.ok(INF.Conferencia.conferir(q).some(function (x) { return x.regra === 'quantidade' && x.nivel === 'erro'; }), '8 amostras para 4 variáveis: abaixo de 3(k+1)');
  });
  caso('3. Amostras', 'Modelo híbrido: sistema, híbrido e só as minhas', function (v) {
    const p = projetoSintetico(), reg = [{ id: 'b1', natureza: 'oferta', preco: 300000, area: 1000, informante: 'Banco', link: 'https://b.test/1', atributos: { Dist: 2, Topo: 3, Pav: 1 } }];
    INF.Conferencia.aplicarOrigem(p, 'hibrido', reg);
    v.igual(p.amostras.length, 41, 'híbrido soma 1 do banco');
    v.perto(p.amostras[40].valores.VU, 300, 1e-9, 'VU do banco = preço ÷ área');
    INF.Conferencia.aplicarOrigem(p, 'sistema', reg);
    v.igual(p.amostras.filter(function (a) { return a.habilitada !== false; }).length, 1, 'só dados do sistema no cálculo');
    INF.Conferencia.aplicarOrigem(p, 'meus', reg);
    v.igual(p.amostras.length, 40, 'só as minhas: tira as do banco');
    v.igual(p.amostras.filter(function (a) { return a.habilitada !== false; }).length, 40, 'as próprias voltam ao cálculo');
  });

  // =========================== PESQUISA ===========================
  caso('Pesquisa de mercado', 'Leitor de anúncio: preço, área, alqueire, m² e telefone', function (v) {
    const E = INF.Pesquisa.extrairAnuncio;
    const a = E('Fazenda 172 ha. R$ 3.440.000. Condomínio R$ 0. Fone (38) 99876-5432');
    v.igual(a.preco, 3440000, 'maior valor em R$'); v.igual(a.area, 172, 'área em ha'); v.igual(a.vu, 20000, 'VU = preço ÷ área'); v.ok(/99876-5432/.test(a.telefone), 'telefone');
    const b = E('Sítio de 10 alqueires, R$ 1,2 milhões');
    v.perto(b.area, 48.4, 1e-9, 'alqueire mineiro = 4,84 ha'); v.igual(b.preco, 1200000, 'R$ 1,2 milhões');
    v.igual(E('Apartamento 85 m², R$ 450.000').area, 85, 'área em m²');
  });

  // =========================== ETAPA 4 — MODELO ===========================
  caso('4. Modelo', 'Regressão confere com a referência (statsmodels)', function (v) {
    const r = calcular(projetoSintetico());
    v.perto(r.m.R2, 0.864663, 1e-6, 'R²'); v.perto(r.m.R2aj, 0.849196, 1e-6, 'R² ajustado'); v.perto(r.m.F, 55.9036, 1e-3, 'F');
    v.igual(r.m.n, 40, 'n'); v.igual(r.m.p, 5, 'parâmetros');
  });
  caso('4. Modelo', 'Escala impossível e variável constante dão erro claro', function (v) {
    const p = projetoSintetico(); p.amostras[0].valores.Dist = 0;
    v.ok(/inválido para a escala/.test(INF.Regressao.calcular(p, p.modelo.transf).erro || ''), 'ln(0) deveria ser recusado');
    const q = projetoSintetico(); q.amostras.forEach(function (a) { a.valores.Pav = 1; });
    v.ok(/singular/i.test(INF.Regressao.calcular(q, q.modelo.transf).erro || ''), 'variável constante deveria dar matriz singular');
  });
  caso('4. Modelo', 'Diagnósticos dentro dos limites', function (v) {
    const d = calcular(projetoSintetico()).d;
    v.ok(d.sw.estatistica > 0 && d.sw.estatistica <= 1, 'W de Shapiro entre 0 e 1');
    v.ok(d.dw > 0 && d.dw < 4, 'Durbin-Watson entre 0 e 4');
    v.ok(d.vif.every(function (x) { return x.vif >= 1; }), 'VIF ≥ 1');
    v.ok(d.proporcoes[0].obtido <= d.proporcoes[1].obtido && d.proporcoes[1].obtido <= d.proporcoes[2].obtido, 'proporções crescentes');
    v.ok(d.prev.R2previsao <= calcular(projetoSintetico()).m.R2, 'R² de previsão ≤ R²');
  });
  caso('4. Modelo', 'Estatística descritiva: mediana e CV', function (v) {
    const d = INF.Diag.descritiva([1, 2, 3, 4, 100]);
    v.igual(d.mediana, 3, 'mediana'); v.igual(d.n, 5, 'n'); v.ok(d.cv > 1, 'CV alto com valor extremo');
  });

  // =========================== BUSCA ===========================
  caso('Busca de modelos', 'Busca exaustiva: combinações, ordem e filtro', async function (v) {
    const p = projetoSintetico();
    const r = await INF.Busca.buscar(p, { criterio: 'R2aj', limite: 50, testarExclusao: true, sigMaxRegressores: 0.3 });
    v.igual(r.totalCombinacoes, 7 * 8 * 8 * 2 * 2, 'combinações = 7 × 8 × 8 × 2 × 2');
    v.ok(r.modelos.length === 50, 'guarda o limite pedido');
    v.ok(r.modelos.every(function (x, i, a) { return i === 0 || a[i - 1].R2aj >= x.R2aj; }), 'ordenado do melhor para o pior');
    v.ok(r.modelos.every(function (x) { return x.sigMax <= 0.3; }), 'todos passam no filtro de Sig');
  });

  // =========================== RNA E AVANÇADO ===========================
  caso('Rede neural', 'Treina, prevê e poda', function (v) {
    const p = projetoSintetico(), rna = INF.RNA.treinar(p, p.modelo.transf, { redes: 3, epocas: 600 });
    v.ok(rna.R2 > 0.3, 'R² da RNA razoável'); v.ok(rna.EMP > 0 && rna.EMP < 0.5, 'erro médio percentual');
    const pod = INF.RNA.podar(rna, 0.1);
    v.ok(pod.poda.neuroniosDepois <= pod.poda.neuroniosAntes, 'poda não aumenta neurônios');
    v.ok(Number.isFinite(INF.RNA.prever(rna, [800, 3, 2, 1]).media), 'prevê o avaliando');
  });
  caso('Ferramentas avançadas', 'Box-Cox, bootstrap, Huber, Moran, DEA, PCA, K-médias, boosting e Monte Carlo', function (v) {
    const p = projetoSintetico(), r = calcular(p), A = INF.Avancado;
    const bc = A.boxCox(r.m); v.ok(bc.lambda >= -2 && bc.lambda <= 2 && bc.ic95[0] <= bc.lambda && bc.lambda <= bc.ic95[1], 'λ dentro do intervalo');
    const bs = A.bootstrap(r.m, [800, 3, 2, 1], { B: 300 }); v.ok(bs.min < bs.central && bs.central < bs.max, 'bootstrap envolve a estimativa');
    v.ok(A.robusta(r.m).coeficientes.length === 5, 'Huber devolve os 5 coeficientes');
    const mo = A.moran(p, r.m); v.ok(mo.p >= 0 && mo.p <= 1, 'p de Moran entre 0 e 1');
    const dea = A.dea(p, ['Area'], ['__dep__']); v.ok(dea.resultado.every(function (x) { return x.eficiencia <= 1 + 1e-9; }) && Math.abs(dea.resultado[0].eficiencia - 1) < 1e-6, 'DEA: máxima = 1, todas ≤ 1');
    const pca = A.pca(r.m); v.perto(pca.componentes[pca.componentes.length - 1].acumulada, 1, 1e-6, 'PCA soma 100%');
    const km = A.kmedias(r.m, 3); v.igual(km.grupos.reduce(function (s, g) { return s + g.amostras.length; }, 0), 40, 'K-médias usa todas as amostras');
    const gb = A.boosting(r.m); v.perto(gb.importancia.reduce(function (s, x) { return s + x.importancia; }, 0), 1, 1e-9, 'importâncias somam 100%');
    const sim = A.simulacao(r.m, [800, 3, 2, 1], { N: 2000 }); v.ok(sim.p10 < sim.p50 && sim.p50 < sim.p90, 'Monte Carlo ordenado');
  });

  // =========================== ETAPA 5 — AVALIAÇÃO ===========================
  caso('5. Avaliação e NBR', 'Intervalos em ordem, amplitude e graus pela norma', function (v) {
    const pr = calcular(projetoSintetico()).pr;
    v.ok(pr.ipMin < pr.icMin && pr.icMin < pr.central && pr.central < pr.icMax && pr.icMax < pr.ipMax, 'predição ⊃ confiança ⊃ central');
    v.perto(pr.amplitude, (pr.icMax - pr.icMin) / pr.central, 1e-12, 'amplitude = (máx − mín) ÷ central');
    v.igual(pr.grauPrecisao, INF.NBR.precisao(pr.amplitude), 'grau de precisão pela Tabela 5');
    v.igual(pr.fundamentacao.pontos, pr.fundamentacao.itens.reduce(function (s, i) { return s + i.pontos; }, 0), 'pontos = soma dos itens');
    v.perto(pr.arbitrioMax / pr.central, 1.15, 1e-12, 'campo de arbítrio +15%');
  });
  caso('5. Avaliação e NBR', 'Tabela 5 e extrapolação', function (v) {
    v.igual(INF.NBR.precisao(0.30), 3, '30% → III'); v.igual(INF.NBR.precisao(0.35), 2, '35% → II'); v.igual(INF.NBR.precisao(0.45), 1, '45% → I'); v.igual(INF.NBR.precisao(0.6), 0, '60% → fora');
    const r = calcular(projetoSintetico());
    v.igual(INF.NBR.extrapolacao(r.m, [800, 3, 2, 1]).grau, 3, 'dentro da amostra: sem extrapolação');
    v.igual(INF.NBR.extrapolacao(r.m, [r.m.faixa[0].max * 3, 3, 2, 1]).grau, 0, 'além de 2× o máximo: não admitida');
  });
  caso('5. Avaliação e NBR', 'Arredondamento até 1% e micronumerosidade', function (v) {
    const a = INF.Projecao.arredondar(187592.11);
    v.ok(Math.abs(a - 187592.11) / 187592.11 <= 0.01, 'arredonda até 1%');
    const p = projetoSintetico(); p.amostras.forEach(function (x, i) { x.valores.Topo = i < 2 ? 3 : 1 + (i % 2); });
    const m = INF.Regressao.calcular(p, p.modelo.transf);
    v.ok(INF.NBR.micronumerosidade(p, m).problemas.some(function (q) { return q.variavel === 'Topo' && q.codigo === '3'; }), 'código com 2 amostras é apontado');
  });

  // =========================== INVENTÁRIO ===========================
  caso('Inventário de documentos', 'Divergência vai ao documento dono; empate sem data fica em aberto', function (v) {
    const tl = INF.TiposLaudo.padrao();
    const inv = { a: { arquivo: 'matricula.pdf', tipo: 'matricula', dados: [{ campo: 'areaDocumento', valor: '172,5 ha', trecho: 'x' }] },
      b: { arquivo: 'ccir.pdf', tipo: 'ccir', dados: [{ campo: 'areaDocumento', valor: '170 ha', trecho: 'y' }] } };
    const f = INF.Inventario.ficha(tl, inv, {}).find(function (x) { return x.campo === 'areaDocumento'; });
    v.igual(f.estado, 'RESOLVIDA', 'resolvida'); v.igual(f.valor, '172,5 ha', 'vale a matrícula');
    const inv2 = { a: { arquivo: 'm1.pdf', tipo: 'matricula', dados: [{ campo: 'matricula', valor: '100', trecho: 'x' }] }, b: { arquivo: 'm2.pdf', tipo: 'matricula', dados: [{ campo: 'matricula', valor: '200', trecho: 'y' }] } };
    v.igual(INF.Inventario.ficha(tl, inv2, {}).find(function (x) { return x.campo === 'matricula'; }).estado, 'NÃO SOLUCIONADA', 'duas matrículas sem data');
    inv2.b.dataDocumento = '2026-09-01'; inv2.a.dataDocumento = '2025-01-01';
    v.igual(INF.Inventario.ficha(tl, inv2, {}).find(function (x) { return x.campo === 'matricula'; }).valor, '200', 'vale a mais recente');
  });
  caso('Inventário de documentos', 'Trava de leitura e checagem de entrega', function (v) {
    const tl = INF.TiposLaudo.padrao();
    const inv = { h: { arquivo: 'a.pdf', tipo: 'matricula', resumo: 'curto', dados: [] } };
    const trava = INF.Inventario.trava([{ nome: 'a.pdf', hash: 'h' }, { nome: 'b.pdf', hash: 'z' }], inv);
    v.ok(trava.some(function (t) { return /resumo raso/.test(t.texto); }), 'resumo raso reprova');
    v.ok(trava.some(function (t) { return t.arquivo === 'b.pdf' && /não lido/.test(t.texto); }), 'documento não lido reprova');
    const ch = INF.Inventario.checagem(INF.Inventario.ficha(tl, inv, {}), trava);
    v.ok(ch.bloqueada && /ENTREGA BLOQUEADA/.test(ch.mensagem), 'entrega bloqueada');
    v.ok(Object.keys(INF.Inventario.COMO_OBTER).length >= 40, 'caminho para conseguir cada dado');
  });

  // =========================== ETAPA 6 — LAUDO ===========================
  caso('6. Laudo completo', 'Os 17 modelos: capítulos do nível, sem "undefined" nem "NaN"', function (v) {
    const base = projetoSintetico(), r = calcular(base);
    INF.Modelos.MODELOS.forEach(function (M) {
      const p = JSON.parse(JSON.stringify(base)); INF.Modelos.aplicar(p, M.id); p.laudo = { estilo: 1 };
      if (M.objetos.indexOf('vizinhanca') >= 0) p.vizinhanca = { obra: { nome: 'Obra' }, imoveis: [{ endereco: 'Rua A', ambientes: [{ nome: 'Sala', anomalias: [] }] }] };
      const l = INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr });
      if (l.erro) { v.ok(false, M.id + ': ' + l.erro); return; }
      const html = INF.Laudo.html(l), h1 = l.blocos.filter(function (b) { return b.t === 'h1'; }).map(function (b) { return b.texto; }).join(' | ');
      v.ok(!/undefined|NaN|\[object Object\]/.test(html.replace(/<[^>]+>/g, ' ')), M.id + ': texto sem "undefined", "NaN" ou objeto cru');
      if (M.nivel === 'simplificado') v.ok(!l.blocos.some(function (b) { return b.t === 'sumario'; }), M.id + ': simplificado sem sumário');
      else v.ok(l.blocos.some(function (b) { return b.t === 'sumario'; }), M.id + ': com sumário');
      if (M.nivel === 'pericial' && M.objetos.indexOf('vizinhanca') < 0) { v.ok(/Respostas aos quesitos/.test(h1), M.id + ': quesitos'); v.ok(/Origem de cada dado/.test(h1), M.id + ': anexo de origem'); }
      if (M.objetos.indexOf('vizinhanca') < 0) v.ok(/Pesquisa de mercado/.test(h1), M.id + ': pesquisa de mercado');
    });
  });
  caso('6. Laudo completo', 'Dado ausente vira [preencher]; valor por extenso', function (v) {
    const p = projetoSintetico(), r = calcular(p); p.laudo = {};
    const html = INF.Laudo.html(INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr }));
    v.ok(/\[preencher: número da matrícula\]/.test(html), 'matrícula ausente sai marcada, não inventada');
    v.igual(INF.Laudo.porExtenso(1180), 'mil cento e oitenta reais', 'extenso 1.180');
    v.igual(INF.Laudo.porExtenso(2000000), 'dois milhões de reais', 'extenso 2 milhões');
    v.igual(INF.Laudo.porExtenso(187592.11), 'cento e oitenta e sete mil quinhentos e noventa e dois reais e onze centavos', 'extenso com centavos');
  });
  caso('6. Laudo completo', 'Contas de servidão, remanescente e liquidação forçada', function (v) {
    const c = INF.TiposLaudo.calcular(Object.assign(INF.TiposLaudo.padrao(), { objetos: ['servidao', 'remanescente', 'liquidacao'], areaFaixa: 12.5, coefServidao: 30, areaRemanescente: 100, percRemanescente: 5, prazoAbsorcao: 12, taxaMensal: 1 }), 235, 188000);
    v.perto(c.servidao.total, 12.5 * 235 * 0.3, 1e-9, 'servidão = VU × área × coef');
    v.perto(c.remanescente.total, 100 * 235 * 0.05, 1e-9, 'remanescente');
    v.perto(c.liquidacao.valor, 188000 / Math.pow(1.01, 12), 1e-6, 'VLF = V ÷ (1 + i)ⁿ');
  });
  caso('6. Laudo completo', 'Os 20 estilos geram Word válido', function (v) {
    const p = projetoSintetico(), r = calcular(p); INF.Modelos.aplicar(p, 'jud_valor'); p.laudo = {};
    for (let n = 1; n <= 20; n++) {
      p.laudo.estilo = n;
      const z = INF.Laudo.docx(INF.Laudo.montar({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr }), {});
      v.ok(z[0] === 0x50 && z[1] === 0x4B && z.length > 10000, 'estilo ' + n + ': arquivo Word (ZIP) gerado');
    }
  });

  // =========================== EXPORTAÇÃO ===========================
  caso('Exportação', 'Excel com as abas esperadas', function (v) {
    const p = projetoSintetico(), r = calcular(p);
    const z = INF.Planilha.pastaCompleta({ proj: p, modelo: r.m, diag: r.d, projecao: r.pr });
    const txt = new TextDecoder().decode(z);
    v.ok(z[0] === 0x50 && z[1] === 0x4B, 'arquivo .xlsx (ZIP)');
    ['Amostras', 'Estatística', 'Regressores', 'ANOVA e indicadores', 'Resíduos', 'Fundamentação', 'Projeção'].forEach(function (aba) { v.ok(txt.indexOf('name="' + aba + '"') >= 0, 'aba ' + aba); });
  });

  // =========================== TELA ===========================
  function E() { return INF.Tela.estado; }
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
  caso('Tela', 'Aba 1 incompleta leva de volta ao Projeto com aviso', async function (v) {
    E().proj = INF.Dados.novoProjeto(); E().aba = 'projeto'; INF.Tela.desenhar();
    document.querySelector('[data-aba=amostras]').click(); await espera(30);
    v.igual(E().aba, 'projeto', 'continua no Projeto');
    v.ok(/Para começar/.test((document.querySelector('.aviso') || {}).textContent || ''), 'aviso claro do que falta');
    v.ok(document.querySelectorAll('.campo.obrigatorio .sinal-erro').length >= 4, 'sinais vermelhos nos obrigatórios');
  }, true);
  caso('Tela', 'Aba 1 completa: todas as abas abrem e sinais verdes', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'projeto'; INF.Tela.desenhar();
    v.ok(document.querySelectorAll('.campo.obrigatorio .sinal-ok').length >= 6, 'sinais verdes nos obrigatórios');
    for (const b of Array.prototype.slice.call(document.querySelectorAll('.aba'))) {
      const aba = b.dataset.aba; document.querySelector('[data-aba="' + aba + '"]').click(); await espera(15);
      v.igual(E().aba, aba, 'abre a aba ' + aba);
    }
  }, true);
  caso('Tela', 'Calcular não roda com amostras insuficientes', async function (v) {
    E().proj = projetoSintetico(6); E().modelo = null; E().aba = 'modelo'; INF.Tela.desenhar();
    document.querySelector('[data-acao=calcular]').click(); await espera(30);
    v.ok(!E().modelo, 'modelo não foi calculado');
    v.ok(/Não dá para rodar/.test((document.querySelector('.aviso') || {}).textContent || ''), 'aviso do que falta');
  }, true);
  caso('Tela', 'Calcular com dados completos mostra resultado e sinal verde', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'modelo'; INF.Tela.desenhar();
    document.querySelector('[data-acao=calcular]').click(); await espera(40);
    v.ok(E().modelo && !E().modelo.erro, 'modelo calculado');
    v.ok(/0,8647/.test(document.querySelector('.indicadores').textContent), 'R² 0,8647 na tela');
    v.ok(document.querySelector('[data-aba=modelo] .sinal-aba.ok'), 'aba Modelo com ✓ verde');
  }, true);
  caso('Tela', 'Gráficos aparecem mesmo sem dados', async function (v) {
    E().proj = projetoSintetico(); E().modelo = null; E().aba = 'graficos'; INF.Tela.desenhar();
    v.ok(document.querySelectorAll('#conteudo svg').length >= 6, 'molduras dos gráficos na tela');
    v.ok(/sem dados ainda/.test(document.querySelector('#conteudo').textContent), 'aviso "sem dados ainda"');
  }, true);
  caso('Tela', 'Seletor de modelo e de estilo gravam no projeto', async function (v) {
    E().proj = projetoSintetico(); E().aba = 'laudo'; INF.Tela.desenhar();
    const sm = document.querySelector('[data-modelo]'); sm.value = 'jud_servidao_pleno'; sm.dispatchEvent(new Event('change', { bubbles: true })); await espera(20);
    v.igual(INF.TiposLaudo.ler(E().proj).destino, 'judicial', 'modelo aplica o destino');
    const se = document.querySelector('[data-estilo]'); se.value = '7'; se.dispatchEvent(new Event('change', { bubbles: true })); await espera(20);
    v.igual(E().proj.laudo.estilo, 7, 'estilo 7 gravado');
  }, true);

  // ---------------------------------------------------------------------------
  // Execução
  // ---------------------------------------------------------------------------
  INF.TesteFuncional = {
    CASOS: CASOS,
    projetoSintetico: projetoSintetico,
    rodar: async function (opcoes) {
      const op = opcoes || {}, comTela = op.tela !== false && typeof document !== 'undefined' && INF.Tela;
      let guardado = null, orig = null;
      if (comTela) {
        guardado = JSON.stringify(E().proj);
        orig = { salvar: INF.Dados.salvarLocal, baixar: INF.Dados.baixar, open: window.open };
        INF.Dados.salvarLocal = function () { return true; }; INF.Dados.baixar = function () {}; window.open = function () { return null; };
      }
      const res = [];
      for (const c of CASOS) {
        if (c.tela && !comTela) continue;
        const v = new Verif(), t0 = Date.now();
        try { await c.fn(v); } catch (e) { v.falhas.push('exceção: ' + e.message); }
        res.push({ etapa: c.etapa, nome: c.nome, ok: v.falhas.length === 0, verificacoes: v.n, falhas: v.falhas, ms: Date.now() - t0 });
      }
      if (comTela) {
        INF.Dados.salvarLocal = orig.salvar; INF.Dados.baixar = orig.baixar; window.open = orig.open;
        const e = E(); e.proj = INF.Dados.normalizar(JSON.parse(guardado));
        e.modelo = e.diag = e.projecao = e.rna = e.busca = e.conferencia = e.conferenciaIA = null; e.aviso = null; e.aba = 'projeto'; INF.Tela.desenhar();
      }
      const ondeF = []; res.filter(function (r) { return !r.ok; }).forEach(function (r) { if (ondeF.indexOf(r.etapa) < 0) ondeF.push(r.etapa); });
      return { casos: res.length, ok: res.filter(function (r) { return r.ok; }).length, verificacoes: res.reduce(function (s, r) { return s + r.verificacoes; }, 0), resultados: res,
        mensagem: ondeF.length ? 'Precisa de correção em: ' + ondeF.join('; ') + ' — providenciar.' : 'Tudo funcionando.' };
    },
    mostrar: function (r) {
      const esc = INF.U.esc;
      const d = document.createElement('div'); d.className = 'teste-resultado';
      let etapaAtual = '';
      d.innerHTML = '<h2>Teste de funcionalidade: ' + r.ok + ' de ' + r.casos + ' casos certos · ' + r.verificacoes + ' verificações</h2>'
        + '<p class="nota">Dados sintéticos (não são mercado). O seu projeto foi guardado antes e devolvido.</p><table class="tabela"><tbody>'
        + r.resultados.map(function (x) {
          const cab = x.etapa !== etapaAtual ? '<tr><th colspan="3" class="esq">' + esc(x.etapa) + '</th></tr>' : '';
          etapaAtual = x.etapa;
          return cab + '<tr><td><span class="sinal ' + (x.ok ? 'sinal-ok">✓' : 'sinal-erro">✗') + '</span></td><td class="esq">' + esc(x.nome) + (x.falhas.length ? '<small class="fonte">' + x.falhas.map(esc).join('<br>') + '</small>' : '') + '</td><td>' + x.verificacoes + ' verif.</td></tr>';
        }).join('') + '</tbody></table><button class="principal">Fechar</button>';
      d.querySelector('button').addEventListener('click', function () { d.remove(); });
      document.body.appendChild(d);
    }
  };

  if (typeof location !== 'undefined' && /[?&]teste=funcional/.test(location.search)) {
    setTimeout(function () { INF.TesteFuncional.rodar().then(INF.TesteFuncional.mostrar); }, 1200);
  }
})(globalThis.INF = globalThis.INF || {});

/* ---------------------------------- PARTE 2 ---------------------------------- */
/* =============================================================================
   web/js/teste-botoes.js — teste automático de todos os botões da tela
   -----------------------------------------------------------------------------
   Como rodar: abrir  /inferencia/?teste=botoes   (ou chamar
   INF.TesteBotoes.rodar() no console). O resultado aparece numa janela sobre
   a tela e também volta como objeto.

   O que faz:
     1. guarda o projeto aberto (sessionStorage) — ele volta no fim;
     2. monta um projeto de TESTE com dados sintéticos (não é mercado);
     3. em cada aba, clica em TODOS os botões (data-acao), um por um, e anota
        erro de JavaScript, promessa rejeitada ou botão que sumiu;
     4. troca os 17 modelos de laudo e os 20 estilos e gera o laudo de cada;
     5. devolve o projeto original.
   Downloads, janelas novas e impressão são interceptados (nada é baixado,
   aberto ou impresso). Botões que gravam na nuvem ou trocam de projeto são
   pulados de propósito (lista PULAR).
   ============================================================================= */

(function (INF) {
  'use strict';

  const PULAR = ['salvarNuvem', 'meusProjetos', 'abrirDaNuvem', 'excluirDaNuvem', 'recuperarAnterior', 'novo'];
  // estes apagam coisas: rodam por último em cada aba
  const DESTRUTIVOS = ['excluirAmostra', 'excluirVar', 'excluirFoto', 'tirarQuesito', 'tirarBenf', 'vizTirarImovel', 'vizTirarAmbiente', 'vizTirarAnomalia', 'desfazer', 'desligar'];
  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  function projetoDeTeste() {
    const U = INF.U, r = U.rng(2026);
    const nm = function () { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const p = INF.Dados.novoProjeto();
    p.projeto.nome = 'TESTE AUTOMÁTICO DE BOTÕES'; p.projeto.autor = 'Responsável Teste'; p.projeto.municipio = 'Patos de Minas/MG';
    p.projeto.codigo = 'TESTE-001'; p.projeto.imovel = 'Imóvel de teste'; p.projeto.observacao = 'Projeto sintético do teste automático de botões (não é mercado).';
    [['Area', 'quantitativa', '-'], ['Dist', 'quantitativa', '-'], ['Topo', 'qualitativa', '+'], ['Pav', 'dicotomica', '+'], ['Meses', 'tempo', '-']].forEach(function (v) {
      INF.Dados.incluirVariavel(p, v[0], v[1]); p.variaveis.find(function (x) { return x.nome === v[0]; }).direcao = v[2];
    });
    for (let i = 0; i < 40; i++) {
      const a = 200 + r() * 1800, d = 0.5 + r() * 12, t = 1 + Math.floor(r() * 3), pv = r() < 0.6 ? 1 : 0;
      INF.Dados.incluirAmostra(p, { natureza: i % 3 ? 'oferta' : 'transacao', informante: 'Imobiliária teste ' + i, telefone: '(34) 99999-00' + String(i).padStart(2, '0'),
        link: 'https://exemplo.test/anuncio/' + i, data: '2026-0' + (1 + i % 8) + '-10', endereco: 'Rua teste ' + i, lat: -18.58 + r() * 0.06, lon: -46.52 + r() * 0.06,
        valores: { VU: Math.exp(5.2 + 180 / a - 0.18 * Math.log(d) + 0.09 * t + 0.12 * pv + 0.08 * nm()), Area: a, Dist: d, Topo: t, Pav: pv, Meses: i % 8 } });
    }
    p.modelo.transf = { VU: 'ln', Area: '1/x', Dist: 'ln', Topo: 'x', Pav: 'x', Meses: 'fora' };
    p.avaliando.valores = { Area: 800, Dist: 3, Topo: 2, Pav: 1, Meses: 0 }; p.avaliando.area = 800; p.avaliando.lat = -18.55; p.avaliando.lon = -46.49;
    p.config.polo = { nome: 'Centro', lat: -18.578, lon: -46.518 };
    p.laudo = { solicitante: 'Solicitante teste', dataVistoria: '2026-09-20', estilo: 1 };
    p.tipoLaudo = Object.assign(INF.TiposLaudo.padrao(), { destino: 'judicial', objetos: ['pleno', 'servidao', 'remanescente', 'vtn', 'liquidacao'], areaFaixa: 12, coefServidao: 30,
      areaRemanescente: 100, percRemanescente: 5, prazoAbsorcao: 12, taxaMensal: 1, quesitos: [{ parte: 'autor', pergunta: 'Qual o valor?', resposta: '' }],
      benfeitorias: [{ descricao: 'Casa', quantidade: 100, unidade: 'm²', unitario: 1500, depreciacao: 20 }] });
    p.vizinhanca = { obra: { nome: 'Obra teste' }, imoveis: [{ endereco: 'Rua A, 90', ambientes: [{ nome: 'Sala', anomalias: [{ tipo: 'Fissura', localizacao: 'parede' }] }] }] };
    // uma foto mínima (1×1) para exercitar legenda/alvo/remover
    p.fotos = [{ id: 1, alvo: 'avaliando', legenda: 'foto teste', largura: 1, altura: 1, dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' }];
    return p;
  }

  INF.TesteBotoes = {
    rodar: async function () {
      const E = INF.Tela.estado, relatorio = [], erros = [];
      const guardado = JSON.stringify(E.proj);
      sessionStorage.setItem('inferencia-nbr:backup-teste', guardado);
      // interceptações
      const orig = { baixar: INF.Dados.baixar, open: window.open, confirm: window.confirm, prompt: window.prompt, append: document.body.appendChild.bind(document.body), salvar: INF.Dados.salvarLocal };
      const baixados = [], abertos = [], impressos = [];
      INF.Dados.baixar = function (nome, c) { baixados.push({ nome: nome, bytes: c.length || c.size || 0 }); };
      INF.Dados.salvarLocal = function () { return true; };     // não sobrescreve o projeto dele no navegador
      window.open = function (u) { abertos.push(String(u).slice(0, 40)); return null; };
      window.confirm = function () { return true; };
      window.prompt = function () { return 'Renomeada_teste'; };
      document.body.appendChild = function (no) { if (no && no.tagName === 'IFRAME') { impressos.push('impressão'); return no; } return orig.append(no); };
      const aoErro = function (ev) { erros.push(ev.message || String(ev.reason)); };
      window.addEventListener('error', aoErro); window.addEventListener('unhandledrejection', aoErro);

      async function clicar(aba, acao, arg) {
        const n0 = erros.length;
        const sel = '[data-acao="' + acao + '"]' + (arg !== undefined && arg !== null ? '[data-arg="' + String(arg).replace(/"/g, '\\"') + '"]' : '');
        const bt = document.querySelector(sel);
        if (!bt) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'sumiu (ação anterior mudou a tela)' }); return; }
        if (bt.disabled) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'desligado (esperado: falta chave/dado)' }); return; }
        try {
          bt.click();
          await espera(60);
          for (let k = 0; k < 400 && (E.buscando || E.inventariando || E.conferindoIA); k++) await espera(100);
          await espera(40);
          relatorio.push({ aba: aba, acao: acao, arg: arg, status: erros.length > n0 ? 'ERRO: ' + erros.slice(n0).join(' | ') : 'ok' });
        } catch (e) { relatorio.push({ aba: aba, acao: acao, arg: arg, status: 'ERRO: ' + e.message }); }
      }

      try {
        E.proj = projetoDeTeste(); E.docs.length = 0;
        E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        const abas = Array.prototype.slice.call(document.querySelectorAll('.aba')).map(function (b) { return b.dataset.aba; });
        for (const aba of abas) {
          // projeto novo a cada aba: botões que apagam (ex.: excluir variável) não contaminam as abas seguintes
          E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
          document.querySelector('[data-acao=calcular]').click(); await espera(60);
          document.querySelector('[data-aba=avaliacao]').click(); await espera(30);
          const btProj = document.querySelector('[data-acao=projetar]'); if (btProj) { btProj.click(); await espera(60); }
          document.querySelector('[data-aba="' + aba + '"]').click(); await espera(60);
          if (document.querySelector('.aba.ativa').dataset.aba !== aba) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: a aba não abriu' });
          if (erros.length) relatorio.push({ aba: aba, acao: '(abrir aba)', status: 'ERRO: ' + erros.join(' | ') });
          const lista = Array.prototype.slice.call(document.querySelectorAll('#conteudo [data-acao], .topo [data-acao]'))
            .map(function (b) { return { acao: b.dataset.acao, arg: b.dataset.arg }; })
            .filter(function (x, i, a) { return PULAR.indexOf(x.acao) < 0 && a.findIndex(function (y) { return y.acao === x.acao && y.arg === x.arg; }) === i; })
            // botões repetidos (ex.: 200 "Usar" da busca): 3 de cada tipo bastam
            .filter(function (x, i, a) { return a.slice(0, i).filter(function (y) { return y.acao === x.acao; }).length < 3; });
          const ordem = lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) < 0; }).concat(lista.filter(function (x) { return DESTRUTIVOS.indexOf(x.acao) >= 0; }));
          for (const x of ordem) {
            if (document.querySelector('.aba.ativa') && document.querySelector('.aba.ativa').dataset.aba !== aba) { document.querySelector('[data-aba="' + aba + '"]').click(); await espera(40); }
            await clicar(aba, x.acao, x.arg);
          }
        }
        // 17 modelos × laudo (HTML) e 20 estilos × Word
        E.proj = projetoDeTeste(); E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(100);
        document.querySelector('[data-aba=avaliacao]').click(); document.querySelector('[data-acao=projetar]').click(); await espera(60);
        for (const M of INF.Modelos.MODELOS) {
          INF.Modelos.aplicar(E.proj, M.id);
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          const html = l.erro ? '' : INF.Laudo.html(l);
          relatorio.push({ aba: 'modelos', acao: 'laudo ' + M.id, status: l.erro ? 'ERRO: ' + l.erro : (html.length > 5000 ? 'ok (' + Math.round(html.length / 1024) + ' KB)' : 'ERRO: laudo vazio') });
        }
        INF.Modelos.aplicar(E.proj, 'jud_valor');
        for (let n = 1; n <= 20; n++) {
          E.proj.laudo.estilo = n;
          const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
          let st = 'ok';
          try { const z = INF.Laudo.docx(l, {}); if (!(z.length > 10000)) st = 'ERRO: Word pequeno demais'; } catch (e) { st = 'ERRO: ' + e.message; }
          relatorio.push({ aba: 'estilos', acao: 'Word estilo ' + n, status: st });
        }
      } catch (e) {
        relatorio.push({ aba: '(teste)', acao: '(interrompido)', status: 'ERRO: ' + e.message });
      } finally {
        // devolve tudo como estava
        INF.Dados.baixar = orig.baixar; INF.Dados.salvarLocal = orig.salvar; window.open = orig.open; window.confirm = orig.confirm; window.prompt = orig.prompt;
        document.body.appendChild = orig.append;
        window.removeEventListener('error', aoErro); window.removeEventListener('unhandledrejection', aoErro);
        E.proj = INF.Dados.normalizar(JSON.parse(guardado)); E.docs.length = 0;
        E.modelo = E.diag = E.projecao = E.rna = E.busca = E.conferencia = E.conferenciaIA = E.anuncio = E.importacao = null;
        E.aviso = null; E.aba = 'projeto'; INF.Tela.desenhar();
      }
      const falhas = relatorio.filter(function (r) { return /^ERRO/.test(r.status); });
      return { total: relatorio.length, ok: relatorio.filter(function (r) { return /^ok/.test(r.status); }).length, falhas: falhas, relatorio: relatorio,
        interceptados: { downloads: baixados.length, janelas: abertos.length, impressoes: impressos.length }, projetoDevolvido: E.proj.projeto.nome };
    },

    // mostra o resultado numa janela sobre a tela
    mostrar: function (r) {
      const d = document.createElement('div');
      d.className = 'teste-resultado';
      d.innerHTML = '<h2>Teste de botões: ' + r.ok + ' de ' + r.total + ' ok · ' + r.falhas.length + ' falha(s)</h2>'
        + '<p>Interceptados: ' + r.interceptados.downloads + ' downloads, ' + r.interceptados.janelas + ' janelas, ' + r.interceptados.impressoes + ' impressões. Projeto devolvido: ' + INF.U.esc(r.projetoDevolvido) + '.</p>'
        + '<table class="tabela"><thead><tr><th>Aba</th><th>Botão</th><th>Resultado</th></tr></thead><tbody>'
        + r.relatorio.map(function (x) { return '<tr class="' + (/^ERRO/.test(x.status) ? 'outlier' : '') + '"><td>' + INF.U.esc(x.aba) + '</td><td class="esq">' + INF.U.esc(x.acao + (x.arg ? ' (' + x.arg + ')' : '')) + '</td><td class="esq">' + INF.U.esc(x.status) + '</td></tr>'; }).join('')
        + '</tbody></table><button class="principal">Fechar</button>';
      d.querySelector('button').addEventListener('click', function () { d.remove(); });
      document.body.appendChild(d);
    }
  };

  // ?teste=botoes → roda sozinho ao abrir
  if (typeof location !== 'undefined' && /[?&]teste=botoes/.test(location.search)) {
    setTimeout(function () { INF.TesteBotoes.rodar().then(INF.TesteBotoes.mostrar); }, 1200);
  }
})(globalThis.INF = globalThis.INF || {});

/* ----------------------------------------------------------------------------
   PARTE 3 — LAYOUT DOS BOTÕES e EXECUÇÃO COMPLETA (painel do administrador)
   ---------------------------------------------------------------------------- */
(function (INF) {
  'use strict';

  const espera = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };

  // Confere, na aba aberta, o layout de cada botão e da página.
  function conferirLayout(aba) {
    const problemas = [];
    const larguraTela = document.documentElement.clientWidth;
    if (document.documentElement.scrollWidth > larguraTela + 2) problemas.push('a página rola para o lado (' + document.documentElement.scrollWidth + ' px > ' + larguraTela + ' px)');
    const botoes = Array.prototype.slice.call(document.querySelectorAll('.topo button, .topo .botao, #abas .aba, #conteudo button, #conteudo .botao'))
      .filter(function (b) { return b.offsetParent !== null; });
    botoes.forEach(function (b) {
      const r = b.getBoundingClientRect(), nome = (b.textContent || b.title || b.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      const rotulo = '"' + (nome || b.dataset.acao || '?').slice(0, 40) + '"';
      if (!nome) problemas.push('botão sem texto nem título: ' + (b.dataset.acao || b.outerHTML.slice(0, 60)));
      if (r.height < 22 || r.width < 22) problemas.push('botão pequeno demais para clicar ' + rotulo + ' (' + Math.round(r.width) + '×' + Math.round(r.height) + ')');
      if (b.scrollWidth > b.clientWidth + 3 && getComputedStyle(b).overflow !== 'visible') problemas.push('texto estourando o botão ' + rotulo);
      if (r.right > larguraTela + 2 && !b.closest('.rolagem') && !b.closest('#abas')) problemas.push('botão saindo da tela ' + rotulo);
    });
    // botões da mesma barra não podem se sobrepor
    Array.prototype.slice.call(document.querySelectorAll('.barra, .topo nav, .portais')).forEach(function (barra) {
      const bs = Array.prototype.slice.call(barra.children).filter(function (x) { return x.offsetParent !== null && /BUTTON|LABEL|SELECT|A/.test(x.tagName); }).map(function (x) { return { el: x, r: x.getBoundingClientRect() }; });
      for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) {
        const a = bs[i].r, c = bs[j].r;
        if (a.left < c.right - 2 && c.left < a.right - 2 && a.top < c.bottom - 2 && c.top < a.bottom - 2) {
          problemas.push('elementos sobrepostos: "' + (bs[i].el.textContent || '').trim().slice(0, 25) + '" e "' + (bs[j].el.textContent || '').trim().slice(0, 25) + '"');
        }
      }
    });
    return { aba: aba, botoes: botoes.length, problemas: problemas };
  }

  INF.TesteLayout = {
    rodar: async function () {
      const E = INF.Tela.estado, guardado = JSON.stringify(E.proj);
      const salvar = INF.Dados.salvarLocal; INF.Dados.salvarLocal = function () { return true; };
      const res = [];
      try {
        E.proj = INF.TesteFuncional.projetoSintetico(); E.aba = 'modelo'; INF.Tela.desenhar();
        document.querySelector('[data-acao=calcular]').click(); await espera(40);
        document.querySelector('[data-aba=avaliacao]').click(); await espera(20);
        const bp = document.querySelector('[data-acao=projetar]'); if (bp) { bp.click(); await espera(40); }
        for (const b of Array.prototype.slice.call(document.querySelectorAll('.aba'))) {
          const aba = b.dataset.aba;
          document.querySelector('[data-aba="' + aba + '"]').click(); await espera(40);
          res.push(conferirLayout(aba));
        }
        // quadro de dúvidas aberto também
        const bd = document.querySelector('[data-acao=abrirDuvidas]'); if (bd) { bd.click(); await espera(20); res.push(conferirLayout('quadro de dúvidas')); document.querySelector('[data-acao=fecharDuvidas]').click(); }
      } finally {
        INF.Dados.salvarLocal = salvar;
        E.proj = INF.Dados.normalizar(JSON.parse(guardado)); E.modelo = E.diag = E.projecao = null; E.aviso = null; E.aba = 'projeto'; INF.Tela.desenhar();
      }
      return { abas: res.length, ok: res.filter(function (r) { return !r.problemas.length; }).length, botoes: res.reduce(function (s, r) { return s + r.botoes; }, 0), resultados: res };
    }
  };

  // ---------------------------------------------------------------------------
  // TESTE COMPLETO — é o que o botão do painel do administrador chama
  // (abre /inferencia/?teste=completo). Roda as três partes em sequência,
  // mostra o relatório e devolve o resumo ao painel que abriu a janela.
  // ---------------------------------------------------------------------------
  INF.TesteCompleto = {
    rodar: async function () {
      const t0 = Date.now();
      const func = await INF.TesteFuncional.rodar();
      const lay = await INF.TesteLayout.rodar();
      const bot = await INF.TesteBotoes.rodar();
      const resumo = {
        app: 'COON Infer', versao: INF.VERSAO, quando: new Date().toISOString(), segundos: Math.round((Date.now() - t0) / 1000),
        funcionalidade: { casos: func.casos, ok: func.ok, verificacoes: func.verificacoes, falhas: func.resultados.filter(function (r) { return !r.ok; }).map(function (r) { return r.etapa + ' — ' + r.nome + ': ' + r.falhas.join('; '); }) },
        layout: { abas: lay.abas, ok: lay.ok, botoes: lay.botoes, falhas: lay.resultados.filter(function (r) { return r.problemas.length; }).map(function (r) { return r.aba + ': ' + r.problemas.join('; '); }) },
        botoes: { acoes: bot.total, ok: bot.ok, falhas: bot.falhas.map(function (f) { return f.aba + ' / ' + f.acao + ': ' + f.status; }) }
      };
      resumo.aprovado = !resumo.funcionalidade.falhas.length && !resumo.layout.falhas.length && !resumo.botoes.falhas.length;
      // veredito em uma frase: tudo funcionando, ou onde providenciar correção
      const onde = [];
      func.resultados.filter(function (x) { return !x.ok; }).forEach(function (x) { if (onde.indexOf(x.etapa) < 0) onde.push(x.etapa); });
      lay.resultados.filter(function (x) { return x.problemas.length; }).forEach(function (x) { const t = 'layout da aba ' + x.aba; if (onde.indexOf(t) < 0) onde.push(t); });
      bot.falhas.forEach(function (f) { const t = 'botões da aba ' + f.aba; if (onde.indexOf(t) < 0) onde.push(t); });
      resumo.onde = onde;
      resumo.mensagem = resumo.aprovado ? 'Tudo funcionando.' : 'Precisa de correção em: ' + onde.join('; ') + ' — providenciar.';
      return { resumo: resumo, funcional: func, layout: lay, botoes: bot };
    },
    mostrar: function (r) {
      const esc = INF.U.esc, s = r.resumo;
      const bloco = function (titulo, ok, total, falhas) {
        return '<h3>' + (falhas.length ? '<span class="sinal sinal-erro">✗</span> ' : '<span class="sinal sinal-ok">✓</span> ') + esc(titulo) + ': ' + ok + ' de ' + total + '</h3>'
          + (falhas.length ? '<ul class="achados">' + falhas.map(function (f) { return '<li class="erro">' + esc(f) + '</li>'; }).join('') + '</ul>' : '');
      };
      const d = document.createElement('div'); d.className = 'teste-resultado';
      d.innerHTML = '<h2>' + (s.aprovado ? '<span class="sinal sinal-ok">✓ APROVADO</span>' : '<span class="sinal sinal-erro">✗ COM FALHAS</span>') + ' — teste completo do COON Infer ' + esc(s.versao) + '</h2>'
        + '<div class="comece' + (s.aprovado ? ' ok' : '') + '" style="font-size:17px"><b>' + esc(s.mensagem) + '</b></div>'
        + '<p class="nota">' + new Date(s.quando).toLocaleString('pt-BR') + ' · ' + s.segundos + ' s · dados sintéticos · o projeto aberto foi guardado e devolvido.</p>'
        + bloco('Funcionalidade (casos por etapa)', s.funcionalidade.ok, s.funcionalidade.casos, s.funcionalidade.falhas)
        + bloco('Layout dos botões (abas conferidas)', s.layout.ok, s.layout.abas, s.layout.falhas)
        + bloco('Botões clicados sem erro', s.botoes.acoes - s.botoes.falhas.length, s.botoes.acoes, s.botoes.falhas)
        + (s.botoes.acoes - s.botoes.ok - s.botoes.falhas.length > 0 ? '<p class="nota">' + (s.botoes.acoes - s.botoes.ok - s.botoes.falhas.length) + ' botão(ões) não executaram por motivo esperado: desligados por falta de chave no servidor (IA, Google Maps, Supadata) ou que somem depois de outra ação (ex.: excluir). Não é falha.</p>' : '')
        + '<div class="barra"><button class="principal" data-fechar="1">Fechar</button><button class="leve" data-baixar="1">Baixar relatório (.json)</button></div>';
      d.querySelector('[data-fechar]').addEventListener('click', function () { d.remove(); });
      d.querySelector('[data-baixar]').addEventListener('click', function () {
        const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(r, null, 1)], { type: 'application/json' }));
        a.download = 'teste-coon-infer-' + s.quando.slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove();
      });
      document.body.appendChild(d);
    }
  };

  // ?teste=completo → roda sozinho e avisa o painel do administrador (mesma origem)
  if (typeof location !== 'undefined' && /[?&]teste=completo/.test(location.search)) {
    setTimeout(function () {
      INF.TesteCompleto.rodar().then(function (r) {
        INF.TesteCompleto.mostrar(r);
        try { if (window.opener) window.opener.postMessage({ tipo: 'coon-infer-teste', resumo: r.resumo }, location.origin); } catch (e) { /* painel fechado */ }
      });
    }, 1500);
  }
})(globalThis.INF = globalThis.INF || {});
