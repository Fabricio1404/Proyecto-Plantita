// Guardia básica: si no hay token, mandamos al login
(function guard(){
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "login.html";
  }
})();

// Mostrar nombre si lo guardaste en el login
(function greet(){
  const el = document.getElementById("userName");
  const name = localStorage.getItem("userName");
  if (el && name) el.textContent = name.split(" ")[0]; // muestra el primer nombre
})();

// Navegación de accesos rápidos (por ahora placeholders)
document.getElementById("goPlantas")?.addEventListener("click", ()=>{
  toast("Módulo Plantas: próximamente 🌿");
});
document.getElementById("goInsectos")?.addEventListener("click", ()=>{
  toast("Módulo Insectos: próximamente 🐞");
});
document.getElementById("goBiblioteca")?.addEventListener("click", ()=>{
  toast("Biblioteca: próximamente 📚");
});
document.getElementById("goPerfil")?.addEventListener("click", ()=>{
  toast("Perfil: próximamente 👤");
});

document.getElementById("newNote")?.addEventListener("click", ()=>{
  toast("Nota rápida: próximamente ✍️");
});

// Logout
document.getElementById("logout")?.addEventListener("click", ()=>{
  localStorage.removeItem("token");
  // si guardaste también userName/email:
  // localStorage.removeItem("userName");
  // localStorage.removeItem("userEmail");
  location.href = "index.html";
});

// Buscador (placeholder)
document.getElementById("search")?.addEventListener("keydown", (e)=>{
  if (e.key === "Enter"){
    e.preventDefault();
    toast(`Buscar: "${e.target.value}" (próximamente)`);
  }
});

// Toast helper
function toast(text, ok=true){
  const wrap = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast " + (ok ? "ok" : "err");
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(()=> el.remove(), 3500);
}
