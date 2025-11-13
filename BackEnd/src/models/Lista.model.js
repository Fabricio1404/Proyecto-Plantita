/**
 * Lista model
 * - usuario: propietario de la lista
 * - nombre: título de la lista
 * - descripcion: descripción opcional
 * - especies: array de especies con metadatos obtenidos de iNaturalist
 * - publica: visibilidad de la lista
 */
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
    especies: [{
        inaturalist_id: {
            type: String, 
            required: true
        },
        nombreComun: String,
        nombreCientifico: String,
        taxon: {
            type: String,
            enum: ['plantas', 'insectos']
        },
        imageUrl: { 
            type: String 
        }
    }],
    publica: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const Lista = mongoose.model('Lista', ListaSchema);

module.exports = Lista;