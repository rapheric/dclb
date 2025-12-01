import Checklist from "../models/Checklist.js";
import { generateDclNumber, addLog } from "../helpers/checklistHelpers.js";

// import multer from "multer";
// const upload = multer({ dest: "uploads/" });

// export const createChecklist = async (req, res) => {
//   try {
//     const dclNo = generateDclNumber();

//     const checklist = await Checklist.create({
//       dclNo,

//       // Customer Information (optional customerId)
//       customerId: req.body.customerId || null, // <- make optional safe
//       customerNumber: req.body.customerNumber,
//       customerName: req.body.customerName,

//       // General
//       title: req.body.title,
//       loanType: req.body.loanType,

//       // Assignments
//       assignedToRM: req.body.assignedToRM,
//       // assignedToCoCreator: req.body.assignedToCoCreator,

//       // Use optional chaining in case req.user is undefined
//       createdBy: req.user?.id || null,

//       // Document List
//       documents: req.body.documents || [],

//       status: "creator_submitted",
//     });

//     // addLog(checklist, "Checklist created", req.user?.id || null);
//     // await checklist.save();

//     res.json(checklist);
//      await checklist.save();

//     } catch (error) {
//   console.error("🔥 BACKEND ERROR:", error);  // <-- ADD THIS
//   return res.status(500).json({ error: error.message });
// }

//   // } catch (error) {
//   //   console.error("Error creating checklist:", error); // log error on server
//   //   res.status(500).json({ error: error.message });
//   // }
// };

// export const createChecklist = async (req, res) => {
//   try {
//     const dclNo = generateDclNumber();

//     const checklist = await Checklist.create({
//       dclNo,

//       customerNumber: req.body.customerNumber,
//       customerName: req.body.customerName,
//       loanNumber: req.body.loanNumber,
//       customerId: req.body.customerId || null,

//       title: req.body.title,
//       loanType: req.body.loanType,

//       assignedToRM: req.body.assignedToRM,
//       assignedToCoCreator: req.body.assignedToCoCreator,

//       createdBy: req.user.id,

//       documents: req.body.documents,
//       status: "co_creator_review",
//     });

//     addLog(checklist, "Checklist created", req.user.id);
//     await checklist.save();

//     res.json(checklist);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// update docs controller

export const createChecklist = async (req, res) => {
  try {
    const dclNo = generateDclNumber();

    const checklist = await Checklist.create({
      dclNo,
      customerId: req.body.customerId || null,
      customerNumber: req.body.customerNumber || "",
      customerName: req.body.customerName || "",

      title: req.body.title,
      loanType: req.body.loanType,
      assignedToRM: req.body.assignedToRM,
      createdBy: req.user?.id || null,

      documents: req.body.documents || [],
      status: "creator_submitted",
    });

    addLog(checklist, "Checklist created", req.user?.id);
    await checklist.save();

    res.json(checklist);
  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    const { documents } = req.body;

    checklist.documents = documents;

    addLog(checklist, "Checklist updated", req.user.id);
    await checklist.save();

    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { checklistId, catIdx, docIdx } = req.body;

    const checklist = await Checklist.findById(checklistId);
    const doc = checklist.documents[catIdx].docList[docIdx];

    doc.fileUrl = `/uploads/${req.file.filename}`;
    doc.status = "uploaded";

    addLog(checklist, `File uploaded for ${doc.name}`, req.user.id);
    await checklist.save();

    res.json({ success: true, doc });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const requestDeferral = async (req, res) => {
  try {
    const { checklistId, catIdx, docIdx, comment } = req.body;

    const checklist = await Checklist.findById(checklistId);
    const doc = checklist.documents[catIdx].docList[docIdx];

    doc.deferralReason = comment;
    doc.deferralRequested = true;
    doc.status = "deferred";

    addLog(checklist, `Deferral requested for ${doc.name}`, req.user.id);
    await checklist.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// review checklist

export const submitRmChecklist = async (req, res) => {
  try {
    const { checklistId } = req.body;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    checklist.status = "rm_submitted";

    addLog(checklist, "RM submitted checklist back to creator", req.user.id);

    await checklist.save();

    res.json({ success: true, checklist });
  } catch (error) {
    console.error("ERROR SUBMITTING RM CHECKLIST:", error);
    res.status(500).json({ error: error.message });
  }
};

// // file upload controller

// export const uploadDocument = async (req, res) => {
//   try {
//     const { checklistId, documentName } = req.body;

//     const checklist = await Checklist.findById(checklistId);
//     const doc = checklist.documents.find((d) => d.name === documentName);

//     const fileUrl = "/uploads/" + req.file.filename;

//     // Replace the latest file
//     doc.fileUrl = fileUrl;

//     // Track in upload history
//     doc.uploadHistory.push({
//       url: fileUrl,
//       uploadedBy: req.user.id,
//     });

//     addLog(checklist, "Document uploaded", req.user.id, documentName);

//     await checklist.save();
//     res.json(doc);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// dashboard stats

export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      total: await Checklist.countDocuments(),
      pending: await Checklist.countDocuments({ status: "pending" }),
      inProgress: await Checklist.countDocuments({ status: "in_progress" }),
      submitted: await Checklist.countDocuments({ status: "submitted" }),
      completed: await Checklist.countDocuments({ status: "completed" }),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get all checklists
// export const getChecklists = async (req, res) => {
//   try {
//     const checklists = await Checklist.find().sort({ createdAt: -1 });
//     res.status(200).json(checklists);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

//
// export const submitChecklistToCoCreator = async (req, res) => {
//   try {
//     const { checklistId, documents } = req.body;

//     // Find checklist by ID
//     const checklist = await Checklist.findById(checklistId);
//     if (!checklist) {
//       return res.status(404).json({ message: "Checklist not found" });
//     }

//     // Update checklist documents and status
//     checklist.documents = documents;
//     checklist.status = "Pending Co-Creator Review";
//     checklist.submittedByRM = true;

//     await checklist.save();

//     res.json({ success: true, message: "Checklist submitted to Co-Creator" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

export const getChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "name email")
      .populate("assignedToRM", "name email");

    res.json(checklists);
  } catch (err) {
    console.error("❌ GET CHECKLISTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching checklists",
      error: err.message,
    });
  }
};

