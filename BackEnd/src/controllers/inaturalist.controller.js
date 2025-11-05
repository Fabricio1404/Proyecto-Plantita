// backend/src/controllers/inaturalist.controller.js

const axios = require('axios');
const API = "https://api.inaturalist.org/v1";
const ARG = "7190"; // Argentina

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

/* --- Helpers --- */

// ===== INICIO DE LA MODIFICACIÓN (Arreglo Wikipedia 403) =====
// Configuración de Axios con User-Agent para Wikipedia
const axiosOptions = {
    headers: {
        // Identificamos nuestra app para que Wikipedia no nos bloquee
        'User-Agent': 'InForestApp/1.0 (info@inforest.com) axios/1.0'
    }
};
// ===== FIN DE LA MODIFICACIÓN =====

// Función para buscar en Wikipedia (usada por getFullTaxonDetails)
async function fetchWikipedia(taxonName, wikipediaUrl) {
    let sourceTitle = taxonName;
    if (wikipediaUrl) { try { const u = new URL(wikipediaUrl); const parts = u.pathname.split("/").filter(Boolean); sourceTitle = decodeURIComponent(parts.pop() || ""); } catch {} }

    // 1. Intentar en Español
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(sourceTitle)}&prop=text&format=json&redirects=1&origin=*`;
        const { data } = await axios.get(url, axiosOptions); // <-- Usar opciones
        const html = data?.parse?.text?.["*"] || "";
        if (html) {
            const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script', 'style', 'iframe', 'video'], FORBID_ATTR: ['onerror', 'onload'] });
            return { lang: 'es', html: clean };
        }
    } catch (e) { console.warn(`Wikipedia ES lookup failed for ${sourceTitle}: ${e.message}`); }

    // 2. Fallback a Inglés
    try {
        const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(sourceTitle)}&prop=text&format=json&redirects=1&origin=*`;
        const { data } = await axios.get(url, axiosOptions); // <-- Usar opciones
        const html = data?.parse?.text?.["*"] || "";
        if (html) {
            const clean = DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script', 'style', 'iframe', 'video'], FORBID_ATTR: ['onerror', 'onload'] });
            return { lang: 'en', html: clean };
        }
    } catch (e) { console.warn(`Wikipedia EN lookup failed for ${sourceTitle}: ${e.message}`); }

    return null;
}

// Función genérica proxyRequest
const proxyRequest = async (req, res, path) => {
    try {
        const params = new URLSearchParams(req.query);
        const url = `${API}/${path}?${params.toString()}`;
        console.log(`[iNaturalist Proxy] Calling: ${url}`);
        const { data } = await axios.get(url);
        res.json(data);
    } catch (error) {
        console.error(`❌ Error en proxyRequest para ${path}:`, error.message);
        if (error.response) {
            return res.status(error.response.status).json({ msg: `Error de iNaturalist: ${error.response.statusText}` });
        }
        res.status(500).json({ msg: `Error al contactar iNaturalist: ${error.message}` });
    }
};

/* --- Controladores (Endpoints) --- */
const searchTaxa = (req, res) => {
    req.query.place_id = ARG;
    req.query.preferred_place_id = ARG;
    req.query.locale = 'es';
    proxyRequest(req, res, 'taxa');
};

const getObservations = (req, res) => {
    req.query.place_id = ARG;
    req.query.verifiable = 'true';
    req.query.geo = 'true';
    proxyRequest(req, res, 'observations');
};

