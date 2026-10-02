"""
Testes automatizados do modulo on.imob: upload/validacao de documento, controle de
acesso (chave mestra / conta de equipe / publico) e fiador. Roda direto como script,
sem pytest, igual aos outros arquivos test_*.py deste projeto:

    python backend/test_onimob_module.py
"""
import io
import os
import sys

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

os.environ.setdefault("COON_MASTER_KEY", "chave-mestra-de-teste")

from fastapi.testclient import TestClient
from backend.main import app, COON_MASTER_KEY

client = TestClient(app)


def _criar_proprietario():
    r = client.post("/api/onimob/proprietarios", json={"nome": "Dono Teste", "cpf_cnpj": "11144477735"})
    assert r.status_code == 200, r.text
    return r.json()["id"]


def test_upload_rejeita_extensao_nao_permitida():
    arquivo = io.BytesIO(b"conteudo qualquer")
    r = client.post(
        "/api/onimob/documentos",
        data={"entidade_tipo": "proprietario", "entidade_id": 1, "tipo_documento": "rg_cpf", "aceite_termos": "true"},
        files={"arquivo": ("doc.exe", arquivo, "application/octet-stream")},
    )
    assert r.status_code == 400
    print("OK: extensao nao permitida rejeitada.")


def test_upload_rejeita_conteudo_que_nao_bate_com_a_extensao():
    """Arquivo renomeado pra .pdf mas sem a assinatura real de PDF nos bytes."""
    arquivo = io.BytesIO(b"isso nao e um pdf de verdade")
    r = client.post(
        "/api/onimob/documentos",
        data={"entidade_tipo": "proprietario", "entidade_id": 1, "tipo_documento": "rg_cpf", "aceite_termos": "true"},
        files={"arquivo": ("doc.pdf", arquivo, "application/pdf")},
    )
    assert r.status_code == 400, r.text
    assert "não corresponde" in r.json()["detail"]
    print("OK: conteudo falso disfarcado de PDF rejeitado.")


def test_upload_aceita_pdf_valido_e_documento_fica_protegido():
    prop_id = _criar_proprietario()
    pdf_valido = io.BytesIO(b"%PDF-1.4\n%%EOF")
    r = client.post(
        "/api/onimob/documentos",
        data={"entidade_tipo": "proprietario", "entidade_id": prop_id, "tipo_documento": "rg_cpf", "aceite_termos": "true"},
        files={"arquivo": ("rg.pdf", pdf_valido, "application/pdf")},
    )
    assert r.status_code == 200, r.text
    doc_id = r.json()["id"]
    print("OK: upload de PDF valido aceito.")
    return doc_id


def test_listar_e_baixar_documento_exige_acesso():
    doc_id = test_upload_aceita_pdf_valido_e_documento_fica_protegido()

    # Sem token nenhum: bloqueado.
    r = client.get("/api/onimob/documentos")
    assert r.status_code == 401
    r = client.get(f"/api/onimob/documentos/{doc_id}/arquivo")
    assert r.status_code == 401
    print("OK: listar/baixar sem autenticacao e bloqueado.")

    # Token de login publico qualquer (nao e staff): continua bloqueado -- e exatamente
    # o IDOR que foi corrigido (um usuario qualquer nao pode ver documento de terceiro).
    client.post("/api/auth/register", json={"name": "Visitante", "email": "visitante@example.com", "password": "1234"})
    login = client.post("/api/auth/login", json={"email": "visitante@example.com", "password": "1234"})
    token_publico = login.json()["token"]
    r = client.get("/api/onimob/documentos", headers={"Authorization": f"Bearer {token_publico}"})
    assert r.status_code == 401
    print("OK: conta publica comum continua sem acesso a documentos de terceiros.")

    # Chave mestra: acesso liberado.
    r = client.get("/api/onimob/documentos", headers={"Authorization": f"Bearer {COON_MASTER_KEY}"})
    assert r.status_code == 200
    print("OK: chave mestra acessa a listagem de documentos.")

    # Conta de equipe criada pelo admin: acesso liberado.
    client.post(
        "/api/admin/onimob/staff",
        json={"name": "Corretora Ana", "email": "ana@escritorio.com.br", "password": "senha123"},
        headers={"Authorization": f"Bearer {COON_MASTER_KEY}"},
    )
    login_staff = client.post("/api/auth/login", json={"email": "ana@escritorio.com.br", "password": "senha123"})
    token_staff = login_staff.json()["token"]
    r = client.get("/api/onimob/documentos", headers={"Authorization": f"Bearer {token_staff}"})
    assert r.status_code == 200
    print("OK: conta de equipe (staff) acessa a listagem de documentos.")


def test_apenas_admin_cria_conta_de_staff():
    r = client.post(
        "/api/admin/onimob/staff",
        json={"name": "Invasor", "email": "invasor@example.com", "password": "1234"},
    )
    assert r.status_code == 401
    print("OK: criar conta de equipe sem chave mestra e bloqueado.")


def test_fiador_cadastro():
    r = client.post("/api/onimob/fiadores", json={
        "nome": "Fiador Teste", "cpf_cnpj": "11144477735", "cep": "01311-000",
        "rua": "Av. Paulista", "numero": "100", "bairro": "Bela Vista", "cidade": "São Paulo", "uf": "SP",
    })
    assert r.status_code == 200, r.text
    print("OK: cadastro de fiador aceito.")


if __name__ == "__main__":
    test_upload_rejeita_extensao_nao_permitida()
    test_upload_rejeita_conteudo_que_nao_bate_com_a_extensao()
    test_listar_e_baixar_documento_exige_acesso()
    test_apenas_admin_cria_conta_de_staff()
    test_fiador_cadastro()
    print("\nTodos os testes do modulo on.imob passaram.")
