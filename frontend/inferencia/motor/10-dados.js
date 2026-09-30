/* =============================================================================
   10-dados.js — Projeto, amostras, importação/exportação e gravação
   -----------------------------------------------------------------------------
   O "projeto" é o arquivo de trabalho, em JSON
   aberto (qualquer um lê no Bloco de Notas). Estrutura:

   {
     formato: 'inferencia-nbr', versao: 1,
     projeto:   { nome, autor, tipologia, municipio, dataBase, finalidade },
     config:    { fatorOferta, aplicarFatorOferta, nivelIC, estimativaLn,
                  considerarIntercepto, semente, item1, item3, polo },
     variaveis: [ { nome, tipo, unidade, direcao, permitidas, codigos, descricao } ],
     amostras:  [ { id, habilitada, natureza, data, endereco, bairro,
                    informante, telefone, link, lat, lon, obs,
                    fatorAtualizacao, valores: { nomeVariavel: valor } } ],
     avaliando: { descricao, lat, lon, area, valores: { ... } },
     modelo:    { transf: { nomeVariavel: escala } }   ← o modelo escolhido
   }

   Tipos de variável (ordem de preferência da NBR, da mais objetiva para a
   mais subjetiva): quantitativa → dicotômica → proxy → código ajustado →
   código alocado ("qualitativa" aqui). Mais: dependente, tempo (meses da
   data do evento) e identificação (não entra no cálculo).
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const Dd = {};

  Dd.TIPOS = [
    { id: 'dependente',    rotulo: 'Dependente (y)' },
    { id: 'quantitativa',  rotulo: 'Quantitativa' },
    { id: 'dicotomica',    rotulo: 'Dicotômica (0/1)' },
    { id: 'proxy',         rotulo: 'Proxy' },
    { id: 'qualitativa',   rotulo: 'Código alocado / ajustado' },
    { id: 'tempo',         rotulo: 'Tempo (data do evento)' },
    { id: 'identificacao', rotulo: 'Identificação (não entra)' }
  ];

  // Projeto vazio, com a configuração padrão da Bio Store.
  Dd.novoProjeto = function () {
    return {
      formato: 'inferencia-nbr', versao: 1,
      projeto: { nome: '', autor: '', tipologia: 'Terreno', municipio: '', dataBase: new Date().toISOString().slice(0, 10), finalidade: '' },
      config: {
        fatorOferta: 0.90, aplicarFatorOferta: true, nivelIC: 0.80, estimativaLn: 'mediana',
        considerarIntercepto: true, semente: 12345, item1: 2, item3: 2, polo: { lat: null, lon: null, nome: '' }
      },
      variaveis: [
        { nome: 'VU', tipo: 'dependente', unidade: 'R$/m²', direcao: '', permitidas: [], codigos: {}, descricao: 'Valor unitário' }
      ],
      amostras: [],
      avaliando: { descricao: '', lat: null, lon: null, area: null, valores: {} },
      modelo: { transf: { VU: 'x' } }
    };
  };

  // Garante que um projeto lido de arquivo tem todos os campos.
  Dd.normalizar = function (p) {
    const base = Dd.novoProjeto();
    const r = Object.assign({}, base, p);
    r.projeto = Object.assign({}, base.projeto, p.projeto);
    r.config = Object.assign({}, base.config, p.config);
    r.config.polo = Object.assign({}, base.config.polo, (p.config || {}).polo);
    r.avaliando = Object.assign({}, base.avaliando, p.avaliando);
    r.avaliando.valores = r.avaliando.valores || {};
    r.modelo = Object.assign({ transf: {} }, p.modelo);
    r.variaveis = (p.variaveis || base.variaveis).map(function (v) {
      return Object.assign({ unidade: '', direcao: '', permitidas: [], codigos: {}, descricao: '' }, v);
    });
    r.amostras = (p.amostras || []).map(function (a, i) {
      return Object.assign({ id: i + 1, habilitada: true, natureza: 'oferta', data: '', endereco: '', bairro: '', informante: '', telefone: '', link: '', lat: null, lon: null, obs: '', fatorAtualizacao: 1, valores: {} }, a);
    });
    return r;
  };

  // ---------------------------------------------------------------------------
  // Variáveis
  // ---------------------------------------------------------------------------
  Dd.incluirVariavel = function (proj, nome, tipo) {
    nome = String(nome || '').trim();
    if (!nome) return 'Informe o nome.';
    if (!/^[A-Za-zÀ-ú_][\wÀ-ú]*$/.test(nome)) return 'Use só letras, números e _ (sem espaço).';
    if (proj.variaveis.some(function (v) { return v.nome === nome; })) return 'Já existe variável com esse nome.';
    if (tipo === 'dependente' && proj.variaveis.some(function (v) { return v.tipo === 'dependente'; })) return 'Só pode haver uma dependente.';
    proj.variaveis.push({ nome: nome, tipo: tipo, unidade: '', direcao: '', permitidas: [], codigos: {}, descricao: '' });
    if (tipo !== 'identificacao') proj.modelo.transf[nome] = 'x';
    return null;
  };

  Dd.renomearVariavel = function (proj, antigo, novo) {
    novo = String(novo || '').trim();
    if (!novo || proj.variaveis.some(function (v) { return v.nome === novo; })) return 'Nome inválido ou repetido.';
    const v = proj.variaveis.find(function (x) { return x.nome === antigo; });
    if (!v) return 'Variável não encontrada.';
    v.nome = novo;
    proj.amostras.forEach(function (a) { if (antigo in a.valores) { a.valores[novo] = a.valores[antigo]; delete a.valores[antigo]; } });
    if (antigo in proj.avaliando.valores) { proj.avaliando.valores[novo] = proj.avaliando.valores[antigo]; delete proj.avaliando.valores[antigo]; }
    if (antigo in proj.modelo.transf) { proj.modelo.transf[novo] = proj.modelo.transf[antigo]; delete proj.modelo.transf[antigo]; }
    return null;
  };

  Dd.excluirVariavel = function (proj, nome) {
    proj.variaveis = proj.variaveis.filter(function (v) { return v.nome !== nome; });
    proj.amostras.forEach(function (a) { delete a.valores[nome]; });
    delete proj.avaliando.valores[nome];
    delete proj.modelo.transf[nome];
  };

  // ---------------------------------------------------------------------------
  // Amostras
  // ---------------------------------------------------------------------------
  Dd.proximoId = function (proj) {
    return proj.amostras.reduce(function (m, a) { return Math.max(m, a.id); }, 0) + 1;
  };

  Dd.incluirAmostra = function (proj, dados) {
    const a = Object.assign({ id: Dd.proximoId(proj), habilitada: true, natureza: 'oferta', data: '', endereco: '', bairro: '', informante: '', telefone: '', link: '', lat: null, lon: null, obs: '', fatorAtualizacao: 1, valores: {} }, dados || {});
    proj.amostras.push(a);
    return a;
  };

  // Preenche a variável de tempo (meses entre a data da amostra e a data
  // base do laudo). No avaliando, tempo = 0 (a data base é "hoje").
  Dd.preencherTempo = function (proj, nomeVar) {
    let feitos = 0;
    proj.amostras.forEach(function (a) {
      const m = U.mesesEntre(a.data, proj.projeto.dataBase);
      if (Number.isFinite(m)) { a.valores[nomeVar] = Math.round(m * 10) / 10; feitos++; }
    });
    proj.avaliando.valores[nomeVar] = 0;
    return feitos;
  };

  // Preenche a distância ao polo valorizante (km, Haversine) para toda
  // amostra que tiver latitude/longitude.
  Dd.preencherDistancia = function (proj, nomeVar) {
    const polo = proj.config.polo;
    if (!Number.isFinite(polo.lat) || !Number.isFinite(polo.lon)) return -1;
    let feitos = 0;
    proj.amostras.forEach(function (a) {
      if (Number.isFinite(a.lat) && Number.isFinite(a.lon)) {
        a.valores[nomeVar] = Math.round(U.distanciaKm(a.lat, a.lon, polo.lat, polo.lon) * 1000) / 1000;
        feitos++;
      }
    });
    const av = proj.avaliando;
    if (Number.isFinite(av.lat) && Number.isFinite(av.lon)) {
      av.valores[nomeVar] = Math.round(U.distanciaKm(av.lat, av.lon, polo.lat, polo.lon) * 1000) / 1000;
    }
    return feitos;
  };

  // ---------------------------------------------------------------------------
  // CSV (Excel salva em CSV com ";" no Brasil)
  // ---------------------------------------------------------------------------
  // Lê CSV respeitando aspas. Detecta o separador (";", "," ou tabulação)
  // pelo que mais aparece na primeira linha.
  Dd.lerCSV = function (texto) {
    texto = texto.replace(/^﻿/, '');                  // tira BOM do Excel
    const primeira = texto.split(/\r?\n/)[0];
    const cands = [';', '\t', ','];
    const sep = cands.reduce(function (melhor, c) {
      return primeira.split(c).length > primeira.split(melhor).length ? c : melhor;
    }, ';');
    const linhas = [];
    let campo = '', linha = [], aspas = false;
    for (let i = 0; i < texto.length; i++) {
      const ch = texto[i];
      if (aspas) {
        if (ch === '"' && texto[i + 1] === '"') { campo += '"'; i++; }
        else if (ch === '"') aspas = false;
        else campo += ch;
      } else if (ch === '"') aspas = true;
      else if (ch === sep) { linha.push(campo); campo = ''; }
      else if (ch === '\n' || ch === '\r') {
        if (ch === '\r' && texto[i + 1] === '\n') i++;
        linha.push(campo); campo = '';
        if (linha.some(function (c) { return c.trim() !== ''; })) linhas.push(linha);
        linha = [];
      } else campo += ch;
    }
    linha.push(campo);
    if (linha.some(function (c) { return c.trim() !== ''; })) linhas.push(linha);
    return { separador: sep, linhas: linhas };
  };

  // Limpa a planilha antes de importar: tira a linha "Unnamed: 0, Unnamed: 1..."
  // que o pandas/Excel às vezes deixa acima do cabeçalho, e tira linhas com
  // no máximo uma célula preenchida (títulos, notas de rodapé, linhas vazias).
  Dd.limparLinhas = function (linhas) {
    let l = linhas.filter(function (li) { return li.filter(function (c) { return String(c).trim() !== ''; }).length > 1; });
    while (l.length && l[0].every(function (c) { return /^(unnamed:?\s*\d*|)$/i.test(String(c).trim()); })) l = l.slice(1);
    return l;
  };

  // Campos de identificação que o importador reconhece pelo nome da coluna.
  const CAMPOS_ID = {
    endereco: /^(endere[cç]o|localiza|logradouro|refer)/i,
    bairro: /^(bairro|zona|localidade)/i,
    informante: /^(informante|fonte|imobili|corretor|anunciante)/i,
    telefone: /^(telefone|fone|contato|whats)/i,
    link: /^(link|url|site)/i,
    data: /^(data)/i,
    natureza: /^(natureza|oferta|transa|tipo.?de.?dado)/i,
    lat: /^(lat)/i,
    lon: /^(lon|lng)/i,
    obs: /^(obs|observa)/i
  };

  // Importa as linhas para o projeto. "mapa" diz, para cada coluna do CSV,
  // se ela vira um campo de identificação, uma variável ou é ignorada.
  // Se não vier mapa, monta um automático pelo nome do cabeçalho.
  Dd.mapaAutomatico = function (proj, cabecalho) {
    return cabecalho.map(function (col) {
      const nome = col.trim();
      const v = proj.variaveis.find(function (x) { return x.nome.toLowerCase() === nome.toLowerCase(); });
      if (v) return { destino: 'variavel', nome: v.nome };
      for (const campo in CAMPOS_ID) if (CAMPOS_ID[campo].test(nome)) return { destino: 'campo', nome: campo };
      return { destino: 'ignorar', nome: nome };
    });
  };

  Dd.importarLinhas = function (proj, linhas, mapa) {
    let qtd = 0;
    linhas.forEach(function (l) {
      const a = Dd.incluirAmostra(proj, {});
      mapa.forEach(function (m, c) {
        const bruto = (l[c] || '').trim();
        if (m.destino === 'variavel') a.valores[m.nome] = U.lerNumero(bruto);
        else if (m.destino === 'campo') {
          if (m.nome === 'lat' || m.nome === 'lon') a[m.nome] = U.lerNumero(bruto);
          else if (m.nome === 'natureza') a.natureza = /transa|itbi|venda\s*efet/i.test(bruto) ? 'transacao' : 'oferta';
          else if (m.nome === 'data') a.data = Dd.dataIso(bruto);
          else a[m.nome] = bruto;
        }
      });
      qtd++;
    });
    return qtd;
  };

  // Converte "15/08/2026" ou "2026-08-15" em "2026-08-15".
  Dd.dataIso = function (s) {
    s = String(s || '').trim();
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      const ano = m[3].length === 2 ? '20' + m[3] : m[3];
      return ano + '-' + m[2].padStart(2, '0') + '-' + m[1].padStart(2, '0');
    }
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return m ? m[0] : '';
  };

  // Exporta as amostras em CSV com ";" e vírgula decimal (abre direto no
  // Excel brasileiro e volta pelo importador sem ajuste).
  Dd.exportarCSV = function (proj) {
    const vars = proj.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; });
    const cab = ['Nº', 'Habilitada', 'Natureza', 'Data', 'Endereço', 'Bairro', 'Informante', 'Telefone', 'Link', 'Latitude', 'Longitude', 'Observação']
      .concat(vars.map(function (v) { return v.nome; }));
    const q = function (s) { s = String(s === null || s === undefined ? '' : s); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const num = function (v) { return Number.isFinite(v) ? String(v).replace('.', ',') : ''; };
    const linhas = [cab.map(q).join(';')];
    proj.amostras.forEach(function (a) {
      linhas.push([a.id, a.habilitada === false ? 'não' : 'sim', a.natureza === 'transacao' ? 'transação' : 'oferta', a.data, a.endereco, a.bairro, a.informante, a.telefone, a.link, num(a.lat), num(a.lon), a.obs]
        .map(q).concat(vars.map(function (v) { return num(U.lerNumero(a.valores[v.nome])); })).join(';'));
    });
    return '﻿' + linhas.join('\r\n');
  };

  // ---------------------------------------------------------------------------
  // Gravação
  // ---------------------------------------------------------------------------
  // Autossalvamento local (conveniência: se o navegador fechar, não perde).
  // O arquivo "oficial" do laudo é o .json baixado pelo botão Salvar.
  const CHAVE = 'inferencia-nbr:projeto';
  const CHAVE_ANTERIOR = 'inferencia-nbr:anterior';
  // Rede de segurança: quando o projeto guardado é OUTRO (nome ou conteúdo
  // diferente), a versão que estava lá vai para "anterior" antes de ser
  // substituída — dá para recuperar pelo botão da aba Projeto.
  Dd.salvarLocal = function (proj) {
    try {
      const atual = localStorage.getItem(CHAVE);
      if (atual) {
        const a = JSON.parse(atual);
        const outro = (a.projeto && a.projeto.nome) !== proj.projeto.nome || (a.amostras || []).length > proj.amostras.length + 5;
        if (outro && (a.amostras || []).length) localStorage.setItem(CHAVE_ANTERIOR, atual);
      }
      localStorage.setItem(CHAVE, JSON.stringify(proj));
      return true;
    } catch (e) { return false; }
  };
  Dd.lerAnterior = function () {
    try { const s = localStorage.getItem(CHAVE_ANTERIOR); return s ? Dd.normalizar(JSON.parse(s)) : null; } catch (e) { return null; }
  };
  Dd.lerLocal = function () {
    try { const s = localStorage.getItem(CHAVE); return s ? Dd.normalizar(JSON.parse(s)) : null; } catch (e) { return null; }
  };

  // Dispara o download de um arquivo gerado na hora (JSON, CSV, HTML).
  Dd.baixar = function (nomeArquivo, conteudo, tipo) {
    const blob = new Blob([conteudo], { type: tipo || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = nomeArquivo;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  };

  INF.Dados = Dd;
})(globalThis.INF = globalThis.INF || {});
