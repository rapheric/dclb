// routes/cocreatorRoutes.js
import express from "express";
import { protect, authorizeRoles } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/upload.js";

import {
  createChecklist,
  getAllCoCreatorChecklists,
  getSpecificChecklistsByCreator,
  getCoCreatorChecklistById,
  getCoCreatorChecklistByDclNo,
  getCoCreatorActiveChecklists,
  updateChecklistByCoCreator,
  coCreatorSubmitToRM,
  submitToCoChecker,
  coCreatorReview,
  coCheckerApproval,
  coCreatorAddDocument,
  coCreatorUpdateDocument,
  deleteDocument,
  updateDocumentAdmin,
  searchCustomer,
  uploadDocumentFile,
  // getChecklistById,
  // getChecklistByDclNo,
  // getDCLs,
  // updateChecklist,
  // submitToRM,
  // submitToCoChecker,
  // coCreatorReview,
  // coCheckerApproval,
  // addDocument,
  // updateDocument,
  // deleteDocument,
  // uploadDocumentFile,
  // updateDocumentAdmin,
} from "../controllers/cocreatorController.js";

const router = express.Router();

// --- Creation & General Info ---
router.post("/", protect, authorizeRoles("cocreator"), createChecklist);
router.get("/", protect, getAllCoCreatorChecklists);
// router.get("/dcls", protect, getDCLs);
router.get("/:id", protect, getCoCreatorChecklistById);
router.get("/dcl/:dclNo", protect, getCoCreatorChecklistByDclNo);
router.put(
  "/:id",
  protect,
  authorizeRoles(["cocreator", "rm", "coChecker"]),
  updateChecklistByCoCreator
);
// Search customers by query string
// Example request: GET /api/cocreatorChecklist/search/customer?q=12345
router.get("/search/customer", protect, searchCustomer);
// SPECIFIC CHECKLIST
router.get("/creator/:creatorId", getSpecificChecklistsByCreator);

// --- Workflow ---
router.put("/:id/co-create", protect, coCreatorReview);
router.put("/:id/co-check", protect, coCheckerApproval);

// --- Admin Document Override ---
router.put("/update-document", protect, updateDocumentAdmin);

// --- Submissions ---
router.post(
  "/:id/submit-to-rm",
  protect,
  authorizeRoles(["cocreator"]),
  coCreatorSubmitToRM
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
  coCreatorAddDocument
);
router.patch(
  "/:id/documents/:docId",
  protect,
  authorizeRoles(["cocreator", "rm"]),
  coCreatorUpdateDocument
);
router.delete(
  "/:id/documents/:docId",
  protect,
  authorizeRoles(["rm", "cocreator"]),
  deleteDocument
);

// GET CUSTOMERS

router.get("/search/customer", searchCustomer);

// ------------------------------
// 🟢 GET ACTIVE CHECKLISTS (Co-Creator)
// ------------------------------
router.get("/cocreator/active", getCoCreatorActiveChecklists);

// --- Uploads ---
router.post(
  "/:id/documents/:docId/upload",
  protect,
  authorizeRoles(["cocreator", "rm"]),
  uploadSingle("file"),
  uploadDocumentFile
);

export default router;
