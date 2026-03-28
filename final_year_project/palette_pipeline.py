"""
palette_pipeline.py

- Baseline palette extractor: KMeans on image pixels -> K representative colors
- Dataset builder: scans folder of images, computes KMeans palette -> writes CSV labels
- PyTorch Dataset: loads image + palette (RGB normalized 0..1)
- CNN model (ResNet18 backbone) that outputs K x 3 floats (RGB)
- Training/eval loop with MSE loss and color-matching metrics
"""

import os
import csv
import json
import random
from pathlib import Path
from typing import List, Tuple

import numpy as np
from PIL import Image
from tqdm import tqdm
from sklearn.cluster import KMeans

import torch
from torch import nn
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as T
import torchvision.models as models

# -------------------------
# 1) Baseline KMeans extractor
# -------------------------
def extract_palette_kmeans(image_path: str, K: int = 5, sample_pixels: int = 10000) -> List[str]:
    """
    Load image, sample pixels, run KMeans and return K hex colors (ordered by cluster size desc).
    """
    img = Image.open(image_path).convert("RGB")
    w, h = img.size
    arr = np.asarray(img).reshape(-1, 3)

    # downsample pixels if large
    if arr.shape[0] > sample_pixels:
        idx = np.random.choice(arr.shape[0], sample_pixels, replace=False)
        arr_sample = arr[idx]
    else:
        arr_sample = arr

    kmeans = KMeans(n_clusters=K, random_state=42, n_init=4)
    labels = kmeans.fit_predict(arr_sample)
    centers = np.clip(kmeans.cluster_centers_.astype(int), 0, 255)

    # order centers by cluster population frequency
    counts = np.bincount(labels)
    order = np.argsort(-counts)
    ordered_centers = centers[order]

    hex_colors = ['#{:02x}{:02x}{:02x}'.format(int(c[0]), int(c[1]), int(c[2])) for c in ordered_centers]
    return hex_colors

# -------------------------
# 2) Build dataset CSV from folder (images -> palettes)
# -------------------------
def build_palette_labels(img_folder: str, out_csv: str, K: int = 5):
    """
    Walk folder, run KMeans for each image and write CSV:
    filename, color0, color1, ... color{K-1}
    """
    img_paths = list(Path(img_folder).rglob("*.*"))
    rows = []
    for p in tqdm(img_paths, desc="Extracting palettes"):
        try:
            palette = extract_palette_kmeans(str(p), K=K)
            rows.append([str(p)] + palette)
        except Exception as e:
            print("Error", p, e)

    # write CSV
    with open(out_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["image"] + [f"color_{i}" for i in range(K)])
        writer.writerows(rows)
    print("Wrote", out_csv, "rows:", len(rows))

# -------------------------
# 3) PyTorch Dataset: image + target palette (K x 3 floats)
# -------------------------
class PaletteDataset(Dataset):
    def __init__(self, csv_file: str, transform=None, K: int = 5):
        import pandas as pd
        self.df = pd.read_csv(csv_file)
        self.transform = transform
        self.K = K

    def __len__(self):
        return len(self.df)

    @staticmethod
    def hex_to_rgb01(hexstr: str) -> List[float]:
        hx = hexstr.lstrip("#")
        r = int(hx[0:2], 16)/255.0
        g = int(hx[2:4], 16)/255.0
        b = int(hx[4:6], 16)/255.0
        return [r, g, b]

    def __getitem__(self, idx):
        row = self.df.iloc[idx]
        img_path = row["image"]
        img = Image.open(img_path).convert("RGB")
        if self.transform:
            img = self.transform(img)
        # collect palette as vector [K*3]
        cols = []
        for i in range(self.K):
            h = row[f"color_{i}"]
            cols.extend(self.hex_to_rgb01(h))
        target = torch.tensor(cols, dtype=torch.float32)  # shape K*3
        return img, target

# -------------------------
# 4) Model: ResNet backbone -> Linear -> Kx3 outputs
# -------------------------
class PaletteRegressor(nn.Module):
    def __init__(self, K: int = 5, backbone_name: str = "resnet18", pretrained=True):
        super().__init__()
        self.K = K
        if backbone_name == "resnet18":
            backbone = models.resnet18(pretrained=pretrained)
            in_features = backbone.fc.in_features
            # remove fc
            backbone.fc = nn.Identity()
            self.backbone = backbone
        else:
            raise NotImplementedError("Only resnet18 implemented in this prototype")

        # final MLP head: produce K*3 outputs (RGB in 0..1)
        self.head = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Linear(512, K * 3),
            nn.Sigmoid()  # ensure outputs between 0..1
        )

    def forward(self, x):
        feat = self.backbone(x)  # (B, in_features)
        out = self.head(feat)    # (B, K*3) values 0..1
        return out

# -------------------------
# 5) Loss & metrics:
#   - MSE between predicted RGBs and target RGBs
#   - Optional permutation-invariant metric: match predicted to target order using Hungarian (optimal)
# -------------------------
def mse_loss(pred, target):
    return nn.functional.mse_loss(pred, target)

def mae_loss(pred, target):
    return nn.functional.l1_loss(pred, target)

