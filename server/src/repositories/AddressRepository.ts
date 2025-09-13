import { Address } from "@/domain/Address";

export interface AddressRepository {
  save(address: Address): Promise<void>;
  find(id: string): Promise<Address | null>;
}
