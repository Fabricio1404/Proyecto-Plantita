// frontend/assets/scripts/detail.js

// ===== INICIO CAMBIO 1: Definir URL del Backend =====
const BACKEND_URL = "http://localhost:4000"; // URL base de tu servidor Node.js
const API_BASE_PATH = "/api/v1/inaturalist"; // Ruta relativa DENTRO del backend
// ===== FIN CAMBIO 1 =====

console.log("detail.js (versión backend) cargado");

const $ = (s) => document.querySelector(s);
const params = new URLSearchParams(location.search);
const taxonId = params.get("id");

// --- Volver a la sección de origen (plantas o insectos) ---
(() => {
  const backBtn = document.getElementById('back-button');
  if (!backBtn) return;
  const from = new URLSearchParams(location.search).get('from');
  // Si tenemos el origen, seteamos el href y click
  let target = null;
  if (from === 'plantas') target = 'plantas.html';
  else if (from === 'insectos') target = 'insectos.html';
  // Configurar
  if (target) backBtn.setAttribute('href', target);
  backBtn.addEventListener('click', (e) => {
    if (target) {
      e.preventDefault();
      location.href = target;
    } else if (document.referrer) {
      e.preventDefault();
      history.back();
    }
  });
})();


// UI refs
const title = $("#title");
const subtitle = $("#subtitle");
const aboutDiv = $("#about");
const taxList = $("#taxonomy");
const obsCount = $("#obs-count");
const recentGrid = $("#recent");
const badgesDiv = $("#badges");
const namesDiv = $("#names");
// const synonymsDiv = $("#synonyms"); // Asegúrate que este ID exista en tu HTML si lo usas

let map, clusterLayer;

/* ---------- Map ---------- */
function initMap() {
  map = L.map("detail-map", { zoomControl: true, minZoom: 3 });
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map);
  const arSW = L.latLng(-55.2, -73.6);
  const arNE = L.latLng(-21.8, -53.6);
  const arBounds = L.latLngBounds(arSW, arNE);
  map.fitBounds(arBounds.pad(0.1));
  map.setMaxBounds(arBounds.pad(1.5));
  clusterLayer = L.markerClusterGroup();
  map.addLayer(clusterLayer);
}
initMap();

function switchTabs() {
  document.querySelectorAll(".detail-tabs .tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".detail-tabs .tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("show"));
      btn.classList.add("active");
      const tabPanel = document.getElementById(btn.dataset.tab);
      if (tabPanel) tabPanel.classList.add("show");
      if (btn.dataset.tab === "tab-map") setTimeout(() => map.invalidateSize(), 250);
    });
  });
}
switchTabs();

/* ---------- Helpers ---------- */
// ===== INICIO CAMBIO 2: fetchAPI usa BACKEND_URL =====
async function fetchAPI(relativePath) { // Ahora recibe la ruta relativa
  const token = localStorage.getItem('token');
  if (!token) {
    console.error("No token found, redirecting to auth.");
    return window.location.href = 'auth.html'; // Asegúrate que auth-guard.js también redirija
  }

  const fullUrl = BACKEND_URL + relativePath; // Construye la URL completa
  console.log("📞 Calling Backend:", fullUrl); // Log para ver la URL

  try {
      const res = await fetch(fullUrl, {
          headers: {
              'x-token': token // Usamos el header 'x-token' que tu backend espera
          }
      });

      if (res.status === 401) {
          console.error("Token invalid (401), redirecting to auth.");
          localStorage.clear();
          return window.location.href = 'auth.html';
      }
      if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error(`Error de red: ${res.status} ${res.statusText}`, errorData);
          throw new Error(errorData.msg || `Error de red: ${res.statusText}`);
      }
      return res.json();
  } catch(error) {
      console.error("Fetch API Error:", error);
      throw error; // Re-lanza para que loadTaxon lo capture
  }
}
// ===== FIN CAMBIO 2 =====

const BADGE = (t) => `<span class="badge">${t}</span>`;
const CHIP  = (t) => `<span class="badge" title="${t}">${t}</span>`;
function escapeHTML(s){ return s?.replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])) || ""; }


/* ---------- Mini-gráficos (sin cambios) ---------- */
function renderBarSeries(containerId, labels, values, unitLabel) {
  const max = Math.max(1, ...values);
  const bars = labels.map((lab, i) => {
    const v = values[i] || 0;
    const h = Math.max(4, Math.round((v / max) * 60));
    return `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px">
        <div style="width:14px;height:${h}px;background:#1e4b6a;border:1px solid #1f3a53;border-radius:4px" title="${v.toLocaleString('es-AR')} ${unitLabel}"></div>
        <small style="opacity:.8">${lab}</small>
      </div>`;
  }).join("");
  const el = document.getElementById(containerId);
  if(el) el.innerHTML = `<div style="display:flex;gap:10px;align-items:flex-end">${bars}</div>`;
}

