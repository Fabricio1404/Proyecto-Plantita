// frontend/assets/scripts/main.js (extracto de render)
import { getEspecies } from './api.js';

const currentPath = window.location.pathname;
const isPlantasPage = currentPath.endsWith('/plantas.html') || currentPath.endsWith('plantas.html');
const isInsectosPage = currentPath.endsWith('/insectos.html') || currentPath.endsWith('insectos.html');

const makeCard = (s) => {
  const img = (s.imagenes && s.imagenes[0] && s.imagenes[0].url) || './assets/img/default_placeholder.jpg';
  return `<div class="species-card">
    <img src="${img}" alt="${s.nombreComun || s.nombreCientifico}">
    <div class="species-info">
      <h4>${s.nombreComun}</h4>
      <p>(${s.nombreCientifico})</p>
      <p>Ubicación: ${s.ubicacion?.display || '—'}</p>
      ${s.url ? `<a class="btn btn-sm" href="${s.url}" target="_blank" rel="noopener">Ver en iNaturalist</a>` : ''}
    </div>
  </div>`;
};

document.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token');
  if (!token) { window.location.href = 'auth.html'; return; }

  if (isPlantasPage || isInsectosPage) {
    const taxon = isPlantasPage ? 'plantas' : 'insectos';
    const grid = document.querySelector(isPlantasPage ? '#plant-results' : '#insect-results');
    grid.innerHTML = '<p>Cargando...</p>';
    const { ok, data, status } = await getEspecies(taxon);
    if (!ok) {
      grid.innerHTML = `<p>Error (${status}). ¿Iniciaste sesión? ¿El backend en ${window.API_V1_URL || 'http://localhost:4000/api/v1'} está levantado?</p>`;
      return;
    }
    const items = data.data || data; // soportar ambas formas
    if (!items.length) {
      grid.innerHTML = '<p>No se encontraron resultados.</p>';
      return;
    }
    grid.innerHTML = items.map(makeCard).join('');
  }
});
