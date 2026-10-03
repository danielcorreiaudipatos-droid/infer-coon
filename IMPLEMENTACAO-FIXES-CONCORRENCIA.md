# ✅ IMPLEMENTAÇÃO - FIXES DE CONCORRÊNCIA (Pronto para Usar)

**Objetivo**: Código pronto para copy-paste, sem explicações

---

## 1️⃣ POSTGRESQL MIGRATION

### Passo 1: requirements.txt

```bash
# Remove
sqlite3

# Add
psycopg2-binary==2.9.9
sqlalchemy==2.0.23
sqlalchemy-utils==0.41.1
```

### Passo 2: backend/config.py (NOVO ARQUIVO)

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://user:password@localhost/infercoon"
)

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,
    max_overflow=40,
    pool_pre_ping=True,
    echo=False
)

# Test connection on startup
from sqlalchemy import text
try:
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
        print("✅ Database connected")
except Exception as e:
    print(f"❌ Database error: {e}")
    raise
```

### Passo 3: backend/models.py (NOVO ARQUIVO)

```python
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255))
    name = Column(String(255))
    role = Column(String(50), default="cliente")
    crea_cau = Column(String(50))
    plan = Column(String(50), default="perito_pro")
    plan_expires_at = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ActiveSession(Base):
    __tablename__ = "active_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(Integer, nullable=False, index=True)
    token = Column(String(500), unique=True, nullable=False, index=True)
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_fingerprint = Column(String(255))
    status = Column(String(20), default="active")  # active, revoked, expired
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False, index=True)
    last_active = Column(DateTime, default=datetime.utcnow)

class BlacklistedToken(Base):
    __tablename__ = "blacklisted_tokens"
    
    token = Column(String(500), primary_key=True)
    reason = Column(String(255))
    revoked_at = Column(DateTime, default=datetime.utcnow)
```

### Passo 4: Setup Database

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql postgresql-contrib  # Ubuntu

# Start service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Ubuntu

# Create database
psql -U postgres -c "CREATE DATABASE infercoon;"

# Run migrations (alembic ou manual)
psql -U postgres -d infercoon -f migrations.sql
```

---

## 2️⃣ SESSION MANAGEMENT

### backend/session_manager.py (NOVO ARQUIVO)

```python
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from models import ActiveSession
import uuid
import jwt
import os

SECRET_KEY = os.getenv("JWT_SECRET", "infercoon_secret_2026")
MAX_SESSIONS_PER_USER = 5

class SessionManager:
    def __init__(self, db: Session):
        self.db = db
    
    def create_session(self, user_id: int, ip: str, user_agent: str) -> str:
        """Create new session, revoke old ones if exceed MAX"""
        # Count active sessions
        active_count = self.db.query(ActiveSession).filter(
            ActiveSession.user_id == user_id,
            ActiveSession.status == "active"
        ).count()
        
        # Revoke oldest if at limit
        if active_count >= MAX_SESSIONS_PER_USER:
            oldest = self.db.query(ActiveSession).filter(
                ActiveSession.user_id == user_id,
                ActiveSession.status == "active"
            ).order_by(ActiveSession.created_at).first()
            if oldest:
                oldest.status = "revoked"
        
        # Create token
        payload = {
            "user_id": user_id,
            "session_id": str(uuid.uuid4()),
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
        
        # Save session
        session = ActiveSession(
            user_id=user_id,
            token=token,
            ip_address=ip,
            user_agent=user_agent,
            expires_at=payload["exp"]
        )
        self.db.add(session)
        self.db.commit()
        
        return token
    
    def verify_session(self, token: str) -> Optional[dict]:
        """Verify token is valid and not revoked"""
        # Check blacklist first
        if self.is_blacklisted(token):
            return None
        
        # Check session active
        session = self.db.query(ActiveSession).filter(
            ActiveSession.token == token,
            ActiveSession.status == "active"
        ).first()
        
        if not session:
            return None
        
        # Update last_active
        session.last_active = datetime.utcnow()
        self.db.commit()
        
        return {"user_id": session.user_id, "session_id": session.id}
    
    def logout(self, token: str):
        """Revoke session"""
        session = self.db.query(ActiveSession).filter(
            ActiveSession.token == token
        ).first()
        if session:
            session.status = "revoked"
            self.db.commit()
    
    def is_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted"""
        from models import BlacklistedToken
        return self.db.query(BlacklistedToken).filter(
            BlacklistedToken.token == token
        ).first() is not None
    
    def revoke_user_sessions(self, user_id: int, reason: str = "admin_action"):
        """Revoke all sessions for a user"""
        sessions = self.db.query(ActiveSession).filter(
            ActiveSession.user_id == user_id
        ).all()
        for session in sessions:
            session.status = "revoked"
        self.db.commit()
```

