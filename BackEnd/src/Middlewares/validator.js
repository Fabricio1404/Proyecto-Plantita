const { validationResult } = require('express-validator');

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    
    // Si hay errores de validación, devolver un error 400
    if (!errors.isEmpty()) {
        return res.status(400).json({
            ok: false,
            errors: errors.array().map(err => ({
                param: err.param,
                msg: err.msg
            }))
        });
    }

    next();
}

module.exports = validarCampos;