// backend/src/middlewares/auth.js

const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    // Leer el token del header (generalmente enviado como "x-token")
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición. Acceso denegado.'
        });
    }

    try {
        // Verificar y decodificar el token
        const { uid, nombre } = jwt.verify(
            token,
            process.env.JWT_SECRET // Clave secreta definida en .env
        );

        // Adjuntar el UID y el nombre del usuario al objeto request
        req.uid = uid;
        req.nombre = nombre;

        // Continuar con la siguiente función (el controlador)
        next();

    } catch (error) {
        console.error('Error al validar JWT:', error);
        return res.status(401).json({
            ok: false,
            msg: 'Token no válido o expirado.'
        });
    }
};

module.exports = {
    validarJWT
};