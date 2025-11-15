import { fetchDataset } from "../infra/openLibrary/fetchDataset";
import { client } from "../infra/pg/connection";

(async function populate() {
  await fetchDataset();
  await client.end();
})();
