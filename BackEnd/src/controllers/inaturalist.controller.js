/**
 * Controladores que funcionan como proxy hacia la API de iNaturalist.
 * Utiliza caché en memoria (12h) para respuestas de detalle.
 */
const NodeCache = require('node-cache');
const inatCache = new NodeCache({ stdTTL: 43200 }); // 12 horas

const axios = require('axios');
const API = 'https://api.inaturalist.org/v1';
const ARG = '7190'; // Argentina

const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const axiosOptions = { headers: { 'User-Agent': 'InForestApp/1.0 (info@inforest.com) axios/1.0' } };

async function fetchWikipedia(taxonName, wikipediaUrl) {
    let sourceTitle = taxonName;
    if (wikipediaUrl) { try { const u = new URL(wikipediaUrl); const parts = u.pathname.split('/').filter(Boolean); sourceTitle = decodeURIComponent(parts.pop() || ''); } catch {} }

    // Intentar en Español, fallback a Inglés
    try {
        const url = `https://es.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(sourceTitle)}&prop=text&format=json&redirects=1&origin=*`;
        const { data } = await axios.get(url, axiosOptions);
        const html = data?.parse?.text?.['*'] || '';
        if (html) return { lang: 'es', html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script', 'style', 'iframe', 'video'], FORBID_ATTR: ['onerror', 'onload'] }) };
    } catch (e) { console.warn(`Wikipedia ES lookup failed for ${sourceTitle}: ${e.message}`); }

    try {
        const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(sourceTitle)}&prop=text&format=json&redirects=1&origin=*`;
        const { data } = await axios.get(url, axiosOptions);
        const html = data?.parse?.text?.['*'] || '';
        if (html) return { lang: 'en', html: DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['script', 'style', 'iframe', 'video'], FORBID_ATTR: ['onerror', 'onload'] }) };
    } catch (e) { console.warn(`Wikipedia EN lookup failed for ${sourceTitle}: ${e.message}`); }

    return null;
}

const proxyRequest = async (req, res, path) => {
    try {
        const params = new URLSearchParams(req.query);
        const url = `${API}/${path}?${params.toString()}`;
        console.log(`[iNaturalist Proxy] Calling: ${url}`);
        const { data } = await axios.get(url);
        res.json(data);
    } catch (error) {
        console.error(`Error en proxyRequest para ${path}:`, error.message);
        if (error.response) return res.status(error.response.status).json({ msg: `Error de iNaturalist: ${error.response.statusText}` });
        res.status(500).json({ msg: `Error al contactar iNaturalist: ${error.message}` });
    }
};

const searchTaxa = (req, res) => { req.query.place_id = ARG; req.query.preferred_place_id = ARG; req.query.locale = 'es'; proxyRequest(req, res, 'taxa'); };
const getObservations = (req, res) => { req.query.place_id = ARG; req.query.verifiable = 'true'; req.query.geo = 'true'; proxyRequest(req, res, 'observations'); };

const getFullTaxonDetails = async (req, res) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ msg: 'ID de taxón requerido' });

    const cacheKey = `detail-${id}`;
    try {
        const cachedData = inatCache.get(cacheKey);
        if (cachedData) { console.log(`[Cache HIT] ${id}`); return res.json(cachedData); }

        console.log(`[Cache MISS] Buscando datos nuevos en iNaturalist para el ID: ${id}`);
        let R = {};

        const taxonApiUrl = `${API}/taxa/${id}`;
        const taxonParams = { locale: 'es', preferred_place_id: ARG, all_names: 'true' };
        console.log(`Llamando a iNaturalist: ${taxonApiUrl}`);
        const { data: taxaData } = await axios.get(taxonApiUrl, { params: taxonParams });
        R.taxon = taxaData.results?.[0];
        if (!R.taxon) return res.status(404).json({ msg: 'Taxón no encontrado' });

        const safeAxiosGet = async (url, params = {}) => {
            try { const { data } = await axios.get(url, { params }); return data; } catch (error) { console.warn(`Call failed ${url}: ${error.message}`); return null; }
        };

        R.wikipedia = await fetchWikipedia(R.taxon.name, R.taxon.wikipedia_url);
        const listedData = await safeAxiosGet(`${API}/listed_taxa`, { place_id: ARG, taxon_id: id });
        R.listed_taxa = listedData?.results?.[0];

        const recentData = await safeAxiosGet(`${API}/observations`, { place_id: ARG, verifiable: 'true', order: 'desc', order_by: 'created_at', taxon_id: id, per_page: 18 });
        R.recent_observations = recentData?.results;

        const mapObsData = await safeAxiosGet(`${API}/observations`, { place_id: ARG, verifiable: 'true', geo: 'true', taxon_id: id, per_page: 200 });
        R.map_observations = mapObsData;

        const histMonthData = await safeAxiosGet(`${API}/observations/histogram`, { place_id: ARG, taxon_id: id, verifiable: 'true', interval: 'month' });
        R.histogram_month = histMonthData?.results?.month;

        const histHourData = await safeAxiosGet(`${API}/observations/histogram`, { place_id: ARG, taxon_id: id, verifiable: 'true', interval: 'hour' });
        R.histogram_hour = histHourData?.results?.hour;

        const observersData = await safeAxiosGet(`${API}/observations/observers`, { place_id: ARG, taxon_id: id, verifiable: 'true', per_page: 24 });
        R.observers = observersData?.results;

        const identifiersData = await safeAxiosGet(`${API}/observations/identifiers`, { place_id: ARG, taxon_id: id, verifiable: 'true', per_page: 24 });
        R.identifiers = identifiersData?.results;

        const similarData = await safeAxiosGet(`${API}/taxa/similar`, { taxon_id: id, per_page: 24 });
        R.similar = similarData?.results;

        inatCache.set(cacheKey, R);
        console.log('Enviando respuesta (nueva, ahora cacheados)');
        res.json(R);
    } catch (error) {
        console.error(`Error en getFullTaxonDetails para ID ${id}:`, error.message);
        if (error.response) {
            console.error(`Axios Error Status: ${error.response.status}, URL: ${error.config.url}`);
            if (error.response.status === 404) return res.status(404).json({ msg: 'Taxón no encontrado en iNaturalist.' });
            return res.status(error.response.status).json({ msg: `Error de iNaturalist (${error.response.status}): ${error.response.statusText}` });
        }
        res.status(500).json({ msg: `Error al obtener detalles del taxón: ${error.message}` });
    }
};

module.exports = { searchTaxa, getObservations, getFullTaxonDetails };