import { CategoryRepository, DeweyCategoryTree } from "@/repositories/CategoryRepository";
import { DeweyCategory } from "@/domain/DeweyCategory";

export class CategoryRepositoryInMemoryImpl implements CategoryRepository {
  private categories: Map<string, DeweyCategory> = new Map();

  public async find(id: string): Promise<DeweyCategory | null> {
    return this.categories.get(id) || null;
  }

  public async findHierarchy(id: string): Promise<DeweyCategoryTree> {
    const hierarchy: DeweyCategoryTree = [];
    let currentID: string | null = id;
    let level = 0;

    while (currentID) {
      const category = this.categories.get(currentID);
      if (!category) throw new Error(`Tree node with id ${currentID} not found`);
      hierarchy.push({ ...category, level });
      currentID = category.parentID;
      level++;
    }

    return hierarchy;
  }

  public async save(category: DeweyCategory): Promise<void> {
    this.categories.set(category.ID, category);
  }
}
