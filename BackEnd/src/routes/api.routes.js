const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');

// Controladores importados
const listasCtrl = require('../controllers/listas.controller');
const obsCtrl = require('../controllers/observaciones.controller');
const clasesCtrl = require('../controllers/clases.controller');

const router = Router();

router.use(validarJWT);



// LISTAS (COLECCIONES)
router.post('/listas', listasCtrl.crearLista);
router.get('/listas', listasCtrl.obtenerListasUsuario);
router.post('/listas/:listaId/especies', listasCtrl.agregarEspecie);
router.get('/listas/:listaId/compartir', listasCtrl.compartirLista);

// OBSERVATORIO (SEGUIMIENTO)
router.post('/seguimiento', obsCtrl.crearSeguimiento);
router.get('/seguimiento', obsCtrl.obtenerSeguimientosUsuario);
router.post('/seguimiento/:idSeguimiento/observar', obsCtrl.registrarObservacion);
router.get('/seguimiento/:idSeguimiento/informe', obsCtrl.descargarInforme);

// CLASES (CLASSROOM)
router.post('/clases', clasesCtrl.crearClase);
router.post('/clases/unirse', clasesCtrl.unirseAClase);
router.get('/clases', clasesCtrl.obtenerMisClases);

module.exports = router;