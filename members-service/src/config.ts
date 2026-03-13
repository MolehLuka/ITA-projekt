import dotenv from "dotenv";

dotenv.config();

export type AppConfig = {
  port: number;
  databaseUrl: string;
};

export const getConfig = (): AppConfig => {
  const port = Number(process.env.PORT ?? "3001");
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) {
    console.warn("DATABASE_URL is not set. DB checks will fail until configured.");
  }

  return {
    port,
    databaseUrl
  };
};
