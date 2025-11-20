// Protege la página: redirige si no hay token
(function requireAuth() { const token = localStorage.getItem("token"); if (!token) location.href = "./auth.html"; })();

// Imágenes aleatorias por tarjeta
const plantImages = [
  "./assets/img/selector/planta1.jpg",
  "./assets/img/selector/planta2.jpg",
  "./assets/img/selector/planta3.jpg",
  "./assets/img/selector/planta4.jpg",
  "./assets/img/selector/planta5.jpg",

];
const insectImages = [
  "./assets/img/selector/insecto1.jpg",
  "./assets/img/selector/insecto2.jpg",
  "./assets/img/selector/insecto3.jpg",
  "./assets/img/selector/insecto4.jpg",
  "./assets/img/selector/insecto5.jpg",
];

function getRandomImage(images) { return images[Math.floor(Math.random() * images.length)]; }

// Asignar imágenes al cargar
const imgPlants = document.getElementById("img-plants");
const imgInsects = document.getElementById("img-insects");
if (imgPlants) imgPlants.style.backgroundImage = `url('${getRandomImage(plantImages)}')`;
if (imgInsects) imgInsects.style.backgroundImage = `url('${getRandomImage(insectImages)}')`;

// Navegación
document.getElementById("card-plants")?.addEventListener("click", () => {
  location.href = "./plantas.html";
});
document.getElementById("card-insects")?.addEventListener("click", () => {
  location.href = "./insectos.html";
});

// Logout
document.getElementById("btnLogout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "./index.html";
});