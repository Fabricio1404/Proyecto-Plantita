// backend/src/controllers/tarea.controller.js
const fs = require('fs'); // <-- Importar FileSystem
const path = require('path'); // <-- Importar Path
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
            .populate('clase', 'nombre')
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
        const claseId = tarea.clase && tarea.clase._id ? tarea.clase._id : tarea.clase;
        const clase = await Clase.findById(claseId);
        if (!clase || !clase.alumnos.includes(usuarioId)) {
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

// DELETE /api/v1/tarea/entrega/:id
const anularEntrega = async (req, res) => {
    const { id: entregaId } = req.params;
    const alumnoId = req.uid;

    try {
        const entrega = await Entrega.findById(entregaId);
        if (!entrega) {
            return res.status(404).json({ ok: false, msg: 'Entrega no encontrada.' });
        }

        if (entrega.alumno.toString() !== alumnoId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para anular esta entrega.' });
        }

        if (entrega.urlArchivo) {
            const filePath = path.join(__dirname, '..', '..', entrega.urlArchivo);
            fs.unlink(filePath, (err) => {
                if (err) console.warn(`No se pudo borrar el archivo ${filePath}: ${err.message}`);
            });
        }

        await Tarea.updateOne(
            { _id: entrega.tarea },
            { $pull: { entregas: entregaId } }
        );

        await Entrega.findByIdAndDelete(entregaId);

        res.json({
            ok: true,
            msg: 'Entrega anulada correctamente.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al anular la entrega.' });
    }
};

// PUT /api/v1/tarea/:id
const editarTarea = async (req, res) => {
    const { id: tareaId } = req.params;
    const profesorId = req.uid;
    const { titulo, descripcion, fechaVencimiento } = req.body;

    try {
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }

        if (tarea.profesor.toString() !== profesorId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para editar esta tarea.' });
        }

        tarea.titulo = titulo || tarea.titulo;
        tarea.descripcion = descripcion;
        tarea.fechaVencimiento = fechaVencimiento ? new Date(fechaVencimiento) : null;

        if (req.file) {
            if (tarea.urlArchivo) {
                const oldFilePath = path.join(__dirname, '..', '..', tarea.urlArchivo);
                fs.unlink(oldFilePath, (err) => {
                    if (err) console.warn(`No se pudo borrar el archivo antiguo: ${oldFilePath}`);
                });
            }
            tarea.urlArchivo = req.file.path.replace(/\\/g, '/');
        }

        await tarea.save();

        res.json({ 
            ok: true, 
            msg: 'Tarea actualizada.',
            tarea
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al editar la tarea.' });
    }
};

// --- FUNCIÓN NUEVA AÑADIDA AQUÍ ---
const borrarTarea = async (req, res) => {
    const { id: tareaId } = req.params;
    const profesorId = req.uid;

    try {
        // 1. Buscar la tarea
        const tarea = await Tarea.findById(tareaId);
        if (!tarea) {
            return res.status(404).json({ ok: false, msg: 'Tarea no encontrada.' });
        }

        // 2. Seguridad: Solo el profesor de la clase puede borrar
        if (tarea.profesor.toString() !== profesorId) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para borrar esta tarea.' });
        }

        // 3. Borrar el archivo adjunto (si el profesor subió uno)
        if (tarea.urlArchivo) {
            const filePath = path.join(__dirname, '..', '..', tarea.urlArchivo);
            fs.unlink(filePath, (err) => {
                if (err) console.warn(`No se pudo borrar el archivo (adjunto tarea): ${filePath}`);
            });
        }

        // 4. Buscar todas las entregas asociadas
        const entregas = await Entrega.find({ tarea: tareaId });
        for (const entrega of entregas) {
            // 5. Borrar el archivo de CADA entrega
            if (entrega.urlArchivo) {
                const entregaFilePath = path.join(__dirname, '..', '..', entrega.urlArchivo);
                fs.unlink(entregaFilePath, (err) => {
                    if (err) console.warn(`No se pudo borrar el archivo (entrega alumno): ${entregaFilePath}`);
                });
            }
        }

        // 6. Borrar todos los documentos de Entrega asociados
        await Entrega.deleteMany({ tarea: tareaId });

        // 7. Borrar todos los Comentarios asociados
        await Comentario.deleteMany({ tarea: tareaId });

        // 8. Finalmente, borrar la Tarea
        await Tarea.findByIdAndDelete(tareaId);

        res.json({ ok: true, msg: 'Tarea eliminada correctamente.' });

    } catch (error) {
        console.error("Error en borrarTarea:", error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la tarea.' });
    }
};
// --- FIN FUNCIÓN NUEVA ---


module.exports = {
    obtenerTareaDetalle,
    agregarComentario,
    agregarEntrega,
    calificarEntrega,
    anularEntrega,
    editarTarea,
    borrarTarea // <-- EXPORTAR LA NUEVA FUNCIÓN
};