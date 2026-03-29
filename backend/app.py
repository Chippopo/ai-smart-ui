"""
AI Smart UI — Flask Backend
Layout Generation powered by MobileNetV3 (PyTorch)

Architecture:
  - MobileNetV3-Large used as feature extractor (pretrained on ImageNet)
  - Final classifier layer replaced with a custom head for layout prediction
  - Input: text prompt encoded as a synthetic feature image (128x128 RGB)
  - Output: predicted layout category + confidence scores

Run:
  pip install flask flask-cors torch torchvision numpy pillow
  python app.py
"""

from flask import Flask, request, jsonify 
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os
from datetime import datetime
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
from PIL import Image
import io
import hashlib
import json

app = Flask(__name__)
CORS(app)  # Allow React frontend to call this API


# SQLite Auth Storage

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "users.db")


def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        conn.execute("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
        conn.commit()


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def normalize_email(email: str) -> str:
    return str(email or "").strip().lower()


init_db()

# ─────────────────────────────────────────────
# Layout Categories (what the model predicts)
# ─────────────────────────────────────────────
LAYOUT_CATEGORIES = [
    "dashboard_minimal",
    "dashboard_finance",
    "dashboard_fitness",
    "dashboard_analytics",
    "dashboard_logistics",
    "dashboard_skills",
    "mobile_ecommerce",
    "mobile_fitness",
    "mobile_fintech",
    "mobile_general",
    "landing_centered",
    "landing_image_right",
    "landing_phone_hero",
    "landing_search_hero",
    "landing_split",
]

NUM_CLASSES = len(LAYOUT_CATEGORIES)

# ─────────────────────────────────────────────
# Domain & keyword mappings
# ─────────────────────────────────────────────
DOMAIN_KEYWORDS = {
    "fintech":    ["fintech", "bank", "payment", "wallet", "crypto", "finance", "money"],
    "fitness":    ["gym", "fitness", "workout", "trainer", "health", "sport", "exercise"],
    "ecommerce":  ["shop", "store", "ecommerce", "cart", "fashion", "product", "buy"],
    "education":  ["course", "school", "education", "learn", "student", "teach"],
    "travel":     ["travel", "flight", "hotel", "tour", "trip", "booking"],
    "saas":       ["saas", "software", "dashboard", "analytics", "b2b", "platform"],
    "agency":     ["agency", "marketing", "consulting", "creative", "brand"],
    "realestate": ["property", "real estate", "rent", "house", "listing"],
}

EMOTION_KEYWORDS = {
    "professional": ["professional", "corporate", "business", "formal", "clean"],
    "playful":      ["playful", "fun", "bright", "colorful", "creative", "vibrant"],
    "minimalist":   ["minimal", "minimalist", "simple", "clean", "whitespace", "modern"],
    "dark":         ["dark", "night", "black", "moody", "bold"],
    "luxury":       ["luxury", "premium", "elegant", "gold", "high-end"],
}

# ─────────────────────────────────────────────
# MobileNetV3 Model Definition
# ─────────────────────────────────────────────
class LayoutClassifier(nn.Module):
    """
    MobileNetV3-Large with a custom classification head.

    Architecture:
      MobileNetV3-Large (pretrained ImageNet weights)
        └─ features  [convolutional feature extractor]
        └─ avgpool   [adaptive average pooling → 1x1]
        └─ classifier [replaced with our custom head]:
              Linear(960 → 256) → Hardswish → Dropout(0.2) → Linear(256 → NUM_CLASSES)

    The pretrained backbone captures rich visual patterns.
    Our head maps those features to layout categories.
    """
    def __init__(self, num_classes=NUM_CLASSES):
        super(LayoutClassifier, self).__init__()

        # Load MobileNetV3-Large with pretrained ImageNet weights
        backbone = models.mobilenet_v3_large(
            weights=models.MobileNet_V3_Large_Weights.IMAGENET1K_V2
        )

        # Keep the feature extractor and pooling layers intact
        self.features = backbone.features
        self.avgpool  = backbone.avgpool

        # Replace the classifier with a task-specific head
        # MobileNetV3-Large outputs 960 channels after avgpool
        self.classifier = nn.Sequential(
            nn.Linear(960, 256),
            nn.Hardswish(),
            nn.Dropout(p=0.2, inplace=True),
            nn.Linear(256, num_classes),
        )

    def forward(self, x):
        x = self.features(x)   # [B, 960, H, W]
        x = self.avgpool(x)    # [B, 960, 1, 1]
        x = torch.flatten(x, 1)  # [B, 960]
        x = self.classifier(x)   # [B, num_classes]
        return x


# ─────────────────────────────────────────────
# Initialise model (load weights if available)
# ─────────────────────────────────────────────
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model  = LayoutClassifier(num_classes=NUM_CLASSES).to(device)
model.eval()

# If you have trained weights, load them here:
# model.load_state_dict(torch.load("model/layout_classifier.pth", map_location=device))

print(f"[INFO] MobileNetV3-Large loaded on {device}")
print(f"[INFO] Layout categories: {NUM_CLASSES}")


# ─────────────────────────────────────────────
# Image Transform Pipeline
# ─────────────────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((128, 128)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],  # ImageNet mean
        std =[0.229, 0.224, 0.225],  # ImageNet std
    ),
])


