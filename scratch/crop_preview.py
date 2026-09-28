from PIL import Image

im = Image.open('c:/Users/Acer/Documents/infer-coon/frontend/jessica_avatar.jpg')
crop_wall = im.crop((50, 80, 850, 300))
crop_wall.save('C:/Users/Acer/.gemini/antigravity/brain/f3e47e7e-181e-4499-b8e9-312564bbd2ee/wall_recolored_preview.jpg')
print('Preview cropped')
