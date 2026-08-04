const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createWithdrawal,
  getMyWithdrawals,
  getTotalRaised,
  getAllWithdrawals,
  approveWithdrawal,
} = require("../controllers/withdrawalController");

// Creator
router.post("/", protect, restrictTo("creator"), createWithdrawal);
router.get("/my-withdrawals", protect, restrictTo("creator"), getMyWithdrawals);
router.get("/total-raised", protect, restrictTo("creator"), getTotalRaised);

// Admin
router.get("/admin/all", protect, restrictTo("admin"), getAllWithdrawals);
router.patch("/:id/approve", protect, restrictTo("admin"), approveWithdrawal);

module.exports = router;