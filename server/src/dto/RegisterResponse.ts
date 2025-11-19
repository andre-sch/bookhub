// src/dto/auth/LoginResponse.ts
import { Role } from "@/domain/Role";

export interface RegisterResponse {
    token: string;
    user: {
        id: string;
        name: string;
        cpf: string;
        email: string;
        roles: Role[];
    };
}