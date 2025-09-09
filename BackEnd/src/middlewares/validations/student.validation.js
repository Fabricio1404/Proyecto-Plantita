import { body, param } from "express-validator";
import { UserModel } from "../../models/user.model.js";
import { Op } from "sequelize";

// Obtener por id
export const getStudentByIdValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const user = await UserModel.findByPk(value);
      if (!user) {
        throw new Error("No se encontró al usuario");
      }
    }),
];

// Crear
export const createStudentValidation = [
  body("name")
    .notEmpty()
    .withMessage("El nombre es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre de usuario debe contener entre 3 y 100 caracteres"),
  body("email")
    .notEmpty()
    .withMessage("El email es un campo obligatorio")
    .isEmail()
    .withMessage("El email debe ser uno válido")
    .isLength({ max: 100 })
    .withMessage("El email solo puede tener una longitud de 100 caracteres") //
    .custom(async (value) => {
      const existingEmail = await UserModel.findOne({
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
export const updateStudentValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingUser = await UserModel.findByPk(value);
      if (!existingUser) {
        throw new Error("No se encontró al usuario");
      }
    }),
  body("name")
    .optional()
    .notEmpty()
    .withMessage("El nombre es un campo obligatorio")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("El nombre debe contener entre 3 y 100 caracteres")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({
        where: { name: value, id: { [Op.ne]: req.params.id } },
      });
      if (existingUser) {
        throw new Error("El nombre ya está en uso");
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
      const existingEmail = await UserModel.findOne({
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
export const deleteStudentValidation = [
  param("id")
    .isInt()
    .withMessage("El id debe ser un número entero")
    .custom(async (value) => {
      const existingUser = await UserModel.findByPk(value);
      if (!existingUser) {
        throw new Error("No se encontró al usuario");
      }
    }),
];
