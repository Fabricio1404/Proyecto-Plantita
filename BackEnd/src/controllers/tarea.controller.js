// backend/src/controllers/tarea.controller.js
const Tarea = require('../models/Tarea.model');
const Entrega = require('../models/Entrega.model');
const Comentario = require('../models/Comentario.model');
const Clase = require('../models/Clase.model');

// GET /api/v1/tarea/:id
const obtenerTareaDetalle = async (req, res) => {
    const { id: tareaId } = req.params;
    const usuarioId = req.uid;

    try {
        const tarea = await Tarea.findById(tareaId)
            .populate('profesor', 'nombre apellido')
            .populate({
                path: 'comentarios',
                populate: { path: 'autor', select: 'nombre apellido' },
                options: { sort: { fechaPublicacion: 1 } } // Comentarios más viejos primero
            })
            .populate({
                path: 'entregas',
                populate: { path: 'alumno', select: 'nombre apellido' }
            });

        if (!tarea) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }

        // Seguridad: Verificar que el usuario pertenece a la clase de esta tarea
        const clase = await Clase.findById(tarea.clase);
        if (!clase.alumnos.includes(usuarioId)) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para ver esta tarea.' });
        }
        
        // Verificar si el usuario actual ya entregó
        const miEntrega = tarea.entregas.find(e => e.alumno._id.toString() === usuarioId);

        res.json({
            ok: true,
            tarea,
            miEntrega: miEntrega || null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener la tarea.' });
    }
};

// POST /api/v1/tarea/:id/comentar
const agregarComentario = async (req, res) => {
    const { id: tareaId } = req.params;
    const { texto } = req.body;
    const autorId = req.uid;

    if (!texto) {
        return res.status(400).json({ ok: false, msg: 'El texto del comentario es obligatorio.' });
    }

    try {
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }

        const nuevoComentario = new Comentario({
            tarea: tareaId,
            autor: autorId,
            texto
        });

        await nuevoComentario.save();

        // Añadir comentario a la tarea y popularlo para devolverlo
        tarea.comentarios.push(nuevoComentario._id);
        await tarea.save();
        
        const comentarioPoblado = await Comentario.findById(nuevoComentario._id)
                                                .populate('autor', 'nombre apellido');

        res.status(201).json({
            ok: true,
            msg: 'Comentario añadido.',
            comentario: comentarioPoblado
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al añadir el comentario.' });
    }
};

// POST /api/v1/tarea/:id/entregar
const agregarEntrega = async (req, res) => {
    const { id: tareaId } = req.params;
    const alumnoId = req.uid;

    if (!req.file) {
        return res.status(400).json({ ok: false, msg: req.multerError || 'No se subió ningún archivo.' });
    }

    try {
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }
        
        if (tarea.profesor.toString() === alumnoId) {
             return res.status(403).json({ ok: false, msg: 'El profesor no puede entregar tareas.' });
        }

        const entregaExistente = await Entrega.findOne({ tarea: tareaId, alumno: alumnoId });
        if (entregaExistente) {
            return res.status(400).json({ ok: false, msg: 'Ya has entregado esta tarea.' });
        }

        const urlArchivo = req.file.path.replace(/\\/g, '/');

        const nuevaEntrega = new Entrega({
            tarea: tareaId,
            alumno: alumnoId,
            urlArchivo
        });

        await nuevaEntrega.save();

        tarea.entregas.push(nuevaEntrega._id);
        await tarea.save();
        
        const entregaPoblada = await Entrega.findById(nuevaEntrega._id)
                                            .populate('alumno', 'nombre apellido');

        res.status(201).json({
            ok: true,
            msg: '¡Tarea entregada con éxito!',
            entrega: entregaPoblada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al entregar la tarea.' });
    }
};


// POST /api/v1/tarea/entrega/:id/calificar
const calificarEntrega = async (req, res) => {
    const { id: entregaId } = req.params;
    const { calificacion, comentarioProfesor } = req.body;
    const profesorId = req.uid;

    if (!calificacion) {
        return res.status(400).json({ ok: false, msg: 'La calificación es obligatoria.' });
    }

    try {
        const entrega = await Entrega.findById(entregaId).populate('tarea');
        if (!entrega) {
            return res.status(404).json({ ok: false, msg: 'Entrega no encontrada.' });
        }

        if (entrega.tarea.profesor.toString() !== profesorId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para calificar esta entrega.' });
        }

        entrega.calificacion = calificacion;
        entrega.comentarioProfesor = comentarioProfesor || null;
        
        await entrega.save();

        res.json({
            ok: true,
            msg: 'Calificación guardada.',
            entrega
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al guardar la calificación.' });
    }
};


module.exports = {
    obtenerTareaDetalle,
    agregarComentario,
    agregarEntrega,
    calificarEntrega
};