// iNaturalist — Plantas (Plantae) + favoritos
import { getLists, createList, addToList, removeFromList, isFavorite, whichListsContains, makeFavItem } from "./favorites.js";

const API = "https://api.inaturalist.org/v1";
const iconic = "Plantae";
const state = {
  q: localStorage.getItem("inat.q") || "",
  page: 1, per: 60, total: 0,
  placeId: null,
  loading: false,
  buffer: []
};

// UI refs
const $ = s => document.querySelector(s);
const grid = $("#results-grid");
const searchInput = $("#search-input");
const searchBtn = $("#search-btn");
const searchState = $("#search-state");
const statTotal = $("#stat-total");
const statTop = [$("#stat-top1"), $("#stat-top2"), $("#stat-top3")];
const sentinel = $("#sentinel");

// Mapa
let map, cluster, mapReady=false;
function initMap(){
  if(mapReady) return;
  map = L.map("map", { zoomControl: true });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19, attribution:"&copy; OpenStreetMap"}).addTo(map);
  cluster = L.markerClusterGroup(); map.addLayer(cluster);
  map.setView([-38.4161,-63.6167],4); mapReady=true;
}
initMap();
window.addEventListener("map-visibility-changed", ()=> setTimeout(()=> map?.invalidateSize(), 220));

// Helpers
async function fetchJSON(u){ const r=await fetch(u); if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); }
async function getArgentina(){ if(state.placeId) return state.placeId;
  const u=new URL(API+"/places/autocomplete"); u.searchParams.set("q","Argentina"); u.searchParams.set("per_page","5");
  const d=await fetchJSON(u); state.placeId=d.results?.[0]?.id; if(!state.placeId) throw new Error("Argentina place_id no encontrado"); return state.placeId;
}
function gmUrl(lat,lon){ return `https://www.google.com/maps?q=${lat},${lon}`; }
function photoUrl(o){ let p=o?.photos?.[0]?.url||""; return p.includes("square")? p.replace("square","medium"):p; }
function dateOf(o){ return o?.observed_on || (o?.time_observed_at||"").slice(0,10) || (o?.created_at||"").slice(0,10) || "-"; }

// Tarjeta con corazón
function buildCard(o){
  const sci=o?.taxon?.name||""; const com=o?.taxon?.preferred_common_name||"";
  const display=com||sci||"(sin nombre)"; const photo=photoUrl(o);
  const lat=o?.geojson?.coordinates?.[1], lon=o?.geojson?.coordinates?.[0];
  const coordsLabel=(typeof lat==="number"&&typeof lon==="number")? `${lat.toFixed(4)}, ${lon.toFixed(4)}`:"-";
  const gmaps=(typeof lat==="number"&&typeof lon==="number")? gmUrl(lat,lon):null;
  const fav = isFavorite(o.id);

  return `
    <article class="card" tabindex="0" role="button" aria-label="Ver detalle ${display}"
      data-obs='${encodeURIComponent(JSON.stringify(o))}'>
      <button class="fav-btn" data-id="${o.id}" aria-label="${fav?'Quitar de':'Agregar a'} favoritos" title="${fav?'Quitar de':'Agregar a'} favoritos">${fav?'❤️':'🤍'}</button>
      ${photo?`<img src="${photo}" loading="lazy" alt="">`:`<div class="skeleton skel-img"></div>`}
      <div class="body">
        <div class="name">${display}${com&&sci&&com!==sci?`<div style="font-weight:600;color:#bfe9cb;font-size:13px">${sci}</div>`:""}</div>
        <div class="meta">
          <div>Fecha</div><div>${dateOf(o)}</div>
          <div>Coords</div><div>${coordsLabel}${gmaps?` · <a href="${gmaps}" target="_blank" rel="noopener">Google Maps</a>`:""}</div>
        </div>
        ${o?.quality_grade?`<div class="tag">quality: ${o.quality_grade}</div>`:""}
      </div>
    </article>`;
}

