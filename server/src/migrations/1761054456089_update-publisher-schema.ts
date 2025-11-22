import { transaction } from "../infra/umzug/transaction";
import { Client } from "pg";

export const up = transaction(async (client: Client) => {
  await client.query("DROP INDEX idx_book_publisher_id;");
  await client.query("ALTER TABLE book DROP CONSTRAINT book_publisher_id_fkey;");
  await client.query("DROP TABLE publisher;");
  await client.query(`
    CREATE TABLE publisher (
      name VARCHAR(255) PRIMARY KEY,
      display_name VARCHAR(255) NOT NULL,
      created_at BIGINT DEFAULT (EXTRACT (EPOCH FROM NOW()))
    );
  `);

  await client.query("ALTER TABLE book RENAME publisher_id TO publisher_name;");
  await client.query("ALTER TABLE book ALTER COLUMN publisher_name TYPE VARCHAR(255) USING publisher_name::varchar(255);");
  await client.query("ALTER TABLE book ADD CONSTRAINT book_publisher_name_fkey FOREIGN KEY (publisher_name) REFERENCES publisher(name) ON DELETE SET NULL;");
  await client.query("CREATE INDEX idx_book_publisher_name ON book(publisher_name);");
});

export const down = transaction(async (client: Client) => {
  await client.query("DROP INDEX idx_book_publisher_name;");
  await client.query("ALTER TABLE book DROP CONSTRAINT book_publisher_name_fkey;");
  await client.query("DROP TABLE publisher;");
  await client.query(`
    CREATE TABLE publisher (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      created_at BIGINT DEFAULT (EXTRACT (EPOCH FROM NOW()))
    );
  `);

  await client.query("ALTER TABLE book RENAME publisher_name TO publisher_id;");
  await client.query("ALTER TABLE book ALTER COLUMN publisher_id TYPE UUID USING publisher_id::uuid;");
  await client.query("ALTER TABLE book ADD CONSTRAINT book_publisher_id_fkey FOREIGN KEY (publisher_id) REFERENCES publisher(id) ON DELETE SET NULL;");
  await client.query("CREATE INDEX idx_book_publisher_id ON book(publisher_id);");
});
