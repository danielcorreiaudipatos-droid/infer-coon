"""Biblioteca de modelos — cartas, contratos, comunicados com busca na internet."""

import os
import json
import sqlite3
import time
from typing import Dict, Any, Optional, List

DB_PATH = os.path.join(os.path.dirname(__file__), "modelos_cartas.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS modelos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT UNIQUE NOT NULL,
        categoria TEXT NOT NULL,
        conteudo TEXT NOT NULL,
        fonte TEXT DEFAULT 'custom',
        tags TEXT,
        criado_em REAL
    )
    """)

    conn.commit()
    conn.close()

# Modelos Pré-Configurados (Lei 8.245/91 Brasil)
MODELOS_PADRAO = {
    # Cartas de Cobrança
    "cobranca_gentil": {
        "categoria": "cobranca",
        "conteudo": """Prezado(a) {nome_inquilino},

Espero que você esteja bem! Observamos que a parcela de aluguel referente a {mes_atraso} ainda não foi recebida.

Sabemos que às vezes surgem imprevistos, mas gostaríamos de lembrá-lo(a) que o vencimento era {data_vencimento}.

Para sua conveniência, disponibilizamos várias formas de pagamento:
- PIX: {chave_pix}
- Transferência: Dados em anexo
- Depósito: Dados em anexo

Qualquer dúvida, entre em contato conosco pelo WhatsApp ou telefone.

Agradecemos antecipadamente!
Atenciosamente,
{nome_proprietario}
{telefone_proprietario}""",
        "fonte": "padrao"
    },

    "aviso_protesto": {
        "categoria": "cobranca",
        "conteudo": """NOTIFICAÇÃO EXTRAJUDICIAL DE COBRANÇA

Prezado(a) {nome_inquilino},

Conforme contrato de locação assinado em {data_contrato}, informamos que o imóvel situado em {endereco_imovel}, encontra-se com ATRASO NO PAGAMENTO.

DADOS DO DÉBITO:
- Período: {mes_atraso}
- Dias em atraso: {dias_atraso}
- Valor devido: R$ {valor_atraso}
- Multa (Lei 8.245/91): R$ {valor_multa}
- TOTAL: R$ {valor_total}

CONSEQUÊNCIAS DO NÃO PAGAMENTO:
Conforme lei de locação (Lei nº 8.245/91), a falta de pagamento nos prazos estabelecidos pode resultar em:
1. Notificação Judicial
2. Cobrança Judicial
3. Protesto em cartório
4. Inscrição em cadastros de inadimplentes

PRAZO PARA REGULARIZAÇÃO: {data_limite} (últimas 48 horas)

Chave PIX para pagamento imediato: {chave_pix}

Atenciosamente,
{nome_proprietario}
{telefone_proprietario}
{email_proprietario}

---
Documento emitido em: {data_emissao}
Válido conforme Lei 8.245/91""",
        "fonte": "padrao"
    },

    "encerramento_contrato": {
        "categoria": "comunicado",
        "conteudo": """COMUNICADO DE ENCERRAMENTO DE CONTRATO

Prezado(a) {nome_inquilino},

Por este meio, formalizo a RESCISÃO do contrato de locação do imóvel situado em:

{endereco_imovel}
Área: {area_imovel} m²

DATA DE ENCERRAMENTO: {data_encerramento}

PROCEDIMENTOS NECESSÁRIOS:

1. DEVOLUÇÃO DO IMÓVEL:
   - Data: {data_vistoria}
   - Hora: {hora_vistoria}
   - Local: {endereco_imovel}
   - Responsável pela vistoria: {vistoriador}

2. DOCUMENTAÇÃO A APRESENTAR:
   - Chaves do imóvel
   - Documentos de encerramento de serviços (água, luz, gás)
   - Comprovante de mudança (SEDEC)

3. CONDIÇÕES DO IMÓVEL:
   O imóvel deve ser devolvido nas mesmas condições de entrega, conforme TAI (Termo de Aceitação do Imóvel).

