import { transaction } from "../infra/umzug/transaction";
import { Client } from "pg";

export const up = transaction(async (client: Client) => {
  await client.query("ALTER TABLE book ALTER COLUMN description DROP NOT NULL;");
  await client.query("ALTER TABLE book ALTER COLUMN edition DROP NOT NULL;");
  await client.query("ALTER TABLE book ALTER COLUMN published_at DROP NOT NULL;");
});

export const down = transaction(async (client: Client) => {
  await client.query("ALTER TABLE book ALTER COLUMN description SET NOT NULL;");
  await client.query("ALTER TABLE book ALTER COLUMN edition SET NOT NULL;");
  await client.query("ALTER TABLE book ALTER COLUMN published_at SET NOT NULL;");
});
