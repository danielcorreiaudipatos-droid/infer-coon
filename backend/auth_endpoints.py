"""
Endpoints FastAPI — Autenticação e Branding
Login, Cadastro, Recuperação de Senha
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, HTMLResponse
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
import os
import logging

from backend.auth_advanced import auth_system, branding_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["autenticacao"])
router_branding = APIRouter(prefix="/api/branding", tags=["branding"])
router_frontend = APIRouter(tags=["frontend"])

# ========== MODELOS PYDANTIC ==========

class RegistrarRequest(BaseModel):
    nome_completo: str
    email: EmailStr
    senha: str
    telefone: Optional[str] = None
    tipo_usuario: str = "imobiliario"

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class RecuperarSenhaRequest(BaseModel):
    email: EmailStr

class ResetarSenhaRequest(BaseModel):
    token: str
    nova_senha: str

class BrandingRequest(BaseModel):
    nome_imobiliaria: str
    cor_primaria: Optional[str] = None
    cor_secundaria: Optional[str] = None
    logo_url: Optional[str] = None
    tagline: Optional[str] = None

# ==============================================================================
# AUTENTICAÇÃO
# ==============================================================================

@router.post("/registrar")
async def registrar(request: RegistrarRequest):
    """
    Registra novo usuário no sistema.

    Args:
        nome_completo: Nome completo do usuário
        email: Email válido
        senha: Mínimo 8 caracteres
        telefone: Opcional
        tipo_usuario: imobiliario, proprietario ou inquilino

    Returns:
        {'sucesso': bool, 'usuario_id': int, 'msg': str}
    """
    try:
        resultado = auth_system.registrar_usuario(
            email=request.email,
            senha=request.senha,
            nome_completo=request.nome_completo,
            tipo_usuario=request.tipo_usuario
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro registrar: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login")
async def login(request: LoginRequest):
    """
    Faz login do usuário.

    Args:
        email: Email
        senha: Senha

    Returns:
        {'sucesso': bool, 'token': 'jwt', 'usuario': {...}}
    """
    try:
        resultado = auth_system.fazer_login(
            email=request.email,
            senha=request.senha
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=401, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erro login: {e}")
        raise HTTPException(status_code=500, detail="Erro ao fazer login")


@router.post("/recuperar-senha")
async def recuperar_senha(request: RecuperarSenhaRequest):
    """Envia email para recuperar senha."""
    try:
        resultado = auth_system.recuperar_senha(request.email)

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/resetar-senha")
async def resetar_senha(request: ResetarSenhaRequest):
    """Reseta senha usando token de recuperação."""
    try:
        resultado = auth_system.resetar_senha(
            token=request.token,
            nova_senha=request.nova_senha
        )

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/logout")
async def logout():
    """Faz logout do usuário."""
    return {
        'sucesso': True,
        'msg': 'Logout realizado com sucesso'
    }

# ==============================================================================
# BRANDING CUSTOMIZÁVEL
# ==============================================================================

@router_branding.post("/configurar/{escritorio_id}")
async def configurar_branding(escritorio_id: int, request: BrandingRequest):
    """
    Configura branding customizado para imobiliária.

    Args:
        escritorio_id: ID do escritório/imobiliária
        nome_imobiliaria: Nome da imobiliária
        cor_primaria: Cor primária (hex, ex: #667eea)
        cor_secundaria: Cor secundária (hex)
        logo_url: URL da logo
        tagline: Tagline/slogan

    Returns:
        {'sucesso': bool, 'config': {...}}
    """
    try:
        dados = request.dict(exclude_unset=True)
        resultado = branding_manager.criar_branding(escritorio_id, dados)

        if not resultado['sucesso']:
            raise HTTPException(status_code=400, detail=resultado.get('erro'))

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router_branding.get("/{escritorio_id}")
async def obter_branding(escritorio_id: int):
    """
    Retorna branding customizado de um escritório.

    Usado para carregar cores, logo e configurações na página de login.
    """
    try:
        resultado = branding_manager.obter_branding(escritorio_id)

        if not resultado['sucesso']:
            raise HTTPException(status_code=404, detail="Branding não encontrado")

        return resultado

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==============================================================================
# PÁGINAS DE FRONTEND
# ==============================================================================

@router_frontend.get("/login", response_class=HTMLResponse)
async def pagina_login():
    """Página de login com branding customizável."""
    frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    login_file = os.path.join(frontend_path, 'login.html')

    if os.path.exists(login_file):
        with open(login_file, 'r', encoding='utf-8') as f:
            return f.read()

    return "<h1>Página de login não encontrada</h1>"


@router_frontend.get("/cadastro", response_class=HTMLResponse)
async def pagina_cadastro():
    """Página de cadastro com multi-step form."""
    frontend_path = os.path.join(os.path.dirname(__file__), '..', 'frontend')
    cadastro_file = os.path.join(frontend_path, 'cadastro.html')

    if os.path.exists(cadastro_file):
        with open(cadastro_file, 'r', encoding='utf-8') as f:
            return f.read()

    return "<h1>Página de cadastro não encontrada</h1>"


@router_frontend.get("/recuperar-senha", response_class=HTMLResponse)
async def pagina_recuperar_senha():
    """Página de recuperação de senha."""
    html = """
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperar Senha — on.imob</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                width: 100%;
                max-width: 400px;
            }
            h1 { font-size: 24px; margin-bottom: 10px; }
            .subtitle { color: #999; margin-bottom: 30px; }
            input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 20px; }
            button { width: 100%; padding: 12px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; }
            a { color: #667eea; text-decoration: none; display: block; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Recuperar Senha</h1>
            <p class="subtitle">Digite seu email para receber um link de recuperação</p>

            <form onsubmit="recuperarSenha(event)">
                <input type="email" placeholder="seu@email.com" id="email" required>
                <button type="submit">Enviar Link</button>
            </form>

            <a href="/login">← Voltar ao login</a>
        </div>

        <script>
            async function recuperarSenha(e) {
                e.preventDefault();
                const email = document.getElementById('email').value;

                try {
                    const response = await fetch('/api/auth/recuperar-senha', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });

                    const data = await response.json();

                    if (data.sucesso) {
                        alert('Email enviado com sucesso! Verifique sua caixa de entrada.');
                        window.location.href = '/login';
                    }
                } catch (error) {
                    alert('Erro ao recuperar senha');
                }
            }
        </script>
    </body>
    </html>
    """
    return html
