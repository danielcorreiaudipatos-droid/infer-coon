/**
 * ========================================================
 * COON UNIVERSAL HUMAN-FIRST BOT WIDGET
 * Holding Co.on Participações Ltda. (www.coon.com.br)
 * Atendentes: Jéssica Santos, Camila Ferreira, Rodrigo Silva e Eduardo Mendes
 * ========================================================
 */

(function () {
  'use strict';

  // Configurações do Bot
  const BOT_API = '/api/bot/chat';
  window.COON_WHATSAPP_NUMBER = window.COON_WHATSAPP_NUMBER || '5511980000001'; // Número centralizado

  let botOpen = false;
  let currentAttendant = {
    id: 'jessica_santos',
    name: 'Jéssica Santos',
    role: 'Atendimento & Sucesso do Cliente',
    avatar: '/jessica_avatar.jpg'
  };
  let conversationSessionId = 'coon_bot_' + Math.random().toString(36).substring(2, 9);
  let isTyping = false;

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoonBot);
  } else {
    initCoonBot();
  }

  function initCoonBot() {
    if (document.getElementById('coonBotContainer')) return;
    injectBotStyles();
    injectBotHTML();
    setupEventListeners();
  }

  function injectBotStyles() {
    const style = document.createElement('style');
    style.id = 'coonBotStyles';
    style.textContent = `
      /* Botão Flutuante */
      #coonBotLauncher {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 99999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #0f172a;
        color: #ffffff;
        padding: 6px 14px 6px 6px;
        border-radius: 9999px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
        cursor: pointer;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        border: 1px solid rgba(255, 255, 255, 0.12);
        user-select: none;
      }
      #coonBotLauncher:hover {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.4);
        background: #1e293b;
      }
      .coon-avatar-pulse {
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 9999px;
        overflow: hidden;
        border: 2px solid #10b981;
      }
      .coon-avatar-pulse img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .coon-online-dot {
        position: absolute;
        bottom: 1px;
        right: 1px;
        width: 11px;
        height: 11px;
        background: #10b981;
        border-radius: 9999px;
        border: 2px solid #0f172a;
      }

      /* Janela do Chat */
      #coonChatModal {
        position: fixed;
        bottom: 84px;
        right: 24px;
        width: 380px;
        max-width: calc(100vw - 32px);
        height: 560px;
        max-height: calc(100vh - 110px);
        background: #ffffff;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(226, 232, 240, 0.9);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 99999;
        animation: coonFadeUp 0.22s ease-out forwards;
      }

      @keyframes coonFadeUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      /* Cabeçalho do Chat */
      .coon-chat-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        color: white;
        padding: 14px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      /* Fundo com Marca d'água COON no Chat */
      .coon-chat-body {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        background-color: #f8fafc;
        background-image: 
          radial-gradient(#e2e8f0 0.8px, transparent 0.8px),
          radial-gradient(#e2e8f0 0.8px, #f8fafc 0.8px);
        background-size: 24px 24px;
        background-position: 0 0, 12px 12px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .coon-watermark-overlay {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-15deg);
        font-size: 78px;
        font-weight: 900;
        letter-spacing: -2px;
        color: rgba(148, 163, 184, 0.08);
        pointer-events: none;
        user-select: none;
      }

      /* Balões de Mensagem */
      .coon-msg-row {
        display: flex;
        align-items: flex-end;
        gap: 8px;
      }
      .coon-msg-user {
        justify-content: flex-end;
      }
      .coon-bubble {
        max-width: 82%;
        padding: 10px 14px;
        border-radius: 18px;
        font-size: 13px;
        line-height: 1.45;
        position: relative;
        word-break: break-word;
      }
      .coon-bubble-bot {
        background: #ffffff;
        color: #1e293b;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
        border: 1px solid #e2e8f0;
      }
      .coon-bubble-user {
        background: #0f172a;
        color: #ffffff;
        border-bottom-right-radius: 4px;
      }

      /* Banner de Transferência */
      .coon-transfer-alert {
        background: #eff6ff;
        border: 1px solid #bfdbfe;
        color: #1e40af;
        padding: 8px 12px;
        border-radius: 14px;
        font-size: 11px;
        font-weight: 600;
        text-align: center;
        margin: 4px 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      /* Botões de Ação Sugerida */
      .coon-action-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: #ffffff;
        border: 1px solid #cbd5e1;
        color: #334155;
        padding: 6px 11px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s;
        margin: 3px 2px;
      }
      .coon-action-chip:hover {
        background: #0f172a;
        color: #ffffff;
        border-color: #0f172a;
      }

      /* Digitação */
      .coon-typing-indicator {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px 12px;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        border-bottom-left-radius: 4px;
        width: fit-content;
      }
      .coon-typing-dot {
        width: 6px;
        height: 6px;
        background: #94a3b8;
        border-radius: 9999px;
        animation: coonDotBlink 1.4s infinite;
      }
      .coon-typing-dot:nth-child(2) { animation-delay: 0.2s; }
      .coon-typing-dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes coonDotBlink {
        0%, 100% { opacity: 0.2; transform: translateY(0); }
        50% { opacity: 1; transform: translateY(-2px); }
      }

      /* Input do Rodapé */
      .coon-chat-footer {
        padding: 10px 12px;
        background: #ffffff;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .coon-chat-input {
        flex: 1;
        padding: 9px 14px;
        font-size: 13px;
        border: 1px solid #cbd5e1;
        border-radius: 9999px;
        outline: none;
        transition: border-color 0.2s;
        background: #f8fafc;
      }
      .coon-chat-input:focus {
        border-color: #0f172a;
        background: #ffffff;
      }
      .coon-send-btn {
        width: 36px;
        height: 36px;
        border-radius: 9999px;
        background: #0f172a;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border: none;
        transition: background 0.2s;
      }
      .coon-send-btn:hover {
        background: #2563eb;
      }
    `;
    document.head.appendChild(style);
  }

  function injectBotHTML() {
    const container = document.createElement('div');
    container.id = 'coonBotContainer';
    container.innerHTML = `
      <!-- Launcher Flutuante (Jéssica) -->
      <div id="coonBotLauncher" onclick="toggleCoonChat()">
        <div class="coon-avatar-pulse">
          <img id="coonLauncherAvatar" src="/jessica_avatar.jpg" alt="Jéssica Santos">
          <span class="coon-online-dot"></span>
        </div>
        <div class="flex flex-col text-left">
          <span class="text-xs font-bold leading-tight" id="coonLauncherName">Jéssica Santos</span>
          <span class="text-[10px] text-emerald-400 font-medium">Atendimento Co.on • Online</span>
        </div>
      </div>

      <!-- Modal de Chat -->
      <div id="coonChatModal">
        <!-- Topo -->
        <div class="coon-chat-header">
          <div class="flex items-center space-x-2.5">
            <div class="relative w-9 h-9 rounded-full overflow-hidden border border-emerald-400">
              <img id="coonChatHeaderAvatar" src="/jessica_avatar.jpg" alt="Atendente" class="w-full h-full object-cover">
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div class="text-xs font-bold text-white flex items-center gap-1.5">
                <span id="coonChatHeaderName">Jéssica Santos</span>
                <span class="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">Oficial</span>
              </div>
              <div class="text-[10px] text-slate-300" id="coonChatHeaderRole">Atendimento & Sucesso Co.on</div>
            </div>
          </div>
          <div class="flex items-center space-x-1">
            <button onclick="toggleCoonChat()" class="text-slate-400 hover:text-white p-1 rounded-lg transition" title="Fechar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>

        <!-- Corpo com Marca d'Água COON -->
        <div class="coon-chat-body" id="coonChatBody">
          <div class="coon-watermark-overlay">coon.</div>

          <!-- Mensagem Inicial de Boas-Vindas da Jéssica -->
          <div class="coon-msg-row">
            <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
              <img src="/jessica_avatar.jpg" alt="Jéssica" class="w-full h-full object-cover">
            </div>
            <div class="coon-bubble coon-bubble-bot">
              Olá! Tudo bem? Aqui é a <strong>Jéssica Santos</strong> da equipe Co.on! 😊✨<br><br>
              Como posso te ajudar hoje? Temos diversos planos e com certeza um vai dar super certo para você! Se precisar de suporte, dúvidas ou cancelamento, estou aqui a postos.
            </div>
          </div>

          <!-- Sugestões Iniciais -->
          <div id="coonQuickActions" class="pt-1 flex flex-wrap">
            <button onclick="sendCoonBotMessage('Quero conhecer os planos e valores disponíveis')" class="coon-action-chip">💎 Planos & Preços</button>
            <button onclick="sendCoonBotMessage('Preciso de suporte técnico em um software')" class="coon-action-chip">🛠️ Suporte Técnico</button>
            <button onclick="sendCoonBotMessage('Tenho dúvidas sobre as normas ABNT e segurança')" class="coon-action-chip">❓ Dúvidas Frequentes</button>
            <button onclick="sendCoonBotMessage('Gostaria de informações sobre cancelamento de plano')" class="coon-action-chip">📋 Cancelamento</button>
          </div>
        </div>

        <!-- Rodapé / Envio -->
        <div class="coon-chat-footer">
          <input 
            type="text" 
            id="coonChatInput" 
            class="coon-chat-input" 
            placeholder="Escreva sua mensagem para a Jéssica..."
            onkeydown="if(event.key === 'Enter') handleCoonSend()"
          >
          <button onclick="handleCoonSend()" class="coon-send-btn" title="Enviar">
            <svg class="w-4 h-4 transform rotate-45 -translate-y-0.5 -translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  function setupEventListeners() {
    window.toggleCoonChat = function () {
      const modal = document.getElementById('coonChatModal');
      botOpen = !botOpen;
      if (botOpen) {
        modal.style.display = 'flex';
        document.getElementById('coonChatInput').focus();
      } else {
        modal.style.display = 'none';
      }
    };

    window.sendCoonBotMessage = function (text) {
      document.getElementById('coonChatInput').value = text;
      handleCoonSend();
    };

    window.handleCoonSend = async function () {
      const input = document.getElementById('coonChatInput');
      const text = input.value.trim();
      if (!text || isTyping) return;

      input.value = '';
      appendUserMessage(text);

      // Simulação humana de digitação
      showTypingIndicator();

      try {
        const resp = await fetch(BOT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            session_id: conversationSessionId,
            current_attendant: currentAttendant.id
          })
        });
        const data = await resp.json();

        // Delay humano natural de 1.2 a 1.8 segundos
        setTimeout(() => {
          hideTypingIndicator();
          if (data.transferred && data.transfer_message) {
            appendTransferAlert(data.transfer_message);
            updateAttendantUI(data.attendant);
          }
          currentAttendant = data.attendant;
          appendBotMessage(data.response, data.attendant, data.suggested_actions, data.whatsapp_url, data.ticket_code);
        }, 1400);

      } catch (err) {
        hideTypingIndicator();
        appendBotMessage(
          "Poxa, tive uma oscilação rápida na minha conexão aqui! Mas não se preocupe: você pode falar diretamente comigo ou com a nossa equipe no nosso WhatsApp oficial clicando abaixo! 📲",
          currentAttendant,
          [],
          `https://wa.me/${window.COON_WHATSAPP_NUMBER}?text=Ol%C3%A1!%20Gostaria%20de%20atendimento%20Co.on.`
        );
      }
    };
  }

  function appendUserMessage(text) {
    const body = document.getElementById('coonChatBody');
    const row = document.createElement('div');
    row.className = 'coon-msg-row coon-msg-user';
    row.innerHTML = `<div class="coon-bubble coon-bubble-user">${escapeHTML(text)}</div>`;
    body.appendChild(row);
    scrollToBottom();
  }

  function appendBotMessage(text, attendant, actions, whatsappUrl, ticketCode) {
    const body = document.getElementById('coonChatBody');
    const row = document.createElement('div');
    row.className = 'coon-msg-row';

    let formattedText = escapeHTML(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    let actionButtonsHtml = '';
    if (actions && actions.length > 0) {
      actionButtonsHtml = '<div class="pt-2 flex flex-wrap">';
      actions.forEach(a => {
        actionButtonsHtml += `<button onclick="sendCoonBotMessage('${escapeHTML(a.action)}')" class="coon-action-chip">${escapeHTML(a.label)}</button>`;
      });
      actionButtonsHtml += '</div>';
    }

    let waButtonHtml = '';
    if (whatsappUrl) {
      waButtonHtml = `
        <div class="pt-2.5">
          <a href="${whatsappUrl}" target="_blank" class="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition shadow-xs">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.007c.106.005.249-.04.39.299.144.347.491 1.2.534 1.288.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.861.173.086.275.072.376-.043.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.42-.101.825z"/></svg>
            <span>Continuar no WhatsApp com ${attendant.name.split(' ')[0]}</span>
          </a>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
        <img src="${attendant.avatar}" alt="${attendant.name}" class="w-full h-full object-cover">
      </div>
      <div class="coon-bubble coon-bubble-bot">
        <div>${formattedText}</div>
        ${actionButtonsHtml}
        ${waButtonHtml}
      </div>
    `;
    body.appendChild(row);
    scrollToBottom();
  }

  function appendTransferAlert(msg) {
    const body = document.getElementById('coonChatBody');
    const alert = document.createElement('div');
    alert.className = 'coon-transfer-alert';
    alert.innerHTML = `<span>🔄</span><span>${escapeHTML(msg)}</span>`;
    body.appendChild(alert);
    scrollToBottom();
  }

  function updateAttendantUI(attendant) {
    document.getElementById('coonLauncherAvatar').src = attendant.avatar;
    document.getElementById('coonLauncherName').innerText = attendant.name;
    document.getElementById('coonChatHeaderAvatar').src = attendant.avatar;
    document.getElementById('coonChatHeaderName').innerText = attendant.name;
    document.getElementById('coonChatHeaderRole').innerText = attendant.role;
    document.getElementById('coonChatInput').placeholder = `Escreva para ${attendant.name.split(' ')[0]}...`;
  }

  function showTypingIndicator() {
    isTyping = true;
    const body = document.getElementById('coonChatBody');
    const ind = document.createElement('div');
    ind.id = 'coonTypingInd';
    ind.className = 'coon-msg-row';
    ind.innerHTML = `
      <div class="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-slate-200">
        <img src="${currentAttendant.avatar}" alt="Digitando" class="w-full h-full object-cover">
      </div>
      <div class="coon-typing-indicator">
        <div class="coon-typing-dot"></div>
        <div class="coon-typing-dot"></div>
        <div class="coon-typing-dot"></div>
      </div>
    `;
    body.appendChild(ind);
    scrollToBottom();
  }

  function hideTypingIndicator() {
    isTyping = false;
    const ind = document.getElementById('coonTypingInd');
    if (ind) ind.remove();
  }

  function scrollToBottom() {
    const body = document.getElementById('coonChatBody');
    if (body) {
      body.scrollTop = body.scrollHeight;
    }
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

})();
