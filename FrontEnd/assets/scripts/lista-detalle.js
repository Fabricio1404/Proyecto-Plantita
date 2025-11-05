// frontend/assets/scripts/lista-detalle.js

// Importa SÓLO las funciones necesarias de api.js
import { getListaPorId, deleteEspecieFromLista } from './api.js'; 

// --- Selectores DOM ---
const $ = (s) => document.querySelector(s);
const listNameTitle = $('#list-name-title');
const listDescriptionSubtitle = $('#list-description-subtitle');
const speciesContainer = $('#list-species-container');

// Obtener el ID de la lista desde la URL
const params = new URLSearchParams(location.search);
const listaId = params.get("id");

/**
 * Función para escapar HTML y prevenir XSS
 */
function escapeHTML(s){
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}

/** Carga los detalles y las especies de la lista */
async function loadListaDetalle() {
    if (!listaId) {
        if (listNameTitle) listNameTitle.textContent = "Error";
        if (listDescriptionSubtitle) listDescriptionSubtitle.textContent = "No se proporcionó ID de lista.";
        if (speciesContainer) speciesContainer.innerHTML = `<p class="error">Error: ID de lista no válido.</p>`;
        return;
    }

    if (!speciesContainer) return;
    speciesContainer.innerHTML = '<p>Cargando detalles de la lista...</p>';

    const response = await getListaPorId(listaId);

    if (response.ok && response.data.lista) {
        const lista = response.data.lista;
        
        if (listNameTitle) listNameTitle.textContent = escapeHTML(lista.nombre);
        if (listDescriptionSubtitle) listDescriptionSubtitle.textContent = escapeHTML(lista.descripcion) || (lista.publica ? 'Lista pública' : 'Lista privada');

        // Renderizar especies
        if (lista.especies.length === 0) {
            speciesContainer.innerHTML = '<p>Esta lista está vacía. Añade especies desde la página de detalles.</p>';
            return;
        }
        
        speciesContainer.innerHTML = lista.especies.map(specie => createSpeciesCard(specie)).join('');
        
        // Añadir listener para quitar especies
        setupRemoveListeners();

    } else {
        // Muestra el error 404 (Not Found) o 403 (Forbidden)
        speciesContainer.innerHTML = `<p class="error">Error al cargar la lista: ${response.data?.msg || 'No se pudo cargar.'}</p>`;
        if (listNameTitle) listNameTitle.textContent = "Error";
        if (listDescriptionSubtitle) listDescriptionSubtitle.textContent = response.data?.msg || 'Error';
    }
}

/** Crea el HTML para una tarjeta de especie (estilo 'list-card') */
function createSpeciesCard(specie) {
    // specie aquí es el sub-documento guardado en tu Lista.model.js
    const taxonOrigen = specie.taxon || 'plantas'; // Default a plantas si no se guardó
    
    return `
        <div class="card list-card" data-inat-id="${specie.inaturalist_id}">
            <div class="species-info">
                <h4>${escapeHTML(specie.nombreComun || 'Especie')}</h4>
                <p>(${escapeHTML(specie.nombreCientifico)})</p>
                <p class="muted" style="font-size: 0.85em; margin-top: 10px;">
                    Taxón: ${escapeHTML(specie.taxon)}
                </p>
                
                <div style="margin-top: 15px; display: flex; gap: 8px;">
                    <a href="detail.html?id=${specie.inaturalist_id}&from=${taxonOrigen}" class="btn btn-sm secondary" data-action="view-detail">Ver Detalles</a>
                    <button class="btn btn-sm ghost btn-danger btn-remove-from-list" data-action="remove" data-id="${specie.inaturalist_id}">Quitar</button>
                </div>
            </div>
        </div>
    `;
}

/** Añade listeners para los botones "Quitar" */
function setupRemoveListeners() {
    if (!speciesContainer) return;
    
    speciesContainer.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-action="remove"]');
        if (!target) return;
        
        const inatId = target.dataset.id;
        if (!inatId) return;

        // Lógica para quitar especie
        handleRemoveSpecies(listaId, inatId, target);
    });
}

/** Maneja el clic en "Quitar" */
async function handleRemoveSpecies(listaId, inatId, button) {
    const card = button.closest('.card');
    const speciesName = card.querySelector('h4').textContent;

    if (confirm(`¿Quitar "${speciesName}" de esta lista?`)) {
        button.textContent = 'Quitando...';
        button.disabled = true;
        
        // Debes crear esta función en api.js y el endpoint en el backend
        // const response = await deleteEspecieFromLista(listaId, inatId); 
        
        // Simulación (borra esta línea cuando implementes el backend)
        const response = { ok: false, data: { msg: "Función 'Quitar Especie' no implementada en el backend." } }; 
        
        if (response.ok) {
            card.style.transition = 'opacity 0.3s ease-out';
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 300);
        } else {
            alert(`Error: ${response.data.msg}`);
            button.textContent = 'Quitar';
            button.disabled = false;
        }
    }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // ui-helpers.js se carga primero (asumido en el HTML)
    loadListaDetalle();
});