// src/db/index.ts
import { drizzle } from 'drizzle-orm/node-postgres'; // or from '@vercel/postgres'
import { Pool } from 'pg'; // or Client for @vercel/postgres
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);