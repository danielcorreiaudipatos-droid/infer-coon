import os
import numpy as np
from PIL import Image

def fix_coon_wall_exact():
    src_path = "C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/jessica_realista_1790559354909.jpg"
    dst_path = "c:/Users/Acer/Documents/infer-coon/frontend/jessica_avatar.jpg"
    
    im = Image.open(src_path).convert("RGB")
    arr = np.array(im).astype(float)
    
    # 1. Colors:
    # c: #1d4ed8 (Royal Blue)
    # o1: #2563eb -> #0ea5e9 (Vibrant Blue to Electric Cyan)
    # o2: #0ea5e9 -> #10b981 (Electric Cyan to Emerald)
    # n: #10b981 (Emerald Green)
    # dot (baseline dot after n): #00e575 (Cyber Green)
    
    for y in range(95, 230):
        for x in range(40, 440):
            r, g, b = arr[y, x]
            
            is_letter = False
            target_rgb = None
            
            # c: x in [40, 140]
            if 40 <= x <= 140 and (b > r + 8 or (r < 70 and g < 90 and b > 85)):
                is_letter = True
                t = (x - 40) / 100.0
                target_rgb = np.array([29, 78, 216]) * (1 - t) + np.array([37, 99, 235]) * t
            
            # o1: x in [140, 235]
            elif 140 < x <= 235 and (b > r + 8 or (b > 105 and b > g - 15)):
                is_letter = True
                t = (x - 140) / 95.0
                target_rgb = np.array([37, 99, 235]) * (1 - t) + np.array([14, 165, 233]) * t
                
            # o2: x in [235, 330]
            elif 235 < x <= 330:
                dist = np.sqrt((x - 280)**2 + (y - 163)**2)
                if 17 <= dist <= 45 or (b > r + 8):
                    is_letter = True
                    t = (x - 235) / 95.0
                    target_rgb = np.array([14, 165, 233]) * (1 - t) + np.array([16, 185, 129]) * t
                    
            # n: x in [330, 395]
            elif 330 < x <= 395 and (b > r + 8 or (g > r + 5)):
                is_letter = True
                target_rgb = np.array([16, 185, 129], dtype=float)
                
            # Baseline dot after 'n': x in [395, 435], y in [165, 215]
            elif 395 < x <= 435 and 165 <= y <= 215 and (b > r + 8 or (x - 414)**2 + (y - 188)**2 <= 16**2):
                is_letter = True
                target_rgb = np.array([0, 229, 117], dtype=float) # Cyber Green
                
            if is_letter and target_rgb is not None:
                lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
                shaded = target_rgb * (lum * 1.35)
                shaded = np.clip(shaded, 0, 255)
                
                arr[y, x, 0] = shaded[0] * 0.92 + r * 0.08
                arr[y, x, 1] = shaded[1] * 0.92 + g * 0.08
                arr[y, x, 2] = shaded[2] * 0.92 + b * 0.08

    # Right side dot on glass wall:
    for y in range(120, 185):
        for x in range(880, 930):
            r, g, b = arr[y, x]
            if b > r + 15:
                lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
                shaded = np.array([0, 229, 117]) * (lum * 1.4)
                arr[y, x] = np.clip(shaded, 0, 255)

    final_im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")
    final_im.save(dst_path, quality=96)
    
    crop_wall = final_im.crop((30, 80, 480, 240))
    crop_wall.save("C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/wall_coon_fixed_preview.jpg")
    print("Wall color exactly finalized!")

if __name__ == "__main__":
    fix_coon_wall_exact()
