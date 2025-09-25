// Logout + toggles (sidebar/map) con memoria
(function(){
  const $ = sel => document.querySelector(sel);
  $("#logout")?.addEventListener("click", ()=> location.href="index.html");

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

  const mapPanel = $("#map-panel");
  const toggleMap = $("#toggleMap");
  const mapKey = "ui.map.hidden.insects";
  const mapSavedHidden = localStorage.getItem(mapKey) === "true";
  if(mapSavedHidden) mapPanel.classList.add("hidden");
  toggleMap?.addEventListener("click", ()=>{
    const hidden = mapPanel.classList.toggle("hidden");
    toggleMap.setAttribute("aria-pressed", hidden ? "true" : "false");
    localStorage.setItem(mapKey, hidden);
    window.dispatchEvent(new Event("map-visibility-changed"));
  });
})();
