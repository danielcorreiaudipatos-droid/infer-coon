import re

with open("backend/main.py", "r", encoding="utf-8") as f:
    content = f.read()

# Change /onmail mapping to onmail_landing.html in subdomain handling
content = re.sub(
    r'elif h\.startswith\("onmail\."\) or h\.startswith\("mail\."\):\s+fpath = os\.path\.join\(FRONTEND_DIR, "onmail\.html"\)',
    'elif h.startswith("onmail.") or h.startswith("mail."):\n            fpath = os.path.join(FRONTEND_DIR, "onmail_landing.html")',
    content
)

# Change /mail mapping
content = re.sub(
    r'onmail_file = os\.path\.join\(FRONTEND_DIR, "onmail\.html"\)',
    'onmail_file = os.path.join(FRONTEND_DIR, "onmail_landing.html")',
    content
)

# Change @app.api_route("/onmail" ... return FileResponse(os.path.join(frontend_path, "onmail.html"))
content = re.sub(
    r'return FileResponse\(os\.path\.join\(frontend_path, "onmail\.html"\)\)',
    'return FileResponse(os.path.join(frontend_path, "onmail_landing.html"))',
    content
)

# Add /onmail/cx route below the existing serve_onmail function
new_route = '''
    @app.api_route("/onmail/cx", methods=["GET", "HEAD"], response_class=FileResponse)
    def serve_onmail_cx():
        return FileResponse(os.path.join(frontend_path, "onmail.html"))
'''

content = content.replace(
    'def serve_onmail():\n        return FileResponse(os.path.join(frontend_path, "onmail_landing.html"))',
    'def serve_onmail():\n        return FileResponse(os.path.join(frontend_path, "onmail_landing.html"))\n' + new_route
)

with open("backend/main.py", "w", encoding="utf-8") as f:
    f.write(content)

print("backend/main.py updated successfully!")
