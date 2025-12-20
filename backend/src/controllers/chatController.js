import { chatClient } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = chatClient.createToken(req.user.clerkId); //uses clerlkId for Stream

    res.status(200).json({
      token,
      userId: req.user.clerkId,
      userName: req.user.name,
      image: req.user.image,
    });
  } catch (e) {
    console.error("Error generating Stream token:", e);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
