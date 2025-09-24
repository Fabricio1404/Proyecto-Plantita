// iNaturalist integración — PLANTAS (iconic_taxa=Plantae)
const API = "https://api.inaturalist.org/v1";
const state = { q: "", page: 1, per: 60, total: 0, placeId: null, iconic: "Plantae" };

const grid = document.getElementById("results-grid");
const pageInfo = document.getElementById("pageInfo");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const statTotal = document.getElementById("stat-total");
const statTop1 = document.getElementById("stat-top1");
const statTop2 = document.getElementById("stat-top2");
const statTop3 = document.getElementById("stat-top3");

// --------- MAPA (Leaflet) ----------
let map, layerGroup;
function initMap(){
  map = L.map("map", { zoomControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: "&copy; OpenStreetMap"
  }).addTo(map);
  layerGroup = L.layerGroup().addTo(map);
  map.setView([-38.4161,-63.6167], 4); // Argentina
}
initMap();

async function fetchJSON(url){ const r = await fetch(url); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }
async function getArgentinaPlaceId(){
  if(state.placeId) return state.placeId;
  const u = new URL(API + "/places/autocomplete");
  u.searchParams.set("q", "Argentina"); u.searchParams.set("per_page", "5");
  const d = await fetchJSON(u); state.placeId = d.results?.[0]?.id;
  if(!state.placeId) throw new Error("No se encontró place_id para Argentina");
  return state.placeId;
}

function cardHTML(o){
  const sci = o?.taxon?.name || "(sin nombre)";
  const com = o?.taxon?.preferred_common_name || "";
  let photo = o?.photos?.[0]?.url || "";
  if(photo.includes("square")) photo = photo.replace("square","medium");
  const date = o?.observed_on || (o?.time_observed_at||"").slice(0,10) || (o?.created_at||"").slice(0,10) || "-";
  const url = o?.uri || `https://www.inaturalist.org/observations/${o.id}`;
  const lat = o?.geojson?.coordinates?.[1];
  const lon = o?.geojson?.coordinates?.[0];

  return `
    <article class="card">
      ${photo ? `<img src="${photo}" alt="">` : ""}
      <div class="body">
        <div class="name">${sci}${com ? ` — <span style="font-weight:600;color:#bfe9cb">${com}</span>`:""}</div>
        <div class="meta">
          <div>Obs.</div><div><a href="${url}" target="_blank" rel="noopener">${o.id}</a></div>
          <div>Fecha</div><div>${date}</div>
          <div>Coords</div><div>${(lat&&lon)? `${lat.toFixed(4)}, ${lon.toFixed(4)}` : "-"}</div>
        </div>
        ${o?.quality_grade ? `<div class="tag">quality: ${o.quality_grade}</div>` : ""}
      </div>
    </article>`;
}

function summarize(results){
  // Total y top especies en esta página
  const freq = new Map();
  results.forEach(o=>{
    const n = o?.taxon?.name;
    if(!n) return;
    freq.set(n, (freq.get(n)||0)+1);
  });
  const top = [...freq.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);
  statTop1.textContent = top[0] || "–";
  statTop2.textContent = top[1] || "–";
  statTop3.textContent = top[2] || "–";
}

function updateMap(results){
  layerGroup.clearLayers();
  const bounds = [];
  results.forEach(o=>{
    const lat = o?.geojson?.coordinates?.[1];
    const lon = o?.geojson?.coordinates?.[0];
    if(typeof lat === "number" && typeof lon === "number"){
      const sci = o?.taxon?.name || "(sin nombre)";
      const com = o?.taxon?.preferred_common_name || "";
      const url = o?.uri || `https://www.inaturalist.org/observations/${o.id}`;
      const m = L.marker([lat,lon]).bindPopup(`<b>${sci}</b>${com?`<br>${com}`:""}<br><a href="${url}" target="_blank">ver observación</a>`);
      m.addTo(layerGroup);
      bounds.push([lat,lon]);
    }
  });
  if(bounds.length) map.fitBounds(bounds, { padding:[20,20] });
  else map.setView([-38.4161,-63.6167], 4);
}

async function load(page=1){
  state.page = page;
  const placeId = await getArgentinaPlaceId();

  const u = new URL(API + "/observations");
  u.searchParams.set("place_id", placeId);
  u.searchParams.set("iconic_taxa", state.iconic);
  u.searchParams.set("photos", "true");
  u.searchParams.set("per_page", String(state.per));
  u.searchParams.set("page", String(state.page));
  if(state.q.trim()) u.searchParams.set("q", state.q.trim());

  const data = await fetchJSON(u);
  state.total = data.total_results || 0;
  statTotal.textContent = state.total.toLocaleString("es-AR");

  const results = data.results || [];
  grid.innerHTML = results.map(cardHTML).join("");

  summarize(results);
  updateMap(results);

  const pages = Math.max(1, Math.ceil(state.total/state.per));
  pageInfo.textContent = `Página ${state.page} de ${pages}`;
  prev.disabled = state.page<=1;
  next.disabled = state.page>=pages;
}

// UI
document.getElementById("search-btn").addEventListener("click", ()=>{ 
  state.q = document.getElementById("search-input").value; load(1); 
});
document.getElementById("search-input").addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){ state.q = e.target.value; load(1); }
});
prev.addEventListener("click", ()=> load(state.page-1));
next.addEventListener("click", ()=> load(state.page+1));

// Primera carga
load(1);
