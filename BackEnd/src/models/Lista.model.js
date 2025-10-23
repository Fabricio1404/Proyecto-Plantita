// backend/src/models/Lista.model.js

const mongoose = require('mongoose');

const ListaSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    nombre: {
        type: String,
        required: [true, 'El nombre de la lista es obligatorio.'],
        trim: true
    },
    descripcion: {
        type: String,
        default: 'Lista personal de especies favoritas o en estudio.'
    },
    // Almacena los IDs de las observaciones de iNaturalist (como números o strings)
    especies: [{
        inaturalist_id: {
            type: String, 
            required: true
        },
        nombreComun: String,
        nombreCientifico: String,
        // Opcional: para saber si es planta o insecto
        taxon: {
            type: String,
            enum: ['plantas', 'insectos']
        }
    }],
    publica: {
        type: Boolean,
        default: false // Por defecto, las listas son privadas
    }
}, {
    timestamps: true
});

const Lista = mongoose.model('Lista', ListaSchema);

module.exports = Lista;