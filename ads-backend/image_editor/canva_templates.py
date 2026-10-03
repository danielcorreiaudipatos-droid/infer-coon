"""Mini Canva - Ad Templates + Editor"""

from typing import List, Dict, Optional
from dataclasses import dataclass
import json


@dataclass
class Template:
    """Ad Template"""
    id: str
    name: str
    platform: str
    category: str
    width: int
    height: int
    elements: List[Dict]
    colors: List[str]
    fonts: List[str]
    preview_url: str


class CanvaTemplateManager:
    """Manage ad templates"""

    def __init__(self):
        """Initialize template manager"""
        self.templates = self._load_default_templates()

    def _load_default_templates(self) -> List[Template]:
        """Load default templates for each platform"""
        templates = [
            # Facebook Templates
            Template(
                id="fb_promo_1",
                name="Product Promotion",
                platform="facebook",
                category="promotional",
                width=1200,
                height=628,
                elements=[
                    {"type": "image", "position": "left", "width": 600},
                    {"type": "text_headline", "position": "right_top", "max_chars": 50},
                    {"type": "text_body", "position": "right_middle", "max_chars": 150},
                    {"type": "cta_button", "position": "right_bottom"}
                ],
                colors=["#1677FF", "#F5222D", "#FFFFFF"],
                fonts=["Roboto", "Poppins", "Inter"],
                preview_url="/previews/fb_promo_1.png"
            ),
            Template(
                id="fb_event_1",
                name="Event Announcement",
                platform="facebook",
                category="event",
                width=1200,
                height=628,
                elements=[
                    {"type": "image", "position": "full"},
                    {"type": "overlay", "color": "rgba(0,0,0,0.4)"},
                    {"type": "text_headline", "position": "center", "max_chars": 60},
                    {"type": "text_body", "position": "center_bottom", "max_chars": 100}
                ],
                colors=["#FF6B6B", "#4ECDC4", "#FFFFFF"],
                fonts=["Montserrat", "Open Sans"],
                preview_url="/previews/fb_event_1.png"
            ),

            # Instagram Templates
            Template(
                id="ig_square_1",
                name="Square Post",
                platform="instagram",
                category="product",
                width=1080,
                height=1080,
                elements=[
                    {"type": "background", "fill": "gradient"},
                    {"type": "image", "position": "center", "width": 800},
                    {"type": "text_headline", "position": "top", "max_chars": 40},
                    {"type": "text_body", "position": "bottom", "max_chars": 100}
                ],
                colors=["#FF1493", "#FFB6C1", "#FFFFFF"],
                fonts=["Raleway", "Quicksand"],
                preview_url="/previews/ig_square_1.png"
            ),
            Template(
                id="ig_story_1",
                name="Story Template",
                platform="instagram",
                category="story",
                width=1080,
                height=1920,
                elements=[
                    {"type": "image", "position": "full"},
                    {"type": "text_headline", "position": "top", "max_chars": 40},
                    {"type": "sticker_cta", "position": "bottom"}
                ],
                colors=["#9B59B6", "#E74C3C", "#FFFFFF"],
                fonts=["Poppins", "Ubuntu"],
                preview_url="/previews/ig_story_1.png"
            ),

            # LinkedIn Templates
            Template(
                id="li_article_1",
                name="Article Promotion",
                platform="linkedin",
                category="content",
                width=1200,
                height=627,
                elements=[
                    {"type": "image", "position": "left", "width": 600},
                    {"type": "text_headline", "position": "right", "max_chars": 60},
                    {"type": "text_body", "position": "right_middle", "max_chars": 200},
                    {"type": "company_logo", "position": "right_bottom"}
                ],
                colors=["#0A66C2", "#FFFFFF", "#555555"],
                fonts=["LinkedIn Sans", "Segoe UI"],
                preview_url="/previews/li_article_1.png"
            ),

            # Google Ads Templates
            Template(
                id="google_search_1",
                name="Search Ad",
                platform="google",
                category="search",
                width=1200,
                height=628,
                elements=[
                    {"type": "text_headline1", "max_chars": 30},
                    {"type": "text_headline2", "max_chars": 30},
                    {"type": "text_description", "max_chars": 80},
                    {"type": "display_url", "max_chars": 35}
                ],
                colors=["#1F2937", "#0A66C2"],
                fonts=["Google Sans"],
                preview_url="/previews/google_search_1.png"
            ),
        ]
        return templates

    def get_templates_by_platform(self, platform: str) -> List[Template]:
        """Get templates for specific platform"""
        return [t for t in self.templates if t.platform == platform]

    def get_template(self, template_id: str) -> Optional[Template]:
        """Get specific template"""
        for t in self.templates:
            if t.id == template_id:
                return t
        return None

    def get_all_templates(self) -> List[Dict]:
        """Get all templates as dicts"""
        return [
            {
                "id": t.id,
                "name": t.name,
                "platform": t.platform,
                "category": t.category,
                "dimensions": f"{t.width}x{t.height}",
                "preview": t.preview_url,
                "colors": t.colors,
                "fonts": t.fonts
            }
            for t in self.templates
        ]

    def customize_template(
        self,
        template_id: str,
        customizations: Dict
    ) -> Dict:
        """Customize template with user inputs"""
        template = self.get_template(template_id)
        if not template:
            return {"error": "Template not found"}

        # Apply customizations
        customized = {
            "template_id": template_id,
            "platform": template.platform,
            "dimensions": f"{template.width}x{template.height}",
            "elements": template.elements,
            "customizations": customizations,
            "available_fonts": template.fonts,
            "available_colors": template.colors,
            "preview_url": template.preview_url
        }

        return customized


