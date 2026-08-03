const Campaign = require("../models/Campaign");

// Create campaign
const createCampaign = async (req, res) => {
  try {
    const { title, description, category, image, goalCredits, deadline } = req.body;
    const { userId, userName } = req.user;

    const campaign = await Campaign.create({
      title,
      description,
      category,
      image,
      goalCredits,
      deadline,
      creatorId: userId,
      creatorName: userName,
    });

    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all active campaigns (public)
const getCampaigns = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9 } = req.query;
    const query = { status: "active" };

    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    const total = await Campaign.countDocuments(query);
    const campaigns = await Campaign.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, campaigns, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single campaign
const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get creator's campaigns
const getMyCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin - get all campaigns
const getAllCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json({ success: true, campaigns });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin - update campaign status
const updateCampaignStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { title, description, rewardInfo } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.creatorId !== req.user.userId) return res.status(403).json({ success: false, message: "Forbidden" });

    campaign.title = title || campaign.title;
    campaign.description = description || campaign.description;
    campaign.rewardInfo = rewardInfo || campaign.rewardInfo;
    await campaign.save();

    res.json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ success: false, message: "Campaign not found" });
    if (campaign.creatorId !== req.user.userId) return res.status(403).json({ success: false, message: "Forbidden" });

    // Refund all approved supporters
    const Contribution = require("../models/Contribution");
    const { MongoClient, ObjectId } = require("mongodb");

    const approvedContributions = await Contribution.find({
      campaignId: req.params.id,
      status: "approved",
    });

    if (approvedContributions.length > 0) {
      const client = new MongoClient(process.env.MONGO_URI);
      await client.connect();
      const db = client.db("sparkfund");

      for (const contribution of approvedContributions) {
        await db.collection("user").updateOne(
          { _id: new ObjectId(contribution.supporterId) },
          { $inc: { credits: contribution.credits } }
        );
      }
      await client.close();
    }

    await Contribution.deleteMany({ campaignId: req.params.id });
    await Campaign.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Campaign deleted and supporters refunded" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCampaign,
  getCampaigns,
  getCampaign,
  getMyCampaigns,
  getAllCampaigns,
  updateCampaignStatus,
  updateCampaign,
  deleteCampaign,
};

