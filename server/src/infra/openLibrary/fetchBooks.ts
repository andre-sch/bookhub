import { BookDTO } from "../../domain/BookDTO";
import { Publisher } from "../../domain/Publisher";
import { Genre } from "../../domain/Genre";
import { fetchDump } from "./fetchDump";
import { MARC21ToISO6393 } from "./languageMapping";
import { paramsTemplate, recordsTemplate } from "../pg/templates";
import { client } from "../pg/connection";
import { isValid } from "date-fns";
import striptags from "striptags";

interface BookOpenLibraryImpl {
  id: string;
  isbn_10?: string[];
  isbn_13?: string[];

  works?: [{  key: string; }];

  genres?: string[];
  dewey_decimal_class?: string[];

  title?: string;
  subtitle?: string;
  description?: { value: string; };

  covers?: number[];

  publishers?: string[];
  authors?: {
    author: {
      key: string;
    }
  }[];

  edition_name?: string;
  languages?: { key: string; }[];

  number_of_pages?: number;
  publish_date?: string;
}

export async function fetchBooksBy(refs: Set<string>): Promise<{
  bookAuthors: Map<string, string[]>
}> {
  const bookAuthors = new Map<string, string[]>();

  await fetchDump<BookOpenLibraryImpl, BookDTO & { ref: string }>({
    name: "books",
    url: "https://openlibrary.org/data/ol_dump_editions_latest.txt.gz",
    before: async () => {
      await client.query(`
        CREATE TEMP TABLE book_mapping (
          open_library_id VARCHAR(255) PRIMARY KEY,
          app_isbn VARCHAR(13) NOT NULL
        );
      `);
    },
    parse: (line: string): BookOpenLibraryImpl => {
      const columns = line.split("\t");
      const book_id = columns[1];
      const raw_json = columns[4];
      const {
        isbn_10,
        isbn_13,
        works,
        genres,
        dewey_decimal_class,
        title,
        subtitle,
        description,
        covers,
        authors,
        publishers,
        languages,
        edition_name,
        number_of_pages,
        publish_date
      } = JSON.parse(raw_json);

      return {
        id: book_id,
        isbn_10,
        isbn_13,
        works,
        genres,
        dewey_decimal_class,
        title,
        subtitle,
        description,
        covers,
        authors,
        publishers,
        languages,
        edition_name,
        number_of_pages,
        publish_date
      };
    },
    adapt: (obj: BookOpenLibraryImpl): BookDTO & { ref: string } => {
      const decimal = obj.dewey_decimal_class?.[0]?.match(/^\d{3}/)?.[0];
      const language = obj.languages?.[0]?.key?.match(/[^/]+$/)?.[0];
      const publishDate = new Date(obj.publish_date || "");

      const haveItems = Math.random() < 0.2;
      const numberOfItems = haveItems ? Math.floor(Math.random() * 5) + 1 : 0;
      const book: BookDTO = {
        ISBN: (obj.isbn_13?.[0] || obj.isbn_10?.[0] || "").replace(/\D/g, "").slice(0, 13),
        workID: obj.works?.[0].key || null,
        category: decimal || null,
        genres: obj.genres || [],
        title: obj.title ? obj.title.slice(0, 255) : "",
        subtitle: obj.subtitle ? obj.subtitle.slice(0, 255) : "",
        description: obj.description ? striptags(obj.description.value) : "",
        cover: obj.covers && obj.covers.length > 0 ? "/" + obj.covers?.[0] : null,
        authors: obj.authors
          ? obj.authors.map(a => a.author?.key).filter(a => a != undefined)
          : [],
        publisher: (obj.publishers?.[0] || "").slice(0, 255),
        edition: (obj.edition_name || "").slice(0, 255),
        language: language ? MARC21ToISO6393(language) : null,
        numberOfPages: obj.number_of_pages || 0,
        numberOfVisits: 0,
        createdAt: Date.now(),
        publishedAt: isValid(publishDate) ? publishDate.getTime() : null,
        items: Array.from({ length: numberOfItems }, () => crypto.randomUUID())
      };

      return { ...book, ref: obj.id };
    },
    store: async (books: (BookDTO & { ref: string })[]) => {
      const isValid = (book: BookDTO & { ref: string }) =>
        book.ISBN && book.title && refs.has(book.ref);

      const genreRelationships = new Map<string, string>();
      const setOfGenres = new Set<string>();
      let params = [];
      for (const book of books) {
        if (!isValid(book)) continue;

        for (const displayName of book.genres) {
          const genre = new Genre();
          genre.displayName = displayName.slice(0, 255);

          if (setOfGenres.has(genre.name)) continue;

          setOfGenres.add(genre.name);
          params.push(genre.name, genre.displayName);
          if (book.ISBN) genreRelationships.set(book.ISBN, genre.name);
        }
      }

      let template = recordsTemplate({
        numberOfRecords: setOfGenres.size,
        sizeOfRecord: 2,
        casting: ["varchar", "varchar"]
      })

      if (template) {
        client.query(
          `INSERT INTO genre (name, display_name) VALUES ${template} ON CONFLICT DO NOTHING;`,
          params
        );
      }

      const decimals = Array.from(new Set(books.map(b => b.category).filter(Boolean)).values());
      const wordRefs = Array.from(new Set(books.map(b => b.workID).filter(Boolean)).values());

      const [workResponse, categoryResponse] = await Promise.all([
        client.query(
          `SELECT open_library_id, app_id FROM work_mapping WHERE open_library_id IN ${paramsTemplate({ n: wordRefs.length })};`,
          wordRefs
        ),

        client.query(
          `SELECT id, decimal FROM dewey_category WHERE decimal IN ${paramsTemplate({ n: decimals.length })} AND level = 2;`,
          decimals
        )
      ]);

      const workMapping = new Map<string, string>(workResponse.rows.map(row => [row.open_library_id, row.app_id]));
      const categoryMapping = new Map<string, string>(categoryResponse.rows.map(row => [row.decimal, row.id]));

      const publishers: Publisher[] = [];
      params = [];
      for (const book of books) {
        if (!isValid(book) || !book.publisher) continue;

        const publisher = new Publisher();
        publisher.displayName = book.publisher;

        publishers.push(publisher);
        params.push(publisher.name, publisher.displayName, publisher.createdAt);
      }

      template = recordsTemplate({
        numberOfRecords: publishers.length,
        sizeOfRecord: 3,
        casting: ["varchar", "varchar", "bigint"]
      });

      if (template) {
        client.query(
          `INSERT INTO publisher (name, display_name, created_at) VALUES ${template} ON CONFLICT DO NOTHING;`,
          params
        )
      }

      const bookProps = [];
      const bookItems = [];
      const bookMapping = [];
      for (const book of books) {
        if (isValid(book)) {
          bookAuthors.set(book.ISBN, book.authors);
          bookMapping.push(book.ref, book.ISBN);
          bookProps.push(
            book.ISBN,
            book.workID ? workMapping.get(book.workID) : null,
            book.title,
            book.subtitle,
            book.description,
            book.cover,
            book.publisher ? book.publisher.toLowerCase().trim() : null,
            book.category ? categoryMapping.get(book.category) : null,
            book.language,
            book.edition,
            book.numberOfPages,
            book.numberOfVisits,
            book.publishedAt,
            book.createdAt
          );

          for (const itemID of book.items) {
            bookItems.push(itemID, book.ISBN, Date.now());
          }
        }
      }

      template = recordsTemplate({
        numberOfRecords: bookProps.length / 14,
        sizeOfRecord: 14,
        casting: [
          "varchar",
          "uuid",
          "varchar",
          "varchar",
          "text",
          "varchar",
          "varchar",
          "uuid",
          "varchar",
          "varchar",
          "int",
          "int",
          "bigint",
          "bigint"
        ]
      });

      if (template) {
        client.query(`
          INSERT INTO book (
            isbn,
            work_id,
            title,
            subtitle,
            description,
            cover,
            publisher_name,
            category_id,
            language_code,
            edition,
            number_of_pages,
            number_of_visits,
            published_at,
            created_at
          ) VALUES ${template} ON CONFLICT DO NOTHING;`,
          bookProps
        );
      }

      template = recordsTemplate({
        numberOfRecords: bookMapping.length / 2,
        sizeOfRecord: 2,
        casting: ["varchar", "varchar"]
      });

      if (template) {
        client.query(
          `INSERT INTO book_mapping (open_library_id, app_isbn) VALUES ${template};`,
          bookMapping
        );
      }

      template = recordsTemplate({
        numberOfRecords: genreRelationships.size,
        sizeOfRecord: 2,
        casting: ["varchar", "varchar"]
      });

      if (template) {
        client.query(
          `INSERT INTO book_genre (book_isbn, genre) VALUES ${template} ON CONFLICT DO NOTHING;`,
          Array.from(genreRelationships.entries()).flat()
        )
      }

      template = recordsTemplate({
        numberOfRecords: bookItems.length / 3,
        sizeOfRecord: 3,
        casting: ["uuid", "varchar", "bigint"]
      });

      if (template) {
        client.query(
          `INSERT INTO book_item (id, isbn, created_at) VALUES ${template};`,
          bookItems
        );
      }
    }
  });

  return { bookAuthors };
}
