# Guia de Configuração e Apontamento: www.coon.com.br

Este guia orienta o apontamento do seu domínio **`coon.com.br`** para a plataforma **Infer.coon** utilizando **Cloudflare**, **Render** ou **Railway**.

---

## 1. Estratégia Recomendada de Subdomínio

Para manter o seu site institucional funcionando em `www.coon.com.br` e oferecer a plataforma de engenharia de avaliações como um aplicativo web e mobile dedicado aos seus clientes e peritos, recomendamos configurar:

- **Plataforma Web/App**: `infer.coon.com.br` ou `app.coon.com.br`
- **Site Institucional / Vendas**: `www.coon.com.br`

*(Ou, se preferir, a plataforma pode ser o aplicativo principal na raiz `www.coon.com.br`)*.

---

## 2. Apontamento no Cloudflare (DNS)

Como você já possui acesso ao **Cloudflare**, o processo de apontamento leva menos de 2 minutos:

### Passo a Passo no Cloudflare DNS:
1. Faça login no [painel do Cloudflare](https://dash.cloudflare.com/) e selecione o domínio **`coon.com.br`**.
2. Vá no menu lateral **DNS** > **Records** (Registros).
3. Clique em **Add record** (Adicionar registro):
   - **Type (Tipo)**: `CNAME`
   - **Name (Nome)**: `infer` *(ou `app`)*
   - **Target (Destino)**:
     - Se o deploy estiver no **Render**: Cole o endereço fornecido pelo Render (ex: `infer-coon.onrender.com`).
     - Se o deploy estiver no **Railway**: Cole o domínio do Railway (ex: `infer-coon.up.railway.app`).
   - **Proxy status**: Deixe a nuvem **Laranja (Proxied)** ativada para ter CDN global, proteção contra ataques e SSL/HTTPS grátis automático.
   - **TTL**: `Auto`
4. Clique em **Save**.

Pronto! Seu aplicativo responderá instantaneamente em **`https://infer.coon.com.br`** com HTTPS e certificado SSL ativo.

---

## 3. Configuração no Render / Railway

### No Render:
1. Acesse o seu dashboard no [Render](https://dashboard.render.com).
2. Clique em **New** > **Web Service** e selecione o repositório GitHub do `infer-coon`.
3. Em **Settings** > **Custom Domains**, clique em **Add Custom Domain** e digite:
   `infer.coon.com.br` (ou `www.coon.com.br`).
4. O Render validará o CNAME criado no Cloudflare e ativará o tráfego.

### No Railway:
1. Acesse o projeto no [Railway](https://railway.app).
2. Clique no serviço do `infer-coon` > aba **Settings** > seção **Networking**.
3. Em **Custom Domain**, adicione `infer.coon.com.br` e confirme.

---

## 4. Integrações Já Pré-Configuradas no Código

- **Backend CORS ([`backend/main.py`](file:///c:/Users/Acer/Documents/infer-coon/backend/main.py))**:
  Já permite requisições automáticas de:
  - `https://www.coon.com.br`
  - `https://coon.com.br`
  - `https://infer.coon.com.br`
  - `https://app.coon.com.br`
- **Frontend ([`frontend/index.html`](file:///c:/Users/Acer/Documents/infer-coon/frontend/index.html))**:
  - Cabeçalho, rodapé e laudos timbrados já estão identificados com a marca **Coon Engenharia de Avaliações** e link direto para **`www.coon.com.br`**.
