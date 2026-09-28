import os
import numpy as np
from PIL import Image

def get_coon_gradient_color(t):
    """
    Retorna a cor RGB do gradiente oficial Co.on para t em [0, 1].
    Paleta oficial:
    0.00: #1d4ed8 (29, 78, 216)   - Royal Blue
    0.25: #2563eb (37, 99, 235)   - Vibrant Blue
    0.50: #0ea5e9 (14, 165, 233)  - Electric Cyan
    0.75: #10b981 (16, 185, 129)  - Emerald Green
    1.00: #00e575 (0, 229, 117)   - Cyber Green
    """
    stops = [
        (0.00, np.array([29, 78, 216], dtype=float)),
        (0.25, np.array([37, 99, 235], dtype=float)),
        (0.50, np.array([14, 165, 233], dtype=float)),
        (0.75, np.array([16, 185, 129], dtype=float)),
        (1.00, np.array([0, 229, 117], dtype=float))
    ]
    t = np.clip(t, 0.0, 1.0)
    for i in range(len(stops) - 1):
        t0, c0 = stops[i]
        t1, c1 = stops[i+1]
        if t0 <= t <= t1:
            local_t = (t - t0) / (t1 - t0)
            return c0 * (1.0 - local_t) + c1 * local_t
    return stops[-1][1]

def recolor():
    src_path = "C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/jessica_realista_1790559354909.jpg"
    dst_path = "c:/Users/Acer/Documents/infer-coon/frontend/jessica_avatar.jpg"
    
    im = Image.open(src_path).convert("RGB")
    arr = np.array(im).astype(float)
    
    # 1. LOGO PRINCIPAL À ESQUERDA: x in [45, 385], y in [90, 225]
    # Caixa delimitadora das letras individuais
    # c: x in [45, 130]
    # o1: x in [130, 210]
    # o2: x in [210, 290]
    # n: x in [290, 360]
    # dot: x in [355, 385], y in [155, 215]
    
    x_min, x_max = 45.0, 385.0
    
    for y in range(85, 230):
        for x in range(45, 385):
            r, g, b = arr[y, x]
            
            # Detectar se é parte da letra 3D
            # Letras azuis (c, o1, n, dot): b > r + 15
            # Segunda letra 'o' (que veio cinza/branca):
            is_letter = False
            
            if b > r + 15:
                is_letter = True
            elif 205 <= x <= 290 and 105 <= y <= 220:
                # Centro do círculo o2 é aprox (248, 162), raio interno ~20, externo ~42
                dist_center = np.sqrt((x - 248)**2 + (y - 162)**2)
                if 17 <= dist_center <= 46:
                    is_letter = True
                elif r < 145 and g < 145 and b < 145 and dist_center <= 48:
                    # Sombra/chanfro do o2
                    is_letter = True
            
            if is_letter:
                t = (x - x_min) / (x_max - x_min)
                target_color = get_coon_gradient_color(t)
                
                # Luminosidade original para preservar sombreamento 3D
                lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
                
                # Mapeamento de brilho 3D realista
                shaded = target_color * (lum * 1.35)
                shaded = np.clip(shaded, 0, 255)
                
                # Aplica a cor do gradiente
                arr[y, x, 0] = shaded[0]
                arr[y, x, 1] = shaded[1]
                arr[y, x, 2] = shaded[2]

    # 2. LOGO SECUNDÁRIA À DIREITA: 'coon. tecnologias' (x in [550, 770], y in [95, 220])
    rx_min, rx_max = 550.0, 740.0
    for y in range(95, 185):
        for x in range(545, 750):
            r, g, b = arr[y, x]
            # O texto da direita é cinza ou azul no ponto
            # As letras 'coon' têm contraste com a parede
            lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255.0
            
            # Parede de fundo nesta região tem lum ~ 0.72 a 0.78
            # Letras cinzas têm lum < 0.65
            if lum < 0.64 or (b > r + 15):
                t = (x - rx_min) / (rx_max - rx_min)
                target_color = get_coon_gradient_color(t)
                shaded = target_color * (lum * 1.35)
                shaded = np.clip(shaded, 0, 255)
                arr[y, x, 0] = shaded[0]
                arr[y, x, 1] = shaded[1]
                arr[y, x, 2] = shaded[2]

    res_im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), "RGB")
    res_im.save(dst_path, quality=95)
    
    # Salvar prévia
    crop_wall = res_im.crop((50, 80, 850, 300))
    crop_wall.save("C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/wall_gradient_perfect.jpg")
    print("Recolor completed successfully!")

if __name__ == "__main__":
    recolor()
