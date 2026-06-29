import { Request, Response } from "express";

import { chatClient, streamClient } from "../lib/stream.js";
import SessionModel from "../models/Session.js";

export async function createSession(req: Request, res: Response) {
  try {
    const { problemTitle, difficulty } = req.body;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const userId = user._id;
    const clerkId = user.clerkId;

    if (!problemTitle || !difficulty)
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });

    // generate a unique callId for Stream video call
    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    // create session in DB
    const session = await SessionModel.create({
      problemTitle,
      difficulty,
      host: userId,
      callId,
    });
    // create Stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: {
          problemTitle,
          difficulty,
          sessionId: session._id.toString(),
        },
      },
    });
    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      created_by_id: clerkId,
    });
    await channel.watch();  // ensures existence
    await channel.addMembers([clerkId]);

    return res.status(201).json({ session });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error creating session: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_: Request, res: Response) {
  try {
    const sessions = await SessionModel.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .sort({ created_at: -1 })
      .limit(20);

    return res.status(200).json({ sessions });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error fetching active sessions: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req: Request, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const userId = user._id;
    // get sessions where the user is either host or participant
    const sessions = await SessionModel.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ created_at: -1 })
      .limit(20);
    return res.status(200).json({ sessions });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error fetching recent sessions: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const session = await SessionModel.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId");
    if (!session) return res.status(404).json({ message: "Session not found" });
    return res.status(200).json({ session });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error fetching session by id: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const userId = user._id;
    const clerkId = user.clerkId;
    const session = await SessionModel.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status !== "active")
      return res
        .status(400)
        .json({ message: "Cannot join a completed session" });
    if (session.host.toString() === userId.toString())
      return res
        .status(400)
        .json({ message: "Host cannot join their own session as participant" });
    // check if session is already full -> 2 max
    if (session.participant)
      return res.status(409).json({ message: "Session is full" });
    session.participant = userId;
    await session.save();
    const channel = chatClient.channel("messaging", session.callId);
    await channel.addMembers([clerkId]);
    return res.status(200).json({ session });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error in joining session: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    const userId = user._id;
    const session = await SessionModel.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString())
      return res.status(403).json({ message: "Only host can end session" });

    // check if session is already completed
    if (session.status === "completed")
      return res.status(400).json({ message: "Session is already completed" });

    // delete Stream video-call
    const call = streamClient.video.call("default", session.callId);
    await call.delete({ hard: true });

    // delete Stream chat-channel
    const channel = chatClient.channel("messaging", session.callId);
    session.status = "completed";
    await session.save();
    await channel.delete();
    return res
      .status(200)
      .json({ session, message: "Session ended successfully" });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error(`Error in ending session: ${errorMessage}`);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
