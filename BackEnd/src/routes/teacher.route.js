import { Router } from "express";
import {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacher.controller.js";

export const router = Router();

import { validator } from "../middlewares/validator.js";

import {
  getTeacherByIdValidation,
  createTeacherValidation,
  updateTeacherValidation,
  deleteTeacherValidation,
} from "../middlewares/validations/teacher.validation.js";

router.get("/", getAllTeachers);
router.get("/:id", getTeacherByIdValidation, validator, getTeacherById);
router.post("/", createTeacherValidation, validator, createTeacher);
router.put("/:id", updateTeacherValidation, validator, updateTeacher);
router.delete("/:id", deleteTeacherValidation, validator, deleteTeacher);

export default router;
