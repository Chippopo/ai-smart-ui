import React from "react";

const FALLBACK_STYLE = {
    radius: 18,
    density: "normal",
    hero: "bigCard",
    list: "cards",
    nav: "pill",
    header: "minimal",
};

const SCREEN_CATALOG = [
    "onboarding",
    "home",
    "search",
    "products",
    "productDetail",
    "cart",
    "workouts",
    "progress",
    "wallet",
    "transactions",
    "analytics",
    "cards",
    "portfolio",
    "markets",
    "trade",
    "payments",
    "restaurants",
    "menu",
    "booking",
    "itinerary",
    "courses",
    "lesson",
    "lobby",
    "matches",
    "leaderboard",
    "store",
    "inventory",
    "achievements",
    "messages",
    "notifications",
    "classes",
    "grid",
    "detail",
    "list",
    "collection",
    "activity",
    "feed",
    "profile",
    "settings",
    "tickets",
    "orders",
    "checkout",
];

export default function PhoneMock({ spec, screen, count = 6, onFrameClick }) {
    const baseStyle = normalizeStyle(spec?.style);
    const svgMarkup = !screen ? extractPhoneMockSvg(spec) : "";

    if (svgMarkup) {
        return (
            <>
                <PhoneMockStyles />
                <div className="phone-mock-wrap">
                    <SvgPhoneMockPreview svgMarkup={svgMarkup} />
                </div>
            </>
        );
    }

    if (screen) {
        return (
            <>
                <PhoneMockStyles />
                <div className="phone-mock-wrap">
                    <PhoneFrame spec={spec} screen={screen} styleConfig={baseStyle} onFrameClick={onFrameClick} />
                </div>
            </>
        );
    }

    const screens = buildScreenSequence(spec, count);

    return (
        <>
            <PhoneMockStyles />
            <div className="phone-mock-wrap">
                <div className="phone-mock-grid">
                    {screens.map((type, idx) => (
                        <PhoneFrame
                            key={`${type}-${idx}`}
                            spec={spec}
                            screen={type}
                            styleConfig={varyStyle(baseStyle, idx)}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function extractPhoneMockSvg(spec) {
    const raw =
        spec?.phoneMockSvg ||
        spec?.mobileSvg ||
        "";

    if (typeof raw !== "string") return "";

    let svg = raw.trim();
    if (!svg) return "";

    // Allow model outputs wrapped in markdown fences.
    svg = svg
        .replace(/^```svg\s*/i, "")
        .replace(/^```/, "")
        .replace(/```$/, "")
        .trim();

    const start = svg.indexOf("<svg");
    const end = svg.lastIndexOf("</svg>");
    if (start < 0 || end < 0) return "";

    svg = svg.slice(start, end + "</svg>".length);

    // Lightweight safety cleanup for preview-only rendering.
    svg = svg
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, "");

    return svg.trim().startsWith("<svg") ? svg : "";
}

function SvgPhoneMockPreview({ svgMarkup }) {
    const src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
    return (
        <div className="phone-svg-preview">
            <img src={src} alt="Mobile app SVG mockup preview" />
        </div>
    );
}

// Domain to accent color used inside screens
const DOMAIN_ACCENT = {
    fintech:    { accent: "#16a34a", accent2: "#22c55e", bg: "#f0fdf4", headerBg: "#052e16" },
    crypto:     { accent: "#0f766e", accent2: "#22d3ee", bg: "#ecfeff", headerBg: "#0f172a" },
    food:       { accent: "#f97316", accent2: "#fb7185", bg: "#fff7ed", headerBg: "#7c2d12" },
    gaming:     { accent: "#06b6d4", accent2: "#f97316", bg: "#ecfeff", headerBg: "#0f172a" },
    fitness:    { accent: "#16a34a", accent2: "#84cc16", bg: "#f7fff3", headerBg: "#14532d" },
    ecommerce:  { accent: "#7c3aed", accent2: "#a855f7", bg: "#faf5ff", headerBg: "#3b0764" },
    education:  { accent: "#2563eb", accent2: "#60a5fa", bg: "#eff6ff", headerBg: "#1e3a8a" },
    travel:     { accent: "#0891b2", accent2: "#38bdf8", bg: "#f0f9ff", headerBg: "#0c4a6e" },
    saas:       { accent: "#7c3aed", accent2: "#6366f1", bg: "#f5f3ff", headerBg: "#2e1065" },
    general:    { accent: "#4f46e5", accent2: "#818cf8", bg: "#f8fafc", headerBg: "#1e1b4b" },
};

function getDomainTheme(domain) {
    return DOMAIN_ACCENT[domain] || DOMAIN_ACCENT.general;
}

function PhoneFrame({ spec, screen, styleConfig, onFrameClick }) {
    const style = styleConfig || FALLBACK_STYLE;
    const rawType = String(screen || "").trim();
    // normalise for resolving  pass lowercase but keep rawType for label display
    const resolved = resolveScreenType(rawType);
    const radius = style.radius || 18;
    const domain = spec?.domain || spec?.plan?.domain || "general";
    const theme = getDomainTheme(domain);

    return (
        <div className="phone-card" onClick={(e) => onFrameClick?.({ element: e.currentTarget, screen: rawType })} style={onFrameClick ? { cursor: "pointer" } : undefined} title={onFrameClick ? "Click to download this screen" : undefined}>
            <div className="phone-label">{labelFor(rawType.toLowerCase(), resolved)}</div>
            <div className="iphone-outer">
                <div className="iphone-inner">
                    <div className="iphone-screen" style={{ background: theme.bg }}>
                        <div className="iphone-notch" />
                        <StatusBar theme={theme} />
                        <TopBar title={spec?.brand || spec?.plan?.brand || "App"} headerStyle={style.header} theme={theme} />
                        <div className={`screen-body density-${style.density}`}>
                            {renderScreen(rawType.toLowerCase(), resolved, radius, style, domain, theme, spec)}
                        </div>
                        <BottomNav navStyle={style.nav} theme={theme} />
                        <div className="home-indicator" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function normalizeStyle(input) {
    const s = { ...FALLBACK_STYLE, ...(input || {}) };
    return {
        ...s,
        header: s.header === "centered" ? "center" : s.header,
        hero: s.hero === "bannerAndList" ? "banner" : s.hero,
        density: ["airy", "normal", "compact"].includes(s.density) ? s.density : "normal",
        nav: ["pill", "boxed", "icons"].includes(s.nav) ? s.nav : "pill",
    };
}

function varyStyle(base, idx) {
    const headers = ["minimal", "center", "split"];
    const navs = ["pill", "boxed", "icons"];
    const densities = ["airy", "normal", "compact"];

    return {
        ...base,
        header: headers[idx % headers.length],
        nav: navs[(idx + 1) % navs.length],
        density: densities[(idx + 2) % densities.length],
        radius: [14, 16, 18, 20][idx % 4],
    };
}

function buildScreenSequence(spec, count) {
    const wanted = [4, 6, 12].includes(Number(count)) ? Number(count) : 6;

    // Support both spec.screens (direct) and spec.plan.screens (from AI)
    const aiScreens = spec?.plan?.screens || spec?.screens;
    const src = Array.isArray(aiScreens) && aiScreens.length ? aiScreens : ["onboarding", "home", "profile"];

    const base = src.map((s) => String(s || "").trim()).filter(Boolean);
    const resolvedBase = base.map(resolveScreenType);
    const usedRaw = new Set(base.map(s => s.toLowerCase()));
    const usedResolved = new Set(resolvedBase);
    const seed = hashString(`${spec?.brand || spec?.plan?.brand || ""}|${JSON.stringify(spec?.style || {})}|${src.join(",")}`);
    const extras = seededShuffle(
        seed,
        SCREEN_CATALOG.filter((s) => !usedRaw.has(s) && !usedResolved.has(resolveScreenType(s)))
    );
    const pool = [...base, ...extras];

    const result = [];
    const seenRaw = new Set();
    const seenRenderSig = new Set();

    for (const raw of pool) {
        const cleanRaw = String(raw || "").trim();
        if (!cleanRaw || seenRaw.has(cleanRaw.toLowerCase())) continue;

        const resolved = resolveScreenType(cleanRaw);
        const renderSig = `${resolved}:${cleanRaw.toLowerCase()}`;
        if (seenRenderSig.has(renderSig)) continue;

        seenRaw.add(cleanRaw.toLowerCase());
        seenRenderSig.add(renderSig);
        result.push(cleanRaw);
        if (result.length >= wanted) break;
    }

    if (result.length < wanted) {
        for (const raw of SCREEN_CATALOG) {
            if (seenRaw.has(raw)) continue;
            seenRaw.add(raw);
            result.push(raw);
            if (result.length >= wanted) break;
        }
    }

    return result;
}

function resolveScreenType(type) {
    // Normalise to lowercase so AI-returned capitalised names ("Wallet", "Dashboard") work
    const t = String(type || "").trim().toLowerCase();
    const alias = {
    // AI screen names (capitalised originals map here after toLowerCase)
    dashboard:     "activity",
    wallet:        "wallet",
    transactions:  "transactions",
    cards:         "cards",
    analytics:     "analytics",
    portfolio:     "portfolio",
    markets:       "markets",
    trade:         "trade",
    exchange:      "markets",
    buy:           "trade",
    sell:          "trade",
    payments:      "payments",
    payment:       "payments",
    categories:    "grid",
    product:       "detail",
    cart:          "cart",
    orders:        "orders",
    checkout:      "checkout",
    today:         "home",
    workout:       "workouts",
    workouts:      "workouts",
    progress:      "progress",
    nutrition:     "list",
    coaches:       "list",
    favorites:     "collection",
    // original aliases
    products:      "grid",
    productdetail: "detail",
    messages:      "list",
    restaurants:   "restaurants",
    menu:          "menu",
    classes:       "collection",
    booking:       "search",
    itinerary:     "feed",
    courses:       "courses",
    lesson:        "lesson",
    lobby:         "lobby",
    matches:       "matches",
    leaderboard:   "leaderboard",
    store:         "store",
    inventory:     "inventory",
    achievements:  "achievements",
    events:        "feed",
    eventdetail:   "detail",
    notifications: "feed",
    settings:      "settings",
    profile:       "profile",
    search:        "search",
    home:          "home",
    onboarding:    "onboarding",
    welcome:       "onboarding",
};
    return alias[t] || (SCREEN_CATALOG.includes(t) ? t : "home");
}

function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function seededShuffle(seed, arr) {
    const out = [...arr];
    let a = seed || 1;
    const rand = () => {
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = out.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
}

function labelFor(type, fallbackType) {
    const labels = {
    onboarding: "Welcome",
    home: "Home",
    search: "Search",
    grid: "Browse",
    detail: "Details",
    list: "List",
    collection: "Collection",
    activity: "Activity",
    feed: "Feed",
    profile: "Profile",
    settings: "Settings",
    tickets: "Tickets",
    orders: "Orders",
    checkout: "Checkout",
    payments: "Payments",
    portfolio: "Portfolio",
    markets: "Markets",
    trade: "Trade",
    products: "Products / Browse",
    productdetail: "Product Details",
    cart: "Cart",
    messages: "Messages",
    restaurants: "Restaurants",
    menu: "Menu",
    transactions: "Transactions",
    workouts: "Workouts",
    progress: "Progress",
    classes: "Classes",
    notifications: "Notifications",
    booking: "Booking",
    itinerary: "Itinerary",
    courses: "Courses",
    lesson: "Lesson",
    lobby: "Lobby",
    matches: "Matches",
    leaderboard: "Leaderboard",
    store: "Store",
    inventory: "Inventory",
    achievements: "Achievements",
    events: "Events",
    eventdetail: "Event Detail",
    wallet: "Wallet",
    analytics: "Analytics",
    cards: "Cards",
};
    return labels[type] || labels[fallbackType] || "Screen";
}

function StatusBar({ theme }) {
    return (
        <div className="statusbar" style={{ background: theme?.headerBg || "#13151d", color: "rgba(255,255,255,0.9)" }}>
            <span>9:41</span>
            <span className="statusbar-right">5G 100%</span>
        </div>
    );
}

function TopBar({ title, headerStyle, theme }) {
    const bg = theme?.headerBg || "#1f2430";
    const color = "rgba(255,255,255,0.95)";

    if (headerStyle === "center") {
        return (
            <div className="topbar" style={{ background: bg }}>
                <div className="topbar-btn" style={{ color }}>&lt;</div>
                <div className="topbar-title" style={{ color }}>{title}</div>
                <div className="topbar-btn" style={{ color }}>o</div>
            </div>
        );
    }

    if (headerStyle === "split") {
        return (
            <div className="topbar" style={{ background: bg }}>
                <div className="topbar-btn" style={{ color }}>&lt;</div>
                <div className="topbar-title" style={{ fontWeight: 800, color }}>{title}</div>
                <div className="topbar-btn" style={{ color }}>...</div>
            </div>
        );
    }

    return (
        <div className="topbar" style={{ background: bg }}>
            <div className="topbar-btn" style={{ color }}>o</div>
            <div className="topbar-title" style={{ color }}>{title}</div>
            <div className="topbar-btn" style={{ color }}>+</div>
        </div>
    );
}

function BottomNav({ navStyle, theme }) {
    const items = ["H", "S", "+", "N", "P"];
    const activeBg = theme?.accent ? `${theme.accent}22` : "rgba(174,182,198,0.42)";
    const activeColor = theme?.accent || "#1f2430";
    return (
        <div className={`bottomnav nav-${navStyle}`}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className={`navicon ${idx === 0 ? "active" : ""}`}
                    style={idx === 0 ? { background: activeBg, color: activeColor } : {}}
                >
                    {item}
                </div>
            ))}
        </div>
    );
}

function renderScreen(rawType, type, r, style, domain, theme, spec) {
    const schemaScreen = spec?.layoutSchema?.screenMap?.[rawType] || spec?.layoutSchema?.screenMap?.[String(rawType || "").toLowerCase()];
    const bypassSchema = ["wallet", "cards", "analytics"].includes(rawType);
    if (schemaScreen && !bypassSchema) {
        return <SchemaScreen screenDef={schemaScreen} r={r} theme={theme} domain={domain} />;
    }
    // rawType is already lowercased before being passed here
    switch (rawType) {
        case "products":
        case "categories":
            return <GridScreen r={r} variant="products" domain={domain} theme={theme} />;
        case "productdetail":
        case "product":
            return <DetailScreen r={r} variant="product" domain={domain} theme={theme} />;
        case "cart":
            return <ListScreen r={r} variant="cart" domain={domain} theme={theme} />;
        case "workouts":
        case "workout":
            return <CollectionScreen r={r} variant="workouts" domain={domain} theme={theme} />;
        case "progress":
            return <ProgressScreen r={r} theme={theme} />;
        case "classes":
            return <CollectionScreen r={r} variant="classes" domain={domain} theme={theme} />;
        case "wallet":
            return <WalletScreen r={r} theme={theme} domain={domain} />;
        case "transactions":
            return <TransactionsScreen r={r} theme={theme} />;
        case "analytics":
        case "dashboard":
            return <AnalyticsScreen r={r} domain={domain} theme={theme} />;
        case "portfolio":
            return <PortfolioScreen r={r} theme={theme} />;
        case "cards":
            return <CardsScreen r={r} theme={theme} />;
        case "markets":
            return <MarketsScreen r={r} theme={theme} />;
        case "trade":
            return <TradeScreen r={r} theme={theme} />;
        case "payments":
            return <CheckoutScreen r={r} domain={domain} />;
        case "restaurants":
            return <RestaurantsScreen r={r} theme={theme} />;
        case "menu":
            return <MenuScreen r={r} theme={theme} />;
        case "booking":
            return <SearchScreen r={r} variant="booking" domain={domain} theme={theme} />;
        case "itinerary":
            return <FeedScreen r={r} variant="itinerary" theme={theme} />;
        case "courses":
            return <CoursesScreen r={r} theme={theme} />;
        case "lesson":
            return <LessonScreen r={r} theme={theme} />;
        case "lobby":
            return <LobbyScreen r={r} theme={theme} />;
        case "matches":
            return <MatchesScreen r={r} theme={theme} />;
        case "leaderboard":
            return <LeaderboardScreen r={r} theme={theme} />;
        case "store":
            return <StoreScreen r={r} theme={theme} />;
        case "inventory":
            return <InventoryScreen r={r} theme={theme} />;
        case "achievements":
            return <AchievementsScreen r={r} theme={theme} />;
        case "messages":
            return <ListScreen r={r} variant="messages" domain={domain} theme={theme} />;
        case "notifications":
            return <FeedScreen r={r} variant="notifications" theme={theme} />;
        case "nutrition":
        case "coaches":
            return <ListScreen r={r} variant="generic" domain={domain} theme={theme} />;
        case "today":
        case "home":
            return <HomeScreen r={r} style={style} domain={domain} theme={theme} />;
        case "onboarding":
        case "welcome":
            return <Onboarding r={r} domain={domain} theme={theme} />;
        default:
            break;
    }

    switch (type) {
        case "onboarding":
            return <Onboarding r={r} domain={domain} theme={theme} />;
        case "home":
            return <HomeScreen r={r} style={style} domain={domain} theme={theme} />;
        case "search":
            return <SearchScreen r={r} domain={domain} theme={theme} />;
        case "grid":
            return <GridScreen r={r} domain={domain} theme={theme} />;
        case "detail":
            return <DetailScreen r={r} domain={domain} theme={theme} />;
        case "list":
            return <ListScreen r={r} domain={domain} theme={theme} />;
        case "collection":
            return <CollectionScreen r={r} domain={domain} theme={theme} />;
        case "activity":
            return <ActivityScreen r={r} domain={domain} theme={theme} />;
        case "feed":
            return <FeedScreen r={r} theme={theme} />;
        case "profile":
            return <ProfileScreen r={r} domain={domain} theme={theme} />;
        case "settings":
            return <SettingsScreen r={r} domain={domain} theme={theme} />;
        case "tickets":
            return <TicketsScreen r={r} domain={domain} theme={theme} />;
        case "orders":
            return <OrdersScreen r={r} theme={theme} />;
        case "checkout":
            return <CheckoutScreen r={r} domain={domain} theme={theme} />;
        default:
            return <HomeScreen r={r} style={style} domain={domain} theme={theme} />;
    }
}

function SchemaScreen({ screenDef, r, theme, domain }) {
    const sections = Array.isArray(screenDef?.sections) ? screenDef.sections : [];
    return (
        <div>
            {sections.map((sec, idx) => (
                <div key={sec.id || `${sec.type}-${idx}`} style={{ marginBottom: 8 }}>
                    <SchemaSection type={sec.type} r={r} tone={sec.tone} density={sec.density} theme={theme} />
                </div>
            ))}
        </div>
    );
}

function SchemaSection({ type, r, tone, density, theme, domain }) {
    const accent = theme?.accent || "#6366f1";
    const softBg = tone === "bold" ? `${accent}30` : tone === "clean" ? "#e5e7eb" : `${accent}18`;
    const line = (w) => <div style={{ height: 6, width: w, borderRadius: 999, background: "#cfd4df", marginBottom: 5 }} />;
    const isCrypto = domain === "crypto";
    const isEducation = domain === "education";
    const isFood = domain === "food";
    const isGaming = domain === "gaming";

    if (type === "media" && isCrypto) {
        return (
            <div style={{ borderRadius: r + 2, background: "#f1f5f9", border: `1px solid ${accent}33`, padding: "10px 8px" }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: density === "compact" ? 60 : 78 }}>
                    {[20, 46, 32, 68, 50, 40, 62].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 3 ? accent : `${accent}55` }} />
                    ))}
                </div>
                <div style={{ height: 2, background: `${accent}66`, borderRadius: 999, marginTop: 6 }} />
            </div>
        );
    }

    if (type === "cards" && isEducation) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: density === "compact" ? 60 : 74, borderRadius: r, background: "#eef2f7", border: `1px solid ${accent}22`, padding: 8 }}>
                        <div style={{ height: 20, borderRadius: r - 2, background: `${accent}20`, marginBottom: 6 }} />
                        <div style={{ height: 6, width: "70%", background: "#d1d5db", borderRadius: 3 }} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "list" && isFood) {
        return (
            <div>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "center" }}>
                        <div style={{ width: 28, height: 28, borderRadius: r, background: `${accent}22` }} />
                        <div style={{ flex: 1 }}>{line("70%")} {line("45%")}</div>
                        <div style={{ height: 16, width: 32, borderRadius: 999, background: `${accent}33` }} />
                    </div>
                ))}
            </div>
        );
    }

    if (type === "stats" && isGaming) {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: 40, borderRadius: r, background: `${accent}18`, border: `1px solid ${accent}28` }} />
                ))}
            </div>
        );
    }

    if (type === "search") {
        return (
            <div>
                <div style={{ height: 34, borderRadius: r, background: "#eef2f7", border: "1px solid #d9dfeb", marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 6 }}>{[42, 34, 30].map((w, i) => <div key={i} style={{ height: 16, width: `${w}%`, borderRadius: 999, background: `${accent}22` }} />)}</div>
            </div>
        );
    }

    if (type === "hero" || type === "media") {
        return <div style={{ height: density === "compact" ? 86 : 118, borderRadius: r + 2, background: softBg, border: `1px solid ${accent}33` }} />;
    }

    if (type === "chips") {
        return <div style={{ display: "flex", gap: 6 }}>{[22, 28, 24, 20].map((w, i) => <div key={i} style={{ height: 16, width: `${w}%`, borderRadius: 999, background: `${accent}28` }} />)}</div>;
    }

    if (type === "stats") {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: 42, borderRadius: r, background: softBg, border: "1px solid #d9dfeb" }} />)}
            </div>
        );
    }

    if (type === "cards" || type === "featureRow") {
        return (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {[1, 2, 3, 4].map((i) => <div key={i} style={{ height: density === "compact" ? 56 : 72, borderRadius: r, background: "#eef2f7", border: "1px solid #d9dfeb" }} />)}
            </div>
        );
    }

    if (type === "timeline") {
        return (
            <div>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "center" }}>
                        <div style={{ width: 12, height: 12, borderRadius: 999, background: `${accent}66` }} />
                        <div style={{ flex: 1 }}>{line("70%")} {line("45%")}</div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "form") {
        return (
            <div>
                {[1, 2, 3].map((i) => <div key={i} style={{ height: 34, borderRadius: r, background: "#eef2f7", border: "1px solid #d9dfeb", marginBottom: 7 }} />)}
            </div>
        );
    }

    if (type === "tabs") {
        return (
            <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>{[1, 2, 3].map((i) => <div key={i} style={{ height: 20, width: 56, borderRadius: 999, background: i === 1 ? `${accent}44` : "#e5e7eb" }} />)}</div>
                <div style={{ height: 58, borderRadius: r, background: "#eef2f7", border: "1px solid #d9dfeb" }} />
            </div>
        );
    }

    if (type === "cta") {
        return <div style={{ height: 36, borderRadius: r, background: `linear-gradient(90deg, ${accent}, ${theme?.accent2 || accent})` }} />;
    }

    // list default
    return (
        <div>
            {[1, 2, 3].map((i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 7, alignItems: "center" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 8, background: "#d8deea" }} />
                    <div style={{ flex: 1 }}>{line("72%")} {line("48%")}</div>
                </div>
            ))}
        </div>
    );
}
//  NEW: Visually distinct domain-specific screens 

function WalletScreen({ r, theme, domain }) {
    const accent = theme?.accent || "#16a34a";
    const accent2 = theme?.accent2 || "#22c55e";
    return (
        <div>
            {/* Balance card */}
            <div style={{
                borderRadius: r + 4,
                background: `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`,
                padding: "14px 16px",
                marginBottom: 10,
            }}>
                <div style={{ height: 8, width: "40%", background: "rgba(255,255,255,0.5)", borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 18, width: "60%", background: "rgba(255,255,255,0.9)", borderRadius: 4, marginBottom: 8 }} />
                <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ height: 7, width: "30%", background: "rgba(255,255,255,0.5)", borderRadius: 3 }} />
                    <div style={{ height: 7, width: "25%", background: "rgba(255,255,255,0.4)", borderRadius: 3 }} />
                </div>
            </div>
            {/* Quick actions row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[1,2,3,4].map(i => (
                    <div key={i} style={{ flex: 1, height: 44, borderRadius: r, background: `${accent}18`, border: `1px solid ${accent}30` }} />
                ))}
                        </div>
            {domain === "crypto" && (
                <>
                    <div style={{ height: 8, width: "44%", background: "#d1d5db", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ borderRadius: r, background: "#f1f5f9", padding: "10px 8px", marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 46 }}>
                            {[30, 60, 40, 70, 45].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 3 ? theme.accent : `${theme.accent}55` }} />
                            ))}
                        </div>
                    </div>
                </>
            )}
            {/* Recent transactions */}
            <div style={{ height: 8, width: "38%", background: "#d1d5db", borderRadius: 4, marginBottom: 8 }} />
            {[1,2,3].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${accent}22`, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "55%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "35%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 8, width: 32, background: i % 2 === 0 ? `${accent}66` : "#d1d5db", borderRadius: 3 }} />
                </div>
            ))}
        </div>
    );
}