4. ACERTO DE CONTAS:
   - Saldo de caução: R$ {saldo_caacao}
   - Deduções (conforme danos): R$ {deducoes}
   - Débitos pendentes: R$ {debitos_pendentes}
   - VALOR A DEVOLVER: R$ {valor_devolucao}

A devolução será realizada em até 30 dias após a vistoria.

Qualquer dúvida, entre em contato.

Atenciosamente,
{nome_proprietario}
{telefone_proprietario}

Data: {data_emissao}""",
        "fonte": "padrao"
    },

    # Contratos
    "contrato_residencial": {
        "categoria": "contrato",
        "conteudo": """CONTRATO DE LOCAÇÃO PARA USO RESIDENCIAL

PARTES:
LOCADOR: {nome_proprietario}, CPF/CNPJ: {cpf_proprietario}
LOCATÁRIO: {nome_inquilino}, CPF: {cpf_inquilino}
FIADOR: {nome_fiador}, CPF: {cpf_fiador}

CLÁUSULA PRIMEIRA - DO IMÓVEL:
Fica locado o imóvel situado à {endereco_imovel}, com área de {area_imovel} m², uso exclusivamente residencial.

CLÁUSULA SEGUNDA - DA RENDA:
Valor mensal: R$ {valor_aluguel}
Vencimento: Dia {dia_vencimento} de cada mês
Reajuste: {indice_reajuste} conforme Lei 8.245/91

CLÁUSULA TERCEIRA - DA CAUÇÃO:
Valor: R$ {valor_caacao}
Depósito em: {data_deposito_caacao}

CLÁUSULA QUARTA - DA DURAÇÃO:
Prazo: {prazo_meses} meses
Início: {data_inicio}
Término: {data_fim}

CLÁUSULA QUINTA - MULTA POR RESCISÃO ANTECIPADA:
Conforme Lei 8.245/91, a rescisão antecipada acarreta multa de 3 (três) meses de aluguel.

CLÁUSULA SEXTA - RESPONSABILIDADES:
O locatário é responsável por:
- Pagamento pontual do aluguel
- Manutenção e conservação do imóvel
- Pagamento de contas (água, luz, gás, telefone)
- Reparos de uso ordinário

CLÁUSULA SÉTIMA - RESCISÃO:
Qualquer das partes pode rescindir com aviso prévio de 30 dias.

Por estarem de acordo, assinam este contrato em {data_contrato}.

________________________________                ________________________________
{nome_proprietario}                               {nome_inquilino}

________________________________
{nome_fiador}
Fiador""",
        "fonte": "padrao"
    },

    # Comunicados
    "comunicado_manutencao": {
        "categoria": "comunicado",
        "conteudo": """COMUNICADO DE MANUTENÇÃO

Prezado(a) {nome_inquilino},

Informamos que será realizada manutenção preventiva no imóvel:

LOCAL: {endereco_imovel}
DATA: {data_manutencao}
HORÁRIO: {hora_manutencao}
TIPO: {tipo_manutencao}

O acesso ao imóvel será necessário para realização dos serviços. Solicitamos que deixe a chave com a portaria ou compare a execução.

Possíveis transtornos:
- Falta de água: {tempo_agua}
- Falta de energia: {tempo_energia}
- Barulho: {tempo_barulho}

Qualquer dúvida, contate-nos imediatamente.

Atenciosamente,
{nome_proprietario}
{telefone_proprietario}""",
        "fonte": "padrao"
    },

    "pedido_atualizacao_dados": {
        "categoria": "pedido",
        "conteudo": """SOLICITAÇÃO DE ATUALIZAÇÃO DE DADOS CADASTRAIS

Prezado(a) {nome_inquilino},

Para melhorarmos nosso atendimento e facilitar comunicações futuras, solicitamos a atualização de seus dados cadastrais:

1. TELEFONES PARA CONTATO:
   Residencial: ________________
   Celular: ________________
   Comercial: ________________

2. EMAIL:
   ________________

3. REFERÊNCIAS PESSOAIS (com telefone):
   1. Nome: ________________ Tel: ________________
   2. Nome: ________________ Tel: ________________

