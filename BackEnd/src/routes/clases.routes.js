//  backend/src/routes/clases.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 
// Quitamos 'check' y 'validarCampos' que no encontramos
// const { check } = require('express-validator');
// const { validarCampos } = require('../middlewares/validar-campos'); 

const {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId
} = require('../controllers/clases.controller');

const router = Router();

// Todas las rutas aquí requieren un JWT válido
router.use(validarJWT);


// GET /api/v1/clases/
// Obtener todas las clases del usuario
router.get('/', obtenerMisClases);

// POST /api/v1/clases/
// Crear una nueva clase
router.post(
    '/',
    // Quitamos la validación de aquí también para ser consistentes
    crearClase
);

// POST /api/v1/clases/unirse
// Unirse a una clase existente
router.post(
    '/unirse',
    // Quitamos la validación de aquí también
    unirseAClase
);

// --- RUTA MODIFICADA ---
// GET /api/v1/clases/:id
// Obtener los detalles de una clase específica
// Quitamos el array de validación
router.get(
    '/:id',
    obtenerClasePorId
);
// ----------------------------------------------------

module.exports = router;