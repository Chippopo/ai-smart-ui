import os
from pathlib import Path
from palette_pipeline import PaletteRegressor, predict_image_palette
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
K = 5
model = PaletteRegressor(K=K, pretrained=False).to(device)
model.load_state_dict(torch.load("best_palette_model.pth", map_location=device))
model.eval()

img_folder = r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\ui_images"
img_paths = list(Path(img_folder).glob("*.*"))

for img_path in img_paths:
    hex_palette = predict_image_palette(model, str(img_path), K=K, device=device)
    print(img_path.name, "->", hex_palette)
