import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:A%3FCl8L%5DpUHiO%3A%5COT@34.22.208.81:5432/maquindust-payload',
  },
});
