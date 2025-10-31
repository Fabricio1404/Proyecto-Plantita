import { getEspecies } from './api.js';

const isPlantasPage = window.location.pathname.includes('plantas.html');
const isInsectosPage = window.location.pathname.includes('insectos.html');
const gridPlantasSel = '#plant-results';
const gridInsectosSel = '#insect-results';
const gridSel = isPlantasPage ? gridPlantasSel : gridInsectosSel;

// Función para crear la tarjeta (debe coincidir con la estructura del backend)
const createSpeciesCard = (specie) => {
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
    const totalContainer = document.querySelector('#total-results');
    if (!resultsContainer) {
        console.error("ERROR CRÍTICO: Contenedor de resultados NO encontrado:", gridSel);
        return;
    }

    resultsContainer.innerHTML = `<p>Buscando ${taxon}...</p>`;
    if (totalContainer) totalContainer.textContent = '...';

    // Llamada a la API
    const response = await getEspecies(taxon, query);

    if (response && response.ok) {
        const especies = response.data.results || [];
        const total = response.data.total_results || 0;

        if (totalContainer) totalContainer.textContent = total.toLocaleString('es-AR');

        if (especies.length === 0) {
             resultsContainer.innerHTML = `<p>No se encontraron resultados para "${query || 'Búsqueda Global'}".</p>`;
             return;
        }

        resultsContainer.innerHTML = especies.map(createSpeciesCard).join('');

    } else if (response) {
        const errorMsg = response.data?.msg || 'Fallo de conexión.';
        resultsContainer.innerHTML = `<p style="color: red;">Error ${response.status}: ${errorMsg}</p>`;
        if (totalContainer) totalContainer.textContent = '0';
    } else {
        resultsContainer.innerHTML = `<p style="color: red;">Error: No se pudo conectar con el servidor.</p>`;
        if (totalContainer) totalContainer.textContent = '0';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    // Asignar eventos de búsqueda y carga inicial
    const searchButton = document.getElementById('search-button');
    let searchInputId = isPlantasPage ? 'plant-search' : 'insect-search';
    let taxon = isPlantasPage ? 'plantas' : 'insectos';

    loadSpecies(taxon, '');

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

    // Evento para 'Ver Detalles' (delegación de eventos)
    const resultsContainer = document.querySelector(gridSel);
    if (resultsContainer) {
        resultsContainer.addEventListener('click', (e) => {
            // Permite que cualquier clic en la tarjeta (no solo el botón) redirija
            const card = e.target.closest('.card');
            if (card) {
                const id = card.dataset.id;
                if (id) {
                    window.location.href = `detail.html?id=${id}&from=${isPlantasPage ? 'plantas' : 'insectos'}`;
                } else {
                    console.error("ERROR: No se encontró 'data-id' en la tarjeta:", card);
                }
            }
        });
    } else {
        console.error("ERROR: Contenedor de resultados NO encontrado:", gridSel);
    }
});