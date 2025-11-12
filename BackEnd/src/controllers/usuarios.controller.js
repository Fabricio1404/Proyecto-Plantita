// backend/src/controllers/usuarios.controller.js

const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');

// --- GET /api/v1/usuarios/perfil ---
const obtenerPerfil = async (req, res) => {
    const uid = req.uid;
    try {
        // Busca al usuario por su ID (del token) y excluye el password
        const usuario = await Usuario.findById(uid).select('-password'); 
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
        }
        res.status(200).json({
            ok: true,
            usuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener el perfil.' });
    }
};

// --- PUT /api/v1/usuarios/perfil ---
// (Modificado: Ya NO maneja la contraseña)
const actualizarPerfil = async (req, res) => {
    const uid = req.uid;
    // Solo actualiza nombre, apellido, fotoPerfil.
    const { nombre, apellido, fotoPerfil } = req.body;

    try {
        const usuario = await Usuario.findById(uid);
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
        }
        
        // Actualizar campos
        usuario.nombre = nombre || usuario.nombre;
        usuario.apellido = apellido || usuario.apellido;
        usuario.fotoPerfil = fotoPerfil || usuario.fotoPerfil; // (Para subir fotos se necesita 'multer', por ahora solo texto)

        await usuario.save();

        // Devolver solo la info necesaria y actualizada
        const usuarioActualizado = {
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            correo: usuario.correo, // El correo no se cambia aquí
            username: usuario.username, // El username no se cambia aquí
            fotoPerfil: usuario.fotoPerfil,
            configuracion: usuario.configuracion
        };

        res.status(200).json({
            ok: true,
            msg: 'Perfil actualizado con éxito.',
            usuario: usuarioActualizado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el perfil.' });
    }
};

// ===== INICIO FUNCIÓN MODIFICADA =====
// --- PUT /api/v1/usuarios/perfil/password ---
const cambiarPassword = async (req, res) => {
    const uid = req.uid;
    const { passwordActual, nuevaPassword } = req.body;

    // Validar que vengan los datos
    if (!passwordActual || !nuevaPassword) {
        return res.status(400).json({ ok: false, msg: 'Faltan campos de contraseña.' });
    }

    try {
        // 1. Encontrar al usuario y TRAER su password
        const usuario = await Usuario.findById(uid).select('+password');
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
        }

        // 2. Comparar la contraseña actual
        const validPassword = bcrypt.compareSync(passwordActual, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'La contraseña actual es incorrecta.'
            });
        }

        // 3. (Opcional) Validar la nueva contraseña (REGLA ROBUSTA)
        // Expresión regular para contraseña robusta:
        // 1 minúscula, 1 mayúscula, 1 número, 1 especial, 8+ caracteres.
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]{8,}$/;
        const errorMsg = 'La nueva contraseña debe tener 8+ caracteres, una mayúscula, una minúscula, un número y un carácter especial.';
        
        if (!passwordRegex.test(nuevaPassword)) {
             return res.status(400).json({ ok: false, msg: errorMsg });
        }
        // ===== FIN MODIFICACIÓN =====

        // 4. Hashear y guardar la nueva contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(nuevaPassword, salt);
        await usuario.save();

        res.status(200).json({
            ok: true,
            msg: 'Contraseña actualizada con éxito.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al cambiar la contraseña.' });
    }
};
// ===== FIN FUNCIÓN MODIFICADA =====

// --- PUT /api/v1/usuarios/config/tema ---
const actualizarTema = async (req, res) => {
    const uid = req.uid;
    const { tema } = req.body;

    if (!['claro', 'oscuro', 'ecologico'].includes(tema)) {
        return res.status(400).json({ ok: false, msg: 'Tema no válido.' });
    }
    try {
        const usuario = await Usuario.findByIdAndUpdate(
            uid,
            { 'configuracion.tema': tema },
            { new: true }
        ).select('configuracion');
        res.status(200).json({
            ok: true,
            msg: 'Tema actualizado y guardado.',
            configuracion: usuario.configuracion
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al guardar el tema.' });
    }
};

module.exports = {
    obtenerPerfil,
    actualizarPerfil,
    actualizarTema,
    cambiarPassword // <-- Exportar nueva función
};