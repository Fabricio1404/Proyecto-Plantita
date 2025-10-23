// frontend/assets/scripts/api.js
// (Versión con funciones de perfil añadidas)

const API_V1_URL = 'http://localhost:4000/api/v1'; // URL base del backend

// --- 1. Helper Genérico para Fetch Protegido ---
export const protectedFetch = async (endpoint, token, options = {}) => {const headers = { 'Content-Type': 'application/json', 'x-token': token, ...options.headers }; try { const url = `${API_V1_URL}${endpoint}`; console.log(`📞 Llamando a Backend: ${options.method || 'GET'} ${url}`); const response = await fetch(url, { method: options.method || 'GET', headers: headers, body: (options.body && options.method !== 'GET') ? JSON.stringify(options.body) : undefined, }); if (response.status === 401) { console.error("❌ Error 401: Token inválido. Redirigiendo."); localStorage.clear(); window.location.href = 'auth.html'; return { ok: false, status: 401, data: { msg: "Token inválido" } }; } const data = await response.json().catch(() => ({ msg: `Respuesta no JSON: ${response.statusText}` })); return { ok: response.ok, status: response.status, data }; } catch (e) { console.error('❌ Error de red en protectedFetch:', e); return { ok: false, status: 0, data: { msg: `Fallo de conexión: ${e.message}` } }; } };

// --- 2. Funciones de Especies (iNaturalist) ---
export const getEspecies = async (taxon, query = '') => { /* ... (código igual que antes) ... */ const token = localStorage.getItem('token'); if (!token) return { ok: false, status: 401, data: { msg: "Token no encontrado" } }; const taxaIds = (taxon === 'plantas') ? "47126" : (taxon === 'insectos') ? "47158,47119,48222" : ""; const params = new URLSearchParams(); if (taxaIds) params.set('taxon_id', taxaIds); if (query) params.set('q', query); params.set('rank', 'species'); params.set('order_by', 'observations_count'); params.set('order', 'desc'); params.set('per_page', '30'); const endpoint = `/inaturalist/taxa?${params.toString()}`; return protectedFetch(endpoint, token); };

// --- 3. Funciones de Listas, Observatorio, Clases (SIN CAMBIOS) ---
export const createLista = (nombre, descripcion, publica) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/listas',t,{method:'POST',body:{nombre,descripcion,publica}});};
export const getListas = () => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/listas',t);};
export const addEspecieToLista = (listaId, especieData) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch(`/listas/${listaId}/especies`,t,{method:'POST',body:especieData});};
export const createSeguimiento = (nombrePlanta, especie, lat, lng) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/seguimiento',t,{method:'POST',body:{nombrePlanta,especie,lat,lng}});};
export const getSeguimientos = () => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/seguimiento',t);};
export const addObservacion = (idSeguimiento, observacionData) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch(`/seguimiento/${idSeguimiento}/observar`,t,{method:'POST',body:observacionData});};
export const downloadInforme = (idSeguimiento) => { /* ... */ const t=localStorage.getItem('token'); if(!t){return Promise.reject({ok:!1,status:401,data:{msg:"Token requerido"}});} return fetch(`${API_V1_URL}/seguimiento/${idSeguimiento}/informe`,{headers:{'x-token':t}});};
export const createClase = (nombre) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases',t,{method:'POST',body:{nombre}});};
export const joinClase = (codigoAcceso) => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases/unirse',t,{method:'POST',body:{codigoAcceso}});};
export const getMisClases = () => { /* ... */ const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases',t);};

// ===== INICIO NUEVAS FUNCIONES DE USUARIO =====
// --- 6. Funciones de Perfil de Usuario ---

/** Obtiene los datos del perfil del usuario logueado. */
export const getProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } }); // Devuelve promesa resuelta
    // Llama al endpoint GET /api/v1/usuarios/perfil
    return protectedFetch('/usuarios/perfil', token);
};

/** Actualiza los datos del perfil del usuario logueado. */
export const updateProfile = (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    // Llama al endpoint PUT /api/v1/usuarios/perfil
    return protectedFetch('/usuarios/perfil', token, {
        method: 'PUT',
        body: profileData // El body debe contener { nombre, apellido, password?, fotoPerfil? }
    });
};

/** Actualiza la preferencia de tema del usuario logueado. */
export const updateTheme = (themeName) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    // Llama al endpoint PUT /api/v1/usuarios/config/tema
    return protectedFetch('/usuarios/config/tema', token, {
        method: 'PUT',
        body: { tema: themeName } // El body debe contener { tema: 'claro' | 'oscuro' | 'ecologico' }
    });
};
// ===== FIN NUEVAS FUNCIONES DE USUARIO =====