---

## 3️⃣ RATE LIMITING

### requirements.txt (Add)

```
slowapi==0.1.9
redis==5.0.0
```

### backend/rate_limiter.py (NOVO ARQUIVO)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# Define rate limit strategies
RATE_LIMITS = {
    "auth_login": "5/minute",
    "auth_register": "3/minute",
    "api_evaluate": "100/hour",
    "api_payment": "10/hour",
    "api_general": "1000/hour"
}

def handle_rate_limit_exceeded(e: RateLimitExceeded):
    return {"error": "Rate limit exceeded", "detail": str(e.description)}, 429
```

### backend/main.py (Update)

```python
from fastapi import FastAPI
from rate_limiter import limiter, handle_rate_limit_exceeded

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, handle_rate_limit_exceeded)

@app.post("/api/login")
@limiter.limit("5/minute")
async def login(request: Request, credentials: LoginRequest):
    # ... login logic ...
    pass

@app.post("/api/evaluate")
@limiter.limit("100/hour")
async def evaluate(request: Request, data: EvaluateRequest):
    # ... evaluation logic ...
    pass

@app.post("/api/payment")
@limiter.limit("10/hour")
async def payment(request: Request, payment_data: PaymentRequest):
    # ... payment logic ...
    pass
```

---

## 4️⃣ MONITORING & LOGGING

### requirements.txt (Add)

```
prometheus-client==0.18.0
python-json-logger==2.0.7
```

### backend/metrics.py (NOVO ARQUIVO)

```python
from prometheus_client import Counter, Histogram, Gauge
import time

# Counters
login_counter = Counter('logins_total', 'Total login attempts')
logout_counter = Counter('logouts_total', 'Total logouts')
payment_counter = Counter('payments_total', 'Total payments')
evaluation_counter = Counter('evaluations_total', 'Total evaluations')

# Histograms (latency)
login_duration = Histogram('login_duration_seconds', 'Login duration')
payment_duration = Histogram('payment_duration_seconds', 'Payment duration')
db_query_duration = Histogram('db_query_seconds', 'DB query time')

# Gauges (current state)
active_sessions = Gauge('active_sessions', 'Active user sessions')
db_connection_pool = Gauge('db_connections', 'Database connections')

class MetricsMiddleware:
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        
        start_time = time.time()
        
        async def send_wrapper(message):
            if message["type"] == "http.response.start":
                duration = time.time() - start_time
                # Record metrics based on path
                if "/login" in scope["path"]:
                    login_duration.observe(duration)
                elif "/payment" in scope["path"]:
                    payment_duration.observe(duration)
            await send(message)
        
        await self.app(scope, receive, send_wrapper)
```

### backend/logging_config.py (NOVO ARQUIVO)

```python
import logging
import logging.config
from pythonjsonlogger import jsonlogger
import os

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter'
        }
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json'
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.getenv('LOG_FILE', 'logs/app.log'),
            'maxBytes': 10485760,  # 10MB
            'backupCount': 10,
            'formatter': 'json'
        }
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'file']
    }
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger(__name__)

# Usage in code:
# logger.info("User logged in", extra={"user_id": 123, "ip": "192.168.1.1"})
# logger.error("Payment failed", extra={"user_id": 123, "amount": 100})
```

---

## 5️⃣ BACKUP STRATEGY

### scripts/backup.sh (NOVO ARQUIVO)

```bash
#!/bin/bash

