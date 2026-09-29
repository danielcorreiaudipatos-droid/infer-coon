import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

domains = [
    'coon.com.br',
    'coonimob.com.br',
    'infercoon.com.br',
    'cooncob.com.br',
    'coonad.com.br',
    'coongrowth.com.br',
    'cooncheck.com.br'
]

print("=== CONSULTA OFICIAL REGISTRO.BR (PORTFOLIO COON) ===")
for dom in domains:
    url = f"https://registro.br/v2/ajax/avail/raw/{dom}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            status = data.get('status')
            if status == 0:
                print(f"✅ {dom:20} -> LIVRE / DISPONÍVEL (R$ 40/ano no Registro.br)")
            elif status == 2 or status == 1:
                exp = data.get('expires-at', '')
                print(f"🔒 {dom:20} -> REGISTRADO / ATIVO (Expira em: {exp})")
            else:
                print(f"ℹ️ {dom:20} -> Status {status}")
    except Exception as e:
        print(f"❌ {dom}: {e}")
