const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const Report = require("../models/Report");
const Campaign = require("../models/Campaign");

// Supporter - report a campaign
router.post("/", protect, restrictTo("supporter"), async (req, res) => {
  try {
    const { campaignId, reason } = req.body;
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });

    const existing = await Report.findOne({ campaignId, reporterId: req.user.userId });
    if (existing) return res.status(400).json({ success: false, message: "You already reported this campaign" });

    const report = await Report.create({
      campaignId,
      campaignTitle: campaign.title,
      reporterId: req.user.userId,
      reporterName: req.user.userName,
      reason,
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin - get all reports
router.get("/", protect, restrictTo("admin"), async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin - suspend campaign
router.patch("/:id/suspend", protect, restrictTo("admin"), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    await Campaign.findByIdAndUpdate(report.campaignId, { status: "rejected" });
    report.status = "suspended";
    await report.save();

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin - dismiss report
router.patch("/:id/dismiss", protect, restrictTo("admin"), async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "dismissed" },
      { new: true }
    );
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;