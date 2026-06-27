import dotenv from "dotenv";

dotenv.config({ quiet: true });

interface Env {
  PORT?: string;
  DB_URL?: string;
  NODE_ENV?: "development" | "production" | "test";
  INNGEST_EVENT_KEY?: string;
  INNGEST_SIGNING_KEY?: string;
  STREAM_API_KEY?: string;
  STREAM_API_SECRET?: string;
  CLIENT_URL?: string;
}

const ENV: Env = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
  INNGEST_EVENT_KEY: process.env.INNGEST_EVENT_KEY,
  INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
  STREAM_API_KEY: process.env.STREAM_API_KEY,
  STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
};

export default ENV;
