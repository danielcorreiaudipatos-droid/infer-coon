# COON Infer — Implantação na nuvem

Guia para colocar o programa no ar, dentro do servidor do COON (Railway + Supabase), com o mesmo login único.

---

## 1. Como fica na nuvem

```
Navegador ──HTTPS──▶ Servidor do COON (Railway)  ── login único (cookie coon_sessao)
                       ├── /            → RAE Pericial e painel (já existe)
                       └── /inferencia/ → COON Infer (módulo plugado)
                              ├── motor/     cálculo (o mesmo do navegador)
                              ├── web/       tela
                              └── servidor/  rotas da API
                                     ├── [SUPABASE]    projetos, banco de mercado, auditoria
                                     ├── [CLAUDE]      conferência das amostras e inventário de documentos
                                     ├── [SUPADATA]    leitura de anúncio pelo link
                                     └── [GOOGLE MAPS] satélite e mapa de situação
```

**Por que plugado, e não num serviço separado:** o cookie de sessão do COON vale só para o endereço do servidor principal. Com o Infer no mesmo endereço (`/inferencia/`), o login único funciona sem mexer no login.

---

## 2. O que já está pronto e o que falta

| Item | Situação |
|---|---|
| Código do programa (motor, tela, servidor) | pronto — `coon-infer-1.0.0.zip` |
| Tabelas do banco | pronto — `supabase/migrations/001_inferencia.sql` (falta rodar) |
| Trecho para o servidor do COON | pronto — `integracao/trecho-server-coon.mjs` (falta colar) |
| Chave da IA (`ANTHROPIC_API_KEY`) | falta cadastrar no Railway |
| Chave do Google Maps (`GOOGLE_MAPS_CHAVE`) | falta criar e cadastrar |
| Chave da Supadata (`SUPADATA_CHAVE`) | opcional |
| `SUPABASE_URL` / `SUPABASE_CHAVE` | já existem no servidor do COON — o Infer usa as mesmas |

---

## 3. Passo a passo

### Passo 1 — Banco (Supabase, projeto `coon`)

1. Abrir o Supabase → projeto **coon** → **SQL Editor** → **New query**.
2. Colar o conteúdo de `supabase/migrations/001_inferencia.sql` e clicar **Run**.
3. Conferir em **Table Editor** as três tabelas novas: `inferencia_projetos`, `inferencia_mercado`, `inferencia_auditoria`, e o app `inferencia` na tabela `aplicativos`.

A migração segue a regra do COON: RLS ligado e nenhum acesso para `anon`/`authenticated`. Só o servidor lê e grava.

### Passo 2 — Código dentro do servidor do COON

1. Descompactar `coon-infer-1.0.0.zip`.
2. Copiar a pasta inteira para dentro do servidor, ficando assim:
   ```
   RAE Pericial\nuvem\inferencia\motor\...
   RAE Pericial\nuvem\inferencia\web\...
   RAE Pericial\nuvem\inferencia\servidor\...
   ```
3. Abrir `RAE Pericial\nuvem\server.mjs` e colar os **três trechos** de `integracao/trecho-server-coon.mjs`:
   - o `import` no topo;
   - o item `inferencia` no catálogo `APPS_PADRAO`;
   - o bloco `/inferencia` logo depois do healthcheck (`/api/status`).
4. Testar no PC antes de subir:
   ```bash
   node server.mjs
   ```
   e abrir `http://localhost:8790/inferencia/`.

Não precisa `npm install`: o Infer não tem dependência.

### Passo 3 — Chaves no Railway

Railway → serviço do COON → **Variables** → acrescentar:

| Variável | Para quê | Onde conseguir |
|---|---|---|
| `ANTHROPIC_API_KEY` | conferência por IA e inventário dos documentos | console da Anthropic (conta da COON) |
| `INFERENCIA_MODELO_IA` | modelo da IA (padrão `claude-sonnet-5`) | — |
| `GOOGLE_MAPS_CHAVE` | satélite e mapa de situação no laudo | Google Cloud → APIs → **Maps Static API** → Credenciais; restringir ao servidor |
| `SUPADATA_CHAVE` | ler anúncio pelo link (opcional) | painel da Supadata |

`SUPABASE_URL` e `SUPABASE_CHAVE` já estão lá (o servidor do COON usa as mesmas).

**Nunca** colar chave em conversa, código ou Git. Se alguma já passou por texto aberto, gerar outra e apagar a antiga.

### Passo 4 — Publicar

Subir o servidor do COON como já é feito hoje (o `railway.json` de lá não muda). O Railway reinicia sozinho.

### Passo 5 — Liberar para os usuários

No painel do COON, liberar o app **inferencia** para cada usuário (administrador já tem acesso). O item aparece em "Meus aplicativos".

---

## 4. Conferência depois de publicar

| Teste | Resultado esperado |
|---|---|
| Abrir `https://<domínio>/inferencia/` logado | tela abre com o nome do usuário no canto |
| Abrir sem login | tela abre, mas "Salvar" pede login |
| Salvar um projeto | aparece em "Meus projetos" e na tabela `inferencia_projetos` |
| Calcular um modelo | resultados e graus na aba Modelo |
| Exportar Excel e PDF | arquivo baixa / janela de impressão abre |
| Laudo completo → Gerar Word | `.docx` baixa com o autor = responsável técnico |
| Anexar pasta → Fazer o inventário | cada documento vira "JÁ LIDO", com tipo e resumo |
| Satélite do imóvel (Google Maps) | imagem entra em "Fotografias e imagens" |
| Conferir com IA (aba Amostras) | apontamentos aparecem com consumo de tokens |

---

## 5. Alternativa: serviço separado

Dá para subir o Infer sozinho (`servidor/server.mjs`, com o `railway.json` da própria pasta), mas o login único só funciona se:

- o Infer ficar no mesmo endereço do COON (proxy por caminho); ou
- o servidor do COON passar a gravar o cookie com `Domain=.copontoon.com`.

Sem isso, cada subdomínio teria login próprio. Por isso a recomendação é o Passo 2.

---

## 6. Custos que passam a existir

| Serviço | Quando cobra |
|---|---|
| API da IA | por documento lido no inventário e por conferência (o consumo em tokens aparece na tela e na auditoria) |
| Google Maps Static | por imagem gerada |
| Supadata | por anúncio lido pelo link |
| Supabase e Railway | como hoje; os projetos ocupam pouco (fotos entram no projeto — ver roteiro) |

---

## 7. Cuidados

- **LGPD:** documentos com CPF não vão ao banco; o inventário descarta CPF e RG antes de gravar o resultado. O documento em si não é guardado em lugar nenhum.
- **Fotos:** hoje ficam dentro do projeto (reduzidas a 1600 px). Com muitos laudos com muitas fotos, o próximo passo é mandar as fotos para o Supabase Storage.
- **Backup:** as tabelas novas entram no backup diário que já existe do Supabase do COON.
