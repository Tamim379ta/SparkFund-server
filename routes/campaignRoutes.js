const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  getMyCampaigns,
  getAllCampaigns,
  updateCampaignStatus,
} = require("../controllers/campaignController");

// Public
router.get("/", getCampaigns);
router.get("/:id", getCampaign);

// Creator
router.post("/", protect, restrictTo("creator"), createCampaign);
router.get("/creator/my-campaigns", protect, restrictTo("creator"), getMyCampaigns);

// Admin
router.get("/admin/all", protect, restrictTo("admin"), getAllCampaigns);
router.patch("/:id/status", protect, restrictTo("admin"), updateCampaignStatus);

module.exports = router;