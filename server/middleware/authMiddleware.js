import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // ✅ FIX: req.auth can throw if no token is present
    const { userId } = req.auth;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    // ✅ FIX: Return 401 instead of 500 so frontend knows it's an auth issue
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};