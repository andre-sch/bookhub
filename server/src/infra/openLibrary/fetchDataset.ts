import { fetchBookReferences } from "./fetchBookReferences";
import { fetchBooksBy } from "./fetchBooks";
import { fetchWorksBy } from "./fetchWorks";
import { fetchAuthorsBy } from "./fetchAuthors";
import { fetchRatingsBy } from "./fetchRatings";

export async function fetchDataset() {
  const { bookRefs, workRefs } = await fetchBookReferences({ limit: 100_000 });

  const { workAuthors } = await fetchWorksBy(workRefs);
  const { bookAuthors } = await fetchBooksBy(bookRefs);

  await fetchAuthorsBy({ bookAuthors, workAuthors });

  fetchRatingsBy({ bookRefs, workRefs });
}
