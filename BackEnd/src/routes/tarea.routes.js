// backend/src/routes/tarea.routes.js
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { uploadEntrega } = require('../Middlewares/file-upload'); 

const { 
    obtenerTareaDetalle, 
    agregarComentario, 
    agregarEntrega,
    calificarEntrega // <-- 1. IMPORTAR LA NUEVA FUNCIÓN
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

// --- 2. AÑADIR ESTA NUEVA RUTA ---
// POST /api/v1/tarea/entrega/:id/calificar
// (Usamos el ID de la Entrega, no de la Tarea)
router.post('/entrega/:id/calificar', calificarEntrega);
// ---------------------------------

module.exports = router;