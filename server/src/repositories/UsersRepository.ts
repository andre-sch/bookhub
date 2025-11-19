import { UserAccount } from "@/domain/UserAccount";

export interface UsersRepository {
  save(user: UserAccount): Promise<UserAccount>;
  findByEmail(email: string): Promise<UserAccount | null>;
  findById(id: string): Promise<UserAccount | null>;
  getUserRoles(userID: string): Promise<{ roles: string[] } | null>;
}