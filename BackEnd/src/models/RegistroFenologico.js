const { Schema, model } = require('mongoose');

// Este es el "molde" para CADA CELDA (cuadro)
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
}, { _id: false }); // No crear _id para cada celda

// Este es el "molde" para CADA REGISTRO (tarjeta)
const RegistroFenologicoSchema = new Schema({
    name: { type: String, required: true, default: 'Registro' },
    lugar: { type: String, default: '' },
    year: { type: String, default: '' },
    especie: { type: String, default: '' },
    observations: { type: String, default: '' },
    isCollapsed: { type: Boolean, default: false },
    
    // Un array de 30 celdas (usando el molde de arriba)
    cells: [CeldaSchema], 
    
    // Conexión con el usuario que lo creó
    user: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario', // Asegúrate que tu modelo de usuario se llame 'Usuario'
        required: true
    }
}, { timestamps: true }); // Añade createdAt y updatedAt automáticamente

module.exports = model('RegistroFenologico', RegistroFenologicoSchema);