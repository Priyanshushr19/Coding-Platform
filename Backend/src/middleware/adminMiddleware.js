import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import User from "../models/user.js";

const adminMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ error: "Token not present" });
    }

    // Verify JWT
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_KEY);
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { _id } = payload;

    if (!_id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // Check if token is blacklisted in Redis
    const isBlocked = await redisClient.exists(`token:${token}`);
    if (isBlocked) {
      return res.status(401).json({ error: "Token has been revoked" });
    }

    // Check user existence
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({ error: "User doesn't exist" });
    }

    // Verify admin role
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    req.user = user;
    next();

  } catch (error) {
    res.status(500).json({ error: "Server error: " + error.message });
  }
};

export default adminMiddleware;
