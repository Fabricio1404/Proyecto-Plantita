import { ListModel } from "../models/list.model.js";
import { UserModel } from "../models/user.model.js";

export const createList = async (req, res) => {
  try {
    const { list_name, description, author, lists, plants, insects } = req.body;

    const newList = await ListModel.create({
      list_name,
      description,
      author,
      lists,
      plants: plants || [],
      insects: insects || [],
    });
    await UserModel.findByIdAndUpdate(author, {
      $push: { lists: newList._id },
    });
    return res.status(201).json(newList);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar todos
export const findAllLists = async (req, res) => {
  try {
    const lists = await ListModel.find().populate([
      "author",
      "plants",
      "insects",
    ]);
    return res.status(200).json(lists);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// buscar por id
export const findListById = async (req, res) => {
  try {
    const { id } = req.params;

    const list = await ListModel.findById(id).populate([
      "author",
      "plants",
      "insects",
    ]);
    return res.status(200).json(list);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// actualizar
export const updateList = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, plants, insects } = req.body;

    const list = await ListModel.findByIdAndUpdate(
      id,
      { name, description, duration, plants, insects },
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
export const deleteList = async (req, res) => {
  try {
    const { id } = req.params;
    const list = await ListModel.findByIdAndDelete(id);
    return res.status(200).json({ msg: "Eliminación exitosa" });
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

// agregar una planta a una lista
export const addPlantToList = async (req, res) => {
  try {
    const { listId, plantId } = req.params;
    const plantToList = await ListModel.findByIdAndUpdate(
      listId,
      { $push: { plants: plantId } },
      { new: true }
    ).populate("plants");

    return res.status(200).json(plantToList);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};

export const addInsectToList = async (req, res) => {
  try {
    const { listId, insectId } = req.params;
    const insectToList = await ListModel.findByIdAndUpdate(
      listId,
      { $push: { insects: insectId } },
      { new: true }
    ).populate("insects");

    return res.status(200).json(insectToList);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      msg: "Error interno del Servidor",
    });
  }
};
