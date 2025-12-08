/ routes/dcl.routes.js
import express from "express";
import {
    getRMQueue, getRMCompleted, removeDCL,
} from "../controllers/checklistController.js";
import {
    submitRmChecklist,deleteDocumentFile,
    deleteDocumentFile
} from "../controllers/rmController.js";
import { getNotifications, markAsRead } from "../controllers/notificationController.js";
import { getCompletedDclsForRm } from "../controllers/rmController.js";

const router = express.Router();

// RM Queue = in progress
router.get("/:rmId/myqueue", getRMQueue);

//  rm submit checklist
router.post("/submitRm",  submitRmChecklist);


// Completed = approved
router.get("/:rmId/completed", getRMCompleted);

// DELETE a DCL
router.delete("/:id", removeDCL);

// delete uploaded file
router.delete("/", deleteDocumentFile);

// getting completed dcls for rm
router.get("/completed-dcls", getCompletedDclsForRm);

// getting notifications and marking them as read
router.get("/", getNotifications);
router.patch("/:notificationId/read", markAsRead);

export default router;


