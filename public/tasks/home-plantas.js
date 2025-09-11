// ===== Guard de autenticación =====
(function guard(){
  const token = localStorage.getItem("token");
  if (!token) location.href = "login.html";
})();

// ===== Saludo con nombre y apellido =====
(function greet(){
  const el = document.getElementById("userName");
  const name = localStorage.getItem("userName"); // "Fabricio Augusto"
  if (el && name) el.textContent = name;
})();

// ===== Acciones rápidas =====
document.getElementById("cat-especies")?.addEventListener("click", ()=> toast("Catálogo (Plantas) — próximamente 🌿"));
document.getElementById("claves")?.addEventListener("click", ()=> toast("Claves morfológicas — próximamente 🔎"));
document.getElementById("fichas")?.addEventListener("click", ()=> toast("Fichas de plantas — próximamente 📄"));
document.getElementById("biblioteca")?.addEventListener("click", ()=> toast("Biblioteca de botánica — próximamente 📚"));

// ===== Sidebar utilidades =====
document.getElementById("link-plantas")?.addEventListener("click", (e)=> e.preventDefault());
document.getElementById("link-buscador")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Buscador avanzado — próximamente 🔍"); });
document.getElementById("link-notas")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Mis notas — próximamente 📝"); });
document.getElementById("link-favs")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Favoritos — próximamente ⭐"); });
document.getElementById("link-mapas")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Mapas — próximamente 🧭"); });
document.getElementById("link-comparador")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Comparador — próximamente 🧰"); });
document.getElementById("link-config")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Configuración — próximamente ⚙️"); });

// ===== Cambiar de home (ARRIBA DERECHA) =====
document.getElementById("switch")?.addEventListener("click", ()=> {
  location.href = "home-insectos.html";
});

// ===== Logout =====
document.getElementById("logout")?.addEventListener("click", ()=>{
  localStorage.removeItem("token");
  location.href = "index.html";
});

// ===== Buscador =====
document.getElementById("search")?.addEventListener("keydown", (e)=>{
  if (e.key === "Enter"){
    e.preventDefault();
    toast(`Buscar (Plantas): "${e.target.value}" — próximamente`);
  }
});

// ===== Toast helper =====
function toast(text, ok=true){
  const wrap = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast " + (ok ? "ok" : "err");
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(()=> el.remove(), 3500);
}
