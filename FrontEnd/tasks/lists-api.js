// ==================================
// InForest - API de Listas (Front)
// ==================================
// Cambiá esta URL si tu backend no corre en 4000:
const API_BACK = localStorage.getItem("API_BACK") || "http://localhost:4000/api";

const token = () => localStorage.getItem("token");

async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API_BACK}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.msg || JSON.stringify(j); } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export function isLoggedIn() { return !!token(); }

// ===== Listas =====
export async function getLists() {
  const json = await apiFetch(`/lists`);
  return json?.data || [];
}
export async function getListById(id) {
  const json = await apiFetch(`/lists/${id}`);
  return json?.data || null;
}
export async function createList(name, type = "mixta") {
  const json = await apiFetch(`/lists`, { method: "POST", body: { name, type } });
  return json?.data;
}
export async function renameList(id, name) {
  const json = await apiFetch(`/lists/${id}`, { method: "PATCH", body: { name } });
  return json?.data;
}
export async function deleteList(id) {
  const json = await apiFetch(`/lists/${id}`, { method: "DELETE" });
  return json;
}

// ===== Ítems =====
export async function addToList(listId, { taxon_id, nombre, nombre_cientifico, foto_url, notes = "" }) {
  const json = await apiFetch(`/lists/${listId}/items`, {
    method: "POST",
    body: { taxon_id, nombre, nombre_cientifico, foto_url, notes }
  });
  return json?.data;
}
export async function removeFromList(listId, taxon_id) {
  const json = await apiFetch(`/lists/${listId}/items/${taxon_id}`, { method: "DELETE" });
  return json?.data;
}

// Utilidad para exportar JSON
export async function exportListJSON(id) {
  const list = await getListById(id);
  return JSON.stringify(list, null, 2);
}
