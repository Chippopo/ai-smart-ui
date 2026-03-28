import torch
from torchvision import models, transforms
from PIL import Image

# Load pre-trained MobileNetV3
mobilenet = models.mobilenet_v3_large(pretrained=True)
mobilenet.eval()