function TransactionsScreen({ r, theme }) {
    const accent = theme?.accent || "#16a34a";
    return (
        <div>
            {/* Filter pills */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{
                        height: 24, flex: i === 1 ? 1.2 : 1, borderRadius: 999,
                        background: i === 1 ? accent : "#e5e7eb",
                    }} />
                ))}
            </div>
            {/* Transaction rows */}
            {[1,2,3,4,5,6].map(i => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9, paddingBottom: 9, borderBottom: "1px solid #f0f0f0" }}>
                    <div style={{
                        width: 30, height: 30, borderRadius: r,
                        background: i % 3 === 0 ? `${accent}22` : i % 3 === 1 ? "#e0e7ff" : "#fef3c7",
                        flexShrink: 0,
                    }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "60%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "38%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{
                        height: 9, width: 36, borderRadius: 3,
                        background: i % 2 === 0 ? `${accent}55` : "#fca5a5",
                    }} />
                </div>
            ))}
        </div>
    );
}

function AnalyticsScreen({ r, theme, domain }) {
    const accent = theme?.accent || "#4f46e5";
    const accent2 = theme?.accent2 || "#818cf8";
    // Draw a fake bar chart
    const bars = [55, 80, 45, 90, 65, 75, 50];
    return (
        <div>
            <div style={{ height: 8, width: "42%", background: "#d1d5db", borderRadius: 4, marginBottom: 10 }} />
            {/* KPI row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[1,2].map(i => (
                    <div key={i} style={{
                        flex: 1, borderRadius: r, padding: "10px 10px",
                        background: i === 1 ? `${accent}18` : `${accent2}18`,
                        border: `1px solid ${i === 1 ? accent : accent2}30`,
                    }}>
                        <div style={{ height: 7, width: "50%", background: i === 1 ? `${accent}66` : `${accent2}66`, borderRadius: 3, marginBottom: 5 }} />
                        <div style={{ height: 12, width: "70%", background: i === 1 ? accent : accent2, borderRadius: 3, opacity: 0.8 }} />
                    </div>
                ))}
            </div>
              {domain === "crypto" && (
                  <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {[1,2,3].map(i => (
                          <div key={i} style={{
                              flex: 1,
                              height: 22,
                              borderRadius: 999,
                              background: i === 2 ? `${accent}22` : "#e5e7eb",
                              border: `1px solid ${i === 2 ? accent : "#d1d5db"}`,
                          }} />
                      ))}
                  </div>
              )}
              {/* Bar chart */}
            <div style={{
                borderRadius: r, background: "#f1f5f9", padding: "12px 10px 6px",
                marginBottom: 10,
            }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 70 }}>
                    {bars.map((h, i) => (
                        <div key={i} style={{
                            flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0",
                            background: i === 3 ? accent : `${accent}44`,
                        }} />
                    ))}
                </div>
                <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
                    {bars.map((_, i) => (
                        <div key={i} style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 2 }} />
                    ))}
                </div>
            </div>
            {/* Summary row */}
            <div style={{ display: "flex", gap: 8 }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{ flex: 1, height: 38, borderRadius: r, background: "#f1f5f9" }} />
                ))}
            </div>
        </div>
    );
}

