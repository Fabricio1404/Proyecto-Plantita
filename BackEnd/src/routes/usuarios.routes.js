const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { obtenerPerfil, actualizarPerfil, actualizarTema } = require('../controllers/usuarios.controller');

const router = Router();

// Todas las rutas debajo de esta línea requieren un token JWT válido
router.use(validarJWT);

// 1. Obtener los datos del perfil del usuario logeado
router.get('/perfil', obtenerPerfil);

// 2. Actualizar los datos del perfil (nombre, correo, contraseña, etc.)
router.put('/perfil', actualizarPerfil);

// 3. Actualizar la configuración del tema
router.put('/config/tema', actualizarTema);


module.exports = router;