import mongoose from "mongoose"

const reportSchema = new mongoose.Schema({
  reportedFile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
    required: true,
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    enum: [
      "Inappropriate content",
      "Copyright violation",
      "Wrong category",
      "Spam",
      "Other"
    ],
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "reviewed", "dismissed"],
    default: "pending",
  },
}, { timestamps: true })

reportSchema.index({ reportedFile: 1, reportedBy: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema)
export default Report