class CanvasEditor:
    """Real-time canvas editor"""

    def __init__(self):
        """Initialize canvas editor"""
        self.template_manager = CanvaTemplateManager()
        self.editing_sessions = {}

    def create_editing_session(
        self,
        template_id: str,
        session_id: str
    ) -> Dict:
        """Create new editing session"""
        template = self.template_manager.get_template(template_id)
        if not template:
            return {"error": "Template not found"}

        session = {
            "session_id": session_id,
            "template_id": template_id,
            "canvas": {
                "width": template.width,
                "height": template.height,
                "elements": [],
                "background": {"type": "color", "value": "#FFFFFF"}
            },
            "history": [],
            "current_element": None
        }

        self.editing_sessions[session_id] = session
        return session

    def add_element(
        self,
        session_id: str,
        element_type: str,
        properties: Dict
    ) -> Dict:
        """Add element to canvas"""
        if session_id not in self.editing_sessions:
            return {"error": "Session not found"}

        session = self.editing_sessions[session_id]
        element = {
            "id": f"element_{len(session['canvas']['elements'])}",
            "type": element_type,
            "properties": properties,
            "position": properties.get("position", {"x": 0, "y": 0}),
            "size": properties.get("size", {"width": 100, "height": 100})
        }

        session["canvas"]["elements"].append(element)
        session["history"].append({"action": "add_element", "element": element})

        return {"success": True, "element": element}

    def update_element(
        self,
        session_id: str,
        element_id: str,
        updates: Dict
    ) -> Dict:
        """Update element properties"""
        if session_id not in self.editing_sessions:
            return {"error": "Session not found"}

        session = self.editing_sessions[session_id]

        for element in session["canvas"]["elements"]:
            if element["id"] == element_id:
                element["properties"].update(updates)
                session["history"].append({
                    "action": "update_element",
                    "element_id": element_id,
                    "updates": updates
                })
                return {"success": True, "element": element}

        return {"error": "Element not found"}

    def get_canvas(self, session_id: str) -> Dict:
        """Get current canvas state"""
        if session_id not in self.editing_sessions:
            return {"error": "Session not found"}

        return self.editing_sessions[session_id]["canvas"]

    def export_canvas(self, session_id: str) -> Dict:
        """Export canvas for rendering"""
        if session_id not in self.editing_sessions:
            return {"error": "Session not found"}

        session = self.editing_sessions[session_id]
        return {
            "template_id": session["template_id"],
            "canvas": session["canvas"],
            "export_formats": ["png", "jpg", "webp", "svg"]
        }


# Global instances
_template_manager = None
_canvas_editor = None


def get_template_manager() -> CanvaTemplateManager:
    """Get template manager"""
    global _template_manager
    if _template_manager is None:
        _template_manager = CanvaTemplateManager()
    return _template_manager


def get_canvas_editor() -> CanvasEditor:
    """Get canvas editor"""
    global _canvas_editor
    if _canvas_editor is None:
        _canvas_editor = CanvasEditor()
    return _canvas_editor
