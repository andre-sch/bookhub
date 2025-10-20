import { Author } from "./Author";
import { BookItem } from "./BookItem";
import { DeweyCategory } from "./DeweyCategory";
import { Genre } from "./Genre";
import { Language } from "./Language";
import { Publisher } from "./Publisher";

class Book {
  public ISBN: string;
  public workID: string | null;
  public category: DeweyCategory;
  public genres: Genre[];
  public title: string;
  public subtitle: string;
  public description: string;
  public cover: string;
  public authors: Author[];
  public publisher: Publisher;
  public edition: string;
  public language: Language;
  public numberOfPages: number;
  public numberOfVisits: number;
  public publishedAt: number;
  public createdAt: number;
  public items: BookItem[];

  constructor() {
    this.createdAt = Date.now();
    this.numberOfVisits = 0;
  }
}

export { Book };
