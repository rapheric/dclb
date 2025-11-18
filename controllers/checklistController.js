import Checklist from "../models/Checklist.js";
// import User from "../models/User.js"; // REQUIRED for RM lookup

/**
 * CREATE CHECKLIST
 * POST /api/checklists
 */
export const createChecklist = async (req, res) => {
  try {
    const { loanType, applicantName, categories, rmId } = req.body;

    if (!rmId) {
      return res.status(400).json({ message: "rmId is required" });
    }

    // Optional: Validate RM exists
    const rm = await User.findById(rmId);
    if (!rm) {
      return res.status(404).json({ message: "Relationship Manager not found" });
    }

    const checklist = await Checklist.create({
      loanType,
      applicantName,
      categories,
      rmId,
    });

    res.status(201).json(checklist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET PAGINATED CHECKLISTS
 * GET /api/checklists?page=1&limit=10
 */
export const getChecklists = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const checklists = await Checklist.find()
      .populate("rmId", "name email")  // properly show RM data
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Checklist.countDocuments();

    res.status(200).json({
      success: true,
      total,
      page,
      limit,
      data: checklists,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * COUNT CHECKLISTS
 */
export const countChecklists = async (req, res) => {
  try {
    const total = await Checklist.countDocuments();
    res.status(200).json({ total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET CHECKLISTS FOR RM
 * GET /api/checklists/rm/:rmId
 */
export const getChecklistsForRm = async (req, res) => {
  try {
    const { rmId } = req.params;
    const checklists = await Checklist.find({ rmId });
    res.json(checklists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * PATCH A DOCUMENT INSIDE A CHECKLIST
 * PATCH /api/checklists/:checklistId/documents
 */
export const updateChecklistDocument = async (req, res) => {
  try {
    const { checklistId } = req.params;
    const { categoryTitle, documentName, status, comment, fileUrl } = req.body;

    const checklist = await Checklist.findById(checklistId);
    if (!checklist)
      return res.status(404).json({ error: "Checklist not found" });

    const category = checklist.categories.find(
      (c) => c.title === categoryTitle
    );
    if (!category)
      return res.status(404).json({ error: "Category not found" });

    const document = category.documents.find((d) => d.name === documentName);
    if (!document)
      return res.status(404).json({ error: "Document not found" });

    if (status !== undefined) document.status = status;
    if (comment !== undefined) document.comment = comment;
    if (fileUrl !== undefined) document.fileUrl = fileUrl;

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET CHECKLISTS BY RM
 */
export const getChecklistsByRM = async (req, res) => {
  try {
    const checklists = await Checklist.find({ rmId: req.params.rmId });
    res.json(checklists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * GET CHECKLIST BY ID
 */
export const getChecklistById = async (req, res) => {
  try {
    const checklist = await Checklist.findById(req.params.id);
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE A SPECIFIC DOCUMENT INSIDE CHECKLIST
 * PATCH /api/checklists/:id/documents/:docId
 */
export const updateDocumentInChecklist = async (req, res) => {
  try {
    const { status, comment, fileUrl } = req.body;
    const checklist = await Checklist.findById(req.params.id);

    if (!checklist) {
      return res.status(404).json({ error: "Checklist not found" });
    }

    checklist.categories.forEach((cat) => {
      cat.documents.forEach((doc) => {
        if (doc._id.toString() === req.params.docId) {
          if (status) doc.status = status;
          if (comment) doc.comment = comment;
          if (fileUrl) doc.fileUrl = fileUrl;
        }
      });
    });

    await checklist.save();
    res.json(checklist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * DOCUMENT SUMMARY BY LOAN TYPE
 */
export const getDocumentSummaryByLoan = async (req, res) => {
  try {
    const checklists = await Checklist.find();
    const summaryByLoan = {};

    checklists.forEach((checklist) => {
      const loanType = checklist.loanType || "Unknown";

      if (!summaryByLoan[loanType]) {
        summaryByLoan[loanType] = {
          totalDocuments: 0,
          submitted: 0,
          pending: 0,
          notActioned: 0,
        };
      }

      checklist.categories?.forEach((category) => {
        category.documents?.forEach((doc) => {
          summaryByLoan[loanType].totalDocuments++;

          if (doc.status === "Submitted") summaryByLoan[loanType].submitted++;
          else if (doc.status === "Pending") summaryByLoan[loanType].pending++;
          else summaryByLoan[loanType].notActioned++;
        });
      });
    });

    res.status(200).json(summaryByLoan);
  } catch (err) {
    console.error("Error in getDocumentSummaryByLoan:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * SUMMARY COUNTS (completed / pending / notcounted)
 */
export const getDocSamSummary = async (req, res) => {
  try {
    const completed = await Checklist.countDocuments({ status: "completed" });
    const pending = await Checklist.countDocuments({ status: "pending" });
    const notCounted = await Checklist.countDocuments({ status: "notcounted" });

    const total = completed + pending + notCounted;

    res.json({
      total,
      completed,
      pending,
      notCounted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * BASIC SUMMARY
 */
export const getDocumentSummary = async (req, res) => {
  try {
    const totalChecklists = await Checklist.countDocuments();
    const completedChecklists = await Checklist.countDocuments({ status: "completed" });
    const pendingChecklists = await Checklist.countDocuments({ status: "pending" });

    res.json({
      totalChecklists,
      completedChecklists,
      pendingChecklists,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching summary" });
  }
};
