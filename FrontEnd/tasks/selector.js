// Redirige si NO hay token (protege esta página)
(function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) location.href = "./login.html";
})();

// ===== Imágenes aleatorias por tarjeta =====
const plantImages = [
  "./img/selector/planta1.jpg",
  "./img/selector/planta2.jpg",
  "./img/selector/planta3.jpg",
  "./img/selector/planta4.jpg",
  "./img/selector/planta5.jpg",

];

const insectImages = [
  "./img/selector/insecto1.jpg",
  "./img/selector/insecto2.jpg",
  "./img/selector/insecto3.jpg",
  "./img/selector/insecto4.jpg",
  "./img/selector/insecto5.jpg",
];

function getRandomImage(images) {
  return images[Math.floor(Math.random() * images.length)];
}

// Asignar imágenes al cargar
const imgPlants = document.getElementById("img-plants");
const imgInsects = document.getElementById("img-insects");

if (imgPlants) imgPlants.style.backgroundImage = `url('${getRandomImage(plantImages)}')`;
if (imgInsects) imgInsects.style.backgroundImage = `url('${getRandomImage(insectImages)}')`;

// ===== Navegación =====
document.getElementById("card-plants")?.addEventListener("click", () => {
  location.href = "./home-plantas.html";
});
document.getElementById("card-insects")?.addEventListener("click", () => {
  location.href = "./home-insectos.html";
});

// ===== Logout =====
document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "./login.html";
});
