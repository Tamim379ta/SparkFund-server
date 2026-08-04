const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/userController");

router.get("/", protect, restrictTo("admin"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);
router.patch("/:id/role", protect, restrictTo("admin"), updateUserRole);

module.exports = router;


const Campaign = require("../models/Campaign");
const Contribution = require("../models/Contribution");

// Admin stats
router.get("/admin/stats", protect, restrictTo("admin"), async (req, res) => {
  try {
    const { MongoClient } = require("mongodb");
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");

    const totalUsers = await db.collection("user").countDocuments();
    const totalSupporters = await db.collection("user").countDocuments({ role: "supporter" });
    const totalCreators = await db.collection("user").countDocuments({ role: "creator" });
    const creditsResult = await db.collection("user").aggregate([
      { $group: { _id: null, total: { $sum: "$credits" } } }
    ]).toArray();
    const totalCredits = creditsResult[0]?.total || 0;
    await client.close();

    const totalCampaigns = await Campaign.countDocuments();
    const pendingCampaigns = await Campaign.countDocuments({ status: "pending" });

    const { MongoClient: MC2 } = require("mongodb");
    const client2 = new MC2(process.env.MONGO_URI);
    await client2.connect();
    const db2 = client2.db("sparkfund");
    const totalPayments = await db2.collection("payments").countDocuments();
    await client2.close();

    res.json({
      success: true,
      stats: { totalUsers, totalSupporters, totalCreators, totalCredits, totalCampaigns, pendingCampaigns, totalPayments }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Supporter stats
router.get("/supporter/stats", protect, restrictTo("supporter"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const totalContributions = await Contribution.countDocuments({ supporterId: userId });
    const pendingContributions = await Contribution.countDocuments({ supporterId: userId, status: "pending" });
    const approvedResult = await Contribution.aggregate([
      { $match: { supporterId: userId, status: "approved" } },
      { $group: { _id: null, total: { $sum: "$credits" } } }
    ]);
    const totalApproved = approvedResult[0]?.total || 0;
    const campaignsBacked = await Contribution.distinct("campaignId", { supporterId: userId });

    res.json({
      success: true,
      stats: { totalContributions, pendingContributions, totalApproved, campaignsBacked: campaignsBacked.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Creator stats
router.get("/creator/stats", protect, restrictTo("creator"), async (req, res) => {
  try {
    const userId = req.user.userId;
    const totalCampaigns = await Campaign.countDocuments({ creatorId: userId });
    const activeCampaigns = await Campaign.find({ creatorId: userId, status: "active" });
    const totalRaised = activeCampaigns.reduce((sum, c) => sum + c.raisedCredits, 0);
    const totalSupporters = await Contribution.distinct("supporterId", { creatorId: userId, status: "approved" });

    res.json({
      success: true,
      stats: { totalCampaigns, activeCampaigns: activeCampaigns.length, totalRaised, totalSupporters: totalSupporters.length }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});