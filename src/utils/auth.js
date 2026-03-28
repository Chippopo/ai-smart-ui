const TOKEN_KEY = "auth_token";
const CURRENT_USER_KEY = "current_user";
const API_BASE = import.meta.env.VITE_AUTH_API || "http://localhost:5000";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

async function postJson(path, payload) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload || {}),
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function registerUser({ name, email, password }) {
  const safeName = String(name || "").trim();
  const safeEmail = normalizeEmail(email);
  const safePassword = String(password || "");

  if (!safeName || !safeEmail || !safePassword) {
    return { ok: false, message: "Fill all fields." };
  }

  try {
    const res = await postJson("/auth/register", {
      name: safeName,
      email: safeEmail,
      password: safePassword,
    });
    if (res.status === 0 || res.status === 502 || res.status === 503) {
      return { ok: false, offline: true, message: "Backend offline. Please start the server." };
    }
    if (!res.ok) {
      return { ok: false, message: res.data?.message || "Registration failed." };
    }
    return { ok: true, user: res.data?.user || { name: safeName, email: safeEmail } };
  } catch (err) {
    return { ok: false, offline: true, message: err?.message || "Backend unavailable." };
  }
}

export async function loginUser({ email, password }) {
  const safeEmail = normalizeEmail(email);
  const safePassword = String(password || "");
  if (!safeEmail || !safePassword) {
    return { ok: false, message: "Please fill all fields." };
  }

  try {
    const res = await postJson("/auth/login", { email: safeEmail, password: safePassword });
    if (res.status === 0 || res.status === 502 || res.status === 503) {
      return { ok: false, offline: true, message: "Backend offline. Please start the server." };
    }
    if (!res.ok) {
      return { ok: false, message: res.data?.message || "Login failed." };
    }
    const user = res.data?.user || { name: safeEmail.split("@")[0], email: safeEmail };
    localStorage.setItem(TOKEN_KEY, "ok");
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { ok: true, user };
  } catch (err) {
    return { ok: false, message: err?.message || "Backend unavailable." };
  }
}

export function isAuthed() {
  return localStorage.getItem(TOKEN_KEY) === "ok";
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutUser() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}
