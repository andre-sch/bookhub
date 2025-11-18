import { client } from "../infra/pg/connection";

(async function populate() {
  const start = Date.now();
  const progress = setInterval(() => {
    const end = Date.now();
    const duration = Math.floor((end - start) / 1000);
    process.stdout.write(`\r(${duration}s) truncating database...`);
  }, 1000);

  await client.query(`
    DELETE FROM work_author;
    DELETE FROM book_author;
    DELETE FROM author;
    DELETE FROM work;
    DELETE FROM book_item;
    DELETE FROM book_genre;
    DELETE FROM book;
    DELETE FROM genre;
    DELETE FROM publisher;
  `);

  clearInterval(progress);
  await client.end();
})();
