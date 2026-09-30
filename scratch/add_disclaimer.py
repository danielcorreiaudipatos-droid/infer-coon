import re

# ── 1. Atualizar preço para R$79,90 na landing do Infer ───────────────────
with open('frontend/infer_landing.html', encoding='utf-8') as f:
    landing = f.read()

landing = landing.replace('R$&nbsp;49,90', 'R$&nbsp;79,90')
landing = landing.replace('R$ 49,90', 'R$ 79,90')

# ── 2. Adicionar aviso do engenheiro na seção de features (antes do FAQ) ──
aviso_html = """
    <!-- ============================================================ DISCLAIMER ENGENHEIRO -->
    <section class="w-full max-w-5xl mx-auto px-6 pt-16">
      <div class="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-2xl p-8 flex gap-5 items-start">
        <div class="flex-none mt-1">
          <svg class="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
          </svg>
        </div>
        <div class="flex-1">
          <h4 class="font-semibold text-amber-900 dark:text-amber-200 text-base mb-2">Responsabilidade Técnica do Engenheiro Avaliador</h4>
          <p class="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            O Coon Infer é uma ferramenta de apoio técnico. Todo processo automatizado — cálculo, geração de laudo, leitura de documentos por IA e exportação de arquivos — <strong>pode conter erros</strong>. O engenheiro ou perito responsável pela assinatura deve revisar criteriosamente todos os resultados antes de entregar ou protocolar qualquer documento. A decisão de revisar, corrigir ou validar o laudo é exclusiva do profissional habilitado, que responde técnica e legalmente pelo conteúdo.
          </p>
          <p class="mt-3 text-xs text-amber-600 dark:text-amber-400 font-medium">
            O Coon Infer não substitui o julgamento técnico do avaliador — ele amplifica a sua capacidade de trabalho.
          </p>
        </div>
      </div>
    </section>
"""

# Inserir antes do FAQ
landing = landing.replace(
    '    <!-- ============================================================ FAQ -->',
    aviso_html + '\n    <!-- ============================================================ FAQ -->'
)

with open('frontend/infer_landing.html', 'w', encoding='utf-8') as f:
    f.write(landing)

print("Price updated to R$79,90 and engineer disclaimer added!")

# ── 3. Adicionar aviso também na tela do app (index.html do inferencia) ────
with open('frontend/inferencia/web/index.html', encoding='utf-8') as f:
    app = f.read()

# Adicionar aviso discreto no header do app, após o título do projeto
aviso_app = """<div id="avisoEngenheiro" style="position:fixed;bottom:0;left:0;right:0;background:#fef3c7;border-top:1px solid #fde68a;padding:8px 16px;font-size:12px;color:#92400e;display:flex;align-items:center;gap:8px;z-index:100;cursor:pointer" onclick="this.style.display='none'" title="Clique para fechar">
  <svg style="width:14px;height:14px;flex:none;stroke:#d97706" fill="none" stroke-width="2" viewBox="0 0 24 24"><path d="M12 9v3.75m0 3.75h.008M12 3l9.5 16.5H2.5z"/></svg>
  <span><strong>Aviso técnico:</strong> Este sistema automatiza cálculos e gera documentos como ferramenta de apoio. O engenheiro responsável deve revisar todos os resultados antes de assinar e protocolar. O julgamento técnico e a responsabilidade são exclusivos do profissional habilitado.</span>
  <span style="margin-left:auto;font-weight:600;font-size:14px;opacity:.5">×</span>
</div>"""

if 'avisoEngenheiro' not in app:
    app = app.replace('</body>', aviso_app + '\n</body>')
    with open('frontend/inferencia/web/index.html', 'w', encoding='utf-8') as f:
        f.write(app)
    print("Engineer disclaimer added to app!")
else:
    print("Disclaimer already in app.")
