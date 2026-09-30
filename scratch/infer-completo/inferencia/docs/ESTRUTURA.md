# COON Infer — Estrutura do sistema

Programa próprio de avaliação de imóveis por inferência estatística (ABNT NBR 14.653), com laudo completo. Roda na nuvem, dentro do login único do COON.

Versão do motor: 1.0.0 · Data: 29/09/2026

---

## 1. Visão geral

```
 NAVEGADOR (engenheiro)                     SERVIDOR (Railway)                      SERVIÇOS
 ┌─────────────────────────┐   HTTPS      ┌──────────────────────────────┐
 │ web/index.html          │ ───────────▶ │ servidor/server.mjs          │
 │  tela (9 abas)          │   cookie     │  └ rotas-inferencia.mjs      │ ──▶ [SUPABASE] banco (projetos,
 │  motor/ (cálculo local) │ ◀─────────── │     motor/ (o MESMO código)  │       banco de mercado, auditoria)
 └─────────────────────────┘   JSON       │     supabase.mjs             │ ──▶ [SUPADATA] leitura de 1 anúncio
                                          │     supadata.mjs             │       pelo link
                                          │     conferencia-ia.mjs       │ ──▶ [CLAUDE] conferência das amostras
                                          └──────────────────────────────┘
                                                     │ /api/sessao
                                                     ▼
                                          Login único COON (app.copontoon.com)
```

Decisões de projeto:

- **O cálculo roda no navegador.** A regressão, a busca de 500 modelos, a RNA e a NBR respondem na hora, sem custo de servidor e mesmo sem internet. O servidor usa **os mesmos arquivos** do motor para relatório, integrações e conferência.
- **Chaves ficam só no servidor.** O navegador nunca fala direto com o Supabase, a Supadata ou a API da IA. Segue a regra já usada no COON: RLS ligado e nenhum acesso para `anon` ou `authenticated`.
- **Zero dependência.** Não há `npm install`: é Node 20+ puro no servidor e JavaScript puro na tela. Nada quebra por atualização de biblioteca, e cada conta está à vista no código.
- **Projeto em JSON aberto.** O mesmo formato vai para o banco (coluna `jsonb`) e para o arquivo `.inferencia.json` que o engenheiro baixa.

---

## 2. Pastas e arquivos

