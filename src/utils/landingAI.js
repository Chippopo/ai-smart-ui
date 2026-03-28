// src/utils/landingAI.js
// Generates a landing-page "plan" from prompt + seed.
// Named export MUST be generateLanding.

function hashString(str = "") {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function mulberry32(seed) {
    let t = seed >>> 0;
    return function () {
        t += 0x6d2b79f5;
        let x = Math.imul(t ^ (t >>> 15), 1 | t);
        x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
        return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
}

function pick(rng, arr) {
    return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function inferIndustry(prompt) {
    const p = (prompt || "").toLowerCase();
    if (p.includes("fintech") || p.includes("bank") || p.includes("wallet") || p.includes("payment"))
        return "fintech";
    if (p.includes("ecommerce") || p.includes("shop") || p.includes("store") || p.includes("cart") || p.includes("fashion"))
        return "ecommerce";
    if (p.includes("travel") || p.includes("flight") || p.includes("hotel") || p.includes("tour"))
        return "travel";
    if (p.includes("gym") || p.includes("fitness") || p.includes("workout") || p.includes("wellness"))
        return "fitness";
    if (p.includes("health") || p.includes("clinic") || p.includes("doctor"))
        return "health";
    if (p.includes("real estate") || p.includes("property") || p.includes("rent") || p.includes("house"))
        return "realestate";
    if (p.includes("saas") || p.includes("software") || p.includes("b2b") || p.includes("dashboard"))
        return "saas";
    if (p.includes("agency") || p.includes("marketing") || p.includes("consulting"))
        return "agency";
    return "startup";
}

function defaultCopy(industry) {
    const map = {
        travel: {
            headline: "Experience The Magic Of Flight!",
            sub: "Find deals, book fast, and organize every step of your journey.",
            cta: "Book a Trip",
            cta2: "Know More",
            features: ["Best Deals", "Flexible Dates", "Trip Planner", "Trusted Reviews"],
        },
        agency: {
            headline: "You’ve got a business, we’ve got brilliant minds.",
            sub: "Strategy, design, and delivery that turns ideas into results.",
            cta: "Get Started",
            cta2: "Discover More",
            features: ["Marketing Strategy", "SEO Services", "Paid Media", "Brand Design"],
        },
        fintech: {
            headline: "Move money smarter, faster.",
            sub: "Secure payments, instant transfers, and clear insights in one place.",
            cta: "Get Started",
            cta2: "Watch Demo",
            features: ["Instant Transfers", "Fraud Protection", "Smart Budgeting", "Multi-currency"],
        },
        ecommerce: {
            headline: "Shop products you’ll love.",
            sub: "Curated collections, fast checkout, and delivery you can trust.",
            cta: "Start Shopping",
            cta2: "Browse Collections",
            features: ["Curated Picks", "Fast Checkout", "Secure Payments", "Order Tracking"],
        },
        fitness: {
            headline: "Train smarter. Feel stronger.",
            sub: "Programs, progress tracking, and coaching built for consistency.",
            cta: "Start Training",
            cta2: "See Programs",
            features: ["Workout Plans", "Progress Tracking", "Coach Support", "Nutrition Tips"],
        },
        realestate: {
            headline: "Find your dream home with ease.",
            sub: "Search listings, compare options, and schedule visits quickly.",
            cta: "Browse Listings",
            cta2: "Learn More",
            features: ["Verified Listings", "Map Search", "Saved Homes", "Agent Chat"],
        },
        saas: {
            headline: "Turn work into progress.",
            sub: "A clean platform to plan, track, and ship with your team.",
            cta: "Start Free Trial",
            cta2: "See How It Works",
            features: ["Team Spaces", "Automation", "Analytics", "Integrations"],
        },
        startup: {
            headline: "Launch faster with a modern experience.",
            sub: "Clean design, clear value, and sections that convert visitors.",
            cta: "Get Started",
            cta2: "Learn More",
            features: ["Clean Design", "Secure Data", "Retention Ready", "Fast Setup"],
        },
        health: {
            headline: "Care that fits your life.",
            sub: "Book appointments, track progress, and get support when you need it.",
            cta: "Book Now",
            cta2: "See Services",
            features: ["Easy Booking", "Private Records", "Smart Reminders", "Expert Support"],
        },
    };
    return map[industry] || map.startup;
}

// “Templates” now represent REAL different layouts (not just background)
const TEMPLATES = [
    {
        id: "TRAVEL_HERO_IMAGE",
        hero: "imageRight",
        vibe: "airy",
        sections: ["hero", "logos", "cards3", "splitShowcase", "ctaBand", "footer"],
    },
    {
        id: "AGENCY_PEOPLE_STATS",
        hero: "imageRightStats",
        vibe: "warm",
        sections: ["hero", "proofStrip", "aboutSplit", "servicesCards", "bigBand", "footer"],
    },
    {
        id: "SAAS_PURPLE_PHONE",
        hero: "phoneRight",
        vibe: "gradient",
        sections: ["hero", "logos", "featuresGrid", "twoColSteps", "testimonials", "finalCta", "footer"],
    },
    {
        id: "FINTECH_GREEN_STEPS",
        hero: "phoneLeft",
        vibe: "clean",
        sections: ["hero", "ratingStrip", "featuresGrid", "timelineSteps", "faq", "finalCta", "footer"],
    },
    {
        id: "REAL_ESTATE_LISTINGS",
        hero: "searchHero",
        vibe: "minimal",
        sections: ["hero", "listingsRow", "guideSplit", "testimonials", "blogRow", "footer"],
    },
    {
        id: "MINIMAL_MONO",
        hero: "centered",
        vibe: "mono",
        sections: ["hero", "logos", "featuresGrid", "stats", "faq", "finalCta", "footer"],
    },
];

// Palettes vary per industry (so gym store won’t look like travel)
const HERO_STYLES = ["centered", "imageRight", "imageRightStats", "phoneRight", "phoneLeft", "searchHero"];

function rotate(arr, n) {
    if (!arr.length) return arr;
    const k = ((n % arr.length) + arr.length) % arr.length;
    return arr.slice(k).concat(arr.slice(0, k));
}

function buildHighVarSections(baseSections, seed, rng) {
    const core = Array.isArray(baseSections) && baseSections.length
        ? [...baseSections]
        : ["hero", "featuresGrid", "finalCta", "footer"];

    const first = core[0] === "hero" ? "hero" : null;
    const last = core.includes("footer") ? "footer" : null;
    const middle = core.filter((s) => s !== "hero" && s !== "footer");

    let varied = rotate(middle, Math.abs(seed * 3 + middle.length) % Math.max(middle.length, 1));
    if ((seed % 2) === 1) varied = varied.reverse();

    const addPool = ["logos", "featuresGrid", "cards3", "splitShowcase", "proofStrip", "timelineSteps", "faq", "listingsRow"];
    const extraCount = 1 + (Math.abs(seed) % 2);
    for (let i = 0; i < extraCount; i++) {
        const pickIdx = Math.floor(rng() * addPool.length);
        const extra = addPool[pickIdx];
        if (!varied.includes(extra)) varied.push(extra);
    }

    varied = varied.slice(0, 7);

    return [first, ...varied, last].filter(Boolean);
}
function paletteFor(industry, rng) {
    const palettes = {
        travel: [
            { accent: "#2563EB", accent2: "#38BDF8", bg: "#F8FAFC", ink: "#0F172A" },
            { accent: "#0EA5E9", accent2: "#22C55E", bg: "#F9FAFB", ink: "#0F172A" },
        ],
        agency: [
            { accent: "#F59E0B", accent2: "#FB7185", bg: "#FFFBF5", ink: "#0F172A" },
            { accent: "#FB7185", accent2: "#A78BFA", bg: "#FFF7FB", ink: "#0F172A" },
        ],
        fintech: [
            { accent: "#16A34A", accent2: "#22C55E", bg: "#F6FFFB", ink: "#052014" },
            { accent: "#0EA5E9", accent2: "#22C55E", bg: "#F6FBFF", ink: "#072235" },
        ],
        ecommerce: [
            { accent: "#6D5DFE", accent2: "#A78BFA", bg: "#FBFAFF", ink: "#0F172A" },
            { accent: "#F97316", accent2: "#FB7185", bg: "#FFF7ED", ink: "#0F172A" },
        ],
        fitness: [
            { accent: "#22C55E", accent2: "#10B981", bg: "#F7FFF9", ink: "#052014" },
            { accent: "#111827", accent2: "#22C55E", bg: "#F8FAFC", ink: "#0B1020" },
        ],
        realestate: [
            { accent: "#111827", accent2: "#60A5FA", bg: "#F8FAFC", ink: "#0F172A" },
            { accent: "#0EA5E9", accent2: "#111827", bg: "#F7FBFF", ink: "#0F172A" },
        ],
        saas: [
            { accent: "#6D5DFE", accent2: "#60A5FA", bg: "#F8FAFF", ink: "#0F172A" },
            { accent: "#8B5CF6", accent2: "#EC4899", bg: "#FBF7FF", ink: "#0F172A" },
        ],
        startup: [
            { accent: "#6D5DFE", accent2: "#A78BFA", bg: "#FBFAFF", ink: "#0F172A" },
            { accent: "#2DD4BF", accent2: "#60A5FA", bg: "#F6FFFE", ink: "#072235" },
        ],
        health: [
            { accent: "#0EA5E9", accent2: "#22C55E", bg: "#F6FBFF", ink: "#072235" },
            { accent: "#22C55E", accent2: "#34D399", bg: "#F6FFFB", ink: "#052014" },
        ],
    };

    const list = palettes[industry] || palettes.startup;
    return pick(rng, list);
}

export function generateLanding(prompt = "", seed = 1) {
    const industry = inferIndustry(prompt);
    const base = defaultCopy(industry);

    // Seed changes MUST change templates:
    const mixedSeed = (hashString(prompt) ^ (seed * 2654435761)) >>> 0;
    const rng = mulberry32(mixedSeed);

    // Strong deterministic seed spread for visible variation per click
    const template = TEMPLATES[Math.abs((mixedSeed ^ (seed * 97)) % TEMPLATES.length)];
    const heroStyle = HERO_STYLES[Math.abs((mixedSeed >>> 3) + seed) % HERO_STYLES.length];
    const layoutVariant = ["split", "stacked", "editorial", "mosaic"][Math.abs(seed + (mixedSeed >>> 5)) % 4];
    const sections = buildHighVarSections(template.sections, seed, rng);

    const palette = paletteFor(industry, rng);

    const headline = pick(rng, [
        base.headline,
        base.headline.replace("!", "."),
        base.headline.replace(".", "!"),
        `A modern ${industry} landing page that converts.`,
    ]);

    const subheadline = pick(rng, [
        base.sub,
        base.sub + " Clean, clear, premium layout.",
        "Designed to look real, modern, and trustworthy.",
        "A strong hero + sections with clear hierarchy.",
    ]);

    const cta = pick(rng, [base.cta, "Get Started", "Start Now", "Join Today"]);
    const cta2 = pick(rng, [base.cta2, "View Pricing", "See Demo", "Learn More"]);

    const features = shuffle(rng, [...base.features, "Fast Support", "Simple Setup", "Mobile Ready", "Privacy First"]).slice(0, 4);

    const stats = shuffle(rng, [
        { k: "10M+", v: "Actions processed" },
        { k: "4.9★", v: "Average rating" },
        { k: "99.9%", v: "Uptime" },
        { k: "30k+", v: "Happy customers" },
    ]).slice(0, 3);

    const testimonials = shuffle(rng, [
        { name: "Amina", role: "Founder", text: "Clean, premium, and easy to trust. Exactly what we needed." },
        { name: "Tunde", role: "Product Lead", text: "The structure is modern and the CTA placement is strong." },
        { name: "Sarah", role: "Marketing", text: "Looks like a real landing page, not a wireframe." },
    ]).slice(0, 3);

    // output plan includes “layout” controls
    return {
        prompt,
        seed,
        industry,
        templateId: template.id,
        heroStyle,
        vibe: template.vibe,
        palette,
        headline,
        subheadline,
        cta,
        cta2,
        features,
        stats,
        testimonials,
        sections,
        layoutVariant,
    };
}





