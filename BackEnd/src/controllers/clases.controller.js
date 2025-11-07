// backend/src/controllers/clases.controller.js

const Clase = require('../models/Clase.model');
const Tarea = require('../models/Tarea.model'); 
const Usuario = require('../models/Usuario.model'); 

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

// --- MODIFICACIÓN: 'obtenerMisClases' ---
// ¡Esta era la función que se colgaba!
// Ahora no tiene dependencias circulares y debería funcionar.
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

// --- MODIFICACIÓN: 'obtenerClasePorId' ---
// (Quitamos el populate de 'tareas')
const obtenerClasePorId = async (req, res) => {
    const { id } = req.params;
    const usuarioId = req.uid;

    try {
        const clase = await Clase.findById(id)
                                 .populate('profesor', 'nombre apellido email') 
                                 .populate('alumnos', 'nombre apellido'); 

        if (!clase) {
            return res.status(404).json({ ok: false, msg: 'Clase no encontrada.' });
        }
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
        if (error.kind === 'ObjectId') {
             return res.status(404).json({ ok: false, msg: 'Clase no encontrada (ID inválido).' });
        }
        res.status(500).json({ ok: false, msg: 'Error al obtener la clase.' });
    }
};

const agregarMaterial = async (req, res) => {
    const { id: claseId } = req.params;
    const profesorId = req.uid;
    const { titulo, descripcion } = req.body;

    if (!req.file) {
        if (req.multerError) {
             return res.status(400).json({ ok: false, msg: req.multerError });
        }
        return res.status(400).json({ ok: false, msg: 'No se subió ningún archivo o el formato no es válido.' });
    }

    if (!titulo) {
        return res.status(400).json({ ok: false, msg: 'El título es obligatorio.' });
    }

    try {
        const clase = await Clase.findById(claseId);
        if (!clase) {
            return res.status(404).json({ ok: false, msg: 'Clase no encontrada.' });
        }

        if (clase.profesor.toString() !== profesorId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para añadir material a esta clase.' });
        }

        const urlArchivo = req.file.path.replace(/\\/g, '/');

        const nuevoMaterial = {
            titulo,
            descripcion,
            urlArchivo: urlArchivo, 
            fechaPublicacion: new Date()
        };

        clase.materiales.push(nuevoMaterial);
        await clase.save();
        
        res.status(201).json({
            ok: true,
            msg: 'Material añadido con éxito.',
            clase
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al añadir el material.' });
    }
};

// --- MODIFICACIÓN: 'agregarTarea' ---
// (Ya no guarda la tarea en el array de la clase)
const agregarTarea = async (req, res) => {
    const { id: claseId } = req.params;
    const profesorId = req.uid;
    const { titulo, descripcion, fechaVencimiento } = req.body;
    const archivo = req.file; 

    if (!titulo) {
        return res.status(400).json({ ok: false, msg: 'El título de la tarea es obligatorio.' });
    }
    if (req.multerError) {
        return res.status(400).json({ ok: false, msg: req.multerError });
    }

    try {
        const clase = await Clase.findById(claseId);
        if (!clase) {
            return res.status(404).json({ ok: false, msg: 'Clase no encontrada.' });
        }
        if (clase.profesor.toString() !== profesorId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para añadir tareas a esta clase.' });
        }

        // 1. Crear la nueva Tarea
        const nuevaTarea = new Tarea({
            clase: claseId,
            profesor: profesorId,
            titulo,
            descripcion,
            fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
            urlArchivo: archivo ? archivo.path.replace(/\\/g, '/') : null
        });
        
        await nuevaTarea.save(); // Guardar la tarea

        // 2. YA NO guardamos el ID en la clase
        
        // 3. Devolvemos solo la nueva tarea
        res.status(201).json({
            ok: true,
            msg: 'Tarea añadida con éxito.',
            tarea: nuevaTarea // Devolvemos la tarea creada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al añadir la tarea.' });
    }
};

// --- FUNCIÓN NUEVA AÑADIDA AQUÍ ---
const obtenerTareasPorClase = async (req, res) => {
    const { id: claseId } = req.params;

    try {
        // Buscar todas las tareas que pertenezcan a esta clase
        const tareas = await Tarea.find({ clase: claseId })
                                  .sort({ fechaVencimiento: 1 }); // Ordenar

        res.json({
            ok: true,
            tareas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener las tareas.' });
    }
};
// --- FIN FUNCIÓN NUEVA ---

module.exports = {
    crearClase,
    unirseAClase,
    obtenerMisClases,
    obtenerClasePorId,
    agregarMaterial,
    agregarTarea,
    obtenerTareasPorClase // <-- EXPORTAR LA NUEVA FUNCIÓN
};