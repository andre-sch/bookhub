import { Genre } from "@/domain/Genre";

export interface GenreRepository {
  save(genre: Genre): Promise<void>;
  find(id: string): Promise<Genre | null>;
}
