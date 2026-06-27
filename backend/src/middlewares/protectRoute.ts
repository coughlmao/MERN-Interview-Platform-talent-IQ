import { requireAuth, getAuth } from "@clerk/express";
import { Request, Response, NextFunction } from "express";

import UserModel from "../models/User.js";

export const protectRoute = [
  requireAuth({ signInUrl: "/sign-in" }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId: clerkId } = getAuth(req);
      if (!clerkId)
        return res
          .status(401)
          .json({ message: "Unauthorized - invalid token" });
      
      const user = await UserModel.findOne({ clerkId }); // find user in db
      if (!user) return res.status(404).json({ message: "User not found" });

      req.user = user; // attach user to req object
      next();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      console.error("Error in protectRoute middleware:", errorMessage);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },
];
