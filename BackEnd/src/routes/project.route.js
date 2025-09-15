import { Router } from "express";

export const router = Router();

import {
  createProject,
  findAllProjects,
  findProjectById,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.js";

router.post("/project", createProject);
router.get("/project", findAllProjects);
router.get("/project/:id", findProjectById);
router.put("/project/:id", updateProject);
router.delete("/project/:id", deleteProject);

export default router;