// Modal
const modal = $("#modal"), modalContent=$("#modal-content");
function openModal(o){
  const sci=o?.taxon?.name||""; const com=o?.taxon?.preferred_common_name||"";
  const display=com||sci||"(sin nombre)"; const lat=o?.geojson?.coordinates?.[1]; const lon=o?.geojson?.coordinates?.[0];
  const gmaps=(typeof lat==="number"&&typeof lon==="number")? gmUrl(lat,lon):null;
  const photo=photoUrl(o);
  const lists = getLists();
  const inLists = whichListsContains(o.id);

  modalContent.innerHTML = `
    ${photo?`<img class="modal-photo" src="${photo}" alt="">`:""}
    <h2 id="modal-title" style="margin:10px 0 6px">${display}</h2>
    ${com&&sci&&com!==sci?`<div style="color:#bfe9cb;margin-bottom:8px">${sci}</div>`:""}
    <div class="modal-grid">
      <div class="box">
        <b>Fecha:</b> ${dateOf(o)}<br>
        <b>ID:</b> ${o?.id}<br>
        <b>En listas:</b> ${inLists.length? inLists.join(", ") : "—"}
      </div>
      <div class="box">
        <b>Coordenadas:</b> ${(lat&&lon)? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : "-"}<br>
        ${gmaps? `<a class="btn ghost" style="margin-top:8px;display:inline-block" target="_blank" href="${gmaps}">Abrir en Google Maps</a>`:""}
      </div>
    </div>

    <div class="modal-actions">
      <label style="display:flex;gap:6px;align-items:center">
        Guardar en:
        <select id="fav-select">
          ${lists.map(l=>`<option value="${l.name}">${l.name}</option>`).join("")}
        </select>
      </label>
      <button class="btn primary" id="fav-add">Agregar</button>
      <button class="btn ghost" id="fav-remove">Quitar</button>
      <input id="fav-new-name" placeholder="Nueva lista…" style="flex:1;min-width:160px;padding:8px;border-radius:8px;border:1px solid rgba(255,255,255,.25);background:#0a1b12;color:#e8f5ec">
      <button class="btn ghost" id="fav-new">Crear lista</button>
    </div>
  `;
  modal.setAttribute("aria-hidden","false");

  // Eventos modal favoritos
  $("#fav-add").onclick = ()=>{
    const list = $("#fav-select").value;
    const ok = addToList(list, makeFavItem(o, iconic));
    alert(ok? `Agregado a "${list}"`: "Ya estaba en esa lista");
    refreshHearts();
  };
  $("#fav-remove").onclick = ()=>{
    const list = $("#fav-select").value;
    const ok = removeFromList(list, o.id);
    alert(ok? `Quitado de "${list}"`: "No estaba en esa lista");
    refreshHearts();
  };
  $("#fav-new").onclick = ()=>{
    const name = $("#fav-new-name").value.trim();
    if(!name) return;
    if(createList(name)){
      alert(`Lista "${name}" creada`);
      openModal(o); // recargar UI del modal
    } else {
      alert("No se pudo crear (¿existe ya?)");
    }
  };
}
function closeModal(){ modal.setAttribute("aria-hidden","true"); }
$("#modal-close")?.addEventListener("click", closeModal);
$("#modal-close-2")?.addEventListener("click", closeModal);
modal.addEventListener("keydown",(e)=>{ if(e.key==="Escape") closeModal(); });

// Click card => modal || corazón
grid.addEventListener("click",(e)=>{
  const heart = e.target.closest(".fav-btn");
  if (heart) {
    e.stopPropagation();
    const id = Number(heart.dataset.id);
    const card = heart.closest(".card");
    const o = JSON.parse(decodeURIComponent(card.dataset.obs));
    // toggle en lista General
    if (isFavorite(id)) {
      removeFromList("General", id);
    } else {
      addToList("General", makeFavItem(o, iconic));
    }
    refreshHearts();
    return;
  }
  const card = e.target.closest(".card");
  if(!card) return;
  const o = JSON.parse(decodeURIComponent(card.dataset.obs));
  openModal(o);
});
grid.addEventListener("keydown",(e)=>{
  if(e.key==="Enter"){
    const card = e.target.closest(".card");
    if(!card) return;
    const o = JSON.parse(decodeURIComponent(card.dataset.obs));
    openModal(o);
  }
});

