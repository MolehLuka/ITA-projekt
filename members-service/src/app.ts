import express from "express";
import swaggerUi from "swagger-ui-express";
import { healthRouter } from "./routes/health.js";
import { membersRouter } from "./routes/members.js";
import { swaggerSpec } from "./swagger.js";

export const createServer = () => {
  const app = express();

  app.use((req, res, next) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      const durationMs = Date.now() - startedAt;
      console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs}ms`);
    });

    next();
  });

  app.use(express.json());
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/health", healthRouter);
  app.use("/members", membersRouter);

  return app;
};