function PortfolioScreen({ r, theme }) {
    const accent = theme?.accent || "#0f766e";
    const accent2 = theme?.accent2 || "#22d3ee";
    const bars = [28, 48, 36, 72, 58, 42, 64];
    return (
        <div>
            <Line w="46%" />
            <Spacer s={6} />
            <div style={{ borderRadius: r, background: "#f1f5f9", padding: "10px 8px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 70 }}>
                    {bars.map((h, i) => (
                        <div key={i} style={{
                            flex: 1,
                            height: `${h}%`,
                            borderRadius: "3px 3px 0 0",
                            background: i === 3 ? accent : `${accent}55`,
                        }} />
                    ))}
                </div>
                <div style={{ height: 2, background: `${accent2}66`, borderRadius: 999, marginTop: 6 }} />
            </div>
            <Row className="space-between">
                <Pill w={46} />
                <Pill w={34} />
            </Row>
            <Spacer s={8} />
            <div className="wf-list">
                {[1, 2, 3].map((i) => (
                    <WireRow key={i} r={r} variant="transactions" />
                ))}
            </div>
        </div>
    );
}

function MarketsScreen({ r, theme }) {
    const accent = theme?.accent || "#0f766e";
    const rows = [1, 2, 3, 4, 5];
    return (
        <div>
            <Line w="38%" />
            <Spacer s={6} />
            {rows.map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: `${accent}22` }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "50%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "32%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{ width: 46, height: 18, borderRadius: 999, background: i % 2 ? `${accent}33` : "#e5e7eb" }} />
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 20, width: 28 }}>
                        {[6, 12, 8, 14, 9].map((h, idx) => (
                            <div key={idx} style={{ width: 3, height: h, borderRadius: 2, background: `${accent}66` }} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function TradeScreen({ r, theme }) {
    const accent = theme?.accent || "#0f766e";
    const accent2 = theme?.accent2 || "#22d3ee";
    return (
        <div>
            <Line w="36%" />
            <Spacer s={6} />
            <div style={{ borderRadius: r, background: "#f1f5f9", padding: "10px 8px", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 60 }}>
                    {[18, 34, 28, 46, 40, 52, 36].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 5 ? accent : `${accent}44` }} />
                    ))}
                </div>
            </div>
            <Row className="space-between">
                <Pill w={40} />
                <Pill w={40} />
                <Pill w={40} />
            </Row>
            <Spacer s={8} />
            <Row className="space-between">
                <Box r={r} h={32} className="wf-grow" />
                <div style={{ width: 8 }} />
                <Box r={r} h={32} className="wf-grow" />
            </Row>
            <Spacer s={8} />
            <Row className="space-between">
                <Box r={r} h={34} className="wf-grow" />
                <div style={{ width: 8 }} />
                <Box r={r} h={34} className="wf-grow" />
            </Row>
            <Spacer s={8} />
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1, height: 32, borderRadius: r, background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
                <div style={{ flex: 1, height: 32, borderRadius: r, background: "#e5e7eb" }} />
            </div>
        </div>
    );

function CoursesScreen({ r, theme }) {
    const accent = theme?.accent || "#2563eb";
    return (
        <div>
            <Line w="52%" />
            <Spacer s={6} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ borderRadius: r, background: "#f1f5f9", padding: "8px", border: `1px solid ${accent}22` }}>
                        <div style={{ height: 36, borderRadius: r - 2, background: `${accent}20`, marginBottom: 6 }} />
                        <div style={{ height: 6, width: "70%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "45%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                ))}
            </div>
            <Row className="space-between">
                <Pill w={46} />
                <Pill w={34} />
            </Row>
        </div>
    );
}

