import re
import os
import sys

files_to_update = [
    'backend/bot_engine.py',
    'backend/main.py',
    'backend/csuite/orchestrator.py',
    'backend/csuite/claude_advisor.py',
    'backend/csuite/personas.py',
    'backend/integrations_hub.py',
    'backend/csuite/weekly_briefings.py',
    'backend/falecom.py',
    'backend/test_wave1_and_vp_auth.py',
    'backend/wave2_engine.py',
    'backend/financial.py',
    'backend/ai_router.py',
    'backend/security_guard.py',
    'backend/csuite/innovation_engine.py',
    'frontend/ad.html',
    'frontend/check.html',
    'frontend/cob.html',
    'frontend/growth.html',
    'frontend/imob.html',
]

def replace_in_text(text):
    # Co.on -> Coon
    # CO.ON -> COON
    # co.on -> coon
    # Also handle markdown like **Co.on**
    new_text = text.replace('CO.ON', 'COON')
    new_text = new_text.replace('Co.on', 'Coon')
    new_text = new_text.replace('co.on', 'coon')
    return new_text

for fpath in files_to_update:
    if os.path.exists(fpath):
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
        updated = replace_in_text(content)
        if updated != content:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(updated)
            print(f"Updated: {fpath}")
        else:
            print(f"No changes in: {fpath}")
