"""
Módulo 1 do Onimob — Cadastro: imóveis, proprietários, inquilinos e corretores.
Mesmo padrão de banco (SQLite) usado em auth.py, ai_router.py e bot_engine.py.
Este módulo é só a base de dados; o Split Pix de verdade (Módulo 3) referencia
estes registros, mas não é calculado aqui.
"""

import os
import sqlite3
import time
import re
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator

DB_PATH = os.path.join(os.path.dirname(__file__), "imob_cadastro.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.execute("PRAGMA foreign_keys=ON;")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_corretores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        creci TEXT,
        telefone TEXT,
        email TEXT,
        imobiliaria TEXT,
        ativo INTEGER DEFAULT 1,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_proprietarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT,
        telefone TEXT,
        email TEXT,
        chave_pix TEXT,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_inquilinos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT,
        telefone TEXT,
        email TEXT,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_fiadores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf_cnpj TEXT,
        telefone TEXT,
        email TEXT,
        cep TEXT,
        rua TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        uf TEXT,
        criado_em REAL
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_imoveis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        tipo TEXT NOT NULL,
        finalidade TEXT NOT NULL,
        cep TEXT,
        rua TEXT,
        numero TEXT,
        complemento TEXT,
        bairro TEXT,
        cidade TEXT,
        uf TEXT,
        area_terreno_m2 REAL,
        area_construida_m2 REAL,
        quartos INTEGER,
        valor REAL,
        status TEXT DEFAULT 'disponivel',
        proprietario_id INTEGER,
        corretor_id INTEGER,
        inquilino_id INTEGER,
        fiador_id INTEGER,
        criado_em REAL,
        FOREIGN KEY (proprietario_id) REFERENCES imob_proprietarios(id),
        FOREIGN KEY (corretor_id) REFERENCES imob_corretores(id),
        FOREIGN KEY (inquilino_id) REFERENCES imob_inquilinos(id),
        FOREIGN KEY (fiador_id) REFERENCES imob_fiadores(id)
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS imob_documentos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entidade_tipo TEXT NOT NULL,
        entidade_id INTEGER NOT NULL,
        tipo_documento TEXT NOT NULL,
        nome_original TEXT NOT NULL,
        nome_arquivo TEXT NOT NULL,
        tamanho_bytes INTEGER,
        status TEXT DEFAULT 'pendente',
        motivo_rejeicao TEXT,
        aceite_termos_em REAL,
        enviado_em REAL,
        revisado_em REAL
    )
    """)

    conn.commit()
    conn.close()


# ── Módulo 2: Documentação ───────────────────────────────────────────────────

ENTIDADES_DOC = {"imovel", "proprietario", "inquilino", "corretor", "fiador"}
TIPOS_DOCUMENTO = {"rg_cpf", "comprovante_residencia", "contrato", "matricula_imovel", "iptu", "outro"}
STATUS_DOCUMENTO = {"pendente", "aprovado", "rejeitado"}
EXTENSOES_PERMITIDAS = {".pdf", ".jpg", ".jpeg", ".png"}
TAMANHO_MAX_BYTES = 15 * 1024 * 1024  # 15 MB

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads", "onimob_documentos")


def _tabela_entidade(entidade_tipo: str) -> str:
    return {
        "imovel": "imob_imoveis",
        "proprietario": "imob_proprietarios",
        "inquilino": "imob_inquilinos",
        "corretor": "imob_corretores",
        "fiador": "imob_fiadores",
    }[entidade_tipo]


def registrar_documento(entidade_tipo: str, entidade_id: int, tipo_documento: str,
                         nome_original: str, nome_arquivo: str, tamanho_bytes: int,
                         aceite_termos: bool = False) -> Dict[str, Any]:
    if entidade_tipo not in ENTIDADES_DOC:
        raise ValueError(f"entidade_tipo precisa ser um de: {', '.join(sorted(ENTIDADES_DOC))}")
    if tipo_documento not in TIPOS_DOCUMENTO:
        raise ValueError(f"tipo_documento precisa ser um de: {', '.join(sorted(TIPOS_DOCUMENTO))}")
    if not aceite_termos:
        raise ValueError("É preciso aceitar os Termos de Uso e a Política de Privacidade para enviar o documento.")

    conn = get_db()
    _valida_fk(conn, _tabela_entidade(entidade_tipo), entidade_id, entidade_tipo.capitalize())
    cur = conn.cursor()
    agora = time.time()
    cur.execute(
        """INSERT INTO imob_documentos
           (entidade_tipo, entidade_id, tipo_documento, nome_original, nome_arquivo, tamanho_bytes, status, aceite_termos_em, enviado_em)
           VALUES (?, ?, ?, ?, ?, ?, 'pendente', ?, ?)""",
        (entidade_tipo, entidade_id, tipo_documento, nome_original, nome_arquivo, tamanho_bytes, agora, agora),
    )
    conn.commit()
    did = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_documentos WHERE id = ?", (did,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_documentos(entidade_tipo: Optional[str] = None, entidade_id: Optional[int] = None,
                       status: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    sql = "SELECT * FROM imob_documentos WHERE 1=1"
    params = []
    if entidade_tipo:
        sql += " AND entidade_tipo = ?"
        params.append(entidade_tipo)
    if entidade_id is not None:
        sql += " AND entidade_id = ?"
        params.append(entidade_id)
    if status:
        sql += " AND status = ?"
        params.append(status)
    sql += " ORDER BY enviado_em DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def obter_documento(documento_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    row = conn.execute("SELECT * FROM imob_documentos WHERE id = ?", (documento_id,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def revisar_documento(documento_id: int, status: str, motivo_rejeicao: Optional[str] = None) -> Dict[str, Any]:
    if status not in ("aprovado", "rejeitado"):
        raise ValueError("Status de revisão precisa ser 'aprovado' ou 'rejeitado'.")
    if status == "rejeitado" and not motivo_rejeicao:
        raise ValueError("Informe o motivo da rejeição.")
    conn = get_db()
    row = conn.execute("SELECT id FROM imob_documentos WHERE id = ?", (documento_id,)).fetchone()
    if not row:
        conn.close()
        raise ValueError("Documento não encontrado.")
    conn.execute(
        "UPDATE imob_documentos SET status = ?, motivo_rejeicao = ?, revisado_em = ? WHERE id = ?",
        (status, motivo_rejeicao, time.time(), documento_id),
    )
    conn.commit()
    updated = conn.execute("SELECT * FROM imob_documentos WHERE id = ?", (documento_id,)).fetchone()
    conn.close()
    return _row_to_dict(updated)


def pendencias_documentacao(entidade_tipo: str, entidade_id: int) -> List[str]:
    """Lista os tipos de documento exigidos que ainda faltam ou foram rejeitados — mesma lógica
    de 'ENTREGA BLOQUEADA' usada no resto da COON: a pendência trava a entrega, nunca o cadastro."""
    exigidos = {
        "imovel": {"matricula_imovel", "iptu"},
        "proprietario": {"rg_cpf", "comprovante_residencia"},
        "inquilino": {"rg_cpf", "comprovante_residencia"},
        "corretor": {"rg_cpf"},
        "fiador": {"rg_cpf", "comprovante_residencia"},
    }.get(entidade_tipo, set())
    docs = listar_documentos(entidade_tipo=entidade_tipo, entidade_id=entidade_id)
    aprovados = {d["tipo_documento"] for d in docs if d["status"] == "aprovado"}
    return sorted(exigidos - aprovados)


# ── Validação ────────────────────────────────────────────────────────────────

def _so_digitos(v: str) -> str:
    return re.sub(r"\D", "", v or "")


def validar_cpf_cnpj(v: Optional[str]) -> Optional[str]:
    if not v:
        return v
    d = _so_digitos(v)
    if len(d) not in (11, 14):
        raise ValueError("CPF precisa ter 11 dígitos ou CNPJ 14 dígitos.")
    return d


TIPOS_IMOVEL = {"casa", "apartamento", "comercial", "terreno", "rural", "outro"}
FINALIDADES = {"venda", "aluguel"}
STATUS_IMOVEL = {"disponivel", "reservado", "alugado", "vendido"}


# ── Modelos Pydantic ─────────────────────────────────────────────────────────

class CorretorIn(BaseModel):
    nome: str = Field(..., min_length=2)
    creci: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    imobiliaria: Optional[str] = None


class ProprietarioIn(BaseModel):
    nome: str = Field(..., min_length=2)
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    chave_pix: Optional[str] = None

    @field_validator("cpf_cnpj")
    @classmethod
    def _valida_doc(cls, v):
        return validar_cpf_cnpj(v)


class InquilinoIn(BaseModel):
    nome: str = Field(..., min_length=2)
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None

    @field_validator("cpf_cnpj")
    @classmethod
    def _valida_doc(cls, v):
        return validar_cpf_cnpj(v)


class FiadorIn(BaseModel):
    nome: str = Field(..., min_length=2)
    cpf_cnpj: Optional[str] = None
    telefone: Optional[str] = None
    email: Optional[str] = None
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None

    @field_validator("cpf_cnpj")
    @classmethod
    def _valida_doc(cls, v):
        return validar_cpf_cnpj(v)


class ImovelIn(BaseModel):
    titulo: str = Field(..., min_length=3)
    tipo: str
    finalidade: str
    cep: Optional[str] = None
    rua: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    area_terreno_m2: Optional[float] = None
    area_construida_m2: Optional[float] = None
    quartos: Optional[int] = None
    valor: Optional[float] = None
    status: str = "disponivel"
    proprietario_id: Optional[int] = None
    corretor_id: Optional[int] = None
    inquilino_id: Optional[int] = None
    fiador_id: Optional[int] = None

    @field_validator("tipo")
    @classmethod
    def _valida_tipo(cls, v):
        if v not in TIPOS_IMOVEL:
            raise ValueError(f"Tipo precisa ser um de: {', '.join(sorted(TIPOS_IMOVEL))}")
        return v

    @field_validator("finalidade")
    @classmethod
    def _valida_finalidade(cls, v):
        if v not in FINALIDADES:
            raise ValueError("Finalidade precisa ser 'venda' ou 'aluguel'.")
        return v

    @field_validator("status")
    @classmethod
    def _valida_status(cls, v):
        if v not in STATUS_IMOVEL:
            raise ValueError(f"Status precisa ser um de: {', '.join(sorted(STATUS_IMOVEL))}")
        return v


# ── Serviços ─────────────────────────────────────────────────────────────────

def _row_to_dict(row: sqlite3.Row) -> Dict[str, Any]:
    return dict(row) if row else None


def criar_corretor(dados: CorretorIn) -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO imob_corretores (nome, creci, telefone, email, imobiliaria, criado_em) VALUES (?, ?, ?, ?, ?, ?)",
        (dados.nome.strip(), dados.creci, dados.telefone, dados.email, dados.imobiliaria, time.time()),
    )
    conn.commit()
    cid = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_corretores WHERE id = ?", (cid,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_corretores() -> List[Dict[str, Any]]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM imob_corretores WHERE ativo = 1 ORDER BY nome").fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def criar_proprietario(dados: ProprietarioIn) -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO imob_proprietarios (nome, cpf_cnpj, telefone, email, chave_pix, criado_em) VALUES (?, ?, ?, ?, ?, ?)",
        (dados.nome.strip(), dados.cpf_cnpj, dados.telefone, dados.email, dados.chave_pix, time.time()),
    )
    conn.commit()
    pid = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_proprietarios WHERE id = ?", (pid,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_proprietarios() -> List[Dict[str, Any]]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM imob_proprietarios ORDER BY nome").fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def criar_inquilino(dados: InquilinoIn) -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO imob_inquilinos (nome, cpf_cnpj, telefone, email, criado_em) VALUES (?, ?, ?, ?, ?)",
        (dados.nome.strip(), dados.cpf_cnpj, dados.telefone, dados.email, time.time()),
    )
    conn.commit()
    tid = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_inquilinos WHERE id = ?", (tid,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_inquilinos() -> List[Dict[str, Any]]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM imob_inquilinos ORDER BY nome").fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def criar_fiador(dados: FiadorIn) -> Dict[str, Any]:
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO imob_fiadores (nome, cpf_cnpj, telefone, email, cep, rua, numero, complemento, bairro, cidade, uf, criado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (dados.nome.strip(), dados.cpf_cnpj, dados.telefone, dados.email, dados.cep, dados.rua,
         dados.numero, dados.complemento, dados.bairro, dados.cidade, (dados.uf or "").upper() or None, time.time()),
    )
    conn.commit()
    fid = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_fiadores WHERE id = ?", (fid,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_fiadores() -> List[Dict[str, Any]]:
    conn = get_db()
    rows = conn.execute("SELECT * FROM imob_fiadores ORDER BY nome").fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def _valida_fk(conn, tabela: str, id_: Optional[int], rotulo: str):
    if id_ is None:
        return
    row = conn.execute(f"SELECT id FROM {tabela} WHERE id = ?", (id_,)).fetchone()
    if not row:
        conn.close()
        raise ValueError(f"{rotulo} com id {id_} não encontrado. Cadastre antes de vincular.")


def criar_imovel(dados: ImovelIn) -> Dict[str, Any]:
    conn = get_db()
    _valida_fk(conn, "imob_proprietarios", dados.proprietario_id, "Proprietário")
    _valida_fk(conn, "imob_corretores", dados.corretor_id, "Corretor")
    _valida_fk(conn, "imob_inquilinos", dados.inquilino_id, "Inquilino")
    _valida_fk(conn, "imob_fiadores", dados.fiador_id, "Fiador")

    cur = conn.cursor()
    cur.execute(
        """INSERT INTO imob_imoveis
           (titulo, tipo, finalidade, cep, rua, numero, complemento, bairro, cidade, uf,
            area_terreno_m2, area_construida_m2, quartos, valor,
            status, proprietario_id, corretor_id, inquilino_id, fiador_id, criado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (
            dados.titulo.strip(), dados.tipo, dados.finalidade, dados.cep, dados.rua, dados.numero,
            dados.complemento, dados.bairro, dados.cidade, (dados.uf or "").upper() or None,
            dados.area_terreno_m2, dados.area_construida_m2, dados.quartos, dados.valor,
            dados.status, dados.proprietario_id, dados.corretor_id, dados.inquilino_id, dados.fiador_id, time.time(),
        ),
    )
    conn.commit()
    iid = cur.lastrowid
    row = cur.execute("SELECT * FROM imob_imoveis WHERE id = ?", (iid,)).fetchone()
    conn.close()
    return _row_to_dict(row)


