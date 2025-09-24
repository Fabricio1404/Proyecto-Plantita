// ====== Config ======
const API_BASE =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : location.origin;

const container = document.getElementById("container");
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const linkToSignUp = document.getElementById("linkToSignUp");
const linkToSignIn = document.getElementById("linkToSignIn");

function openSignup() {
  container?.classList.add("right-panel-active");
  if (location.hash !== "#signup") history.replaceState(null, "", "#signup");
}
function openSignin() {
  container?.classList.remove("right-panel-active");
  if (location.hash) history.replaceState(null, "", " ");
}
signUpBtn?.addEventListener("click", openSignup);
signInBtn?.addEventListener("click", openSignin);
linkToSignUp?.addEventListener("click", e => { e.preventDefault(); openSignup(); });
linkToSignIn?.addEventListener("click", e => { e.preventDefault(); openSignin(); });

// Activar registro si viene ?mode=signup o #signup
(function initMode() {
  const params = new URLSearchParams(location.search);
  if (params.get("mode") === "signup" || location.hash === "#signup") openSignup();
})();

// ====== Toast helpers ======
function ensureToastWrap() {
  let w = document.querySelector(".toast-wrap");
  if (!w) { w = document.createElement("div"); w.className = "toast-wrap"; document.body.appendChild(w); }
  return w;
}
function toast(msg, type = "ok", timeout = 2000) {
  const wrap = ensureToastWrap();
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(-8px)"; }, timeout);
  setTimeout(() => { el.remove(); }, timeout + 250);
}

// ====== Auth helpers ======
function setToken(t) { try { localStorage.setItem("token", t); } catch {} }
function getToken() { try { return localStorage.getItem("token"); } catch { return null; } }
function clearToken() { try { localStorage.removeItem("token"); } catch {} }

// ⬇️ Cambio mínimo: incluir credenciales para la cookie httpOnly del backend
async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",              // ⬅️ importante para login con cookie
    ...opts,
    headers
  });

  let data = {};
  try { data = await res.json(); } catch (e) {}
  if (!res.ok) throw data;
  return data;
}

// ====== Registro ======
const signupForm = document.getElementById("signupForm");
const signupFirst = document.getElementById("signup-firstname");
const signupLast = document.getElementById("signup-lastname");
const signupUser = document.getElementById("signup-username");
const signupEmail = document.getElementById("signup-email");
const signupPass = document.getElementById("signup-password");

const signupFirstErr = document.getElementById("signup-firstname-error");
const signupLastErr  = document.getElementById("signup-lastname-error");
const signupUserErr  = document.getElementById("signup-username-error");
const signupEmailErr = document.getElementById("signup-email-error");
const signupPassErr  = document.getElementById("signup-password-error");

function clearSignupErrors() {
  [signupFirstErr, signupLastErr, signupUserErr, signupEmailErr, signupPassErr].forEach(el => { if (el) el.textContent = ""; });
}

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); clearSignupErrors();
  const body = {
    profile: {
      first_name: (signupFirst?.value || "").trim(),
      last_name:  (signupLast?.value || "").trim(),
    },
    username: (signupUser?.value || "").trim(),
    email:    (signupEmail?.value || "").trim().toLowerCase(),
    password: signupPass?.value || ""
  };
  try {
  const data = await api("/api/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // ✅ considerar éxito solo si vino un ID
  const newUserId = data?.user?.id || data?.user?._id;
  if (!newUserId) {
    toast("El servidor no devolvió ID de usuario. Revisa el backend.", "err");
    return;
  }

  toast(`Registro exitoso. ¡Bienvenido/a, ${data.user?.username || body.username}!`, "ok");
  if (data.token) setToken(data.token);
  if (data.user?.username) localStorage.setItem("userName", data.user.username);

  setTimeout(() => { window.location.href = "selector.html"; }, 1000);
} catch (err) {
  const first = err?.errors?.[0];
  const msg = err?.msg || err?.message || first?.msg || "Error en el registro";
  const path = first?.path || "";
  if (path.includes("profile.first_name")) signupFirstErr.textContent = first.msg;
  else if (path.includes("profile.last_name")) signupLastErr.textContent = first.msg;
  else if (path === "username") signupUserErr.textContent = first.msg;
  else if (path === "email") signupEmailErr.textContent = first.msg;
  else if (path === "password") signupPassErr.textContent = first.msg;
  else signupPassErr.textContent = msg;
  toast(msg, "err");
}
});  console.log(`🚀 Server running on http://localhost:${PORT}`);

// ====== Login ======
const signinForm = document.getElementById("signinForm");
const signinUserOrEmail = document.getElementById("signin-email"); // campo "Usuario o Email"
const signinPass = document.getElementById("signin-password");
const signinEmailErr = document.getElementById("signin-email-error");
const signinPassErr = document.getElementById("signin-password-error");
const signinGlobalMsg = document.getElementById("signin-global-msg");

function clearSigninErrors() {
  [signinEmailErr, signinPassErr, signinGlobalMsg].forEach(el => { if (el) { el.textContent = ""; el.className = "msg"; } });
}

signinForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); clearSigninErrors();
  const val = (signinUserOrEmail?.value || "").trim();
  const body = val.includes("@")
    ? { email: val.toLowerCase(), password: signinPass?.value || "" }
    : { username: val, password: signinPass?.value || "" };

  try {
    const data = await api("/api/login", { method: "POST", body: JSON.stringify(body) });

    // Guarda si viene token y nombre (no es obligatorio para redirigir)
    if (data.token) setToken(data.token);
    if (data.user?.username) localStorage.setItem("userName", data.user.username);

    toast("Sesión iniciada correctamente", "ok");
    // Redirigir siempre al éxito del login
    setTimeout(() => { window.location.href = "selector.html"; }, 900);
  } catch (err) {
    const msg = err?.msg || err?.message || "Credenciales inválidas";
    if (signinGlobalMsg) { signinGlobalMsg.textContent = msg; signinGlobalMsg.className = "msg error"; }
    toast(msg, "err");
  }
});
