import { Router } from "express";
import { pool } from "../db.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await pool.query("select 1");
    res.json({ status: "ok", database: "up" });
  } catch (error) {
    res.status(503).json({ status: "degraded", database: "down" });
  }
});
