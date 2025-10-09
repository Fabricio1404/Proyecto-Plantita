import { Router } from "express";
import { body, param } from "express-validator";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createList, getMyLists, getMyListById, renameList, deleteList,
  addItem, removeItem
} from "../controllers/list.controller.js";

const router = Router();

/* ===== Validaciones ===== */
const vListCreate = [
  body("name").isString().trim().isLength({ min: 2 }).withMessage("Nombre requerido (mín 2)"),
  body("type").optional().isIn(["plantas", "insectos", "mixta"])
];

const vListId = [ param("id").isMongoId() ];

const vListRename = [
  param("id").isMongoId(),
  body("name").isString().trim().isLength({ min: 2 })
];

// 🔧 Aceptar null en campos opcionales (optional({ nullable: true }))
const vAddItem = [
  param("id").isMongoId(),
  body("taxon_id").isNumeric().withMessage("taxon_id numérico").toInt(),
  body("nombre_cientifico").isString().trim().isLength({ min: 1 }).withMessage("nombre_cientifico requerido"),
  body("nombre").optional({ nullable: true }).isString().withMessage("nombre debe ser string").trim(),
  body("foto_url").optional({ nullable: true }).isString().withMessage("foto_url debe ser string").trim(),
  body("notes").optional({ nullable: true }).isString().withMessage("notes debe ser string").trim()
];

const vRemoveItem = [
  param("id").isMongoId(),
  param("taxon_id").isNumeric().toInt()
];

/* ===== Rutas (todas requieren login) ===== */
router.post("/lists", requireAuth, vListCreate, createList);
router.get("/lists", requireAuth, getMyLists);
router.get("/lists/:id", requireAuth, vListId, getMyListById);
router.patch("/lists/:id", requireAuth, vListRename, renameList);
router.delete("/lists/:id", requireAuth, vListId, deleteList);

router.post("/lists/:id/items", requireAuth, vAddItem, addItem);
router.delete("/lists/:id/items/:taxon_id", requireAuth, vRemoveItem, removeItem);

export default router;
