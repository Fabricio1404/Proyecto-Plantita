// backend/src/routes/tarea.routes.js
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { uploadEntrega } = require('../middlewares/file-upload'); 

const { 
    obtenerTareaDetalle, 
    agregarComentario, 
    agregarEntrega,
    calificarEntrega,
    anularEntrega // <-- 1. IMPORTAR LA NUEVA FUNCIÓN
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


// --- 2. AÑADIR ESTA NUEVA RUTA ---
// DELETE /api/v1/tarea/entrega/:id
// Permite a un alumno anular/borrar su propia entrega
router.delete('/entrega/:id', anularEntrega);
// ---------------------------------

module.exports = router;