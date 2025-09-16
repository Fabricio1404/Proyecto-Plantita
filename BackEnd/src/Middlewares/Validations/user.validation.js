import { body, param } from "express-validator";
import { UserModel } from "../../models/user.model.js";

// Id
export const findUserByIdValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("No se encontró al usuario");
      }
    }),
];

// Crear
export const createUserValidation = [
  body("username")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 30 })
    .withMessage("El username debe tener entre 3 y 30 caracteres inclusive")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({ username: value });
      if (existingUser) {
        throw new Error("Username registrado");
      }
    }),
  body("email")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 3, max: 254 }) // Este valor lo agrego solo por estándar RFC 5321
    .withMessage("El email debe tener entre 3 y 254 caracteres inclusive")
    .isEmail()
    .withMessage("El email debe ser válido")
    .custom(async (value) => {
      const existingEmail = await UserModel.findOne({ email: value });
      if (existingEmail) {
        throw new Error("Email registrado");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Faltan campos obligatorios")
    .isLength({ min: 8, max: 26 })
    .withMessage("La contraseña debe tener entre 8 y 26 caracteres inclusive")
    .matches(/[a-zA-Z]/)
    .withMessage("La contraseña debe contener letras")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número"),
  body("profile.first_name")
    .notEmpty()
    .withMessage("Faltan campos obligatorios"),
  body("profile.last_name")
    .notEmpty()
    .withMessage("Faltan campos obligatorios"),
  body("profile.recovery_email")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isEmail()
    .withMessage("El email debe ser válido"),
];

// Actualizar
export const updateUserValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("No se encontró al usuario");
      }
    }),
  body("username")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 30 })
    .withMessage("El username debe tener entre 3 y 30 caracteres inclusive")
    .custom(async (value) => {
      const existingUser = await UserModel.findOne({ username: value });
      if (existingUser) {
        throw new Error("Username registrado");
      }
    }),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 3, max: 254 })
    .withMessage("El email debe tener entre 3 y 254 caracteres inclusive")
    .isEmail()
    .withMessage("El email debe ser válido")
    .custom(async (value, { req }) => {
      const existingEmail = await UserModel.findOne({
        email: value,
        _id: { $ne: req.params.id }, // Obviamos el actual
      });
      if (existingEmail) {
        throw new Error("Email registrado");
      }
    }),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isLength({ min: 8, max: 26 })
    .withMessage("La contraseña debe tener entre 8 y 26 caracteres inclusive")
    .matches(/[a-zA-Z]/)
    .withMessage("La contraseña debe contener letras")
    .matches(/\d/)
    .withMessage("La contraseña debe contener al menos un número"),
  body("profile.first_name")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío"),
  body("profile.last_name")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío"),
  body("profile.recovery_email")
    .optional()
    .notEmpty()
    .withMessage("El campo no puede estar vacío")
    .isEmail()
    .withMessage("El email debe ser válido"),
];

// Eliminar
export const deleteUserValidation = [
  param("id")
    .isMongoId()
    .withMessage("Id inválida")
    .custom(async (value) => {
      const user = await UserModel.findById(value);
      if (!user) {
        throw new Error("No se encontró al usuario");
      }
    }),
];
