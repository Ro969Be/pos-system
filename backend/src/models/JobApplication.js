import mongoose from "mongoose";

const JobApplicationSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    applicantName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    resumeUrl: String,
    status: {
      type: String,
      enum: ["new", "review", "interview", "hired", "rejected"],
      default: "new",
    },
    source: String,
    notes: String,
  },
  { timestamps: true }
);

JobApplicationSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  next();
});

JobApplicationSchema.index({ jobId: 1, status: 1 });

export default mongoose.model("JobApplication", JobApplicationSchema);