/* ---------- Lightbox (sin cambios) ---------- */
let LB = { list: [], idx: 0, el: null, img: null, cap: null };
function initLightbox(){
  LB.el  = document.getElementById("lightbox");
  LB.img = document.getElementById("lb-img");
  LB.cap = document.getElementById("lb-cap");
  if (!LB.el) { console.warn("Lightbox element not found"); return; }
  LB.el.addEventListener("click", (e)=>{
    if (e.target.hasAttribute("data-lb-close")) closeLB();
    if (e.target.hasAttribute("data-lb-prev"))  prevLB();
    if (e.target.hasAttribute("data-lb-next"))  nextLB();
  });
  document.addEventListener("keydown", (e)=>{
    if (LB.el.getAttribute("aria-hidden") === "true") return;
    if (e.key === "Escape") closeLB();
    if (e.key === "ArrowLeft") prevLB();
    if (e.key === "ArrowRight") nextLB();
  });
}
function openLB(i){
  if (!LB.list.length) return;
  LB.idx = (i+LB.list.length)%LB.list.length;
  const item = LB.list[LB.idx];
  if (!item || !LB.img || !LB.cap) return;
  LB.img.src = item.srcLarge || item.src;
  LB.img.alt = item.caption || "foto";
  LB.cap.textContent = item.caption || "";
  if (LB.el) LB.el.setAttribute("aria-hidden","false");
}
function closeLB(){ if (LB.el) LB.el.setAttribute("aria-hidden","true"); if (LB.img) LB.img.src=""; }
function prevLB(){ openLB(LB.idx-1); }
function nextLB(){ openLB(LB.idx+1); }

