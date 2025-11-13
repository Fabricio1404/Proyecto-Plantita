/**
 * API routes
 * - Todas las rutas aquí requieren JWT (middleware aplicado a nivel de router)
 * - Nota: mantener la ruta `GET /listas/:listaId` después de rutas más específicas
 */
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');

const listasCtrl = require('../controllers/listas.controller');
const clasesCtrl = require('../controllers/clases.controller');

const router = Router();
router.use(validarJWT);

router.post('/listas', listasCtrl.crearLista);
router.get('/listas', listasCtrl.obtenerListasUsuario);
router.post('/listas/:listaId/especies', listasCtrl.agregarEspecie);
router.get('/listas/:listaId/compartir', listasCtrl.compartirLista);
router.put('/listas/:listaId', listasCtrl.actualizarLista);
router.delete('/listas/:listaId', listasCtrl.eliminarLista);

router.delete('/listas/:listaId/especies/:especieId', listasCtrl.quitarEspecieDeLista);

router.get('/listas/:listaId', listasCtrl.obtenerListaPorId);

router.post('/clases', clasesCtrl.crearClase);
router.post('/clases/unirse', clasesCtrl.unirseAClase);
router.get('/clases', clasesCtrl.obtenerMisClases);

module.exports = router;