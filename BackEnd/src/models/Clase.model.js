/**
 * Clase model
 * - codigoAcceso: código único para unirse a la clase
 * - profesor: referencia al usuario que creó la clase
 * - alumnos: array de referencias a usuarios
 * - materiales: objetos con metadatos y `urlArchivo`
 *
 * Nota: las tareas no se almacenan aquí; se consultan por `claseId` en el modelo `Tarea`.
 */
const mongoose = require('mongoose');

const ClaseSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la clase es obligatorio.'],
        trim: true
    },
    codigoAcceso: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        minlength: 6,
        maxlength: 8
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    alumnos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    }],
    materiales: [{
        titulo: String,
        descripcion: String,
        urlArchivo: String,
        fechaPublicacion: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

const Clase = mongoose.model('Clase', ClaseSchema);

module.exports = Clase;