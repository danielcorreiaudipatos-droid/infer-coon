import shutil, os, pathlib

# ── 1. Substituir TODA a pasta inferencia pela v1.1.0 (conforme instrucao do MUDANCAS.md)
src = pathlib.Path('scratch/infer-completo/inferencia')
dst = pathlib.Path('frontend/inferencia')

if dst.exists():
    shutil.rmtree(dst)
shutil.copytree(src, dst)
print(f"Replaced frontend/inferencia with v1.1.0 ({sum(1 for _ in dst.rglob('*'))} files)")

# ── 2. Garantir que o aviso do engenheiro existe no novo index.html
app_path = dst / 'web' / 'index.html'
app = app_path.read_text(encoding='utf-8')

aviso = '''<div id="avisoEngenheiro" style="position:fixed;bottom:0;left:0;right:0;background:#fef3c7;border-top:1px solid #fde68a;padding:8px 16px;font-size:12px;color:#92400e;display:flex;align-items:center;gap:8px;z-index:1000;cursor:pointer" onclick="this.style.display='none'" title="Clique para fechar">
  <svg style="width:14px;height:14px;flex:none;stroke:#d97706" fill="none" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9.5 16.5H2.5z"/></svg>
  <span><strong>Aviso técnico:</strong> Este sistema automatiza cálculos e gera documentos como ferramenta de apoio. O engenheiro ou perito responsável deve revisar todos os resultados antes de assinar e protocolar qualquer documento. O julgamento técnico e a responsabilidade são exclusivos do profissional habilitado.</span>
  <span style="margin-left:auto;font-weight:600;font-size:16px;opacity:.5;padding:0 4px">×</span>
</div>'''

if 'avisoEngenheiro' not in app:
    app = app.replace('</body>', aviso + '\n</body>')
    app_path.write_text(app, encoding='utf-8')
    print("Engineer disclaimer injected into v1.1.0 app!")
else:
    print("Disclaimer already present.")

# ── 3. Verificar arquivos-chave da v1.1.0 
key_files = [
    'motor/21-modelos-laudo.js',
    'motor/22-estilos-laudo.js',
    'motor/23-etapas.js',
    'motor/20-inventario.js',
    'servidor/duvidas-ia.mjs',
    'servidor/inventario-ia.mjs',
    'web/js/teste-botoes.js',
    'web/landing.html',
]
print("\nKey v1.1.0 files check:")
for f in key_files:
    exists = (dst / f).exists()
    print(f"  {'OK' if exists else 'MISSING'}: {f}")

print("\nAll done!")
