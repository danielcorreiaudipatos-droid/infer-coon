/* =============================================================================
   11-operar-variaveis.js — Operar variáveis
   -----------------------------------------------------------------------------
   Cria uma coluna nova a partir de uma fórmula com as colunas existentes.
   Exemplos:
        VU        = VT / Area
        VU_ha     = Valor / Area_ha
        Frente_Pr = Frente / Profundidade
        Idade     = 2026 - Ano
        Dummy_Pav = Acesso >= 3          (vira 1 ou 0)

   Sem eval(): a fórmula é lida por um analisador próprio (descida recursiva),
   que só entende números, nomes de variáveis, + − × ÷ ^, comparações,
   parênteses e as funções ln, log, exp, raiz/sqrt, abs, min, max.
   Assim uma fórmula maliciosa num arquivo de projeto não executa nada.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const O = {};

  // Quebra a fórmula em pedaços (números, nomes, operadores, parênteses).
  function tokens(txt) {
    const r = [];
    const re = /\s*(\d+(?:[.,]\d+)?|[A-Za-zÀ-ú_][\wÀ-ú]*|>=|<=|==|!=|[-+*/^(),<>])/y;
    let m, pos = 0;
    while (pos < txt.length) {
      re.lastIndex = pos;
      m = re.exec(txt);
      if (!m) {
        if (/^\s*$/.test(txt.slice(pos))) break;
        throw new Error('Não entendi a fórmula perto de: "' + txt.slice(pos, pos + 10) + '"');
      }
      r.push(m[1]); pos = re.lastIndex;
    }
    return r;
  }

  const FUNCOES = {
    ln: Math.log, log: Math.log10, exp: Math.exp, raiz: Math.sqrt, sqrt: Math.sqrt,
    abs: Math.abs, min: Math.min, max: Math.max
  };

  // Compila a fórmula numa função (valores) → número.
  O.compilar = function (formula) {
    const tk = tokens(formula);
    let i = 0;
    const ver = function () { return tk[i]; };
    const pegar = function (esperado) {
      if (esperado && tk[i] !== esperado) throw new Error('Esperava "' + esperado + '"');
      return tk[i++];
    };

    // gramática, da menor para a maior precedência:
    // comparacao → soma → produto → potencia → unario → atomo
    function comparacao() {
      let a = soma();
      while (['>', '<', '>=', '<=', '==', '!='].indexOf(ver()) >= 0) {
        const op = pegar(), b = soma(), fa = a;
        a = function (v) {
          const x = fa(v), y = b(v);
          switch (op) { case '>': return x > y ? 1 : 0; case '<': return x < y ? 1 : 0; case '>=': return x >= y ? 1 : 0;
            case '<=': return x <= y ? 1 : 0; case '==': return x === y ? 1 : 0; default: return x !== y ? 1 : 0; }
        };
      }
      return a;
    }
    function soma() {
      let a = produto();
      while (ver() === '+' || ver() === '-') {
        const op = pegar(), b = produto(), fa = a;
        a = op === '+' ? function (v) { return fa(v) + b(v); } : function (v) { return fa(v) - b(v); };
      }
      return a;
    }
    function produto() {
      let a = potencia();
      while (ver() === '*' || ver() === '/') {
        const op = pegar(), b = potencia(), fa = a;
        a = op === '*' ? function (v) { return fa(v) * b(v); } : function (v) { return fa(v) / b(v); };
      }
      return a;
    }
    function potencia() {
      const a = unario();
      if (ver() === '^') { pegar(); const b = potencia(); return function (v) { return Math.pow(a(v), b(v)); }; }
      return a;
    }
    function unario() {
      if (ver() === '-') { pegar(); const a = unario(); return function (v) { return -a(v); }; }
      if (ver() === '+') { pegar(); return unario(); }
      return atomo();
    }
    function atomo() {
      const t = pegar();
      if (t === undefined) throw new Error('Fórmula incompleta');
      if (t === '(') { const a = comparacao(); pegar(')'); return a; }
      if (/^\d/.test(t)) { const n = parseFloat(t.replace(',', '.')); return function () { return n; }; }
      const f = FUNCOES[t.toLowerCase()];
      if (f && ver() === '(') {
        pegar('(');
        const args = [comparacao()];
        while (ver() === ',') { pegar(); args.push(comparacao()); }
        pegar(')');
        return function (v) { return f.apply(null, args.map(function (g) { return g(v); })); };
      }
      // nome de variável
      return function (v) { return U.lerNumero(v[t]); };
    }

    const raiz = comparacao();
    if (i < tk.length) throw new Error('Sobrou algo no fim da fórmula: "' + tk.slice(i).join(' ') + '"');
    return raiz;
  };

  // Cria (ou recalcula) a variável "nome" em todas as amostras e no avaliando.
  O.operar = function (proj, nome, tipo, formula) {
    let fn;
    try { fn = O.compilar(formula); } catch (e) { return { erro: e.message }; }
    if (!proj.variaveis.some(function (v) { return v.nome === nome; })) {
      const err = INF.Dados.incluirVariavel(proj, nome, tipo);
      if (err) return { erro: err };
    }
    const v = proj.variaveis.find(function (x) { return x.nome === nome; });
    v.descricao = v.descricao || ('= ' + formula);
    let ok = 0;
    proj.amostras.forEach(function (a) {
      const r = fn(a.valores);
      a.valores[nome] = Number.isFinite(r) ? r : NaN;
      if (Number.isFinite(r)) ok++;
    });
    const ra = fn(proj.avaliando.valores);
    if (Number.isFinite(ra)) proj.avaliando.valores[nome] = ra;
    return { ok: ok, total: proj.amostras.length };
  };

  INF.Operar = O;
})(globalThis.INF = globalThis.INF || {});
