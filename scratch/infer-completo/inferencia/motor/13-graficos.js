/* =============================================================================
   13-graficos.js — Gráficos em SVG puro
   -----------------------------------------------------------------------------
   Sem biblioteca: cada gráfico é um texto SVG montado aqui. Vantagens:
   funciona sem internet, sai idêntico na tela e no relatório impresso, e dá
   para ler cada traço no código.

   Gráficos (os mesmos que o laudo pede):
     dispersao()   → observado × estimado (com a reta de 45°), variável × y,
                     resíduos × estimado (com faixas de ±2σ)
     histograma()  → resíduos padronizados com a curva normal por cima
     qq()          → gráfico Q-Q normal (quantis teóricos × observados)

   As cores vêm de variáveis CSS (--g-ponto, --g-linha...) para respeitar o
   tema claro/escuro. No relatório impresso o CSS define cores fixas.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U, D = INF.Dist;
  const G = {};

  const LARG = 460, ALT = 320;
  const MARG = { e: 62, d: 16, t: 30, b: 46 };

  // "Escala bonita": acha limites e passos redondos para os eixos.
  function eixo(min, max, divisoes) {
    if (min === max) { min -= 1; max += 1; }
    const bruto = (max - min) / (divisoes || 5);
    const mag = Math.pow(10, Math.floor(Math.log10(bruto)));
    const passo = [1, 2, 2.5, 5, 10].map(function (f) { return f * mag; }).find(function (p) { return p >= bruto; });
    const ini = Math.floor(min / passo) * passo, fim = Math.ceil(max / passo) * passo;
    const marcas = [];
    for (let v = ini; v <= fim + passo / 2; v += passo) marcas.push(+v.toPrecision(12));
    return { min: ini, max: fim, marcas: marcas };
  }

  // Moldura comum: fundo, grade, eixos, rótulos e título.
  function moldura(ex, ey, titulo, rotX, rotY) {
    const w = LARG - MARG.e - MARG.d, h = ALT - MARG.t - MARG.b;
    const sx = function (v) { return MARG.e + (v - ex.min) / (ex.max - ex.min) * w; };
    const sy = function (v) { return MARG.t + h - (v - ey.min) / (ey.max - ey.min) * h; };
    let s = '';
    ex.marcas.forEach(function (v) {
      s += '<line class="g-grade" x1="' + sx(v) + '" y1="' + MARG.t + '" x2="' + sx(v) + '" y2="' + (MARG.t + h) + '"/>';
      s += '<text class="g-texto" x="' + sx(v) + '" y="' + (MARG.t + h + 16) + '" text-anchor="middle">' + U.fmtAuto(v) + '</text>';
    });
    ey.marcas.forEach(function (v) {
      s += '<line class="g-grade" x1="' + MARG.e + '" y1="' + sy(v) + '" x2="' + (MARG.e + w) + '" y2="' + sy(v) + '"/>';
      s += '<text class="g-texto" x="' + (MARG.e - 6) + '" y="' + (sy(v) + 4) + '" text-anchor="end">' + U.fmtAuto(v) + '</text>';
    });
    s += '<rect class="g-borda" x="' + MARG.e + '" y="' + MARG.t + '" width="' + w + '" height="' + h + '"/>';
    s += '<text class="g-titulo" x="' + (LARG / 2) + '" y="18" text-anchor="middle">' + U.esc(titulo) + '</text>';
    s += '<text class="g-texto" x="' + (MARG.e + w / 2) + '" y="' + (ALT - 8) + '" text-anchor="middle">' + U.esc(rotX) + '</text>';
    s += '<text class="g-texto" transform="translate(14,' + (MARG.t + h / 2) + ') rotate(-90)" text-anchor="middle">' + U.esc(rotY) + '</text>';
    return { svg: s, sx: sx, sy: sy, w: w, h: h };
  }

  function envelope(conteudo, rotuloAcessivel) {
    return '<svg class="grafico" viewBox="0 0 ' + LARG + ' ' + ALT + '" role="img" aria-label="' + U.esc(rotuloAcessivel) + '" xmlns="http://www.w3.org/2000/svg">' + conteudo + '</svg>';
  }

  // ---------------------------------------------------------------------------
  // Dispersão
  // pontos: [{ x, y, rotulo, destaque }]
  // opcoes: { titulo, rotX, rotY, linha45, faixas2s }
  // ---------------------------------------------------------------------------
  G.dispersao = function (pontos, opcoes) {
    const op = opcoes || {};
    const xs = pontos.map(function (p) { return p.x; }), ys = pontos.map(function (p) { return p.y; });
    let xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    let ymin = Math.min.apply(null, ys), ymax = Math.max.apply(null, ys);
    if (op.linha45) { xmin = ymin = Math.min(xmin, ymin); xmax = ymax = Math.max(xmax, ymax); }
    if (op.faixas2s) { ymin = Math.min(ymin, -2.5); ymax = Math.max(ymax, 2.5); }
    const ex = eixo(xmin, xmax), ey = eixo(ymin, ymax);
    const f = moldura(ex, ey, op.titulo || '', op.rotX || '', op.rotY || '');
    let s = f.svg;
    if (op.linha45) {
      s += '<line class="g-linha" x1="' + f.sx(ex.min) + '" y1="' + f.sy(ex.min) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(ex.max) + '"/>';
    }
    if (op.faixas2s) {
      [-2, 0, 2].forEach(function (v) {
        s += '<line class="' + (v === 0 ? 'g-linha' : 'g-limite') + '" x1="' + f.sx(ex.min) + '" y1="' + f.sy(v) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(v) + '"/>';
      });
    }
    pontos.forEach(function (p) {
      s += '<circle class="' + (p.destaque ? 'g-ponto-alerta' : 'g-ponto') + '" cx="' + f.sx(p.x) + '" cy="' + f.sy(p.y) + '" r="4">'
        + '<title>' + U.esc((p.rotulo ? 'Amostra ' + p.rotulo + ': ' : '') + U.fmtAuto(p.x) + ' ; ' + U.fmtAuto(p.y)) + '</title></circle>';
      if (op.numerar && p.rotulo !== undefined) {
        s += '<text class="g-num" x="' + (f.sx(p.x) + 6) + '" y="' + (f.sy(p.y) - 5) + '">' + U.esc(p.rotulo) + '</text>';
      }
    });
    return envelope(s, op.titulo || 'gráfico de dispersão');
  };

  // ---------------------------------------------------------------------------
  // Histograma de resíduos padronizados com a curva normal teórica
  // ---------------------------------------------------------------------------
  G.histograma = function (valores, titulo) {
    const n = valores.length;
    const classes = Math.max(5, Math.min(12, Math.round(1 + 3.322 * Math.log10(n))));  // regra de Sturges
    const lim = Math.max(3, Math.ceil(Math.max.apply(null, valores.map(Math.abs))));
    const larg = 2 * lim / classes;
    const cont = new Array(classes).fill(0);
    valores.forEach(function (v) { cont[Math.min(classes - 1, Math.max(0, Math.floor((v + lim) / larg)))]++; });
    const dens = cont.map(function (c) { return c / (n * larg); });       // densidade, para comparar com a curva
    const ex = eixo(-lim, lim), ey = eixo(0, Math.max(0.45, Math.max.apply(null, dens)));
    const f = moldura(ex, ey, titulo || 'Distribuição dos resíduos padronizados', 'resíduo padronizado', 'densidade');
    let s = f.svg;
    dens.forEach(function (d, i) {
      const x0 = -lim + i * larg;
      s += '<rect class="g-barra" x="' + f.sx(x0) + '" y="' + f.sy(d) + '" width="' + (f.sx(x0 + larg) - f.sx(x0) - 1) + '" height="' + (f.sy(0) - f.sy(d)) + '"><title>' + cont[i] + ' resíduo(s)</title></rect>';
    });
    let caminho = '';
    for (let i = 0; i <= 120; i++) {
      const x = -lim + i * (2 * lim / 120);
      const y = Math.exp(-x * x / 2) / Math.sqrt(2 * Math.PI);
      caminho += (i ? 'L' : 'M') + f.sx(x).toFixed(1) + ',' + f.sy(y).toFixed(1);
    }
    s += '<path class="g-curva" d="' + caminho + '"/>';
    return envelope(s, titulo || 'histograma dos resíduos');
  };

  // ---------------------------------------------------------------------------
  // Q-Q normal: se os pontos seguem a reta, os resíduos são normais.
  // ---------------------------------------------------------------------------
  G.qq = function (valores, titulo) {
    const n = valores.length;
    const ord = valores.slice().sort(function (a, b) { return a - b; });
    const pts = ord.map(function (v, i) { return { x: D.normalInv((i + 1 - 0.375) / (n + 0.25)), y: v }; });
    return G.dispersao(pts, { titulo: titulo || 'Gráfico Q-Q normal dos resíduos', rotX: 'quantil teórico', rotY: 'resíduo padronizado', linha45: true });
  };

  // ---------------------------------------------------------------------------
  // Distribuição de frequência de qualquer variável (valores originais)
  // ---------------------------------------------------------------------------
  G.frequencia = function (valores, titulo, rotX) {
    const v = valores.filter(Number.isFinite);
    if (v.length < 2) return '';
    const n = v.length, classes = Math.max(4, Math.min(12, Math.round(1 + 3.322 * Math.log10(n))));
    const min = Math.min.apply(null, v), max = Math.max.apply(null, v);
    const larg = (max - min) / classes || 1;
    const cont = new Array(classes).fill(0);
    v.forEach(function (x) { cont[Math.min(classes - 1, Math.floor((x - min) / larg))]++; });
    const ex = eixo(min, max), ey = eixo(0, Math.max.apply(null, cont));
    const f = moldura(ex, ey, titulo || 'Distribuição de frequência', rotX || '', 'frequência');
    let s = f.svg;
    cont.forEach(function (c, i) {
      const x0 = min + i * larg;
      s += '<rect class="g-barra" x="' + f.sx(x0) + '" y="' + f.sy(c) + '" width="' + Math.max(1, f.sx(x0 + larg) - f.sx(x0) - 1) + '" height="' + (f.sy(0) - f.sy(c)) + '"><title>' + U.fmtAuto(x0) + ' a ' + U.fmtAuto(x0 + larg) + ': ' + c + '</title></rect>';
    });
    return envelope(s, titulo || 'distribuição de frequência');
  };

  // ---------------------------------------------------------------------------
  // Barras por amostra (distância de Cook, alavancagem...) com linha de limite
  // ---------------------------------------------------------------------------
  G.barras = function (itens, titulo, rotY, limite) {
    const vals = itens.map(function (i) { return i.valor; });
    const ex = eixo(0, itens.length + 1, 6), ey = eixo(0, Math.max(Math.max.apply(null, vals), limite || 0));
    const f = moldura(ex, ey, titulo, 'amostra', rotY || '');
    let s = f.svg;
    const w = Math.max(2, (f.sx(1) - f.sx(0)) * 0.7);
    itens.forEach(function (it, i) {
      const x = f.sx(i + 1) - w / 2;
      s += '<rect class="' + (limite && it.valor > limite ? 'g-ponto-alerta' : 'g-barra') + '" x="' + x + '" y="' + f.sy(it.valor) + '" width="' + w + '" height="' + (f.sy(0) - f.sy(it.valor)) + '"><title>Amostra ' + U.esc(it.rotulo) + ': ' + U.fmtAuto(it.valor) + '</title></rect>';
    });
    if (limite) s += '<line class="g-limite" x1="' + f.sx(ex.min) + '" y1="' + f.sy(limite) + '" x2="' + f.sx(ex.max) + '" y2="' + f.sy(limite) + '"/>';
    return envelope(s, titulo);
  };

  // ---------------------------------------------------------------------------
  // Valor × variável na escala ORIGINAL, com a curva do modelo passando pela
  // média das demais variáveis.
  // ---------------------------------------------------------------------------
  G.curvaModelo = function (modelo, j, prever) {
    const f0 = modelo.faixa[j];
    const pts = modelo.xOriginal.map(function (l, i) { return { x: l[j], y: modelo.yOriginal[i], rotulo: modelo.ids[i] }; });
    const base = modelo.faixa.map(function (f) { return f.media; });
    const curva = [];
    for (let k = 0; k <= 60; k++) {
      const x = f0.min + (f0.max - f0.min) * k / 60;
      const b = base.slice(); b[j] = x;
      const y = prever(modelo, b);
      if (Number.isFinite(y)) curva.push({ x: x, y: y });
    }
    const ys = pts.map(function (p) { return p.y; }).concat(curva.map(function (c) { return c.y; }));
    const ex = eixo(f0.min, f0.max), ey = eixo(Math.min.apply(null, ys), Math.max.apply(null, ys));
    const titulo = modelo.dep.nome + ' × ' + f0.nome + ' (curva do modelo, demais na média)';
    const f = moldura(ex, ey, titulo, f0.nome, modelo.dep.nome);
    let s = f.svg;
    s += '<path class="g-curva" d="' + curva.map(function (c, k) { return (k ? 'L' : 'M') + f.sx(c.x).toFixed(1) + ',' + f.sy(c.y).toFixed(1); }).join('') + '"/>';
    pts.forEach(function (p) {
      s += '<circle class="g-ponto" cx="' + f.sx(p.x) + '" cy="' + f.sy(p.y) + '" r="4"><title>Amostra ' + U.esc(p.rotulo) + ': ' + U.fmtAuto(p.x) + ' ; ' + U.fmtAuto(p.y) + '</title></circle>';
    });
    return envelope(s, titulo);
  };

  // ---------------------------------------------------------------------------
  // Mapa esquemático das amostras (lat/lon) e do avaliando. Sem fundo de mapa
  // (não depende de serviço externo); a escala é a mesma nos dois eixos.
  // ---------------------------------------------------------------------------
  // raioKm (opcional): círculo do raio de pesquisa em volta do avaliando
  G.mapa = function (pontos, avaliando, raioKm) {
    let todos = pontos.concat(avaliando ? [avaliando] : []);
    if (avaliando && raioKm > 0) {
      // o enquadramento inclui o círculo inteiro
      const dLat = raioKm / 111.32, dLon = raioKm / (111.32 * Math.cos(avaliando.lat * Math.PI / 180));
      todos = todos.concat([{ lat: avaliando.lat + dLat, lon: avaliando.lon + dLon }, { lat: avaliando.lat - dLat, lon: avaliando.lon - dLon }]);
    }
    if (!todos.length) return '';
    let latMin = Math.min.apply(null, todos.map(function (p) { return p.lat; })), latMax = Math.max.apply(null, todos.map(function (p) { return p.lat; }));
    let lonMin = Math.min.apply(null, todos.map(function (p) { return p.lon; })), lonMax = Math.max.apply(null, todos.map(function (p) { return p.lon; }));
    // mesma escala em km nos dois eixos (corrige o encolhimento da longitude)
    const kmLat = 111.32, kmLon = 111.32 * Math.cos((latMin + latMax) / 2 * Math.PI / 180);
    const spanKm = Math.max((latMax - latMin) * kmLat, (lonMax - lonMin) * kmLon, 1) * 1.1;
    const cLat = (latMin + latMax) / 2, cLon = (lonMin + lonMax) / 2;
    latMin = cLat - spanKm / kmLat / 2; latMax = cLat + spanKm / kmLat / 2;
    lonMin = cLon - spanKm / kmLon / 2; lonMax = cLon + spanKm / kmLon / 2;
    const ex = eixo(lonMin, lonMax), ey = eixo(latMin, latMax);
    const f = moldura(ex, ey, 'Localização das amostras (' + U.fmt(spanKm, 0) + ' km de lado)', 'longitude', 'latitude');
    let s = f.svg;
    pontos.forEach(function (p) {
      s += '<circle class="' + (p.destaque ? 'g-ponto-alerta' : 'g-ponto') + '" cx="' + f.sx(p.lon) + '" cy="' + f.sy(p.lat) + '" r="4"><title>Amostra ' + U.esc(p.rotulo) + (p.valor ? ': ' + U.fmtAuto(p.valor) : '') + '</title></circle>'
        + '<text class="g-num" x="' + (f.sx(p.lon) + 6) + '" y="' + (f.sy(p.lat) - 5) + '">' + U.esc(p.rotulo) + '</text>';
    });
    if (avaliando && raioKm > 0) {
      const rx = Math.abs(f.sx(avaliando.lon + raioKm / (kmLon)) - f.sx(avaliando.lon));
      s = s.replace('<rect class="g-borda"', '<circle class="g-raio" cx="' + f.sx(avaliando.lon) + '" cy="' + f.sy(avaliando.lat) + '" r="' + rx.toFixed(1) + '"/><rect class="g-borda"');
    }
    if (avaliando) {
      const x = f.sx(avaliando.lon), y = f.sy(avaliando.lat);
      s += '<path class="g-avaliando" d="M' + x + ',' + (y - 8) + 'L' + (x + 7) + ',' + (y + 6) + 'L' + (x - 7) + ',' + (y + 6) + 'Z"><title>Avaliando</title></path>';
    }
    return envelope(s, 'mapa das amostras');
  };

  // Moldura vazia: o gráfico aparece mesmo sem dados, com o aviso do que falta.
  G.vazio = function (titulo, rotX, rotY, motivo) {
    const f = moldura(eixo(0, 10), eixo(0, 10), titulo, rotX || '', rotY || '');
    return envelope(f.svg + '<text class="g-titulo" x="' + (MARG.e + f.w / 2) + '" y="' + (MARG.t + f.h / 2) + '" text-anchor="middle">sem dados ainda</text>'
      + '<text class="g-texto" x="' + (MARG.e + f.w / 2) + '" y="' + (MARG.t + f.h / 2 + 16) + '" text-anchor="middle">' + U.esc(motivo || '') + '</text>', titulo + ' (sem dados)');
  };

  INF.Graficos = G;
})(globalThis.INF = globalThis.INF || {});
