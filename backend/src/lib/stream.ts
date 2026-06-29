import { StreamChat } from "stream-chat";
import { StreamClient } from "@stream-io/node-sdk";

import ENV from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key and secret must be provided");
}


export const chatClient = StreamChat.getInstance(apiKey, apiSecret); // for chat feature
export const streamClient = new StreamClient(apiKey, apiSecret); // for video-call feature

interface StreamUserData {
  id: string;
  name: string;
  image?: string;
}

export const upsertStreamUser = async (userData: StreamUserData): Promise<StreamUserData | undefined> => {
  try {
    await chatClient.upsertUser(userData);
    console.log(`Stream user ${userData.id} upserted successfully`);
    return userData;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    console.error("Error upserting Stream user:", errorMessage);
  }
};

export const deleteStreamUser = async (userId: string): Promise<string | undefined> => {
  try {
    await chatClient.deleteUser(userId);
    console.log(`Stream user ${userId} deleted successfully`);
    return userId;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e)
    console.error("Error deleting Stream user:", errorMessage);
  }
};
