from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

app = FastAPI(title="AI Smart Color Recommender")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# INPUT MODEL
# -----------------------------
class ColorRequest(BaseModel):
    layout_target: str
    layout_style: str
    industry: str
    emotion: str

# -----------------------------
# COLOR KNOWLEDGE BASE
# -----------------------------
COLOR_KNOWLEDGE = {
    "healthcare": {
        "base_colors": ["#2E7D32", "#A5D6A7", "#FFFFFF", "#00695C"],
        "reason": "Healthcare apps use green and teal to represent nature, healing, hygiene, and calmness."
    },
    "finance": {
        "base_colors": ["#0D47A1", "#1976D2", "#FFD54F", "#FFFFFF"],
        "reason": "Finance products use blue for trust and yellow for value and optimism."
    },
    "crypto": {
        "base_colors": ["#0A2540", "#00B4D8", "#FFD60A", "#FFFFFF"],
        "reason": "Crypto platforms use deep blues for security and yellow to suggest value and innovation."
    },
    "education": {
        "base_colors": ["#283593", "#FFEB3B", "#FFFFFF", "#1A237E"],
        "reason": "Education apps combine blue for focus and yellow for learning energy."
    },
    "ecommerce": {
        "base_colors": ["#D32F2F", "#FF9800", "#FFFFFF", "#212121"],
        "reason": "E-commerce apps use red and orange to trigger action and urgency."
    }
}

# -----------------------------
# EMOTION MODIFIER
# -----------------------------
def apply_emotion(colors: List[str], emotion: str):
    if emotion == "minimalist":
        return colors[:2] + ["#FFFFFF"]
    if emotion == "playful":
        return colors
    if emotion == "professional":
        return colors[:3]
    return colors

# -----------------------------
# MAIN API
# -----------------------------
@app.post("/generate")
def generate_colors(req: ColorRequest):
    industry_key = req.industry.lower().replace(" ", "")

    if industry_key not in COLOR_KNOWLEDGE:
        return {"error": "Industry not supported yet"}

    base = COLOR_KNOWLEDGE[industry_key]
    palette = apply_emotion(base["base_colors"], req.emotion.lower())

    explanation = (
        f"This palette was generated for a {req.industry} {req.layout_target} layout. "
        f"It follows a {req.emotion} design tone. "
        f"{base['reason']}"
    )

    return {
        "input": req.dict(),
        "palette": palette,
        "explanation": explanation
    }
