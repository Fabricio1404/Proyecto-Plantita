import { Router } from "express";

export const router = Router();

import {
  createInsect,
  findAllInsects,
  findInsectById,
  updateInsect,
  deleteInsect,
} from "../controllers/insect.controller.js";

import { validator } from "../middlewares/validator.js";

import {
  createInsectValidation,
  findInsectByIdValidation,
  updateInsectValidation,
  deleteInsectValidation,
} from "../middlewares/validations/insect.validation.js";

router.get("/insect", findAllInsects);
router.post("/insect", createInsectValidation, validator, createInsect);
router.get("/insect/:id", findInsectByIdValidation, validator, findInsectById);
router.put("/insect/:id", updateInsectValidation, validator, updateInsect);
router.delete("/insect/:id", deleteInsectValidation, validator, deleteInsect);

export default router;
