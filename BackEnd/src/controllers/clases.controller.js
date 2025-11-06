// backend/src/controllers/clases.controller.js

const Clase = require('../models/Clase.model');
const Usuario = require('../models/Usuario.model'); // Asegúrate de que este modelo se usa o quítalo si no.

const generarCodigo = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};


const crearClase = async (req, res) => {
    const { nombre } = req.body;
    const profesorId = req.uid; 
    
    if (!nombre || nombre.trim().length === 0) {
        return res.status(400).json({ ok: false, msg: 'El nombre de la clase es obligatorio.' });
    }

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
            alumnos: [profesorId] // El profesor también es alumno/miembro
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

    if (!codigoAcceso) {
         return res.status(400).json({ ok: false, msg: 'El código de acceso es obligatorio.' });
    }

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
        // Traemos solo el nombre del profesor
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

// --- FUNCIÓN NUEVA AÑADIDA AQUÍ ---
const obtenerClasePorId = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.uid;

    try {
        // Buscamos la clase por su ID
        const clase = await Clase.findById(id)
                                 .populate('profesor', 'nombre apellido email') // Traemos más datos del profe
                                 .populate('alumnos', 'nombre apellido'); // Traemos los nombres de los alumnos

        if (!clase) {
            return res.status(404).json({ ok: false, msg: 'Clase no encontrada.' });
        }

        // Verificamos que el usuario que la pide sea parte de la clase
        // Convertimos los IDs de Mongoose a string para comparar
        const esMiembro = clase.alumnos.some(alumno => alumno._id.toString() === usuarioId);

        if (!esMiembro) {
             return res.status(403).json({ ok: false, msg: 'No eres miembro de esta clase.' });
        }

        res.status(200).json({
            ok: true,
            clase
        });

    } catch (error) {
        console.error(error);
        // Manejo por si el ID no es un ObjectId válido de Mongoose
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ ok: false, msg: 'Clase no encontrada (ID inválido).' });
        }
        res.status(500).json({ ok: false, msg: 'Error al obtener la clase.' });
    }
};
// --- FIN FUNCIÓN NUEVA ---


module.exports = {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId // <-- NO OLVIDES EXPORTARLA
};