function LessonScreen({ r, theme }) {
    const accent = theme?.accent || "#2563eb";
    return (
        <div>
            <div style={{ height: 86, borderRadius: r, background: `${accent}22`, border: `1px solid ${accent}33`, marginBottom: 8 }} />
            <Row className="space-between">
                <Pill w={40} />
                <Pill w={28} />
            </Row>
            <Spacer s={8} />
            <div className="wf-list">
                {[1, 2, 3].map((i) => (
                    <WireRow key={i} r={r} variant="messages" />
                ))}
            </div>
        </div>
    );
}

function ProgressScreen({ r, theme }) {
    const accent = theme?.accent || "#2563eb";
    return (
        <div>
            <Line w="44%" />
            <Spacer s={6} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[1, 2].map((i) => (
                    <div key={i} style={{ borderRadius: r, padding: "10px", background: `${accent}14`, border: `1px solid ${accent}26` }}>
                        <div style={{ height: 7, width: "55%", background: `${accent}66`, borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 12, width: "70%", background: `${accent}88`, borderRadius: 3, opacity: 0.7 }} />
                    </div>
                ))}
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                    <div style={{ height: 6, width: "45%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                    <div style={{ height: 8, borderRadius: 999, background: "#e5e7eb" }}>
                        <div style={{ height: 8, width: `${35 + i * 15}%`, borderRadius: 999, background: `${accent}88` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

function RestaurantsScreen({ r, theme }) {
    const accent = theme?.accent || "#f97316";
    return (
        <div>
            <Line w="40%" />
            <Spacer s={6} />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: r, background: `${accent}22` }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "55%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "40%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 18, width: 42, borderRadius: 999, background: `${accent}33` }} />
                </div>
            ))}
        </div>
    );
}

