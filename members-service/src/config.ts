import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

export type AppConfig = {
  port: number;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: SignOptions["expiresIn"];
};

export const getConfig = (): AppConfig => {
  const port = Number(process.env.PORT ?? "3001");
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const jwtSecret = process.env.JWT_SECRET ?? "";
  const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as SignOptions["expiresIn"];

  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set. DB checks will fail until configured.");
  }

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set.");
  }

  return {
    port,
    databaseUrl,
    jwtSecret,
    jwtExpiresIn
  };
};
