const { fromNodeHeaders } = require("better-auth/node");
const auth = require("../config/auth");

const protect = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = {
      userId: session.user.id,
      userName: session.user.name,
      role: session.user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
};

module.exports = { protect, restrictTo };