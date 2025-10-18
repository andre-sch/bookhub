import { GenreRepository } from "@/repositories/GenreRepository";
import { Genre } from "@/domain/Genre";
import { Client } from "pg";

export interface GenreRecord {
  id: string;
  name: string;
}

export class GenreRepositoryPostgresImpl implements GenreRepository {
  constructor(private client: Client) {}

  public async find(id: string): Promise<Genre | null> {
    const result = await this.client.query("SELECT * FROM genre WHERE id = $1;", [id]);

    if (result.rows.length == 0) return null;
    else return this.deserialize(result.rows[0]);
  }

  public async save(genre: Genre): Promise<void> {
    const result = await this.client.query("SELECT * FROM genre WHERE id = $1;", [genre.ID]);
    const recordExists = result.rows.length > 0;

    if (recordExists) {
      await this.client.query(
        "UPDATE genre SET name = $2 WHERE id = $1;",
        [genre.ID, genre.name]
      );
    } else {
      await this.client.query(
        "INSERT INTO genre (id, name) VALUES ($1, $2);",
        [genre.ID, genre.name]
      );
    }
  }

  private deserialize(record: GenreRecord): Genre {
    const genre = new Genre();
    genre.ID = record.id;
    genre.name = record.name;
    return genre;
  }
}
