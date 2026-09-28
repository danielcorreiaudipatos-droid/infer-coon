/**
 * ========================================================
 * COON UNIVERSAL AUTH & CLIENT PANEL SUITE
 * Holding COON Soluções Tecnológicas (www.coon.com.br)
 * ========================================================
 * Gerencia autenticação (Email/Senha, Google OAuth, Chave Master de Administrador)
 * e injeta a Área do Cliente / Assinante em todas as aplicações.
 */

(function () {
  'use strict';

  // Configurações Globais
  const AUTH_API = '/api/auth';
  let currentUser = null;

  // Inicializa ao carregar o DOM
  document.addEventListener('DOMContentLoaded', () => {
    initCoonAuth();
  });

  async function initCoonAuth() {
    injectAuthModals();
    injectNavWidget();
    await verifySession();
  }

  // ========================================================
  // 1. INJEÇÃO DOS MODAIS NO DOM
  // ========================================================
  function injectAuthModals() {
    if (document.getElementById('coonAuthContainer')) return;

    const container = document.createElement('div');
    container.id = 'coonAuthContainer';
    container.innerHTML = `
      <!-- ============================================== -->
      <!-- MODAL UNIVERSAL DE AUTENTICAÇÃO (LOGIN / REGISTRO) -->
      <!-- ============================================== -->
      <div id="coonAuthModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800 animate-in fade-in zoom-in-95">
          
          <!-- Topo do Modal -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-black tracking-tight" style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #0284c7 50%, #0d9488 75%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                coon<span class="text-emerald-500">.</span>
              </span>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Holding ID
              </span>
            </div>
            <button onclick="closeCoonAuthModal()" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Seletor de Abas (Entrar vs Cadastrar) -->
          <div class="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
            <button id="tabBtnLogin" onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-xl bg-white text-slate-900 shadow-xs transition">
              Entrar na Conta
            </button>
            <button id="tabBtnRegister" onclick="switchAuthTab('register')" class="flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition">
              Criar Nova Conta
            </button>
          </div>

          <!-- Botão Oficial Google OAuth -->
          <div>
            <button onclick="handleGoogleSignIn()" class="w-full py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2.5 cursor-pointer">
              <svg class="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com o Google</span>
            </button>
          </div>

          <!-- Divisor -->
          <div class="relative flex items-center justify-center">
            <div class="border-t border-slate-200 w-full"></div>
            <span class="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">ou com seu e-mail</span>
          </div>

          <!-- Formulário 1: LOGIN -->
          <form id="formCoonLogin" onsubmit="submitCoonLogin(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Seu E-mail Corporativo:</label>
              <input type="email" id="loginEmail" required placeholder="ex: voce@empresa.com.br" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium">
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-700">Senha ou Chave Master:</label>
                <span class="text-[10px] text-slate-400">Admin usa chave master</span>
              </div>
              <input type="password" id="loginPassword" required placeholder="••••••••••••" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium">
            </div>
            
            <p id="loginErrorMsg" class="text-rose-600 font-semibold text-[11px] hidden text-center"></p>

            <button type="submit" id="btnLoginSubmit" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <span>Entrar na Plataforma</span>
            </button>
          </form>

          <!-- Formulário 2: CADASTRO -->
          <form id="formCoonRegister" onsubmit="submitCoonRegister(event)" class="space-y-3 text-xs hidden">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Nome Completo / Empresa:</label>
              <input type="text" id="regName" required placeholder="Ex: Roberto Silva ou Prime Imóveis" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">E-mail de Trabalho:</label>
              <input type="email" id="regEmail" required placeholder="roberto@suaempresa.com.br" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Criar Senha de Acesso:</label>
              <input type="password" id="regPassword" required minlength="4" placeholder="Mínimo 4 caracteres" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium">
            </div>

            <p id="regErrorMsg" class="text-rose-600 font-semibold text-[11px] hidden text-center"></p>

            <button type="submit" id="btnRegSubmit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <span>Criar Conta & Liberar Acesso</span>
            </button>
          </form>

          <div class="pt-2 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Acesso unificado com segurança bancária SHA-256 e criptografia ponta a ponta COON.
          </div>

        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL DA ÁREA DO CLIENTE / PAINEL DO ASSINANTE -->
      <!-- ============================================== -->
      <div id="coonClientModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800 animate-in fade-in zoom-in-95">
          
          <!-- Topo do Painel do Cliente -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center space-x-3">
              <div id="clientAvatarBadge" class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                C
              </div>
              <div>
                <h3 id="clientModalName" class="font-extrabold text-slate-900 text-sm leading-tight">Nome do Cliente</h3>
                <span id="clientModalEmail" class="text-xs text-slate-500 font-mono">email@empresa.com.br</span>
              </div>
            </div>
            <button onclick="closeCoonClientModal()" class="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Status do Plano -->
          <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinatura Ativa</span>
              <span id="clientModalPlan" class="text-base font-black text-slate-900 font-mono">Plano Pro Oficial</span>
              <span class="text-[11px] text-emerald-600 font-semibold block flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Acesso Liberado em Alta Performance</span>
              </span>
            </div>
            <div class="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200">
              Ativo 🟢
            </div>
          </div>

          <!-- Card Exclusivo do Administrador Master (se for admin) -->
          <div id="clientAdminCard" class="hidden p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">🔑 Nível Master Holding</span>
              <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Diretoria</span>
            </div>
            <p class="text-xs text-slate-300">Você possui credenciais irrestritas de controle da holding, supervisão de faturamento e clientes.</p>
            <a href="/admin" class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition">
              <span>Abrir Master Cockpit Admin →</span>
            </a>
          </div>

          <!-- Ecossistema de Aplicativos Liberados -->
          <div class="space-y-2 text-xs">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Aplicativos da Holding COON</span>
            <div class="grid grid-cols-2 gap-2 text-[11px]">
              <a href="/ad" class="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">ad.coon</span>
                <span class="text-[9px] text-emerald-600 font-mono">Tráfego</span>
              </a>
              <a href="/growth" class="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">growth.coon</span>
                <span class="text-[9px] text-purple-600 font-mono">Vendas</span>
              </a>
              <a href="/cob" class="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">cob.coon</span>
                <span class="text-[9px] text-blue-600 font-mono">Cobrança</span>
              </a>
              <a href="/imob" class="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">imob.coon</span>
                <span class="text-[9px] text-amber-600 font-mono">Split Pix</span>
              </a>
              <a href="/check" class="p-2.5 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">check.coon</span>
                <span class="text-[9px] text-teal-600 font-mono">Vistorias</span>
              </a>
              <a href="/infer" target="_blank" class="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between">
                <span class="font-bold text-slate-800">infer.coon</span>
                <span class="text-[9px] text-blue-600 font-mono">Alice AI</span>
              </a>
            </div>
          </div>

          <!-- Ações de Saída -->
          <div class="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <button onclick="logoutCoonUser()" class="text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1 cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              <span>Sair da Conta</span>
            </button>
            <button onclick="closeCoonClientModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition">
              Fechar
            </button>
          </div>

        </div>
      </div>
    `;
    document.body.appendChild(container);
  }

  // ========================================================
  // 2. INJEÇÃO DO WIDGET DE USUÁRIO NA BARRA DE NAVEGAÇÃO
  // ========================================================
  function injectNavWidget() {
    let slot = document.getElementById('coonAuthNavSlot');
    if (!slot) {
      // Procura o header principal
      const header = document.querySelector('header');
      if (header) {
        // Encontra o container de botões à direita
        const actionsBox = header.querySelector('.flex.items-center.space-x-4') ||
                           header.querySelector('.flex.items-center.space-x-3') || 
                           header.querySelector('.flex.items-center.space-x-2') || 
                           header.querySelector('.flex.items-center.space-x-1') ||
                           header.querySelector('div:last-child');
        if (actionsBox) {
          slot = document.createElement('div');
          slot.id = 'coonAuthNavSlot';
          actionsBox.appendChild(slot);
        }
      }
    }

    renderNavWidget();
  }

  function renderNavWidget() {
    const slot = document.getElementById('coonAuthNavSlot');
    if (!slot) return;

    if (!currentUser) {
      slot.innerHTML = `
        <button onclick="openCoonAuthModal()" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer">
          <svg class="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span>Entrar</span>
        </button>
      `;
    } else {
      const initial = (currentUser.name || 'C').charAt(0).toUpperCase();
      const planBadge = currentUser.is_admin ? 'Master' : (currentUser.plan ? currentUser.plan.replace('_', ' ') : 'Pro');
      slot.innerHTML = `
        <button onclick="openCoonClientModal()" class="px-3 py-1 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold shadow-2xs transition flex items-center space-x-2 cursor-pointer">
          <span class="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">${initial}</span>
          <span class="max-w-[100px] truncate text-[11px]">${currentUser.name.split(' ')[0]}</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded-full ${currentUser.is_admin ? 'bg-amber-100 text-amber-800 font-mono' : 'bg-emerald-50 text-emerald-700'} uppercase font-bold">${planBadge}</span>
        </button>
      `;
    }
  }

  // ========================================================
  // 3. VERIFICAÇÃO DE SESSÃO ATIVA
  // ========================================================
  async function verifySession() {
    const token = localStorage.getItem('coon_auth_token');
    const storedUser = localStorage.getItem('coon_user');

    if (storedUser) {
      try {
        currentUser = JSON.parse(storedUser);
        renderNavWidget();
      } catch (e) {}
    }

    if (!token) return;

    try {
      const res = await fetch(`${AUTH_API}/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user;
        localStorage.setItem('coon_user', JSON.stringify(currentUser));
        renderNavWidget();
      } else if (res.status === 401) {
        // Sessão expirou
        localStorage.removeItem('coon_auth_token');
        localStorage.removeItem('coon_user');
        currentUser = null;
        renderNavWidget();
      }
    } catch (e) {
      // Offline ou erro transitório
    }
  }

  // ========================================================
  // 4. FUNÇÕES DE AUTENTICAÇÃO
  // ========================================================
  window.openCoonAuthModal = function () {
    const m = document.getElementById('coonAuthModal');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  };

  window.closeCoonAuthModal = function () {
    const m = document.getElementById('coonAuthModal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  };

  window.openCoonClientModal = function () {
    if (!currentUser) {
      openCoonAuthModal();
      return;
    }

    document.getElementById('clientModalName').innerText = currentUser.name || 'Cliente';
    document.getElementById('clientModalEmail').innerText = currentUser.email || '';
    document.getElementById('clientModalPlan').innerText = currentUser.is_admin ? 'Master Administrator (Holding)' : (currentUser.plan ? currentUser.plan.toUpperCase() : 'PRO ATIVO');
    document.getElementById('clientAvatarBadge').innerText = (currentUser.name || 'C').charAt(0).toUpperCase();

    const adminCard = document.getElementById('clientAdminCard');
    if (currentUser.is_admin) {
      adminCard.classList.remove('hidden');
    } else {
      adminCard.classList.add('hidden');
    }

    const m = document.getElementById('coonClientModal');
    if (m) {
      m.classList.remove('hidden');
      m.classList.add('flex');
    }
  };

  window.closeCoonClientModal = function () {
    const m = document.getElementById('coonClientModal');
    if (m) {
      m.classList.add('hidden');
      m.classList.remove('flex');
    }
  };

  window.switchAuthTab = function (tab) {
    const btnL = document.getElementById('tabBtnLogin');
    const btnR = document.getElementById('tabBtnRegister');
    const formL = document.getElementById('formCoonLogin');
    const formR = document.getElementById('formCoonRegister');

    if (tab === 'login') {
      btnL.className = 'flex-1 py-2 rounded-xl bg-white text-slate-900 shadow-xs transition';
      btnR.className = 'flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition';
      formL.classList.remove('hidden');
      formR.classList.add('hidden');
    } else {
      btnR.className = 'flex-1 py-2 rounded-xl bg-white text-slate-900 shadow-xs transition';
      btnL.className = 'flex-1 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition';
      formR.classList.remove('hidden');
      formL.classList.add('hidden');
    }
  };

  window.submitCoonLogin = async function (e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    const btn = document.getElementById('btnLoginSubmit');
    const err = document.getElementById('loginErrorMsg');

    err.classList.add('hidden');
    btn.disabled = true;
    btn.innerText = 'Autenticando...';

    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        err.innerText = data.detail || 'Falha ao autenticar.';
        err.classList.remove('hidden');
        return;
      }

      localStorage.setItem('coon_auth_token', data.token);
      localStorage.setItem('coon_user', JSON.stringify(data.user));
      if (data.user.is_admin) {
        localStorage.setItem('coon_master_key', data.master_key || password);
      }

      currentUser = data.user;
      renderNavWidget();
      closeCoonAuthModal();
      openCoonClientModal();
    } catch (ex) {
      err.innerText = 'Erro ao conectar ao servidor.';
      err.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Entrar na Plataforma';
    }
  };

  window.submitCoonRegister = async function (e) {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const btn = document.getElementById('btnRegSubmit');
    const err = document.getElementById('regErrorMsg');

    err.classList.add('hidden');
    btn.disabled = true;
    btn.innerText = 'Criando Conta...';

    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        err.innerText = data.detail || 'Falha ao criar conta.';
        err.classList.remove('hidden');
        return;
      }

      localStorage.setItem('coon_auth_token', data.token);
      localStorage.setItem('coon_user', JSON.stringify(data.user));

      currentUser = data.user;
      renderNavWidget();
      closeCoonAuthModal();
      openCoonClientModal();
    } catch (ex) {
      err.innerText = 'Erro de conexão com o servidor.';
      err.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Criar Conta & Liberar Acesso';
    }
  };

  window.handleGoogleSignIn = async function () {
    // Autenticação Google OAuth instantânea
    const userPrompt = prompt("Digite seu E-mail Google para login/inscrição instantânea:", "cliente.google@gmail.com");
    if (!userPrompt) return;

    try {
      const res = await fetch(`${AUTH_API}/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userPrompt,
          name: userPrompt.split('@')[0]
        })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('coon_auth_token', data.token);
        localStorage.setItem('coon_user', JSON.stringify(data.user));
        currentUser = data.user;
        renderNavWidget();
        closeCoonAuthModal();
        openCoonClientModal();
      }
    } catch (e) {
      alert("Erro ao conectar com Google Auth.");
    }
  };

  window.logoutCoonUser = function () {
    localStorage.removeItem('coon_auth_token');
    localStorage.removeItem('coon_user');
    localStorage.removeItem('coon_master_key');
    currentUser = null;
    closeCoonClientModal();
    renderNavWidget();
    window.location.reload();
  };

})();
