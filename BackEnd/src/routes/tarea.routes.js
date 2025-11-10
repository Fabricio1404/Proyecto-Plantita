// backend/src/routes/tarea.routes.js
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { uploadEntrega, uploadTarea } = require('../middlewares/file-upload'); 

const { 
    obtenerTareaDetalle, 
    agregarComentario, 
    agregarEntrega,
    calificarEntrega,
    anularEntrega,
    editarTarea,
    borrarTarea // <-- 1. IMPORTAR LA NUEVA FUNCIÓN
} = require('../controllers/tarea.controller');

const router = Router();
router.use(validarJWT);

// GET /api/v1/tarea/:id
router.get('/:id', obtenerTareaDetalle);

// POST /api/v1/tarea/:id/comentar
router.post('/:id/comentar', agregarComentario);

// POST /api/v1/tarea/:id/entregar
router.post(
    '/:id/entregar', 
    uploadEntrega, 
    agregarEntrega
);

// POST /api/v1/tarea/entrega/:id/calificar
router.post('/entrega/:id/calificar', calificarEntrega);

// DELETE /api/v1/tarea/entrega/:id
router.delete('/entrega/:id', anularEntrega);

// PUT /api/v1/tarea/:id
router.put(
    '/:id',
    uploadTarea, 
    editarTarea
);

// --- 2. AÑADIR ESTA NUEVA RUTA 'DELETE' ---
// DELETE /api/v1/tarea/:id
// Borrar una tarea (y todas sus entregas/comentarios)
router.delete(
    '/:id',
    borrarTarea
);
// ---------------------------------

module.exports = router;