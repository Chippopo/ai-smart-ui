"""
Prototype Palette Generator v2
- Uses DuckDuckGo to fetch context about the industry/product (no API key).
- Maps context -> preferred color families.
- Builds a context-biased palette (HSL shades) and optionally blends with Colormind.
- Returns palette, psychological explanations and summary.
Save as: prototype_palette_generator_v2.py
Run:
    uvicorn prototype_palette_generator_v2:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import requests
from bs4 import BeautifulSoup
import re
import colorsys
import random
import math

# ---------------------------
# App + CORS
# ---------------------------
app = FastAPI(title="Prototype Palette Generator v2 (Context-aware)")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Models
# ---------------------------
class PaletteRequest(BaseModel):
    layout_target: str
    layout_style: str
    industry: str
    emotion: str

# ---------------------------
# Color psychology dictionary
# ---------------------------
COLOR_MEANINGS = {
    "blue": "represents trust, reliability, and calm — often used by finance, corporate and crypto brands.",
    "green": "symbolizes growth, health, and renewal — ideal for healthcare, wellness, and eco products.",
    "teal": "combines calmness of blue and renewal of green — conveys modernity and health/tech balance.",
    "gold": "suggests wealth, prestige and value — good for finance, crypto, premium brands.",
    "gray": "neutral, technical, and professional — often used for modern tech and enterprise UIs.",
    "black": "elegance and authority — often used for premium/secure branding.",
    "white": "simplicity, cleanliness and calm — great for health and minimalist designs.",
    "purple": "luxury, creativity and innovation — useful for design-forward or premium products.",
    "orange": "energy, enthusiasm and call-to-action emphasis — works well for playful or energetic brands.",
    "red": "urgency and excitement — good for CTAs and entertainment contexts."
}

# ---------------------------
# Keyword -> color family mapping
# (expand as you like)
# ---------------------------
KEYWORD_COLOR_MAP = {
    # finance / crypto
    "finance": ["blue", "gray", "gold"],
    "bank": ["blue", "gray"],
    "crypto": ["blue", "gold", "black", "teal"],
    "money": ["green", "gold"],
    # healthcare
    "health": ["green", "teal", "white"],
    "medical": ["green", "white", "teal"],
    "wellness": ["green", "teal"],
    # ecommerce / retail
    "ecommerce": ["orange", "blue", "teal"],
    "retail": ["orange", "blue"],
    # education
    "education": ["yellow", "blue"],
    # tech / saas
    "tech": ["blue", "gray", "teal"],
    "software": ["blue", "gray"],
    "startup": ["purple", "teal", "orange"],
    # food
    "food": ["orange", "red", "green"],
    # default fallback
    "default": ["blue", "gray", "teal"]
}

# ---------------------------
# Helper utilities
# ---------------------------

def clamp(v, a=0.0, b=1.0):
    return max(a, min(b, v))

def hsl_to_hex(h_deg: float, s: float, l: float) -> str:
    """Convert H (0..360), S (0..1), L (0..1) to hex."""
    h = h_deg / 360.0
    r, g, b = colorsys.hls_to_rgb(h, l, s)  # python uses H,L,S (note L before S)
    r = int(round(clamp(r) * 255))
    g = int(round(clamp(g) * 255))
    b = int(round(clamp(b) * 255))
    return f"#{r:02x}{g:02x}{b:02x}"

def nearest_shade_for_category(category: str) -> float:
    """Return a representative hue angle for categories (in degrees)."""
    mapping = {
        "blue": 210,
        "green": 140,
        "teal": 175,
        "gold": 45,
        "gray": 0,    # gray handled via low saturation
        "black": 0,
        "white": 0,
        "purple": 280,
        "orange": 30,
        "red": 0,
    }
    return mapping.get(category, 210)

def make_shades_for_category(category: str, count: int = 5) -> List[str]:
    """Create a small list of harmonious shades around the category hue."""
    hue = nearest_shade_for_category(category)
    shades = []
    # choose different lightness and saturation combos; vary slightly the hue
    for i in range(count):
        # shift hue slightly
        hue_shift = hue + (random.uniform(-8, 8))
        # pick saturation and lightness depending on category
        if category in ("gray", "black", "white"):
            s = random.uniform(0.02, 0.12)  # almost no color
        else:
            s = random.uniform(0.35, 0.85)
        # lightness: generate a range so palette contains dark -> light
        l = clamp(0.15 + i * (0.65 / max(1, count - 1)))
        hexcol = hsl_to_hex(hue_shift, s, l)
        shades.append(hexcol)
    return shades

# ---------------------------
# DuckDuckGo search + snippet extraction
# ---------------------------
def duckduckgo_search_snippets(query: str, max_results: int = 6) -> List[str]:
    """
    Do a lightweight DuckDuckGo HTML search and extract snippet texts.
    No API key required. We only parse brief snippets to obtain context words.
    """
    try:
        # Use the HTML endpoint
        url = "https://duckduckgo.com/html/"
        resp = requests.post(url, data={"q": query}, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        html = resp.text
        soup = BeautifulSoup(html, "html.parser")
        snippets = []
        # duckduckgo's html page has results in <a class="result__a"> and snippet in <a> sibling or <div class="result__snippet">
        for div in soup.select(".result__snippet")[:max_results]:
            text = div.get_text(separator=" ", strip=True)
            if text:
                snippets.append(text)
        # If none found, fall back to paragraph text
        if not snippets:
            for p in soup.select("p")[:max_results]:
                txt = p.get_text(strip=True)
                if txt:
                    snippets.append(txt)
        return snippets
    except Exception:
        return []

# ---------------------------
# Simple keyword extraction from snippets
# ---------------------------
def extract_keywords(snippets: List[str], top_n: int = 8) -> List[str]:
    text = " ".join(snippets).lower()
    # remove punctuation
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    words = text.split()
    # small set of stopwords
    stopwords = set([
        "the","and","for","with","that","this","from","are","was","is","to","of","in","as","by","on","it","use","using",
        "its","their","be","or","an","at","they","which","can","also","has","have","but","not"
    ])
    freq = {}
    for w in words:
        if w in stopwords or len(w) < 3:
            continue
        freq[w] = freq.get(w, 0) + 1
    # sort by frequency
    sorted_words = sorted(freq.items(), key=lambda x: x[1], reverse=True)
    return [w for w, _ in sorted_words[:top_n]]

# ---------------------------
# Map keywords to color families
# ---------------------------
def map_keywords_to_colors(keywords: List[str]) -> List[str]:
    counts = {}
    for kw in keywords:
        for key, families in KEYWORD_COLOR_MAP.items():
            if key in kw:
                for fam in families:
                    counts[fam] = counts.get(fam, 0) + 1
    # if nothing matched, fallback to default
    if not counts:
        for fam in KEYWORD_COLOR_MAP["default"]:
            counts[fam] = counts.get(fam, 0) + 1
    # sort by score
    sorted_fams = sorted(counts.items(), key=lambda x: x[1], reverse=True)
    return [fam for fam, _ in sorted_fams]

# ---------------------------
# Build a final 5-color palette biased by context
# ---------------------------
def build_context_palette(preferred_families: List[str], desired_count: int = 5) -> List[str]:
    palette = []
    # try generate shades from top 2 families first to ensure relevance
    families_order = preferred_families + [f for f in KEYWORD_COLOR_MAP["default"] if f not in preferred_families]
    i = 0
    while len(palette) < desired_count and i < len(families_order):
        fam = families_order[i]
        shades = make_shades_for_category(fam, count=4)
        # pick one or two representative shades from this family
        # prefer mid-tone as primary (index 1..2)
        pick_index = 1 if len(shades) > 1 else 0
        candidate = shades[pick_index]
        if candidate not in palette:
            palette.append(candidate)
        # maybe add a lighter or darker accent if still room
        if len(palette) < desired_count:
            accent = shades[-1]
            if accent not in palette:
                palette.append(accent)
        i += 1
    # If we have more than desired_count (rare), trim
    return palette[:desired_count]

# ---------------------------
# Try Colormind and blend with context palette
# ---------------------------
def fetch_colormind_palette() -> List[str]:
    try:
        resp = requests.post("http://colormind.io/api/", json={"model": "default"}, timeout=8)
        resp.raise_for_status()
        data = resp.json()
        rgb_list = data.get("result", [])
        if rgb_list:
            return ['#%02x%02x%02x' % tuple(c) for c in rgb_list]
    except Exception:
        pass
    return []

def blend_palettes(context_palette: List[str], colormind_palette: List[str], weight_context: float = 0.7) -> List[str]:
    """
    Simple blending strategy:
    - Keep first 2 colors from context palette strongly,
    - Then fill remainder with colors from colormind, but prefer colors similar to context hues.
    """
    final = []
    # ensure unique
    for c in context_palette:
        if c not in final:
            final.append(c)
        if len(final) >= 2:
            break
    # append from colormind until we have 5
    for c in colormind_palette:
        if c not in final:
            final.append(c)
        if len(final) >= 5:
            break
    # if still not enough, extend with context shades
    idx = 0
    while len(final) < 5 and idx < len(context_palette):
        if context_palette[idx] not in final:
            final.append(context_palette[idx])
        idx += 1
    # final trim
    return final[:5]

# ---------------------------
# Endpoint
# ---------------------------
@app.post("/generate")
def generate(req: PaletteRequest) -> Dict[str, Any]:
    # 1) quick web search to understand the industry/product
    query = f"{req.industry} industry overview {req.layout_style} {req.emotion}"
    snippets = duckduckgo_search_snippets(query)
    if not snippets:
        # fallback to shorter query
        snippets = duckduckgo_search_snippets(req.industry)
    keywords = extract_keywords(snippets)
    mapped_families = map_keywords_to_colors(keywords)

    # 2) build context palette from those families
    context_palette = build_context_palette(mapped_families, desired_count=5)

    # 3) try fetching Colormind and blend (if available)
    colormind_palette = fetch_colormind_palette()
    if colormind_palette:
        final_palette = blend_palettes(context_palette, colormind_palette)
    else:
        final_palette = context_palette

    # 4) Interpret each color psychologically and contextualize with industry
    interpretations = []
    for hexc in final_palette:
        # interpret category
        interp = None
        # convert to category using existing interpret_color helper-like logic
        # reuse simple hue-based mapping (we'll inline a version here)
        h, s, l = rgb_to_hsl(hexc)
        # determine approximate category by hue/sat/lightness
        cat = "unspecified"
        if s < 0.12 and l > 0.9:
            cat = "white"
        elif s < 0.12:
            cat = "gray"
        elif l < 0.12:
            cat = "black"
        else:
            # hue degrees
            hue_deg = h * 360
            if 200 <= hue_deg <= 260:
                cat = "blue"
            elif 80 <= hue_deg <= 160:
                cat = "green"
            elif 160 < hue_deg < 200:
                cat = "teal"
            elif 260 < hue_deg <= 320:
                cat = "purple"
            elif 40 <= hue_deg <= 70:
                cat = "yellow"
            elif 15 < hue_deg < 40:
                cat = "orange"
            elif (0 <= hue_deg <= 15) or (hue_deg >= 345):
                cat = "red"
            else:
                cat = "unspecified"
        meaning = COLOR_MEANINGS.get(cat, "Neutral/modern color with broad applicability.")
        # tailor message to industry (simple rule)
        tailored = tailor_meaning_for_industry(cat, req.industry)
        interpretations.append({
            "color": hexc,
            "category": cat,
            "meaning": meaning,
            "tailored_reason": tailored
        })

    # 5) summary
    summary = (
        f"This palette was created for a {req.industry} {req.layout_target} aiming for a {req.emotion} tone. "
        f"Top color families detected from web context: {', '.join(mapped_families[:3])}."
    )

    return {
        "input": req.dict(),
        "snippets": snippets,
        "keywords": keywords,
        "mapped_families": mapped_families,
        "context_palette": context_palette,
        "colormind_palette": colormind_palette,
        "final_palette": final_palette,
        "interpretations": interpretations,
        "summary": summary
    }

# ---------------------------
# Small helpers used in endpoint (rgb/hsl conversions + tailoring)
# ---------------------------
def rgb_to_hsl(hexcol: str):
    """Return H,S,L where H in 0..1, S in 0..1, L in 0..1 for given hex color."""
    hexcol = hexcol.lstrip("#")
    r, g, b = [int(hexcol[i:i+2], 16)/255.0 for i in (0,2,4)]
    h, l, s = colorsys.rgb_to_hls(r, g, b)  # note: rgb_to_hls returns H,L,S
    # convert to H,S,L ordering
    return h, s, l

def tailor_meaning_for_industry(category: str, industry: str) -> str:
    """Return a short tailored reason explaining why this color suits the industry."""
    base = COLOR_MEANINGS.get(category, "")
    ind = industry.lower()
    # simple rules:
    if category == "green" and ("health" in ind or "medical" in ind or "wellness" in ind):
        return f"{base} Specifically, greens suggest healing and natural wellness — suitable for healthcare apps."
    if category in ("blue", "teal") and ("finance" in ind or "crypto" in ind or "bank" in ind):
        return f"{base} For finance/crypto, this color conveys stability and trustworthiness to users."
    if category == "gold" and ("crypto" in ind or "finance" in ind):
        return f"{base} Gold accents signal value and prestige — often used in crypto and premium financial products."
    if category == "white" and ("health" in ind):
        return f"{base} White conveys cleanliness and purity — commonly used in healthcare and clinical UIs."
    if category == "orange" and ("ecommerce" in ind or "retail" in ind):
        return f"{base} Orange draws attention and improves conversion for product CTAs."
    # default fallback
    return base

# ---------------------------
# End file
# ---------------------------

