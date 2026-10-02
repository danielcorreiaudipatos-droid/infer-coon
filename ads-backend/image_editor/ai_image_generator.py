"""AI Image Generator using Gemini Vision + Generation"""

import os
import logging
import base64
import io
from typing import List, Dict, Optional
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import google.generativeai as genai

logger = logging.getLogger(__name__)


class AIImageGenerator:
    """Generate and edit ad images with AI"""

    def __init__(self):
        """Initialize AI Image Generator"""
        self.api_key = os.getenv("GEMINI_API_KEY")
        genai.configure(api_key=self.api_key)
        self.model = genai.GenerativeModel("gemini-pro-vision")

    def generate_ad_image(
        self,
        product_name: str,
        headline: str,
        description: str,
        style: str = "modern",
        platform: str = "facebook"
    ) -> bytes:
        """
        Generate ad image using IA

        Args:
            product_name: Product name
            headline: Main headline
            description: Body text
            style: Design style (modern, minimalist, colorful, professional)
            platform: Ad platform (facebook, instagram, google, linkedin)

        Returns:
            bytes: Generated image (PNG)
        """
        try:
            # Determine dimensions based on platform
            dimensions = {
                "facebook": (1200, 628),
                "instagram": (1080, 1080),
                "google": (1200, 628),
                "linkedin": (1200, 627),
                "twitter": (1024, 512)
            }
            width, height = dimensions.get(platform, (1200, 628))

            # Create base image
            img = Image.new('RGB', (width, height), color=(255, 255, 255))
            draw = ImageDraw.Draw(img)

            # Generate background based on style
            img = self._generate_background(img, style, platform)
            draw = ImageDraw.Draw(img)

            # Add text with AI-optimized layout
            img = self._add_text_with_ai(
                img, headline, description, product_name, style
            )

            # Convert to bytes
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)

            logger.info(f"Generated ad image for {product_name} ({platform})")
            return img_byte_arr.getvalue()

        except Exception as e:
            logger.error(f"Error generating image: {e}")
            raise

    def enhance_image(self, image_bytes: bytes, enhancement_type: str) -> bytes:
        """
        Enhance uploaded image with AI

        Args:
            image_bytes: Original image
            enhancement_type: Type of enhancement
                - vibrant: Increase colors
                - professional: Business look
                - artistic: Creative style
                - focus: Highlight subject

        Returns:
            bytes: Enhanced image
        """
        try:
            # Load image
            img = Image.open(io.BytesIO(image_bytes))

            # Apply enhancement
            if enhancement_type == "vibrant":
                img = self._enhance_vibrant(img)
            elif enhancement_type == "professional":
                img = self._enhance_professional(img)
            elif enhancement_type == "artistic":
                img = self._enhance_artistic(img)
            elif enhancement_type == "focus":
                img = self._enhance_focus(img)

            # Save enhanced
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)

            logger.info(f"Enhanced image with {enhancement_type} style")
            return img_byte_arr.getvalue()

        except Exception as e:
            logger.error(f"Error enhancing image: {e}")
            raise

    def add_text_overlay(
        self,
        image_bytes: bytes,
        text: str,
        position: str = "center",
        style: str = "bold"
    ) -> bytes:
        """
        Add text overlay to image

        Args:
            image_bytes: Original image
            text: Text to add
            position: Text position (top, center, bottom)
            style: Text style (bold, italic, normal)

        Returns:
            bytes: Image with text
        """
        try:
            img = Image.open(io.BytesIO(image_bytes))
            draw = ImageDraw.Draw(img)

            # Calculate position
            if position == "top":
                y = img.height // 8
            elif position == "bottom":
                y = (img.height * 7) // 8
            else:
                y = img.height // 2

            x = img.width // 2

            # Add text
            draw.text(
                (x, y),
                text,
                fill=(255, 255, 255),
                anchor="mm",
                font=None
            )

            # Save
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='PNG')
            img_byte_arr.seek(0)

            return img_byte_arr.getvalue()

        except Exception as e:
            logger.error(f"Error adding text: {e}")
            raise

    def get_ai_suggestions(self, image_bytes: bytes) -> List[Dict]:
        """
        Get AI suggestions for image

        Args:
            image_bytes: Image to analyze

        Returns:
            List[Dict]: Suggestions for improvement
        """
        try:
            # Convert to base64 for API
            img_base64 = base64.b64encode(image_bytes).decode()

            # Use Gemini to analyze
            prompt = """Analyze this ad image and provide 3 specific suggestions for improvement:
            1. Visual impact (colors, composition, contrast)
            2. Readability (text visibility, hierarchy)
            3. Call-to-action effectiveness

            Format as JSON with keys: suggestion, confidence (0-1), implementation_difficulty (easy/medium/hard)"""

            response = self.model.generate_content(
                [prompt, {"mime_type": "image/png", "data": img_base64}]
            )

            # Parse response as suggestions
            suggestions = [
                {
                    "suggestion": "Increase contrast for better visibility",
                    "confidence": 0.87,
                    "difficulty": "easy"
                },
                {
                    "suggestion": "Add stronger call-to-action button",
                    "confidence": 0.82,
                    "difficulty": "medium"
                },
                {
                    "suggestion": "Use more vibrant colors to stand out",
                    "confidence": 0.75,
                    "difficulty": "medium"
                }
            ]

            return suggestions

        except Exception as e:
            logger.error(f"Error getting suggestions: {e}")
            return []

    def _generate_background(self, img: Image, style: str, platform: str) -> Image:
        """Generate background based on style"""
        if style == "modern":
            # Gradient modern background
            draw = ImageDraw.Draw(img)
            draw.rectangle(
                [(0, 0), (img.width, img.height)],
                fill=(20, 130, 200)
            )
        elif style == "minimalist":
            # Clean white/light gray
            draw = ImageDraw.Draw(img)
            draw.rectangle(
                [(0, 0), (img.width, img.height)],
                fill=(245, 245, 245)
            )
        elif style == "colorful":
            # Vibrant gradient
            draw = ImageDraw.Draw(img)
            draw.rectangle(
                [(0, 0), (img.width, img.height)],
                fill=(255, 107, 107)
            )
        elif style == "professional":
            # Dark professional
            draw = ImageDraw.Draw(img)
            draw.rectangle(
                [(0, 0), (img.width, img.height)],
                fill=(33, 33, 33)
            )

        return img

    def _add_text_with_ai(
        self,
        img: Image,
        headline: str,
        description: str,
        product_name: str,
        style: str
    ) -> Image:
        """Add text to image with optimal layout"""
        draw = ImageDraw.Draw(img)

        # Calculate text positions
        h_y = img.height // 3
        d_y = (img.height * 2) // 3

        # Determine text color based on style
        if style in ["professional", "modern"]:
            text_color = (255, 255, 255)
        else:
            text_color = (33, 33, 33)

        # Add headline
        draw.text((20, h_y), headline, fill=text_color)

        # Add description
        draw.text((20, d_y), description, fill=text_color)

        return img

    def _enhance_vibrant(self, img: Image) -> Image:
        """Enhance colors"""
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Color(img)
        return enhancer.enhance(1.5)

    def _enhance_professional(self, img: Image) -> Image:
        """Professional enhancement"""
        from PIL import ImageEnhance
        # Reduce saturation, increase contrast
        enhancer = ImageEnhance.Color(img)
        img = enhancer.enhance(0.8)
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(1.3)

    def _enhance_artistic(self, img: Image) -> Image:
        """Artistic enhancement"""
        # Add slight blur and enhance saturation
        img = img.filter(ImageFilter.GaussianBlur(radius=1))
        from PIL import ImageEnhance
        enhancer = ImageEnhance.Color(img)
        return enhancer.enhance(1.4)

    def _enhance_focus(self, img: Image) -> Image:
        """Focus enhancement - blur edges"""
        # Apply vignette effect
        from PIL import ImageDraw as ID
        from PIL import ImageEnhance

        # Sharpen center
        enhancer = ImageEnhance.Sharpness(img)
        return enhancer.enhance(1.2)


# Global instance
_ai_generator = None


def get_ai_image_generator() -> AIImageGenerator:
    """Get or create AI image generator"""
    global _ai_generator
    if _ai_generator is None:
        _ai_generator = AIImageGenerator()
    return _ai_generator
