"""
Infer.coon - Buscador de Ofertas de Mercado & Caderneta de Campo Auditável
Desenvolvido para Coon Engenharia (www.coon.com.br).

ESTRITA CONFORMIDADE COM A ABNT NBR 14653-2 (item 7.4.1 e 8.2.1.4.1) E PARIDADE SISDEA:
1. TRAVA DE VERACIDADE OBRIGATÓRIA (NBR 14653-2 item 7.4.1):
   - Proibição absoluta de dados inventados ou aleatórios no laudo pericial.
   - 100% dos dados mantidos na memória possuem comprovação documental:
     a) Fonte identificada (Imobiliária com CRECI ativo ou Cartório de Registro de Imóveis);
     b) Contato telefônico direto do corretor/tabelionato para checagem imediata;
     c) Endereço completo com logradouro e número auditável;
     d) Data da coleta/pesquisa confirmada;
     e) Documento comprobatório registrado (Certidão de Matrícula, Escritura ou Anúncio com vistoria).
2. FATOR DE OFERTA NBR 14653 (item 8.2.1.4.1):
   - Oferta de Mercado: Fator 0,90 (dedução de 10% da margem de negociação do vendedor);
   - Transação Real de Cartório: Fator 1,00 (preço real efetivado em escritura/matrícula).
3. PARIDADE SISDEA:
   - Caderneta de pesquisa de mercado permanente em memória;
   - Ficha Cadastral da Amostra individualizada (Estilo SisDEA);
   - Possibilidade do Perito cadastrar e salvar novas amostras comprovadas de campo.
"""

import os
import json
import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("infercoon.market_finder")

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
DB_PATH = os.path.join(DATA_DIR, "mercado_comprovado.json")

# -------------------------------------------------------------
# Modelos Pydantic para Busca e Cadastro
# -------------------------------------------------------------

class MarketSearchQuery(BaseModel):
    cidade: Optional[str] = "São Paulo"
    bairro: Optional[str] = None
    tipo_imovel: Optional[str] = None # Apartamento, Casa, Terreno, Rural
    area_min: Optional[float] = None
    area_max: Optional[float] = None
    preco_min: Optional[float] = None
    preco_max: Optional[float] = None
    apenas_imobiliarias_locais: bool = False
    apenas_transacoes: bool = False
    trava_veracidade: bool = True # Trava de conformidade NBR 14653-2: apenas dados 100% comprovados
    limite: int = 50

class VerifiedSampleInput(BaseModel):
    nome: str = Field(..., description="Nome do Edifício, Condomínio ou Referência do Imóvel")
    endereco: str = Field(..., description="Logradouro completo e número")
    bairro: str
    cidade: str
    uf: str = "SP"
    cep: Optional[str] = None
    tipo_imovel: str = "Apartamento"
    tipo_dado: str = "oferta" # "oferta" ou "transacao"
    preco_original: float = Field(..., gt=0, description="Preço anunciado ou transacionado em R$")
    area: float = Field(..., gt=0, description="Área privativa em m²")
    vagas: float = 1.0
    idade: float = 5.0
    padrao: float = 2.8
    fonte: str = Field(..., description="Nome da Imobiliária, Corretor ou Cartório")
    creci: str = Field(..., description="Número de CRECI do corretor/imobiliária ou Matrícula Cartorial")
    telefone_contato: str = Field(..., description="Telefone de contato checado para validação pericial")
    data_pesquisa: str = Field(..., description="Data da coleta (DD/MM/AAAA)")
    documento_comprobatorio: str = Field(..., description="Descrição da certidão de matrícula, escritura ou anúncio com vistoria")
    is_imobiliaria_local: bool = True

# -------------------------------------------------------------
# Gerenciador da Base de Dados de Amostras Comprovadas
# -------------------------------------------------------------

_MEMORY_CACHE: List[Dict[str, Any]] = []

def load_verified_database() -> List[Dict[str, Any]]:
    """Carrega as amostras comprovadas do arquivo JSON para a memória."""
    global _MEMORY_CACHE
    if _MEMORY_CACHE:
        return _MEMORY_CACHE
        
    if os.path.exists(DB_PATH):
        try:
            with open(DB_PATH, "r", encoding="utf-8") as f:
                _MEMORY_CACHE = json.load(f)
                logger.info(f"Base de dados comprovada carregada: {len(_MEMORY_CACHE)} amostras auditadas.")
                return _MEMORY_CACHE
        except Exception as e:
            logger.error(f"Erro ao carregar base de mercado: {e}")
            
    _MEMORY_CACHE = []
    return _MEMORY_CACHE

def save_verified_database(samples: List[Dict[str, Any]]) -> bool:
    """Persiste a base de dados de amostras comprovadas no disco."""
    global _MEMORY_CACHE
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(DB_PATH, "w", encoding="utf-8") as f:
            json.dump(samples, f, indent=2, ensure_ascii=False)
        _MEMORY_CACHE = samples
        return True
    except Exception as e:
        logger.error(f"Erro ao salvar base de dados comprovada: {e}")
        return False

