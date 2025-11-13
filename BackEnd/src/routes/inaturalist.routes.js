/**
 * iNaturalist proxy routes
 */
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 
const {
    searchTaxa,
    getObservations,
    getFullTaxonDetails
} = require('../controllers/inaturalist.controller');

const router = Router();

router.get('/taxa', searchTaxa);

router.get('/observations', getObservations);

router.get('/detail/:id', getFullTaxonDetails);

module.exports = router;