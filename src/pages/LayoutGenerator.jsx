// // src/pages/LayoutGenerator.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// import { generatePalette } from "../utils/colorGen.js";
// import { generateLayout } from "../utils/layoutGen.js";
// import { generateLanding } from "../utils/landingAI.js";

// import PhoneMock from "../components/PhoneMock.jsx";
// import LandingMock from "../components/LandingMock.jsx";
// import DashboardMock from "../components/DashboardMock.jsx";

// import "../layout.css";
// /**
//  * This wrapper ONLY affects the DASHBOARD preview.
//  * It scales to fit the REAL dashboard size (measured), so no white spill + no scrollbar.
//  */
// function DashboardFit({ palette, spec }) {
//   const stageRef = useRef(null);
//   const innerRef = useRef(null);

//   const [fit, setFit] = useState({ scale: 1, x: 0, y: 0, w: 1200, h: 760 });

//   useEffect(() => {
//     const stageEl = stageRef.current;
//     const innerEl = innerRef.current;
//     if (!stageEl || !innerEl) return;

//     const apply = () => {
//       // Measure the actual rendered dashboard size
//       const contentW = innerEl.scrollWidth || innerEl.offsetWidth || 1200;
//       const contentH = innerEl.scrollHeight || innerEl.offsetHeight || 760;

//       const w = stageEl.clientWidth;
//       const h = stageEl.clientHeight;

//       // Fit entire dashboard (no crop)
//       const scale = Math.min(w / contentW, h / contentH);

//       // Center it
//       const x = (w - contentW * scale) / 2;
//       const y = (h - contentH * scale) / 2;

//       setFit({ scale, x, y, w: contentW, h: contentH });
//     };

//     apply();

//     const ro = new ResizeObserver(apply);
//     ro.observe(stageEl);
//     ro.observe(innerEl);

//     // Re-apply after fonts/images settle
//     const t = setTimeout(apply, 50);

//     return () => {
//       clearTimeout(t);
//       ro.disconnect();
//     };
//   }, [spec?.title, spec?.variant]); // re-fit when dashboard style changes

//   return (
//     <div className="dash-stage" ref={stageRef}>
//       <div
//         className="dash-inner"
//         style={{
//           width: fit.w,
//           height: fit.h,
//           transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
//         }}
//       >
//         <div ref={innerRef} style={{ width: "fit-content", height: "fit-content" }}>
//           <DashboardMock palette={palette} spec={spec} />
//         </div>
//       </div>
//     </div>
//   );
// }

// const DASH_VARIANTS = [
//   "skills",
//   "fitness",
//   "finance",
//   "logistics",
//   "analytics",
//   "minimal",
// ];

// export default function LayoutGenerator() {
//   const nav = useNavigate();

//   const [mode, setMode] = useState("mobile");
//   const [draftPrompt, setDraftPrompt] = useState(
//     "A modern ecommerce mobile app, clean, minimal"
//   );
//   const [appliedPrompt, setAppliedPrompt] = useState(draftPrompt);

//   const [seed, setSeed] = useState(1);
//   const [mobileCount, setMobileCount] = useState(6);
//   const [brandName, setBrandName] = useState("");

//   // ✅ dashboard-only style cycler
//   const [dashStyleIndex, setDashStyleIndex] = useState(0);

//   const palette = useMemo(() => {
//     if (!appliedPrompt.trim())
//       return ["#111827", "#1F2937", "#374151", "#4B5563", "#6B7280"];
//     return generatePalette(appliedPrompt, seed);
//   }, [appliedPrompt, seed]);

//   const spec = useMemo(() => {
//     if (!appliedPrompt.trim())
//       return { title: "Layout", brand: "", isEmpty: true };

//     // MOBILE + DASHBOARD => existing generator
//     if (mode === "mobile" || mode === "dashboard") {
//       const base = generateLayout(appliedPrompt, mode, seed, brandName.trim());

//       // ✅ add ONLY for dashboard: wireframe layout variant changes on generate
//       if (mode === "dashboard") {
//         const variant = DASH_VARIANTS[dashStyleIndex % DASH_VARIANTS.length];
//         return { ...base, variant };
//       }

//       return base;
//     }

//     // LANDING => generateLanding()
//     const plan = generateLanding(appliedPrompt, seed);
//     return {
//       title: "Landing Page Layout",
//       brand: brandName.trim(),
//       isEmpty: false,
//       plan,
//     };
//   }, [appliedPrompt, mode, seed, brandName, dashStyleIndex]);

