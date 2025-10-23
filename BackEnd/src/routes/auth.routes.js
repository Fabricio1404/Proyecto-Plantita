// backend/src/routes/auth.routes.js

const { Router } = require('express');
const { registrarUsuario, iniciarSesion } = require('../controllers/auth.controller.js');
const { validarRegistro, validarLogin } = require('../middlewares/validaciones/auth.validations.js');
const validarCampos = require('../middlewares/validator.js');

const router = Router();

// Ruta de Registro de Usuario: POST /api/auth/register
router.post('/register', 
    validarRegistro, // Aplicar validaciones de seguridad
    validarCampos,   // Comprobar errores de validación
    registrarUsuario // Ejecutar lógica de registro
);

// Ruta de Inicio de Sesión: POST /api/auth/login
router.post('/login',
    validarLogin,  // Aplicar validaciones de login
    validarCampos, // Comprobar errores de validación
    iniciarSesion  // Ejecutar lógica de login
);

module.exports = router;