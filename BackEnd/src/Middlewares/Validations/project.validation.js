import { body, param } from "express-validator";
import { ProjectModel } from "../../models/project.model.js";

// Id
export const findProjectByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const project = await ProjectModel.findById(value);
      if (!project) {
        throw new Error("No se encontró el proyecto");
      }
    }),
];

// Crear
export const createProjectValidation = [
  body("name")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 30 })
    .withMessage("El nombre debe tener entre 3 y 30 caracteres inclusive")
    .custom(async (value) => {
      const existingProject = await ProjectModel.findOne({ name: value });
      if (existingProject) {
        throw new Error("Nombre registrado");
      }
    }),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "La descripción debe tener entre 3 y 300 caracteres inclusive"
    ),
  body("duration")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La duración debe tener entre 3 y 50 caracteres inclusive"),
  body("creator")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isMongoId()
    .withMessage("Id inválida"),
];

// Actualizar
export const updateProjectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const project = await ProjectModel.findById(value);
      if (!project) {
        throw new Error("No se encontró el proyecto");
      }
    }),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 30 })
    .withMessage("El name debe tener entre 3 y 30 caracteres inclusive")
    .custom(async (value, { req }) => {
      const existingProject = await ProjectModel.findOne({
        name: value,
        _id: { $ne: req.params.id },
      });
      if (existingProject) {
        throw new Error("Nombre registrado");
      }
    }),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "La descripción debe tener entre 3 y 300 caracteres inclusive"
    ),
  body("duration")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La duración debe tener entre 3 y 50 caracteres inclusive"),
];

// Eliminar
export const deleteProjectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const project = await ProjectModel.findById(value);
      if (!project) {
        throw new Error("No se encontró el proyecto");
      }
    }),
];