//   const onGenerateLayout = () => {
//     const next = draftPrompt.trim();
//     setAppliedPrompt(next);

//     // keep your existing behavior
//     setSeed((s) => s + 1);

//     // ✅ dashboard only: change layout style each time
//     if (mode === "dashboard") {
//       setDashStyleIndex((i) => i + 1);
//     }
//   };

//   return (
//     <div className="layout-wrap">
//       <div className="layout-container">
//         <div className="layout-header">
//           <h1>Layout Generator</h1>
//           <p>Premium layouts with a consistent purple/blue theme.</p>
//         </div>

//         <div className="layout-grid">
//           {/* LEFT */}
//           <div className="layout-glass">
//             <div className="mode-row">
//               <button
//                 className={`mode-btn ${mode === "dashboard" ? "active" : ""}`}
//                 onClick={() => setMode("dashboard")}
//               >
//                 Dashboard
//               </button>
//               <button
//                 className={`mode-btn ${mode === "landing" ? "active" : ""}`}
//                 onClick={() => setMode("landing")}
//               >
//                 Landing
//               </button>
//               <button
//                 className={`mode-btn ${mode === "mobile" ? "active" : ""}`}
//                 onClick={() => setMode("mobile")}
//               >
//                 Mobile
//               </button>
//             </div>

//             {mode === "mobile" && (
//               <>
//                 <label className="lg-label">Number of mobile screens</label>
//                 <select
//                   className="lg-select"
//                   value={mobileCount}
//                   onChange={(e) => setMobileCount(Number(e.target.value))}
//                 >
//                   <option value={4}>4</option>
//                   <option value={6}>6</option>
//                   <option value={12}>12</option>
//                 </select>

//                 <label className="lg-label">App/Brand name (optional)</label>
//                 <input
//                   className="lg-input"
//                   value={brandName}
//                   onChange={(e) => setBrandName(e.target.value)}
//                   placeholder="e.g. PayWave, ShopNest, FitPulse..."
//                 />
//               </>
//             )}

//             <label className="lg-label">Prompt</label>
//             <textarea
//               className="lg-textarea"
//               rows={5}
//               value={draftPrompt}
//               onChange={(e) => setDraftPrompt(e.target.value)}
//             />

//             <button className="layout-generate" onClick={onGenerateLayout}>
//               Generate Layout
//             </button>

//             {/* PALETTE */}
//             <div style={{ marginTop: 18 }}>
//               <div
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                 }}
//               >
//                 <div style={{ fontWeight: 800 }}>Palette Used</div>
//                 <span className="chip">Auto</span>
//               </div>

//               <div className="palette-row">
//                 {palette.map((c, i) => (
//                   <div
//                     className="swatch"
//                     key={`${c}-${i}`}
//                     style={{ background: c }}
//                   />
//                 ))}
//               </div>
//             </div>

//             {/* LINKS */}
//             <button className="switch-btn" onClick={() => nav("/smart-color")}>
//               Go to Smart Color
//             </button>

//             <button className="switch-btn" onClick={() => nav("/")}>
//               Go to Home
//             </button>
//           </div>

//           {/* RIGHT */}
//           <div className="layout-glass">
//             <div className="preview-top">
//               <div>
//                 <div style={{ fontSize: 12, opacity: 0.7 }}>Preview</div>
//                 <h3>{spec.title}</h3>
//               </div>
//               <span className="chip">{mode.toUpperCase()}</span>
//             </div>

//             <div style={{ marginTop: 10 }}>
//               {mode === "mobile" && <PhoneMock spec={spec} count={mobileCount} />}
//               {mode === "landing" && <LandingMock spec={spec} plan={spec.plan} />}

//               {/* ✅ DASHBOARD uses DashboardFit wrapper */}
//               {mode === "dashboard" && <DashboardFit palette={palette} spec={spec} />}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// src/pages/LayoutGenerator.jsx  (AI-powered version)
// Replaces rule-based layoutGen.js with MobileNetV3 Flask backend

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { generatePalette } from "../utils/colorGen.js";
import { generateLanding }  from "../utils/landingAI.js";
import { generateLayout as generateLayoutFallback } from "../utils/layoutGen.js";
import { generateLayoutAI, checkBackendHealth } from "../utils/layoutAi.js";

import PhoneMock      from "../components/PhoneMock.jsx";
import LandingMock    from "../components/LandingMock.jsx";
import DashboardMock  from "../components/DashboardMock.jsx";

