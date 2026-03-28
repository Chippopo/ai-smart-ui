import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function isAuthed() {
    return localStorage.getItem("auth_token") === "ok";
}

export default function ProtectedRoute({ children }) {
    const location = useLocation();

    if (!isAuthed()) {
        return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    }

    return children;
}