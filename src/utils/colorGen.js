function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function wrapHue(h) {
  let x = h % 360;
  if (x < 0) x += 360;
  return x;
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const light = l / 100;
  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];

  const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToRgb(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return [0, 0, 0];
  return [0, 2, 4].map((idx) => parseInt(h.slice(idx, idx + 2), 16));
}

function srgbChannelToLinear(c) {
  if (c <= 0.03928) return c / 12.92;
  return ((c + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const [rl, gl, bl] = [r, g, b].map(srgbChannelToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagScoreForPair(fg, bg) {
  const ratio = contrastRatio(fg, bg);
  return {
    ratio: Number(ratio.toFixed(2)),
    aa_text: ratio >= 4.5,
    aa_large_text: ratio >= 3.0,
    aaa_text: ratio >= 7.0,
  };
}

function normalize(v) {
  return String(v || "").trim().toLowerCase();
}

function includesAny(haystack, needles) {
  const h = normalize(haystack);
  return needles.some((n) => h.includes(normalize(n)));
}

function moodFromPrompt(prompt) {
  const p = normalize(prompt);
  return {
    dark: includesAny(p, ["dark", "night", "black"]),
    pastel: includesAny(p, ["pastel", "soft"]),
    neon: includesAny(p, ["neon", "cyber", "glow"]),
    luxury: includesAny(p, ["luxury", "premium", "gold"]),
    nature: includesAny(p, ["eco", "nature", "green", "health"]),
    fintech: includesAny(p, ["fintech", "bank", "finance", "crypto"]),
  };
}

export function generatePalette(prompt, seed = 1) {
  const base = hashString(String(prompt) + "|" + String(seed));
  const rand = mulberry32(base);
  const mood = moodFromPrompt(prompt);

  const jitterHue = () => Math.floor((rand() - 0.5) * 50);
  const jitterSL = () => (rand() - 0.5) * 10;

  let baseHue = Math.floor(rand() * 360);
  if (mood.fintech) baseHue = 260 + jitterHue();
  if (mood.nature) baseHue = 140 + jitterHue();
  if (mood.neon) baseHue = 190 + jitterHue();
  if (mood.luxury) baseHue = 35 + jitterHue();
  baseHue = wrapHue(baseHue);

  let satBase = mood.pastel ? 55 : mood.luxury ? 75 : mood.neon ? 95 : 80;
  let lightBase = mood.dark ? 52 : mood.pastel ? 74 : 62;

  satBase = clamp(satBase + jitterSL(), 40, 98);
  lightBase = clamp(lightBase + jitterSL(), 40, 82);

  const primary = hslToHex(baseHue, satBase, lightBase);
  const secondary = hslToHex(
    wrapHue(baseHue + 155 + jitterHue()),
    clamp(satBase - 10 + jitterSL(), 40, 95),
    clamp(lightBase + jitterSL(), 40, 82)
  );
  const success = hslToHex(
    wrapHue(baseHue + 95 + jitterHue()),
    clamp(satBase - 5 + jitterSL(), 45, 95),
    clamp(lightBase - 2 + jitterSL(), 40, 82)
  );
  const accent = hslToHex(
    wrapHue(baseHue + 25 + jitterHue()),
    mood.neon ? clamp(95 + jitterSL(), 80, 98) : clamp(satBase + jitterSL(), 55, 90),
    clamp(lightBase + 2 + jitterSL(), 40, 82)
  );

  const dark = mood.dark ? "#060A12" : "#0B1220";
  return [primary, secondary, success, accent, dark];
}

const COLOR_MEANINGS = {
  blue: "represents trust and reliability; useful for finance and corporate products.",
  green: "signals growth and health; common in healthcare and wellness interfaces.",
  teal: "balances trust and freshness; works well in SaaS, fintech, and healthcare.",
  gold: "adds premium feel and value; useful as an accent for key actions.",
  gray: "communicates neutrality and technical clarity in modern UI systems.",
  black: "adds authority and contrast for premium layouts.",
  white: "supports clean minimal interfaces and strong readability.",
  purple: "suggests innovation and creativity.",
  orange: "conveys energy and action for conversion-focused elements.",
  red: "brings urgency and emphasis; best used sparingly.",
};

function categorizeHex(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const value = max;
  const saturation = max === 0 ? 0 : delta / max;

  let hue = 0;
  if (delta !== 0) {
    if (max === r) hue = 60 * (((g - b) / delta) % 6);
    else if (max === g) hue = 60 * ((b - r) / delta + 2);
    else hue = 60 * ((r - g) / delta + 4);
  }
  if (hue < 0) hue += 360;

  if (value < 0.16) return "black";
  if (value > 0.95 && saturation < 0.08) return "white";
  if (saturation < 0.12) return "gray";
  if (hue >= 200 && hue <= 260) return "blue";
  if (hue >= 80 && hue <= 160) return "green";
  if (hue >= 160 && hue < 200) return "teal";
  if ((hue >= 0 && hue <= 15) || hue >= 345) return "red";
  if (hue >= 40 && hue <= 60) return "gold";
  if (hue > 15 && hue < 40) return "orange";
  if (hue > 260 && hue <= 320) return "purple";
  return "gray";
}

function roleOrderPalette(paletteObj) {
  return [
    paletteObj.primary,
    paletteObj.secondary,
    paletteObj.accent,
    paletteObj.neutral,
    paletteObj.text,
  ];
}

function normalizeHexColor(hex, fallback = "#64748B") {
  const h = String(hex || "").trim().toUpperCase();
  if (/^#[0-9A-F]{6}$/.test(h)) return h;
  return fallback;
}

function paletteFromBaseColors(baseColors) {
  const arr = Array.isArray(baseColors) ? baseColors : [];
  const c0 = normalizeHexColor(arr[0], "#2563EB");
  const c1 = normalizeHexColor(arr[1], "#1D4ED8");
  const c2 = normalizeHexColor(arr[2], "#0EA5E9");
  return {
    primary: c0,
    secondary: c1,
    accent: c2,
    neutral: "#F8FAFC",
    text: "#0F172A",
  };
}

function buildInterpretations(paletteObj) {
  return Object.entries(paletteObj).map(([role, color]) => {
    const category = categorizeHex(color);
    return {
      role,
      color,
      category,
      tailored_reason: COLOR_MEANINGS[category] || "General-purpose UI color.",
    };
  });
}

export function buildSmartColorResultFromBase(formInput, baseColors, source = "cnn") {
  const input = {
    layout_target: normalize(formInput?.layout_target || "website"),
    // layout_style: normalize(formInput?.layout_style || "z-shape"),
    industry: normalize(formInput?.industry || "fintech"),
    emotion: normalize(formInput?.emotion || "professional"),
  };

  const palette = paletteFromBaseColors(baseColors);
  const finalPalette = roleOrderPalette(palette);
  const interpretations = buildInterpretations(palette);
  const wcag = {
    text_on_neutral: wcagScoreForPair(palette.text, palette.neutral),
    text_on_primary: wcagScoreForPair(palette.text, palette.primary),
    accent_on_neutral: wcagScoreForPair(palette.accent, palette.neutral),
  };
  const summary = `Generated from ${source.toUpperCase()} for ${input.industry} (${input.emotion}) in ${input.layout_target} (${input.layout_style}) context.`;

  return {
    input,
    palette,
    final_palette: finalPalette,
    interpretations,
    wcag,
    summary,
  };
}

export function generateSmartColorRecommendations(formInput, seed = 1) {
  const input = {
    layout_target: normalize(formInput?.layout_target || "website"),
    layout_style: normalize(formInput?.layout_style || "z-shape"),
    industry: normalize(formInput?.industry || "fintech"),
    emotion: normalize(formInput?.emotion || "professional"),
  };
  const prompt = `${input.layout_target} ${input.layout_style} ${input.industry} ${input.emotion}`;
  const generated = generatePalette(prompt, seed);
  return buildSmartColorResultFromBase(input, [generated[0], generated[1], generated[3]], "heuristic");
}
