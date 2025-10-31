const mongoose = require('mongoose');

const ObservacionSchema = new mongoose.Schema({
    fechaHora: {
        type: Date,
        default: Date.now,
        required: true
    },
    temperatura: { // Dato obtenido por API o manual
        type: Number
    },
    humedad: { // Dato obtenido por API o manual
        type: Number
    },
    clima: { // Dato de la API climática
        type: String
    },
    observacionesEscritas: {
        type: String,
        trim: true
    },
    // Podrías añadir campos para registrar crecimiento (altura, número de hojas, etc.)
    // altura: Number, 
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
        type: String, // Nombre científico o ID de iNaturalist
        default: 'Desconocida'
    },
    ubicacion: { // Última ubicación registrada o ubicación inicial
        lat: Number,
        lng: Number
    },
    observaciones: [ObservacionSchema]
}, {
    timestamps: true
});

const Seguimiento = mongoose.model('Seguimiento', SeguimientoSchema);

module.exports = Seguimiento;