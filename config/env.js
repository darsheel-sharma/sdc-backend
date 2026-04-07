import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const envFile = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.env",
);

// Load the backend .env explicitly so this still works from other cwd values.
dotenv.config({ path: envFile, quiet: true });

const requiredVars = [
  "PORT",
  "DATABASE_URL",
  "JWT_SECRET",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
];

const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(", ")}. Checked ${envFile}. If the file exists, save it as UTF-8.`,
  );
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`PORT must be a valid positive integer. Received "${process.env.PORT}".`);
}

export const env = {
  PORT: port,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};