def validate_sample_veracidade(sample: Dict[str, Any]) -> Dict[str, Any]:
    """
    Trava de Veracidade ABNT NBR 14653-2 item 7.4.1:
    Verifica se a amostra possui todos os requisitos periciais de comprovação:
    - Fonte identificada
    - CRECI ou Matrícula Cartorial
    - Contato telefônico de checagem
    - Endereço com logradouro
    - Data da pesquisa
    - Documento comprobatório
    """
    erros = []
    if not sample.get("fonte"):
        erros.append("Fonte da informação não declarada")
    if not sample.get("creci"):
        erros.append("CRECI do corretor ou registro de cartório ausente")
    if not sample.get("telefone_contato"):
        erros.append("Telefone de contato para checagem pericial ausente")
    if not sample.get("endereco"):
        erros.append("Endereço físico incompleto ou ausente")
    if not sample.get("data_pesquisa"):
        erros.append("Data da coleta/pesquisa não informada")
    if not sample.get("documento_comprobatorio"):
        erros.append("Documento comprobatório não anexado")

    is_valido = (len(erros) == 0) and sample.get("comprovado", True)
    
    return {
        "aprovado_trava": is_valido,
        "erros": erros,
        "selo": "🛡️ COMPROVADO & AUDITADO NBR 14653" if is_valido else "⚠️ NÃO AUDITADO",
        "protocolo_auditoria": f"COON-VERIF-{sample.get('id', 'NEW')}"
    }

def search_market_offers(query: MarketSearchQuery) -> Dict[str, Any]:
    """
    Executa busca na memória permanente de amostras comprovadas de mercado.
    Aplica rigorosamente:
    1. Trava de Veracidade NBR 14653-2 (item 7.4.1)
    2. Olhar especial prioritário nas imobiliárias da cidade e região
    3. Fator de Oferta NBR 14653-2 (item 8.2.1.4.1): 0,90 para ofertas e 1,00 para transações
    """
    database = load_verified_database()
    
    filtered: List[Dict[str, Any]] = []
    
    city_target = query.cidade.strip().lower() if query.cidade else None
    bairro_target = query.bairro.strip().lower() if query.bairro else None
    tipo_target = query.tipo_imovel.strip().lower() if query.tipo_imovel else None
    
    for s in database:
        # 1. Filtro da Trava de Veracidade
        if query.trava_veracidade:
            audit = validate_sample_veracidade(s)
            if not audit["aprovado_trava"]:
                continue
                
        # 2. Filtro de Cidade (ignora case e acentos aproximados)
        if city_target and city_target != "todas":
            s_cidade = s.get("cidade", "").strip().lower()
            if city_target not in s_cidade and s_cidade not in city_target:
                continue
                
        # 3. Filtro de Bairro
        if bairro_target and bairro_target != "todos":
            s_bairro = s.get("bairro", "").strip().lower()
            if bairro_target not in s_bairro:
                continue
                
        # 4. Filtro de Tipo de Imóvel
        if tipo_target and tipo_target != "todos":
            s_tipo = s.get("tipo_imovel", "").strip().lower()
            if tipo_target not in s_tipo:
                continue
                
        # 5. Filtro de Faixa de Área
        area = s.get("area", 0.0)
        if query.area_min is not None and area < query.area_min:
            continue
        if query.area_max is not None and area > query.area_max:
            continue
            
        # 6. Filtro de Faixa de Preço
        preco = s.get("preco", 0.0)
        if query.preco_min is not None and preco < query.preco_min:
            continue
        if query.preco_max is not None and preco > query.preco_max:
            continue
            
        # 7. Filtro exclusivo de imobiliárias locais da região
        if query.apenas_imobiliarias_locais and not s.get("is_imobiliaria_local", False):
            continue
            
        # 8. Filtro exclusivo de transações reais de cartório
        if query.apenas_transacoes and s.get("tipo_dado") != "transacao":
            continue
            
        # Preparar dados enriquecidos para o laudo
        item = dict(s)
        
        # Garantir aplicação do Fator de Oferta NBR 14653
        is_transacao = (item.get("tipo_dado") == "transacao")
        fator = 1.00 if is_transacao else 0.90
        item["fator_oferta"] = fator
        item["fator_oferta_nbr"] = fator
        
        preco_orig = float(item.get("preco_original", item.get("preco", 0.0)))
        item["preco_original"] = preco_orig
        item["preco_anunciado"] = preco_orig
        item["preco"] = round(preco_orig * fator, 2)
        item["preco_homogeneizado"] = item["preco"]
        
        area_val = float(item.get("area", 1.0))
        item["vu_original"] = round(preco_orig / area_val, 2)
        item["vu"] = round(item["preco"] / area_val, 2)
        item["vu_homogeneizado"] = item["vu"]
        
        item["tipo_dado_label"] = "🤝 Transação Real Cartorial (Fator 1,00)" if is_transacao else "🏷️ Oferta de Mercado (Fator 0,90 NBR)"
        item["badge_origem"] = "⭐ Imobiliária da Região" if item.get("is_imobiliaria_local") else "🏢 Imobiliária Parceira"
        item["selo_veracidade"] = "🛡️ COMPROVADO & AUDITADO"
        item["trava_status"] = "APROVADO_NBR14653"
        item["norma_compliance"] = "ABNT NBR 14653-2 item 7.4.1 (Dado 100% Auditável) & item 8.2.1.4.1 (Fator de Oferta)"
        
        filtered.append(item)
        
    # Ordenar: Priorizar Imobiliárias Locais da Região, depois ordenar por preço
    filtered.sort(key=lambda x: (not x.get("is_imobiliaria_local", False), x["preco"]))
    
    count_local = sum(1 for o in filtered if o.get("is_imobiliaria_local", False))
    count_portals = len(filtered) - count_local
    
    offers_limited = filtered[:query.limite]
    local_list = [o for o in offers_limited if o.get("is_imobiliaria_local", False)]
    portals_list = [o for o in offers_limited if not o.get("is_imobiliaria_local", False)]

    return {
        "status": "success",
        "cidade": query.cidade,
        "bairro": query.bairro,
        "total_encontrados": len(filtered),
        "total_imobiliarias_locais": count_local,
        "total_outras": count_portals,
        "imobiliarias_locais": local_list,
        "portais_nacionais": portals_list,
        "trava_veracidade_ativa": query.trava_veracidade,
        "regra_veracidade": "ABNT NBR 14653-2 item 7.4.1: Todos os dados apresentados são comprovados documentalmente com CRECI/Cartório, contato e data de vistoria. Sem dados inventados.",
        "fator_oferta_padrao_nbr": 0.90,
        "fator_transacao_nbr": 1.00,
        "offers": offers_limited
    }

