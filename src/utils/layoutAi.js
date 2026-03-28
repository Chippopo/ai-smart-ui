// // src/utils/layoutGen.js
// // Generates DIFFERENT layout templates (not just different words).

// function hashString(str) {
//     // simple deterministic hash
//     let h = 2166136261;
//     for (let i = 0; i < str.length; i++) {
//         h ^= str.charCodeAt(i);
//         h = Math.imul(h, 16777619);
//     }
//     return (h >>> 0);
// }

// function pick(arr, idx) {
//     return arr[idx % arr.length];
// }

// function detectDomain(prompt) {
//     const p = (prompt || "").toLowerCase();
//     if (p.includes("ecommerce") || p.includes("shop") || p.includes("store") || p.includes("cart")) return "ecommerce";
//     if (p.includes("gym") || p.includes("fitness") || p.includes("workouts") || p.includes("trainer")) return "fitness";
//     if (p.includes("fintech") || p.includes("bank") || p.includes("payment") || p.includes("wallet")) return "fintech";
//     if (p.includes("education") || p.includes("course") || p.includes("school") || p.includes("learning")) return "education";
//     return "general";
// }

// function brandFromPrompt(prompt) {
//     // optional: if user typed "Brand: XYZ"
//     const m = (prompt || "").match(/brand\s*:\s*([a-z0-9 _-]{2,24})/i);
//     return m ? m[1].trim() : "";
// }

// function dashboardTemplates(domain) {
//     // Each template changes structure (sidebar/topbar/cards/charts/right panel)
//     // The "kind" tells DashboardMock how to render it.
//     const common = [
//         {
//             id: "D1-soft-purple",
//             kind: "dashboard",
//             layout: {
//                 style: "soft",
//                 sidebar: "pill",
//                 rightPanel: "friends",
//                 kpiRow: 4,
//                 chart: "line",
//                 secondary: "cards",
//             },
//         },
//         {
//             id: "D2-pro-analytics",
//             kind: "dashboard",
//             layout: {
//                 style: "pro",
//                 sidebar: "icon",
//                 rightPanel: "calendar",
//                 kpiRow: 4,
//                 chart: "bar",
//                 secondary: "table",
//             },
//         },
//         {
//             id: "D3-finance-clean",
//             kind: "dashboard",
//             layout: {
//                 style: "finance",
//                 sidebar: "minimal",
//                 rightPanel: "summary",
//                 kpiRow: 3,
//                 chart: "area",
//                 secondary: "transactions",
//             },
//         },
//         {
//             id: "D4-logistics-map",
//             kind: "dashboard",
//             layout: {
//                 style: "logistics",
//                 sidebar: "menu",
//                 rightPanel: "map",
//                 kpiRow: 3,
//                 chart: "donut",
//                 secondary: "timeline",
//             },
//         },
//     ];

//     // Domain-specific bias (so gym/ecommerce “feel” different)
//     if (domain === "fitness") {
//         return [
//             {
//                 id: "FIT-activity",
//                 kind: "dashboard",
//                 layout: {
//                     style: "fitness",
//                     sidebar: "icon",
//                     rightPanel: "profile",
//                     kpiRow: 4,
//                     chart: "line",
//                     secondary: "workouts",
//                 },
//             },
//             ...common,
//         ];
//     }

//     if (domain === "ecommerce") {
//         return [
//             {
//                 id: "EC-orders",
//                 kind: "dashboard",
//                 layout: {
//                     style: "commerce",
//                     sidebar: "menu",
//                     rightPanel: "ordersMap",
//                     kpiRow: 4,
//                     chart: "bar",
//                     secondary: "ordersTable",
//                 },
//             },
//             ...common,
//         ];
//     }

//     if (domain === "fintech") {
//         return [
//             {
//                 id: "FN-wallet",
//                 kind: "dashboard",
//                 layout: {
//                     style: "finance",
//                     sidebar: "minimal",
//                     rightPanel: "cards",
//                     kpiRow: 3,
//                     chart: "area",
//                     secondary: "transactions",
//                 },
//             },
//             ...common,
//         ];
//     }

//     if (domain === "education") {
//         return [
//             {
//                 id: "ED-skillset",
//                 kind: "dashboard",
//                 layout: {
//                     style: "education",
//                     sidebar: "menu",
//                     rightPanel: "calendar",
//                     kpiRow: 4,
//                     chart: "bar",
//                     secondary: "studentsTable",
//                 },
//             },
//             ...common,
//         ];
//     }

//     return common;
// }

