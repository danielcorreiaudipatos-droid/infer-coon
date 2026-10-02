FROM python:3.11-slim

WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY ads-backend/requirements.txt .

# Instalar Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY ads-backend/ .

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Variáveis de ambiente
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Expor porta
EXPOSE 8000

# Comando
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
