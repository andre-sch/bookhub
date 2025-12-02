import {transaction} from "../infra/umzug/transaction";
import { Client } from "pg";

export const up = transaction(async (client: Client) => {
    await client.query(`
        ALTER TABLE loan 
        ALTER COLUMN reservation_id DROP NOT NULL;
    `);
})

export const down = transaction(async (client: Client) => {
    // Remove empréstimos sem reserva antes de reverter
    await client.query(`
        DELETE FROM loan WHERE reservation_id IS NULL;
    `);
    
    await client.query(`
        ALTER TABLE loan 
        ALTER COLUMN reservation_id SET NOT NULL;
    `);
})