import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";

export async function createSession(req, res) {
  try {
    const { problemTitle, difficulty } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problemTitle || !difficulty)
      return res
        .status(400)
        .json({ message: "Problem and difficulty are required" });

    // generate a unique callId for Stream video call
    const callId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substring(7)}`;
    // create session in DB
    const session = await Session.create({
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
      name: `${problemTitle} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });
    await channel.create();
    res.status(201).json({ session });
  } catch (e) {
    console.error(`Error creating session: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(_, res) {
  try {
    const sessions = await Session.find({ status: "active" })
      .populate("host", "name profileImage email clerkId")
      .sort({ created_at: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (e) {
    console.error(`Error fetching active sessions: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;
    // get sessions where the user is either host or participant
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }],
    })
      .sort({ created_at: -1 })
      .limit(20);
    res.status(200).json({ sessions });
  } catch (e) {
    console.error(`Error fetching recent sessions: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;
    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name, email profileImage clerkId");
    if (!session) res.status(400).json({ message: "Session not found" });
    res.status(200).json({ session });
  } catch (e) {
    console.error(`Error fetching session by id: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Sesson not found" });
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
    res.status(200).json({ session });
  } catch (e) {
    console.error(`Error in joining session: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });
    // check if user is the host
    if (session.host.toString() !== userId.toString())
      return res.status(403).json({ message: "Only host can end session" });
    // check if session is already completed
    if (session.status === "completed")
      return res.status(400).json({ message: "Session is already completed" });
    // delete Stream video-call
    const call = streamClient.video.call("default".session.callId);
    await call.delete({ hard: true });
    // delete Stream chat-channel
    const channel = chatClient.channel("messagimg", session.callId);
    session.status = "completed";
    session.save();
    await channel.delete();
    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (e) {
    console.error(`Error in ending sessoin: ${e}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
