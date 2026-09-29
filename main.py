"""
Infer.coon - Root Entrypoint for Render and PaaS hosting.
Imports FastAPI app from backend.main for 100% compatibility with Render startCommand.
"""

from backend.main import app

if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
