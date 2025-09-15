import { Router } from "express";

export const router = Router();

import {
  createList,
  findAllLists,
  findListById,
  updateList,
  deleteList,
  addPlantToList,
  addInsectToList,
} from "../controllers/list.controller.js";

router.post("/list/:listId/plant/:plantId", addPlantToList);
router.post("/list/:listId/insect/:insectId", addInsectToList);
router.post("/list", createList);
router.get("/list", findAllLists);
router.get("/list/:id", findListById);
router.put("/list/:id", updateList);
router.delete("/list/:id", deleteList);

export default router;
