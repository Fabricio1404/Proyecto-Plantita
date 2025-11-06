//  backend/src/routes/clases.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 

// --- MODIFICACIÓN: Importar los dos gestores ---
const { uploadMaterial, uploadTarea } = require('../Middlewares/file-upload');

const {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId,
    agregarMaterial,
    agregarTarea
} = require('../controllers/clases.controller');

const router = Router();

// Todas las rutas aquí requieren un JWT válido
router.use(validarJWT);


// GET /api/v1/clases/
router.get('/', obtenerMisClases);

// POST /api/v1/clases/
router.post('/', crearClase);

// POST /api/v1/clases/unirse
router.post('/unirse', unirseAClase);

// GET /api/v1/clases/:id
router.get('/:id', obtenerClasePorId);

// POST /api/v1/clases/:id/materiales
router.post(
    '/:id/materiales',
    uploadMaterial, // <-- Usa el gestor de materiales
    agregarMaterial
);

// --- MODIFICACIÓN: Usar el gestor de tareas ---
// POST /api/v1/clases/:id/tareas
router.post(
    '/:id/tareas',
    uploadTarea, // <-- Usa el nuevo gestor de tareas
    agregarTarea
);
// ---------------------------------

module.exports = router;