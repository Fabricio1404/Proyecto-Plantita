import { StudentModel } from "../models/user.model.js";

// Obtener todo
export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentModel.findAll({
      where: { deleted: false },
    });
    return res.status(200).json(students);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudieron obtener a los estudiantes",
    });
  }
};

// Obtener por id
export const getStudentById = async (req, res) => {
  try {
    const student = await StudentModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo obtener al estudiante",
    });
  }
};

// Crear
export const createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const newStudent = await StudentModel.create({
      name,
      email,
      password,
    });
    return res.status(201).json(newStudent);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo crear al estudiante",
    });
  }
};

// Modificar
export const updateStudent = async (req, res) => {
  try {
    const student = await StudentModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    const { name, email, password } = req.body;
    await student.update({
      name: name || student.name,
      email: email || student.email,
      password: password || student.password,
    });
    return res.status(200).json(student);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo actualizar al estudiante",
    });
  }
};

// Eliminar
export const deleteStudent = async (req, res) => {
  try {
    const student = await StudentModel.findOne({
      where: { id: req.params.id, deleted: false },
    });
    await student.update({ deleted: true });
    return res.status(200).json("Se eliminó al estudiante exitosamente");
  } catch (error) {
    return res.status(500).json({
      error: error.message,
      message: "No se pudo eliminar al estudiante",
    });
  }
};
