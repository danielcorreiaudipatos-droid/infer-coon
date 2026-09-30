/* =============================================================================
   web/js/interface.js — a tela
   -----------------------------------------------------------------------------
   Organização:
     E            → estado da tela (projeto aberto, modelo calculado etc.)
     ABAS         → uma função por aba que devolve o HTML dela
     AÇÕES        → o que cada botão faz (data-acao="nome" no HTML)
     vínculos     → campos com data-bind="caminho" gravam direto no projeto
   Um único ouvinte de clique e um de alteração atendem a tela toda
   ("delegação de eventos"). Nada de onclick no HTML: a política de
   segurança do servidor (CSP) proíbe script embutido, de propósito.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, T = INF.Transf, Rg = INF.Regressao, Dd = INF.Dados, N = INF.NBR, Gf = INF.Graficos, Nv = INF.Nuvem;
  const h = U.esc;

  // ---------------------------------------------------------------------------
  // Estado
  // ---------------------------------------------------------------------------
  const E = {
    proj: Dd.lerLocal() || Dd.novoProjeto(),
    id: null,                 // id do projeto na nuvem (null = ainda não salvo lá)
    aba: 'projeto',
    modelo: null, diag: null, projecao: null, rna: null,
    busca: null, buscando: false, progresso: 0,
    conferencia: null, conferenciaIA: null, conferindoIA: false,
    importacao: null, anuncio: null, mercado: null,
    aviso: null, sujo: false
  };
  try { E.id = localStorage.getItem('inferencia-nbr:id') || null; } catch (e) { /* navegador sem armazenamento */ }

  const ABAS_MENU = [
    ['projeto', 'Projeto'], ['variaveis', 'Variáveis'], ['amostras', 'Amostras'], ['pesquisa', 'Pesquisa de mercado'],
    ['modelo', 'Modelo (regressão)'], ['graficos', 'Gráficos'], ['busca', 'Busca de modelos'], ['rna', 'Rede neural'], ['avancado', 'Ferramentas avançadas'],
    ['avaliacao', 'Avaliação e NBR'], ['laudo', 'Laudo completo'], ['relatorio', 'Relatório']
  ];

  // Roteiros de variáveis por tipologia (só a estrutura; os dados são do avaliador).
  const ROTEIROS = {
    'Terreno': { dep: ['VU', 'R$/m²'], vars: [['Area', 'quantitativa', '-', 'Área do terreno (m²)'], ['Frente', 'quantitativa', '+', 'Testada (m)'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo valorizante (km)'], ['Topografia', 'qualitativa', '+', '1 = aclive/declive acentuado; 2 = leve; 3 = plano'], ['Infra', 'qualitativa', '+', '1 = sem; 2 = parcial; 3 = completa'], ['Meses', 'tempo', '-', 'Meses entre o evento e a data base']] },
    'Apartamento': { dep: ['VU', 'R$/m²'], vars: [['Area_priv', 'quantitativa', '-', 'Área privativa (m²)'], ['Vagas', 'quantitativa', '+', 'Vagas de garagem'], ['Andar', 'quantitativa', '+', 'Pavimento'], ['Padrao', 'qualitativa', '+', '1 = baixo; 2 = normal; 3 = alto'], ['Conservacao', 'qualitativa', '+', '1 = ruim; 2 = regular; 3 = bom'], ['Idade', 'quantitativa', '-', 'Idade aparente (anos)'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo (km)']] },
    'Casa': { dep: ['VU', 'R$/m²'], vars: [['Area_const', 'quantitativa', '-', 'Área construída (m²)'], ['Area_terr', 'quantitativa', '+', 'Área do terreno (m²)'], ['Padrao', 'qualitativa', '+', '1 = baixo; 2 = normal; 3 = alto'], ['Conservacao', 'qualitativa', '+', '1 = ruim; 2 = regular; 3 = bom'], ['Idade', 'quantitativa', '-', 'Idade aparente (anos)'], ['Vagas', 'quantitativa', '+', 'Vagas'], ['Dist_polo', 'quantitativa', '-', 'Distância ao polo (km)']] },
    'Sala/Loja': { dep: ['VU', 'R$/m²'], vars: [['Area', 'quantitativa', '-', 'Área (m²)'], ['Frente', 'quantitativa', '+', 'Frente (m)'], ['Andar', 'quantitativa', '-', 'Pavimento'], ['Fluxo', 'qualitativa', '+', '1 = baixo; 2 = médio; 3 = alto'], ['Vaga', 'dicotomica', '+', '0 = sem; 1 = com']] },
    'Galpão': { dep: ['VU', 'R$/m²'], vars: [['Area_const', 'quantitativa', '-', 'Área construída (m²)'], ['Pe_direito', 'quantitativa', '+', 'Pé-direito (m)'], ['Acesso', 'qualitativa', '+', '1 = local; 2 = avenida; 3 = rodovia'], ['Idade', 'quantitativa', '-', 'Idade (anos)']] },
    'Rural': { dep: ['VU_ha', 'R$/ha'], vars: [['Area_ha', 'quantitativa', '-', 'Área total (ha)'], ['Dist_sede', 'quantitativa', '-', 'Distância à sede do município (km)'], ['Topografia', 'qualitativa', '+', '1 = ondulado; 2 = suave-ondulado; 3 = plano'], ['Aptidao', 'qualitativa', '+', '1 = inapto; 2 = regular; 3 = apto; 4 = ótimo'], ['Acesso', 'qualitativa', '+', '1 = terra ruim; 2 = terra boa; 3 = cascalho; 4 = asfalto'], ['Benfeitoria', 'dicotomica', '+', '0 = sem; 1 = com']] }
  };

  // ---------------------------------------------------------------------------
  // Utilidades de tela
  // ---------------------------------------------------------------------------
  const numEntrada = function (v) { const n = U.lerNumero(v); return Number.isFinite(n) ? String(n).replace('.', ',') : ''; };
  const opcoes = function (lista, atual) {
    return lista.map(function (o) { const v = Array.isArray(o) ? o[0] : o, r = Array.isArray(o) ? o[1] : o; return '<option value="' + h(v) + '"' + (String(v) === String(atual) ? ' selected' : '') + '>' + h(r) + '</option>'; }).join('');
  };
  const campo = function (rotulo, controle, dica) {
    return '<label class="campo"><span>' + h(rotulo) + '</span>' + controle + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>';
  };
  const campo_ = function (r, c, d) { return campo(r, c, d); };
  const entrada = function (bind, valor, extra) {
    return '<input data-bind="' + bind + '" value="' + h(valor === null || valor === undefined ? '' : valor) + '"' + (extra || '') + '>';
  };
  const selo = function (grau) {
    return '<span class="selo g' + grau + '">Grau ' + N.romano(grau) + '</span>';
  };
  const semaforo = function (sig) {
    const c = sig <= 0.10 ? 'ok' : sig <= 0.20 ? 'atencao' : sig <= 0.30 ? 'fraco' : 'ruim';
    return '<span class="sig ' + c + '">' + U.fmtPct(sig) + '</span>';
  };
  function avisar(texto, tipo) { E.aviso = { texto: texto, tipo: tipo || 'info' }; desenhar(); }

  // Caminho "projeto.nome" → objeto e chave.
  function resolver(caminho) {
    const partes = caminho.split('.');
    let obj = E.proj;
    for (let i = 0; i < partes.length - 1; i++) { if (obj[partes[i]] === undefined || obj[partes[i]] === null) obj[partes[i]] = {}; obj = obj[partes[i]]; }
    return { obj: obj, chave: partes[partes.length - 1] };
  }

  // Tudo que muda os dados invalida o cálculo anterior.
  function mudou(invalidarModelo) {
    E.sujo = true;
    if (invalidarModelo) { E.modelo = null; E.diag = null; E.projecao = null; }
    Dd.salvarLocal(E.proj);
    atualizarTopo();
  }

  // ---------------------------------------------------------------------------
  // ABAS
  // ---------------------------------------------------------------------------
  const ABAS = {};

  // ---- Projeto -----------------------------------------------------------------
  ABAS.projeto = function () {
    const p = E.proj.projeto, c = E.proj.config;
    // campo obrigatório: rótulo com asterisco e sinal verde (preenchido) ou vermelho (falta)
    const obrig = function (rotulo, controle, valor, dica) {
      const ok = valor !== null && valor !== undefined && String(valor).trim() !== '';
      return '<label class="campo obrigatorio"><span>' + h(rotulo) + ' <b class="req">*</b></span>' + controle
        + '<span class="sinal ' + (ok ? 'sinal-ok' : 'sinal-erro') + '">' + (ok ? '✓ preenchido' : '✗ obrigatório') + '</span>' + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>';
    };
    const sitP = INF.Etapas.situacao(E.proj, E).projeto;
    let s = sitP.completa
      ? '<div class="comece ok">✓ Aba 1 completa. As outras abas estão liberadas: pode lançar os dados em qualquer ordem. Os cálculos só rodam quando os dados necessários estiverem completos.</div>'
      : '<div class="comece">✗ <b>Comece aqui.</b> Preencha os campos com * desta aba para liberar as outras. Falta: ' + h(sitP.faltas.join(', ')) + '.</div>';
    s += '<section class="cartao"><h2>Identificação do trabalho</h2><div class="grade">';
    s += obrig('Responsável técnico', entrada('projeto.autor', p.autor), p.autor);
    s += obrig('Código do trabalho', entrada('projeto.codigo', p.codigo, ' placeholder="Ex.: 2026-045"'), p.codigo, 'Seu código interno do laudo/processo.');
    s += obrig('Imóvel', entrada('projeto.imovel', p.imovel, ' placeholder="Ex.: Fazenda Santa Rita, matrícula 12.345"'), p.imovel, 'Identificação do imóvel avaliado.');
    s += campo('Nome do trabalho', entrada('projeto.nome', p.nome, ' placeholder="Ex.: Fazenda Santa Rita — gleba 2"'));
    s += campo('Tipologia', '<select data-bind="projeto.tipologia">' + opcoes(['Terreno', 'Apartamento', 'Casa', 'Sala/Loja', 'Galpão', 'Rural', 'Gleba urbanizável', 'Outro'], p.tipologia) + '</select>');
    s += obrig('Município / UF', entrada('projeto.municipio', p.municipio, ' placeholder="Ex.: Patos de Minas/MG"'), p.municipio);
    s += obrig('Data base', '<input type="date" data-bind="projeto.dataBase" value="' + h(p.dataBase) + '">', p.dataBase);
    s += campo('Finalidade', entrada('projeto.finalidade', p.finalidade, ' placeholder="Ex.: garantia, perícia judicial, servidão"'));
    s += '</div><label class="campo largo2 obrigatorio"><span>Observação <b class="req">*</b></span><textarea rows="3" data-bind="projeto.observacao" placeholder="Contexto do trabalho, pedido do cliente, particularidades do imóvel">' + h(p.observacao || '') + '</textarea>'
      + '<span class="sinal ' + (String(p.observacao || '').trim() ? 'sinal-ok">✓ preenchido' : 'sinal-erro">✗ obrigatório') + '</span></label>';
    s += '<div class="barra"><button data-acao="roteiro">Montar variáveis sugeridas para a tipologia</button>'
      + '<small>Cria só a estrutura das variáveis (nomes, tipos, direção). Não cria dado.</small></div></section>';

    s += '<section class="cartao"><h2>Critérios do cálculo</h2><div class="grade">';
    s += campo('Fator de oferta', '<input data-bind="config.fatorOferta" data-num value="' + numEntrada(c.fatorOferta) + '">', 'Aplicado só às amostras de oferta.');
    s += campo('Aplicar fator de oferta', '<select data-bind="config.aplicarFatorOferta" data-bool>' + opcoes([['true', 'Sim'], ['false', 'Não']], String(c.aplicarFatorOferta)) + '</select>');
    s += campo('Nível do intervalo de confiança', '<select data-bind="config.nivelIC" data-num>' + opcoes([['0.8', '80% (NBR)'], ['0.9', '90%'], ['0.95', '95%']], String(c.nivelIC)) + '</select>');
    s += campo('Estimativa quando y está em ln', '<select data-bind="config.estimativaLn">' + opcoes([['mediana', 'Mediana — exp(ŷ)'], ['media', 'Média — exp(ŷ + s²/2)'], ['moda', 'Moda — exp(ŷ − s²)']], c.estimativaLn) + '</select>');
    s += campo('Constante entra no item 5', '<select data-bind="config.considerarIntercepto" data-bool>' + opcoes([['true', 'Sim (mais conservador)'], ['false', 'Não']], String(c.considerarIntercepto)) + '</select>');
    s += campo('Item 1 — caracterização do avaliando', '<select data-bind="config.item1" data-num>' + opcoes([[3, 'III — ' + N.NORMA.textoItem1[3]], [2, 'II — ' + N.NORMA.textoItem1[2]], [1, 'I — ' + N.NORMA.textoItem1[1]]], c.item1) + '</select>');
    s += campo('Item 3 — identificação dos dados', '<select data-bind="config.item3" data-num>' + opcoes([[3, 'III — com foto e características observadas'], [2, 'II — todas as características'], [1, 'I — só as variáveis do modelo']], c.item3) + '</select>');
    s += campo('Semente (RNA e busca)', '<input data-bind="config.semente" data-num value="' + h(c.semente) + '">', 'Mesma semente = mesmo resultado.');
    s += '</div></section>';

    const ant = Dd.lerAnterior();
    if (ant && ant.projeto.nome !== E.proj.projeto.nome) {
      s += '<section class="cartao"><h2>Projeto anterior deste navegador</h2><p class="nota">"' + h(ant.projeto.nome || '(sem nome)') + '", com ' + ant.amostras.length + ' amostra(s), foi substituído neste navegador.</p><div class="barra"><button data-acao="recuperarAnterior">Recuperar esse projeto</button></div></section>';
    }
    s += '<section class="cartao"><h2>Polo valorizante</h2><p class="nota">Ponto de referência para a variável de distância (centro, sede do município, via principal).</p><div class="grade">';
    s += campo('Nome do polo', entrada('config.polo.nome', c.polo.nome));
    s += campo('Latitude', '<input data-bind="config.polo.lat" data-num value="' + numEntrada(c.polo.lat) + '" placeholder="-18,5789">');
    s += campo('Longitude', '<input data-bind="config.polo.lon" data-num value="' + numEntrada(c.polo.lon) + '" placeholder="-46,5178">');
    s += '</div></section>';
    return s;
  };

  // ---- Variáveis -----------------------------------------------------------------
  ABAS.variaveis = function () {
    let s = '<section class="cartao"><h2>Variáveis</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Nome</th><th>Tipo</th><th>Unidade</th><th>Direção esperada</th><th>Escalas testadas na busca</th><th>Códigos / descrição</th><th></th></tr></thead><tbody>';
    E.proj.variaveis.forEach(function (v) {
      const perm = v.permitidas && v.permitidas.length ? v.permitidas : T.permitidasPorTipo(v.tipo);
      const escalas = v.tipo === 'identificacao' ? '—' : T.LISTA.map(function (t) {
        return '<label class="chk"><input type="checkbox" data-var="' + h(v.nome) + '" data-escala="' + t.id + '"' + (perm.indexOf(t.id) >= 0 ? ' checked' : '') + '>' + t.rotulo + '</label>';
      }).join('');
      const codigos = Object.keys(v.codigos || {}).map(function (c) { return c + '=' + v.codigos[c]; }).join('; ');
      s += '<tr><td><b>' + h(v.nome) + '</b></td>'
        + '<td><select data-var="' + h(v.nome) + '" data-chave="tipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), v.tipo) + '</select></td>'
        + '<td><input class="curto" data-var="' + h(v.nome) + '" data-chave="unidade" value="' + h(v.unidade) + '"></td>'
        + '<td><select data-var="' + h(v.nome) + '" data-chave="direcao">' + opcoes([['', '—'], ['+', '↑ aumenta o valor'], ['-', '↓ diminui o valor']], v.direcao) + '</select></td>'
        + '<td class="escalas">' + escalas + '</td>'
        + '<td><input data-var="' + h(v.nome) + '" data-chave="codigos" value="' + h(codigos) + '" placeholder="1=Plano; 2=Aclive"><input data-var="' + h(v.nome) + '" data-chave="descricao" value="' + h(v.descricao) + '" placeholder="descrição"></td>'
        + '<td class="acoes"><button class="leve" data-acao="renomear" data-arg="' + h(v.nome) + '">Renomear</button><button class="leve perigo" data-acao="excluirVar" data-arg="' + h(v.nome) + '">Excluir</button></td></tr>';
    });
    s += '</tbody></table></div>';
    s += '<div class="barra"><input id="novaVarNome" placeholder="Nome (sem espaço)"><select id="novaVarTipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), 'quantitativa') + '</select><button data-acao="incluirVar">Incluir variável</button></div></section>';

    s += '<section class="cartao"><h2>Operar variáveis</h2><p class="nota">Cria uma coluna a partir de outras. Ex.: <code>VU = VT / Area</code>, <code>Idade = 2026 - Ano</code>, <code>Asfalto = Acesso >= 4</code>. Funções: ln, log, exp, raiz, abs, min, max.</p>';
    s += '<div class="barra"><input id="opNome" placeholder="Nova variável"><select id="opTipo">' + opcoes(Dd.TIPOS.map(function (t) { return [t.id, t.rotulo]; }), 'quantitativa') + '</select><input id="opFormula" class="largo" placeholder="Fórmula"><button data-acao="operar">Calcular coluna</button></div></section>';

    const tempos = E.proj.variaveis.filter(function (v) { return v.tipo === 'tempo'; });
    const quants = E.proj.variaveis.filter(function (v) { return v.tipo === 'quantitativa' || v.tipo === 'proxy'; });
    s += '<section class="cartao"><h2>Preenchimento automático</h2><div class="barra">';
    s += '<select id="varTempo">' + opcoes(tempos.map(function (v) { return v.nome; }), '') + '</select><button data-acao="tempo"' + (tempos.length ? '' : ' disabled') + '>Meses desde o evento (pela data de cada amostra)</button></div>';
    s += '<div class="barra"><select id="varDist">' + opcoes(quants.map(function (v) { return v.nome; }), '') + '</select><button data-acao="distancia"' + (quants.length ? '' : ' disabled') + '>Distância ao polo (km, pelas coordenadas)</button></div></section>';
    return s;
  };

  // ---- Amostras ------------------------------------------------------------------
  ABAS.amostras = function () {
    const p = E.proj;
    const vars = p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    const outl = new Set(E.diag ? E.diag.outliers : []);
    const achadosPorAmostra = {};
    (E.conferencia || []).concat((E.conferenciaIA && E.conferenciaIA.apontamentos) || []).forEach(function (a) { if (a.amostra) achadosPorAmostra[a.amostra] = (achadosPorAmostra[a.amostra] || 0) + 1; });

    // origem dos dados (modelo híbrido)
    const origem = p.config.origemDados || 'meus';
    let s = '<section class="cartao"><h2>Origem dos dados</h2><div class="radios">';
    [['meus', 'Só as minhas amostras', 'O que você lançou ou importou neste projeto.'],
      ['sistema', 'Só dados do sistema', 'Banco de mercado: suas pesquisas anteriores e as compartilhadas na COON.'],
      ['hibrido', 'Híbrido', 'As suas + as do banco, sem repetir.']].forEach(function (o) {
      s += '<label class="radio' + (origem === o[0] ? ' ativo' : '') + '"><input type="radio" name="origem" value="' + o[0] + '"' + (origem === o[0] ? ' checked' : '') + ' data-acao-mudar="origem"><b>' + o[1] + '</b><small>' + o[2] + '</small></label>';
    });
    s += '</div><div class="barra"><label class="chk"><input type="checkbox" id="incluirCompart" checked> incluir amostras compartilhadas por outros engenheiros</label>'
      + '<button data-acao="buscarBanco"' + (Nv.logado() ? '' : ' disabled') + '>Aplicar origem escolhida</button>'
      + '<button class="leve" data-acao="enviarBanco"' + (Nv.logado() ? '' : ' disabled') + '>Guardar minhas amostras no banco</button>'
      + '<label class="chk"><input type="checkbox" id="compartilhar"> compartilhar com a COON (sem informante e telefone)</label></div>'
      + (Nv.logado() ? '' : '<p class="nota">Entre no COON para usar o banco de mercado.</p>') + '</section>';

    // conferência
    s += '<section class="cartao"><h2>Conferência antes de calcular</h2><div class="barra">'
      + '<button data-acao="conferir">Conferir pelas regras</button>'
      + '<button class="leve" data-acao="semContato">Tirar do cálculo ofertas sem fonte e telefone/link</button>'
      + '<button data-acao="conferirIA"' + (Nv.sessao && Nv.sessao.conferenciaIA ? '' : ' disabled') + '>' + (E.conferindoIA ? 'Conferindo…' : 'Conferir com IA') + '</button>'
      + '<small>A IA aponta e sugere correções; nada muda sem a sua autorização.</small></div>';
    if (E.conferencia) {
      s += E.conferencia.length ? '<ul class="achados">' + E.conferencia.map(function (a) {
        return '<li class="' + a.nivel + '"><b>' + (a.amostra ? 'Amostra ' + a.amostra : 'Geral') + '</b> — ' + h(a.texto) + '</li>';
      }).join('') + '</ul>' : '<p class="ok">Nenhum problema pelas regras.</p>';
    }
    if (E.conferenciaIA) {
      const aps = E.conferenciaIA.apontamentos;
      s += '<h3>Apontamentos da IA</h3>' + (aps.length ? '<ul class="achados">' + aps.map(function (a, i) {
        let corr = '';
        if (a.correcao && !a.aplicada) {
          const c = a.correcao;
          const oque = c.acao === 'desligar' ? 'tirar a amostra do cálculo'
            : c.acao === 'escala' ? 'escala de ' + h(c.campo) + ': ' + h(E.proj.modelo.transf[c.campo] || 'x') + ' → ' + h(c.para)
            : h(c.campo) + ': ' + h(c.de === null ? 'vazio' : c.de) + ' → <b>' + h(c.para) + '</b>';
          corr = '<div class="correcao"><label class="chk"><input type="checkbox" data-sugestao="' + i + '"> Sugestão: ' + oque + '</label>'
            + (c.evidencia ? '<small>Evidência: ' + h(c.evidencia) + '</small>' : '') + '</div>';
        } else if (a.aplicada) corr = '<div class="correcao feita">Correção aplicada.</div>';
        return '<li class="' + (a.gravidade === 'alta' ? 'erro' : a.gravidade === 'media' ? 'alerta' : 'info') + '"><b>' + (a.amostra ? 'Amostra ' + a.amostra : 'Geral') + ' · ' + h(a.assunto) + '</b> — ' + h(a.texto) + corr + '</li>';
      }).join('') + '</ul>' : '<p class="ok">Nenhum apontamento.</p>');
      if (aps.some(function (a) { return a.correcao && !a.aplicada; })) {
        s += '<div class="barra"><button class="principal" data-acao="aplicarSugestoes">Aplicar as sugestões marcadas</button><small>Só as marcadas. Cada uma fica no histórico e pode ser desfeita.</small></div>';
      }
      if (E.conferenciaIA.parecer) s += '<p class="nota">' + h(E.conferenciaIA.parecer) + '</p>';
      s += '<p class="nota">Consumo: ' + E.conferenciaIA.consumo.entrada + ' tokens de entrada, ' + E.conferenciaIA.consumo.saida + ' de saída (' + h(E.conferenciaIA.modelo) + ').</p>';
    }
    s += '</section>';

    // histórico de correções autorizadas
    const hist = (p.historico || []);
    if (hist.length) {
      s += '<section class="cartao"><h2>Histórico de correções</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Quando</th><th>Amostra</th><th>Alteração</th><th>Evidência</th><th></th></tr></thead><tbody>'
        + hist.map(function (r, i) {
          const alt = r.acao === 'desligar' ? 'retirada do cálculo' : (r.acao === 'escala' ? 'escala de ' : '') + h(r.campo) + ': ' + h(r.de) + ' → ' + h(r.para);
          return '<tr class="' + (r.desfeito ? 'desligada' : '') + '"><td>' + new Date(r.quando).toLocaleString('pt-BR') + '</td><td>' + (r.amostra || '—') + '</td><td class="esq">' + alt + '</td><td class="esq">' + h(r.evidencia) + '</td>'
            + '<td>' + (r.desfeito ? 'desfeita' : '<button class="leve" data-acao="desfazer" data-arg="' + i + '">Desfazer</button>') + '</td></tr>';
        }).join('') + '</tbody></table></div></section>';
    }

    // importação em andamento
    if (E.importacao) s += painelImportacao();

    // estatística descritiva das amostras no cálculo
    s += '<section class="cartao"><h2>Estatística das amostras</h2>' + tabelaDescritiva(INF.Diag.descritivaProjeto(p)) + '</section>';

    // grade de amostras
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; }).length;
    s += '<section class="cartao"><h2>Amostras <small>' + p.amostras.length + ' lançadas · ' + ativas + ' no cálculo</small></h2><div class="barra">'
      + '<button data-acao="novaAmostra" data-arg="1">+ Amostra</button><button class="leve" data-acao="novaAmostra" data-arg="5">+ 5 linhas</button>'
      + '<label class="botao leve">Importar planilha (CSV)<input type="file" id="arqCSV" accept=".csv,.txt" hidden></label>'
      + '<button class="leve" data-acao="exportarCSV">Exportar CSV</button><button class="leve" data-acao="reconsiderar">Reconsiderar todas</button></div>';
    s += '<div class="rolagem"><table class="tabela grade-amostras"><thead><tr><th title="Entra no cálculo">✓</th><th>Nº</th><th>Natureza</th><th>Data</th>'
      + vars.map(function (v) { return '<th>' + h(v.nome) + (v.unidade ? '<small>' + h(v.unidade) + '</small>' : '') + '</th>'; }).join('')
      + '<th>Endereço</th><th>Bairro</th><th>Informante</th><th>Telefone</th><th>Link</th><th>Print</th><th>Lat</th><th>Lon</th><th>Observação</th><th></th></tr></thead><tbody>';
    p.amostras.forEach(function (a) {
      const cls = [a.habilitada === false ? 'desligada' : '', outl.has(a.id) ? 'outlier' : '', a.origem === 'banco' ? 'banco' : ''].join(' ');
      const id = a.id;
      const cel = function (chave, valor, num, larg) {
        return '<td><input class="' + (larg || '') + '" data-amostra="' + id + '" data-chave="' + chave + '"' + (num ? ' data-num inputmode="decimal"' : '') + ' value="' + h(num ? numEntrada(valor) : valor) + '"></td>';
      };
      s += '<tr class="' + cls + '"><td><input type="checkbox" data-amostra="' + id + '" data-chave="habilitada"' + (a.habilitada !== false ? ' checked' : '') + '></td>'
        + '<td>' + id + (achadosPorAmostra[id] ? ' <span class="sinal" title="Tem apontamento na conferência">!</span>' : '') + '</td>'
        + '<td><select data-amostra="' + id + '" data-chave="natureza">' + opcoes([['oferta', 'Oferta'], ['transacao', 'Transação']], a.natureza) + '</select></td>'
        + '<td><input type="date" data-amostra="' + id + '" data-chave="data" value="' + h(a.data) + '"></td>'
        + vars.map(function (v) { return cel('valores.' + v.nome, a.valores[v.nome], true, 'num'); }).join('')
        + cel('endereco', a.endereco, false, 'medio') + cel('bairro', a.bairro) + cel('informante', a.informante, false, 'medio') + cel('telefone', a.telefone)
        + cel('link', a.link, false, 'medio')
        + '<td><label class="botao leve mini" title="Anexar o print do anúncio">' + ((p.fotos || []).filter(function (f) { return f.alvo === 'print:' + id; }).length || '+') + '<input type="file" accept="image/*" data-print-amostra="' + id + '" hidden></label></td>'
        + cel('lat', a.lat, true, 'num') + cel('lon', a.lon, true, 'num') + cel('obs', a.obs, false, 'medio')
        + '<td><button class="leve perigo" data-acao="excluirAmostra" data-arg="' + id + '" title="Excluir">×</button></td></tr>';
    });
    s += '</tbody></table></div><p class="nota">Linha vermelha = outlier no último cálculo (resíduo acima de 2 desvios). Linha azul = veio do banco de mercado. Desmarcar ✓ tira do cálculo sem apagar.</p></section>';
    return s;
  };

  function painelImportacao() {
    const im = E.importacao;
    const destinos = [['ignorar', '(ignorar)']]
      .concat(['endereco', 'bairro', 'informante', 'telefone', 'link', 'data', 'natureza', 'lat', 'lon', 'obs'].map(function (c) { return ['campo:' + c, 'campo: ' + c]; }))
      .concat(E.proj.variaveis.map(function (v) { return ['variavel:' + v.nome, 'variável: ' + v.nome]; }))
      .concat([['nova', '+ nova variável quantitativa']]);
    let s = '<section class="cartao destaque"><h2>Importar ' + im.linhas.length + ' linha(s)</h2><p class="nota">Confira para onde vai cada coluna da planilha.</p><div class="rolagem"><table class="tabela"><thead><tr><th>Coluna da planilha</th><th>Exemplo</th><th>Vai para</th></tr></thead><tbody>';
    im.cab.forEach(function (c, i) {
      const m = im.mapa[i];
      const atual = m.destino === 'ignorar' ? 'ignorar' : m.destino === 'nova' ? 'nova' : m.destino + ':' + m.nome;
      s += '<tr><td>' + h(c) + '</td><td>' + h((im.linhas[0] || [])[i] || '') + '</td><td><select data-mapa="' + i + '">' + opcoes(destinos, atual) + '</select></td></tr>';
    });
    return s + '</tbody></table></div><div class="barra"><button data-acao="confirmarImportacao">Importar</button><button class="leve" data-acao="cancelarImportacao">Cancelar</button></div></section>';
  }

  // ---- Pesquisa de mercado -----------------------------------------------------------
  ABAS.pesquisa = function () {
    const p = E.proj.projeto;
    const pm = INF.Pesquisa;
    let s = '<section class="cartao"><h2>Buscar ofertas nos portais</h2><div class="grade">';
    s += campo('Tipo de imóvel', '<input id="pqTipo" value="' + h(p.tipologia === 'Rural' ? 'fazenda' : p.tipologia.toLowerCase()) + '">');
    s += campo('Finalidade', '<select id="pqFin">' + opcoes(['venda', 'aluguel'], 'venda') + '</select>');
    s += campo('Município', '<input id="pqMun" value="' + h(p.municipio) + '">');
    s += '</div><div class="portais">' + pm.PORTAIS.map(function (po, i) {
      return '<button class="leve" data-acao="abrirPortal" data-arg="' + i + '">' + h(po.nome) + '<small>' + h(po.uso) + '</small></button>';
    }).join('') + '</div><p class="nota">Abre a busca em outra aba. A captura automática em massa não é feita: os portais proíbem e amostra de laudo precisa de conferência.</p></section>';

    s += '<section class="cartao"><h2>Trazer um anúncio</h2><div class="grade">';
    s += campo('Link do anúncio', '<input id="anLink" class="largo" placeholder="https://...">');
    s += '</div><div class="barra"><button data-acao="lerLink"' + (Nv.sessao && Nv.sessao.leituraLink ? '' : ' disabled') + '>Ler pelo link</button><small>Leitura automática da página (Supadata), um anúncio por vez.</small></div>';
    s += campo('Ou cole aqui o texto do anúncio (Ctrl+A, Ctrl+C na página)', '<textarea id="anTexto" rows="5"></textarea>');
    s += '<div class="barra"><button data-acao="extrair">Extrair dados do texto</button></div>';
    if (E.anuncio) s += painelAnuncio();
    s += '</section>';

    s += '<section class="cartao"><h2>Fontes de transações</h2><ul class="lista">' + pm.FONTES_TRANSACAO.map(function (f) {
      return '<li><b>' + h(f.nome) + '</b> — ' + h(f.obs) + '</li>';
    }).join('') + '</ul><p class="nota">Transações entram pela aba Amostras → Importar planilha, com a coluna "natureza" = transação (sem fator de oferta).</p></section>';
    return s;
  };

  function painelAnuncio() {
    const a = E.anuncio;
    const vars = E.proj.variaveis;
    const dep = Rg.dependente(E.proj);
    const areas = vars.filter(function (v) { return v.tipo === 'quantitativa'; });
    let s = '<div class="cartao destaque"><h3>Dados encontrados — confira antes de gravar</h3>';
    if (a.avisos && a.avisos.length) s += '<ul class="achados">' + a.avisos.map(function (t) { return '<li class="alerta">' + h(t) + '</li>'; }).join('') + '</ul>';
    s += '<div class="grade">';
    s += campo('Preço (R$)', '<input id="anPreco" value="' + numEntrada(a.preco) + '">');
    s += campo('Área', '<input id="anArea" value="' + numEntrada(a.area) + '">', a.unidadeArea ? 'unidade encontrada: ' + a.unidadeArea : '');
    s += campo('Valor unitário', '<output>' + (Number.isFinite(a.vu) ? U.fmt(a.vu, 2) : '—') + '</output>');
    s += campo('Natureza', '<select id="anNat">' + opcoes([['oferta', 'Oferta'], ['transacao', 'Transação']], 'oferta') + '</select>');
    s += campo('Informante', '<input id="anInf" value="' + h(a.informante || '') + '">');
    s += campo('Telefone', '<input id="anTel" value="' + h(a.telefone) + '">');
    s += campo('Data do anúncio', '<input type="date" id="anData" value="' + new Date().toISOString().slice(0, 10) + '">');
    s += campo('Endereço / referência', '<input id="anEnd" value="' + h(a.titulo || '') + '">');
    s += campo('Área vai para a variável', '<select id="anVarArea">' + opcoes([['', '(nenhuma)']].concat(areas.map(function (v) { return v.nome; })), (areas.find(function (v) { return /area/i.test(v.nome); }) || {}).nome || '') + '</select>');
    s += campo(dep ? dep.nome + ' recebe' : 'Dependente', '<select id="anModoDep">' + opcoes([['vu', 'Preço ÷ área (valor unitário)'], ['total', 'Preço total']], /^(vt|valor)/i.test(dep ? dep.nome : '') ? 'total' : 'vu') + '</select>');
    s += '</div><div class="print-colar" tabindex="0" id="areaPrint">' + (E.anuncioPrint ? '<img src="' + E.anuncioPrint.dataUrl + '" alt="print do anúncio"><small>Print pronto: vai para a ficha da amostra.</small>'
      : '<b>Print do anúncio:</b> clique aqui e cole (Ctrl+V), ou <label class="botao leve mini">escolha o arquivo<input type="file" accept="image/*" id="arqPrintAnuncio" hidden></label>') + '</div>';
    s += '<div class="barra"><button data-acao="gravarAnuncio">Adicionar como amostra</button><label class="chk"><input type="checkbox" id="anBanco"' + (Nv.logado() ? ' checked' : ' disabled') + '> guardar também no banco de mercado</label></div></div>';
    return s;
  }

  // ---- Modelo (regressão) ----------------------------------------------------------------
  ABAS.modelo = function () {
    const p = E.proj;
    const vars = p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    let s = '<section class="cartao"><h2>Escalas do modelo</h2><div class="escolha-escalas">';
    vars.forEach(function (v) {
      const perm = (v.permitidas && v.permitidas.length ? v.permitidas : T.permitidasPorTipo(v.tipo));
      const lista = perm.map(function (id) { return [id, T.porId[id].rotulo]; });
      if (v.tipo !== 'dependente') lista.push(['fora', '(fora do modelo)']);
      s += campo(v.nome + (v.tipo === 'dependente' ? ' (y)' : ''), '<select data-bind="modelo.transf.' + v.nome + '">' + opcoes(lista, p.modelo.transf[v.nome] || 'x') + '</select>');
    });
    s += '</div><div class="barra"><button class="principal" data-acao="calcularTudo"' + (E.buscando ? ' disabled' : '') + '>' + (E.buscando ? 'Calculando…' : 'Calcular tudo (automático)') + '</button>'
      + '<button data-acao="calcular">Calcular só estas escalas</button>'
      + (E.buscando ? '<progress max="1" value="0"></progress>' : '<small>Automático: confere, testa todas as combinações, escolhe a melhor dentro da norma e calcula.</small>') + '</div></section>';
    if (E.resumoAuto) s += '<section class="cartao destaque"><h2>Cálculo automático</h2><ul class="lista">' + E.resumoAuto.map(function (t) { return '<li>' + h(t) + '</li>'; }).join('') + '</ul></section>';

    const m = E.modelo;
    if (!m) return s + '<p class="vazio">Escolha as escalas e clique em Calcular.</p>';
    if (m.erro) return s + '<p class="erro-caixa">' + h(m.erro) + '</p>';
    const d = E.diag;

    // quadro-resumo
    s += '<section class="cartao"><h2>Resultado</h2><div class="indicadores">'
      + ind('Dados usados', m.n) + ind('Variáveis (k)', m.p - 1) + ind('Correlação (r)', U.fmt(m.r, 4)) + ind('R²', U.fmt(m.R2, 4))
      + ind('R² ajustado', U.fmt(m.R2aj, 4)) + ind('F calculado', U.fmt(m.F, 2)) + ind('Sig do modelo', U.fmtPct(m.sigF, 4))
      + ind('Erro padrão', U.fmtAuto(m.s)) + ind('R² de previsão', U.fmt(d.prev.R2previsao, 4)) + ind('Durbin-Watson', U.fmt(d.dw, 3))
      + ind('Outliers', d.outliers.length ? d.outliers.join(', ') : 'nenhum') + ind('Cook > 1', d.influentes.length ? d.influentes.join(', ') : 'nenhum')
      + '</div><div class="equacao">' + h(m.equacao) + '</div><div class="nota">' + h(Rg.equacaoExplicita(m)) + '</div></section>';

    // enquadramento na NBR (definitivo se já houve projeção)
    const fundM = E.projecao && !E.projecao.erro ? E.projecao.fundamentacao : N.fundamentacaoPreliminar(m, p.config);
    s += '<section class="cartao"><h2>Enquadramento NBR 14.653-2</h2>' + quadroGraus(fundM, E.projecao && !E.projecao.erro ? E.projecao.grauPrecisao : null, E.projecao ? E.projecao.amplitude : NaN) + '</section>';
    s += '<section class="cartao"><h2>Estatística das amostras usadas</h2>' + tabelaDescritiva(INF.Diag.descritivaProjeto(p)) + '</section>';

    // tabela de regressores
    s += '<section class="cartao"><h2>Regressores</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Variável</th><th>Escala</th><th>Coeficiente</th><th>t calculado</th><th>Sig</th><th>Elasticidade</th><th>VIF</th><th>Mínimo</th><th>Média</th><th>Máximo</th></tr></thead><tbody>';
    s += '<tr><td>Constante</td><td>—</td><td>' + U.fmtAuto(m.b[0]) + '</td><td>' + U.fmt(m.t[0], 3) + '</td><td>' + semaforo(m.sig[0]) + '</td><td>—</td><td>—</td><td></td><td></td><td></td></tr>';
    m.indep.forEach(function (v, j) {
      s += '<tr><td>' + h(v.nome) + '</td><td>' + T.porId[v.transf].rotulo + '</td><td>' + U.fmtAuto(m.b[j + 1]) + '</td><td>' + U.fmt(m.t[j + 1], 3) + '</td><td>' + semaforo(m.sig[j + 1]) + '</td>'
        + '<td>' + U.fmt(m.elasticidade[j].elasticidade, 2) + '%</td><td>' + U.fmt(d.vif[j].vif, 2) + '</td>'
        + '<td>' + U.fmtAuto(m.faixa[j].min) + '</td><td>' + U.fmtAuto(m.faixa[j].media) + '</td><td>' + U.fmtAuto(m.faixa[j].max) + '</td></tr>';
    });
    s += '<tr><td><b>' + h(m.dep.nome) + '</b> (y)</td><td>' + T.porId[m.dep.transf].rotulo + '</td><td colspan="5"></td><td>' + U.fmtAuto(m.faixaY.min) + '</td><td>' + U.fmtAuto(m.faixaY.media) + '</td><td>' + U.fmtAuto(m.faixaY.max) + '</td></tr>';
    s += '</tbody></table></div><p class="nota">Sig: verde ≤ 10% (Grau III) · amarelo ≤ 20% (II) · laranja ≤ 30% (I) · vermelho acima.</p></section>';

    // tabela de análise de variância
    s += '<section class="cartao"><h2>Análise de variância (ANOVA)</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Fonte</th><th>Soma dos quadrados</th><th>gl</th><th>Quadrado médio</th><th>F</th><th>Sig</th></tr></thead><tbody>'
      + '<tr><td>Regressão</td><td>' + U.fmtAuto(m.SQReg) + '</td><td>' + m.glReg + '</td><td>' + U.fmtAuto(m.SQReg / m.glReg) + '</td><td>' + U.fmt(m.F, 3) + '</td><td>' + U.fmtPct(m.sigF, 4) + '</td></tr>'
      + '<tr><td>Resíduo</td><td>' + U.fmtAuto(m.SQRes) + '</td><td>' + m.gl + '</td><td>' + U.fmtAuto(m.s2) + '</td><td></td><td></td></tr>'
      + '<tr><td>Total</td><td>' + U.fmtAuto(m.SQTot) + '</td><td>' + (m.n - 1) + '</td><td></td><td></td><td></td></tr></tbody></table></div></section>';

    // pressupostos
    const teste = function (nome, est, p, okTexto, nokTexto) {
      return '<tr><td>' + nome + '</td><td>' + U.fmt(est, 4) + '</td><td>' + U.fmtPct(p) + '</td><td class="' + (p >= 0.05 ? 'ok' : 'ruim') + '">' + (p >= 0.05 ? okTexto : nokTexto) + '</td></tr>';
    };
    s += '<section class="cartao"><h2>Pressupostos</h2><div class="duas"><div><h3>Normalidade — proporções</h3><table class="tabela"><thead><tr><th>Faixa</th><th>Normal</th><th>Modelo</th></tr></thead><tbody>'
      + d.proporcoes.map(function (q) { return '<tr><td>' + q.faixa + '</td><td>' + U.fmtPct(q.esperado, 0) + '</td><td>' + U.fmtPct(q.obtido, 0) + '</td></tr>'; }).join('')
      + '</tbody></table></div><div><h3>Testes</h3><table class="tabela"><thead><tr><th>Teste</th><th>Estat.</th><th>p</th><th>Leitura (5%)</th></tr></thead><tbody>'
      + teste('Shapiro-Wilk', d.sw.estatistica, d.sw.p, 'normal', 'não normal')
      + teste('Kolmogorov-Smirnov (Lilliefors)', d.ks.estatistica, d.ks.p, 'normal', 'não normal')
      + teste('Jarque-Bera', d.jb.estatistica, d.jb.p, 'normal', 'não normal')
      + teste('Breusch-Pagan', d.bp.estatistica, d.bp.p, 'homocedástico', 'heterocedástico')
      + '</tbody></table></div></div>';
    s += '<h3>Correlações (isoladas / parciais)</h3><div class="rolagem"><table class="tabela"><thead><tr><th></th>' + d.correl.nomes.map(function (n) { return '<th>' + h(n) + '</th>'; }).join('') + '</tr></thead><tbody>';
    d.correl.nomes.forEach(function (n, a) {
      s += '<tr><th>' + h(n) + '</th>' + d.correl.nomes.map(function (_, b) {
        const iso = d.correl.isoladas[a][b], par = d.correl.parciais ? d.correl.parciais[a][b] : NaN;
        const alerta = a !== b && a < d.correl.nomes.length - 1 && b < d.correl.nomes.length - 1 && Math.abs(iso) > 0.8;
        return '<td class="' + (alerta ? 'ruim' : '') + '">' + (a === b ? '—' : U.fmt(iso, 2) + ' / ' + U.fmt(par, 2)) + '</td>';
      }).join('') + '</tr>';
    });
    s += '</tbody></table></div><p class="nota">Vermelho = duas independentes com correlação acima de 0,80 (colinearidade).</p></section>';

    // gráficos
    const res = d.residuos;
    s += '<section class="cartao"><h2>Gráficos</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Observado × estimado', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true, numerar: true })
      + Gf.histograma(res.map(function (r) { return r.padronizado; }))
      + Gf.qq(res.map(function (r) { return r.padronizado; }));
    m.indep.forEach(function (v, j) {
      s += Gf.dispersao(m.X.map(function (l, i) { return { x: l[j + 1], y: m.y[i], rotulo: m.ids[i] }; }), { titulo: T.termo(m.dep.transf, m.dep.nome) + ' × ' + T.termo(v.transf, v.nome), rotX: T.termo(v.transf, v.nome), rotY: T.termo(m.dep.transf, m.dep.nome) });
    });
    s += '</div></section>';

    // resíduos
    s += '<section class="cartao"><h2>Resíduos por amostra</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Nº</th><th>Observado</th><th>Estimado</th><th>Resíduo</th><th>Padronizado</th><th>Studentizado</th><th>Alavancagem</th><th>Cook</th><th></th></tr></thead><tbody>';
    res.forEach(function (r) {
      s += '<tr class="' + (r.outlier || r.influente ? 'outlier' : '') + '"><td>' + r.id + '</td><td>' + U.fmtAuto(r.observado) + '</td><td>' + U.fmtAuto(r.estimado) + '</td><td>' + U.fmtAuto(r.residuo) + '</td><td>' + U.fmt(r.padronizado, 3) + '</td><td>' + U.fmt(r.studentizado, 3) + '</td><td>' + U.fmt(r.alavancagem, 3) + '</td><td>' + U.fmt(r.cook, 3) + '</td>'
        + '<td><button class="leve" data-acao="desligar" data-arg="' + r.id + '">Tirar do cálculo</button></td></tr>';
    });
    s += '</tbody></table></div></section>';
    return s;
  };
  // Tabela de estatística descritiva (média, mediana, desvio, CV...).
  function tabelaDescritiva(desc) {
    let t = '<div class="rolagem"><table class="tabela"><thead><tr><th>Variável</th><th>n</th><th>Média</th><th>Mediana</th><th>Desvio padrão</th><th>CV</th><th>Mínimo</th><th>1º quartil</th><th>3º quartil</th><th>Máximo</th><th>Assimetria</th></tr></thead><tbody>';
    desc.linhas.forEach(function (d) {
      t += '<tr><td>' + h(d.nome) + (d.unidade ? ' <small>' + h(d.unidade) + '</small>' : '') + '</td><td>' + d.n + '</td><td>' + U.fmtAuto(d.media) + '</td><td><b>' + U.fmtAuto(d.mediana) + '</b></td><td>' + U.fmtAuto(d.desvio) + '</td>'
        + '<td class="' + (d.cv > 0.3 ? 'ruim' : '') + '">' + U.fmtPct(d.cv, 1) + '</td><td>' + U.fmtAuto(d.min) + '</td><td>' + U.fmtAuto(d.q1) + '</td><td>' + U.fmtAuto(d.q3) + '</td><td>' + U.fmtAuto(d.max) + '</td><td>' + U.fmt(d.assimetria, 2) + '</td></tr>';
    });
    return t + '</tbody></table></div><p class="nota">' + desc.ativas + ' de ' + desc.total + ' amostras no cálculo. CV acima de 30% (vermelho) indica conjunto heterogêneo. Assimetria acima de 1 sugere testar ln na dependente.</p>';
  }

  // Quadro dos graus NBR (fundamentação e precisão) com os itens.
  function quadroGraus(fund, precisao, amplitude) {
    let t = '<div class="graus"><div>Fundamentação ' + selo(fund.grau) + '<small>' + fund.pontos + ' pontos' + (fund.preliminar ? ' · preliminar (falta o avaliando)' : '') + '</small></div>'
      + '<div>Precisão ' + (precisao === null ? '<span class="selo g0">—</span><small>estime o avaliando</small>' : selo(precisao) + '<small>amplitude ' + U.fmtPct(amplitude) + '</small>') + '</div></div>';
    t += '<div class="rolagem"><table class="tabela"><thead><tr><th>Item</th><th>Descrição</th><th>Situação</th><th>Grau</th></tr></thead><tbody>'
      + fund.itens.map(function (it) { return '<tr><td>' + it.item + '</td><td class="esq">' + h(it.descricao) + '</td><td class="esq">' + h(it.detalhe) + '</td><td>' + selo(it.grau) + '</td></tr>'; }).join('')
      + '</tbody></table></div>';
    if (fund.pendencias.length) t += '<ul class="achados">' + fund.pendencias.map(function (x) { return '<li class="info">' + h(x) + '</li>'; }).join('') + '</ul>';
    return t;
  }

  function ind(rotulo, valor) { return '<div class="ind"><span>' + h(rotulo) + '</span><b>' + h(valor) + '</b></div>'; }

  // ---- Gráficos (todos) -------------------------------------------------------------------
  ABAS.graficos = function () {
    const m = E.modelo, p = E.proj;
    let s = '';
    // distribuição de frequência de todas as variáveis (não depende de modelo)
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
    s += '<section class="cartao"><h2>Distribuição de frequência das variáveis</h2><div class="graficos">';
    p.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; }).forEach(function (v) {
      const g = Gf.frequencia(ativas.map(function (a) { return v.tipo === 'dependente' ? Rg.valorDependente(p, a, v.nome) : U.lerNumero(a.valores[v.nome]); }), v.nome + (v.unidade ? ' (' + v.unidade + ')' : ''), v.nome);
      s += g || Gf.vazio('Distribuição de ' + v.nome, v.nome, 'frequência', 'lance ao menos 2 amostras com valor');
    });
    s += '</div></section>';
    // mapa
    const comCoord = ativas.filter(function (a) { return Number.isFinite(a.lat) && Number.isFinite(a.lon); });
    if (comCoord.length) {
      const dep = Rg.dependente(p);
      const outl = new Set(E.diag ? E.diag.outliers : []);
      s += '<section class="cartao"><h2>Mapa das amostras</h2><div class="graficos">' + Gf.mapa(comCoord.map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: a.id, valor: dep ? U.lerNumero(a.valores[dep.nome]) : null, destaque: outl.has(a.id) }; }),
        Number.isFinite(p.avaliando.lat) && Number.isFinite(p.avaliando.lon) ? { lat: p.avaliando.lat, lon: p.avaliando.lon } : null) + '</div><p class="nota">' + comCoord.length + ' amostra(s) com coordenadas. Triângulo = avaliando.</p></section>';
    }
    if (!comCoord.length) s += '<section class="cartao"><h2>Mapa das amostras</h2><div class="graficos">' + Gf.vazio('Localização das amostras', 'longitude', 'latitude', 'informe latitude e longitude das amostras') + '</div></section>';
    if (!m || m.erro) {
      // sem modelo: as molduras aparecem vazias, cada uma dizendo o que falta
      const motivo = m && m.erro ? m.erro : 'calcule o modelo na aba Modelo';
      return s + '<section class="cartao"><h2>Ajuste do modelo e resíduos</h2><div class="graficos">'
        + Gf.vazio('Observado × estimado', 'estimado', 'observado', motivo) + Gf.vazio('Resíduos padronizados × estimado', 'estimado', 'resíduo padronizado', motivo)
        + Gf.vazio('Distribuição dos resíduos', 'resíduo padronizado', 'densidade', motivo) + Gf.vazio('Gráfico Q-Q normal', 'quantil teórico', 'resíduo', motivo)
        + Gf.vazio('Distância de Cook', 'amostra', 'Cook', motivo) + Gf.vazio('Valor × variável (curva do modelo)', 'variável', 'valor', motivo) + '</div></section>';
    }
    const res = E.diag.residuos;
    s += '<section class="cartao"><h2>Ajuste do modelo</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.observado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Observado × estimado (escala do modelo)', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + Gf.dispersao(m.yOriginal.map(function (y, i) { return { x: T.desfazer(m.dep.transf, m.yhat[i]), y: y, rotulo: m.ids[i] }; }), { titulo: 'Observado × estimado (' + m.dep.nome + ' real)', rotX: 'estimado', rotY: 'observado', linha45: true, numerar: true })
      + '</div></section>';
    s += '<section class="cartao"><h2>Valor × cada variável, com a curva do modelo</h2><div class="graficos">'
      + m.indep.map(function (v, j) { return Gf.curvaModelo(m, j, Rg.prever); }).join('') + '</div></section>';
    s += '<section class="cartao"><h2>Resíduos</h2><div class="graficos">'
      + Gf.dispersao(res.map(function (r) { return { x: r.estimado, y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos padronizados × estimado', rotX: 'estimado', rotY: 'resíduo padronizado', faixas2s: true, numerar: true })
      + m.indep.map(function (v, j) { return Gf.dispersao(res.map(function (r, i) { return { x: m.xOriginal[i][j], y: r.padronizado, rotulo: r.id, destaque: r.outlier }; }), { titulo: 'Resíduos × ' + v.nome, rotX: v.nome, rotY: 'resíduo padronizado', faixas2s: true }); }).join('')
      + Gf.histograma(res.map(function (r) { return r.padronizado; }))
      + Gf.qq(res.map(function (r) { return r.padronizado; }))
      + Gf.barras(res.map(function (r) { return { rotulo: r.id, valor: r.cook }; }), 'Distância de Cook', 'Cook', 1)
      + Gf.barras(res.map(function (r) { return { rotulo: r.id, valor: r.alavancagem }; }), 'Alavancagem (h)', 'h', 2 * m.p / m.n)
      + '</div></section>';
    s += '<section class="cartao"><h2>Dispersão na escala do modelo</h2><div class="graficos">'
      + m.indep.map(function (v, j) { return Gf.dispersao(m.X.map(function (l, i) { return { x: l[j + 1], y: m.y[i], rotulo: m.ids[i] }; }), { titulo: T.termo(m.dep.transf, m.dep.nome) + ' × ' + T.termo(v.transf, v.nome), rotX: T.termo(v.transf, v.nome), rotY: T.termo(m.dep.transf, m.dep.nome) }); }).join('')
      + '</div></section>';
    return s;
  };

  // ---- Ferramentas avançadas ----------------------------------------------------------------
  ABAS.avancado = function () {
    const m = E.modelo;
    if (!m || m.erro) return '<p class="vazio">Calcule o modelo primeiro (aba Modelo).</p>';
    const R = E.avancado || (E.avancado = {});
    const bt = function (acao, rotulo, ajuda) { return '<div class="barra"><button data-acao="' + acao + '">' + rotulo + '</button><small>' + ajuda + '</small></div>'; };
    let s = '<section class="cartao"><h2>Análises clássicas</h2>';
    s += bt('avPCA', 'Componentes principais (PCA)', 'Quantas dimensões independentes existem entre as variáveis.');
    if (R.pca) s += R.pca.erro ? '<p class="erro-caixa">' + h(R.pca.erro) + '</p>' : '<div class="rolagem"><table class="tabela"><thead><tr><th>Componente</th><th>Autovalor</th><th>Variância</th><th>Acumulada</th>' + R.pca.nomes.map(function (n) { return '<th>' + h(n) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + R.pca.componentes.map(function (c) { return '<tr><td>' + c.componente + '</td><td>' + U.fmt(c.autovalor, 3) + '</td><td>' + U.fmtPct(c.variancia, 1) + '</td><td>' + U.fmtPct(c.acumulada, 1) + '</td>' + c.cargas.map(function (x) { return '<td>' + U.fmt(x, 3) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    s += '<div class="barra"><button data-acao="avKmedias">Agrupamento K-médias</button><select id="avK">' + opcoes([2, 3, 4, 5, 6], R.k || 3) + '</select><small>Sub-mercados de amostras parecidas.</small></div>';
    if (R.km) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Grupo</th><th>Amostras</th><th>Média de ' + h(m.dep.nome) + '</th>' + m.indep.map(function (v) { return '<th>' + h(v.nome) + '</th>'; }).join('') + '</tr></thead><tbody>'
      + R.km.grupos.map(function (g) { return '<tr><td>' + g.grupo + '</td><td class="esq">' + g.amostras.join(', ') + '</td><td>' + U.fmtAuto(g.mediaY) + '</td>' + g.medias.map(function (x) { return '<td>' + U.fmtAuto(x) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    const numericas = E.proj.variaveis.filter(function (v) { return v.tipo === 'quantitativa' || v.tipo === 'proxy'; });
    s += '<div class="barra"><button data-acao="avDEA">DEA — eficiência</button><small>Insumo:</small><select id="avDeaIn">' + opcoes(numericas.map(function (v) { return v.nome; }), R.deaIn || '') + '</select><small>Produto: ' + h(m.dep.nome) + ' (com fator)</small></div>';
    if (R.dea) s += R.dea.erro ? '<p class="erro-caixa">' + h(R.dea.erro) + '</p>' : '<p class="nota">Eficiência 1 = na fronteira (melhor relação ' + h(m.dep.nome) + ' / ' + h(R.dea.insumos[0]) + ').</p><div class="rolagem"><table class="tabela"><thead><tr><th>Amostra</th><th>Eficiência</th></tr></thead><tbody>' + R.dea.resultado.map(function (r) { return '<tr><td>' + r.id + '</td><td>' + U.fmt(r.eficiencia, 4) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    s += '<p class="nota">Poda da rede neural: na aba Rede neural.</p></section>';

    s += '<section class="cartao"><h2>Novidades</h2>';
    s += bt('avBoxCox', 'Box-Cox (escala ideal de ' + h(m.dep.nome) + ')', 'Diz com número se y deve ficar direta, em ln, 1/y ou √y.');
    if (R.bc) s += R.bc.erro ? '<p class="erro-caixa">' + h(R.bc.erro) + '</p>' : '<p>λ = <b>' + U.fmt(R.bc.lambda, 2) + '</b> (IC 95%: ' + U.fmt(R.bc.ic95[0], 2) + ' a ' + U.fmt(R.bc.ic95[1], 2) + '). Escala recomendada: <b>' + h(R.bc.recomendada[1]) + '</b>' + (R.bc.compativeis.length > 1 ? '; também compatíveis: ' + R.bc.compativeis.slice(1).map(function (c) { return c[1]; }).join(', ') : '') + '. <button class="leve" data-acao="avUsarBoxCox">Usar esta escala</button></p>';
    s += bt('avBootCoef', 'Bootstrap dos coeficientes', 'Intervalo de cada coeficiente e quantas vezes o sinal se manteve (1.000 reamostragens).');
    if (R.bcoef) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Regressor</th><th>Coeficiente</th><th>IC ' + Math.round(R.bcoef.nivel * 100) + '% mín</th><th>máx</th><th>Erro padrão bootstrap</th><th>Mesmo sinal</th></tr></thead><tbody>'
      + R.bcoef.coeficientes.map(function (c) { return '<tr><td>' + h(c.nome) + '</td><td>' + U.fmtAuto(c.coeficiente) + '</td><td>' + U.fmtAuto(c.min) + '</td><td>' + U.fmtAuto(c.max) + '</td><td>' + U.fmtAuto(c.erroPadrao) + '</td><td class="' + (c.mesmoSinal < 0.9 ? 'ruim' : 'ok') + '">' + U.fmtPct(c.mesmoSinal, 0) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    s += bt('avRobusta', 'Regressão robusta (Huber)', 'Reduz o peso dos outliers em vez de excluir; compara com o modelo comum.');
    if (R.rob) s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Regressor</th><th>Comum</th><th>Robusto</th><th>Diferença</th></tr></thead><tbody>' + R.rob.coeficientes.map(function (c) { return '<tr><td>' + h(c.nome) + '</td><td>' + U.fmtAuto(c.comum) + '</td><td>' + U.fmtAuto(c.robusto) + '</td><td class="' + (Math.abs(c.diferenca) > 0.2 ? 'ruim' : '') + '">' + U.fmtPct(c.diferenca, 1) + '</td></tr>'; }).join('') + '</tbody></table></div><p class="nota">Amostras com peso reduzido: ' + (R.rob.pesos.length ? R.rob.pesos.map(function (x) { return x.id + ' (' + U.fmt(x.peso, 2) + ')'; }).join(', ') : 'nenhuma') + '.</p>';
    s += bt('avBoosting', 'Árvores com reforço (tipo XGBoost) e importância das variáveis', 'Comparação e descoberta de variável esquecida; não substitui a equação no laudo.');
    if (R.gb) s += '<p>R² treino ' + U.fmt(R.gb.R2treino, 3) + ' · R² validação (1 em cada 5 amostras fora) <b>' + U.fmt(R.gb.R2validacao, 3) + '</b>' + (R.gb.R2validacao < 0.5 ? ' — decorou os dados; pouca amostra para esse método.' : '') + '</p><table class="tabela"><thead><tr><th>Variável</th><th>Importância</th></tr></thead><tbody>' + R.gb.importancia.map(function (i) { return '<tr><td>' + h(i.nome) + '</td><td>' + U.fmtPct(i.importancia, 1) + '</td></tr>'; }).join('') + '</tbody></table>';
    s += bt('avMoran', 'Autocorrelação espacial (I de Moran)', 'Resíduos parecidos entre vizinhos = localização mal representada.');
    if (R.moran) s += R.moran.erro ? '<p class="erro-caixa">' + h(R.moran.erro) + '</p>' : '<p>I = ' + U.fmt(R.moran.I, 4) + ' (esperado ' + U.fmt(R.moran.esperado, 4) + '), z = ' + U.fmt(R.moran.z, 2) + ', p = ' + U.fmtPct(R.moran.p) + ' — <b>' + (R.moran.p < 0.05 ? 'há autocorrelação espacial: incluir variável de localização' : 'sem autocorrelação espacial relevante') + '</b>.</p>';
    const valsAval = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    const temAval = valsAval.every(Number.isFinite);
    s += bt('avBootAval', 'Bootstrap do valor do avaliando', temAval ? 'Confere o intervalo clássico por reamostragem.' : 'Preencha o avaliando na aba Avaliação.');
    if (R.bs) s += '<p>IC ' + U.fmt(E.proj.config.nivelIC * 100, 0) + '% por bootstrap: <b>' + U.fmtAuto(R.bs.min) + ' a ' + U.fmtAuto(R.bs.max) + '</b> (amplitude ' + U.fmtPct(R.bs.amplitude) + ')' + (E.projecao && !E.projecao.erro ? ' · clássico: ' + U.fmtAuto(E.projecao.icMin) + ' a ' + U.fmtAuto(E.projecao.icMax) : '') + '.</p>';
    s += bt('avSimulacao', 'Simulação de variáveis aleatórias (Monte Carlo)', temAval ? '10.000 sorteios dos coeficientes; distribuição do valor.' : 'Preencha o avaliando na aba Avaliação.');
    if (R.sim) s += '<div class="indicadores">' + ind('P5', U.fmtAuto(R.sim.p05)) + ind('P10', U.fmtAuto(R.sim.p10)) + ind('Mediana (P50)', U.fmtAuto(R.sim.p50)) + ind('P90', U.fmtAuto(R.sim.p90)) + ind('P95', U.fmtAuto(R.sim.p95)) + ind('Média', U.fmtAuto(R.sim.media)) + '</div><div class="graficos">' + Gf.frequencia(R.sim.valores.filter(function (_, i) { return i % 5 === 0; }), 'Distribuição simulada do valor', m.dep.nome) + '</div>';
    s += '</section>';
    return s;
  };

  // ---- Busca de modelos -------------------------------------------------------------------
  ABAS.busca = function () {
    const o = E.opBusca || (E.opBusca = { criterio: 'R2orig', limite: 500, testarExclusao: true, sigMaxRegressores: '0.3', sigMaxF: '0.05', exigirSinais: true });
    let s = '<section class="cartao"><h2>Busca automática de modelos</h2><p class="nota">Testa todas as combinações de escalas (e, se marcado, a exclusão de variáveis) e guarda os melhores. Com muitas variáveis, passa para busca heurística.</p><div class="grade">';
    s += campo('Ordenar por', '<select data-busca="criterio">' + opcoes([['R2orig', 'R² na escala original (compara ln e linear com justiça)'], ['R2aj', 'R² ajustado'], ['R2', 'R²'], ['R2prev', 'R² de previsão (validação cruzada)'], ['AIC', 'AIC (menor)'], ['sigMax', 'Menor Sig máxima']], o.criterio) + '</select>');
    s += campo('Quantos guardar', '<select data-busca="limite">' + opcoes([['100', '100'], ['500', '500'], ['1000', '1.000'], ['5000', '5.000']], String(o.limite)) + '</select>');
    s += campo('Sig máxima dos regressores', '<select data-busca="sigMaxRegressores">' + opcoes([['', 'sem filtro'], ['0.3', '30% (Grau I)'], ['0.2', '20% (Grau II)'], ['0.1', '10% (Grau III)']], o.sigMaxRegressores) + '</select>');
    s += campo('Sig máxima do F', '<select data-busca="sigMaxF">' + opcoes([['', 'sem filtro'], ['0.05', '5% (Grau I)'], ['0.02', '2% (Grau II)'], ['0.01', '1% (Grau III)']], o.sigMaxF) + '</select>');
    s += campo('Testar exclusão de variáveis', '<select data-busca="testarExclusao">' + opcoes([['true', 'Sim'], ['false', 'Não']], String(o.testarExclusao)) + '</select>');
    s += campo('Exigir sinais coerentes', '<select data-busca="exigirSinais">' + opcoes([['true', 'Sim (usa a direção esperada)'], ['false', 'Não']], String(o.exigirSinais)) + '</select>');
    s += '</div><div class="barra"><button class="principal" data-acao="buscar"' + (E.buscando ? ' disabled' : '') + '>' + (E.buscando ? 'Buscando…' : 'Iniciar busca') + '</button>'
      + (E.buscando ? '<progress max="1" value="' + E.progresso + '"></progress>' : '') + '</div></section>';

    const b = E.busca;
    if (!b) return s;
    if (b.erro) return s + '<p class="erro-caixa">' + h(b.erro) + '</p>';
    s += '<section class="cartao"><h2>' + b.modelos.length + ' melhores modelos <small>' + U.fmt(b.avaliados, 0) + ' avaliados · ' + U.fmt(b.validos, 0) + ' passaram nos filtros · busca ' + b.modo + '</small></h2>';
    s += '<div class="rolagem"><table class="tabela"><thead><tr><th>#</th><th>Escalas</th><th>k</th><th>R²</th><th>R² aj.</th><th>R² orig.</th><th>Sig máx</th><th>Sig F</th><th></th></tr></thead><tbody>';
    b.modelos.slice(0, 200).forEach(function (r, i) {
      const esc = Object.keys(r.transf).filter(function (k) { return r.transf[k] !== 'fora'; }).map(function (k) { return T.termo(r.transf[k], k); }).join(', ');
      s += '<tr><td>' + (i + 1) + '</td><td class="esq">' + h(esc) + '</td><td>' + r.k + '</td><td>' + U.fmt(r.R2, 4) + '</td><td>' + U.fmt(r.R2aj, 4) + '</td><td>' + U.fmt(r.R2orig, 4) + '</td><td>' + semaforo(r.sigMax) + '</td><td>' + U.fmtPct(r.sigF, 3) + '</td>'
        + '<td><button class="leve" data-acao="usarModelo" data-arg="' + i + '">Usar</button></td></tr>';
    });
    s += '</tbody></table></div>' + (b.modelos.length > 200 ? '<p class="nota">Mostrando 200 de ' + b.modelos.length + '. Os demais seguem guardados.</p>' : '') + '</section>';
    return s;
  };

  // ---- RNA ------------------------------------------------------------------------------
  ABAS.rna = function () {
    const o = E.opRna || (E.opRna = { ocultos: 4, redes: 15, epocas: 3000 });
    let s = '<section class="cartao"><h2>Rede neural artificial</h2><p class="nota">Usa as mesmas variáveis do modelo de regressão (as que não estão "fora"), na escala original. Serve de comparação; em perícia a regressão é mais fácil de defender.</p><div class="grade">';
    s += campo('Neurônios na camada oculta', '<input data-rna="ocultos" value="' + o.ocultos + '">');
    s += campo('Redes no bagging', '<input data-rna="redes" value="' + o.redes + '">');
    s += campo('Épocas máximas', '<input data-rna="epocas" value="' + o.epocas + '">');
    s += '</div><div class="barra"><button class="principal" data-acao="treinarRNA">Treinar</button><button data-acao="podarRNA"' + (E.rna && !E.rna.erro ? '' : ' disabled') + '>Poda (retirar neurônios fracos)</button></div></section>';
    const r = E.rna;
    if (!r) return s;
    if (r.erro) return s + '<p class="erro-caixa">' + h(r.erro) + '</p>';
    if (r.poda) s += '<p class="nota">Poda: ' + r.poda.neuroniosAntes + ' → ' + r.poda.neuroniosDepois + ' neurônios no total das redes; R² ' + U.fmt(r.poda.R2antes, 4) + ' → ' + U.fmt(r.R2, 4) + '.</p>';
    s += '<section class="cartao"><h2>Resultado da RNA</h2><div class="indicadores">' + ind('R²', U.fmt(r.R2, 4)) + ind('Erro médio percentual', U.fmtPct(r.EMP)) + ind('Redes', r.redes.length) + ind('Amostras', r.n)
      + (E.modelo && !E.modelo.erro ? ind('R² da regressão', U.fmt(E.modelo.R2, 4)) : '') + '</div>';
    s += '<table class="tabela"><thead><tr><th>Variável</th><th>Sensibilidade (+1% na variável)</th></tr></thead><tbody>' + r.sensibilidade.map(function (x) { return '<tr><td>' + h(x.nome) + '</td><td>' + U.fmt(x.elasticidade, 2) + '%</td></tr>'; }).join('') + '</tbody></table>';
    const valores = r.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    if (valores.every(Number.isFinite)) {
      const pv = INF.RNA.prever(r, valores);
      s += '<p>Avaliando pela RNA: <b>' + U.fmtAuto(pv.media) + '</b> (desvio entre as redes: ' + U.fmtAuto(pv.desvio) + ')</p>';
    }
    s += '<div class="graficos">' + Gf.dispersao(r.observado.map(function (y, i) { return { x: r.estimado[i], y: y, rotulo: r.ids[i] }; }), { titulo: 'RNA: observado × estimado', rotX: 'estimado', rotY: 'observado', linha45: true }) + '</div></section>';
    return s;
  };

  // ---- Avaliação e NBR -------------------------------------------------------------------
  ABAS.avaliacao = function () {
    const m = E.modelo;
    if (!m || m.erro) return '<p class="vazio">Calcule o modelo na aba "Modelo" primeiro.</p>';
    const av = E.proj.avaliando;
    let s = '<section class="cartao"><h2>Imóvel avaliando</h2><div class="grade">';
    s += campo('Descrição', entrada('avaliando.descricao', av.descricao));
    m.indep.forEach(function (v, j) {
      const f = m.faixa[j];
      s += campo(v.nome, '<input data-bind="avaliando.valores.' + v.nome + '" data-num value="' + numEntrada(av.valores[v.nome]) + '">', 'amostra: ' + U.fmtAuto(f.min) + ' a ' + U.fmtAuto(f.max));
    });
    s += campo('Área para o valor total', '<input data-bind="avaliando.area" data-num value="' + numEntrada(av.area) + '">', 'Deixe vazio se a dependente já é valor total.');
    s += '</div><div class="barra"><button class="principal" data-acao="projetar">Estimar valor</button></div></section>';

    const pr = E.projecao;
    if (!pr) return s;
    if (pr.erro) return s + '<p class="erro-caixa">' + h(pr.erro) + '</p>';
    s += '<section class="cartao"><h2>Estimativa</h2><div class="indicadores">'
      + ind('Estimativa central', U.fmtAuto(pr.central)) + ind('IC ' + U.fmt(pr.nivel * 100, 0) + '% mínimo', U.fmtAuto(pr.icMin) + ' (−' + U.fmtPct(pr.icAbaixo) + ')')
      + ind('IC ' + U.fmt(pr.nivel * 100, 0) + '% máximo', U.fmtAuto(pr.icMax) + ' (+' + U.fmtPct(pr.icAcima) + ')') + ind('Amplitude', U.fmtPct(pr.amplitude))
      + ind('Predição mínimo', U.fmtAuto(pr.ipMin)) + ind('Predição máximo', U.fmtAuto(pr.ipMax))
      + ind('Campo de arbítrio', U.fmtAuto(pr.arbitrioMin) + ' a ' + U.fmtAuto(pr.arbitrioMax))
      + (pr.area ? ind('Valor total', U.fmtMoeda(pr.totalCentral)) + ind('Total arredondado (≤1%)', U.fmtMoeda(INF.Projecao.arredondar(pr.totalCentral))) : '')
      + '</div>' + quadroGraus(pr.fundamentacao, pr.grauPrecisao, pr.amplitude);
    s += '<h3>Estimativas</h3><table class="tabela"><thead><tr><th>Estimativa</th><th>Valor unitário</th>' + (pr.area ? '<th>Valor total</th>' : '') + '</tr></thead><tbody>'
      + [['Mediana', pr.estimativas.mediana], ['Média', pr.estimativas.media], ['Moda', pr.estimativas.moda]].map(function (e) {
        const usada = (pr.estimativa === 'direta' && e[0] === 'Mediana') || e[0].toLowerCase() === pr.estimativa;
        return '<tr' + (usada ? ' class="escolhida"' : '') + '><td>' + e[0] + (usada ? ' (adotada)' : '') + '</td><td>' + U.fmtAuto(e[1]) + '</td>' + (pr.area ? '<td>' + U.fmtMoeda(e[1] * pr.area) + '</td>' : '') + '</tr>';
      }).join('') + '</tbody></table>'
      + '<p class="nota">' + (m.dep.transf === 'ln' ? 'Com y em ln, a mediana é exp(ŷ), a média exp(ŷ + s²/2) e a moda exp(ŷ − s²). A escolha fica na aba Projeto.' : 'Com y na escala direta, as três estimativas coincidem.') + '</p>';
    if (pr.fundamentacao.grau < 2 || pr.grauPrecisao < 2) s += '<p class="erro-caixa">Abaixo do Grau II. Pela regra da casa, não emitir: ajustar o modelo ou ampliar a amostra.</p>';
    if (pr.fundamentacao.pendencias.length) s += '<h3>O que falta para subir de grau</h3><ul class="achados">' + pr.fundamentacao.pendencias.map(function (t) { return '<li class="info">' + h(t) + '</li>'; }).join('') + '</ul>';
    if (pr.extrapolacao.variaveis.length) {
      s += '<h3>Extrapolação</h3><ul class="achados">' + pr.extrapolacao.variaveis.map(function (v) {
        return '<li class="alerta">' + h(v.nome) + ' = ' + U.fmtAuto(v.valor) + ' fora da amostra (' + U.fmtAuto(v.min) + ' a ' + U.fmtAuto(v.max) + '); variação na fronteira ' + U.fmtPct(v.variacao) + (v.dentroDosLimites ? '' : ' — além do limite admitido') + '</li>';
      }).join('') + '</ul>';
    }
    const micro = N.micronumerosidade(E.proj, m);
    if (micro.problemas.length) s += '<h3>Micronumerosidade</h3><ul class="achados">' + micro.problemas.map(function (q) { return '<li class="alerta">' + h(q.variavel) + ' = ' + h(q.codigo) + ': ' + q.qtd + ' amostra(s), mínimo ' + q.minimo + '</li>'; }).join('') + '</ul>';
    s += '</section>';

    return s;
  };


  // ---- Laudo completo ---------------------------------------------------------------------
  ABAS.laudo = function () {
    const p = E.proj, c = INF.Laudo.campos(p), av = p.avaliando;
    const txt = function (campo, rotulo, dica) { return campo_(rotulo, '<input data-bind="laudo.' + campo + '" value="' + h(c[campo] || '') + '">', dica); };
    const area = function (campo, rotulo, dica) { return '<label class="campo largo2"><span>' + h(rotulo) + '</span><textarea rows="4" data-bind="laudo.' + campo + '">' + h(c[campo] || '') + '</textarea>' + (dica ? '<small>' + h(dica) + '</small>' : '') + '</label>'; };
    let s = '<section class="cartao cartao-laudo"><h2>Laudo de avaliação completo</h2><p class="nota">O programa já coloca no laudo todos os cálculos, tabelas, graus e gráficos. Nos campos abaixo vão as informações que só você tem: quem pediu, matrícula, vistoria, descrição do imóvel, seu registro. O que ficar em branco aparece no laudo marcado em amarelo, por exemplo <mark>[preencher: número da matrícula]</mark>, para você completar depois no Word.</p><div class="barra">'
      + '<select data-estilo="1" title="Estilo 1 a 20">' + INF.Estilos.LISTA.map(function (e) { return '<option value="' + e.numero + '"' + (e.numero === INF.Estilos.doProjeto(p).numero ? ' selected' : '') + '>Estilo ' + e.numero + '</option>'; }).join('') + '</select>'
      + '<button class="principal" data-acao="laudoWord">Gerar Word (.docx)</button><button class="principal" data-acao="laudoPDF">Gerar PDF</button><button class="leve" data-acao="laudoVer">Visualizar</button>'
      + '<label class="chk"><input type="checkbox" data-bind="laudo.anexoCompleto"' + (c.anexoCompleto ? ' checked' : '') + '> anexo estatístico completo (todas as tabelas e gráficos)</label></div>';
    // dados obrigatórios do modelo que ainda não têm origem, com o caminho para conseguir
    const IVp = INF.Inventario, tlp = INF.TiposLaudo.ler(p);
    const faltam = IVp.ficha(tlp, p.inventario || {}, p.inventarioDecisoes || {}, valorAtualCampo).filter(function (f) { return f.obrig && f.estado !== 'RESOLVIDA'; });
    if (faltam.length) {
      s += '<h3>Dados do modelo sem origem (' + faltam.length + ') — como conseguir</h3><ul class="achados">' + faltam.map(function (f) {
        return '<li class="alerta"><b>' + h(f.rotulo) + '</b> — ' + h(f.estado.toLowerCase()) + '<small class="fonte">' + h((IVp.porId[f.campo] || {}).comoObter || '') + '</small></li>';
      }).join('') + '</ul>';
    }
    if (E.pendenciasLaudo !== undefined) {
      s += E.pendenciasLaudo.length
        ? '<h3>Faltou preencher (' + E.pendenciasLaudo.length + ')</h3><ul class="achados">' + E.pendenciasLaudo.map(function (t) { return '<li class="alerta">' + h(t) + '</li>'; }).join('') + '</ul>'
        : '<p class="ok">Tudo preenchido: o laudo não tem nenhum campo pendente.</p>';
    }
    s += '</section>';

    s += secaoModelo() + secaoTipoLaudo() + secaoDocumentos() + secaoVizinhanca();
    s += '<section class="cartao"><h2>Solicitante e objetivo</h2><div class="grade">'
      + txt('solicitante', 'Solicitante') + txt('proprietario', 'Proprietário') + txt('objetivo', 'Objetivo', 'Ex.: valor de mercado para compra e venda')
      + campo_('Finalidade', '<input data-bind="projeto.finalidade" value="' + h(p.projeto.finalidade) + '">') + '</div></section>';

    s += '<section class="cartao"><h2>Imóvel</h2><div class="grade">'
      + txt('endereco', 'Endereço / referência de acesso') + txt('matricula', 'Matrícula') + txt('cartorio', 'Cartório') + txt('areaDocumento', 'Área documental')
      + campo_('Latitude do imóvel', '<input data-bind="avaliando.lat" data-num value="' + numEntrada(av.lat) + '" placeholder="-17,7412">')
      + campo_('Longitude do imóvel', '<input data-bind="avaliando.lon" data-num value="' + numEntrada(av.lon) + '" placeholder="-46,1719">')
      + campo_('Data da vistoria', '<input type="date" data-bind="laudo.dataVistoria" value="' + h(c.dataVistoria) + '">') + txt('acompanhante', 'Acompanhou a vistoria')
      + campo_('Raio de pesquisa (km)', '<input data-bind="config.raioPesquisa" data-num value="' + numEntrada(p.config.raioPesquisa) + '" placeholder="' + INF.Modelos.raio(p) + '">', 'Padrão: 3 km urbano, 60 km rural.')
      + txt('justifRaio', 'Por que usar amostras fora do raio', 'Só se houver amostra além do raio.')
      + '</div><div class="grade">' + area('descricaoRegiao', 'Região') + area('descricaoImovel', 'Descrição do imóvel') + area('benfeitorias', 'Benfeitorias')
      + area('diagnosticoMercado', 'Leitura do mercado', 'Liquidez, oferta, absorção, tendência. Os números da pesquisa entram sozinhos.') + area('pressupostos', 'Pressupostos e ressalvas') + '</div></section>';

    // valor adotado
    const pr = E.projecao && !E.projecao.erro ? E.projecao : null;
    const mult = pr && pr.area ? pr.area : 1;
    s += '<section class="cartao"><h2>Valor adotado</h2>' + (pr ? '<p class="nota">Estimativa ' + U.fmtMoeda(pr.central * mult) + ' · IC 80%: ' + U.fmtMoeda(pr.icMin * mult) + ' a ' + U.fmtMoeda(pr.icMax * mult) + ' · campo de arbítrio: ' + U.fmtMoeda(pr.arbitrioMin * mult) + ' a ' + U.fmtMoeda(pr.arbitrioMax * mult) + '. Vazio = estimativa arredondada (' + U.fmtMoeda(INF.Projecao.arredondar(pr.central * mult)) + ').</p>' : '<p class="erro-caixa">Estime o avaliando na aba Avaliação e NBR antes de gerar o laudo.</p>')
      + '<div class="grade">' + campo_('Valor adotado (R$)', '<input data-bind="laudo.valorAdotado" data-num value="' + numEntrada(c.valorAdotado) + '">') + txt('justificativa', 'Justificativa, se fora do intervalo')
      + '</div></section>';

    s += '<section class="cartao"><h2>Responsável técnico</h2><div class="grade">'
      + campo_('Nome', '<input data-bind="projeto.autor" value="' + h(p.projeto.autor) + '">') + txt('titulo', 'Título profissional') + txt('registro', 'Registro (CREA/CAU)') + txt('art', 'ART nº') + txt('cidade', 'Cidade da assinatura')
      + '</div></section>';

    // mapas
    const temCoord = Number.isFinite(av.lat) && Number.isFinite(av.lon);
    const google = Nv.sessao && Nv.sessao.mapasGoogle;
    s += '<section class="cartao"><h2>Mapas</h2><div class="barra">'
      + '<button data-acao="mapaGoogle" data-arg="satelite"' + (google && temCoord ? '' : ' disabled') + '>Satélite do imóvel (Google Maps)</button>'
      + '<button data-acao="mapaGoogle" data-arg="situacao"' + (google && temCoord ? '' : ' disabled') + '>Mapa de situação com as amostras (Google Maps)</button>'
      + '<label class="botao leve">Inserir print do mapa<input type="file" id="arqMapa" accept="image/*" hidden></label></div>'
      + '<p class="nota">' + (!google ? 'Busca no Google Maps desligada: falta a chave no servidor (GOOGLE_MAPS_CHAVE). ' : '') + (!temCoord ? 'Informe latitude e longitude do imóvel acima. ' : '') + 'Sem imagem de mapa, o laudo usa o mapa esquemático pelas coordenadas.</p></section>';

    // fotos
    const fotos = p.fotos || [];
    const alvos = [['avaliando', 'Imóvel (vistoria)'], ['mapa', 'Mapa'], ['documento', 'Documento']]
      .concat(((p.vizinhanca || {}).imoveis || []).map(function (im, i) { return ['vizinho:' + i, 'Vizinho ' + (i + 1) + (im.endereco ? ' — ' + im.endereco : '')]; }))
      .concat(p.amostras.map(function (a) { return ['amostra:' + a.id, 'Amostra ' + a.id]; }));
    s += '<section class="cartao"><h2>Fotografias e imagens <small>' + fotos.length + '</small></h2><div class="barra"><select id="fotoAlvo">' + opcoes(alvos, 'avaliando') + '</select>'
      + '<label class="botao">Inserir fotos<input type="file" id="arqFotos" accept="image/*" multiple hidden></label><small>As fotos são reduzidas para até 1600 px antes de guardar.</small></div>'
      + '<div class="fotos">' + fotos.map(function (f) {
        return '<figure class="foto-item"><img src="' + f.dataUrl + '" alt="">' + '<select data-foto="' + f.id + '" data-chave="alvo">' + opcoes(alvos, f.alvo) + '</select>'
          + '<input data-foto="' + f.id + '" data-chave="legenda" value="' + h(f.legenda) + '" placeholder="Legenda"><button class="leve perigo" data-acao="excluirFoto" data-arg="' + f.id + '">Remover</button></figure>';
      }).join('') + '</div></section>';
    return s;
  };



  // ---- Modelo de laudo (1 de 17) e estilo (1 a 20) ------------------------------------------
  function secaoModelo() {
    const ML = INF.Modelos, S = INF.Estilos;
    const atual = ML.doProjeto(E.proj), estilo = S.doProjeto(E.proj);
    const caps = ML.capitulos(atual, INF.Laudo.campos(E.proj).anexoCompleto);
    const grupos = [['Particular e extrajudicial', ['part_valor_simpl', 'part_valor', 'part_locacao', 'extra_venda', 'extra_locacao']],
      ['Banco, concessionária e rural', ['banco', 'servidao_conc', 'rural_pleno']],
      ['Judicial (pericial)', ['jud_valor', 'jud_locacao', 'jud_servidao', 'jud_servidao_pleno', 'jud_desapropriacao', 'jud_partilha', 'assistente']],
      ['Vizinhança', ['viz', 'viz_jud']]];
    let s = '<section class="cartao cartao-laudo"><h2>Modelo e estilo do laudo</h2><div class="grade">'
      + campo('Modelo de laudo', '<select data-modelo="1">' + (atual.id === 'livre' ? '<option value="">Personalizado (marcado abaixo)</option>' : '')
        + grupos.map(function (g) { return '<optgroup label="' + h(g[0]) + '">' + g[1].map(function (id) { const m = ML.porId[id]; return '<option value="' + id + '"' + (atual.id === id ? ' selected' : '') + '>' + h(m.nome) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select>',
        atual.uso || 'Escolha um modelo pronto ou marque o tipo abaixo.')
      + campo('Estilo de apresentação (1 a 20)', '<select data-estilo="1">' + S.LISTA.map(function (e) { return '<option value="' + e.numero + '"' + (e.numero === estilo.numero ? ' selected' : '') + '>' + e.numero + ' — ' + h(e.nome) + '</option>'; }).join('') + '</select>',
        'Capa ' + estilo.capa + ' · ' + estilo.fonte + ' ' + estilo.tam + ' pt · tabelas ' + estilo.tabela + ' · ' + estilo.fotos + ' foto(s) por linha')
      + '</div><div class="barra"><button class="leve" data-acao="verEstilos">Ver os 20 estilos lado a lado</button>'
      + '<small>Nível: <b>' + h(atual.nivel) + '</b> — ' + caps.length + ' partes: ' + caps.map(function (c) { return ML.NOMES_CAP[c]; }).join(' · ') + '</small></div></section>';
    return s;
  }

  // ---- Tipo de laudo (marcar) --------------------------------------------------------------
  function secaoTipoLaudo() {
    const TL = INF.TiposLaudo, t = TL.ler(E.proj);
    const campoTL = function (chave, rotulo, dica, num) {
      return campo(rotulo, '<input data-bind="tipoLaudo.' + chave + '"' + (num ? ' data-num' : '') + ' value="' + h(num ? numEntrada(t[chave]) : (t[chave] || '')) + '">', dica);
    };
    let s = '<section class="cartao"><h2>Tipo de laudo</h2><p class="nota">Marque o tipo; o laudo muda título, capítulos e contas. Atalhos:</p><div class="barra">'
      + TL.ATALHOS.map(function (a, i) { return '<button class="leve" data-acao="tlAtalho" data-arg="' + i + '">' + h(a.rotulo) + '</button>'; }).join('') + '</div>';
    s += '<div class="grade"><div class="campo"><span>Âmbito</span><div class="barra">'
      + [['urbano', 'Urbano'], ['rural', 'Rural']].map(function (o) { return '<label class="chk"><input type="radio" name="tlAmbito" data-tl="ambito" value="' + o[0] + '"' + (t.ambito === o[0] ? ' checked' : '') + '> ' + o[1] + '</label>'; }).join('') + '</div></div>'
      + campo('Tipo do imóvel', '<select data-bind="tipoLaudo.imovel">' + opcoes([['', '(escolha)']].concat(TL.IMOVEIS[t.ambito]), t.imovel) + '</select>')
      + '</div>';
    s += '<h3>Para quem é o laudo</h3><div class="radios">' + TL.DESTINOS.map(function (d) {
      return '<label class="radio' + (t.destino === d.id ? ' ativo' : '') + '"><input type="radio" name="tlDestino" data-tl="destino" value="' + d.id + '"' + (t.destino === d.id ? ' checked' : '') + '><b>' + h(d.rotulo) + '</b><small>' + h(d.ajuda) + '</small></label>';
    }).join('') + '</div>';
    s += '<h3>O que será avaliado (pode marcar mais de um)</h3><div class="marcas">' + TL.OBJETOS.map(function (o) {
      return '<label class="chk grande"><input type="checkbox" data-tl-objeto="' + o.id + '"' + (TL.tem(t, o.id) ? ' checked' : '') + '> ' + h(o.rotulo) + '</label>';
    }).join('') + '</div>';

    if (t.destino === 'banco') s += '<h3>Banco</h3><div class="grade">' + campoTL('banco', 'Instituição') + campoTL('contrato', 'Proposta / contrato') + campoTL('proponente', 'Proponente') + '</div>';
    if (t.destino === 'judicial') {
      s += '<h3>Processo</h3><div class="grade">' + campoTL('processo', 'Número do processo') + campoTL('vara', 'Vara / juízo') + campoTL('comarca', 'Comarca')
        + campoTL('autor', 'Autor(es)') + campoTL('reu', 'Réu(s)')
        + campo('Função', '<select data-bind="tipoLaudo.funcao">' + opcoes(['Perito do Juízo', 'Assistente Técnico'], t.funcao) + '</select>')
        + campoTL('assistentes', 'Assistentes técnicos') + '</div>'
        + '<label class="campo largo2"><span>Objeto da perícia</span><textarea rows="3" data-bind="tipoLaudo.objetoPericia">' + h(t.objetoPericia) + '</textarea></label>';
      s += '<h3>Quesitos <small>' + (t.quesitos || []).length + '</small></h3>' + (t.quesitos || []).map(function (q, i) {
        return '<div class="quesito"><div class="barra"><b>Quesito ' + (i + 1) + '</b><input data-quesito="' + i + '" data-chave="parte" value="' + h(q.parte) + '" placeholder="parte (autor, réu, juízo)"><button class="leve perigo" data-acao="tirarQuesito" data-arg="' + i + '">Remover</button></div>'
          + '<textarea rows="2" data-quesito="' + i + '" data-chave="pergunta" placeholder="Pergunta">' + h(q.pergunta) + '</textarea><textarea rows="3" data-quesito="' + i + '" data-chave="resposta" placeholder="Resposta do perito">' + h(q.resposta) + '</textarea></div>';
      }).join('') + '<div class="barra"><button class="leve" data-acao="novoQuesito">+ Quesito</button></div>';
    }
    if (TL.tem(t, 'servidao') || TL.tem(t, 'remanescente') || TL.tem(t, 'desapropriacao')) {
      s += '<h3>Áreas</h3><p class="nota">Use a mesma unidade da variável de área do modelo (ha ou m²).</p><div class="grade">' + campoTL('areaTotal', 'Área total do imóvel', '', true);
      if (TL.tem(t, 'servidao')) s += campoTL('areaFaixa', 'Área da faixa de servidão', '', true) + campoTL('coefServidao', 'Coeficiente de servidão (%)', 'Parcela do valor da terra perdida pela restrição de uso.', true) + campoTL('benfeitoriasAtingidas', 'Benfeitorias atingidas (R$)', '', true);
      if (TL.tem(t, 'remanescente')) s += campoTL('areaRemanescente', 'Área remanescente', '', true) + campoTL('percRemanescente', 'Desvalorização do remanescente (%)', '', true);
      s += '</div>';
      if (TL.tem(t, 'servidao')) s += '<label class="campo largo2"><span>Justificativa do coeficiente de servidão</span><textarea rows="3" data-bind="tipoLaudo.justifServidao">' + h(t.justifServidao) + '</textarea></label>';
      if (TL.tem(t, 'remanescente')) s += '<label class="campo largo2"><span>Justificativa da desvalorização do remanescente</span><textarea rows="3" data-bind="tipoLaudo.justifRemanescente">' + h(t.justifRemanescente) + '</textarea></label>';
    }
    if (TL.tem(t, 'liquidacao')) s += '<h3>Liquidação forçada</h3><div class="grade">' + campoTL('prazoAbsorcao', 'Prazo de absorção (meses)', '', true) + campoTL('taxaMensal', 'Taxa de desconto (% ao mês)', '', true) + '</div>';
    if (TL.tem(t, 'vtn')) {
      s += '<h3>Benfeitorias (custo de reedição)</h3><div class="rolagem"><table class="tabela"><thead><tr><th>Descrição</th><th>Quantidade</th><th>Unidade</th><th>Custo unitário (R$)</th><th>Depreciação (%)</th><th></th></tr></thead><tbody>'
        + (t.benfeitorias || []).map(function (b, i) {
          const cel = function (ch, num) { return '<td><input class="' + (num ? 'num' : 'medio') + '" data-benf="' + i + '" data-chave="' + ch + '" value="' + h(num ? numEntrada(b[ch]) : (b[ch] || '')) + '"></td>'; };
          return '<tr>' + cel('descricao') + cel('quantidade', true) + cel('unidade') + cel('unitario', true) + cel('depreciacao', true) + '<td><button class="leve perigo" data-acao="tirarBenf" data-arg="' + i + '">×</button></td></tr>';
        }).join('') + '</tbody></table></div><div class="barra"><button class="leve" data-acao="novaBenf">+ Benfeitoria</button></div>';
    }
    return s + '</section>';
  }

  // ---- Documentos: inventário por modelo de laudo (modelo da RAE) ---------------------------
  // Os arquivos ficam só na memória da tela (não vão ao banco). O que se guarda
  // é o RESULTADO da leitura, indexado pelo SHA-256 do arquivo: renomear não
  // relê, alterar relê, e o que sumiu da pasta é avisado.
  E.docs = E.docs || [];
  async function hashArquivo(f) {
    const buf = await f.arrayBuffer();
    const h = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(h)).map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }
  function situacaoDoc(d) {
    const inv = E.proj.inventario || {};
    if (d.status && /erro|formato/.test(d.status)) return d.status;
    if (!d.hash) return 'calculando…';
    if (inv[d.hash]) return 'JÁ LIDO';
    const mesmoNome = Object.keys(inv).some(function (h) { return inv[h].arquivo === d.nome; });
    return mesmoNome ? 'ALTERADO' : 'NOVO';
  }
  function nomeModelo(t) {
    const TL = INF.TiposLaudo;
    const at = TL.ATALHOS.find(function (a) { return a.destino === t.destino && a.objetos.slice().sort().join() === (t.objetos || []).slice().sort().join(); });
    return (at ? at.rotulo : TL.titulo(t)) + ' · ' + (t.ambito === 'rural' ? 'rural' : 'urbano') + (t.imovel ? ' · ' + t.imovel : '');
  }
  // valor que o projeto já tem para um campo do inventário
  function valorAtualCampo(c) {
    const t = INF.TiposLaudo.ler(E.proj), vz = E.proj.vizinhanca || {};
    switch (c.id) {
      case 'imoveisVizinhos': return (vz.imoveis || []).length ? vz.imoveis.length + ' imóvel(is)' : '';
      case 'anomalias': { const n = (vz.imoveis || []).reduce(function (s2, im) { return s2 + (im.ambientes || []).reduce(function (x, a) { return x + (a.anomalias || []).length; }, 0); }, 0); return (vz.imoveis || []).length ? n + ' anomalia(s) registrada(s)' : ''; }
      case 'respostasQuesitos': { const q = t.quesitos || []; return q.length && q.every(function (x) { return String(x.resposta || '').trim(); }) ? q.length + ' respondido(s)' : ''; }
      case 'benfeitoriasCusto': return (t.benfeitorias || []).length ? t.benfeitorias.length + ' benfeitoria(s)' : '';
      case 'liquidacaoParam': return Number.isFinite(U.lerNumero(t.prazoAbsorcao)) && Number.isFinite(U.lerNumero(t.taxaMensal)) ? t.prazoAbsorcao + ' meses a ' + t.taxaMensal + '% a.m.' : '';
      case 'quesitos': return (t.quesitos || []).length ? t.quesitos.length + ' quesito(s)' : '';
    }
    if (!c.destino) return '';
    const v = lerCaminho(c.destino);
    return v === 'null' || v === 'NaN' ? '' : v;
  }
  function lerCaminho(caminho) {
    const partes = caminho.split('.');
    let o = partes[0] === 'tipoLaudo' ? INF.TiposLaudo.ler(E.proj) : E.proj;
    if (partes[0] === 'tipoLaudo') partes.shift();
    for (let i = 0; i < partes.length; i++) { if (o == null) return ''; o = o[partes[i]]; }
    return o == null ? '' : String(o);
  }
  function fichaAtual() {
    const t = INF.TiposLaudo.ler(E.proj), IV = INF.Inventario;
    const ficha = IV.ficha(t, E.proj.inventario || {}, E.proj.inventarioDecisoes || {}, valorAtualCampo);
    const trava = IV.trava(E.docs.map(function (d) { return { nome: d.nome, hash: d.hash, status: d.status }; }), E.proj.inventario || {});
    return { t: t, ficha: ficha, trava: trava, checagem: IV.checagem(ficha, trava), sumidos: E.docs.length ? IV.sumidos(E.docs, E.proj.inventario || {}) : [] };
  }
  const linkArquivo = function (nome) {
    const d = E.docs.find(function (x) { return x.nome === nome; });
    return d ? '<a href="#" data-acao="abrirDoc" data-arg="' + h(d.hash || d.nome) + '">' + h(nome) + '</a>' : h(nome);
  };
  function secaoDocumentos() {
    const inv = E.proj.inventario || {};
    const ligado = Nv.sessao && Nv.sessao.inventarioIA;
    const F = fichaAtual();
    const aLer = E.docs.filter(function (d) { return ['NOVO', 'ALTERADO'].indexOf(situacaoDoc(d)) >= 0; }).length;
    let s = '<section class="cartao"><h2>Documentos e inventário do laudo <small>' + E.docs.length + ' arquivo(s) · modelo: ' + h(nomeModelo(F.t)) + '</small></h2>'
      + '<p class="nota">Anexe a pasta do trabalho. A IA lê TODOS os documentos, cada um uma vez, procurando os dados que ESTE modelo de laudo exige (lista abaixo) e registrando outros achados importantes. Cada dado vem com arquivo, página e trecho. Nada entra sem você marcar. CPF e RG não são guardados.</p><div class="barra">'
      + '<label class="botao">Anexar pasta<input type="file" id="arqPasta" webkitdirectory multiple hidden></label>'
      + '<label class="botao leve">Anexar arquivos<input type="file" id="arqDocs" multiple hidden></label>'
      + '<button class="principal" data-acao="inventariar"' + (ligado && aLer && !E.inventariando ? '' : ' disabled') + '>' + (E.inventariando ? 'Lendo ' + h(E.inventariando) + '…' : 'Fazer o inventário (' + aLer + ' a ler)') + '</button>'
      + (ligado ? '' : '<small>Leitura por IA desligada: falta a chave da IA no servidor. A lista de campos e a checagem funcionam mesmo assim.</small>') + '</div>';

    if (E.docs.length) {
      s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Arquivo</th><th>Situação</th><th>Tipo</th><th>Data</th><th>Resumo</th></tr></thead><tbody>' + E.docs.map(function (d) {
        const r = d.hash && inv[d.hash], sit = situacaoDoc(d);
        return '<tr><td class="esq">' + linkArquivo(d.nome) + '<small class="fonte">' + h(d.caminho) + '</small></td><td class="' + (sit === 'JÁ LIDO' ? 'ok' : (/erro|formato/.test(sit) ? 'ruim' : '')) + '">' + h(sit) + '</td>'
          + '<td>' + h(r ? r.tipo.replace(/_/g, ' ') : '—') + '</td><td>' + h(r && r.dataDocumento ? r.dataDocumento.split('-').reverse().join('/') : '') + '</td><td class="esq texto-longo">' + h(r ? r.resumo : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    }
    if (F.sumidos.length) s += '<ul class="achados"><li class="alerta">Lidos antes e fora da pasta agora: ' + F.sumidos.map(h).join(', ') + '.</li></ul>';

    // inventário do modelo: um campo por linha
    s += '<h3>Inventário do modelo — o que este laudo precisa</h3><div class="rolagem"><table class="tabela"><thead><tr><th></th><th>Dado</th><th>Quem preenche</th><th>Estado</th><th>Valor encontrado</th><th>Fonte</th><th>No laudo hoje</th></tr></thead><tbody>'
      + F.ficha.map(function (f, i) {
        const quem = f.quem === 'documento' ? 'documento: ' + (f.fontesEsperadas || []).slice(0, 3).map(function (x) { return x.replace(/_/g, ' '); }).join(', ') : (f.quem === 'avaliador' ? 'avaliador' : 'cálculo');
        const cls = f.estado === 'RESOLVIDA' ? 'ok' : (f.estado === 'NÃO SOLUCIONADA' ? 'ruim' : (f.obrig ? 'ruim' : ''));
        const atual = valorAtualCampo(IV_campo(f.campo));
        let marca = '', valor = h(f.valor || '');
        if (f.quem === 'documento' && f.estado === 'RESOLVIDA' && f.fonte && f.campo !== 'quesitos' && String(f.valor) !== String(atual)) marca = '<input type="checkbox" data-ficha="' + i + '" checked>';
        if (f.estado === 'NÃO SOLUCIONADA') {
          valor = '<select data-decidir="' + i + '"><option value="">escolher…</option>' + f.candidatos.map(function (c2, k) { return '<option value="' + k + '">' + h(c2.valor) + ' — ' + h(c2.arquivo) + '</option>'; }).join('') + '</select>';
        }
        const comoObter = (INF.Inventario.porId[f.campo] || {}).comoObter;
        const fonte = f.fonte ? linkArquivo(f.fonte.arquivo) + (f.fonte.pagina ? ', p. ' + f.fonte.pagina : '') + (f.fonte.trecho ? '<small class="fonte">"' + h(f.fonte.trecho) + '"</small>' : '')
          : '<small>' + h(f.porque || '') + (f.estado === 'NÃO ENCONTRADA' && comoObter ? '<br><b>Como conseguir:</b> ' + h(comoObter) : '') + '</small>';
        return '<tr><td>' + marca + '</td><td class="esq"><b>' + h(f.rotulo) + '</b>' + (f.obrig ? '' : ' <small>(opcional)</small>') + '</td><td class="esq"><small>' + h(quem) + '</small></td>'
          + '<td class="' + cls + '">' + h(f.estado) + '</td><td class="esq texto-longo">' + valor + '</td><td class="esq texto-longo">' + fonte + '</td><td class="esq"><small>' + h(atual) + '</small></td></tr>';
      }).join('') + '</tbody></table></div>';

    // outros achados da IA
    const achados = [];
    Object.keys(inv).forEach(function (hh) { (inv[hh].achados || []).forEach(function (a, k) { achados.push(Object.assign({ arquivo: inv[hh].arquivo, chave: hh + ':' + k }, a)); }); });
    const incluidos = new Set(((E.proj.laudo || {}).achadosIncluidos || []).map(function (a) { return a.chave; }));
    if (achados.length) {
      s += '<h3>Outros achados importantes <small>' + achados.length + '</small></h3><ul class="achados">' + achados.map(function (a, i) {
        return '<li class="' + (a.importancia === 'alta' ? 'erro' : a.importancia === 'media' ? 'alerta' : 'info') + '"><label class="chk"><input type="checkbox" data-achado="' + i + '"' + (incluidos.has(a.chave) ? ' checked disabled' : '') + '> <b>' + h(a.assunto) + '</b></label> — ' + h(a.texto)
          + '<small class="fonte">' + linkArquivo(a.arquivo) + (a.pagina ? ', p. ' + a.pagina : '') + (a.trecho ? ' — "' + h(a.trecho) + '"' : '') + (incluidos.has(a.chave) ? ' · já está no laudo' : '') + '</small></li>';
      }).join('') + '</ul>';
    }
    // quesitos e fotos
    const comQuesitos = Object.keys(inv).filter(function (hh) { return (inv[hh].quesitos || []).length; });
    const fotosVist = E.docs.filter(function (d) { return d.hash && inv[d.hash] && inv[d.hash].tipo === 'foto_vistoria'; });
    if (comQuesitos.length || fotosVist.length) {
      s += '<ul class="achados">' + comQuesitos.map(function (hh) { return '<li class="info"><label class="chk"><input type="checkbox" data-sug-quesitos="' + h(hh) + '"> Importar ' + inv[hh].quesitos.length + ' quesito(s) de ' + h(inv[hh].arquivo) + '</label></li>'; }).join('')
        + fotosVist.map(function (d) { return '<li class="info"><label class="chk"><input type="checkbox" data-sug-foto="' + h(d.hash) + '"> Usar como foto da vistoria: ' + h(d.nome) + '</label><small class="fonte">' + h(inv[d.hash].resumo) + '</small></li>'; }).join('') + '</ul>';
    }
    s += '<div class="barra"><button class="principal" data-acao="aplicarInventario">Aplicar ao laudo o que está marcado</button><small>Cada campo preenchido fica registrado com o documento de origem.</small></div>';

    // checagem (trava da entrega)
    s += '<div class="checagem ' + (F.checagem.bloqueada ? 'bloqueada' : 'liberada') + '"><b>' + h(F.checagem.mensagem) + '</b>'
      + (F.checagem.pendencias.length ? '<ul>' + F.checagem.pendencias.map(function (x) { return '<li>' + h(x) + '</li>'; }).join('') + '</ul>' : '')
      + (F.trava.filter(function (x) { return x.leve; }).length ? '<small>Atenção: ' + F.trava.filter(function (x) { return x.leve; }).map(function (x) { return x.arquivo + ' — ' + x.texto; }).map(h).join('; ') + '</small>' : '') + '</div>';
    return s + '</section>';
  }
  function IV_campo(id) { return INF.Inventario.porId[id] || { id: id }; }

  // ---- Vistoria de vizinhança: obra e imóveis --------------------------------------------------
  function secaoVizinhanca() {
    const TL = INF.TiposLaudo;
    if (!TL.tem(TL.ler(E.proj), 'vizinhanca')) return '';
    const vz = E.proj.vizinhanca = Object.assign(TL.vizinhancaPadrao(), E.proj.vizinhanca || {});
    const ob = vz.obra;
    const cV = function (cam, rot, valor, tipo) { return campo(rot, '<input' + (tipo ? ' type="' + tipo + '"' : '') + ' data-viz="' + cam + '" value="' + h(valor || '') + '">'); };
    let s = '<section class="cartao"><h2>Vistoria de vizinhança</h2><h3>A obra</h3><div class="grade">'
      + cV('obra.nome', 'Obra / empreendimento', ob.nome) + cV('obra.endereco', 'Endereço da obra', ob.endereco) + cV('obra.construtora', 'Construtora / contratante', ob.construtora)
      + cV('obra.alvara', 'Alvará de construção', ob.alvara) + cV('obra.responsavel', 'Responsável técnico da obra', ob.responsavel) + cV('obra.tipo', 'Serviços previstos', ob.tipo)
      + cV('obra.inicio', 'Início previsto', ob.inicio, 'date') + '</div>';
    s += '<h3>Imóveis vizinhos <small>' + vz.imoveis.length + '</small></h3>';
    vz.imoveis.forEach(function (im, i) {
      const b = 'imoveis.' + i + '.';
      s += '<div class="quesito"><div class="barra"><b>Imóvel ' + (i + 1) + '</b><label class="chk"><input type="checkbox" data-viz="' + b + 'recusou"' + (im.recusou ? ' checked' : '') + '> recusou a vistoria</label>'
        + '<button class="leve perigo" data-acao="vizTirarImovel" data-arg="' + i + '">Remover imóvel</button></div><div class="grade">'
        + cV(b + 'endereco', 'Endereço', im.endereco) + cV(b + 'ocupante', 'Ocupante', im.ocupante)
        + campo('Tipo', '<select data-viz="' + b + 'tipo">' + opcoes(['', 'Casa', 'Sobrado', 'Apartamento', 'Prédio', 'Loja', 'Galpão', 'Muro / terreno', 'Outro'], im.tipo || '') + '</select>')
        + campo('Padrão', '<select data-viz="' + b + 'padrao">' + opcoes(['', 'Baixo', 'Normal', 'Alto'], im.padrao || '') + '</select>')
        + cV(b + 'idade', 'Idade aparente (anos)', im.idade) + cV(b + 'pavimentos', 'Pavimentos', im.pavimentos)
        + cV(b + 'dataVistoria', 'Data da vistoria', im.dataVistoria, 'date') + cV(b + 'acompanhante', 'Acompanhou', im.acompanhante)
        + campo('Conservação', '<select data-viz="' + b + 'conservacao">' + opcoes(['', 'bom', 'regular', 'ruim', 'precário'], im.conservacao || '') + '</select>')
        + (im.recusou ? cV(b + 'motivoRecusa', 'Motivo da recusa', im.motivoRecusa) : '') + '</div>'
        + '<label class="campo largo2"><span>Observações</span><textarea rows="2" data-viz="' + b + 'obs">' + h(im.obs || '') + '</textarea></label>';
      (im.ambientes || []).forEach(function (a, j) {
        const ba = b + 'ambientes.' + j + '.';
        s += '<div class="ambiente"><div class="barra"><input data-viz="' + ba + 'nome" value="' + h(a.nome || '') + '" placeholder="Ambiente (sala, fachada, muro...)">'
          + '<button class="leve" data-acao="vizNovaAnomalia" data-arg="' + i + '.' + j + '">+ Anomalia</button><button class="leve perigo" data-acao="vizTirarAmbiente" data-arg="' + i + '.' + j + '">Remover ambiente</button></div>';
        if ((a.anomalias || []).length) {
          s += '<div class="rolagem"><table class="tabela"><thead><tr><th>Anomalia</th><th>Localização</th><th>Dimensão</th><th>Descrição</th><th></th></tr></thead><tbody>' + a.anomalias.map(function (x, k) {
            const bx = ba + 'anomalias.' + k + '.';
            return '<tr><td><select data-viz="' + bx + 'tipo">' + opcoes([''].concat(TL.ANOMALIAS), x.tipo || '') + '</select></td><td><input class="medio" data-viz="' + bx + 'localizacao" value="' + h(x.localizacao || '') + '"></td>'
              + '<td><input data-viz="' + bx + 'dimensao" value="' + h(x.dimensao || '') + '" placeholder="0,3 mm × 40 cm"></td><td><input class="medio" data-viz="' + bx + 'descricao" value="' + h(x.descricao || '') + '"></td>'
              + '<td><button class="leve perigo" data-acao="vizTirarAnomalia" data-arg="' + i + '.' + j + '.' + k + '">×</button></td></tr>';
          }).join('') + '</tbody></table></div>';
        } else s += '<small>Sem anomalias registradas neste ambiente.</small>';
        s += '</div>';
      });
      s += '<div class="barra"><button class="leve" data-acao="vizNovoAmbiente" data-arg="' + i + '">+ Ambiente</button><small>Fotos: em "Fotografias e imagens", escolha "Vizinho ' + (i + 1) + '".</small></div></div>';
    });
    s += '<div class="barra"><button data-acao="vizNovoImovel">+ Imóvel vizinho</button></div></section>';
    return s;
  }

  // ---- Relatório --------------------------------------------------------------------------
  ABAS.relatorio = function () {
    let s = '<section class="cartao"><h2>Relatório estatístico</h2><p>Documento para anexar ao laudo: dados, variáveis, equação, testes, gráficos, estimativa e graus da NBR. Abra e imprima em PDF pelo navegador.</p><div class="barra">'
      + '<button class="principal" data-acao="exportarPDF">Exportar PDF</button><button class="principal" data-acao="exportarExcel">Exportar Excel</button>'
      + '<button class="leve" data-acao="abrirRelatorio">Ver relatório</button><button class="leve" data-acao="baixarRelatorio">Baixar .html</button></div>'
      + '<p class="nota">PDF: abre a impressão; escolha "Salvar como PDF". Excel: uma aba para cada quadro (amostras, estatística, regressores, ANOVA, resíduos, correlações, normalidade, fundamentação, projeção, busca de modelos, histórico).</p></section>';
    const K = N.NORMA;
    s += '<section class="cartao"><h2>Critérios da norma em uso</h2><p class="nota">' + h(K.referencia) + ' — confira com seu exemplar.</p><table class="tabela"><thead><tr><th>Item</th><th>Grau III</th><th>Grau II</th><th>Grau I</th></tr></thead><tbody>'
      + '<tr><td class="esq">2 — quantidade de dados</td><td>' + K.item2.III + '(k+1)</td><td>' + K.item2.II + '(k+1)</td><td>' + K.item2.I + '(k+1)</td></tr>'
      + '<tr><td class="esq">5 — Sig dos regressores</td><td>' + U.fmtPct(K.item5.III, 0) + '</td><td>' + U.fmtPct(K.item5.II, 0) + '</td><td>' + U.fmtPct(K.item5.I, 0) + '</td></tr>'
      + '<tr><td class="esq">6 — Sig do F</td><td>' + U.fmtPct(K.item6.III, 0) + '</td><td>' + U.fmtPct(K.item6.II, 0) + '</td><td>' + U.fmtPct(K.item6.I, 0) + '</td></tr>'
      + '<tr><td class="esq">Precisão — amplitude do IC 80%</td><td>≤ ' + U.fmtPct(K.precisao.III, 0) + '</td><td>≤ ' + U.fmtPct(K.precisao.II, 0) + '</td><td>≤ ' + U.fmtPct(K.precisao.I, 0) + '</td></tr>'
      + '<tr><td class="esq">Enquadramento (pontos mínimos)</td><td>' + K.enquadramento.III.pontos + '</td><td>' + K.enquadramento.II.pontos + '</td><td>' + K.enquadramento.I.pontos + '</td></tr>'
      + '</tbody></table></section>';
    return s;
  };

  // ---------------------------------------------------------------------------
  // AÇÕES (botões)
  // ---------------------------------------------------------------------------
  const ACOES = {};

  ACOES.roteiro = function () {
    const r = ROTEIROS[E.proj.projeto.tipologia];
    if (!r) return avisar('Sem roteiro pronto para essa tipologia. Monte as variáveis na aba Variáveis.');
    if (E.proj.amostras.length && !confirm('O projeto já tem amostras. Acrescentar as variáveis sugeridas que ainda não existem?')) return;
    const dep = Rg.dependente(E.proj);
    if (dep && !E.proj.amostras.length) { dep.nome !== r.dep[0] && Dd.renomearVariavel(E.proj, dep.nome, r.dep[0]); dep.unidade = r.dep[1]; }
    r.vars.forEach(function (v) {
      if (E.proj.variaveis.some(function (x) { return x.nome === v[0]; })) return;
      Dd.incluirVariavel(E.proj, v[0], v[1]);
      const nv = E.proj.variaveis.find(function (x) { return x.nome === v[0]; });
      nv.direcao = v[2]; nv.descricao = v[3];
    });
    mudou(true); E.aba = 'variaveis'; avisar('Variáveis sugeridas criadas. Ajuste o que precisar.', 'ok');
  };

  ACOES.incluirVar = function () {
    const err = Dd.incluirVariavel(E.proj, document.getElementById('novaVarNome').value, document.getElementById('novaVarTipo').value);
    if (err) return avisar(err, 'erro');
    mudou(true); desenhar();
  };
  ACOES.renomear = function (nome) {
    const novo = prompt('Novo nome para ' + nome + ':', nome);
    if (!novo || novo === nome) return;
    const err = Dd.renomearVariavel(E.proj, nome, novo);
    if (err) return avisar(err, 'erro');
    mudou(true); desenhar();
  };
  ACOES.excluirVar = function (nome) {
    if (!confirm('Excluir a variável ' + nome + ' e todos os valores dela nas amostras?')) return;
    Dd.excluirVariavel(E.proj, nome); mudou(true); desenhar();
  };
  ACOES.operar = function () {
    const r = INF.Operar.operar(E.proj, document.getElementById('opNome').value.trim(), document.getElementById('opTipo').value, document.getElementById('opFormula').value);
    if (r.erro) return avisar(r.erro, 'erro');
    mudou(true); avisar('Coluna calculada em ' + r.ok + ' de ' + r.total + ' amostras.', 'ok');
  };
  ACOES.tempo = function () {
    const n = Dd.preencherTempo(E.proj, document.getElementById('varTempo').value);
    mudou(true); avisar(n + ' amostra(s) com meses calculados. Avaliando = 0 (data base).', 'ok');
  };
  ACOES.distancia = function () {
    const n = Dd.preencherDistancia(E.proj, document.getElementById('varDist').value);
    if (n < 0) return avisar('Informe latitude e longitude do polo na aba Projeto.', 'erro');
    mudou(true); avisar(n + ' amostra(s) com distância calculada.', 'ok');
  };

  // amostras
  ACOES.novaAmostra = function (qtd) {
    for (let i = 0; i < Number(qtd); i++) Dd.incluirAmostra(E.proj, {});
    mudou(true); desenhar();
  };
  ACOES.excluirAmostra = function (id) {
    if (!confirm('Excluir a amostra ' + id + '? (Para só tirar do cálculo, desmarque o ✓.)')) return;
    E.proj.amostras = E.proj.amostras.filter(function (a) { return a.id !== Number(id); });
    mudou(true); desenhar();
  };
  ACOES.reconsiderar = function () { E.proj.amostras.forEach(function (a) { a.habilitada = true; }); mudou(true); desenhar(); };
  ACOES.desligar = function (id) {
    const a = E.proj.amostras.find(function (x) { return x.id === Number(id); });
    if (a) { a.habilitada = false; mudou(true); ACOES.calcular(); }
  };
  ACOES.exportarCSV = function () {
    Dd.baixar((E.proj.projeto.nome || 'amostras') + ' - amostras.csv', Dd.exportarCSV(E.proj), 'text/csv;charset=utf-8');
  };
  ACOES.confirmarImportacao = function () {
    const im = E.importacao;
    im.mapa.forEach(function (m, i) {
      if (m.destino === 'nova') {
        const nome = im.cab[i].trim().replace(/[^\wÀ-ú]+/g, '_').replace(/^_+|_+$/g, '') || ('Col' + (i + 1));
        Dd.incluirVariavel(E.proj, nome, 'quantitativa');
        im.mapa[i] = { destino: 'variavel', nome: nome };
      }
    });
    const n = Dd.importarLinhas(E.proj, im.linhas, im.mapa);
    E.importacao = null; mudou(true); avisar(n + ' amostra(s) importada(s).', 'ok');
  };
  ACOES.cancelarImportacao = function () { E.importacao = null; desenhar(); };

  // modelo híbrido e banco de mercado
  ACOES.buscarBanco = async function () {
    const modo = E.proj.config.origemDados || 'meus';
    try {
      let regs = [];
      if (modo !== 'meus') {
        regs = await Nv.mercado(E.proj.projeto.municipio.split('/')[0].trim(), E.proj.projeto.tipologia, document.getElementById('incluirCompart').checked);
      }
      const r = INF.Conferencia.aplicarOrigem(E.proj, modo, regs);
      mudou(true);
      avisar('Origem "' + modo + '": ' + r.incluidas + ' amostra(s) do banco incluída(s)' + (r.removidas ? ', ' + r.removidas + ' da rodada anterior retirada(s)' : '') + '. Confira antes de calcular.', 'ok');
    } catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.enviarBanco = async function () {
    const compart = document.getElementById('compartilhar').checked;
    const dep = Rg.dependente(E.proj);
    const areaVar = E.proj.variaveis.find(function (v) { return /^area|^área/i.test(v.nome); });
    const proprias = E.proj.amostras.filter(function (a) { return a.origem !== 'banco'; });
    const itens = proprias.map(function (a) {
      const area = areaVar ? U.lerNumero(a.valores[areaVar.nome]) : NaN;
      const y = dep ? U.lerNumero(a.valores[dep.nome]) : NaN;
      const ehTotal = dep && /^(vt|valor)/i.test(dep.nome);
      const atributos = {};
      E.proj.variaveis.forEach(function (v) { if (v.tipo !== 'dependente' && v.tipo !== 'identificacao' && v !== areaVar) atributos[v.nome] = a.valores[v.nome]; });
      return { natureza: a.natureza, tipologia: E.proj.projeto.tipologia, municipio: E.proj.projeto.municipio.split('/')[0].trim(), uf: (E.proj.projeto.municipio.split('/')[1] || '').trim(),
        endereco: a.endereco, bairro: a.bairro, informante: a.informante, telefone: a.telefone, link: a.link, data: a.data || null,
        preco: ehTotal ? y : (Number.isFinite(area) ? y * area : null), area: Number.isFinite(area) ? area : null, unidadeArea: areaVar ? areaVar.unidade : '',
        lat: a.lat, lon: a.lon, atributos: atributos, origem: 'projeto', compartilhado: compart };
    });
    if (!itens.length) return avisar('Não há amostras próprias para guardar.');
    if (!confirm('Guardar ' + itens.length + ' amostra(s) no banco de mercado' + (compart ? ', compartilhando com a COON' : '') + '?')) return;
    try { const r = await Nv.gravarMercado(itens); avisar(r.gravados + ' amostra(s) guardada(s) no banco.', 'ok'); }
    catch (e) { avisar(e.message, 'erro'); }
  };

  // conferência
  ACOES.semContato = function () {
    const ids = INF.Conferencia.desligarSemContato(E.proj);
    mudou(true); E.conferencia = INF.Conferencia.conferir(E.proj);
    avisar(ids.length ? ids.length + ' oferta(s) tirada(s) do cálculo: ' + ids.join(', ') + '. Ficam guardadas e podem ser desfeitas no histórico.' : 'Todas as ofertas no cálculo têm fonte e telefone ou link.', 'ok');
  };
  ACOES.conferir = function () { E.conferencia = INF.Conferencia.conferir(E.proj); desenhar(); };
  ACOES.conferirIA = async function () {
    E.conferencia = INF.Conferencia.conferir(E.proj);
    E.conferindoIA = true; desenhar();
    try { E.conferenciaIA = await Nv.conferirIA(E.id, E.proj); }
    catch (e) { avisar(e.message, 'erro'); }
    E.conferindoIA = false; desenhar();
  };

  // aplica SÓ as sugestões marcadas pelo avaliador
  ACOES.aplicarSugestoes = function () {
    const marcadas = Array.prototype.slice.call(document.querySelectorAll('[data-sugestao]:checked')).map(function (el) { return Number(el.dataset.sugestao); });
    if (!marcadas.length) return avisar('Marque as sugestões que quer aplicar.', 'erro');
    if (!confirm('Aplicar ' + marcadas.length + ' correção(ões)? Ficam no histórico e podem ser desfeitas.')) return;
    let feitas = 0; const erros = [];
    marcadas.forEach(function (i) {
      const ap = E.conferenciaIA.apontamentos[i];
      const r = INF.Conferencia.aplicarCorrecao(E.proj, ap, E.proj.projeto.autor);
      if (r.erro) erros.push(r.erro); else { ap.aplicada = true; feitas++; }
    });
    mudou(true);
    avisar(feitas + ' correção(ões) aplicada(s).' + (erros.length ? ' Não aplicadas: ' + erros.join('; ') : '') + ' Recalcule o modelo.', erros.length ? 'erro' : 'ok');
  };
  ACOES.desfazer = function (i) {
    const r = INF.Conferencia.desfazer(E.proj, Number(i));
    if (r.erro) return avisar(r.erro, 'erro');
    mudou(true); avisar('Alteração desfeita.', 'ok');
  };

  // pesquisa de mercado
  ACOES.abrirPortal = function (i) {
    const po = INF.Pesquisa.PORTAIS[Number(i)];
    const url = INF.Pesquisa.urlBusca(po, document.getElementById('pqTipo').value, document.getElementById('pqFin').value, document.getElementById('pqMun').value, '');
    window.open(url, '_blank', 'noopener');
  };
  ACOES.extrair = function () {
    E.anuncio = INF.Pesquisa.extrairAnuncio(document.getElementById('anTexto').value, document.getElementById('anLink').value.trim());
    desenhar();
  };
  ACOES.lerLink = async function () {
    const link = document.getElementById('anLink').value.trim();
    if (!link) return avisar('Cole o link do anúncio.', 'erro');
    avisar('Lendo o anúncio…');
    try { E.anuncio = await Nv.anuncio(link); E.aviso = null; desenhar(); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.gravarAnuncio = async function () {
    const preco = U.lerNumero(document.getElementById('anPreco').value);
    const area = U.lerNumero(document.getElementById('anArea').value);
    const varArea = document.getElementById('anVarArea').value;
    const dep = Rg.dependente(E.proj);
    if (!dep) return avisar('Crie a variável dependente antes.', 'erro');
    if (!Number.isFinite(preco)) return avisar('Informe o preço.', 'erro');
    const teste = INF.Conferencia.ofertaRastreavel({ natureza: document.getElementById('anNat').value, informante: document.getElementById('anInf').value,
      telefone: document.getElementById('anTel').value, link: E.anuncio.link || '' });
    if (!teste.ok) return avisar('Oferta sem ' + teste.falta.join(' e ') + '. Preencha antes de gravar.', 'erro');
    const valores = {};
    valores[dep.nome] = document.getElementById('anModoDep').value === 'total' ? preco : (area > 0 ? preco / area : NaN);
    if (varArea && Number.isFinite(area)) valores[varArea] = area;
    const dados = {
      natureza: document.getElementById('anNat').value, data: document.getElementById('anData').value,
      endereco: document.getElementById('anEnd').value, informante: document.getElementById('anInf').value,
      telefone: document.getElementById('anTel').value, link: E.anuncio.link || '', valores: valores,
      obs: 'Anúncio: preço ' + U.fmtMoeda(preco) + (Number.isFinite(area) ? ', área ' + U.fmt(area, 2) : '')
    };
    const a = Dd.incluirAmostra(E.proj, dados);
    if (E.anuncioPrint) {
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'print:' + a.id, legenda: 'Print do anúncio da amostra ' + a.id + (dados.link ? ' — ' + dados.link : '') + ' (capturado em ' + new Date().toLocaleDateString('pt-BR') + ')' }, E.anuncioPrint));
      E.anuncioPrint = null;
    }
    if (document.getElementById('anBanco').checked && Nv.logado()) {
      try {
        await Nv.gravarMercado([{ natureza: dados.natureza, tipologia: E.proj.projeto.tipologia, municipio: E.proj.projeto.municipio.split('/')[0].trim(),
          endereco: dados.endereco, informante: dados.informante, telefone: dados.telefone, link: dados.link, data: dados.data || null,
          preco: preco, area: area, unidadeArea: E.anuncio.unidadeArea, origem: E.anuncio.titulo !== undefined ? 'supadata' : 'anuncio-colado' }]);
      } catch (e) { avisar('Amostra criada, mas não foi ao banco: ' + e.message, 'erro'); }
    }
    E.anuncio = null; mudou(true);
    avisar('Amostra ' + a.id + ' criada. Complete as demais variáveis na aba Amostras.', 'ok');
  };

  // cálculo
  ACOES.calcular = function () {
    E.avancado = {};
    E.modelo = Rg.calcular(E.proj, E.proj.modelo.transf);
    E.diag = E.modelo.erro ? null : INF.Diag.tudo(E.modelo);
    E.projecao = null;
    E.aba = 'modelo'; desenhar();
  };
  ACOES.buscar = function () {
    const o = E.opBusca;
    E.buscando = true; E.progresso = 0; E.busca = null; desenhar();
    INF.Busca.buscar(E.proj, {
      criterio: o.criterio, limite: Number(o.limite), testarExclusao: String(o.testarExclusao) === 'true',
      sigMaxRegressores: o.sigMaxRegressores === '' ? null : Number(o.sigMaxRegressores),
      sigMaxF: o.sigMaxF === '' ? null : Number(o.sigMaxF), exigirSinais: String(o.exigirSinais) === 'true',
      semente: Number(E.proj.config.semente) || 12345
    }, function (fr) {
      E.progresso = fr;
      const barra = document.querySelector('progress'); if (barra) barra.value = fr;
    }).then(function (r) { E.busca = r; E.buscando = false; desenhar(); });
  };
  // Cálculo automático completo. Quem calcula é o motor (resultado sempre
  // igual para os mesmos dados); nada aqui usa IA.
  ACOES.calcularTudo = function () {
    const sitA = INF.Etapas.situacao(E.proj, E);
    const antes = ['projeto', 'variaveis'].find(function (a) { return !sitA[a].completa; });
    if (antes) return avisar('Antes de calcular, complete a etapa ' + INF.Etapas.porAba[antes].rotulo + ': falta ' + sitA[antes].faltas.join(', ') + '.', 'erro');
    const resumo = [];
    const semContato = INF.Conferencia.desligarSemContato(E.proj);
    if (semContato.length) {
      mudou(true);
      resumo.push(semContato.length + ' oferta(s) sem fonte e telefone/link tirada(s) do cálculo (amostras ' + semContato.join(', ') + '). Continuam guardadas; dá para desfazer no histórico da aba Amostras.');
    }
    E.conferencia = INF.Conferencia.conferir(E.proj);
    const erros = E.conferencia.filter(function (c) { return c.nivel === 'erro'; });
    resumo.push('Conferência: ' + E.conferencia.length + ' apontamento(s), ' + erros.length + ' erro(s).');
    resumo.push('Amostras no cálculo: ' + E.proj.amostras.filter(function (a) { return a.habilitada !== false; }).length + ' de ' + E.proj.amostras.length + '.');
    E.buscando = true; E.resumoAuto = null; desenhar();
    const base = { criterio: 'R2orig', limite: 500, testarExclusao: true, sigMaxF: 0.05, semente: Number(E.proj.config.semente) || 12345 };
    // do mais exigente para o menos exigente: Grau III → II → I
    const tentativas = [
      { rotulo: 'Grau III (Sig ≤ 10%, F ≤ 1%, sinais coerentes)', op: { sigMaxRegressores: 0.10, sigMaxF: 0.01, exigirSinais: true } },
      { rotulo: 'Grau II (Sig ≤ 20%, F ≤ 2%, sinais coerentes)', op: { sigMaxRegressores: 0.20, sigMaxF: 0.02, exigirSinais: true } },
      { rotulo: 'Grau I (Sig ≤ 30%, F ≤ 5%, sinais coerentes)', op: { sigMaxRegressores: 0.30, sigMaxF: 0.05, exigirSinais: true } }
    ];
    let i = 0;
    (function proxima() {
      if (i >= tentativas.length) {
        E.buscando = false;
        resumo.push('Nenhuma combinação atende nem ao Grau I com sinais coerentes. Revise amostras e variáveis.');
        E.resumoAuto = resumo; desenhar(); return;
      }
      const t = tentativas[i++];
      INF.Busca.buscar(E.proj, Object.assign({}, base, t.op), function (fr) { const b = document.querySelector('progress'); if (b) b.value = fr; })
        .then(function (r) {
          if (r.erro) { E.buscando = false; resumo.push(r.erro); E.resumoAuto = resumo; desenhar(); return; }
          if (!r.modelos.length) { resumo.push('Filtro ' + t.rotulo + ': nenhum modelo (' + U.fmt(r.avaliados, 0) + ' testados).'); proxima(); return; }
          E.busca = r;
          E.proj.modelo.transf = U.copiar(r.modelos[0].transf);
          ACOES.calcular();
          E.buscando = false;
          resumo.push('Filtro ' + t.rotulo + ': ' + U.fmt(r.avaliados, 0) + ' combinações testadas, ' + U.fmt(r.validos, 0) + ' atendem; escolhida a de maior R² na escala original.');
          const m = E.modelo;
          if (m && !m.erro) {
            resumo.push('Modelo: ' + m.equacao);
            resumo.push('n = ' + m.n + ', R² = ' + U.fmt(m.R2, 4) + ', R² ajustado = ' + U.fmt(m.R2aj, 4) + ', Sig F = ' + U.fmtPct(m.sigF, 4) + '.');
            const fp = N.fundamentacaoPreliminar(m, E.proj.config);
            const dY = INF.Diag.descritiva(m.yOriginal);
            resumo.push(m.dep.nome + ': média ' + U.fmtAuto(dY.media) + ', mediana ' + U.fmtAuto(dY.mediana) + ', CV ' + U.fmtPct(dY.cv, 1) + '.');
            resumo.push('Fundamentação (preliminar): Grau ' + N.romano(fp.grau) + ' com ' + fp.pontos + ' pontos. Precisão: sai ao estimar o avaliando.');
            if (E.diag.outliers.length) resumo.push('Outliers (resíduo > 2σ): amostras ' + E.diag.outliers.join(', ') + '. Não foram retirados: a decisão é sua.');
            const valores = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
            if (valores.every(Number.isFinite)) {
              ACOES.projetar();
              const pr = E.projecao;
              if (pr && !pr.erro) resumo.push('Avaliando: ' + U.fmtAuto(pr.central) + ' (IC 80%: ' + U.fmtAuto(pr.icMin) + ' a ' + U.fmtAuto(pr.icMax) + ') — Fundamentação Grau ' + N.romano(pr.fundamentacao.grau) + ', Precisão Grau ' + N.romano(pr.grauPrecisao) + '.');
            } else resumo.push('Preencha o avaliando na aba "Avaliação e NBR" para estimar o valor.');
          }
          E.resumoAuto = resumo; E.aba = 'modelo'; desenhar();
        });
    })();
  };

  ACOES.usarModelo = function (i) {
    const r = E.busca.modelos[Number(i)];
    E.proj.modelo.transf = U.copiar(r.transf);
    mudou(true); ACOES.calcular();
  };
  ACOES.treinarRNA = function () {
    const o = E.opRna;
    avisar('Treinando a rede…');
    setTimeout(function () {
      E.rna = INF.RNA.treinar(E.proj, E.proj.modelo.transf, { ocultos: Number(o.ocultos) || 4, redes: Number(o.redes) || 15, epocas: Number(o.epocas) || 3000, semente: Number(E.proj.config.semente) || 12345 });
      E.aviso = null; desenhar();
    }, 30);
  };
  ACOES.projetar = function () {
    const m = E.modelo, c = E.proj.config;
    const valores = m.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); });
    E.projecao = INF.Projecao.projetar(m, valores, { nivel: Number(c.nivelIC) || 0.8, estimativa: c.estimativaLn, areaAvaliando: E.proj.avaliando.area, item1: Number(c.item1), item3: Number(c.item3), considerarIntercepto: c.considerarIntercepto });
    desenhar();
  };

  // ferramentas avançadas
  const Av = INF.Avancado;
  const valsAvaliando = function () { return E.modelo.indep.map(function (v) { return U.lerNumero(E.proj.avaliando.valores[v.nome]); }); };
  const semente = function () { return Number(E.proj.config.semente) || 12345; };
  ACOES.avPCA = function () { E.avancado.pca = Av.pca(E.modelo); desenhar(); };
  ACOES.avKmedias = function () { E.avancado.k = Number(document.getElementById('avK').value); E.avancado.km = Av.kmedias(E.modelo, E.avancado.k, semente()); desenhar(); };
  ACOES.avDEA = function () { E.avancado.deaIn = document.getElementById('avDeaIn').value; E.avancado.dea = Av.dea(E.proj, [E.avancado.deaIn], ['__dep__']); desenhar(); };
  ACOES.avBoxCox = function () { E.avancado.bc = Av.boxCox(E.modelo); desenhar(); };
  ACOES.avUsarBoxCox = function () { E.proj.modelo.transf[E.modelo.dep.nome] = E.avancado.bc.recomendada[2]; mudou(true); ACOES.calcular(); };
  ACOES.avBootCoef = function () { E.avancado.bcoef = Av.bootstrapCoeficientes(E.modelo, { semente: semente(), nivel: Number(E.proj.config.nivelIC) || 0.8 }); desenhar(); };
  ACOES.avRobusta = function () { E.avancado.rob = Av.robusta(E.modelo); desenhar(); };
  ACOES.avBoosting = function () { E.avancado.gb = Av.boosting(E.modelo, { semente: semente() }); desenhar(); };
  ACOES.avMoran = function () { E.avancado.moran = Av.moran(E.proj, E.modelo); desenhar(); };
  ACOES.avBootAval = function () {
    const v = valsAvaliando(); if (!v.every(Number.isFinite)) return avisar('Preencha o avaliando na aba Avaliação e NBR.', 'erro');
    E.avancado.bs = Av.bootstrap(E.modelo, v, { semente: semente(), nivel: Number(E.proj.config.nivelIC) || 0.8 }); desenhar();
  };
  ACOES.avSimulacao = function () {
    const v = valsAvaliando(); if (!v.every(Number.isFinite)) return avisar('Preencha o avaliando na aba Avaliação e NBR.', 'erro');
    E.avancado.sim = Av.simulacao(E.modelo, v, { semente: semente() }); desenhar();
  };
  ACOES.podarRNA = function () { E.rna = INF.RNA.podar(E.rna, 0.05); desenhar(); };

  // exportação: Excel e PDF
  ACOES.exportarExcel = function () {
    if (E.modelo && !E.modelo.erro && !E.projecao && E.modelo.indep.every(function (v) { return Number.isFinite(U.lerNumero(E.proj.avaliando.valores[v.nome])); })) ACOES.projetar();
    const bytes = INF.Planilha.pastaCompleta({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao, busca: E.busca });
    Dd.baixar((E.proj.projeto.nome || 'avaliacao') + ' - planilhas.xlsx', bytes, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  };
  ACOES.exportarPDF = function () {
    const html = htmlRelatorio(); if (!html) return;
    // imprime por um quadro invisível: abre direto a janela de impressão,
    // onde se escolhe "Salvar como PDF"
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const quadro = document.createElement('iframe');
    quadro.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    quadro.src = url;
    quadro.onload = function () {
      setTimeout(function () {
        quadro.contentWindow.focus(); quadro.contentWindow.print();
        setTimeout(function () { quadro.remove(); URL.revokeObjectURL(url); }, 60000);
      }, 300);
    };
    document.body.appendChild(quadro);
  };


  // ---- laudo: fotos, mapas, Word e PDF --------------------------------------------------------
  // Reduz a foto para no máximo 1600 px e guarda como JPEG (qualidade 0,82).
  function reduzirImagem(arquivo) {
    return new Promise(function (ok, falhou) {
      const leitor = new FileReader();
      leitor.onload = function () {
        const img = new Image();
        img.onload = function () {
          const esc = Math.min(1, 1600 / Math.max(img.width, img.height));
          const cv = document.createElement('canvas');
          cv.width = Math.round(img.width * esc); cv.height = Math.round(img.height * esc);
          const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, cv.width, cv.height); g.drawImage(img, 0, 0, cv.width, cv.height);
          ok({ dataUrl: cv.toDataURL('image/jpeg', 0.82), largura: cv.width, altura: cv.height });
        };
        img.onerror = function () { falhou(new Error('Imagem inválida: ' + arquivo.name)); };
        img.src = leitor.result;
      };
      leitor.readAsDataURL(arquivo);
    });
  }
  function proximoIdFoto() { return (E.proj.fotos || []).reduce(function (m, f) { return Math.max(m, f.id); }, 0) + 1; }
  async function incluirFotos(arquivos, alvo) {
    E.proj.fotos = E.proj.fotos || [];
    for (let i = 0; i < arquivos.length; i++) {
      try {
        const r = await reduzirImagem(arquivos[i]);
        E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: alvo, legenda: arquivos[i].name.replace(/\.[^.]+$/, '') }, r));
      } catch (e) { avisar(e.message, 'erro'); }
    }
    mudou(false);
    if (!Dd.salvarLocal(E.proj)) avisar('Fotos incluídas. O projeto ficou grande para o armazenamento do navegador: use Salvar (nuvem) ou Baixar para não perder.', 'erro');
    else desenhar();
  }
  ACOES.excluirFoto = function (id) {
    E.proj.fotos = (E.proj.fotos || []).filter(function (f) { return f.id !== Number(id); });
    mudou(false); desenhar();
  };
  ACOES.mapaGoogle = async function (tipo) {
    const av = E.proj.avaliando;
    const marc = E.proj.amostras.filter(function (a) { return a.habilitada !== false && Number.isFinite(a.lat) && Number.isFinite(a.lon); })
      .map(function (a) { return { lat: a.lat, lon: a.lon, rotulo: String(a.id).length === 1 ? String(a.id) : '' }; });
    avisar('Buscando imagem no Google Maps…');
    try {
      const dataUrl = await Nv.mapa(tipo, { lat: av.lat, lon: av.lon }, marc);
      const dims = await new Promise(function (ok) { const i = new Image(); i.onload = function () { ok({ largura: i.width, altura: i.height }); }; i.src = dataUrl; });
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'mapa', dataUrl: dataUrl,
        legenda: tipo === 'satelite' ? 'Imagem de satélite do imóvel avaliando. Imagem: Google.' : 'Situação do imóvel avaliando (A) e dos dados de mercado. Imagem: Google.' }, dims));
      mudou(false); E.aviso = null; desenhar();
    } catch (e) { avisar(e.message, 'erro'); }
  };

  // Gráfico SVG → PNG (o Word não lê SVG): desenha num canvas em 2× de resolução.
  function svgParaPng(svg) {
    return new Promise(function (ok) {
      const estilo = '<style>' + INF.Laudo.CSS_GRAFICO + '</style><rect width="100%" height="100%" fill="#fff"/>';
      const texto = svg.replace(/(<svg[^>]*>)/, '$1' + estilo);
      const img = new Image();
      img.onload = function () {
        const cv = document.createElement('canvas'); cv.width = 920; cv.height = 640;
        cv.getContext('2d').drawImage(img, 0, 0, 920, 640);
        cv.toBlob(function (b) { b.arrayBuffer().then(function (buf) { ok({ png: new Uint8Array(buf), largura: 920, altura: 640 }); }); }, 'image/png');
      };
      img.onerror = function () { ok(null); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(texto);
    });
  }
  function montarLaudo() {
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    if (!soViz && (!E.modelo || E.modelo.erro)) { avisar('Calcule o modelo antes (aba Modelo).', 'erro'); return null; }
    if (!soViz && !E.projecao) ACOES.projetar();
    const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
    if (l.erro) { avisar(l.erro, 'erro'); return null; }
    const html = INF.Laudo.html(l);
    // lista, sem repetir, do que ficou em branco (ex.: "número da matrícula")
    E.pendenciasLaudo = Array.from(new Set((html.match(/\[preencher:[^\]]*\]/g) || []).map(function (x) { return x.slice(11, -1).trim(); })));
    return { laudo: l, html: html };
  }
  const nomeLaudo = function () { return 'Laudo de avaliação - ' + (E.proj.projeto.nome || 'imóvel').replace(/[\\/:*?"<>|]/g, ' '); };
  ACOES.laudoWord = async function () {
    const r = montarLaudo(); if (!r) return;
    avisar('Montando o Word…');
    const imagens = {};
    for (let i = 0; i < r.laudo.blocos.length; i++) {
      if (r.laudo.blocos[i].t === 'grafico') imagens[i] = await svgParaPng(r.laudo.blocos[i].svg);
    }
    Dd.baixar(nomeLaudo() + '.docx', INF.Laudo.docx(r.laudo, imagens), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    E.aviso = null; desenhar();
  };
  function imprimirHtml(html) {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const quadro = document.createElement('iframe');
    quadro.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
    quadro.src = url;
    quadro.onload = function () { setTimeout(function () { quadro.contentWindow.focus(); quadro.contentWindow.print(); setTimeout(function () { quadro.remove(); URL.revokeObjectURL(url); }, 60000); }, 400); };
    document.body.appendChild(quadro);
  }
  ACOES.laudoPDF = function () { const r = montarLaudo(); if (r) { imprimirHtml(r.html); desenhar(); } };
  ACOES.laudoVer = function () {
    const r = montarLaudo(); if (!r) return;
    window.open(URL.createObjectURL(new Blob([r.html], { type: 'text/html;charset=utf-8' })), '_blank', 'noopener');
    desenhar();
  };


  // ---- tipo de laudo: ações -------------------------------------------------------------------
  function tipoLaudo() { if (!E.proj.tipoLaudo) E.proj.tipoLaudo = INF.TiposLaudo.ler(E.proj); return E.proj.tipoLaudo; }
  ACOES.tlAtalho = function (i) {
    const a = INF.TiposLaudo.ATALHOS[Number(i)], t = tipoLaudo();
    t.destino = a.destino; t.objetos = a.objetos.slice(); if (a.ambito) t.ambito = a.ambito;
    mudou(false); avisar('Tipo de laudo: ' + a.rotulo + '.', 'ok');
  };
  ACOES.novoQuesito = function () { tipoLaudo().quesitos.push({ parte: '', pergunta: '', resposta: '' }); mudou(false); desenhar(); };
  ACOES.tirarQuesito = function (i) { tipoLaudo().quesitos.splice(Number(i), 1); mudou(false); desenhar(); };
  ACOES.novaBenf = function () { tipoLaudo().benfeitorias.push({ descricao: '', quantidade: null, unidade: '', unitario: null, depreciacao: null }); mudou(false); desenhar(); };
  ACOES.tirarBenf = function (i) { tipoLaudo().benfeitorias.splice(Number(i), 1); mudou(false); desenhar(); };

  // ---- galeria dos 20 estilos: capa e primeira página de cada um, lado a lado --------------------
  ACOES.verEstilos = function () {
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    if (!soViz && (!E.modelo || E.modelo.erro)) return avisar('Calcule o modelo antes (aba Modelo) para ver o laudo nos 20 estilos.', 'erro');
    if (!soViz && !E.projecao) ACOES.projetar();
    const original = (E.proj.laudo || {}).estilo;
    let pag = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Os 20 estilos</title><style>body{font-family:Arial;margin:16px;background:#eee}'
      + '.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}.c{background:#fff;padding:8px;border-radius:8px}.c h3{margin:0 0 6px;font-size:14px}'
      + 'iframe{width:100%;height:460px;border:1px solid #ccc;background:#fff}</style></head><body><h2>Os 20 estilos — mesmo conteúdo, apresentação diferente</h2><div class="g">';
    E.proj.laudo = E.proj.laudo || {};
    INF.Estilos.LISTA.forEach(function (e) {
      E.proj.laudo.estilo = e.numero;
      const l = INF.Laudo.montar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
      if (l.erro) return;
      // capa + sumário + primeiro capítulo, para comparar
      const q = l.blocos.findIndex(function (b, i) { return b.t === 'h1' && i > 3; });
      l.blocos = l.blocos.slice(0, Math.max(q + 6, 8));
      pag += '<div class="c"><h3>' + e.numero + ' — ' + h(e.nome) + '</h3><iframe srcdoc="' + h(INF.Laudo.html(l)) + '"></iframe></div>';
    });
    E.proj.laudo.estilo = original;
    pag += '</div></body></html>';
    window.open(URL.createObjectURL(new Blob([pag], { type: 'text/html;charset=utf-8' })), '_blank', 'noopener');
  };

  // ---- inventário de documentos ----------------------------------------------------------------
  const lerComo = function (arquivo, modo) {
    return new Promise(function (ok, falhou) {
      const f = new FileReader();
      f.onload = function () { ok(f.result); }; f.onerror = function () { falhou(new Error('Não consegui ler ' + arquivo.name)); };
      if (modo === 'texto') f.readAsText(arquivo, 'utf-8'); else f.readAsDataURL(arquivo);
    });
  };
  ACOES.abrirDoc = function (chave) {
    const d = E.docs.find(function (x) { return x.hash === chave || x.nome === chave; });
    if (d) window.open(URL.createObjectURL(d.file), '_blank', 'noopener');
  };
  // Lê TODOS os documentos NOVOS ou ALTERADOS, um por vez, com a lista do modelo.
  ACOES.inventariar = async function () {
    E.proj.inventario = E.proj.inventario || {};
    const t = INF.TiposLaudo.ler(E.proj);
    const campos = INF.Inventario.paraIA(t), modelo = nomeModelo(t);
    const pendentes = E.docs.filter(function (d) { return d.hash && ['NOVO', 'ALTERADO'].indexOf(situacaoDoc(d)) >= 0; });
    let lidos = 0; const erros = [];
    for (const d of pendentes) {
      E.inventariando = d.nome; desenhar();
      const f = d.file, ext = (d.nome.split('.').pop() || '').toLowerCase();
      try {
        let arq;
        if (f.type === 'application/pdf' || ext === 'pdf') {
          if (f.size > 30 * 1024 * 1024) throw new Error('PDF acima de 30 MB: divida o arquivo');
          arq = { nome: d.nome, mime: 'application/pdf', base64: String(await lerComo(f, 'url')).split(',')[1] };
        } else if (/^image\//.test(f.type) || /^(jpe?g|png|webp|heic)$/.test(ext)) {
          const r = await reduzirImagem(f);
          arq = { nome: d.nome, mime: 'image/jpeg', base64: r.dataUrl.split(',')[1] };
        } else if (/^(txt|csv|kml|xml|json|md)$/.test(ext)) {
          arq = { nome: d.nome, texto: String(await lerComo(f, 'texto')) };
        } else { d.status = 'formato não lido — salve em PDF'; continue; }
        // se o arquivo foi ALTERADO, a leitura antiga (mesmo nome) sai do cache
        Object.keys(E.proj.inventario).forEach(function (hh) { if (E.proj.inventario[hh].arquivo === d.nome && hh !== d.hash) delete E.proj.inventario[hh]; });
        const r = await Nv.inventariar(E.id, arq, campos, modelo);
        r.lidoEm = new Date().toISOString(); r.hash = d.hash;
        E.proj.inventario[d.hash] = r;
        d.status = ''; lidos++;
        mudou(false);
      } catch (e) { d.status = 'erro: ' + e.message; erros.push(d.nome); }
    }
    E.inventariando = null;
    avisar(lidos + ' documento(s) lido(s).' + (erros.length ? ' Com erro: ' + erros.join(', ') + '.' : ' Confira o inventário do modelo abaixo.'), erros.length ? 'erro' : 'ok');
  };
  ACOES.aplicarInventario = async function () {
    const F = fichaAtual(), inv = E.proj.inventario || {};
    const marcados = function (atr) { return Array.prototype.slice.call(document.querySelectorAll('[' + atr + ']')).filter(function (el) { return el.checked && !el.disabled; }).map(function (el) { return el.getAttribute(atr); }); };
    const agora = new Date().toISOString();
    E.proj.historico = E.proj.historico || [];
    let feitos = 0;
    const gravar = function (campoId, destino, valor, fonte) {
      const numerico = /^tipoLaudo\.area/.test(destino);
      const v = numerico ? U.lerNumero(valor) : valor;
      let partes = destino.split('.'), alvo = E.proj;
      if (partes[0] === 'tipoLaudo') { alvo = tipoLaudo(); partes = partes.slice(1); }
      for (let k = 0; k < partes.length - 1; k++) { alvo[partes[k]] = alvo[partes[k]] || {}; alvo = alvo[partes[k]]; }
      const de = alvo[partes[partes.length - 1]];
      alvo[partes[partes.length - 1]] = v;
      E.proj.historico.push({ quando: agora, autor: E.proj.projeto.autor || '', origem: 'inventário de documentos', acao: 'preencher', amostra: null, campo: destino,
        de: de === undefined ? null : de, para: v, evidencia: fonte ? fonte.arquivo + (fonte.pagina ? ', p. ' + fonte.pagina : '') + (fonte.trecho ? ': "' + fonte.trecho + '"' : '') : '' });
      feitos++;
    };
    // campos resolvidos marcados
    marcados('data-ficha').forEach(function (i) { const f = F.ficha[Number(i)]; if (f && f.destino) gravar(f.campo, f.destino, f.valor, f.fonte); });
    // divergências decididas pelo avaliador (vira decisão, com a fonte escolhida)
    Array.prototype.slice.call(document.querySelectorAll('[data-decidir]')).forEach(function (el) {
      if (el.value === '') return;
      const f = F.ficha[Number(el.dataset.decidir)], c = f.candidatos[Number(el.value)];
      E.proj.inventarioDecisoes = E.proj.inventarioDecisoes || {};
      E.proj.inventarioDecisoes[f.campo] = { valor: c.valor, fonte: c, porque: 'escolha entre documentos divergentes' };
      if (f.destino) gravar(f.campo, f.destino, c.valor, c);
    });
    // outros achados para o laudo
    const achados = [];
    Object.keys(inv).forEach(function (hh) { (inv[hh].achados || []).forEach(function (a, k) { achados.push(Object.assign({ arquivo: inv[hh].arquivo, chave: hh + ':' + k }, a)); }); });
    marcados('data-achado').forEach(function (i) {
      const a = achados[Number(i)];
      E.proj.laudo = E.proj.laudo || {};
      E.proj.laudo.achadosIncluidos = E.proj.laudo.achadosIncluidos || [];
      E.proj.laudo.achadosIncluidos.push({ chave: a.chave, assunto: a.assunto, texto: a.texto, fonte: a.arquivo + (a.pagina ? ', p. ' + a.pagina : '') });
      feitos++;
    });
    // quesitos e fotos
    marcados('data-sug-quesitos').forEach(function (hh) { const t = tipoLaudo(); (inv[hh].quesitos || []).forEach(function (q) { t.quesitos.push({ parte: q.parte, pergunta: q.pergunta, resposta: '' }); }); feitos++; });
    for (const hh of marcados('data-sug-foto')) {
      const d = E.docs.find(function (x) { return x.hash === hh; });
      if (!d) continue;
      const r = await reduzirImagem(d.file);
      E.proj.fotos = E.proj.fotos || [];
      E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'avaliando', legenda: String(inv[hh].resumo || '').slice(0, 120) }, r));
      feitos++;
    }
    if (!feitos) return avisar('Marque o que quer aplicar.', 'erro');
    mudou(false);
    avisar(feitos + ' item(ns) aplicado(s) ao laudo, cada um com o documento de origem.', 'ok');
  };

  // ---- vizinhança: incluir e tirar imóveis, ambientes e anomalias ---------------------------------------
  function viz() { const TL = INF.TiposLaudo; E.proj.vizinhanca = Object.assign(TL.vizinhancaPadrao(), E.proj.vizinhanca || {}); return E.proj.vizinhanca; }
  const partes3 = function (arg) { return String(arg).split('.').map(Number); };
  ACOES.vizNovoImovel = function () { viz().imoveis.push({ endereco: '', ocupante: '', tipo: '', ambientes: [{ nome: 'Fachada', anomalias: [] }] }); mudou(false); desenhar(); };
  ACOES.vizTirarImovel = function (i) { if (!confirm('Remover o imóvel ' + (Number(i) + 1) + '?')) return; viz().imoveis.splice(Number(i), 1); mudou(false); desenhar(); };
  ACOES.vizNovoAmbiente = function (i) { const im = viz().imoveis[Number(i)]; im.ambientes = im.ambientes || []; im.ambientes.push({ nome: '', anomalias: [] }); mudou(false); desenhar(); };
  ACOES.vizTirarAmbiente = function (arg) { const q = partes3(arg); viz().imoveis[q[0]].ambientes.splice(q[1], 1); mudou(false); desenhar(); };
  ACOES.vizNovaAnomalia = function (arg) { const q = partes3(arg); const a = viz().imoveis[q[0]].ambientes[q[1]]; a.anomalias = a.anomalias || []; a.anomalias.push({ tipo: '', localizacao: '', dimensao: '', descricao: '' }); mudou(false); desenhar(); };
  ACOES.vizTirarAnomalia = function (arg) { const q = partes3(arg); viz().imoveis[q[0]].ambientes[q[1]].anomalias.splice(q[2], 1); mudou(false); desenhar(); };

  // relatório
  function htmlRelatorio() {
    if (!E.modelo || E.modelo.erro) { avisar('Calcule o modelo antes.', 'erro'); return null; }
    if (!E.projecao) ACOES.projetar();
    return INF.Relatorio.gerar({ proj: E.proj, modelo: E.modelo, diag: E.diag, projecao: E.projecao });
  }
  ACOES.abrirRelatorio = function () {
    const html = htmlRelatorio(); if (!html) return;
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    window.open(url, '_blank', 'noopener');
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  };
  ACOES.baixarRelatorio = function () {
    const html = htmlRelatorio(); if (!html) return;
    Dd.baixar((E.proj.projeto.nome || 'avaliacao') + ' - tratamento estatístico.html', html, 'text/html;charset=utf-8');
  };

  // arquivo e nuvem
  ACOES.recuperarAnterior = function () {
    const ant = Dd.lerAnterior(); if (!ant) return;
    if (!confirm('Abrir "' + (ant.projeto.nome || 'projeto anterior') + '"? O projeto atual fica guardado como anterior.')) return;
    E.proj = ant; E.id = null; guardarId(); limparCalculos(); Dd.salvarLocal(ant); E.sujo = true; E.aba = 'projeto'; desenhar();
  };
  ACOES.novo = function () {
    if (E.sujo && !confirm('Começar um projeto novo? O atual fica salvo neste navegador até você substituir.')) return;
    E.proj = Dd.novoProjeto(); E.id = null; guardarId(); limparCalculos(); E.aba = 'projeto'; mudou(false); E.sujo = false; desenhar();
  };
  ACOES.baixarProjeto = function () {
    Dd.baixar((E.proj.projeto.nome || 'projeto') + '.inferencia.json', JSON.stringify(E.proj, null, 1), 'application/json');
  };
  ACOES.salvarNuvem = async function () {
    if (!Nv.logado()) return avisar('Entre no COON para salvar na nuvem. Enquanto isso o projeto fica neste navegador e pode ser baixado em .json.', 'erro');
    try { const r = await Nv.salvar(E.id, E.proj); E.id = r.id; guardarId(); E.sujo = false; avisar(Nv.sessao.banco === 'supabase' ? 'Projeto salvo na nuvem.' : 'Projeto salvo no servidor (modo teste, sem Supabase).', 'ok'); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.meusProjetos = async function () {
    if (!Nv.logado()) return avisar('Entre no COON para ver os projetos da nuvem.', 'erro');
    try { E.lista = await Nv.listar(); E.aba = 'lista'; desenhar(); }
    catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.abrirDaNuvem = async function (id) {
    try {
      const r = await Nv.abrir(id);
      E.proj = Dd.normalizar(r.dados); E.id = r.id; guardarId(); limparCalculos(); E.sujo = false; Dd.salvarLocal(E.proj); E.aba = 'projeto'; desenhar();
    } catch (e) { avisar(e.message, 'erro'); }
  };
  ACOES.excluirDaNuvem = async function (id) {
    if (!confirm('Excluir este projeto da nuvem?')) return;
    try { await Nv.excluir(id); ACOES.meusProjetos(); } catch (e) { avisar(e.message, 'erro'); }
  };
  ABAS.lista = function () {
    const l = E.lista || [];
    if (!l.length) return '<p class="vazio">Nenhum projeto na nuvem ainda.</p>';
    return '<section class="cartao"><h2>Meus projetos</h2><div class="rolagem"><table class="tabela"><thead><tr><th>Trabalho</th><th>Tipologia</th><th>Município</th><th>n</th><th>R²</th><th>Alterado</th><th></th></tr></thead><tbody>'
      + l.map(function (p) {
        return '<tr><td class="esq">' + h(p.nome || '(sem nome)') + '</td><td>' + h(p.tipologia) + '</td><td>' + h(p.municipio) + '</td><td>' + (p.resumo ? p.resumo.n : '—') + '</td><td>' + (p.resumo ? U.fmt(p.resumo.R2, 4) : '—') + '</td><td>' + new Date(p.alterado_em).toLocaleString('pt-BR') + '</td>'
          + '<td><button class="leve" data-acao="abrirDaNuvem" data-arg="' + h(p.id) + '">Abrir</button><button class="leve perigo" data-acao="excluirDaNuvem" data-arg="' + h(p.id) + '">Excluir</button></td></tr>';
      }).join('') + '</tbody></table></div></section>';
  };

  function guardarId() { try { if (E.id) localStorage.setItem('inferencia-nbr:id', E.id); else localStorage.removeItem('inferencia-nbr:id'); } catch (e) { /* sem armazenamento */ } }
  function limparCalculos() { E.modelo = E.diag = E.projecao = E.rna = E.busca = E.conferencia = E.conferenciaIA = E.anuncio = E.importacao = null; }

  // ---------------------------------------------------------------------------
  // Desenho da tela
  // ---------------------------------------------------------------------------
  function atualizarTopo() {
    const t = document.getElementById('tituloProjeto');
    if (t) t.textContent = (E.proj.projeto.nome || 'Projeto sem nome') + (E.sujo ? ' •' : '');
    const st = document.getElementById('statusNuvem');
    if (st) {
      const s = Nv.sessao;
      st.textContent = Nv.logado() ? (s.usuario.nome || s.usuario.email) + ' · ' + (s.banco === 'supabase' ? 'nuvem' : 'servidor local') : (s ? 'não conectado' : 'sem servidor (trabalho local)');
      st.className = 'status ' + (Nv.logado() ? 'on' : 'off');
    }
  }

  function desenhar() {
    const nav = document.getElementById('abas');
    const sit = INF.Etapas.situacao(E.proj, E);
    E.situacao = sit;
    const inicioOk = sit.projeto.completa;
    nav.innerHTML = ABAS_MENU.map(function (a) {
      const st = sit[a[0]] || { completa: true, liberada: true };
      const et = INF.Etapas.porAba[a[0]] || {};
      let sinal, cls;
      if (!inicioOk && a[0] !== 'projeto') { sinal = '·'; cls = 'neutro'; }
      else if (!et.obrigatoria) { sinal = st.liberada ? '·' : '✗'; cls = st.liberada ? 'neutro' : 'erro'; }
      else if (!st.liberada) { sinal = '✗'; cls = 'erro'; }
      else if (st.completa) { sinal = '✓'; cls = 'ok'; }
      else { sinal = '✗'; cls = 'erro'; }
      const dica = !inicioOk && a[0] !== 'projeto' ? 'Complete antes a aba 1 (Projeto)' : !st.liberada ? 'Pode editar, mas para rodar complete antes: ' + st.bloqueio.etapa + (st.bloqueio.faltas.length ? ' — falta: ' + st.bloqueio.faltas.join(', ') : '')
        : (st.faltas && st.faltas.length ? 'Falta: ' + st.faltas.join(', ') : (et.obrigatoria ? 'Etapa completa' : 'Etapa de apoio'));
      return '<button class="aba' + (E.aba === a[0] ? ' ativa' : '') + '" data-aba="' + a[0] + '" title="' + h(dica) + '">' + a[1]
        + '<span class="sinal-aba ' + cls + '">' + sinal + '</span></button>';
    }).join('');
    const main = document.getElementById('conteudo');
    const aviso = E.aviso ? '<div class="aviso ' + E.aviso.tipo + '" role="status">' + h(E.aviso.texto) + '<button class="fechar" data-acao="fecharAviso" aria-label="Fechar">×</button></div>' : '';
    const pos = window.scrollY;
    const pg = INF.Etapas.progresso(sit), stA = sit[E.aba];
    const barraEtapas = '<div class="etapas"><div class="etapas-barra"><span style="width:' + Math.round(pg.feitas / pg.total * 100) + '%"></span></div>'
      + '<small>' + pg.feitas + ' de ' + pg.total + ' etapas obrigatórias completas' + (pg.proxima ? ' · próxima: <b>' + h(pg.proxima.rotulo) + '</b>' + (sit[pg.proxima.aba].faltas.length ? ' — falta: ' + h(sit[pg.proxima.aba].faltas.join(', ')) : '') : ' · tudo pronto para o laudo') + '</small>'
      + (stA && stA.faltas && stA.faltas.length && INF.Etapas.porAba[E.aba].obrigatoria ? '<div class="sinal sinal-erro">✗ Nesta etapa falta: ' + h(stA.faltas.join('; ')) + '</div>' : (stA && INF.Etapas.porAba[E.aba] && INF.Etapas.porAba[E.aba].obrigatoria ? '<div class="sinal sinal-ok">✓ Etapa completa</div>' : ''))
      + '</div>';
    main.innerHTML = aviso + barraEtapas + (ABAS[E.aba] ? ABAS[E.aba]() : '');
    desenharDuvidas();
    window.scrollTo(0, pos);
    atualizarTopo();
  }
  ACOES.fecharAviso = function () { E.aviso = null; desenhar(); };


  // ---------------------------------------------------------------------------
  // QUADRO DE DÚVIDAS — pergunte à IA como preencher, calcular e interpretar
  // ---------------------------------------------------------------------------
  // A IA recebe o manual do programa (no servidor) e este retrato do estado da
  // tela. Sem CPF e sem telefone. Ela orienta; não preenche e não inventa dado.
  E.duvidas = E.duvidas || [];
  function contextoDuvida() {
    const p = E.proj, sit = INF.Etapas.situacao(p, E), m = E.modelo && !E.modelo.erro ? E.modelo : null, pr = E.projecao && !E.projecao.erro ? E.projecao : null;
    const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
    const tl = INF.TiposLaudo.ler(p), IV = INF.Inventario;
    return {
      abaAberta: (INF.Etapas.porAba[E.aba] || {}).rotulo || E.aba,
      etapas: INF.Etapas.ETAPAS.map(function (x) { return { etapa: x.rotulo, obrigatoria: x.obrigatoria, completa: sit[x.aba].completa, falta: sit[x.aba].faltas }; }),
      projeto: { tipologia: p.projeto.tipologia, municipio: p.projeto.municipio, dataBase: p.projeto.dataBase, temCodigo: !!p.projeto.codigo, temResponsavel: !!p.projeto.autor,
        fatorOferta: p.config.aplicarFatorOferta ? p.config.fatorOferta : 'não aplicado', raioKm: INF.Modelos.raio(p) },
      laudo: { modelo: INF.Modelos.doProjeto(p).nome, nivel: INF.Modelos.doProjeto(p).nivel, estilo: INF.Estilos.doProjeto(p).numero, destino: tl.destino, objetos: tl.objetos,
        dadosSemOrigem: IV.ficha(tl, p.inventario || {}, p.inventarioDecisoes || {}, valorAtualCampo).filter(function (f) { return f.obrig && f.estado !== 'RESOLVIDA'; }).map(function (f) { return f.rotulo + ' (' + f.estado + ')'; }) },
      variaveis: p.variaveis.map(function (v) { return { nome: v.nome, tipo: v.tipo, unidade: v.unidade, direcao: v.direcao, escala: p.modelo.transf[v.nome] || '' }; }),
      amostras: { total: p.amostras.length, noCalculo: ativas.length, ofertas: ativas.filter(function (a) { return a.natureza === 'oferta'; }).length,
        semData: ativas.filter(function (a) { return !a.data; }).length, semCoordenadas: ativas.filter(function (a) { return !(Number.isFinite(a.lat) && Number.isFinite(a.lon)); }).length },
      conferencia: (E.conferencia || []).slice(0, 15).map(function (c) { return (c.amostra ? 'amostra ' + c.amostra + ': ' : '') + c.texto; }),
      modelo: m ? { equacao: m.equacao, n: m.n, k: m.p - 1, R2: +m.R2.toFixed(4), R2aj: +m.R2aj.toFixed(4), sigF: m.sigF, regressores: m.indep.map(function (v, j) { return { nome: v.nome, escala: v.transf, sig: +m.sig[j + 1].toFixed(4) }; }),
        outliers: E.diag ? E.diag.outliers : [], normalidadeShapiroP: E.diag ? +E.diag.sw.p.toFixed(4) : null } : (E.modelo && E.modelo.erro ? { erro: E.modelo.erro } : 'não calculado'),
      avaliacao: pr ? { estimativa: pr.central, amplitudeIC: +pr.amplitude.toFixed(4), grauFundamentacao: pr.fundamentacao.grau, grauPrecisao: pr.grauPrecisao, pendenciasGrau: pr.fundamentacao.pendencias } : 'não estimada',
      aviso: E.aviso ? E.aviso.texto : ''
    };
  }
  function desenharDuvidas() {
    let caixa = document.getElementById('duvidas');
    if (!caixa) { caixa = document.createElement('div'); caixa.id = 'duvidas'; document.body.appendChild(caixa); }
    const ligado = Nv.sessao && Nv.sessao.duvidasIA;
    if (!E.duvidasAberto) { caixa.innerHTML = '<button class="duvidas-botao" data-acao="abrirDuvidas">Dúvidas? Pergunte à IA</button>'; return; }
    caixa.innerHTML = '<div class="duvidas-painel"><div class="duvidas-topo"><b>Dúvidas — assistente do preenchimento</b><button class="leve" data-acao="fecharDuvidas">×</button></div>'
      + '<div class="duvidas-msgs">' + (E.duvidas.length ? E.duvidas.map(function (m) { return '<div class="msg ' + (m.papel === 'ia' ? 'ia' : 'eu') + '">' + h(m.texto).replace(/\n/g, '<br>') + '</div>'; }).join('')
        : '<p class="nota">Pergunte sobre qualquer aba: como preencher, por que algo não roda, o que significa um resultado, onde conseguir um dado. A IA vê o estado atual da tela (sem CPF nem telefone). Ela orienta; não preenche nem inventa dado.</p>')
      + (E.perguntando ? '<div class="msg ia">Pensando…</div>' : '') + '</div>'
      + '<div class="duvidas-rodape"><textarea id="duvidaTexto" rows="2" placeholder="Ex.: por que a aba Modelo está vermelha?"></textarea>'
      + '<button class="principal" data-acao="perguntarIA"' + (ligado && !E.perguntando ? '' : ' disabled') + '>Perguntar</button></div>'
      + (ligado ? '' : '<small class="nota">Desligado: falta a chave da IA no servidor.</small>') + '</div>';
    const msgs = caixa.querySelector('.duvidas-msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }
  ACOES.abrirDuvidas = function () { E.duvidasAberto = true; desenharDuvidas(); const t = document.getElementById('duvidaTexto'); if (t) t.focus(); };
  ACOES.fecharDuvidas = function () { E.duvidasAberto = false; desenharDuvidas(); };
  ACOES.perguntarIA = async function () {
    const t = document.getElementById('duvidaTexto'), pergunta = (t && t.value || '').trim();
    if (!pergunta) return;
    E.duvidas.push({ papel: 'eu', texto: pergunta }); E.perguntando = true; desenharDuvidas();
    try {
      const r = await Nv.duvida(E.id, pergunta, contextoDuvida(), E.duvidas.slice(0, -1));
      E.duvidas.push({ papel: 'ia', texto: r.resposta });
    } catch (e) { E.duvidas.push({ papel: 'ia', texto: 'Não consegui responder: ' + e.message }); }
    E.perguntando = false; desenharDuvidas();
  };

  // ---------------------------------------------------------------------------
  // Pré-requisitos das ações que RODAM (a aba abre sempre; o cálculo não roda
  // com dado faltando). Cada ação lista as etapas que precisam estar completas.
  // ---------------------------------------------------------------------------
  const PRE_REQUISITOS = {
    calcular: ['projeto', 'variaveis', 'amostras'], buscar: ['projeto', 'variaveis', 'amostras'], treinarRNA: ['projeto', 'variaveis', 'amostras', 'modelo'],
    calcularTudo: ['projeto', 'variaveis'], projetar: ['projeto', 'modelo'],
    laudoWord: ['projeto', 'avaliacao'], laudoPDF: ['projeto', 'avaliacao'], laudoVer: ['projeto', 'avaliacao'], verEstilos: ['projeto', 'avaliacao'],
    exportarPDF: ['projeto', 'avaliacao'], abrirRelatorio: ['projeto', 'avaliacao'], baixarRelatorio: ['projeto', 'avaliacao'],
    exportarExcel: ['projeto'], conferirIA: ['projeto', 'variaveis'], inventariar: ['projeto']
  };
  function faltaParaRodar(acao) {
    const lista = PRE_REQUISITOS[acao];
    if (!lista) return null;
    const sit = INF.Etapas.situacao(E.proj, E);
    const soViz = INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(E.proj));
    for (let i = 0; i < lista.length; i++) {
      if (soViz && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(lista[i]) >= 0) continue;
      const st = sit[lista[i]];
      if (!st.completa) return 'Não dá para rodar ainda: falta completar ' + INF.Etapas.porAba[lista[i]].rotulo + ' — ' + st.faltas.join('; ') + '. Você pode continuar editando qualquer aba.';
    }
    return null;
  }

  // ---------------------------------------------------------------------------
  // Ouvintes (delegação)
  // ---------------------------------------------------------------------------
  document.addEventListener('click', function (ev) {
    const aba = ev.target.closest('[data-aba]');
    // Regra: a aba 1 (Projeto) é a ÚNICA obrigatória antes de começar. Completa a aba 1,
    // todas as abas abrem e aceitam dados em qualquer ordem; o que não roda sem dado
    // é o botão de executar (PRE_REQUISITOS).
    if (aba) {
      const sitP = INF.Etapas.situacao(E.proj, E).projeto;
      if (aba.dataset.aba !== 'projeto' && !sitP.completa) {
        E.aba = 'projeto';
        avisar('Para começar, complete a aba 1 (Projeto): falta ' + sitP.faltas.join(', ') + '. Depois todas as abas ficam livres, em qualquer ordem.', 'erro');
        window.scrollTo(0, 0); return;
      }
      E.aba = aba.dataset.aba; E.aviso = null; desenhar(); window.scrollTo(0, 0); return;
    }
    const bt = ev.target.closest('[data-acao]');
    if (bt && ACOES[bt.dataset.acao] && !bt.disabled) {
      ev.preventDefault();
      const falta = faltaParaRodar(bt.dataset.acao);
      if (falta) return avisar(falta, 'erro');
      ACOES[bt.dataset.acao](bt.dataset.arg);
    }
  });

  document.addEventListener('change', function (ev) {
    const el = ev.target;
    const valorDe = function () {
      if (el.type === 'checkbox') return el.checked;
      if (el.hasAttribute('data-bool')) return el.value === 'true';
      if (el.hasAttribute('data-num')) { const n = U.lerNumero(el.value); return Number.isFinite(n) ? n : null; }
      return el.value;
    };

    // campos simples do projeto
    if (el.dataset.bind) {
      const r = resolver(el.dataset.bind);
      r.obj[r.chave] = valorDe();
      mudou(/^(modelo|config\.(fator|aplicar))/.test(el.dataset.bind));
      // redesenha para atualizar os sinais ✓/✗ da aba 1 e das abas
      if (/^projeto\.|^modelo\./.test(el.dataset.bind)) desenhar();
      return;
    }
    // células da grade de amostras
    if (el.dataset.amostra) {
      const a = E.proj.amostras.find(function (x) { return x.id === Number(el.dataset.amostra); });
      const ch = el.dataset.chave;
      if (ch === 'habilitada') a.habilitada = el.checked;
      else if (ch.indexOf('valores.') === 0) a.valores[ch.slice(8)] = valorDe();
      else a[ch] = valorDe();
      mudou(true);
      if (ch === 'habilitada') desenhar();
      return;
    }
    // propriedades de variável
    if (el.dataset.var) {
      const v = E.proj.variaveis.find(function (x) { return x.nome === el.dataset.var; });
      if (el.dataset.escala) {
        let perm = v.permitidas && v.permitidas.length ? v.permitidas.slice() : T.permitidasPorTipo(v.tipo);
        perm = el.checked ? perm.concat([el.dataset.escala]) : perm.filter(function (x) { return x !== el.dataset.escala; });
        v.permitidas = T.LISTA.map(function (t) { return t.id; }).filter(function (id) { return perm.indexOf(id) >= 0; });
        if (!v.permitidas.length) v.permitidas = ['x'];
      } else if (el.dataset.chave === 'codigos') {
        v.codigos = {};
        el.value.split(';').forEach(function (par) { const m = par.split('='); if (m.length === 2 && m[0].trim()) v.codigos[m[0].trim()] = m[1].trim(); });
      } else if (el.dataset.chave === 'tipo') {
        if (el.value === 'dependente' && Rg.dependente(E.proj) && Rg.dependente(E.proj) !== v) { avisar('Já existe uma dependente.', 'erro'); return; }
        v.tipo = el.value; v.permitidas = [];
        if (v.tipo !== 'identificacao' && !E.proj.modelo.transf[v.nome]) E.proj.modelo.transf[v.nome] = 'x';
        desenhar();
      } else v[el.dataset.chave] = el.value;
      mudou(true);
      return;
    }
    // tipo de laudo: âmbito/destino (rádio), objetos (marcar), quesitos e benfeitorias
    if (el.dataset.tl) {
      const t = tipoLaudo(); t[el.dataset.tl] = el.value;
      if (el.dataset.tl === 'ambito' && INF.TiposLaudo.IMOVEIS[el.value].indexOf(t.imovel) < 0) t.imovel = '';
      mudou(false); desenhar(); return;
    }
    if (el.dataset.tlObjeto) {
      const t = tipoLaudo();
      t.objetos = t.objetos.filter(function (o) { return o !== el.dataset.tlObjeto; });
      if (el.checked) t.objetos.push(el.dataset.tlObjeto);
      mudou(false); desenhar(); return;
    }
    if (el.dataset.quesito !== undefined) { tipoLaudo().quesitos[Number(el.dataset.quesito)][el.dataset.chave] = el.value; mudou(false); return; }
    if (el.dataset.benf !== undefined) {
      const b = tipoLaudo().benfeitorias[Number(el.dataset.benf)];
      b[el.dataset.chave] = el.dataset.chave === 'descricao' || el.dataset.chave === 'unidade' ? el.value : U.lerNumero(el.value);
      mudou(false); return;
    }
    // pasta ou arquivos para o inventário: identifica cada arquivo pelo SHA-256
    if ((el.id === 'arqPasta' || el.id === 'arqDocs') && el.files.length) {
      const novos = Array.prototype.slice.call(el.files).filter(function (f) { return !/^(\.|thumbs\.db|desktop\.ini)/i.test(f.name); });
      el.value = '';
      novos.forEach(function (f) {
        const d = { file: f, nome: f.name, caminho: f.webkitRelativePath || f.name, hash: '', status: '' };
        E.docs.push(d);
        hashArquivo(f).then(function (hh) {
          if (E.docs.some(function (x) { return x !== d && x.hash === hh; })) { E.docs.splice(E.docs.indexOf(d), 1); } else d.hash = hh;
          desenhar();
        });
      });
      desenhar(); return;
    }
    // modelo de laudo e estilo 1–20
    if (el.dataset.modelo) { if (el.value) { INF.Modelos.aplicar(E.proj, el.value); mudou(false); desenhar(); } return; }
    if (el.dataset.estilo) { E.proj.laudo = E.proj.laudo || {}; E.proj.laudo.estilo = Number(el.value); mudou(false); desenhar(); return; }
    // print do anúncio de uma amostra da grade
    if (el.dataset.printAmostra && el.files.length) {
      const idA = el.dataset.printAmostra, arq = el.files[0]; el.value = '';
      reduzirImagem(arq).then(function (r) {
        E.proj.fotos = E.proj.fotos || [];
        E.proj.fotos.push(Object.assign({ id: proximoIdFoto(), alvo: 'print:' + idA, legenda: 'Print do anúncio da amostra ' + idA }, r));
        mudou(false); desenhar();
      });
      return;
    }
    if (el.id === 'arqPrintAnuncio' && el.files.length) {
      reduzirImagem(el.files[0]).then(function (r) { E.anuncioPrint = r; desenhar(); });
      el.value = ''; return;
    }
    // campos da vistoria de vizinhança (caminho relativo a proj.vizinhanca)
    if (el.dataset.viz) {
      let o = viz(); const partes = el.dataset.viz.split('.');
      for (let k = 0; k < partes.length - 1; k++) o = o[/^\d+$/.test(partes[k]) ? Number(partes[k]) : partes[k]];
      o[partes[partes.length - 1]] = el.type === 'checkbox' ? el.checked : el.value;
      mudou(false);
      if (el.type === 'checkbox') desenhar();
      return;
    }
    // fotos do laudo
    if (el.dataset.foto) {
      const f = (E.proj.fotos || []).find(function (x) { return x.id === Number(el.dataset.foto); });
      if (f) { f[el.dataset.chave] = el.value; mudou(false); }
      return;
    }
    if ((el.id === 'arqFotos' || el.id === 'arqMapa') && el.files.length) {
      incluirFotos(Array.prototype.slice.call(el.files), el.id === 'arqMapa' ? 'mapa' : document.getElementById('fotoAlvo').value);
      el.value = '';
      return;
    }
    // origem dos dados (modelo híbrido)
    if (el.dataset.acaoMudar === 'origem') { E.proj.config.origemDados = el.value; mudou(false); desenhar(); return; }
    // opções da busca e da RNA
    if (el.dataset.busca) { E.opBusca[el.dataset.busca] = el.value; return; }
    if (el.dataset.rna) { E.opRna[el.dataset.rna] = el.value; return; }
    // mapeamento da importação
    if (el.dataset.mapa !== undefined) {
      const i = Number(el.dataset.mapa), v = el.value;
      E.importacao.mapa[i] = v === 'ignorar' ? { destino: 'ignorar' } : v === 'nova' ? { destino: 'nova' } : { destino: v.split(':')[0], nome: v.split(':').slice(1).join(':') };
      return;
    }
    // arquivo CSV escolhido
    if (el.id === 'arqCSV' && el.files[0]) {
      const leitor = new FileReader();
      leitor.onload = function () {
        const r = Dd.lerCSV(String(leitor.result)); r.linhas = Dd.limparLinhas(r.linhas);
        if (r.linhas.length < 2) return avisar('Planilha vazia.', 'erro');
        E.importacao = { cab: r.linhas[0], linhas: r.linhas.slice(1), mapa: Dd.mapaAutomatico(E.proj, r.linhas[0]) };
        desenhar();
      };
      leitor.readAsText(el.files[0], 'utf-8');
      return;
    }
    // abrir projeto .json do computador
    if (el.id === 'arqProjeto' && el.files[0]) {
      const leitor = new FileReader();
      leitor.onload = function () {
        try {
          const p = JSON.parse(String(leitor.result));
          if (p.formato !== 'inferencia-nbr') throw new Error();
          E.proj = Dd.normalizar(p); E.id = null; guardarId(); limparCalculos(); mudou(false); E.aba = 'projeto'; desenhar();
        } catch (e) { avisar('Arquivo não é um projeto do COON Infer.', 'erro'); }
      };
      leitor.readAsText(el.files[0], 'utf-8');
      el.value = '';
    }
  });

  // Ctrl+V com imagem na aba Pesquisa: vira o print do anúncio em edição
  document.addEventListener('paste', function (ev) {
    if (E.aba !== 'pesquisa' || !E.anuncio) return;
    const item = Array.prototype.slice.call((ev.clipboardData || {}).items || []).find(function (it) { return /^image\//.test(it.type); });
    if (!item) return;
    ev.preventDefault();
    reduzirImagem(item.getAsFile()).then(function (r) { E.anuncioPrint = r; desenhar(); });
  });

  // aviso ao fechar a aba com alteração não salva na nuvem
  window.addEventListener('beforeunload', function (ev) { if (E.sujo && Nv.logado()) { ev.preventDefault(); ev.returnValue = ''; } });

  // ---------------------------------------------------------------------------
  // Partida
  // ---------------------------------------------------------------------------
  Nv.iniciar().then(desenhar);
  desenhar();

  INF.Tela = { estado: E, desenhar: desenhar };
})(globalThis.INF = globalThis.INF || {});
