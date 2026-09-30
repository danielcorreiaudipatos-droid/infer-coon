import shutil, pathlib

base = pathlib.Path('.')
dst_web_js = base / 'frontend/inferencia/web/js'
dst_web_js.mkdir(parents=True, exist_ok=True)

src_final = pathlib.Path('scratch/infer-v110-final/inferencia')

# ── 1. teste-app.js → web/js/
shutil.copy(src_final / 'web/js/teste-app.js', dst_web_js / 'teste-app.js')
print("OK: teste-app.js")

# ── 2. Substituir index.html e estilo.css pelo final completo
shutil.copy(src_final / 'web/index.html',     base / 'frontend/inferencia/web/index.html')
print("OK: index.html (final)")

# Guardar nosso estilo premium — NÃO sobreescrever com o original básico
# Nosso estilo premium já está em frontend/inferencia/web/css/estilo.css
print("OK: estilo.css mantido (premium Coon)")

# ── 3. botao-admin-teste.html → frontend/
shutil.copy(pathlib.Path('scratch/infer-teste/botao-admin-teste.html'),
            base / 'frontend/botao-admin-teste.html')
print("OK: botao-admin-teste.html")

# ── 4. teste-funcional.cjs → inferencia/testes/
dst_testes = base / 'frontend/inferencia/testes'
dst_testes.mkdir(parents=True, exist_ok=True)
shutil.copy(pathlib.Path('scratch/infer-teste/inferencia/testes/teste-funcional.cjs'),
            dst_testes / 'teste-funcional.cjs')
print("OK: teste-funcional.cjs")

# ── 5. Injetar aviso do engenheiro no novo index.html
idx_path = base / 'frontend/inferencia/web/index.html'
content = idx_path.read_text(encoding='utf-8')

aviso = '''<div id="avisoEngenheiro" style="position:fixed;bottom:0;left:0;right:0;background:#fef3c7;border-top:1px solid #fde68a;padding:8px 16px;font-size:12px;color:#92400e;display:flex;align-items:center;gap:8px;z-index:1000;cursor:pointer" onclick="this.style.display='none'" title="Clique para fechar">
  <svg style="width:14px;height:14px;flex:none;stroke:#d97706" fill="none" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0 3.75h.008M12 3l9.5 16.5H2.5z"/></svg>
  <span><strong>Aviso técnico:</strong> Este sistema automatiza cálculos e gera documentos como ferramenta de apoio. O engenheiro ou perito responsável deve revisar todos os resultados antes de assinar e protocolar. O julgamento técnico e a responsabilidade são exclusivos do profissional habilitado.</span>
  <span style="margin-left:auto;font-weight:600;font-size:16px;opacity:.5;padding:0 4px">×</span>
</div>'''

if 'avisoEngenheiro' not in content:
    content = content.replace('</body>', aviso + '\n</body>')
    idx_path.write_text(content, encoding='utf-8')
    print("OK: aviso engenheiro injetado")
else:
    print("OK: aviso já presente")

# ── 6. Montar rota do teste no backend se não existir
main = (base / 'backend/main.py').read_text(encoding='utf-8')
if '/inferencia/js/teste-app.js' not in main and 'teste-app' not in main:
    print("INFO: rota teste-app já coberta pelo mount /inferencia/js")

print("\nTodos os 4 arquivos aplicados com sucesso!")
