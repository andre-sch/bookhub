import { Client } from "pg";

export async function up({ context: client }: { context: Client }) {
  await client.query(`
    CREATE TABLE genre (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL
    );
  `);

  await client.query(`
    CREATE TABLE book_genre (
      book_isbn VARCHAR(255) REFERENCES book(isbn) NOT NULL,
      genre_id UUID REFERENCES genre(id) NOT NULL
    )
  `);
}

export async function down({ context: client }: { context: Client }) {
  await client.query("DROP TABLE book_genre;");
  await client.query("DROP TABLE genre;");
}