# optional: permutation-invariant loss (Hungarian)
def perm_invariant_mse(pred: torch.Tensor, target: torch.Tensor, K: int = 5):
    # pred: (B, K*3) flattened; reshape to (B, K, 3)
    from scipy.optimize import linear_sum_assignment
    B = pred.shape[0]
    pred_np = pred.detach().cpu().numpy().reshape(B, K, 3)
    target_np = target.detach().cpu().numpy().reshape(B, K, 3)
    loss_sum = 0.0
    for i in range(B):
        cost = np.linalg.norm(pred_np[i][:, None, :] - target_np[i][None, :, :], axis=2)  # KxK
        row_ind, col_ind = linear_sum_assignment(cost)
        matched = np.linalg.norm(pred_np[i][row_ind] - target_np[i][col_ind], axis=1)
        loss_sum += matched.mean()
    return torch.tensor(loss_sum / B, dtype=torch.float32)

# -------------------------
# 6) Training loop
# -------------------------
def train_loop(csv_train: str, csv_val: str, K: int = 5, epochs: int = 10, batch_size: int = 16, lr: float = 1e-4, device: str = "cuda", use_perm_metric: bool = False):
    transform = T.Compose([
        T.Resize((224,224)),
        T.ToTensor()
    ])

    train_ds = PaletteDataset(csv_train, transform=transform, K=K)
    val_ds = PaletteDataset(csv_val, transform=transform, K=K)

    # <<< CHANGE HERE FOR WINDOWS
    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=0, pin_memory=False)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=0, pin_memory=False)

    model = PaletteRegressor(K=K, pretrained=True).to(device)
    opt = torch.optim.Adam(model.parameters(), lr=lr)
    best_val = 1e9

    for epoch in range(epochs):
        model.train()
        running = 0.0
        running_mae = 0.0
        for imgs, targets in tqdm(train_loader, desc=f"Train E{epoch}"):
            imgs = imgs.to(device)
            targets = targets.to(device)
            pred = model(imgs)
            loss = mse_loss(pred, targets)
            mae = mae_loss(pred, targets)
            opt.zero_grad()
            loss.backward()
            opt.step()
            running += loss.item() * imgs.size(0)
            running_mae += mae.item() * imgs.size(0)
        train_loss = running / len(train_loader.dataset)
        train_mae = running_mae / len(train_loader.dataset)

        # validation
        model.eval()
        vrunning = 0.0
        vrunning_mae = 0.0
        vperm = 0.0
        with torch.no_grad():
            for imgs, targets in tqdm(val_loader, desc=f"Val E{epoch}"):
                imgs = imgs.to(device)
                targets = targets.to(device)
                pred = model(imgs)
                loss = mse_loss(pred, targets)
                mae = mae_loss(pred, targets)
                vrunning += loss.item() * imgs.size(0)
                vrunning_mae += mae.item() * imgs.size(0)
                if use_perm_metric:
                    vperm += perm_invariant_mse(pred, targets, K=K).item() * imgs.size(0)
        val_loss = vrunning / len(val_loader.dataset)
        val_mae = vrunning_mae / len(val_loader.dataset)
        val_perm = (vperm / len(val_loader.dataset)) if use_perm_metric else None

        if use_perm_metric:
            print(f"Epoch {epoch}: TrainLoss={train_loss:.5f} ValLoss={val_loss:.5f} TrainMAE={train_mae:.5f} ValMAE={val_mae:.5f} ValPermMSE={val_perm:.5f}")
        else:
            print(f"Epoch {epoch}: TrainLoss={train_loss:.5f} ValLoss={val_loss:.5f} TrainMAE={train_mae:.5f} ValMAE={val_mae:.5f}")

        if val_loss < best_val:
            best_val = val_loss
            torch.save(model.state_dict(), "best_palette_model.pth")
            print("Saved best model")

# -------------------------
# 7) Utility: predict palette for a new image (model inference)
# -------------------------
def predict_image_palette(model: nn.Module, image_path: str, K: int = 5, device: str = "cuda"):
    transform = T.Compose([T.Resize((224,224)), T.ToTensor()])
    img = Image.open(image_path).convert("RGB")
    x = transform(img).unsqueeze(0).to(device)
    model.eval()
    with torch.no_grad():
        out = model(x).cpu().numpy().reshape(K, 3)
    # convert to hex
    hexes = []
    for c in out:
        r, g, b = (np.clip((c * 255).astype(int), 0, 255))
        hexes.append('#{:02x}{:02x}{:02x}'.format(int(r), int(g), int(b)))
    return hexes

# -------------------------
# 8) Example usage
# -------------------------
if __name__ == "__main__":
    """
    Example commands:
    1) Build labels (run once)
       python palette_pipeline.py --build /path/to/images labels.csv --K 5

    2) Train
       python palette_pipeline.py --train labels_train.csv labels_val.csv --epochs 20 --K 5

    (This file focuses on functions; you can adapt and add CLI parsing as needed)
    """
    print("This module provides functions for palette extraction and training.")




    if __name__ == "__main__":
     print("This module provides functions for palette extraction and training.")
    
    # Build CSV labels from images
    img_folder = r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\ui_images"
    out_csv = r"C:\Users\frank\OneDrive\Pictures\Camera Roll\Documents\CODING - Copy (2)\final year project\labels.csv"
    K = 5

    build_palette_labels(img_folder, out_csv, K)



