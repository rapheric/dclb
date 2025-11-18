import express from "express";
import {
  createChecklist,
  getChecklists,
  getChecklistById,
  // updateDocument,
  countChecklists,
  getChecklistsByRM,
  // getChecklistById,
  updateDocumentInChecklist,
  getDocumentSummaryByLoan,
  getDocSamSummary,
} from "../controllers/checklistController.js";

const router = express.Router();

router.post("/", createChecklist);
router.get("/", getChecklists);
router.get("/count", countChecklists);
router.get("/:id", getChecklistById);
// router.get("/rm/:rmId", getChecklistsByRM);
router.get("/document-summary-by-loan", getDocumentSummaryByLoan);
router.get("/", getDocSamSummary);
router.put("/:id/document/:docId", updateDocumentInChecklist);

export default router;
