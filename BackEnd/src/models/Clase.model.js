// backend/src/models/Clase.model.js

const mongoose = require('mongoose');

const ClaseSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre de la clase es obligatorio.'],
        trim: true
    },
    codigoAcceso: { // El código tipo "Google Classroom"
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
        urlArchivo: String, // Enlace al material subido
        fechaPublicacion: { type: Date, default: Date.now }
    }],
    tareas: [{
        titulo: String,
        descripcion: String,
        fechaVencimiento: Date,
        // Puede incluir un campo para requerir un informe de seguimiento
        requiereInformeSeguimiento: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

const Clase = mongoose.model('Clase', ClaseSchema);

module.exports = Clase;