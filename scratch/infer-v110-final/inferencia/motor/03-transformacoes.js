/* =============================================================================
   03-transformacoes.js — Escalas (transformações) das variáveis
   -----------------------------------------------------------------------------
   É aqui que mora o "segredo" do R² alto: a relação entre área e valor
   unitário quase nunca é uma reta; em 1/x ou ln(x) ela vira reta.

   Cada transformação tem:
     id       → código interno (vai para o arquivo do projeto)
     rotulo   → como aparece na tela e no relatório
     f(x)     → aplica a transformação
     inv(z)   → desfaz (só é usada na variável dependente, para voltar
                de ln(VU) para VU, por exemplo)
     valida   → diz se x pode ser transformado (ln de zero não existe)
     crescente→ true se a transformação preserva a ordem (x maior → f maior).
                1/x e 1/x² invertem a ordem; isso importa para o intervalo
                de confiança da dependente (o mínimo vira máximo).

   A lista traz as escalas usuais em avaliação (x, 1/x, x², 1/x², ln x, √x, 1/√x)
   e acrescenta "fora", que significa "variável excluída do modelo". Com isso
   a busca automática testa ao mesmo tempo QUAL escala e SE a variável entra.
   ============================================================================= */

(function (INF) {
  'use strict';

  const T = {};

  T.LISTA = [
    { id: 'x',     rotulo: 'x',     f: x => x,               inv: z => z,               valida: x => Number.isFinite(x), crescente: true },
    { id: '1/x',   rotulo: '1/x',   f: x => 1 / x,           inv: z => 1 / z,           valida: x => x !== 0,           crescente: false },
    { id: 'ln',    rotulo: 'ln(x)', f: x => Math.log(x),     inv: z => Math.exp(z),     valida: x => x > 0,             crescente: true },
    { id: 'x2',    rotulo: 'x²',    f: x => x * x,           inv: z => Math.sqrt(z),    valida: x => x >= 0,            crescente: true },
    { id: '1/x2',  rotulo: '1/x²',  f: x => 1 / (x * x),     inv: z => 1 / Math.sqrt(z),valida: x => x > 0,             crescente: false },
    { id: 'raiz',  rotulo: '√x',    f: x => Math.sqrt(x),    inv: z => z * z,           valida: x => x >= 0,            crescente: true },
    { id: '1/raiz',rotulo: '1/√x',  f: x => 1 / Math.sqrt(x),inv: z => 1 / (z * z),    valida: x => x > 0,             crescente: false }
  ];

  // Pseudo-transformação que tira a variável do modelo.
  T.FORA = { id: 'fora', rotulo: '(fora)' };

  // Busca rápida por id.
  T.porId = {};
  T.LISTA.forEach(function (t) { T.porId[t.id] = t; });
  T.porId.fora = T.FORA;

  // Aplica a transformação 'id' a um valor. Devolve NaN se for inválido.
  T.aplicar = function (id, x) {
    const t = T.porId[id];
    if (!t || id === 'fora') return NaN;
    return t.valida(x) ? t.f(x) : NaN;
  };

  // Desfaz a transformação (uso na dependente).
  T.desfazer = function (id, z) {
    const t = T.porId[id];
    return t ? t.inv(z) : NaN;
  };

  // Transformações que fazem sentido para cada tipo de variável.
  // Código alocado e dicotômica NÃO se transformam (NBR 14.653-2 e prática
  // consolidada): o código 1-2-3 é uma escala ordinal, elevar ao quadrado ou
  // tirar logaritmo não tem significado. O usuário pode liberar na tela.
  T.permitidasPorTipo = function (tipo) {
    switch (tipo) {
      case 'dependente':  return ['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz'];
      case 'quantitativa':
      case 'proxy':       return ['x', '1/x', 'ln', 'x2', '1/x2', 'raiz', '1/raiz'];
      case 'tempo':       return ['x'];
      case 'qualitativa': return ['x'];
      case 'dicotomica':  return ['x'];
      default:            return [];
    }
  };

  // Escreve a equação no formato do laudo, por exemplo:
  //   ln(VU) = 8,1234 + 45,67 / Area − 0,3312 · ln(Dist) + 0,1100 · Topo
  T.termo = function (id, nome) {
    switch (id) {
      case 'x':      return nome;
      case '1/x':    return '(1/' + nome + ')';
      case 'ln':     return 'ln(' + nome + ')';
      case 'x2':     return nome + '²';
      case '1/x2':   return '(1/' + nome + '²)';
      case 'raiz':   return '√' + nome;
      case '1/raiz': return '(1/√' + nome + ')';
      default:       return nome;
    }
  };

  INF.Transf = T;
})(globalThis.INF = globalThis.INF || {});
