// iNaturalist — Plantas (Plantae) — SIN favoritos + Listas de usuario
import { getLists, createList, addToList, removeFromList, getListById, isLoggedIn } from "./lists-api.js";

const API = "https://api.inaturalist.org/v1";
const iconic = "Plantae";
const state = {
  q: localStorage.getItem("inat.q") || "",
  page: 1, per: 60, total: 0,
  placeId: null,
  loading: false,
  buffer: [],
  lists: [],
  selectedListId: localStorage.getItem("selected_list_id") || null,
  selectedListItems: new Set(), // taxon_id de la lista actual (para saber si ya está)
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

// MAPA
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
async function getArgentina(){ 
  if(state.placeId) return state.placeId;
  const u=new URL(API+"/places/autocomplete");
  u.searchParams.set("q","Argentina");
  u.searchParams.set("per_page","5");
  u.searchParams.set("locale","es"); // <- nombres comunes en español
  const d=await fetchJSON(u);
  state.placeId=d.results?.[0]?.id;
  if(!state.placeId) throw new Error("Argentina place_id no encontrado");
  return state.placeId;
}
function gmUrl(lat,lon){ return `https://www.google.com/maps?q=${lat},${lon}`; }
function photoUrl(o){ let p=o?.photos?.[0]?.url||""; return p.includes("square")? p.replace("square","medium"):p; }
function dateOf(o){ return o?.observed_on || (o?.time_observed_at||"").slice(0,10) || (o?.created_at||"").slice(0,10) || "-"; }

// ====== Listas (carga/estado) ======
async function ensureListsLoaded() {
  if (!isLoggedIn()) return;
  try {
    state.lists = await getLists();
    // Si no hay seleccionada, elegir la 1ra
    if (!state.selectedListId && state.lists.length) {
      state.selectedListId = state.lists[0]._id;
      localStorage.setItem("selected_list_id", state.selectedListId);
    }
    await fetchSelectedListItems();
  } catch (e) {
    console.warn("No se pudieron cargar listas:", e.message);
  }
}

async function fetchSelectedListItems() {
  state.selectedListItems = new Set();
  if (!state.selectedListId) return;
  try {
    const list = await getListById(state.selectedListId);
    list?.items?.forEach(i => state.selectedListItems.add(Number(i.taxon_id)));
  } catch (e) {
    console.warn("No se pudo obtener la lista seleccionada:", e.message);
  }
}

function renderListsSelect(container, currentTaxonId) {
  // container: elemento dentro del modal para UI de listas
  if (!isLoggedIn()) {
    container.innerHTML = `<div class="modal-actions">
      <div class="box" style="border:none;padding:0;color:#cfe9da">
        Iniciá sesión para usar tus <b>Listas</b>.
      </div></div>`;
    return;
  }

  const hasLists = state.lists?.length > 0;
  const options = hasLists
    ? state.lists.map(l => `<option value="${l._id}" ${l._id===state.selectedListId?"selected":""}>${escapeHtml(l.name)} (${l.type})</option>`).join("")
    : "";

  container.innerHTML = `
    <div class="modal-actions" style="display:grid; gap:10px">
      <div class="box" style="background:rgba(255,255,255,.05); border:1px solid rgba(152,210,175,.18); border-radius:10px; padding:10px">
        <div style="display:flex; gap:10px; align-items:center; flex-wrap: wrap">
          <label for="list-select" style="font-weight:700">Mi lista:</label>
          ${hasLists ? `
            <select id="list-select">${options}</select>
            <button id="list-add" class="btn primary">${state.selectedListItems.has(currentTaxonId) ? "Quitar de la lista" : "Agregar a mi lista"}</button>
          ` : `
            <em>No tenés listas.</em>
          `}
          <button id="list-new-toggle" class="btn ghost">Nueva lista</button>
        </div>
      </div>
      <form id="list-new-form" style="display:none; gap:8px; align-items:end">
        <div>
          <label>Nombre<br><input id="list-new-name" required placeholder="Ej. Nativas del patio" /></label>
        </div>
        <div>
          <label>Tipo<br>
            <select id="list-new-type">
              <option value="plantas" selected>plantas</option>
              <option value="insectos">insectos</option>
              <option value="mixta">mixta</option>
            </select>
          </label>
        </div>
        <button class="btn primary" id="list-new-create" type="submit">Crear</button>
      </form>
    </div>
  `;

  const select = container.querySelector("#list-select");
  const btnAdd = container.querySelector("#list-add");
  const toggle = container.querySelector("#list-new-toggle");
  const form = container.querySelector("#list-new-form");
  const inputName = container.querySelector("#list-new-name");
  const inputType = container.querySelector("#list-new-type");

  toggle?.addEventListener("click", () => {
    form.style.display = form.style.display === "none" ? "grid" : "none";
  });

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const name = inputName.value.trim();
      const type = inputType.value;
      if (!name) return;
      const created = await createList(name, type);
      // refrescar listas
      await ensureListsLoaded();
      // seleccionar la recién creada
      state.selectedListId = created._id;
      localStorage.setItem("selected_list_id", state.selectedListId);
      // re-render select
      renderListsSelect(container, currentTaxonId);
    } catch (err) {
      alert("No se pudo crear la lista: " + err.message);
    }
  });

  select?.addEventListener("change", async () => {
    state.selectedListId = select.value || null;
    localStorage.setItem("selected_list_id", state.selectedListId || "");
    await fetchSelectedListItems();
    // refrescar label del botón
    btnAdd.textContent = state.selectedListItems.has(currentTaxonId) ? "Quitar de la lista" : "Agregar a mi lista";
  });

  btnAdd?.addEventListener("click", async () => {
    if (!state.selectedListId) return alert("Elegí una lista primero.");
    try {
      if (state.selectedListItems.has(currentTaxonId)) {
        await removeFromList(state.selectedListId, currentTaxonId);
      } else {
        // Necesitamos datos del item actual
        const o = currentModalObservation;
        const item = {
          taxon_id: o?.taxon?.id,
          nombre: o?.taxon?.preferred_common_name || null, // ES
          nombre_cientifico: o?.taxon?.name,
          foto_url: photoUrl(o) || null,
        };
        await addToList(state.selectedListId, item);
      }
      await fetchSelectedListItems();
      btnAdd.textContent = state.selectedListItems.has(currentTaxonId) ? "Quitar de la lista" : "Agregar a mi lista";
    } catch (err) {
      alert("No se pudo actualizar la lista: " + err.message);
    }
  });
}

