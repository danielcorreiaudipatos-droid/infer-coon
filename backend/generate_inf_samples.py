"""
Gera os 10 arquivos .inf oficiais de benchmark para o Infer.coon.
"""

import os
import json
from backend.benchmarks import BENCHMARK_MODELS, calculate_ols_metrics
from backend.inf_handler import serialize_to_inf

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "exemplos_projetos_inf")
os.makedirs(OUTPUT_DIR, exist_ok=True)

def generate_all_sample_inf_files():
    created_files = []
    for bm in BENCHMARK_MODELS:
        m = calculate_ols_metrics(
            samples=bm["samples"],
            dep_var=bm["dependent_var"],
            indep_vars=bm["independent_vars"],
            transforms=bm["transformations"],
            subject_attrs=bm["subject"]
        )
        
        slug = (
            bm["nome"].split(":")[1]
                      .strip()
                      .replace(" ", "_")
                      .replace("/", "_")
                      .replace("(", "")
                      .replace(")", "")
                      .replace("²", "2")
                      .replace("√", "Raiz")
                      .replace("ln", "Ln")
                      .replace("Preço", "Preco")
                      .replace("Área", "Area")
                      .replace("Padrão", "Padrao")
                      .replace("Regressão", "Regressao")
                      .replace("Múltipla", "Multipla")
                      .replace("São", "Sao")
        )
        filename = f"Teste_{bm['id']:02d}_{slug}.inf"
        filepath = os.path.join(OUTPUT_DIR, filename)
        
        project_data = {
            "metadata": {
                "title": bm["nome"],
                "author": "Engenheiro Perito Avaliador - Coon Engenharia",
                "company": "Coon Engenharia",
                "website": "https://www.coon.com.br",
                "standard": "ABNT NBR 14653-2",
                "purpose": "Validação de Paridade SisDEA e Determinação do Valor de Mercado",
                "notes": bm["descricao"]
            },
            "dataset": {
                "dependent_var": bm["dependent_var"],
                "independent_vars": bm["independent_vars"],
                "transformations": bm["transformations"],
                "samples": bm["samples"]
            },
            "subject": {
                "description": f"Imóvel Avaliando ({bm['tipo']})",
                "attributes": bm["subject"]
            },
            "calibration": {
                "is_manual": (bm["id"] == 10),
                "coefficients": {k: v["valor"] for k, v in m["coefficients"].items()}
            },
            "results": m
        }
        
        content = serialize_to_inf(project_data)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
            
        created_files.append((filename, filepath, len(content)))
        
    return created_files

if __name__ == "__main__":
    files = generate_all_sample_inf_files()
    for fname, fpath, size in files:
        print(f"Criado: {fname} ({size} bytes)")
