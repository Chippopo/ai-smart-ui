// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

function isAuthed() {
  return localStorage.getItem("auth_token") === "ok";
}

export default function Home() {
  const nav = useNavigate();

  const goProtected = (path) => {
    if (!isAuthed()) {
      nav("/login", { state: { from: path } });
      return;
    }
    nav(path);
  };

  return (
    <div className="home-body">
      <div className="main-bg">
        <video
          className="bg-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          {/* IMPORTANT: encode spaces */}
          <source src="Untitled design - Trim.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="video-overlay" />
        <div className="cut-notch" />

        <div className="auth-buttons">
          <button className="login-btn" onClick={() => nav("/login")}>
            Login
          </button>
          <button className="register-btn" onClick={() => nav("/register")}>
            Register
          </button>
        </div>

        <header>
          <div className="logo">AI ColorSense</div>
        </header>

        <section className="hero">
          <div className="hero-text">
            <h1>
              Design smarter with{" "}
              <span>AI-powered color & layout</span> intelligence
            </h1>
            <p>
              An intelligent UI assistant that analyzes your design goals and
              instantly recommends perfect color palettes and layout structures.
            </p>

            <div className="cta-buttons">
              <button
                className="btn-primary"
                onClick={() => goProtected("/smart-color")}
              >
                Generate Color
              </button>
              <button
                className="btn-secondary"
                onClick={() => goProtected("/layout")}
              >
                Generate Layout
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3>What this AI does</h3>
            <div className="feature">
              Suggests harmonious color palettes using AI analysis
            </div>
            <div className="feature">
              Recommends layout patterns based on UX principles
            </div>
            <div className="feature">
              Adapts designs for web, mobile, and dashboards
            </div>
            <div className="feature">
              Helps designers work faster with consistency
            </div>
          </div>
        </section>

        <footer>© 2026 AI Smart Color & Layout Recommender</footer>
      </div>
    </div>
  );
}