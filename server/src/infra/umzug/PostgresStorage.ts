import type { UmzugStorage } from "umzug";
import type { Client } from 'pg';

export class PostgresStorage implements UmzugStorage {
  constructor(private client: Client) {}

  async executed(): Promise<string[]> {
    await this.client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        name VARCHAR(255) PRIMARY KEY,
        executed_at BIGINT DEFAULT (EXTRACT (EPOCH FROM NOW()))
      );
    `);

    const { rows } = await this.client.query(`SELECT name FROM migrations;`);
    return rows.map(r => r.name);
  }

  async logMigration({ name }: { name: string }) {
    await this.client.query(
      `INSERT INTO migrations (name) VALUES ($1);`,
      [name]
    );
  }

  async unlogMigration({ name }: { name: string }) {
    await this.client.query(
      `DELETE FROM migrations WHERE name=$1;`,
      [name]
    );
  }
}
