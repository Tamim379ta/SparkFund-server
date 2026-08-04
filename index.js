const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/db");
const auth = require("./config/auth");
const { toNodeHandler } = require("better-auth/node");

connectDB();

const app = express();

// Manual CORS - must be first
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  next();
});

// Auth - before express.json()
app.all("/api/auth/{*splat}", toNodeHandler(auth));

// Payments - before express.json() (webhook needs raw body)
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);

// JSON middleware
app.use(express.json());

// Other routes
const campaignRoutes = require("./routes/campaignRoutes");
const contributionRoutes = require("./routes/contributionRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/campaigns", campaignRoutes);
app.use("/api/contributions", contributionRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => res.send("SparkFund Server is running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));