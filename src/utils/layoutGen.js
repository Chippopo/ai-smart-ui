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

function pick(rand, arr) {
    return arr[Math.floor(rand() * arr.length)];
}

function keywords(prompt) {
    const p = (prompt || "").toLowerCase();
    return {
        crypto: p.includes("crypto") || p.includes("bitcoin") || p.includes("btc") || p.includes("ethereum") || p.includes("eth") || p.includes("token") || p.includes("blockchain") || p.includes("exchange") || p.includes("defi"),
        fintech: p.includes("fintech") || p.includes("bank") || p.includes("finance") || p.includes("payment"),
        ecommerce: p.includes("ecommerce") || p.includes("shop") || p.includes("store") || p.includes("market"),
        fitness: p.includes("fitness") || p.includes("gym") || p.includes("workout"),
        food: p.includes("food") || p.includes("restaurant") || p.includes("delivery"),
        gaming: p.includes("gaming") || p.includes("game") || p.includes("esport") || p.includes("arcade") || p.includes("rpg"),
        social: p.includes("social") || p.includes("chat") || p.includes("community"),
        travel: p.includes("travel") || p.includes("hotel") || p.includes("flight"),
        edu: p.includes("education") || p.includes("learn") || p.includes("school") || p.includes("course"),
        health: p.includes("health") || p.includes("clinic") || p.includes("doctor"),
    };
}

function brandFromPrompt(prompt, rand) {
    const p = (prompt || "").toLowerCase();
    const base = [];
    if (p.includes("crypto") || p.includes("bitcoin") || p.includes("blockchain") || p.includes("token") || p.includes("exchange")) {
        base.push("Chain", "Block", "Coin", "Ledger", "Atlas", "Nova");
    }
    if (p.includes("fintech") || p.includes("bank") || p.includes("payment")) base.push("Pay", "Vault", "Coin", "Pulse");
    if (p.includes("ecommerce") || p.includes("shop") || p.includes("store")) base.push("Shop", "Cart", "Nest", "Market");
    if (p.includes("fitness") || p.includes("gym")) base.push("Fit", "Core", "Move", "Stride");
    if (p.includes("food") || p.includes("delivery")) base.push("Bite", "Dash", "Dine", "Fresh");
    if (p.includes("gaming") || p.includes("game") || p.includes("esport")) base.push("Arcade", "Pixel", "Quest", "Pulse");
    if (p.includes("education") || p.includes("learn")) base.push("Learn", "Class", "Skill", "Bright");
    if (base.length === 0) base.push("Nova", "Orbit", "Aurora", "Lumen", "Nimbus", "Quartz");
    return `${pick(rand, base)}${pick(rand, ["Wave", "Flow", "Hub", "Mate", "Pilot", "Pro", "X"])}`;
}

function shuffle(rand, arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function screensForPrompt(prompt, rand) {
    const k = keywords(prompt);

    let recipe = ["onboarding", "home", "feed", "grid", "detail", "collection", "list", "profile", "search", "settings"];

    if (k.crypto) {
        recipe = ["onboarding", "home", "portfolio", "markets", "trade", "wallet", "analytics", "transactions", "cards", "orders", "profile", "settings"];
    } else if (k.fintech) {
        recipe = ["onboarding", "home", "wallet", "transactions", "analytics", "cards", "profile", "search", "settings"];
    } else if (k.ecommerce) {
        recipe = ["onboarding", "home", "products", "productDetail", "cart", "payments", "checkout", "orders", "profile", "search"];
    } else if (k.fitness) {
        recipe = ["onboarding", "home", "workouts", "progress", "activity", "classes", "profile", "search", "settings"];
    } else if (k.food) {
        recipe = ["onboarding", "home", "restaurants", "menu", "cart", "checkout", "orders", "profile", "search"];
    } else if (k.gaming) {
        recipe = ["onboarding", "home", "lobby", "matches", "leaderboard", "store", "inventory", "profile", "search", "settings"];
    } else if (k.social) {
        recipe = ["onboarding", "feed", "messages", "activity", "profile", "search", "notifications", "settings"];
    } else if (k.travel) {
        recipe = ["onboarding", "search", "booking", "itinerary", "detail", "profile", "settings", "tickets"];
    } else if (k.edu) {
        recipe = ["onboarding", "home", "courses", "lesson", "progress", "activity", "profile", "search", "settings"];
    } else if (k.health) {
        recipe = ["onboarding", "home", "booking", "detail", "activity", "profile", "search", "settings"];
    }

    const mustHave = ["onboarding", "home", "profile"];
    const ordered = [...recipe];
    for (let i = mustHave.length - 1; i >= 0; i--) {
        const s = mustHave[i];
        if (!ordered.includes(s)) ordered.unshift(s);
    }

    // Keep semantic screen order stable so names match expected flows.
    const seen = new Set();
    return ordered.filter((s) => {
        if (seen.has(s)) return false;
        seen.add(s);
        return true;
    });
}

/* ===== This is the "AI part": layout DNA changes every regenerate ===== */
function styleDNA(rand) {
    return {
        // header style changes: centered / split / minimal
        header: pick(rand, ["centered", "split", "minimal"]),

        // content style changes
        hero: pick(rand, ["bigCard", "twoCards", "bannerAndList", "gridHero"]),
        list: pick(rand, ["cards", "rows", "timeline"]),
        grid: pick(rand, ["twoCol", "threeCol", "mixed"]),
        cta: pick(rand, ["bottomBar", "floating", "inline"]),
        chips: pick(rand, ["topChips", "sideChips", "noChips"]),
        density: pick(rand, ["airy", "normal", "compact"]),

        // micro: corner roundness & stroke
        radius: pick(rand, [14, 16, 18, 20]),
        stroke: pick(rand, [0.08, 0.10, 0.12]),

        // nav style
        nav: pick(rand, ["icons", "pill", "boxed"]),
    };
}

export function generateLayout(prompt, mode, seed = 1, brandOverride = "") {
    const clean = (prompt || "").trim();
    const base = hashString(clean + "|" + mode + "|" + seed);
    const rand = mulberry32(base);
    const k = keywords(clean);

    const brand = brandOverride ? brandOverride : brandFromPrompt(clean, rand);

    if (mode === "mobile") {
        return {
            title: "Mobile App Layout",
            brand,
            domain: domainFromKeywords(k),
            isEmpty: !clean,
            screens: screensForPrompt(clean, rand),
            style: styleDNA(rand), // <- changes every seed
        };
    }

    if (mode === "landing") return { title: "Landing Page Layout", brand };
    return { title: "Dashboard Layout", brand: `${brand} Admin` };
}

function domainFromKeywords(k) {
    if (k.crypto) return "crypto";
    if (k.fintech) return "fintech";
    if (k.ecommerce) return "ecommerce";
    if (k.fitness) return "fitness";
    if (k.food) return "food";
    if (k.gaming) return "gaming";
    if (k.social) return "social";
    if (k.travel) return "travel";
    if (k.edu) return "education";
    if (k.health) return "health";
    return "general";
}








