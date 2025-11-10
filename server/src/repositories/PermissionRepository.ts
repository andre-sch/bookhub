import { Permission } from "@/domain/Permission";

export interface PermissionRepository {
  save(permission: Permission): Promise<void>;
  find(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
}