```
inferencia-nbr/
├── motor/                        ← núcleo estatístico (navegador + servidor)
│   ├── 00-base.js                  números pt-BR, formatação, semente, Haversine, datas
│   ├── 01-matriz.js                transpor, multiplicar, XᵀX, inversa (Gauss-Jordan)
│   ├── 02-distribuicoes.js         t, F, Normal, Qui² (beta e gama incompletas)
│   ├── 03-transformacoes.js        escalas x, 1/x, ln, x², 1/x², √x, 1/√x e "fora"
│   ├── 04-regressao.js             mínimos quadrados, R², F, t, Sig, elasticidade, equação
│   ├── 05-diagnosticos.js          normalidade, Breusch-Pagan, DW, VIF, Cook, PRESS, AIC
│   ├── 06-busca-modelos.js         busca exaustiva/heurística e ranking dos N melhores
│   ├── 07-nbr14653.js              Tabelas 1, 2 e 5, extrapolação, micronumerosidade
│   ├── 08-projecao.js              estimativa, IC 80%, predição, arbítrio, arredondamento
│   ├── 09-rna.js                   rede neural com bagging e sensibilidade
│   ├── 10-dados.js                 projeto, variáveis, amostras, CSV, gravação
│   ├── 11-operar-variaveis.js      fórmulas (VU = VT / Area) sem eval
│   ├── 12-pesquisa-mercado.js      portais, fontes de transação, leitor de anúncio
│   ├── 13-graficos.js              SVG: dispersão, resíduos, histograma, Q-Q
│   ├── 14-relatorio.js             relatório estatístico para anexar ao laudo
│   ├── 15-conferencia.js           modelo híbrido, regras de conferência, correção autorizada
│   ├── 16-avancado.js              PCA, K-médias, DEA, Box-Cox, bootstrap, Huber, Moran, boosting, Monte Carlo
│   ├── 17-planilha.js              exportação .xlsx (zip próprio, 13 abas)
│   ├── 18-laudo.js                 laudo completo em Word e PDF, valor por extenso
│   ├── 19-tipos-laudo.js           tipos de laudo (urbano/rural, destino, objeto, vizinhança) e contas de servidão, remanescente, VLF, VTN
│   ├── 20-inventario.js            inventário de dados por modelo de laudo, caminho para conseguir, ficha, trava e checagem
│   ├── 21-modelos-laudo.js         17 modelos de laudo (simplificado, completo, pericial) e capítulos de cada um
│   ├── 22-estilos-laudo.js         20 estilos de apresentação (capa, fonte, cor, tabelas, fotos, sumário)
│   └── 23-etapas.js                sequência das etapas: aba 1 obrigatória, sinais ✓/✗, o que falta para rodar
├── web/                          ← tela
│   ├── index.html
│   ├── css/estilo.css              tema claro/escuro, celular
│   └── js/
│       ├── nuvem.js                chamadas ao servidor ([SUPABASE] [SUPADATA] [CLAUDE])
│       └── interface.js            abas, botões e vínculos com o projeto
├── servidor/                     ← nuvem
│   ├── server.mjs                  servidor independente (Railway ou PC)
│   ├── rotas-inferencia.mjs        módulo plugável no servidor do COON
│   ├── supabase.mjs                [SUPABASE] projetos, banco de mercado, auditoria
│   ├── supadata.mjs                [SUPADATA] leitura de anúncio por link
│   ├── conferencia-ia.mjs          [CLAUDE] conferência e sugestões de correção
│   ├── google-maps.mjs             [GOOGLE MAPS] satélite e mapa de situação
│   ├── inventario-ia.mjs           [CLAUDE] inventário dos documentos da pasta do trabalho
│   └── duvidas-ia.mjs              [CLAUDE] quadro de dúvidas (assistente do preenchimento)
├── supabase/migrations/
│   └── 001_inferencia.sql          [SUPABASE] tabelas, índices, RLS
├── testes/
│   ├── teste-motor.cjs             roda o motor com dados sintéticos
│   └── conferir_statsmodels.py     confere número a número com o statsmodels
├── integracao/trecho-server-coon.mjs  ← os 3 trechos para plugar no servidor do COON
├── scripts/juntar-codigo.mjs     ← gera docs/CODIGO-COMPLETO.md
├── docs/IMPLANTACAO.md           ← passo a passo para a nuvem
├── docs/ESTRUTURA.md              (este arquivo)
├── docs/CODIGO-COMPLETO.md        todo o código num arquivo só
├── package.json · railway.json · .env.exemplo · .gitignore
```

Marcadores no código para achar as integrações:

| Marcador | Serviço | Onde |
|---|---|---|
| `[SUPABASE]` | banco de dados | `servidor/supabase.mjs`, `supabase/migrations/001_inferencia.sql`, rotas, `web/js/nuvem.js` |
| `[SUPADATA]` | leitura de anúncio pelo link | `servidor/supadata.mjs`, rota `anuncio`, `web/js/nuvem.js` |
| `[CLAUDE]` | conferência por IA | `servidor/conferencia-ia.mjs`, rota `conferir-ia`, `web/js/nuvem.js` |
| `[GOOGLE MAPS]` | imagens de mapa no laudo | `servidor/google-maps.mjs`, rota `mapa`, `web/js/nuvem.js` |

---

## 3. Funções do programa

