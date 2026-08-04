const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const Notification = require("../models/Notification");
const { MongoClient, ObjectId } = require("mongodb");

// Get notifications for logged in user
router.get("/", protect, async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");
    const user = await db.collection("user").findOne({ _id: new ObjectId(req.user.userId) });
    await client.close();

    const notifications = await Notification.find({ toEmail: user?.email })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all as read
router.patch("/read-all", protect, async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");
    const user = await db.collection("user").findOne({ _id: new ObjectId(req.user.userId) });
    await client.close();

    await Notification.updateMany({ toEmail: user?.email }, { $set: { read: true } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;