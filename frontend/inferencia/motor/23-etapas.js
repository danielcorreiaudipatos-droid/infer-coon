/* =============================================================================
   23-etapas.js — Sequência obrigatória das etapas (abas)
   -----------------------------------------------------------------------------
   O sistema só roda direito se cada etapa estiver completa antes da próxima,
   seja no modo automático ("Calcular tudo"), híbrido (amostras próprias +
   banco) ou manual. Cada etapa diz:
     aba        → aba da tela
     obrigatoria→ se bloqueia as seguintes (as de apoio, como gráficos e
                  ferramentas avançadas, ficam livres depois do modelo)
     depende    → etapas que precisam estar completas antes
     validar    → devolve a lista do que falta (vazia = completa)

   A aba 1 exige: responsável técnico, código do trabalho, identificação do
   imóvel, observação, tipologia, município e data base.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const ET = {};
  const vazio = function (v) { return v === null || v === undefined || String(v).trim() === ''; };

  ET.ETAPAS = [
    { aba: 'projeto', rotulo: '1. Projeto', obrigatoria: true, depende: [], validar: function (p) {
      const f = [], pr = p.projeto;
      if (vazio(pr.autor)) f.push('responsável técnico');
      if (vazio(pr.codigo)) f.push('código do trabalho');
      if (vazio(pr.imovel)) f.push('identificação do imóvel');
      if (vazio(pr.observacao)) f.push('observação');
      if (vazio(pr.tipologia)) f.push('tipologia');
      if (vazio(pr.municipio)) f.push('município / UF');
      if (vazio(pr.dataBase)) f.push('data base');
      return f;
    } },
    { aba: 'variaveis', rotulo: '2. Variáveis', obrigatoria: true, depende: ['projeto'], validar: function (p) {
      const f = [], R = INF.Regressao;
      if (!R.dependente(p)) f.push('variável dependente (ex.: VU)');
      if (!R.candidatas(p).length) f.push('ao menos uma variável independente');
      return f;
    } },
    { aba: 'amostras', rotulo: '3. Amostras', obrigatoria: true, depende: ['variaveis'], validar: function (p) {
      const f = [], R = INF.Regressao, dep = R.dependente(p);
      const ativas = p.amostras.filter(function (a) { return a.habilitada !== false; });
      const k = R.candidatas(p).filter(function (v) { return p.modelo.transf[v.nome] && p.modelo.transf[v.nome] !== 'fora'; }).length;
      if (ativas.length < 3 * (k + 1)) f.push('no mínimo ' + 3 * (k + 1) + ' amostras no cálculo, 3(k+1) (hoje ' + ativas.length + ')');
      if (dep && ativas.some(function (a) { return !(U.lerNumero(a.valores[dep.nome]) > 0); })) f.push('valor de ' + dep.nome + ' em todas as amostras no cálculo');
      const erros = INF.Conferencia.conferir(p).filter(function (c) { return c.nivel === 'erro'; });
      if (erros.length) f.push(erros.length + ' erro(s) na conferência das amostras (ex.: ' + erros[0].texto + ')');
      return f;
    } },
    { aba: 'pesquisa', rotulo: 'Pesquisa de mercado', obrigatoria: false, depende: ['variaveis'], validar: function () { return []; } },
    { aba: 'modelo', rotulo: '4. Modelo', obrigatoria: true, depende: ['amostras'], validar: function (p, e) {
      if (!e.modelo) return ['calcular o modelo (botão "Calcular tudo" ou "Calcular só estas escalas")'];
      if (e.modelo.erro) return ['modelo com erro: ' + e.modelo.erro];
      return [];
    } },
    { aba: 'graficos', rotulo: 'Gráficos', obrigatoria: false, depende: [], validar: function () { return []; } },
    { aba: 'busca', rotulo: 'Busca de modelos', obrigatoria: false, depende: ['amostras'], validar: function () { return []; } },
    { aba: 'rna', rotulo: 'Rede neural', obrigatoria: false, depende: ['modelo'], validar: function () { return []; } },
    { aba: 'avancado', rotulo: 'Ferramentas avançadas', obrigatoria: false, depende: ['modelo'], validar: function () { return []; } },
    { aba: 'avaliacao', rotulo: '5. Avaliação e NBR', obrigatoria: true, depende: ['modelo'], validar: function (p, e) {
      if (!e.projecao) return ['estimar o valor do avaliando (botão "Estimar valor")'];
      if (e.projecao.erro) return ['estimativa com erro: ' + e.projecao.erro];
      return [];
    } },
    { aba: 'laudo', rotulo: '6. Laudo completo', obrigatoria: true, depende: ['avaliacao'], validar: function () { return []; } },
    { aba: 'relatorio', rotulo: 'Relatório', obrigatoria: false, depende: ['avaliacao'], validar: function () { return []; } }
  ];
  ET.porAba = {};
  ET.ETAPAS.forEach(function (x) { ET.porAba[x.aba] = x; });

  // Vizinhança não calcula valor: pula variáveis, amostras, modelo e avaliação.
  const soViz = function (p) { return INF.TiposLaudo && INF.TiposLaudo.soVizinhanca(INF.TiposLaudo.ler(p)); };

  // Situação de todas as etapas: { aba: { completa, liberada, faltas, bloqueio } }
  ET.situacao = function (p, estado) {
    const r = {};
    const completa = function (aba) {
      if (r[aba]) return r[aba].completa;
      const et = ET.porAba[aba];
      if (soViz(p) && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(aba) >= 0) return true;
      return et.validar(p, estado).length === 0;
    };
    ET.ETAPAS.forEach(function (et) {
      const faltas = soViz(p) && ['variaveis', 'amostras', 'modelo', 'avaliacao'].indexOf(et.aba) >= 0 ? [] : et.validar(p, estado);
      // liberada quando TODAS as dependências (e as delas) estão completas
      const pendente = (function procura(lista) {
        for (let i = 0; i < lista.length; i++) {
          const dep = ET.porAba[lista[i]];
          const antes = procura(dep.depende);
          if (antes) return antes;
          if (!completa(dep.aba)) return dep;
        }
        return null;
      })(et.depende);
      r[et.aba] = { completa: faltas.length === 0, liberada: !pendente, faltas: faltas,
        bloqueio: pendente ? { etapa: pendente.rotulo, aba: pendente.aba, faltas: soViz(p) ? [] : pendente.validar(p, estado) } : null };
    });
    return r;
  };

  // Etapas obrigatórias completas / total (para a barra de progresso).
  ET.progresso = function (sit) {
    const obrig = ET.ETAPAS.filter(function (x) { return x.obrigatoria; });
    return { feitas: obrig.filter(function (x) { return sit[x.aba].completa; }).length, total: obrig.length,
      proxima: obrig.find(function (x) { return !sit[x.aba].completa; }) || null };
  };

  INF.Etapas = ET;
})(globalThis.INF = globalThis.INF || {});
