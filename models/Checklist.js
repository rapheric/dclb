import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    status: {
      type: String,
      enum: [
        "pending",
        "submitted",
        "pendingrm",
        "pendingco",
        "submitted_for_review",
        "sighted",
        "waived",
        "deferred",
        "tbo",
        "Approved",
        "Incomplete",
        "Returned by Checker",
      ],
      default: "pending",
    },
    checkerComment: String,
    creatorComment:String,
    rmComment: String,
    coCreatorFiles: [{ name: String, url: String }],
    fileUrl: { type: String, default: "" },
    comment: { type: String, default: "" },
    rmStatus: {type:String , deafult:""},
    deferralReason: String,
  },
  { timestamps: true }
);

const CHECKLIST_STATUS_ENUM = [
  "co_creator_review",
  "rm_review",
  "co_checker_review",
  "Approved",
  "Rejected",
  "Active",
  "Completed",
];

const ChecklistSchema = new mongoose.Schema(
  {
    dclNo: { type: String, required: true },

    // Customer details
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    customerNumber: { type: String, required: true }, // removed unique 👍
    customerName: { type: String },

    // Loan info
    loanType: { type: String },

    // Assignments
    assignedToRM: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Main Status
    status: {
      type: String,
      enum: CHECKLIST_STATUS_ENUM,
      default: "co_creator_review",
    },

    // Documents grouped by category
    documents: [
      {
        category: String,
        docList: [DocumentSchema],
      },
    ],

    // Activity logs
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
