import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getConfig } from "../config.js";

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
};

const config = getConfig();

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const header = req.header("authorization");

  if (!header) {
    return res.status(401).json({ message: "missing authorization header" });
  }

  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "invalid authorization header" });
  }

  try {
    const payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;

    if (!payload || typeof payload.sub !== "string" && typeof payload.sub !== "number") {
      return res.status(401).json({ message: "invalid token" });
    }

    req.user = {
      id: Number(payload.sub),
      username: String(payload.username ?? ""),
      email: String(payload.email ?? ""),
      isAdmin: Boolean(payload.isAdmin)
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "invalid token" });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "admin access required" });
  }

  return next();
};