function MenuScreen({ r, theme }) {
    const accent = theme?.accent || "#f97316";
    return (
        <div>
            <Row className="space-between">
                <Pill w={36} />
                <Pill w={28} />
                <Pill w={30} />
            </Row>
            <Spacer s={8} />
            <div className="wf-list">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: r, background: `${accent}22` }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ height: 7, width: "60%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                            <div style={{ height: 6, width: "35%", background: "#e5e7eb", borderRadius: 3 }} />
                        </div>
                        <div style={{ height: 18, width: 36, borderRadius: 999, background: `${accent}44` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function LobbyScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    const accent2 = theme?.accent2 || "#f97316";
    return (
        <div>
            <div style={{ height: 88, borderRadius: r, background: `linear-gradient(135deg, ${accent}, ${accent2})`, marginBottom: 10 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: 64, borderRadius: r, background: "#f1f5f9", border: `1px solid ${accent}22` }} />
                ))}
            </div>
        </div>
    );
}

function MatchesScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    return (
        <div>
            <Line w="42%" />
            <Spacer s={6} />
            {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 999, background: `${accent}33` }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "55%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "35%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 18, width: 36, borderRadius: 999, background: `${accent}22` }} />
                </div>
            ))}
        </div>
    );
}

function LeaderboardScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    return (
        <div>
            <Line w="46%" />
            <Spacer s={6} />
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: i === 1 ? accent : "#e5e7eb" }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 7, width: "50%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "30%", background: "#e5e7eb", borderRadius: 3 }} />
                    </div>
                    <div style={{ height: 8, width: 32, borderRadius: 3, background: `${accent}55` }} />
                </div>
            ))}
        </div>
    );
}

function StoreScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    return (
        <div>
            <Row className="space-between">
                <Pill w={40} />
                <Pill w={28} />
            </Row>
            <Spacer s={8} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ borderRadius: r, background: "#f1f5f9", padding: "8px" }}>
                        <div style={{ height: 36, borderRadius: r - 2, background: `${accent}22`, marginBottom: 6 }} />
                        <div style={{ height: 6, width: "60%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                        <div style={{ height: 6, width: "40%", background: "#e5e7eb", borderRadius: 3 }} />
                        <div style={{ height: 16, width: 32, borderRadius: 999, background: `${accent}44`, marginTop: 6 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function InventoryScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    return (
        <div>
            <Line w="38%" />
            <Spacer s={6} />
            <div className="wf-list">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: r, background: `${accent}22` }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ height: 7, width: "55%", background: "#d1d5db", borderRadius: 3, marginBottom: 4 }} />
                            <div style={{ height: 6, width: "35%", background: "#e5e7eb", borderRadius: 3 }} />
                        </div>
                        <div style={{ height: 18, width: 28, borderRadius: 999, background: `${accent}33` }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function AchievementsScreen({ r, theme }) {
    const accent = theme?.accent || "#06b6d4";
    return (
        <div>
            <Line w="44%" />
            <Spacer s={6} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ height: 64, borderRadius: r, background: `${accent}14`, border: `1px solid ${accent}26` }} />
                ))}
            </div>
        </div>
    );
}}
function CardsScreen({ r, theme }) {
    const accent = theme?.accent || "#16a34a";
    const accent2 = theme?.accent2 || "#22c55e";
    const cardColors = [
        `linear-gradient(135deg, ${accent} 0%, ${accent2} 100%)`,
        "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
        "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    ];
    return (
        <div>
            {/* Stack of cards */}
            {cardColors.map((bg, i) => (
                <div key={i} style={{
                    borderRadius: r + 4,
                    background: bg,
                    padding: "12px 14px",
                    marginBottom: i < 2 ? -40 : 10,
                    opacity: 1 - i * 0.12,
                    transform: `scale(${1 - i * 0.04})`,
                    transformOrigin: "top center",
                    height: 90,
                    position: "relative",
                    zIndex: 3 - i,
                }}>
                    <div style={{ height: 7, width: "30%", background: "rgba(255,255,255,0.5)", borderRadius: 3, marginBottom: 6 }} />
                    <div style={{ height: 10, width: "55%", background: "rgba(255,255,255,0.8)", borderRadius: 3 }} />
                </div>
            ))}
            <Spacer s={52} />
            {/* Action buttons */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[1,2,3].map(i => (
                    <div key={i} style={{
                        flex: 1, height: 38, borderRadius: r,
                        background: i === 1 ? accent : "#e5e7eb",
                    }} />
                ))}
            </div>
            <Box r={r} h={36} />
        </div>
    );
}

function Onboarding({ r, domain, theme }) {
    const accent = theme?.accent || "#4f46e5";
    const heroH = domainFlag(domain, "fitness") ? 146 : domainFlag(domain, "ecommerce") ? 122 : 132;
    return (
        <div>
            <div style={{
                borderRadius: r + 6,
                height: heroH,
                background: `linear-gradient(160deg, ${accent}33 0%, ${accent}11 100%)`,
                border: `1px solid ${accent}22`,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `${accent}44` }} />
            </div>
            <Line w="62%" />
            <Line w="86%" />
            <Line w="78%" />
            <Spacer s={14} />
            <div style={{ height: 38, borderRadius: r, background: accent, opacity: 0.9 }} />
            <Spacer s={10} />
            <Row>
                <Pill w={28} />
                <Pill w={28} />
                <Pill w={28} />
            </Row>
        </div>
    );
}
function Box({ r = 12, h = 40, className = "" }) {
    return <div className={`wf-box ${className}`.trim()} style={{ borderRadius: r, height: h }} />;
}

function Line({ w = "70%" }) {
    return <div className="wf-line" style={{ width: w }} />;
}

function Pill({ w = 60 }) {
    return <div className="wf-pill" style={{ width: w }} />;
}

function Spacer({ s = 10 }) {
    return <div style={{ height: s }} />;
}

function TwoCol({ children }) {
    return <div className="wf-grid2">{children}</div>;
}

function Row({ children, className = "" }) {
    return <div className={`wf-row ${className}`.trim()}>{children}</div>;
}

function domainFlag(domain, name) {
    if (name === "fintech") return domain === "fintech" || domain === "crypto";
    return domain === name;
}

function screenTitleWidth(variant, domain) {
    if (variant === "products" || domainFlag(domain, "ecommerce")) return "56%";
    if (variant === "workouts" || domainFlag(domain, "fitness")) return "52%";
    if (variant === "wallet" || domainFlag(domain, "fintech")) return "40%";
    return "48%";
}

function HomeScreen({ r, style, domain, theme }) {
    return (
        <div>
            {style.hero === "twoCards" && (
                <>
                    <TwoCol>
                        <Box r={r} h={84} />
                        <Box r={r} h={84} />
                    </TwoCol>
                    <Spacer s={10} />
                </>
            )}

            {style.hero === "gridHero" && (
                <>
                    <TwoCol>
                        <Box r={r} h={58} />
                        <Box r={r} h={58} />
                        <Box r={r} h={58} />
                        <Box r={r} h={58} />
                    </TwoCol>
                    <Spacer s={10} />
                </>
            )}

            {(style.hero === "bigCard" || style.hero === "banner") && (
                <>
                    <Box r={r + 4} h={style.hero === "banner" ? 86 : 122} className="wf-hero" />
                    <Spacer s={10} />
                </>
            )}

                        {domain === "crypto" && (
                <>
                    <div style={{ borderRadius: r, background: "#f1f5f9", padding: "8px 8px", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 40 }}>
                            {[20, 32, 26, 38, 30, 42].map((h, i) => (
                                <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i === 3 ? theme.accent : `${theme.accent}55` }} />
                            ))}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ flex: 1, height: 16, borderRadius: 999, background: i === 1 ? `${theme.accent}33` : "#e5e7eb" }} />
                        ))}
                    </div>
                </>
            )}<Line w={screenTitleWidth("home", domain)} />
            <Spacer s={8} />

            {(style.list === "rows" || domainFlag(domain, "social") || domainFlag(domain, "food")) ? (
                <div className="wf-list">
                    {Array.from({ length: domainFlag(domain, "social") ? 3 : 4 }).map((_, i) => (
                        <WireRow key={i} r={r} compact variant={domainFlag(domain, "social") ? "messages" : domainFlag(domain, "food") ? "restaurants" : "generic"} />
                    ))}
                </div>
            ) : (
                <>
                    <Box r={r} h={domainFlag(domain, "fitness") ? 62 : 54} />
                    <Spacer s={8} />
                    <Box r={r} h={domainFlag(domain, "fintech") ? 62 : 54} />
                    <Spacer s={8} />
                    <Box r={r} h={54} />
                </>
            )}
        </div>
    );
}

function SearchScreen({ r, variant, domain }) {
    const isBooking = variant === "booking" || domainFlag(domain, "travel") || domainFlag(domain, "health");
    return (
        <div>
            <Box r={r} h={34} />
            <Spacer s={10} />
            <Line w={isBooking ? "34%" : "44%"} />
            <Spacer s={8} />
            {isBooking ? (
                <div>
                    <Box r={r} h={54} />
                    <Spacer s={8} />
                    <Box r={r} h={54} />
                    <Spacer s={8} />
                    <Box r={r} h={86} />
                </div>
            ) : (
                <TwoCol>
                    <Box r={r} h={70} />
                    <Box r={r} h={70} />
                    <Box r={r} h={70} />
                    <Box r={r} h={70} />
                </TwoCol>
            )}
            <Spacer s={8} />
            <Line w="38%" />
        </div>
    );
}

