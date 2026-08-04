const Stripe = require("stripe");
const { MongoClient, ObjectId } = require("mongodb");

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const creditPackages = [
  { credits: 100, price: 10, label: "Starter" },
  { credits: 300, price: 25, label: "Basic" },
  { credits: 800, price: 60, label: "Pro" },
  { credits: 1500, price: 110, label: "Elite" },
];

const createCheckoutSession = async (req, res) => {
  try {
    const { packageIndex } = req.body;
    const pkg = creditPackages[packageIndex];
    if (!pkg) return res.status(400).json({ success: false, message: "Invalid package" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${pkg.credits} SparkFund Credits`,
              description: `${pkg.label} package — ${pkg.credits} credits for $${pkg.price}`,
            },
            unit_amount: pkg.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: req.user.userId,
        credits: pkg.credits,
        packageIndex,
      },
     success_url: `${process.env.CLIENT_URL}/dashboard/supporter/buy-credits?success=true&session_id={CHECKOUT_SESSION_ID}&credits=${pkg.credits}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/supporter/buy-credits?canceled=true`,
    });

    res.json({ success: true, url: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed" });
    }

    const { userId, credits } = session.metadata;

    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");

    const existing = await db.collection("payments").findOne({ stripeSessionId: sessionId });
    if (existing) {
      await client.close();
      return res.json({ success: true, alreadyProcessed: true });
    }

    await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { credits: Number(credits) } }
    );

    await db.collection("payments").insertOne({
      userId,
      credits: Number(credits),
      amount: session.amount_total / 100,
      stripeSessionId: sessionId,
      status: "success",
      createdAt: new Date(),
    });

    await client.close();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("sparkfund");
    const payments = await db.collection("payments")
      .find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .toArray();
    await client.close();
    res.json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createCheckoutSession, verifyPayment, getPaymentHistory };