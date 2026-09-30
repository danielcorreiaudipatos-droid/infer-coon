import os

with open('frontend/portal.html', 'r', encoding='utf-8') as f:
    portal = f.read()
    head_end = portal.find('</header>') + 9
    navbar = portal[:head_end]
    footer_start = portal.find('<footer')
    footer = portal[footer_start:]

merged_landing = """
  <!-- subtle ambient glows -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
    <div class="absolute -top-[15%] -right-[10%] w-[45%] h-[45%] rounded-full bg-blue-500/8 blur-[130px]"></div>
    <div class="absolute top-[50%] -left-[10%] w-[35%] h-[50%] rounded-full bg-emerald-500/8 blur-[120px]"></div>
  </div>

  <style>
    /* ---- palette from user's landing, mapped to Coon tokens ---- */
    .marca-infer { color:#1F5F8B }
    .dark .marca-infer { color:#6BAEDB }
    /* vitrine / product mockup */
    .vitrine-wrap{border:1px solid rgba(0,0,0,.08);border-radius:18px;background:#fff;box-shadow:0 30px 80px -30px rgba(16,32,43,.18);overflow:hidden;text-align:left}
    .dark .vitrine-wrap{background:#141C22;border-color:rgba(255,255,255,.07)}
    .v-chrome{display:flex;gap:6px;padding:12px 14px;border-bottom:1px solid rgba(0,0,0,.07)}
    .dark .v-chrome{border-color:rgba(255,255,255,.07)}
    .v-chrome i{width:10px;height:10px;border-radius:50%;background:rgba(0,0,0,.12)}
    .dark .v-chrome i{background:rgba(255,255,255,.12)}
    .v-tabs{display:flex;gap:18px;padding:0 20px;border-bottom:1px solid rgba(0,0,0,.07);font-size:13px;color:#5A6670;overflow:hidden;white-space:nowrap}
    .dark .v-tabs{border-color:rgba(255,255,255,.07);color:#9AA6AF}
    .v-tabs span{padding:12px 0;display:flex;flex-direction:column;align-items:center;gap:2px}
    .v-tabs span.at{color:#1F5F8B;border-bottom:2px solid #1F5F8B;font-weight:600}
    .dark .v-tabs span.at{color:#6BAEDB;border-color:#6BAEDB}
    .v-tabs small{font-size:11px;color:#1E7B45;font-weight:700}
    .dark .v-tabs small{color:#5FC58A}
    .v-body{display:grid;grid-template-columns:1.2fr 1fr;gap:20px;padding:22px}
    @media(max-width:640px){.v-body{grid-template-columns:1fr}}
    .v-kpi{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:14px}
    .v-kpi div{background:rgba(0,0,0,.03);border-radius:10px;padding:10px 12px}
    .dark .v-kpi div{background:rgba(255,255,255,.04)}
    .v-kpi small{display:block;font-size:11px;color:#5A6670}
    .dark .v-kpi small{color:#9AA6AF}
    .v-kpi b{font-size:18px}
    .v-eq{font:13px/1.5 Consolas,"Cascadia Mono",monospace;background:rgba(0,0,0,.03);border-radius:10px;padding:10px 12px}
    .dark .v-eq{background:rgba(255,255,255,.04)}
    .v-graus{display:flex;gap:10px;margin-top:14px;font-size:13px;font-weight:600;flex-wrap:wrap}
    .v-graus span{padding:4px 10px;border-radius:999px;background:rgba(30,123,69,.12);color:#1E7B45}
    .dark .v-graus span{color:#5FC58A}
    /* step numbers */
    .step-num{font-size:clamp(36px,5vw,48px);font-weight:300;color:#1F5F8B;line-height:1}
    .dark .step-num{color:#6BAEDB}
    /* feature grid */
    .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(0,0,0,.08);border:1px solid rgba(0,0,0,.08);border-radius:16px;overflow:hidden}
    .dark .feat-grid{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.06)}
    .feat-cell{background:#fff;padding:28px 24px}
    .dark .feat-cell{background:#0b0f19}
    @media(max-width:768px){.feat-grid{grid-template-columns:1fr}}
    /* rule section */
    .regra-box{background:rgba(31,95,139,.06);border-radius:20px;padding:56px 48px}
    .dark .regra-box{background:rgba(107,174,219,.06)}
    @media(max-width:640px){.regra-box{padding:32px 20px}}
    /* accordion */
    details{border-bottom:1px solid rgba(0,0,0,.08);padding:20px 0}
    .dark details{border-color:rgba(255,255,255,.07)}
    summary{cursor:pointer;font-size:17px;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:20px;color:inherit}
    summary::after{content:"+";color:#1F5F8B;font-weight:400;font-size:22px;line-height:1}
    .dark summary::after{color:#6BAEDB}
    details[open] summary::after{content:"–"}
    details p{margin-top:10px;color:#5A6670;max-width:720px;font-size:15px}
    .dark details p{color:#9AA6AF}
    /* pill tags */
    .pill{border:1px solid rgba(0,0,0,.1);border-radius:999px;padding:7px 15px;font-size:14px}
    .dark .pill{border-color:rgba(255,255,255,.1)}
    /* proof strip */
    .proof-strip{border-top:1px solid rgba(0,0,0,.08);border-bottom:1px solid rgba(0,0,0,.08)}
    .dark .proof-strip{border-color:rgba(255,255,255,.07)}
  </style>

  <main class="flex-1 flex flex-col items-center relative z-10 w-full">

    <!-- ============================================================ HERO -->
    <section class="w-full max-w-5xl mx-auto px-6 pt-24 pb-12 text-center">
      <div class="inline-block text-xs font-bold tracking-widest uppercase text-blue-700 dark:text-blue-400 mb-6">Avaliação de Imóveis · ABNT NBR&nbsp;14.653</div>

      <h1 class="text-5xl md:text-[4.5rem] font-semibold text-slate-900 dark:text-white tracking-tight leading-[1.08]">
        Do dado de mercado<br>
        ao <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">laudo assinado.</span>
      </h1>

      <p class="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
        Inferência estatística conferida, laudo em Word e PDF no seu estilo. Uma regra que não se dobra: nenhum dado sem origem.
      </p>

      <div class="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 group">
          Começar agora
          <svg class="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
        <a href="#como" class="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-white font-semibold rounded-2xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 transition-all">
          Ver como funciona
        </a>
      </div>

      <!-- product mockup -->
      <div class="vitrine-wrap mt-16 text-left" aria-label="Tela do Coon Infer (ilustração)">
        <div class="v-chrome"><i></i><i></i><i></i></div>
        <div class="v-tabs">
          <span>Projeto<small>✓</small></span><span>Variáveis<small>✓</small></span><span>Amostras<small>✓</small></span>
          <span class="at">Modelo<small>✓</small></span><span>Gráficos<small>·</small></span><span>Avaliação<small>✓</small></span><span>Laudo completo<small>✓</small></span>
        </div>
        <div class="v-body">
          <div>
            <div class="v-kpi">
              <div><small>Amostras</small><b>40</b></div>
              <div><small>R² ajustado</small><b>0,85</b></div>
              <div><small>Sig do modelo</small><b>&lt;&nbsp;0,01%</b></div>
            </div>
            <div class="v-eq">ln(VU) = 5,19 + 202,0 × (1/Área) − 0,19 × ln(Dist) + 0,07 × Topo</div>
            <div class="v-graus"><span>Fundamentação Grau III</span><span>Precisão Grau III</span></div>
          </div>
          <svg viewBox="0 0 300 190" role="img" aria-label="Gráfico de valores observados por estimados">
            <line stroke="rgba(0,0,0,.12)" x1="30" y1="170" x2="290" y2="170"/>
            <line stroke="rgba(0,0,0,.12)" x1="30" y1="10" x2="30" y2="170"/>
            <line stroke="#C2410C" stroke-width="2" stroke-dasharray="5 4" x1="40" y1="160" x2="280" y2="20"/>
            <circle fill="#1F5F8B" opacity=".8" cx="52" cy="150" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="70" cy="146" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="84" cy="128" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="98" cy="132" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="112" cy="118" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="128" cy="104" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="140" cy="110" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="156" cy="92" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="170" cy="86" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="184" cy="74" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="198" cy="78" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="214" cy="60" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="230" cy="52" r="4"/><circle fill="#1F5F8B" opacity=".8" cx="246" cy="44" r="4"/>
            <circle fill="#1F5F8B" opacity=".8" cx="262" cy="32" r="4"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- ============================================================ PROOF STRIP -->
    <div class="proof-strip w-full mt-20">
      <div class="max-w-5xl mx-auto px-6 py-7 grid grid-cols-2 md:grid-cols-4 gap-5">
        <div><b class="block font-semibold text-slate-900 dark:text-white text-sm">NBR 14.653-1, -2 e -3</b><span class="text-xs text-slate-500 dark:text-slate-400">Graus calculados pela norma, automaticamente.</span></div>
        <div><b class="block font-semibold text-slate-900 dark:text-white text-sm">Cálculo conferido</b><span class="text-xs text-slate-500 dark:text-slate-400">Resultados verificados contra o statsmodels Python.</span></div>
        <div><b class="block font-semibold text-slate-900 dark:text-white text-sm">Nenhum dado sem origem</b><span class="text-xs text-slate-500 dark:text-slate-400">Cada dado cita documento, página e trecho.</span></div>
        <div><b class="block font-semibold text-slate-900 dark:text-white text-sm">No navegador</b><span class="text-xs text-slate-500 dark:text-slate-400">Sem instalar nada. Computador e celular.</span></div>
      </div>
    </div>

    <!-- ============================================================ HOW IT WORKS -->
    <section id="como" class="w-full max-w-5xl mx-auto px-6 pt-28 pb-0">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">Quatro passos. O resto é cálculo.</h2>
      <p class="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-xl">Você preenche o que só o avaliador sabe. O programa faz as contas, confere a norma e monta o laudo.</p>
      <div class="mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 border-t border-slate-100 dark:border-slate-800 pt-10">
        <div><div class="step-num">1</div><h3 class="mt-4 mb-2 font-semibold text-slate-900 dark:text-white">Projeto</h3><p class="text-sm text-slate-500 dark:text-slate-400">Responsável técnico, código, imóvel e data-base. A única etapa obrigatória antes de começar.</p></div>
        <div><div class="step-num">2</div><h3 class="mt-4 mb-2 font-semibold text-slate-900 dark:text-white">Amostras</h3><p class="text-sm text-slate-500 dark:text-slate-400">Lance, importe da planilha, traga do banco de mercado ou cole o anúncio. O print vira prova.</p></div>
        <div><div class="step-num">3</div><h3 class="mt-4 mb-2 font-semibold text-slate-900 dark:text-white">Modelo</h3><p class="text-sm text-slate-500 dark:text-slate-400">Um clique testa as combinações de escalas e escolhe o melhor modelo dentro da norma.</p></div>
        <div><div class="step-num">4</div><h3 class="mt-4 mb-2 font-semibold text-slate-900 dark:text-white">Laudo</h3><p class="text-sm text-slate-500 dark:text-slate-400">Escolha entre 17 modelos e 20 estilos. Sai em Word e PDF, com capa, sumário e anexos.</p></div>
      </div>
    </section>

    <!-- ============================================================ FEATURES -->
    <section id="recursos" class="w-full max-w-5xl mx-auto px-6 pt-28">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">Feito para quem assina.</h2>
      <p class="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-xl">Cada recurso existe para o laudo aguentar a pergunta mais difícil: de onde saiu este número?</p>
      <div class="feat-grid mt-12">
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M4 19V5M4 19h16M8 15l3-4 3 2 5-6"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Inferência completa</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Regressão com todas as escalas, busca dos 500 melhores modelos, normalidade, homocedasticidade, Cook, VIF e ANOVA.</p>
        </div>
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6zM9 9h6M9 13h6M9 17h4"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Inventário de documentos</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">A IA lê a pasta inteira, sugere preenchimento com página e trecho. Você decide o que entra.</p>
        </div>
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M9 12l2 2 4-4"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Checagem antes de entregar</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Cada campo aparece como resolvido, não encontrado ou em aberto. Com pendência, a entrega fica bloqueada.</p>
        </div>
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.5"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Raio e prints</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Distância de cada amostra ao imóvel, mapa com o raio e ficha de cada oferta com o anúncio.</p>
        </div>
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Excel e PDF de verdade</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Planilha com uma aba por quadro e relatório com todos os gráficos, prontos para anexar.</p>
        </div>
        <div class="feat-cell">
          <svg class="w-6 h-6 mb-4 stroke-blue-600 dark:stroke-blue-400" fill="none" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M5 5h14v10H9l-4 4z"/><path d="M9 9h6M9 12h4"/></svg>
          <h3 class="font-semibold text-slate-900 dark:text-white mb-2">Dúvidas, na hora</h3>
          <p class="text-sm text-slate-500 dark:text-slate-400">Pergunte como preencher ou o que significa um resultado. A IA vê a tela e orienta — sem preencher por você.</p>
        </div>
      </div>
    </section>

    <!-- ============================================================ PRICING (minimalist cards) -->
    <section class="w-full max-w-5xl mx-auto px-6 pt-28">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight text-center">Escolha o seu plano.</h2>
      <p class="mt-4 text-base text-slate-500 dark:text-slate-400 text-center">Comece grátis. Escale quando precisar.</p>

      <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Free -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div class="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-1">Avaliador</div>
          <div class="text-4xl font-bold text-slate-900 dark:text-white">Grátis</div>
          <div class="mt-6 space-y-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Até 5 projetos por mês</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Regressão Linear Básica</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Gráficos e relatórios simples</div>
          </div>
          <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">Criar Conta Gratuita</button>
        </div>

        <!-- Pro (elevated) -->
        <div class="bg-slate-900 dark:bg-slate-800 rounded-2xl p-8 border border-slate-900 shadow-2xl flex flex-col relative transform md:-translate-y-3">
          <div class="absolute -top-3 left-6 bg-blue-600 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full">Mais Escolhido</div>
          <div class="text-sm font-semibold text-blue-300 mb-1">Perito Pro</div>
          <div class="text-4xl font-bold text-white">R$&nbsp;49,90<span class="text-base font-normal text-slate-400">/mês</span></div>
          <div class="mt-6 space-y-3 flex-1 text-sm text-slate-300">
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Projetos ilimitados na nuvem</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Banco de Dados Compartilhado</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Exportação completa NBR 14.653</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Upload massivo via planilha XLS</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> IA para inventário de documentos</div>
          </div>
          <button onclick="window.openCoonAuthModal('register')" class="mt-8 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors text-sm shadow-lg shadow-blue-600/30">Assinar Plano Perito</button>
        </div>

        <!-- Enterprise -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col hover:shadow-md transition-shadow">
          <div class="text-sm font-semibold text-slate-400 dark:text-slate-500 mb-1">Imobiliárias</div>
          <div class="text-4xl font-bold text-slate-900 dark:text-white">Sob Consulta</div>
          <div class="mt-6 space-y-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Múltiplas contas com gestão central</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> API para integração de CRM</div>
            <div class="flex items-center gap-2"><div class="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Treinamento e Suporte VIP</div>
          </div>
          <a href="https://wa.me/5531999999999" target="_blank" class="mt-8 block text-center w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm">Falar com Vendas</a>
        </div>
      </div>
    </section>

    <!-- ============================================================ RULE -->
    <section class="w-full max-w-5xl mx-auto px-6 pt-28">
      <div class="regra-box grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">Nenhum dado sem origem.</h2>
          <p class="mt-4 text-base text-slate-500 dark:text-slate-400">É a regra do programa inteiro, escrita no código:</p>
          <ul class="mt-6 space-y-3 text-slate-700 dark:text-slate-300 text-sm">
            <li class="flex items-start gap-3"><div class="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-none"></div> Cada dado vem de um documento, do levantamento do avaliador ou do cálculo.</li>
            <li class="flex items-start gap-3"><div class="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-none"></div> O que falta sai marcado no laudo, com o caminho para conseguir.</li>
            <li class="flex items-start gap-3"><div class="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-none"></div> A IA sugere; nada muda sem a sua marcação.</li>
            <li class="flex items-start gap-3"><div class="mt-1.5 w-2 h-2 rounded-full bg-blue-600 flex-none"></div> Divergência entre documentos vai ao documento dono do dado.</li>
          </ul>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 text-sm shadow-sm">
          <div class="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 gap-4"><b class="text-slate-700 dark:text-slate-300 font-semibold">Matrícula</b><span class="text-slate-500 dark:text-slate-400 text-xs">Certidão_matricula.pdf, p.&nbsp;1<br><em>"Matrícula nº 33.744 — Livro 2"</em></span></div>
          <div class="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 gap-4"><b class="text-slate-700 dark:text-slate-300 font-semibold">Área documental</b><span class="text-slate-500 dark:text-slate-400 text-xs">Certidão_matricula.pdf, p.&nbsp;2<br><em>"com a área de 172,50 ha"</em></span></div>
          <div class="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 gap-4"><b class="text-slate-700 dark:text-slate-300 font-semibold">Coef. de servidão</b><span class="text-slate-500 dark:text-slate-400 text-xs">decisão técnica do signatário</span></div>
          <div class="flex justify-between py-3 gap-4"><b class="text-slate-700 dark:text-slate-300 font-semibold">ART</b><span class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 rounded">[preencher: emitir a ART no CREA]</span></div>
        </div>
      </div>
    </section>

    <!-- ============================================================ LAUDOS -->
    <section id="laudos" class="w-full max-w-5xl mx-auto px-6 pt-28">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">O laudo certo para cada trabalho.</h2>
      <p class="mt-4 text-base text-slate-500 dark:text-slate-400 max-w-xl">Do parecer simplificado ao laudo pericial com quesitos. 17 modelos, 20 estilos de apresentação.</p>
      <div class="mt-8 flex flex-wrap gap-2">
        <span class="pill text-slate-700 dark:text-slate-300">Particular — valor</span>
        <span class="pill text-slate-700 dark:text-slate-300">Particular — locação</span>
        <span class="pill text-slate-700 dark:text-slate-300">Extrajudicial — venda</span>
        <span class="pill text-slate-700 dark:text-slate-300">Extrajudicial — locação</span>
        <span class="pill text-slate-700 dark:text-slate-300">Bancário — garantia</span>
        <span class="pill text-slate-700 dark:text-slate-300">Rural — terra nua e benfeitorias</span>
        <span class="pill text-slate-700 dark:text-slate-300">Servidão — concessionária</span>
        <span class="pill text-slate-700 dark:text-slate-300">Judicial — valor</span>
        <span class="pill text-slate-700 dark:text-slate-300">Judicial — locação</span>
        <span class="pill text-slate-700 dark:text-slate-300">Judicial — servidão</span>
        <span class="pill text-slate-700 dark:text-slate-300">Desapropriação</span>
        <span class="pill text-slate-700 dark:text-slate-300">Inventário e partilha</span>
        <span class="pill text-slate-700 dark:text-slate-300">Parecer de assistente técnico</span>
        <span class="pill text-slate-700 dark:text-slate-300">Vistoria cautelar de vizinhança</span>
      </div>
    </section>

    <!-- ============================================================ FAQ -->
    <section id="perguntas" class="w-full max-w-5xl mx-auto px-6 pt-28">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight mb-8">Perguntas frequentes</h2>
      <div class="border-t border-slate-100 dark:border-slate-800">
        <details><summary>Preciso instalar alguma coisa?</summary><p>Não. O Coon Infer roda no navegador, com o mesmo login dos outros aplicativos Coon.</p></details>
        <details><summary>A IA escreve o laudo por mim?</summary><p>Não. Os cálculos são do programa, sempre iguais para os mesmos dados. A IA lê documentos, aponta problemas e responde dúvidas; o que ela sugere só entra quando você marca. O laudo sai na sua voz, com a sua assinatura.</p></details>
        <details><summary>Consigo levar meus dados de outro programa?</summary><p>Sim. Exporte as amostras para planilha (CSV) e importe na aba Amostras; o programa ajuda a ligar cada coluna à variável certa.</p></details>
        <details><summary>Onde ficam os meus projetos?</summary><p>Na nuvem do Coon, separados por conta. Documentos com CPF não são guardados; do inventário fica só o resultado da leitura, com a fonte.</p></details>
        <details><summary>Quais critérios da norma o programa usa?</summary><p>Os da ABNT NBR 14.653-2:2011 para fundamentação e precisão, e a NBR 14.653-3 para imóveis rurais.</p></details>
      </div>
    </section>

    <!-- ============================================================ CTA FINAL -->
    <section class="w-full max-w-5xl mx-auto px-6 py-32 text-center">
      <h2 class="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white tracking-tight">Menos planilha. Mais laudo.</h2>
      <p class="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto">Entre com a sua conta Coon e comece pelo primeiro projeto.</p>
      <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <button onclick="window.openCoonAuthModal('register')" class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all">Começar agora</button>
        <a href="/infer/app" class="px-8 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Acessar o sistema</a>
      </div>
    </section>

  </main>
"""

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(navbar + merged_landing + footer)

print("Merged infer landing page created successfully!")
