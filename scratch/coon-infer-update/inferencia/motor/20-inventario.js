/* =============================================================================
   20-inventario.js — Inventário de dados por modelo de laudo (modelo da RAE)
   -----------------------------------------------------------------------------
   CAMPOS é a lista de TODOS os dados que os modelos de laudo usam. Cada um diz:
     quem   → 'documento' (a IA extrai, com fonte), 'avaliador' (julgamento do
              perito — a IA NÃO preenche) ou 'calculo' (sai do programa);
     fontes → tipos de documento donos do campo, em ordem de autoridade;
     quando → em quais modelos o campo é exigido (função do tipo de laudo).
   Assim cada modelo tem o seu inventário: a IA recebe só os campos daquele
   modelo e só devolve o que está escrito nos documentos.

   Regras (as mesmas da RAE):
   1. TODOS os documentos da pasta são lidos; nenhum é dispensável.
   2. Cada documento é lido UMA vez: o cache é pelo SHA-256 do arquivo.
      Renomeado não relê; alterado relê; o que sumiu da pasta é avisado.
   3. Todo campo guarda a FONTE: nome do arquivo, página e trecho literal.
   4. Divergência vai ao DOCUMENTO DONO do campo (não se contam votos). Entre
      documentos do mesmo tipo, vale o mais recente.
   5. Hierarquia: decisão do avaliador > documento dono > demais documentos >
      carimbo da foto (só data e coordenadas da vistoria).
   6. Trava de leitura: documento não lido, com erro ou com resumo raso
      (menos de 120 caracteres ou sem número) reprova.
   7. Checagem: RESOLVIDA / NÃO ENCONTRADA / NÃO SOLUCIONADA. Pendência em
      campo obrigatório → "ENTREGA BLOQUEADA - FAVOR VERIFICAR ESTAS
      PENDÊNCIAS". Bloqueia a entrega, nunca o preenchimento.
   ============================================================================= */

