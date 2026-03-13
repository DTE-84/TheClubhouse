import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSearch, handleGetCourse } from "./routes/courses";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ 
      status: "available",
      message: ping,
      timestamp: new Date().toISOString()
    });
  });

  // Golf Course API Routes
  app.get("/api/courses/search", handleSearch);
  app.get("/api/courses/:id", handleGetCourse);

  // Demo route
  app.get("/api/demo", handleDemo);

  return app;
}
