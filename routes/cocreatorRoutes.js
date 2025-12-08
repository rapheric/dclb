// routes/cocreatorRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/upload.js";

import {
  createChecklist,
  getChecklists,
  getChecklistById,
  getChecklistByDclNo,
  getDCLs,
  updateChecklist,
  submitToRM,
  submitToCoChecker,
  coCreatorReview,
  coCheckerApproval,
  addDocument,
  updateDocument,
  deleteDocument,
  uploadDocumentFile,
  updateDocumentAdmin,
} from "../controllers/cocreatorController.js";
  
const router = express.Router();

// --- Creation & General Info ---
router.post("/", protect, authorizeRoles("cocreator"), createChecklist);
router.get("/", protect, getChecklists);
router.get("/dcls", protect, getDCLs);
router.get("/:id", protect, getChecklistById);
router.get("/dcl/:dclNo", protect, getChecklistByDclNo);
router.put(
  "/:id",
  protect,
  authorizeRoles(["cocreator", "rm", "admin"]),
  updateChecklist
);

// --- Workflow ---
router.put("/:id/co-create", protect, coCreatorReview);
router.put("/:id/co-check", protect, coCheckerApproval);

// --- Admin Document Override ---
router.put("/update-document", protect, updateDocumentAdmin);

// --- Submissions ---
router.post(
  "/:id/submit-to-rm",
  protect,
  authorizeRoles(["cocreator", "admin"]),
  submitToRM
);
router.post(
  "/:id/submit-to-cochecker",
  protect,
  authorizeRoles(["cocreator"]),
  submitToCoChecker
);

// --- Document Handling ---
router.post(
  "/:id/documents",
  protect,
  authorizeRoles(["cocreator", "rm"]),
  addDocument
);
router.patch(
  "/:id/documents/:docId",
  protect,
  authorizeRoles(["rm"]),
  updateDocument
);
router.delete(
  "/:id/documents/:docId",
  protect,
  authorizeRoles(["rm", "cocreator"]),
  deleteDocument
);

// --- Uploads ---
router.post(
  "/:id/documents/:docId/upload",
  protect,
  authorizeRoles(["cocreator", "rm"]),
  uploadSingle("file"),
  uploadDocumentFile
);

export default router;