| Função | Onde fica | Situação |
|---|---|---|
| Novo / Abrir / Salvar | Topo: Novo, Meus projetos, Salvar (nuvem), Baixar/Abrir .json | feito |
| Propriedades (autor, tipologia) | Aba Projeto | feito |
| Incluir / excluir / renomear variáveis | Aba Variáveis | feito |
| Tipos: dependente, quantitativa, qualitativa | + dicotômica, proxy, tempo, identificação | feito |
| Operar Variáveis | Aba Variáveis → Operar (fórmula livre, sem eval) | feito |
| Micronumerosidade | Conferência + aba Avaliação (regra A.2 por faixa de n) | feito |
| Durbin-Watson | Aba Modelo | feito |
| PCA — componentes principais | Ferramentas avançadas → PCA | feito |
| Editar / incluir amostras | Aba Amostras (grade editável, +1, +5) | feito |
| Desabilitar / Reconsiderar dados | ✓ por linha, "Tirar do cálculo", "Reconsiderar todas" | feito |
| Bloco de notas da amostra | Campo Observação por amostra | parcial (sem foto) |
| Importar / Exportar Excel | Importar/Exportar CSV (Excel salva e abre CSV) com mapeamento de colunas | feito |
| Importar dados de outros programas | Exportar para Excel/CSV → importar aqui | por planilha |
| Regressão linear | Aba Modelo → Calcular | feito |
| Busca de modelos | Aba Busca de modelos (até 5.000 guardados, padrão 500) | feito |
| Equação | Equação na forma transformada e explícita | feito |
| Resíduos | Tabela de resíduos + gráfico ±2σ | feito |
| Correlações | Isoladas e parciais, com alerta acima de 0,80 | feito |
| Aderência / normalidade | Proporções ±1/1,64/1,96σ + Shapiro-Wilk + K-S Lilliefors + Jarque-Bera + Q-Q | feito |
| Projeção do avaliando | Aba Avaliação e NBR | feito |
| Regressão Não Linear | Busca de escalas (inclusive y em ln, 1/y...) + R² na escala original | feito (ver nota) |
| Rede neural / bagging | Aba Rede neural | feito |
| Poda da rede neural | Rede neural → Poda | feito |
| DEA | Ferramentas avançadas → DEA (CCR, simplex) | feito |
| Gráficos de dispersão / distribuição | Gráficos SVG com numeração das amostras | feito |
| Grau de fundamentação e precisão | Tabelas 1, 2 e 5 com "o que falta para subir de grau" | feito |
| Campo de arbítrio / extrapolação | Aba Avaliação | feito |
| Visualização de impressão / PDF | Botão **Exportar PDF** (relatório completo com todos os gráficos) | feito |
| Exportar planilhas | Botão **Exportar Excel** (.xlsx com 13 abas) | feito |
| K-médias (agrupamento) | Ferramentas avançadas → K-médias | feito |
| Simulação de variáveis aleatórias | Ferramentas avançadas → Monte Carlo | feito |
| ANOVA | Aba Modelo, Excel e PDF | feito |
| Bootstrap dos coeficientes | Ferramentas avançadas | feito |
| Árvores com reforço (tipo XGBoost) | Ferramentas avançadas, com importância das variáveis | feito |
| Gráficos por variável | Aba Gráficos: frequência de todas as variáveis, curva do modelo por variável, resíduos por variável, Cook, alavancagem, mapa | feito |
| Estimativa por moda / mediana / média (y em ln) | Aba Projeto → critério | feito |

Nota sobre regressão não linear: a busca de modelos testa de forma exaustiva as escalas das variáveis (y em ln, x em 1/x etc.). Uma regressão não linear por mínimos quadrados iterativos entra no roteiro (seção 7).

---

## 4. Fluxo de trabalho

1. **Projeto**: identificação, data base e critérios. Há também o botão "Montar variáveis sugeridas", que cria só a estrutura das variáveis por tipologia, nunca dado.
2. **Variáveis**: tipos, direção esperada, escalas que a busca pode testar, códigos.
3. **Amostras**: escolher a **origem dos dados** (modelo híbrido):
   - *Só as minhas*: o que foi lançado ou importado neste projeto;
   - *Só dados do sistema*: banco de mercado, com as pesquisas anteriores do engenheiro e as compartilhadas na COON;
   - *Híbrido*: as duas fontes juntas, sem repetir. As que vêm do banco aparecem em azul e podem ser desligadas uma a uma.
4. **Conferência antes de calcular**:
   - **Regras fixas** (motor, resultado sempre igual): vazios, duplicatas, discrepantes pelo intervalo interquartil, dado com mais de 24 meses, data futura, falta de informante, quantidade mínima 3(k+1), micronumerosidade prevista.
   - **IA** (servidor): aponta incoerências que regra não pega e **pode sugerir correção** — corrigir um campo, tirar amostra do cálculo ou trocar escala — sempre com a **evidência** de onde saiu o valor.
   - **Autorização**: nada muda sozinho. O avaliador marca as sugestões que aceita e clica em "Aplicar". Cada alteração vai para o **histórico** (antes, depois, evidência, data), pode ser **desfeita** e sai no relatório como "Saneamento dos dados".
   - Proibido para a IA: criar amostra, inventar ou estimar valor sem evidência, mexer no avaliando, sugerir o valor do imóvel. O servidor descarta qualquer sugestão fora dessas regras antes de mostrar.
