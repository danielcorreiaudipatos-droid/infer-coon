# SCRIPT EXECUTIVO DE QUALIDADE MÁXIMA PREMIUM • COON PARTICIPAÇÕES LTDA.
**Documento Oficial de Diretrizes, Acompanhamento & Trava de Qualidade**  
**Liderança:** Daniel Soares Correia — Presidente & Fundador  
**Execução:** Valente Sênior — Liderança de Tecnologia & Inteligência Artificial  
**Data:** 29 de Setembro de 2026 | **Versão:** 3.0-PREMIUM-LOCK  

---

## 🔒 1. A TRAVA DE QUALIDADE MÁXIMA PREMIUM (MANDAMENTO INEGIOCIÁVEL)

> *"Aqui buscamos qualidade máxima premium. Coloque isto como uma trava, mesmo que custe buscar informações e modelos."*  
> — **Daniel Soares Correia, Presidente da Coon Participações Ltda.**

Esta trava estabelece que nenhuma entrega, layout ou código pode ser liberado se apresentar:
1. **Aparência genérica de IA** com caixas excessivas (*boxes* empilhados sem critério).
2. **Poluição visual ou landing page promocional misturada em ferramentas de trabalho** (ex: o e-mail deve ser um e-mail de verdade, limpo e executivo).
3. **Barreiras que prendem o cliente no computador** (atendimento e newsletters devem fluir diretamente para o WhatsApp do celular do cliente).
4. **Incoerência de tema** (o sistema deve detectar e sincronizar automaticamente se o usuário usa Chrome ou Mozilla em modo escuro ou claro).
5. **Formatações defeituosas** (marcas, logos, gradientes e tipografia devem ter precisão milimétrica padrão Big Tech).

---

## 📋 2. MAPA DE DIRETRIZES DO PRESIDENTE & STATUS DE EXECUÇÃO

| # | Módulo / Solução | Diretriz do Presidente Daniel | Status Atual | Detalhamento Técnico |
|---|---|---|---|---|
| **01** | **OnNews • Abas & Usabilidade** | Organizar o OnNews por abas clicáveis no topo para facilitar navegação no celular/APK sem poluição. | ✅ **100% CONCLUÍDO** | Abas: `[📊 Cotações & Agro] [🇧🇷 Capas do Brasil] [🌦️ Radar Clima] [💡 Poder de Compra] [📲 WhatsApp (17:30)] [👁️ Ver Tudo]`. |
| **02** | **OnNews • Barter & Compra** | Incluir métricas de poder de compra real (Boi x Milho, Nelore, Soja x Adubo, Diesel). | ✅ **100% CONCLUÍDO** | Seção `#sec-compra` com cálculo de sacas/arrobas e atualização dinâmica. |
| **03** | **Newsletter • 17:30 WhatsApp** | Inscrição por E-mail e WhatsApp com envio pontual às 17:30 (fechamento de mercado e clima). | ✅ **100% CONCLUÍDO** | Endpoint `/api/news/subscribe` com SQLite `newsletter_subscribers` e scheduler autônomo. |
| **04** | **Portal Coon • Gaveta & Header** | Tirar "Baixar no Celular" da barra principal; 1º `onnews.` sem "Grátis", 2º `onmail.`; Admin só para o Daniel. | ✅ **100% CONCLUÍDO** | `portal.html` atualizado com ordem corrigida e trava de segurança `checkDanielAdminAccess()`. |
| **05** | **OnMail • Webmail Puro** | Abrir SÓ o e-mail com configurações igual e-mail de verdade, sem textos e valores promocionais poluindo a tela. | ✅ **100% CONCLUÍDO** | `onmail.html` reconstruído como aplicativo Webmail de tela cheia (100vh), pastas, leitor e configurações. |
| **06** | **OnMail • Banners Laterais** | Exatamente dois banners laterais discretos para divulgar produtos da Coon sem cansar o usuário. | ✅ **100% CONCLUÍDO** | Banner 1: `onnews.` (O Dia em Dados) + Banner 2: `studio.` (Ecossistema de Soluções) na barra lateral direita. |
| **07** | **OnMail • Planos & Desconto 30%** | Planos Start (R$ 0), Pro (R$ 49,90) e Business (R$ 99,90 com domínio grátis) e 30% no Anual. | ✅ **100% CONCLUÍDO** | Modal sob demanda `[💎 Planos]` com seletor Mensal/Anual sem sujar a caixa postal. |
| **08** | **Studio Coon • Limpeza do Topo** | Tirar "Baixar no Celular" do topo; tirar badge Big Tech; corrigir logo `coon.` / `studio.`; trocar para `onnews.`; tirar `infer.coon`. | ✅ **100% CONCLUÍDO** | `studio.html` com header sóbrio, marca unificada e cards atualizados. |
| **09** | **Atendimento Online • WhatsApp** | Botão menor, compacto, sem atendente fictício que prende o cliente na frente do PC; direto no WhatsApp. | ✅ **100% CONCLUÍDO** | `coon-bot.js` refatorado para botão pill discreto que abre `https://wa.me/5531999999999` com 1 toque. |
| **10** | **Tema Automático (Mozilla/Chrome)** | Reconhecer automaticamente o modo escuro ou claro configurado no navegador/sistema do usuário. | ✅ **100% CONCLUÍDO** | Scripts com `prefers-color-scheme: dark` aplicados em `portal.html`, `onmail.html`, `news.html` e `studio.html`. |
| **11** | **Deploy Hetzner & Produção** | Sincronizar backend e frontends na máquina da Alemanha (IP `5.161.71.17`) e reiniciar serviço. | ⏳ **PRONTO PARA SUBIR** | Arquivos locais testados e validados, aguardando comando de sincronização via SSH/SCP. |

