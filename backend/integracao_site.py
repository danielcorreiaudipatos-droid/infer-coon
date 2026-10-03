"""Integração com site externo — publicar imóveis do on.imob em um portal/vitrine."""

import os
import sqlite3
import time
import json
from typing import Optional, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "integracao_site.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS config_site (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url_site TEXT NOT NULL,
        api_key TEXT NOT NULL,
        ativo INTEGER DEFAULT 1,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS publicacoes_imovel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imovel_id INTEGER NOT NULL,
        url_site_publicado TEXT,
        status TEXT DEFAULT 'rascunho',
        publicado_em REAL,
        UNIQUE(imovel_id)
    )
    """)

    conn.commit()
    conn.close()


def salvar_config_site(url_site: str, api_key: str) -> Dict[str, Any]:
    """Salva ou atualiza configuração do site externo."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM config_site")
    cur.execute(
        "INSERT INTO config_site (url_site, api_key, ativo, criado_em) VALUES (?, ?, 1, ?)",
        (url_site, api_key, time.time())
    )
    conn.commit()
    conn.close()
    return {"url_site": url_site, "api_key": api_key, "msg": "Configuração salva."}


def obter_config_site() -> Optional[Dict[str, Any]]:
    """Retorna configuração do site se existir."""
    conn = get_db()
    row = conn.execute("SELECT * FROM config_site LIMIT 1").fetchone()
    conn.close()
    if row:
        return {
            "url_site": row["url_site"],
            "api_key": row["api_key"],
            "ativo": row["ativo"]
        }
    return None


async def publicar_imovel(imovel: Dict[str, Any], fotos_urls: list, videos_urls: list) -> Dict[str, Any]:
    """Envia imóvel (dados + mídia) pro site externo via API."""
    import httpx

    config = obter_config_site()
    if not config or not config.get("ativo"):
        raise ValueError("Integração com site não está configurada.")

    payload = {
        "titulo": imovel.get("titulo"),
        "tipo": imovel.get("tipo"),
        "finalidade": imovel.get("finalidade"),
        "endereco": ", ".join(x for x in [
            imovel.get("rua"), imovel.get("numero"), imovel.get("complemento"),
            imovel.get("bairro"), imovel.get("cidade"), imovel.get("uf"),
        ] if x),
        "area_construida": imovel.get("area_construida_m2"),
        "area_terreno": imovel.get("area_terreno_m2"),
        "quartos": imovel.get("quartos"),
        "valor": imovel.get("valor"),
        "fotos": fotos_urls,
        "videos": videos_urls,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.post(
                f"{config['url_site']}/api/imoveis",
                json=payload,
                headers={"Authorization": f"Bearer {config['api_key']}"}
            )
            if r.status_code in (200, 201):
                resultado = r.json()
                registrar_publicacao(imovel["id"], resultado.get("url"), "publicado")
                return {"msg": "Imóvel publicado com sucesso!", "url": resultado.get("url")}
            else:
                return {"erro": f"Site respondeu com {r.status_code}: {r.text}"}
    except Exception as e:
        return {"erro": f"Erro ao conectar com site: {str(e)}"}


def registrar_publicacao(imovel_id: int, url_site: Optional[str], status: str):
    """Registra que o imóvel foi publicado."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO publicacoes_imovel (imovel_id, url_site_publicado, status, publicado_em) VALUES (?, ?, ?, ?)",
        (imovel_id, url_site, status, time.time() if status == "publicado" else None)
    )
    conn.commit()
    conn.close()


def obter_publicacao(imovel_id: int) -> Optional[Dict[str, Any]]:
    """Retorna status de publicação de um imóvel."""
    conn = get_db()
    row = conn.execute("SELECT * FROM publicacoes_imovel WHERE imovel_id = ?", (imovel_id,)).fetchone()
    conn.close()
    if row:
        return {
            "imovel_id": row["imovel_id"],
            "url_site": row["url_site_publicado"],
            "status": row["status"],
            "publicado_em": row["publicado_em"]
        }
    return None


init_db()
