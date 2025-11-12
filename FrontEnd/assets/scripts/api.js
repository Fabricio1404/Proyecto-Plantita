// frontend/assets/scripts/api.js

const API_V1_URL = 'http://localhost:4000/api/v1';

// --- 1. Helper Fetch ---
/**
 * Realiza una petición fetch al backend, añadiendo automáticamente el token JWT
 * y manejando errores comunes como 401 (Unauthorized).
 */
export const protectedFetch = async (endpoint, token, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-token': token, // El backend espera el token en este encabezado
        ...options.headers
    };

    try {
        const url = `${API_V1_URL}${endpoint}`;
        const response = await fetch(url, {
            method: options.method || 'GET',
            headers: headers,
            body: (options.body && options.method !== 'GET') ? JSON.stringify(options.body) : undefined,
        });

        if (response.status === 401) {
            console.error("Error 401: Token inválido. Redirigiendo.");
            localStorage.clear();
            window.location.href = 'auth.html';
            return { ok: false, status: 401, data: { msg: "Token inválido" } };
        }
        
        // Intenta parsear JSON incluso si la respuesta no es 200 OK (puede traer un msg de error)
        const data = await response.json().catch(() => ({ msg: `Respuesta no JSON: ${response.statusText}` }));
        
        return { ok: response.ok, status: response.status, data };

    } catch (e) {
        console.error('Error de red en protectedFetch:', e);
        return { ok: false, status: 0, data: { msg: `Fallo de conexión: ${e.message}` } };
    }
};

// --- 2. Funciones iNaturalist ---
export const getEspecies = async (taxon, query = '') => {
    const token = localStorage.getItem('token');
    if (!token) return { ok: false, status: 401, data: { msg: "Token no encontrado" } };
    const taxaIds = (taxon === 'plantas') ? "47126" : (taxon === 'insectos') ? "47158,47119,48222" : "";
    const params = new URLSearchParams();
    if (taxaIds) params.set('taxon_id', taxaIds);
    if (query) params.set('q', query);
    params.set('rank', 'species');
    params.set('order_by', 'observations_count');
    params.set('order', 'desc');
    params.set('per_page', '30');
    return protectedFetch(`/inaturalist/taxa?${params.toString()}`, token);
};

// --- 3. Funciones de Listas ---
export const createLista = (nombre, descripcion, publica) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/listas', t, { method: 'POST', body: { nombre, descripcion, publica } });
};

export const getListas = () => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/listas', t);
};

export const addEspecieToLista = (listaId, especieData) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/listas/${listaId}/especies`, t, { method: 'POST', body: especieData });
};

export const updateLista = (listaId, updateData) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/listas/${listaId}`, token, {
        method: 'PUT',
        body: updateData
    });
};

export const deleteLista = (listaId) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/listas/${listaId}`, token, {
        method: 'DELETE'
    });
};

export const getListaPorId = (listaId) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/listas/${listaId}`, token);
};

export const deleteEspecieFromLista = (listaId, especieId) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/listas/${listaId}/especies/${especieId}`, token, {
        method: 'DELETE'
    });
};

// --- 4. Funciones de Clases ---
export const createClase = (nombre) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/clases', t, { method: 'POST', body: { nombre } });
};
export const joinClase = (codigoAcceso) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/clases/unirse', t, { method: 'POST', body: { codigoAcceso } });
};
export const getMisClases = () => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/clases', t);
};

// --- 5. Funciones de Perfil de Usuario ---
export const getProfile = () => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    return protectedFetch('/usuarios/perfil', token);
};

export const updateProfile = (profileData) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    return protectedFetch('/usuarios/perfil', token, {
        method: 'PUT',
        body: profileData
    });
};

export const changePassword = (passwordActual, nuevaPassword) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    return protectedFetch('/usuarios/perfil/password', token, {
        method: 'PUT',
        body: { passwordActual, nuevaPassword }
    });
};

export const updateTheme = (themeName) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    return protectedFetch('/usuarios/config/tema', token, {
        method: 'PUT',
        body: { tema: themeName }
    });
};

// --- 6. Funciones de Seguimiento (Observatorio) ---
export const createSeguimiento = (nombrePlanta, especie, lat, lng) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/seguimiento', t, { method: 'POST', body: { nombrePlanta, especie, lat, lng } });
};
export const getSeguimientos = () => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/seguimiento', t);
};
export const addObservacion = (idSeguimiento, observacionData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/seguimiento/${idSeguimiento}/observar`, t, { method: 'POST', body: observacionData });
};
export const downloadInforme = (idSeguimiento) => {
    const t = localStorage.getItem('token'); if (!t) { return Promise.reject({ ok: false, status: 401, data: { msg: "Token requerido" } }); }
    return fetch(`${API_V1_URL}/seguimiento/${idSeguimiento}/informe`, { headers: { 'x-token': t } });
};
export const addObservacionFenologica = (idSeguimiento, fenoData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token no encontrado" } });
    return protectedFetch(`/seguimiento/${idSeguimiento}/fenologia`, t, { method: 'POST', body: fenoData });
};