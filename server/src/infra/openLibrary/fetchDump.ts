import { Readable } from "stream";
import { createGunzip } from "zlib";
import { createInterface } from "readline";
import { client } from "../pg/connection";

export async function fetchDump<IProvided, IRequired>(params: {
  limit?: number,
  name: string,
  url: string,
  parse: (line: string) => IProvided,
  adapt: (obj: IProvided) => IRequired,
  store: (batch: IRequired[]) => Promise<void>,
  before?: () => Promise<void>,
  after?: () => Promise<void>
}): Promise<void> {
  const response = await fetch(params.url);
  if (!response.ok) throw new Error(response.statusText);
  if (!response.body) throw new Error("Missing body stream at response");

  if (params.before) {
    await params.before();
  }

  const gunzip = createGunzip();

  const reader = createInterface({
    input: Readable.fromWeb(response.body).pipe(gunzip),
    crlfDelay: Infinity
  });

  console.log(`Fetching ${params.name} dump...`);

  let count = 0;
  const start = Date.now();

  const BATCH_LIMIT = 10_000;
  let batch: IRequired[] = [];

  const flush = async () => {
    await client.query("BEGIN;");
    await params.store(batch);
    await client.query("COMMIT;");

    count += batch.length;
    batch = [];

    const end = Date.now();
    const duration = Math.floor((end - start) / 1000);
    process.stdout.write(`\rCurrent number of insertions (${duration}s): ${count}`.padEnd(80, " "));
  }

  for await (const line of reader) {
    if (!line.trim()) continue;

    const providedInterface = params.parse(line);
    const requiredInterface = params.adapt(providedInterface);

    batch.push(requiredInterface);

    if (batch.length >= BATCH_LIMIT) {
      await flush();
      if (params.limit && count >= params.limit) break;
    }
  }

  if (batch.length) {
    await flush();
  }

  console.log("\n");

  if (params.after) {
    await params.after();
  }
}
