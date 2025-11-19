import { Role } from "@/domain/Role";

export interface LoginResponse {
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        roles: Role[];
    };
}
