import { Router } from "express";

export const router = Router();

import {
  createInsect,
  findAllInsects,
  findInsectById,
  updateInsect,
  deleteInsect,
} from "../controllers/insect.controller.js";

router.post("/insect", createInsect);
router.get("/insect", findAllInsects);
router.get("/insect/:id", findInsectById);
router.put("/insect/:id", updateInsect);
router.delete("/insect/:id", deleteInsect);

export default router;