# ─────────────────────────────────────────────
# Prompt → Feature Image Encoder
# ─────────────────────────────────────────────
def prompt_to_feature_image(prompt: str, mode: str, seed: int) -> Image.Image:
    """
    Converts a text prompt into a 128x128 RGB feature image for MobileNetV3.

    Strategy:
      - Extract domain and emotion signals from the prompt
      - Map them to HSV colour values representing design intent
      - Generate a structured pattern image that encodes:
          * Dominant hue    → industry/domain
          * Saturation      → emotion intensity
          * Brightness      → layout mode (dashboard=dark, mobile=mid, landing=light)
          * Spatial pattern → structural layout signal

    This gives MobileNetV3 a consistent visual input that reflects
    the semantic meaning of the prompt.
    """
    prompt_lower = prompt.lower()

    # Detect domain
    domain = "general"
    for d, keywords in DOMAIN_KEYWORDS.items():
        if any(k in prompt_lower for k in keywords):
            domain = d
            break

    # Detect emotion
    emotion = "professional"
    for e, keywords in EMOTION_KEYWORDS.items():
        if any(k in prompt_lower for k in keywords):
            emotion = e
            break

    # Domain → base hue (0–360)
    domain_hue = {
        "fintech":    260,  # blue-purple
        "fitness":    140,  # green
        "ecommerce":  310,  # pink-purple
        "education":  200,  # cyan-blue
        "travel":     190,  # teal
        "saas":       240,  # blue
        "agency":     30,   # orange
        "realestate": 220,  # blue
        "general":    260,
    }.get(domain, 260)

    # Emotion → saturation (0–255)
    emotion_sat = {
        "professional": 160,
        "playful":      230,
        "minimalist":   80,
        "dark":         200,
        "luxury":       180,
    }.get(emotion, 160)

    # Mode → brightness base
    mode_brightness = {
        "dashboard": 80,
        "mobile":    140,
        "landing":   200,
    }.get(mode, 140)

    # Seed-based variation (deterministic jitter)
    rng = np.random.default_rng(seed + hash(prompt) % 10000)
    hue_jitter = int(rng.integers(-20, 20))
    sat_jitter = int(rng.integers(-15, 15))

    hue = (domain_hue + hue_jitter) % 360
    sat = np.clip(emotion_sat + sat_jitter, 40, 255)
    val = mode_brightness

    # Build 128x128 RGB image with structural pattern
    img_array = np.zeros((128, 128, 3), dtype=np.uint8)

    # Convert HSV base colour to RGB
    h = hue / 360.0
    s = sat / 255.0
    v = val / 255.0

    # HSV → RGB
    i = int(h * 6)
    f = h * 6 - i
    p = v * (1 - s)
    q = v * (1 - f * s)
    t = v * (1 - (1 - f) * s)
    i %= 6
    rgb_map = [(v,t,p),(q,v,p),(p,v,t),(p,q,v),(t,p,v),(v,p,q)]
    r, g, b = rgb_map[i]
    base_rgb = (int(r*255), int(g*255), int(b*255))

    # Fill base
    img_array[:, :] = base_rgb

    # Add structural bands to encode layout intent:
    # Top band = navigation area
    nav_brightness = np.clip(val + 40, 0, 255)
    nav_rgb = (
        int(base_rgb[0] * nav_brightness / 255),
        int(base_rgb[1] * nav_brightness / 255),
        int(base_rgb[2] * nav_brightness / 255),
    )
    img_array[:20, :] = nav_rgb

    # Left band = sidebar (for dashboard modes)
    if mode == "dashboard":
        sidebar_rgb = (
            int(base_rgb[0] * 0.6),
            int(base_rgb[1] * 0.6),
            int(base_rgb[2] * 0.6),
        )
        img_array[:, :28] = sidebar_rgb

    # Content area = lighter region
    content_rgb = (
        min(255, base_rgb[0] + 60),
        min(255, base_rgb[1] + 60),
        min(255, base_rgb[2] + 60),
    )
    if mode == "landing":
        img_array[20:80, 30:] = content_rgb
    elif mode == "mobile":
        img_array[20:, 20:108] = content_rgb
    else:
        img_array[20:, 28:] = content_rgb

    # Add seed-noise for variation
    noise = rng.integers(0, 15, size=(128, 128, 3), dtype=np.uint8)
    img_array = np.clip(img_array.astype(np.int16) + noise, 0, 255).astype(np.uint8)

    return Image.fromarray(img_array, mode="RGB")


