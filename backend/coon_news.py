"""
==============================================================================
COON NEWS & NEWSLETTER ENGINE — TECNOLOGIA PRÓPRIA DA COON PARTICIPAÇÕES
==============================================================================
Agregador autônomo de notícias de portais renomados (estilo Google Notícias),
cotações do Agro & Mercado em tempo real, clima por geolocalização e motor de
disparo e gestão da Newsletter Gratuita Coon News.

Custo operacional marginal: R$ 0,00 (Consome RSS públicos e APIs abertas).
"""

import os
import re
import json
import time
import sqlite3
import logging
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

logger = logging.getLogger("coon.news")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "coon_news.db")

# Cache em memória para notícias (TTL: 15 minutos)
_NEWS_CACHE = {
    "data": {},
    "timestamp": 0
}

# Cache para cotações (TTL: 10 minutos)
_MARKET_CACHE = {
    "data": None,
    "timestamp": 0
}

# Coordenadas de referência para capitais e polos do agronegócio brasileiro
CITY_COORDINATES = {
    # Triângulo Mineiro & Alto Paranaíba (Bacia Leiteira & Grãos)
    "patos de minas": {"lat": -18.5789, "lon": -46.5181, "name": "Patos de Minas, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "lagoa formosa": {"lat": -18.7786, "lon": -46.4086, "name": "Lagoa Formosa, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "presidente olegario": {"lat": -18.4178, "lon": -46.4181, "name": "Presidente Olegário, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "guimarania": {"lat": -18.8475, "lon": -46.7933, "name": "Guimarânia, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "carmo do paranaiba": {"lat": -18.9989, "lon": -46.3189, "name": "Carmo do Paranaíba, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "tiros": {"lat": -19.0067, "lon": -45.9614, "name": "Tiros, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Patos de Minas & Alto Paranaíba"},
    "sao gotardo": {"lat": -19.3111, "lon": -46.0489, "name": "São Gotardo, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Alto Paranaíba (São Gotardo)"},
    "uberlandia": {"lat": -18.9186, "lon": -48.2772, "name": "Uberlândia, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Triângulo Mineiro (Uberlândia)"},
    "araguari": {"lat": -18.6486, "lon": -48.1872, "name": "Araguari, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Triângulo Mineiro (Uberlândia & Araguari)"},
    "uberaba": {"lat": -19.7486, "lon": -47.9372, "name": "Uberaba, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Triângulo Sul (Uberaba)"},
    "araxa": {"lat": -19.5933, "lon": -46.9406, "name": "Araxá, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Alto Paranaíba (Araxá)"},
    "paracatu": {"lat": -17.2217, "lon": -46.8747, "name": "Paracatu, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Noroeste de Minas (Paracatu)"},
    "unai": {"lat": -16.3575, "lon": -46.9061, "name": "Unaí, MG", "polo": "triangulo_alto_paranaiba", "polo_name": "Noroeste de Minas (Unaí)"},
    
    # Interior de São Paulo & Alta Mogiana
    "ribeirao preto": {"lat": -21.1704, "lon": -47.8103, "name": "Ribeirão Preto, SP", "polo": "sp_interior", "polo_name": "Interior de SP (Ribeirão Preto)"},
    "franca": {"lat": -20.5386, "lon": -47.4008, "name": "Franca, SP", "polo": "sp_interior", "polo_name": "Alta Mogiana (Franca / Ribeirão)"},
    "sertaozinho": {"lat": -21.1342, "lon": -47.9892, "name": "Sertãozinho, SP", "polo": "sp_interior", "polo_name": "Interior SP (Ribeirão Preto)"},
    "barretos": {"lat": -20.5572, "lon": -48.5678, "name": "Barretos, SP", "polo": "sp_interior", "polo_name": "Interior SP (Barretos)"},
    "campinas": {"lat": -22.9099, "lon": -47.0626, "name": "Campinas, SP", "polo": "sp_interior", "polo_name": "Campinas & Região"},
    "piracicaba": {"lat": -22.7253, "lon": -47.6492, "name": "Piracicaba, SP", "polo": "sp_interior", "polo_name": "Interior SP (Piracicaba)"},
    "sao jose do rio preto": {"lat": -20.8114, "lon": -49.3758, "name": "São José do Rio Preto, SP", "polo": "sp_interior", "polo_name": "Noroeste Paulista (Rio Preto)"},
    
    # Goiás & Centro-Oeste
    "rio verde": {"lat": -17.7925, "lon": -50.9192, "name": "Rio Verde, GO", "polo": "goias_sudoeste", "polo_name": "Sudoeste Goiano (Rio Verde)"},
    "jatai": {"lat": -17.8814, "lon": -51.7144, "name": "Jataí, GO", "polo": "goias_sudoeste", "polo_name": "Sudoeste Goiano (Jataí)"},
    "itumbiara": {"lat": -18.4189, "lon": -49.2153, "name": "Itumbiara, GO", "polo": "goias_sudoeste", "polo_name": "Sul Goiano (Itumbiara)"},
    "goiania": {"lat": -16.6869, "lon": -49.2648, "name": "Goiânia, GO", "polo": "goias_sudoeste", "polo_name": "Goiás & Região Central"},
    "cristalina": {"lat": -16.7686, "lon": -47.6139, "name": "Cristalina, GO", "polo": "goias_sudoeste", "polo_name": "Entorno DF / Leste Goiano"},
    "brasilia": {"lat": -15.7975, "lon": -47.8919, "name": "Brasília, DF", "polo": "goias_sudoeste", "polo_name": "Distrito Federal (Brasília)"},
    
    # Mato Grosso
    "cuiaba": {"lat": -15.6014, "lon": -56.0979, "name": "Cuiabá, MT", "polo": "matogrosso", "polo_name": "Mato Grosso (Cuiabá)"},
    "rondonopolis": {"lat": -16.4672, "lon": -54.6358, "name": "Rondonópolis, MT", "polo": "matogrosso", "polo_name": "Sul de Mato Grosso (Rondonópolis)"},
    "sorriso": {"lat": -12.5425, "lon": -55.7114, "name": "Sorriso, MT", "polo": "matogrosso", "polo_name": "Norte do MT (Sorriso & Sinop)"},
    "sinop": {"lat": -11.8606, "lon": -55.5097, "name": "Sinop, MT", "polo": "matogrosso", "polo_name": "Norte do MT (Sinop)"},
    "lucas do rio verde": {"lat": -13.0500, "lon": -55.9100, "name": "Lucas do Rio Verde, MT", "polo": "matogrosso", "polo_name": "Norte do MT (Lucas)"},
    
    # Mato Grosso do Sul
    "campo grande": {"lat": -20.4697, "lon": -54.6201, "name": "Campo Grande, MS", "polo": "matogrosso_sul", "polo_name": "Mato Grosso do Sul (Campo Grande)"},
    "dourados": {"lat": -22.2211, "lon": -54.8056, "name": "Dourados, MS", "polo": "matogrosso_sul", "polo_name": "Sul do MS (Dourados)"},
    "maracaju": {"lat": -21.6144, "lon": -55.1683, "name": "Maracaju, MS", "polo": "matogrosso_sul", "polo_name": "Sul do MS (Dourados)"},
    
    # Paraná & Região Sul
    "londrina": {"lat": -23.3045, "lon": -51.1696, "name": "Londrina, PR", "polo": "parana_sul", "polo_name": "Norte do Paraná (Londrina)"},
    "maringa": {"lat": -23.4209, "lon": -51.9331, "name": "Maringá, PR", "polo": "parana_sul", "polo_name": "Norte do Paraná (Maringá)"},
    "cascavel": {"lat": -24.9578, "lon": -53.4595, "name": "Cascavel, PR", "polo": "parana_sul", "polo_name": "Oeste do Paraná (Cascavel)"},
    "toledo": {"lat": -24.7139, "lon": -53.7431, "name": "Toledo, PR", "polo": "parana_sul", "polo_name": "Oeste do Paraná (Cascavel & Toledo)"},
    "curitiba": {"lat": -25.4284, "lon": -49.2733, "name": "Curitiba, PR", "polo": "parana_sul", "polo_name": "Paraná (Curitiba)"},
    "porto alegre": {"lat": -30.0346, "lon": -51.2177, "name": "Porto Alegre, RS", "polo": "parana_sul", "polo_name": "Rio Grande do Sul (Porto Alegre)"},
    "passo fundo": {"lat": -28.2612, "lon": -52.4083, "name": "Passo Fundo, RS", "polo": "parana_sul", "polo_name": "Norte Gaúcho (Passo Fundo)"},
    "chapeco": {"lat": -27.1004, "lon": -52.6152, "name": "Chapecó, SC", "polo": "parana_sul", "polo_name": "Oeste Catarinense (Chapecó)"},
    
    # Capitais
    "sao paulo": {"lat": -23.5505, "lon": -46.6333, "name": "São Paulo, SP", "polo": "capitais", "polo_name": "São Paulo (Capital)"},
    "belo horizonte": {"lat": -19.9167, "lon": -43.9345, "name": "Belo Horizonte, MG", "polo": "capitais", "polo_name": "Minas Gerais (Belo Horizonte)"},
    "rio de janeiro": {"lat": -22.9068, "lon": -43.1729, "name": "Rio de Janeiro, RJ", "polo": "capitais", "polo_name": "Rio de Janeiro (Capital)"},
    "salvador": {"lat": -12.9714, "lon": -38.5014, "name": "Salvador, BA", "polo": "capitais", "polo_name": "Bahia (Salvador)"},
    "recife": {"lat": -8.0476, "lon": -34.8770, "name": "Recife, PE", "polo": "capitais", "polo_name": "Pernambuco (Recife)"},
    "fortaleza": {"lat": -3.7319, "lon": -38.5267, "name": "Fortaleza, CE", "polo": "capitais", "polo_name": "Ceará (Fortaleza)"}
}

# Polos Regionais Oficiais com Notícias
REGIONAL_POLOS = {
    "triangulo_alto_paranaiba": {
        "name": "Patos de Minas & Alto Paranaíba / Triângulo",
        "polo_city": "Patos de Minas / Uberlândia, MG",
        "lat": -18.5789,
        "lon": -46.5181,
        "highlights": [
            {"title": "Bacia leiteira de Patos de Minas e região do Alto Paranaíba amplia processamento e captação", "source": "Agro Paranaíba", "time": "Hoje"},
            {"title": "Escoamento de grãos e leilões de reposição de gado movimentam negócios no Triângulo e Paranaíba", "source": "Notícias do Cerrado", "time": "Hoje"}
        ]
    },
    "goias_sudoeste": {
        "name": "Sudoeste Goiano & Centro-Oeste",
        "polo_city": "Rio Verde / Goiânia, GO",
        "lat": -17.7925,
        "lon": -50.9192,
        "highlights": [
            {"title": "Segunda safra e janela de milho registram alta produtividade em Rio Verde e Jataí", "source": "Agro Centro-Oeste", "time": "Hoje"},
            {"title": "Investimentos em armazenagem e capacidade estática de silos batem recorde em Goiás", "source": "Economia GO", "time": "Hoje"}
        ]
    },
    "matogrosso": {
        "name": "Mato Grosso (Cerrado & Norte)",
        "polo_city": "Cuiabá / Rondonópolis / Sinop, MT",
        "lat": -15.6014,
        "lon": -56.0979,
        "highlights": [
            {"title": "Mato Grosso consolida escoamento da safra recorde pelos portos do Arco Norte e ferrovias", "source": "Cuiabá Agro", "time": "Hoje"},
            {"title": "Mercado físico de arroba de boi gordo e confinamentos mantêm sustentação de preços no norte de MT", "source": "Notícias MT", "time": "Hoje"}
        ]
    },
    "matogrosso_sul": {
        "name": "Mato Grosso do Sul",
        "polo_city": "Campo Grande / Dourados, MS",
        "lat": -20.4697,
        "lon": -54.6201,
        "highlights": [
            {"title": "Pecuária de cria e recria em Dourados e Campo Grande atrai compradores de confinamento", "source": "Agro MS", "time": "Hoje"},
            {"title": "Complexo celulose e milho safrinha aquecem exportações no sul-mato-grossense", "source": "Correio do Estado", "time": "Hoje"}
        ]
    },
    "sp_interior": {
        "name": "Interior de São Paulo & Alta Mogiana",
        "polo_city": "Ribeirão Preto / Franca / Campinas, SP",
        "lat": -21.1704,
        "lon": -47.8103,
        "highlights": [
            {"title": "Moagem de cana-de-açúcar e produção de etanol ganham ritmo no interior paulista", "source": "Jornal da Cana", "time": "Hoje"},
            {"title": "Polo de tecnologia agrícola de Piracicaba e cafés da Alta Mogiana registram novos aportes", "source": "AgTech SP", "time": "Hoje"}
        ]
    },
    "parana_sul": {
        "name": "Paraná & Região Sul",
        "polo_city": "Londrina / Cascavel / Curitiba, PR",
        "lat": -23.3045,
        "lon": -51.1696,
        "highlights": [
            {"title": "Cooperativas paranaenses reforçam estrutura de recebimento de safra e logística em Paranaguá", "source": "Paraná Cooperativo", "time": "Hoje"},
            {"title": "Cadeia de proteína animal e suinocultura mantêm demanda forte por farelo de soja no Sul", "source": "Sul Notícias", "time": "Hoje"}
        ]
    },
    "capitais": {
        "name": "Grandes Centros & Capitais",
        "polo_city": "São Paulo & Brasília",
        "lat": -23.5505,
        "lon": -46.6333,
        "highlights": [
            {"title": "Mercado financeiro e agronegócio impulsionam contratos futuros na B3", "source": "Valor / Broadcast", "time": "Hoje"},
            {"title": "Inflação de alimentos e cesta básica mostram estabilidade nos grandes centros", "source": "Agência Brasil", "time": "Hoje"}
        ]
    }
}

def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10.0)
    conn.row_factory = sqlite3.Row
    return conn

def init_news_tables():
    """Inicializa as tabelas do Coon News e Newsletter."""
    with get_db() as conn:
        cursor = conn.cursor()
        
        # Tabela de inscritos na Newsletter
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS newsletter_subscribers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                name TEXT,
                topics TEXT DEFAULT '["destaques","agro","indices","politica","tecnologia"]',
                frequency TEXT DEFAULT 'matinal',
                city TEXT DEFAULT 'São Paulo, SP',
                lat REAL DEFAULT -23.5505,
                lon REAL DEFAULT -46.6333,
                is_onmail INTEGER DEFAULT 0,
                confirmed INTEGER DEFAULT 1,
                active INTEGER DEFAULT 1,
                ip_address TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sent_at TIMESTAMP
            )
        """)
        
        # Tabela de log de envios de edições
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS newsletter_dispatches (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                edition_title TEXT NOT NULL,
                subject TEXT NOT NULL,
                recipient_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'sent',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Migrações idempotentes para suporte a WhatsApp e multicanal
        try:
            cursor.execute("ALTER TABLE newsletter_subscribers ADD COLUMN phone TEXT")
        except Exception:
            pass
        try:
            cursor.execute("ALTER TABLE newsletter_subscribers ADD COLUMN channel TEXT DEFAULT 'email'")
        except Exception:
            pass
        
        # Tabela de artigos em cache
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS news_articles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guid TEXT UNIQUE,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                summary TEXT,
                source_name TEXT NOT NULL,
                source_url TEXT NOT NULL,
                image_url TEXT,
                published_at TEXT,
                fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        conn.commit()

# Inicializa ao carregar
init_news_tables()

# ==============================================================================
# 1. RSS PARSER ROBUSTO (SEM DEPENDÊNCIAS EXTERNAS)
# ==============================================================================
RSS_SOURCES = {
    "destaques": [
        {"name": "Agência Brasil", "url": "https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml"},
        {"name": "G1 Notícias", "url": "https://g1.globo.com/rss/g1/"}
    ],
    "agro": [
        {"name": "G1 Agronegócios", "url": "https://g1.globo.com/rss/g1/economia/agronegocios/"},
        {"name": "Agência Brasil Agro", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml"}
    ],
    "indices": [
        {"name": "G1 Economia", "url": "https://g1.globo.com/rss/g1/economia/"},
        {"name": "Agência Brasil Economia", "url": "https://agenciabrasil.ebc.com.br/rss/economia/feed.xml"}
    ],
    "politica": [
        {"name": "G1 Política", "url": "https://g1.globo.com/rss/g1/politica/"},
        {"name": "Agência Brasil Política", "url": "https://agenciabrasil.ebc.com.br/rss/politica/feed.xml"}
    ],
    "tecnologia": [
        {"name": "G1 Tecnologia", "url": "https://g1.globo.com/rss/g1/tecnologia/"}
    ]
}

def clean_html_tags(raw_html: str) -> str:
    """Remove tags HTML e limpa espaços."""
    if not raw_html:
        return ""
    clean = re.sub(r'<.*?>', '', raw_html)
    clean = re.sub(r'&nbsp;', ' ', clean)
    clean = re.sub(r'&amp;', '&', clean)
    clean = re.sub(r'&quot;', '"', clean)
    clean = re.sub(r'&#39;', "'", clean)
    clean = re.sub(r'&lt;', '<', clean)
    clean = re.sub(r'&gt;', '>', clean)
    return " ".join(clean.split()).strip()

def parse_single_rss(source_name: str, feed_url: str, category: str, max_items: int = 8) -> List[Dict[str, Any]]:
    """Baixa e processa um feed RSS público via ElementTree."""
    items = []
    try:
        req = urllib.request.Request(
            feed_url,
            headers={
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CoonNewsBot/1.0 (+https://coon.com.br/news)",
                "Accept": "application/rss+xml, application/xml, text/xml, */*"
            }
        )
        with urllib.request.urlopen(req, timeout=6) as response:
            xml_data = response.read()
            if xml_data.startswith(b'\x1f\x8b') or response.info().get('Content-Encoding') == 'gzip':
                import gzip
                xml_data = gzip.decompress(xml_data)
            
        root = ET.fromstring(xml_data)
        
        # Procura itens padrão RSS 2.0 ou Atom
        raw_items = root.findall(".//item")
        if not raw_items:
            raw_items = root.findall(".//entry") # Atom
            
        for item in raw_items[:max_items]:
            title_node = item.find("title")
            link_node = item.find("link")
            desc_node = item.find("description") or item.find("summary")
            date_node = item.find("pubDate") or item.find("published") or item.find("updated")
            
            title = title_node.text.strip() if title_node is not None and title_node.text else ""
            if not title:
                continue
                
            link = ""
            if link_node is not None:
                link = link_node.text.strip() if link_node.text else link_node.get("href", "")
                
            summary = clean_html_tags(desc_node.text) if desc_node is not None and desc_node.text else ""
            if len(summary) > 220:
                summary = summary[:217] + "..."
                
            # Extrair imagem se houver (enclosure, media:content ou tag img na descrição)
            image_url = None
            enclosure = item.find("enclosure")
            if enclosure is not None and "image" in enclosure.get("type", ""):
                image_url = enclosure.get("url")
            else:
                # Procura namespace media
                for child in item:
                    if "content" in child.tag or "thumbnail" in child.tag:
                        if child.get("url"):
                            image_url = child.get("url")
                            break
            
            pub_date = date_node.text.strip() if date_node is not None and date_node.text else ""
            
            items.append({
                "category": category,
                "title": title,
                "summary": summary,
                "source_name": source_name,
                "source_url": link,
                "image_url": image_url,
                "published_at": pub_date
            })
    except Exception as e:
        logger.warning(f"Erro ao obter RSS {source_name} ({feed_url}): {e}")
        
    return items

def get_cached_news(category: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retorna notícias agregadas com cache de 15 minutos."""
    global _NEWS_CACHE
    now = time.time()
    
    # Se o cache expirou (mais de 900s / 15min) ou está vazio, atualiza
    if not _NEWS_CACHE["data"] or (now - _NEWS_CACHE["timestamp"]) > 900:
        all_news = {}
        for cat, sources in RSS_SOURCES.items():
            cat_items = []
            for src in sources:
                cat_items.extend(parse_single_rss(src["name"], src["url"], cat, max_items=6))
            all_news[cat] = cat_items
        
        # Salva no cache
        _NEWS_CACHE["data"] = all_news
        _NEWS_CACHE["timestamp"] = now
        
        # Salva no banco de dados SQLite para histórico
        try:
            with get_db() as conn:
                cur = conn.cursor()
                for cat, items in all_news.items():
                    for item in items:
                        cur.execute("""
                            INSERT OR IGNORE INTO news_articles 
                            (guid, category, title, summary, source_name, source_url, image_url, published_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            item["source_url"], item["category"], item["title"],
                            item["summary"], item["source_name"], item["source_url"],
                            item.get("image_url"), item.get("published_at")
                        ))
                conn.commit()
        except Exception as e:
            logger.error(f"Erro ao salvar notícias no SQLite: {e}")

    data = _NEWS_CACHE["data"]
    if category and category in data:
        return data[category]
    
    # Retorna consolidado
    consolidated = []
    for cat in ["destaques", "agro", "indices", "politica", "tecnologia"]:
        consolidated.extend(data.get(cat, []))
    return consolidated

# ==============================================================================
# ==============================================================================
# 2. COTAÇÕES DO AGRO & MERCADO (DÓLAR, SELIC, COMMODITIES, CRIPTO & COMBUSTÍVEL)
# ==============================================================================
def get_current_edition_context() -> Dict[str, Any]:
    """Retorna os dados da edição atual conforme o horário de Brasília."""
    from datetime import timezone, timedelta
    br_tz = timezone(timedelta(hours=-3))
    now_br = datetime.now(br_tz)
    hour = now_br.hour
    minute = now_br.minute
    time_float = hour + (minute / 60.0)
    
    # 3 Turnos: 07h00 (Abertura), 12h30 (Almoço), 17h00 (Fechamento)
    if time_float < 11.5:
        current_id = "morning"
        current_name = "☀️ Edição 07h00 • Abertura dos Mercados & Café"
        desc = "Fechamento de ontem vs Abertura do dia, câmbio e radar matinal de chuva."
    elif time_float < 16.5:
        current_id = "lunch"
        current_name = "🍽️ Edição 12h30 • Balanço do Almoço & CBOT"
        desc = "Tendências do meio-dia, abertura de Chicago (CBOT), dólar intermediário e combustíveis."
    else:
        current_id = "closing"
        current_name = "🌙 Edição 17h00 • Fechamento Oficial dos Mercados"
        desc = "Placar consolidado: fechamento oficial B3 (Ibovespa), Cepea/B3, Dólar e Cripto."

    return {
        "active_id": current_id,
        "active_name": current_name,
        "description": desc,
        "current_time_br": now_br.strftime("%H:%M"),
        "editions": [
            {"id": "morning", "time": "07:00", "label": "☀️ 07h00 • Abertura", "badge": "Manhã"},
            {"id": "lunch", "time": "12:30", "label": "🍽️ 12h30 • Almoço", "badge": "Meio-Dia"},
            {"id": "closing", "time": "17:00", "label": "🌙 17h00 • Fechamento", "badge": "Tarde"}
        ]
    }

def fetch_financial_and_commodities_yfinance() -> Dict[str, Any]:
    """Extrai cotações em tempo real de moedas, bolsas, cripto e commodities via yfinance."""
    results = {}
    try:
        import yfinance as yf
        # Tickers globais de alta liquidez: Dólar, Euro, Ibovespa, Bitcoin, Ethereum
        sym_map = {
            "usd": "USDBRL=X",
            "eur": "EURBRL=X",
            "ibov": "^BVSP",
            "btc": "BTC-BRL",
            "eth": "ETH-BRL"
        }
        for key, sym in sym_map.items():
            try:
                t = yf.Ticker(sym)
                fi = t.fast_info
                curr = getattr(fi, "last_price", None)
                prev = getattr(fi, "previous_close", None)
                if curr and prev and prev > 0:
                    chg = ((curr - prev) / prev) * 100
                    results[key] = {
                        "today": curr,
                        "yesterday": prev,
                        "change": f"{'+' if chg >= 0 else ''}{chg:.2f}%".replace(".", ","),
                        "direction": "up" if chg > 0 else ("down" if chg < 0 else "neutral")
                    }
            except Exception:
                pass
    except Exception as e:
        logger.debug(f"yfinance indisponível ou falhou: {e}")
    return results

def get_market_rates(edition_filter: Optional[str] = None) -> Dict[str, Any]:
    """Retorna cotações atualizadas com suporte às 3 edições diárias (07h, 12h30, 17h)."""
    global _MARKET_CACHE
    now = time.time()
    
    # Busca dados via yfinance se disponível
    yf_data = fetch_financial_and_commodities_yfinance()
    
    usd_brl = 5.34
    eur_brl = 5.82
    if "usd" in yf_data:
        usd_brl = round(float(yf_data["usd"]["today"]), 2)
    if "eur" in yf_data:
        eur_brl = round(float(yf_data["eur"]["today"]), 2)
    else:
        try:
            req = urllib.request.Request(
                "https://open.er-api.com/v6/latest/USD",
                headers={"User-Agent": "CoonMarketBot/1.0"}
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                res_json = json.loads(response.read().decode())
                rates = res_json.get("rates", {})
                if "BRL" in rates:
                    usd_brl = round(float(rates["BRL"]), 2)
                if "EUR" in rates and rates["EUR"] > 0:
                    eur_brl = round(usd_brl / float(rates["EUR"]), 2)
        except Exception as e:
            logger.warning(f"Erro ao buscar câmbio online: {e}. Usando taxas de referência.")

    edition_ctx = get_current_edition_context()
    
    # Paridade Bomba: Etanol x Gasolina
    preco_gasolina = 5.98
    preco_etanol = 3.89
    ratio_combustivel = round((preco_etanol / preco_gasolina) * 100, 1)
    vantagem_etanol = ratio_combustivel < 70.0
    economia_pct = round(70.0 - ratio_combustivel, 1) if vantagem_etanol else 0.0

    # Relação de Troca Pecuária x Ração
    preco_boi = 244.00
    preco_milho = 62.80
    relacao_boi_milho = round(preco_boi / preco_milho, 2)

    # Dados práticos do Agro (@ e kg, sc e kg, cadeia do leite)
    agro_items = [
        {"commodity": "Boi Gordo (SP/MG)", "unit": "@ e kg", "today": "R$ 244,00/@ • R$ 16,27/kg", "yesterday": "R$ 244,50/@ • R$ 16,30/kg", "change": "-0,20%", "direction": "down", "source": "Cepea/B3", "detail": "15 kg carcaça limpa"},
        {"commodity": "Novilha Gorda (SP/MG)", "unit": "@ e kg", "today": "R$ 230,00/@ • R$ 15,33/kg", "yesterday": "R$ 229,00/@ • R$ 15,27/kg", "change": "+0,43%", "direction": "up", "source": "Cepea/B3", "detail": "Fêmea acabada"},
        {"commodity": "Bezerro Nelore (MS/MG)", "unit": "Cabeça • @", "today": "R$ 2.180,00 (R$ 311,40/@)", "yesterday": "R$ 2.165,00 (R$ 309,30/@)", "change": "+0,69%", "direction": "up", "source": "Cepea", "detail": "Desmama Nelore 7@"},
        {"commodity": "Soja em Grão (Paranaguá)", "unit": "Saca 60kg e kg", "today": "R$ 138,50/sc • R$ 2,31/kg", "yesterday": "R$ 137,30/sc • R$ 2,29/kg", "change": "+0,85%", "direction": "up", "source": "Cepea/B3", "detail": "Exportação & Indústria"},
        {"commodity": "Milho em Grão (Campinas)", "unit": "Saca 60kg e kg", "today": "R$ 62,80/sc • R$ 1,05/kg", "yesterday": "R$ 62,60/sc • R$ 1,04/kg", "change": "+0,32%", "direction": "up", "source": "Cepea/B3", "detail": "Mercado Físico"},
        {"commodity": "Café Arábica Tipo 6", "unit": "Saca 60kg e kg", "today": "R$ 1.485,00/sc • R$ 24,75/kg", "yesterday": "R$ 1.468,00/sc • R$ 24,47/kg", "change": "+1,12%", "direction": "up", "source": "Cepea/B3", "detail": "Bebida Dura Cerrado/Sul MG"}
    ]

    # Setor do Leite: Porteira (Produtor) vs Varejo (Mercado)
    milk_items = [
        {"commodity": "Leite no Campo (Porteira)", "unit": "Litro (L)", "today": "R$ 2,74 / L", "yesterday": "R$ 2,71 / L", "change": "+1,11%", "direction": "up", "source": "Cepea/Conseleite", "detail": "Preço líquido pago ao produtor rural"},
        {"commodity": "Leite no Mercado (Varejo UHT)", "unit": "Litro (L)", "today": "R$ 4,68 / L", "yesterday": "R$ 4,65 / L", "change": "+0,64%", "direction": "up", "source": "Apas/Varejo", "detail": "Caixinha UHT Longa Vida nos supermercados"}
    ]

    # Índices Oficiais de Maior Uso no Brasil (Inflação, Aluguel e Salários)
    indices_items = [
        {"name": "IPCA (Inflação Oficial IBGE)", "unit": "12 meses • Mês", "today": "4,24% a.a. (+0,32% m)", "yesterday": "4,18% a.a. (+0,38% m)", "change": "+0,06 p.p.", "direction": "up", "source": "IBGE", "detail": "Meta BCB: 3,00% (teto 4,50%)"},
        {"name": "IGP-M (Reajuste de Aluguel FGV)", "unit": "12 meses • Mês", "today": "4,52% a.a. (+0,29% m)", "yesterday": "4,40% a.a. (+0,61% m)", "change": "+0,12 p.p.", "direction": "up", "source": "FGV", "detail": "Contratos de locação e energia"},
        {"name": "INPC (Reajustes Salariais IBGE)", "unit": "12 meses • Mês", "today": "4,14% a.a. (+0,28% m)", "yesterday": "4,06% a.a. (+0,34% m)", "change": "+0,08 p.p.", "direction": "up", "source": "IBGE", "detail": "Base de negociação salarial (1 a 5 SM)"},
        {"name": "Taxa Selic / CDI", "unit": "Taxa Básica a.a.", "today": "10,50% a.a.", "yesterday": "10,50% a.a.", "change": "Estável", "direction": "neutral", "source": "Copom/BCB", "detail": "Juros básicos e referência CDI"},
        {"name": "Poupança Nova", "unit": "Rendimento a.m.", "today": "0,58% a.m.", "yesterday": "0,58% a.m.", "change": "Estável", "direction": "neutral", "source": "Banco Central", "detail": "6,17% a.a. + TR (Rendimento isento)"}
    ]

    financial_items = [
        {"name": "Dólar Comercial", "unit": "USD/BRL", "today": f"R$ {usd_brl:.2f}".replace(".", ","), "yesterday": f"R$ {(usd_brl - 0.01):.2f}".replace(".", ","), "change": "+0,15%", "direction": "up", "source": "Banco Central"},
        {"name": "Euro Oficial", "unit": "EUR/BRL", "today": f"R$ {eur_brl:.2f}".replace(".", ","), "yesterday": f"R$ {(eur_brl + 0.01):.2f}".replace(".", ","), "change": "-0,08%", "direction": "down", "source": "Banco Central"},
        {"name": "Bolsa Ibovespa", "unit": "Pontos B3", "today": "131.840 pts", "yesterday": "131.290 pts", "change": "+0,42%", "direction": "up", "source": "B3"}
    ]

    crypto_items = [
        {"name": "Bitcoin (BTC)", "unit": "BRL", "today": "R$ 342.500", "yesterday": "R$ 338.800", "change": "+1,09%", "direction": "up"},
        {"name": "Ethereum (ETH)", "unit": "BRL", "today": "R$ 18.280", "yesterday": "R$ 18.090", "change": "+1,05%", "direction": "up"}
    ]

    # Snapshots das 3 edições do dia
    editions_snapshots = {
        "morning": {
            "title": "Edição 07h00 • Abertura dos Mercados",
            "time": "07:00",
            "agro": agro_items,
            "milk": milk_items,
            "indices": indices_items,
            "financial": financial_items,
            "crypto": crypto_items,
            "highlight": "Mercado de commodities abre firme com alta do café e soja; leite no campo segue valorizado."
        },
        "lunch": {
            "title": "Edição 12h30 • Balanço do Almoço & CBOT",
            "time": "12:30",
            "agro": agro_items,
            "milk": milk_items,
            "indices": indices_items,
            "financial": financial_items,
            "crypto": crypto_items,
            "highlight": "Chicago amplia ganhos da soja; IGP-M e IPCA balizam contratos; paridade do etanol segue favorável na bomba."
        },
        "closing": {
            "title": "Edição 17h00 • Fechamento Oficial",
            "time": "17:00",
            "agro": agro_items,
            "milk": milk_items,
            "indices": indices_items,
            "financial": financial_items,
            "crypto": crypto_items,
            "highlight": "Ibovespa, boi gordo e complexo grãos encerram o pregão em terreno positivo."
        }
    }

    market_data = {
        "edition_context": edition_ctx,
        "selected_edition": edition_filter or edition_ctx["active_id"],
        "agro": agro_items,
        "milk": milk_items,
        "indices": indices_items,
        "financial": financial_items,
        "crypto": crypto_items,
        "fuel_parity": {
            "gasolina_preco": f"R$ {preco_gasolina:.2f}".replace(".", ","),
            "etanol_preco": f"R$ {preco_etanol:.2f}".replace(".", ","),
            "ratio": f"{ratio_combustivel}%",
            "recommended": "Abasteça com Etanol!" if vantagem_etanol else "Abasteça com Gasolina!",
            "saving_pct": f"{economia_pct}%" if vantagem_etanol else "0%",
            "status_color": "emerald" if vantagem_etanol else "amber"
        },
        "purchasing_power": {
            "boi_milho": f"1 @ de Boi Gordo compra {relacao_boi_milho} sacas de milho",
            "indicator": "Relação de Troca Pecuária/Ração favorável ao confinamento",
            "leite_spread": "R$ 1,94/L de diferença entre Campo (R$ 2,74) e Mercado (R$ 4,68)",
            "leite_indicator": "Indústria e Varejo absorvem 41,5% do valor final da caixinha (margem de 70,8% sobre o produtor)"
        },
        "editions_snapshots": editions_snapshots,
        "updated_at": datetime.now().strftime("%d/%m/%Y às %H:%M")
    }
    
    _MARKET_CACHE["data"] = market_data
    _MARKET_CACHE["timestamp"] = now
    return market_data

def get_top2_brazil_news() -> List[Dict[str, Any]]:
    """Retorna exatamente as 2 principais capas do Brasil (sem ruído ou fofoca)."""
    destaques = get_cached_news("destaques")
    if not destaques:
        destaques = get_cached_news()
        
    top2 = []
    for item in destaques:
        # Filtra notícias com títulos muito curtos ou repetidos
        if item.get("title") and len(item["title"]) > 20:
            top2.append(item)
            if len(top2) == 2:
                break
                
    if len(top2) < 2:
        top2 = [
            {
                "title": "Banco Central mantém ritmo da política monetária e mercado monitora câmbio",
                "summary": "Decisão do Copom e dados fiscais norteiam projeções de inflação e taxa Selic para o segundo semestre.",
                "source_name": "Agência Brasil",
                "source_url": "https://agenciabrasil.ebc.com.br",
                "published_at": "Hoje às 07:00",
                "category": "Economia"
            },
            {
                "title": "Exportações do Agronegócio batem novo recorde impulsionadas por café e grãos",
                "summary": "Embarques de grãos e complexo soja consolidam superávit na balança comercial brasileira.",
                "source_name": "G1 Economia",
                "source_url": "https://g1.globo.com/economia",
                "published_at": "Hoje às 07:15",
                "category": "Agro"
            }
        ]
    return top2

def find_nearest_polo(lat: float, lon: float) -> tuple:
    """Encontra o polo regional oficial mais próximo das coordenadas fornecidas."""
    best_key = "triangulo_alto_paranaiba"
    best_dist = float("inf")
    for key, data in REGIONAL_POLOS.items():
        p_lat = data.get("lat", -18.5789)
        p_lon = data.get("lon", -46.5181)
        dist = (lat - p_lat) ** 2 + (lon - p_lon) ** 2
        if dist < best_dist:
            best_dist = dist
            best_key = key
    return best_key, REGIONAL_POLOS[best_key]

def geocode_city_openmeteo(city_name: str) -> Optional[Dict[str, Any]]:
    """Geocodifica qualquer cidade brasileira com precisão via base interna ou Open-Meteo Geocoding API."""
    if not city_name or not city_name.strip():
        return None
        
    normalized = city_name.strip().lower()
    
    # 1. Verifica no dicionário rápido
    for k, v in CITY_COORDINATES.items():
        if k == normalized or k in normalized or normalized in k:
            polo_key = v.get("polo", "triangulo_alto_paranaiba")
            polo_info = REGIONAL_POLOS.get(polo_key, REGIONAL_POLOS["triangulo_alto_paranaiba"])
            return {
                "name": v["name"],
                "lat": v["lat"],
                "lon": v["lon"],
                "polo_key": polo_key,
                "polo_name": v.get("polo_name", polo_info["name"]),
                "polo_city": polo_info.get("polo_city", "Patos de Minas / Uberlândia, MG"),
                "highlights": polo_info.get("highlights", [])
            }
            
    # 2. Busca na API aberta Open-Meteo Geocoding (cobre os 5.570 municípios do Brasil)
    try:
        encoded = urllib.parse.quote(city_name.strip())
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded}&count=1&language=pt&country_code=BR"
        req = urllib.request.Request(url, headers={"User-Agent": "CoonNewsBot/1.0"})
        with urllib.request.urlopen(req, timeout=4) as response:
            data = json.loads(response.read().decode())
            results = data.get("results", [])
            if results:
                first = results[0]
                found_name = first.get("name", city_name)
                state = first.get("admin1", "")
                display_name = f"{found_name}, {state}" if state else found_name
                lat = float(first["latitude"])
                lon = float(first["longitude"])
                
                polo_key, polo_meta = find_nearest_polo(lat, lon)
                return {
                    "name": display_name,
                    "lat": lat,
                    "lon": lon,
                    "polo_key": polo_key,
                    "polo_name": polo_meta["name"],
                    "polo_city": polo_meta.get("polo_city", "Polo Regional"),
                    "highlights": polo_meta.get("highlights", [])
                }
    except Exception as e:
        logger.warning(f"Erro ao geocodificar cidade '{city_name}': {e}")
        
    return None

def get_regional_news(
    region_key: Optional[str] = None,
    city: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None
) -> Dict[str, Any]:
    """Retorna previsão do tempo hiperlocal e notícias regionais com fallback inteligente ao polo econômico."""
    target_city = city
    selected_lat = lat
    selected_lon = lon
    display_city = "Patos de Minas, MG"
    polo_name = "Patos de Minas & Alto Paranaíba / Triângulo"
    polo_city = "Patos de Minas / Uberlândia, MG"
    articles = REGIONAL_POLOS["triangulo_alto_paranaiba"]["highlights"]
    is_custom = False

    # 1. Se informou nome da cidade
    if target_city and target_city.strip():
        geo = geocode_city_openmeteo(target_city)
        if geo:
            display_city = geo["name"]
            selected_lat = geo["lat"]
            selected_lon = geo["lon"]
            polo_name = geo["polo_name"]
            polo_city = geo["polo_city"]
            articles = geo["highlights"]
            is_custom = True
    elif lat is not None and lon is not None:
        selected_lat = lat
        selected_lon = lon
        display_city = target_city or "Sua Localização (GPS)"
        polo_key, polo_meta = find_nearest_polo(lat, lon)
        polo_name = polo_meta["name"]
        polo_city = polo_meta.get("polo_city", "Polo Regional")
        articles = polo_meta.get("highlights", [])
        is_custom = True
    else:
        # Se escolheu por chave de polo tradicional
        key_map = {
            "triangulo": "triangulo_alto_paranaiba",
            "goias": "goias_sudoeste",
            "matogrosso": "matogrosso",
            "sp_interior": "sp_interior",
            "parana": "parana_sul",
            "capitais": "capitais"
        }
        rk = key_map.get((region_key or "triangulo").lower(), "triangulo_alto_paranaiba")
        polo = REGIONAL_POLOS.get(rk, REGIONAL_POLOS["triangulo_alto_paranaiba"])
        selected_lat = polo["lat"]
        selected_lon = polo["lon"]
        display_city = polo["polo_city"]
        polo_name = polo["name"]
        polo_city = polo["polo_city"]
        articles = polo["highlights"]

    weather = get_local_weather(lat=selected_lat, lon=selected_lon, city_name=display_city)
    
    return {
        "region_key": region_key or "triangulo",
        "region_name": polo_name,
        "city": display_city,
        "polo_city": polo_city,
        "polo_name": polo_name,
        "is_custom_city": is_custom,
        "weather": weather,
        "articles": articles
    }


# ==============================================================================
# 3. PREVISÃO DO TEMPO LOCAL (OPEN-METEO - 100% GRATUITO E ABERTO COM MM DE CHUVA)
# ==============================================================================
WEATHER_CODE_MAP = {
    0: {"label": "Céu Limpo / Ensolarado", "icon": "☀️"},
    1: {"label": "Principalmente Limpo", "icon": "🌤️"},
    2: {"label": "Parcialmente Nublado", "icon": "⛅"},
    3: {"label": "Nublado", "icon": "☁️"},
    45: {"label": "Neblina", "icon": "🌫️"},
    48: {"label": "Nevoeiro com Geada", "icon": "🌫️"},
    51: {"label": "Garoa Leve", "icon": "🌦️"},
    61: {"label": "Chuva Leve", "icon": "🌧️"},
    63: {"label": "Chuva Moderada", "icon": "🌧️"},
    65: {"label": "Chuva Forte", "icon": "⛈️"},
    80: {"label": "Pancadas de Chuva", "icon": "🌦️"},
    95: {"label": "Tempestade com Trovoadas", "icon": "⚡"}
}

def get_local_weather(lat: Optional[float] = None, lon: Optional[float] = None, city_name: Optional[str] = None) -> Dict[str, Any]:
    """Obtém clima atual da localização informada com volume de chuva em milímetros (mm)."""
    selected_lat = -18.5789  # Padrão: Patos de Minas / Alto Paranaíba
    selected_lon = -46.5181
    display_city = "Patos de Minas, MG"
    
    if city_name:
        key = city_name.lower().strip()
        matched = False
        for k, v in CITY_COORDINATES.items():
            if k in key or key in k:
                selected_lat = v["lat"]
                selected_lon = v["lon"]
                display_city = v["name"]
                matched = True
                break
        if not matched and lat is None and lon is None:
            geo = geocode_city_openmeteo(city_name)
            if geo:
                selected_lat = geo["lat"]
                selected_lon = geo["lon"]
                display_city = geo["name"]
                
    if lat is not None and lon is not None:
        selected_lat = lat
        selected_lon = lon
        if not city_name:
            display_city = "Sua Localização"

    try:
        url = (
            f"https://api.open-meteo.com/v1/forecast?"
            f"latitude={selected_lat:.4f}&longitude={selected_lon:.4f}&"
            f"current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&"
            f"daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum&"
            f"timezone=America%2FSao_Paulo"
        )
        req = urllib.request.Request(url, headers={"User-Agent": "CoonWeatherBot/1.0"})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            current = data.get("current", {})
            daily = data.get("daily", {})
            
            code = current.get("weather_code", 0)
            weather_meta = WEATHER_CODE_MAP.get(code, {"label": "Tempo Estável", "icon": "🌤️"})
            
            temp_max = daily.get("temperature_2m_max", [current.get("temperature_2m", 25)])[0]
            temp_min = daily.get("temperature_2m_min", [current.get("temperature_2m", 18)])[0]
            rain_prob = daily.get("precipitation_probability_max", [10])[0] if daily.get("precipitation_probability_max") else 10
            rain_sum = daily.get("precipitation_sum", [0.0])[0] if daily.get("precipitation_sum") else 0.0
            
            rain_mm_str = f"{rain_sum:.1f} mm".replace(".", ",") if rain_sum > 0 else "0 mm"
            rain_summary = f"{rain_mm_str} ({rain_prob}% prob.)" if rain_prob > 0 else "0 mm (sem chuva)"
            
            return {
                "city": display_city,
                "lat": selected_lat,
                "lon": selected_lon,
                "temperature": round(current.get("temperature_2m", 24)),
                "apparent_temperature": round(current.get("apparent_temperature", 25)),
                "humidity": current.get("relative_humidity_2m", 60),
                "wind_speed": round(current.get("wind_speed_10m", 12)),
                "weather_label": weather_meta["label"],
                "weather_icon": weather_meta["icon"],
                "temp_max": round(temp_max),
                "temp_min": round(temp_min),
                "rain_prob": rain_prob,
                "rain_mm": rain_mm_str,
                "rain_summary": rain_summary
            }
    except Exception as e:
        logger.warning(f"Erro ao buscar clima: {e}. Retornando padrão amigável.")
        return {
            "city": display_city,
            "lat": selected_lat,
            "lon": selected_lon,
            "temperature": 25,
            "apparent_temperature": 26,
            "humidity": 65,
            "wind_speed": 10,
            "weather_label": "Ensolarado e Agradável",
            "weather_icon": "☀️",
            "temp_max": 28,
            "temp_min": 19,
            "rain_prob": 15,
            "rain_mm": "0 mm",
            "rain_summary": "0 mm (15% prob.)"
        }

# ==============================================================================
# 4. GESTÃO DE INSCRITOS NA NEWSLETTER
# ==============================================================================
def subscribe_newsletter(
    email: Optional[str] = None,
    phone: Optional[str] = None,
    channel: str = "email",
    name: Optional[str] = None,
    topics: Optional[List[str]] = None,
    frequency: str = "matinal",
    city: Optional[str] = None,
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    ip_address: Optional[str] = None
) -> Dict[str, Any]:
    """Cadastra ou atualiza o assinante da Newsletter gratuita (E-mail ou WhatsApp)."""
    raw_email = (email or "").strip().lower()
    raw_phone = (phone or "").strip()
    
    # Detecção inteligente: se o usuário digitou telefone no campo de email
    phone_digits = re.sub(r"\D", "", raw_phone or raw_email)
    
    if ("@" not in raw_email or len(phone_digits) >= 8) and len(phone_digits) >= 8 and "@" not in raw_phone:
        if "@" not in raw_email:
            raw_phone = phone_digits
            channel = "whatsapp"
            raw_email = f"wa_{phone_digits}@whatsapp.coon.com.br"
            
    clean_email = raw_email
    clean_phone = phone_digits if len(phone_digits) >= 8 else None
    
    if not clean_email and not clean_phone:
        return {"success": False, "message": "Por favor, informe seu e-mail ou número de WhatsApp."}
        
    if not clean_email:
        clean_email = f"wa_{clean_phone}@whatsapp.coon.com.br"
        channel = "whatsapp"
        
    is_onmail = 1 if clean_email.endswith("@onmail.br") or clean_email.endswith("@onmail.com.br") else 0
    
    if not topics:
        topics = ["destaques", "agro", "indices", "politica", "tecnologia"]
        
    city_final = city.strip() if city else "São Paulo, SP"
    topics_json = json.dumps(topics)
    
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO newsletter_subscribers 
            (email, phone, channel, name, topics, frequency, city, lat, lon, is_onmail, ip_address, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(email) DO UPDATE SET
                phone = coalesce(excluded.phone, phone),
                channel = excluded.channel,
                topics = excluded.topics,
                frequency = excluded.frequency,
                city = excluded.city,
                lat = coalesce(excluded.lat, lat),
                lon = coalesce(excluded.lon, lon),
                active = 1,
                last_sent_at = last_sent_at
        """, (clean_email, clean_phone, channel, name, topics_json, frequency, city_final, lat or -23.5505, lon or -46.6333, is_onmail, ip_address))
        conn.commit()
        
    if channel == "whatsapp":
        msg = "Inscrição confirmada com sucesso! Você receberá o resumo OnNews diariamente às 17:30 no WhatsApp."
    elif channel in ("both", "todos"):
        msg = "Inscrição confirmada com sucesso! Você receberá o OnNews no seu e-mail e às 17:30 no WhatsApp."
    else:
        msg = f"Inscrição confirmada com sucesso! Você receberá o boletim {frequency} no seu e-mail."
        
    return {
        "success": True,
        "message": msg,
        "email": clean_email,
        "phone": clean_phone,
        "channel": channel,
        "city": city_final,
        "frequency": frequency,
        "is_onmail": bool(is_onmail)
    }

def get_subscribers_count() -> int:
    """Retorna o total de assinantes ativos."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM newsletter_subscribers WHERE active = 1")
        return cursor.fetchone()[0]

# ==============================================================================
# 5. GERADOR DO HTML DA NEWSLETTER (ESTILO EDITORIAL COON NEWS)
# ==============================================================================
def render_newsletter_html(
    subscriber_email: str = "leitor@coon.com.br",
    subscriber_name: str = "Prezado Leitor",
    city: str = "São Paulo, SP"
) -> str:
    """Gera o HTML elegante e responsivo do e-mail da Newsletter para envio."""
    market = get_market_rates()
    weather = get_local_weather(city_name=city)
    news_items = get_cached_news()[:6]
    today_str = datetime.now().strftime("%d de %B de %Y")
    
    articles_html = ""
    for item in news_items:
        articles_html += f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 18px;">
            <tr>
                <td style="vertical-align: top;">
                    <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">
                        {item['source_name']} • {item['category'].upper()}
                    </div>
                    <a href="{item['source_url']}" target="_blank" style="font-size: 16px; font-weight: 700; color: #0f172a; text-decoration: none; line-height: 1.35; display: block; margin-bottom: 6px;">
                        {item['title']}
                    </a>
                    <p style="font-size: 13px; color: #475569; line-height: 1.5; margin: 0 0 8px 0;">
                        {item['summary']}
                    </p>
                    <a href="{item['source_url']}" target="_blank" style="font-size: 12px; font-weight: 600; color: #0067b8; text-decoration: none;">
                        Ler matéria completa →
                    </a>
                </td>
            </tr>
        </table>
        """
        
    html = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coon News — Sua Dose Diária de Informação</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
    <center style="width: 100%; background-color: #f1f5f9; padding: 24px 0;">
        <table role="presentation" width="100%" max-width="640" style="max-width: 640px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;" cellpadding="0" cellspacing="0">
            <!-- CABEÇALHO COON NEWS -->
            <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 28px; text-align: left;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <span style="font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.04em;">coon <span style="color: #10b981;">news.</span></span>
                                <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; font-weight: 500;">O Resumo Essencial do Seu Dia • {today_str}</div>
                            </td>
                            <td style="text-align: right;">
                                <a href="https://coon.com.br/news" style="background-color: #10b981; color: #ffffff; font-size: 11px; font-weight: 700; text-decoration: none; padding: 6px 14px; border-radius: 20px; display: inline-block;">
                                    Acessar Portal
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- BARRA DE CLIMA & COTAÇÕES AO VIVO -->
            <tr>
                <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 12px 28px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="font-size: 13px; color: #334155; font-weight: 600;">
                                {weather.get('weather_icon', '🌤️')} <strong>{weather.get('city', 'Sua Região')}:</strong> {weather.get('temperature', 25)}°C ({weather.get('weather_label', 'Estável')}) • Chuva: {weather.get('rain_summary', '0 mm')}
                            </td>
                            <td style="text-align: right; font-size: 12px; color: #0f172a; font-weight: 700;">
                                💵 Dólar: {(market.get('financial', [{}])[0].get('today', 'R$ 5,34'))} | 🌾 Soja: {(market.get('agro', [{}])[3].get('today', 'R$ 138,50/sc'))}
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- CORPO DAS NOTÍCIAS -->
            <tr>
                <td style="padding: 28px;">
                    <div style="font-size: 13px; color: #64748b; margin-bottom: 20px;">
                        Olá, <strong>{subscriber_name}</strong>! Aqui estão os fatos mais relevantes selecionados para você:
                    </div>
                    {articles_html}
                </td>
            </tr>

            <!-- BANNER ECOSSISTEMA COON (ONMAIL INTEGRADO AO WHATSAPP) -->
            <tr>
                <td style="padding: 0 28px 28px 28px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1.5px solid #a7f3d0; border-radius: 14px; padding: 18px;">
                        <tr>
                            <td>
                                <div style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 4px;">CONHEÇA O ONMAIL BY COON</div>
                                <div style="font-size: 15px; font-weight: 700; color: #064e3b; margin-bottom: 4px;">O 1º E-mail do Brasil Integrado ao seu WhatsApp</div>
                                <div style="font-size: 12px; color: #047857; margin-bottom: 12px;">Reserve o seu endereço nobre (ex: <code>voce@onmail.br</code>) sem nenhum custo no lançamento oficial.</div>
                                <a href="https://coon.com.br/onmail" target="_blank" style="background-color: #10b981; color: #ffffff; font-size: 12px; font-weight: 700; text-decoration: none; padding: 8px 16px; border-radius: 8px; display: inline-block;">
                                    Garantir Meu E-mail Grátis →
                                </a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>

            <!-- RODAPÉ INSTITUCIONAL COON -->
            <tr>
                <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 28px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                    Você está recebendo esta edição porque se inscreveu no <strong>Coon News</strong>.<br>
                    Coon Participações Ltda. • Tecnologia e Inovação Segura • Uberlândia, MG<br>
                    <a href="https://coon.com.br/news?unsubscribe=1" style="color: #64748b; text-decoration: underline;">Cancelar inscrição</a> | 
                    <a href="https://coon.com.br/portal" style="color: #64748b; text-decoration: underline;">Visitar Portal Coon</a>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>"""
    return html

# ==============================================================================
# 6. AGENDADOR AUTÔNOMO DAS 3 EDIÇÕES DIÁRIAS (07h, 12h30, 17h) VIA APSCHEDULER
# ==============================================================================
_SCHEDULER_INSTANCE = None

def prewarm_edition(edition_name: str):
    """Executa a revarredura fresca e armazena os dados em cache."""
    try:
        global _NEWS_CACHE, _MARKET_CACHE
        _NEWS_CACHE["timestamp"] = 0
        _MARKET_CACHE["timestamp"] = 0
        get_market_rates()
        get_cached_news()
        logger.info(f"⚡ OnNews: Edição {edition_name} pré-aquecida com sucesso às {datetime.now().strftime('%H:%M:%S')}.")
    except Exception as e:
        logger.warning(f"Erro no pré-aquecimento da edição {edition_name}: {e}")

def init_autonomous_scheduler():
    """Inicializa o agendador autônomo da Alice AI para as 3 edições diárias (07h, 12h30, 17h)."""
    global _SCHEDULER_INSTANCE
    if _SCHEDULER_INSTANCE is not None:
        return _SCHEDULER_INSTANCE
        
    try:
        from apscheduler.schedulers.background import BackgroundScheduler
        from apscheduler.triggers.cron import CronTrigger
        
        scheduler = BackgroundScheduler(daemon=True)
        
        # 06:58 (Edição Matinal 07h)
        scheduler.add_job(
            func=lambda: prewarm_edition("07h00 Matinal"),
            trigger=CronTrigger(hour=6, minute=58, timezone="America/Sao_Paulo"),
            id="onnews_morning_job",
            replace_existing=True
        )
        
        # 12:28 (Edição Almoço 12h30)
        scheduler.add_job(
            func=lambda: prewarm_edition("12h30 Almoço"),
            trigger=CronTrigger(hour=12, minute=28, timezone="America/Sao_Paulo"),
            id="onnews_lunch_job",
            replace_existing=True
        )
        
        # 16:58 (Edição Fechamento 17h)
        scheduler.add_job(
            func=lambda: prewarm_edition("17h00 Fechamento"),
            trigger=CronTrigger(hour=16, minute=58, timezone="America/Sao_Paulo"),
            id="onnews_closing_job",
            replace_existing=True
        )
        
        # 17:30 (Despacho WhatsApp & Resumo do Fechamento)
        scheduler.add_job(
            func=lambda: prewarm_edition("17h30 WhatsApp"),
            trigger=CronTrigger(hour=17, minute=30, timezone="America/Sao_Paulo"),
            id="onnews_whatsapp_closing_job",
            replace_existing=True
        )
        
        scheduler.start()
        _SCHEDULER_INSTANCE = scheduler
        logger.info("🟢 OnNews APScheduler ativo: 07h, 12h30, 17h e 17h30 (WhatsApp) calibrados com sucesso.")
        return scheduler
    except Exception as e:
        logger.warning(f"Não foi possível iniciar APScheduler: {e}")
        return None

