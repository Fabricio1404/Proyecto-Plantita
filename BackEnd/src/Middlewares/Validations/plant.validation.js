import { body, param } from "express-validator";
import { PlantModel } from "../../models/plant.model.js";

// Id
export const findPlantByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const plant = await PlantModel.findById(value);
      if (!plant) {
        throw new Error("No se encontró la planta");
      }
    }),
];

// Crear
export const createPlantValidation = [
  body("nombreCientifico")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage(
      "El nombreCientifico debe tener entre 3 y 50 caracteres inclusive"
    )
    .custom(async (value) => {
      const existingPlant = await PlantModel.findOne({
        nombreCientifico: value,
      });
      if (existingPlant) {
        throw new Error("nombreCientifico registrado");
      }
    }),
  body("division")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("La division debe tener entre 3 y 50 caracteres inclusive"),
  body("clase")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("La clase debe tener entre 3 y 50 caracteres inclusive"),
  body("subclase")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subclase debe tener entre 3 y 50 caracteres inclusive"),
  body("orden")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 50 })
    .withMessage("La orden debe tener entre 3 y 50 caracteres inclusive"),
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
export const updatePlantValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const plant = await PlantModel.findById(value);
      if (!plant) {
        throw new Error("No se encontró la planta");
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
      const existingPlant = await PlantModel.findOne({
        nombreCientifico: value,
        _id: { $ne: req.params.id },
      });
      if (existingPlant) {
        throw new Error("nombreCientifico registrado");
      }
    }),
  body("division")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La division debe tener entre 3 y 50 caracteres inclusive"),
  body("clase")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La clase debe tener entre 3 y 50 caracteres inclusive"),
  body("subclase")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La subclase debe tener entre 3 y 50 caracteres inclusive"),
  body("orden")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 50 })
    .withMessage("La orden debe tener entre 3 y 50 caracteres inclusive"),
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
export const deletePlantValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const plant = await PlantModel.findById(value);
      if (!plant) {
        throw new Error("No se encontró la planta");
      }
    }),
];
