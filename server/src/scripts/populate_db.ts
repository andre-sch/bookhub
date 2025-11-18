import { loadDataset } from "../infra/openLibrary/loadDataset";
import { client } from "../infra/pg/connection";

(async function populate() {
  const start = Date.now();
  const progress = setInterval(() => {
    const end = Date.now();
    const duration = Math.floor((end - start) / 1000);
    process.stdout.write(`\r(${duration}s) populating database...`);
  }, 1000);

  await loadDataset();

  clearInterval(progress);
  await client.end();
})();
