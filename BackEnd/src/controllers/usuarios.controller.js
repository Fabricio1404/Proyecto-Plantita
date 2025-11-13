/** Controladores de usuario: perfil, actualización, cambio de contraseña y tema. */
const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');

const obtenerPerfil = async (req, res) => {
    const uid = req.uid;
    try {
        const usuario = await Usuario.findById(uid).select('-password');
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
        res.status(200).json({ ok: true, usuario });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener el perfil.' });
    }
};

const actualizarPerfil = async (req, res) => {
    const uid = req.uid;
    const { nombre, apellido, fotoPerfil } = req.body;
    try {
        const usuario = await Usuario.findById(uid);
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });

        usuario.nombre = nombre || usuario.nombre;
        usuario.apellido = apellido || usuario.apellido;
        usuario.fotoPerfil = fotoPerfil || usuario.fotoPerfil; // Para subir fotos se necesita 'multer'

        await usuario.save();

        const usuarioActualizado = {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo,
            username: usuario.username,
            fotoPerfil: usuario.fotoPerfil,
            configuracion: usuario.configuracion
        };

        res.status(200).json({ ok: true, msg: 'Perfil actualizado con éxito.', usuario: usuarioActualizado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el perfil.' });
    }
};

const cambiarPassword = async (req, res) => {
    const uid = req.uid;
    const { passwordActual, nuevaPassword } = req.body;
    if (!passwordActual || !nuevaPassword) return res.status(400).json({ ok: false, msg: 'Faltan campos de contraseña.' });

    try {
        const usuario = await Usuario.findById(uid).select('+password');
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });

        const validPassword = bcrypt.compareSync(passwordActual, usuario.password);
        if (!validPassword) return res.status(400).json({ ok: false, msg: 'La contraseña actual es incorrecta.' });

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/\?~])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/\?~]{8,}$/;
        const errorMsg = 'La nueva contraseña debe tener 8+ caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
        if (!passwordRegex.test(nuevaPassword)) return res.status(400).json({ ok: false, msg: errorMsg });

        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(nuevaPassword, salt);
        await usuario.save();

        res.status(200).json({ ok: true, msg: 'Contraseña actualizada con éxito.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar la contraseña.' });
    }
};

const actualizarTema = async (req, res) => {
    const uid = req.uid;
    const { tema } = req.body;
    if (!['claro', 'oscuro', 'ecologico'].includes(tema)) return res.status(400).json({ ok: false, msg: 'Tema no válido.' });
    try {
        const usuario = await Usuario.findByIdAndUpdate(uid, { 'configuracion.tema': tema }, { new: true }).select('configuracion');
        res.status(200).json({ ok: true, msg: 'Tema actualizado y guardado.', configuracion: usuario.configuracion });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al guardar el tema.' });
    }
};

module.exports = { obtenerPerfil, actualizarPerfil, actualizarTema, cambiarPassword };