// controllers/cocreatorController.js
import Checklist from "../models/Checklist.js";
import { addLog, generateDclNumber } from "../helpers/checklistHelpers.js";

/* ---------------------------
   CREATE CHECKLIST
--------------------------- */
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
   GET CHECKLISTS
--------------------------- */
export const getChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "name email")
      .populate("assignedToRM", "name email");

    res.json(checklists);
  } catch (err) {
    console.error("❌ GET CHECKLISTS ERROR:", err);
    res.status(500).json({ message: "Error fetching checklists", error: err.message });
  }
};

/* ---------------------------
   GET CHECKLIST BY ID
--------------------------- */
export const getChecklistById = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   GET CHECKLIST BY DCL NO
--------------------------- */
export const getChecklistByDclNo = async (req, res) => {
  try {
    const { dclNo } = req.params;
    const checklist = await Checklist.findOne({ dclNo });
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });
    res.json({ checklist });
  } catch (error) {
    console.error("Error fetching checklist:", error);
    res.status(500).json({ error: error.message });
  }
};

/* ---------------------------
   GET ACTIVE & COMPLETED DCLs
--------------------------- */
export const getDCLs = async (req, res) => {
  try {
    const dcls = await Checklist.find().select("dclNo status customerName");
    res.json(dcls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   UPDATE CHECKLIST
--------------------------- */
export const updateChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    const { documents, status } = req.body;
    if (documents) checklist.documents = documents;
    if (status) checklist.status = status;

    addLog(checklist, "Checklist updated", req.user?.id);
    await checklist.save();

    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   SUBMIT TO RM
--------------------------- */
export const submitToRM = async (req, res) => {
  try {
    const { documents } = req.body;
    const updated = await Checklist.findByIdAndUpdate(
      req.params.id,
      { documents, status: "rm_review" },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
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

    if (!updatedChecklist) return res.status(404).json({ error: "Checklist not found" });

    res.json({ message: "Checklist sent for Co-Creator review", checklist: updatedChecklist });
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

    if (!updatedChecklist) return res.status(404).json({ error: "Checklist not found" });

    res.json({ message: "Checklist approved by Co-Checker", checklist: updatedChecklist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ---------------------------
   DOCUMENT HANDLING
--------------------------- */
export const addDocument = async (req, res) => {
  try {
    const { category, doc } = req.body;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

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

export const updateDocument = async (req, res) => {
  try {
    const { docId, fileUrl, status, deferralReason, comment } = req.body;
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

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
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    checklist.documents.forEach((category) => {
      category.docList = category.docList.filter((doc) => doc._id.toString() !== docId);
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

    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const { docId } = req.params;

    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

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
