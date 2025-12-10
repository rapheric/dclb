import mongoose from "mongoose";

const DeferralSchema = new mongoose.Schema(
  {
    checklistId: { type: String, required: true },
    loanNumber: { type: String, required: true },
    customerName: { type: String, required: true },

    requestedBy: { type: String, required: true }, // CO
    assignedToRM: { type: String, required: true }, // RM

    reason: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    rmComment: { type: String, default: "" },
    approver: { type: String, default: null }, // RM who approved/rejected
  },
  { timestamps: true }
);

export default mongoose.model("Deferral", DeferralSchema);
