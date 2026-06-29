import express from "express";
import path from "path";
import cors from "cors";
import { serve } from "inngest/express";
import { clerkMiddleware } from "@clerk/express";
import { fileURLToPath } from "url";
import fs from "fs";

import ENV from "./lib/env.js";
import connectDB from "./lib/db.js";
import { inngest, functions } from "./lib/inngest.js";
import chatRoutes from "./routes/chatRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();
const PORT = Number(ENV.PORT ?? 3000);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, "../../frontend/dist");

// middlewares
app.use(express.json());
app.use(
  cors({
    origin: ENV.CLIENT_URL,
    // allow cookies to be sent/received in cross-origin requests
    credentials: true,
  }),
);
app.use(clerkMiddleware()); // adds auth field to req object: req.auth()

// routes
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    message: "api is up and running",
  });
});

app.use("/api/chats", chatRoutes);
app.use("/api/sessions", sessionRoutes);

// make app ready for deployment
if (ENV.NODE_ENV === "production") {
  if (!fs.existsSync(frontendDist))
    throw new Error(`Frontend build not found: ${frontendDist}`);

  app.use(express.static(frontendDist));

  app.get("/{*splat}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
  } catch (e) {
    console.error(
      `❌ Failed to start server: ${e instanceof Error ? e.message : e}`,
    );
  }
};

startServer();