# ─────────────────────────────────────────────
# Rule-based fallback (same as original layoutGen.js logic)
# Used when model confidence is low
# ─────────────────────────────────────────────
def rule_based_layout(prompt: str, mode: str, seed: int) -> dict:
    """Deterministic fallback using original hash-based selection."""

    def fnv1a(s):
        h = 2166136261
        for c in s:
            h ^= ord(c)
            h = (h * 16777619) & 0xFFFFFFFF
        return h

    prompt_lower = prompt.lower()

    domain = "general"
    for d, keywords in DOMAIN_KEYWORDS.items():
        if any(k in prompt_lower for k in keywords):
            domain = d
            break

    key   = f"{mode}::{domain}::{prompt}::{seed}"
    h     = fnv1a(key)

    # Dashboard templates
    dashboard_templates = {
        "fintech":   ["dashboard_finance",   "dashboard_analytics", "dashboard_minimal"],
        "fitness":   ["dashboard_fitness",   "dashboard_analytics", "dashboard_minimal"],
        "education": ["dashboard_skills",    "dashboard_analytics", "dashboard_minimal"],
        "saas":      ["dashboard_analytics", "dashboard_minimal",   "dashboard_skills"],
        "general":   ["dashboard_minimal",   "dashboard_analytics", "dashboard_finance"],
    }

    mobile_templates = {
        "ecommerce": ["mobile_ecommerce", "mobile_general"],
        "fitness":   ["mobile_fitness",   "mobile_general"],
        "fintech":   ["mobile_fintech",   "mobile_general"],
        "general":   ["mobile_general",   "mobile_ecommerce"],
    }

    landing_templates = {
        "fintech":   ["landing_phone_hero",  "landing_centered"],
        "travel":    ["landing_image_right", "landing_search_hero"],
        "saas":      ["landing_phone_hero",  "landing_centered"],
        "agency":    ["landing_image_right", "landing_split"],
        "general":   ["landing_centered",    "landing_image_right"],
    }

    if mode == "dashboard":
        templates = dashboard_templates.get(domain, dashboard_templates["general"])
    elif mode == "mobile":
        templates = mobile_templates.get(domain, mobile_templates["general"])
    else:
        templates = landing_templates.get(domain, landing_templates["general"])

    chosen = templates[h % len(templates)]
    return {"category": chosen, "domain": domain, "source": "rule_based_fallback"}


