import { transaction } from "../infra/umzug/transaction";
import { Client } from "pg";

export const up = transaction(async (client: Client) => {
  await client.query("ALTER TABLE book ADD COLUMN cover VARCHAR(255);");
});

export const down = transaction(async (client: Client) => {
  await client.query("ALTER TABLE book DROP COLUMN cover;");
});
