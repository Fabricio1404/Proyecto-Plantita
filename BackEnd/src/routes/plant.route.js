import { Router } from "express";

export const router = Router();

import {
  createPlant,
  findAllPlants,
  findPlantById,
  updatePlant,
  deletePlant,
} from "../controllers/plant.controller.js";

router.post("/plant", createPlant);
router.get("/plant", findAllPlants);
router.get("/plant/:id", findPlantById);
router.put("/plant/:id", updatePlant);
router.delete("/plant/:id", deletePlant);

export default router;
