import express from "express";
import {
  getActiveDCLs,
  getMyQueue,
  getCompletedDCLsForChecker, // updated API
  getDclById,
  updateDclStatus,
  getAutoMovedMyQueue,
  getCheckerReports,
  approveDclWithNotification,
  rejectDclWithNotification,
} from "../controllers/checkerController.js";

const router = express.Router();

// 1. Active DCLs (CoCreator stage)
router.get("/active-dcls", getActiveDCLs);

// 2. My Queue (Checker assigned)
router.get("/my-queue/:checkerId", getMyQueue);

// 3. Completed DCLs for Checker (Approved)
router.get("/completed/:checkerId", getCompletedDCLsForChecker); // updated endpoint

// 4. Get Single DCL
router.get("/dcl/:id", getDclById);

// 5. Update DCL Status (old API remains)
router.put("/dcl/:id", updateDclStatus);

// 6. Auto-Move My Queue → Completed
router.get("/my-queue-auto/:checkerId", getAutoMovedMyQueue);

// 7. Reports dashboard metrics
router.get("/reports/:checkerId", getCheckerReports);

// -------------------------------------------
// NEW APIS (8 & 9)
// Notification-based Approve / Reject DCL
// -------------------------------------------

// 8. Approve DCL (with notifications)
router.patch("/approve/:id", approveDclWithNotification);

// 9. Reject DCL (with notifications)
router.patch("/reject/:id", rejectDclWithNotification);

export default router;
