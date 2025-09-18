import { Router } from "express";

import { register, login, logout } from "../controllers/auth.controller.js";

import { validator } from "../Middlewares/validator.js";

import { createUserValidation } from "../Middlewares/Validations/user.validation.js";

const router = Router();

router.post("/register", createUserValidation, validator, register);
router.post("/login", login);
router.post("/logout", logout);

export default router;
