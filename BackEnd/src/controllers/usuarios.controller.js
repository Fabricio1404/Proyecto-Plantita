// backend/src/controllers/usuarios.controller.js

const Usuario = require('../models/Usuario.model');
const bcrypt = require('bcryptjs');


const obtenerPerfil = async (req, res) => {
    const uid = req.uid;

    try {
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


const actualizarPerfil = async (req, res) => {
    const uid = req.uid;
    const { nombre, apellido, correo, fotoPerfil, password } = req.body;

    try {
        const usuario = await Usuario.findById(uid).select('+password');
        if (!usuario) {
            return res.status(404).json({ ok: false, msg: 'Usuario no encontrado.' });
        }

        // 1. Manejar el cambio de Correo (debe ser único)
        if (correo && correo !== usuario.correo) {
            const existeCorreo = await Usuario.findOne({ correo });
            if (existeCorreo) {
                return res.status(400).json({ ok: false, msg: 'El nuevo correo ya está en uso.' });
            }
            usuario.correo = correo;
        }

        if (password) {

            const salt = bcrypt.genSaltSync();
            usuario.password = bcrypt.hashSync(password, salt);
        }
        
        usuario.nombre = nombre || usuario.nombre;
        usuario.apellido = apellido || usuario.apellido;
        usuario.fotoPerfil = fotoPerfil || usuario.fotoPerfil;

        await usuario.save();

        res.status(200).json({
            ok: true,
            msg: 'Perfil actualizado con éxito.',
            usuario: {
                nombre: usuario.nombre,
                correo: usuario.correo
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar el perfil.' });
    }
};

//
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
    actualizarTema
};