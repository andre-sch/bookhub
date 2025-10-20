import { Author } from "./Author";
import { Book } from "./Book";

class Work {
  public id: string;
  public title: string;
  public subtitle: string;
  public description: string;
  public authors: Author[];
  public editions: Book[];
  public createdAt: number;

  constructor() {
    this.id = crypto.randomUUID();
    this.createdAt = Date.now();
  }
}

export { Work };