// function mobileTemplates(domain) {
//     // You already have PhoneMock that uses spec; keep it compatible by giving a plan with screen types
//     const base = [
//         {
//             id: "M1-tab-shop",
//             kind: "mobile",
//             plan: { screens: ["Home", "Search", "Product", "Cart", "Checkout", "Profile"], nav: "tab" },
//         },
//         {
//             id: "M2-drawer-pro",
//             kind: "mobile",
//             plan: { screens: ["Dashboard", "Feed", "Messages", "Details", "Settings", "Profile"], nav: "drawer" },
//         },
//         {
//             id: "M3-minimal",
//             kind: "mobile",
//             plan: { screens: ["Welcome", "Browse", "Detail", "Favorites", "Orders", "Account"], nav: "minimal" },
//         },
//     ];

//     if (domain === "fitness") {
//         return [
//             { id: "M-FIT", kind: "mobile", plan: { screens: ["Today", "Workout", "Progress", "Nutrition", "Coaches", "Profile"], nav: "tab" } },
//             ...base,
//         ];
//     }

//     if (domain === "ecommerce") {
//         return [
//             { id: "M-EC", kind: "mobile", plan: { screens: ["Home", "Categories", "Product", "Cart", "Orders", "Profile"], nav: "tab" } },
//             ...base,
//         ];
//     }

//     return base;
// }

// export function generateLayout(prompt, mode, seed, brandName = "") {
//     const cleanPrompt = (prompt || "").trim();
//     const domain = detectDomain(cleanPrompt);
//     const inferredBrand = brandName.trim() || brandFromPrompt(cleanPrompt);

//     const key = `${mode}::${domain}::${cleanPrompt}::${seed}`;
//     const h = hashString(key);

//     if (!cleanPrompt) {
//         return { title: "Layout", brand: inferredBrand, isEmpty: true };
//     }

//     if (mode === "dashboard") {
//         const templates = dashboardTemplates(domain);
//         const chosen = pick(templates, h);

//         return {
//             title: "Dashboard Layout",
//             brand: inferredBrand,
//             isEmpty: false,
//             mode: "dashboard",
//             templateId: chosen.id,
//             domain,
//             layout: chosen.layout,
//             // useful content for rendering:
//             content: {
//                 headline:
//                     domain === "ecommerce"
//                         ? "Store Overview"
//                         : domain === "fitness"
//                             ? "Activity Overview"
//                             : domain === "fintech"
//                                 ? "Wallet Overview"
//                                 : domain === "education"
//                                     ? "Learning Overview"
//                                     : "Overview",
//             },
//         };
//     }

//     if (mode === "mobile") {
//         const templates = mobileTemplates(domain);
//         const chosen = pick(templates, h);

//         return {
//             title: "Mobile App Layout",
//             brand: inferredBrand,
//             isEmpty: false,
//             mode: "mobile",
//             templateId: chosen.id,
//             domain,
//             plan: chosen.plan,
//         };
//     }

//     // fallback (if you use landing separately with generateLanding in LayoutGenerator.jsx)
//     return {
//         title: "Layout",
//         brand: inferredBrand,
//         isEmpty: false,
//         mode,
//         templateId: `GEN-${h % 999}`,
//         domain,
//     };
// }


/**
 * layoutAI.js
 * ─────────────────────────────────────────────────────────────────
 * AI-driven layout prediction using MobileNetV3 (Flask backend).
 *
 * Flow:
 *   1. Send prompt + mode + seed to Flask /predict/layout
 *   2. MobileNetV3 predicts a layout category + confidence score
 *   3. Template hints are returned and used to drive the React renderer
 *   4. If the backend is unreachable, falls back to the original
 *      deterministic rule-based algorithm (layoutGen.js)
 * ─────────────────────────────────────────────────────────────────
 */

import { generateLayout as ruleBasedLayout } from "./layoutGen.js";

const API_BASE = "http://localhost:5000";
const TIMEOUT_MS = 5000; // 5 second timeout before fallback

// ─────────────────────────────────────────────
// Core: call MobileNetV3 backend
// ─────────────────────────────────────────────

/**
 * Sends a prediction request to the Flask/MobileNetV3 backend.
 *
 * @param {string} prompt    - User's layout description
 * @param {string} mode      - "dashboard" | "mobile" | "landing"
 * @param {number} seed      - Integer seed for reproducibility
 * @returns {Promise<object>} - Prediction result with category + template hints
 */
