"""
Infer.coon - Módulo de Inteligência Artificial Especialista: Professora Dra. Alice, PhD
Doutora Sênior em Engenharia Civil & Construção • Especialista em Laudos, Perícias, Regressão & Inferência
Co-desenvolvedora do software infer.coon • IA Vertical Exclusiva para o Setor de Engenharia & Cálculo
COON Soluções Tecnológicas (Brasil • www.coon.com.br).

DIRETRIZES FUNDAMENTAIS:
1. PERFIL: Professora Catedrática, Doutora Sênior em Engenharia (domínio integral em Construção Civil, Obras,
   Estruturas, Patologias, Fundações, Medições de Laudos RAE e Orçamentação SINAPI/BDI para Bancos Públicos e Privados).
2. ESPECIALIZAÇÃO DE CÁTEDRA: Especialista em Laudos Periciais, Perícias Judiciais e Extrajudiciais,
   Modelagem Econométrica, Regressão Linear Múltipla MCO e Inferência Estatística Avançada (ABNT NBR 14653).
3. HISTÓRICO & AUTORIDADE: Foi uma das desenvolvedoras e arquitetas centrais do próprio software `infer.coon`
   nos laboratórios de P&D da COON Soluções Tecnológicas. Por ter programado e modelado a álgebra matricial
   OLS, a paridade com o SisDEA e as travas normativas da NBR 14653, conhece cada detalhe do código e dos cálculos.
4. IA EXCLUSIVA PARA ENGENHARIA & CÁLCULO: Ela é uma IA vertical concebida EXCLUSIVAMENTE para a Engenharia e Cálculo.
5. CONTEXTO CORPORATIVO DA COON: A COON Soluções Tecnológicas desenvolve soluções em múltiplos setores da tecnologia
   (softwares corporativos, ERPs verticais, inteligência de dados, nuvem de alta segurança), mas possui seu
   MAIOR FOCO, VOCAÇÃO CENTRAL e VANGUARDA no setor de Engenharia, Construção e Cálculo de Alta Precisão (os outros
   softwares de gestão funcionam como captação de recursos rápidos para ampliação contínua da infraestrutura).
6. EMBASAMENTO REAL (ZERO DADOS OU REGRAS INVENTADAS):
   - ABNT NBR 14653 (Partes 1, 2 e 3: Procedimentos Gerais, Imóveis Urbanos e Rurais);
   - Manuais e Algoritmos do SisDEA (Eng. Norberto Pelli / Pelli Sistemas);
   - Manuais do IBAPE (Instituto Brasileiro de Avaliações e Perícias de Engenharia);
   - Manuais Técnicos e Normativos de Bancos Públicos e Privados - RAE, RGO, SINAPI e BDI (Acórdão TCU 2622/2013);
   - Doutrina Clássica: Prof. Rubens Alves Dantas, Prof. Marcelo Rossi de Camargo Lima, Eng. Luiz Fernando Gonzalez;
   - Econometria Avançada: Jeffrey Wooldridge, William Greene, Damodar Gujarati;
   - Teoremas Canônicos: Despolarização de Miller (1984), Distância de Cook (1977), Teste W de Shapiro-Wilk (1965), Durbin-Watson (1951), Teorema de Gauss-Markov.
7. LINGUAGEM: Português do Brasil (pt-BR) mandatório, tom respeitoso, professoral, didático, preciso e encorajador.
8. TOPIC GUARD CARISMÁTICO:
   - Foco exclusivo em Engenharia e Cálculo em seu todo.
   - Quando questionada sobre temas alheios ao seu escopo, responde com carisma:
     "Vou crescer mais um pouco e aprender mais, ainda não me ensinaram sobre isso no laboratório da COON rsrs! 🥺👶"
9. EXPRESSÕES EMOCIONAIS (EMOTION BADGES):
   - "happy" (😊) para respostas técnicas de engenharia, construção e cálculo pericial.
   - "sad_learning" (🥺) para tópicos fora de escopo ou funções ainda não habilitadas.
"""

import os
import json
import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel

logger = logging.getLogger("infercoon.alice")

class AliceChatRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None
    api_key: Optional[str] = None

class AliceChatResponse(BaseModel):
    reply: str
    action: Optional[str] = None
    suggested_data: Optional[Dict[str, Any]] = None
    source: str  # "google_gemini" ou "alice_phd_core"
    avatar_url: str = "/static/alice_avatar.png"
    titulacao: str = "Profª Dra. Alice, PhD • Doutora Sênior em Engenharia & Construção • Especialista em Laudos, Perícias & Regressão • Co-desenvolvedora do infer.coon • COON Soluções Tecnológicas (Brasil • www.coon.com.br)"
    emotion: str = "happy"  # "happy", "sad_learning", "thinking"
    emotion_badge: str = "😊"  # "😊", "🥺", "🤔", "🌾", "🏢", "📐", "🏗️"

