const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { createCheckoutSession, verifyPayment, getPaymentHistory } = require("../controllers/paymentController");

router.post("/webhook", express.raw({ type: "application/json" }));
router.post("/create-checkout-session", express.json(), protect, restrictTo("supporter"), createCheckoutSession);
router.post("/verify", express.json(), protect, verifyPayment);
router.get("/history", protect, getPaymentHistory);

module.exports = router;