(function guard(){
  const token = localStorage.getItem("token");
  if (!token) location.href = "login.html";
})();

(function greet(){
  const el = document.getElementById("userName");
  const name = localStorage.getItem("userName");
  if (el && name) el.textContent = name;
})();

document.getElementById("cat-insectos")?.addEventListener("click", ()=> toast("Catálogo (Insectos) — próximamente 🐞"));
document.getElementById("biologia")?.addEventListener("click", ()=> toast("Ciclos biológicos — próximamente 🔄"));
document.getElementById("plagas")?.addEventListener("click", ()=> toast("Plagas y control — próximamente 🛡️"));
document.getElementById("biblioteca")?.addEventListener("click", ()=> toast("Biblioteca de entomología — próximamente 📚"));

document.getElementById("link-insectos")?.addEventListener("click", (e)=> e.preventDefault());
document.getElementById("link-buscador")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Buscador avanzado — próximamente 🔍"); });
document.getElementById("link-notas")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Mis notas — próximamente 📝"); });
document.getElementById("link-favs")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Favoritos — próximamente ⭐"); });
document.getElementById("link-mapas")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Mapas — próximamente 🧭"); });
document.getElementById("link-comparador")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Comparador — próximamente 🧰"); });
document.getElementById("link-config")?.addEventListener("click", (e)=>{ e.preventDefault(); toast("Configuración — próximamente ⚙️"); });

document.getElementById("switch")?.addEventListener("click", ()=> {
  location.href = "home-plantas.html";
});

document.getElementById("logout")?.addEventListener("click", ()=>{
  localStorage.removeItem("token");
  location.href = "index.html";
});

document.getElementById("search")?.addEventListener("keydown", (e)=>{
  if (e.key === "Enter"){
    e.preventDefault();
    toast(`Buscar (Insectos): "${e.target.value}" — próximamente`);
  }
});

function toast(text, ok=true){
  const wrap = document.getElementById("toasts");
  const el = document.createElement("div");
  el.className = "toast " + (ok ? "ok" : "err");
  el.textContent = text;
  wrap.appendChild(el);
  setTimeout(()=> el.remove(), 3500);
}
