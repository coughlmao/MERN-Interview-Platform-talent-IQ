import { requireAuth } from "@clerk/express";

import User from "../models/User.js";

export const protectRoute = [
  requireAuth({ signInUrl: "/sign-in" }),
  async (req, res, next) => {
    try {
      const clerkId = req.auth().userId;
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      const user = await User.findOne({ clerkId }); // find user in db
      if (!user) return res.status(404).json({ message: "User not found" });
      req.user = user; // attach user to req object
      next();
    } catch (e) {
      console.error("Error in protectRoute middleware:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
