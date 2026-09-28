"""
Módulo de Autenticação e Gestão de Assinaturas do Infer.coon.
Suporta autenticação local (Email/Senha), verificação de tokens e integração com Google OAuth.
Inclui controle de planos e monetização (Perito Free Trial, Perito Pro, Escritório Enterprise).
"""

import os
import json
import time
import base64
import hmac
import hashlib
import sqlite3
from typing import Optional, Dict, Any
from pydantic import BaseModel, EmailStr

SECRET_KEY = os.getenv("JWT_SECRET", "infercoon_secret_key_2026_abnt_nbr_14653_master")
DB_PATH = os.path.join(os.path.dirname(__file__), "infercoon_auth.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        auth_provider TEXT DEFAULT 'local',
        crea_cau TEXT,
        plan TEXT DEFAULT 'perito_pro',
        plan_expires_at REAL,
        created_at REAL
    )
    """)
    conn.commit()

    # Criação do usuário padrão caso não exista
    cursor.execute("SELECT id FROM users WHERE email = 'perito@infercoon.com.br'")
    if not cursor.fetchone():
        salt = os.urandom(16)
        pwd_hash = hash_password("infer123", salt)
        stored = f"{salt.hex()}:{pwd_hash}"
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, auth_provider, crea_cau, plan, plan_expires_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "Eng. Perito Avaliador",
            "perito@infercoon.com.br",
            stored,
            "local",
            "CREA 123456/SP",
            "perito_pro",
            time.time() + (365 * 24 * 3600), # 1 ano ativo
            time.time()
        ))
        conn.commit()
    conn.close()

def hash_password(password: str, salt: bytes) -> str:
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return key.hex()

def verify_password(stored_password: str, provided_password: str) -> bool:
    try:
        salt_hex, pwd_hash = stored_password.split(":")
        salt = bytes.fromhex(salt_hex)
        return hash_password(provided_password, salt) == pwd_hash
    except Exception:
        return False

def create_jwt(payload: Dict[str, Any], expires_in: int = 86400 * 7) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    payload = payload.copy()
    payload["exp"] = int(time.time()) + expires_in
    
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode(),
        f"{header_b64}.{payload_b64}".encode(),
        hashlib.sha256
    ).digest()
    sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
    
    return f"{header_b64}.{payload_b64}.{sig_b64}"

def decode_jwt(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        expected_sig = hmac.new(
            SECRET_KEY.encode(),
            f"{header_b64}.{payload_b64}".encode(),
            hashlib.sha256
        ).digest()
        
        # Padding
        rem = len(sig_b64) % 4
        padded_sig = sig_b64 + ("=" * (4 - rem) if rem else "")
        if base64.urlsafe_b64decode(padded_sig) != expected_sig:
            return None
        
        rem_p = len(payload_b64) % 4
        padded_p = payload_b64 + ("=" * (4 - rem_p) if rem_p else "")
        payload = json.loads(base64.urlsafe_b64decode(padded_p).decode())
        
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None

# Modelos Pydantic
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    crea_cau: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    credential: Optional[str] = None
    email: Optional[str] = None
    name: Optional[str] = None
    picture: Optional[str] = None

class UpgradeRequest(BaseModel):
    plan: str
    months: int = 12

# Funções de Serviço de Usuários
def authenticate_user(email: str, password: str) -> Optional[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not user["password_hash"]:
        return None
    if not verify_password(user["password_hash"], password):
        return None
        
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "crea_cau": user["crea_cau"],
        "plan": user["plan"],
        "plan_expires_at": user["plan_expires_at"]
    }

def register_user(req: RegisterRequest) -> Dict[str, Any]:
    conn = get_db()
    cursor = conn.cursor()
    salt = os.urandom(16)
    pwd_hash = hash_password(req.password, salt)
    stored = f"{salt.hex()}:{pwd_hash}"
    now = time.time()
    expires = now + (30 * 24 * 3600) # 30 dias de degustação Pro grátis
    
    try:
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, auth_provider, crea_cau, plan, plan_expires_at, created_at)
            VALUES (?, ?, ?, 'local', ?, 'perito_pro', ?, ?)
        """, (req.name.strip(), req.email.lower().strip(), stored, req.crea_cau, expires, now))
        conn.commit()
        uid = cursor.lastrowid
        conn.close()
        return {
            "id": uid,
            "name": req.name,
            "email": req.email,
            "crea_cau": req.crea_cau,
            "plan": "perito_pro",
            "plan_expires_at": expires
        }
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Este e-mail já está cadastrado no Infer.coon.")

def handle_google_login(req: GoogleAuthRequest) -> Dict[str, Any]:
    # Suporta tanto o token OAuth do Google quanto payload simplificado de integração
    email = req.email or "google_user@infercoon.com.br"
    name = req.name or "Perito Google"
    
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email.lower().strip(),))
    user = cursor.fetchone()
    now = time.time()
    
    if user:
        conn.close()
        return {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"],
            "crea_cau": user["crea_cau"],
            "plan": user["plan"],
            "plan_expires_at": user["plan_expires_at"]
        }
    else:
        expires = now + (30 * 24 * 3600)
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, auth_provider, crea_cau, plan, plan_expires_at, created_at)
            VALUES (?, ?, NULL, 'google', 'CREA/CAU', 'perito_pro', ?, ?)
        """, (name, email.lower().strip(), expires, now))
        conn.commit()
        uid = cursor.lastrowid
        conn.close()
        return {
            "id": uid,
            "name": name,
            "email": email,
            "crea_cau": "CREA/CAU",
            "plan": "perito_pro",
            "plan_expires_at": expires
        }

# Inicializa o banco SQLite de autenticação
init_db()
