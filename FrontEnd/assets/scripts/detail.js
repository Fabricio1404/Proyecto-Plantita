// Detalle de especie: mapa, lightbox y añadir a listas
import { protectedFetch, getListas, addEspecieToLista } from './api.js';

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const taxonId = params.get("id");
const cameFrom = params.get("from") || 'plantas';

// Estado Global de la Especie
let currentTaxonData = null; 

// Referencias UI
const title = $("#title"); const subtitle = $("#subtitle"); const aboutDiv = $("#about"); const taxList = $("#taxonomy"); const obsCount = $("#obs-count"); const recentGrid = $("#recent"); const badgesDiv = $("#badges"); const namesDiv = $("#names");
const backButton = $("#back-button");
const addToListBtn = $("#add-to-list-btn");
const addToListModal = $("#add-to-list-modal");
const addToListContainer = $("#add-to-list-container");
const addToListMessageArea = $("#add-to-list-message-area");
const addToListModalCloseBtns = addToListModal ? addToListModal.querySelectorAll('[data-modal-close]') : [];

let map, clusterLayer;

// Configuración Botón Volver
(function setupBackButton() {
  if (backButton) {
    backButton.href = (cameFrom === 'listas') ? 'listas.html' : `${cameFrom}.html`;
  }
  document.body.setAttribute('data-page-theme', cameFrom === 'insectos' ? 'insectos' : 'plantas');
})();

// Mapa (Leaflet)
function initMap() { if(!$("#detail-map")) return; map = L.map("detail-map", { zoomControl: true, minZoom: 3 }); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map); const arSW = L.latLng(-55.2, -73.6); const arNE = L.latLng(-21.8, -53.6); const arBounds = L.latLngBounds(arSW, arNE); map.fitBounds(arBounds.pad(0.1)); map.setMaxBounds(arBounds.pad(1.5)); clusterLayer = L.markerClusterGroup(); map.addLayer(clusterLayer); }

// Pestañas (Tabs)
function switchTabs() { document.querySelectorAll(".detail-tabs .tab-btn").forEach((btn) => { btn.addEventListener("click", () => { document.querySelectorAll(".detail-tabs .tab-btn").forEach((b) => b.classList.remove("active")); document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("show")); btn.classList.add("active"); const tabPanel = document.getElementById(btn.dataset.tab); if (tabPanel) tabPanel.classList.add("show"); if (btn.dataset.tab === "tab-map") setTimeout(() => { if (map) map.invalidateSize() }, 250); }); }); }

/* --- Helpers Renderizado --- */
const BADGE = (t) => `<span class="badge">${t}</span>`; const CHIP = (t) => `<span class="tag" title="${t}">${t}</span>`; function escapeHTML(s){ if (s == null) return ''; return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }
function renderBarSeries(containerId, labels, values, unitLabel) { const el = document.getElementById(containerId); if(!el) return; const max = Math.max(1, ...values); const bars = labels.map((lab, i) => { const v = values[i] || 0; const h = Math.max(4, Math.round((v / max) * 60)); const bgColor = document.body.dataset.pageTheme === 'insectos' ? 'var(--secondary-strong)' : 'var(--primary-strong)'; const borderColor = document.body.dataset.pageTheme === 'insectos' ? 'var(--secondary)' : 'var(--primary)'; return `<div style="display:flex;flex-direction:column;align-items:center;gap:6px; flex: 1; min-width: 15px;"><div style="width:100%; height:${h}px; background:${bgColor}; border:1px solid ${borderColor}; border-radius:4px" title="${v.toLocaleString('es-AR')} ${unitLabel}"></div><small style="opacity:.8; font-size: 10px;">${lab}</small></div>`; }).join(""); el.innerHTML = `<div style="display:flex; gap: 4px; align-items:flex-end; width: 100%;">${bars}</div>`;}