function GridScreen({ r, variant, domain }) {
    const cardH = variant === "markets" ? 64 : (variant === "products" || domainFlag(domain, "ecommerce") ? 92 : (variant === "courses" || domainFlag(domain, "education") ? 74 : (variant === "menu" || domainFlag(domain, "food") ? 66 : 82)));
    const items = variant === "menu" ? 8 : 6;
    return (
        <div>
            <Line w={variant === "products" ? "54%" : variant === "courses" ? "46%" : "42%"} />
            <Spacer s={8} />
            <TwoCol>
                {Array.from({ length: items }).map((_, i) => (
                    <Box key={i} r={r} h={cardH} />
                ))}
            </TwoCol>
        </div>
    );
}

function DetailScreen({ r, variant, domain }) {
    const heroH = variant === "trade" ? 118 : (variant === "product" || domainFlag(domain, "ecommerce") ? 144 : (variant === "lesson" || domainFlag(domain, "education") ? 108 : 128));
    return (
        <div>
            <Box r={r + 4} h={heroH} className="wf-hero" />
            <Spacer s={10} />
            <Line w={variant === "product" ? "68%" : "60%"} />
            <Line w={variant === "lesson" ? "58%" : "45%"} />
            <Spacer s={10} />
            <Row>
                    <Pill w={52} />
                    <Pill w={52} />
                    <Pill w={52} />
                </Row>
                <Spacer s={10} />
                {variant === "trade" && (
                    <>
                        <Row className="space-between">
                            <Box r={r} h={32} className="wf-grow" />
                            <div style={{ width: 8 }} />
                            <Box r={r} h={32} className="wf-grow" />
                        </Row>
                        <Spacer s={8} />
                        <Row>
                            <Box r={r} h={34} className="wf-grow" />
                            <div style={{ width: 8 }} />
                            <Box r={r} h={34} className="wf-grow" />
                        </Row>
                        <Spacer s={8} />
                    </>
                )}
            <Box r={r} h={variant === "product" ? 42 : 38} />
        </div>
    );
}

function ListScreen({ r, variant, domain }) {
    const count =
        variant === "cart" ? 4 :
            variant === "messages" ? 5 :
                variant === "transactions" ? 6 :
                    variant === "restaurants" ? 4 :
                        6;
    return (
        <div className="wf-list">
            {Array.from({ length: count }).map((_, i) => (
                <WireRow key={i} r={r} variant={variant || domain} />
            ))}
            {variant === "cart" && (
                <>
                    <Spacer s={6} />
                    <Box r={r} h={38} />
                </>
            )}
        </div>
    );
}

function CollectionScreen({ r, variant }) {
    const topH =
        variant === "wallet" ? 110 :
            variant === "workouts" ? 88 :
                variant === "classes" ? 74 :
                    variant === "cards" ? 116 :
                        96;
    return (
        <div>
            <Box r={r} h={topH} />
            <Spacer s={10} />
            <TwoCol>
                <Box r={r} h={variant === "workouts" ? 70 : 58} />
                <Box r={r} h={variant === "workouts" ? 70 : 58} />
            </TwoCol>
            <Spacer s={10} />
            <Box r={r} h={variant === "classes" ? 58 : 78} />
        </div>
    );
}

function ActivityScreen({ r, variant, domain }) {
    const chartH =
        variant === "analytics" || domainFlag(domain, "fintech") ? 126 :
            variant === "progress" || domainFlag(domain, "fitness") ? 104 :
                112;
    return (
        <div>
            <Line w={variant === "progress" ? "42%" : "34%"} />
            <Spacer s={8} />
            <Box r={r} h={chartH} />
            <Spacer s={10} />
            <Row className="space-between">
                <Box r={r} h={52} className="wf-grow" />
                <div style={{ width: 8 }} />
                <Box r={r} h={52} className="wf-grow" />
            </Row>
            <Spacer s={10} />
            <Box r={r} h={56} />
        </div>
    );
}

function FeedScreen({ r, variant }) {
    const blocks = variant === "notifications" ? 4 : variant === "itinerary" ? 2 : 3;
    const h = variant === "itinerary" ? 120 : 92;
    return (
        <div>
            {Array.from({ length: blocks }).map((_, i) => (
                <React.Fragment key={i}>
                    <Box r={r} h={h} />
                    {i < blocks - 1 && <Spacer s={10} />}
                </React.Fragment>
            ))}
        </div>
    );
}

function ProfileScreen({ r, domain }) {
    return (
        <div>
            <div className="wf-profile-head" style={{ borderRadius: r }}>
                <div className="wf-avatar" />
                <div className="wf-grow">
                    <Line w="64%" />
                    <Line w="40%" />
                    <Spacer s={8} />
                    <Row>
                        <Pill w={48} />
                        <Pill w={48} />
                    </Row>
                </div>
            </div>
            <Spacer s={10} />
            <div className="wf-list">
                {Array.from({ length: domainFlag(domain, "social") ? 3 : 4 }).map((_, i) => (
                    <WireRow key={i} r={r} compact variant="profile" />
                ))}
            </div>
        </div>
    );
}

function SettingsScreen({ r, domain }) {
    return (
        <div>
            <Line w={domainFlag(domain, "fintech") ? "54%" : "46%"} />
            <Spacer s={8} />
            <div className="wf-settings" style={{ borderRadius: r }}>
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="wf-setting-row">
                        <div className="wf-grow">
                            <Line w="62%" />
                            <Line w="38%" />
                        </div>
                        <div className={`wf-toggle ${i % 2 === 0 ? "on" : ""}`}>
                            <div className="wf-toggle-dot" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TicketsScreen({ r, domain }) {
    return (
        <div>
            <Line w={domainFlag(domain, "travel") ? "52%" : "38%"} />
            <Spacer s={8} />
            <Box r={r} h={86} />
            <Spacer s={8} />
            <Box r={r} h={86} />
            <Spacer s={8} />
            <Box r={r} h={86} />
        </div>
    );
}

function OrdersScreen({ r }) {
    return (
        <div>
            <Row className="space-between">
                <Line w="34%" />
                <Pill w={46} />
            </Row>
            <Spacer s={8} />
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}><div style={{ width: 36, height: 16, borderRadius: 999, background: "#e5e7eb" }} /><div style={{ width: 42, height: 16, borderRadius: 999, background: "#e5e7eb" }} /><div style={{ width: 30, height: 16, borderRadius: 999, background: "#e5e7eb" }} /></div>
            <div className="wf-list">
                {Array.from({ length: 5 }).map((_, i) => (
                    <WireRow key={i} r={r} />
                ))}
            </div>
            <Spacer s={8} />
            <Box r={r} h={42} />
        </div>
    );
}

function CheckoutScreen({ r, domain }) {
    return (
        <div>
            <Line w={domainFlag(domain, "ecommerce") || domainFlag(domain, "food") ? "56%" : "42%"} />
            <Spacer s={8} />
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}><div style={{ flex: 1, height: 34, borderRadius: 999, background: "#e5e7eb" }} /><div style={{ flex: 1, height: 34, borderRadius: 999, background: "#e5e7eb" }} /></div>
            <Box r={r} h={72} />
            <Spacer s={8} />
            <Box r={r} h={62} />
            <Spacer s={8} />
            <Box r={r} h={62} />
            <Spacer s={10} />
            <Box r={r} h={38} />
        </div>
    );
}