5. **Pesquisa de mercado**: busca nos portais (abre em outra aba), leitura de um anúncio pelo link ([SUPADATA]) ou pelo texto colado, e fontes de transação (ITBI, cartório, SIMIL, INCRA).
6. **Modelo**: escolher as escalas → Calcular → regressores com semáforo de Sig, pressupostos, correlações e gráficos.
7. **Busca de modelos**: testa todas as combinações e guarda as 500 melhores; o botão "Usar" aplica a combinação escolhida.
8. **Rede neural**: serve para comparação.
9. **Avaliação e NBR**: estimativa, IC 80%, predição, amplitude, graus, extrapolação e micronumerosidade.
10. **Relatório**: documento para anexar ao laudo, com impressão em PDF.

---

## 5. Critérios da NBR adotados (conferir com o exemplar vigente)

Todos ficam num bloco só: `motor/07-nbr14653.js → N.NORMA`. Quando a norma mudar, basta alterar esse bloco.

| Item (NBR 14.653-2:2011) | Grau III | Grau II | Grau I |
|---|---|---|---|
| 2 — dados efetivamente usados | 6(k+1) | 4(k+1) | 3(k+1) |
| 4 — extrapolação | não admitida | 1 variável, limites 2×máx e ½×mín, ≤ 15% na fronteira | limites iguais, ≤ 20% (isoladas e em conjunto) |
| 5 — Sig dos regressores | 10% | 20% | 30% |
| 6 — Sig do F | 1% | 2% | 5% |
| Enquadramento | 16 pontos; 2, 4, 5 e 6 no III; demais ≥ II | 10 pontos; 2, 4, 5 e 6 ≥ II; demais ≥ I | todos ≥ I |
| Precisão — amplitude do IC 80% / central | ≤ 30% | ≤ 40% | ≤ 50% |

Os valores acima devem ser conferidos no exemplar vigente da norma antes do primeiro laudo.

Micronumerosidade (A.2): n ≤ 30 → 3 por código; 30 < n ≤ 100 → 10% de n; n > 100 → 10.

Opções de critério na aba Projeto:
- se a constante entra ou não no item 5 (padrão: entra, que é o mais conservador);
- estimativa por mediana, média ou moda quando y está em ln;
- fator de oferta (padrão 0,90, só para dados de oferta).

---

## 6. Diferenciais

- **R² na escala original**: compara de forma justa um modelo em VU com outro em ln(VU). No teste, o R² ajustado puro escolheu y² como "melhor", o que é um artefato da escala.
- **R² de previsão (PRESS / validação cruzada deixa-um-fora)** e **AIC/BIC** como critérios de escolha.
- **Shapiro-Wilk, Jarque-Bera, Breusch-Pagan e VIF**, além do K-S e das proporções.
- **Correlação parcial** ao lado da isolada.
- **Busca com filtros de norma**: Sig por grau, Sig do F, **sinais coerentes com a direção esperada**, exclusão de variável.
- **Extrapolação calculada pela regra da norma** (fronteira, 15%/20%, isoladas e em conjunto) e "o que falta para subir de grau".
- **Banco de mercado** reaproveitável entre laudos e compartilhável, com o **modelo híbrido**.
- **Conferência em duas camadas** (regras + IA), com **correção só por autorização**, histórico e desfazer.
- **Leitor de anúncio** (preço, área, alqueire convertido, telefone, VU).
- **RNA reproduzível** (semente) e com **sensibilidade por variável**.
- **Trilha de auditoria** no banco (quem salvou, conferiu e corrigiu, e quando).
- Funciona no **celular** e **sem instalar nada**.

---

### Novidades acrescentadas depois (29/09/2026)

