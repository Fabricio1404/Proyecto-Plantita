const INATURALIST_API_URL = 'https://api.inaturalist.org/v1/observations';

/** Busca observaciones/especies en iNaturalist. Devuelve un array de objetos normalizados. */
const buscarEspecies = async (taxonName, query = '') => {
  try {
    const params = new URLSearchParams({ verifiable: 'true', order: 'desc', order_by: 'created_at', per_page: '30' });
    if (taxonName) params.set('iconic_taxa', taxonName);
    if (query) params.set('q', query);
    const url = `${INATURALIST_API_URL}?${params.toString()}`;

    const response = await fetch(url, { headers: { 'User-Agent': 'PlataformaEcologica/1.0' } });
    if (!response.ok) {
      const text = await response.text();
      console.error(`Error HTTP ${response.status} al consultar iNaturalist. Respuesta: ${text}`);
      throw new Error(`Fallo en API externa: Status ${response.status}`);
    }

    const data = await response.json();
    if (!Array.isArray(data.results)) return [];

    return data.results.map((obs) => ({
      id: obs.id,
      nombreComun: (obs.taxon && (obs.taxon.preferred_common_name || obs.taxon.english_common_name)) || 'Sin nombre común',
      nombreCientifico: (obs.taxon && obs.taxon.name) || '—',
      imagenes: (obs.photos || []).map((p) => ({ url: p.url ? p.url.replace('square', 'medium') : null })),
      ubicacion: obs.location ? { lat: obs.latitude, lng: obs.longitude, display: obs.place_guess } : null,
      fechaObservacion: obs.observed_on_details?.date,
      url: obs.uri || null
    }));
  } catch (error) {
    console.error('Error en buscarEspecies:', error.message);
    return [];
  }
};

module.exports = { buscarEspecies };