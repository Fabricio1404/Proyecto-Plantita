// backend/src/models/Clase.model.js
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
    
    // --- MODIFICACIÓN CLAVE AQUÍ ---
    // Eliminamos el array de 'tareas'. Las tareas se buscarán por 'claseId'.
    /*
    tareas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea' 
    }]
    */
    // --- FIN DE LA MODIFICACIÓN ---
}, {
    timestamps: true
});

const Clase = mongoose.model('Clase', ClaseSchema);

module.exports = Clase;