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

landing_content = """
  <main class="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10 w-full max-w-5xl mx-auto">
    <div class="text-center space-y-6 max-w-3xl">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-4">
        <i data-lucide="calculator" class="w-3.5 h-3.5"></i> Avaliação Imobiliária NBR 14.653
      </div>
      <h1 class="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[1.05]">
        <span class="text-emerald-500">Coon Eval.</span> Avaliações de mercado em segundos.
      </h1>
      <p class="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
        O motor de inferência estatística mais rápido do Brasil. Gere laudos técnicos, calcule regressões e visualize gráficos precisos direto na nuvem.
      </p>

      <div class="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="/" onclick="event.preventDefault(); window.openCoonAuthModal('register')" class="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl transition-all">
          Testar Grátis Agora
        </a>
        <a href="/infer/app" class="px-8 py-3.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all">
          Acessar o Sistema
        </a>
      </div>
    </div>

    <!-- Pricing Section -->
    <div class="mt-24 w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-20">
      
      <!-- Free -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Avaliador Iniciante</h3>
        <p class="text-3xl font-black text-slate-900 dark:text-white mt-4">Grátis</p>
        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Até 5 projetos por mês</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Regressão Linear Básica</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Gráficos de Dispersão</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Criar Conta</button>
      </div>

      <!-- Pro -->
      <div class="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 border border-slate-800 dark:border-slate-700 shadow-2xl flex flex-col relative transform md:-translate-y-4">
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-400 to-teal-500 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-md">O Mais Vendido</div>
        <h3 class="text-lg font-bold text-white">Perito Pro</h3>
        <p class="text-3xl font-black text-white mt-4">R$ 49,90<span class="text-sm text-slate-400 font-normal">/mês</span></p>
        <ul class="mt-6 space-y-3 text-sm text-slate-300 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Projetos Ilimitados</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Banco de Dados Compartilhado</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Exportação de Laudos NBR (Word/PDF)</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Suporte Prioritário VIP</li>
        </ul>
        <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition shadow-lg shadow-emerald-500/20">Assinar Plano Pro</button>
      </div>

      <!-- Enterprise -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white">Imobiliárias (Equipe)</h3>
        <p class="text-3xl font-black text-slate-900 dark:text-white mt-4">Sob Consulta</p>
        <ul class="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-400 flex-1">
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Contas Multi-usuário</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> API de Integração com CRMs</li>
          <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-500"></i> Treinamento Presencial/Online</li>
        </ul>
        <a href="https://wa.me/5531999999999" target="_blank" class="mt-8 block text-center w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition">Falar com Vendas</a>
      </div>

    </div>
  </main>
"""

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + landing_content + footer)

# Add routes to main.py
with open("backend/main.py", "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(
    r'return FileResponse\(os\.path\.join\(frontend_path, "inferencia", "index\.html"\)\)',
    'return FileResponse(os.path.join(frontend_path, "infer_landing.html"))',
    content
)

new_route = '''
    @app.api_route("/infer/app", methods=["GET", "HEAD"], response_class=FileResponse)
    def serve_infer_app():
        return FileResponse(os.path.join(frontend_path, "inferencia", "index.html"))
'''

if "/infer/app" not in content:
    content = content.replace(
        'def serve_infer():\n        return FileResponse(os.path.join(frontend_path, "infer_landing.html"))',
        'def serve_infer():\n        return FileResponse(os.path.join(frontend_path, "infer_landing.html"))\n' + new_route
    )

with open("backend/main.py", "w", encoding="utf-8") as f:
    f.write(content)

print("Created infer_landing.html and updated main.py routes")
