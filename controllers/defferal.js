import Deferral from "../models/Deferral.model.js";

/**
 * Request a new deferral
 */
export const requestDeferral = async (req, res) => {
  try {
    const deferral = await Deferral.create(req.body);
    res.status(201).json(deferral);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/**
 * Get all PENDING deferrals
 */
export const getPendingDeferrals = async (req, res) => {
  try {
    const data = await Deferral.find({ status: "pending" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Approve deferral
 */
export const approveDeferral = async (req, res) => {
  try {
    const id = req.params.id;

    const updated = await Deferral.findByIdAndUpdate(
      id,
      {
        status: "approved",
        approver: req.body.approver,
        rmComment: req.body.rmComment || "",
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Reject deferral
 */
export const rejectDeferral = async (req, res) => {
  try {
    const id = req.params.id;

    const updated = await Deferral.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        approver: req.body.approver,
        rmComment: req.body.rmComment || "",
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get completed (APPROVED) deferrals
 */
export const getApprovedDeferrals = async (req, res) => {
  try {
    const data = await Deferral.find({ status: "approved" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * OPTIONAL: Get rejected deferrals
 */
export const getRejectedDeferrals = async (req, res) => {
  try {
    const data = await Deferral.find({ status: "rejected" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

