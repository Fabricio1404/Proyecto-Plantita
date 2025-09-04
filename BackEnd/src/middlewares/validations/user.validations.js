import { body } from "express-validator";

const NAME_REGEX = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,80}$/;
const PWD_MIN = parseInt(process.env.PASSWORD_MIN_LEN || "8", 10);
const PWD_MAX = parseInt(process.env.PASSWORD_MAX_LEN || "64", 10);

export const registerValidation = [
  body("name")
    .trim()
    .matches(NAME_REGEX).withMessage("Nombre inválido (solo letras y espacios, 2-80)")
    .isLength({ min: 2, max: 80 }),
  body("email")
    .isEmail().withMessage("Email inválido")
    .normalizeEmail(),
  body("password")
    .isLength({ min: PWD_MIN, max: PWD_MAX })
    .withMessage(`La contraseña debe tener entre ${PWD_MIN} y ${PWD_MAX} caracteres`)
];

export const loginValidation = [
  body("email").isEmail().withMessage("Email inválido").normalizeEmail(),
  body("password").notEmpty().withMessage("Password requerida")
];