import "../layout.css";
function sanitizeFilename(name) {
  return String(name || "layout")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "layout";
}

function cloneWithInlineStyles(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    return document.createTextNode(node.textContent || "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return document.createTextNode("");
  }

  const source = /** @type {HTMLElement} */ (node);
  const clone = source.cloneNode(false);
  const computed = window.getComputedStyle(source);

  let styleText = "";
  for (const prop of computed) {
    styleText += `${prop}:${computed.getPropertyValue(prop)};`;
  }
  clone.setAttribute("style", styleText);

  if (source instanceof HTMLCanvasElement && clone instanceof HTMLCanvasElement) {
    const ctx = clone.getContext("2d");
    if (ctx) ctx.drawImage(source, 0, 0);
  }

  source.childNodes.forEach((child) => {
    clone.appendChild(cloneWithInlineStyles(child));
  });
  return clone;
}


function downloadSvgText(svgText, filename = "layout-preview.svg") {
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
async function downloadNodeAsPng(node, filename = "layout-preview.png") {
  if (!node) throw new Error("Nothing to download.");

  const rect = node.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width));
  const height = Math.max(1, Math.ceil(rect.height));
  const scale = Math.min(2, window.devicePixelRatio || 1);

  const cloned = cloneWithInlineStyles(node);
  const wrapper = document.createElement("div");
  wrapper.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.appendChild(cloned);

  const xhtml = new XMLSerializer().serializeToString(wrapper);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject x="0" y="0" width="${width}" height="${height}">
        ${xhtml}
      </foreignObject>
    </svg>
  `;  try {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable.");

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, width, height);

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
    return { format: "png" };
  } catch (err) {
    const svgName = filename.replace(/\.png$/i, ".svg");
    downloadSvgText(svg, svgName);
    return { format: "svg", error: err };
  }
}

// ─── DashboardFit wrapper (unchanged from original) ─────────────────────────
function DashboardFit({ palette, spec }) {
  const stageRef = useRef(null);
  const innerRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, x: 0, y: 0, w: 1200, h: 760 });

  useEffect(() => {
    const stageEl = stageRef.current;
    const innerEl = innerRef.current;
    if (!stageEl || !innerEl) return;

    const apply = () => {
      const contentW = innerEl.scrollWidth || innerEl.offsetWidth || 1200;
      const contentH = innerEl.scrollHeight || innerEl.offsetHeight || 760;
      const w = stageEl.clientWidth;
      const h = stageEl.clientHeight;
      const scale = Math.min(w / contentW, h / contentH);
      const x = (w - contentW * scale) / 2;
      const y = (h - contentH * scale) / 2;
      setFit({ scale, x, y, w: contentW, h: contentH });
    };

    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(stageEl);
    ro.observe(innerEl);
    const t = setTimeout(apply, 50);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [spec?.variant]);

  return (
    <div className="dash-stage" ref={stageRef}>
      <div
        className="dash-inner"
        style={{
          width: fit.w,
          height: fit.h,
          transform: `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`,
        }}
      >
        <div ref={innerRef} style={{ width: "fit-content", height: "fit-content" }}>
          <DashboardMock palette={palette} spec={spec} />
        </div>
      </div>
    </div>
  );
}

// ─── AI Status Badge ─────────────────────────────────────────────────────────
function AIBadge({ status, confidence, source }) {
  if (!status) return null;

  const isAI       = source === "mobilenetv3";

  const style = {
    display:        "inline-flex",
    alignItems:     "center",
    gap:            6,
    padding:        "5px 10px",
    borderRadius:   999,
    fontSize:       11,
    fontWeight:     700,
    letterSpacing:  "0.03em",
    background:     isAI
      ? "rgba(16,185,129,0.15)"
      : "rgba(251,191,36,0.15)",
    border: isAI
      ? "1px solid rgba(16,185,129,0.35)"
      : "1px solid rgba(251,191,36,0.35)",
    color: isAI ? "#10b981" : "#fbbf24",
  };

  return (
    <span style={style}>
      <span>{isAI ? "*" : "o"}</span>
      {isAI
        ? `MobileNetV3  -  ${(confidence * 100).toFixed(0)}% confidence`
        : "Rule-based fallback"}
    </span>
  );
}

// ─── Backend Health Indicator ────────────────────────────────────────────────
function BackendStatus({ online }) {
  return (
    <div style={{
      display:      "flex",
      alignItems:   "center",
      gap:          6,
      fontSize:     11,
      opacity:      0.75,
      marginBottom: 10,
    }}>
      <span style={{
        width:        8,
        height:       8,
        borderRadius: "50%",
        background:   online ? "#10b981" : "#ef4444",
        flexShrink:   0,
      }} />
      <span>
        {online
          ? "MobileNetV3 backend online"
          : "Backend offline — using rule-based fallback"}
      </span>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function LayoutGenerator() {
  const nav = useNavigate();
  const previewRef = useRef(null);

  const [mode,          setMode]          = useState("mobile");
  const [draftPrompt,   setDraftPrompt]   = useState("A modern ecommerce mobile app, clean, minimal");
  const [appliedPrompt, setAppliedPrompt] = useState("A modern ecommerce mobile app, clean, minimal");
  const [seed,          setSeed]          = useState(1);
  const [mobileCount,   setMobileCount]   = useState(6);
  const [brandName,     setBrandName]     = useState("");

  // AI state
  const [spec,         setSpec]         = useState(null);
  const [isLoading,    setIsLoading]    = useState(false);
  const [aiSource,     setAiSource]     = useState(null);   // "mobilenetv3" | "rule_based_fallback"
  const [aiConfidence, setAiConfidence] = useState(null);
  const [backendOnline,setBackendOnline]= useState(null);   // null = checking

  // Palette is still generated client-side (fast, no need for backend)
  const palette = useMemo(() => {
    if (!appliedPrompt.trim())
      return ["#111827","#1F2937","#374151","#4B5563","#6B7280"];
    return generatePalette(appliedPrompt, seed);
  }, [appliedPrompt, seed]);

  // ── Check backend health on mount ──────────────────────────────────────────
  useEffect(() => {
    checkBackendHealth().then(online => setBackendOnline(online));
  }, []);

  // ── Generate layout via MobileNetV3 ────────────────────────────────────────
  const runGenerate = useCallback(async (prompt, currentMode, currentSeed, brand) => {
    setIsLoading(true);
    setSpec(null);

    try {
      let result;

      if (currentMode === "landing") {
        // Landing page uses landingAI.js (unchanged)
        const plan = generateLanding(prompt, currentSeed);
        result = {
          title:       "Landing Page Layout",
          brand:       brand,
          isEmpty:     false,
          mode:        "landing",
          plan,
          aiPredicted: false,
          source:      "landingAI",
        };
      } else {
        // Dashboard + Mobile → MobileNetV3
        result = await generateLayoutAI(
          prompt,
          currentMode,
          currentSeed,
          brand,
          (status) => {
            // Update backend status based on what was actually used
            if (status === "ai")       setBackendOnline(true);
            if (status === "fallback") setBackendOnline(false);
          }
        );
      }

      setSpec(result);
      setAiSource(result.source || null);
      setAiConfidence(result.confidence || null);

    } catch (err) {
      console.error("[LayoutGenerator] Generation error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Generate button ─────────────────────────────────────────────────────────
  const onGenerateLayout = () => {
    const next     = draftPrompt.trim();
    const nextSeed = seed + 1;
    setAppliedPrompt(next);
    setSeed(nextSeed);
    runGenerate(next, mode, nextSeed, brandName.trim());
  };
  const onDownloadPreview = async () => {
    try {
      const base = sanitizeFilename(`${mode}-${spec?.title || "layout"}`);
      await downloadNodeAsPng(previewRef.current, `${base}.png`);
    } catch (err) {
      console.error("[LayoutGenerator] Download failed:", err);
      alert("Could not download preview image.");
    }
  };

  const onDownloadMobileFrame = useCallback(async ({ element, screen }) => {
    try {
      const base = sanitizeFilename(`${screen || "screen"}-${seed}`);
      await downloadNodeAsPng(element, `${base}.png`);
    } catch (err) {
      console.error("[LayoutGenerator] Mobile screen download failed:", err);
      alert("Could not download this screen.");
    }
  }, [seed]);

  // Run generation when mode changes (if we have a prompt)
  useEffect(() => {
    if (appliedPrompt.trim()) {
      runGenerate(appliedPrompt, mode, seed, brandName.trim());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Initial generation on mount
  useEffect(() => {
    runGenerate(appliedPrompt, mode, seed, brandName.trim());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="layout-wrap">
      <div className="layout-container">

        <div className="layout-header">
          <h1>Layout Generator</h1>
          <p>AI-powered layouts using MobileNetV3.</p>
        </div>

        <div className="layout-grid">

          {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
          <div className="layout-glass">

            {/* Backend status */}
            {backendOnline !== null && <BackendStatus online={backendOnline} />}

            {/* Mode tabs */}
            <div className="mode-row">
              {["dashboard","landing","mobile"].map(m => (
                <button
                  key={m}
                  className={`mode-btn ${mode === m ? "active" : ""}`}
                  onClick={() => setMode(m)}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>

            {/* Mobile-only options */}
            {mode === "mobile" && (
              <>
                <label className="lg-label">Number of mobile screens</label>
                <select
                  className="lg-select"
                  value={mobileCount}
                  onChange={e => setMobileCount(Number(e.target.value))}
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={12}>12</option>
                </select>

                <label className="lg-label">App/Brand name (optional)</label>
                <input
                  className="lg-input"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. PayWave, ShopNest, FitPulse..."
                />
              </>
            )}

            {/* Prompt */}
            <label className="lg-label">Prompt</label>
            <textarea
              className="lg-textarea"
              rows={5}
              value={draftPrompt}
              onChange={e => setDraftPrompt(e.target.value)}
            />

            <button
              className="layout-generate"
              onClick={onGenerateLayout}
              disabled={isLoading}
            >
              {isLoading ? "Generating…" : "Generate Layout"}
            </button>

            {/* Palette swatches */}
            <div style={{ marginTop: 18 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontWeight: 800 }}>Palette Used</div>
                <span className="chip">Auto</span>
              </div>
              <div className="palette-row">
                {palette.map((c,i) => (
                  <div className="swatch" key={`${c}-${i}`} style={{ background: c }} />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <button className="switch-btn" onClick={() => nav("/smart-color")}>Go to Smart Color</button>
            <button className="switch-btn" onClick={() => nav("/")}>Go to Home</button>
          </div>

          {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
          <div className="layout-glass">

            <div className="preview-top">
              <div>
                <div style={{ fontSize:12, opacity:0.7 }}>Preview</div>
                <h3>{spec?.title || modeTitle(mode)}</h3>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                <button
                  type="button"
                  onClick={onDownloadPreview}
                  disabled={isLoading || !spec}
                  style={{
                    border: "1px solid rgba(255,255,255,0.22)",
                    background: "rgba(255,255,255,0.08)",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "6px 10px",
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: isLoading || !spec ? "not-allowed" : "pointer",
                    opacity: isLoading || !spec ? 0.55 : 1,
                  }}
                >
                  Download PNG
                </button>
                <span className="chip">{mode.toUpperCase()}</span>
                {spec && (
                  <AIBadge
                    status={!!spec}
                    confidence={aiConfidence}
                    source={aiSource}
                  />
                )}
              </div>
            </div>

            {/* AI prediction info */}
            {spec?.aiPredicted && spec.category && (
              <div style={{
                margin:       "8px 0 12px",
                padding:      "8px 12px",
                borderRadius: 12,
                background:   "rgba(255,255,255,0.04)",
                border:       "1px solid rgba(255,255,255,0.08)",
                fontSize:     11,
                opacity:      0.8,
              }}>
                Predicted: <strong>{spec.category}</strong>
                {spec.domain && <>  -  Domain: <strong>{spec.domain}</strong></>}
              </div>
            )}

            {/* Loading state */}
            {isLoading && (
              <div style={{
                display:        "flex",
                alignItems:     "center",
                justifyContent: "center",
                height:         260,
                flexDirection:  "column",
                gap:            14,
                opacity:        0.6,
              }}>
                <div style={{
                  width:        40,
                  height:       40,
                  borderRadius: "50%",
                  border:       "3px solid rgba(255,255,255,0.1)",
                  borderTop:    "3px solid #7b5cff",
                  animation:    "spin 0.8s linear infinite",
                }} />
                <span style={{ fontSize:13 }}>MobileNetV3 predicting layout…</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}

            {/* Preview render */}
            {!isLoading && spec && (
              <div ref={previewRef} style={{ marginTop: 10 }}>
                {mode === "mobile"    && <PhoneMock spec={spec} count={mobileCount} onFrameClick={onDownloadMobileFrame} />}
                {mode === "landing"   && <LandingMock  spec={spec} plan={spec.plan} />}
                {mode === "dashboard" && <DashboardFit palette={palette} spec={spec} />}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function modeTitle(mode) {
  return { dashboard:"Dashboard Layout", mobile:"Mobile App Layout", landing:"Landing Page Layout" }[mode] || "Layout";
}














