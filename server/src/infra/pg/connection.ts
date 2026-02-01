import "dotenv/config";

import z from "zod";
import { Client } from "pg";
import { createClient } from "@supabase/supabase-js";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  DATABASE_KEY: z.string(),
});

try {
  if (process.env.NODE_ENV == "production") {
    const env = envSchema.parse(process.env);
    createClient(env.DATABASE_URL, env.DATABASE_KEY);
  }
} catch (error) {
  console.error('Database authentication failed.\n', error);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

client.connect()
  .then(() => console.log('Connected to database.\n'))
  .catch(error => console.error('Connection failed.\n', error));

export { client };
