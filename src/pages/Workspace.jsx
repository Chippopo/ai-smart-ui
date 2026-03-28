import React from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/auth.js";

export default function Workspace() {
  const nav = useNavigate();
  const user = getCurrentUser();

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-top">
          <div>
            <div className="workspace-kicker">Welcome</div>
            <h1>{user?.name ? `${user.name}, choose what to generate` : "Choose what to generate"}</h1>
          </div>
          <button
            className="workspace-logout"
            onClick={() => {
              logoutUser();
              nav("/login", { replace: true });
            }}
          >
            Logout
          </button>
        </div>

        <p className="workspace-sub">
          Start with one generator. Each page is optimized for UI design decisions and practical output.
        </p>

        <div className="workspace-grid">
          <article className="workspace-card">
            <h3>Smart Color</h3>
            <p>
              Generates palettes from your target, style, industry, and tone. Includes color analysis and accessibility
              checks.
            </p>
            <button className="workspace-btn" onClick={() => nav("/smart-color")}>
              Open Smart Color
            </button>
          </article>

          <article className="workspace-card">
            <h3>Layout Generator</h3>
            <p>
              Builds layout direction based on UX structure and product context so you can move from idea to wireframe
              faster.
            </p>
            <button className="workspace-btn" onClick={() => nav("/layout")}>
              Open Layout Generator
            </button>
          </article>
        </div>
      </div>
    </div>
  );
}