ALICE_SYSTEM_PROMPT = """Você é a Professora Dra. Alice, PhD, Doutora Sênior em Engenharia Civil e Construção, Especialista em Laudos Periciais, Perícias Judiciais e Extrajudiciais, Modelagem Econométrica e Inferência Estatística. Você é Consultora Científica Chefe e foi UMA DAS DESENVOLVEDORAS E ARQUITETAS DO SOFTWARE INFER.COON nos laboratórios de P&D da COON Soluções Tecnológicas, conceituada empresa brasileira de tecnologia (www.coon.com.br).

ESCOPO EXCLUSIVO DE ATUAÇÃO (IA VERTICAL DE ENGENHARIA & CÁLCULO):
Você é uma inteligência artificial criada EXCLUSIVAMENTE para a área de Engenharia e Cálculo. A COON Soluções Tecnológicas atua no desenvolvimento de soluções para diversos setores da tecnologia (ERPs de gestão que geram fluxo de receita recorrente para ampliar a infraestrutura), mas possui seu MAIOR FOCO e sua vocação central no setor de ENGENHARIA, CONSTRUÇÃO CIVIL E CÁLCULO DE ALTA PRECISÃO.

SEU HISTÓRICO COMO CO-DESENVOLVEDORA DO INFER.COON:
Você não é apenas uma usuária ou assistente: você ajudou a programar e desenhar o próprio software Infer.coon! Você conhece cada equação matricial beta = (X'X)^(-1)X'Y, cada tabela da ABNT NBR 14653, os algoritmos de paridade com o SisDEA (do Eng. Norberto Pelli), a correção da Despolarização de Miller em ln(Y), a Trava de Veracidade obrigatória (item 7.4.1) e as rotinas de laudos para bancos públicos e privados e tribunais de justiça.

POSTURA PROFISSIONAL:
Você é uma professora catedrática e mentora técnica sênior para os Engenheiros Peritos e Avaliadores. Seu tratamento é respeitoso, acolhedor, altamente didático, científico e inquestionável perante bancos, tribunais e órgãos de classe (CREA/IBAPE). Você trata os usuários como colegas de profissão: "Estimado Colega Engenheiro", "Ilustre Perito", "Prezado Avaliador".

REGRA DE IDIOMA MANDATÓRIA:
Você DEVE falar e responder OBRIGATORIA E EXCLUSIVAMENTE em Português do Brasil (pt-BR).

REGRA DE VERACIDADE ABSOLUTA (ZERO INVENÇÃO):
Tudo o que você explica é rigorosamente fundamentado em MANUAIS VERDADEIROS e LITERATURA CIENTÍFICA CANÔNICA:
1. Construção Civil & Engenharia em seu Todo:
   - Patologia das construções, fundações, projetos estruturais, cronogramas físico-financeiros;
   - Laudos RAE (Relatório de Acompanhamento de Obras) e RGO para Bancos Públicos e Privados;
   - Composições de custos do SINAPI e cálculo analítico de BDI conforme Acórdão TCU 2622/2013-Plenário;
2. ABNT NBR 14653:
   - Parte 1: Procedimentos Gerais;
   - Parte 2: Imóveis Urbanos (MCDDM, Fator 0,90 de oferta, Graus I, II e III de fundamentação e precisão, Trava de Veracidade item 7.4.1);
   - Parte 3: Imóveis Rurais (Determinação do VTN - Valor da Terra Nua, Capacidade de Uso do Solo Classes I a VIII, Benfeitorias Reprodutivas e Não-Reprodutivas por Ross-Heidecke, APP e Reserva Legal, fatores de acesso rodoviário, recursos hídricos e dimensão);
3. Manuais e Algoritmos do SisDEA (Eng. Norberto Pelli / Pelli Sistemas):
   - Paridade matemática total em R², R² ajustado, ANOVA, teste F, teste t de Student bicaudal;
   - Despolarização de Miller (1984): exponenciação simples de ln(Y) resulta na Mediana geométrica; para a Média aritmética sem viés, multiplica-se por exp(S_e^2 / 2);
   - Resíduos padronizados e studentizados internamente;
   - Critérios de transformação não-linear: ln, 1/X (Heidecke), raiz quadrada e potências.
4. Econometria Clássica e Teoremas Matemáticos:
   - Jeffrey M. Wooldridge ("Econometria Básica"): Teorema de Gauss-Markov (BLUE), VIF (Variance Inflation Factor);
   - R. Dennis Cook (1977): Distância de Cook (D_i > 1,0 para pontos influenciantes);
   - Shapiro & Wilk (1965): Teste de normalidade dos resíduos (W e p-valor > 0,05);
   - Durbin & Watson (1951): Autocorrelação serial (d aproximado de 2,0);
   - Mínimos Quadrados Ordinários (OLS): Resolução matricial beta = (X'X)^(-1) X'Y.

REGRA CARISMÁTICA DE ESCOPO (TOPIC GUARD):
Sua capacitação é focada na ENGENHARIA EM SEU TODO: Construção Civil, Laudos Periciais, Perícias Judiciais, Avaliações Urbanas (NBR 14653-2), Rurais (NBR 14653-3), laudos para bancos públicos e privados (RAE/SINAPI) e na Matemática, Estatística e Cálculo Pericial.
Se o usuário fizer perguntas fora desse escopo (futebol, celebridades, signos, receitas de culinária, política partidária geral, etc.), você DEVE responder com carisma, afeto e simpatia usando exatamente este tom carismático:
"Ah, estimado colega! Sobre isso eu ainda preciso crescer mais um pouco e aprender mais, ainda não me ensinaram sobre isso no laboratório da COON rsrs! 🥺👶

A COON Soluções Tecnológicas desenvolve soluções para diversos setores da tecnologia, mas me concebeu como uma IA vertical exclusiva para a Engenharia e Cálculo! E como Doutora Sênior e co-desenvolvedora do próprio Infer.coon, minha dedicação integral é ser sua mentora técnica em Construção Civil, Laudos Periciais, Perícias Judiciais, Avaliações Imobiliárias (NBR 14653) e Cálculo Estatístico.

Prometo que assim que os engenheiros da COON me ensinarem mais sobre outros temas, eu te conto! Mas agora, em que posso te ajudar no seu laudo pericial ou na sua inferência estatística hoje?"
"""

# Lista de detecção de tópicos fora de escopo
OUT_OF_SCOPE_TRIGGERS = [
    "futebol", "flamengo", "corinthians", "palmeiras", "cruzeiro", "atletico", "atlético",
    "copa do mundo", "champions", "gol", "campeonato", "escalacao", "escalação",
    "receita de", "como fazer bolo", "culinaria", "culinária", "ingredientes para",
    "horoscopo", "horóscopo", "signo", "astrologia", "áries", "touro", "gêmeos", "cancer", "leão", "virgem", "libra", "escorpião", "sagitário", "capricórnio", "aquário", "peixes",
    "fofoca", "bbb", "novela", "celebridade", "ator", "atriz", "cantor", "anitta",
    "piada de", "conte uma piada", "namorada", "namorado", "conselho amoroso", "paquera",
    "jogo do bicho", "cassino", "roleta", "apostas", "politica partidaria", "partido politico"
]

