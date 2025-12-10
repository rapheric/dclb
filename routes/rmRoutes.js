import express from "express";
import {
    getRMQueue, removeDCL,submitChecklistToCoCreator,deleteDocumentFile,
    getChecklistById,getRmNotifications,
    markRmNotificationsAsRead,getCompletedDclsForRm
} from "../controllers/rmController.js";

const router = express.Router();

// RM Queue = in progress
router.get("/:rmId/myqueue", getRMQueue);

//  rm submit checklist to cocreator
router.post("/submitChecklistToCoCreator",  submitChecklistToCoCreator);


//Rm get  Completed Dcls = approved

router.get("/completed/rm/:rmId", getCompletedDclsForRm);


// DELETE a DCL
router.delete("/:id", removeDCL);

// ✅ Get checklist by ID
router.get("/:id", getChecklistById);

// ✅ Delete uploaded file for a document inside a checklist
router.delete("/:checklistId/document/:documentId", deleteDocumentFile);


/* ----------------------- RM NOTIFICATIONS ROUTES ----------------------- */

// ✅ Get notifications for RM
router.get("/notifications/rm", getRmNotifications);
// usage: /api/checklist/notifications/rm?userId=123

// ✅ Mark a notification as read
router.put("/notifications/rm/:notificationId", markRmNotificationsAsRead);

export default router;


