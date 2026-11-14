import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import auth_routes from "./routes/auth_routes.js";
import meeting_routes from "./routes/meeting_routes.js";
import task_routes from "./routes/task_routes.js";

const app = express();
const here = path.dirname(fileURLToPath(import.meta.url));

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(here, "uploads")));

app.get("/api/health", (_req, res) => res.json({ success: true, message: "MeetMind API is running" }));
app.use("/api/auth", auth_routes);
app.use("/api/meetings", meeting_routes);
app.use("/api/tasks", task_routes);

// ---- serve React app (used after deployment) ----
const dist = path.join(here, "../client/dist");
app.use(express.static(dist));
app.use((req, res, next) => {
  if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
  res.sendFile(path.join(dist, "index.html"));
});
// -------------------------------------------------

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

export default app;