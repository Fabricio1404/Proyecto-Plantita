// backend/src/controllers/auth.controller.js

const Usuario = require('../models/Usuario.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Función auxiliar para generar JWT (sin cambios)
const generarJWT = (uid, nombre) => {
    return new Promise((resolve, reject) => {
        const payload = { uid, nombre };
        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                console.log(err);
                reject('No se pudo generar el token');
            } else {
                resolve(token);
            }
        });
    });
};

const registrarUsuario = async (req, res) => {
    // Leer datos de la nueva estructura del frontend
    const { email, password, username } = req.body;
    const { first_name, last_name } = req.body.profile || {};

    try {
        // Verificar si el correo O el username ya existen
        let usuario = await Usuario.findOne({ $or: [{ correo: email }, { username: username }] });
        
        if (usuario) {
            // Devolver un error específico que el frontend 'login.js' pueda entender
            if (usuario.correo === email) {
                return res.status(400).json({ 
                    errors: [{ path: 'email', msg: 'Este correo ya está registrado.' }] 
                });
            }
            if (usuario.username === username) {
                return res.status(400).json({ 
                    errors: [{ path: 'username', msg: 'Este nombre de usuario ya está en uso.' }] 
                });
            }
        }

        // Crear nueva instancia de usuario (mapeando a tu schema)
        usuario = new Usuario({
            nombre: first_name,   
            apellido: last_name,  
            username: username,   
            correo: email,      
            password: password
        });

        // Encriptar la contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password, salt);
        
        // Guardar usuario en la base de datos
        await usuario.save();

        // Respuesta EXITOSA (simplificada para redirigir a login)
        return res.status(201).json({
            ok: true,
            msg: '¡Registro exitoso! Por favor, inicia sesión ahora.'
        });

    } catch (error) {
        console.error(error);

        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0];
            let path = firstError.path; // 'correo', 'username', etc.
            
            if (path === 'correo') path = 'email'; 
            
            return res.status(400).json({
                errors: [{ path: path, msg: firstError.message }]
            });
        }
        
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor. Hable con el administrador.'
        });
    }
};


const iniciarSesion = async (req, res) => {
    const { email, username, password } = req.body;

    try {
        
        const query = (email) ? { correo: email } : { username: username };

        const usuario = await Usuario.findOne(query).select('+password'); 

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales inválidas. Verifique sus datos.'
            });
        }

        // Verificar la contraseña
        const validPassword = bcrypt.compareSync(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales inválidas. Verifique sus datos.'
            });
        }

        // Contraseña correcta: generar JWT
        const token = await generarJWT(usuario.id, usuario.nombre);

        // Respuesta EXITOSA (adaptada al frontend 'login.js')
        return res.status(200).json({
            ok: true,
            msg: 'Inicio de sesión exitoso.',
            token,
            // Anidamos la info del usuario como el frontend espera
            user: {
                uid: usuario.id,
                username: usuario.username,
                profile: {
                    first_name: usuario.nombre,
                    last_name: usuario.apellido
                },
                rol: usuario.rol,
                configuracion: usuario.configuracion
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            ok: false,
            msg: 'Error interno del servidor.'
        });
    }
};

module.exports = {
    registrarUsuario,
    iniciarSesion
};