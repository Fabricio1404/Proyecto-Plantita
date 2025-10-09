import { validationResult } from "express-validator";
import { ListModel } from "../models/list.model.js";

/* ===== Helpers comunes ===== */
const handleValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return false;
  }
  return true;
};

/* ===== CRUD de listas ===== */

// Crear lista
export const createList = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const { name, type } = req.body;
    const owner = req.user.id;
    const list = await ListModel.create({ name, type, owner });
    return res.status(201).json({ ok: true, data: list });
  } catch (err) {
    // Manejar error por duplicado (índice único owner+name)
    if (err?.code === 11000) {
      return res.status(400).json({ ok: false, msg: "Ya existe una lista con ese nombre" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error creando la lista" });
  }
};

// Obtener todas mis listas
export const getMyLists = async (req, res) => {
  try {
    const lists = await ListModel.find({ owner: req.user.id }).sort({ updatedAt: -1 });
    return res.json({ ok: true, data: lists });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error obteniendo listas" });
  }
};

// Obtener 1 lista (solo si es mía)
export const getMyListById = async (req, res) => {
  try {
    const list = await ListModel.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ ok: false, msg: "Lista no encontrada" });
    return res.json({ ok: true, data: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error obteniendo la lista" });
  }
};

// Renombrar lista
export const renameList = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const { name } = req.body;
    const updated = await ListModel.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      { $set: { name } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ ok: false, msg: "Lista no encontrada" });
    return res.json({ ok: true, data: updated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ ok: false, msg: "Ya existe una lista con ese nombre" });
    }
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error renombrando la lista" });
  }
};

// Eliminar lista
export const deleteList = async (req, res) => {
  try {
    const deleted = await ListModel.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!deleted) return res.status(404).json({ ok: false, msg: "Lista no encontrada" });
    return res.json({ ok: true, msg: "Lista eliminada" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error eliminando la lista" });
  }
};

/* ===== Ítems ===== */

// Agregar ítem (si no existe ese taxon_id en la lista)
export const addItem = async (req, res) => {
  if (!handleValidation(req, res)) return;
  try {
    const { taxon_id, nombre, nombre_cientifico, foto_url, notes } = req.body;
    const list = await ListModel.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ ok: false, msg: "Lista no encontrada" });

    const exists = list.items.some(i => i.taxon_id === Number(taxon_id));
    if (exists) return res.status(400).json({ ok: false, msg: "El ítem ya existe en la lista" });

    list.items.push({
      taxon_id: Number(taxon_id),
      nombre: nombre || null,
      nombre_cientifico,
      foto_url: foto_url || null,
      notes: notes || null,
    });

    await list.save();
    return res.status(201).json({ ok: true, data: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error agregando ítem" });
  }
};

// Quitar ítem por taxon_id
export const removeItem = async (req, res) => {
  try {
    const taxonId = Number(req.params.taxon_id);
    const list = await ListModel.findOne({ _id: req.params.id, owner: req.user.id });
    if (!list) return res.status(404).json({ ok: false, msg: "Lista no encontrada" });

    const before = list.items.length;
    list.items = list.items.filter(i => i.taxon_id !== taxonId);
    if (list.items.length === before) {
      return res.status(404).json({ ok: false, msg: "Ítem no estaba en la lista" });
    }
    await list.save();
    return res.json({ ok: true, data: list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, msg: "Error quitando ítem" });
  }
};