/* ---------------------------------------------------------
   RM SUBMITS CHECKLIST TO CO-CREATOR
--------------------------------------------------------- */
export const submitChecklistFromRM = async (req, res) => {
  try {
    const { checklistId, documents } = req.body;

    if (!checklistId) {
      return res.status(400).json({ error: "Checklist ID missing" });
    }

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    checklist.documents = documents;
    checklist.status = "Pending Co-Creator Review";
    checklist.submittedByRM = true;

    await checklist.save();

    res.json({
      success: true,
      message: "Checklist successfully submitted to Co-Creator",
    });
  } catch (err) {
    console.error("❌ RM SUBMISSION ERROR:", err);
    res.status(500).json({
      error: "Failed to submit checklist to Co-Creator",
      details: err.message,
    });
  }
};

// PATCH /api/checklists/rm-submit

export const submitChecklistToCoCreator = async (req, res) => {
  try {
    const { checklistId, documents: flatDocuments } = req.body;

    const groupedDocuments = flatDocuments.reduce((acc, doc) => {
      // Find or create the category object in the accumulator array
      let categoryObject = acc.find((c) => c.category === doc.category);

      if (!categoryObject) {
        categoryObject = { category: doc.category, docList: [] };
        acc.push(categoryObject);
      }

      // Add the document to the category's docList
      categoryObject.docList.push(doc);

      return acc;
    }, []);

    const updated = await Checklist.findByIdAndUpdate(
      checklistId,
      {
        documents: groupedDocuments,
        status: "Pending Co-Creator Review",
        submittedByRM: true,
      },
      {
        new: true,
        runValidators: false, // << FIX
      }
    );

    if (!updated) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    res.json({
      success: true,
      message: "Checklist submitted to Co-Creator",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// 2. RM uploads documents
export const uploadDocuments = async (req, res) => {
  try {
    const { documents } = req.body;

    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { documents, status: "uploaded" },
      { new: true }
    );

    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 3. RM requests deferral
export const deferDocument = async (req, res) => {
  try {
    const { docIndex, reason } = req.body;

    const checklist = await Checklist.findById(req.params.id);
    checklist.documents[docIndex].status = "deferred";
    checklist.documents[docIndex].deferralReason = reason;
    checklist.status = "deferred";

    await checklist.save();
    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 4. Co-Creator review
export const coCreatorReview = async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { status: "co_creator_review" },
      { new: true }
    );
    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 5. Co-Checker approval
export const coCheckerApproval = async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );
    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Get checklist by MongoDB _id
export const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findById(id);
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }
    res.status(200).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get checklist by DCL number
export const getChecklistByDclNo = async (req, res) => {
  try {
    const { dclNo } = req.params;
    const checklist = await Checklist.findOne({ dclNo });
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }
    res.status(200).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch checklists assigned to rm
export const getRmQueue = async (req, res) => {
  try {
    const { rmId } = req.params;
    const checklists = await Checklist.find({
      assignedToRm: rmId,
      status: "rm_review",
    });
    res.status(200).json(checklists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getChecklistsForRM = async (req, res) => {
  try {
    const rmId = req.user.id; // logged-in RM ID from token

    const checklists = await Checklist.find({ assignedToRM: rmId })
      .populate("assignedToRM", "name email")
      .populate("createdBy", "name email");

    res.status(200).json(checklists);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update document (upload, request deferral, add comment)
export const updateDocument = async (req, res) => {
  try {
    const { checklistId, docIndex, fileUrl, status, deferralReason, comment } =
      req.body;
    const checklist = await Checklist.findById(checklistId);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    if (checklist.documents[docIndex]) {
      if (fileUrl) checklist.documents[docIndex].fileUrl = fileUrl;
      if (status) checklist.documents[docIndex].status = status;
      if (deferralReason)
        checklist.documents[docIndex].deferralReason = deferralReason;
      if (comment) checklist.documents[docIndex].comment = comment;
    }

    await checklist.save();
    res.status(200).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
