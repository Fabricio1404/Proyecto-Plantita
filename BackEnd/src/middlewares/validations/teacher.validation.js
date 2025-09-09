import { body, param } from "express-validator";
import { TeacherModel } from "../../models/teacher.model.js";
import { Op } from "sequelize";

// Obtener por id
export const getTeacherByIdValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const teacher = await TeacherModel.findByPk(value);
      if (!teacher) {
        throw new Error("No se encontró al usuario");
      }
    }),
];

// Crear
export const createteacherValidation = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage("El nombre debe contener entre 3 y 100 caracteres"),
  body("email")
    .notEmpty()
    .withMessage("El email es un campo obligatorio")
    .isEmail()
    .withMessage("El email debe ser uno válido")
    .isLength({ max: 100 })
    .withMessage("El email solo puede tener una longitud de 100 caracteres") //
    .custom(async (value) => {
      const existingEmail = await TeacherModel.findOne({
        where: { email: value },
      });
      if (existingEmail) {
        throw new Error("El email ya se encuentra registrado");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es un campo obligatorio"),
];

// Actualizar
export const updateTeacherValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingTeacher = await TeacherModel.findByPk(value);
      if (!existingTeacher) {
        throw new Error("No se encontró al usuario");
      }
    }),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre de usuario es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre de usuario debe contener entre 3 y 100 caracteres")
    .custom(async (value) => {
      const existingTeacher = await TeacherModel.findOne({
        where: { name: value, id: { [Op.ne]: req.params.id } },
      });
      if (existingTeacher) {
        throw new Error("El nombre de usuario ya está en uso");
      }
    }),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("El email es un campo obligatorio")
    .isEmail()
    .withMessage("El email debe ser uno válido")
    .isLength({ max: 100 })
    .withMessage("El email solo puede tener una longitud de 100 caracteres") //
    .custom(async (value) => {
      const existingEmail = await TeacherModel.findOne({
        where: { email: value, id: { [Op.ne]: req.params.id } },
      });
      if (existingEmail) {
        throw new Error("El email ya se encuentra registrado");
      }
    }),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("La contraseña es un campo obligatorio"),
];

// Eliminar
export const deleteTeacherValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingTeacher = await TeacherModel.findByPk(value);
      if (!existingTeacher) {
        throw new Error("No se encontró al usuario");
      }
    }),
];
