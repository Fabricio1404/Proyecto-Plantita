// frontend/assets/scripts/api.js (solo la parte relevante)
export const API_V1_URL = (window.API_V1_URL) || 'http://localhost:4000/api/v1';

export const protectedFetch = async (endpoint, token, options = {}) => {
  const res = await fetch(`${API_V1_URL}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
};

export const getEspecies = async (taxon, query = '') => {
  const token = localStorage.getItem('token');
  if (!token) return { ok: false, status: 401, data: { msg: 'Sin token' } };
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return protectedFetch(`/especies/${taxon}${qs}`, token);
};
