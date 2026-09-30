/* =============================================================================
   00-base.js — Base comum do COON Infer
   -----------------------------------------------------------------------------
   Este é o primeiro arquivo carregado. Ele cria o "espaço de nomes" INF, onde
   todos os outros módulos se penduram (INF.Matriz, INF.Dist, INF.Regressao...).
   Assim nada fica solto no escopo global e o mesmo código roda no navegador
   (index.html) e no Node (testes/teste-motor.js) sem mudar uma linha.

   Aqui também ficam as funções miúdas usadas em todo canto: formatar número
   no padrão brasileiro, ler número digitado com vírgula, escapar texto para
   HTML e um gerador de números aleatórios com semente (para a RNA dar sempre
   o mesmo resultado com os mesmos dados — laudo precisa ser reproduzível).
   ============================================================================= */

(function (INF) {
  'use strict';

  // Versão do motor. Sai impressa no relatório para rastrear qual versão
  // do cálculo gerou cada laudo.
  INF.VERSAO = '1.1.0';

  const U = {};

  // ---------------------------------------------------------------------------
  // Leitura de números no padrão brasileiro
  // ---------------------------------------------------------------------------
  // Aceita "1.234.567,89", "1234567,89", "1234567.89", "R$ 3.440.000", "172 ha".
  // Regra usada: se houver vírgula, ela é o separador decimal e os pontos são
  // de milhar. Se não houver vírgula e houver mais de um ponto, os pontos são
  // de milhar. Se houver um ponto só, ele é decimal (formato de planilha/CSV).
  U.lerNumero = function (valor) {
    if (valor === null || valor === undefined) return NaN;
    if (typeof valor === 'number') return valor;
    let s = String(valor).trim();
    if (s === '') return NaN;
    // tira tudo que não é dígito, sinal, ponto ou vírgula (R$, espaços, "ha")
    s = s.replace(/[^\d,.\-eE+]/g, '');
    const temVirgula = s.indexOf(',') >= 0;
    const qtdPontos = (s.match(/\./g) || []).length;
    if (temVirgula) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (qtdPontos > 1) {
      s = s.replace(/\./g, '');
    }
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : NaN;
  };

  // ---------------------------------------------------------------------------
  // Escrita de números no padrão brasileiro
  // ---------------------------------------------------------------------------
  // fmt(1234.5, 2) -> "1.234,50"
  U.fmt = function (v, casas) {
    if (v === null || v === undefined || !Number.isFinite(v)) return '—';
    const c = casas === undefined ? 2 : casas;
    return v.toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
  };

  // Moeda: fmtR$(1250000) -> "R$ 1.250.000,00"
  U.fmtMoeda = function (v) {
    if (!Number.isFinite(v)) return '—';
    return 'R$ ' + U.fmt(v, 2);
  };

  // Percentual a partir de fração: fmtPct(0.0312) -> "3,12%"
  U.fmtPct = function (fracao, casas) {
    if (!Number.isFinite(fracao)) return '—';
    return U.fmt(fracao * 100, casas === undefined ? 2 : casas) + '%';
  };

  // Número com casas "inteligentes": muitos dígitos para valores pequenos
  // (coeficientes como 0,000123) e poucos para valores grandes.
  U.fmtAuto = function (v) {
    if (!Number.isFinite(v)) return '—';
    const a = Math.abs(v);
    if (a === 0) return '0';
    if (a >= 1000) return U.fmt(v, 2);
    if (a >= 1) return U.fmt(v, 4);
    if (a >= 0.001) return U.fmt(v, 6);
    return v.toExponential(4).replace('.', ',');
  };

  // ---------------------------------------------------------------------------
  // Proteção de texto antes de jogar no HTML (evita quebrar a tela com
  // um "<" digitado no nome do informante, por exemplo).
  // ---------------------------------------------------------------------------
  U.esc = function (texto) {
    return String(texto === undefined || texto === null ? '' : texto)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  // ---------------------------------------------------------------------------
  // Gerador pseudoaleatório com semente (mulberry32).
  // Math.random() não aceita semente; sem semente a RNA daria um valor
  // diferente a cada clique, o que é inaceitável num laudo.
  // ---------------------------------------------------------------------------
  U.rng = function (semente) {
    let a = (semente >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Média e desvio padrão amostral (n-1) de um vetor.
  U.media = function (v) {
    let s = 0;
    for (let i = 0; i < v.length; i++) s += v[i];
    return s / v.length;
  };
  U.desvio = function (v) {
    const m = U.media(v);
    let s = 0;
    for (let i = 0; i < v.length; i++) s += (v[i] - m) * (v[i] - m);
    return Math.sqrt(s / (v.length - 1));
  };

  // Data "AAAA-MM-DD" -> número de meses entre ela e a data base.
  // Usado na variável "Data do Evento" (tempo de mercado da amostra).
  U.mesesEntre = function (dataIso, dataBaseIso) {
    if (!dataIso || !dataBaseIso) return NaN;
    const a = new Date(dataIso + 'T00:00:00');
    const b = new Date(dataBaseIso + 'T00:00:00');
    if (isNaN(a) || isNaN(b)) return NaN;
    return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
      + (b.getDate() - a.getDate()) / 30;
  };

  // Distância em km entre dois pontos geográficos (fórmula de Haversine).
  // Serve para a variável "distância ao polo valorizante".
  U.distanciaKm = function (lat1, lon1, lat2, lon2) {
    const R = 6371.0088;               // raio médio da Terra em km
    const rad = Math.PI / 180;
    const dLat = (lat2 - lat1) * rad;
    const dLon = (lon2 - lon1) * rad;
    const h = Math.sin(dLat / 2) ** 2
      + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  };

  // Cópia profunda simples (o estado do projeto é JSON puro).
  U.copiar = function (obj) {
    return JSON.parse(JSON.stringify(obj));
  };

  INF.U = U;
})(globalThis.INF = globalThis.INF || {});