async function fetchAIPrediction(prompt, mode, seed) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE}/predict/layout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({ prompt, mode, seed }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─────────────────────────────────────────────
// Map AI prediction → layout spec
// ─────────────────────────────────────────────

/**
 * Converts a MobileNetV3 prediction result into the layout spec
 * format that DashboardMock, PhoneMock, and LandingMock expect.
 *
 * @param {object} prediction  - Response from Flask backend
 * @param {string} prompt      - Original user prompt
 * @param {string} mode        - Layout mode
 * @param {string} brandName   - Optional brand name
 * @returns {object}           - Layout spec for React components
 */
function predictionToSpec(prediction, prompt, mode, seed, brandName) {
  const hints = prediction.template_hints || {};
  const rb = ruleBasedLayout(prompt, mode, seed, brandName);
  const rbDomain = rb?.domain || "general";
  const domain = rbDomain && rbDomain !== "general" ? rbDomain : (prediction.domain || rbDomain || "general");
  const category = prediction.category || "";
  const confidence = prediction.confidence || 0;

  const base = {
    title: modeTitle(mode),
    brand: brandName || "",
    isEmpty: false,
    mode,
    domain,
    aiPredicted: true,
    modelVersion: prediction.model_version || "MobileNetV3-Large",
    category,
    confidence,
    source: prediction.source || "mobilenetv3",
  };

  // ── Dashboard ────────────────────────────────────────────────
  if (mode === "dashboard") {
    const dashVar = buildHighVarDashboardSpec({
      prompt,
      domain,
      seed,
      brandName,
      hints,
    });

    return {
      ...base,
      variant: dashVar.variant,
      variantId: dashVar.variantId,
      style: dashVar.style,
      layout: {
        sidebar: dashVar.layout.sidebar,
        chart: dashVar.layout.chart,
      },
      content: {
        headline: domainHeadline(domain),
      },
      layoutSchema: dashVar.layoutSchema,
    };
  }

  // ── Mobile ───────────────────────────────────────────────────
  if (mode === "mobile") {
    const mobileVar = buildHighVarMobileSpec({
      prompt,
      domain,
      seed,
      brandName,
      hints,
    });

    const layoutSchema = buildCreativeLayoutSchema(mobileVar.screens, domain, seed);

    return {
      ...base,
      variantId: mobileVar.variantId,
      style: mobileVar.style,
      screens: mobileVar.screens,
      layoutSchema,
      plan: {
        screens: mobileVar.screens,
        nav: mobileVar.nav,
      },
    };
  }

  // ── Landing ──────────────────────────────────────────────────
  if (mode === "landing") {
    return {
      ...base,
      plan: {
        heroStyle:    hints.heroStyle || "centered",
        sections:     hints.sections  || ["hero", "featuresGrid", "finalCta", "footer"],
        templateId:   category.toUpperCase().replace(/-/g, "_"),
        industry:     domain,
        ...landingCopy(domain),
      },
    };
  }

  return base;
}

// ─────────────────────────────────────────────
// Main export: AI-driven generateLayout
// ─────────────────────────────────────────────

/**
 * AI-driven layout generation using MobileNetV3.
 *
 * Tries the Flask backend first. If the backend is unavailable
 * or responds with low confidence, falls back gracefully to
 * the original deterministic algorithm.
 *
 * @param {string}   prompt    - User's prompt text
 * @param {string}   mode      - "dashboard" | "mobile" | "landing"
 * @param {number}   seed      - Seed integer for variation
 * @param {string}   brandName - Optional brand name
 * @param {Function} onStatus  - Optional callback: (status) => void
 *                               Called with "ai" | "fallback" | "error"
 * @returns {Promise<object>}  - Layout spec
 */
export async function generateLayoutAI(prompt, mode, seed, brandName = "", onStatus) {
  const cleanPrompt = (prompt || "").trim();

  if (!cleanPrompt) {
    return { title: modeTitle(mode), brand: brandName, isEmpty: true };
  }

  try {
    // ── Call MobileNetV3 backend ──────────────────────────────
    const prediction = await fetchAIPrediction(cleanPrompt, mode, seed);
    const spec = predictionToSpec(prediction, cleanPrompt, mode, seed, brandName);

    console.log(
      `[LayoutAI] MobileNetV3 predicted: ${prediction.category} ` +
      `(confidence: ${(prediction.confidence * 100).toFixed(1)}%)`
    );

    if (onStatus) onStatus("ai");
    return spec;

  } catch (err) {
    // ── Fallback to rule-based algorithm ─────────────────────
    console.warn("[LayoutAI] Backend unavailable, using rule-based fallback:", err.message);

    if (onStatus) onStatus("fallback");

    const fallback = ruleBasedLayout(cleanPrompt, mode, seed, brandName);
    const domain = fallback.domain || "general";

    if (mode === "dashboard") {
      const dashVar = buildHighVarDashboardSpec({
        prompt: cleanPrompt,
        domain,
        seed,
        brandName,
        hints: {
          variant: fallback.variant,
          sidebar: fallback.layout?.sidebar,
          chart: fallback.layout?.chart,
        },
      });

      return {
        ...fallback,
        domain,
        variant: dashVar.variant,
        variantId: dashVar.variantId,
        style: dashVar.style,
        layout: dashVar.layout,
        layoutSchema: dashVar.layoutSchema,
        aiPredicted: false,
        source: "rule_based_fallback",
      };
    }

    if (mode === "mobile") {
      const mobileVar = buildHighVarMobileSpec({
        prompt: cleanPrompt,
        domain,
        seed,
        brandName,
        hints: {
          screens: fallback.plan?.screens || fallback.screens,
          nav: fallback.plan?.nav,
        },
      });

      return {
        ...fallback,
        domain,
        variantId: mobileVar.variantId,
        style: mobileVar.style,
        screens: mobileVar.screens,
        layoutSchema: buildCreativeLayoutSchema(mobileVar.screens, domain, seed),
        plan: {
          ...(fallback.plan || {}),
          screens: mobileVar.screens,
          nav: mobileVar.nav,
        },
        aiPredicted: false,
        source: "rule_based_fallback",
      };
    }

    return {
      ...fallback,
      aiPredicted: false,
      source: "rule_based_fallback",
    };
  }
}

/**
 * Check if the Flask/MobileNetV3 backend is reachable.
 * Use this to show a status indicator in the UI.
 *
 * @returns {Promise<boolean>}
 */
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function modeTitle(mode) {
  return {
    dashboard: "Dashboard Layout",
    mobile:    "Mobile App Layout",
    landing:   "Landing Page Layout",
  }[mode] || "Layout";
}

function domainHeadline(domain) {
  return {
    fintech:    "Wallet Overview",
    crypto:     "Portfolio Overview",
    food:       "Order Overview",
    gaming:     "Match Overview",
      fitness:    "Activity Overview",
    ecommerce:  "Store Overview",
    education:  "Learning Overview",
    travel:     "Trip Overview",
    saas:       "Platform Overview",
    agency:     "Campaign Overview",
    realestate: "Listings Overview",
    general:    "Overview",
  }[domain] || "Overview";
}

function landingCopy(domain) {
  const copy = {
    fintech:    { headline: "Move money smarter, faster.",          cta: "Get Started",    cta2: "Watch Demo",        features: ["Instant Transfers","Fraud Protection","Smart Budgeting","Multi-currency"] },
    ecommerce:  { headline: "Shop products you'll love.",           cta: "Start Shopping", cta2: "Browse Collections", features: ["Curated Picks","Fast Checkout","Secure Payments","Order Tracking"] },
    fitness:    { headline: "Train smarter. Feel stronger.",        cta: "Start Training", cta2: "See Programs",      features: ["Workout Plans","Progress Tracking","Coach Support","Nutrition Tips"] },
    travel:     { headline: "Experience the magic of travel.",      cta: "Book a Trip",    cta2: "Know More",         features: ["Best Deals","Flexible Dates","Trip Planner","Trusted Reviews"] },
    saas:       { headline: "Turn work into progress.",             cta: "Start Free Trial",cta2: "See How It Works", features: ["Team Spaces","Automation","Analytics","Integrations"] },
    agency:     { headline: "You've got a business, we deliver.",   cta: "Get Started",    cta2: "Discover More",     features: ["Marketing Strategy","SEO Services","Paid Media","Brand Design"] },
    realestate: { headline: "Find your dream home with ease.",      cta: "Browse Listings",cta2: "Learn More",        features: ["Verified Listings","Map Search","Saved Homes","Agent Chat"] },
    general:    { headline: "Launch faster with a modern experience.", cta: "Get Started", cta2: "Learn More",        features: ["Clean Design","Secure Data","Retention Ready","Fast Setup"] },
  };

  return copy[domain] || copy.general;
}




function hashString(str = "") {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rotate(arr, n) {
  if (!arr.length) return arr;
  const k = ((n % arr.length) + arr.length) % arr.length;
  return arr.slice(k).concat(arr.slice(0, k));
}

const MOBILE_STYLE_POOL = [
  { header: "minimal", hero: "bigCard",  list: "cards", nav: "pill",  density: "airy",    radius: 20 },
  { header: "split",   hero: "twoCards", list: "rows",  nav: "boxed", density: "compact", radius: 14 },
  { header: "centered",hero: "gridHero", list: "cards", nav: "icons", density: "normal",  radius: 16 },
  { header: "minimal", hero: "bannerAndList", list: "rows", nav: "pill", density: "compact", radius: 18 },
  { header: "split",   hero: "bigCard", list: "timeline", nav: "icons", density: "airy",   radius: 22 },
  { header: "centered",hero: "twoCards", list: "rows", nav: "boxed", density: "normal",   radius: 24 },
];

const MOBILE_BASE_PACKS = [
  ["onboarding", "home", "search", "products", "productDetail", "cart", "checkout", "orders", "profile", "settings"],
  ["onboarding", "home", "wallet", "transactions", "analytics", "cards", "profile", "settings", "search", "feed"],
  ["onboarding", "home", "workouts", "progress", "activity", "classes", "profile", "settings", "search", "feed"],
  ["onboarding", "home", "restaurants", "menu", "cart", "checkout", "orders", "profile", "search", "list"],
  ["onboarding", "search", "booking", "itinerary", "detail", "tickets", "profile", "settings", "feed", "home"],
  ["onboarding", "home", "courses", "lesson", "progress", "activity", "profile", "settings", "search", "feed"],
  ["onboarding", "home", "messages", "notifications", "feed", "profile", "settings", "search", "list", "detail"],
  ["onboarding", "home", "grid", "detail", "collection", "list", "profile", "settings", "search", "orders"],
  ["onboarding", "home", "wallet", "cards", "transactions", "analytics", "search", "profile", "settings", "feed"],
  ["onboarding", "home", "products", "collection", "detail", "cart", "orders", "profile", "search", "settings"],
];

const MOBILE_DOMAIN_PACKS = {
  ecommerce: [
    ["onboarding", "home", "grid", "products", "productDetail", "cart", "checkout", "orders", "profile", "search"],
    ["onboarding", "home", "products", "search", "productDetail", "cart", "orders", "profile", "collection", "checkout"],
  ],
  fintech: [
    ["onboarding", "home", "wallet", "cards", "transactions", "analytics", "search", "profile", "settings", "feed"],
    ["onboarding", "home", "wallet", "transactions", "cards", "analytics", "detail", "profile", "settings", "search"],
  ],
  crypto: [
    ["onboarding", "home", "portfolio", "markets", "trade", "wallet", "analytics", "transactions", "cards", "profile"],
    ["onboarding", "home", "markets", "portfolio", "trade", "wallet", "transactions", "analytics", "orders", "profile"],
  ],
  food: [
    ["onboarding", "home", "restaurants", "menu", "cart", "checkout", "orders", "payments", "profile", "search"],
    ["onboarding", "home", "menu", "restaurants", "cart", "payments", "checkout", "orders", "profile", "search"],
  ],
  education: [
    ["onboarding", "home", "courses", "lesson", "progress", "activity", "profile", "search", "settings", "feed"],
    ["onboarding", "home", "courses", "detail", "lesson", "progress", "profile", "settings", "search", "collection"],
  ],
  gaming: [
    ["onboarding", "home", "lobby", "matches", "leaderboard", "store", "inventory", "profile", "search", "settings"],
    ["onboarding", "home", "matches", "lobby", "leaderboard", "achievements", "store", "inventory", "profile", "settings"],
  ],
  fitness: [
    ["onboarding", "home", "workouts", "workouts", "progress", "activity", "classes", "profile", "list", "settings"],
    ["onboarding", "today", "workouts", "progress", "activity", "classes", "list", "profile", "search", "settings"],
  ],
  travel: [
    ["onboarding", "search", "booking", "detail", "itinerary", "tickets", "profile", "settings", "feed", "list"],
    ["onboarding", "home", "search", "booking", "itinerary", "tickets", "profile", "settings", "detail", "collection"],
  ],
};

function buildHighVarMobileSpec({ prompt, domain, seed, brandName, hints }) {
  const rb = ruleBasedLayout(prompt, "mobile", seed, brandName);

  const domainPacks = MOBILE_DOMAIN_PACKS[domain] || [];
  const packs = domainPacks.length ? domainPacks : MOBILE_BASE_PACKS;

  const hash = hashString(`${prompt}|${domain}|${seed}|${brandName}`);
  const packIdx = hash % packs.length;
  const styleIdx = (hash >>> 3) % MOBILE_STYLE_POOL.length;

  let screens = [...packs[packIdx]];

  // Add AI hint screens into the pool if present.
  if (Array.isArray(hints?.screens) && hints.screens.length) {
    const normalized = hints.screens.map((s) => String(s || "").trim()).filter(Boolean);
    screens = normalized.concat(screens);
  }

  // Deterministic rotation and mirroring for stronger variation.
  const shift = (hash >>> 6) % Math.max(screens.length, 1);
  screens = rotate(screens, shift);

  if (((hash >>> 10) % 2) === 1) {
    const first = screens[0];
    const rest = screens.slice(1).reverse();
    screens = [first, ...rest];
  }

  // Deduplicate while preserving order.
  const seen = new Set();
  screens = screens.filter((s) => {
    const k = String(s).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // Ensure at least 10 candidates so PhoneMock can render distinct 4/6/12 batches.
  const fallbackScreens = rb.screens || ["onboarding", "home", "search", "detail", "profile", "settings", "orders", "checkout", "feed", "collection"];
  for (const s of fallbackScreens) {
    const k = String(s).toLowerCase();
    if (!seen.has(k)) {
      seen.add(k);
      screens.push(s);
    }
    if (screens.length >= 12) break;
  }

  const baseStyle = MOBILE_STYLE_POOL[styleIdx];
  const style = {
    ...(rb.style || {}),
    ...baseStyle,
    // micro jitter per seed for extra uniqueness
    radius: [14, 16, 18, 20, 22, 24][(hash >>> 12) % 6],
    density: ["airy", "normal", "compact"][(hash >>> 14) % 3],
  };

  return {
    variantId: `mobile-v${packIdx}-${styleIdx}-${(hash >>> 10) % 2}`,
    style,
    nav: hints?.nav || style.nav || "pill",
    screens,
  };
}



const SECTION_LIBRARY = {
  onboarding:    ["hero", "featureRow", "chips", "cta"],
  home:          ["search", "hero", "cards", "list"],
  search:        ["search", "chips", "cards", "list"],
  grid:          ["tabs", "cards", "cards", "cta"],
  detail:        ["media", "stats", "timeline", "cta"],
  list:          ["search", "list", "list", "cta"],
  collection:    ["chips", "cards", "cards", "stats"],
  activity:      ["stats", "timeline", "cards", "cta"],
  feed:          ["list", "media", "list", "chips"],
  profile:       ["stats", "list", "cards", "cta"],
  settings:      ["form", "list", "cta"],
  tickets:       ["cards", "timeline", "cta"],
  orders:        ["list", "cards", "stats", "cta"],
  checkout:      ["form", "cards", "stats", "cta"],
  payments:      ["form", "cards", "cta", "stats"],
  portfolio:     ["hero", "stats", "timeline", "cta"],
  markets:       ["search", "list", "list", "cta"],
  trade:         ["media", "stats", "form", "cta"],
  restaurants:   ["search", "cards", "list", "cta"],
  menu:          ["tabs", "list", "list", "cta"],
  courses:       ["search", "cards", "cards", "cta"],
  lesson:        ["media", "stats", "timeline", "cta"],
  progress:      ["stats", "timeline", "cards", "cta"],
  quiz:          ["form", "cards", "cta"],
  lobby:         ["hero", "cards", "list", "cta"],
  matches:       ["list", "cards", "stats", "cta"],
  leaderboard:   ["stats", "list", "cta"],
  store:         ["tabs", "cards", "cards", "cta"],
  inventory:     ["cards", "list", "cta"],
  achievements:  ["stats", "cards", "cta"],
};

function normalizeScreenKey(screenId) {
  const s = String(screenId || "").toLowerCase();
  if (s === "products") return "grid";
  if (s === "productdetail" || s === "product") return "detail";
  if (s === "transactions") return "list";
  if (s === "wallet" || s === "cards" || s === "analytics") return "activity";
  if (s === "messages" || s === "notifications" || s === "restaurants" || s === "menu") return "list";
  if (s === "booking") return "search";
  if (s === "itinerary") return "feed";
  if (s === "courses") return "courses";
  if (s === "lesson") return "lesson";
  if (s === "progress") return "progress";
  if (s === "portfolio") return "portfolio";
  if (s === "markets") return "markets";
  if (s === "trade") return "trade";
  if (s === "payments") return "payments";
  if (s === "lobby") return "lobby";
  if (s === "matches") return "matches";
  if (s === "leaderboard") return "leaderboard";
  if (s === "store") return "store";
  if (s === "inventory") return "inventory";
  if (s === "achievements") return "achievements";
  if (s === "today" || s === "welcome") return s === "today" ? "home" : "onboarding";
  return s;
}

function buildCreativeLayoutSchema(screenIds, domain, seed) {
  const randSeed = hashString(`${domain}|${seed}|${screenIds.join(",")}`);
  const shiftA = randSeed % 7;
  const shiftB = (randSeed >>> 3) % 5;

  const screens = screenIds.map((id, idx) => {
    const key = normalizeScreenKey(id);
    const baseSections = SECTION_LIBRARY[key] || ["hero", "cards", "list", "cta"];

    // Deterministic section rotation + occasional reversal for stronger variation.
    let sections = rotate(baseSections, (idx + shiftA) % baseSections.length);
    if (((idx + shiftB) % 3) === 1) {
      sections = [sections[0], ...sections.slice(1).reverse()];
    }

    // Unique id per section slot allows renderer to vary appearance.
    const sectionDefs = sections.map((type, sIdx) => ({
      id: `${id}-${type}-${sIdx}`,
      type,
      tone: ["soft", "bold", "clean"][(randSeed + idx + sIdx) % 3],
      density: ["airy", "normal", "compact"][(randSeed + idx * 2 + sIdx) % 3],
    }));

    return {
      id,
      title: prettifyScreenTitle(id),
      flow: key,
      sections: sectionDefs,
    };
  });

  const screenMap = Object.fromEntries(
    screens.map((s) => [String(s.id).toLowerCase(), s])
  );

  return {
    version: 1,
    domain,
    screens,
    screenMap,
  };
}

function prettifyScreenTitle(id) {
  const text = String(id || "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Screen";
}


const DASH_STYLE_POOL = [
  { frame: "split", sidebar: "panel", topbar: "search-heavy", tone: "clean" },
  { frame: "rail", sidebar: "icons", topbar: "compact", tone: "vivid" },
  { frame: "triple", sidebar: "cards", topbar: "actions", tone: "soft" },
  { frame: "single", sidebar: "none", topbar: "wide", tone: "clean" },
  { frame: "split", sidebar: "pills", topbar: "minimal", tone: "balanced" },
];

const DASH_SECTION_LIBRARY = [
  "topbar",
  "kpis",
  "trend",
  "table",
  "feed",
  "calendar",
  "map",
  "funnel",
  "kanban",
  "timeline",
  "summary",
  "goals",
];

const DASH_PACKS = {
  general: [
    ["topbar", "kpis", "trend", "table", "summary"],
    ["topbar", "kpis", "funnel", "feed", "timeline"],
    ["topbar", "kpis", "trend", "calendar", "table"],
    ["topbar", "summary", "kpis", "feed", "goals"],
    ["topbar", "kpis", "map", "table", "timeline"],
  ],
  ecommerce: [
    ["topbar", "kpis", "trend", "table", "feed"],
    ["topbar", "summary", "kpis", "map", "table"],
    ["topbar", "kpis", "funnel", "timeline", "table"],
  ],
  fintech: [
    ["topbar", "kpis", "trend", "summary", "table"],
    ["topbar", "kpis", "funnel", "feed", "timeline"],
    ["topbar", "summary", "kpis", "trend", "goals"],
  ],
  fitness: [
    ["topbar", "kpis", "goals", "timeline", "feed"],
    ["topbar", "summary", "kpis", "trend", "calendar"],
    ["topbar", "kpis", "goals", "table", "timeline"],
  ],
  logistics: [
    ["topbar", "kpis", "map", "table", "timeline"],
    ["topbar", "summary", "kpis", "map", "feed"],
    ["topbar", "kpis", "table", "funnel", "timeline"],
  ],
  education: [
    ["topbar", "kpis", "goals", "table", "feed"],
    ["topbar", "summary", "kpis", "timeline", "calendar"],
    ["topbar", "kpis", "trend", "feed", "goals"],
  ],
};

function buildHighVarDashboardSpec({ prompt, domain, seed, brandName, hints }) {
  const rb = ruleBasedLayout(prompt, "dashboard", seed, brandName);
  const domainPacks = DASH_PACKS[domain] || [];
  const allPacks = (DASH_PACKS.general || []).concat(domainPacks);
  const packs = allPacks.length ? allPacks : [DASH_SECTION_LIBRARY.slice(0, 5)];

  const hash = hashString(`${prompt}|${domain}|${seed}|${brandName}|dash`);
  const styleIdx = Math.abs(seed) % DASH_STYLE_POOL.length;
  const packIdx = Math.abs((hash >>> 3) + seed * 11) % packs.length;
  const structureModePool = ["stack", "mosaic", "splitRows", "dense"];
  const structureMode = structureModePool[Math.abs(seed + (hash >>> 5)) % structureModePool.length];

  let sections = [...packs[packIdx]];
  const shift = Math.abs((hash >>> 7) + seed * 2) % Math.max(sections.length, 1);
  sections = rotate(sections, shift);

  if ((((hash >>> 11) + seed) % 2) === 1) {
    sections = [sections[0], ...sections.slice(1).reverse()];
  }

  if (Array.isArray(hints?.sections) && hints.sections.length) {
    for (const s of hints.sections) {
      const key = String(s || "").toLowerCase().trim();
      if (key && !sections.includes(key)) sections.push(key);
    }
  }

  for (const s of DASH_SECTION_LIBRARY) {
    if (!sections.includes(s)) sections.push(s);
    if (sections.length >= 7) break;
  }

  const variantPool = ["minimal", "finance", "analytics", "skills", "logistics", "fitness"];
  const variant = hints?.variant || variantPool[((hash >>> 13) + seed) % variantPool.length];

  return {
    variant,
    variantId: `dash-v${packIdx}-${styleIdx}-${(((hash >>> 11) + seed) % 2)}`,
    style: DASH_STYLE_POOL[styleIdx],
    layout: {
      sidebar: hints?.sidebar || DASH_STYLE_POOL[styleIdx].sidebar || rb.layout?.sidebar || "pill",
      chart: hints?.chart || rb.layout?.chart || "line",
    },
    layoutSchema: buildCreativeDashboardSchema(sections, domain, hash, DASH_STYLE_POOL[styleIdx], structureMode),
  };
}

function buildCreativeDashboardSchema(sectionOrder, domain, hash, style, structureMode = "splitRows") {
  const rows = [];

  rows.push({
    id: "row-topbar",
    columns: "1fr",
    sections: [{ id: "topbar-0", type: "topbar", tone: "clean" }],
  });

  const ordered = sectionOrder.filter((s) => s !== "topbar");

  if (structureMode === "stack") {
    for (let i = 0; i < ordered.length; i++) {
      rows.push({
        id: `row-stack-${i}`,
        columns: "1fr",
        sections: [{
          id: `${ordered[i]}-${i}`,
          type: ordered[i],
          tone: ["clean", "soft", "bold"][(hash + i) % 3],
        }],
      });
    }
  } else if (structureMode === "mosaic") {
    for (let i = 0; i < ordered.length; i += 3) {
      const chunk = ordered.slice(i, i + 3);
      const colsByCount = ["1fr", "1.3fr 1fr", "1.6fr 1fr 1fr"];
      rows.push({
        id: `row-mosaic-${i}`,
        columns: colsByCount[chunk.length - 1] || "1fr",
        sections: chunk.map((type, sIdx) => ({
          id: `${type}-${i + sIdx}`,
          type,
          tone: ["clean", "soft", "bold"][(hash + i + sIdx) % 3],
        })),
      });
    }
  } else if (structureMode === "dense") {
    rows.push({
      id: "row-dense-a",
      columns: "repeat(3, 1fr)",
      sections: ordered.slice(0, 3).map((type, idx) => ({
        id: `${type}-${idx}`,
        type,
        tone: ["clean", "soft", "bold"][(hash + idx) % 3],
      })),
    });
    rows.push({
      id: "row-dense-b",
      columns: "2fr 1fr",
      sections: ordered.slice(3, 5).map((type, idx) => ({
        id: `${type}-${3 + idx}`,
        type,
        tone: ["clean", "soft", "bold"][(hash + 3 + idx) % 3],
      })),
    });
    if (ordered[5]) {
      rows.push({
        id: "row-dense-c",
        columns: "1fr",
        sections: [{
          id: `${ordered[5]}-5`,
          type: ordered[5],
          tone: ["clean", "soft", "bold"][(hash + 5) % 3],
        }],
      });
    }
  } else {
    for (let i = 0; i < ordered.length; i += 2) {
      const a = ordered[i];
      const b = ordered[i + 1];
      const flip = ((hash + i) % 3) === 1;
      const columns = b ? (flip ? "1fr 1.6fr" : "1.6fr 1fr") : "1fr";
      const pair = b ? (flip ? [b, a] : [a, b]) : [a];
      rows.push({
        id: `row-${i}`,
        columns,
        sections: pair.map((type, sIdx) => ({
          id: `${type}-${i + sIdx}`,
          type,
          tone: ["clean", "soft", "bold"][(hash + i + sIdx) % 3],
        })),
      });
    }
  }

  return {
    version: 1,
    domain,
    style,
    structureMode,
    rows,
  };
}















