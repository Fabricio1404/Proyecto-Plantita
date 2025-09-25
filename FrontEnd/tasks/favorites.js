// === Favorites / Lists (localStorage) ===
// Estructura en localStorage:
// fav.lists = {
//   "__order": ["General","Otra lista"],
//   "General": [ item, item, ... ],
//   "Otra lista": [ ... ]
// }
// item = { id, iconic, sci, com, lat, lon, photo, date }

const KEY = "fav.lists";
const DEFAULT_LIST = "General";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const obj = JSON.parse(raw);
    if (!obj["__order"]) obj["__order"] = Object.keys(obj).filter(k => k !== "__order");
    if (!obj[DEFAULT_LIST]) obj[DEFAULT_LIST] = [];
    return obj;
  } catch {
    return seed();
  }
}
function seed() {
  const obj = { "__order": [DEFAULT_LIST], [DEFAULT_LIST]: [] };
  localStorage.setItem(KEY, JSON.stringify(obj));
  return obj;
}
function save(obj) {
  localStorage.setItem(KEY, JSON.stringify(obj));
}

export function getLists() {
  const data = load();
  return data["__order"].map(name => ({ name, count: (data[name]||[]).length }));
}
export function getList(name = DEFAULT_LIST) {
  const data = load();
  return data[name] || [];
}
export function createList(name) {
  const data = load();
  if (!name || data[name]) return false;
  data[name] = [];
  data["__order"].push(name);
  save(data); 
  return true;
}
export function renameList(oldName, newName) {
  const data = load();
  if (!data[oldName] || data[newName]) return false;
  data[newName] = data[oldName];
  delete data[oldName];
  data["__order"] = data["__order"].map(n => n === oldName ? newName : n);
  save(data); 
  return true;
}
export function deleteList(name) {
  if (name === DEFAULT_LIST) return false; 
  const data = load();
  if (!data[name]) return false;
  delete data[name];
  data["__order"] = data["__order"].filter(n => n !== name);
  save(data); 
  return true;
}
export function addToList(name = DEFAULT_LIST, item) {
  const data = load();
  if (!data[name]) { data[name] = []; data["__order"].push(name); }
  if (!data[name].some(x => x.id === item.id)) {
    data[name].push(item);
    save(data); 
    return true;
  }
  return false;
}
export function removeFromList(name = DEFAULT_LIST, id) {
  const data = load();
  if (!data[name]) return false;
  const before = data[name].length;
  data[name] = data[name].filter(x => x.id !== id);
  save(data);
  return data[name].length !== before;
}
export function isFavorite(id) {
  const data = load();
  for (const listName of data["__order"]) {
    if ((data[listName]||[]).some(x => x.id === id)) return true;
  }
  return false;
}
export function whichListsContains(id) {
  const data = load();
  return data["__order"].filter(name => (data[name]||[]).some(x => x.id === id));
}
export function allItems() {
  const data = load();
  const seen = new Set();
  const out = [];
  for (const name of data["__order"]) {
    for (const it of data[name]) {
      if (!seen.has(it.id)) { seen.add(it.id); out.push(it); }
    }
  }
  return out;
}
export function exportList(name = DEFAULT_LIST) {
  const arr = getList(name);
  return JSON.stringify(arr, null, 2);
}

// Util para construir el item desde una observación de iNat:
export function makeFavItem(ob, iconicOverride) {
  const sci = ob?.taxon?.name || "";
  const com = ob?.taxon?.preferred_common_name || "";
  const photo0 = ob?.photos?.[0]?.url || "";
  const photo = photo0.includes("square") ? photo0.replace("square", "medium") : photo0;
  const lat = ob?.geojson?.coordinates?.[1];
  const lon = ob?.geojson?.coordinates?.[0];
  const date = ob?.observed_on || (ob?.time_observed_at||"").slice(0,10) || (ob?.created_at||"").slice(0,10) || "-";
  return {
    id: ob?.id,
    iconic: iconicOverride || ob?.taxon?.iconic_taxon_name || "unknown",
    sci, com, photo, lat, lon, date
  };
}
