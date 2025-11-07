// backend/src/controllers/clases.controller.js

const Clase = require('../models/Clase.model');
const Tarea = require('../models/Tarea.model'); 
const Usuario = require('../models/Usuario.model'); 

// ... (generarCodigo, crearClase, unirseAClase... NO CAMBIAN) ...
const generarCodigo = () => { /* ... */ };
const crearClase = async (req, res) => { /* ... */ };
const unirseAClase = async (req, res) => { /* ... */ };

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
                                 // .populate('tareas') <-- YA NO ES NECESARIO

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

// ... (agregarMaterial NO CAMBIA) ...
const agregarMaterial = async (req, res) => { /* ... */ };


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