(function (INF) {
  'use strict';

  const U = INF.U;
  const IV = {};

  // Condições de uso (t = tipo de laudo lido por INF.TiposLaudo.ler)
  const tem = function (t, o) { return (t.objetos || []).indexOf(o) >= 0; };
  const SEMPRE = function () { return true; };
  const RURAL = function (t) { return t.ambito === 'rural' && VALOR(t); };
  const URBANO = function (t) { return t.ambito === 'urbano' && VALOR(t); };
  const JUDICIAL = function (t) { return t.destino === 'judicial'; };
  const BANCO = function (t) { return t.destino === 'banco'; };
  const SERVIDAO = function (t) { return tem(t, 'servidao'); };
  const DESAPROP = function (t) { return tem(t, 'desapropriacao') || tem(t, 'servidao'); };
  const REMANESC = function (t) { return tem(t, 'remanescente'); };
  const LOCATIVO = function (t) { return tem(t, 'locativo'); };
  const VTN = function (t) { return tem(t, 'vtn'); };
  const LIQUID = function (t) { return tem(t, 'liquidacao'); };
  const VIZ = function (t) { return tem(t, 'vizinhanca'); };
  // modelos que avaliam valor (vizinhança pura não usa matrícula, mercado nem cálculo)
  const VALOR = function (t) { return !(t.objetos || []).length || !(t.objetos || []).every(function (o) { return o === 'vizinhanca'; }); };

  // id, rótulo, destino no projeto, quem preenche, fontes (autoridade), quando é exigido, descrição para a IA
  IV.CAMPOS = [
    // ---- identificação e documentação (todos os modelos) ----
    { id: 'solicitante', rotulo: 'Solicitante', destino: 'laudo.solicitante', quem: 'documento', fontes: ['decisao_despacho', 'contrato', 'outro'], quando: SEMPRE, obrig: true, desc: 'quem pediu o laudo (pessoa, empresa, juízo)' },
    { id: 'proprietario', rotulo: 'Proprietário', destino: 'laudo.proprietario', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'ccir', 'itr', 'car'], quando: VALOR, obrig: true, desc: 'nome do(s) proprietário(s) atual(is) conforme o registro' },
    { id: 'matricula', rotulo: 'Matrícula', destino: 'laudo.matricula', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'ccir', 'itr'], quando: VALOR, obrig: true, desc: 'número da matrícula do imóvel' },
    { id: 'cartorio', rotulo: 'Cartório de registro', destino: 'laudo.cartorio', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura'], quando: VALOR, obrig: true, desc: 'cartório de registro de imóveis e comarca' },
    { id: 'areaDocumento', rotulo: 'Área documental', destino: 'laudo.areaDocumento', quem: 'documento', fontes: ['matricula', 'certidao_onus', 'escritura', 'georreferenciamento', 'memorial_descritivo', 'ccir', 'itr', 'car'], quando: VALOR, obrig: true, desc: 'área do imóvel com a unidade escrita no documento' },
    { id: 'onus', rotulo: 'Ônus e averbações', destino: 'laudo.onus', quem: 'documento', fontes: ['certidao_onus', 'matricula'], quando: VALOR, obrig: false, desc: 'hipotecas, penhoras, servidões, alienação fiduciária e averbações relevantes (resumo literal)' },
    { id: 'descricaoMatricula', rotulo: 'Descrição do registro', destino: 'laudo.descricaoMatricula', quem: 'documento', fontes: ['matricula', 'escritura', 'memorial_descritivo'], quando: VALOR, obrig: false, desc: 'descrição do imóvel e confrontações conforme o registro (trecho literal resumido)' },
    { id: 'endereco', rotulo: 'Endereço / localização', destino: 'laudo.endereco', quem: 'documento', fontes: ['alvara_habitese', 'matricula', 'escritura', 'iptu', 'ccir', 'contrato'], quando: SEMPRE, obrig: true, desc: 'endereço (urbano) ou denominação e localização do imóvel (rural)' },
    { id: 'municipio', rotulo: 'Município / UF', destino: 'projeto.municipio', quem: 'documento', fontes: ['matricula', 'escritura', 'ccir', 'itr', 'iptu'], quando: SEMPRE, obrig: true, desc: 'município e UF do imóvel' },
    { id: 'coordenadas', rotulo: 'Coordenadas', destino: 'laudo.coordenadas', quem: 'documento', fontes: ['georreferenciamento', 'memorial_descritivo', 'car', 'foto_vistoria'], quando: SEMPRE, obrig: false, desc: 'coordenadas geográficas do imóvel ou da sede' },
    { id: 'dataVistoria', rotulo: 'Data da vistoria', destino: 'laudo.dataVistoria', quem: 'documento', fontes: ['foto_vistoria'], quando: SEMPRE, obrig: true, desc: 'data da vistoria lida no carimbo da foto (AAAA-MM-DD)' },
    { id: 'art', rotulo: 'ART / RRT', destino: 'laudo.art', quem: 'documento', fontes: ['art_rrt'], quando: SEMPRE, obrig: true, desc: 'número da ART ou RRT do laudo' },
    { id: 'registro', rotulo: 'Registro profissional', destino: 'laudo.registro', quem: 'documento', fontes: ['art_rrt'], quando: SEMPRE, obrig: true, desc: 'registro no CREA/CAU do responsável técnico' },

    // ---- rural ----
    { id: 'ccir', rotulo: 'CCIR / código INCRA', destino: 'laudo.ccir', quem: 'documento', fontes: ['ccir'], quando: RURAL, obrig: true, desc: 'número do CCIR e código do imóvel no INCRA' },
    { id: 'nirf', rotulo: 'NIRF (ITR)', destino: 'laudo.nirf', quem: 'documento', fontes: ['itr'], quando: RURAL, obrig: false, desc: 'número do imóvel na Receita Federal (NIRF/CIB)' },
    { id: 'car', rotulo: 'Registro no CAR', destino: 'laudo.car', quem: 'documento', fontes: ['car'], quando: RURAL, obrig: true, desc: 'número do recibo de inscrição no CAR' },
    { id: 'areaReservaLegal', rotulo: 'Reserva legal', destino: 'laudo.areaReservaLegal', quem: 'documento', fontes: ['car', 'matricula', 'georreferenciamento'], quando: RURAL, obrig: false, desc: 'área de reserva legal com unidade' },
    { id: 'areaApp', rotulo: 'Área de preservação permanente', destino: 'laudo.areaApp', quem: 'documento', fontes: ['car', 'georreferenciamento'], quando: RURAL, obrig: false, desc: 'área de APP com unidade' },
    { id: 'sigef', rotulo: 'Georreferenciamento (SIGEF)', destino: 'laudo.sigef', quem: 'documento', fontes: ['georreferenciamento', 'matricula'], quando: RURAL, obrig: false, desc: 'certificação SIGEF/INCRA: número e data' },
    { id: 'usoAtual', rotulo: 'Uso atual do solo', destino: 'laudo.usoAtual', quem: 'documento', fontes: ['car', 'itr', 'laudo_anterior', 'foto_vistoria'], quando: RURAL, obrig: false, desc: 'uso do solo declarado (lavoura, pastagem, vegetação nativa...) com áreas' },

    // ---- urbano ----
    { id: 'inscricaoIptu', rotulo: 'Inscrição imobiliária (IPTU)', destino: 'laudo.inscricaoIptu', quem: 'documento', fontes: ['iptu'], quando: URBANO, obrig: false, desc: 'inscrição imobiliária municipal' },
    { id: 'areaTerreno', rotulo: 'Área do terreno', destino: 'laudo.areaTerreno', quem: 'documento', fontes: ['matricula', 'escritura', 'iptu'], quando: URBANO, obrig: false, desc: 'área do terreno com unidade' },
    { id: 'areaConstruida', rotulo: 'Área construída', destino: 'laudo.areaConstruida', quem: 'documento', fontes: ['alvara_habitese', 'matricula', 'iptu'], quando: URBANO, obrig: false, desc: 'área construída / privativa com unidade' },
    { id: 'habiteSe', rotulo: 'Habite-se / alvará', destino: 'laudo.habiteSe', quem: 'documento', fontes: ['alvara_habitese'], quando: URBANO, obrig: false, desc: 'número e data do habite-se ou alvará' },

    // ---- banco ----
    { id: 'banco', rotulo: 'Instituição financeira', destino: 'tipoLaudo.banco', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'banco ou cooperativa' },
    { id: 'contrato', rotulo: 'Proposta / contrato', destino: 'tipoLaudo.contrato', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'número da proposta ou contrato' },
    { id: 'proponente', rotulo: 'Proponente', destino: 'tipoLaudo.proponente', quem: 'documento', fontes: ['contrato'], quando: BANCO, obrig: true, desc: 'nome do proponente' },

    // ---- judicial ----
    { id: 'processo', rotulo: 'Processo nº', destino: 'tipoLaudo.processo', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial', 'quesitos', 'contestacao'], quando: JUDICIAL, obrig: true, desc: 'número do processo (CNJ)' },
    { id: 'vara', rotulo: 'Vara / juízo', destino: 'tipoLaudo.vara', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'vara ou juízo' },
    { id: 'comarca', rotulo: 'Comarca', destino: 'tipoLaudo.comarca', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'comarca' },
    { id: 'autor', rotulo: 'Autor(es)', destino: 'tipoLaudo.autor', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho'], quando: JUDICIAL, obrig: true, desc: 'nome do(s) autor(es)' },
    { id: 'reu', rotulo: 'Réu(s)', destino: 'tipoLaudo.reu', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho', 'contestacao'], quando: JUDICIAL, obrig: true, desc: 'nome do(s) réu(s)' },
    { id: 'objetoPericia', rotulo: 'Objeto da perícia', destino: 'tipoLaudo.objetoPericia', quem: 'documento', fontes: ['decisao_despacho', 'peticao_inicial'], quando: JUDICIAL, obrig: true, desc: 'o que o juízo determinou avaliar (trecho literal da decisão)' },
    { id: 'dataNomeacao', rotulo: 'Data da nomeação', destino: 'tipoLaudo.dataNomeacao', quem: 'documento', fontes: ['decisao_despacho'], quando: JUDICIAL, obrig: false, desc: 'data da decisão que nomeou o perito' },
    { id: 'prazoLaudo', rotulo: 'Prazo do laudo', destino: 'tipoLaudo.prazoLaudo', quem: 'documento', fontes: ['decisao_despacho'], quando: JUDICIAL, obrig: false, desc: 'prazo fixado para entrega do laudo' },
    { id: 'assistentes', rotulo: 'Assistentes técnicos', destino: 'tipoLaudo.assistentes', quem: 'documento', fontes: ['quesitos', 'peticao_inicial', 'contestacao', 'parecer_assistente'], quando: JUDICIAL, obrig: false, desc: 'assistentes técnicos indicados pelas partes' },
    { id: 'quesitos', rotulo: 'Quesitos', destino: 'tipoLaudo.quesitos', quem: 'documento', fontes: ['quesitos', 'peticao_inicial', 'contestacao', 'decisao_despacho'], quando: JUDICIAL, obrig: true, desc: 'texto literal de cada quesito (lista separada)' },

    // ---- servidão / desapropriação / remanescente ----
    { id: 'areaTotal', rotulo: 'Área total do imóvel', destino: 'tipoLaudo.areaTotal', quem: 'documento', fontes: ['matricula', 'georreferenciamento', 'memorial_descritivo', 'ccir', 'itr', 'car'], quando: DESAPROP, obrig: true, desc: 'área total com unidade' },
    { id: 'areaFaixa', rotulo: 'Área da faixa atingida', destino: 'tipoLaudo.areaFaixa', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'memorial_descritivo', 'peticao_inicial'], quando: DESAPROP, obrig: true, desc: 'área da faixa de servidão ou área desapropriada, com unidade' },
    { id: 'larguraFaixa', rotulo: 'Largura da faixa', destino: 'laudo.larguraFaixa', quem: 'documento', fontes: ['projeto_faixa_servidao', 'decreto_utilidade_publica', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'largura da faixa em metros' },
    { id: 'extensaoFaixa', rotulo: 'Extensão da faixa', destino: 'laudo.extensaoFaixa', quem: 'documento', fontes: ['projeto_faixa_servidao', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'extensão da faixa dentro do imóvel' },
    { id: 'decretoDup', rotulo: 'Decreto / DUP', destino: 'laudo.decretoDup', quem: 'documento', fontes: ['decreto_utilidade_publica', 'peticao_inicial'], quando: DESAPROP, obrig: false, desc: 'número e data do decreto de utilidade pública ou resolução autorizativa' },
    { id: 'empreendimento', rotulo: 'Empreendimento', destino: 'laudo.empreendimento', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'peticao_inicial'], quando: DESAPROP, obrig: false, desc: 'obra ou linha que motiva a servidão/desapropriação (ex.: LT 138 kV)' },
    { id: 'restricoesFaixa', rotulo: 'Restrições na faixa', destino: 'laudo.restricoesFaixa', quem: 'documento', fontes: ['decreto_utilidade_publica', 'projeto_faixa_servidao', 'peticao_inicial'], quando: SERVIDAO, obrig: false, desc: 'usos proibidos ou restritos na faixa, conforme o documento' },
    { id: 'ofertaInicial', rotulo: 'Oferta / depósito inicial', destino: 'laudo.ofertaInicial', quem: 'documento', fontes: ['peticao_inicial', 'decisao_despacho'], quando: DESAPROP, obrig: false, desc: 'valor oferecido ou depositado pelo expropriante' },

    // ---- vizinhança (vistoria cautelar) ----
    { id: 'obraNome', rotulo: 'Obra / empreendimento', destino: 'vizinhanca.obra.nome', quem: 'documento', fontes: ['alvara_habitese', 'contrato', 'outro'], quando: VIZ, obrig: true, desc: 'nome da obra ou empreendimento que motiva a vistoria' },
    { id: 'obraEndereco', rotulo: 'Endereço da obra', destino: 'vizinhanca.obra.endereco', quem: 'documento', fontes: ['alvara_habitese', 'contrato', 'matricula'], quando: VIZ, obrig: true, desc: 'endereço do terreno da obra' },
    { id: 'construtora', rotulo: 'Construtora / contratante', destino: 'vizinhanca.obra.construtora', quem: 'documento', fontes: ['contrato', 'alvara_habitese', 'art_rrt'], quando: VIZ, obrig: true, desc: 'empresa responsável pela obra' },
    { id: 'alvaraObra', rotulo: 'Alvará de construção', destino: 'vizinhanca.obra.alvara', quem: 'documento', fontes: ['alvara_habitese'], quando: VIZ, obrig: false, desc: 'número e data do alvará da obra' },
    { id: 'responsavelObra', rotulo: 'Responsável técnico da obra', destino: 'vizinhanca.obra.responsavel', quem: 'documento', fontes: ['art_rrt', 'alvara_habitese'], quando: VIZ, obrig: false, desc: 'engenheiro ou arquiteto da obra e a ART' },
    { id: 'tipoObra', rotulo: 'Serviços previstos', destino: 'vizinhanca.obra.tipo', quem: 'documento', fontes: ['contrato', 'alvara_habitese', 'outro'], quando: VIZ, obrig: false, desc: 'demolição, escavação, contenção, fundação profunda, estrutura...' },
    { id: 'inicioObra', rotulo: 'Início previsto da obra', destino: 'vizinhanca.obra.inicio', quem: 'documento', fontes: ['contrato', 'alvara_habitese'], quando: VIZ, obrig: false, desc: 'data prevista de início' },
    { id: 'imoveisVizinhos', rotulo: 'Imóveis vizinhos vistoriados', quem: 'avaliador', quando: VIZ, obrig: true },
    { id: 'anomalias', rotulo: 'Anomalias por imóvel e ambiente', quem: 'avaliador', quando: VIZ, obrig: true },

    // ---- locação ----
    { id: 'aluguelAtual', rotulo: 'Aluguel atual', destino: 'laudo.aluguelAtual', quem: 'documento', fontes: ['contrato'], quando: LOCATIVO, obrig: false, desc: 'valor do aluguel vigente e data do contrato' },

    // ---- julgamento do avaliador (a IA não preenche) ----
    { id: 'coefServidao', rotulo: 'Coeficiente de servidão', destino: 'tipoLaudo.coefServidao', quem: 'avaliador', quando: SERVIDAO, obrig: true },
    { id: 'justifServidao', rotulo: 'Justificativa do coeficiente', destino: 'tipoLaudo.justifServidao', quem: 'avaliador', quando: SERVIDAO, obrig: true },
    { id: 'percRemanescente', rotulo: 'Desvalorização do remanescente', destino: 'tipoLaudo.percRemanescente', quem: 'avaliador', quando: REMANESC, obrig: true },
    { id: 'respostasQuesitos', rotulo: 'Respostas aos quesitos', destino: 'tipoLaudo.quesitos', quem: 'avaliador', quando: JUDICIAL, obrig: true },
    { id: 'benfeitoriasCusto', rotulo: 'Benfeitorias (custo e depreciação)', destino: 'tipoLaudo.benfeitorias', quem: 'avaliador', quando: VTN, obrig: true },
    { id: 'liquidacaoParam', rotulo: 'Prazo e taxa da liquidação', destino: 'tipoLaudo.prazoAbsorcao', quem: 'avaliador', quando: LIQUID, obrig: true },
    { id: 'descricaoRegiao', rotulo: 'Descrição da região', destino: 'laudo.descricaoRegiao', quem: 'avaliador', quando: SEMPRE, obrig: true },
    { id: 'descricaoImovel', rotulo: 'Descrição do imóvel (vistoria)', destino: 'laudo.descricaoImovel', quem: 'avaliador', quando: VALOR, obrig: true },
    { id: 'diagnosticoMercado', rotulo: 'Leitura do mercado', destino: 'laudo.diagnosticoMercado', quem: 'avaliador', quando: VALOR, obrig: true },

    // ---- sai do cálculo ----
    { id: 'valor', rotulo: 'Valor, intervalo, graus e gráficos', quem: 'calculo', quando: VALOR, obrig: true }
  ];
  // CAMINHO PARA CONSEGUIR cada dado quando nenhum documento da pasta o traz.
  // Aparece na lista de pendências: é o que o avaliador (ou a equipe) faz
  // para obter o dado de verdade — nunca estimar.
  IV.COMO_OBTER = {
    solicitante: 'Contrato de prestação de serviço, e-mail de solicitação ou decisão judicial de nomeação.',
    proprietario: 'Certidão de inteiro teor da matrícula no Cartório de Registro de Imóveis (ou pedido on-line no ONR / registradores.org.br).',
    matricula: 'Certidão de inteiro teor no Cartório de Registro de Imóveis da comarca; o número também está no IPTU/ITR e na escritura.',
    cartorio: 'Cabeçalho da certidão de matrícula; na dúvida, o cartório competente pela localização do imóvel.',
    areaDocumento: 'Certidão de matrícula (área registrada); no rural, conferir com CCIR e CAR.',
    onus: 'Certidão de ônus reais e ações reipersecutórias no Cartório de Registro de Imóveis (validade curta: pedir atualizada).',
    descricaoMatricula: 'Certidão de inteiro teor da matrícula (descrição e confrontações).',
    endereco: 'Alvará/habite-se ou matrícula; no rural, denominação do imóvel na matrícula/CCIR e roteiro de acesso da vistoria.',
    municipio: 'Matrícula, CCIR ou IPTU.',
    coordenadas: 'GPS na vistoria (ponto na sede ou no acesso) ou georreferenciamento/CAR.',
    dataVistoria: 'Carimbo de data das fotos de campo ou anotação da vistoria.',
    art: 'Sistema do CREA/CAU: emitir a ART/RRT do trabalho antes de assinar o laudo.',
    registro: 'Carteira profissional / cadastro no CREA ou CAU.',
    ccir: 'SNCR/INCRA (sncr.serpro.gov.br) — emitir o CCIR do exercício com o código do imóvel.',
    nirf: 'Receita Federal (declaração do ITR / consulta CAFIR).',
    car: 'SICAR (car.gov.br) — consulta pública pelo número do recibo ou demonstrativo do CAR.',
    areaReservaLegal: 'Demonstrativo do CAR (SICAR) ou averbação na matrícula.',
    areaApp: 'Demonstrativo do CAR (SICAR) ou levantamento topográfico.',
    sigef: 'SIGEF/INCRA (sigef.incra.gov.br) — consulta de parcelas certificadas.',
    usoAtual: 'Vistoria de campo, demonstrativo do CAR e declaração do ITR.',
    inscricaoIptu: 'Carnê do IPTU ou certidão da prefeitura.',
    areaTerreno: 'Matrícula ou cadastro imobiliário da prefeitura.',
    areaConstruida: 'Habite-se, projeto aprovado ou cadastro da prefeitura; medir na vistoria se não houver.',
    habiteSe: 'Prefeitura (setor de aprovação de projetos).',
    banco: 'Ordem de serviço ou proposta do banco.',
    contrato: 'Ordem de serviço ou proposta do banco.',
    proponente: 'Ordem de serviço ou proposta do banco.',
    processo: 'Intimação/nomeação recebida ou consulta processual no PJe do tribunal.',
    vara: 'Cabeçalho da decisão de nomeação (PJe).',
    comarca: 'Cabeçalho da decisão de nomeação (PJe).',
    autor: 'Petição inicial nos autos (PJe).',
    reu: 'Petição inicial ou contestação nos autos (PJe).',
    objetoPericia: 'Decisão que determinou a perícia (PJe).',
    dataNomeacao: 'Decisão de nomeação (PJe).',
    prazoLaudo: 'Decisão de nomeação ou despacho posterior (PJe).',
    assistentes: 'Petições das partes indicando assistentes técnicos (PJe).',
    quesitos: 'Petições de quesitos das partes e do juízo (PJe).',
    areaTotal: 'Matrícula, georreferenciamento ou CCIR.',
    areaFaixa: 'Decreto de utilidade pública, projeto/memorial da faixa da concessionária ou petição inicial.',
    larguraFaixa: 'Projeto da linha/duto (concessionária) ou resolução autorizativa (ANEEL/ANP).',
    extensaoFaixa: 'Projeto da faixa (concessionária) ou medição no georreferenciamento.',
    decretoDup: 'Diário Oficial ou resolução autorizativa da ANEEL/ANP.',
    empreendimento: 'Petição inicial, decreto ou projeto da concessionária.',
    restricoesFaixa: 'Escritura/contrato de servidão, normas técnicas da concessionária ou decreto.',
    ofertaInicial: 'Petição inicial ou guia de depósito nos autos.',
    aluguelAtual: 'Contrato de locação vigente e último recibo.',
    obraNome: 'Contrato com a construtora ou alvará de construção.',
    obraEndereco: 'Alvará de construção.',
    construtora: 'Contrato de serviço ou alvará de construção.',
    alvaraObra: 'Construtora ou prefeitura (alvará de construção).',
    responsavelObra: 'ART de execução da obra (construtora / CREA).',
    tipoObra: 'Cronograma ou memorial da obra (construtora).',
    inicioObra: 'Cronograma da obra (construtora).',
    coefServidao: 'Decisão técnica do avaliador: restrições de uso na faixa (normas da concessionária) e referências de mercado/literatura.',
    justifServidao: 'Redação do avaliador a partir das restrições da faixa.',
    percRemanescente: 'Decisão técnica do avaliador: forma, acesso e fracionamento da área remanescente.',
    respostasQuesitos: 'Redação do perito, quesito por quesito, com base no laudo.',
    benfeitoriasCusto: 'Vistoria (quantidades) + custo de reedição (SINAPI, CUB, tabelas regionais) + depreciação pela idade e estado.',
    liquidacaoParam: 'Prazo de absorção observado no mercado (tempo médio das ofertas) e taxa de desconto justificada.',
    descricaoRegiao: 'Vistoria e dados públicos (IBGE, prefeitura, mapas).',
    descricaoImovel: 'Vistoria de campo.',
    diagnosticoMercado: 'Pesquisa de mercado: número de ofertas, tempo de anúncio, contato com corretores.',
    imoveisVizinhos: 'Levantamento em campo dos imóveis confrontantes e vizinhos à obra.',
    anomalias: 'Vistoria de cada imóvel vizinho, ambiente por ambiente, com foto e medida.'
  };

  IV.porId = {};
  IV.CAMPOS.forEach(function (c) { IV.porId[c.id] = c; c.comoObter = IV.COMO_OBTER[c.id] || ''; });

  // Valor que o projeto já tem para um campo (usado no anexo "origem dos dados").
  IV.valorNoProjeto = function (proj, c) {
    if (!c.destino) return '';
    const partes = c.destino.split('.');
    let o = partes[0] === 'tipoLaudo' ? INF.TiposLaudo.ler(proj) : proj;
    if (partes[0] === 'tipoLaudo') partes.shift();
    for (let i = 0; i < partes.length; i++) { if (o == null) return ''; o = o[partes[i]]; }
    if (o == null || (typeof o === 'number' && !Number.isFinite(o))) return '';
    if (Array.isArray(o)) return o.length ? o.length + ' item(ns)' : '';
    return String(o);
  };

  // Inventário do modelo: os campos que ESTE tipo de laudo usa.
  IV.doModelo = function (tl) { return IV.CAMPOS.filter(function (c) { return c.quando(tl); }); };
  // Campos que a IA pode buscar nos documentos para este modelo.
  IV.paraIA = function (tl) {
    return IV.doModelo(tl).filter(function (c) { return c.quem === 'documento'; }).map(function (c) { return { id: c.id, descricao: c.rotulo + ' — ' + c.desc }; });
  };
  IV.rotulo = function (id) { return (IV.porId[id] || {}).rotulo || id; };

  // Normaliza para comparar ("172,5 ha" = "172,50 ha"; maiúsculas/espaços não contam).
  IV.normalizar = function (v) {
    const s = String(v === null || v === undefined ? '' : v).trim().toLowerCase().replace(/\s+/g, ' ');
    const n = U.lerNumero(s);
    const soNumero = /^[\d.,\s]+(ha|m²|m2|hectares?|alqueires?)?$/.test(s);
    return soNumero && Number.isFinite(n) ? 'n:' + n + ':' + ((s.match(/ha|m²|m2|hectare|alqueire/) || [''])[0].replace('hectare', 'ha').replace('m2', 'm²')) : 's:' + s.replace(/[.,;:]+$/, '');
  };
  const dataDoc = function (reg) {
    const d = [reg.dataDocumento].concat(reg.datas || []).map(function (x) { const m = String(x || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? m[0] : ''; }).filter(Boolean).sort();
    return d.length ? d[d.length - 1] : '';
  };

  // ---------------------------------------------------------------------------
  // Ficha do modelo: um registro por campo do inventário, com estado e fonte.
  // ---------------------------------------------------------------------------
  IV.ficha = function (tl, inventario, decisoes, valorAtual) {
    const cand = {};
    Object.keys(inventario || {}).forEach(function (h) {
      const reg = inventario[h];
      (reg.dados || []).forEach(function (d) {
        (cand[d.campo] = cand[d.campo] || []).push({ valor: d.valor, pagina: d.pagina, trecho: d.trecho, arquivo: reg.arquivo, hash: h, tipo: reg.tipo, data: dataDoc(reg) });
      });
      if ((reg.quesitos || []).length) (cand.quesitos = cand.quesitos || []).push({ valor: reg.quesitos.length + ' quesito(s)', lista: reg.quesitos, arquivo: reg.arquivo, hash: h, tipo: reg.tipo, data: dataDoc(reg) });
    });
    return IV.doModelo(tl).map(function (c) {
      const base = { campo: c.id, rotulo: c.rotulo, quem: c.quem, obrig: c.obrig, fontesEsperadas: c.fontes || [], destino: c.destino };
      const atual = valorAtual ? valorAtual(c) : '';
      if (c.quem === 'calculo') return Object.assign(base, { estado: 'RESOLVIDA', valor: 'calculado pelo programa', porque: 'sai do tratamento estatístico' });
      if (c.quem === 'avaliador') {
        return Object.assign(base, atual ? { estado: 'RESOLVIDA', valor: atual, porque: 'preenchido pelo avaliador' } : { estado: 'NÃO ENCONTRADA', valor: '', porque: 'julgamento do avaliador — preencher na tela' });
      }
      const lista = cand[c.id] || [];
      const dec = decisoes && decisoes[c.id];
      if (dec) return Object.assign(base, { estado: 'RESOLVIDA', valor: dec.valor, fonte: dec.fonte, candidatos: lista, porque: 'decisão do avaliador' + (dec.porque ? ': ' + dec.porque : '') });
      if (!lista.length) {
        return Object.assign(base, atual ? { estado: 'RESOLVIDA', valor: atual, candidatos: [], porque: 'digitado pelo avaliador (sem documento)' }
          : { estado: 'NÃO ENCONTRADA', valor: '', candidatos: [], porque: 'nenhum documento traz este dado' });
      }
      const ordem = c.fontes || [];
      const rank = function (x) { const i = ordem.indexOf(x.tipo); return i < 0 ? 999 : i; };
      const ord = lista.slice().sort(function (a, b) { return rank(a) - rank(b) || (b.data || '').localeCompare(a.data || ''); });
      const topo = ord[0];
      const distintos = new Set(lista.map(function (x) { return IV.normalizar(x.valor); }));
      if (c.id === 'quesitos') return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: lista.length > 1 ? 'quesitos em ' + lista.length + ' documentos' : 'um documento' });
      if (distintos.size === 1) return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: lista.length > 1 ? lista.length + ' documentos concordam' : 'um documento' });
      if (rank(topo) === 999) return Object.assign(base, { estado: 'NÃO SOLUCIONADA', valor: '', candidatos: lista, porque: 'documentos divergem e nenhum é dono deste campo' });
      const nivel = ord.filter(function (x) { return rank(x) === rank(topo); });
      if (new Set(nivel.map(function (x) { return IV.normalizar(x.valor); })).size === 1) {
        return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: 'divergência resolvida pelo documento dono do campo (' + topo.tipo.replace(/_/g, ' ') + ')' });
      }
      if (topo.data && nivel.filter(function (x) { return x.data === topo.data; }).length === 1) {
        return Object.assign(base, { estado: 'RESOLVIDA', valor: topo.valor, fonte: topo, candidatos: lista, porque: 'documento mais recente do mesmo tipo (' + topo.data.split('-').reverse().join('/') + ')' });
      }
      return Object.assign(base, { estado: 'NÃO SOLUCIONADA', valor: '', candidatos: lista, porque: 'dois documentos do mesmo tipo divergem e não há data para desempatar' });
    });
  };

  // ---------------------------------------------------------------------------
  // Trava de leitura e arquivos sumidos
  // ---------------------------------------------------------------------------
  IV.trava = function (docs, inventario) {
    const problemas = [];
    (docs || []).forEach(function (d) {
      if (!d.hash) { problemas.push({ arquivo: d.nome, texto: 'identificação do arquivo ainda sendo calculada' }); return; }
      const reg = inventario && inventario[d.hash];
      if (!reg) { problemas.push({ arquivo: d.nome, texto: d.status && /formato|erro/.test(d.status) ? d.status : 'documento não lido' }); return; }
      const foto = reg.tipo === 'foto_vistoria' || reg.tipo === 'anuncio_mercado';
      if (!foto && ((reg.resumo || '').length < 120 || !/\d/.test(reg.resumo || ''))) problemas.push({ arquivo: d.nome, texto: 'resumo raso (menos de 120 caracteres ou sem número): ler de novo, inteiro' });
      if (!foto && !(reg.dados || []).length && !(reg.quesitos || []).length && ['documento_pessoal', 'planta_mapa', 'outro'].indexOf(reg.tipo) < 0) problemas.push({ arquivo: d.nome, texto: 'nenhum dado saiu deste documento — conferir se foi lido por inteiro', leve: true });
    });
    return problemas;
  };
  IV.sumidos = function (docs, inventario) {
    const presentes = new Set((docs || []).map(function (d) { return d.hash; }));
    return Object.keys(inventario || {}).filter(function (h) { return !presentes.has(h); }).map(function (h) { return inventario[h].arquivo; });
  };

  // ---------------------------------------------------------------------------
  // Checagem antes de entregar
  // ---------------------------------------------------------------------------
  IV.checagem = function (ficha, trava) {
    const pend = [];
    (trava || []).filter(function (t) { return !t.leve; }).forEach(function (t) { pend.push('Documento ' + t.arquivo + ': ' + t.texto); });
    ficha.forEach(function (f) {
      if (!f.obrig) return;
      if (f.estado === 'NÃO SOLUCIONADA') pend.push(f.rotulo + ': NÃO SOLUCIONADA — ' + f.porque);
      if (f.estado === 'NÃO ENCONTRADA') pend.push(f.rotulo + ': NÃO ENCONTRADA — ' + f.porque);
    });
    return { bloqueada: pend.length > 0, pendencias: pend,
      mensagem: pend.length ? 'ENTREGA BLOQUEADA - FAVOR VERIFICAR ESTAS PENDÊNCIAS' : 'Checagem sem pendências: todos os campos do modelo resolvidos com fonte.' };
  };

  INF.Inventario = IV;
})(globalThis.INF = globalThis.INF || {});