# ─────────────────────────────────────────────
# Core Prediction Function
# ─────────────────────────────────────────────
def predict_layout(prompt: str, mode: str, seed: int) -> dict:
    """
    Run MobileNetV3 inference on the encoded prompt image.

    Returns:
      category       — predicted layout category string
      confidence     — confidence score (0–1) for top prediction
      all_scores     — softmax scores for all categories
      domain         — detected domain keyword
      model_version  — which model was used
      source         — "mobilenetv3" or "rule_based_fallback"
    """
    # 1. Encode prompt → feature image
    feature_img = prompt_to_feature_image(prompt, mode, seed)

    # 2. Apply transforms
    tensor = transform(feature_img).unsqueeze(0).to(device)  # [1, 3, 128, 128]

    # 3. MobileNetV3 forward pass
    with torch.no_grad():
        logits = model(tensor)                          # [1, NUM_CLASSES]
        probs  = torch.softmax(logits, dim=1)[0]        # [NUM_CLASSES]

    probs_list = probs.cpu().numpy().tolist()
    top_idx    = int(np.argmax(probs_list))
    confidence = float(probs_list[top_idx])

    # 4. Build scores dict
    all_scores = {
        LAYOUT_CATEGORIES[i]: round(probs_list[i], 4)
        for i in range(NUM_CLASSES)
    }

    # 5. Mode filter — only consider categories matching the requested mode
    mode_prefix = mode  # "dashboard", "mobile", or "landing"
    filtered = {
        k: v for k, v in all_scores.items()
        if k.startswith(mode_prefix)
    }

    if filtered:
        best_category   = max(filtered, key=filtered.get)
        best_confidence = filtered[best_category]
    else:
        best_category   = LAYOUT_CATEGORIES[top_idx]
        best_confidence = confidence

    # 6. Detect domain for context
    prompt_lower = prompt.lower()
    domain = "general"
    for d, keywords in DOMAIN_KEYWORDS.items():
        if any(k in prompt_lower for k in keywords):
            domain = d
            break

    # 7. If confidence is very low (<0.15), use rule-based fallback
    if best_confidence < 0.15:
        fallback = rule_based_layout(prompt, mode, seed)
        return {
            **fallback,
            "confidence":   best_confidence,
            "all_scores":   all_scores,
            "model_version": "MobileNetV3-Large",
        }

    return {
        "category":      best_category,
        "confidence":    round(best_confidence, 4),
        "all_scores":    all_scores,
        "domain":        domain,
        "model_version": "MobileNetV3-Large",
        "source":        "mobilenetv3",
    }


# ─────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────

@app.route("/auth/register", methods=["POST"])
def auth_register():
    data = request.get_json() or {}
    name = str(data.get("name", "")).strip()
    email = normalize_email(data.get("email", ""))
    password = str(data.get("password", "")).strip()

    if not name or not email or not password:
        return jsonify({"ok": False, "message": "Fill all fields."}), 400

    password_hash = generate_password_hash(password)
    created_at = datetime.utcnow().isoformat()

    try:
        with get_db() as conn:
            conn.execute(
                "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                (name, email, password_hash, created_at),
            )
            conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({"ok": False, "message": "Account already exists. Please login."}), 409

    return jsonify({"ok": True, "user": {"name": name, "email": email}})


@app.route("/auth/login", methods=["POST"])
def auth_login():
    data = request.get_json() or {}
    email = normalize_email(data.get("email", ""))
    password = str(data.get("password", "")).strip()

    if not email or not password:
        return jsonify({"ok": False, "message": "Please fill all fields."}), 400

    with get_db() as conn:
        row = conn.execute(
            "SELECT id, name, email, password_hash FROM users WHERE email = ?",
            (email,),
        ).fetchone()

    if not row:
        return jsonify({"ok": False, "message": "No account found. Register first."}), 404

    if not check_password_hash(row["password_hash"], password):
        return jsonify({"ok": False, "message": "Invalid password."}), 401

    return jsonify({"ok": True, "user": {"name": row["name"], "email": row["email"]}})


@app.route("/health", methods=["GET"])
def health():
    """Health check — confirms backend is running."""
    return jsonify({
        "status":        "ok",
        "model":         "MobileNetV3-Large",
        "device":        str(device),
        "num_categories": NUM_CLASSES,
        "categories":    LAYOUT_CATEGORIES,
    })


@app.route("/predict/layout", methods=["POST"])
def predict_layout_route():
    """
    Main layout prediction endpoint.

    Request body (JSON):
      {
        "prompt": "A modern fintech mobile app, clean and minimal",
        "mode":   "mobile",       // "dashboard" | "mobile" | "landing"
        "seed":   1               // integer, for reproducibility
      }

    Response (JSON):
      {
        "category":      "mobile_fintech",
        "confidence":    0.7823,
        "domain":        "fintech",
        "all_scores":    { "mobile_fintech": 0.7823, ... },
        "model_version": "MobileNetV3-Large",
        "source":        "mobilenetv3",
        "template_hints": { ... }
      }
    """
    data   = request.get_json()
    prompt = data.get("prompt", "").strip()
    mode   = data.get("mode",   "mobile").strip().lower()
    seed   = int(data.get("seed", 1))

    if not prompt:
        return jsonify({"error": "prompt is required"}), 400

    if mode not in ("dashboard", "mobile", "landing"):
        return jsonify({"error": "mode must be dashboard, mobile, or landing"}), 400

    result = predict_layout(prompt, mode, seed)

    # Add template hints that the React frontend uses to pick the right component
    result["template_hints"] = build_template_hints(result["category"], prompt, seed)

    return jsonify(result)


