import { Work } from "../../domain/Work";
import { fetchDump } from "./fetchDump";
import { recordsTemplate } from "../pg/templates";
import { client } from "../pg/connection";
import striptags from "striptags";

interface WorkOpenLibraryImpl {
  ref: string;
  title?: string;
  subtitle?: string;
  description?: { value: string };
  authors?: {
    author?: {
      key: string;
    }
  }[]
}

export async function fetchWorksBy(refs: Set<string>): Promise<{
  workAuthors: Map<string, string[]>;
}> {
  const workAuthors = new Map<string, string[]>();

  await fetchDump<WorkOpenLibraryImpl, Work & { ref: string; author_refs: string[] }>({
    name: "works",
    url: "https://openlibrary.org/data/ol_dump_works_latest.txt.gz",
    before: async () => {
      await client.query(`
        CREATE TEMP TABLE work_mapping (
          open_library_id VARCHAR(255) PRIMARY KEY,
          app_id UUID NOT NULL
        );
      `);
    },
    parse: (line: string): WorkOpenLibraryImpl => {
      const columns = line.split("\t");
      const ref = columns[1];
      const raw_json = columns[4];
      const {
        title,
        subtitle,
        description,
        authors
      } = JSON.parse(raw_json);

      return {
        ref,
        title,
        subtitle,
        description,
        authors
      };
    },
    adapt: (obj: WorkOpenLibraryImpl): Work & { ref: string; author_refs: string[] } => {
      const work = new Work();
      work.title = obj.title ? obj.title.slice(0, 255) : "";
      work.subtitle = obj.subtitle ? obj.subtitle.slice(0, 255) : "";
      work.description = obj.description ? striptags(obj.description.value) : "";
      const author_refs = obj.authors
        ? obj.authors.map(a => a.author?.key).filter(a => a != undefined)
        : [];

      return { ...work, ref: obj.ref, author_refs };
    },
    store: async (works: (Work & { ref: string; author_refs: string[] })[]) => {
      const workProps = [];
      const workMapping = [];
      for (const work of works) {
        if (work.title && refs.has(work.ref)) {
          workAuthors.set(work.ID, work.author_refs);
          workMapping.push(work.ref, work.ID);
          workProps.push(
            work.ID,
            work.title,
            work.subtitle,
            work.description,
            work.createdAt
          );
        }
      }

      let template = recordsTemplate({
        numberOfRecords: workProps.length / 5,
        sizeOfRecord: 5,
        casting: ["uuid", "varchar", "varchar", "text", "bigint"]
      });

      if (template) {
        await client.query(
          `INSERT INTO work (id, title, subtitle, description, created_at) VALUES ${template};`,
          workProps
        );
      }

      template = recordsTemplate({
        numberOfRecords: workMapping.length / 2,
        sizeOfRecord: 2,
        casting: ["varchar", "uuid"]
      });

      if (template) {
        client.query(
          `INSERT INTO work_mapping (open_library_id, app_id) VALUES ${template};`,
          workMapping
        );
      }
    }
  });

  return { workAuthors };
}
