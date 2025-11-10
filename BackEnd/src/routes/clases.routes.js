//  backend/src/routes/clases.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth'); 
const { uploadMaterial, uploadTarea } = require('../middlewares/file-upload');

const {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId,
    agregarMaterial,
    agregarTarea,
    obtenerTareasPorClase,
    borrarMaterial,
    editarMaterial // <-- 1. IMPORTAR
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

// GET /api/v1/clases/:id/tareas
router.get(
    '/:id/tareas',
    obtenerTareasPorClase
);

// DELETE /api/v1/clases/:id/materiales/:materialId
router.delete(
    '/:id/materiales/:materialId',
    borrarMaterial
);

// --- 2. AÑADIR ESTA NUEVA RUTA 'PUT' ---
// (PUT se usa para Actualizar)
router.put(
    '/:id/materiales/:materialId',
    uploadMaterial, // Re-usamos el middleware (maneja un archivo opcional)
    editarMaterial
);
// -------------------------------------

module.exports = router;