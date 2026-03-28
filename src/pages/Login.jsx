import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAuthed, loginUser } from "../utils/auth.js";

export default function Login() {
    const nav = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [offline, setOffline] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAuthed()) {
            nav("/workspace", { replace: true });
        }
    }, [nav]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");
        setOffline(false);
        setLoading(true);
        const res = await loginUser({ email, password });
        setLoading(false);
        if (!res.ok) {
            setErr(res.message);
            setOffline(!!res.offline);
            return;
        }
        nav("/workspace", { replace: true });
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome Back</h2>
                {location.state?.registered ? <p style={styles.okMsg}>Registration successful. Please login.</p> : null}
                {offline ? <p style={styles.offlineMsg}>Backend offline. Start the server to login.</p> : null}
                {err ? <p style={styles.errMsg}>{err}</p> : null}

                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        style={styles.input}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input
                        style={styles.input}
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button style={styles.button} disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{" "}
                    <span style={styles.link} onClick={() => nav("/register")}>
                        Register
                    </span>
                </p>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
            "linear-gradient(180deg,#060A12,#0B1220)",
        color: "#fff"
    },

    card: {
        width: "340px",
        padding: "40px",
        borderRadius: "22px",
        background: "rgba(255,255,255,.06)",
        backdropFilter: "blur(18px)",
        border: "1px solid rgba(255,255,255,.12)",
        boxShadow: "0 25px 70px rgba(0,0,0,.55)",
        textAlign: "center"
    },

    title: {
        marginBottom: "20px",
        fontWeight: 700
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },

    input: {
        padding: "14px",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,.15)",
        background: "rgba(0,0,0,.35)",
        color: "#fff",
        outline: "none"
    },

    button: {
        marginTop: "10px",
        padding: "14px",
        borderRadius: "30px",
        border: "none",
        fontWeight: 600,
        color: "#fff",
        cursor: "pointer",
        background:
            "linear-gradient(135deg,#ff4ecd,#7b5cff)"
    },

    footer: {
        marginTop: "18px",
        fontSize: "14px",
        opacity: ".85"
    },
    okMsg: {
        marginBottom: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: "rgba(16,185,129,.18)",
        border: "1px solid rgba(16,185,129,.35)",
        fontSize: "13px"
    },
    errMsg: {
        marginBottom: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: "rgba(255,99,132,.18)",
        border: "1px solid rgba(255,99,132,.35)",
        fontSize: "13px"
    },
    offlineMsg: {
        marginBottom: "10px",
        padding: "10px 12px",
        borderRadius: "10px",
        background: "rgba(251,191,36,.18)",
        border: "1px solid rgba(251,191,36,.35)",
        color: "#fcd34d",
        fontSize: "13px"
    },

    link: {
        color: "#c084fc",
        cursor: "pointer",
        fontWeight: 600
    }
};
