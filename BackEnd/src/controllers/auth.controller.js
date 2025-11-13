const Usuario = require('../models/Usuario.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/** Genera un JWT con payload {uid,nombre}. Expira en 24h. */
const generarJWT = (uid, nombre) => new Promise((resolve, reject) => {
    const payload = { uid, nombre };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' }, (err, token) => {
        if (err) return reject('No se pudo generar el token');
        resolve(token);
    });
});

/** Registra un nuevo usuario; valida unicidad y fuerza mínima de contraseña. */
const registrarUsuario = async (req, res) => {
    const { email, password, username } = req.body;
    const { first_name, last_name } = req.body.profile || {};

    try {
        // Verificar unicidad de correo/usuario
        let usuario = await Usuario.findOne({ $or: [{ correo: email }, { username: username }] });
        if (usuario) {
            if (usuario.correo === email) return res.status(400).json({ errors: [{ path: 'email', msg: 'Este correo ya está registrado.' }] });
            if (usuario.username === username) return res.status(400).json({ errors: [{ path: 'username', msg: 'Este nombre de usuario ya está en uso.' }] });
        }

        // Validación de contraseña (mínimos: mayúscula, minúscula, número, especial, 8+ chars)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/\/\?~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~]{8,}$/;
        const errorMsg = 'La contraseña debe tener 8+ caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
        if (!password || !passwordRegex.test(password)) return res.status(400).json({ errors: [{ path: 'password', msg: errorMsg }] });

        usuario = new Usuario({
            nombre: first_name,
            apellido: last_name,
            username: username,
            correo: email,
            password: password
        });

        // Encriptar y persistir
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        await usuario.save();

        return res.status(201).json({ ok: true, msg: '¡Registro exitoso! Por favor, inicia sesión ahora.' });

    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0];
            let path = firstError.path;
            if (path === 'correo') path = 'email';
            return res.status(400).json({ errors: [{ path: path, msg: firstError.message }] });
        }
        return res.status(500).json({ ok: false, msg: 'Error interno del servidor. Hable con el administrador.' });
    }
};

/** Autentica usuario por `email` o `username` y devuelve token + datos. */
const iniciarSesion = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        const query = (email) ? { correo: email } : { username: username };
        const usuario = await Usuario.findOne(query).select('+password');
        if (!usuario) return res.status(400).json({ ok: false, msg: 'Credenciales inválidas. Verifique sus datos.' });

        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) return res.status(400).json({ ok: false, msg: 'Credenciales inválidas. Verifique sus datos.' });

        const token = await generarJWT(usuario.id, usuario.nombre);
        return res.status(200).json({
            ok: true,
            msg: 'Inicio de sesión exitoso.',
            token,
            user: {
                uid: usuario.id,
                username: usuario.username,
                profile: { first_name: usuario.nombre, last_name: usuario.apellido },
                rol: usuario.rol,
                configuracion: usuario.configuracion
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, msg: 'Error interno del servidor.' });
    }
};

module.exports = { registrarUsuario, iniciarSesion };