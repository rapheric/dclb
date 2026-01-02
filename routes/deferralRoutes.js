import express from "express";
import {
  createDeferral,
  getPendingDeferrals,
  getDeferral,
  updateFacilities,
  addDocument,
  deleteDocument,
  setApprovers,
  removeApprover,
  approveDeferral,
  rejectDeferral,
  generatePDF,
} from "../controllers/deferralController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createDeferral);
router.get("/pending", protect, getPendingDeferrals);
router.get("/:id", protect, getDeferral);

router.put("/:id/facilities", protect, updateFacilities);

router.post("/:id/documents", protect, addDocument);
router.delete("/:id/documents/:docId", protect, deleteDocument);

router.put("/:id/approvers", protect, setApprovers);
router.delete("/:id/approvers/:index", protect, removeApprover);

router.put("/:id/approve", protect, approveDeferral);
router.put("/:id/reject", protect, rejectDeferral);

router.get("/:id/pdf", protect, generatePDF);

// generate pdf
router.get("/:id/pdf", protect, generatePDF);


export default router;
