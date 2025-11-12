import { Role } from "@/domain/Role";

export interface RoleRepository {
  save(role: Role): Promise<void>;
  find(id: string): Promise<Role | null>;
  getRoleByName(name: string): Promise<Role | null>;
}