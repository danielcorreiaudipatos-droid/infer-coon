/* Roda no Node a PARTE 1 (funcionalidade) do web/js/teste-app.js, sem os casos de tela.
   node testes/teste-funcional.cjs */
const fs = require('fs'), path = require('path');
const pasta = path.join(__dirname, '..', 'motor');
fs.readdirSync(pasta).filter(f => /^\d\d-.*\.js$/.test(f)).sort().forEach(f => require(path.join(pasta, f)));
require(path.join(__dirname, '..', 'web', 'js', 'teste-app.js'));
globalThis.INF.TesteFuncional.rodar({ tela: false }).then(function (r) {
  let etapa = '';
  r.resultados.forEach(function (x) {
    if (x.etapa !== etapa) { etapa = x.etapa; console.log('\n' + etapa); }
    console.log('  ' + (x.ok ? '✓' : '✗') + ' ' + x.nome + (x.ok ? '' : '\n      ' + x.falhas.join('\n      ')));
  });
  console.log('\n' + r.ok + ' de ' + r.casos + ' casos certos · ' + r.verificacoes + ' verificações');
  console.log(r.mensagem);
  process.exitCode = r.ok === r.casos ? 0 : 1;
});
