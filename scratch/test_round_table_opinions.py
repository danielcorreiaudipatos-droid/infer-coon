import json
import urllib.request
import sys

sys.stdout.reconfigure(encoding='utf-8')

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/admin/csuite/chat',
    data=json.dumps({
        'message': 'Prezada Diretoria, nossa holding agora é Co.on Participações Ltda., com o Dr. Gabriel em P&D e o Prof. Claude em segunda opinião. Começamos amanhã nossas reuniões semanais de produção. Quero a opinião de todos os diretores na sala do conselho!',
        'session_id': 'executive_board_main'
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'X-Coon-Master-Key': 'coon2026master'}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))

turns = res.get('turns', [])
print(f"Total de intervenções registradas em ata: {len(turns)}\n")
for r in turns:
    print(f"🏛️ [{r['speaker_role']}] {r['speaker_name']}")
    print(f"{r['message']}\n{'-'*60}\n")
