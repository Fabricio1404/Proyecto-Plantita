// Redirige si NO hay token (protege esta página)
(function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) location.href = "./login.html";
})();

document.getElementById("card-plants")?.addEventListener("click", () => {
  location.href = "./home-plantas.html";
});
document.getElementById("card-insects")?.addEventListener("click", () => {
  location.href = "./home-insectos.html";
});

document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "./login.html";
});
