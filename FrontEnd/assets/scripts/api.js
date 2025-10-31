const API_V1_URL = 'http://localhost:4000/api/v1'; // URL base del backend

/**
 * Wrapper genérico para fetch que incluye el token JWT
 * y maneja automáticamente la redirección en caso de error 401.
 */
export const protectedFetch = async (endpoint, token, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    'x-token': token, // El backend espera el token en este header
    ...options.headers 
  };
  try {
    const url = `${API_V1_URL}${endpoint}`;
    // console.log(` Llamando a Backend: ${options.method || 'GET'} ${url}`); // Comentario de debug eliminado
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: headers,
      body: (options.body && options.method !== 'GET') ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 401) {
      // Si el token es inválido o expiró, limpia localStorage y redirige al login
      console.error(" Error 401: Token inválido. Redirigiendo.");
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

/**
 * Funciones de Especies (iNaturalist)
 */
export const getEspecies = async (taxon, query = '') => {
  const token = localStorage.getItem('token');
  if (!token) return { ok: false, status: 401, data: { msg: "Token no encontrado" } };
  
  // Mapea el string 'plantas' o 'insectos' a los IDs de taxón de iNaturalist
  const taxaIds = (taxon === 'plantas') ? "47126" : (taxon === 'insectos') ? "47158,47119,48222" : "";
  
  const params = new URLSearchParams();
  if (taxaIds) params.set('taxon_id', taxaIds);
  if (query) params.set('q', query);
  params.set('rank', 'species');
  params.set('order_by', 'observations_count');
  params.set('order', 'desc');
  params.set('per_page', '30');
  
  const endpoint = `/inaturalist/taxa?${params.toString()}`;
  return protectedFetch(endpoint, token);
};

/**
 * Funciones de Listas, Observatorio y Clases
 */
export const createLista = (nombre, descripcion, publica) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/listas',t,{method:'POST',body:{nombre,descripcion,publica}});
};
export const getListas = () => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/listas',t);
};
export const addEspecieToLista = (listaId, especieData) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch(`/listas/${listaId}/especies`,t,{method:'POST',body:especieData});
};
export const createSeguimiento = (nombrePlanta, especie, lat, lng) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/seguimiento',t,{method:'POST',body:{nombrePlanta,especie,lat,lng}});
};
export const getSeguimientos = () => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/seguimiento',t);
};
export const addObservacion = (idSeguimiento, observacionData) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch(`/seguimiento/${idSeguimiento}/observar`,t,{method:'POST',body:observacionData});
};
export const downloadInforme = (idSeguimiento) => {
  const t=localStorage.getItem('token'); if(!t){return Promise.reject({ok:!1,status:401,data:{msg:"Token requerido"}});} return fetch(`${API_V1_URL}/seguimiento/${idSeguimiento}/informe`,{headers:{'x-token':t}});
};
export const createClase = (nombre) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases',t,{method:'POST',body:{nombre}});
};
export const joinClase = (codigoAcceso) => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases/unirse',t,{method:'POST',body:{codigoAcceso}});
};
export const getMisClases = () => {
  const t=localStorage.getItem('token'); if(!t) return{ok:!1,data:{msg:"Token requerido"}}; return protectedFetch('/clases',t);
};

/**
 * Funciones de Perfil de Usuario
 */
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
export const updateTheme = (themeName) => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve({ ok: false, status: 401, data: { msg: "Token no encontrado" } });
    return protectedFetch('/usuarios/config/tema', token, {
        method: 'PUT',
        body: { tema: themeName }
    });
};