const express = require("express");
const router = express.Router();
const Campaign = require("../models/Campaign");
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const {
  createCampaign,
  getCampaigns,
  getCampaign,
  getMyCampaigns,
  getAllCampaigns,
  updateCampaignStatus,
  updateCampaign,
  deleteCampaign
} = require("../controllers/campaignController");

// Public - top funded
router.get("/top-funded", async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "active" })
      .sort({ raisedCredits: -1 })
      .limit(6);
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Public
router.get("/", getCampaigns);

router.patch("/:id", protect, restrictTo("creator"), updateCampaign);
router.delete("/:id", protect, restrictTo("creator"), deleteCampaign);

// Creator
router.post("/", protect, restrictTo("creator"), createCampaign);
router.get("/creator/my-campaigns", protect, restrictTo("creator"), getMyCampaigns);

// Admin
router.get("/admin/all", protect, restrictTo("admin"), getAllCampaigns);

// Must be last - dynamic routes
router.get("/:id", getCampaign);
router.patch("/:id/status", protect, restrictTo("admin"), updateCampaignStatus);

module.exports = router;