require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");
const { initBrowser, closeBrowser } = require("./src/services/playwrightService");
const { errorHandler, notFoundHandler } = require("./src/middleware/errorHandler");

const listsRoutes = require("./src/routes/lists");
const shopsRoutes = require("./src/routes/shops");
const monitoringRoutes = require("./src/routes/monitoring");

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/lists", listsRoutes);
app.use("/api/shops", shopsRoutes);
app.use("/api/monitoring", monitoringRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

let server;

async function start() {
  try {
    await connectDB();
    await initBrowser();

    server = app.listen(PORT, () => {
      console.log(`[server] RedStore Monitoring backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }
}

async function shutdown(signal) {
  console.log(`[server] Received ${signal}, shutting down gracefully...`);
  try {
    if (server) await new Promise((resolve) => server.close(resolve));
    await closeBrowser();
  } finally {
    process.exit(0);
  }
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

start();
