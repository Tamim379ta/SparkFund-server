const { MongoClient, ObjectId } = require("mongodb");

const getClient = () => new MongoClient(process.env.MONGO_URI);

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const client = getClient();
    await client.connect();
    const db = client.db("sparkfund");
    const users = await db.collection("user").find({}).sort({ createdAt: -1 }).toArray();
    await client.close();
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const client = getClient();
    await client.connect();
    const db = client.db("sparkfund");
    await db.collection("user").deleteOne({ _id: new ObjectId(req.params.id) });
    await db.collection("session").deleteMany({ userId: req.params.id });
    await client.close();
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const client = getClient();
    await client.connect();
    const db = client.db("sparkfund");
    await db.collection("user").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role } }
    );
    await client.close();
    res.json({ success: true, message: "Role updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllUsers, deleteUser, updateUserRole };