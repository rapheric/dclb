import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: String,
  category: String,
  status: {
    type: String,
    enum: ["pending", "submitted", "sighted", "waived", "deferred", "tbo"],
    default: "pending",
  },
  comment: { type: String, default: "" },
  action: { type: String, default: "" },

  fileUrl: { type: String, default: "" },

  deferralReason: { type: String, default: "" },
  deferralRequested: { type: Boolean, default: false },
});

// Define a common enum for all possible checklist workflow stages
const CHECKLIST_STATUS_ENUM = [
  "co_creator_review",
  "rm_review",
  "co_checker_review",
  "approved", // Final status
  "rejected", // Final status
];

const ChecklistSchema = new mongoose.Schema(
  {
    dclNo: { type: String, required: true },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    customerNumber: { type: String, default: "" },
    customerName: { type: String, default: "" },
    loanType: { type: String, required: true },

    assignedToRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // assign the final checker (co-checker)
    assignedToCoChecker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // Central status reflecting the current stage of the workflow
    status: {
      type: String,
      enum: CHECKLIST_STATUS_ENUM,
      default: "co_creator_review",
    },

    // Flag to control edits from the RM side after Co-Creator submission
    submittedToCoChecker: {
      type: Boolean,
      default: false,
    },

    // CATEGORY → DOCUMENT ARRAY
    documents: [
      {
        category: String,
        docList: [DocumentSchema],
      },
    ],

    logs: [
      {
        message: String,
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Checklist", ChecklistSchema);
