import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { TransactionType } from './types';

// One table for all three transaction types, not one table per type: transactions are always
// queried together regardless of type (balance calculation, the feed, frequent-category lookups
// all scan the full list) — splitting by type would turn every one of those into a union query
// for no benefit. `accountId`/`categoryId`/`amount` are nullable because they only apply to
// expense/income; `fromAccountId`/`toAccountId`/`fromAmount`/`toAmount` only apply to transfer.
export const transactionsTable = sqliteTable('transactions', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  note: text('note').notNull(),
  type: text('type').notNull().$type<TransactionType>(),
  accountId: text('accountId'),
  categoryId: text('categoryId'),
  amount: real('amount'),
  fromAccountId: text('fromAccountId'),
  toAccountId: text('toAccountId'),
  fromAmount: real('fromAmount'),
  toAmount: real('toAmount'),
});
