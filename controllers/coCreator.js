import Checklist from "../models/Checklist.js";
import { generateDclNumber, addLog } from "../helpers/checklistHelpers.js";

/* ==========================================================================
   1. CREATION & MAINTENANCE
   ========================================================================== */

// Initialize a new Checklist (DCL) and assign to an RM
export const createChecklist = async (req, res) => {
  try {
    
    const dclNo = await generateDclNumber();

    const checklist = await Checklist.create({
      dclNo,
      // Customer Information
      customerId: req.body.customerId || null,
      customerNumber: req.body.customerNumber || "",
      customerName: req.body.customerName || "",

      // General Info
      title: req.body.title,
      loanType: req.body.loanType,
      
      // Assignments
      assignedToRM: req.body.assignedToRM,
      createdBy: req.user?.id || null,

      // Initial Document Setup
      documents: req.body.documents || [],
      status: "creator_submitted",
    });

    console.log(checklist, "checklist");

    addLog(checklist, "Checklist created", req.user?.id);
    await checklist.save();

    res.json(checklist);
    
  } catch (error) {
    console.error("🔥 BACKEND ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// Admin/Creator update of checklist details (e.g., changing required docs)
export const updateChecklist = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    const { documents } = req.body;

    checklist.documents = documents;

    addLog(checklist, "Checklist updated by Co-Creator", req.user.id);
    await checklist.save();

    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Admin override to update specific document status/comments manually
export const updateDocumentAdmin = async (req, res) => {
  try {
    const { checklistId, docIndex, fileUrl, status, deferralReason, comment } = req.body;
    
    const checklist = await Checklist.findById(checklistId);
    if (!checklist) return res.status(404).json({ error: "Checklist not found" });

    if (checklist.documents[docIndex]) {
      if (fileUrl) checklist.documents[docIndex].fileUrl = fileUrl;
      if (status) checklist.documents[docIndex].status = status;
      if (deferralReason) checklist.documents[docIndex].deferralReason = deferralReason;
      if (comment) checklist.documents[docIndex].comment = comment;
    }

    addLog(checklist, `Document ${docIndex} manually updated by Admin`, req.user.id);
    await checklist.save();
    
    res.status(200).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ==========================================================================
   2. WORKFLOW: REVIEW & APPROVAL
   ========================================================================== */

// Triggered when Co-Creator begins reviewing the RM's submission
export const coCreatorReview = async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { status: "co_creator_review" },
      { new: true }
    );
    
    // Optional: addLog(checklist, "Under Co-Creator Review", req.user.id);
    
    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Final Approval: Marks the workflow as finished
export const coCheckerApproval = async (req, res) => {
  try {
    const checklist = await Checklist.findByIdAndUpdate(
      req.params.id,
      { status: "completed" },
      { new: true }
    );

    // Optional: addLog(checklist, "Approved by Co-Checker", req.user.id);

    res.json(checklist);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/* ==========================================================================
   3. DASHBOARD & DATA RETRIEVAL
   ========================================================================== */

// Get Master List (All Checklists)
export const getChecklists = async (req, res) => {
  try {
    const checklists = await Checklist.find()
      .populate("createdBy", "name email")
      .populate("assignedToRM", "name email")
      .sort({ createdAt: -1 });

    res.json(checklists);
  } catch (err) {
    console.error("❌ GET CHECKLISTS ERROR:", err);
    res.status(500).json({
      message: "Error fetching checklists",
      error: err.message,
    });
  }
};

// Get Dashboard Analytics
export const getDashboardStats = async (req, res) => {
  try {
    const stats = {
      total: await Checklist.countDocuments(),
      pending: await Checklist.countDocuments({ status: "pending" }),
      inProgress: await Checklist.countDocuments({ status: "in_progress" }),
      submitted: await Checklist.countDocuments({ status: "submitted" }),
      rmSubmitted: await Checklist.countDocuments({ status: "rm_submitted" }), // Added based on context
      completed: await Checklist.countDocuments({ status: "completed" }),
    };

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single by ID
export const getChecklistById = async (req, res) => {
  try {
    const { id } = req.params;
    const checklist = await Checklist.findById(id)
     .populate("assignedToRM", "name email")
     .populate("createdBy", "name email");
        
    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }
    res.status(200).json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single by DCL Number (Search)
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