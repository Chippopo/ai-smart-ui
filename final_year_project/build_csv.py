from palette_pipeline import build_palette_labels
from pathlib import Path

# Full path to your images folder
img_folder = r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\ui_images"
out_csv = r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\labels.csv"
K = 5

# List images to make sure the script sees them
img_paths = list(Path(img_folder).rglob("*.*"))
print("Found images:", img_paths)

if not img_paths:
    print("No images found. Check your folder path and file extensions.")
else:
    build_palette_labels(img_folder, out_csv, K)
