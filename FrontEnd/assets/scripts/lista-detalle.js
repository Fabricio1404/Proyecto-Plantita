// frontend/assets/scripts/lista-detalle.js
// v3: Renderiza tarjetas con estilo overlay y botón de quitar

import { getListaPorId, deleteEspecieFromLista } from './api.js';

// --- Selectores DOM ---
const $ = (s) => document.querySelector(s);
const listNameTitle = $('#list-name-title');
const listDescriptionSubtitle = $('#list-description-subtitle');
const speciesContainer = $('#list-species-container');

const params = new URLSearchParams(location.search);
const listaId = params.get("id");

/** Escapar HTML */
function escapeHTML(s){ if (s == null) return ''; return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m])); }

/** Carga los detalles y las especies de la lista */
async function loadListaDetalle() {
    if (!listaId) {
        if (listNameTitle) listNameTitle.textContent = "Error";
        if (listDescriptionSubtitle) listDescriptionSubtitle.textContent = "ID de lista no válido.";
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

        if (lista.especies.length === 0) {
            speciesContainer.innerHTML = '<p>Esta lista está vacía. Añade especies desde la página de detalles.</p>';
            return;
        }
        
        speciesContainer.innerHTML = lista.especies.map(specie => createSpeciesCard(specie)).join('');
        
        setupRemoveListeners();
    } else {
        speciesContainer.innerHTML = `<p class="error">Error al cargar la lista: ${response.data?.msg || 'No se pudo cargar.'}</p>`;
        if (listNameTitle) listNameTitle.textContent = "Error";
        if (listDescriptionSubtitle) listDescriptionSubtitle.textContent = response.data?.msg || 'Error';
    }
}

// ===== INICIO TARJETA OVERLAY (MODIFICADO) =====
/** Crea el HTML para una tarjeta de especie (estilo overlay) */
function createSpeciesCard(specie) {
    const defaultImg = './assets/img/default-placeholder.jpg'; // Un placeholder
    // Usa la imageUrl guardada, o el placeholder si no existe
    const imageUrl = specie.imageUrl || defaultImg;
    
    // Genera el mismo HTML que 'main.js' para el estilo overlay
    return `
        <article class="card" data-inat-id="${specie.inaturalist_id}" data-action="view" role="button" tabindex="0">
            <img src="${imageUrl}" alt="${escapeHTML(specie.nombreComun)}" loading="lazy" data-skeleton>
            
            <div class="species-info">
                <h4>${escapeHTML(specie.nombreComun)}</h4>
                <p>(${escapeHTML(specie.nombreCientifico)})</p>
            </div>
            
            <button class="btn btn-sm btn-danger btn-remove-from-list" 
                    data-action="remove" 
                    data-id="${specie.inaturalist_id}" 
                    title="Quitar de la lista"
                    style="position: absolute; top: 8px; right: 8px; z-index: 2; padding: 2px 6px; font-size: 10px; opacity: 0.8; cursor: pointer;">
                Quitar
            </button>
        </article>
    `;
}
// ===== FIN TARJETA OVERLAY =====

/** Añade listeners para "Quitar" o "Ver Detalles" */
function setupRemoveListeners() {
    if (!speciesContainer) return;
    
    speciesContainer.addEventListener('click', (e) => {
        const targetButton = e.target.closest('button[data-action="remove"]');
        const targetCard = e.target.closest('.card');
        if (!targetCard) return;

        const inatId = targetCard.dataset.inatId;
        if (!inatId) return;

        // Si hizo clic en el botón "Quitar"
        if (targetButton) {
            e.preventDefault(); // Detener la navegación
            e.stopPropagation(); // Detener la navegación
            handleRemoveSpecies(listaId, inatId, targetButton);
            return;
        }

        // Si hizo clic en cualquier otra parte de la tarjeta
        // Redirige a la página de detalle
        window.location.href = `detail.html?id=${inatId}&from=listas`;
    });
}

/** Maneja el clic en "Quitar" */
async function handleRemoveSpecies(listaId, inatId, button) {
    const card = button.closest('.card');
    const speciesName = card.querySelector('h4').textContent;

    if (confirm(`¿Quitar "${speciesName}" de esta lista?`)) {
        button.textContent = '...';
        button.disabled = true;
        
        const response = await deleteEspecieFromLista(listaId, inatId); 
        
        if (response.ok) {
            card.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => card.remove(), 300);
        } else {
            alert(`Error: ${response.data.msg || 'No se pudo quitar la especie.'}`);
            button.textContent = 'Quitar';
            button.disabled = false;
        }
    }
}


// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    loadListaDetalle();
});