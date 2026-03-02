import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";
import styles from "./page.module.css";

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>
}) {
  const searchQuery = (await props.searchParams).q || "";
  
  return (
    <div className={styles.container}>
      <div className={styles.searchSection}>
        <form className={styles.searchForm}>
          <SearchInput />
        </form>
      </div>

      <SearchResults searchQuery={searchQuery} />
    </div>
  );
}
