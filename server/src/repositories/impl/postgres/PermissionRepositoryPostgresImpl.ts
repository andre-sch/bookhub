import { Permission } from "@/domain/Permission";
import { PermissionRepository } from "@/repositories/PermissionRepository";
import { Client } from "pg";

export interface PermissionRecord {
  id: string;
  name: string;
  created_at: string;
}

export class PermissionRepositoryPostgresImpl implements PermissionRepository {
    constructor(private client: Client) {}
    
    public async save(permission: Permission): Promise<void> {
        const result = await this.client.query("SELECT * FROM permission WHERE id = $1;", [permission.ID]);
        const recordExists = result.rows.length > 0;

        if (recordExists) {
            await this.client.query(
                "UPDATE permission SET name = $2 WHERE id = $1;",
                [permission.ID, permission.name]
            );
        } else {
            await this.client.query(
                "INSERT INTO permission (id, name, created_at) VALUES ($1, $2, $3);",
                [permission.ID, permission.name, permission.createdAt]
            );
        }
    }

    public async find(id: string): Promise<Permission | null> {
        const result = await this.client.query("SELECT * FROM permission WHERE id = $1;", [id]);

        if (result.rows.length == 0) return null;
        else return this.deserialize(result.rows[0]);
    }

    public async findByName(name: string): Promise<Permission | null> {
        const result = await this.client.query("SELECT * FROM permission WHERE name = $1;", [name]);

        if (result.rows.length == 0) return null;
        else return this.deserialize(result.rows[0]);
    }

    private deserialize(record: PermissionRecord): Permission {
        return new Permission(
            record.name,
            record.id,
            Number(record.created_at)
        );
    }
    
}