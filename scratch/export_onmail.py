import zipfile, os, shutil

output = r'C:\Users\Acer\Downloads\coon-onmail-completo.zip'
base = r'c:\Users\Acer\Documents\infer-coon'

with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zf:

    # Frontend
    for name in ['onmail_landing.html', 'onmail.html']:
        path = os.path.join(base, 'frontend', name)
        if os.path.exists(path):
            zf.write(path, f'frontend/{name}')
            print(f'+ frontend/{name}')

    # Backend engine
    engine = os.path.join(base, 'backend', 'onmail_engine.py')
    if os.path.exists(engine):
        zf.write(engine, 'backend/onmail_engine.py')
        print('+ backend/onmail_engine.py')

    # Trecho do main.py com as rotas do OnMail
    main_path = os.path.join(base, 'backend', 'main.py')
    with open(main_path, encoding='utf-8') as f:
        lines = f.readlines()

    # Extrair linhas relevantes do onmail
    onmail_lines = []
    for i, line in enumerate(lines):
        if 'onmail' in line.lower():
            start = max(0, i-1)
            end = min(len(lines), i+2)
            onmail_lines.append(f'# linha {i+1}:\n')
            onmail_lines.extend(lines[start:end])
            onmail_lines.append('\n')

    rotas_txt = ''.join(onmail_lines)
    zf.writestr('backend/rotas-onmail-extraidas.py', rotas_txt)
    print('+ backend/rotas-onmail-extraidas.py')

    # README
    readme = """# COON OnMail — Pacote Completo

## Arquivos

### frontend/onmail_landing.html
Landing page de vendas do OnMail.
Rota: GET /onmail

### frontend/onmail.html
App de caixa de entrada (inbox).
Rota: GET /onmail/cx

### backend/onmail_engine.py
Motor do OnMail: planos, simulacao, registro, disponibilidade, metricas admin.

### backend/rotas-onmail-extraidas.py
Linhas do main.py relacionadas ao OnMail (referencia).

## Rotas da API

| Metodo | Rota                              | Funcao                          |
|--------|-----------------------------------|---------------------------------|
| GET    | /onmail                           | Landing page                    |
| GET    | /onmail/cx                        | App inbox                       |
| GET    | /api/onmail/plans                 | Planos e precos                 |
| POST   | /api/onmail/simulate              | Simula fluxo de e-mail          |
| POST   | /api/onmail/send                  | Envio real                      |
| POST   | /api/onmail/register              | Cadastro de conta               |
| GET    | /api/onmail/check-availability    | Verifica @onmail.br disponivel  |
| GET    | /api/onmail/accounts              | Lista contas                    |
| POST   | /api/onmail/webhook               | Recebe webhooks externos        |
| GET    | /api/admin/onmail/metrics         | Metricas para cockpit admin     |

## Subdominio
onmail.coon.com.br ou mail.coon.com.br -> onmail_landing.html
"""
    zf.writestr('README.md', readme)
    print('+ README.md')

print(f'\nZIP criado em: {output}')
print(f'Tamanho: {os.path.getsize(output) / 1024:.1f} KB')
