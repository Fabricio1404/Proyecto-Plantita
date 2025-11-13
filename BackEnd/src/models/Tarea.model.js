/**
 * Tarea model
 * - clase: referencia a la clase
 * - profesor: autor de la tarea
 * - urlArchivo: archivo adjunto (si existe)
 * - entregas/comentarios: referencias a otros modelos
 */
const mongoose = require('mongoose');

const TareaSchema = new mongoose.Schema({
    clase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Clase',
        required: true
    },
    profesor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        trim: true
    },
    fechaVencimiento: {
        type: Date
    },
    urlArchivo: {
        type: String
    },
    entregas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Entrega'
    }],
    comentarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comentario'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Tarea', TareaSchema);