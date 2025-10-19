import { Client } from "pg";

export function transaction(fn: (client: Client) => Promise<void>) {
  return async function ({ context: client }: { context: Client }) {
    try {
      await client.query("BEGIN;");
      await fn(client);

      await client.query("COMMIT;");
    } catch(error) {
      await client.query("ROLLBACK;");
      throw error;
    }
  }
}