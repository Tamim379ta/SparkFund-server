const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createContribution,
  getMyContributions,
  getCampaignContributions,
  updateContributionStatus,
} = require("../controllers/contributionController");

// Supporter
router.post("/", protect, restrictTo("supporter"), createContribution);
router.get("/my-contributions", protect, restrictTo("supporter"), getMyContributions);

// Creator
router.get("/campaign-contributions", protect, restrictTo("creator"), getCampaignContributions);
router.patch("/:id/status", protect, restrictTo("creator"), updateContributionStatus);

module.exports = router;