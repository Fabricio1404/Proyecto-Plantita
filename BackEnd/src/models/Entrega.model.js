// backend/src/models/Entrega.model.js
const mongoose = require('mongoose');

const EntregaSchema = new mongoose.Schema({
    tarea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
        required: true
    },
    alumno: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    urlArchivo: { // Archivo subido por el alumno
        type: String,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now
    },
    
    // --- MODIFICACIÓN AQUÍ ---
    calificacion: { // La nota, ej: "8/10" o "Aprobado"
        type: String,
        trim: true,
        default: null
    },
    comentarioProfesor: { // La devolución del profesor
        type: String,
        trim: true,
        default: null
    }
    // --- FIN DE LA MODIFICACIÓN ---

}, { timestamps: true });

// Evita que un alumno entregue dos veces la misma tarea
EntregaSchema.index({ tarea: 1, alumno: 1 }, { unique: true });

module.exports = mongoose.model('Entrega', EntregaSchema);