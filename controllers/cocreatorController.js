
import Checklist from "../models/Checklist.js";
import { addLog, generateDclNumber } from "../helpers/checklistHelpers.js";

//  CREATE CHECKLIST

export const createChecklist = async (req, res) => {
  try {
    const {
      customerId,
      customerNumber,
      customerName,
      loanType,
      assignedToRM,
      documents,
    } = req.body;

    // FIX: Await the DCL generator
    const dclNo = await generateDclNumber();

    const checklist = await Checklist.create({
      dclNo,
      customerId,
      customerNumber,
      customerName,
      loanType,
      assignedToRM,
      createdBy: req.user._id,
      documents,
    });

    res.status(201).json({
      message: "Checklist created successfully",
      checklist,
    });
  } catch (err) {
    console.log("CREATE CHECKLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


// search  a customer
export const searchCustomer = async (req, res) => {
  try {
    const q = req.query.q || "";

    const results = await Customer.find({
      customerNumber: { $regex: q, $options: "i" },
    }).limit(10);

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   GET ALL CHECKLISTS CREATED BY ALL CO CREATORS
--------------------------- */
export const getAllCoCreatorChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "name email")
      .populate("assignedToRM", "name email");

    res.json(checklists);
  } catch (err) {
    console.error("❌ GET CHECKLISTS ERROR:", err);
    res
      .status(500)
      .json({ message: "Error fetching checklists", error: err.message });
  }
};

//  GET ALL CHECKLISTS CREATED BY A SPECIFIC CO CREATOR

export const getSpecificChecklistsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;

    const checklists = await Checklist.find({ createdBy: creatorId })
      .populate("createdBy", "name email")
      .populate("assignedToRM", "name email")
      .sort({ createdAt: -1 });

    res.json(checklists);
  } catch (err) {
    console.error("❌ GET CHECKLISTS BY CREATOR ERROR:", err);
    res
      .status(500)
      .json({ message: "Error fetching checklists for creator", error: err.message });
  }
};


/* ---------------------------
   GET CHECKLIST BY ID FOR A CREATOR
--------------------------- */
export const getCoCreatorChecklistById = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   GET CHECKLIST BY DCL NO
--------------------------- */
export const getCoCreatorChecklistByDclNo = async (req, res) => {
  try {
    const { dclNo } = req.params;
    const checklist = await Checklist.findOne({ dclNo });
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });
    res.json({ checklist });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------
   GET ACTIVE  DCLs FOR CO CREATOR