/* --- Lightbox (Zoom de fotos) --- */
let LB = { list: [], idx: 0, el: null, img: null, cap: null };
function initLightbox(){ LB.el = document.getElementById("lightbox"); LB.img = document.getElementById("lb-img"); LB.cap = document.getElementById("lb-cap"); if (!LB.el || !LB.img || !LB.cap) { console.warn("Lightbox element not found"); return; } LB.el.addEventListener("click", (e)=>{ if (e.target.hasAttribute("data-lb-close")) closeLB(); if (e.target.hasAttribute("data-lb-prev")) prevLB(); if (e.target.hasAttribute("data-lb-next")) nextLB(); }); document.addEventListener("keydown", (e)=>{ if (LB.el.getAttribute("aria-hidden") === "false" && e.key === "Escape") closeLB(); }); }
function openLB(i){ if (!LB.list.length || !LB.el || !LB.img || !LB.cap) return; LB.idx = (i+LB.list.length)%LB.list.length; const item = LB.list[LB.idx]; if (!item) return; LB.img.src = item.srcLarge || item.src; LB.img.alt = item.caption || "foto"; LB.cap.textContent = item.caption || ""; LB.el.setAttribute("aria-hidden","false"); LB.el.style.display = 'grid'; }
function closeLB(){ if (LB.el) { LB.el.setAttribute("aria-hidden","true"); LB.el.style.display = 'none'; } if (LB.img) LB.img.src=""; }
function prevLB(){ openLB(LB.idx-1); } function nextLB(){ openLB(LB.idx+1); }

