import { getEspecies } from './api.js';

const isPlantasPage = window.location.pathname.includes('plantas.html');
const isInsectosPage = window.location.pathname.includes('insectos.html');
const gridPlantasSel = '#plant-results';
const gridInsectosSel = '#insect-results';
const gridSel = isPlantasPage ? gridPlantasSel : gridInsectosSel;

// Estado para scroll infinito
let currentPage = 1;
let currentQuery = '';
let currentTaxon = '';
let isLoading = false;
let noMoreResults = false;
const PER_PAGE = 30; // Coincide con la API

// Crear tarjeta de especie
const createSpeciesCard = (specie) => {
    const imgUrl = specie.default_photo?.medium_url || './assets/img/default_placeholder.jpg';
    const nombreComun = specie.preferred_common_name || 'Nombre no disponible';
    const nombreCientifico = specie.name || 'Nombre científico no disponible';

    return `
        <div class="card" data-id="${specie.id}">
            <img src="${imgUrl}" alt="${nombreComun}" loading="lazy">
            <div class="species-info">
                <h4>${nombreComun}</h4>
                <p>(${nombreCientifico})</p>
                <button class="btn btn-sm btn-primary btn-details">Ver Detalles</button>
            </div>
        </div>
    `;
};

// Cargar especies (paginación)
async function loadSpecies(taxon, query, page) {
    // Evita cargas duplicadas o innecesarias
    if (isLoading || noMoreResults) return; 
    isLoading = true;

    const resultsContainer = document.querySelector(gridSel);
    const totalContainer = document.querySelector('#total-results');
    
    let loadingMessage;
    if (page === 1) {
        resultsContainer.innerHTML = '<p>Buscando...</p>';
        if (totalContainer) totalContainer.textContent = '...';
    } else {
        // Muestra un indicador de "Cargando..." al final
        loadingMessage = document.createElement('p');
        loadingMessage.textContent = 'Cargando más especies...';
        loadingMessage.className = 'loading-more';
        loadingMessage.style.gridColumn = '1 / -1'; // Abarca todo el ancho
        loadingMessage.style.textAlign = 'center';
        resultsContainer.appendChild(loadingMessage);
    }

    // Llamada a la API (ahora pasa la página)
    const response = await getEspecies(taxon, query, page);

    // Quita el indicador de "Cargando..."
    if (loadingMessage) loadingMessage.remove();

    if (response && response.ok) {
        const especies = response.data.results || [];
        
        if (page === 1) {
            // Actualiza el total solo en la primera página
            const total = response.data.total_results || 0;
            if (totalContainer) totalContainer.textContent = total.toLocaleString('es-AR');
            
            // Reemplaza el contenido si es una nueva búsqueda
            if (especies.length === 0) {
                resultsContainer.innerHTML = `<p>No se encontraron resultados para "${query || 'Búsqueda Global'}".</p>`;
                noMoreResults = true; // No hay nada que cargar
            } else {
                resultsContainer.innerHTML = especies.map(createSpeciesCard).join('');
            }
        } else {
            // Añade el contenido al final si es scroll infinito
            if (especies.length > 0) {
                resultsContainer.insertAdjacentHTML('beforeend', especies.map(createSpeciesCard).join(''));
            }
        }

        // Si la API devuelve menos de 30, asumimos que es la última página
        if (especies.length < PER_PAGE) {
            noMoreResults = true;
            if (resultsContainer.innerHTML !== '') { // Evita mostrar si la búsqueda inicial no trajo nada
                 resultsContainer.insertAdjacentHTML('beforeend', '<p style="grid-column: 1 / -1; text-align: center; color: var(--muted); margin-top: 20px;">Fin de los resultados.</p>');
            }
        }

    } else if (response) {
        // Manejo de error
        const errorMsg = response.data?.msg || 'Fallo de conexión.';
        if (page === 1) {
            resultsContainer.innerHTML = `<p style="color: red;">Error ${response.status}: ${errorMsg}</p>`;
            if (totalContainer) totalContainer.textContent = '0';
        } else {
             resultsContainer.insertAdjacentHTML('beforeend', `<p style="grid-column: 1 / -1; text-align: center; color: red;">Error al cargar más: ${errorMsg}</p>`);
        }
    } else {
        resultsContainer.innerHTML = `<p style="color: red;">Error: No se pudo conectar con el servidor.</p>`;
        if (totalContainer) totalContainer.textContent = '0';
    }
    
    // Libera el bloqueo para permitir la próxima carga
    isLoading = false;
}

// Buscar especies
function triggerSearch() {
    currentPage = 1;
    noMoreResults = false;
    currentQuery = document.getElementById(isPlantasPage ? 'plant-search' : 'insect-search').value.trim();
    loadSpecies(currentTaxon, currentQuery, currentPage);
}

// Scroll infinito
function setupInfiniteScroll() {
    // El 'div.main' es el que tiene el scroll, no 'window'
    const mainContainer = document.querySelector('.main');
    if (!mainContainer) return;

    mainContainer.addEventListener('scroll', () => {
        // Si estamos cargando o ya no hay resultados, no hacer nada
        if (isLoading || noMoreResults) return;

        const { scrollTop, scrollHeight, clientHeight } = mainContainer;
        
        // Cargar 300px antes de llegar al final
        if (scrollTop + clientHeight >= scrollHeight - 300) {
            currentPage++;
            loadSpecies(currentTaxon, currentQuery, currentPage);
        }
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    currentTaxon = isPlantasPage ? 'plantas' : 'insectos';

    // Asignar eventos de búsqueda
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById(isPlantasPage ? 'plant-search' : 'insect-search');

    if (searchButton) {
        searchButton.addEventListener('click', triggerSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') triggerSearch();
        });
    }

    // Carga inicial (página 1 de la búsqueda vacía)
    triggerSearch();

    // Configura el listener de scroll
    setupInfiniteScroll();

    // Evento para 'Ver Detalles' (delegación de eventos - sin cambios)
    const resultsContainer = document.querySelector(gridSel);
    if (resultsContainer) {
        resultsContainer.addEventListener('click', (e) => {
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