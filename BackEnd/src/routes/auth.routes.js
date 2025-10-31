const { Router } = require('express');
const { registrarUsuario, iniciarSesion } = require('../controllers/auth.controller.js');
const { validarRegistro, validarLogin } = require('../middlewares/validaciones/auth.validations.js');
const validarCampos = require('../middlewares/validator.js');

const router = Router();

router.post('/register', 
    validarRegistro, // Aplicar validaciones de seguridad
    validarCampos,   // Comprobar errores de validación
    registrarUsuario // Ejecutar lógica de registro
);

router.post('/login',
    validarLogin,  // Aplicar validaciones de login
    validarCampos, // Comprobar errores de validación
    iniciarSesion  // Ejecutar lógica de login
);

module.exports = router;