import { Publisher } from "@/domain/Publisher";
import { PublisherRepository } from "@/repositories/PublisherRepository";
import { Client } from "pg";

export interface PublisherRecord {
  id: string;
  name: string;
  created_at: string;
}

export class PublisherRepositoryPostgresImpl implements PublisherRepository {
  constructor(private client: Client) {}

  public async find(id: string): Promise<Publisher | null> {
    const result = await this.client.query("SELECT * FROM publisher WHERE id = $1;", [id]);

    if (result.rows.length == 0) return null;
    else return this.deserialize(result.rows[0]);
  }

  public async save(publisher: Publisher): Promise<void> {
    const result = await this.client.query("SELECT * FROM publisher WHERE id = $1;", [publisher.ID]);
    const recordExists = result.rows.length > 0;

    if (recordExists) {
      await this.client.query(
        "UPDATE publisher SET name = $2, WHERE id = $1;",
        [publisher.ID, publisher.name]
      );
    } else {
      await this.client.query(
        "INSERT INTO publisher (id, name, created_at) VALUES ($1, $2, $3, $4);",
        [publisher.ID, publisher.name, publisher.createdAt]
      );
    }
  }

  private deserialize(record: PublisherRecord): Publisher {
    const publisher = new Publisher(record.id, Number(record.created_at));
    publisher.name = record.name;
    return publisher;
  }
}
