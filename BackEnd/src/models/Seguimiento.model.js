const mongoose = require('mongoose');

/**
 * Seguimiento model
 * - ObservacionSchema: entrada de observación con fecha, mediciones y notas
 * - SeguimientoSchema: registro de una planta con ubicaciones y observaciones
 */
const ObservacionSchema = new mongoose.Schema({
    fechaHora: {
        type: Date,
        default: Date.now,
        required: true
    },
    temperatura: {
        type: Number
    },
    humedad: {
        type: Number
    },
    clima: {
        type: String
    },
    observacionesEscritas: {
        type: String,
        trim: true
    }
});

const SeguimientoSchema = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    nombrePlanta: {
        type: String,
        required: true,
        trim: true
    },
    especie: {
        type: String,
        default: 'Desconocida'
    },
    ubicacion: {
        lat: Number,
        lng: Number
    },
    observaciones: [ObservacionSchema]
}, {
    timestamps: true
});

const Seguimiento = mongoose.model('Seguimiento', SeguimientoSchema);

module.exports = Seguimiento;