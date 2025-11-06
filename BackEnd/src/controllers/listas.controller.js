// backend/src/controllers/listas.controller.js
const Lista = require('../models/Lista.model');

// --- POST /api/v1/listas ---
const crearLista = async (req, res) => {
    const { nombre, descripcion, publica } = req.body;
    const usuario = req.uid;
    try {
        const nuevaLista = new Lista({ usuario, nombre, descripcion, publica: publica || false, especies: [] });
        await nuevaLista.save();
        res.status(201).json({ ok: true, msg: 'Lista creada con éxito.', lista: nuevaLista });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al crear la lista.' });
    }
};

// --- GET /api/v1/listas ---
const obtenerListasUsuario = async (req, res) => {
    const usuario = req.uid;
    try {
        const listas = await Lista.find({ usuario }).sort({ updatedAt: -1 });
        res.status(200).json({ ok: true, total: listas.length, listas });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al obtener las listas.' });
    }
};

// --- GET /api/v1/listas/:listaId ---
const obtenerListaPorId = async (req, res) => {
    const { listaId } = req.params;
    const usuario = req.uid;
    try {
        const lista = await Lista.findById(listaId);
        if (!lista) return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        if (!lista.publica && lista.usuario.toString() !== usuario) {
            return res.status(403).json({ ok: false, msg: 'No tienes permiso para ver esta lista.' });
        }
        res.status(200).json({ ok: true, lista });
    } catch (error) {
        console.error(error);
        if (error.kind === 'ObjectId') return res.status(400).json({ ok: false, msg: 'ID de lista no válido.' });
        res.status(500).json({ ok: false, msg: 'Error al obtener la lista.' });
    }
};

// --- POST /api/v1/listas/:listaId/especies (MODIFICADO) ---
const agregarEspecie = async (req, res) => {
    const { listaId } = req.params;
    // Recibir 'imageUrl' del body
    const { inaturalist_id, nombreComun, nombreCientifico, taxon, imageUrl } = req.body;
    const usuario = req.uid;
    try {
        const lista = await Lista.findById(listaId);
        if (!lista) return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        if (lista.usuario.toString() !== usuario) return res.status(403).json({ ok: false, msg: 'No tienes permiso.' });
        
        const existe = lista.especies.some(e => e.inaturalist_id === inaturalist_id);
        if (existe) return res.status(400).json({ ok: false, msg: 'La especie ya está en esta lista.' });
        
        // Guardar la nueva especie con su 'imageUrl'
        lista.especies.push({ inaturalist_id, nombreComun, nombreCientifico, taxon, imageUrl });
        await lista.save();
        res.status(200).json({ ok: true, msg: 'Especie añadida.', lista });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al añadir la especie.' });
    }
};

// --- PUT /api/v1/listas/:listaId ---
const actualizarLista = async (req, res) => {
    const { listaId } = req.params;
    const { nombre, descripcion, publica } = req.body;
    const usuario = req.uid;
    try {
        const lista = await Lista.findById(listaId);
        if (!lista) return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        if (lista.usuario.toString() !== usuario) return res.status(403).json({ ok: false, msg: 'No tienes permiso.' });
        if (nombre) lista.nombre = nombre;
        lista.descripcion = (descripcion !== undefined) ? descripcion : lista.descripcion;
        if (publica !== undefined) lista.publica = publica;
        const listaActualizada = await lista.save();
        res.status(200).json({ ok: true, msg: 'Lista actualizada.', lista: listaActualizada });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al actualizar la lista.' });
    }
};

// --- DELETE /api/v1/listas/:listaId ---
const eliminarLista = async (req, res) => {
    const { listaId } = req.params;
    const usuario = req.uid;
    try {
        const lista = await Lista.findById(listaId);
        if (!lista) return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        if (lista.usuario.toString() !== usuario) return res.status(403).json({ ok: false, msg: 'No tienes permiso.' });
        await lista.deleteOne();
        res.status(200).json({ ok: true, msg: 'Lista eliminada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al eliminar la lista.' });
    }
};

// --- DELETE /api/v1/listas/:listaId/especies/:especieId ---
const quitarEspecieDeLista = async (req, res) => {
    const { listaId, especieId } = req.params;
    const usuario = req.uid;
    try {
        const lista = await Lista.findById(listaId);
        if (!lista) return res.status(404).json({ ok: false, msg: 'Lista no encontrada.' });
        if (lista.usuario.toString() !== usuario) return res.status(403).json({ ok: false, msg: 'No tienes permiso.' });

        const especieIndex = lista.especies.findIndex(e => e.inaturalist_id === especieId);
        if (especieIndex === -1) {
            return res.status(404).json({ ok: false, msg: 'Especie no encontrada en esta lista.' });
        }
        lista.especies.splice(especieIndex, 1); // Quitar la especie
        await lista.save();
        res.status(200).json({ ok: true, msg: 'Especie quitada.', lista });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, msg: 'Error al quitar la especie.' });
    }
};

const compartirLista = async (req, res) => {
    res.status(501).json({ ok: false, msg: 'Función no implementada' });
};

module.exports = {
    crearLista,
    obtenerListasUsuario,
    obtenerListaPorId,
    agregarEspecie,
    compartirLista,
    actualizarLista,
    eliminarLista,
    quitarEspecieDeLista
};