import { Client } from "pg";

export async function up({ context: client }: { context: Client }) {
  await client.query("ALTER TABLE book ADD COLUMN cover VARCHAR(255);");
}

export async function down({ context: client }: { context: Client }) {
  await client.query("ALTER TABLE book DROP COLUMN cover;");
}