/* ---------- Main (TOTALMENTE MODIFICADO) ---------- */
async function loadTaxon() {
  if (!taxonId) {
      if (title) title.textContent = "Error";
      if (subtitle) subtitle.textContent = "No se proporcionó un ID de taxón.";
      return;
  }

  // ===== INICIO CAMBIO 3: Construir ruta relativa =====
  const relativePath = `${API_BASE_PATH}/detail/${taxonId}`;
  // ===== FIN CAMBIO 3 =====

  try {
      // 1) Llamar a nuestro backend. ¡Una sola vez!
      const R = await fetchAPI(relativePath); // Llama con la ruta relativa
      if (!R || !R.taxon) {
          throw new Error("No se pudo cargar el taxón desde el backend.");
      }

      const t = R.taxon;

      // 2) Renderizar Título
      if (title) title.textContent = t.preferred_common_name || "—";
      if (subtitle) subtitle.textContent = t.name || "";

      // 3) Renderizar "Acerca de" (HTML viene sanitizado del backend)
      if (aboutDiv) {
          aboutDiv.innerHTML = `
            ${t.wikipedia_url ? `<p><a href="${t.wikipedia_url}" target="_blank" rel="noopener">Fuente: Wikipedia</a> ${R.wikipedia?.lang ? `<small style="opacity:.75">(idioma: ${R.wikipedia.lang.toUpperCase()})</small>` : ""}</p>` : ""}
            ${R.wikipedia?.html ? `<div class="wiki-article">${R.wikipedia.html}</div>` : "<p>Sin descripción de Wikipedia disponible.</p>"}
          `;
      }

      // 4) Nombres comunes
      const names = Array.isArray(t.names) ? t.names : [];
      const commonES = [...new Set(names.filter(n => (n.lexicon || "").toLowerCase().startsWith("spanish")).map(n => n.name))].slice(0, 20);
      const commonEN = [...new Set(names.filter(n => (n.lexicon || "").toLowerCase().startsWith("english")).map(n => n.name))].slice(0, 20);
      const chips = [];
      if (commonES.length) chips.push(`<div><strong>Nombres (ES):</strong> ${commonES.map(CHIP).join(" ")}</div>`);
      if (commonEN.length) chips.push(`<div style="margin-top:6px"><strong>Common names (EN):</strong> ${commonEN.map(CHIP).join(" ")}</div>`);
      if (namesDiv) namesDiv.innerHTML = chips.join("");

      // 5) Taxonomía
      const ranks = ["kingdom","phylum","class","order","family","genus","species"];
      const ancestors = (t.ancestors || []).filter((a) => a.rank && ranks.includes(a.rank)); // Added check for a.rank
      if (taxList) {
          taxList.innerHTML = ancestors.concat([{ name: t.name, rank: "species" }])
            .map((a) => `<li><strong>${a.rank}:</strong> ${a.name}</li>`).join("");
      }

      // 6) Conservación / establecimiento (AR)
      const badges = [];
      if (t.conservation_status?.status_name) {
        badges.push(BADGE(`Conservación: ${t.conservation_status.status_name}`));
      }
      if (R.listed_taxa) {
          const rec = R.listed_taxa;
          if (rec.establishment_means) badges.push(BADGE(`Establecimiento en Argentina: ${rec.establishment_means}`));
          if (rec.native)     badges.push(BADGE("Nativo (AR)"));
          if (rec.endemic)    badges.push(BADGE("Endémico (AR)"));
      }
      if (badgesDiv) badgesDiv.innerHTML = badges.join(" ");

      // 7) Observaciones recientes (galería con zoom)
      LB.list = (R.recent_observations || []).map(r=>{
          const p = r.photos?.[0];
          if (!p?.url) return null;
          const src = p.url.replace("square","medium");
          const srcLarge = p.url.replace("square","large");
          const caption = `${r.user?.login || "Usuario"} — ${(r.observed_on || "").split("T")[0] || ""}`;
          return { src, srcLarge, caption };
        }).filter(Boolean);

      if (recentGrid) {
          recentGrid.innerHTML = LB.list.map((ph, i) => `
            <button class="card zoomable" data-idx="${i}" title="${ph.caption}">
              <img src="${ph.src}" alt="foto" loading="lazy" data-skeleton>
            </button>
          `).join("");

          recentGrid.addEventListener("click", (e)=>{
            const btn = e.target.closest(".zoomable");
            if(!btn) return;
            openLB(parseInt(btn.dataset.idx,10));
          });
      }

      // 8) Mapa + contador (AR)
      const obs = R.map_observations || {};
      const totalObsAR = obs.total_results || 0;
      if (obsCount) obsCount.textContent = `${totalObsAR.toLocaleString("es-AR")} observaciones en Argentina`;

      clusterLayer.clearLayers(); // Limpia marcadores anteriores si los hubiera
      (obs.results || []).forEach((r) => {
        if (!r.geojson?.coordinates) return;
        const [lng, lat] = r.geojson.coordinates;
        const p = r.photos?.[0];
        const thumb = p?.url ? p.url.replace("square","small") : "";
        const common = t.preferred_common_name || r.species_guess || "—";
        const date = (r.observed_on || "").split("T")[0] || "";
        const gmapsUrl = `https://maps.google.com/?q=${lat},${lng}`; // Correct Google Maps URL

        const html = `
          <div class="popupbox">
            ${thumb ? `<img class="popupbox__img" src="${thumb}" alt="${escapeHTML(common)}">` : ""}
            <div class="popupbox__body">
              <div class="popupbox__title">${escapeHTML(common)}</div>
              <div class="popupbox__sci">${escapeHTML(t.name || "")}</div>
              ${date ? `<div class="popupbox__meta">Obs.: ${date}</div>` : ""}
              <a href="${gmapsUrl}" target="_blank" rel="noopener" class="btn btn-small">Abrir en Google Maps</a>
            </div>
          </div>
        `;
        const m = L.marker([lat, lng], { title: r.species_guess || "" });
        m.bindPopup(html, { maxWidth: 320, minWidth: 220 });
        clusterLayer.addLayer(m);
      });
      if (clusterLayer.getLayers().length) {
        try { map.fitBounds(clusterLayer.getBounds().pad(0.2)); } catch(err) { console.warn("Error fitting map bounds:", err); }
      }

      // 9) Estacionalidad (mes/hora, AR)
      const months = ["E","F","M","A","M","J","J","A","S","O","N","D"];
      const valsM = months.map((_,i)=> (R.histogram_month?.[String(i+1)] || 0));
      renderBarSeries("season-month", months, valsM, "obs.");

      const hours = Array.from({length:24},(_,i)=>String(i).padStart(2,"0"));
      const valsH = hours.map((_,i)=> (R.histogram_hour?.[String(i)] || 0));
      renderBarSeries("season-hour", hours, valsH, "obs.");

      // 10) Top observadores e identificadores (AR)
      const renderUserList = (selector, users, label) => {
          const el = $(selector);
          if (!el) return;
          const list = (users || []).map(u=>{
          const name = u.user?.name || u.user?.login || "Usuario";
          const count = u.observation_count || u.count || 0;
          return `<div class="card"><div class="padded"><p class="common">${escapeHTML(name)}</p><p class="sci">${count.toLocaleString("es-AR")} ${label}</p></div></div>`;
        }).join("");
        el.innerHTML = list;
      };
      renderUserList("#top-observers", R.observers, "obs.");
      renderUserList("#top-identifiers", R.identifiers, "id.");

      // 11) Especies similares
      const similarGrid = $("#similar");
      if (similarGrid) {
          const cards = (R.similar || []).map(x=>{
            const img = x.default_photo?.medium_url || x.default_photo?.url || "";
            const common = x.preferred_common_name || "—";
            const sci = x.name || "";
            return `
              <article class="card species-card" data-id="${x.id}" tabindex="0" role="button">
                <img src="${img}" alt="${common}" loading="lazy" data-skeleton>
                <div class="padded">
                  <p class="common">${escapeHTML(common)}</p>
                  <p class="sci">${escapeHTML(sci)}</p>
                </div>
              </article>
            `; // Added species-card class
          }).join("");
          similarGrid.innerHTML = cards;
          similarGrid.addEventListener("click",(e)=>{
            const card = e.target.closest(".species-card"); // Busca por .species-card
            if(!card) return;
            const id = card.dataset.id;
            if (id) {
                console.log(`Similar species clicked, reloading detail.html?id=${id}`);
                location.href = `detail.html?id=${id}`; // Recarga la página con el nuevo ID
            }
          });
      }

  } catch(error) {
      console.error("Error en loadTaxon:", error);
      if (title) title.textContent = "Error";
      if (subtitle) subtitle.textContent = `No se pudo cargar el taxón: ${error.message}`;
  }
}

initLightbox();
loadTaxon();