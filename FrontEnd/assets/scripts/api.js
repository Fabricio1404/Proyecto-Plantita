// frontend/assets/scripts/api.js
const API_V1_URL = 'http://localhost:4000/api/v1';

// --- 1. Helper Fetch (MODIFICADO PARA FORMDATA) ---
export const protectedFetch = async (endpoint, token, options = {}) => {
    // Si el body es FormData, NO pongas 'Content-Type: json'
    const headers = { 'x-token': token, ...options.headers };
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    try {
        const url = `${API_V1_URL}${endpoint}`;
        const body = (options.body && options.method !== 'GET') 
            ? (options.body instanceof FormData ? options.body : JSON.stringify(options.body))
            : undefined;

        const response = await fetch(url, { 
            method: options.method || 'GET', 
            headers: headers, 
            body: body, 
        });
        
        if (response.status === 401) { 
            console.error("❌ Error 401: Token inválido."); 
            localStorage.clear(); 
            window.location.href = 'auth.html'; 
            return { ok: false, status: 401, data: { msg: "Token inválido" } }; 
        }
        const data = await response.json().catch(() => ({ msg: `Respuesta no JSON: ${response.statusText}` }));
        return { ok: response.ok, status: response.status, data };
    } catch (e) {
        console.error('❌ Error de red en protectedFetch:', e);
        return { ok: false, status: 0, data: { msg: `Fallo de conexión: ${e.message}` } };
    }
};

// --- 2. Funciones iNaturalist ---
export const getEspecies = async (taxon, query = '', page = 1) => { 
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
    params.set('page', page); 
    return protectedFetch(`/inaturalist/taxa?${params.toString()}`, token); 
};

// --- 3. Funciones Listas ---
export const createLista = (n, d, p) => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch('/listas',t,{method:'POST',body:{nombre:n,descripcion:d,publica:p}});};
export const getListas = () => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch('/listas',t);};
export const addEspecieToLista = (id, data) => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch(`/listas/${id}/especies`,t,{method:'POST',body:data});};
export const updateLista = (id, data) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/listas/${id}`, t, { method: 'PUT', body: data }); };
export const deleteLista = (id) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/listas/${id}`, t, { method: 'DELETE' }); };
export const getListaPorId = (id) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/listas/${id}`, t); };
export const deleteEspecieFromLista = (listaId, especieId) => { const token = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/listas/${listaId}/especies/${especieId}`, token, { method: 'DELETE' }); };

// --- 4. Funciones Clases ---
export const createClase = (n) => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch('/clases',t,{method:'POST',body:{nombre:n}});};
export const joinClase = (c) => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch('/clases/unirse',t,{method:'POST',body:{codigoAcceso:c}});};
export const getMisClases = () => { const t=localStorage.getItem('token'); if(!t) return Promise.resolve({ok:!1,data:{msg:"Token requerido"}}); return protectedFetch('/clases',t);};
export const getClasePorId = (id) => { const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/clases/${id}`, t); };
export const addMaterialAClase = (claseId, formData) => { const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/clases/${claseId}/materiales`, t, { method: 'POST', body: formData }); };
export const addTareaAClase = (claseId, formData) => { const t = localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/clases/${claseId}/tareas`, t, { method: 'POST', body: formData }); };
export const getTareasPorClase = (claseId) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}/tareas`, t);
};
export const deleteMaterialDeClase = (claseId, materialId) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}/materiales/${materialId}`, t, {
        method: 'DELETE'
    });
};
export const editMaterialDeClase = (claseId, materialId, formData) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/clases/${claseId}/materiales/${materialId}`, t, {
        method: 'PUT',
        body: formData
    });
};

// --- 5. Funciones Tareas ---
export const getTareaDetalle = (tareaId) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/${tareaId}`, t);
};
export const addComentarioATarea = (tareaId, texto) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/${tareaId}/comentar`, t, {
        method: 'POST',
        body: { texto } // Es JSON
    });
};
export const addEntregaATarea = (tareaId, formData) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/${tareaId}/entregar`, t, {
        method: 'POST',
        body: formData // Es FormData
    });
};
export const calificarEntrega = (entregaId, calificacion, comentarioProfesor) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/entrega/${entregaId}/calificar`, t, {
        method: 'POST',
        body: { calificacion, comentarioProfesor } // Es JSON
    });
};
export const anularEntrega = (entregaId) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/entrega/${entregaId}`, t, {
        method: 'DELETE'
    });
};
export const editTarea = (tareaId, formData) => {
    const t = localStorage.getItem('token');
    if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } });
    return protectedFetch(`/tarea/${tareaId}`, t, {
        method: 'PUT',
        body: formData
    });
};

// --- 6. Funciones Perfil ---
export const getProfile = () => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } }); return protectedFetch('/usuarios/perfil', t); };
export const updateProfile = (d) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } }); return protectedFetch('/usuarios/perfil', t, { method: 'PUT', body: d }); };
export const updateTheme = (th) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } }); return protectedFetch('/usuarios/config/tema', t, { method: 'PUT', body: { tema: th } }); };

// --- 7. Funciones Seguimiento (Observatorio) ---
export const createSeguimiento = (n, e, la, ln) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch('/seguimiento', t, { method: 'POST', body: { nombrePlanta:n, especie:e, lat:la, lng:ln } }); };
export const getSeguimientos = () => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch('/seguimiento', t); };
export const addObservacion = (id, data) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token requerido" } }); return protectedFetch(`/seguimiento/${id}/observar`, t, { method: 'POST', body: data }); };
export const downloadInforme = (id) => { const t=localStorage.getItem('token'); if(!t){return Promise.reject({ok:!1,status:401,data:{msg:"Token requerido"}});} return fetch(`${API_V1_URL}/seguimiento/${id}/informe`,{headers:{'x-token':t}});};
export const addObservacionFenologica = (id, data) => { const t=localStorage.getItem('token'); if (!t) return Promise.resolve({ ok: false, data: { msg: "Token no encontrado" } }); return protectedFetch(`/seguimiento/${id}/fenologia`, t, { method: 'POST', body: data }); };