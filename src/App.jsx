// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import SmartColor from "./pages/SmartColor.jsx";
import LayoutGenerator from "./pages/LayoutGenerator.jsx";
import Workspace from "./pages/Workspace.jsx";
import { isAuthed } from "./utils/auth.js";

function RequireAuth({ children }) {
  const authed = isAuthed();
  if (!authed) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      {/* HOME */}
      <Route path="/" element={<Home />} />

      {/* AUTH */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* PROTECTED PAGES */}
      <Route
        path="/workspace"
        element={
          <RequireAuth>
            <Workspace />
          </RequireAuth>
        }
      />
      <Route
        path="/smart-color"
        element={
          <RequireAuth>
            <SmartColor />
          </RequireAuth>
        }
      />
      <Route
        path="/layout"
        element={
          <RequireAuth>
            <LayoutGenerator />
          </RequireAuth>
        }
      />

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
