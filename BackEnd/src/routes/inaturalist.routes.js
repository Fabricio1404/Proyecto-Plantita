// backend/src/routes/inaturalist.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 
const {
    searchTaxa,
    getObservations,
    getFullTaxonDetails
} = require('../controllers/inaturalist.controller');

// ===== INICIO DEBUGGING =====
console.log('✅ Archivo de rutas iNaturalist cargado y usado.');
// ===== FIN DEBUGGING =====

const router = Router();


router.get('/taxa', searchTaxa);

// Ruta para las observaciones del mapa (explorador.html)
// GET /api/v1/inaturalist/observations?taxon_ids=...
router.get('/observations', getObservations);

// Ruta para la página de detalle (detail.html)
// GET /api/v1/inaturalist/detail/12345
router.get('/detail/:id', getFullTaxonDetails);

module.exports = router;