4. BENEFICIÁRIO PARA RESTITUIÇÃO DE CAUÇÃO:
   Nome: ________________
   CPF: ________________
   Banco: ________________ Agência: ________________ Conta: ________________

Por favor, retorne este formulário preenchido em até 7 dias.

Atenciosamente,
{nome_proprietario}""",
        "fonte": "padrao"
    }
}

def init_modelos_padrao():
    """Insere modelos padrão no banco (executa uma única vez)."""
    conn = get_db()
    cur = conn.cursor()

    for nome, dados in MODELOS_PADRAO.items():
        try:
            cur.execute(
                """INSERT INTO modelos (nome, categoria, conteudo, fonte, criado_em)
                   VALUES (?, ?, ?, ?, ?)""",
                (nome, dados["categoria"], dados["conteudo"], dados["fonte"], time.time())
            )
        except sqlite3.IntegrityError:
            pass  # Já existe

    conn.commit()
    conn.close()

def listar_modelos(categoria: Optional[str] = None) -> List[Dict[str, Any]]:
    """Lista todos os modelos ou filtra por categoria."""
    conn = get_db()
    if categoria:
        rows = conn.execute("SELECT * FROM modelos WHERE categoria = ? ORDER BY nome", (categoria,)).fetchall()
    else:
        rows = conn.execute("SELECT * FROM modelos ORDER BY categoria, nome").fetchall()
    conn.close()

    return [{"id": r["id"], "nome": r["nome"], "categoria": r["categoria"], "fonte": r["fonte"]} for r in rows]

def obter_modelo(modelo_id: int) -> Optional[Dict[str, Any]]:
    """Obtém conteúdo completo de um modelo."""
    conn = get_db()
    row = conn.execute("SELECT * FROM modelos WHERE id = ?", (modelo_id,)).fetchone()
    conn.close()

    if row:
        return {
            "id": row["id"],
            "nome": row["nome"],
            "categoria": row["categoria"],
            "conteudo": row["conteudo"],
            "fonte": row["fonte"]
        }
    return None

def adicionar_modelo(nome: str, categoria: str, conteudo: str) -> Dict[str, Any]:
    """Adiciona novo modelo customizado."""
    conn = get_db()
    cur = conn.cursor()
    try:
        cur.execute(
            """INSERT INTO modelos (nome, categoria, conteudo, fonte, criado_em)
               VALUES (?, ?, ?, 'custom', ?)""",
            (nome, categoria, conteudo, time.time())
        )
        conn.commit()
        modelo_id = cur.lastrowid
        conn.close()
        return {"id": modelo_id, "nome": nome, "msg": "Modelo adicionado com sucesso"}
    except sqlite3.IntegrityError:
        conn.close()
        raise ValueError("Modelo já existe")

def deletar_modelo(modelo_id: int) -> Dict[str, Any]:
    """Deleta modelo customizado."""
    conn = get_db()
    cur = conn.cursor()
    cur.execute("DELETE FROM modelos WHERE id = ? AND fonte = 'custom'", (modelo_id,))
    conn.commit()
    conn.close()
    return {"msg": "Modelo deletado"}

async def buscar_modelos_internet(tipo: str) -> List[Dict[str, Any]]:
    """Busca modelos reais na internet via Gemini (Lei 8.245/91)."""
    from backend.gemini_integration import gerar_texto_ia

    prompt = f"""Forneça 3 modelos de {tipo} reais para imobiliária brasileira conforme Lei 8.245/91.

    Cada modelo deve:
    1. Ser profissional e legalmente válido
    2. Incluir cláusulas obrigatórias da Lei 8.245/91
    3. Usar placeholders {{assim}} para dados variáveis

    Formato de resposta: JSON com array [{{nome, conteudo}}, ...]"""

    resposta = await gerar_texto_ia(prompt)
    if resposta:
        try:
            modelos = json.loads(resposta)
            return modelos
        except json.JSONDecodeError:
            return []
    return []

init_db()
init_modelos_padrao()
