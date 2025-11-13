const jwt = require('jsonwebtoken');

/**
 * Middleware que valida JWT enviado en el header `x-token`.
 * Si es válido, añade `req.uid` y `req.nombre` y llama a `next()`.
 */
const validarJWT = (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({ ok: false, msg: 'No hay token en la petición. Acceso denegado.' });
    }

    try {
        const { uid, nombre } = jwt.verify(token, process.env.JWT_SECRET);
        req.uid = uid;
        req.nombre = nombre;
        next();
    } catch (error) {
        console.error('Error al validar JWT:', error);
        return res.status(401).json({ ok: false, msg: 'Token no válido o expirado.' });
    }
};

module.exports = { validarJWT };