import { InsectModel } from "../models/insect.model.js";
import { ListModel } from "../models/list.model.js";

export const createInsect = async (req, res) => {
  try {
    const {
      nombreCientifico,
      filo,
      clase,
      orden,
      familia,
      subfamilia,
      tribu,
      subtribu,
      genero,
      especie,
      subespecie,
      nombreComun,
      nombre,
      region,
      idioma,
    } = req.body;

    const newInsect = await InsectModel.create({
      nombreCientifico,
      filo,
      clase,
      orden,
      familia,
      subfamilia,
      tribu,
      subtribu,
      genero,
      especie,
      subespecie,
      nombreComun,
      nombre,
      region,
      idioma,
    });
    return res.status(201).json(newInsect);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar todos
export const findAllInsects = async (req, res) => {
  try {
    const insects = await InsectModel.find().populate("lists");

    console.log(insects);
    return res.status(200).json(insects);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar por id
export const findInsectById = async (req, res) => {
  try {
    const { id } = req.params;

    const insect = await InsectModel.findById(id).populate("lists");

    return res.status(200).json(insect);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// actualizar
export const updateInsect = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombreCientifico,
      filo,
      clase,
      orden,
      familia,
      subfamilia,
      tribu,
      subtribu,
      genero,
      especie,
      subespecie,
      nombreComun,
      nombre,
      region,
      idioma,
    } = req.body;

    const insect = await InsectModel.findByIdAndUpdate(
      id,
      {
        nombreCientifico,
        filo,
        clase,
        orden,
        familia,
        subfamilia,
        tribu,
        subtribu,
        genero,
        especie,
        subespecie,
        nombreComun,
        nombre,
        region,
        idioma,
      },
      { new: true }
    );
    return res.status(200).json({ msg: "Actualización exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// eliminar
export const deleteInsect = async (req, res) => {
  try {
    const { id } = req.params;
    const insect = await InsectModel.findByIdAndDelete(id);
    await ListModel.updateMany(
      {
        insects: id,
      },
      { $pull: { insects: id } }
    );
    return res.status(200).json({ msg: "Eliminación exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};