// Util
function refreshHearts(){
  grid.querySelectorAll(".fav-btn").forEach(btn=>{
    const id = Number(btn.dataset.id);
    const fav = isFavorite(id);
    btn.textContent = fav ? "❤️" : "🤍";
    btn.setAttribute("aria-label", fav? "Quitar de favoritos" : "Agregar a favoritos");
    btn.title = fav? "Quitar de favoritos" : "Agregar a favoritos";
  });
}

// Resumen + mapa
function summarizePage(list){
  const m = new Map();
  list.forEach(o=>{
    const name = o?.taxon?.preferred_common_name || o?.taxon?.name;
    if(!name) return;
    m.set(name,(m.get(name)||0)+1);
  });
  const top = [...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]||"–");
  statTop.forEach((el,i)=> el.textContent = top[i] || "–");
}
function updateMap(list){
  cluster.clearLayers();
  const bounds=[];
  list.forEach(o=>{
    const lat=o?.geojson?.coordinates?.[1], lon=o?.geojson?.coordinates?.[0];
    if(typeof lat==="number" && typeof lon==="number"){
      const name = o?.taxon?.preferred_common_name || o?.taxon?.name || "(sin nombre)";
      const m = L.marker([lat,lon]).bindPopup(`<b>${name}</b><br>${dateOf(o)}<br><a href="${gmUrl(lat,lon)}" target="_blank" rel="noopener">Ver en Google Maps</a>`);
      cluster.addLayer(m); bounds.push([lat,lon]);
    }
  });
  if(bounds.length) map.fitBounds(bounds,{padding:[20,20]});
}

// Carga (infinite)
let canLoadMore=true;
async function loadPage(page){
  if(state.loading) return;
  state.loading=true;

  const placeId = await getArgentina();
  const u=new URL(API+"/observations");
  u.searchParams.set("place_id", placeId);
  u.searchParams.set("iconic_taxa", iconic);
  u.searchParams.set("photos","true");
  u.searchParams.set("per_page", String(state.per));
  u.searchParams.set("page", String(page));
  if(state.q.trim()) u.searchParams.set("q", state.q.trim());

  if(page===1){
    grid.innerHTML = Array.from({length:8},()=>`<div class="skeleton"><div class="skel-img"></div><div class="skel-body"></div></div>`).join("");
    cluster?.clearLayers(); state.buffer=[]; searchState.textContent="Buscando…";
  }

  const data = await fetchJSON(u);
  const results = data.results || [];
  state.total = data.total_results || 0;

  const html = results.map(buildCard).join("");
  if(page===1) grid.innerHTML = html; else grid.insertAdjacentHTML("beforeend", html);
  refreshHearts();

  if(page===1) updateMap(results);
  summarizePage(page===1?results:[]);
  state.buffer.push(...results);

  statTotal.textContent = state.total.toLocaleString("es-AR");
  searchState.textContent="";

  const pages = Math.max(1, Math.ceil(state.total/state.per));
  state.page = page; canLoadMore = state.page < pages; state.loading=false;
}
// IO
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting && canLoadMore && !state.loading) loadPage(state.page+1);
  });
},{rootMargin:"600px 0px 600px 0px"});
io.observe(sentinel);

// Search
function doSearch(){ localStorage.setItem("inat.q", state.q); canLoadMore=true; loadPage(1); }
let t=null;
searchInput.value = state.q;
searchInput.addEventListener("input", ()=>{
  state.q = searchInput.value;
  searchState.textContent = "Filtrando…";
  clearTimeout(t); t=setTimeout(()=>doSearch(),450);
});
searchBtn.addEventListener("click", ()=>{ state.q=searchInput.value; doSearch(); });

// Init
loadPage(1);