/* --- Función Principal de Carga de Datos --- */
async function loadTaxon() {
    if (!taxonId) { if (title) title.textContent = "Error"; if (subtitle) subtitle.textContent = "No se proporcionó un ID de taxón."; return; }
    if (title) title.textContent = "Cargando..."; if (subtitle) subtitle.textContent = `ID: ${taxonId}`;

    const token = localStorage.getItem('token');
    if (!token) return;
    const relativePath = `/inaturalist/detail/${taxonId}`;

    try {
        const { ok, data: R } = await protectedFetch(relativePath, token);
        if (!ok || !R.taxon) throw new Error(R.msg || "No se pudo cargar el taxón.");

        const t = R.taxon;
        currentTaxonData = t; // <-- Guardar datos del taxón globalmente

        if (title) title.textContent = escapeHTML(t.preferred_common_name) || "—"; if (subtitle) subtitle.textContent = escapeHTML(t.name) || "";
        if (aboutDiv) { aboutDiv.innerHTML = `${t.wikipedia_url ? `<p><a href="${t.wikipedia_url}" target="_blank" rel="noopener">Fuente: Wikipedia</a> ${R.wikipedia?.lang ? `<small>(${R.wikipedia.lang.toUpperCase()})</small>` : ""}</p>` : ""}${R.wikipedia?.html ? `<div class="wiki-article">${R.wikipedia.html}</div>` : "<p>Sin descripción.</p>"}`; }
        const names = Array.isArray(t.names)?t.names:[]; const commonES=[...new Set(names.filter(n=>(n.lexicon||"").toLowerCase().startsWith("spanish")).map(n=>n.name))].slice(0,20); const commonEN=[...new Set(names.filter(n=>(n.lexicon||"").toLowerCase().startsWith("english")).map(n=>n.name))].slice(0,20); const chips=[]; if(commonES.length)chips.push(`<div><strong>Nombres (ES):</strong> ${commonES.map(CHIP).join(" ")}</div>`); if(commonEN.length)chips.push(`<div style="margin-top:6px"><strong>Nombres (EN):</strong> ${commonEN.map(CHIP).join(" ")}</div>`); if(namesDiv)namesDiv.innerHTML=chips.join("");
        const ranks = ["kingdom","phylum","class","order","family","genus","species"]; const ancestors = (t.ancestors||[]).filter(a=>a.rank&&ranks.includes(a.rank)); if(taxList){taxList.innerHTML=ancestors.concat([{name:t.name,rank:"species"}]).map(a=>`<li><strong>${a.rank.charAt(0).toUpperCase()+a.rank.slice(1)}:</strong> ${escapeHTML(a.name)}</li>`).join("");}
        const badges=[]; if(t.conservation_status?.status_name)badges.push(BADGE(`Conservación: ${t.conservation_status.status_name}`)); if(R.listed_taxa){const rec=R.listed_taxa; if(rec.establishment_means)badges.push(BADGE(`Est. AR: ${rec.establishment_means}`)); if(rec.native)badges.push(BADGE("Nativo AR")); if(rec.endemic)badges.push(BADGE("Endémico AR"));} if(badgesDiv)badgesDiv.innerHTML=badges.join(" ");
        LB.list = (R.recent_observations||[]).map(r=>{const p=r.photos?.[0]; if(!p?.url)return null; const src=p.url.replace("square","medium"); const srcLarge=p.url.replace("square","large"); const caption=`${r.user?.login||"Usuario"} — ${(r.observed_on||"").split("T")[0]||""}`; return {src,srcLarge,caption};}).filter(Boolean);
        if(recentGrid){recentGrid.innerHTML=LB.list.map((ph,i)=>`<button class="card zoomable" data-idx="${i}" title="${escapeHTML(ph.caption)}" style="padding:0;background:none;border:none;"><img src="${ph.src}" alt="Obs ${i+1}" loading="lazy" data-skeleton style="border-radius:var(--radius-sm);border:1px solid var(--border);aspect-ratio:4/3;"></button>`).join(""); recentGrid.addEventListener("click",(e)=>{const btn=e.target.closest(".zoomable");if(!btn)return; openLB(parseInt(btn.dataset.idx,10));});}
        const obs=R.map_observations||{}; const totalObsAR=obs.total_results||0; if(obsCount)obsCount.textContent=`${totalObsAR.toLocaleString("es-AR")} obs. en AR`;
        if(clusterLayer)clusterLayer.clearLayers();
        (obs.results||[]).forEach(r=>{if(!r.geojson?.coordinates||!clusterLayer)return; const[lng,lat]=r.geojson.coordinates; const p=r.photos?.[0]; const thumb=p?.url?p.url.replace("square","small"):""; const common=t.preferred_common_name||r.species_guess||"—"; const date=(r.observed_on||"").split("T")[0]||""; const gmapsUrl=`http://googleusercontent.com/maps/google.com/0{lat},${lng}`; const html=`<div class="popupbox">${thumb?`<img class="popupbox__img" src="${thumb}" alt="${escapeHTML(common)}">`:""}<div class="popupbox__body"><div class="popupbox__title">${escapeHTML(common)}</div><div class="popupbox__sci">${escapeHTML(t.name||"")}</div>${date?`<div class="popupbox__meta">Obs.: ${date}</div>`:""}<a href="${gmapsUrl}" target="_blank" rel="noopener" class="btn btn-sm ghost">Ver en G. Maps</a></div></div>`; const m=L.marker([lat,lng],{title:r.species_guess||""}); m.bindPopup(html,{maxWidth:320,minWidth:220}); clusterLayer.addLayer(m);});
        if(map&&clusterLayer&&clusterLayer.getLayers().length){try{map.fitBounds(clusterLayer.getBounds().pad(0.2));}catch(err){}}else if(map){const arSW=L.latLng(-55.2,-73.6); const arNE=L.latLng(-21.8,-53.6); const arBounds=L.latLngBounds(arSW,arNE); map.fitBounds(arBounds.pad(0.1));}
        const months=["E","F","M","A","M","J","J","A","S","O","N","D"]; const valsM=months.map((_,i)=>(R.histogram_month?.[String(i+1)]||0)); renderBarSeries("season-month",months,valsM,"obs."); const hours=Array.from({length:24},(_,i)=>String(i).padStart(2,"0")); const valsH=hours.map((_,i)=>(R.histogram_hour?.[String(i)]||0)); renderBarSeries("season-hour",hours,valsH,"obs.");
        // Se removió la renderización de "Top observadores/identificadores" y "Especies similares".

    } catch (error) {
        console.error("Error en loadTaxon:", error);
        if (title) title.textContent = "Error";
        if (subtitle) subtitle.textContent = `No se pudo cargar: ${error.message}`;
        if (aboutDiv) aboutDiv.innerHTML = `<p class="error">Error al cargar: ${error.message}</p>`;
    }
}

