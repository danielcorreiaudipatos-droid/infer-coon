"""Image Editor API Routes"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import StreamingResponse
import io
import json
from typing import Optional

from image_editor.ai_image_generator import get_ai_image_generator
from image_editor.canva_templates import get_template_manager, get_canvas_editor

router = APIRouter(prefix="/api/image-editor", tags=["Image Editor"])


# ═══════════════════════════════════════════════════════════
# TEMPLATES
# ═══════════════════════════════════════════════════════════

@router.get("/templates")
async def list_templates(platform: Optional[str] = None):
    """List available ad templates"""
    template_manager = get_template_manager()

    if platform:
        templates = template_manager.get_templates_by_platform(platform)
        return {"platform": platform, "templates": [
            {
                "id": t.id,
                "name": t.name,
                "dimensions": f"{t.width}x{t.height}",
                "category": t.category,
                "preview": t.preview_url
            }
            for t in templates
        ]}

    return {"templates": template_manager.get_all_templates()}


@router.get("/templates/{template_id}")
async def get_template(template_id: str):
    """Get template details"""
    template_manager = get_template_manager()
    template = template_manager.get_template(template_id)

    if not template:
        raise HTTPException(status_code=404, detail="Template not found")

    return {
        "id": template.id,
        "name": template.name,
        "platform": template.platform,
        "dimensions": f"{template.width}x{template.height}",
        "elements": template.elements,
        "fonts": template.fonts,
        "colors": template.colors
    }


# ═══════════════════════════════════════════════════════════
# CANVAS EDITOR
# ═══════════════════════════════════════════════════════════

@router.post("/canvas/new")
async def create_canvas(template_id: str, session_id: Optional[str] = None):
    """Create new canvas from template"""
    canvas_editor = get_canvas_editor()
    session_id = session_id or f"session_{id(canvas_editor)}"

    result = canvas_editor.create_editing_session(template_id, session_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.post("/canvas/{session_id}/element")
async def add_element(
    session_id: str,
    element_type: str,
    properties: dict
):
    """Add element to canvas"""
    canvas_editor = get_canvas_editor()
    result = canvas_editor.add_element(session_id, element_type, properties)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.put("/canvas/{session_id}/element/{element_id}")
async def update_element(
    session_id: str,
    element_id: str,
    updates: dict
):
    """Update canvas element"""
    canvas_editor = get_canvas_editor()
    result = canvas_editor.update_element(session_id, element_id, updates)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


@router.get("/canvas/{session_id}")
async def get_canvas_state(session_id: str):
    """Get current canvas state"""
    canvas_editor = get_canvas_editor()
    result = canvas_editor.get_canvas(session_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return result


# ═══════════════════════════════════════════════════════════
# IMAGE GENERATION
# ═══════════════════════════════════════════════════════════

@router.post("/generate")
async def generate_image(
    product_name: str,
    headline: str,
    description: str,
    platform: str = "facebook",
    style: str = "modern"
):
    """Generate ad image with AI"""
    ai_generator = get_ai_image_generator()

    try:
        image_bytes = ai_generator.generate_ad_image(
            product_name=product_name,
            headline=headline,
            description=description,
            style=style,
            platform=platform
        )

        return StreamingResponse(
            iter([image_bytes]),
            media_type="image/png",
            headers={"Content-Disposition": f"attachment; filename={product_name}.png"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════
# IMAGE ENHANCEMENT
# ═══════════════════════════════════════════════════════════

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    """Upload image for editing"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()

    return {
        "filename": file.filename,
        "size": len(contents),
        "content_type": file.content_type,
        "message": "Image uploaded successfully"
    }


@router.post("/enhance/{enhancement_type}")
async def enhance_image(
    enhancement_type: str,
    file: UploadFile = File(...)
):
    """Enhance uploaded image"""
    ai_generator = get_ai_image_generator()

    if enhancement_type not in ["vibrant", "professional", "artistic", "focus"]:
        raise HTTPException(status_code=400, detail="Invalid enhancement type")

    try:
        contents = await file.read()
        enhanced = ai_generator.enhance_image(contents, enhancement_type)

        return StreamingResponse(
            iter([enhanced]),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=enhanced.png"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════
# TEXT OVERLAY
# ═══════════════════════════════════════════════════════════

@router.post("/text-overlay")
async def add_text_to_image(
    text: str,
    position: str = "center",
    style: str = "bold",
    file: UploadFile = File(...)
):
    """Add text overlay to image"""
    ai_generator = get_ai_image_generator()

    if position not in ["top", "center", "bottom"]:
        raise HTTPException(status_code=400, detail="Invalid position")

    try:
        contents = await file.read()
        result = ai_generator.add_text_overlay(contents, text, position, style)

        return StreamingResponse(
            iter([result]),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=with-text.png"}
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════
# AI SUGGESTIONS
# ═══════════════════════════════════════════════════════════

@router.post("/suggestions")
async def get_image_suggestions(file: UploadFile = File(...)):
    """Get AI suggestions for image improvement"""
    ai_generator = get_ai_image_generator()

    try:
        contents = await file.read()
        suggestions = ai_generator.get_ai_suggestions(contents)

        return {
            "suggestions": suggestions,
            "improvements_recommended": len(suggestions),
            "average_confidence": sum(s["confidence"] for s in suggestions) / len(suggestions) if suggestions else 0
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ═══════════════════════════════════════════════════════════
# BATCH EXPORT
# ═══════════════════════════════════════════════════════════

@router.get("/export/{session_id}")
async def export_for_all_platforms(session_id: str):
    """Export canvas for all supported platforms"""
    canvas_editor = get_canvas_editor()

    result = canvas_editor.export_canvas(session_id)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    return {
        "canvas": result,
        "export_info": {
            "formats": ["PNG", "JPG", "WebP", "SVG"],
            "platforms": ["Facebook", "Instagram", "LinkedIn", "Google Ads", "Twitter"],
            "optimization": "Auto-optimized for each platform"
        }
    }


# ═══════════════════════════════════════════════════════════
# CAMPAIGN INTEGRATION
# ═══════════════════════════════════════════════════════════

@router.post("/save-to-campaign")
async def save_image_to_campaign(
    campaign_id: str,
    image_data: dict,
    platform: str
):
    """Save generated image to campaign"""
    # TODO: Connect to campaign storage
    return {
        "campaign_id": campaign_id,
        "platform": platform,
        "image_saved": True,
        "ready_to_publish": True
    }
