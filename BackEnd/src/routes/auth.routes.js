/**
 * Auth routes
 * - Registro e inicio de sesión (validaciones aplicadas mediante middlewares)
 */
const { Router } = require('express');
const { registrarUsuario, iniciarSesion } = require('../controllers/auth.controller.js');
const { validarRegistro, validarLogin } = require('../middlewares/validaciones/auth.validations.js');
const validarCampos = require('../middlewares/validator.js');

const router = Router();

router.post('/register', validarRegistro, validarCampos, registrarUsuario);

router.post('/login', validarLogin, validarCampos, iniciarSesion);

module.exports = router;