// Controlador de Detalle (con manejo de errores internos)
const getFullTaxonDetails = async (req, res) => {
    console.log(`🚀 Se alcanzó getFullTaxonDetails! ID solicitado: ${req.params.id}`);
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: 'ID de taxón requerido' });

    let R = {};
    try {
        // --- 1. Datos base del Taxón (CRÍTICO) ---
        const taxonApiUrl = `${API}/taxa/${id}`;
        const taxonParams = { locale: 'es', preferred_place_id: ARG, all_names: 'true' };
        console.log(`📞 Llamando a iNaturalist para datos base: ${taxonApiUrl} con params:`, taxonParams);
        const { data: taxaData } = await axios.get(taxonApiUrl, { params: taxonParams });
        R.taxon = taxaData.results?.[0];

        if (!R.taxon) {
            console.warn(`⚠️ Taxón con ID ${id} no encontrado en iNaturalist. Respondiendo 404.`);
            return res.status(404).json({ msg: 'Taxón no encontrado' });
        }
        console.log(`✔️ Taxón base encontrado: ${R.taxon.name} (ID: ${R.taxon.id})`);

        // --- Llamadas SECUNDARIAS (Si fallan, continuamos) ---
        const safeAxiosGet = async (url, params = {}, logPrefix = '') => {
            try {
                console.log(`📞 ${logPrefix} Llamando a ${url} con params:`, params);
                const { data } = await axios.get(url, { params });
                console.log(`✔️ ${logPrefix} Respuesta recibida.`);
                return data;
            } catch (error) {
                console.warn(`⚠️ ${logPrefix} Falló la llamada a ${url}: ${error.message} (Status: ${error.response?.status}) - Continuando sin estos datos.`);
                return null;
            }
        };

        // 2. Wikipedia (Ahora usa fetchWikipedia modificado)
        console.log('📞 Buscando en Wikipedia...');
        R.wikipedia = await fetchWikipedia(R.taxon.name, R.taxon.wikipedia_url);
        console.log(R.wikipedia ? `✔️ Wikipedia encontrada (lang: ${R.wikipedia.lang})` : '⚠️ Wikipedia no encontrada.');

        // 3. Status en Argentina
        const listedData = await safeAxiosGet(`${API}/listed_taxa`, { place_id: ARG, taxon_id: id }, 'Estado AR');
        R.listed_taxa = listedData?.results?.[0];

        // 4. Observaciones recientes
        const recentData = await safeAxiosGet(`${API}/observations`, { place_id: ARG, verifiable: 'true', order: 'desc', order_by: 'created_at', taxon_id: id, per_page: 18 }, 'Obs Recientes');
        R.recent_observations = recentData?.results;

        // 5. Observaciones para el mapa
        const mapObsData = await safeAxiosGet(`${API}/observations`, { place_id: ARG, verifiable: 'true', geo: 'true', taxon_id: id, per_page: 200 }, 'Obs Mapa');
        R.map_observations = mapObsData;

        // 6. Histograma (Mes)
        const histMonthData = await safeAxiosGet(`${API}/observations/histogram`, { place_id: ARG, taxon_id: id, verifiable: 'true', interval: 'month' }, 'Hist Mes');
        R.histogram_month = histMonthData?.results?.month;

        // 7. Histograma (Hora)
        const histHourData = await safeAxiosGet(`${API}/observations/histogram`, { place_id: ARG, taxon_id: id, verifiable: 'true', interval: 'hour' }, 'Hist Hora');
        R.histogram_hour = histHourData?.results?.hour;

        // 8. Top Observers
        const observersData = await safeAxiosGet(`${API}/observations/observers`, { place_id: ARG, taxon_id: id, verifiable: 'true', per_page: 24 }, 'Top Obs');
        R.observers = observersData?.results;

        // 9. Top Identifiers
        const identifiersData = await safeAxiosGet(`${API}/observations/identifiers`, { place_id: ARG, taxon_id: id, verifiable: 'true', per_page: 24 }, 'Top ID');
        R.identifiers = identifiersData?.results;

        // 10. Especies Similares
        const similarData = await safeAxiosGet(`${API}/taxa/similar`, { taxon_id: id, per_page: 24 }, 'Similares');
        R.similar = similarData?.results;

        console.log('✅✅✅ Enviando respuesta (posiblemente parcial) al frontend.');
        res.json(R);

    } catch (error) {
        console.error(`❌ Error CRÍTICO en getFullTaxonDetails para ID ${id}:`, error.message);
        if (error.response) {
            console.error(`Axios Error Status: ${error.response.status}, URL: ${error.config.url}`);
            if (error.response.status === 404) { return res.status(404).json({ msg: 'Taxón no encontrado en iNaturalist.' }); }
            return res.status(error.response.status).json({ msg: `Error de iNaturalist (${error.response.status}): ${error.response.statusText}` });
        }
        res.status(500).json({ msg: `Error al obtener detalles del taxón: ${error.message}` });
    }
};

module.exports = {
    searchTaxa,
    getObservations,
    getFullTaxonDetails
};