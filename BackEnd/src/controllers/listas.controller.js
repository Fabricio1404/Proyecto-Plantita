const Lista = require('../models/Lista.model');


const crearLista = async (req, res) => {
    // req.uid viene del middleware JWT
    const { nombre, descripcion, publica } = req.body;
    const usuario = req.uid;

    try {
        const nuevaLista = new Lista({
            usuario,
            nombre,
            descripcion,
            publica: publica || false,
            especies: []
        });

        await nuevaLista.save();

        res.status(201).json({
            ok: true,
            msg: 'Lista creada con éxito.',
            lista: nuevaLista
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear la lista.' });
    }
};


const obtenerListasUsuario = async (req, res) => {
    const usuario = req.uid;

    try {
        const listas = await Lista.find({ usuario }).sort({ updatedAt: -1 });

        res.status(200).json({
            ok: true,
            total: listas.length,
            listas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener las listas.' });
    }
};


const agregarEspecie = async (req, res) => {
    const { listaId } = req.params;
    const { inaturalist_id, nombreComun, nombreCientifico, taxon } = req.body;
    const usuario = req.uid;

    try {
        const lista = await Lista.findById(listaId);

        if (!lista) {
            return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        }

        // Verificar que la lista pertenece al usuario (seguridad)
        if (lista.usuario.toString() !== usuario) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para modificar esta lista.' });
        }

        // Verificar si la especie ya existe en la lista
        const existe = lista.especies.some(e => e.inaturalist_id === inaturalist_id);
        if (existe) {
            return res.status(400).json({ ok: false, msg: 'La especie ya está en esta lista.' });
        }

        // Añadir la nueva especie
        lista.especies.push({ inaturalist_id, nombreComun, nombreCientifico, taxon });
        await lista.save();

        res.status(200).json({
            ok: true,
            msg: 'Especie añadida a la lista con éxito.',
            lista
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al añadir la especie.' });
    }
};


const compartirLista = async (req, res) => {
    const { listaId } = req.params;
    
    try {
        const lista = await Lista.findById(listaId);

        if (!lista) {
            return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        }

        // Si la lista no es pública, solo el dueño puede ver la URL de compartir
        if (!lista.publica && lista.usuario.toString() !== req.uid) {
             return res.status(403).json({ ok: false, msg: 'Esta lista es privada.' });
        }

        // Generar una URL sencilla para compartir (simulada aquí)
        const shareUrl = `${req.protocol}://${req.get('host')}/share/listas/${listaId}`;

        res.status(200).json({
            ok: true,
            msg: 'Lista lista para compartir.',
            shareUrl,
            publica: lista.publica
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener el enlace para compartir.' });
    }
};


module.exports = {
    crearLista,
    obtenerListasUsuario,
    agregarEspecie,
    compartirLista
};