// ===== INICIO LÓGICA: AÑADIR A LISTA (MODIFICADO) =====
function setupAddToListModal() {
    if (!addToListBtn || !addToListModal || !addToListContainer || !addToListMessageArea) {
        console.warn("Elementos 'Añadir a Lista' no encontrados.");
        return;
    }

    // 1. Abrir el modal
    addToListBtn.addEventListener('click', async () => {
        addToListMessageArea.textContent = '';
        addToListContainer.innerHTML = '<p>Cargando tus listas...</p>';
        addToListModal.setAttribute('aria-hidden', 'false');
        addToListModal.style.display = 'grid';

        const response = await getListas();
        if (response.ok && response.data.listas) {
            if (response.data.listas.length === 0) {
                addToListContainer.innerHTML = '<p>No tienes listas. <a href="listas.html">Crea una primero</a>.</p>';
            } else {
                addToListContainer.innerHTML = response.data.listas.map(list => `
                    <button class="btn secondary btn-add-to-this-list" data-list-id="${list._id}" style="width: 100%; text-align: left; margin-bottom: 8px;">
                        ${escapeHTML(list.nombre)} <span class="muted" style="font-size: 0.8em;">(${list.especies.length} especies)</span>
                    </button>
                `).join('');
            }
        } else {
            addToListContainer.innerHTML = '<p class="error">Error al cargar tus listas.</p>';
        }
    });

    // 2. Cerrar el modal
    const closeModal = () => {
        addToListModal.setAttribute('aria-hidden', 'true');
        addToListModal.style.display = 'none';
    };
    addToListModalCloseBtns.forEach(btn => btn.addEventListener('click', closeModal));

    // 3. Manejar clic en una lista (delegación)
    addToListContainer.addEventListener('click', async (e) => {
        const listButton = e.target.closest('.btn-add-to-this-list');
        if (!listButton) return;
        
        const listId = listButton.dataset.listId;
        if (!currentTaxonData || !listId) {
            addToListMessageArea.textContent = "Error: No se pudo obtener la especie o la lista.";
            addToListMessageArea.className = 'message-area error';
            return;
        }

        listButton.textContent = 'Añadiendo...';
        listButton.disabled = true;
        addToListMessageArea.className = 'message-area';

        // --- Obtener URL de imagen ---
        const imageUrl = currentTaxonData.default_photo?.medium_url || currentTaxonData.default_photo?.url || null;

        const especieData = {
            inaturalist_id: String(currentTaxonData.id),
            nombreComun: currentTaxonData.preferred_common_name || currentTaxonData.name,
            nombreCientifico: currentTaxonData.name,
            taxon: cameFrom, // 'plantas' o 'insectos'
            imageUrl: imageUrl // <-- Enviar la URL de la imagen
        };

        const response = await addEspecieToLista(listId, especieData);

        if (response.ok) {
            addToListMessageArea.textContent = `¡Añadido a "${escapeHTML(response.data.lista.nombre)}"!`;
            addToListMessageArea.className = 'message-area success';
            setTimeout(closeModal, 1500);
        } else {
            addToListMessageArea.textContent = `Error: ${response.data?.msg || 'No se pudo añadir.'}`;
            addToListMessageArea.className = 'message-area error';
            listButton.textContent = response.data.msg.includes('ya está') ? 'Ya estaba' : 'Error';
            
            if (response.data.msg.includes('ya está')) {
                 listButton.disabled = true;
            } else {
                 setTimeout(() => {
                    listButton.disabled = false;
                    // Recargar listas en el modal para mostrar estado actual
                    addToListBtn.click(); // Simular clic para reabrir/refrescar
                 }, 2000);
            }
        }
    });
}
// ===== FIN LÓGICA: AÑADIR A LISTA =====


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    switchTabs();
    initLightbox();
    loadTaxon();
    setupAddToListModal();
});