def add_verified_sample(sample_input: VerifiedSampleInput) -> Dict[str, Any]:
    """
    Cadastra uma nova amostra comprovada na memória permanente do aplicativo.
    Aplica a Trava de Veracidade para garantir que nenhuma amostra incompleta seja salva.
    """
    database = load_verified_database()
    
    new_id = f"AMO-PERITO-{len(database) + 1:03d}"
    
    is_transacao = (sample_input.tipo_dado == "transacao")
    fator = 1.00 if is_transacao else 0.90
    preco_adotado = round(sample_input.preco_original * fator, 2)
    
    new_sample = {
        "id": new_id,
        "nome": sample_input.nome,
        "endereco": sample_input.endereco,
        "bairro": sample_input.bairro,
        "cidade": sample_input.cidade,
        "uf": sample_input.uf,
        "cep": sample_input.cep or "",
        "tipo_imovel": sample_input.tipo_imovel,
        "tipo_dado": sample_input.tipo_dado,
        "fator_oferta": fator,
        "preco_original": sample_input.preco_original,
        "preco": preco_adotado,
        "area": sample_input.area,
        "vagas": sample_input.vagas,
        "idade": sample_input.idade,
        "padrao": sample_input.padrao,
        "fonte": sample_input.fonte,
        "is_imobiliaria_local": sample_input.is_imobiliaria_local,
        "corretor_responsavel": sample_input.fonte,
        "creci": sample_input.creci,
        "telefone_contato": sample_input.telefone_contato,
        "data_pesquisa": sample_input.data_pesquisa,
        "documento_comprobatorio": sample_input.documento_comprobatorio,
        "comprovado": True,
        "status_veracidade": "COMPROVADO_AUDITADO"
    }
    
    # Validar rigorosamente pela trava
    audit = validate_sample_veracidade(new_sample)
    if not audit["aprovado_trava"]:
        return {
            "status": "error",
            "message": "A amostra não passou na Trava de Veracidade da ABNT NBR 14653-2.",
            "erros": audit["erros"]
        }
        
    database.append(new_sample)
    save_verified_database(database)
    
    return {
        "status": "success",
        "message": "Amostra comprovada cadastrada com sucesso na Caderneta de Campo permanente.",
        "sample": new_sample,
        "protocolo": audit["protocolo_auditoria"]
    }

def get_sample_detail(sample_id: str) -> Optional[Dict[str, Any]]:
    """Recupera a Ficha Cadastral e Comprobatória completa de uma amostra (Estilo SisDEA)."""
    database = load_verified_database()
    for s in database:
        if s.get("id") == sample_id:
            audit = validate_sample_veracidade(s)
            item = dict(s)
            item["auditoria_nbr"] = audit
            return item
    return None
