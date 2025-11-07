// backend/src/routes/tarea.routes.js
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
// Importamos el gestor de subida para entregas
const { uploadEntrega } = require('../Middlewares/file-upload'); 

const { 
    obtenerTareaDetalle, 
    agregarComentario, 
    agregarEntrega,
    calificarEntrega // <-- Asegúrate de importar este
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
    uploadEntrega, // <-- Usará el gestor de subida de entregas
    agregarEntrega
);

// POST /api/v1/tarea/entrega/:id/calificar
router.post('/entrega/:id/calificar', calificarEntrega);

module.exports = router;