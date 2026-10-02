"""Marketplace de Templates para Campanhas"""

import logging
from typing import Dict, List
from datetime import datetime

logger = logging.getLogger(__name__)


class TemplateManager:
    """Gerencia templates de campanhas no marketplace"""

    def __init__(self):
        self.templates = {}

    def create_template(
        self,
        creator_id: str,
        name: str,
        description: str,
        category: str,
        platforms: List[str],
        price: float = 0  # Gratuito por padrão
    ) -> Dict:
        """Create campaign template"""

        template_id = f"tpl_{datetime.now().timestamp()}"

        template = {
            "id": template_id,
            "creator_id": creator_id,
            "name": name,
            "description": description,
            "category": category,
            "platforms": platforms,
            "price": price,
            "status": "active",
            "downloads": 0,
            "rating": 5.0,
            "created_at": datetime.now().isoformat(),
            "preview_url": f"https://ads-inteligente.com/template/{template_id}"
        }

        self.templates[template_id] = template
        logger.info(f"Template created: {template_id}")
        return template

    def get_template(self, template_id: str) -> Dict:
        """Retrieve template details"""
        return self.templates.get(template_id, {})

    def list_templates(self, category: str = None, sort_by: str = "popular") -> List[Dict]:
        """List templates with optional filtering"""

        results = list(self.templates.values())

        if category:
            results = [t for t in results if t["category"] == category]

        # Sort by downloads (popularity) or rating
        if sort_by == "popular":
            results.sort(key=lambda x: x["downloads"], reverse=True)
        elif sort_by == "rating":
            results.sort(key=lambda x: x["rating"], reverse=True)
        elif sort_by == "new":
            results.sort(key=lambda x: x["created_at"], reverse=True)

        return results

    def rate_template(self, template_id: str, rating: int) -> Dict:
        """Rate a template (1-5 stars)"""

        if template_id not in self.templates:
            return {"error": "Template not found"}

        template = self.templates[template_id]
        # Simple average (TODO: weighted by number of ratings)
        template["rating"] = rating

        return {"template_id": template_id, "rating": rating}

    def download_template(self, template_id: str, user_id: str) -> Dict:
        """Download template and track usage"""

        if template_id not in self.templates:
            return {"error": "Template not found"}

        template = self.templates[template_id]
        template["downloads"] += 1

        return {
            "template_id": template_id,
            "content": {
                "name": template["name"],
                "audience": {"age_min": 18, "age_max": 65},
                "budget": {"daily": 50},
                "platforms": template["platforms"]
            }
        }

    def search_templates(self, query: str) -> List[Dict]:
        """Search templates by keyword"""

        results = [
            t for t in self.templates.values()
            if query.lower() in t["name"].lower()
            or query.lower() in t["description"].lower()
        ]

        return results

    def get_creator_templates(self, creator_id: str) -> List[Dict]:
        """Get all templates created by user"""
        return [t for t in self.templates.values() if t["creator_id"] == creator_id]


def get_template_manager():
    return TemplateManager()