@app.route("/predict/batch", methods=["POST"])
def predict_batch():
    """
    Batch prediction for multiple prompts at once.

    Request body (JSON):
      {
        "items": [
          { "prompt": "...", "mode": "mobile",    "seed": 1 },
          { "prompt": "...", "mode": "dashboard", "seed": 2 }
        ]
      }
    """
    data  = request.get_json()
    items = data.get("items", [])

    if not items:
        return jsonify({"error": "items array is required"}), 400

    results = []
    for item in items[:10]:  # max 10 per batch
        prompt = item.get("prompt", "").strip()
        mode   = item.get("mode",   "mobile").strip().lower()
        seed   = int(item.get("seed", 1))

        if prompt and mode in ("dashboard", "mobile", "landing"):
            r = predict_layout(prompt, mode, seed)
            r["template_hints"] = build_template_hints(r["category"], prompt, seed)
            results.append(r)

    return jsonify({"results": results, "count": len(results)})


def build_template_hints(category: str, prompt: str, seed: int) -> dict:
    """
    Maps a predicted layout category to specific template configuration hints
    that the React LayoutGenerator component understands.

    These hints are passed back to the frontend so it can render
    the correct DashboardMock variant, PhoneMock screen sequence,
    or LandingMock hero style.
    """
    hints_map = {
        # ── Dashboard ──────────────────────────────
        "dashboard_minimal":   {"variant": "minimal",   "sidebar": "pill",    "chart": "line"},
        "dashboard_finance":   {"variant": "finance",   "sidebar": "minimal", "chart": "area"},
        "dashboard_fitness":   {"variant": "fitness",   "sidebar": "icon",    "chart": "line"},
        "dashboard_analytics": {"variant": "analytics", "sidebar": "icon",    "chart": "bar"},
        "dashboard_logistics": {"variant": "logistics", "sidebar": "menu",    "chart": "donut"},
        "dashboard_skills":    {"variant": "skills",    "sidebar": "pill",    "chart": "bar"},

        # ── Mobile ─────────────────────────────────
        "mobile_ecommerce": {"screens": ["Home","Categories","Product","Cart","Orders","Profile"], "nav": "tab"},
        "mobile_fitness":   {"screens": ["Today","Workout","Progress","Nutrition","Coaches","Profile"], "nav": "tab"},
        "mobile_fintech":   {"screens": ["Dashboard","Wallet","Transactions","Cards","Analytics","Profile"], "nav": "tab"},
        "mobile_general":   {"screens": ["Home","Search","Detail","Favorites","Settings","Profile"], "nav": "tab"},

        # ── Landing ────────────────────────────────
        "landing_centered":     {"heroStyle": "centered",       "sections": ["hero","logos","featuresGrid","finalCta","footer"]},
        "landing_image_right":  {"heroStyle": "imageRight",     "sections": ["hero","logos","cards3","splitShowcase","ctaBand","footer"]},
        "landing_phone_hero":   {"heroStyle": "phoneRight",     "sections": ["hero","logos","featuresGrid","twoColSteps","testimonials","finalCta","footer"]},
        "landing_search_hero":  {"heroStyle": "searchHero",     "sections": ["hero","listingsRow","guideSplit","testimonials","blogRow","footer"]},
        "landing_split":        {"heroStyle": "imageRightStats","sections": ["hero","proofStrip","aboutSplit","servicesCards","bigBand","footer"]},
    }

    return hints_map.get(category, {"variant": "minimal"})


# ─────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n" + "="*55)
    print("  AI Smart UI — MobileNetV3 Layout Prediction Backend")
    print("="*55)
    print(f"  Model  : MobileNetV3-Large")
    print(f"  Device : {device}")
    print(f"  Classes: {NUM_CLASSES} layout categories")
    print(f"  API    : http://localhost:5000")
    print("="*55 + "\n")
    app.run(debug=True, host="0.0.0.0", port=5000)
