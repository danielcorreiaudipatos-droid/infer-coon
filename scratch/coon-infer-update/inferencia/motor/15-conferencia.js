/* =============================================================================
   15-conferencia.js — Modelo híbrido e conferência das amostras
   -----------------------------------------------------------------------------
   MODELO HÍBRIDO — de onde vêm os dados antes de calcular:
     'meus'     → só as amostras que o engenheiro lançou no projeto
     'sistema'  → só amostras do banco de mercado (as dele de laudos
                  anteriores + as compartilhadas na COON), filtradas por
                  município e tipologia
     'hibrido'  → as dele + as do banco, sem repetir
   As amostras que vêm do banco entram marcadas (origem = 'banco') para o
   laudo dizer de onde saiu cada dado, e podem ser desligadas uma a uma.

   CONFERÊNCIA — duas camadas, nessa ordem:
     1) REGRAS FIXAS (este arquivo, sem IA, resultado sempre igual):
        duplicatas, VU muito fora do conjunto, dado velho, falta de
        informante/data/fonte, área ou valor zerado, oferta sem fator,
        micronumerosidade prevista, poucas amostras para as variáveis.
     2) IA (servidor/conferencia-ia.mjs): lê o conjunto e o modelo e
        aponta incoerências que regra não pega (ex.: "chácara de 2 ha no
        meio de fazendas de 300 ha", "descrição fala em benfeitoria mas o
        código diz sem benfeitoria"). Pode PROPOR correção com a evidência
        (corrigir um campo, tirar amostra do cálculo, trocar escala).
        Nada muda sozinho: cada correção só é aplicada quando o avaliador
        autoriza (aplicarCorrecao), fica no histórico e pode ser desfeita.
        Criar amostra ou inventar valor sem evidência é proibido.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, Rg = INF.Regressao;
  const C = {};

  // ---------------------------------------------------------------------------
  // Converte um registro do banco de mercado em amostra do projeto.
  // "mapa" diz qual variável recebe preço/área/VU; atributos com o mesmo nome
  // de uma variável do projeto entram direto (ex.: atributos.Topo → Topo).
  // ---------------------------------------------------------------------------
  C.registroParaAmostra = function (proj, reg) {
    const dep = Rg.dependente(proj);
    const valores = {};
    const preco = Number(reg.preco), area = Number(reg.area);
    proj.variaveis.forEach(function (v) {
      const nome = v.nome.toLowerCase();
      if (v.tipo === 'dependente') {
        // dependente: VU (preço/área) ou valor total, conforme a unidade dela
        const ehTotal = /^(vt|valor|preco|pre[çc]o)/.test(nome) && !/(vu|unit)/.test(nome);
        valores[v.nome] = ehTotal ? preco : (area > 0 ? preco / area : NaN);
      } else if (/^area|^área/.test(nome) && Number.isFinite(area)) {
        valores[v.nome] = area;
      } else if (reg.atributos && reg.atributos[v.nome] !== undefined) {
        valores[v.nome] = U.lerNumero(reg.atributos[v.nome]);
      }
    });
    return {
      natureza: reg.natureza, data: reg.data_evento || '', endereco: reg.endereco || '', bairro: reg.bairro || '',
      informante: reg.informante || '', telefone: reg.telefone || '', link: reg.link || '',
      lat: reg.lat, lon: reg.lon, obs: 'Banco de mercado' + (reg.compartilhado ? ' (compartilhado)' : ''),
      origem: 'banco', idBanco: reg.id, valores: valores, dependente: dep ? dep.nome : ''
    };
  };

  // Aplica a escolha de origem ao projeto. Devolve quantas entraram/saíram.
  C.aplicarOrigem = function (proj, modo, registrosBanco) {
    // tira do projeto o que veio do banco numa rodada anterior
    const antes = proj.amostras.length;
    proj.amostras = proj.amostras.filter(function (a) { return a.origem !== 'banco'; });
    const removidas = antes - proj.amostras.length;
    // devolve às amostras próprias o liga/desliga que tinham antes do modo 'sistema'
    proj.amostras.forEach(function (a) {
      if (a.habilitadaAntes !== undefined) { a.habilitada = a.habilitadaAntes; delete a.habilitadaAntes; }
    });
    // no modo 'sistema' as próprias ficam guardadas, mas fora do cálculo
    if (modo === 'sistema') proj.amostras.forEach(function (a) { a.habilitadaAntes = a.habilitada; a.habilitada = false; });
    let incluidas = 0;
    if (modo === 'sistema' || modo === 'hibrido') {
      const links = new Set(proj.amostras.map(function (a) { return (a.link || '').trim(); }).filter(Boolean));
      (registrosBanco || []).forEach(function (reg) {
        if (reg.link && links.has(reg.link.trim())) return;       // já está no projeto
        const a = C.registroParaAmostra(proj, reg);
        delete a.dependente;
        INF.Dados.incluirAmostra(proj, a);
        incluidas++;
      });
    }
    proj.config.origemDados = modo;
    return { removidas: removidas, incluidas: incluidas };
  };

  // ---------------------------------------------------------------------------
  // Regra da casa: OFERTA só vale com FONTE (informante) e com TELEFONE ou
  // LINK do anúncio — sem isso ninguém consegue conferir o dado depois.
  // Telefone escrito dentro do campo informante também vale.
  // (Transação não entra nesta regra: a fonte dela é o ITBI/cartório.)
  // ---------------------------------------------------------------------------
  const RE_TELEFONE = /\(?\d{2}\)?\s?9?[\s.]?\d{4}[-\s.]?\d{4}/;
  const FONTE_VAZIA = /^\s*(n[ãa]o\s+informad[oa]|n\/?i|sem\s+informante|a\s+confirmar|-+)?\s*$/i;
  C.ofertaRastreavel = function (a) {
    if (a.natureza !== 'oferta') return { ok: true };
    const temFonte = !FONTE_VAZIA.test(a.informante || '');
    const temLink = /^https?:\/\/\S+/i.test((a.link || '').trim());
    const temTelefone = RE_TELEFONE.test(a.telefone || '') || RE_TELEFONE.test(a.informante || '');
    const falta = [];
    if (!temFonte) falta.push('fonte (informante)');
    if (!temLink && !temTelefone) falta.push('telefone ou link');
    return { ok: falta.length === 0, falta: falta };
  };

  // Tira do cálculo (sem apagar) as ofertas que não cumprem a regra, com
  // registro no histórico — cada uma pode ser desfeita.
  C.desligarSemContato = function (proj) {
    proj.historico = proj.historico || [];
    const ids = [];
    proj.amostras.forEach(function (a) {
      if (a.habilitada === false) return;
      const r = C.ofertaRastreavel(a);
      if (r.ok) return;
      a.habilitada = false;
      ids.push(a.id);
      proj.historico.push({ quando: new Date().toISOString(), autor: proj.projeto.autor || '', origem: 'regra da casa', acao: 'desligar',
        amostra: a.id, campo: null, de: true, para: false, evidencia: 'Oferta sem ' + r.falta.join(' e '), motivo: 'Oferta precisa de fonte e de telefone ou link' });
    });
    return ids;
  };

  // ---------------------------------------------------------------------------
  // Conferência por regras fixas
  // ---------------------------------------------------------------------------
  // Cada achado: { nivel: 'erro'|'alerta'|'info', amostra: id|null, regra, texto }
  C.conferir = function (proj) {
    const achados = [];
    const add = function (nivel, amostra, regra, texto) { achados.push({ nivel: nivel, amostra: amostra, regra: regra, texto: texto }); };
    const dep = Rg.dependente(proj);
    const ativas = proj.amostras.filter(function (a) { return a.habilitada !== false; });
    if (!dep) { add('erro', null, 'dependente', 'Não há variável dependente definida.'); return achados; }

    // 1) preenchimento e identificação (itens 3 da Tabela 1 dependem disso)
    ativas.forEach(function (a) {
      const y = U.lerNumero(a.valores[dep.nome]);
      if (!Number.isFinite(y) || y <= 0) add('erro', a.id, 'valor', 'Valor de ' + dep.nome + ' vazio, zero ou negativo.');
      const rast = C.ofertaRastreavel(a);
      if (!rast.ok) add('erro', a.id, 'rastreavel', 'Oferta sem ' + rast.falta.join(' e ') + ': não pode entrar no cálculo.');
      else if (!a.informante) add('alerta', a.id, 'informante', 'Sem informante (fonte) identificado.');
      if (!a.data) add('alerta', a.id, 'data', 'Sem data do evento.');
      if (!a.endereco && !(Number.isFinite(a.lat) && Number.isFinite(a.lon))) add('alerta', a.id, 'localizacao', 'Sem endereço nem coordenadas.');
      const meses = U.mesesEntre(a.data, proj.projeto.dataBase);
      if (meses > 24) add('alerta', a.id, 'antiga', 'Dado com ' + Math.round(meses) + ' meses em relação à data base: atualizar ou justificar.');
      if (meses < -0.5) add('erro', a.id, 'futura', 'Data do evento posterior à data base.');
      proj.variaveis.forEach(function (v) {
        if (v.tipo === 'dependente' || v.tipo === 'identificacao') return;
        if (proj.modelo.transf[v.nome] === 'fora') return;
        if (!Number.isFinite(U.lerNumero(a.valores[v.nome]))) add('erro', a.id, 'vazio', 'Sem valor em ' + v.nome + '.');
      });
    });

    // 1b) exigências do MODELO de laudo: print/link das ofertas, raio, coordenadas
    if (INF.Modelos) {
      const modelo = INF.Modelos.doProjeto(proj), ex = INF.Modelos.exigencias(modelo), raio = INF.Modelos.raio(proj);
      const av = proj.avaliando, temAv = Number.isFinite(av.lat) && Number.isFinite(av.lon);
      const temPrint = function (a) { return (proj.fotos || []).some(function (f) { return f.alvo === 'print:' + a.id || f.alvo === 'amostra:' + a.id; }); };
      ativas.forEach(function (a) {
        if (ex.printOuLink && a.natureza === 'oferta' && !a.link && !temPrint(a)) add('alerta', a.id, 'print', 'Sem print nem link do anúncio (o modelo "' + modelo.nome + '" exige).');
        const temCoord = Number.isFinite(a.lat) && Number.isFinite(a.lon);
        if (ex.coordenadas && !temCoord) add('alerta', a.id, 'coordenadas', 'Sem coordenadas (o modelo "' + modelo.nome + '" exige, para medir o raio).');
        if (temAv && temCoord) {
          const km = U.distanciaKm(av.lat, av.lon, a.lat, a.lon);
          if (km > raio) add('alerta', a.id, 'raio', 'A ' + U.fmt(km, 1) + ' km do avaliando, além do raio de ' + U.fmt(raio, 0) + ' km: justificar no laudo ou retirar.');
        }
      });
      if (ex.coordenadas && !temAv) add('alerta', null, 'coordenadas', 'Informe latitude e longitude do imóvel avaliando (aba Laudo completo).');
    }

    // 2) duplicatas: mesmo link, ou mesmo valor + mesma área + mesmo informante
    const vistos = {};
    ativas.forEach(function (a) {
      const chaves = [];
      if (a.link) chaves.push('L:' + a.link.trim().toLowerCase());
      const area = proj.variaveis.find(function (v) { return /^area|^área/i.test(v.nome); });
      chaves.push('V:' + U.lerNumero(a.valores[dep.nome]).toFixed(2) + '|' + (area ? U.lerNumero(a.valores[area.nome]) : '') + '|' + (a.informante || '').toLowerCase());
      chaves.forEach(function (k) {
        if (vistos[k] && vistos[k] !== a.id) add('alerta', a.id, 'duplicata', 'Parece repetir a amostra ' + vistos[k] + '.');
        else vistos[k] = a.id;
      });
    });

    // 3) valor muito fora do conjunto (antes de qualquer modelo): regra do
    //    intervalo interquartil sobre ln(y). Não exclui nada, só avisa.
    const ys = ativas.map(function (a) { return { id: a.id, v: Math.log(U.lerNumero(a.valores[dep.nome])) }; })
      .filter(function (o) { return Number.isFinite(o.v); }).sort(function (a, b) { return a.v - b.v; });
    if (ys.length >= 8) {
      const q = function (f) { const i = f * (ys.length - 1), b = Math.floor(i); return ys[b].v + (ys[Math.min(b + 1, ys.length - 1)].v - ys[b].v) * (i - b); };
      const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
      ys.forEach(function (o) {
        if (o.v < q1 - 1.5 * iqr || o.v > q3 + 1.5 * iqr) add('alerta', o.id, 'discrepante', dep.nome + ' muito afastado do conjunto (' + U.fmtAuto(Math.exp(o.v)) + '). Conferir com o informante.');
      });
    }

    // 4) fator de oferta
    const ofertas = ativas.filter(function (a) { return a.natureza === 'oferta'; }).length;
    if (ofertas && !proj.config.aplicarFatorOferta) add('info', null, 'fator', ofertas + ' dado(s) de oferta sem fator de oferta aplicado.');

    // 5) quantidade mínima para as variáveis em uso: 3(k+1) (Grau I)
    const k = Rg.candidatas(proj).filter(function (v) { return proj.modelo.transf[v.nome] && proj.modelo.transf[v.nome] !== 'fora'; }).length;
    if (ativas.length < 3 * (k + 1)) add('erro', null, 'quantidade', ativas.length + ' amostras para ' + k + ' variáveis: mínimo 3(k+1) = ' + 3 * (k + 1) + '.');
    else if (ativas.length < 6 * (k + 1)) add('info', null, 'quantidade', 'Para o Grau III no item 2 seriam ' + 6 * (k + 1) + ' amostras (hoje ' + ativas.length + ').');

    // 6) micronumerosidade prevista nas variáveis de código/dicotômicas
    const minimo = INF.NBR.NORMA.micro(ativas.length);
    Rg.candidatas(proj).forEach(function (v) {
      if ((v.tipo !== 'qualitativa' && v.tipo !== 'dicotomica') || proj.modelo.transf[v.nome] === 'fora') return;
      const cont = {};
      ativas.forEach(function (a) { const c = String(U.lerNumero(a.valores[v.nome])); cont[c] = (cont[c] || 0) + 1; });
      Object.keys(cont).forEach(function (c) {
        if (cont[c] < minimo) add('alerta', null, 'micronumerosidade', v.nome + ' = ' + c + ' aparece em ' + cont[c] + ' amostra(s); mínimo ' + minimo + '. Reagrupar códigos ou coletar mais.');
      });
    });

    // 7) mistura de origens
    const doBanco = ativas.filter(function (a) { return a.origem === 'banco'; }).length;
    if (doBanco) add('info', null, 'origem', doBanco + ' amostra(s) vieram do banco de mercado: confirmar se ainda estão válidas.');

    return achados;
  };

  // Pacote enxuto que vai para a conferência pela IA. Telefone NÃO vai
  // (não é necessário para conferir coerência e é dado pessoal).
  C.pacoteParaIA = function (proj, modelo, achadosRegras) {
    const dep = Rg.dependente(proj);
    return {
      trabalho: { tipologia: proj.projeto.tipologia, municipio: proj.projeto.municipio, dataBase: proj.projeto.dataBase, finalidade: proj.projeto.finalidade },
      variaveis: proj.variaveis.filter(function (v) { return v.tipo !== 'identificacao'; }).map(function (v) {
        return { nome: v.nome, tipo: v.tipo, unidade: v.unidade, direcao: v.direcao, descricao: v.descricao, codigos: v.codigos };
      }),
      amostras: proj.amostras.map(function (a) {
        return { id: a.id, usada: a.habilitada !== false, natureza: a.natureza, data: a.data, endereco: a.endereco, bairro: a.bairro,
          informante: a.informante, origem: a.origem || 'projeto', obs: a.obs, valores: a.valores };
      }),
      avaliando: proj.avaliando.valores,
      modelo: modelo && !modelo.erro ? {
        equacao: modelo.equacao, n: modelo.n, R2: modelo.R2, R2aj: modelo.R2aj, sigF: modelo.sigF,
        coeficientes: modelo.indep.map(function (v, j) { return { nome: v.nome, escala: v.transf, coef: modelo.b[j + 1], sig: modelo.sig[j + 1] }; })
      } : null,
      dependente: dep ? dep.nome : '',
      achadosDasRegras: achadosRegras
    };
  };

  // ---------------------------------------------------------------------------
  // Aplicação de correção AUTORIZADA pelo avaliador
  // ---------------------------------------------------------------------------
  // Só é chamada quando o avaliador clica em "Aplicar" na sugestão. Guarda no
  // histórico do projeto o antes e o depois, quem sugeriu e a evidência —
  // é o rastro que se mostra se o laudo for contestado — e permite desfazer.
  C.aplicarCorrecao = function (proj, apontamento, autor) {
    const c = apontamento.correcao;
    if (!c) return { erro: 'Esta sugestão não tem correção.' };
    proj.historico = proj.historico || [];
    const reg = { quando: new Date().toISOString(), autor: autor || '', origem: 'sugestão conferida', acao: c.acao,
      amostra: apontamento.amostra, campo: c.campo || null, evidencia: c.evidencia || '', motivo: apontamento.texto };

    if (c.acao === 'escala') {
      reg.de = proj.modelo.transf[c.campo] || 'x';
      reg.para = c.para;
      proj.modelo.transf[c.campo] = c.para;
    } else {
      const a = proj.amostras.find(function (x) { return x.id === apontamento.amostra; });
      if (!a) return { erro: 'Amostra ' + apontamento.amostra + ' não existe mais.' };
      if (c.acao === 'desligar') {
        reg.de = a.habilitada !== false; reg.para = false;
        a.habilitada = false;
      } else if (c.acao === 'corrigir') {
        const ehVariavel = proj.variaveis.some(function (v) { return v.nome === c.campo; });
        reg.de = ehVariavel ? (a.valores[c.campo] === undefined ? null : a.valores[c.campo]) : (a[c.campo] === undefined ? null : a[c.campo]);
        reg.para = c.para;
        if (ehVariavel) a.valores[c.campo] = c.para; else a[c.campo] = c.para;
      } else return { erro: 'Ação desconhecida.' };
      // marca na própria amostra, para aparecer no relatório
      a.obs = ((a.obs || '') + ' [' + (c.acao === 'desligar' ? 'retirada do cálculo' : c.campo + ': ' + reg.de + ' → ' + reg.para) + ' em ' + reg.quando.slice(0, 10) + ']').trim();
    }
    proj.historico.push(reg);
    return { ok: true, registro: reg };
  };

  // Desfaz a última alteração do histórico (ou a de índice i).
  C.desfazer = function (proj, i) {
    const h = proj.historico || [];
    const idx = i === undefined ? h.length - 1 : i;
    const reg = h[idx];
    if (!reg || reg.desfeito) return { erro: 'Nada para desfazer.' };
    if (reg.acao === 'escala') proj.modelo.transf[reg.campo] = reg.de;
    else {
      const a = proj.amostras.find(function (x) { return x.id === reg.amostra; });
      if (!a) return { erro: 'Amostra não existe mais.' };
      if (reg.acao === 'desligar') a.habilitada = reg.de;
      else if (proj.variaveis.some(function (v) { return v.nome === reg.campo; })) a.valores[reg.campo] = reg.de;
      else a[reg.campo] = reg.de;
    }
    reg.desfeito = new Date().toISOString();
    return { ok: true };
  };

  INF.Conferencia = C;
})(globalThis.INF = globalThis.INF || {});
