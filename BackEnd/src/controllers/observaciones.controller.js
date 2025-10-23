// backend/src/controllers/observaciones.controller.js

const Seguimiento = require('../models/Seguimiento.model');
const { obtenerClimaPorCoordenadas } = require('../helpers/clima.helper');
const { generarPDFInforme } = require('../helpers/generadorInformes.helper');


const crearSeguimiento = async (req, res) => {
    const { nombrePlanta, especie, lat, lng } = req.body;
    const usuario = req.uid;

    try {
        const nuevoSeguimiento = new Seguimiento({
            usuario,
            nombrePlanta,
            especie,
            ubicacion: { lat, lng },
            observaciones: []
        });

        await nuevoSeguimiento.save();

        res.status(201).json({
            ok: true,
            msg: 'Seguimiento iniciado con éxito.',
            seguimiento: nuevoSeguimiento
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al iniciar el seguimiento.' });
    }
};


const obtenerSeguimientosUsuario = async (req, res) => {
    const usuario = req.uid;

    try {
        const seguimientos = await Seguimiento.find({ usuario }).sort({ updatedAt: -1 });
        res.status(200).json({ ok: true, seguimientos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener seguimientos.' });
    }
};


const registrarObservacion = async (req, res) => {
    const { idSeguimiento } = req.params;
    const { observacionesEscritas, lat, lng } = req.body; // Se requiere lat/lng para el clima

    try {
        const seguimiento = await Seguimiento.findById(idSeguimiento);

        if (!seguimiento) {
            return res.status(404).json({ ok: false, msg: 'Seguimiento no encontrado.' });
        }
        
        // 1. OBTENER DATOS DE CLIMA
        const datosClima = await obtenerClimaPorCoordenadas(lat, lng);
        
        // 2. CREAR NUEVA OBSERVACIÓN
        const nuevaObservacion = {
            observacionesEscritas,
            temperatura: datosClima.temperatura,
            humedad: datosClima.humedad,
            clima: datosClima.clima,
            fechaHora: new Date() // Sello de tiempo automático
        };

        // 3. AGREGAR Y GUARDAR
        seguimiento.observaciones.push(nuevaObservacion);
        await seguimiento.save();

        res.status(200).json({
            ok: true,
            msg: 'Observación registrada y clima auto-rellenado.',
            observacion: nuevaObservacion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al registrar la observación.' });
    }
};


const descargarInforme = async (req, res) => {
    const { idSeguimiento } = req.params;
    
    try {
        const seguimiento = await Seguimiento.findById(idSeguimiento);

        if (!seguimiento) {
            return res.status(404).json({ ok: false, msg: 'Seguimiento no encontrado.' });
        }

        // Llamar al helper para generar el informe (ejemplo con PDF)
        const pdfBuffer = await generarPDFInforme(seguimiento);

        // Configurar headers para la descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Informe-${seguimiento.nombrePlanta}.pdf`);
        
        // Enviar el buffer del PDF
        res.send(pdfBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al generar el informe.' });
    }
};


module.exports = {
    crearSeguimiento,
    obtenerSeguimientosUsuario,
    registrarObservacion,
    descargarInforme,
};