FROM python:3.11-slim

WORKDIR /app

# Instala dependências de compilação mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 8000

ENV PORT=8000
CMD uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}
