"""
Infer.coon - Especificação e Manipulação de Arquivos de Projeto .inf
Formato Nativo da Plataforma Infer.coon (Coon Engenharia - www.coon.com.br)
Conformidade ABNT NBR 14653 (Partes 1 e 2).
"""

import json
import datetime
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class InfProjectMetadata(BaseModel):
    title: str = "Laudo de Avaliação Imobiliária"
    author: str = "Engenheiro Perito Avaliador"
    company: str = "COON Soluções Tecnológicas"
    location: str = "Brasil"
    website: str = "https://www.coon.com.br"
    standard: str = "ABNT NBR 14653 (Partes 1 e 2)"
    created_at: str = Field(default_factory=lambda: datetime.datetime.now().isoformat())
    purpose: str = "Determinação do Valor de Mercado"
    notes: Optional[str] = "Projeto elaborado no Infer.coon (COON Soluções Tecnológicas - Brasil) em conformidade com as diretrizes da ABNT NBR 14653, IBAPE e SisDEA."

class InfProjectFile(BaseModel):
    infercoon_format: str = "INFER-COON-PROJECT-V1"
    version: str = "1.0.0"
    metadata: InfProjectMetadata = Field(default_factory=InfProjectMetadata)
    dataset: Dict[str, Any] # samples, dependent_var, independent_vars, transformations
    subject: Dict[str, Any] # description, attributes
    calibration: Optional[Dict[str, Any]] = Field(default_factory=lambda: {"is_manual": False, "coefficients": {}})
    results: Optional[Dict[str, Any]] = None

def serialize_to_inf(project_data: Dict[str, Any]) -> str:
    """Serializa os dados do projeto no formato texto estruturado .inf do Infer.coon."""
    meta = project_data.get("metadata", {})
    if "created_at" not in meta:
        meta["created_at"] = datetime.datetime.now().isoformat()
    if "company" not in meta:
        meta["company"] = "COON Soluções Tecnológicas"
    if "website" not in meta:
        meta["website"] = "https://www.coon.com.br"
    if "standard" not in meta:
        meta["standard"] = "ABNT NBR 14653 (Partes 1 e 2)"

    inf_payload = {
        "infercoon_format": "INFER-COON-PROJECT-V1",
        "file_extension": ".inf",
        "version": "1.0.0",
        "metadata": meta,
        "dataset": project_data.get("dataset", {}),
        "subject": project_data.get("subject", {}),
        "calibration": project_data.get("calibration", {"is_manual": False, "coefficients": {}}),
        "results": project_data.get("results", None)
    }
    
    # Formatação limpa em JSON com indentação
    return json.dumps(inf_payload, indent=2, ensure_ascii=False)

def parse_from_inf(content_str: str) -> Dict[str, Any]:
    """Lê e valida um arquivo .inf, retornando a estrutura do projeto para recarregar na interface."""
    try:
        data = json.loads(content_str)
        if not isinstance(data, dict):
            raise ValueError("Conteúdo inválido para arquivo .inf")
        
        # Compatibilidade com formatos antigos ou simplificados
        if "dataset" not in data and "samples" in data:
            # Reencapsular
            dataset = {
                "samples": data.get("samples", []),
                "dependent_var": data.get("dependent_var", "preco"),
                "independent_vars": data.get("independent_vars", ["area"]),
                "transformations": data.get("transformations", {})
            }
            subject = data.get("subject", {"description": "Imóvel Avaliando", "attributes": {}})
            return {
                "infercoon_format": "INFER-COON-PROJECT-V1",
                "version": "1.0.0",
                "metadata": data.get("metadata", {}),
                "dataset": dataset,
                "subject": subject,
                "calibration": data.get("calibration", {}),
                "results": data.get("results", None)
            }
            
        return data
    except Exception as e:
        raise ValueError(f"Falha ao processar arquivo .inf: {str(e)}")
