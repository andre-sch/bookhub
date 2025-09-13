import { Publisher } from "@/domain/Publisher";

export interface PublisherRepository {
  save(publisher: Publisher): Promise<void>;
  find(id: string): Promise<Publisher | null>;
}
