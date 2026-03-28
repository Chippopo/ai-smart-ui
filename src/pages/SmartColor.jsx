import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildSmartColorResultFromBase } from "../utils/colorGen.js";
import { requestLegacyPalette } from "../utils/legacyColorApi.js";
import "../smartcolor.css";

function copyToClipboard(text) {
  if (!text) return;
  navigator.clipboard?.writeText(text).catch(() => {});
}

const LAYOUT_TARGETS = ["website", "mobile"];
const LAYOUT_STYLES = ["z-shape", "f-shape", "wireframe", "card-grid", "grid", "single-column"];
const EMOTIONS = ["professional", "playful", "minimalist"];
const INDUSTRIES = ["healthcare", "finance", "education", "ecommerce", "crypto"];

const DEFAULT_FORM = {
  layout_target: "website",
  layout_style: "z-shape",
  industry: "healthcare",
  emotion: "professional",
};

export default function SmartColor() {
  const nav = useNavigate();
  const [draft, setDraft] = useState(DEFAULT_FORM);
  const [applied, setApplied] = useState(DEFAULT_FORM);
  const [seed, setSeed] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resolveColorApiUrl = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return "http://127.0.0.1:8000/generate-palette";
    try {
      const url = new URL(raw);
      if (!url.pathname || url.pathname === "/") {
        url.pathname = "/generate-palette";
      }
      return url.toString();
    } catch {
      return raw;
    }
  };

  const [apiUrl, setApiUrl] = useState(
    resolveColorApiUrl(
      import.meta.env.VITE_COLOR_API ||
      import.meta.env.VITE_COLOR_API_URL ||
      "http://127.0.0.1:8000/generate-palette"
    )
  );
  const [backendExplanations, setBackendExplanations] = useState([]);

  const runModelApi = async (formInput) => {
    setLoading(true);
    setError("");
    try {
      const response = await requestLegacyPalette({
        industry: formInput.industry,
        emotion: formInput.emotion,
        endpoint: apiUrl,
      });

      setResult(buildSmartColorResultFromBase(formInput, response.palette, "cnn-api"));
      setBackendExplanations(response.explanations);
      setSeed((s) => s + 1);
    } catch (err) {
      setError(err?.message || "Failed to generate palette from API.");
    } finally {
      setLoading(false);
    }
  };

  const onGenerate = async () => {
    const next = {
      ...draft,
      industry: draft.industry.trim().toLowerCase(),
    };
    if (!next.industry) {
      setError("Industry is required.");
      return;
    }
    setApplied(next);
    await runModelApi(next);
  };

  const onRegenerate = async () => {
    if (!applied.industry.trim()) return;
    await runModelApi(applied);
  };

  const onClear = () => {
    setDraft(DEFAULT_FORM);
    setApplied(DEFAULT_FORM);
    setResult(null);
    setBackendExplanations([]);
    setError("");
  };

  return (
    <div className="smartcolor-page">
      <div className="sc-top-actions">
        <button className="sc-navbtn" onClick={() => nav("/")}>
          Go Home
        </button>
        <button className="sc-navbtn sc-navbtn-primary" onClick={() => nav("/layout")}>
          Go to Layout Generator
        </button>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-xl-4">
            <h2 className="fw-bold">Smart Color (Model API)</h2>
            <p className="text-secondary mb-3">Uses your existing backend endpoint from the final-year project API.</p>

            <div className="smartcard p-3">
              <label className="form-label text-secondary small">API URL</label>
              <input
                className="form-control input-dark"
                value={apiUrl}
                // onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000/generate-palette"
              />

              <label className="form-label text-secondary small mt-3">Layout Target</label>
              <select
                className="form-select input-dark"
                value={draft.layout_target}
                onChange={(e) => setDraft((d) => ({ ...d, layout_target: e.target.value }))}
              >
                {LAYOUT_TARGETS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              {/* <label className="form-label text-secondary small mt-3">Layout Style</label>
              <select
                className="form-select input-dark"
                value={draft.layout_style}
                onChange={(e) => setDraft((d) => ({ ...d, layout_style: e.target.value }))}
              >
                {LAYOUT_STYLES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select> */}

              <label className="form-label text-secondary small mt-3">Industry</label>
              <input
                className="form-select input-dark"
                value={draft.industry}
                onChange={(e) => setDraft((d) => ({ ...d, industry: e.target.value }))}
              >
                {/* {INDUSTRIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))} */}
              </input>

              <label className="form-label text-secondary small mt-3">Emotion</label>
              <select
                className="form-select input-dark"
                value={draft.emotion}
                onChange={(e) => setDraft((d) => ({ ...d, emotion: e.target.value }))}
              >
                {EMOTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <div className="d-grid gap-2 mt-3">
                <button className="btn btn-primary btn-lg" onClick={onGenerate} disabled={loading}>
                  {loading ? "Generating..." : "Generate Palette"}
                </button>
                <button className="btn btn-outline-light btn-lg" onClick={onRegenerate} disabled={loading || !result}>
                  Regenerate
                </button>
                <button className="btn btn-outline-light btn-lg" onClick={onClear} disabled={loading}>
                  Clear
                </button>
              </div>

              {error ? <div className="auth-error mt-3">{error}</div> : null}
            </div>
          </div>

          <div className="col-xl-8">
            <div className="smartcard p-4">
              {!result ? (
                <div className="text-secondary">Pick industry/emotion and click Generate Palette.</div>
              ) : (
                <>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                      <div className="text-secondary small">Generated for</div>
                      <div className="h5 mb-0 text-capitalize">
                        {result.input.industry} / {result.input.layout_target} / {result.input.layout_style}
                      </div>
                    </div>
                    <span className="chip">Variant #{seed}</span>
                  </div>

                  <div className="sc-candidate-grid">
                    <div className="sc-candidate-card">
                      <div className="fw-semibold mb-2">Generated Palette</div>
                      <div className="sc-swatch-row mt-3">
                        {Object.entries(result.palette).map(([role, hex]) => (
                          <div key={role} className="sc-swatch-wrap">
                            <div className="sc-swatch" style={{ backgroundColor: hex }} title={`${role}: ${hex}`} />
                            <div className="sc-role text-capitalize">{role}</div>
                            <div className="sc-hex">{hex}</div>
                          </div>
                        ))}
                      </div>

                      <div className="sc-wcag mt-3">
                        <div>Text/Neutral: {result.wcag.text_on_neutral.ratio}</div>
                        <div>Text/Primary: {result.wcag.text_on_primary.ratio}</div>
                        <div>Accent/Neutral: {result.wcag.accent_on_neutral.ratio}</div>
                      </div>

                      <button
                        className="btn btn-outline-light btn-sm mt-3"
                        onClick={() =>
                          copyToClipboard(
                            Object.entries(result.palette)
                              .map(([role, hex]) => `--${role}: ${hex};`)
                              .join("\n")
                          )
                        }
                      >
                        Copy CSS Variables
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="h6 mb-2">Psychological & Industry Analysis</div>

                    <div className="mt-3">
                      {result.interpretations.map((item) => (
                        <div key={`${item.role}-${item.color}`} className="sc-analysis-item">
                          <strong className="text-capitalize">{item.role}</strong>: <span className="text-uppercase">{item.category}</span> ({item.color}) - {item.tailored_reason}
                        </div>
                      ))}
                    </div>

                    {backendExplanations.length ? (
                      <div className="mt-3">
                        {backendExplanations.map((text, idx) => (
                          <div key={`${idx}-${text}`} className="sc-analysis-item">- {text}</div>
                        ))}
                      </div>
                    ) : null}

                    <div className="sc-summary mt-3">{result.summary}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

