// Partially done work to integrate drizzle ORM
// See guide: https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-drizzle

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString ?? '', { prepare: false });
export const db = drizzle(client);
