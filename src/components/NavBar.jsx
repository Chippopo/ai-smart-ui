import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark sticky-top nav-glass">
            <div className="container py-2">
                <NavLink className="navbar-brand d-flex align-items-center gap-2" to="/">
                    <span className="logo-dot" />
                    <span className="fw-semibold">AI Smart UI</span>
                </NavLink>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#nav"
                    aria-controls="nav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="nav">
                    <div className="navbar-nav ms-auto gap-2">
                        <NavLink className="nav-link px-3 rounded-pill" to="/">
                            Home
                        </NavLink>
                        <NavLink className="nav-link px-3 rounded-pill" to="/smart-color">
                            Smart Color
                        </NavLink>
                        <NavLink className="nav-link px-3 rounded-pill" to="/layout">
                            Layout
                        </NavLink>
                    </div>
                </div>
            </div>
        </nav>
    );
}