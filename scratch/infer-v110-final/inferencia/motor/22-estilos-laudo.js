/* =============================================================================
   22-estilos-laudo.js — 20 estilos de apresentação (1 a 20) para cada modelo
   -----------------------------------------------------------------------------
   Modelo = O QUE o laudo contém (capítulos, exigências).
   Estilo = COMO ele se apresenta (capa, fonte, cor, cabeçalho, rodapé,
            tabelas, fotos por linha, profundidade do sumário).
   Qualquer modelo × qualquer estilo: 17 modelos × 20 estilos.
   O estilo nunca muda dado nem texto técnico — só a aparência.

   Campos de cada estilo:
     capa     'centro' | 'faixa' | 'lateral' | 'moldura' | 'minima'
     fonte    fonte do corpo (existente no Word do Windows)
     titulo   fonte dos títulos
     tam      tamanho do corpo em pontos
     linha    entrelinhas (1.15 / 1.3 / 1.5)
     cor      cor de destaque (títulos, faixa da capa, cabeçalho das tabelas)
     tabela   'grade' | 'zebra' | 'linhas' | 'minima'
     caixa    títulos em MAIÚSCULAS (true/false)
     cabecalho título do laudo no alto de cada página (true/false)
     rodape   'pagina' | 'pagina-autor'
     fotos    fotos por linha (1 ou 2)
     sumario  níveis no sumário (1 = capítulos; 2 = capítulos e itens)
   ============================================================================= */

(function (INF) {
  'use strict';

  const E = [
    { nome: 'Clássico ABNT',            capa: 'centro',  fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.5,  cor: '1F1F1F', tabela: 'grade',  caixa: true,  cabecalho: false, rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Executivo azul',           capa: 'faixa',   fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '1F4E79', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Jurídico tradicional',     capa: 'moldura', fonte: 'Times New Roman', titulo: 'Times New Roman', tam: 12,   linha: 1.5,  cor: '000000', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Técnico verde',            capa: 'lateral', fonte: 'Arial',           titulo: 'Arial',           tam: 10.5, linha: 1.3,  cor: '2E6B3F', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 1 },
    { nome: 'Minimalista',              capa: 'minima',  fonte: 'Calibri',         titulo: 'Calibri Light',   tam: 11,   linha: 1.3,  cor: '444444', tabela: 'linhas', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Rural terra',              capa: 'faixa',   fonte: 'Georgia',         titulo: 'Georgia',         tam: 11,   linha: 1.3,  cor: '7A4E1F', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Pericial sóbrio',          capa: 'moldura', fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.5,  cor: '333333', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Corporativo grafite',      capa: 'lateral', fonte: 'Segoe UI',        titulo: 'Segoe UI Semibold', tam: 10.5, linha: 1.3, cor: '3A3F44', tabela: 'linhas', caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Bancário',                 capa: 'faixa',   fonte: 'Arial',           titulo: 'Arial',           tam: 10.5, linha: 1.15, cor: '005CA9', tabela: 'grade',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Acadêmico',                capa: 'centro',  fonte: 'Times New Roman', titulo: 'Times New Roman', tam: 12,   linha: 1.5,  cor: '1A1A1A', tabela: 'minima', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Engenharia laranja',       capa: 'faixa',   fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: 'C2410C', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Compacto',                 capa: 'minima',  fonte: 'Arial Narrow',    titulo: 'Arial',           tam: 10,   linha: 1.15, cor: '222222', tabela: 'linhas', caixa: false, cabecalho: false, rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Serifado elegante',        capa: 'moldura', fonte: 'Garamond',        titulo: 'Garamond',        tam: 12,   linha: 1.3,  cor: '5B1A1A', tabela: 'minima', caixa: true,  cabecalho: true,  rodape: 'pagina',       fotos: 1, sumario: 2 },
    { nome: 'Governo / concessionária', capa: 'centro',  fonte: 'Arial',           titulo: 'Arial',           tam: 11,   linha: 1.3,  cor: '003366', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Moderno petróleo',         capa: 'lateral', fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '0F5257', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 },
    { nome: 'Relatório de campo',       capa: 'faixa',   fonte: 'Verdana',         titulo: 'Verdana',         tam: 10,   linha: 1.3,  cor: '4B5320', tabela: 'grade',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 1 },
    { nome: 'Clássico vinho',           capa: 'centro',  fonte: 'Georgia',         titulo: 'Georgia',         tam: 11,   linha: 1.5,  cor: '6D1A36', tabela: 'linhas', caixa: true,  cabecalho: false, rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Neutro cinza',             capa: 'minima',  fonte: 'Segoe UI',        titulo: 'Segoe UI',        tam: 10.5, linha: 1.3,  cor: '595959', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina',       fotos: 2, sumario: 2 },
    { nome: 'Alto contraste',           capa: 'faixa',   fonte: 'Arial',           titulo: 'Arial Black',     tam: 11,   linha: 1.3,  cor: '000000', tabela: 'grade',  caixa: true,  cabecalho: true,  rodape: 'pagina-autor', fotos: 1, sumario: 2 },
    { nome: 'Assinatura COON',         capa: 'lateral', fonte: 'Calibri',         titulo: 'Calibri',         tam: 11,   linha: 1.3,  cor: '1F5F8B', tabela: 'zebra',  caixa: false, cabecalho: true,  rodape: 'pagina-autor', fotos: 2, sumario: 2 }
  ];

  const S = {};
  S.LISTA = E.map(function (e, i) { return Object.assign({ numero: i + 1 }, e); });
  S.porNumero = function (n) { return S.LISTA[Math.min(Math.max(Number(n) || 1, 1), 20) - 1]; };
  // Estilo do projeto (padrão: 1 — Clássico ABNT).
  S.doProjeto = function (proj) { return S.porNumero((proj.laudo || {}).estilo || 1); };

  INF.Estilos = S;
})(globalThis.INF = globalThis.INF || {});
