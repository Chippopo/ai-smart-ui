import React, { useMemo } from "react";

function Swatch({ c }) {
    return (
        <div
            style={{
                width: 14,
                height: 14,
                borderRadius: 6,
                background: c,
                border: "1px solid rgba(0,0,0,.08)",
            }}
        />
    );
}

function Pill({ children, light }) {
    return (
        <span
            style={{
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: 999,
                background: light ? "rgba(0,0,0,.04)" : "rgba(255,255,255,.08)",
                border: light ? "1px solid rgba(0,0,0,.08)" : "1px solid rgba(255,255,255,.14)",
                fontSize: 12,
                fontWeight: 700,
                color: light ? "rgba(15,23,42,.85)" : "rgba(255,255,255,.88)",
            }}
        >
            {children}
        </span>
    );
}

function Button({ children, variant = "primary" }) {
    const isGhost = variant === "ghost";
    return (
        <button
            type="button"
            style={{
                padding: "12px 16px",
                borderRadius: 14,
                fontWeight: 900,
                border: isGhost ? "1px solid rgba(0,0,0,.10)" : "1px solid rgba(0,0,0,.08)",
                background: isGhost ? "rgba(255,255,255,.65)" : "linear-gradient(135deg, var(--accent), var(--accent2))",
                color: isGhost ? "rgba(15,23,42,.95)" : "white",
                cursor: "default",
            }}
        >
            {children}
        </button>
    );
}

