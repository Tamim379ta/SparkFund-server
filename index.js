const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const auth = require("./config/auth");
const { toNodeHandler } = require("better-auth/node");

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

app.all("/api/auth/{*splat}", toNodeHandler(auth));

app.use(express.json());

const campaignRoutes = require("./routes/campaignRoutes");
app.use("/api/campaigns", campaignRoutes);

app.get("/", (req, res) => res.send("SparkFund Server is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));