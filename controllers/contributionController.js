const Contribution = require("../models/Contribution");
const Campaign = require("../models/Campaign");
const Notification = require("../models/Notification");
const { MongoClient, ObjectId } = require("mongodb");

// Supporter - create contribution
const createContribution = async (req, res) => {
  try {
    const { campaignId, credits } = req.body;
    const { userId, userName } = req.user;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.status !== "active") return res.status(400).json({ success: false, message: "Campaign is not active" });

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");
    const usersCollection = db.collection("user");

    const supporter = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!supporter || supporter.credits < credits) {
      await client.close();
      return res.status(400).json({ success: false, message: "Insufficient credits" });
    }

    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $inc: { credits: -credits } });

    // Notify creator
    try {
      const creator = await db.collection("user").findOne({ _id: new ObjectId(campaign.creatorId) });
      if (creator?.email) {
        await Notification.create({
          message: `${userName} contributed ${credits} credits to your campaign "${campaign.title}"`,
          toEmail: creator.email,
          actionRoute: "/dashboard/creator/campaigns",
        });
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    await client.close();

    const contribution = await Contribution.create({
      campaignId,
      campaignTitle: campaign.title,
      supporterId: userId,
      supporterName: userName,
      creatorId: campaign.creatorId,
      credits,
    });

    res.status(201).json({ success: true, contribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supporter - get my contributions
const getMyContributions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const total = await Contribution.countDocuments({ supporterId: req.user.userId });
    const contributions = await Contribution.find({ supporterId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, contributions, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Creator - get contributions for my campaigns
const getCampaignContributions = async (req, res) => {
  try {
    const contributions = await Contribution.find({ creatorId: req.user.userId })
      .sort({ createdAt: -1 });
    res.json({ success: true, contributions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Creator - approve or reject contribution
const updateContributionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) return res.status(404).json({ success: false, message: "Contribution not found" });
    if (contribution.creatorId !== req.user.userId) return res.status(403).json({ success: false, message: "Forbidden" });

    if (status === "approved") {
      await Campaign.findByIdAndUpdate(contribution.campaignId, {
        $inc: { raisedCredits: contribution.credits },
      });
    } else if (status === "rejected") {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db("sparkfund");
      await db.collection("user").updateOne(
        { _id: new ObjectId(contribution.supporterId) },
        { $inc: { credits: contribution.credits } }
      );
      await client.close();
    }

    contribution.status = status;
    await contribution.save();

    // Notify supporter
    try {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db("sparkfund");
      const supporter = await db.collection("user").findOne({ _id: new ObjectId(contribution.supporterId) });
      await client.close();

      if (supporter?.email) {
        await Notification.create({
          message: `Your contribution of ${contribution.credits} credits to "${contribution.campaignTitle}" was ${status} by the creator`,
          toEmail: supporter.email,
          actionRoute: "/dashboard/supporter/contributions",
        });
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.json({ success: true, contribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createContribution,
  getMyContributions,
  getCampaignContributions,
  updateContributionStatus,
};