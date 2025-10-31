// Determina la URL base de la API
const API_BASE =
  localStorage.getItem("API_BACK") ||
  ((location.hostname === "localhost" || location.hostname === "127.0.0.1")
    ? "http://localhost:4000"
    : location.origin);

const container = document.getElementById("container");
const signUpBtn = document.getElementById("signUp");
const signInBtn = document.getElementById("signIn");
const linkToSignUp = document.getElementById("linkToSignUp");
const linkToSignIn = document.getElementById("linkToSignIn");

// Funciones para animar el panel de Login/Registro
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

// Activar registro si la URL lo indica
(function initMode() {
  const params = new URLSearchParams(location.search);
  if (params.get("mode") === "signup" || location.hash === "#signup") openSignup();
})();

// --- Helpers de UI ---
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

// --- Helpers de Autenticación ---
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
  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: "include"
  });
  let data = {};
  try { data = await res.json(); } catch (e) { }
  if (!res.ok) throw data;
  return data;
}

// --- Manejador de Registro ---
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
const signupGlobalErr = document.getElementById("signup-global-error");

function clearSignupErrors() {
  [signupFirstErr, signupLastErr, signupUserErr, signupEmailErr, signupPassErr, signupGlobalErr].forEach(el => { if (el) el.textContent = ""; });
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
    const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify(body) });
    
    toast(data.msg || "Registro exitoso. Inicia sesión.", "ok");

    setTimeout(() => {
      openSignin(); 
    }, 1000); 

  } catch (err) {
    const first = err?.errors?.[0];
    const msg = err?.msg || err?.message || first?.msg || "Error en el registro";
    const path = first?.path || "";
    
    toast(msg, "err");

    // Asigna el mensaje de error al campo correspondiente
    switch (path) {
      case 'profile.first_name':
        signupFirstErr.textContent = msg;
        break;
      case 'profile.last_name':
        signupLastErr.textContent = msg;
        break;
      case 'username':
        signupUserErr.textContent = msg;
        break;
      case 'email':
        signupEmailErr.textContent = msg;
        break;
      case 'password':
        signupPassErr.textContent = msg;
        break;
      default:
        signupGlobalErr.textContent = msg;
    }
  }
});


// --- Manejador de Login ---
const signinForm = document.getElementById("signinForm");
const signinUserOrEmail = document.getElementById("signin-email"); 
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
  
  // Permite iniciar sesión con email o username
  const body = val.includes("@")
    ? { email: val.toLowerCase(), password: signinPass?.value || "" }
    : { username: val, password: signinPass?.value || "" };

  try {
    const data = await api("/api/auth/login", { method: "POST", body: JSON.stringify(body) });

    if (data.token) setToken(data.token);

    // Guarda datos del usuario en localStorage para usarlos en otras páginas
    const displayName =
      (data.user?.profile?.first_name) ||
      (data.user?.username) ||
      body.username ||
      "Usuario";

    localStorage.setItem("displayName", displayName);
    localStorage.setItem("userName", displayName);
    localStorage.setItem('uid', data.user.uid);
    localStorage.setItem('rol', data.user.rol);
    if (data.user.configuracion) {
        localStorage.setItem('configuracion', JSON.stringify(data.user.configuracion));
    }

    toast("Sesión iniciada correctamente", "ok");
    setTimeout(() => { window.location.href = "selector.html"; }, 900);
  } catch (err) {
    const msg = err?.msg || err?.message || "Credenciales inválidas";
    signinGlobalMsg.textContent = msg; signinGlobalMsg.className = "msg error";
    toast(msg, "err");
  }
});