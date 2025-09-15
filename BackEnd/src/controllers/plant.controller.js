import { PlantModel } from "../models/plant.model.js";
import { ListModel } from "../models/list.model.js";

export const createPlant = async (req, res) => {
  try {
    const {
      division,
      clase,
      subclase,
      orden,
      familia,
      subfamilia,
      tribu,
      genero,
      especie,
      nombreComun,
      nombre,
      region,
      idioma,
    } = req.body;

    const newPlant = await PlantModel.create({
      division,
      clase,
      subclase,
      orden,
      familia,
      subfamilia,
      tribu,
      genero,
      especie,
      nombreComun,
      nombre,
      region,
      idioma,
    });
    return res.status(201).json(newPlant);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar todos
export const findAllPlants = async (req, res) => {
  try {
    const plants = await PlantModel.find().populate("lists");
    return res.status(200).json(plants);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar por id
export const findPlantById = async (req, res) => {
  try {
    const { id } = req.params;

    const plant = await PlantModel.findById(id).populate("lists");
    return res.status(200).json(plant);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// actualizar
export const updatePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      division,
      clase,
      subclase,
      orden,
      familia,
      subfamilia,
      tribu,
      genero,
      especie,
      nombreComun,
      nombre,
      region,
      idioma,
    } = req.body;

    const plant = await PlantModel.findByIdAndUpdate(
      id,
      {
        division,
        clase,
        subclase,
        orden,
        familia,
        subfamilia,
        tribu,
        genero,
        especie,
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
export const deletePlant = async (req, res) => {
  try {
    const { id } = req.params;
    const plant = await PlantModel.findByIdAndDelete(id);
    await ListModel.updateMany(
      {
        plants: id,
      },
      { $pull: { plants: id } }
    );
    return res.status(200).json({ msg: "Eliminación exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};
