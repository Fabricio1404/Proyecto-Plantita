// frontend/assets/scripts/api.js
// V2 - COMPLETADO CON TODAS LAS FUNCIONES DE CLASSROOM

const API_V1_URL = 'http://localhost:4000/api/v1';

// --- 1. Helper Fetch para JSON (El que ya tenías) ---
export const protectedFetch = async (endpoint, token, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        'x-token': token,
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
        
        const data = await response.json().catch(() => ({ msg: `Respuesta no JSON: ${response.statusText}` }));
        
        return { ok: response.ok, status: response.status, data };

    } catch (e) {
        console.error('Error de red en protectedFetch:', e);
        return { ok: false, status: 0, data: { msg: `Fallo de conexión: ${e.message}` } };
    }
};

// --- 2. NUEVO Helper Fetch para FormData (Subir Archivos) ---
/**
 * Realiza una petición fetch para FormData (archivos),
 * NO establece Content-Type, el navegador lo hace.
 */
export const protectedFetchFormData = async (endpoint, token, options = {}) => {
    const headers = {
        'x-token': token,
        ...options.headers
    };

    try {
        const url = `${API_V1_URL}${endpoint}`;
        const response = await fetch(url, {
            method: options.method || 'POST',
            headers: headers,
            body: options.body, // El body debe ser un FormData
        });

        if (response.status === 401) {
            localStorage.clear(); window.location.href = 'auth.html';
            return { ok: false, status: 401, data: { msg: "Token inválido" } };
        }
        
        const data = await response.json().catch(() => ({ msg: `Respuesta no JSON: ${response.statusText}` }));
        return { ok: response.ok, status: response.status, data };

    } catch (e) {
        console.error('Error de red en protectedFetchFormData:', e);
        return { ok: false, status: 0, data: { msg: `Fallo de conexión: ${e.message}` } };
    }
};


// --- 3. Funciones de iNaturalist (Sin cambios) ---
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

// --- 4. Funciones de Listas (Sin cambios) ---
export const createLista = (nombre, descripcion, publica) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/listas', t, { method: 'POST', body: { nombre, descripcion, publica } });
};
export const getListas = () => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch('/listas', t);
};
export const addEspecieToLista = (listaId, especieData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
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

// --- 5. Funciones de Perfil de Usuario (Sin cambios) ---
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

// --- 7. Funciones de Clases (Lobby - Sin cambios) ---
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


// ===== ESTAS SON LAS FUNCIONES QUE FALTAN =====

// --- 8. Funciones de Clase-Detalle (NUEVAS) ---
export const getClasePorId = (claseId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}`, t);
};

export const getTareasPorClase = (claseId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}/tareas`, t);
};

export const addMaterialAClase = (claseId, formData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // Usamos el helper de FormData
    return protectedFetchFormData(`/clases/${claseId}/materiales`, t, { method: 'POST', body: formData });
};

export const editMaterialDeClase = (claseId, materialId, formData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetchFormData(`/clases/${claseId}/materiales/${materialId}`, t, { method: 'PUT', body: formData });
};

export const deleteMaterialDeClase = (claseId, materialId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}/materiales/${materialId}`, t, { method: 'DELETE' });
};

// --- 9. Funciones de Tarea-Detalle (NUEVAS) ---
export const addTareaAClase = (claseId, formData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // Usamos el helper de FormData
    return protectedFetchFormData(`/clases/${claseId}/tareas`, t, { method: 'POST', body: formData });
};

export const getTareaDetalle = (tareaId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // Nota: la ruta en el servidor está en singular '/tarea/:id'
    return protectedFetch(`/tarea/${tareaId}`, t);
};

export const editTarea = (tareaId, formData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetchFormData(`/tarea/${tareaId}`, t, { method: 'PUT', body: formData });
};

export const deleteTarea = (tareaId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/${tareaId}`, t, { method: 'DELETE' });
};

export const addComentarioATarea = (tareaId, texto) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // La ruta en backend para comentar es POST /api/v1/tarea/:id/comentar
    return protectedFetch(`/tarea/${tareaId}/comentar`, t, { method: 'POST', body: { texto } });
};

// --- 10. Funciones de Entregas (NUEVAS) ---
export const addEntregaATarea = (tareaId, formData) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // La ruta en backend para entregar es POST /api/v1/tarea/:id/entregar
    return protectedFetchFormData(`/tarea/${tareaId}/entregar`, t, { method: 'POST', body: formData });
};

export const anularEntrega = (entregaId) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // La ruta en backend para anular entrega es DELETE /api/v1/tarea/entrega/:id
    return protectedFetch(`/tarea/entrega/${entregaId}`, t, { method: 'DELETE' });
};

export const calificarEntrega = (entregaId, calificacion, comentarioProfesor) => {
    const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    // La ruta en backend es POST /api/v1/tarea/entrega/:id/calificar
    return protectedFetch(`/tarea/entrega/${entregaId}/calificar`, t, { method: 'POST', body: { calificacion, comentarioProfesor } });
};
// ===============================================