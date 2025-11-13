/**
 * Usuario model
 * - Campos esenciales: nombre, apellido, username, correo, password
 * - `password.select = false` para no exponer contraseñas en consultas
 * - `configuracion.tema` permite elegir tema de la UI
 */
const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        trim: true
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
        trim: true
    },
   
    username: {
        type: String,
        required: [true, 'El nombre de usuario es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[a-zA-Z0-9_]+$/, 'El usuario solo puede contener letras, números y guiones bajos']
    },
   
    correo: {
        type: String,
        required: [true, 'El correo electrónico es obligatorio'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Por favor, usa un correo electrónico válido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria'],
        select: false
    },
    fotoPerfil: {
        type: String,
        default: 'default_profile.png'
    },
    rol: {
        type: String,
        enum: ['alumno', 'profesor', 'admin'],
        default: 'alumno'
    },
    configuracion: {
        tema: {
            type: String,
            enum: ['claro', 'oscuro', 'ecologico'],
            default: 'oscuro'
        }
    }
}, {
    timestamps: true 
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;