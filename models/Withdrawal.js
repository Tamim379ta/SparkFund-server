const mongoose = require("mongoose");

const withdrawalSchema = new mongoose.Schema(
  {
    creatorId: { type: String, required: true },
    creatorName: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    creditsToWithdraw: { type: Number, required: true },
    withdrawalAmount: { type: Number, required: true },
    paymentSystem: { type: String, required: true },
    accountNumber: { type: String, required: true },
    status: { type: String, enum: ["pending", "approved"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Withdrawal", withdrawalSchema);