"""
Site Auto-gerado de Imóvel — Tier 2
Cria URL: onimob.com/imoveis/seu-imovel-123
SEO otimizado para Google indexação
"""

import os
import json
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from jinja2 import Environment, FileSystemLoader, Template
import hashlib

logger = logging.getLogger(__name__)

class SiteGenerator:
    """Gera sites estáticos otimizados para SEO de cada imóvel."""

    def __init__(self, base_path: str = "./sites_imoveis"):
        """
        Inicializar gerador de sites.

        Args:
            base_path: Diretório raiz onde salvar os sites
        """
        self.base_path = base_path
        self.sites_path = os.path.join(base_path, "imoveis")
        self.template_path = os.path.join(base_path, "templates")

        os.makedirs(self.sites_path, exist_ok=True)
        os.makedirs(self.template_path, exist_ok=True)

        self.env = Environment(
            loader=FileSystemLoader(self.template_path),
            autoescape=True
        )

    # ========== TEMPLATES ==========

    def criar_templates(self):
        """Cria templates Jinja2 padrão para sites de imóveis."""

        # Template principal
        template_principal = """<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ titulo }} - {{ valor_formatado }} - on.imob</title>
    <meta name="description" content="{{ descricao[:160] }}">
    <meta name="keywords" content="{{ tipo }}, {{ bairro }}, {{ cidade }}, imóvel, aluguel{% if preco_venda %}, venda{% endif %}">
    <meta property="og:title" content="{{ titulo }}">
    <meta property="og:description" content="{{ descricao[:160] }}">
    <meta property="og:image" content="{{ foto_principal }}">
    <meta property="og:type" content="website">

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            color: #333;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }

        header h1 {
            font-size: 28px;
            margin-bottom: 10px;
        }

        .preco {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
        }

        .container {
            max-width: 1000px;
            margin: 30px auto;
            padding: 0 20px;
        }

        .galeria {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .galeria img {
            width: 100%;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .info-principal {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .caracteristicas {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }

        .caracteristica {
            text-align: center;
            padding: 15px;
            background: #f9f9f9;
            border-radius: 8px;
        }

        .caracteristica-valor {
            font-size: 24px;
            font-weight: bold;
            color: #667eea;
        }

        .caracteristica-label {
            font-size: 12px;
            color: #999;
            text-transform: uppercase;
            margin-top: 5px;
        }

        .descricao {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
            line-height: 1.6;
        }

        .mapa {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }

        .mapa iframe {
            width: 100%;
            height: 400px;
            border: none;
            border-radius: 8px;
        }

        .contato {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }

        .botoes {
            display: flex;
            gap: 15px;
            justify-content: center;
            flex-wrap: wrap;
            margin-top: 20px;
        }

        .botao {
            padding: 12px 30px;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.3s;
            text-decoration: none;
            display: inline-block;
        }

        .botao-whatsapp {
            background: #25d366;
            color: white;
        }

        .botao-whatsapp:hover {
            background: #20ba5a;
        }

        .botao-email {
            background: white;
            color: #667eea;
            border: 2px solid #667eea;
        }

        .botao-email:hover {
            background: #f0f4ff;
        }

        footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            margin-top: 50px;
        }

        .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-right: 10px;
            margin-bottom: 10px;
        }

        @media (max-width: 768px) {
            header h1 {
                font-size: 20px;
            }

            .preco {
                font-size: 18px;
            }

            .galeria {
                grid-template-columns: 1fr;
            }

            .caracteristicas {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
</head>
<body>
    <header>
        <h1>{{ titulo }}</h1>
        <div class="preco">{{ valor_formatado }}</div>
        <div>{{ tipo | capitalize }} • {{ bairro }} • {{ cidade }}, {{ estado }}</div>
    </header>

    <div class="container">
        <!-- GALERIA -->
        <div class="galeria">
            {% for foto in fotos %}
            <img src="{{ foto }}" alt="{{ titulo }}" loading="lazy">
            {% endfor %}
        </div>

        <!-- INFO PRINCIPAL -->
        <div class="info-principal">
            <h2>Características do Imóvel</h2>
            <div class="caracteristicas">
                {% if quartos %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">{{ quartos }}</div>
                    <div class="caracteristica-label">Quartos</div>
                </div>
                {% endif %}

                {% if banheiros %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">{{ banheiros }}</div>
                    <div class="caracteristica-label">Banheiros</div>
                </div>
                {% endif %}

                {% if area %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">{{ area }}</div>
                    <div class="caracteristica-label">m²</div>
                </div>
                {% endif %}

                {% if garagens %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">{{ garagens }}</div>
                    <div class="caracteristica-label">Garagens</div>
                </div>
                {% endif %}

                {% if condominio %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">R$ {{ condominio|int }}</div>
                    <div class="caracteristica-label">Condomínio</div>
                </div>
                {% endif %}

                {% if iptu %}
                <div class="caracteristica">
                    <div class="caracteristica-valor">R$ {{ iptu|int }}</div>
                    <div class="caracteristica-label">IPTU</div>
                </div>
                {% endif %}
            </div>

            <!-- BADGES -->
            <div style="margin-top: 20px;">
                {% if preco_locacao %}
                <span class="badge">Aluguel</span>
                {% endif %}
                {% if preco_venda %}
                <span class="badge">Venda</span>
                {% endif %}
                {% if ar_condicionado %}
                <span class="badge">Ar Condicionado</span>
                {% endif %}
                {% if piscina %}
                <span class="badge">Piscina</span>
                {% endif %}
                {% if academia %}
                <span class="badge">Academia</span>
                {% endif %}
            </div>
        </div>

        <!-- DESCRIÇÃO -->
        <div class="descricao">
            <h2>Sobre o Imóvel</h2>
            <p>{{ descricao }}</p>
        </div>

        <!-- MAPA -->
        {% if latitude and longitude %}
        <div class="mapa">
            <h2>Localização</h2>
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.0829586628093!2d{{ longitude }}!3d{{ latitude }}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z{{ latitude }},{{ longitude }}!5e0!3m2!1spt-BR!2sbr!4v1234567890" allowfullscreen="" loading="lazy"></iframe>
        </div>
        {% endif %}

        <!-- CONTATO -->
        <div class="contato">
            <h2>Interessado?</h2>
            <p>Entre em contato conosco para mais informações</p>
            <div class="botoes">
                <a href="https://wa.me/{{ telefone_whatsapp }}?text=Olá,%20tenho%20interesse%20no%20imóvel%20{{ titulo }}" class="botao botao-whatsapp">
                    💬 WhatsApp
                </a>
                <a href="mailto:{{ email }}?subject=Interesse no imóvel: {{ titulo }}" class="botao botao-email">
                    📧 Email
                </a>
            </div>
        </div>
    </div>

    <footer>
        <p>Anúncio de imóvel em on.imob • Publicitário por {{ imobiliaria_nome }}</p>
        <p>Data de publicação: {{ data_publicacao }}</p>
    </footer>

    <!-- SCHEMA.ORG PARA SEO -->
    <script type="application/ld+json">
    {
        "@context": "https://schema.org/",
        "@type": "RealEstateAgent",
        "name": "{{ imobiliaria_nome }}",
        "url": "https://on.imob.com.br",
        "listing": {
            "@type": "RealEstateListing",
            "name": "{{ titulo }}",
            "description": "{{ descricao }}",
            "url": "{{ url_canonica }}",
            "image": "{{ foto_principal }}",
            "price": "{{ preco_venda or preco_locacao }}",
            "priceCurrency": "BRL",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "{{ endereco }}",
                "addressLocality": "{{ cidade }}",
                "addressRegion": "{{ estado }}",
                "postalCode": "{{ cep }}"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "{{ latitude }}",
                "longitude": "{{ longitude }}"
            }
        }
    }
    </script>
</body>
</html>
"""

        try:
            template_file = os.path.join(self.template_path, "imovel.html")
            with open(template_file, 'w', encoding='utf-8') as f:
                f.write(template_principal)
            logger.info("Template principal criado")
        except Exception as e:
            logger.error(f"Erro criar template: {e}")

    # ========== GERAR SITE ==========

    def gerar_site_imovel(self, imovel_id: int, imovel_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Gera site HTML estático para um imóvel.

        Args:
            imovel_id: ID do imóvel
            imovel_data: Dict com dados do imóvel

        Returns:
            {'sucesso': bool, 'url': str, 'pasta': str}
        """
        try:
            # Validar dados obrigatórios
            if not imovel_data.get('titulo') or not imovel_data.get('endereco'):
                return {
                    'sucesso': False,
                    'erro': 'Título e endereço são obrigatórios'
                }

            # Preparar dados
            imobiliaria_nome = imovel_data.get('imobiliaria_nome', 'on.imob')
            preco_locacao = imovel_data.get('preco_locacao', 0)
            preco_venda = imovel_data.get('preco_venda', 0)

            # Formatar preço
            if preco_venda:
                valor_formatado = f"R$ {preco_venda:,.0f}".replace(",", ".")
            else:
                valor_formatado = f"R$ {preco_locacao:,.0f}/mês".replace(",", ".")

            # Preparar contexto template
            context = {
                'titulo': imovel_data.get('titulo'),
                'descricao': imovel_data.get('descricao', ''),
                'tipo': imovel_data.get('tipo', 'Imóvel'),
                'endereco': imovel_data.get('endereco'),
                'bairro': imovel_data.get('bairro', ''),
                'cidade': imovel_data.get('cidade', 'São Paulo'),
                'estado': imovel_data.get('estado', 'SP'),
                'cep': imovel_data.get('cep', ''),
                'area': imovel_data.get('area'),
                'quartos': imovel_data.get('quartos'),
                'banheiros': imovel_data.get('banheiros'),
                'garagens': imovel_data.get('garagens'),
                'condominio': imovel_data.get('condominio'),
                'iptu': imovel_data.get('iptu'),
                'preco_locacao': preco_locacao,
                'preco_venda': preco_venda,
                'valor_formatado': valor_formatado,
                'fotos': imovel_data.get('fotos', []),
                'foto_principal': imovel_data.get('fotos', [''])[0],
                'latitude': imovel_data.get('latitude'),
                'longitude': imovel_data.get('longitude'),
                'ar_condicionado': imovel_data.get('ar_condicionado'),
                'piscina': imovel_data.get('piscina'),
                'academia': imovel_data.get('academia'),
                'imobiliaria_nome': imobiliaria_nome,
                'telefone_whatsapp': imovel_data.get('telefone_whatsapp', ''),
                'email': imovel_data.get('email', ''),
                'data_publicacao': datetime.now().strftime('%d/%m/%Y'),
                'url_canonica': f'https://on.imob.com.br/imoveis/{imovel_id}'
            }

            # Renderizar template
            template = self.env.get_template('imovel.html')
            html_content = template.render(**context)

            # Salvar arquivo
            imovel_dir = os.path.join(self.sites_path, f'imovel-{imovel_id}')
            os.makedirs(imovel_dir, exist_ok=True)

            index_file = os.path.join(imovel_dir, 'index.html')
            with open(index_file, 'w', encoding='utf-8') as f:
                f.write(html_content)

            logger.info(f"Site gerado para imóvel {imovel_id}")

            return {
                'sucesso': True,
                'url': f'https://on.imob.com.br/imoveis/{imovel_id}',
                'pasta': imovel_dir,
                'msg': 'Site gerado com sucesso'
            }

        except Exception as e:
            logger.error(f"Erro gerar site: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== ATUALIZAR SITE ==========

    def atualizar_site_imovel(self, imovel_id: int, imovel_data: Dict[str, Any]) -> Dict[str, Any]:
        """Atualiza site existente com dados novos."""
        try:
            resultado = self.gerar_site_imovel(imovel_id, imovel_data)
            if resultado['sucesso']:
                logger.info(f"Site atualizado para imóvel {imovel_id}")
            return resultado
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== DELETAR SITE ==========

    def deletar_site_imovel(self, imovel_id: int) -> Dict[str, Any]:
        """Remove site de um imóvel."""
        try:
            imovel_dir = os.path.join(self.sites_path, f'imovel-{imovel_id}')
            if os.path.exists(imovel_dir):
                import shutil
                shutil.rmtree(imovel_dir)
                logger.info(f"Site deletado para imóvel {imovel_id}")
                return {
                    'sucesso': True,
                    'msg': 'Site deletado com sucesso'
                }
            return {
                'sucesso': False,
                'erro': 'Site não encontrado'
            }
        except Exception as e:
            return {
                'sucesso': False,
                'erro': str(e)
            }

    # ========== LISTAR SITES ==========

    def listar_sites(self) -> List[Dict[str, Any]]:
        """Lista todos os sites gerados."""
        try:
            sites = []
            for pasta in os.listdir(self.sites_path):
                if pasta.startswith('imovel-'):
                    imovel_id = pasta.replace('imovel-', '')
                    caminho = os.path.join(self.sites_path, pasta)
                    index_file = os.path.join(caminho, 'index.html')

                    if os.path.exists(index_file):
                        stat = os.stat(index_file)
                        sites.append({
                            'imovel_id': int(imovel_id),
                            'url': f'https://on.imob.com.br/imoveis/{imovel_id}',
                            'data_criacao': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                            'data_atualizacao': datetime.fromtimestamp(stat.st_mtime).isoformat()
                        })
            return sites
        except Exception as e:
            logger.error(f"Erro listar sites: {e}")
            return []


# Instância global
site_gen = SiteGenerator()
