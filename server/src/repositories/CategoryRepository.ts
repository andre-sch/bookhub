import { DeweyCategory } from "@/domain/DeweyCategory";

export type DeweyCategoryTree = (DeweyCategory & { level: number })[];

export interface CategoryRepository {
  save(category: DeweyCategory): Promise<void>;
  find(id: string): Promise<DeweyCategory | null>;
  findHierarchy(id: string): Promise<DeweyCategoryTree>;
}
