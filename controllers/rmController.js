/ controllers/dcl.controller.js
import {
  getRMQueueDCLs,
  getRMCompletedDCLs,deleteDCL,
} from "../services/services.js";
// import Checklist from "../models/checklist.model.js";
import Checklist from "../models/Checklist.js";
// import { addLog } from "../utils/logger.js";
import Notification from "../models/Notification.js";


// REMOVE DCL
// controllers/dcl.controller.js

export const removeDCL = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await deleteDCL(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "DCL not found",
      });
    }

    res.json({
      success: true,
      message: "DCL deleted successfully",
    });
  } catch (error) {
    console.error("Delete DCL Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


export const getRMQueue = async (req, res) => {
  try {
    const { rmId } = req.params;
    const data = await getRMQueueDCLs(rmId);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Queue load error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



export const getRMCompleted = async (req, res) => {
  try {
    const { rmId } = req.params;
    const data = await getRMCompletedDCLs(rmId);

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Completed load error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//Delete uploaded file

// UTIL — generate DCL Number
// const generateDclNumber = () => {
//   return "DCL-" + Math.floor(100000 + Math.random() * 900000);
// };

// ---------------------------------------------
// CREATE CHECKLIST
// ---------------------------------------------
export const createChecklist = async (req, res) => {
  try {
    const dclNo = generateDclNumber();
    const flat = req.body.documents || [];

    // group by category
    const grouped = flat.reduce((acc, doc) => {
      let c = acc.find((x) => x.category === doc.category);
      if (!c) {
        c = { category: doc.category, docList: [] };
        acc.push(c);
      }
      c.docList.push(doc);
      return acc;
    }, []);

    const checklist = await Checklist.create({
      dclNo,

      customerId: req.body.customerId,
      customerNumber: req.body.customerNumber,
      customerName: req.body.customerName,

      title: req.body.title,
      loanType: req.body.loanType,

      assignedToRM: req.body.assignedToRM,
      createdBy: req.user?.id || null,

      documents: grouped,
      status: "co_creator_review"
    });

    addLog(checklist._id, "Checklist created", req.user?.id);

    res.status(201).json(checklist);
  } catch (err) {
    console.error("CREATE CHECKLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// ---------------------------------------------
// RM SUBMITS CHECKLIST
// --------------------------------------------

// export const submitRmChecklist = async (req, res) => {
//   try {
//     const { checklistId, documents, rmGeneralComment, rmId } = req.body;
// //
//     const checklist = await Checklist.findById(checklistId);
//     if (!checklist)
//       return res.status(404).json({ error: "Checklist not found" });

//     // ===============================
//     // UPDATE NESTED DOCUMENTS
//     // ===============================
//     checklist.documents.forEach((cat) => {
//       cat.docList.forEach((doc) => {
//         const incoming = documents.find((d) => d._id == doc._id);

//         if (incoming) {
//           doc.status = incoming.status || doc.status;
//           doc.comment = incoming.comment || "";
//           doc.action = incoming.action || "";
//           doc.fileUrl = incoming.fileUrl || doc.fileUrl;
//           doc.deferralReason = incoming.deferralReason || doc.deferralReason;
//           doc.rmStatus = incoming.rmStatus || doc.rmStatus;

//           doc.updatedAt = new Date();
//         }
//       });
//     });

//     // ===============================
//     // ADD RM GENERAL COMMENTS + STATUS
//     // ===============================
//     checklist.rmGeneralComment = rmGeneralComment;
//     checklist.rmReviewedBy = rmId || null;
//     checklist.status = "sent_to_co";

//     // ===============================
//     // LOG THE ACTION
//     // ===============================

//     await checklist.save();

//     res.json("Checklist submitted successfully!");
//   } catch (err) {
//     console.error("SUBMIT RM ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// };



export const submitRmChecklist = async (req, res) => {
  try {
    const { checklistId, documents, rmGeneralComment, rmId } = req.body;

    if (!checklistId || !documents || !Array.isArray(documents)) {
      return res.status(400).json({ error: "Invalid request payload" });
    }

    const checklist = await Checklist.findById(checklistId);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    // ===============================
    // UPDATE NESTED DOCUMENTS
    // ===============================
    checklist.documents.forEach((cat) => {
      cat.docList.forEach((doc) => {
        const incoming = documents.find((d) => d._id == doc._id);
        if (!incoming) return;

        doc.status = incoming.status ?? doc.status;
        doc.comment = incoming.comment ?? doc.comment;
        doc.action = incoming.action ?? doc.action;
        doc.fileUrl = incoming.fileUrl ?? doc.fileUrl;
        doc.deferralReason = incoming.deferralReason ?? doc.deferralReason;
        doc.rmStatus = incoming.rmStatus ?? doc.rmStatus;

        doc.updatedAt = new Date();
      });
    });

    // ===============================
    // RM GENERAL COMMENT + WORKFLOW
    // ===============================
    checklist.rmGeneralComment = rmGeneralComment ?? "";
    checklist.rmReviewedBy = rmId || null;
    checklist.status = "sent_to_co";

    const updatedChecklist = await checklist.save();

    return res.json({
      message: "Checklist submitted successfully!",
      checklist: updatedChecklist,  // ⭐ Return updated result
    });
  } catch (err) {
    console.error("SUBMIT RM ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};



// ---------------------------------------------
// GET CHECKLIST BY ID
// ---------------------------------------------
export const getChecklistById = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id)
      .populate("assignedToRM", "name email")
      .populate("createdBy", "name email");

    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    res.json(checklist);
  } catch (err) {
    console.error("GET CHECKLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
//DELETE UPLOADED FILE
export const deleteDocumentFile = asyncHandler(async (req, res) => {
  const { checklistId, documentId } = req.params;

  const checklist = await Checklist.findById(checklistId);
  if (!checklist) throw new Error("Checklist not found");

  const doc = checklist.documents.id(documentId);
  if (!doc) throw new Error("Document not found");

  doc.fileUrl = null;
  await checklist.save();

  res.json({ message: "File deleted successfully" });
});

//rm Notifications
export const getNotifications = async (req, res) => {
  const { userId } = req.query;
  const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
  res.json(notifications);
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  res.json(notification);
};

//completed dcls

export const getCompletedDclsForRm = async (req, res) => {
  try {
    const completed = await Checklist.find({
      status: "Approved",            // only approved checklists
    }).sort({ updatedAt: -1 });

    res.json(completed);
  } catch (err) {
    console.error("Error fetching completed DCLs:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

