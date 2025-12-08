// services/dcl.service.js
import Checklist from "../models/checklist.model.js";

export const getRMQueueDCLs = (rmId) => {
  return Checklist.find({
    assignedToRM: rmId,
    status: { $ne: "rejected" },   // all in-progress
  })
    .populate("assignedToRM", "name")
    .populate("assignedToCoChecker", "name")
    .lean();
};

// getRMCompletedDCLs

export const getRMCompletedDCLs = (rmId) => {
  return Checklist.find({
    assignedToRM: rmId,
    status: "approved",
  })
    .populate("assignedToRM", "name")
    .populate("assignedToCoChecker", "name")
    .lean();
};

// delete dcl

export const deleteDCL = async (dclId) => {
  return await Checklist.findByIdAndDelete(dclId);
};