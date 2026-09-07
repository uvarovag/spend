import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  driver: 'expo',
  schema: [
    './src/entities/account/model/schema.ts',
    './src/entities/category/model/schema.ts',
    './src/entities/transaction/model/schema.ts',
  ],
  out: './drizzle',
});
