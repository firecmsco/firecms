import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:A%3FCl8L%5DpUHiO%3A%5COT@34.22.208.81:5432/maquindust-payload',
});

export const db = drizzle(pool);
export type Database = typeof db;
