import os
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

def create_gradient_text_mask(text, font, width, height, gradient_stops):
    # Create mask of text
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    draw.text((0, 0), text, font=font, fill=255)
    
    # Create gradient image
    gradient = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    grad_arr = np.zeros((height, width, 4), dtype=np.uint8)
    
    for x in range(width):
        t = x / max(1, width - 1)
        # Interpolate between stops
        for i in range(len(gradient_stops) - 1):
            t0, c0 = gradient_stops[i]
            t1, c1 = gradient_stops[i+1]
            if t0 <= t <= t1:
                lt = (t - t0) / (t1 - t0)
                col = [int(c0[j] * (1 - lt) + c1[j] * lt) for j in range(3)]
                grad_arr[:, x, :3] = col
                grad_arr[:, x, 3] = 255
                break
    
    grad_img = Image.fromarray(grad_arr, "RGBA")
    
    # Combine gradient with text mask
    result = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    result.paste(grad_img, (0, 0), mask)
    return result, mask

def build_perfect_avatar():
    src_path = "C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/jessica_realista_1790559354909.jpg"
    dst_path = "c:/Users/Acer/Documents/infer-coon/frontend/jessica_avatar.jpg"
    
    im = Image.open(src_path).convert("RGBA")
    
    # In the original image, let's patch the wall area where the letters were located
    # Wall background texture can be sampled and blurred to clean the wall naturally
    # Left logo area: (35, 80, 420, 240)
    # Right logo area: (550, 90, 770, 230)
    
    # Clean left wall region using inpainting/texture synthesis from adjacent wall
    # We sample a clean patch of the concrete wall from (30, 20, 400, 80) and below
    wall_sample = im.crop((35, 20, 420, 80)).resize((385, 160))
    wall_sample = wall_sample.filter(ImageFilter.GaussianBlur(radius=3))
    im.paste(wall_sample, (35, 80))
    
    # Clean right glass region (540, 85, 780, 230)
    glass_sample = im.crop((540, 20, 780, 80)).resize((240, 145))
    glass_sample = glass_sample.filter(ImageFilter.GaussianBlur(radius=2))
    im.paste(glass_sample, (540, 85))
    
    # Now render the official Co.on 3D acrylic signage on the left concrete wall
    # Font: Segoe UI Bold or Arial Bold
    font_path = "C:/Windows/Fonts/segoeuib.ttf"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/arialbd.ttf"
    
    font_size = 105
    font = ImageFont.truetype(font_path, font_size)
    
    # Official Co.on Gradient: Royal Blue -> Vibrant Blue -> Electric Cyan -> Emerald Green -> Cyber Green
    gradient_stops = [
        (0.00, (29, 78, 216)),    # #1d4ed8
        (0.25, (37, 99, 235)),    # #2563eb
        (0.50, (14, 165, 233)),   # #0ea5e9
        (0.78, (16, 185, 129)),   # #10b981
        (1.00, (0, 229, 117))     # #00e575
    ]
    
    text = "coon."
    bbox = font.getbbox(text)
    tw = bbox[2] - bbox[0] + 30
    th = bbox[3] - bbox[1] + 30
    
    text_img, mask = create_gradient_text_mask(text, font, tw, th, gradient_stops)
    
    # Create soft drop-shadow for 3D acrylic effect on wall
    shadow_mask = mask.filter(ImageFilter.GaussianBlur(radius=6))
    shadow = Image.new("RGBA", (tw, th), (15, 23, 42, 130))
    
    # Position on left wall
    pos_x = 55
    pos_y = 95
    
    # Paste drop shadow slightly offset down and right (spotlight from above-left)
    im.paste(shadow, (pos_x + 5, pos_y + 8), shadow_mask)
    
    # Paste second sharper contact shadow
    sharp_shadow = Image.new("RGBA", (tw, th), (10, 15, 30, 90))
    im.paste(sharp_shadow, (pos_x + 2, pos_y + 4), mask.filter(ImageFilter.GaussianBlur(radius=2)))
    
    # Paste the vibrant gradient 3D acrylic text
    im.paste(text_img, (pos_x, pos_y), text_img)
    
    # Also render on the right frosted glass partition: 'coon. tecnologias' with clean styling
    font_right = ImageFont.truetype(font_path, 42)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 26)
    
    right_text = "coon."
    rt_img, rt_mask = create_gradient_text_mask(right_text, font_right, 180, 60, gradient_stops)
    
    # Frosted glass soft shadow
    rt_shadow = Image.new("RGBA", (180, 60), (30, 41, 59, 90))
    im.paste(rt_shadow, (582, 114), rt_mask.filter(ImageFilter.GaussianBlur(radius=3)))
    im.paste(rt_img, (580, 112), rt_img)
    
    # Subtitle 'tecnologias' in elegant slate
    sub_draw = ImageDraw.Draw(im)
    sub_draw.text((580, 160), "tecnologias", font=font_sub, fill=(100, 116, 139, 210))
    
    final_rgb = im.convert("RGB")
    final_rgb.save(dst_path, quality=96)
    
    # Save preview in brain
    preview_path = "C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/jessica_perfect_coon_wall.jpg"
    final_rgb.save(preview_path, quality=96)
    
    # Save wall crop
    crop_wall = final_rgb.crop((30, 70, 820, 260))
    crop_wall.save("C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/wall_final_inspection.jpg")
    print("Perfect Co.on wall generated successfully!")

if __name__ == "__main__":
    build_perfect_avatar()
