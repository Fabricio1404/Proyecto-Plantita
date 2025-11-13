const { body } = require('express-validator');

const validarRegistro = [
    // Perfil
    body('profile.first_name').not().isEmpty().withMessage('El nombre es obligatorio.').trim(),
    body('profile.last_name').not().isEmpty().withMessage('El apellido es obligatorio.').trim(),

    // Usuario
    body('username').not().isEmpty().withMessage('El nombre de usuario es obligatorio.').isLength({ min: 3 }).withMessage('El usuario debe tener al menos 3 caracteres.').trim(),

    // Email
    body('email').isEmail().withMessage('El correo debe ser una dirección de email válida.').normalizeEmail(),

    // Contraseña (mínimos básicos)
    body('password')
        .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
        .matches(/[a-z]/).withMessage('La contraseña debe contener al menos una letra minúscula.')
        .matches(/[A-Z]/).withMessage('La contraseña debe contener al menos una letra mayúscula.')
        .matches(/[0-9]/).withMessage('La contraseña debe contener al menos un número.')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial.')
];

const validarLogin = [
    // Contraseña
    body('password').not().isEmpty().withMessage('La contraseña es obligatoria.'),

    // Email o username (al menos uno)
    body().custom((value, { req }) => {
        if (!req.body.email && !req.body.username) throw new Error('Debe proporcionar un email o un nombre de usuario.');
        return true;
    }),
    body('email').optional().isEmail().withMessage('Ingrese un correo electrónico válido.'),
    body('username').optional().not().isEmpty().withMessage('Ingrese un nombre de usuario.')
];

module.exports = {
    validarRegistro,
    validarLogin
};