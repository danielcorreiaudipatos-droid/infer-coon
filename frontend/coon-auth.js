/**
 * ========================================================
 * COON UNIVERSAL AUTH & CLIENT PANEL SUITE
 * Holding Coon Participações Ltda. (www.coon.com.br)
 * ========================================================
 * Autenticação unificada (E-mail tradicional, WhatsApp, Google OAuth, Chave Master)
 * e gerenciamento de perfil, troca de login e encerramento de sessão (Logout).
 */

(function () {
  'use strict';

  const AUTH_API = '/api/auth';
  let currentUser = null;

  document.addEventListener('DOMContentLoaded', () => {
    initCoonAuth();
  });

  async function initCoonAuth() {
    injectAuthModals();
    injectNavWidget();
    await verifySession();
  }

  // Extrai 2 iniciais elegantes para o avatar (ex: "Daniel Soares" -> "DS")
  function getUserInitials(name) {
    if (!name) return 'DS';
    const clean = name.trim();
    if (clean.toLowerCase().includes('daniel') && clean.toLowerCase().includes('soares')) return 'DS';
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'C';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 my-8 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
          
          <!-- Topo do Modal -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-2">
              <span class="text-xl font-black tracking-tight" style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 25%, #0284c7 50%, #0d9488 75%, #10b981 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                coon<span class="text-emerald-500">.</span>
              </span>
              <span class="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Identidade Digital
              </span>
            </div>
            <button onclick="closeCoonAuthModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Seletor de Abas (Entrar vs Cadastrar Sem Google) -->
          <div class="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button id="tabBtnLogin" onclick="switchAuthTab('login')" class="flex-1 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs transition">
              Entrar na Conta
            </button>
            <button id="tabBtnRegister" onclick="switchAuthTab('register')" class="flex-1 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              Cadastrar Grátis
            </button>
          </div>

          <!-- FORMULÁRIO 1: LOGIN (EMAIL + SENHA OU MASTER) -->
          <form id="formCoonLogin" onsubmit="submitCoonLogin(event)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Seu E-mail (qualquer provedor):</label>
              <input type="email" id="loginEmail" required placeholder="ex: seu.nome@onmail.br ou empresa.com.br" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block font-bold text-slate-700 dark:text-slate-300">Senha de Acesso ou Chave Master:</label>
                <span class="text-[10px] text-slate-400">Admin usa chave master</span>
              </div>
              <input type="password" id="loginPassword" required placeholder="••••••••••••" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>
            
            <p id="loginErrorMsg" class="text-rose-600 font-semibold text-[11px] hidden text-center"></p>

            <button type="submit" id="btnLoginSubmit" class="w-full py-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <span>Entrar na Plataforma</span>
            </button>
          </form>

          <!-- FORMULÁRIO 2: CADASTRO COMPLETO PARA CLIENTE SEM GOOGLE -->
          <form id="formCoonRegister" onsubmit="submitCoonRegister(event)" class="space-y-3 text-xs hidden">
            <div class="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300">
              💡 <strong>Cadastro Direto:</strong> Não necessita de conta Google. Use seu e-mail corporativo ou pessoal de qualquer provedor.
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Nome Completo ou Razão Social:</label>
              <input type="text" id="regName" required placeholder="Ex: Daniel Soares Correia" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Seu Melhor E-mail:</label>
              <input type="email" id="regEmail" required placeholder="ex: seu.nome@onmail.br, outlook, hotmail, empresa..." class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">WhatsApp com DDD (para suporte e notificações):</label>
              <input type="tel" id="regPhone" placeholder="Ex: (34) 99999-9999" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>
            <div>
              <label class="block font-bold text-slate-700 dark:text-slate-300 mb-1">Crie uma Senha:</label>
              <input type="password" id="regPassword" required minlength="4" placeholder="Mínimo 4 caracteres" class="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500 font-medium text-slate-900 dark:text-white">
            </div>

            <p id="regErrorMsg" class="text-rose-600 font-semibold text-[11px] hidden text-center"></p>

            <button type="submit" id="btnRegSubmit" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer">
              <span>Criar Conta Gratuita & Acessar</span>
            </button>
          </form>

          <!-- Divisor Sutil & Opção Secundária com Google -->
          <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div class="text-center text-[10px] text-slate-400 dark:text-slate-500 mb-2">ou se preferir agilidade com 1 clique:</div>
            <button onclick="handleGoogleSignIn()" class="w-full py-2 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl shadow-2xs transition flex items-center justify-center space-x-2 cursor-pointer">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Continuar com Google</span>
            </button>
          </div>

        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODAL DA ÁREA DO CLIENTE / PAINEL DO ASSINANTE -->
      <!-- ============================================== -->
      <div id="coonClientModal" class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm hidden items-center justify-center p-4 overflow-y-auto">
        <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95">
          
          <!-- Topo do Painel do Cliente -->
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div class="flex items-center space-x-3">
              <div id="clientAvatarBadge" class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-emerald-600 text-white flex items-center justify-center font-black text-sm shadow-sm font-heading">
                DS
              </div>
              <div>
                <h3 id="clientModalName" class="font-extrabold text-slate-900 dark:text-white text-sm leading-tight">Daniel Soares Correia</h3>
                <span id="clientModalEmail" class="text-xs text-slate-500 dark:text-slate-400 font-mono">diretoria@coon.com.br</span>
              </div>
            </div>
            <button onclick="closeCoonClientModal()" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Status do Plano -->
          <div class="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assinatura Ativa</span>
              <span id="clientModalPlan" class="text-base font-black text-slate-900 dark:text-white font-mono">Presidência Master</span>
              <span class="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block flex items-center space-x-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Acesso Liberado em Todos os Softwares</span>
              </span>
            </div>
            <div class="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800">
              Ativo 🟢
            </div>
          </div>

          <!-- Card Exclusivo do Administrador Master (se for admin) -->
          <div id="clientAdminCard" class="hidden p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-md">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold">👑 Presidência & Holding Master</span>
              <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">Diretoria</span>
            </div>
            <p class="text-xs text-slate-300">Você possui credenciais irrestritas de controle da holding Coon Participações Ltda.</p>
            <a href="/admin" class="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition">
              <span>Abrir Master Cockpit Admin →</span>
            </a>
          </div>

          <!-- Ações Rápidas de Sessão: Trocar de Login & Sair da Conta -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button onclick="switchAccount()" class="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700">
              <span>🔄</span>
              <span>Trocar de Login</span>
            </button>
            <button onclick="logoutCoonUser()" class="w-full py-2.5 px-3 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-800">
              <span>🚪</span>
              <span>Sair da Conta</span>
            </button>
          </div>

          <div class="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <button onclick="closeCoonClientModal()" class="text-xs text-slate-500 dark:text-slate-400 hover:underline">Fechar painel</button>
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
      const header = document.querySelector('header');
      if (header) {
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
        <button onclick="openCoonAuthModal()" class="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center space-x-1.5 cursor-pointer">
          <svg class="w-3.5 h-3.5 text-emerald-400 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span>Entrar</span>
        </button>
      `;
    } else {
      const initials = getUserInitials(currentUser.name);
      const firstName = (currentUser.name || 'Cliente').split(' ')[0];
      const planBadge = currentUser.is_admin ? 'Master' : (currentUser.plan ? currentUser.plan.replace('_', ' ') : 'Pro');

      slot.innerHTML = `
        <div class="relative">
          <button 
            id="coonUserAvatarBtn"
            onclick="toggleCoonUserDropdown()" 
            class="px-2.5 py-1 rounded-full bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-2xs transition flex items-center space-x-1.5 cursor-pointer"
            title="Conta: ${currentUser.name || ''} (${currentUser.email || ''}) • Clique para ver opções ou sair"
          >
            <span class="w-6 h-6 rounded-full bg-gradient-to-tr from-slate-900 to-emerald-600 text-white flex items-center justify-center text-[10px] font-black font-mono shadow-xs">${initials}</span>
            <span class="max-w-[90px] truncate text-[11px] font-semibold">${firstName}</span>
            <span class="text-[9px] px-1.5 py-0.2 rounded-full ${currentUser.is_admin ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-mono font-bold' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'} uppercase font-bold">${planBadge}</span>
            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </button>

          <!-- Dropdown Flutuante Executivo (Estilo Google Account) -->
          <div 
            id="coonUserDropdownMenu" 
            class="hidden absolute right-0 top-10 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 text-left"
          >
            <div class="flex items-center gap-2.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-emerald-600 text-white flex items-center justify-center font-black text-xs font-mono shrink-0">
                ${initials}
              </div>
              <div class="overflow-hidden">
                <div class="text-xs font-bold text-slate-900 dark:text-white truncate">${currentUser.name || 'Usuário Coon'}</div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 truncate font-mono">${currentUser.email || ''}</div>
              </div>
            </div>

            <div class="py-2 space-y-1 text-xs">
              <button onclick="openCoonClientModal(); closeCoonUserDropdown();" class="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 transition cursor-pointer">
                <span>👤</span>
                <span>Meu Painel do Cliente</span>
              </button>
              ${currentUser.is_admin ? `
                <a href="/admin" class="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40 font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-2 transition">
                  <span>👑</span>
                  <span>Painel Master Admin</span>
                </a>
              ` : ''}
              <button onclick="switchAccount()" class="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 transition cursor-pointer">
                <span>🔄</span>
                <span>Trocar de Login</span>
              </button>
            </div>

            <div class="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onclick="logoutCoonUser()" class="w-full px-2.5 py-1.5 text-left rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 transition cursor-pointer">
                <span>🚪</span>
                <span>Sair da Conta (Deslogar)</span>
              </button>
            </div>
          </div>
        </div>
      `;

      // Fecha o dropdown ao clicar fora
      document.addEventListener('click', function(e) {
        const btn = document.getElementById('coonUserAvatarBtn');
        const menu = document.getElementById('coonUserDropdownMenu');
        if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
          menu.classList.add('hidden');
        }
      });
    }
  }

  window.toggleCoonUserDropdown = function() {
    const menu = document.getElementById('coonUserDropdownMenu');
    if (menu) menu.classList.toggle('hidden');
  };

  window.closeCoonUserDropdown = function() {
    const menu = document.getElementById('coonUserDropdownMenu');
    if (menu) menu.classList.add('hidden');
  };

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
        localStorage.removeItem('coon_auth_token');
        localStorage.removeItem('coon_user');
        currentUser = null;
        renderNavWidget();
      }
    } catch (e) {}
  }

  // ========================================================
  // 4. FUNÇÕES DE AUTENTICAÇÃO E MODAIS
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
    document.getElementById('clientModalPlan').innerText = currentUser.is_admin ? 'Presidência Master (Holding)' : (currentUser.plan ? currentUser.plan.toUpperCase() : 'PRO ATIVO');
    document.getElementById('clientAvatarBadge').innerText = getUserInitials(currentUser.name);

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
      btnL.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs transition';
      btnR.className = 'flex-1 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
      formL.classList.remove('hidden');
      formR.classList.add('hidden');
    } else {
      btnR.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs transition';
      btnL.className = 'flex-1 py-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition';
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
        localStorage.setItem('coon_is_admin', 'true');
        localStorage.setItem('is_daniel', 'true');
      }

      currentUser = data.user;
      renderNavWidget();
      closeCoonAuthModal();
      window.location.reload();
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
    const phone = document.getElementById('regPhone') ? document.getElementById('regPhone').value.trim() : '';
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
        body: JSON.stringify({ name, email, password, crea_cau: phone })
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
      window.location.reload();
    } catch (ex) {
      err.innerText = 'Erro de conexão com o servidor.';
      err.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Criar Conta Gratuita & Acessar';
    }
  };

  window.handleGoogleSignIn = async function () {
    const userPrompt = prompt("Digite seu E-mail para login/cadastro instantâneo:", "cliente@onmail.br");
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
        window.location.reload();
      }
    } catch (e) {
      alert("Erro ao conectar.");
    }
  };

  // Trocar de Login: limpa a sessão atual e abre imediatamente o modal de login
  window.switchAccount = function () {
    localStorage.removeItem('coon_auth_token');
    localStorage.removeItem('coon_user');
    currentUser = null;
    closeCoonClientModal();
    closeCoonUserDropdown();
    renderNavWidget();
    openCoonAuthModal();
  };

  // Sair da Conta (Logout completo)
  window.logoutCoonUser = function () {
    localStorage.removeItem('coon_auth_token');
    localStorage.removeItem('coon_user');
    localStorage.removeItem('coon_master_key');
    localStorage.removeItem('coon_is_admin');
    localStorage.removeItem('is_daniel');
    currentUser = null;
    closeCoonClientModal();
    closeCoonUserDropdown();
    renderNavWidget();
    window.location.reload();
  };

})();
