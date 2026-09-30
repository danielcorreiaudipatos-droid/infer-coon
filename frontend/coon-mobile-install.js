/**
 * COON MOBILE SUITE - INSTALADOR UNIVERSAL DE APLICATIVOS (PWA & APK)
 * Holding: Coon Participações Ltda. (coon.com.br)
 * Presidente: Daniel Soares Correia
 */

(function () {
  'use strict';

  let deferredPrompt = null;
  let currentAppInfo = {
    name: 'Coon App',
    url: window.location.href,
    icon: '📱',
    slug: 'coon_app'
  };

  // Captura o evento nativo de instalação PWA no Android/Desktop Chrome
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const badges = document.querySelectorAll('.coon-install-pwa-badge');
    badges.forEach(b => b.classList.remove('hidden'));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('✅ Aplicativo Coon instalado no dispositivo com sucesso.');
  });

  // Utilitário de detecção de plataforma
  function detectPlatform() {
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    const isMobile = isIOS || isAndroid || /Mobi|Tablet/i.test(ua);
    return { isIOS, isAndroid, isMobile, isStandalone };
  }

  // Cria o modal no DOM se não existir
  function ensureModalExists() {
    if (document.getElementById('coonMobileInstallModal')) return;

    const modalHTML = `
      <div id="coonMobileInstallModal" class="fixed inset-0 z-50 hidden items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md transition-opacity duration-300">
        <div class="relative w-full max-w-lg bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 text-slate-800 dark:text-slate-100 overflow-hidden transform transition-all duration-300 scale-95" id="coonInstallCard">
          
          <!-- Brilho decorativo no topo -->
          <div class="absolute -top-16 -right-16 w-44 h-44 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none"></div>
          <div class="absolute -bottom-16 -left-16 w-44 h-44 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Botão Fechar -->
          <button onclick="window.closeCoonInstallModal()" class="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition cursor-pointer text-sm font-bold" title="Fechar">
            ✕
          </button>

          <!-- Cabeçalho do App -->
          <div class="flex items-center space-x-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div id="coonInstallIcon" class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              📱
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h3 id="coonInstallTitle" class="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  Instalar Aplicativo
                </h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Coon Mobile
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Coon Participações Ltda. • Instalação Rápida & Direta
              </p>
            </div>
          </div>

          <!-- Corpo Dinâmico por Dispositivo -->
          <div class="mt-5 space-y-4">

            <!-- CASO 1: SE JÁ ESTÁ INSTALADO (STANDALONE) -->
            <div id="coonInstalledNotice" class="hidden p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center space-x-2.5">
              <span class="text-lg">✓</span>
              <span>Você já está executando este aplicativo no modo nativo do celular!</span>
            </div>

            <!-- CASO 2: DISPOSITIVO MÓVEL (ANDROID / IPHONE) -->
            <div id="coonMobileSection" class="space-y-3.5">
              
              <!-- Botão 1 Toque (PWA) -->
              <button id="coonPwaInstallBtn" onclick="window.triggerCoonPwaInstall()" class="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center space-x-2 cursor-pointer">
                <span class="text-base">⚡</span>
                <span id="coonPwaBtnLabel">Instalar Aplicativo no Celular (1 Toque)</span>
              </button>

              <!-- Botão Baixar APK Direto (Android) -->
              <div id="coonApkDirectCard" class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <div class="text-left">
                  <div class="flex items-center space-x-1.5">
                    <span class="text-sm">📦</span>
                    <span class="text-xs font-bold text-slate-900 dark:text-white">Pacote Android Nativo (.apk)</span>
                    <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 font-bold">Direto</span>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Inicia a instalação do pacote no seu smartphone sem passar por lojas.
                  </p>
                </div>
                <button onclick="window.downloadCoonApk()" class="shrink-0 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 transition flex items-center space-x-1 cursor-pointer">
                  <span>Baixar APK</span>
                  <span>↓</span>
                </button>
              </div>

              <!-- Guia Passo a Passo iOS (iPhone / Safari) -->
              <div id="coonIosGuide" class="hidden p-4 rounded-2xl bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-200 space-y-2">
                <div class="font-bold flex items-center space-x-1.5 text-sky-800 dark:text-sky-300">
                  <span>🍎 Como instalar no iPhone (Safari):</span>
                </div>
                <ol class="list-decimal list-inside space-y-1.5 text-[11px] text-sky-700 dark:text-sky-300">
                  <li>Toque no botão de <strong>Compartilhar</strong> (ícone com quadrado e seta para cima <strong>⎋</strong> na barra inferior do Safari).</li>
                  <li>Role as opções e toque em <strong>"Adicionar à Tela de Início" ⊞</strong>.</li>
                  <li>Confirme o nome e toque em <strong>"Adicionar"</strong>. Pronto! O app fica na sua tela inicial como um app nativo.</li>
                </ol>
              </div>

            </div>

            <!-- CASO 3: COMPUTADOR / DESKTOP (QR CODE COM SINCRONIZAÇÃO DE DADOS + WHATSAPP) -->
            <div id="coonDesktopSection" class="space-y-4">
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center">
                
                <div class="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Sincronização de Dados & Login Ativa</span>
                </div>

                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Aponte a câmera do celular para instalar e puxar os dados:
                </span>
                
                <!-- QR Code Dinâmico com link do App + Token de Sincronização -->
                <div class="p-2.5 bg-white rounded-2xl border border-slate-200 shadow-md inline-block relative group">
                  <img id="coonQrCodeImg" src="" alt="QR Code de Instalação e Sincronização" class="w-44 h-44 rounded-xl object-contain">
                </div>

                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 max-w-sm leading-relaxed">
                  ✓ Abre o aplicativo direto no seu celular.<br>
                  ✓ <strong>Puxa automaticamente seu login, dados e preferências</strong> do computador para o celular sem precisar redigitar senha.
                </p>
              </div>

              <!-- Ações Rápidas no Desktop -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <!-- Enviar para o WhatsApp -->
                <button onclick="window.sendCoonLinkWhatsApp()" class="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer">
                  <span>💬</span>
                  <span>Mandar no WhatsApp</span>
                </button>

                <!-- Baixar APK no Computador -->
                <button onclick="window.downloadCoonApk()" class="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer">
                  <span>📦</span>
                  <span>Baixar APK (.apk)</span>
                </button>
              </div>
            </div>

          </div>

          <!-- Rodapé de Garantia & Engenharia Coon -->
          <div class="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
            <span class="flex items-center space-x-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Tecnologia Própria • Coon Participações</span>
            </span>
            <span class="font-mono">PWA & APK Nativo</span>
          </div>

        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);
  }

  // Abre o modal de instalação configurado para o App atual
  window.openCoonInstallModal = function (appName, appUrl, appIcon) {
    ensureModalExists();

    const name = appName || document.title.split('•')[0].split('-')[0].trim() || 'Coon App';
    const url = appUrl || window.location.href;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
    const icon = appIcon || '📱';

    currentAppInfo = { name, url, icon, slug };

    // Atualiza elementos visuais do modal
    const titleEl = document.getElementById('coonInstallTitle');
    const iconEl = document.getElementById('coonInstallIcon');
    const qrImgEl = document.getElementById('coonQrCodeImg');
    const pwaBtnLabel = document.getElementById('coonPwaBtnLabel');

    if (titleEl) titleEl.innerText = `Instalar ${name}`;
    if (iconEl) iconEl.innerText = icon;
    if (pwaBtnLabel) pwaBtnLabel.innerText = `Instalar ${name} no Celular (1 Toque)`;

    // Gera URL de transferência e handoff (puxa dados do computador para o celular)
    let syncUrl = url;
    try {
      const parsedUrl = new URL(url, window.location.origin);
      const authToken = localStorage.getItem('coon_auth_token');
      if (authToken) {
        parsedUrl.searchParams.set('coon_sync_token', authToken);
      }
      const currentTheme = localStorage.getItem('coon_theme') || (document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      parsedUrl.searchParams.set('coon_theme', currentTheme);
      parsedUrl.searchParams.set('source', 'qr_handoff');
      syncUrl = parsedUrl.toString();
    } catch (e) {
      syncUrl = url;
    }

    // Gera o QR Code com a URL do App + Dados de Handoff
    if (qrImgEl) {
      const fgColor = '0f172a';
      const bgColor = 'ffffff';
      qrImgEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(syncUrl)}&color=${fgColor}&bgcolor=${bgColor}&margin=6`;
    }

    // Adaptação de acordo com a plataforma do usuário
    const { isIOS, isAndroid, isMobile, isStandalone } = detectPlatform();

    const mobileSec = document.getElementById('coonMobileSection');
    const desktopSec = document.getElementById('coonDesktopSection');
    const iosGuide = document.getElementById('coonIosGuide');
    const installedNotice = document.getElementById('coonInstalledNotice');
    const pwaBtn = document.getElementById('coonPwaInstallBtn');

    if (isStandalone) {
      if (installedNotice) installedNotice.classList.remove('hidden');
    } else {
      if (installedNotice) installedNotice.classList.add('hidden');
    }

    if (isMobile) {
      if (mobileSec) mobileSec.classList.remove('hidden');
      if (desktopSec) desktopSec.classList.add('hidden');

      if (isIOS) {
        if (iosGuide) iosGuide.classList.remove('hidden');
        if (pwaBtn) pwaBtn.classList.add('hidden'); // iOS não suporta beforeinstallprompt nativo
      } else {
        if (iosGuide) iosGuide.classList.add('hidden');
        if (pwaBtn) pwaBtn.classList.remove('hidden');
      }
    } else {
      // Desktop / Computador: exibe QR Code + botões de suporte
      if (mobileSec) mobileSec.classList.add('hidden');
      if (desktopSec) desktopSec.classList.remove('hidden');
    }

    // Exibe o modal com animação
    const modal = document.getElementById('coonMobileInstallModal');
    const card = document.getElementById('coonInstallCard');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      setTimeout(() => {
        if (card) {
          card.classList.remove('scale-95');
          card.classList.add('scale-100');
        }
      }, 10);
    }
  };

  // Fecha o modal
  window.closeCoonInstallModal = function () {
    const modal = document.getElementById('coonMobileInstallModal');
    const card = document.getElementById('coonInstallCard');
    if (card) {
      card.classList.remove('scale-100');
      card.classList.add('scale-95');
    }
    setTimeout(() => {
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }, 150);
  };

  // Dispara instalação nativa PWA (1 toque)
  window.triggerCoonPwaInstall = function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice) => {
        if (choice.outcome === 'accepted') {
          window.closeCoonInstallModal();
        }
        deferredPrompt = null;
      });
    } else {
      const { isAndroid } = detectPlatform();
      if (isAndroid) {
        // Se o evento não estiver em cache, aciona o APK ou orienta a tela inicial
        const confirmApk = confirm('Deseja baixar o pacote APK de instalação direta para o seu Android agora?');
        if (confirmApk) {
          window.downloadCoonApk();
        } else {
          alert('Para adicionar à tela inicial sem baixar APK:\nToque no menu (⋮) do seu navegador e escolha "Instalar aplicativo" ou "Adicionar à tela inicial".');
        }
      } else {
        alert('Para instalar na tela inicial:\nToque no menu (⋮) do navegador e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
      }
    }
  };

  // Baixa o APK Android (.apk) diretamente
  window.downloadCoonApk = function () {
    const slug = currentAppInfo.slug || 'app';
    const apkUrl = `/download/${slug}.apk`;
    
    // Cria elemento invisível de download
    const a = document.createElement('a');
    a.href = apkUrl;
    a.download = `coon_${slug}.apk`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Feedback amigável ao usuário
    setTimeout(() => {
      alert(`📦 O download do pacote de instalação (${currentAppInfo.name}) foi iniciado!\n\nApós o download, toque na notificação para iniciar a instalação no seu celular.`);
    }, 400);
  };

  // Compartilha o link de instalação no WhatsApp
  window.sendCoonLinkWhatsApp = function () {
    const text = `Instale o aplicativo oficial ${currentAppInfo.name} da Coon no seu celular:\n${currentAppInfo.url}`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  // Fecha o modal ao clicar fora
  document.addEventListener('click', (e) => {
    const modal = document.getElementById('coonMobileInstallModal');
    if (modal && !modal.classList.contains('hidden') && e.target === modal) {
      window.closeCoonInstallModal();
    }
  });

  // Fecha com a tecla ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.closeCoonInstallModal();
    }
  });

  // Receptor de Handoff: se a página foi aberta pelo QR Code, sincroniza os dados do computador
  function handleIncomingSyncHandoff() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const syncToken = urlParams.get('coon_sync_token');
      const syncTheme = urlParams.get('coon_theme');
      let didSync = false;

      if (syncToken) {
        localStorage.setItem('coon_auth_token', syncToken);
        didSync = true;
      }
      if (syncTheme && (syncTheme === 'dark' || syncTheme === 'light')) {
        localStorage.setItem('coon_theme', syncTheme);
        if (syncTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }

      if (didSync) {
        urlParams.delete('coon_sync_token');
        const cleanQuery = urlParams.toString() ? `?${urlParams.toString()}` : '';
        window.history.replaceState({}, document.title, `${window.location.pathname}${cleanQuery}`);

        // Toast de Sincronização
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-xl flex items-center space-x-2 animate-bounce';
        toast.innerHTML = '<span>📲</span><span>Sessão e dados puxados do computador com sucesso!</span>';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
      }
    } catch (e) {
      console.log('Handoff Sync note:', e);
    }
  }

  // Executa o receptor ao carregar o script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', handleIncomingSyncHandoff);
  } else {
    handleIncomingSyncHandoff();
  }

  // Registra o Service Worker automaticamente se suportado
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('ServiceWorker note:', err.message);
      });
    });
  }

})();
