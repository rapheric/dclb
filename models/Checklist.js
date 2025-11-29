
import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: String,
  category: String,
  status: {
    type: String,
    enum: ["pending", "submitted", "approved", "rejected", "deferred", "uploaded"],
    default: "pending",
  },
  comment: { type: String, default: "" },
  action: { type: String, default: "" },

  fileUrl: { type: String, default: "" },

  deferralReason: { type: String, default: "" },
  deferralRequested: { type: Boolean, default: false },
});

const ChecklistSchema = new mongoose.Schema(
  {
    dclNo: { type: String, required: true },

    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    customerNumber: { type: String, default: "" },
    customerName: { type: String, default: "" },

    title: { type: String, required: true },
    loanType: { type: String, required: true },

    assignedToRM: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    status: { type: String, default: "co_creator_review" },

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
