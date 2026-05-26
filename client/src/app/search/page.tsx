import styles from "./page.module.css";
import { SearchInput } from "./SearchInput";
import { SearchResults } from "./SearchResults";

export default async function SearchPage(props: {
	searchParams: Promise<{ q?: string }>;
}) {
	const searchQuery = (await props.searchParams).q || "";

	return (
		<div className={styles.container}>
			<div className={styles.searchSection}>
				<form className={styles.searchForm}>
					<SearchInput searchQuery={searchQuery} />
				</form>
			</div>

			<SearchResults searchQuery={searchQuery} />
		</div>
	);
}
