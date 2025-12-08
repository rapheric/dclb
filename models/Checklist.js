// import mongoose from "mongoose";

// const DocumentSchema = new mongoose.Schema({
//   name: String,
//   category: String,

//   status: {
//     type: String,
//     enum: ["pending", "submitted", "sighted", "waived", "deferred", "tbo"],
//     default: "pending",
//   },

//   comment: { type: String, default: "" },
//   action: { type: String, default: "" },

//   fileUrl: { type: String, default: "" },
//   deferralReason: { type: String, default: "" },
//   deferralRequested: { type: Boolean, default: false },

//   // ⭐ REQUIRED FOR YOUR CONTROLLER
//   rmStatus: {
//     type: String,
//     enum: ["pending", "approved", "rejected", "needs_review"],
//     default: "pending",
//   },

//   updatedAt: { type: Date, default: Date.now },
// });

// // Add RM submission stage
// const CHECKLIST_STATUS_ENUM = [
//   "co_creator_review",
//   "rm_review",
//   "sent_to_co",          // ⭐ REQUIRED FOR YOUR CONTROLLER
//   "co_checker_review",
//   "approved",
//   "rejected",
// ];

// const ChecklistSchema = new mongoose.Schema(
//   {
//     dclNo: { type: String, required: true },

//     customerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     customerNumber: { type: String, default: "" },
//     customerName: { type: String, default: "" },

//     loanType: { type: String, required: true },

//     assignedToRM: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     assignedToCoChecker: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },

//     status: {
//       type: String,
//       enum: CHECKLIST_STATUS_ENUM,
//       default: "co_creator_review",
//     },

//     submittedToCoChecker: {
//       type: Boolean,
//       default: false,
//     },

//     // ⭐ REQUIRED FOR YOUR CONTROLLER
//     rmGeneralComment: { type: String, default: "" },

//     // ⭐ Optional but useful
//     rmReviewedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },

//     documents: [
//       {
//         category: String,
//         docList: [DocumentSchema],
//       },
//     ],

//     logs: [
//       {
//         message: String,
//         userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//         timestamp: { type: Date, default: Date.now },
//       },
//     ],  
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Checklist", ChecklistSchema);
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
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

  rmStatus: {
    type: String,
    enum: ["pending", "approved", "rejected", "needs_review"],
    default: "pending",
  },

  updatedAt: { type: Date, default: Date.now },
});

const CHECKLIST_STATUS_ENUM = [
  "co_creator_review",
  "rm_review",
  "sent_to_co",
  "co_checker_review",
  "approved",
  "rejected",
];

const ChecklistSchema = new mongoose.Schema({
  dclNo: { type: String, required: true },

  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerNumber: String,
  customerName: String,

  loanType: { type: String, required: true },

  assignedToRM: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  assignedToCoChecker: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  status: {
    type: String,
    enum: CHECKLIST_STATUS_ENUM,
    default: "co_creator_review",
  },

  submittedToCoChecker: { type: Boolean, default: false },

  rmGeneralComment: { type: String, default: "" },
  rmReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  documents: [
    {
      category: String,
      docList: [DocumentSchema],
    },
  ],
});

export default mongoose.model("Checklist", ChecklistSchema);
