const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    campaignTitle: { type: String, required: true },
    reporterId: { type: String, required: true },
    reporterName: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["pending", "suspended", "dismissed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);