function Card({ children }) {
    return (
        <div
            style={{
                borderRadius: 22,
                background: "white",
                border: "1px solid rgba(0,0,0,.06)",
                boxShadow: "0 18px 70px rgba(15,23,42,.10)",
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );
}

function SoftCard({ children }) {
    return (
        <div
            style={{
                borderRadius: 18,
                background: "rgba(255,255,255,.75)",
                border: "1px solid rgba(0,0,0,.06)",
                boxShadow: "0 14px 40px rgba(15,23,42,.08)",
            }}
        >
            {children}
        </div>
    );
}

function ImgBlock({ h = 220, seed = 1, salt = 0, variant = "split" }) {
    const pattern = Math.abs((Number(seed) || 1) * 7 + salt) % 5;
    const radius = variant === "editorial" ? 12 : variant === "mosaic" ? 28 : 22;

    if (pattern === 0) {
        return (
            <div style={{ height: h, borderRadius: radius, border: "1px solid rgba(0,0,0,.06)", padding: 12, background: "linear-gradient(135deg, rgba(0,0,0,.05), rgba(0,0,0,.02))" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 10, height: "100%" }}>
                    <div style={{ borderRadius: radius - 6, background: "rgba(0,0,0,.08)" }} />
                    <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ borderRadius: 14, background: "rgba(0,0,0,.07)" }} />
                        <div style={{ borderRadius: 14, background: "rgba(0,0,0,.05)" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (pattern === 1) {
        return (
            <div style={{ height: h, borderRadius: radius, border: "1px solid rgba(0,0,0,.06)", padding: 12, background: "linear-gradient(135deg, rgba(0,0,0,.03), rgba(0,0,0,.01))" }}>
                <div style={{ display: "grid", gridTemplateRows: "1.3fr 1fr", gap: 10, height: "100%" }}>
                    <div style={{ borderRadius: radius - 6, background: "rgba(0,0,0,.08)" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        <div style={{ borderRadius: 14, background: "rgba(0,0,0,.06)" }} />
                        <div style={{ borderRadius: 14, background: "rgba(0,0,0,.05)" }} />
                        <div style={{ borderRadius: 14, background: "rgba(0,0,0,.04)" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (pattern === 2) {
        return (
            <div style={{ height: h, borderRadius: radius, border: "1px solid rgba(0,0,0,.06)", padding: 12, background: "radial-gradient(700px 240px at 10% 20%, rgba(0,0,0,.08), transparent 60%), linear-gradient(135deg, rgba(0,0,0,.05), rgba(0,0,0,.02))" }}>
                <div style={{ display: "grid", gap: 10, height: "100%" }}>
                    <div style={{ height: "22%", borderRadius: 14, background: "rgba(0,0,0,.07)" }} />
                    <div style={{ flex: 1, borderRadius: radius - 6, background: "rgba(0,0,0,.06)" }} />
                    <div style={{ height: "18%", borderRadius: 14, background: "rgba(0,0,0,.05)" }} />
                </div>
            </div>
        );
    }

    if (pattern === 3) {
        return (
            <div style={{ height: h, borderRadius: radius, border: "1px solid rgba(0,0,0,.06)", padding: 12, background: "linear-gradient(135deg, rgba(0,0,0,.04), rgba(0,0,0,.015))" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, height: "100%" }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} style={{ borderRadius: 12, background: `rgba(0,0,0,${0.08 - i * 0.012})` }} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                height: h,
                borderRadius: radius,
                background:
                    "radial-gradient(800px 260px at 15% 20%, rgba(0,0,0,.06), transparent 60%), linear-gradient(135deg, rgba(0,0,0,.04), rgba(0,0,0,.02))",
                border: "1px solid rgba(0,0,0,.06)",
            }}
        />
    );
}

function PhoneMock({ seed = 1, variant = "split" }) {
    return (
        <div
            style={{
                width: variant === "mosaic" ? 210 : 230,
                height: 460,
                borderRadius: 40,
                background: "linear-gradient(180deg, rgba(0,0,0,.06), rgba(0,0,0,.02))",
                border: "1px solid rgba(0,0,0,.10)",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 24px 90px rgba(15,23,42,.18)",
            }}
        >
            <div
                style={{
                    width: 92,
                    height: 20,
                    borderRadius: 999,
                    background: "rgba(0,0,0,.25)",
                    position: "absolute",
                    top: 10,
                    left: "50%",
                    transform: "translateX(-50%)",
                }}
            />
            <div style={{ padding: 18, paddingTop: 48, display: "grid", gap: 12 }}>
                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(0,0,0,.08)" }} />
                    <div style={{ flex: 1, display: "grid", gap: 8 }}>
                        <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,.10)", width: "70%" }} />
                        <div style={{ height: 9, borderRadius: 999, background: "rgba(0,0,0,.08)", width: "45%" }} />
                    </div>
                </div>
                <div style={{ height: Math.abs((Number(seed) || 1) * 13) % 3 === 0 ? 160 : Math.abs((Number(seed) || 1) * 13) % 3 === 1 ? 120 : 190, borderRadius: 22, background: "rgba(0,0,0,.06)" }} />
                <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,.10)", width: "85%" }} />
                <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,.08)", width: "65%" }} />
                <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, height: 42, borderRadius: 16, background: "rgba(0,0,0,.10)" }} />
                    <div style={{ width: 56, height: 42, borderRadius: 16, background: "rgba(0,0,0,.06)" }} />
                </div>
            </div>
        </div>
    );
}

export default function LandingMock({ spec, plan: planProp }) {
    const plan = planProp || spec?.plan;

    const ui = useMemo(() => {
        const p = plan || {};
        const palette = p.palette || { accent: "#2563EB", accent2: "#38BDF8", bg: "#F8FAFC", ink: "#0F172A" };

        // ✅ Wireframe copy (real placeholder-style text)
        // This only changes TEXT/LABELS, not layout/sections.
        const wireframe = true;

        const base = {
            ...p,
            palette,
            headline: p.headline || "A modern landing page",
            subheadline: p.subheadline || "Clean, premium sections.",
            cta: p.cta || "Get Started",
            cta2: p.cta2 || "Learn More",
            features: Array.isArray(p.features) ? p.features : ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
            stats: Array.isArray(p.stats)
                ? p.stats
                : [
                    { k: "10M+", v: "Actions" },
                    { k: "99.9%", v: "Uptime" },
                    { k: "4.9★", v: "Rating" },
                ],
            testimonials: Array.isArray(p.testimonials) ? p.testimonials : [],
            sections: Array.isArray(p.sections) ? p.sections : ["hero", "featuresGrid", "finalCta", "footer"],
            templateId: p.templateId || "MINIMAL_MONO",
            heroStyle: p.heroStyle || "centered",
            vibe: p.vibe || "minimal",
            layoutVariant: p.layoutVariant || "split",
        };

        if (!wireframe) return base;

        return {
            ...base,
            // Global placeholders
            brandLabel: "Brand",
            navItems: ["Nav item", "Nav item", "Nav item"],
            headline: "Hero headline goes here",
            subheadline:
                "Short supporting sentence describing the value proposition. Keep it 1–2 lines maximum.",
            cta: "Primary CTA",
            cta2: "Secondary CTA",
            features: ["Feature title", "Feature title", "Feature title", "Feature title"],
            stats: [
                { k: "##", v: "Metric label" },
                { k: "##", v: "Metric label" },
                { k: "##", v: "Metric label" },
            ],
            // Section headings / copy placeholders (used below)
            wf: {
                sectionTitle: "Section heading",
                sectionSub: "Short description text for this section.",
                bulletsTitle: "Supporting points",
                proofTitle: "Social proof / trust statement",
                splitTitle: "Two-column section heading",
                splitBody: "Supporting paragraph describing the section content in 1–2 lines.",
                stepsTitle: "Steps section heading",
                faqTitle: "Frequently asked questions",
                listingTitle: "Card title",
                footerLeft: "© Brand",
                footerRight: "Footer links",
            },
        };
    }, [plan]);

    if (spec?.isEmpty) return null;

    if (!plan) {
        return (
            <div style={{ padding: 18, borderRadius: 18, background: "rgba(255,255,255,.08)", color: "white" }}>
                Landing plan missing. Ensure LayoutGenerator uses <b>generateLanding()</b> and passes <b>plan</b> into LandingMock.
            </div>
        );
    }

    const light = true;

    const wrapStyle = {
        ["--accent"]: ui.palette.accent,
        ["--accent2"]: ui.palette.accent2,
        background: ui.palette.bg,
        color: ui.palette.ink,
        borderRadius: 22,
        border: "1px solid rgba(0,0,0,.08)",
        overflow: "hidden",
    };

    const layoutVariant = ui.layoutVariant || "split";
    const featuresCols = layoutVariant === "mosaic" ? "repeat(2, 1fr)" : layoutVariant === "stacked" ? "repeat(3, 1fr)" : "repeat(4, 1fr)";
    const cardsCols = layoutVariant === "editorial" ? "1.4fr 1fr" : layoutVariant === "mosaic" ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
    const listingsCols = layoutVariant === "stacked" ? "1fr" : layoutVariant === "mosaic" ? "repeat(2, 1fr)" : "repeat(3, 1fr)";
    const logoCols = layoutVariant === "stacked" ? "repeat(3, 1fr)" : "repeat(5, 1fr)";

    function TopNav() {
        const navItems = ui.navItems || ["Nav item", "Nav item", "Nav item"];
        return (
            <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 14,
                            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                        }}
                    />
                    <div style={{ fontWeight: 1000 }}>{ui.brandLabel || "Brand"}</div>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {navItems.map((t, i) => (
                        <span key={i} style={{ fontSize: 12, opacity: 0.75 }}>
                            {t}
                        </span>
                    ))}
                    <Button variant="ghost">Button</Button>
                </div>
            </div>
        );
    }

    function HeroCentered() {
        return (
            <div style={{ padding: 22, display: "grid", gap: 16 }}>
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                    <Pill light={light}>
                        <Swatch c={ui.palette.accent} />
                        {ui.templateId}
                    </Pill>
                    <Pill light={light}>{ui.industry?.toUpperCase?.() || "LANDING"}</Pill>
                </div>

                <div style={{ textAlign: "center", display: "grid", gap: 10 }}>
                    <div style={{ fontSize: 40, fontWeight: 1000, lineHeight: 1.05 }}>{ui.headline}</div>
                    <div style={{ maxWidth: 720, margin: "0 auto", opacity: 0.8 }}>{ui.subheadline}</div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
                        <Button>{ui.cta}</Button>
                        <Button variant="ghost">{ui.cta2}</Button>
                    </div>
                </div>

                <div style={{ marginTop: 8 }}>
                        <ImgBlock h={260} seed={ui.seed} salt={4} variant={layoutVariant} />
                </div>
            </div>
        );
    }

    function HeroImageRight(withStats) {
        return (
            <div
                style={{
                    padding: 22,
                    display: "grid",
                    gridTemplateColumns: "1.1fr .9fr",
                    gap: 18,
                    alignItems: "center",
                }}
            >
                <div style={{ display: "grid", gap: 12 }}>
                    <Pill light={light}>
                        <Swatch c={ui.palette.accent} />
                        {ui.templateId}
                    </Pill>
                    <div style={{ fontSize: 44, fontWeight: 1000, lineHeight: 1.02 }}>{ui.headline}</div>
                    <div style={{ opacity: 0.8, maxWidth: 520 }}>{ui.subheadline}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <Button>{ui.cta}</Button>
                        <Button variant="ghost">{ui.cta2}</Button>
                    </div>

                    {withStats && (
                        <div style={{ display: "grid", gridTemplateColumns: cardsCols, gap: 10, marginTop: 10 }}>
                            {ui.stats.slice(0, 3).map((s, i) => (
                                <SoftCard key={i}>
                                    <div style={{ padding: 12 }}>
                                        <div style={{ fontWeight: 1000, fontSize: 18 }}>{s.k}</div>
                                        <div style={{ opacity: 0.7, fontSize: 12 }}>{s.v}</div>
                                    </div>
                                </SoftCard>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <ImgBlock h={320} seed={ui.seed} salt={2} variant={layoutVariant} />
                </div>
            </div>
        );
    }

    function HeroPhoneRight() {
        return (
            <div style={{ padding: 22, display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 18, alignItems: "center" }}>
                <div style={{ display: "grid", gap: 12 }}>
                    <Pill light={light}>
                        <Swatch c={ui.palette.accent} />
                        {ui.templateId}
                    </Pill>
                    <div style={{ fontSize: 44, fontWeight: 1000, lineHeight: 1.02 }}>{ui.headline}</div>
                    <div style={{ opacity: 0.8, maxWidth: 520 }}>{ui.subheadline}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <Button>{ui.cta}</Button>
                        <Button variant="ghost">{ui.cta2}</Button>
                    </div>
                </div>

                <div style={{ display: "grid", justifyContent: "end" }}>
                    <PhoneMock seed={ui.seed} variant={layoutVariant} />
                </div>
            </div>
        );
    }

    function HeroPhoneLeft() {
        return (
            <div style={{ padding: 22, display: "grid", gridTemplateColumns: ".9fr 1.1fr", gap: 18, alignItems: "center" }}>
                <div style={{ display: "grid", justifyContent: "start" }}>
                    <PhoneMock seed={ui.seed} variant={layoutVariant} />
                </div>

                <div style={{ display: "grid", gap: 12 }}>
                    <Pill light={light}>
                        <Swatch c={ui.palette.accent} />
                        {ui.templateId}
                    </Pill>
                    <div style={{ fontSize: 44, fontWeight: 1000, lineHeight: 1.02 }}>{ui.headline}</div>
                    <div style={{ opacity: 0.8, maxWidth: 520 }}>{ui.subheadline}</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                        <Button>{ui.cta}</Button>
                        <Button variant="ghost">{ui.cta2}</Button>
                    </div>
                </div>
            </div>
        );
    }

    function HeroSearch() {
        return (
            <div style={{ padding: 22, display: "grid", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Pill light={light}>
                        <Swatch c={ui.palette.accent} />
                        {ui.templateId}
                    </Pill>
                    <Button variant="ghost">Button</Button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 18, alignItems: "center" }}>
                    <div style={{ display: "grid", gap: 10 }}>
                        <div style={{ fontSize: 44, fontWeight: 1000, lineHeight: 1.02 }}>{ui.headline}</div>
                        <div style={{ opacity: 0.8, maxWidth: 520 }}>{ui.subheadline}</div>

                        <SoftCard>
                            <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 10 }}>
                                <div style={{ height: 40, borderRadius: 14, background: "rgba(0,0,0,.06)" }} />
                                <div style={{ height: 40, borderRadius: 14, background: "rgba(0,0,0,.06)" }} />
                                <div style={{ height: 40, borderRadius: 14, background: "rgba(0,0,0,.06)" }} />
                                <Button>Action</Button>
                            </div>
                        </SoftCard>
                    </div>

                    <ImgBlock h={300} seed={ui.seed} salt={3} variant={layoutVariant} />
                </div>
            </div>
        );
    }

    function LogosRow() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <SoftCard>
                    <div style={{ padding: 14, display: "grid", gridTemplateColumns: logoCols, gap: 10 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ height: 36, borderRadius: 14, background: "rgba(0,0,0,.05)" }} />
                        ))}
                    </div>
                </SoftCard>
            </div>
        );
    }

    function FeaturesGrid() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <div style={{ fontWeight: 1000, fontSize: 18, marginBottom: 12 }}>{ui.wf?.sectionTitle || "Section heading"}</div>
                <div style={{ display: "grid", gridTemplateColumns: featuresCols, gap: 12 }}>
                    {ui.features.slice(0, 4).map((f, i) => (
                        <Card key={i}>
                            <div style={{ padding: 14, display: "grid", gap: 10 }}>
                                <div
                                    style={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 16,
                                        background: "linear-gradient(135deg, rgba(0,0,0,.06), rgba(0,0,0,.02))",
                                        border: "1px solid rgba(0,0,0,.06)",
                                    }}
                                />
                                <div style={{ fontWeight: 1000 }}>{f}</div>
                                <div style={{ height: 9, borderRadius: 999, background: "rgba(0,0,0,.08)", width: "90%" }} />
                                <div style={{ height: 9, borderRadius: 999, background: "rgba(0,0,0,.06)", width: "70%" }} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    function Cards3() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <div style={{ display: "grid", gridTemplateColumns: listingsCols, gap: 12 }}>
                    {ui.features.slice(0, 3).map((f, i) => (
                        <Card key={i}>
                            <div style={{ padding: 16 }}>
                                <div style={{ fontWeight: 1000, fontSize: 16 }}>{f}</div>
                                <div style={{ marginTop: 10, height: 10, borderRadius: 999, background: "rgba(0,0,0,.08)", width: "88%" }} />
                                <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: "rgba(0,0,0,.06)", width: "70%" }} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    function SplitShowcase() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <Card>
                    <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 1000, fontSize: 18 }}>{ui.wf?.splitTitle || "Two-column section heading"}</div>
                            <div style={{ opacity: 0.8, marginTop: 6 }}>{ui.wf?.splitBody || "Supporting paragraph in 1–2 lines."}</div>
                            <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(0,0,0,.06)" }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,.08)", width: "75%" }} />
                                            <div style={{ marginTop: 6, height: 9, borderRadius: 999, background: "rgba(0,0,0,.06)", width: "55%" }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <ImgBlock h={260} seed={ui.seed} salt={1} variant={layoutVariant} />
                    </div>
                </Card>
            </div>
        );
    }

    function BigBand() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <div
                    style={{
                        borderRadius: 26,
                        background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                        color: "white",
                        padding: 20,
                        display: "grid",
                        gridTemplateColumns: "1.2fr .8fr",
                        gap: 14,
                        alignItems: "center",
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 1000, fontSize: 20 }}>{ui.wf?.sectionTitle || "Section heading"}</div>
                        <div style={{ opacity: 0.9, marginTop: 6, fontSize: 13 }}>{ui.wf?.sectionSub || "Short description text."}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "end" }}>
                        <Button variant="ghost">Secondary</Button>
                        <Button>Primary</Button>
                    </div>
                </div>
            </div>
        );
    }

    function ProofStrip() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <SoftCard>
                    <div style={{ padding: 14, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div style={{ fontWeight: 1000 }}>{ui.wf?.proofTitle || "Social proof / trust statement"}</div>
                        <div style={{ display: "flex", gap: 10 }}>
                            {ui.stats.slice(0, 3).map((s, i) => (
                                <Pill key={i} light={light}>
                                    <b>{s.k}</b> <span style={{ opacity: 0.75 }}>{s.v}</span>
                                </Pill>
                            ))}
                        </div>
                    </div>
                </SoftCard>
            </div>
        );
    }

    function TimelineSteps() {
        const steps = ["Step title", "Step title", "Step title"];
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <Card>
                    <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        <div>
                            <div style={{ fontWeight: 1000, fontSize: 18 }}>{ui.wf?.stepsTitle || "Steps section heading"}</div>
                            <div style={{ opacity: 0.8, marginTop: 6 }}>{ui.wf?.sectionSub || "Short description text."}</div>
                        </div>
                        <div style={{ display: "grid", gap: 10 }}>
                            {steps.map((t, i) => (
                                <SoftCard key={i}>
                                    <div style={{ padding: 12, display: "flex", gap: 10, alignItems: "center" }}>
                                        <div
                                            style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 14,
                                                background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                                                color: "white",
                                                display: "grid",
                                                placeItems: "center",
                                                fontWeight: 1000,
                                            }}
                                        >
                                            {i + 1}
                                        </div>
                                        <div style={{ fontWeight: 900 }}>{t}</div>
                                    </div>
                                </SoftCard>
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    function ListingsRow() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <div style={{ fontWeight: 1000, fontSize: 18, marginBottom: 12 }}>{ui.wf?.sectionTitle || "Section heading"}</div>
                <div style={{ display: "grid", gridTemplateColumns: listingsCols, gap: 12 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <div style={{ padding: 12, display: "grid", gap: 10 }}>
                                <div style={{ height: 120, borderRadius: 18, background: "rgba(0,0,0,.06)" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                                    <div style={{ fontWeight: 1000 }}>{ui.wf?.listingTitle || "Card title"} {i + 1}</div>
                                    <Pill light={light}>Tag</Pill>
                                </div>
                                <div style={{ height: 10, borderRadius: 999, background: "rgba(0,0,0,.06)", width: "70%" }} />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    function FAQ() {
        const questions = ["Question goes here?", "Question goes here?", "Question goes here?"];
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <Card>
                    <div style={{ padding: 18, display: "grid", gap: 10 }}>
                        <div style={{ fontWeight: 1000, fontSize: 18 }}>{ui.wf?.faqTitle || "Frequently asked questions"}</div>
                        {questions.map((q, i) => (
                            <SoftCard key={i}>
                                <div style={{ padding: 12 }}>
                                    <div style={{ fontWeight: 900 }}>{q}</div>
                                    <div style={{ marginTop: 8, height: 10, borderRadius: 999, background: "rgba(0,0,0,.06)", width: "92%" }} />
                                    <div style={{ marginTop: 6, height: 10, borderRadius: 999, background: "rgba(0,0,0,.05)", width: "70%" }} />
                                </div>
                            </SoftCard>
                        ))}
                    </div>
                </Card>
            </div>
        );
    }

    function FinalCta() {
        return (
            <div style={{ padding: "0 22px 22px" }}>
                <div
                    style={{
                        borderRadius: 26,
                        background: "linear-gradient(135deg, rgba(0,0,0,.06), rgba(0,0,0,.02))",
                        border: "1px solid rgba(0,0,0,.08)",
                        padding: 18,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                    }}
                >
                    <div>
                        <div style={{ fontWeight: 1000, fontSize: 18 }}>{ui.wf?.sectionTitle || "Section heading"}</div>
                        <div style={{ opacity: 0.8, fontSize: 13 }}>{ui.wf?.sectionSub || "Short description text."}</div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <Button>{ui.cta}</Button>
                        <Button variant="ghost">{ui.cta2}</Button>
                    </div>
                </div>
            </div>
        );
    }

    function Footer() {
        return (
            <div style={{ padding: "14px 22px 18px", opacity: 0.75, fontSize: 12, display: "flex", justifyContent: "space-between" }}>
                <span>{ui.wf?.footerLeft || "© Brand"}</span>
                <span>{ui.wf?.footerRight || "Footer links"}</span>
            </div>
        );
    }

    function renderHero() {
        switch (ui.heroStyle) {
            case "imageRight":
                return <HeroImageRight false />;
            case "imageRightStats":
                return <HeroImageRight true />;
            case "phoneRight":
                return <HeroPhoneRight />;
            case "phoneLeft":
                return <HeroPhoneLeft />;
            case "searchHero":
                return <HeroSearch />;
            case "centered":
            default:
                return <HeroCentered />;
        }
    }

    const sectionMap = {
        hero: renderHero,
        logos: LogosRow,
        featuresGrid: FeaturesGrid,
        cards3: Cards3,
        splitShowcase: SplitShowcase,
        ctaBand: FinalCta,
        proofStrip: ProofStrip,
        aboutSplit: SplitShowcase,
        servicesCards: FeaturesGrid,
        bigBand: BigBand,
        ratingStrip: ProofStrip,
        timelineSteps: TimelineSteps,
        faq: FAQ,
        finalCta: FinalCta,
        listingsRow: ListingsRow,
        guideSplit: SplitShowcase,
        blogRow: Cards3,
        testimonials: FeaturesGrid,
        footer: Footer,
        stats: ProofStrip,
        twoColSteps: TimelineSteps,
    };

    return (
        <div style={wrapStyle}>
            <TopNav />
            <div>
                {ui.sections.map((s, idx) => {
                    const Comp = sectionMap[s];
                    return Comp ? <div key={`${s}-${idx}`}>{typeof Comp === "function" ? <Comp /> : null}</div> : null;
                })}
            </div>
        </div>
    );
}


