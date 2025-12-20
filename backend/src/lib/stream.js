import { StreamChat } from "stream-chat";

import ENV from "./env.js";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("Stream API key and secret must be provided");
}

export const chatClient = new StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData);
    console.log(`Stream user ${userData.id} upserted successfully`);
    return userData;
  } catch (e) {
    console.error("Error upserting Stream user:", e);
  }
};

export const deleteStreamUser = async (userId) => {
  try {
    await chatClient.deleteUser(userId);
    console.log(`Stream user ${userId} deleted successfully`);
    return userId;
  } catch (e) {
    console.error("Error deleting Stream user:", e);
  }
};
