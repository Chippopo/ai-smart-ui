import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/auth.js";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [pw, setPw] = useState("");
    const [err, setErr] = useState("");
    const [offline, setOffline] = useState(false);
    const [loading, setLoading] = useState(false);

    const nav = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        setErr("");
        setOffline(false);
        setLoading(true);
        const res = await registerUser({ name, email, password: pw });
        setLoading(false);
        if (!res.ok) {
            setErr(res.message);
            setOffline(!!res.offline);
            return;
        }
        nav("/login", { replace: true, state: { registered: true, email: email.trim().toLowerCase() } });
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h2>Register</h2>
                <p className="auth-sub">Create an account to continue.</p>

                {offline && <div className="auth-error" style={styles.offlineMsg}>Backend offline. Start the server to register.</div>}
                {err && <div className="auth-error">{err}</div>}

                <form onSubmit={onSubmit}>
                    <label>Full name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />

                    <label>Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} />

                    <label>Password</label>
                    <input
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                    />

                    <button className="auth-primary" type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Register"}
                    </button>
                </form>

                <div className="auth-foot">
                    Already have an account? <Link to="/login">Login</Link>
                </div>
            </div>
        </div>
    );
}

const styles = {
    offlineMsg: {
        background: "rgba(251,191,36,.18)",
        border: "1px solid rgba(251,191,36,.35)",
        color: "#fcd34d"
    }
};
