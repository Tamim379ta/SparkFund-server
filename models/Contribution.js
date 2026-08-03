const mongoose = require("mongoose");

const contributionSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaignTitle: {
      type: String,
      required: true,
    },
    supporterId: {
      type: String,
      required: true,
    },
    supporterName: {
      type: String,
      required: true,
    },
    creatorId: {
      type: String,
      required: true,
    },
    credits: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Contribution", contributionSchema);