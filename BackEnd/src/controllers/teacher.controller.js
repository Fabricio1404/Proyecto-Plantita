import { TeacherModel } from "../models/teacher.model.js";

// Obtener todo
export const getAllTeachers = async (req, res) => {
  try {
    const teachers = await TeacherModel.findAll({
      where: { deleted: false },
    });
    return res.status(200).json(teachers);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudieron obtener a los profesors",
    });
  }
};

// Obtener por id
export const getTeacherById = async (req, res) => {
  try {
    const teacher = await TeacherModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo obtener al profesor",
    });
  }
};

// Crear
export const createTeacher = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newTeacher = await TeacherModel.create({
      name,
      email,
      password,
    });
    return res.status(201).json(newTeacher);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo crear al profesor",
    });
  }
};

// Modificar
export const updateTeacher = async (req, res) => {
  try {
    const teacher = await TeacherModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    const { name, email, password } = req.body;
    await teacher.update({
      name: name || teacher.name,
      email: email || teacher.email,
      password: password || teacher.password,
    });
    return res.status(200).json(teacher);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo actualizar al profesor",
    });
  }
};

// Eliminar
export const deleteTeacher = async (req, res) => {
  try {
    const teacher = await TeacherModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    await teacher.update({ deleted: true });
    return res.status(200).json("Se eliminó al profesor exitosamente");
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo eliminar al profesor",
    });
  }
};