--------------------------- */
export const getCoCreatorActiveChecklists = async (req, res) => {
  try {
    const active = await Checklist.find({ status: "Active" })
      .select("dclNo status customerName updatedAt")
      .sort({ updatedAt: -1 });

    res.json(active);
  } catch (err) {
    console.error("❌ GET ACTIVE CHECKLISTS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   GET COMPLETED DCLs FOR CO CREATOR
--------------------------- */

/* ---------------------------
 CO CREATOR   UPDATE  CHECKLIST
--------------------------- */
// export const updateChecklist = async (req, res) => {
//   try {
//     const checklist = await Checklist.findById(req.params.id);
//     if (!checklist)
//       return res.status(404).json({ error: "Checklist not found" });

//     const { documents, status } = req.body;
//     if (documents) checklist.documents = documents;
//     if (status) checklist.status = status;

//     addLog(checklist, "Checklist updated", req.user?.id);
//     await checklist.save();

//     res.json(checklist);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const updateChecklistByCoCreator = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const { documents, status, generalComment } = req.body;

    // Fetch the checklist
    const checklist = await Checklist.findById(checklistId);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    // ---------------------------
    // 🔐 BUSINESS RULE
    // Co-Creator can update only when RM has returned it
    // (meaning status must be "co_creator_review")
    // ---------------------------
    if (checklist.status !== "co_creator_review") {
      return res.status(403).json({
        error:
          "You can only update this checklist after RM sends it back for correction.",
      });
    }

    // ---------------------------
    // 📄 1. UPDATE DOCUMENTS
    // ---------------------------
    if (documents && Array.isArray(documents)) {
      documents.forEach((updated) => {
        const category = checklist.documents.find(
          (c) => c.category === updated.category
        );

        if (!category) return;

        updated.docList.forEach((docUpdate) => {
          const doc = category.docList.id(docUpdate._id);

          if (!doc) return;

          // Update file if uploaded
          if (docUpdate.fileUrl !== undefined) {
            doc.fileUrl = docUpdate.fileUrl;
          }

          // Update RM comment or Co-Creator comment
          if (docUpdate.comment !== undefined) {
            doc.comment = docUpdate.comment;
          }

          // Update status (pendingrm, submitted, returned, etc.)
          if (docUpdate.status !== undefined) {
            doc.status = docUpdate.status;
          }

          // Add deferral reason if any
          if (docUpdate.deferralReason !== undefined) {
            doc.deferralReason = docUpdate.deferralReason;
          }
        });
      });
    }

    // ---------------------------
    // 🔄 2. Update main checklist status
    // ---------------------------
    if (status) {
      checklist.status = status;
    }

    // ---------------------------
    // 📝 3. Add general comment (Co-Creator)
    // ---------------------------
    if (generalComment) {
      checklist.logs.push({
        message: `Co-Creator comment: ${generalComment}`,
        userId: req.user.id,
        timestamp: new Date(),
      });
    }

    // ---------------------------
    // 🧾 4. Add system log
    // ---------------------------
    checklist.logs.push({
      message: "Checklist updated by Co-Creator",
      userId: req.user.id,
      timestamp: new Date(),
    });

    // Save changes
    await checklist.save();

    res.json({
      message: "Checklist updated successfully",
      checklist,
    });
  } catch (err) {
    console.error("UPDATE CHECKLIST ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ---------------------------
//    SUBMIT TO RM
// --------------------------- */
// export const coCreatorSubmitToRM = async (req, res) => {
//   try {
//     const { creatorComment, documents } = req.body;
//     const updated = await Checklist.findByIdAndUpdate(
//       req.params.id,
//       { documents, status: "rm_review" },
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

export const coCreatorSubmitToRM = async (req, res) => {
  try {
    const checklistId = req.params.id;
    const { creatorComment, documents } = req.body;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    // ---------------------------
    // 📄 1. Update documents (status, fileUrl, comment etc.)
    // ---------------------------
    if (documents && Array.isArray(documents)) {
      documents.forEach((updatedCategory) => {
        const category = checklist.documents.find(
          (c) => c.category === updatedCategory.category
        );

        if (!category) return;

        updatedCategory.docList.forEach((docUpdate) => {
          const doc = category.docList.id(docUpdate._id);
          if (!doc) return;

          // status update (submitted, pendingrm, etc.)
          if (docUpdate.status !== undefined) doc.status = docUpdate.status;

          // file upload update
          if (docUpdate.fileUrl !== undefined) doc.fileUrl = docUpdate.fileUrl;

          // co-creator comment
          if (docUpdate.comment !== undefined) doc.comment = docUpdate.comment;

          // deferral reason
          if (docUpdate.deferralReason !== undefined) {
            doc.deferralReason = docUpdate.deferralReason;
          }
        });
      });
    }

    // ---------------------------
    // 📝 2. Add Co-Creator general comment (if provided)
    // ---------------------------
    if (creatorComment) {
      checklist.logs.push({
        message: `Co-Creator comment: ${creatorComment}`,
        userId: req.user.id,
        timestamp: new Date(),
      });
    }

    // ---------------------------
    // 🔄 3. Move checklist to RM Review
    // ---------------------------
    checklist.status = "rm_review";

    // ---------------------------
    // 🧾 4. Add System Log
    // ---------------------------
    checklist.logs.push({
      message: "Checklist submitted to RM for review",
      userId: req.user.id,
      timestamp: new Date(),
    });

    // Save final changes
    await checklist.save();

    res.json({
      message: "Checklist submitted to RM successfully",
      checklist,
    });
  } catch (err) {
    console.error("SUBMIT TO RM ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};


/* ---------------------------
   SUBMIT TO CO-CHECKER
--------------------------- */
export const submitToCoChecker = async (req, res) => {
  try {
    const { documents, assignedToCoChecker } = req.body;
    const updated = await Checklist.findByIdAndUpdate(
      req.params.id,
      {
        documents,
        status: "co_checker_review",
        submittedToCoChecker: true,
        assignedToCoChecker,
      },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   CO-CREATOR REVIEW
--------------------------- */
export const coCreatorReview = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { reviewedBy } = req.body;

    const updatedChecklist = await Checklist.findByIdAndUpdate(
      checklistId,
      {
        status: "co_creator_review",
        coCreatorReviewedBy: reviewedBy || null,
        reviewedOn: new Date(),
      },
      { new: true }
    );

    if (!updatedChecklist)
      return res.status(404).json({ error: "Checklist not found" });

    res.json({
      message: "Checklist sent for Co-Creator review",
      checklist: updatedChecklist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   CO-CHECKER APPROVAL
--------------------------- */
export const coCheckerApproval = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { approvedBy } = req.body;

    const updatedChecklist = await Checklist.findByIdAndUpdate(
      checklistId,
      {
        status: "completed",
        coCheckerApprovedBy: approvedBy || null,
        completedOn: new Date(),
      },
      { new: true }
    );

    if (!updatedChecklist)
      return res.status(404).json({ error: "Checklist not found" });

    res.json({
      message: "Checklist approved by Co-Checker",
      checklist: updatedChecklist,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   DOCUMENT HANDLING
--------------------------- */
export const coCreatorAddDocument = async (req, res) => {
  try {
    const { category, doc } = req.body;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    let categoryObj = checklist.documents.find((c) => c.category === category);
    if (!categoryObj) {
      categoryObj = { category, docList: [] };
      checklist.documents.push(categoryObj);
    }
    categoryObj.docList.push(doc);

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const coCreatorUpdateDocument = async (req, res) => {
  try {
    const { docId, fileUrl, status, deferralReason, comment } = req.body;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    checklist.documents.forEach((category) => {
      category.docList.forEach((doc) => {
        if (doc._id.toString() === docId) {
          if (fileUrl) doc.fileUrl = fileUrl;
          if (status) doc.status = status;
          if (deferralReason) doc.deferralReason = deferralReason;
          if (comment) doc.comment = comment;
        }
      });
    });

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { docId } = req.params;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    checklist.documents.forEach((category) => {
      category.docList = category.docList.filter(
        (doc) => doc._id.toString() !== docId
      );
    });

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadDocumentFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File missing" });

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;
    const { docId } = req.params;

    const checklist = await Checklist.findById(req.params.id);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    checklist.documents.forEach((category) => {
      category.docList.forEach((doc) => {
        if (doc._id.toString() === docId) doc.fileUrl = fileUrl;
      });
    });

    await checklist.save();
    res.json({ message: "Uploaded", fileUrl, checklist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateDocumentAdmin = async (req, res) => {
  try {
    // Placeholder admin update function
    res.json({ message: "Admin document update not implemented yet" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
