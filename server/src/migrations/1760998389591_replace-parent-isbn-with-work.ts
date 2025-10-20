import { transaction } from "../infra/umzug/transaction";
import { Client } from "pg";

export const up = transaction(async (client: Client) => {
  await client.query(`
    CREATE TABLE work (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255),
      subtitle VARCHAR(255),
      description TEXT,
      created_at BIGINT DEFAULT (EXTRACT (EPOCH FROM NOW()))
    );
  `);

  await client.query(`
    CREATE TABLE work_author (
      work_id UUID,
      author_id UUID,
      PRIMARY KEY (work_id, author_id),
      FOREIGN KEY (work_id) REFERENCES work(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES author(id) ON DELETE CASCADE
    );
  `);

  await client.query("ALTER TABLE book DROP CONSTRAINT book_parent_isbn_fkey;");
  await client.query("ALTER TABLE book RENAME COLUMN parent_isbn TO work_id;");
  await client.query("ALTER TABLE book ALTER COLUMN work_id TYPE UUID USING work_id::uuid;");
});

export const down = transaction(async (client: Client) => {
  await client.query("ALTER TABLE book RENAME COLUMN work_id TO parent_isbn;");
  await client.query("ALTER TABLE book ALTER COLUMN parent_isbn TYPE VARCHAR(13) USING work_id::varchar(13);");
  await client.query("ALTER TABLE book ADD CONSTRAINT book_parent_isbn_fkey FOREIGN KEY (parent_isbn) REFERENCES book(isbn) ON DELETE SET NULL;");

  await client.query("DROP TABLE work_author;");
  await client.query("DROP TABLE work;");
});
