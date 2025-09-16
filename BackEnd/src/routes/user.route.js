import { Router } from "express";

export const router = Router();

import {
  createUser,
  updateUser,
  findAllUsers,
  findUserById,
  deleteUser,
} from "../controllers/user.controller.js";

import { validator } from "../Middlewares/validator.js";

import {
  createUserValidation,
  findUserByIdValidation,
  updateUserValidation,
  deleteUserValidation,
} from "../Middlewares/Validations/user.validation.js";

router.get("/user", findAllUsers);
router.post("/user", createUserValidation, validator, createUser);
router.get("/user/:id", findUserByIdValidation, validator, findUserById);
router.put("/user/:id", updateUserValidation, validator, updateUser);
router.delete("/user/:id", deleteUserValidation, validator, deleteUser);

export default router;
