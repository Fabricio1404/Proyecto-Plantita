import { Router } from "express";
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/student.controller.js";

export const router = Router();

import { validator } from "../middlewares/validator.js";

import {
  getStudentByIdValidation,
  createStudentValidation,
  updateStudentValidation,
  deleteStudentValidation,
} from "../middlewares/validations/student.validation.js";

router.get("/", getAllStudents);
router.get("/:id", getStudentByIdValidation, validator, getStudentById);
router.post("/", createStudentValidation, validator, createStudent);
router.put("/:id", updateStudentValidation, validator, updateStudent);
router.delete("/:id", deleteStudentValidation, validator, deleteStudent);

export default router;
