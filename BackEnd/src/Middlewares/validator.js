const { validationResult } = require('express-validator');

/**
 * Middleware que transforma errores de `express-validator` en una respuesta 400 JSON.
 */
const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ ok: false, errors: errors.array().map(err => ({ param: err.param, msg: err.msg })) });
    }
    next();
}

module.exports = validarCampos;