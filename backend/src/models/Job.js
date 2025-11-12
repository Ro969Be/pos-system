import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: "Store" },
    title: { type: String, required: true },
    description: String,
    employmentType: {
      type: String,
      enum: ["fullTime", "partTime", "contract", "intern"],
      default: "fullTime",
    },
    salary: String,
    location: String,
    tags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },
    publishedAt: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

JobSchema.pre("save", function syncStore(next) {
  if (!this.storeId) this.storeId = this.shopId;
  if (this.isModified("status") && this.status === "published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

JobSchema.index({ shopId: 1, status: 1, createdAt: -1 });

export default mongoose.model("Job", JobSchema);
