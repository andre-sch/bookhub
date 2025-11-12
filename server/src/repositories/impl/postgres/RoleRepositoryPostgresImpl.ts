import { Permission } from "@/domain/Permission";
import { Role } from "@/domain/Role";
import { RoleRepository } from "@/repositories/RoleRepository";
import { Client } from "pg";

export interface RoleRecord {
  id: string;
  name: string;
  created_at: string;
}

export class RoleRepositoryPostgresImpl implements RoleRepository {
    constructor(private client: Client) {}
   
    public async save(role: Role): Promise<void> {

        await this.client.query("BEGIN;");
        try {
            await this.client.query(
                `INSERT INTO role (id, name, created_at) 
                VALUES ($1, $2, $3)
                ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;`,
            [role.ID, role.name, role.createdAt]);
            
            // Inserir relações role_permission
            if(role.permissions && role.permissions.length > 0) {
                for (const permission of role.permissions) {
                    await this.client.query(
                        `INSERT INTO role_permission (role_id, permission_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
                        [role.ID, permission.ID]
                    );
                }
            }

            await this.client.query("COMMIT;");
        } catch (error) {
            await this.client.query("ROLLBACK;");
            throw error;
        }

    }

    public async getRoleByName(name: string): Promise<Role | null> {
        const result = await this.client.query("SELECT * FROM role WHERE name = $1;", [name]);

        if (result.rows.length === 0) return null;

        return this.deserialize(result.rows[0]);
    }

    public async getRolePermissions(roleID: string): Promise<Permission[]> {
        const result = await this.client.query(
            `SELECT p.id, p.name, p.created_at
             FROM permission p
             JOIN role_permission rp ON rp.permission_id = p.id
             WHERE rp.role_id = $1;`,
            [roleID]
        );

        return result.rows.map((row: any) =>
            new Permission( row.name, row.id, Number(row.created_at))
        );
    }

    public async find(id: string): Promise<Role | null> {
        const result = await this.client.query("SELECT * FROM role WHERE id = $1;", [id]);

        if (result.rows.length === 0) return null;
        return this.deserialize(result.rows[0]);
    }

    private async deserialize(record: any): Promise<Role> {
        const permissions: Permission[] = await this.getRolePermissions(record.id);

        return new Role(
            record.name,
            permissions,
            record.id,
            Number(record.created_at)
        );
    }
    
}