// UX base: logout y toggles (sidebar/map) + recordar estados
(function(){
  const $ = sel => document.querySelector(sel);
  $("#logout")?.addEventListener("click", ()=> location.href="index.html");

  // Sidebar toggle
  const sidebar = $("#sidebar");
  const toggleSidebar = $("#toggleSidebar");
  const sidebarKey = "ui.sidebar.hidden";
  const savedHidden = localStorage.getItem(sidebarKey) === "true";
  if(savedHidden) sidebar.classList.add("hidden");
  toggleSidebar?.addEventListener("click", ()=>{
    const hidden = sidebar.classList.toggle("hidden");
    toggleSidebar.setAttribute("aria-pressed", hidden ? "true" : "false");
    localStorage.setItem(sidebarKey, hidden);
  });

  // Map toggle
  const mapPanel = $("#map-panel");
  const toggleMap = $("#toggleMap");
  const mapKey = "ui.map.hidden.plants";
  const mapSavedHidden = localStorage.getItem(mapKey) === "true";
  if(mapSavedHidden) mapPanel.classList.add("hidden");
  toggleMap?.addEventListener("click", ()=>{
    const hidden = mapPanel.classList.toggle("hidden");
    toggleMap.setAttribute("aria-pressed", hidden ? "true" : "false");
    localStorage.setItem(mapKey, hidden);
    // Disparar un evento para que el mapa se recalcule (Leaflet invalidateSize)
    window.dispatchEvent(new Event("map-visibility-changed"));
  });
})();
