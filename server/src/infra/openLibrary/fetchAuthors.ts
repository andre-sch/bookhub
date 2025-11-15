import { Author } from "../../domain/Author";
import { fetchDump } from "./fetchDump";
import { recordsTemplate } from "../pg/templates";
import { client } from "../pg/connection";
import { isValid, parse } from "date-fns";

interface AuthorOpenLibraryImpl {
  id: string;
  name?: string;
  bio?: string;
  birth_date?: string;
  death_date?: string;
}

export function fetchAuthorsBy(props: {
  bookAuthors: Map<string, string[]>;
  workAuthors: Map<string, string[]>;
}): Promise<void> {
  const selectedAuthors = new Set(
    ...props.bookAuthors.values(),
    ...props.workAuthors.values()
  );

  return fetchDump<AuthorOpenLibraryImpl, Author & { ref: string }>({
    name: "authors",
    url: "https://openlibrary.org/data/ol_dump_authors_latest.txt.gz",
    before: async () => {
      await client.query(`
        CREATE TEMP TABLE author_mapping (
          open_library_id VARCHAR(255) PRIMARY KEY,
          app_id UUID NOT NULL
        );
      `);
    },
    parse: (line: string): AuthorOpenLibraryImpl => {
      const columns = line.split("\t");
      const author_id = columns[1];
      const raw_json = columns[4];
      const {
        name,
        bio,
        birth_date,
        death_date
      } = JSON.parse(raw_json);

      return {
        id: author_id,
        name,
        bio,
        birth_date,
        death_date
      };
    },
    adapt: (obj: AuthorOpenLibraryImpl): Author & { ref: string } => {
      const author = new Author();
      author.name = obj.name ? obj.name.slice(0, 255) : "";
      author.biography = obj.bio || "";
      author.birthDate = obj.birth_date ? parseDate(obj.birth_date) : null;
      author.deathDate = obj.death_date ? parseDate(obj.death_date) : null;
      return { ...author, ref: obj.id };
    },
    store: async (authors: (Author & { ref: string })[]) => {
      let count = 0;
      let authorProps = [];
      const authorMapping = [];
      for (const author of authors) {
        if (
          author.name &&
          selectedAuthors.has(author.name)
        ) {
          count++;
          authorMapping.push(author.ref, author.ID);
          authorProps.push(
            author.ID,
            author.name,
            author.biography,
            format(author.birthDate),
            format(author.deathDate),
            author.createdAt
          );
        }
      }

      let template = recordsTemplate({
        numberOfRecords: count,
        sizeOfRecord: 6,
        casting: ["uuid", "varchar", "text", "date", "date", "bigint"]
      });

      client.query(
        `INSERT INTO author (id, name, biography, birth_date, death_date, created_at) VALUES ${template};`,
        authorProps
      );

      template = recordsTemplate({
        numberOfRecords: count,
        sizeOfRecord: 2,
        casting: ["varchar", "uuid"]
      });

      client.query(
        `INSERT INTO author_mapping (open_library_id, app_id) VALUES ${template};`,
        authorMapping
      );

      let authorRelationships = [];
      for (const [workID, authorRefs] of props.workAuthors) {
        for (const ref of authorRefs) {
          authorRelationships.push(workID, ref);
        }
      }

      template = recordsTemplate({
        numberOfRecords: authorRelationships.length / 2,
        sizeOfRecord: 2,
        casting: ["uuid", "varchar"]
      });

      client.query(`
        INSERT INTO work_author (work_id, author_id)
        SELECT v.work_id, am.app_id
        FROM (VALUES ${template}) AS v(work_id, open_library_id)
        JOIN author_mapping am ON am.open_library_id = v.open_library_id;`,
        authorRelationships
      );

      authorRelationships = [];
      for (const [bookISBN, authorRefs] of props.bookAuthors) {
        for (const ref of authorRefs) {
          authorRelationships.push(bookISBN, ref);
        }
      }

      template = recordsTemplate({
        numberOfRecords: authorRelationships.length / 2,
        sizeOfRecord: 2,
        casting: ["varchar", "varchar"]
      });

      client.query(`
        INSERT INTO book_author (book_isbn, author_id)
        SELECT v.book_isbn, am.app_id
        FROM (VALUES ${template}) AS v(book_isbn, open_library_id)
        JOIN author_mapping am ON am.open_library_id = v.open_library_id;`,
        authorRelationships
      );
    }
  });
}

function parseDate(input: string): Date | null {
  if (!input) return null;
  const formats = ['yyyy-MM-dd', 'yyyy-MM', 'yyyy'];
  for (const format of formats) {
    const date = parse(input, format, new Date());
    if (isValid(date)) return date;
  }
  return null;
}

function format(date: Date | null) {
  if (!date || isNaN(date.getTime())) return null;
  else return date.toISOString().split("T")[0];
}
