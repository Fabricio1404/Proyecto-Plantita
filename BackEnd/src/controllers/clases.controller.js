const Clase = require('../models/Clase.model');
const Usuario = require('../models/Usuario.model');

const generarCodigo = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};


const crearClase = async (req, res) => {
    const { nombre } = req.body;
    const profesorId = req.uid; 
    
   

    try {
        let codigoAcceso;
        let claseExistente;

        do {
            codigoAcceso = generarCodigo();
            claseExistente = await Clase.findOne({ codigoAcceso });
        } while (claseExistente);

        const nuevaClase = new Clase({
            nombre,
            codigoAcceso,
            profesor: profesorId,
            alumnos: [profesorId] 
        });

        await nuevaClase.save();

        res.status(201).json({
            ok: true,
            msg: 'Clase creada con éxito.',
            clase: nuevaClase
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear la clase.' });
    }
};


const unirseAClase = async (req, res) => {
    const { codigoAcceso } = req.body;
    const alumnoId = req.uid;

    try {
        const clase = await Clase.findOne({ codigoAcceso: codigoAcceso.toUpperCase() });

        if (!clase) {
            return res.status(404).json({ ok: false, msg: 'Código de clase inválido.' });
        }
        
        if (clase.alumnos.includes(alumnoId)) {
            return res.status(400).json({ ok: false, msg: 'Ya eres miembro de esta clase.' });
        }
        
        clase.alumnos.push(alumnoId);
        await clase.save();

        res.status(200).json({
            ok: true,
            msg: 'Te has unido a la clase con éxito.',
            claseId: clase._id
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al unirse a la clase.' });
    }
};


const obtenerMisClases = async (req, res) => {
    const usuarioId = req.uid;

    try {
        const clases = await Clase.find({ alumnos: usuarioId })
                                  .populate('profesor', 'nombre apellido'); 

        res.status(200).json({
            ok: true,
            total: clases.length,
            clases
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener tus clases.' });
    }
};


module.exports = {
    crearClase,
    unirseAClase,
    obtenerMisClases
};