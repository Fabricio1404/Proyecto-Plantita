// ====== Config ======
// Si estamos en localhost, apuntamos a la API en :3000; si no, mismo origen.
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
function setToken(t) { localStorage.setItem("token", t); }
function getToken() { return localStorage.getItem("token"); }
function clearToken() { localStorage.removeItem("token"); }

async function api(path, opts = {}) {
  const headers = opts.headers || {};
  if (!headers["Content-Type"] && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  let data = {};
  try { data = await res.json(); } catch (e) { }
  if (!res.ok) throw data;
  return data;
}

// ====== Registro ======
const signupForm = document.getElementById("signupForm");
const signupName = document.getElementById("signup-name");
const signupEmail = document.getElementById("signup-email");
const signupPass = document.getElementById("signup-password");

const signupNameErr = document.getElementById("signup-name-error");
const signupEmailErr = document.getElementById("signup-email-error");
const signupPassErr = document.getElementById("signup-password-error");
function clearSignupErrors() {
  [signupNameErr, signupEmailErr, signupPassErr].forEach(el => { if (el) el.textContent = ""; });
}

signupForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); clearSignupErrors();
  const body = {
    username: (signupName?.value || "").trim(),
    email: (signupEmail?.value || "").trim().toLowerCase(),
    password: signupPass?.value || ""
  };
  try {
    const data = await api("/api/users/register", { method: "POST", body: JSON.stringify(body) });
    toast(`Registro exitoso. ¡Bienvenido/a, ${data.name}!`, "ok");
    // si devolvés token en register, guardalo:
    if (data.token) setToken(data.token);
    localStorage.setItem("userName", data.name || body.name);
    setTimeout(() => { window.location.href = "selector.html"; }, 1200);
  } catch (err) {
    const first = err?.errors?.[0];
    const msg = err?.message || first?.msg || "Error en el registro";
    if (first?.path === "name") signupNameErr.textContent = first.msg;
    else if (first?.path === "email") signupEmailErr.textContent = first.msg;
    else if (first?.path === "password") signupPassErr.textContent = first.msg;
    else signupPassErr.textContent = msg;
    toast(msg, "err");
  }
});

// ====== Login ======
const signinForm = document.getElementById("signinForm");
const signinEmail = document.getElementById("signin-email");
const signinPass = document.getElementById("signin-password");
const signinEmailErr = document.getElementById("signin-email-error");
const signinPassErr = document.getElementById("signin-password-error");
const signinGlobalMsg = document.getElementById("signin-global-msg");
function clearSigninErrors() {
  [signinEmailErr, signinPassErr, signinGlobalMsg].forEach(el => { if (el) { el.textContent = ""; el.className = "msg"; } });
}

signinForm?.addEventListener("submit", async (e) => {
  e.preventDefault(); clearSigninErrors();
  const body = {
    email: (signinEmail?.value || "").trim().toLowerCase(),
    password: signinPass?.value || ""
  };
  try {
    const data = await api("/api/users/login", { method: "POST", body: JSON.stringify(body) });
    if (data.token) setToken(data.token);
    if (data.user?.name) localStorage.setItem("userName", data.user.name);
    toast("Sesión iniciada correctamente", "ok");
    setTimeout(() => { window.location.href = "selector.html"; }, 900);
  } catch (err) {
    const msg = err?.message || "Credenciales inválidas";
    signinGlobalMsg.textContent = msg; signinGlobalMsg.className = "msg error";
    toast(msg, "err");
  }
});
