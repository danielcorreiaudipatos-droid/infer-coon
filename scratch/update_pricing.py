with open('frontend/infer_landing.html', encoding='utf-8') as f:
    landing = f.read()

# Replace the Pro pricing card with full launch pricing structure
old_pro = '''        <!-- Pro (elevated) -->
        <div class="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border border-slate-900 shadow-2xl flex flex-col relative transform md:-translate-y-3">
          <div class="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">Mais Escolhido</div>
          <div class="text-sm font-semibold text-blue-300 mb-1">Perito Pro</div>
          <div class="text-4xl font-bold text-white">R$&nbsp;79,90<span class="text-base font-normal text-slate-400">/mês</span></div>
          <div class="mt-6 space-y-3 flex-1 text-sm text-slate-300">
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Projetos ilimitados na nuvem</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Banco de Dados Compartilhado</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Exportação completa NBR 14.653</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Upload massivo via planilha XLS</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> IA para inventário de documentos</div>
          </div>
          <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-sm shadow-lg shadow-blue-600/30">Assinar Plano Perito</button>
        </div>'''

new_pro = '''        <!-- Pro (elevated) - 2 billing options -->
        <div class="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border border-slate-900 shadow-2xl flex flex-col relative transform md:-translate-y-3">
          <div class="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">Mais Escolhido</div>
          <div class="text-sm font-semibold text-blue-300 mb-3">Perito Pro</div>

          <!-- Toggle Mensal / Anual -->
          <div class="flex rounded-xl overflow-hidden border border-slate-700 mb-5 text-xs font-semibold">
            <button id="btnMensal" onclick="setPlano('mensal')" class="flex-1 py-2 bg-blue-600 text-white transition-colors">Mensal</button>
            <button id="btnAnual" onclick="setPlano('anual')" class="flex-1 py-2 bg-transparent text-slate-400 hover:text-white transition-colors">Anual <span class="text-emerald-400 ml-1">−50%</span></button>
          </div>

          <!-- Preço Mensal -->
          <div id="precoMensal">
            <div class="flex items-baseline gap-2">
              <span class="text-slate-500 line-through text-lg">R$&nbsp;119,00</span>
              <span class="bg-blue-500/20 text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">−25% lançamento</span>
            </div>
            <div class="text-4xl font-bold text-white mt-1">R$&nbsp;89,25<span class="text-base font-normal text-slate-400">/mês</span></div>
          </div>

          <!-- Preço Anual (oculto por padrão) -->
          <div id="precoAnual" class="hidden">
            <div class="flex items-baseline gap-2">
              <span class="text-slate-500 line-through text-lg">R$&nbsp;119,00</span>
              <span class="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-full">−50% lançamento</span>
            </div>
            <div class="text-4xl font-bold text-white mt-1">R$&nbsp;59,50<span class="text-base font-normal text-slate-400">/mês</span></div>
            <div class="text-xs text-slate-400 mt-1">R$&nbsp;714,00 cobrado uma vez por ano</div>
          </div>

          <div class="mt-6 space-y-3 flex-1 text-sm text-slate-300">
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Projetos ilimitados na nuvem</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Banco de Dados Compartilhado</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Exportação completa NBR 14.653</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Upload massivo via planilha XLS</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> IA para inventário de documentos</div>
          </div>
          <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-sm shadow-lg shadow-blue-600/30">Assinar Plano Perito</button>
          
          <script>
            function setPlano(tipo) {
              const mensal = document.getElementById('precoMensal');
              const anual = document.getElementById('precoAnual');
              const btnM = document.getElementById('btnMensal');
              const btnA = document.getElementById('btnAnual');
              if (tipo === 'mensal') {
                mensal.classList.remove('hidden'); anual.classList.add('hidden');
                btnM.classList.add('bg-blue-600','text-white'); btnM.classList.remove('text-slate-400');
                btnA.classList.remove('bg-blue-600','text-white'); btnA.classList.add('text-slate-400');
              } else {
                anual.classList.remove('hidden'); mensal.classList.add('hidden');
                btnA.classList.add('bg-blue-600','text-white'); btnA.classList.remove('text-slate-400');
                btnM.classList.remove('bg-blue-600','text-white'); btnM.classList.add('text-slate-400');
              }
            }
          </script>
        </div>'''

landing = landing.replace(old_pro, new_pro)

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(landing)

if new_pro[:50] in open('frontend/infer_landing.html', encoding='utf-8').read():
    print("Pricing updated successfully with toggle Mensal/Anual!")
else:
    print("WARNING: replacement may not have matched exactly")
