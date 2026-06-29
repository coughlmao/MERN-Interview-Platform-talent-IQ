import { Request, Response } from "express";

import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = chatClient.createToken(user.clerkId); //uses clerkId for Stream

    return res.status(200).json({
      token,
      userId: user.clerkId,
      userName: user.name,
      image: user.profileImage,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Error generating Stream token:", errorMessage);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
