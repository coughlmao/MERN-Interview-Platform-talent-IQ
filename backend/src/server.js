import express from "express";
import path from "path";

import ENV from "./lib/env.js";

const app = express();
const PORT = ENV.PORT || 3000;
const __dirname = path.resolve();

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "api is up and running",
  });
});

// make app ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
