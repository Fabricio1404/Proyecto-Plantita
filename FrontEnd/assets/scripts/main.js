// frontend/assets/scripts/main.js (Versión Simplificada de Carga)

import { getEspecies } from './api.js';

const isPlantasPage = window.location.pathname.includes('plantas.html');
const isInsectosPage = window.location.pathname.includes('insectos.html');
const gridPlantasSel = '#plant-results';
const gridInsectosSel = '#insect-results';
const gridSel = isPlantasPage ? gridPlantasSel : gridInsectosSel; // Determinar el selector correcto

// Función para crear la tarjeta (debe coincidir con la estructura del backend)
const createSpeciesCard = (specie) => {
    // Usar la foto por defecto de iNaturalist
    const imgUrl = specie.default_photo?.medium_url || './assets/img/default_placeholder.jpg';
    const nombreComun = specie.preferred_common_name || 'Nombre no disponible';
    const nombreCientifico = specie.name || 'Nombre científico no disponible';

    return `
        <div class="card" data-id="${specie.id}">
            <img src="${imgUrl}" alt="${nombreComun}">
            <div class="species-info">
                <h4>${nombreComun}</h4>
                <p>(${nombreCientifico})</p>
                <button class="btn btn-sm btn-primary btn-details">Ver Detalles</button>
            </div>
        </div>
    `;
};


async function loadSpecies(taxon, query = '') {
    const resultsContainer = document.querySelector(gridSel);
    const totalContainer = document.querySelector('#total-results'); // Para el total
    if (!resultsContainer) {
        console.error("❌ ERROR CRÍTICO: Contenedor de resultados NO encontrado:", gridSel);
        return;
    }

    resultsContainer.innerHTML = `<p>Buscando ${taxon}...</p>`;
    if (totalContainer) totalContainer.textContent = '...';

    // Llamada a la API (ahora usa la ruta /inaturalist/taxa)
    const response = await getEspecies(taxon, query);

    if (response && response.ok) {
        // Los datos de iNaturalist están en response.data.results
        const especies = response.data.results || [];
        const total = response.data.total_results || 0;

        if (totalContainer) totalContainer.textContent = total.toLocaleString('es-AR');

        if (especies.length === 0) {
             resultsContainer.innerHTML = `<p>No se encontraron resultados para "${query || 'Búsqueda Global'}".</p>`;
             return;
        }

        // RENDERIZADO FINAL
        resultsContainer.innerHTML = especies.map(createSpeciesCard).join('');

    } else if (response) {
        const errorMsg = response.data?.msg || 'Fallo de conexión.';
        resultsContainer.innerHTML = `<p style="color: red;">Error ${response.status}: ${errorMsg}</p>`;
        if (totalContainer) totalContainer.textContent = '0';
    } else {
        // Caso de error de red o token inválido manejado en api.js
        resultsContainer.innerHTML = `<p style="color: red;">Error: No se pudo conectar con el servidor.</p>`;
        if (totalContainer) totalContainer.textContent = '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // (Asegúrate de tener un auth-guard.js o una validación de token aquí)
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // Asignar eventos de búsqueda y carga inicial
    const searchButton = document.getElementById('search-button');
    let searchInputId = isPlantasPage ? 'plant-search' : 'insect-search';
    let taxon = isPlantasPage ? 'plantas' : 'insectos';

    // 1. Carga Inicial
    loadSpecies(taxon, '');

    // 2. Evento de Búsqueda (Input y Botón)
    const searchInput = document.getElementById(searchInputId);

    const triggerSearch = () => {
        const query = searchInput.value.trim();
        loadSpecies(taxon, query);
    };

    if (searchButton) {
        searchButton.addEventListener('click', triggerSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    }

    // ===== INICIO DEL BLOQUE CON DEBUGGING =====
    // 3. Evento para 'Ver Detalles' (delegación de eventos)
    const resultsContainer = document.querySelector(gridSel);
    if (resultsContainer) {
        console.log("✅ Contenedor de resultados encontrado:", gridSel); // Mensaje 1

        resultsContainer.addEventListener('click', (e) => {
            console.log("🖱️ Clic detectado dentro del contenedor."); // Mensaje 2

            // Revisamos si se hizo clic DIRECTAMENTE en el botón "Ver Detalles"
            // O en cualquier elemento dentro de él (como el texto)
            const detailsButton = e.target.closest('.btn-details');
            if (detailsButton) {
                console.log("🎯 Botón 'Ver Detalles' (o su interior) clickeado."); // Mensaje 3a

                const card = detailsButton.closest('.card'); // Busca la tarjeta padre
                if (card) {
                    const id = card.dataset.id; // Intenta obtener el ID
                    if (id) {
                        console.log("🧬 ID encontrado:", id, "Redirigiendo..."); // Mensaje 4
                        window.location.href = `detail.html?id=${id}&from=${isPlantasPage ? 'plantas' : 'insectos'}`; // Redirige
                    } else {
                        console.error("❌ ERROR: No se encontró 'data-id' en la tarjeta:", card); // Error A
                    }
                } else {
                    console.error("❌ ERROR: No se encontró la tarjeta (.card) padre del botón."); // Error B
                }
            } else {
                 // Si queremos que CUALQUIER clic en la tarjeta redirija, usamos esto:
                 const card = e.target.closest('.card');
                 if (card) {
                    console.log("🎯 Clic detectado en la tarjeta (no necesariamente en el botón)."); // Mensaje 3c
                    const id = card.dataset.id;
                    if (id) {
                         console.log("🧬 ID encontrado:", id, "Redirigiendo..."); // Mensaje 4
                         window.location.href = `detail.html?id=${id}&from=${isPlantasPage ? 'plantas' : 'insectos'}`;
                    } else {
                         console.error("❌ ERROR: No se encontró 'data-id' en la tarjeta:", card); // Error A
                    }
                 } else {
                    console.log("ℹ️ Clic fue fuera de una tarjeta:", e.target); // Mensaje 3b
                 }
            }
        });
    } else {
        // Si ves este error, el selector '#plant-results' o '#insect-results' está mal en tu HTML.
        console.error("❌ ERROR: Contenedor de resultados NO encontrado:", gridSel); // Error C
    }
    // ===== FIN DEL BLOQUE CON DEBUGGING =====
});