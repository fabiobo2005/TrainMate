import express from "express";
import cors from "cors";
import { studentsRouter } from "./routes/students";
import { plansRouter } from "./routes/plans";
import { sessionsRouter } from "./routes/sessions";
import { cardioRouter } from "./routes/cardio";
import { progressRouter } from "./routes/progress";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/students", studentsRouter);
  app.use("/api/plans", plansRouter);
  app.use("/api/sessions", sessionsRouter);
  app.use("/api/cardio", cardioRouter);
  app.use("/api/progress", progressRouter);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    if (err?.name === "ZodError") {
      return res.status(400).json({ error: "ValidationError", details: err.errors });
    }
    res.status(err?.status || 500).json({ error: err?.message || "Internal error" });
  });

  return app;
}
