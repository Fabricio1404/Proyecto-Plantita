import { Router } from "express";
import { register, login, me } from "../controllers/user.controllers.js";
import { handleValidation } from "../middlewares/validator.js";
import { registerValidation, loginValidation } from "../middlewares/validations/user.validations.js";
import { authGuard } from "../middlewares/auth.guard.js";

const router = Router();

router.post("/register", registerValidation, handleValidation, register);
router.post("/login",    loginValidation,    handleValidation, login);
router.get("/me", authGuard, me);

export default router;
