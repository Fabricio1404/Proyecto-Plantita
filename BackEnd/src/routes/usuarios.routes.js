// backend/src/routes/usuarios.routes.js

const { Router } = require('express');
const { validarJWT } = require('../middlewares/auth');
const { 
    obtenerPerfil, 
    actualizarPerfil, 
    actualizarTema,
    cambiarPassword // <-- Importar nueva función
} = require('../controllers/usuarios.controller');

const router = Router();

// Todas las rutas debajo de esta línea requieren un token JWT válido
router.use(validarJWT);

// 1. Obtener los datos del perfil del usuario logeado
router.get('/perfil', obtenerPerfil);

// 2. Actualizar los datos (Nombre, Apellido, Foto)
router.put('/perfil', actualizarPerfil);

// 3. Actualizar la configuración del tema
router.put('/config/tema', actualizarTema);

// ===== INICIO NUEVA RUTA =====
// 4. Cambiar la contraseña (requiere contraseña actual)
router.put('/perfil/password', cambiarPassword);
// ===== FIN NUEVA RUTA =====

module.exports = router;