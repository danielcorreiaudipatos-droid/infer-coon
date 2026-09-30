import os, re

# ── 1. Adicionar rota /inferencia no FastAPI (main.py) ──────────────────────
with open('backend/main.py', encoding='utf-8') as f:
    main = f.read()

infer_route = '''
    @app.api_route("/infer", methods=["GET", "HEAD"], response_class=FileResponse)
    def serve_infer_landing():
        return FileResponse(os.path.join(frontend_path, "infer_landing.html"))

    @app.api_route("/infer/app", methods=["GET", "HEAD"], response_class=FileResponse)
    def serve_infer_app():
        return FileResponse(os.path.join(frontend_path, "inferencia", "web", "index.html"))

    @app.api_route("/inferencia", methods=["GET", "HEAD"], response_class=FileResponse)
    def serve_inferencia():
        return FileResponse(os.path.join(frontend_path, "inferencia", "web", "index.html"))
'''

# Apenas adicionar se ainda não existir
if '/inferencia' not in main and 'serve_inferencia' not in main:
    # Inserir antes do bloco de rotas genéricas/catch-all
    main = main.replace(
        'def serve_infer_landing():',
        'def serve_infer_landing_redirect():\n        return FileResponse(os.path.join(frontend_path, "infer_landing.html"))\n' + infer_route
    )
    with open('backend/main.py', 'w', encoding='utf-8') as f:
        f.write(main)
    print("Routes added to main.py")
else:
    print("Routes already exist in main.py")

# ── 2. Copiar MEMORIA-GEMINI para docs/ ──────────────────────────────────────
import shutil, pathlib
pathlib.Path('docs').mkdir(exist_ok=True)
shutil.copy(r'C:\Users\Acer\Downloads\MEMORIA-GEMINI.md', 'docs/MEMORIA-GEMINI.md')
print("MEMORIA-GEMINI.md copied to docs/")

# ── 3. Salvar memória na raiz do projeto como README-INFER.md ─────────────── 
shutil.copy(r'C:\Users\Acer\Downloads\MEMORIA-GEMINI.md', 'README-INFER.md')
print("README-INFER.md saved at project root")

print("All done!")
