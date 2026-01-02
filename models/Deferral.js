// models/Deferral.js
import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    name: String,
    url: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: true }
);

const facilitySchema = new mongoose.Schema(
  {
    type: String,
    sanctioned: Number,
    balance: Number,
    headroom: Number,
  },
  { _id: false }
);

const approverSchema = new mongoose.Schema(
  {
    name: String,
    approved: { type: Boolean, default: false },
    approvedAt: Date,
  },
  { _id: false }
);

const deferralSchema = new mongoose.Schema(
  {
    deferralNumber: { type: String, unique: true },

    customerNumber: String,
    customerName: String,
    businessName: String,

    loanType: String,

    facilities: [facilitySchema],
    documents: [documentSchema],

    approvers: [approverSchema],
    currentApproverIndex: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    rejectionReason: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Deferral", deferralSchema);
