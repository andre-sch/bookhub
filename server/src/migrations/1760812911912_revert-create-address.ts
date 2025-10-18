import { Client } from "pg";

export async function up({ context: client }: { context: Client }) {
  await client.query("ALTER TABLE publisher DROP COLUMN address_id;");
  await client.query("DROP TABLE address;");
}

export async function down({ context: client }: { context: Client }) {
  await client.query(`
    CREATE TABLE address (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      postal_code VARCHAR(15) NOT NULL,
      place_name VARCHAR(255) NOT NULL,
      street_name VARCHAR(255) NOT NULL,
      street_number INTEGER NOT NULL,
      complement VARCHAR(255) NOT NULL,
      neighborhood VARCHAR(255) NOT NULL,
      city VARCHAR(255) NOT NULL,
      state VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL
    );
  `)

  await client.query("ALTER TABLE publisher ADD COLUMN address_id UUID REFERENCES address(id) NOT NULL;");
}
