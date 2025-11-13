/**
 * Tarea routes
 * - Requiere JWT
 * - `uploadEntrega`/`uploadTarea` manejan archivos adjuntos
 */
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
    borrarTarea
} = require('../controllers/tarea.controller');

const router = Router();
router.use(validarJWT);

router.get('/:id', obtenerTareaDetalle);
router.post('/:id/comentar', agregarComentario);

router.post('/:id/entregar', uploadEntrega, agregarEntrega);

router.post('/entrega/:id/calificar', calificarEntrega);
router.delete('/entrega/:id', anularEntrega);

router.put('/:id', uploadTarea, editarTarea);

router.delete('/:id', borrarTarea);

module.exports = router;