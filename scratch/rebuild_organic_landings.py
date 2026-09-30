import os

with open('scratch/portal_header.html', 'r', encoding='utf-8') as f:
    header = f.read()

with open('frontend/portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()
    head_end = portal.find('</header>') + 9
    navbar = portal[:head_end]
    footer_start = portal.find('<footer')
    footer = portal[footer_start:]

# ----------------- ONMAIL (Premium Human-Crafted Look) -----------------
onmail_content = """
  <!-- ORGANIC BACKGROUND GLOWS -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[100px]"></div>
    <div class="absolute top-[20%] -right-[10%] w-[30%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]"></div>
  </div>

  <main class="flex-1 flex flex-col items-center justify-start relative z-10 w-full pt-20 pb-32 px-4">
    
    <!-- HERO: Typographic, clean, Apple/Stripe-like -->
    <div class="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xl shadow-blue-900/5">
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        O E-mail Corporativo, Redefinido.
      </div>
      
      <h1 class="text-5xl md:text-[5.5rem] font-bold text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
        Comunicação <br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-blue-600 to-emerald-500 dark:from-white dark:via-blue-400 dark:to-emerald-400">à velocidade do pensamento.</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
        Desenhado para equipes de alto rendimento. Sem anúncios. 100% blindado pela LGPD. Integrado ao seu WhatsApp.
      </p>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-2xl shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 text-base flex items-center gap-2 group">
          Começar Agora
          <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
        </button>
        <a href="/onmail/cx" class="px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 text-base">
          Acessar o Painel
        </a>
      </div>
    </div>

    <!-- ASYMMETRICAL PRICING (Human-designed feel) -->
    <div class="mt-32 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      
      <!-- Base Plan -->
      <div class="md:col-span-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow duration-500">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Start</h3>
          <span class="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Grátis</span>
        </div>
        <ul class="space-y-5 text-slate-600 dark:text-slate-400 font-medium mb-10">
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> 5 GB de armazenamento SSD</li>
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> 1 Endereço de e-mail</li>
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Webmail padrão Coon</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">Criar Conta Gratuita</button>
      </div>

      <!-- Pro Plan (Bigger, Overlapping, Glowing) -->
      <div class="md:col-span-7 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800 dark:border-slate-700 relative overflow-hidden group">
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h3 class="text-3xl font-black text-white">Executivo Pro</h3>
            <p class="text-blue-200 font-medium mt-1">Produtividade sem limites.</p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-4xl font-black text-white">R$ 29,90</p>
            <p class="text-sm text-blue-300/80">cobrado mensalmente</p>
          </div>
        </div>

        <div class="relative z-10 grid sm:grid-cols-2 gap-6 mb-12">
          <div class="space-y-4 text-blue-50/90 font-medium">
            <p class="flex items-center gap-3"><i data-lucide="zap" class="w-4 h-4 text-emerald-400"></i> 50 GB Ultrafast</p>
            <p class="flex items-center gap-3"><i data-lucide="infinity" class="w-4 h-4 text-emerald-400"></i> Contas Ilimitadas</p>
          </div>
          <div class="space-y-4 text-blue-50/90 font-medium">
            <p class="flex items-center gap-3"><i data-lucide="bot" class="w-4 h-4 text-emerald-400"></i> Rascunhos via IA</p>
            <p class="flex items-center gap-3"><i data-lucide="globe" class="w-4 h-4 text-emerald-400"></i> Domínio Próprio</p>
          </div>
        </div>

        <button onclick="window.openCoonAuthModal('register')" class="relative z-10 w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-slate-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]">
          Fazer Upgrade para Pro
        </button>
      </div>

    </div>
  </main>
"""

with open('frontend/onmail_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + onmail_content + footer)

# ----------------- COON EVAL (Premium Look) -----------------
infer_content = """
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0">
    <div class="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px]"></div>
    <div class="absolute top-[10%] -right-[20%] w-[40%] h-[40%] rounded-full bg-teal-500/10 blur-[100px]"></div>
  </div>

  <main class="flex-1 flex flex-col items-center justify-start relative z-10 w-full pt-20 pb-32 px-4">
    
    <div class="text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out">
      
      <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xl shadow-emerald-900/5">
        <i data-lucide="calculator" class="w-3.5 h-3.5 text-emerald-500"></i>
        Avaliação Imobiliária • NBR 14.653
      </div>
      
      <h1 class="text-5xl md:text-[5.5rem] font-bold text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
        Precisão cirúrgica.<br>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-400">Em tempo real.</span>
      </h1>
      
      <p class="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
        Coon Eval é o motor estatístico na nuvem construído para peritos que não têm tempo a perder com planilhas quebradas.
      </p>

      <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl shadow-emerald-600/20 hover:-translate-y-1 transition-all duration-300 text-base flex items-center gap-2 group">
          Começar Avaliação
          <i data-lucide="arrow-right" class="w-4 h-4 group-hover:translate-x-1 transition-transform"></i>
        </button>
        <a href="/infer/app" class="px-8 py-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 hover:shadow-md transition-all duration-300 text-base">
          Abrir o Painel
        </a>
      </div>
    </div>

    <!-- ASYMMETRICAL PRICING -->
    <div class="mt-32 w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      
      <div class="md:col-span-5 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2rem] p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-shadow duration-500">
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Estudante</h3>
          <span class="text-sm font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">Grátis</span>
        </div>
        <ul class="space-y-5 text-slate-600 dark:text-slate-400 font-medium mb-10">
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Até 5 projetos / mês</li>
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Regressão Linear Básica</li>
          <li class="flex items-center gap-3"><div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div> Modelos padrão</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="w-full py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-white dark:hover:bg-slate-800 transition-colors">Criar Conta Gratuita</button>
      </div>

      <div class="md:col-span-7 bg-slate-900 dark:bg-slate-800 rounded-[2.5rem] p-12 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] border border-slate-800 dark:border-slate-700 relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
        
        <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
          <div>
            <h3 class="text-3xl font-black text-white">Perito Pro</h3>
            <p class="text-emerald-200 font-medium mt-1">O arsenal completo para engenharia.</p>
          </div>
          <div class="text-left sm:text-right">
            <p class="text-4xl font-black text-white">R$ 49,90</p>
            <p class="text-sm text-emerald-300/80">cobrado mensalmente</p>
          </div>
        </div>

        <div class="relative z-10 grid sm:grid-cols-2 gap-6 mb-12">
          <div class="space-y-4 text-emerald-50/90 font-medium">
            <p class="flex items-center gap-3"><i data-lucide="database" class="w-4 h-4 text-teal-400"></i> Banco Compartilhado</p>
            <p class="flex items-center gap-3"><i data-lucide="infinity" class="w-4 h-4 text-teal-400"></i> Laudos Ilimitados</p>
          </div>
          <div class="space-y-4 text-emerald-50/90 font-medium">
            <p class="flex items-center gap-3"><i data-lucide="file-text" class="w-4 h-4 text-teal-400"></i> Exportação NBR 14.653</p>
            <p class="flex items-center gap-3"><i data-lucide="upload-cloud" class="w-4 h-4 text-teal-400"></i> Upload Massivo via XLS</p>
          </div>
        </div>

        <button onclick="window.openCoonAuthModal('register')" class="relative z-10 w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-lg transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
          Assinar Plano Perito
        </button>
      </div>

    </div>
  </main>
"""

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + infer_content + footer)

print("Organic bespoke landing pages created!")
