import { body, param } from "express-validator";
import { InsectModel } from "../../models/insect.model.js";

export const findInsectByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const insect = await InsectModel.findById(value);
      if (!insect) {
        throw new Error("No se encontró el insecto");
      }
    }),
];

// Crear
export const createInsectValidation = [
  body("nombreCientifico")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage(
      "El nombreCientifico debe tener entre 3 y 50 caracteres inclusive"
    )
    .custom(async (value) => {
      const existingInsect = await InsectModel.findOne({
        nombreCientifico: value,
      });
      if (existingInsect) {
        throw new Error("nombreCientifico registrado");
      }
    }),
  body("orden")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("El orden debe tener entre 3 y 50 caracteres inclusive"),
  body("familia")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("La familia debe tener entre 3 y 50 caracteres inclusive"),
  body("subfamilia")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subfamilia debe tener entre 3 y 50 caracteres inclusive"),
  body("tribu")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La tribu debe tener entre 3 y 50 caracteres inclusive"),
  body("subtribu")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subtribu debe tener entre 3 y 50 caracteres inclusive"),
  body("genero")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("El genero debe tener entre 3 y 50 caracteres inclusive"),
  body("especie")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("La especie debe tener entre 3 y 50 caracteres inclusive"),
  body("subespecie")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subespecie debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.nombre")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.region")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La región debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.idioma")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El idioma debe tener entre 3 y 50 caracteres inclusive"),
];

// Actualizar
export const updateInsectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const insect = await InsectModel.findById(value);
      if (!insect) {
        throw new Error("No se encontró el insecto");
      }
    }),
  body("nombreCientifico")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage(
      "El nombreCientifico debe tener entre 3 y 50 caracteres inclusive"
    )
    .custom(async (value, { req }) => {
      const existingInsect = await InsectModel.findOne({
        nombreCientifico: value,
        _id: { $ne: req.params.id },
      });
      if (existingInsect) {
        throw new Error("nombreCientifico registrado");
      }
    }),
  body("orden")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El orden debe tener entre 3 y 50 caracteres inclusive"),
  body("familia")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La familia debe tener entre 3 y 50 caracteres inclusive"),
  body("subfamilia")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subfamilia debe tener entre 3 y 50 caracteres inclusive"),
  body("tribu")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La tribu debe tener entre 3 y 50 caracteres inclusive"),
  body("subtribu")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subtribu debe tener entre 3 y 50 caracteres inclusive"),
  body("genero")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El genero debe tener entre 3 y 50 caracteres inclusive"),
  body("especie")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La especie debe tener entre 3 y 50 caracteres inclusive"),
  body("subespecie")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subespecie debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.nombre")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El nombre debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.region")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La región debe tener entre 3 y 50 caracteres inclusive"),
  body("nombreComun.idioma")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("El idioma debe tener entre 3 y 50 caracteres inclusive"),
];

// Eliminar
export const deleteInsectValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const insect = await InsectModel.findById(value);
      if (!insect) {
        throw new Error("No se encontró el insecto");
      }
    }),
];