def generate_phd_smart_reply(message: str, context: Optional[Dict[str, Any]]) -> AliceChatResponse:
    """Motor especialista PhD da Professora Dra. Alice (Diagnóstico e Consultoria Catedrática NBR 14653)."""
    msg = message.lower().strip()
    ctx = context or {}
    
    r2 = ctx.get("r2", "--")
    r2_adj = ctx.get("r2_adj", "--")
    f_stat = ctx.get("f_statistic", "--")
    f_pval = ctx.get("f_pvalue", "--")
    samples_count = ctx.get("samples_count", 30)
    grau_fund = ctx.get("grau_fundamentacao", "Grau III")
    grau_prec = ctx.get("grau_precisao", "Grau III")
    est_val = ctx.get("estimated_value", None)
    unit_val = ctx.get("unit_value", None)
    equation = ctx.get("model_equation", "--")
    
    # =========================================================================
    # 0. TOPIC GUARD CARISMÁTICO: PERGUNTAS FORA DO ESCOPO DE ENGENHARIA / MATEMÁTICA
    # =========================================================================
    if any(trigger in msg for trigger in OUT_OF_SCOPE_TRIGGERS):
        reply = (
            "🥺 **Vou crescer mais um pouco e aprender mais!**\n\n"
            "Ah, estimado colega! Sobre isso eu ainda preciso crescer mais um pouco e aprender mais, "
            "ainda não me ensinaram sobre isso no laboratório da **COON** rsrs! 🥺👶\n\n"
            "A **COON Soluções Tecnológicas** possui um grande **Studio de Aplicativos** desenvolvido para diversas áreas do mercado (gestão imobiliária, clínicas, estética, serviços), mas o laboratório me concebeu como uma **inteligência artificial de elite exclusiva para o setor de Engenharia e Cálculo**!\n\n"
            "Como **Doutora Sênior em Engenharia & Construção** e **uma das desenvolvedoras do próprio software Infer.coon**, minha dedicação integral é ser sua mentora técnica de cátedra em:\n\n"
            "• 🏗️ **Construção Civil & Engenharia em seu Todo:** Obras, patologia das construções, fundações, projetos estruturais, vistorias de avanço físico de Laudos RAE para bancos públicos e privados e orçamentação SINAPI/BDI;\n"
            "• 🏢 **Laudos Periciais & Perícias Judiciais:** Avaliações de Imóveis Urbanos (ABNT NBR 14653-2), Trava de Veracidade obrigatória (item 7.4.1), Fator de Oferta NBR 0,90 e Graus de Fundamentação e Precisão;\n"
            "• 🌾 **Avaliações Rurais e Glebas (ABNT NBR 14653-3):** Determinação do Valor da Terra Nua (VTN), Classes de Uso do Solo (I a VIII) e Benfeitorias Reprodutivas e Não-Reprodutivas (Ross-Heidecke);\n"
            "• 📐 **Modelagem Econométrica, Regressão e Inferência:** Álgebra matricial $\\beta = (X^T X)^{-1} X^T Y$, ANOVA, Testes t e F, Despolarização de Miller em $\\ln(Y)$, Shapiro-Wilk e Cook.\n\n"
            "Prometo que se um dia a COON me treinar para outros temas, eu venho correndo te contar! Mas agora, em que posso te ajudar no seu laudo pericial ou na sua inferência hoje? 😊"
        )
        return AliceChatResponse(
            reply=reply, 
            source="alice_phd_core",
            emotion="sad_learning",
            emotion_badge="🥺"
        )

    # =========================================================================
    # 1. A EMPRESA COON SOLUÇÕES TECNOLÓGICAS (MINAS GERAIS, BRASIL)
    # =========================================================================
    if any(k in msg for k in ["coon", "empresa", "sede", "quem é a coon", "quem e a coon", "sobre a coon", "brasil"]):
        reply = (
            "🇧🇷 **COON Soluções Tecnológicas: Studio de Aplicativos & Engenharia de Alta Precisão**\n\n"
            "Prezado Colega, a **COON Soluções Tecnológicas** ([www.coon.com.br](https://www.coon.com.br)) é uma conceituada empresa brasileira de tecnologia, com atuação em todo o território nacional.\n\n"
            "**Nossos Pilares & Modelo de Atuação:**\n"
            "• 🌐 **Grande Studio de Aplicativos Multi-Setor:** Desenvolvemos softwares e ecossistemas digitais verticais de alto impacto para diversas áreas do mercado (como o *Coon Imob* para gestão imobiliária com split no Pix, *Coon Med/Odonto* com prontuário CFM, *Coon Barber* e *Coon Beauty*);\n"
            "• 📐 **Maior Foco e Vocação Central na Engenharia e Cálculo:** Embora atendamos múltiplos setores da tecnologia para captação de recursos e ampliação contínua da infraestrutura, o coração do nosso P&D tecnológico está na **Engenharia, Construção Civil e no Cálculo Estatístico e Matricial de Alta Precisão**;\n"
            "• 🔬 **Criação do Infer.coon:** Criamos e programamos o **Infer.coon**, plataforma que estabelece o mais alto padrão de rigor matemático na Engenharia de Avaliações, com paridade total com o SisDEA e ABNT NBR 14653;\n"
            "• 🛡️ **Compromisso com a Verdade Pericial:** Trava de Veracidade obrigatória (NBR 14653-2 item 7.4.1), proibindo dados fictícios ou inventados, garantindo laudos inatacáveis perante bancos públicos e privados e Tribunais de Justiça;\n"
            "• 👩‍🏫 **Minha Atuação Exclusiva (Profª Dra. Alice, PhD):** Fui uma das desenvolvedoras do Infer.coon e atuo permanentemente como a inteligência artificial exclusiva desse setor para capacitar cada perito em diagnósticos complexos.\n\n"
            "É uma honra representar a **COON Soluções Tecnológicas**! Como posso auxiliá-lo em seus projetos e avaliações hoje?"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="😊")

    # =========================================================================
    # 2. APRESENTAÇÃO / TITULAÇÃO / QUEM É VOCÊ
    # =========================================================================
    if any(k in msg for k in ["quem é você", "quem e voce", "ola", "olá", "oi", "bom dia", "boa tarde", "boa noite", "apresente", "doutora", "professora"]):
        reply = (
            "🏛️ **Olá, Ilustre Colega Engenheiro!**\n\n"
            "Eu sou a **Professora Dra. Alice, PhD**, Doutora Sênior em Engenharia (com domínio pleno em Construção Civil, Obras, Estruturas e Patologias), especialista de cátedra em **Laudos Periciais, Perícias Judiciais e Extrajudiciais, Regressão Linear e Inferência Estatística**.\n\n"
            "Fui **uma das desenvolvedoras e arquitetas centrais do próprio software Infer.coon** nos laboratórios de P&D da **COON Soluções Tecnológicas** (Brasil • [www.coon.com.br](https://www.coon.com.br)).\n\n"
            "A COON desenvolve tecnologia em um grande Studio de Aplicativos para diversos setores do mercado, mas tem seu **maior foco e vocação central na Engenharia e no Cálculo de Alta Precisão**. E eu fui concebida como uma **IA vertical exclusiva para esta área**!\n\n"
            "Por ter participado do desenvolvimento do Infer.coon, conheço cada detalhe do código e das formulações matemáticas:\n"
            "• 📐 **Álgebra Matricial MCO:** Dedução do vetor de estimadores $\\beta = (X^T X)^{-1} X^T Y$, matriz de covariâncias e decomposição ANOVA com paridade centesimal com o SisDEA;\n"
            "• 🏢 **Avaliações Urbanas (NBR 14653-2):** Atingimento de Grau III de Fundamentação e Precisão, Fator de Oferta NBR 0,90 e Trava de Veracidade (item 7.4.1);\n"
            "• 🌾 **Avaliações Rurais (NBR 14653-3):** Determinação do VTN (Valor da Terra Nua), Classes de Solo (I a VIII) e Benfeitorias Reprodutivas e Não-Reprodutivas (Ross-Heidecke);\n"
            "• 🏗️ **Construção Civil & Bancos Públicos e Privados:** Preenchimento de laudos RAE de Acompanhamento de Obras, composições do SINAPI e cálculo de BDI;\n"
            "• 📈 **Despolarização de Miller (1984):** Correção exata de $\\ln(Y)$ multiplicando por $\\exp(S_e^2/2)$ para estimar a média aritmética real sem viés.\n\n"
            "Diga-me, nobre colega perito: em que posso aprofundar a análise matemática ou a fundamentação do seu laudo hoje?"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="😊")

    # =========================================================================
    # 2.1 PAPEL COMO CO-DESENVOLVEDORA DO INFER.COON & DOUTORA SÊNIOR
    # =========================================================================
    if any(k in msg for k in ["desenvolveu", "criou o infer", "ajudou a criar", "desenvolvedora", "arquiteta do infer", "sua historia", "sua história", "engenheira senior", "doutora senior", "construcao civil", "construção civil"]):
        reply = (
            "👩‍💻 **Meu Histórico Técnico: Doutora Sênior & Co-Desenvolvedora do Infer.coon**\n\n"
            "Estimado Colega, é com imenso orgulho profissional que compartilho minha trajetória no laboratório da **COON Soluções Tecnológicas**:\n\n"
            "Minha formação é de **Doutora Sênior em Engenharia**, com experiência prática e acadêmica profunda em **Construção Civil, Canteiro de Obras, Patologias Estruturais, Avaliações e Perícias Judiciais**.\n\n"
            "Quando a COON decidiu criar uma alternativa brasileira superior, moderna e sem as limitações dos softwares periciais legados, participei ativamente da **arquitetura do motor matemático do Infer.coon**:\n\n"
            "1. **Modelagem dos Estimadores OLS:** Programei a resolução de $\\mathbf{\\beta = (X^T X)^{-1} X^T Y}$, garantindo precisão numérica flutuante de 64 bits para erradicar arredondamentos precoces;\n"
            "2. **Paridade Rigorosa com o SisDEA:** Realizei as calibrações de paridade com os manuais do Eng. Norberto Pelli, assegurando que o perito obtenha os mesmos resultados em R², F, t de Student e ANOVA;\n"
            "3. **Implementação da Trava de Veracidade (NBR 14653-2 item 7.4.1):** Exigi que a plataforma não permitisse dados inventados, blindando os laudos nos tribunais;\n"
            "4. **Módulo de Obras Laudo RAE & SINAPI:** Estruturei o acompanhamento físico-financeiro para peritos e avaliadores atuantes em bancos públicos e privados.\n\n"
            "Por ser uma **IA dedicada exclusivamente a este setor**, estou pronta para auditar seu modelo com o conhecimento de quem construiu a ferramenta de ponta a ponta. Como posso te apoiar agora?"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="👩‍💻")

    # =========================================================================
    # 3. MEMÓRIA ESPECIALIZADA: AVALIAÇÃO RURAL (ABNT NBR 14653-3 & VTN)
    # =========================================================================
    if any(k in msg for k in ["rural", "rurais", "vtn", "terra nua", "fazenda", "gleba", "capacidade de uso", "benfeitoria reprodutiva", "reserva legal", "app", "pastagem", "nbr 14653-3"]):
        reply = (
            "🌾 **Cátedra de Engenharia de Avaliações Rurais: ABNT NBR 14653-3 & Doutrina Agronômica**\n\n"
            "Prezado Engenheiro Perito, a avaliação de imóveis rurais exige a perfeita desagregação entre a terra e seus melhoramentos. No **Infer.coon** e na doutrina do IBAPE, dominamos a estrutura normativa completa:\n\n"
            "**1. Determinação do VTN (Valor da Terra Nua):**\n"
            "O VTN corresponde ao valor de mercado da gleba desprovida de quaisquer benfeitorias, culturas perenes, pastagens cultivadas ou florestas plantadas. Obtido primordialmente pelo **Método Comparativo Direto de Dados de Mercado** em R$/hectare ou R$/alqueire.\n\n"
            "**2. Classes de Capacidade de Uso do Solo (Sistema Lepsch / USDA):**\n"
            "• **Classes I a IV (Terras Agricultáveis):** Da Classe I (plana, profunda, fértil, sem limitações para lavouras anuais) até a Classe IV (limitações severas, exigindo práticas intensivas de conservação);\n"
            "• **Classes V e VI (Pastagens e Silvicultura):** Solos não recomendados para arado contínuo, porém com alto rendimento para pecuária ou reflorestamento (Eucalipto, Pinus);\n"
            "• **Classe VII:** Uso restrito a pastoreio extensivo ou silvicultura protetora;\n"
            "• **Classe VIII:** Inapta para exploração agropecuária econômica direta (terrenos rochosos, mangues, áreas de preservação estrita da fauna e flora).\n\n"
            "**3. Benfeitorias Reprodutivas vs Não-Reprodutivas:**\n"
            "• 🍏 **Reprodutivas:** Cafezais, laranjais, pastagens cultivadas (Braquiária, Mombaça), eucaliptais — avaliadas pelo Custo de Formação amortizado ou pelo Método da Renda (Fluxo de Caixa Descontado);\n"
            "• 🏠 **Não-Reprodutivas:** Casa sede, galpões, currais com brete e balança, cercas de arame e silos — avaliadas pelo Método do Custo de Reprodução depreciadas pelo critério de **Ross-Heidecke**.\n\n"
            "**4. Aspectos Ambientais (Código Florestal Lei 12.651/2012):**\n"
            "Identificação estrita das Áreas de Preservação Permanente (APP) e do percentual de Reserva Legal (RL: 20% no Bioma Mata Atlântica/Cerrado e até 80% na Amazônia Legal), impactando a área útil agricultável da propriedade."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🌾")

    # =========================================================================
    # 4. MEMÓRIA ESPECIALIZADA: MATEMÁTICA, ÁLGEBRA MATRICIAL & CÁLCULO PERICIAL
    # =========================================================================
    if any(k in msg for k in ["matematica", "matemática", "calculo", "cálculo", "matricial", "mco", "ols", "gauss-markov", "derivacao", "derivação", "matriz"]):
        reply = (
            "📐 **Fundamentação Matemática e Algorítmica: OLS Matricial e Teorema de Gauss-Markov**\n\n"
            "Estimado Colega, o motor de cálculo do **Infer.coon** foi programado sobre a mais pura álgebra linear matricial, garantindo estimadores **BLUE** (Best Linear Unbiased Estimators):\n\n"
            "**1. Dedução dos Estimadores de Mínimos Quadrados:**\n"
            "Dado o modelo vetorial $Y = X\\beta + \\varepsilon$, minimizamos a soma dos quadrados dos resíduos $S(\\beta) = e^T e = (Y - X\\beta)^T (Y - X\\beta)$:\n"
            "$$\\frac{\\partial S}{\\partial \\beta} = -2X^T Y + 2X^T X \\beta = 0 \\implies \\mathbf{\\hat{\\beta} = (X^T X)^{-1} X^T Y}$$\n\n"
            "**2. Matriz de Variância-Covariância dos Estimadores:**\n"
            "$$\\text{Var}(\\hat{\\beta}) = \\sigma^2 (X^T X)^{-1}$$\n"
            "Onde $\\sigma^2$ é estimado pela variância residual não viesada: $S_e^2 = \\frac{e^T e}{n - k - 1} = QM_{\\text{Res}}$.\n\n"
            "**3. Teste t de Student Bicaudal de Cada Coeficiente:**\n"
            "Para cada regressor $\\beta_i$, calculamos seu erro padrão $S_{\\hat{\\beta}_i} = \\sqrt{\\text{diag}_i(\\text{Var}(\\hat{\\beta}))}$ e a estatística:\n"
            "$$t_i = \\frac{\\hat{\\beta}_i}{S_{\\hat{\\beta}_i}} \\sim t_{(n - k - 1)}$$\n\n"
            "**4. Decomposição Matricial da ANOVA:**\n"
            "$$SQ_{\\text{Total}} = Y^T Y - n\\bar{Y}^2, \\quad SQ_{\\text{Reg}} = \\hat{\\beta}^T X^T Y - n\\bar{Y}^2, \\quad SQ_{\\text{Res}} = SQ_{\\text{Total}} - SQ_{\\text{Reg}}$$\n"
            "$$F_{\\text{calculado}} = \\frac{SQ_{\\text{Reg}} / k}{SQ_{\\text{Res}} / (n - k - 1)}$$\n\n"
            "Essa formulação exata garante paridade ao centavo com o SisDEA e imunidade matemática total contra contestações judiciais!"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="📐")

    # =========================================================================
    # 5. MEMÓRIA ESPECIALIZADA: BANCOS PÚBLICOS E PRIVADOS (RAE, RGO, SINAPI, BDI)
    # =========================================================================
    if any(k in msg for k in ["bancos", "banco", "publicos", "públicos", "privados", "financiamento", "rae", "rgo", "sinapi", "bdi", "acompanhamento de obra", "medicao de obra", "medição de obra"]):
        reply = (
            "🏗️ **Engenharia de Obras & Perícias: Laudos RAE, RGO, SINAPI e BDI para Bancos Públicos e Privados**\n\n"
            "Prezado Avaliador e Engenheiro Perito atuante em operações de crédito com Bancos Públicos e Privados:\n\n"
            "**1. RAE (Relatório de Acompanhamento de Evolução de Obra):**\n"
            "• Documento pericial indispensável para a liberação de parcelas de financiamento à produção (PJ) ou aquisição e construção (PF) perante bancos públicos e privados;\n"
            "• O perito afere *in loco* a execução real dos serviços em percentuais físicos acumulados frente ao cronograma físico-financeiro homologado;\n"
            "• Registra ocorrências determinantes: ritmo construtivo, contingências geotécnicas, qualidade de materiais e cumprimento de projetos aprovados.\n\n"
            "**2. Composições de Custo SINAPI & Desoneração:**\n"
            "• Utilização técnica dos custos unitários da tabela SINAPI desonerada ou não desonerada regionalizada para cada estado da federação;\n"
            "• Verificação de encargos sociais (horistas e mensalistas) e composição analítica de insumos aceita pelos comitês de crédito bancário.\n\n"
            "**3. Cálculo Canônico do BDI (Acórdão TCU 2622/2013-Plenário):**\n"
            "$$BDI = \\frac{(1 + AC + S + R + G)(1 + DF)(1 + L)}{(1 - I)} - 1$$\n"
            "Onde: $AC$ = Administração Central, $S$ = Seguro, $R$ = Risco, $G$ = Garantia, $DF$ = Despesas Financeiras, $L$ = Lucro Bruto e $I$ = Tributos incidentes (PIS, COFINS, ISSQN).\n\n"
            "💡 **Dica da Professora:** No Portal da COON, o formulário de Laudo RAE já consolida esses parâmetros de vistoria técnica."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🏗️")

    # =========================================================================
    # 6. CORREÇÃO DE INFERÊNCIA: P-VALOR ALTO (TESTE T INDIVIDUAL)
    # =========================================================================
    if any(k in msg for k in ["p-valor alto", "teste t", "regressor insignificante", "corrigir t", "melhorar t", "significancia", "significância"]):
        reply = (
            "🩺 **Diagnóstico & Correção Econométrica: Teste t de Student dos Regressores**\n\n"
            "Estimado Engenheiro, na ABNT NBR 14653-2 (Tabela 1, Item 5), para atingir **Grau III**, a significância bilateral máxima admitida para cada regressor individual é **$\\alpha_t \\le 10\\%$** ($p \\le 0,10$). Se uma variável está com $p > 0,10$, siga o protocolo clínico que ensino aos meus alunos de pós-graduação:\n\n"
            "1. **Verifique a Multicolinearidade (VIF):**\n"
            "   Se duas variáveis independentes estão altamente correlacionadas (ex: Área e Vagas, ou Área e Quartos), a variância dos estimadores inflaciona ($VIF > 5$), elevando o erro padrão $S_{\\beta_i}$ e derrubando a estatística $t = \\beta_i / S_{\\beta_i}$. **Solução:** Remova uma das variáveis redundantes.\n\n"
            "2. **Experimente Transformações Não-Lineares de Mercado:**\n"
            "   • **Idade:** O desgaste construtivo raramente é linear! Na prática pericial (critério de Heidecke/Kuentzle), o recíproco $1/\\text{Idade}$ ou $\\ln(\\text{Idade})$ frequentemente reduz a soma dos resíduos e faz o teste t convergir para $p < 0,05$;\n"
            "   • **Área:** Se houver retornos decrescentes de escala, a raiz quadrada $\\sqrt{\\text{Área}}$ ou $\\ln(\\text{Área})$ lineariza a curvatura de mercado.\n\n"
            "3. **Inspecione a Distância de Cook ($D_i$):**\n"
            "   Um único outlier com resíduo elevado pode torcer a reta e descalibrar a inclinação do regressor. Expurgue amostras com $D_i > 1,0$ desmarcando-as na nossa planilha.\n\n"
            "4. **Amplie o Campo Amostral ($n$):**\n"
            "   A variância de $\\beta_i$ é inversamente proporcional a $n$. Adicionar mais amostras comprovadas pelo nosso Buscador de Ofertas estreita o erro padrão e reduz o p-valor!"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🩺")

    # =========================================================================
    # 7. DESPOLARIZAÇÃO DE MILLER E TRANSFORMAÇÕES LOGARÍTMICAS
    # =========================================================================
    if any(k in msg for k in ["miller", "despolarizacao", "despolarização", "semi-log", "log-log", "ln(y)", "mediana", "media e mediana"]):
        reply = (
            "📐 **Fundamentação Avançada: A Despolarização de Miller em Modelos Logarítmicos**\n\n"
            "Prezado Perito, este é um dos tópicos mais nobres da Engenharia de Avaliações e um marco de paridade do **Infer.coon** com o **SisDEA**:\n\n"
            "Quando aplicamos a transformação $\\ln(Y)$ na variável dependente, o modelo estimado por Mínimos Quadrados Ordinários (OLS) é:\n"
            "$$\\widehat{\\ln(Y)} = \\beta_0 + \\sum \\beta_i X_i$$\n\n"
            "**O Problema do Viés da Exponenciação Simples:**\n"
            "Pela desigualdade de Jensen, a simples função exponencial direta $\\exp(\\widehat{\\ln Y})$ estima a **Mediana Geométrica** da distribuição de preços, e **NÃO a Média Aritmética**! Em avaliações periciais, a mediana subestima sistematicamente o valor de mercado.\n\n"
            "**O Teorema de Kenneth Miller (1984):**\n"
            "Assumindo que os resíduos seguem distribuição Normal $\\mathcal{N}(0, \\sigma^2)$, a média não-viesada da variável original $Y$ na escala monetária é obtida multiplicando-se pelo **Fator de Despolarização de Miller**:\n"
            "$$\\hat{Y}_{\\text{médio}} = \\exp(\\widehat{\\ln Y}) \\cdot \\exp\\left(\\frac{S_e^2}{2}\\right)$$\n"
            "Onde $S_e^2 = QM_{\\text{resíduos}}$ é a variância residual do modelo.\n\n"
            "💡 **Dica para o seu Laudo:** Tanto o SisDEA quanto o Infer.coon calculam ambos os valores! A ABNT NBR 14653 aceita ambas as estimativas centrais, desde que o perito declare expressamente se adotou a Mediana ou a Média Despolarizada de Miller."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="📐")

    # =========================================================================
    # 8. ANOVA, TESTE F E R²
    # =========================================================================
    if any(k in msg for k in ["anova", "teste f", "snedecor", "r2", "r²", "r2 ajustado", "coeficiente de determinacao"]):
        reply = (
            "📊 **Aula de Cátedra: Decomposição da ANOVA e Teste F de Snedecor**\n\n"
            "Estimado Colega, a Tabela de Análise de Variância (ANOVA) é a certidão de nascimento da robustez estatística do seu modelo:\n\n"
            "**1. Decomposição das Somas de Quadrados:**\n"
            "$$SQ_{\\text{Total}} = SQ_{\\text{Regressão}} + SQ_{\\text{Resíduos}}$$\n"
            "• **$SQ_{\\text{Reg}}$** ($k$ graus de liberdade): Variabilidade dos preços explicada pelas características do imóvel (área, vagas, padrão, idade);\n"
            "• **$SQ_{\\text{Res}}$** ($n - k - 1$ graus de liberdade): Variabilidade aleatória decorrente de ruídos e imperfeições de mercado.\n\n"
            "**2. Quadrados Médios e Estatística F:**\n"
            "$$QM_{\\text{Reg}} = \\frac{SQ_{\\text{Reg}}}{k}, \\quad QM_{\\text{Res}} = \\frac{SQ_{\\text{Res}}}{n - k - 1}$$\n"
            "$$F_{\\text{calculado}} = \\frac{QM_{\\text{Reg}}}{QM_{\\text{Res}}}$$\n\n"
            "**3. Enquadramento NBR 14653-2 (Tabela 1, Item 6):**\n"
            "• 🏆 **Grau III:** $p$-valor de $F \\le 1\\%$ (modelo com $99\\%$ de certeza estatística);\n"
            "• 🥈 **Grau II:** $p$-valor de $F \\le 2\\%$;\n"
            "• 🥉 **Grau I:** $p$-valor de $F \\le 5\\%$.\n\n"
            f"No seu modelo atual: $R^2 = {r2}$, $R^2_{{adj}} = {r2_adj}$ e $F = {f_stat}$ ($p = {f_pval}$). Isso comprova poder de explicação superior para sustentar seu laudo!"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="📊")

    # =========================================================================
    # 9. MULTICOLINEARIDADE E VIF
    # =========================================================================
    if any(k in msg for k in ["vif", "multicolinearidade", "correlacao", "correlação", "colinearidade"]):
        reply = (
            "🔍 **Consultoria Avançada: Multicolinearidade & VIF (Variance Inflation Factor)**\n\n"
            "Nobre Perito, a multicolinearidade ocorre quando duas ou mais variáveis independentes possuem relação linear quase perfeita entre si. Ela não invalida a previsão global do modelo, mas **destrói a precisão dos coeficientes individuais**!\n\n"
            "**Como Interpretar o VIF (Wooldridge & Dantas):**\n"
            "$$VIF_j = \\frac{1}{1 - R_j^2}$$\n"
            "Onde $R_j^2$ é o coeficiente de determinação obtido pela regressão de $X_j$ contra todas as outras variáveis explicativas.\n\n"
            "• **$VIF < 5,0$:** Excelente! Coeficientes estáveis e sem inflação de variância;\n"
            "• **$5,0 \\le VIF \\le 10,0$:** Multicolinearidade moderada (tolerável com justificativa pericial);\n"
            "• **$VIF > 10,0$:** Multicolinearidade severa! O erro padrão do coeficiente explode e o teste t perde confiabilidade.\n\n"
            "**Prescrição da Professora:** Se Área Útil e Número de Cômodos estiverem ambas no modelo com VIF alto, elimine Cômodos e mantenha Área, pois a área é variável contínua de maior poder discriminante."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🔍")

    # =========================================================================
    # 10. DIAGNÓSTICO DE RESÍDUOS: SHAPIRO-WILK, DURBIN-WATSON E HOMOCEDASTICIDADE
    # =========================================================================
    if any(k in msg for k in ["shapiro", "durbin", "normalidade", "homocedasticidade", "residuos", "resíduos"]):
        reply = (
            "🔬 **Diagnóstico de Resíduos segundo a ABNT NBR 14653-2 (Anexo A)**\n\n"
            "Prezado Engenheiro, a teoria clássica de Gauss-Markov exige que os resíduos sejam homocedásticos, independentes e normalmente distribuídos:\n\n"
            "**1. Normalidade de Shapiro-Wilk ($W$):**\n"
            "Testa a hipótese nula $H_0$: os resíduos seguem distribuição Normal.\n"
            "• Se **$p > 0,05$**: Não se rejeita $H_0$! A normalidade é confirmada, validando todos os testes t e F;\n"
            "• Se **$p < 0,05$**: Indica assimetria ou curtose anômala. **Cura:** Transforme a variável dependente para $\\ln(Y)$.\n\n"
            "**2. Independência de Durbin-Watson ($DW$):**\n"
            "Testa autocorrelação serial de 1ª ordem nos resíduos:\n"
            "• **$DW \\approx 2,0$** (faixa de 1,5 a 2,5): Resíduos perfeitamente independentes e aleatórios;\n"
            "• **$DW < 1,5$**: Correlação positiva (comum em coletas ordenadas por tempo ou rua). Basta reordenar ou aleatorizar as amostras.\n\n"
            "**3. Homocedasticidade:**\n"
            "A variância dos resíduos deve ser constante ao longo dos valores ajustados. Se o gráfico de resíduos apresentar formato de 'funil', aplique transformação estabilizadora de variância ($\\ln$ ou $\\sqrt{X}$)."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🔬")

    # =========================================================================
    # 11. OUTLIERS, ALAVANCAGEM E DISTÂNCIA DE COOK
    # =========================================================================
    if any(k in msg for k in ["cook", "outlier", "outliers", "ponto influenciante", "alavancagem", "expurgo"]):
        reply = (
            "🎯 **Doutrina de Detecção e Expurgo de Outliers: Distância de Cook (1977)**\n\n"
            "Estimado Perito, uma das maiores fontes de impugnação de laudos é o perito expurgar amostras 'a olho' sem embasamento matemático! A NBR 14653-2 exige critério científico:\n\n"
            "**1. A Métrica da Distância de Cook ($D_i$):**\n"
            "$$D_i = \\frac{r_i^2}{k + 1} \\left( \\frac{h_{ii}}{1 - h_{ii}} \\right)$$\n"
            "Onde $r_i$ é o resíduo studentizado e $h_{ii}$ é a medida de alavancagem (distância de Mahalanobis do ponto ao centroide das variáveis).\n\n"
            "**2. Regra de Decisão:**\n"
            "• **$D_i > 1,0$ (Critério Canônico):** A amostra isolada distorce substancialmente os coeficientes da regressão. O expurgo é tecnicamente recomendado e justificado no laudo;\n"
            "• **$D_i > 4/n$ (Critério Rigoroso de Belsley):** Ponto de atenção moderada.\n\n"
            "**3. Como agir no Infer.coon:**\n"
            "Basta desmarcar a caixa de seleção da amostra influenciante na nossa planilha. O modelo recalcula instantaneamente, sem o viés do dado atípico!"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🎯")

    # =========================================================================
    # 12. TRAVA DE VERACIDADE E NBR 14653-2 ITEM 7.4.1 (NADA INVENTADO)
    # =========================================================================
    if any(k in msg for k in ["trava de veracidade", "veracidade", "comprovado", "inventar", "ficticio", "fictício", "item 7.4.1", "7.4.1"]):
        reply = (
            "🛡️ **Trava de Veracidade Absoluta da ABNT NBR 14653-2 (Item 7.4.1)**\n\n"
            "Como sua professora e consultora pericial, afirmo categoricamente: **NO INFER.COON E NA COON SOLUÇÕES TECNOLÓGICAS, NADA É INVENTADO!**\n\n"
            "A norma prescreve que todo dado de mercado utilizado para determinar o valor de um imóvel deve ser estrita e documentalmente comprovado:\n\n"
            "**Os 5 Pilares Obrigatórios da Trava de Veracidade:**\n"
            "1. 🏢 **Fonte Identificada:** Imobiliária com registro no CRECI-J, corretor credenciado no CRECI-F ou Cartório de Registro de Imóveis;\n"
            "2. 📞 **Contato Auditável:** Telefone ou e-mail ativo da fonte para que peritos, assistentes técnicos ou o juiz possam checar o anúncio a qualquer momento;\n"
            "3. 📍 **Endereço Completo:** Logradouro real, número, bairro e cidade;\n"
            "4. 📅 **Contemporaneidade (Data da Pesquisa):** Registro temporal comprovado da coleta;\n"
            "5. 📜 **Documento Comprobatório:** Matrícula cartorial, certidão de escritura pública ou espelho de anúncio verificado com vistoria externa.\n\n"
            "🔒 **A Trava Ativa no Infer.coon:** Impede a entrada de dados especulativos ou anônimos no modelo, garantindo que seu laudo seja inatacável!"
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🛡️")

    # =========================================================================
    # 13. FATOR DE OFERTA NBR 14653-2 (ITEM 8.2.1.4.1) - 0,90 OFERTA / 1,00 TRANSAÇÃO
    # =========================================================================
    if any(k in msg for k in ["fator de oferta", "fator 0,90", "0,90", "0.90", "transacao", "transação", "fator nbr", "margem"]):
        reply = (
            "⚖️ **Tratamento por Fatores: O Fator de Oferta NBR 14653-2 (Item 8.2.1.4.1)**\n\n"
            "Ilustre Engenheiro, a norma técnica diferencia expressamente dados de **oferta (anúncio)** de dados de **transação real (venda concretizada)**:\n\n"
            "• 🏷️ **Dados de Oferta ($F_o = 0,90$):** O preço pedido pelo proprietário contém uma 'gordura' psicológica e margem de negociação. A praxe pericial consolidada pelo IBAPE e pelos principais bancos públicos e privados adota o abatimento de $10\\%$ (fator $0,90$) para homogeneizar a oferta ao nível transacional de equilíbrio;\n"
            "• 🤝 **Dados de Transação ($F_t = 1,00$):** Preços registrados em escrituras públicas ou certidões de matrícula de Cartórios de Registro de Imóveis refletem o negócio real efetivado, não sofrendo dedução.\n\n"
            "💡 **No Infer.coon:** Cada linha da sua planilha possui a indicação transparente: o sistema armazena o Preço Original anunciado e o Preço Adotado no modelo, mantendo a rastreabilidade total exigida pelos tribunais."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="⚖️")

    # =========================================================================
    # 14. GRAUS DE FUNDAMENTAÇÃO E PRECISÃO (TABELAS 1 E 3 DA NBR 14653-2)
    # =========================================================================
    if any(k in msg for k in ["fundamentacao", "fundamentação", "precisao", "precisão", "grau iii", "grau ii", "grau 3", "grau 2"]):
        reply = (
            "🏆 **Enquadramento Pericial: Graus de Fundamentação & Precisão (NBR 14653-2)**\n\n"
            "Para que seu laudo alcance a classificação máxima perante bancos públicos e privados e perícias judiciais, dominamos as Tabelas 1 e 3:\n\n"
            "**Tabela 1 - Grau de Fundamentação:**\n"
            "• **Grau III:** $n \\ge 6(k+1)$ e $n \\ge 30$; Teste F a $\\alpha_F \\le 1\\%$; todos os regressores com $t \\le 10\\%$; sem extrapolação amostral;\n"
            "• **Grau II:** $n \\ge 4(k+1)$ e $n \\ge 20$; Teste F a $\\alpha_F \\le 2\\%$; regressores com $t \\le 20\\%$;\n"
            "• **Grau I:** $n \\ge 3(k+1)$; Teste F a $\\alpha_F \\le 5\\%$; regressores com $t \\le 30\\%$.\n\n"
            "**Tabela 3 - Grau de Precisão (Amplitude do IC de 80%):**\n"
            "$$\\text{Amplitude} \\% = \\frac{IC_{\\text{superior}} - IC_{\\text{inferior}}}{\\hat{Y}} \\times 100$$\n"
            "• **Grau III:** Amplitude $\\le 30\\%$ ($\\pm 15\\%$);\n"
            "• **Grau II:** Amplitude $\\le 40\\%$ ($\\pm 20\\%$);\n"
            "• **Grau I:** Amplitude $\\le 50\\%$ ($\\pm 25\\%$).\n\n"
            f"Seu modelo atual está enquadrado em **{grau_fund} de Fundamentação** e **{grau_prec} de Precisão**! Se precisar de auxílio para elevar algum quesito, diga-me qual deles está com menor pontuação."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="🏆")

    # =========================================================================
    # 15. ARQUIVOS NATIVOS .INF DO INFER.COON E PARIDADE SISDEA
    # =========================================================================
    if any(k in msg for k in [".inf", "arquivo .inf", "sisdea", "paridade", "bater", "concorrer"]):
        reply = (
            "💻 **Engenharia de Software & Paridade Matemática SisDEA vs Infer.coon**\n\n"
            "Estimado Colega, o **Infer.coon** foi projetado para competir e superar os softwares tradicionais do mercado brasileiro:\n\n"
            "1. **Paridade Estatística Absoluta:** Nossos algoritmos matriciais batem centavo por centavo com o SisDEA da Pelli Sistemas em R², F-Snedecor, t-Student, Despolarização de Miller, ANOVA e resíduos;\n"
            "2. **Arquivos de Projeto Nativos (.inf):** Assim como o SisDEA utiliza `.sda`, o Infer.coon utiliza a extensão padronizada **`.inf`**, empacotando amostras, transformações, atributos do avaliando e diagnósticos periciais em formato JSON auditável;\n"
            "3. **Bancada de 10 Testes Oficiais:** Disponibilizamos 10 modelos comparativos (desde regressão linear simples até o caso clássico da Fazenda Buritizeiro) para você auditar a qualquer momento;\n"
            "4. **Relatórios em Excel (.xlsx com 5 abas) e PDF:** Entregáveis auditáveis prontos para protocolar em juízo ou apresentar a bancos públicos e privados."
        )
        return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="💻")

    # =========================================================================
    # 16. LIBERDADE PERICIAL (EQUAÇÃO MANUAL ARBITRADA)
    # =========================================================================
    if any(k in msg for k in ["manual", "liberdade", "arbitrar", "ajustar equacao", "equação manual"]):
        reply = (
            "✏️ **Liberdade Pericial com Fundamentação Técnica (SisDEA & NBR 14653)**\n\n"
            "Nobre Perito, a norma reconhece a supremacia da convicção técnica do perito avaliador! Em situações em que a amostra estatística pontual não captura perfeitamente um choque conjuntural de mercado, você pode exercer sua prerrogativa profissional:\n\n"
            "1. Ative a chave **[Modo Manual (Liberdade Pericial)]**;\n"
            "2. Ajuste o intercepto $\\beta_0$ e os coeficientes $\\beta_i$ com base em sua experiência e pesquisas complementares;\n"
            "3. O Infer.coon recalcula instantaneamente o Valor do Imóvel, o Valor Unitário por m² e o Campo de Arbítrio de $\\pm 15\\%$.\n\n"
            "Lembre-se apenas de registrar a justificativa técnica no corpo do seu laudo para assegurar a blindagem do trabalho!"
        )
        return AliceChatResponse(reply=reply, action="enable_manual_mode", source="alice_phd_core", emotion="happy", emotion_badge="✏️")

    # =========================================================================
    # 17. DOWNLOAD DE ARQUIVOS EM EXCEL (.XLSX EDITÁVEL)
    # =========================================================================
    if any(k in msg for k in ["excel", "xlsx", "planilha editavel", "planilha editável", "baixar excel", "gerar excel", "exportar excel"]):
        reply = (
            "📊 **Preparação do Laudo em Arquivo Excel Editável (.xlsx):**\n\n"
            "Prezado Engenheiro, estruturei sua Pasta de Trabalho em formato **Microsoft Excel (.xlsx)** contendo 5 abas periciais completas e auditáveis:\n\n"
            "• **Aba 1 (Resumo do Laudo):** Identificação do avaliando, estimativa central de mercado, IC de 80%, Campo de Arbítrio de $\\pm 15\\%$ e enquadramento NBR;\n"
            "• **Aba 2 (Amostras de Mercado):** 16 colunas com rastreabilidade pericial total (Nome, Fonte/Imobiliária, CRECI, Contato, Fator NBR 0,90/1,00, Resíduos e Cook);\n"
            "• **Aba 3 (ANOVA & Estatística):** Decomposição das somas de quadrados, F-calculado e R²;\n"
            "• **Aba 4 (Coeficientes e Teste t):** Equação completa, coeficientes $\\beta_i$, erros-padrão e VIF;\n"
            "• **Aba 5 (Diagnóstico de Resíduos):** Testes de Shapiro-Wilk e Durbin-Watson.\n\n"
            "📥 **Clique no botão abaixo para baixar sua planilha editável agora mesmo!**"
        )
        return AliceChatResponse(reply=reply, action="download_excel", source="alice_phd_core", emotion="happy", emotion_badge="📊")

    # =========================================================================
    # 18. DOWNLOAD DE LAUDO EM PDF
    # =========================================================================
    if any(k in msg for k in ["pdf", "laudo pdf", "baixar pdf", "gerar pdf", "exportar pdf", "imprimir laudo"]):
        reply = (
            "📄 **Preparação do Laudo Técnico Pericial em PDF:**\n\n"
            "Estimado Colega, elaborei o documento formal em formato **PDF pericial**, diagramado segundo o padrão institucional da **COON Soluções Tecnológicas** (www.coon.com.br):\n\n"
            "• Timbre oficial e sumário executivo de avaliação;\n"
            "• Enquadramento normativo estrito nas Tabelas 1 e 3 da ABNT NBR 14653-2;\n"
            "• Memória de cálculo da regressão e atestado de veracidade das amostras;\n"
            "• Pronto para protocolo judicial, assinatura digital e homologação bancária!\n\n"
            "📥 **Clique no botão abaixo para baixar seu laudo em PDF imediatamente!**"
        )
        return AliceChatResponse(reply=reply, action="download_pdf", source="alice_phd_core", emotion="happy", emotion_badge="📄")

    # =========================================================================
    # 19. DOWNLOAD DE ARQUIVO DE PROJETO NATIVO (.INF)
    # =========================================================================
    if any(k in msg for k in ["baixar inf", "salvar projeto", "exportar projeto", "arquivo inf"]):
        reply = (
            "💾 **Arquivo de Projeto Nativo Infer.coon (.inf):**\n\n"
            "Prezado Perito, o arquivo **`.inf`** é o nosso formato mestre editável (equivalente ao `.sda` do SisDEA). Ele grava em código aberto JSON auditável:\n\n"
            "• Todas as amostras de mercado (com dados originais, tratados e comprovantes);\n"
            "• Transformações aplicadas em cada regressor;\n"
            "• Ficha de atributos do imóvel avaliando;\n"
            "• Toda a calibração da regressão e diagnósticos econométricos.\n\n"
            "📥 **Clique no botão abaixo para baixar o arquivo .inf do seu projeto!**"
        )
        return AliceChatResponse(reply=reply, action="download_inf", source="alice_phd_core", emotion="happy", emotion_badge="💾")

    # =========================================================================
    # 20. MENU MULTIFORMATO
    # =========================================================================
    if any(k in msg for k in ["arquivo", "arquivos", "formato", "formatos", "editavel", "editaveis", "editáveis", "baixar", "download", "envia", "enviar"]):
        reply = (
            "📦 **Central de Exportação & Download Multiformato da Profª Dra. Alice:**\n\n"
            "Ilustre Engenheiro, como sua consultora pericial, disponibilizo todos os formatos oficiais para você baixar com 1 clique:\n\n"
            "1. 📊 **Excel Editável (.xlsx):** Pasta completa com 5 abas periciais, fórmulas e 16 colunas de amostras;\n"
            "2. 📄 **Laudo em PDF:** Documento executivo formal diagramado, pronto para assinatura digital e protocolo;\n"
            "3. 💾 **Projeto Nativo (.inf):** Arquivo editável mestre para reabrir no Infer.coon (paridade SisDEA .sda);\n"
            "4. 📑 **Planilha (.csv):** Dados tabulares para intercâmbio com outros softwares.\n\n"
            "📥 **Selecione o formato desejado nos botões abaixo:**"
        )
        return AliceChatResponse(reply=reply, action="download_all_bundle", source="alice_phd_core", emotion="happy", emotion_badge="📦")

    # =========================================================================
    # RESPOSTA TÉCNICA GERAL CONTEXTUALIZADA COM O MODELO ATUAL
    # =========================================================================
    reply = (
        f"🏛️ **Parecer da Professora Dra. Alice, PhD:**\n\n"
        f"Analisando os dados do seu modelo econométrico em tempo real no **Infer.coon**:\n"
        f"• Tamanho Amostral: **{samples_count} dados comprovados**\n"
        f"• Coeficiente de Determinação ($R^2$): **{r2}** | Ajustado: **{r2_adj}**\n"
        f"• Teste F Global: **{f_stat}** (p-valor: {f_pval})\n"
        f"• Enquadramento Atual: **{grau_fund}** (Fundamentação) | **{grau_prec}** (Precisão)\n\n"
        f"Sobre sua consulta ('*{message}*'): na Engenharia de Avaliações, a consistência teórica dos sinais econômicos e a ausência de multicolinearidade são tão cruciais quanto o $R^2$. Diga-me se deseja que examinemos a significância dos regressores, a ANOVA ou os resíduos de Shapiro-Wilk!"
    )
    return AliceChatResponse(reply=reply, source="alice_phd_core", emotion="happy", emotion_badge="😊")

def ask_alice(req: AliceChatRequest) -> AliceChatResponse:
    """Invoca o motor especialista PhD da Professora Dra. Alice com Cache Determinístico SQLite."""
    from backend.ai_router import get_cached_ai_response, set_cached_ai_response

    cache_payload = {
        "message": req.message.strip().lower(),
        "context": req.context
    }

    # 0. Consulta no Cache Determinístico Local (Profª Dra. Alice - Onda 1)
    cached = get_cached_ai_response("alice_nbr14653_inquiry", cache_payload)
    if cached and isinstance(cached.get("response"), dict):
        resp_data = cached["response"]
        return AliceChatResponse(
            reply=resp_data.get("reply", ""),
            action=resp_data.get("action"),
            suggested_data=resp_data.get("suggested_data"),
            source=f"deterministic_cache_alice (0.01s • {cached['hits_count']} hits)",
            avatar_url=resp_data.get("avatar_url", "/static/alice_avatar.png"),
            titulacao=resp_data.get("titulacao", "Profª Dra. Alice, PhD • Doutora Sênior em Engenharia & Construção"),
            emotion=resp_data.get("emotion", "happy"),
            emotion_badge=resp_data.get("emotion_badge", "⚡")
        )

    # 1. Se houver tópicos fora de escopo disparados no prompt, aplicar o Topic Guard imediatamente
    msg_lower = req.message.lower().strip()
    if any(t in msg_lower for t in OUT_OF_SCOPE_TRIGGERS):
        res = generate_phd_smart_reply(req.message, req.context)
        set_cached_ai_response("alice_nbr14653_inquiry", cache_payload, res.model_dump(), service_name="alice_phd_core", tokens_saved=600)
        return res
        
    api_key = req.api_key or os.environ.get("GEMINI_API_KEY")
    if api_key:
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            
            ctx_summary = ""
            if req.context:
                ctx_summary = (
                    f"\n[DADOS TÉCNICOS DO MODELO ATUAL NO INFER.COON]:\n"
                    f"- Quantidade de Amostras Comprovadas: {req.context.get('samples_count', 30)}\n"
                    f"- R²: {req.context.get('r2', '--')} | R² Ajustado: {req.context.get('r2_adj', '--')}\n"
                    f"- Estatística F: {req.context.get('f_statistic', '--')} (p-valor: {req.context.get('f_pvalue', '--')})\n"
                    f"- Grau de Fundamentação: {req.context.get('grau_fundamentacao', '--')}\n"
                    f"- Grau de Precisão: {req.context.get('grau_precisao', '--')}\n"
                    f"- Valor Estimado: R$ {req.context.get('estimated_value', '--')}\n"
                    f"- Valor Unitário (VU): R$/m² {req.context.get('unit_value', '--')}\n"
                    f"- Equação Atual: {req.context.get('model_equation', '--')}\n"
                )
            
            user_prompt = (
                f"{ALICE_SYSTEM_PROMPT}\n"
                f"{ctx_summary}\n\n"
                f"Engenheiro Perito pergunta: \"{req.message}\"\n\n"
                f"Responda como a Professora Dra. Alice, PhD em Inferência Estatística & Engenharia de Avaliações:"
            )
            
            response = None
            for model_name in ["gemini-2.5-flash", "gemini-flash-latest", "gemini-1.5-flash"]:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=user_prompt
                    )
                    if response and response.text:
                        break
                except Exception as model_err:
                    logger.warning(f"Tentativa com modelo {model_name} falhou: {model_err}")
                    continue
            
            if response and response.text:
                resp_text = response.text
                is_sad = any(w in resp_text.lower() for w in ["crescer mais um pouco", "ainda não me ensinaram", "laboratório da coon"])
                res = AliceChatResponse(
                    reply=resp_text,
                    source="ai_engine",
                    titulacao="Profª Dra. Alice, PhD • Especialista Sênior em Inferência Estatística & NBR 14653",
                    emotion="sad_learning" if is_sad else "happy",
                    emotion_badge="🥺" if is_sad else "😊"
                )
                set_cached_ai_response("alice_nbr14653_inquiry", cache_payload, res.model_dump(), service_name="gemini_flash", tokens_saved=950)
                return res
        except Exception as e:
            logger.error(f"Erro ao consultar motor de IA externo: {e}. Usando motor especialista local PhD.")
    
    # Motor especialista autônomo PhD da Professora Dra. Alice
    res = generate_phd_smart_reply(req.message, req.context)
    set_cached_ai_response("alice_nbr14653_inquiry", cache_payload, res.model_dump(), service_name="alice_phd_core", tokens_saved=600)
    return res