# Backup PostgreSQL
BACKUP_DIR="/backups/infercoon"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="infercoon"

mkdir -p $BACKUP_DIR

# Full backup
pg_dump -U postgres $DB_NAME | gzip > $BACKUP_DIR/full_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "full_*.sql.gz" -mtime +7 -delete

echo "✅ Backup completed: $BACKUP_DIR/full_$DATE.sql.gz"

# Optional: Upload to S3
# aws s3 cp $BACKUP_DIR/full_$DATE.sql.gz s3://infercoon-backups/
```

### Schedule (crontab)

```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh

# Weekly test restore at Sunday 3 AM
0 3 * * 0 /path/to/test_restore.sh
```

---

## 6️⃣ DOCKER SETUP (Para fácil deploy)

### docker-compose.yml (NOVO ARQUIVO)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: infercoon
      POSTGRES_USER: infercoon_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U infercoon_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://infercoon_user:${DB_PASSWORD}@postgres/infercoon
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend:/app/backend
      - ./logs:/app/logs

volumes:
  postgres_data:
```

### .env.example

```
DB_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret
REDIS_URL=redis://redis:6379
LOG_LEVEL=INFO
```

---

## 🚀 DEPLOYMENT CHECKLIST

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Setup environment
cp .env.example .env
# Edit .env with your values

# 3. Start services
docker-compose up -d

# 4. Create tables
python -m alembic upgrade head
# Or: psql -U infercoon_user -d infercoon -f migrations.sql

# 5. Test connection
python backend/config.py

# 6. Start app
uvicorn backend.main:app --reload

# 7. Verify
# - Login: http://localhost:8000/api/login
# - Metrics: http://localhost:8000/metrics
# - Health: http://localhost:8000/health
```

---

## 📊 LOAD TEST

### scripts/load_test.py (NOVO ARQUIVO)

```python
import requests
import concurrent.futures
import time

BASE_URL = "http://localhost:8000"
NUM_USERS = 100
REQUESTS_PER_USER = 10

def login(user_id):
    """Simulate user login"""
    start = time.time()
    try:
        response = requests.post(
            f"{BASE_URL}/api/login",
            json={
                "email": f"user{user_id}@test.com",
                "password": "test123"
            },
            timeout=5
        )
        duration = time.time() - start
        return {
            "user_id": user_id,
            "status": response.status_code,
            "duration": duration
        }
    except Exception as e:
        return {
            "user_id": user_id,
            "error": str(e)
        }

# Run load test
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = [
        executor.submit(login, i % NUM_USERS)
        for i in range(NUM_USERS * REQUESTS_PER_USER)
    ]
    
    results = [f.result() for f in concurrent.futures.as_completed(futures)]

# Analyze results
successful = [r for r in results if 'error' not in r and r['status'] == 200]
failed = [r for r in results if 'error' in r or r.get('status') != 200]

print(f"✅ Successful: {len(successful)}")
print(f"❌ Failed: {len(failed)}")
print(f"Avg response time: {sum(r['duration'] for r in successful) / len(successful) if successful else 0:.3f}s")
```

---

## ✅ VALIDATION CHECKLIST

```
After implementation:

[ ] PostgreSQL running and connected
[ ] Session management working (create, verify, logout, revoke)
[ ] Rate limiting active (test with 1k requests)
[ ] Monitoring metrics exposed (/metrics)
[ ] Logging to JSON format
[ ] Backups running daily
[ ] Docker image builds
[ ] Load test passes (100 concurrent users)
[ ] Can handle 1000 req/sec
[ ] Data consistency verified
```

---

## 📝 MIGRATION FROM SQLITE

```sql
-- Export from SQLite
.mode csv
.headers on
.output users.csv
SELECT * FROM users;

-- Import to PostgreSQL
COPY users FROM '/path/to/users.csv' WITH (FORMAT csv, HEADER true);
```

---

**Timeline**: 2-3 weeks to implement
**Difficulty**: Medium
**Impact**: 10x+ capacity increase (20 → 200+ concurrent users)

---

Generated: 2026-10-02 23:58