function escapeHtml(s="") {
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

// Tarjetas
function buildCard(o){
  const sci=o?.taxon?.name||""; 
  const com=o?.taxon?.preferred_common_name||"";
  const display=com||sci||"(sin nombre)";
  const photo=photoUrl(o);
  const lat=o?.geojson?.coordinates?.[1], lon=o?.geojson?.coordinates?.[0];
  const coordsLabel=(typeof lat==="number"&&typeof lon==="number")? `${lat.toFixed(4)}, ${lon.toFixed(4)}`:"-";
  const gmaps=(typeof lat==="number"&&typeof lon==="number")? gmUrl(lat,lon):null;

  return `
    <article class="card" tabindex="0" role="button" aria-label="Ver detalle ${display}"
      data-obs='${encodeURIComponent(JSON.stringify(o))}'>
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

// MODAL
const modal=$("#modal"), modalContent=$("#modal-content");
let currentModalObservation = null;

function openModal(o){
  currentModalObservation = o;
  const sci=o?.taxon?.name||""; 
  const com=o?.taxon?.preferred_common_name||"";
  const display=com||sci||"(sin nombre)";
  const lat=o?.geojson?.coordinates?.[1]; const lon=o?.geojson?.coordinates?.[0];
  const gmaps=(typeof lat==="number"&&typeof lon==="number")? gmUrl(lat,lon):null;
  const photo=photoUrl(o);

  modalContent.innerHTML = `
    ${photo?`<img class="modal-photo" src="${photo}" alt="">`:""}
    <h2 id="modal-title" style="margin:10px 0 6px">${display}</h2>
    ${com&&sci&&com!==sci?`<div style="color:#bfe9cb;margin-bottom:8px">${sci}</div>`:""}
    <div class="modal-grid">
      <div class="box"><b>Fecha:</b> ${dateOf(o)}<br><b>ID:</b> ${o?.id}</div>
      <div class="box"><b>Coordenadas:</b> ${(lat&&lon)? `${lat.toFixed(5)}, ${lon.toFixed(5)}` : "-"}<br>
        ${gmaps? `<a class="btn ghost" style="margin-top:8px;display:inline-block" target="_blank" href="${gmaps}">Abrir en Google Maps</a>`:""}
      </div>
    </div>
    <div id="lists-ui"></div>
  `;
  modal.setAttribute("aria-hidden","false");

  // Render de listas
  (async () => {
    await ensureListsLoaded();
    const taxonId = Number(o?.taxon?.id);
    const container = modalContent.querySelector("#lists-ui");
    renderListsSelect(container, taxonId);
  })();
}
function closeModal(){ modal.setAttribute("aria-hidden","true"); currentModalObservation=null; }
$("#modal-close")?.addEventListener("click", closeModal);
$("#modal-close-2")?.addEventListener("click", closeModal);

// EVENTOS cards
grid.addEventListener("click",(e)=>{
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

// MAPA + RESUMEN
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
      const m=L.marker([lat,lon]).bindPopup(`<b>${name}</b><br>${dateOf(o)}<br><a href="${gmUrl(lat,lon)}" target="_blank" rel="noopener">Ver en Google Maps</a>`);
      cluster.addLayer(m); bounds.push([lat,lon]);
    }
  });
  if(bounds.length) map.fitBounds(bounds,{padding:[20,20]});
}

// CARGA
let canLoadMore=true;
async function loadPage(page){
  if(state.loading) return;
  state.loading=true;

  const placeId = await getArgentina();
  const u=new URL(API+"/observations");
  u.searchParams.set("place_id", placeId);
  u.searchParams.set("iconic_taxa", iconic);
  u.searchParams.set("photos","true");
  u.searchParams.set("locale","es");
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
  if(page===1) updateMap(results);
  summarizePage(page===1?results:[]);
  state.buffer.push(...results);

  statTotal.textContent = state.total.toLocaleString("es-AR");
  searchState.textContent="";

  const pages = Math.max(1, Math.ceil(state.total/state.per));
  state.page = page; canLoadMore = state.page < pages; state.loading=false;
}

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
ensureListsLoaded();
loadPage(1);
