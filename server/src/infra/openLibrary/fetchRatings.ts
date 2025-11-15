import { Rating } from "../../domain/Rating";
import { fetchDump } from "./fetchDump";
import { recordsTemplate } from "../pg/templates";
import { client } from "../pg/connection";

interface RatingOpenLibraryImpl {
  work_id: string;
  book_id: string;
  score: string;
  date: string;
}

interface OpenLibraryRefs {
  workRef: string;
  bookRef: string | null;
}

export function fetchRatingsBy(props: {
  bookRefs: Set<string>;
  workRefs: Set<string>;
}): Promise<void> {
  return fetchDump<RatingOpenLibraryImpl, Rating & OpenLibraryRefs>({
    name: "ratings",
    url: "https://openlibrary.org/data/ol_dump_ratings_latest.txt.gz",
    parse: (line: string): RatingOpenLibraryImpl => {
      const [work_id, book_id, score, date] = line.split("\t");
      return { work_id, book_id, score, date };
    },
    adapt: (obj: RatingOpenLibraryImpl): Rating & OpenLibraryRefs => {
      const rating = new Rating();
      rating.accountID = null;
      rating.score = Number(obj.score);
      rating.createdAt = new Date(obj.date).getTime();
      return { ...rating, workRef: obj.work_id, bookRef: obj.book_id || null };
    },
    store: async (ratings: (Rating & OpenLibraryRefs)[]) => {
      const [workResponse, bookResponse] = await Promise.all([
        client.query(
          "SELECT open_library_id, app_id FROM work_mapping WHERE open_library_id = ANY($1);",
          Array.from(new Set(ratings.map(r => r.workRef).filter(Boolean)).values())
        ),

        client.query(
          "SELECT open_library_id, app_isbn FROM book_mapping WHERE open_library_id = ANY($1);",
          Array.from(new Set(ratings.map(r => r.bookRef).filter(Boolean)).values())
        )
      ]);

      const workMapping = new Map<string, string>(workResponse.rows.map(row => [row.open_library_id, row.app_id]));
      const bookMapping = new Map<string, string>(bookResponse.rows.map(row => [row.open_library_id, row.app_isbn]));

      let template = recordsTemplate({
        numberOfRecords: ratings.length,
        sizeOfRecord: 6,
        casting: ["uuid", "uuid", "uuid", "varchar", "int", "bigint"]
      });

      let params = [];
      for (const rating of ratings) {
        if (
          props.workRefs.has(rating.workRef) ||
          props.bookRefs.has(rating.bookRef ? rating.bookRef : "")
        ) {
          params.push(
            rating.ID,
            rating.accountID,
            workMapping.get(rating.workRef) || null,
            rating.bookRef ? bookMapping.get(rating.bookRef) : null,
            rating.score,
            rating.createdAt
          );
        }
      }

      await client.query(
        `INSERT INTO rating (id, account_id, work_id, book_isbn, score, created_at) VALUES ${template};`,
        params
      );
    }
  });
}
