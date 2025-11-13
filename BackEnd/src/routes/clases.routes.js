/**
 * Clases routes
 * - Todas las rutas requieren JWT
 * - `uploadMaterial`/`uploadTarea` manejan archivos adjuntos cuando corresponda
 */
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
    editarMaterial
} = require('../controllers/clases.controller');

const router = Router();
router.use(validarJWT);

router.get('/', obtenerMisClases);
router.post('/', crearClase);
router.post('/unirse', unirseAClase);
router.get('/:id', obtenerClasePorId);

router.post('/:id/materiales', uploadMaterial, agregarMaterial);

router.post('/:id/tareas', uploadTarea, agregarTarea);

router.get('/:id/tareas', obtenerTareasPorClase);

router.delete('/:id/materiales/:materialId', borrarMaterial);

router.put('/:id/materiales/:materialId', uploadMaterial, editarMaterial);

module.exports = router;