def listar_imoveis(cidade: Optional[str] = None, status: Optional[str] = None, finalidade: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    sql = """
        SELECT i.*, p.nome AS proprietario_nome, c.nome AS corretor_nome, t.nome AS inquilino_nome, f.nome AS fiador_nome
        FROM imob_imoveis i
        LEFT JOIN imob_proprietarios p ON p.id = i.proprietario_id
        LEFT JOIN imob_corretores c ON c.id = i.corretor_id
        LEFT JOIN imob_inquilinos t ON t.id = i.inquilino_id
        LEFT JOIN imob_fiadores f ON f.id = i.fiador_id
        WHERE 1=1
    """
    params = []
    if cidade:
        sql += " AND i.cidade LIKE ?"
        params.append(f"%{cidade}%")
    if status:
        sql += " AND i.status = ?"
        params.append(status)
    if finalidade:
        sql += " AND i.finalidade = ?"
        params.append(finalidade)
    sql += " ORDER BY i.criado_em DESC"
    rows = conn.execute(sql, params).fetchall()
    conn.close()
    return [_row_to_dict(r) for r in rows]


def obter_imovel(imovel_id: int) -> Optional[Dict[str, Any]]:
    conn = get_db()
    row = conn.execute(
        """SELECT i.*, p.nome AS proprietario_nome, c.nome AS corretor_nome, t.nome AS inquilino_nome, f.nome AS fiador_nome
           FROM imob_imoveis i
           LEFT JOIN imob_proprietarios p ON p.id = i.proprietario_id
           LEFT JOIN imob_corretores c ON c.id = i.corretor_id
           LEFT JOIN imob_inquilinos t ON t.id = i.inquilino_id
           LEFT JOIN imob_fiadores f ON f.id = i.fiador_id
           WHERE i.id = ?""",
        (imovel_id,),
    ).fetchone()
    conn.close()
    return _row_to_dict(row)


def atualizar_status_imovel(imovel_id: int, status: str, inquilino_id: Optional[int] = None) -> Dict[str, Any]:
    if status not in STATUS_IMOVEL:
        raise ValueError(f"Status precisa ser um de: {', '.join(sorted(STATUS_IMOVEL))}")
    conn = get_db()
    row = conn.execute("SELECT id FROM imob_imoveis WHERE id = ?", (imovel_id,)).fetchone()
    if not row:
        conn.close()
        raise ValueError("Imóvel não encontrado.")
    conn.execute("UPDATE imob_imoveis SET status = ?, inquilino_id = COALESCE(?, inquilino_id) WHERE id = ?",
                 (status, inquilino_id, imovel_id))
    conn.commit()
    updated = conn.execute("SELECT * FROM imob_imoveis WHERE id = ?", (imovel_id,)).fetchone()
    conn.close()
    return _row_to_dict(updated)


def painel_resumo() -> Dict[str, Any]:
    conn = get_db()
    total_imoveis = conn.execute("SELECT COUNT(*) AS n FROM imob_imoveis").fetchone()["n"]
    disponiveis = conn.execute("SELECT COUNT(*) AS n FROM imob_imoveis WHERE status = 'disponivel'").fetchone()["n"]
    alugados = conn.execute("SELECT COUNT(*) AS n FROM imob_imoveis WHERE status = 'alugado'").fetchone()["n"]
    vendidos = conn.execute("SELECT COUNT(*) AS n FROM imob_imoveis WHERE status = 'vendido'").fetchone()["n"]
    total_proprietarios = conn.execute("SELECT COUNT(*) AS n FROM imob_proprietarios").fetchone()["n"]
    total_inquilinos = conn.execute("SELECT COUNT(*) AS n FROM imob_inquilinos").fetchone()["n"]
    total_corretores = conn.execute("SELECT COUNT(*) AS n FROM imob_corretores WHERE ativo = 1").fetchone()["n"]
    conn.close()
    return {
        "total_imoveis": total_imoveis,
        "disponiveis": disponiveis,
        "alugados": alugados,
        "vendidos": vendidos,
        "total_proprietarios": total_proprietarios,
        "total_inquilinos": total_inquilinos,
        "total_corretores": total_corretores,
    }


init_db()
