


import mongoose from "mongoose";

/* ======================================================
   DOCUMENT SUB-SCHEMA
   (Merged from both versions)
====================================================== */

const checklistItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"], // statuses for individual items
      default: "Pending",
    },
  },
  { _id: false }
);


const DocumentSchema = new mongoose.Schema(
  {
    // ✔ Base details
    name: { type: String },
    category: { type: String },

    // ✔ Status (combined from both lists)
    status: {
      type: String,
      enum: [
        // From model #1
        "Pending RM",
        "Pending Checker",
        "Approved",
        "Incomplete",
        "Returned by Checker",

        // From model #2
        "pending",
        "pendingrm",
        "submitted",
        "pendingco",
        "sighted",
        "waived",
        "deferred",
        "submitted_for_review",
        "tbo",
      ],
      default: "pending",
    },

    // ✔ RM Actions
    rmAction: String,
    rmStatus: String,
    rmComment: String,
    rmFile: String,

    // ✔ Co-creator uploads (multiple)
    coCreatorFiles: [{ name: String, url: String }],

    // ✔ Document main upload
    fileUrl: { type: String, default: "" },

    // ✔ Additional workflow fields
    action: { type: String, default: "" },
    comment: { type: String, default: "" },

    // ✔ Deferral handling
    deferralReason: { type: String, default: "" },
    deferralRequested: { type: Boolean, default: false },
  },
  { timestamps: true }
);

    /* ======================================================
   CHECKLIST STATUS ENUM 
   (Combined + cleaned)
====================================================== */
const CHECKLIST_STATUS_ENUM = [
  // From model #1
  "Pending RM",
  "Pending Checker",
  "Incomplete",
  "Returned by Checker",
  "Approved",

  // From model #2
  "co_creator_review",
  "rm_review",
  "co_checker_review",
  "rejected",
  "active",
  "completed",
  "submitted"
];

/* ======================================================
   MAIN CHECKLIST MODEL
   (Merged fields from both)
====================================================== */
const ChecklistSchema = new mongoose.Schema(
  {
    /* ---------------------------------------------
       Primary Customer + Loan Details
    --------------------------------------------- */
    dclNo: { type: String, required: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    customerNumber: {
  type: String,
  required: true,
  unique: true
},
    customerNo: { type: String }, // From model #1
    customerName: { type: String, required: false },
    product: { type: String }, // From model #1
    loanType: { type: String }, // From model #2

    /* ---------------------------------------------
       Assigned Users
    --------------------------------------------- */
    rm: { type: String }, // model #1 simple RM string
    assignedToRM: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedToCoChecker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

     checklist: [checklistItemSchema],

    /* ---------------------------------------------
       Status + Workflow
    --------------------------------------------- */
    status: {
      type: String,
      enum: CHECKLIST_STATUS_ENUM,
      default: "co_creator_review",
    },
    progress: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    submittedToCoChecker: { type: Boolean, default: false },

    /* ---------------------------------------------
       Comments
    --------------------------------------------- */
    rmComment: String,
    coComment: String,

    /* ---------------------------------------------
       Documents (category → documents[])
    --------------------------------------------- */
    documents: [
      {
        category: String,
        docList: [DocumentSchema],
      },
    ],

    /* ---------------------------------------------
       Logs / Activity Timeline
    --------------------------------------------- */
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

/* ======================================================
   EXPORT FINAL MODEL
====================================================== */
export default mongoose.model("Checklist", ChecklistSchema);
