import { body, param } from "express-validator";
import { ListModel } from "../../models/list.model.js";

// Id
export const findListByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const list = await ListModel.findById(value);
      if (!list) {
        throw new Error("No se encontró la lista");
      }
    }),
];

// Crear
export const createListValidation = [
  body("list_name")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 30 })
    .withMessage(
      "El nombre de la lista debe tener entre 3 y 30 caracteres inclusive"
    ),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "La descripción debe tener entre 3 y 300 caracteres inclusive"
    ),
  body("author")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isMongoId()
    .withMessage("Id inválida"),
  body("plants")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isArray()
    .withMessage("Plants debe ser un array"),
  body("plants.*") // * Busca cada elemento
    .isMongoId()
    .withMessage("Id inválido"),
  body("insects")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isArray()
    .withMessage("Insects debe ser un array"),
  body("insects.*") // Lo mismo acá
    .isMongoId()
    .withMessage("Id inválida"),
];

// Actualizar
export const updateListValidation = [
  body("list_name")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 30 })
    .withMessage(
      "El nombre de la lista debe tener entre 3 y 30 caracteres inclusive"
    ),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 300 })
    .withMessage(
      "La descripción debe tener entre 3 y 300 caracteres inclusive"
    ),
  body("plants")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isArray()
    .withMessage("Plants debe ser un array"),
  body("plants.*") // * Busca cada elemento
    .isMongoId()
    .withMessage("Id inválido")
    .custom(async (value, { req }) => {
      const list = await ListModel.findById(req.params.id);
      if (list.plants.includes(value)) {
        throw new Error("La planta ya está en la lista");
      }
    }),
  body("insects")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isArray()
    .withMessage("Insects debe ser un array"),
  body("insects.*")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value, { req }) => {
      const list = await ListModel.findById(req.params.id);
      if (list.insects.includes(value)) {
        throw new Error("El insecto ya está en la lista");
      }
    }),
];

// Eliminar
export const deleteListValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const list = await ListModel.findById(value);
      if (!list) {
        throw new Error("No se encontró la lista");
      }
    }),
];
