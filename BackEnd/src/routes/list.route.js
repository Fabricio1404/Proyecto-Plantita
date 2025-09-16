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

import { validator } from "../middlewares/validator.js";

import {
  createListValidation,
  findListByIdValidation,
  updateListValidation,
  deleteListValidation,
} from "../middlewares/validations/list.validation.js";

router.post("/list/:listId/plant/:plantId", addPlantToList);
router.post("/list/:listId/insect/:insectId", addInsectToList);
router.get("/list", findAllLists);
router.post("/list", createListValidation, validator, createList);
router.get("/list/:id", findListByIdValidation, validator, findListById);
router.put("/list/:id", updateListValidation, validator, updateList);
router.delete("/list/:id", deleteListValidation, validator, deleteList);

export default router;
