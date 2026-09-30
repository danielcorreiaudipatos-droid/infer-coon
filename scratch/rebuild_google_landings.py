import os
import re

with open('scratch/portal_header.html', 'r', encoding='utf-8') as f:
    header = f.read()

with open('frontend/portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()
    head_end = portal.find('</header>') + 9
    navbar = portal[:head_end]
    footer_start = portal.find('<footer')
    footer = portal[footer_start:]

# ----------------- ONMAIL LANDING PAGE (Google/Microsoft Style) -----------------
onmail_landing_content = """
  <!-- HERO SECTION: Ultra-clean, Google Workspace vibe -->
  <main class="flex-1 flex flex-col items-center justify-start relative z-10 w-full pt-16 pb-24 px-4 bg-white dark:bg-[#0b0f19]">
    <div class="text-center space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      <!-- Subtle Pill Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium mb-2 shadow-sm transition hover:shadow-md">
        <span class="flex h-2 w-2 relative">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        O novo padrão em produtividade corporativa
      </div>
      
      <h1 class="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
        E-mail corporativo,<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">agora com Inteligência.</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mt-6">
        Protegido pela LGPD, integrado ao WhatsApp e desenhado para equipes que exigem velocidade. Uma experiência fluida, sem anúncios e sem distrações.
      </p>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-base">
          Começar Agora
        </button>
        <a href="/onmail/cx" class="px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-base">
          Acessar Sistema
        </a>
      </div>
    </div>

    <!-- PRICING SECTION: Microsoft Azure / Google Cloud clean cards -->
    <div class="mt-32 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Grátis -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Básico</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Perfeito para começar sua jornada digital.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-slate-900 dark:text-white">Grátis</p>
        </div>
        <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>5 GB de armazenamento seguro na nuvem</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>1 Conta de e-mail padronizada</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>Proteção inteligente anti-spam</span></li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors">Criar Conta</button>
      </div>

      <!-- Pro -->
      <div class="bg-blue-600 rounded-2xl p-8 border border-blue-600 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col relative transform md:-translate-y-2 group">
        <h3 class="text-xl font-semibold text-white">Executivo Pro</h3>
        <p class="text-sm text-blue-100 mt-2">A escolha ideal para profissionais focados em resultado.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-white">R$ 29,90<span class="text-base font-normal text-blue-200">/mês</span></p>
        </div>
        <ul class="space-y-4 text-sm text-blue-50 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-white mt-0.5"></i> <span>50 GB de armazenamento de alta velocidade</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-white mt-0.5"></i> <span>E-mails ilimitados</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-white mt-0.5"></i> <span>Respostas assistidas por Inteligência Artificial</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-white mt-0.5"></i> <span>Domínio personalizado exclusivo</span></li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-lg bg-white text-blue-700 font-semibold hover:bg-blue-50 transition-colors shadow-sm">Assinar Pro</button>
      </div>

      <!-- Enterprise -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Empresas</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Infraestrutura dedicada para operações complexas.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-slate-900 dark:text-white">Sob Consulta</p>
        </div>
        <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>Espaço elástico e ilimitado</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>Painel de administração de equipes</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-blue-600 mt-0.5"></i> <span>Suporte técnico VIP 24/7</span></li>
        </ul>
        <a href="https://wa.me/5531999999999" target="_blank" class="mt-8 block text-center w-full py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Falar com Consultor</a>
      </div>

    </div>
  </main>
"""

with open('frontend/onmail_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + onmail_landing_content + footer)

# ----------------- INFER LANDING PAGE (Google/Microsoft Style) -----------------
infer_landing_content = """
  <!-- HERO SECTION: Ultra-clean, Microsoft PowerBI / Google Cloud vibe -->
  <main class="flex-1 flex flex-col items-center justify-start relative z-10 w-full pt-16 pb-24 px-4 bg-white dark:bg-[#0b0f19]">
    <div class="text-center space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      <!-- Subtle Pill Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium mb-2 shadow-sm transition hover:shadow-md">
        <i data-lucide="bar-chart-2" class="w-4 h-4 text-emerald-500"></i>
        <span>Avaliação Imobiliária NBR 14.653</span>
      </div>
      
      <h1 class="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
        Precisão de mercado,<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">em tempo real.</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium mt-6">
        Coon Eval é o motor de inferência estatística mais rápido do Brasil. Gere laudos, calcule regressões e extraia métricas diretas na nuvem.
      </p>

      <div class="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-base">
          Avaliar Gratuitamente
        </button>
        <a href="/infer/app" class="px-8 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 text-base">
          Acessar Painel
        </a>
      </div>
    </div>

    <!-- PRICING SECTION -->
    <div class="mt-32 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
      
      <!-- Grátis -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Avaliador</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Para estudantes e iniciantes.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-slate-900 dark:text-white">Grátis</p>
        </div>
        <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>Até 5 projetos de inferência por mês</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>Regressão Linear Básica</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>Gráficos e relatórios simples</span></li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors">Criar Conta</button>
      </div>

      <!-- Pro -->
      <div class="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border border-slate-900 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col relative transform md:-translate-y-2 group">
        <h3 class="text-xl font-semibold text-white">Perito Pro</h3>
        <p class="text-sm text-slate-300 mt-2">Alto desempenho para avaliadores imobiliários.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-white">R$ 49,90<span class="text-base font-normal text-slate-400">/mês</span></p>
        </div>
        <ul class="space-y-4 text-sm text-slate-300 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-400 mt-0.5"></i> <span>Projetos ilimitados na nuvem</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-400 mt-0.5"></i> <span>Acesso ao Banco de Dados Compartilhado</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-400 mt-0.5"></i> <span>Exportação completa (NBR 14.653)</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-400 mt-0.5"></i> <span>Upload massivo de planilhas</span></li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-lg bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-sm">Assinar Pro</button>
      </div>

      <!-- Enterprise -->
      <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
        <h3 class="text-xl font-semibold text-slate-900 dark:text-white">Imobiliárias</h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">Licenciamento corporativo e gestão de equipe.</p>
        <div class="mt-6 mb-8">
          <p class="text-4xl font-bold text-slate-900 dark:text-white">Sob Consulta</p>
        </div>
        <ul class="space-y-4 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>Múltiplas contas com gestão central</em></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>API para integração de CRM Imobiliário</span></li>
          <li class="flex items-start gap-3"><i data-lucide="check" class="w-5 h-5 text-emerald-600 mt-0.5"></i> <span>Treinamento e Suporte VIP</span></li>
        </ul>
        <a href="https://wa.me/5531999999999" target="_blank" class="mt-8 block text-center w-full py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Falar com Vendas</a>
      </div>

    </div>
  </main>
"""

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + infer_landing_content + footer)

print("Redesigned Google/Microsoft style landing pages created!")
