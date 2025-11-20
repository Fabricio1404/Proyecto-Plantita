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
// Evitar duplicados entre páginas
const seenSpeciesIds = new Set();

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
    let response = await getEspecies(taxon, query, page);

    // Quita el indicador de "Cargando..."
    if (loadingMessage) loadingMessage.remove();

    if (response && response.ok) {
        // Intentaremos evitar duplicados entre páginas. Si la página recibida
        // contiene sólo especies ya vistas, seguiremos pidiendo páginas
        // siguientes hasta encontrar nuevas o hasta un límite de intentos.
        let especies = response.data.results || [];
        const total = response.data.total_results || 0;

        let pageCursor = page;
        let attempts = 0;
        const MAX_ATTEMPTS = 5;

        // Filtrar especies ya vistas
        let uniqueEspecies = especies.filter(s => !seenSpeciesIds.has(String(s.id)));

        while (uniqueEspecies.length === 0 && especies.length === PER_PAGE && attempts < MAX_ATTEMPTS) {
            // Todas las especies de esta página ya se mostraron: pedir la siguiente página
            attempts++;
            pageCursor++;
            response = await getEspecies(taxon, query, pageCursor);
            if (!response || !response.ok) break;
            especies = response.data.results || [];
            uniqueEspecies = especies.filter(s => !seenSpeciesIds.has(String(s.id)));
        }

        // Actualiza total en la primera página
        if (page === 1) {
            if (totalContainer) totalContainer.textContent = total.toLocaleString('es-AR');
        }

        // Si es la primera página y no hay resultados
        if (page === 1 && (!especies || especies.length === 0)) {
            resultsContainer.innerHTML = `<p>No se encontraron resultados para "${query || 'Búsqueda Global'}".</p>`;
            noMoreResults = true;
            isLoading = false;
            return;
        }

        // Si hay especies únicas, las renderizamos
        if (uniqueEspecies.length > 0) {
            if (page === 1) {
                // Reemplaza el contenido en búsqueda inicial con sólo las únicas
                resultsContainer.innerHTML = uniqueEspecies.map(createSpeciesCard).join('');
            } else {
                resultsContainer.insertAdjacentHTML('beforeend', uniqueEspecies.map(createSpeciesCard).join(''));
            }

            // Marcar IDs como vistos
            uniqueEspecies.forEach(s => seenSpeciesIds.add(String(s.id)));

            // Si pageCursor avanzó (porque algunas páginas fueron saltadas), sincronizamos currentPage
            currentPage = pageCursor;
        } else {
            // No se encontraron especies nuevas tras intentar páginas siguientes
            noMoreResults = true;
            if (resultsContainer.innerHTML !== '') {
                resultsContainer.insertAdjacentHTML('beforeend', '<p style="grid-column: 1 / -1; text-align: center; color: var(--muted); margin-top: 20px;">Fin de los resultados.</p>');
            }
        }

        // Si la última página leída tenía menos de PER_PAGE, asumimos fin
        if (especies.length < PER_PAGE) {
            noMoreResults = true;
            // Solo mostrar el mensaje de "Fin" si no se ha mostrado antes
            if (!document.querySelector('.end-of-results-message')) {
                resultsContainer.insertAdjacentHTML('beforeend', '<p class="end-of-results-message" style="grid-column: 1 / -1; text-align: center; color: var(--muted); margin-top: 20px;">Fin de los resultados.</p>');
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
async function triggerSearch() {
    currentPage = 1;
    noMoreResults = false;
    currentQuery = document.getElementById(isPlantasPage ? 'plant-search' : 'insect-search').value.trim();
    // Reset seen IDs so nuevas búsquedas no muestran duplicados de búsquedas anteriores
    seenSpeciesIds.clear();
    await loadSpecies(currentTaxon, currentQuery, currentPage);
}

// Scroll infinito




function setupInfiniteScroll() {
    const resultsContainer = document.querySelector(gridSel);
    if (!resultsContainer) return;

    // Añadir un sentinel al final de la lista para IntersectionObserver
    let sentinel = document.getElementById('infinite-scroll-sentinel');
    if (!sentinel) {
        sentinel = document.createElement('div');
        sentinel.id = 'infinite-scroll-sentinel';
        sentinel.style.cssText = 'width:100%;height:1px;';
        resultsContainer.after(sentinel);
    }

    const mainContainer = document.querySelector('.main');

    const onIntersect = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading && !noMoreResults) {
                currentPage++;
                loadSpecies(currentTaxon, currentQuery, currentPage);
            }
        });
    };

    // Observer que usa la caja principal como root si existe, sino usa viewport
    const observerOptions = {
        root: mainContainer || null,
        rootMargin: '300px',
        threshold: 0
    };

    const observer = new IntersectionObserver(onIntersect, observerOptions);
    observer.observe(sentinel);

    // Fallback: si el navegador no soporta IntersectionObserver, mantiene los listeners de scroll
    if (typeof IntersectionObserver === 'undefined') {
        const checkAndLoad = (scrollEl) => {
            if (isLoading || noMoreResults) return;
            let scrollTop, scrollHeight, clientHeight;
            if (scrollEl === window) {
                scrollTop = window.scrollY || document.documentElement.scrollTop;
                scrollHeight = document.documentElement.scrollHeight;
                clientHeight = window.innerHeight;
            } else {
                scrollTop = scrollEl.scrollTop;
                scrollHeight = scrollEl.scrollHeight;
                clientHeight = scrollEl.clientHeight;
            }
            if (scrollTop + clientHeight >= scrollHeight - 300) {
                currentPage++;
                loadSpecies(currentTaxon, currentQuery, currentPage);
            }
        };
        mainContainer && mainContainer.addEventListener('scroll', () => checkAndLoad(mainContainer));
        window.addEventListener('scroll', () => checkAndLoad(window));
    }
}

// Si el contenido no llena la ventana, cargar páginas adicionales hasta completar
async function ensureContentFill() {
    try {
        const mainContainer = document.querySelector('.main');
        const resultsContainer = document.querySelector(gridSel);
        if (!mainContainer || !resultsContainer) return;

        // Si el contenido es menor que la altura visible, intentar cargar la siguiente página
        let attempts = 0;
        const MAX_FILL_ATTEMPTS = 5;
        while (!isLoading && !noMoreResults && attempts < MAX_FILL_ATTEMPTS && (resultsContainer.scrollHeight <= mainContainer.clientHeight + 200)) {
            attempts++;
            currentPage++;
            // console.debug('ensureContentFill: loading page', currentPage);
            await loadSpecies(currentTaxon, currentQuery, currentPage);
            // small delay to allow DOM to update
            await new Promise(r => setTimeout(r, 120));
        }
    } catch (err) {
        console.error('Error in ensureContentFill:', err);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth.html';
        return;
    }

    currentTaxon = isPlantasPage ? 'plantas' : 'insectos';

    // Asignar eventos de búsqueda
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById(isPlantasPage ? 'plant-search' : 'insect-search');

    const performSearch = async () => {
        await triggerSearch();
        await ensureContentFill();
    };

    if (searchButton) {
        searchButton.addEventListener('click', performSearch);
    }
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Configura el listener de scroll ANTES de la carga inicial
    setupInfiniteScroll();

    // Carga inicial y llenado de contenido
    await performSearch();

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