- **Box-Cox**: diz com número a escala ideal da dependente (e aplica com um clique).
- **Bootstrap** do valor do avaliando e **dos coeficientes** (intervalo e % de vezes que o sinal se manteve).
- **Regressão robusta de Huber**: compara com o modelo comum e mostra quais amostras perderam peso.
- **I de Moran**: autocorrelação espacial dos resíduos.
- **Árvores com reforço (tipo XGBoost)** com **importância das variáveis** e validação separada.
- **Simulação Monte Carlo** do valor (percentis P5 a P95).
- **Calcular tudo (automático)**: confere → tira ofertas sem fonte/contato → busca → escolhe o melhor modelo dentro da norma (III → II → I) → calcula → projeta.
- **Regra da casa**: oferta só entra com **fonte e telefone ou link**; oferta com fator **0,90**, transação **1,00**.
- **Estatística descritiva** (média, **mediana**, desvio, CV, quartis, assimetria) e **graus** de fundamentação e precisão visíveis nas abas.


### Laudo completo (29/09/2026)

Aba **Laudo**: gera o laudo inteiro em **Word (.docx)** e **PDF**, na estrutura da NBR 14.653-1 (solicitante, finalidade, objetivo, pressupostos, imóvel, vistoria, diagnóstico de mercado, método, tratamento, especificação, resultado com valor por extenso, encerramento e anexos A a D). Mapas do Google (satélite e situação, [GOOGLE MAPS], chave no servidor), print de mapa ou mapa esquemático; fotos da vistoria, documentos e amostras; anexo estatístico completo opcional. Campos vazios saem marcados como [preencher: …]. Autor do arquivo = responsável técnico.

### Tipos de laudo e inventário de documentos (29/09/2026)

- **Tipo de laudo para marcar** (aba Laudo completo): âmbito urbano/rural, tipo do imóvel, destino (banco, judicial, particular, órgão público) e objeto (pleno domínio, servidão, remanescente, desapropriação, terra nua + benfeitorias, valor locativo, liquidação forçada, partilha, contábil). Atalhos: Banco; Judicial — valor; Judicial — servidão; Judicial — servidão e pleno domínio; Pleno domínio rural/urbano; entre outros.
- O laudo muda conforme o tipo: título (Laudo de avaliação / Laudo pericial / Parecer técnico), identificação do processo, diligência, **respostas aos quesitos**, e as contas: **indenização da servidão**, **desvalorização do remanescente**, **terra nua + benfeitorias**, **liquidação forçada**. A conclusão lista cada valor com o extenso.
- **Inventário de documentos pela IA**: anexar a pasta do trabalho; a IA lê cada PDF/imagem (um por vez), diz o tipo do documento, resume e sugere campos do laudo (matrícula, área, processo, partes, quesitos, fotos da vistoria) com página e trecho. Só entra o que o avaliador marcar; cada preenchimento fica registrado com o documento de origem. O arquivo não é guardado; CPF/RG são descartados. Resultado guardado por arquivo, para não ler duas vezes.

### Inventário por modelo e vizinhança (29/09/2026)

- **Inventário de dados por modelo de laudo** (`motor/20-inventario.js`): cada modelo (banco, judicial valor, judicial servidão, servidão + pleno domínio, pleno domínio rural/urbano, desapropriação, locação, partilha, vizinhança...) tem a lista de TODOS os dados que o laudo usa, e cada dado diz quem preenche: **documento** (a IA extrai, com fonte), **avaliador** (julgamento — a IA não preenche) ou **cálculo**. A IA recebe só a lista do modelo marcado e ainda devolve **outros achados importantes** (ônus, embargo, divergência de área, risco...), que o avaliador escolhe incluir no laudo.
- **Mesmo modelo da RAE:** todos os documentos lidos; cache por SHA-256 (NOVO / ALTERADO / JÁ LIDO; sumidos avisados); fonte = nome do arquivo + página + trecho (clique abre o arquivo); divergência resolvida pelo documento dono do campo, e no mesmo tipo pelo mais recente; trava de leitura (resumo raso reprova); checagem RESOLVIDA / NÃO ENCONTRADA / NÃO SOLUCIONADA com "ENTREGA BLOQUEADA - FAVOR VERIFICAR ESTAS PENDÊNCIAS". Bloqueia a entrega, nunca o preenchimento.
- **Laudo de vistoria cautelar de vizinhança:** obra, imóveis vizinhos, ambientes, anomalias (tipo, localização, dimensão, descrição), fotos por imóvel, recusas, conclusão; versão judicial (produção antecipada de prova). Sem cálculo de valor.

