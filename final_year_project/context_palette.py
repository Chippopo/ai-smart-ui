import random
import colorsys
from typing import List, Dict, Optional

# =========================================================
# COLOR POOLS
# =========================================================

GREEN_POOL = [
    "#0f766e", "#15803d", "#166534", "#4ade80", "#22c55e",
    "#65a30d", "#84cc16", "#2dd4bf", "#5eead4", "#6ee7b7",
    "#047857", "#064e3b", "#14532d", "#4d7c0f", "#3f6212"
]

NEUTRAL_POOL = [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e5e7eb",
    "#d1d5db", "#9ca3af", "#111827"
]

ACCENT_POOL = [
    "#f97316", "#ef4444", "#eab308", "#0ea5e9",
    "#6366f1", "#a855f7", "#ec4899"
]

# =========================================================
# UTILS
# =========================================================

def hex_to_rgb(hex_color: str) -> List[int]:
    hex_color = hex_color.lstrip("#")
    return [int(hex_color[i:i+2], 16) for i in (0, 2, 4)]

def is_green(hex_color: str) -> bool:
    r, g, b = hex_to_rgb(hex_color)
    return g > r and g > b

def adjust_for_emotion(hex_color: str, emotion: Optional[str]) -> str:
    if not emotion:
        return hex_color

    r, g, b = [c / 255 for c in hex_to_rgb(hex_color)]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)

    if emotion == "playful":
        s = min(s * 1.2, 1)
        v = min(v * 1.1, 1)
    elif emotion == "professional":
        s *= 0.8
        v *= 0.9
    elif emotion == "minimalist":
        s *= 0.6

    r2, g2, b2 = colorsys.hsv_to_rgb(h, s, v)
    return "#{:02x}{:02x}{:02x}".format(
        int(r2 * 255), int(g2 * 255), int(b2 * 255)
    )

# =========================================================
# EXPLANATIONS
# =========================================================

def explain_palette(palette: List[str], industry: str, emotion: str) -> List[str]:
    explanations = []

    for color in palette:
        r, g, b = hex_to_rgb(color)

        if is_green(color):
            explanations.append(
                f"{color} conveys health, growth, and calm ."
            )
        elif r > g and r > b:
            explanations.append(
                f"{color} adds energy and attention for call-to-action elements."
            )
        elif b > r and b > g:
            explanations.append(
                f"{color} introduces trust and clarity for balance."
            )
        else:
            explanations.append(
                f"{color} stabilizes the palette with a neutral foundation."
            )

    explanations.append(
        f"Overall emotion '{emotion}' influences saturation and brightness balance."
    )

    return explanations

# =========================================================
# HEALTHCARE PALETTE GENERATOR (CORE)
# =========================================================

def generate_healthcare_palette(emotion: Optional[str] = None) -> List[str]:
    """
    Generates a 4-color healthcare palette:
    - 2 different greens
    - 1 neutral
    - 1 contrasting accent (NOT green)
    """

    green_choices = random.sample(GREEN_POOL, 2)
    neutral = random.choice(NEUTRAL_POOL)
    accent = random.choice(ACCENT_POOL)

    palette = green_choices + [neutral, accent]

    # Apply emotion adjustment
    palette = [adjust_for_emotion(c, emotion) for c in palette]

    random.shuffle(palette)
    return palette


# =========================================================
# MAIN CONTEXT PALETTE FUNCTION (USED BY FASTAPI)
# =========================================================

def generate_context_palette(
    industry: str,
    emotion: Optional[str] = None
) -> Dict[str, List[str]]:
    """
    Entry point for FastAPI.
    """

    industry = industry.lower()
    emotion = emotion.lower() if emotion else "professional"

    if industry == "healthcare":
        palette = generate_healthcare_palette(emotion)
    else:
        # Fallback for other industries
        palette = random.sample(
            NEUTRAL_POOL + ACCENT_POOL + GREEN_POOL, 4
        )

    explanations = explain_palette(palette, industry, emotion)

    return {
        "palette": palette,
        "explanations": explanations,
        "industry": industry,
        "emotion": emotion
    }


# =========================================================
# LOCAL TEST (OPTIONAL)
# =========================================================

if __name__ == "__main__":
    while True:
        input("\nPress ENTER to generate a new palette...")
        result = generate_context_palette(
            industry="healthcare",
            emotion=random.choice(["playful", "professional", "minimalist"])
        )

        print("\n🎨 PALETTE")
        for c in result["palette"]:
            print(c)

        print("\n🧠 EXPLANATIONS")
        for e in result["explanations"]:
            print("-", e)


# --------------------------------------------------
# FastAPI compatibility wrapper (DO NOT REMOVE)
# --------------------------------------------------
def generate_context_palette_from_image(
    image_path: str = "",
    industry: str = "healthcare",
    emotion: str = "professional",
    K: int = 5,
    device: str = "cpu",
    **kwargs
):
    """
    Wrapper to keep FastAPI stable.
    Ignores image/K/device for healthcare palettes.
    """

    return generate_context_palette(
        industry=industry,
        emotion=emotion
    )
