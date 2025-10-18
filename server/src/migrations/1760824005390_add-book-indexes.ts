import { Client } from "pg";

export async function up({ context: client }: { context: Client }) {
  await client.query("CREATE INDEX idx_book_publisher_id ON book(publisher_id);");
  await client.query("CREATE INDEX idx_book_category_id ON book(category_id);");
  await client.query("CREATE INDEX idx_book_language_code ON book(language_code);");
  await client.query("CREATE INDEX idx_book_published_at ON book(published_at);");
}

export async function down({ context: client }: { context: Client }) {
  await client.query("DROP INDEX idx_book_publisher_id;");
  await client.query("DROP INDEX idx_book_category_id;");
  await client.query("DROP INDEX idx_book_language_code;");
  await client.query("DROP INDEX idx_book_published_at;");
}
