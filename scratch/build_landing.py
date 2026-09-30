import os

with open('scratch/portal_header.html', 'r', encoding='utf-8') as f:
    header = f.read()

# We need the full navbar up to the </header>
with open('frontend/portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()
    head_end = portal.find('</header>') + 9
    navbar = portal[:head_end]

landing_content = """
  <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-5xl mx-auto">
    <div class="text-center space-y-6 max-w-3xl">
      <h1 class="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
        <span class="text-emerald-500">OnMail.</span> O e-mail corporativo reinventado.
      </h1>
      <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
        Protegido pela <strong>LGPD</strong>, integrado nativamente ao WhatsApp e com inteligência artificial Coon. Eleve a comunicação da sua empresa a outro patamar.
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="/" onclick="event.preventDefault(); window.openCoonAuthModal('register')" class="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl transition-all">
          Criar minha Conta Grátis
        </a>
        <a href="/onmail/cx" class="px-8 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
          Entrar na Caixa de Entrada
        </a>
      </div>
    </div>

    <!-- Pricing Section -->
    <div class="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
      
      <!-- Free -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Conta Grátis</h3>
        <p class="text-3xl font-black text-slate-900 dark:text-white mt-4">R$ 0<span class="text-sm text-slate-500 font-normal">/mês</span></p>
        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> 5 GB de armazenamento seguro</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> 1 Conta de e-mail @onmail.br</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Proteção anti-spam básica</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Começar Grátis</button>
      </div>

      <!-- Pro -->
      <div class="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 border border-slate-800 dark:border-slate-700 shadow-2xl flex flex-col relative transform md:-translate-y-4">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md">Executivo</div>
        <h3 class="text-lg font-bold text-white">OnMail Pro</h3>
        <p class="text-3xl font-black text-white mt-4">R$ 29,90<span class="text-sm text-slate-400 font-normal">/mês</span></p>
        <ul class="mt-6 space-y-3 text-sm text-slate-300 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> 50 GB de armazenamento</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> E-mails corporativos ilimitados</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Respostas rascunhadas por IA</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Domínio personalizado exclusivo</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-lg shadow-emerald-500/20">Assinar Plano Pro</button>
      </div>

      <!-- Enterprise -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Business Coon</h3>
        <p class="text-3xl font-black text-slate-900 dark:text-white mt-4">Sob Consulta</p>
        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Espaço na Nuvem Ilimitado</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Integração avançada WhatsApp</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Suporte executivo 24/7</li>
        </ul>
        <a href="https://wa.me/5531999999999" target="_blank" class="mt-8 block text-center w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Falar com Consultor</a>
      </div>

    </div>
  </main>
"""

# Extract footer
footer_start = portal.find('<footer')
footer = portal[footer_start:]

with open('frontend/onmail_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + landing_content + footer)

print("Created onmail_landing.html")
