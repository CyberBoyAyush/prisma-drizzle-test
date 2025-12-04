import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import * as schema from "./schema";
import ws from "ws";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Configure WebSocket for Node.js
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString });

export const db = drizzle(pool, { schema });

