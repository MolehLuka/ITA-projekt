import express from "express";
import swaggerUi from "swagger-ui-express";
import { healthRouter } from "./routes/health.js";
import { swaggerSpec } from "./swagger.js";

export const createServer = () => {
  const app = express();

  app.use(express.json());
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/health", healthRouter);

  return app;
};
