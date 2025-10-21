import { Author } from "./Author";
import { BookItem } from "./BookItem";
import { DeweyCategory } from "./DeweyCategory";
import { Genre } from "./Genre";
import { Language } from "./Language";
import { Publisher } from "./Publisher";

class Book {
  public ISBN: string;
  public workID: string | null;
  public category: DeweyCategory | null;
  public genres: Genre[];
  public title: string;
  public subtitle: string;
  public description: string;
  public cover: string | null;
  public authors: Author[];
  public publisher: Publisher | null;
  public edition: string | null;
  public language: Language | null;
  public numberOfPages: number;
  public numberOfVisits: number;
  public publishedAt: number | null;
  public createdAt: number;
  public items: BookItem[];

  constructor() {
    this.createdAt = Date.now();
    this.numberOfVisits = 0;
  }
}

export { Book };
