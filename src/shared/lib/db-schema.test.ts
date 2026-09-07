import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import fs from 'fs';
import path from 'path';

import { accountsTable } from '@/entities/account';
import { categoriesTable } from '@/entities/category';
import { transactionsTable } from '@/entities/transaction';

// Assembles the schema from `entities/*/model/schema.ts` the same way `db.ts` does (the one
// accepted `shared` -> `entities` exception, see AGENTS.md), but runs it against `better-sqlite3`
// instead of `expo-sqlite`: both are drivers for the same driver-agnostic `drizzle-orm/sqlite-core`
// table definitions, and unlike expo-sqlite, better-sqlite3 doesn't need the native Expo runtime,
// so it can actually execute under Jest. Applies the real generated migration SQL (not a
// hand-written CREATE TABLE) so this also catches a schema/migration drift, not just a TypeScript
// mismatch.
function createTestDatabase() {
  const drizzleDirectory = path.join(__dirname, '../../../drizzle');
  const migrationSql = fs
    .readdirSync(drizzleDirectory)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort()
    .map((fileName) => fs.readFileSync(path.join(drizzleDirectory, fileName), 'utf-8'))
    .join('\n')
    .replace(/--> statement-breakpoint/g, '');

  const sqlite = new Database(':memory:');
  sqlite.exec(migrationSql);
  return drizzle(sqlite, { schema: { accountsTable, categoriesTable, transactionsTable } });
}

describe('database schema round-trip', () => {
  it('persists and reads back an account row', async () => {
    const db = createTestDatabase();
    const account = {
      id: 'account-1',
      name: 'Cash',
      type: 'cash' as const,
      currency: 'USD',
      initialBalance: 100,
      color: '#FF3B30',
      archivedAt: null,
    };

    await db.insert(accountsTable).values(account);

    expect(await db.select().from(accountsTable)).toEqual([account]);
  });

  it('persists and reads back a category row, including the reserved-word `order` column', async () => {
    const db = createTestDatabase();
    const category = {
      id: 'category-1',
      name: 'Food',
      icon: 'fast-food-outline',
      color: '#FF9500',
      kind: 'expense' as const,
      order: 0,
      archivedAt: null,
    };

    await db.insert(categoriesTable).values(category);

    expect(await db.select().from(categoriesTable)).toEqual([category]);
  });

  it('persists and reads back expense, income and transfer transaction rows sharing one table', async () => {
    const db = createTestDatabase();
    const expenseRow = {
      id: 'transaction-1',
      date: '2026-01-01T00:00:00.000Z',
      note: '',
      type: 'expense' as const,
      accountId: 'account-1',
      categoryId: 'category-1',
      amount: 100,
      fromAccountId: null,
      toAccountId: null,
      fromAmount: null,
      toAmount: null,
    };
    const incomeRow = {
      ...expenseRow,
      id: 'transaction-2',
      type: 'income' as const,
    };
    const transferRow = {
      id: 'transaction-3',
      date: '2026-01-02T00:00:00.000Z',
      note: '',
      type: 'transfer' as const,
      accountId: null,
      categoryId: null,
      amount: null,
      fromAccountId: 'account-1',
      toAccountId: 'account-2',
      fromAmount: 50,
      toAmount: 50,
    };

    await db.insert(transactionsTable).values([expenseRow, incomeRow, transferRow]);

    expect(await db.select().from(transactionsTable)).toEqual([expenseRow, incomeRow, transferRow]);
  });
});
