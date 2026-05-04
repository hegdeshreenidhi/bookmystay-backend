import { getAuth } from "@clerk/express";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    // ✅ Clerk v2: use getAuth(req) instead of req.auth
    const { userId } = getAuth(req);
    console.log("userId from getAuth:", userId);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const user = await User.findById(userId);
    console.log("user found:", user ? "YES" : "NO");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};