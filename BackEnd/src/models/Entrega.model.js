/**
 * Entrega model
 * - tarea: referencia a la tarea
 * - alumno: referencia al usuario que entrega
 * - urlArchivo: ruta del archivo subido por el alumno
 * - fechaEntrega: fecha de envío
 * - calificacion: nota o estado (ej. "8/10", "Aprobado")
 * - comentarioProfesor: devolución del profesor
 */
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
    urlArchivo: {
        type: String,
        required: true
    },
    fechaEntrega: {
        type: Date,
        default: Date.now
    },
    calificacion: {
        type: String,
        trim: true,
        default: null
    },
    comentarioProfesor: {
        type: String,
        trim: true,
        default: null
    }
}, { timestamps: true });

// Índice único para evitar entregas duplicadas por el mismo alumno
EntregaSchema.index({ tarea: 1, alumno: 1 }, { unique: true });

module.exports = mongoose.model('Entrega', EntregaSchema);