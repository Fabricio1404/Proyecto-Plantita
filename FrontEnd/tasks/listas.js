// Listas (UI) — trabaja con el backend mediante lists-api.js
import {
  isLoggedIn, getLists, getListById, createList, renameList, deleteList,
  removeFromList, exportListJSON
} from "./lists-api.js";

const $ = s => document.querySelector(s);
const listsEl = $("#lists");
const contentEl = $("#listContent");
const newName = $("#newName");
const createBtn = $("#create");

// Icono por nombre de lista (simple heurística)
const iconFor = (name) => {
  const n = (name||"").toLowerCase();
  if (n.includes("plaga") || n.includes("insect")) return "🪲";
  if (n.includes("ave") || n.includes("bird")) return "🕊️";
  if (n.includes("árbol") || n.includes("arbol") || n.includes("tree")) return "🌳";
  return "🌿";
};

function escapeHtml(s=""){
  return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
}

// Construye el mosaico de 0-4 fotos
function pickThumbs(list){
  const photos = (list?.items||[]).map(i => i.foto_url).filter(Boolean).slice(0,4);
  const n = photos.length;
  const cls = n===0 ? "one" : n===1 ? "one" : n===2 ? "two" : n===3 ? "three" : "four";
  let tiles = "";
  if (n === 0) {
    tiles = `<div class="tile fallback">${iconFor(list?.name)}</div>`;
  } else if (n === 1) {
    tiles = `<div class="tile" style="background-image:url('${photos[0]}')"></div>`;
  } else if (n === 2) {
    tiles = photos.map(src=>`<div class="tile" style="background-image:url('${src}')"></div>`).join("");
  } else if (n === 3) {
    tiles = `
      <div class="tile" style="background-image:url('${photos[0]}')"></div>
      <div class="tile" style="background-image:url('${photos[1]}')"></div>
      <div class="tile" style="background-image:url('${photos[2]}');grid-column:1/3"></div>
    `;
  } else {
    tiles = photos.slice(0,4).map(src=>`<div class="tile" style="background-image:url('${src}')"></div>`).join("");
  }
  return { cls, tiles };
}

function playlistCardHTML(list){
  const count = list?.items?.length || 0;
  const { cls, tiles } = pickThumbs(list);
  const id = list._id;
  const name = escapeHtml(list.name || "(sin nombre)");
  return `
    <article class="playlist-card" data-id="${id}">
      <div class="thumb ${cls}">
        ${tiles}
        <div class="badge-count">${count}</div>
      </div>
      <div class="card-body">
        <h3 class="card-title">${name}</h3>
        <div class="card-sub"><span>${count} elemento(s)</span><span class="dot"></span><span>Lista</span></div>
        <div class="card-actions">
          <button class="btn compact primary view-btn">Ver</button>
          <button class="btn compact ghost rename-btn">Renombrar</button>
          <button class="btn compact ghost export-btn">Exportar</button>
          <button class="btn compact ghost delete-btn">Eliminar</button>
        </div>
      </div>
    </article>
  `;
}

async function renderLists(){
  if (!isLoggedIn()) {
    listsEl.innerHTML = `<div class="empty">Iniciá sesión para ver tus listas.</div>`;
    contentEl.innerHTML = "";
    return;
  }
  const lists = await getLists();
  if(!lists.length){
    listsEl.innerHTML = `<div class="empty">Aún no hay listas.</div>`;
    contentEl.innerHTML = "";
    return;
  }
  listsEl.innerHTML = lists.map(playlistCardHTML).join("");

  // Delegación de eventos sobre la grilla de listas
  listsEl.onclick = async (e) => {
    const card = e.target.closest(".playlist-card");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest(".view-btn") || e.target.closest(".thumb") || e.target.closest(".card-title")) {
      await renderListContent(id);
    } else if (e.target.closest(".rename-btn")) {
      const current = card.querySelector(".card-title")?.textContent?.trim();
      const to = prompt("Nuevo nombre:", current || "");
      if (to && to !== current) {
        await renameList(id, to);
        await renderLists();
        await renderListContent(id);
      }
    } else if (e.target.closest(".export-btn")) {
      const json = await exportListJSON(id);
      const a=document.createElement("a");
      a.href=URL.createObjectURL(new Blob([json],{type:"application/json"}));
      a.download=`lista_${id}.json`; a.click();
    } else if (e.target.closest(".delete-btn")) {
      if (confirm("¿Eliminar esta lista? Esta acción no se puede deshacer.")) {
        await deleteList(id);
        await renderLists();
        contentEl.innerHTML = "";
      }
    } else {
      await renderListContent(id);
    }
  };
}

function cardItemHTML(item, listId){
  const com = item?.nombre || "";
  const sci = item?.nombre_cientifico || "";
  const name = escapeHtml(com || sci || "(sin nombre)");
  const sciSmall = (com && sci && com !== sci) ? `<div style="font-weight:600;color:#bfe9cb;font-size:13px">${escapeHtml(sci)}</div>` : "";
  const img = item?.foto_url ? `<img src="${item.foto_url}" alt="" style="height:180px;object-fit:cover;width:100%">` : "";
  return `
    <article class="card">
      ${img}
      <div class="body">
        <div class="name">${name}${sciSmall}</div>
        <div class="meta">
          <div>Taxon ID</div><div>${item?.taxon_id ?? "-"}</div>
        </div>
        <button class="btn ghost remove-btn" data-id="${item?.taxon_id}" data-list="${listId}">Quitar</button>
      </div>
    </article>
  `;
}

async function renderListContent(listId){
  const list = await getListById(listId);
  const name = escapeHtml(list?.name || "(sin nombre)");
  const items = list?.items || [];
  contentEl.innerHTML = `
    <header class="page-header" style="border-top:1px solid var(--border)">
      <h2 class="page-title">Lista: ${name}</h2>
      <button class="btn ghost" id="exportList">Exportar JSON</button>
    </header>
    ${items.length
      ? `<section class="cards" id="grid">${items.map(i => cardItemHTML(i, listId)).join("")}</section>`
      : `<div class="empty">Esta lista está vacía.</div>`}
  `;

  $("#exportList").onclick = async () => {
    const json = await exportListJSON(listId);
    const a=document.createElement("a");
    a.href=URL.createObjectURL(new Blob([json],{type:"application/json"}));
    a.download=`lista_${listId}.json`;
    a.click();
  };

  $("#grid")?.addEventListener("click", async (e)=>{
    const btn = e.target.closest(".remove-btn"); if(!btn) return;
    const taxonId = Number(btn.dataset.id);
    const lId = btn.dataset.list;
    await removeFromList(lId, taxonId);
    await renderListContent(lId);
    await renderLists(); // refrescar contador en tarjetas
  });

  contentEl.scrollIntoView({behavior:"smooth"});
}

// Crear lista
createBtn.onclick = async () => {
  const name = (newName.value || "").trim();
  if (!name) return;
  await createList(name, "mixta");
  newName.value = "";
  await renderLists();
};

// Init
renderLists();
