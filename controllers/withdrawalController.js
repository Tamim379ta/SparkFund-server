const Withdrawal = require("../models/Withdrawal");
const Campaign = require("../models/Campaign");
const Notification = require("../models/Notification");
const { MongoClient, ObjectId } = require("mongodb");

const getAdminEmail = async () => {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db("sparkfund");
  const admin = await db.collection("user").findOne({ role: "admin" });
  await client.close();
  return admin?.email || "";
};

// Creator - request withdrawal
const createWithdrawal = async (req, res) => {
  try {
    const { creditsToWithdraw, paymentSystem, accountNumber } = req.body;
    const { userId, userName } = req.user;

    if (creditsToWithdraw < 200) {
      return res.status(400).json({ success: false, message: "Minimum withdrawal is 200 credits" });
    }

    const campaigns = await Campaign.find({ creatorId: userId, status: "active" });
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedCredits, 0);

    if (creditsToWithdraw > totalRaised) {
      return res.status(400).json({ success: false, message: "Insufficient raised credits" });
    }

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");
    const creator = await db.collection("user").findOne({ _id: new ObjectId(userId) });
    await client.close();

    const withdrawalAmount = creditsToWithdraw / 20;

    const withdrawal = await Withdrawal.create({
      creatorId: userId,
      creatorName: userName,
      creatorEmail: creator.email,
      creditsToWithdraw,
      withdrawalAmount,
      paymentSystem,
      accountNumber,
    });

    // Notify admin
    try {
      const adminEmail = await getAdminEmail();
      if (adminEmail) {
        await Notification.create({
          message: `${userName} requested a withdrawal of ${creditsToWithdraw} credits ($${withdrawalAmount.toFixed(2)})`,
          toEmail: adminEmail,
          actionRoute: "/dashboard/admin/withdrawals",
        });
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.status(201).json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Creator - get my withdrawals
const getMyWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ creatorId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Creator - get total raised credits
const getTotalRaised = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ creatorId: req.user.userId, status: "active" });
    const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedCredits, 0);
    res.json({ success: true, totalRaised });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin - get all withdrawals
const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find().sort({ createdAt: -1 });
    res.json({ success: true, withdrawals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin - approve withdrawal
const approveWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found" });
    if (withdrawal.status === "approved") return res.status(400).json({ success: false, message: "Already approved" });

    const campaigns = await Campaign.find({ creatorId: withdrawal.creatorId, status: "active" }).sort({ raisedCredits: -1 });
    let remaining = withdrawal.creditsToWithdraw;

    for (const campaign of campaigns) {
      if (remaining <= 0) break;
      const deduct = Math.min(campaign.raisedCredits, remaining);
      await Campaign.findByIdAndUpdate(campaign._id, { $inc: { raisedCredits: -deduct } });
      remaining -= deduct;
    }

    withdrawal.status = "approved";
    await withdrawal.save();

    // Notify creator
    try {
      if (withdrawal.creatorEmail) {
        await Notification.create({
          message: `Your withdrawal request of ${withdrawal.creditsToWithdraw} credits ($${withdrawal.withdrawalAmount.toFixed(2)}) was approved`,
          toEmail: withdrawal.creatorEmail,
          actionRoute: "/dashboard/creator/withdrawals",
        });
      }
    } catch (notifErr) {
      console.error("Notification error:", notifErr);
    }

    res.json({ success: true, withdrawal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createWithdrawal,
  getMyWithdrawals,
  getTotalRaised,
  getAllWithdrawals,
  approveWithdrawal,
};