---

## 🛠️ 3. O QUE FOI CODIFICADO & ARQUITETURA DETALHADA

### A. OnMail (`frontend/onmail.html`) — Novo Padrão Webmail Puro
- **Zero Ruído de Landing Page:** A tela principal abre diretamente a caixa de e-mails completa, sem blocos promocionais ou tabelas gigantes de preços.
- **Barra Superior Executiva:** Marca `coon.` / `onmail.`, campo de busca global com atalhos, alternador de tema automático, botão ⚙️ Configurações, botão `[💎 Planos]` (modal) e perfil.
- **Navegação de Pastas:** Entrada (badge 3), VIP & WhatsApp (badge 2), Enviados, Rascunhos, Anti-Spam (8 retidos sem incomodar o WhatsApp) e Lixeira.
- **Configurações Integradas:** Modal completo com:
  1. Conexão de e-mails existentes (Gmail, Outlook, Yahoo, cPanel).
  2. Número do WhatsApp para despacho de alertas.
  3. Gestão de Remetentes VIP.
  4. Assinatura digital corporativa.
- **Banners Laterais Equilibrados (Apenas 2):**
  - **Banner 1 (`onnews.`):** Resumo diário de agro, clima e mercados às 17:30.
  - **Banner 2 (`studio.`):** Plataformas verticais e engenharia pericial ABNT.

### B. Atendimento WhatsApp Descomplicado (`frontend/coon-bot.js`)
- Substituição do antigo modal de 560px com avatar que fingia digitar por um botão flutuante **compacto, de alta precisão e respeito ao tempo do cliente**.
- Badge discreto com ícone oficial do WhatsApp e ponto verde de status online.
- Ao clicar, abre imediatamente a conversa no WhatsApp oficial da Coon (`55 31 99999-9999`), liberando o cliente para responder pelo celular quando e de onde quiser.

### C. Reconhecimento Automático de Tema (Chrome, Mozilla, Safari, Edge, Windows, Android)
- Implementado em todos os portais:
  ```javascript
  function getActiveTheme() {
    const savedTheme = localStorage.getItem('coon_theme');
    if (savedTheme === 'dark') return 'dark';
    if (savedTheme === 'light') return 'light';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  ```
- Garante que quem usa tema escuro no computador ou no celular já enxerga o ecossistema Coon em modo escuro na primeira abertura, sem piscar a tela (Zero FOUC).
- Se o usuário alterar as configurações do sistema operacional em tempo real, os ouvintes de evento atualizam o tema automaticamente.

---

## 🚀 4. O QUE RESTA EXECUTAR (ROTEIRO DE FINALIZAÇÃO)

1. **Upload Geral para o Servidor Hetzner Produção (`5.161.71.17`):**
   - Transferir os arquivos alterados:
     - `frontend/onmail.html`
     - `frontend/portal.html`
     - `frontend/news.html`
     - `frontend/studio.html`
     - `frontend/coon-bot.js`
     - `backend/coon_news.py`
     - `backend/main.py`
2. **Reiniciar o Serviço em Produção:**
   - Executar `systemctl restart coon.service` via SSH.
3. **Checagem de Qualidade ao Vivo (Auditoria Pericial):**
   - Abrir `https://coon.com.br/onmail` e validar o webmail sem ruído promocional.
   - Testar o tema automático alternando o navegador entre claro e escuro.
   - Abrir `https://coon.com.br/onnews` e validar as abas e inscrição de 17:30.
   - Abrir `https://coon.com.br/studio` e conferir a remoção do botão de celular e a logo limpa.
   - Clicar no botão de atendimento no canto inferior e validar a abertura do WhatsApp.

---
**Trava de Qualidade Ativa e Vigiada.**  
*Coon Participações Ltda. — Tecnologia Proprietária & Engenharia de Excelência.*
