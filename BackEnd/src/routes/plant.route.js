import { Router } from "express";

export const router = Router();

import {
  createPlant,
  findAllPlants,
  findPlantById,
  updatePlant,
  deletePlant,
} from "../controllers/plant.controller.js";

import { validator } from "../Middlewares/validator.js";

import {
  createPlantValidation,
  findPlantByIdValidation,
  updatePlantValidation,
  deletePlantValidation,
} from "../Middlewares/Validations/plant.validation.js";

router.get("/plant", findAllPlants);
router.post("/plant", createPlantValidation, validator, createPlant);
router.get("/plant/:id", findPlantByIdValidation, validator, findPlantById);
router.put("/plant/:id", updatePlantValidation, validator, updatePlant);
router.delete("/plant/:id", deletePlantValidation, validator, deletePlant);

export default router;
