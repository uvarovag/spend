import { real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

import type { AccountType } from './types';

export const accountsTable = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().$type<AccountType>(),
  currency: text('currency').notNull(),
  initialBalance: real('initialBalance').notNull(),
  color: text('color').notNull(),
  archivedAt: text('archivedAt'),
});
