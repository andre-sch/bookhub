import { fetchDump } from "./fetchDump";

interface BookReferences {
  workRef: string
  bookRef: string
}

export async function fetchBookReferences(props: {
  limit?: number
}): Promise<{
  bookRefs: Set<string>
  workRefs: Set<string>
}> {
  const bookRefs = new Set<string>();
  const workRefs = new Set<string>();

  await fetchDump<BookReferences, BookReferences>({
    limit: props.limit,
    name: "book references",
    url: "https://openlibrary.org/data/ol_dump_ratings_latest.txt.gz",
    parse: (line: string): BookReferences => {
      const columns = line.split("\t");
      const workRef = columns[0];
      const bookRef = columns[1];
      return { workRef, bookRef };
    },
    adapt: (obj) => obj,
    store: async (refs: BookReferences[]) => {
      for (const { bookRef, workRef } of refs) {
        if (bookRef) {
          bookRefs.add(bookRef);
          workRefs.add(workRef);
        }
      }
    }
  });

  return { bookRefs, workRefs };
}
