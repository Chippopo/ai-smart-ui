// src/components/DashboardMock.jsx
import React, { useMemo } from "react";

function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
}

function shade(hex, amt = 0) {
    // very small helper, safe enough for UI
    const h = hex.replace("#", "");
    if (h.length !== 6) return hex;
    const num = parseInt(h, 16);
    let r = (num >> 16) + amt;
    let g = ((num >> 8) & 0xff) + amt;
    let b = (num & 0xff) + amt;
    r = clamp(r, 0, 255);
    g = clamp(g, 0, 255);
    b = clamp(b, 0, 255);
    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, "0")}`;
}

function Skeleton({ w = "100%", h = 10, r = 10, o = 0.12 }) {
    return (
        <div
            style={{
                width: w,
                height: h,
                borderRadius: r,
                background: `rgba(0,0,0,${o})`,
            }}
        />
    );
}

function Card({ children, style }) {
    return (
        <div
            style={{
                background: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(0,0,0,0.06)",
                borderRadius: 18,
                boxShadow: "0 18px 45px rgba(0,0,0,0.12)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function Chip({ children }) {
    return (
        <span
            style={{
                fontSize: 12,
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.06)",
            }}
        >
            {children}
        </span>
    );
}

export default function DashboardMock({ palette, spec }) {
    const variant = spec?.variant || "minimal";

    const c1 = palette?.[0] || "#111827";
    const c2 = palette?.[1] || "#1F2937";
    const c3 = palette?.[2] || "#374151";
    const c4 = palette?.[3] || "#4B5563";
    
    const accent = useMemo(() => shade(c4, 30), [c4]);
    const accent2 = useMemo(() => shade(c3, 45), [c3]);

    // Outer “device” frame
    const frameBg =
        variant === "fitness"
            ? "linear-gradient(135deg, rgba(150,255,120,0.35), rgba(255,255,255,0.75))"
            : variant === "finance"
                ? "linear-gradient(135deg, rgba(90,200,160,0.25), rgba(255,255,255,0.78))"
                : "linear-gradient(135deg, rgba(130,170,255,0.25), rgba(255,255,255,0.80))";

    // Shared container
    const Shell = ({ children }) => (
        <div
            style={{
                width: "100%",
                borderRadius: 22,
                background: frameBg,
                padding: 18,
                overflow: "hidden",
            }}
        >
            {children}
        </div>
    );


    const schema = spec?.layoutSchema;

    const renderSchemaPanel = (section) => {
        const type = String(section?.type || "summary").toLowerCase();
        const tone = section?.tone || "clean";
        const softBg = tone === "bold" ? `linear-gradient(135deg, ${accent2}, ${accent})` : "rgba(0,0,0,0.04)";

        if (type === "topbar") {
            return (
                <Card style={{ padding: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>Dashboard</div>
                            <div style={{ fontSize: 18, fontWeight: 900 }}>{spec?.content?.headline || "Performance Overview"}</div>
                        </div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 220, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            <Chip>Filter</Chip>
                        </div>
                    </div>
                </Card>
            );
        }

        if (type === "kpis") {
            return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} style={{ padding: 14 }}>
                            <Skeleton h={10} w="55%" />
                            <div style={{ height: 10 }} />
                            <Skeleton h={24} w="45%" r={12} o={0.18} />
                            <div style={{ height: 10 }} />
                            <Skeleton h={10} w="70%" />
                        </Card>
                    ))}
                </div>
            );
        }

        if (type === "trend" || type === "funnel" || type === "map") {
            return (
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900, marginBottom: 12, textTransform: "capitalize" }}>{type}</div>
                    <div style={{ height: type === "map" ? 260 : 220, borderRadius: 18, background: softBg, opacity: 0.75 }} />
                </Card>
            );
        }

        if (type === "table" || type === "feed" || type === "timeline") {
            return (
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900, marginBottom: 12, textTransform: "capitalize" }}>{type}</div>
                    <div style={{ display: "grid", gap: 10 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 110px", gap: 12, alignItems: "center" }}>
                                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(0,0,0,0.06)" }} />
                                <div>
                                    <Skeleton h={10} w="60%" />
                                    <div style={{ height: 6 }} />
                                    <Skeleton h={10} w="38%" />
                                </div>
                                <Skeleton h={14} r={10} o={0.1} />
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }

        if (type === "calendar") {
            return (
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900, marginBottom: 12 }}>Calendar</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                        {Array.from({ length: 35 }).map((_, idx) => (
                            <div key={idx} style={{ height: 24, borderRadius: 10, background: "rgba(0,0,0,0.06)" }} />
                        ))}
                    </div>
                </Card>
            );
        }

        if (type === "kanban") {
            return (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                    {Array.from({ length: 3 }).map((_, col) => (
                        <Card key={col} style={{ padding: 12 }}>
                            <div style={{ fontWeight: 800, marginBottom: 10 }}>Column {col + 1}</div>
                            <div style={{ display: "grid", gap: 8 }}>
                                {Array.from({ length: 4 }).map((__, i) => (
                                    <div key={i} style={{ height: 44, borderRadius: 12, background: "rgba(0,0,0,0.06)" }} />
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        if (type === "goals") {
            return (
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900, marginBottom: 12 }}>Goals</div>
                    <div style={{ display: "grid", gap: 10 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i}>
                                <Skeleton h={10} w="45%" />
                                <div style={{ height: 6 }} />
                                <div style={{ height: 12, borderRadius: 999, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
                                    <div style={{ width: `${35 + i * 15}%`, height: "100%", background: `linear-gradient(90deg, ${c2}, ${c4})` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }

        return (
            <Card style={{ padding: 14 }}>
                <div style={{ fontWeight: 900, marginBottom: 12, textTransform: "capitalize" }}>{type}</div>
                <div style={{ display: "grid", gap: 10 }}>
                    <Skeleton h={10} />
                    <Skeleton h={10} />
                    <Skeleton h={10} />
                    <div style={{ height: 140, borderRadius: 16, background: "rgba(0,0,0,0.06)" }} />
                </div>
            </Card>
        );
    };

    const renderCreativeDashboard = (layoutSchema) => {
        const frameStyle = layoutSchema?.style?.frame || spec?.style?.frame || "split";
        const gridCols =
            frameStyle === "rail"
                ? "90px 1fr"
                : frameStyle === "triple"
                    ? "240px 1fr 300px"
                    : frameStyle === "single"
                        ? "1fr"
                        : "220px 1fr";

        return (
            <Shell>
                <div style={{ display: "grid", gridTemplateColumns: gridCols, gap: 14 }}>
                    {frameStyle !== "single" && (
                        <Card style={{ padding: 14, background: "rgba(255,255,255,0.9)" }}>
                            <div style={{ fontWeight: 900, marginBottom: 12 }}>{spec?.brand || "Workspace"}</div>
                            <div style={{ display: "grid", gap: 10 }}>
                                {Array.from({ length: frameStyle === "rail" ? 8 : 6 }).map((_, i) => (
                                    <div key={i} style={{ height: frameStyle === "rail" ? 42 : 34, borderRadius: 12, background: "rgba(0,0,0,0.06)" }} />
                                ))}
                            </div>
                        </Card>
                    )}

                    <div style={{ display: "grid", gap: 14 }}>
                        {(layoutSchema?.rows || []).map((row) => (
                            <div key={row.id} style={{ display: "grid", gridTemplateColumns: row.columns || "1fr", gap: 14 }}>
                                {(row.sections || []).map((section) => (
                                    <React.Fragment key={section.id}>{renderSchemaPanel(section)}</React.Fragment>
                                ))}
                            </div>
                        ))}
                    </div>

                    {frameStyle === "triple" && (
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900, marginBottom: 12 }}>Insights</div>
                            <div style={{ display: "grid", gap: 10 }}>
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} style={{ height: 42, borderRadius: 12, background: "rgba(0,0,0,0.06)" }} />
                                ))}
                            </div>
                        </Card>
                    )}
                </div>
            </Shell>
        );
    };

    if (schema?.rows?.length) return renderCreativeDashboard(schema);

    // ===== Variants =====

    const Minimal = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 14 }}>
                {/* Sidebar */}
                <Card style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div
                            style={{
                                width: 38,
                                height: 38,
                                borderRadius: 14,
                                background: `linear-gradient(135deg, ${c3}, ${c1})`,
                            }}
                        />
                        <div style={{ fontWeight: 800 }}>Dashboard</div>
                    </div>

                    <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                        {["Overview", "Payments", "Transactions", "Invoices", "Cards"].map((t) => (
                            <div
                                key={t}
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    alignItems: "center",
                                    padding: "10px 10px",
                                    borderRadius: 14,
                                    background: "rgba(0,0,0,0.04)",
                                }}
                            >
                                <div
                                    style={{
                                        width: 26,
                                        height: 26,
                                        borderRadius: 10,
                                        background: `linear-gradient(135deg, ${c2}, ${c1})`,
                                        opacity: 0.9,
                                    }}
                                />
                                <div style={{ fontSize: 13, opacity: 0.9 }}>{t}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <Card
                            style={{
                                padding: 12,
                                background: `linear-gradient(135deg, ${c2}, ${c1})`,
                                color: "white",
                                border: "none",
                            }}
                        >
                            <div style={{ fontWeight: 800, marginBottom: 8 }}>Upgrade</div>
                            <Skeleton h={10} o={0.18} />
                            <div style={{ height: 8 }} />
                            <Skeleton h={10} o={0.18} />
                            <div style={{ height: 10 }} />
                            <div
                                style={{
                                    padding: "8px 10px",
                                    borderRadius: 12,
                                    background: "rgba(255,255,255,0.16)",
                                    display: "inline-block",
                                    fontSize: 12,
                                    fontWeight: 700,
                                }}
                            >
                                Upgrade to Pro
                            </div>
                        </Card>
                    </div>
                </Card>

                {/* Main */}
                <div style={{ display: "grid", gap: 14 }}>
                    {/* Top bar */}
                    <Card style={{ padding: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontSize: 12, opacity: 0.65 }}>Welcome back</div>
                                <div style={{ fontSize: 18, fontWeight: 900 }}>Wireframe Dashboard</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <div
                                    style={{
                                        width: 220,
                                        height: 36,
                                        borderRadius: 14,
                                        background: "rgba(0,0,0,0.06)",
                                    }}
                                />
                                <div
                                    style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 14,
                                        background: `linear-gradient(135deg, ${c3}, ${c1})`,
                                    }}
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Stats row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} style={{ padding: 14 }}>
                                <Skeleton w="60%" h={12} />
                                <div style={{ height: 10 }} />
                                <Skeleton w="40%" h={20} r={12} o={0.18} />
                                <div style={{ height: 10 }} />
                                <Skeleton w="70%" h={10} />
                            </Card>
                        ))}
                    </div>

                    {/* Two columns */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 14 }}>
                        <Card style={{ padding: 14 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ fontWeight: 900 }}>Revenue</div>
                                <Chip>Monthly</Chip>
                            </div>
                            <div style={{ height: 12 }} />
                            <div
                                style={{
                                    height: 190,
                                    borderRadius: 18,
                                    background: `linear-gradient(135deg, ${accent2}, ${accent})`,
                                    opacity: 0.75,
                                }}
                            />
                        </Card>

                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Calendar</div>
                            <div style={{ height: 12 }} />
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                                {Array.from({ length: 28 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            height: 26,
                                            borderRadius: 10,
                                            background: "rgba(0,0,0,0.06)",
                                        }}
                                    />
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Shell>
    );

    const Fitness = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateColumns: "86px 1fr 280px", gap: 14 }}>
                {/* Icon sidebar */}
                <Card style={{ padding: 12, background: `linear-gradient(180deg, ${c1}, ${c2})`, color: "white", border: "none" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 16, background: "rgba(255,255,255,0.16)" }} />
                    <div style={{ height: 14 }} />
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 16, background: "rgba(255,255,255,0.10)" }} />
                        </div>
                    ))}
                    <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 16, background: "rgba(255,255,255,0.16)" }} />
                    </div>
                </Card>

                {/* Middle */}
                <div style={{ display: "grid", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 12, opacity: 0.65 }}>Good morning</div>
                                <div style={{ fontWeight: 900, fontSize: 18 }}>Workout Dashboard</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <Chip>Weekly</Chip>
                                <div style={{ width: 220, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            </div>
                        </div>
                    </Card>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} style={{ padding: 14 }}>
                                <Skeleton w="50%" h={12} />
                                <div style={{ height: 10 }} />
                                <Skeleton w="40%" h={24} r={12} o={0.18} />
                                <div style={{ height: 10 }} />
                                <Skeleton w="70%" h={10} />
                            </Card>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14 }}>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900, display: "flex", justifyContent: "space-between" }}>
                                Workout Activity <Chip>Online</Chip>
                            </div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 210, borderRadius: 18, background: `linear-gradient(135deg, ${accent2}, ${accent})`, opacity: 0.65 }} />
                        </Card>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Progress</div>
                            <div style={{ height: 12 }} />
                            <div style={{ display: "grid", gap: 10 }}>
                                <Skeleton h={10} />
                                <Skeleton h={10} />
                                <Skeleton h={10} />
                                <div style={{ height: 8 }} />
                                <div style={{ height: 150, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Right panel */}
                <Card style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <div style={{ width: 44, height: 44, borderRadius: 16, background: `linear-gradient(135deg, ${c3}, ${c1})` }} />
                        <div>
                            <div style={{ fontWeight: 900 }}>Profile</div>
                            <div style={{ fontSize: 12, opacity: 0.65 }}>Stats</div>
                        </div>
                    </div>

                    <div style={{ height: 14 }} />
                    <Skeleton h={10} />
                    <div style={{ height: 8 }} />
                    <Skeleton h={10} />
                    <div style={{ height: 14 }} />

                    <div style={{ fontWeight: 900 }}>Attendance</div>
                    <div style={{ height: 10 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
                        {Array.from({ length: 28 }).map((_, idx) => (
                            <div key={idx} style={{ height: 24, borderRadius: 10, background: "rgba(0,0,0,0.06)" }} />
                        ))}
                    </div>

                    <div style={{ height: 14 }} />
                    <div style={{ fontWeight: 900 }}>Trending</div>
                    <div style={{ height: 10 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                        {[1, 2, 3].map((i) => (
                            <div key={i} style={{ height: 70, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                        ))}
                    </div>
                </Card>
            </div>
        </Shell>
    );

    const Finance = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateColumns: "90px 1fr", gap: 14 }}>
                {/* Round icon rail */}
                <Card style={{ padding: 12 }}>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
                            <div style={{ width: 44, height: 44, borderRadius: 999, background: "rgba(0,0,0,0.06)" }} />
                        </div>
                    ))}
                </Card>

                <div style={{ display: "grid", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 900 }}>Welcome Back</div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <Chip>Monthly</Chip>
                                <div style={{ width: 220, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            </div>
                        </div>
                    </Card>

                    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.6fr 1.1fr", gap: 14 }}>
                        <Card style={{ padding: 14, background: `linear-gradient(135deg, ${c2}, ${c1})`, color: "white", border: "none" }}>
                            <div style={{ fontWeight: 900 }}>Card</div>
                            <div style={{ height: 14 }} />
                            <Skeleton h={10} o={0.18} />
                            <div style={{ height: 8 }} />
                            <Skeleton h={10} o={0.18} />
                            <div style={{ height: 26 }} />
                            <Skeleton h={18} w="60%" r={10} o={0.18} />
                        </Card>

                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900, display: "flex", justifyContent: "space-between" }}>
                                Engagement <Chip>Year</Chip>
                            </div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 220, borderRadius: 18, background: `linear-gradient(135deg, ${accent2}, ${accent})`, opacity: 0.6 }} />
                        </Card>

                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Balance</div>
                            <div style={{ height: 12 }} />
                            <Skeleton h={26} w="70%" r={12} o={0.18} />
                            <div style={{ height: 12 }} />
                            <div style={{ height: 180, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                        </Card>
                    </div>

                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900, display: "flex", justifyContent: "space-between" }}>
                            Payment History <Chip>Recent</Chip>
                        </div>
                        <div style={{ height: 12 }} />
                        <div style={{ display: "grid", gap: 10 }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 120px", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                                    <div>
                                        <Skeleton h={10} w="50%" />
                                        <div style={{ height: 6 }} />
                                        <Skeleton h={10} w="30%" />
                                    </div>
                                    <Skeleton h={14} w="90%" r={10} o={0.10} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Shell>
    );

    const Skills = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14 }}>
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>Skillset</div>
                    <div style={{ height: 14 }} />
                    {["Dashboard", "Mentors", "Students", "Analytics", "Courses", "Forum"].map((t) => (
                        <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 10px", borderRadius: 14, background: "rgba(0,0,0,0.04)", marginBottom: 10 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 10, background: `linear-gradient(135deg, ${c3}, ${c1})`, opacity: 0.9 }} />
                            <div style={{ fontSize: 13 }}>{t}</div>
                        </div>
                    ))}
                    <div style={{ height: 6 }} />
                    <Card style={{ padding: 12, background: `linear-gradient(135deg, ${c2}, ${c1})`, color: "white", border: "none" }}>
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>Upgrade</div>
                        <Skeleton h={10} o={0.18} />
                        <div style={{ height: 8 }} />
                        <Skeleton h={10} o={0.18} />
                    </Card>
                </Card>

                <div style={{ display: "grid", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 900, fontSize: 18 }}>Dashboard</div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <Chip>Month</Chip>
                                <div style={{ width: 240, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                                <div style={{ width: 34, height: 34, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            </div>
                        </div>
                    </Card>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card key={i} style={{ padding: 14 }}>
                                <Skeleton h={10} w="60%" />
                                <div style={{ height: 10 }} />
                                <Skeleton h={22} w="55%" r={12} o={0.18} />
                                <div style={{ height: 10 }} />
                                <Skeleton h={10} w="70%" />
                            </Card>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 14 }}>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Total Revenue</div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 220, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                        </Card>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Calendar</div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 220, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                        </Card>
                    </div>

                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900 }}>Course Purchases</div>
                        <div style={{ height: 12 }} />
                        <div style={{ height: 120, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                    </Card>
                </div>
            </div>
        </Shell>
    );

    const Logistics = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 14 }}>
                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900 }}>Dropify</div>
                    <div style={{ height: 14 }} />
                    {["Dashboard", "Orders", "Shipments", "Map", "Messages", "Settings"].map((t) => (
                        <div key={t} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 10px", borderRadius: 14, background: "rgba(0,0,0,0.04)", marginBottom: 10 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 999, background: "rgba(0,0,0,0.08)" }} />
                            <div style={{ fontSize: 13 }}>{t}</div>
                        </div>
                    ))}
                    <div style={{ height: 10 }} />
                    <Card style={{ padding: 12, background: `linear-gradient(135deg, ${c2}, ${c1})`, color: "white", border: "none" }}>
                        <div style={{ fontWeight: 900 }}>Theme</div>
                        <div style={{ height: 8 }} />
                        <Skeleton h={10} o={0.18} />
                    </Card>
                </Card>

                <div style={{ display: "grid", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 12, opacity: 0.65 }}>Welcome back</div>
                                <div style={{ fontWeight: 900, fontSize: 18 }}>Logistics Dashboard</div>
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                                <div style={{ width: 36, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                                <div style={{ width: 140, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            </div>
                        </div>
                    </Card>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Card key={i} style={{ padding: 14 }}>
                                <Skeleton h={10} w="55%" />
                                <div style={{ height: 10 }} />
                                <Skeleton h={22} w="60%" r={12} o={0.18} />
                                <div style={{ height: 10 }} />
                                <Skeleton h={10} w="70%" />
                            </Card>
                        ))}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 14 }}>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Orders Overview</div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 260, borderRadius: 18, background: `linear-gradient(135deg, ${accent2}, ${accent})`, opacity: 0.55 }} />
                        </Card>
                        <Card style={{ padding: 14 }}>
                            <div style={{ fontWeight: 900 }}>Speed</div>
                            <div style={{ height: 12 }} />
                            <div style={{ height: 260, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                        </Card>
                    </div>
                </div>

                <Card style={{ padding: 14 }}>
                    <div style={{ fontWeight: 900 }}>Map Overview</div>
                    <div style={{ height: 12 }} />
                    <div style={{ height: 360, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                    <div style={{ height: 12 }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <Skeleton h={14} r={12} />
                        <Skeleton h={14} r={12} />
                    </div>
                </Card>
            </div>
        </Shell>
    );

    const Analytics = () => (
        <Shell>
            <div style={{ display: "grid", gridTemplateRows: "auto auto 1fr", gap: 14 }}>
                <Card style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>Analytics</div>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <div style={{ width: 260, height: 36, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                            <Chip>Filters</Chip>
                        </div>
                    </div>
                </Card>

                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900, display: "flex", justifyContent: "space-between" }}>
                            Trend <Chip>Last 12 mo</Chip>
                        </div>
                        <div style={{ height: 12 }} />
                        <div style={{ height: 240, borderRadius: 18, background: `linear-gradient(135deg, ${accent2}, ${accent})`, opacity: 0.6 }} />
                    </Card>

                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900 }}>Distribution</div>
                        <div style={{ height: 12 }} />
                        <div style={{ height: 240, borderRadius: 18, background: "rgba(0,0,0,0.06)" }} />
                    </Card>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1.7fr", gap: 14 }}>
                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900 }}>KPIs</div>
                        <div style={{ height: 12 }} />
                        <div style={{ display: "grid", gap: 10 }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: 10, alignItems: "center" }}>
                                    <Skeleton h={10} w="70%" />
                                    <Skeleton h={14} r={10} o={0.10} />
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card style={{ padding: 14 }}>
                        <div style={{ fontWeight: 900 }}>Recent Activity</div>
                        <div style={{ height: 12 }} />
                        <div style={{ display: "grid", gap: 12 }}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 80px", gap: 12, alignItems: "center" }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 14, background: "rgba(0,0,0,0.06)" }} />
                                    <div>
                                        <Skeleton h={10} w="55%" />
                                        <div style={{ height: 6 }} />
                                        <Skeleton h={10} w="35%" />
                                    </div>
                                    <Skeleton h={14} r={10} o={0.10} />
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Shell>
    );

    // Pick variant render
    if (variant === "fitness") return <Fitness />;
    if (variant === "finance") return <Finance />;
    if (variant === "skills") return <Skills />;
    if (variant === "logistics") return <Logistics />;
    if (variant === "analytics") return <Analytics />;
    return <Minimal />;
}

