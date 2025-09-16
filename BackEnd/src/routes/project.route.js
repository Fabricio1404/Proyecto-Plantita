import { Router } from "express";

export const router = Router();

import {
  createProject,
  findAllProjects,
  findProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

import { validator } from "../Middlewares/validator.js";

import {
  createProjectValidation,
  findProjectByIdValidation,
  updateProjectValidation,
  deleteProjectValidation,
} from "../Middlewares/Validations/project.validation.js";

router.get("/project", findAllProjects);
router.post("/project", createProjectValidation, validator, createProject);
router.get(
  "/project/:id",
  findProjectByIdValidation,
  validator,
  findProjectById
);
router.put("/project/:id", updateProjectValidation, validator, updateProject);
router.delete(
  "/project/:id",
  deleteProjectValidation,
  validator,
  deleteProject
);

export default router;
