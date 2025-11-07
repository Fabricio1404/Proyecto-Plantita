//  backend/src/routes/clases.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 
const { uploadMaterial, uploadTarea } = require('../Middlewares/file-upload');

const {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId,
    agregarMaterial,
    agregarTarea,
    obtenerTareasPorClase // <-- 1. IMPORTAR LA NUEVA FUNCIÓN
} = require('../controllers/clases.controller');

const router = Router();

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
    uploadMaterial, 
    agregarMaterial
);

// POST /api/v1/clases/:id/tareas
router.post(
    '/:id/tareas',
    uploadTarea, 
    agregarTarea
);

// --- 2. AÑADIR ESTA NUEVA RUTA ---
// GET /api/v1/clases/:id/tareas
// Obtener todas las tareas de una clase
router.get(
    '/:id/tareas',
    obtenerTareasPorClase
);
// ---------------------------------

module.exports = router;