### Versão 1.1.0 (30/09/2026)

Ver `docs/MUDANCAS.md`: nome COON Infer, aba 1 obrigatória e sinais ✓/✗, 17 modelos × 20 estilos, capa e sumário, pesquisa com raio, fichas com print, origem de cada dado, gráficos sem dados, quadro de dúvidas, teste automático de botões e landing page.

## 7. Roteiro (próximas versões)

| Prioridade | Item | Por quê |
|---|---|---|
| Alta | Mapa das amostras e do avaliando | conferir localização e o item 3 da Tabela 1 |
| Alta | Guardar fotos no Supabase Storage | projetos com muitas fotos ficam grandes no banco |
| Média | Regressão espacial (SAR/SEM) e GWR | autocorrelação espacial é comum em imóvel urbano |
| Média | Regressão não linear verdadeira (Gauss-Newton) | equivale ao RNL no sentido estrito |
| Média | Regressão quantílica | mercados heterogêneos |
| Baixa | NBR 14.653-3 (rural) com tabela própria | trocar `N.NORMA` por perfil |

---

## 8. Como rodar e publicar

**No PC (teste, sem login):**

```bash
cd inferencia-nbr
node --env-file=.env.dev servidor/server.mjs
```

Depois é só abrir http://localhost:8795/inferencia/. Sem Supabase configurado, os projetos ficam em `.dados-locais/`.

**Conferir o motor:**

```bash
node testes/teste-motor.cjs && python testes/conferir_statsmodels.py
```

**Nuvem (Railway):**

1. No Supabase (projeto `coon`), abrir o SQL Editor e rodar `supabase/migrations/001_inferencia.sql`. Antes, conferir as colunas da tabela `aplicativos`.
2. Criar uma chave secreta dedicada, por exemplo `inferencia_servidor`.
3. No Railway, criar o serviço a partir desta pasta. O `railway.json` já define o início e o healthcheck.
4. Em Variables, cadastrar: `COON_HUB_URL`, `SUPABASE_URL`, `SUPABASE_CHAVE`, `SUPADATA_CHAVE`, `ANTHROPIC_API_KEY`, `GOOGLE_MAPS_CHAVE`. O modelo já vem padrão (`INFERENCIA_MODELO_IA`).
5. Liberar o app `inferencia` para os usuários no painel do COON.
6. Alternativa ao passo 3: plugar no servidor do COON. Basta importar `tratarInferencia` de `servidor/rotas-inferencia.mjs` e chamá-lo antes do 404, sem outro serviço.

**Segurança já embutida:**
- CSP sem script embutido;
- caminhos de arquivo presos à pasta;
- limite de 8 MB por requisição;
- filtro por e-mail em toda consulta ao banco;
- bloqueio de endereço interno na leitura por link;
- erro 500 sem detalhe interno;
- telefone e informante de amostra compartilhada nunca são mostrados a terceiros.

---

## 9. Validação

O motor foi conferido contra o statsmodels/SciPy (Python) com 40 amostras sintéticas. Esses dados servem só para testar as contas: não são mercado e não são amostra de laudo.

Os indicadores bateram com erro relativo entre 1e-7 e 1e-16:
- coeficientes, erros padrão, t e Sig;
- R², R² ajustado, F e Sig F;
- Durbin-Watson, Cook e alavancagem;
- Jarque-Bera, Shapiro-Wilk, Breusch-Pagan e VIF;
- PRESS;
- IC e intervalo de predição de 80%.

O valor-p do Lilliefors difere na 3ª casa porque cada programa usa uma aproximação diferente (JS 0,2378 × Python 0,2348). A estatística D confere.

---

## 10. Pendências

- Conferir no exemplar da NBR os valores do bloco `N.NORMA` (seção 5).
- Conferir as colunas da tabela `aplicativos` antes de rodar a migração.
- Confirmar na documentação da Supadata o endereço `v1/web/scrape` e o campo `content` da resposta.
- Cadastrar as chaves no Railway (nunca no código nem na conversa).
