import mongoose from "mongoose";

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, default: "" },
  comment: { type: String, default: "" },
  fileUrl: { type: String, default: null },
});

const CategorySchema = new mongoose.Schema({
  title: { type: String, required: true },
  documents: [DocumentSchema],
});

const ChecklistSchema = new mongoose.Schema(
  {
    loanType: {
      type: String,
      enum: ["mortgage", "Sme loan"],
      required: true,
    },
    applicantName: { type: String, required: true },
    applicantId: { type: String },
    categories: [CategorySchema],
    // rmId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rmId: { type: mongoose.Schema.Types.ObjectId, ref: "RM", required: true },

    // createdBy: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    //   required: true,
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Checklist", ChecklistSchema);
