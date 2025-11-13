/**
 * Usuarios routes
 * - Todas las rutas requieren JWT
 */
const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { 
    obtenerPerfil, 
    actualizarPerfil, 
    actualizarTema,
    cambiarPassword
} = require('../controllers/usuarios.controller');

const router = Router();
router.use(validarJWT);

router.get('/perfil', obtenerPerfil);
router.put('/perfil', actualizarPerfil);
router.put('/config/tema', actualizarTema);
router.put('/perfil/password', cambiarPassword);

module.exports = router;