// backend/src/models/Comentario.model.js
const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
    tarea: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tarea',
        required: true
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    texto: {
        type: String,
        required: true,
        trim: true
    },
    fechaPublicacion: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Comentario', ComentarioSchema);