function WireRow({ r, compact = false, variant = "generic" }) {
    const thumbCircle = variant === "messages" || variant === "profile";
    return (
        <div className={`wf-listrow ${compact ? "compact" : ""}`} style={{ borderRadius: r }}>
            <div className={`wf-thumb ${thumbCircle ? "round" : ""}`} />
            <div className="wf-grow">
                <Line w={variant === "transactions" ? "54%" : "70%"} />
                <Line w={variant === "restaurants" ? "58%" : "44%"} />
            </div>
            <Pill w={variant === "cart" ? 48 : compact ? 28 : 40} />
        </div>
    );
}

function PhoneMockStyles() {
    return (
        <style>{`
            .phone-mock-wrap {
                width: 100%;
                overflow-x: auto;
                padding-bottom: 6px;
            }
            .phone-svg-preview {
                width: 100%;
                border-radius: 16px;
                overflow: hidden;
                background: rgba(255, 255, 255, 0.04);
            }
            .phone-svg-preview img {
                display: block;
                width: 100%;
                height: auto;
            }
            .phone-mock-grid {
                display: grid;
                grid-template-columns: repeat(3, minmax(0, 1fr));
                gap: 18px 16px;
                align-items: start;
                justify-items: center;
            }
            .phone-card {
                width: 178px;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .phone-label {
                margin-bottom: 8px;
                font-size: 11px;
                font-weight: 700;
                color: rgba(255, 255, 255, 0.82);
                letter-spacing: 0.02em;
            }
            .iphone-outer {
                width: 178px;
                height: 372px;
                padding: 4px;
                border-radius: 30px;
                background: linear-gradient(180deg, #d9dce6 0%, #9fa7bc 100%);
                box-shadow: 0 10px 22px rgba(6, 10, 25, 0.22);
            }
            .iphone-inner {
                width: 100%;
                height: 100%;
                border-radius: 26px;
                background: #1f2430;
                padding: 2px;
            }
            .iphone-screen {
                position: relative;
                width: 100%;
                height: 100%;
                border-radius: 24px;
                background: #f7f7fa;
                color: #12131a;
                overflow: hidden;
                border: 1px solid rgba(17, 18, 25, 0.08);
            }
            .iphone-notch {
                position: absolute;
                top: 7px;
                left: 50%;
                transform: translateX(-50%);
                width: 66px;
                height: 16px;
                border-radius: 10px;
                background: #13151d;
                z-index: 2;
            }
            .statusbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px 4px;
                font-size: 8px;
                font-weight: 700;
                color: #2a2f39;
                letter-spacing: 0.02em;
            }
            .statusbar-right {
                opacity: 0.8;
            }
            .topbar {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 8px;
                padding: 4px 12px 6px;
            }
            .topbar-btn {
                width: 18px;
                text-align: center;
                font-size: 10px;
                color: #535a68;
                font-weight: 700;
                flex: 0 0 18px;
            }
            .topbar-title {
                flex: 1;
                text-align: center;
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .screen-body {
                height: calc(100% - 72px);
                padding: 6px 10px 8px;
                overflow: hidden;
            }
            .density-airy.screen-body { padding: 8px 11px 10px; }
            .density-normal.screen-body { padding: 6px 10px 8px; }
            .density-compact.screen-body { padding: 4px 9px 6px; }

            .bottomnav {
                position: absolute;
                left: 9px;
                right: 9px;
                bottom: 14px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 12px;
                background: rgba(225, 228, 235, 0.7);
                border: 1px solid rgba(15, 18, 30, 0.06);
            }
            .nav-boxed {
                background: #eceef3;
            }
            .nav-icons {
                background: transparent;
                border-color: transparent;
                padding-left: 2px;
                padding-right: 2px;
            }
            .navicon {
                width: 22px;
                height: 18px;
                border-radius: 6px;
                display: grid;
                place-items: center;
                font-size: 9px;
                font-weight: 700;
                color: #646c7a;
                background: transparent;
            }
            .nav-boxed .navicon {
                background: #dde1ea;
            }
            .navicon.active {
                color: #1f2430;
                background: rgba(174, 182, 198, 0.42);
            }
            .home-indicator {
                position: absolute;
                left: 50%;
                transform: translateX(-50%);
                bottom: 4px;
                width: 64px;
                height: 3px;
                border-radius: 99px;
                background: rgba(23, 26, 36, 0.7);
            }

            .wf-row {
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .wf-row.space-between {
                justify-content: space-between;
            }
            .wf-grow {
                flex: 1;
                min-width: 0;
            }
            .wf-grid2 {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 7px;
            }
            .wf-box {
                width: 100%;
                background: linear-gradient(180deg, #e7e9ef 0%, #d8dbe5 100%);
                border: 1px solid #d4d7e0;
            }
            .wf-box.wf-hero {
                background: linear-gradient(180deg, #e4e7ef 0%, #d0d5e1 100%);
            }
            .wf-line {
                height: 6px;
                border-radius: 99px;
                background: #d7dae3;
                margin-bottom: 5px;
            }
            .wf-pill {
                height: 16px;
                border-radius: 999px;
                background: #e1e4ec;
                border: 1px solid #d5d9e3;
                flex: 0 0 auto;
            }
            .wf-list {
                display: flex;
                flex-direction: column;
                gap: 7px;
            }
            .wf-listrow {
                display: flex;
                align-items: center;
                gap: 7px;
                padding: 6px;
                background: #eff1f6;
                border: 1px solid #dde1ea;
            }
            .wf-listrow.compact {
                padding-top: 5px;
                padding-bottom: 5px;
            }
            .wf-thumb {
                width: 24px;
                height: 24px;
                border-radius: 7px;
                background: #d4d9e5;
                border: 1px solid #cfd4e0;
                flex: 0 0 auto;
            }
            .wf-thumb.round {
                border-radius: 999px;
            }
            .wf-profile-head {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px;
                background: #eff1f6;
                border: 1px solid #dde1ea;
            }
            .wf-avatar {
                width: 36px;
                height: 36px;
                border-radius: 999px;
                background: #d6dbe7;
                border: 1px solid #cdd3df;
                flex: 0 0 auto;
            }
            .wf-settings {
                background: #eff1f6;
                border: 1px solid #dde1ea;
                padding: 6px;
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .wf-setting-row {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 2px;
            }
            .wf-toggle {
                width: 28px;
                height: 16px;
                border-radius: 999px;
                background: #d8dde8;
                position: relative;
                border: 1px solid #cfd5e1;
            }
            .wf-toggle.on {
                background: #c8d2e6;
            }
            .wf-toggle-dot {
                width: 12px;
                height: 12px;
                border-radius: 999px;
                background: #fff;
                border: 1px solid #d1d6e2;
                position: absolute;
                top: 1px;
                left: 1px;
            }
            .wf-toggle.on .wf-toggle-dot {
                left: 13px;
            }

            @media (max-width: 1200px) {
                .phone-card {
                    width: 168px;
                }
                .iphone-outer {
                    width: 168px;
                    height: 352px;
                }
            }
        `}</style>
    );
}















































