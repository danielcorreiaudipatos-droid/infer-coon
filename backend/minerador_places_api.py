"""
Coletor Oficial de Empresas Locais via Google Places API (New)
Extrai Nome, Telefone, WhatsApp, Categoria, Endereço, Avaliações e Nota.
Gera Planilha Excel (.csv / .xlsx) diretamente.
"""

import os
import re
import sys
import json
import urllib.request
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from backend.minerador_empresas import init_db, salvar_empresa, exportar_para_csv_ou_excel

def get_google_maps_key():
    return (
        os.getenv("GOOGLE_MAPS_KEY") or
        os.getenv("GOOGLE_MAPS_CHAVE") or
        os.getenv("GOOGLE_PLACES_KEY") or
        ""
    )

def minerar_patos_com_places_api(categorias=None):
    api_key = get_google_maps_key()
    if not api_key:
        print("\n[ERRO] Chave GOOGLE_MAPS_KEY / GOOGLE_MAPS_CHAVE não encontrada!")
        print("Configure a variável no seu arquivo .env ou informe-a.")
        return None

    if not categorias:
        categorias = [
            "imobiliárias",
            "construtoras e engenharia",
            "advogados e escritórios",
            "clínicas e dentistas",
            "lojas de roupas e calçados",
            "restaurantes e lanchonetes",
            "oficinas mecânicas e autopeças",
            "materiais de construção",
            "supermercados e padarias",
            "academias",
            "pet shops e veterinárias"
        ]

    init_db()
    cidade = "Patos de Minas, MG"
    total_coletado = 0

    print(f"\n=======================================================")
    print(f"🚀 INICIANDO MINERAÇÃO GOOGLE PLACES: {cidade}")
    print(f"Total de categorias a varrer: {len(categorias)}")
    print(f"=======================================================\n")

    url_text_search = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,places.displayName,places.formattedAddress,"
            "places.nationalPhoneNumber,places.internationalPhoneNumber,"
            "places.rating,places.userRatingCount,places.primaryTypeDisplayName"
        )
    }

    for cat in categorias:
        query_text = f"{cat} em {cidade}"
        print(f"🔍 Consultando: '{query_text}'...")

        payload = json.dumps({"textQuery": query_text, "languageCode": "pt-BR"}).encode("utf-8")

        try:
            req = urllib.request.Request(url_text_search, data=payload, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                lugares = data.get("places", [])
                print(f"   -> Encontradas {len(lugares)} empresas na categoria '{cat}'")

                for p in lugares:
                    nome = p.get("displayName", {}).get("text", "")
                    telefone = p.get("nationalPhoneNumber") or p.get("internationalPhoneNumber") or ""
                    endereco = p.get("formattedAddress", "")
                    nota = p.get("rating", 0.0)
                    avaliacoes = p.get("userRatingCount", 0)
                    tipo = p.get("primaryTypeDisplayName", {}).get("text", cat.capitalize())

                    if nome:
                        salvar_empresa({
                            "nome": nome,
                            "categoria": tipo,
                            "telefone": telefone,
                            "endereco": endereco,
                            "cidade": "Patos de Minas",
                            "uf": "MG",
                            "nota": nota,
                            "avaliacoes": avaliacoes,
                            "origem": "google_places_api"
                        })
                        total_coletado += 1

        except Exception as e:
            print(f"   [Aviso/Erro na busca de {cat}]: {e}")

    # Exporta para planilha Excel no final
    caminho_csv, qtd = exportar_para_csv_ou_excel("Patos de Minas")
    print(f"\n=======================================================")
    print(f"✅ MINERAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"Total de registros processados: {total_coletado}")
    print(f"📁 Planilha Excel gerada em: {caminho_csv}")
    print(f"=======================================================\n")
    return caminho_csv

if __name__ == "__main__":
    minerar_patos_com_places_api()
