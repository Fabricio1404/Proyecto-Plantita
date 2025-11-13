const { Schema, model } = require('mongoose');

/**
 * RegistroFenologico model
 * - CeldaSchema: representa una celda del registro con medidas y estado meteorológico
 * - RegistroFenologicoSchema: tarjeta con metadatos y un array de celdas
 */
const CeldaSchema = new Schema({
    top: [Number],
    right: [Number],
    bottom: [Number],
    left: [Number],
    date: { type: String, default: '' },
    weather: {
        temp: { type: String, default: '' },
        viento: { type: String, default: '' },
        humedad: { type: String, default: '' },
        presion: { type: String, default: '' },
    }
}, { _id: false });

const RegistroFenologicoSchema = new Schema({
    name: { type: String, required: true, default: 'Registro' },
    lugar: { type: String, default: '' },
    year: { type: String, default: '' },
    especie: { type: String, default: '' },
    observations: { type: String, default: '' },
    isCollapsed: { type: Boolean, default: false },
    cells: [CeldaSchema],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    }
}, { timestamps: true });

module.exports = model('RegistroFenologico', RegistroFenologicoSchema);