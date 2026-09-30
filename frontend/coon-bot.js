/**
 * ========================================================
 * COON ATENDIMENTO DIRETO AO WHATSAPP
 * Holding Coon Participações Ltda. (www.coon.com.br)
 * 
 * Atendimento compacto, ágil e direto no WhatsApp oficial da Coon.
 * Não prende o cliente na frente do computador: conecta direto
 * ao WhatsApp do celular ou desktop com 1 toque.
 * ========================================================
 */

(function () {
  'use strict';

  // Configuração do WhatsApp Oficial da Coon
  window.COON_WHATSAPP_NUMBER = window.COON_WHATSAPP_NUMBER || '5531999999999';
  const DEFAULT_WA_MSG = 'Olá! Sou cliente Coon e gostaria de atendimento.';

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoonWhatsAppSupport);
  } else {
    initCoonWhatsAppSupport();
  }

  function initCoonWhatsAppSupport() {
    if (document.getElementById('coonBotLauncher') || document.getElementById('coonSupportContainer')) return;
    injectSupportStyles();
    injectSupportHTML();
  }

  function injectSupportStyles() {
    const style = document.createElement('style');
    style.id = 'coonSupportStyles';
    style.textContent = `
      /* Container Flutuante Compacto de Atendimento */
      #coonSupportContainer {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        align-items: center;
        user-select: none;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }

      /* Botão Compacto e Discreto (Padrão Executivo Coon) */
      #coonBotLauncher {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: #0f172a;
        color: #ffffff;
        padding: 6px 14px 6px 9px;
        border-radius: 9999px;
        box-shadow: 0 4px 16px -2px rgba(0, 0, 0, 0.35), 0 2px 6px -1px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        text-decoration: none;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(16, 185, 129, 0.35);
      }

      #coonBotLauncher:hover {
        background: #1e293b;
        border-color: #10b981;
        transform: translateY(-2px);
        box-shadow: 0 8px 24px -2px rgba(16, 185, 129, 0.3);
        color: #ffffff;
      }

      #coonBotLauncher:active {
        transform: translateY(0);
      }

      /* Ícone Executivo de Atendimento / Concierge com Bolinha Online */
      .coon-wa-badge {
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        flex-shrink: 0;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
      }

      .coon-wa-badge svg {
        width: 15px;
        height: 15px;
      }

      .coon-wa-dot {
        position: absolute;
        bottom: -1px;
        right: -1px;
        width: 8px;
        height: 8px;
        background: #34d399;
        border-radius: 9999px;
        border: 1.5px solid #0f172a;
        box-shadow: 0 0 6px #10b981;
      }

      /* Tipografia Compacta */
      .coon-wa-content {
        display: flex;
        flex-direction: column;
        text-align: left;
        line-height: 1.15;
      }

      .coon-wa-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: -0.15px;
        color: #f8fafc;
      }

      .coon-wa-subtitle {
        font-size: 9px;
        font-weight: 600;
        color: #34d399;
        letter-spacing: -0.1px;
      }

      /* Mobile: Compacto para não cobrir botões do app ou navegador */
      @media (max-width: 640px) {
        #coonSupportContainer {
          bottom: calc(env(safe-area-inset-bottom, 0px) + 78px) !important;
          right: 14px !important;
        }
        #coonBotLauncher {
          padding: 5px 11px 5px 7px !important;
          gap: 6px !important;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
        }
        .coon-wa-badge {
          width: 24px !important;
          height: 24px !important;
        }
        .coon-wa-badge svg {
          width: 13px !important;
          height: 13px !important;
        }
        .coon-wa-title {
          font-size: 10.5px !important;
        }
        .coon-wa-subtitle {
          display: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function injectSupportHTML() {
    const waUrl = getWhatsAppLink(DEFAULT_WA_MSG);
    const container = document.createElement('div');
    container.id = 'coonSupportContainer';
    container.innerHTML = `
      <a 
        id="coonBotLauncher" 
        href="${waUrl}" 
        target="_blank" 
        rel="noopener noreferrer"
        title="Atendimento Coon no WhatsApp (Conexão Direta)"
        onclick="trackCoonSupportClick()"
      >
        <div class="coon-wa-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
          </svg>
          <span class="coon-wa-dot"></span>
        </div>
        <div class="coon-wa-content">
          <span class="coon-wa-title">Atendimento</span>
          <span class="coon-wa-subtitle">WhatsApp • Online</span>
        </div>
      </a>
    `;
    document.body.appendChild(container);
  }

  function getWhatsAppLink(message) {
    const text = encodeURIComponent(message || DEFAULT_WA_MSG);
    return `https://wa.me/${window.COON_WHATSAPP_NUMBER}?text=${text}`;
  }

  // Compatibilidade com chamadas de outros scripts
  window.toggleCoonChat = function () {
    window.open(getWhatsAppLink(), '_blank');
  };

  window.openCoonSupportWhatsApp = function (customMsg) {
    window.open(getWhatsAppLink(customMsg), '_blank');
  };

  window.sendCoonBotMessage = function (text) {
    window.open(getWhatsAppLink(text), '_blank');
  };

  window.trackCoonSupportClick = function () {
    try {
      if (window.gtag) {
        window.gtag('event', 'click_whatsapp_support', { event_category: 'support' });
      }
    } catch (e) {}
  };

})();
