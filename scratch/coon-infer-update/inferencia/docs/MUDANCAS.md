# COON Infer — Mudanças da versão 1.1.0 (30/09/2026)

Para quem já tem a 1.0.0: **substitua a pasta inteira** (é mais seguro que aplicar arquivo por arquivo — muitos arquivos mudaram juntos). Não há mudança no banco: a migração `001_inferencia.sql` continua a mesma. No servidor do COON, os 3 trechos de `integracao/trecho-server-coon.mjs` continuam iguais.

## Nome e marca
- O programa passa a se chamar **COON Infer** (marca COON, sem ponto). O endereço técnico continua `/inferencia/`.

## Sequência das etapas
- **A aba 1 (Projeto) é a única obrigatória antes de começar**: responsável técnico, código do trabalho, imóvel, observação, tipologia, município e data base. Enquanto ela não estiver completa, as outras abas levam de volta a ela com a lista do que falta.
- Depois da aba 1, **todas as abas ficam livres, em qualquer ordem** (dá para lançar amostras primeiro).
- **Nada roda com dado faltando**: calcular, buscar, estimar, gerar laudo e exportar PDF checam as etapas necessárias e dizem o que falta.
- **Sinal embaixo de cada aba e ao lado de cada campo obrigatório**: ✓ verde completo, ✗ vermelho faltando. Barra de progresso das etapas no alto da tela.
- Arquivos: `motor/23-etapas.js`, `web/js/interface.js`.

## Modelos de laudo (17) e estilos (20)
- **17 modelos**: particular valor (simplificado e completo), particular locação, extrajudicial venda, extrajudicial locação, bancário, servidão concessionária, rural pleno domínio, judicial valor, judicial locação, judicial servidão, judicial servidão e pleno domínio, desapropriação, inventário/partilha, parecer de assistente técnico, vizinhança e vizinhança judicial.
- **Três níveis**: simplificado (particular), completo (extrajudicial, banco, rural) e pericial (judicial — processo, quesitos, origem de cada dado, anexos completos).
- **20 estilos de apresentação** (1 a 20) para qualquer modelo: capa, fonte, cor, cabeçalho, rodapé, tabelas, fotos por linha e sumário. Escolha antes ou na hora de gerar; "Ver os 20 estilos lado a lado" compara.
- **Capa e sumário** em todos os modelos (o Word atualiza as páginas do sumário ao abrir).
- **Pesquisa de mercado** no laudo: raio de referência, distância de cada amostra ao imóvel, mapa com o raio e tabela das amostras.
- **Ficha de cada amostra** com o print do anúncio.
- **Anexo "Origem de cada dado"**: cada informação com documento, página e trecho, ou decisão do signatário, ou "[preencher]" com o caminho para conseguir.
- Arquivos: `motor/21-modelos-laudo.js`, `motor/22-estilos-laudo.js`, `motor/18-laudo.js`.

## Inventário e extração (modelo da RAE)
- Inventário de dados **por modelo de laudo**: cada dado diz quem preenche (documento, avaliador ou cálculo) e **como conseguir** quando falta.
- Leitura de todos os documentos, uma vez cada (SHA-256), com fonte; divergência resolvida pelo documento dono do dado; checagem com "ENTREGA BLOQUEADA".
- A IA recebe a lista do modelo e devolve também **outros achados importantes**.
- Arquivos: `motor/20-inventario.js`, `servidor/inventario-ia.mjs`.

## Amostras e pesquisa
- Coluna **Print** na grade de amostras; na Pesquisa de mercado, **colar o print com Ctrl+V**.
- Conferência cobra as exigências do modelo: print ou link das ofertas, amostras além do raio, coordenadas no pericial.
- Raio de pesquisa configurável (padrão 3 km urbano, 60 km rural).

## Gráficos
- A aba Gráficos abre desde o início e mostra as molduras mesmo **sem dados**, dizendo o que falta.

## Quadro de dúvidas
- Botão fixo **"Dúvidas? Pergunte à IA"**: a IA vê o manual do programa e o estado da tela (sem CPF nem telefone) e orienta como preencher, calcular e interpretar. Não preenche nem inventa dado.
- Arquivo: `servidor/duvidas-ia.mjs`.

## Teste automático dos botões
- Abra `/inferencia/?teste=botoes`: clica em todos os botões de todas as abas com um projeto de teste, gera os 17 modelos e os 20 estilos, e devolve o seu projeto intacto. Resultado desta versão: 434 ações, 0 falhas.
- Arquivo: `web/js/teste-botoes.js`.

## Landing page
- `web/landing.html` (abre em `/inferencia/landing.html`): página de apresentação do COON Infer, leve, em claro e escuro, sem depoimento nem número inventado.
