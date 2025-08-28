document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "index.html"; // volver al landing
});
